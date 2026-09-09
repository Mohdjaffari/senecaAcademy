import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Submission from "@/models/Submission";
import Assignment from "@/models/Assignment";
import Quiz from "@/models/Quiz";
import CourseMaterial from "@/models/CourseMaterial";
import Admission from "@/models/Admission";
import TeacherApplication from "@/models/TeacherApplication";
import Message from "@/models/Message";
import Attendance from "@/models/Attendance";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError } from "@/lib/utils/errors";
import mongoose from "mongoose";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function mapNotificationTypeToCategory(type: string): string {
  switch (type) {
    case "admission":
      return "admissions";
    case "fee":
      return "fees";
    case "faculty":
      return "faculty";
    case "message":
      return "messages";
    case "assignment":
    case "submission":
      return "assignments";
    case "quiz":
      return "quizzes";
    case "materials":
      return "materials";
    case "attendance":
      return "attendance";
    case "exam":
      return "exams";
    case "security":
      return "security";
    default:
      return "messages";
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    await connectToDatabase();

    const user = await User.findById(session.userId).lean();
    if (!user) throw new Error("User not found.");

    const userIdObj = new mongoose.Types.ObjectId(session.userId);
    const schoolIdObj = user.schoolId;

    // Check existing notifications in DB for this user
    let userNotifs = await Notification.find({ recipientUserId: userIdObj })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // If notifications are scarce, generate real database-driven notifications
    if (userNotifs.length < 3) {
      const generatedNotifs: any[] = [];

      if (user.role === "teacher" || session.role === "teacher") {
        const teacherDoc = await Teacher.findOne({
          $or: [{ userId: userIdObj }, { email: user.email }, { status: "active" }],
        }).lean();

        if (teacherDoc) {
          // 1. Pending Assignment Submissions for teacher's classes
          const pendingSubmissions = await Submission.find({
            status: "submitted",
            ...(teacherDoc.assignedClassIds?.length
              ? { classId: { $in: teacherDoc.assignedClassIds } }
              : {}),
          })
            .populate("studentId", "rollNumber")
            .populate("assignmentId", "title")
            .sort({ submittedAt: -1 })
            .limit(3)
            .lean();

          for (const sub of pendingSubmissions) {
            const studentUser = sub.studentId
              ? await Student.findById(sub.studentId).populate("userId", "name").lean()
              : null;
            const studentName = (studentUser as any)?.userId?.name || "A student";
            const assignmentTitle = (sub.assignmentId as any)?.title || "Assignment";

            generatedNotifs.push({
              schoolId: schoolIdObj,
              recipientUserId: userIdObj,
              title: "New Student Submission",
              message: `${studentName} submitted coursework for '${assignmentTitle}' pending evaluation.`,
              type: "submission",
              actionUrl: "/teacher/assignments",
              isRead: false,
              createdAt: (sub as any).submittedAt || new Date(),
            });
          }

          // 2. Class Teacher Attendance Reminder
          if (teacherDoc.headOfClassIds && teacherDoc.headOfClassIds.length > 0) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const attendanceToday = await Attendance.findOne({
              classId: { $in: teacherDoc.headOfClassIds },
              date: { $gte: todayStart },
            }).lean();

            if (!attendanceToday) {
              generatedNotifs.push({
                schoolId: schoolIdObj,
                recipientUserId: userIdObj,
                title: "Daily Attendance Register",
                message: "Morning session roll call for your assigned class section is pending submission.",
                type: "attendance",
                actionUrl: "/teacher/attendance",
                isRead: false,
                createdAt: new Date(),
              });
            }
          }

          // 3. Unread Messages
          const unreadMsgs = await Message.find({
            receiverId: userIdObj,
            isRead: false,
          })
            .populate("senderId", "name")
            .sort({ createdAt: -1 })
            .limit(2)
            .lean();

          for (const msg of unreadMsgs) {
            const senderName = (msg.senderId as any)?.name || "Parent/Student";
            generatedNotifs.push({
              schoolId: schoolIdObj,
              recipientUserId: userIdObj,
              title: "Student Academic Inquiry",
              message: `${senderName} sent a communication message regarding lecture coursework.`,
              type: "message",
              actionUrl: "/teacher/messages",
              isRead: false,
              createdAt: msg.createdAt || new Date(),
            });
          }
        }
      } else if (user.role === "student" || session.role === "student") {
        const studentDoc = await Student.findOne({
          $or: [{ userId: userIdObj }, { status: "active" }],
        }).lean();

        if (studentDoc) {
          // 1. Graded Submissions
          const gradedSubmissions = await Submission.find({
            studentId: studentDoc._id,
            status: "graded",
          })
            .populate("assignmentId", "title totalMarks")
            .sort({ gradedAt: -1 })
            .limit(2)
            .lean();

          for (const sub of gradedSubmissions) {
            const title = (sub.assignmentId as any)?.title || "Coursework";
            const total = (sub.assignmentId as any)?.totalMarks || 100;
            const marks = sub.obtainedMarks !== undefined ? sub.obtainedMarks : 0;

            generatedNotifs.push({
              schoolId: schoolIdObj,
              recipientUserId: userIdObj,
              title: "Homework Graded & Feedback",
              message: `Your submission for '${title}' has been evaluated. Score: ${marks}/${total}.`,
              type: "assignment",
              actionUrl: "/student/assignments",
              isRead: false,
              createdAt: sub.gradedAt || sub.updatedAt || new Date(),
            });
          }

          // 2. Active Quizzes for class
          if (studentDoc.classId) {
            const activeQuizzes = await Quiz.find({
              classId: studentDoc.classId,
              isPublished: true,
            })
              .populate("subjectId", "name")
              .sort({ createdAt: -1 })
              .limit(2)
              .lean();

            for (const qz of activeQuizzes) {
              const subjName = (qz.subjectId as any)?.name || "Academic";
              generatedNotifs.push({
                schoolId: schoolIdObj,
                recipientUserId: userIdObj,
                title: "Active Quiz Assessment",
                message: `${qz.title} (${subjName}) is open for completion.`,
                type: "quiz",
                actionUrl: "/student/quizzes",
                isRead: false,
                createdAt: qz.createdAt || new Date(),
              });
            }

            // 3. New Course Materials
            const recentMaterials = await CourseMaterial.find({
              classId: studentDoc.classId,
            })
              .populate("subjectId", "name")
              .sort({ createdAt: -1 })
              .limit(2)
              .lean();

            for (const mat of recentMaterials) {
              const subjName = (mat.subjectId as any)?.name || "Subject";
              generatedNotifs.push({
                schoolId: schoolIdObj,
                recipientUserId: userIdObj,
                title: "New Course Material Uploaded",
                message: `New reference syllabus '${mat.title}' posted for ${subjName}.`,
                type: "materials",
                actionUrl: "/student/materials",
                isRead: false,
                createdAt: mat.createdAt || new Date(),
              });
            }
          }
        }
      } else {
        // Principal / Super Admin / Admin
        // 1. Pending Admission Applications
        const pendingAdmissions = await Admission.find({
          status: { $in: ["submitted", "under_review"] },
        })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        for (const adm of pendingAdmissions) {
          generatedNotifs.push({
            schoolId: schoolIdObj,
            recipientUserId: userIdObj,
            title: "New Admission Application",
            message: `${adm.studentName} applied for ${adm.applyingForClass} (${adm.applicationNumber}).`,
            type: "admission",
            actionUrl: "/dashboard/admissions",
            isRead: false,
            createdAt: adm.createdAt || new Date(),
          });
        }

        // 2. Pending Teacher Applications
        const pendingTeacherApps = await TeacherApplication.find({
          status: "pending",
        })
          .sort({ createdAt: -1 })
          .limit(2)
          .lean();

        for (const tapp of pendingTeacherApps) {
          generatedNotifs.push({
            schoolId: schoolIdObj,
            recipientUserId: userIdObj,
            title: "New Faculty Applicant",
            message: `${tapp.name} submitted CV for ${tapp.subject} teaching position.`,
            type: "faculty",
            actionUrl: "/dashboard/teacher-applications",
            isRead: false,
            createdAt: tapp.createdAt || new Date(),
          });
        }
      }

      if (generatedNotifs.length > 0) {
        // Insert into database and refresh list
        try {
          await Notification.insertMany(generatedNotifs, { ordered: false });
        } catch (_) {}

        userNotifs = await Notification.find({ recipientUserId: userIdObj })
          .sort({ createdAt: -1 })
          .limit(30)
          .lean();
      }
    }

    // Format output items
    const formattedNotifications = userNotifs.map((n: any) => ({
      id: n._id.toString(),
      title: n.title,
      description: n.message,
      time: formatRelativeTime(n.createdAt),
      category: mapNotificationTypeToCategory(n.type),
      unread: !n.isRead,
      href: n.actionUrl || (user.role === "student" ? "/student" : user.role === "teacher" ? "/teacher" : "/dashboard"),
      createdAt: n.createdAt,
    }));

    const unreadCount = formattedNotifications.filter((n) => n.unread).length;

    return apiSuccess(
      {
        notifications: formattedNotifications,
        unreadCount,
      },
      "Notifications retrieved."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const userIdObj = new mongoose.Types.ObjectId(session.userId);

    if (body.all) {
      // Mark all as read
      await Notification.updateMany(
        { recipientUserId: userIdObj, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
      return apiSuccess({ success: true }, "All notifications marked as read.");
    }

    if (body.id) {
      await Notification.findOneAndUpdate(
        { _id: body.id, recipientUserId: userIdObj },
        { $set: { isRead: true, readAt: new Date() } }
      );
      return apiSuccess({ success: true }, "Notification marked as read.");
    }

    return apiSuccess({ success: true }, "No changes made.");
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all") === "true";
    const userIdObj = new mongoose.Types.ObjectId(session.userId);

    if (all) {
      await Notification.deleteMany({ recipientUserId: userIdObj });
      return apiSuccess({ success: true }, "All notifications cleared.");
    }

    if (id) {
      await Notification.findOneAndDelete({ _id: id, recipientUserId: userIdObj });
      return apiSuccess({ success: true }, "Notification dismissed.");
    }

    return apiSuccess({ success: true }, "No action taken.");
  } catch (error) {
    return apiError(error);
  }
}
