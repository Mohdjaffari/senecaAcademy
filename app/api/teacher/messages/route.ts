import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import Message from "@/models/Message";
import User from "@/models/User";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, ValidationError, NotFoundError, AuthorizationError } from "@/lib/utils/errors";

interface FormattedChatMessage {
  id: string;
  sender: "teacher" | "student" | string;
  text: string;
  timestamp: string;
  date: string;
  attachmentName?: string;
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: Date;
  isDeleted?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to access the consultation portal.");
    }

    await connectToDatabase();

    // 1. Locate teacher record
    let teacherProfile: any = null;
    if (session.role === "teacher") {
      teacherProfile = await Teacher.findOne({ userId: session.userId, status: "active" })
        .populate("assignedClassIds")
        .populate("assignedSubjectIds")
        .populate("headOfClassIds")
        .lean();
    }

    // Fallback if super_admin / testing or no active profile found
    if (!teacherProfile) {
      teacherProfile = await Teacher.findOne({ status: "active" })
        .populate("assignedClassIds")
        .populate("assignedSubjectIds")
        .populate("headOfClassIds")
        .lean();
    }

    if (!teacherProfile) {
      throw new NotFoundError("Teacher profile record not found.");
    }

    const teacherUserId = session.userId || teacherProfile.userId?.toString();

    // 2. Identify all classes associated with this teacher
    const assignedClassIds: string[] = (teacherProfile.assignedClassIds || []).map((c: any) =>
      (c._id || c).toString()
    );
    const headClassIds: string[] = (teacherProfile.headOfClassIds || []).map((c: any) =>
      (c._id || c).toString()
    );

    // Classes where teacher is homeroom classTeacherId
    const homeroomClasses = await Class.find({
      $or: [
        { classTeacherId: teacherProfile._id },
        { _id: { $in: [...assignedClassIds, ...headClassIds] } },
      ],
      status: "active",
    }).lean();

    const homeroomClassIdSet = new Set(
      homeroomClasses
        .filter((c) => c.classTeacherId?.toString() === teacherProfile._id.toString())
        .map((c) => c._id.toString())
    );

    // 3. Identify all subjects taught by this teacher
    const assignedSubjectIds: string[] = (teacherProfile.assignedSubjectIds || []).map((s: any) =>
      (s._id || s).toString()
    );

    const subjects = await Subject.find({
      $or: [
        { _id: { $in: assignedSubjectIds } },
        ...(assignedClassIds.length > 0 ? [{ classIds: { $in: assignedClassIds } }] : []),
      ],
    }).lean();

    // Collect all class IDs linked to these subjects as well
    const subjectClassIds: string[] = [];
    subjects.forEach((sub) => {
      (sub.classIds || []).forEach((cId: any) => {
        subjectClassIds.push(cId.toString());
      });
    });

    const allRelatedClassIds = Array.from(
      new Set([
        ...assignedClassIds,
        ...headClassIds,
        ...homeroomClasses.map((c) => c._id.toString()),
        ...subjectClassIds,
      ])
    );

    // Map subjects by ID and by Class ID
    const subjectMap = new Map<string, any>();
    const classSubjectMap = new Map<string, any[]>();
    subjects.forEach((sub) => {
      subjectMap.set(sub._id.toString(), sub);
      (sub.classIds || []).forEach((cId: any) => {
        const cStr = cId.toString();
        const existing = classSubjectMap.get(cStr) || [];
        existing.push(sub);
        classSubjectMap.set(cStr, existing);
      });
    });

    // 4. Fetch all Active Students related to this teacher's classes/subjects
    let studentQuery: any = { status: "active" };
    if (allRelatedClassIds.length > 0) {
      studentQuery.classId = { $in: allRelatedClassIds };
    }

    let studentDocs: any[] = await Student.find(studentQuery)
      .populate("userId", "name email phone avatarUrl status")
      .populate("classId", "name section gradeLevel stream")
      .sort({ "userId.name": 1 })
      .lean();

    // Fallback if no students in those specific classes (e.g. fresh database), fetch active students
    if (studentDocs.length === 0) {
      studentDocs = await Student.find({ status: "active" })
        .populate("userId", "name email phone avatarUrl status")
        .populate("classId", "name section gradeLevel stream")
        .limit(20)
        .lean();
    }

    // 5. Build Student Chat Dossiers with Real MongoDB Messages
    const studentChatList: any[] = [];
    const seenStudentUserIds = new Set<string>();

    for (const student of studentDocs) {
      const studentUser = student.userId;
      if (!studentUser) continue;
      const sUserId = studentUser._id.toString();
      if (seenStudentUserIds.has(sUserId)) continue;
      seenStudentUserIds.add(sUserId);

      const studentClassId = (student.classId?._id || student.classId)?.toString();
      const isHomeroomStudent = studentClassId ? homeroomClassIdSet.has(studentClassId) : false;

      // Find subjects this teacher teaches for this student's class
      const studentSubjects: string[] = [];
      if (studentClassId && classSubjectMap.has(studentClassId)) {
        const subs = classSubjectMap.get(studentClassId) || [];
        subs.forEach((s) => {
          studentSubjects.push(`${s.name} (${s.code || "SUB"})`);
        });
      }

      // Fallback subjects if none matched class specifically
      if (studentSubjects.length === 0 && teacherProfile.assignedSubjectIds?.length > 0) {
        teacherProfile.assignedSubjectIds.forEach((s: any) => {
          if (s.name) studentSubjects.push(`${s.name} (${s.code || "SUB"})`);
        });
      }

      if (studentSubjects.length === 0) {
        studentSubjects.push(teacherProfile.specialization || "General Academic");
      }

      // Fetch Real Conversation Messages from MongoDB
      const convId = [teacherUserId, sUserId].sort().join("_");
      const messages = await Message.find({ conversationId: convId })
        .sort({ createdAt: 1 })
        .lean();

      let unreadCount = 0;
      const formattedMessages: FormattedChatMessage[] = messages.map((m: any) => {
        const isFromTeacher = m.senderId?.toString() === teacherUserId;
        if (!isFromTeacher && !m.isRead) {
          unreadCount++;
        }
        return {
          id: m._id.toString(),
          sender: m.senderId?.toString() === teacherUserId ? "teacher" : "student",
          text: m.isDeleted ? "This message was deleted" : m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString("en-PK", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date(m.createdAt).toLocaleDateString("en-PK", {
            month: "short",
            day: "numeric",
          }),
          attachmentName: m.isDeleted ? undefined : m.attachmentUrls?.[0]?.name,
          attachmentUrl: m.isDeleted ? undefined : m.attachmentUrls?.[0]?.url,
          isRead: m.isRead,
          readAt: m.readAt,
          isDeleted: Boolean(m.isDeleted),
        };
      });

      // Default starter message greeting if no messages yet
      if (formattedMessages.length === 0) {
        const subjectGreeting = isHomeroomStudent
          ? `Homeroom consultation channel opened for ${student.classId?.name || "your section"}. Reach out here for academic guidance, attendance, or class assistance.`
          : `Academic consultation channel opened for ${studentSubjects.join(", ")}. Feel free to ask questions about your course materials, upcoming quizzes, or lecture notes.`;

        formattedMessages.push({
          id: `starter-${student._id}`,
          sender: "teacher",
          text: `Hello ${studentUser.name || "Student"}! ${subjectGreeting}`,
          timestamp: "Recent",
          date: "Today",
          attachmentName: undefined,
          attachmentUrl: undefined,
          isRead: true,
        });
      }

      const lastMsgObj = formattedMessages[formattedMessages.length - 1];

      studentChatList.push({
        id: student._id.toString(),
        studentId: student._id.toString(),
        userId: sUserId,
        name: studentUser.name || "Enrolled Student",
        email: studentUser.email || "student@seneca.edu.pk",
        phone: student.guardian?.phone || studentUser.phone || "+92 (042) 111-SENECA",
        avatarUrl: studentUser.avatarUrl,
        initials: (studentUser.name || "S")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        rollNumber: student.rollNumber || student.admissionNumber || "ROLL-001",
        admissionNumber: student.admissionNumber || "SEN-2026",
        className: student.classId?.name
          ? `${student.classId.name} (${student.classId.section || "A"})`
          : "Enrolled Section",
        classId: studentClassId,
        stream: student.stream || student.classId?.stream || "Standard",
        subjects: studentSubjects,
        displaySubject: studentSubjects.join(" • "),
        isHomeroomStudent,
        guardianName:
          student.guardian?.fatherName || student.guardian?.motherName || "Parent / Guardian",
        guardianPhone: student.guardian?.phone || "+92 300 1234567",
        guardianEmail: student.guardian?.email || studentUser.email,
        onlineStatus: "online",
        unreadCount,
        lastMessage: lastMsgObj?.text || "Conversation started",
        lastTime: lastMsgObj?.timestamp || "Now",
        messages: formattedMessages,
      });
    }

    // Sort: Students with unread messages first, then Homeroom students, then alphabetical
    studentChatList.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
      if (a.isHomeroomStudent && !b.isHomeroomStudent) return -1;
      if (!a.isHomeroomStudent && b.isHomeroomStudent) return 1;
      return a.name.localeCompare(b.name);
    });

    // Unique Classes and Subjects list for filter chips
    const filterClasses = Array.from(
      new Map(
        studentChatList
          .filter((s) => s.classId)
          .map((s) => [s.classId, { id: s.classId, name: s.className }])
      ).values()
    );

    return apiSuccess(
      {
        teacher: {
          id: teacherProfile._id.toString(),
          name: session.name,
          employeeId: teacherProfile.employeeId,
          specialization: teacherProfile.specialization,
          totalStudents: studentChatList.length,
          totalClasses: filterClasses.length,
        },
        students: studentChatList,
        classes: filterClasses,
        subjects: subjects.map((s) => ({ id: s._id.toString(), name: s.name, code: s.code })),
      },
      "Teacher student consultation list loaded successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    const body = await req.json();
    const { studentUserId, content, attachmentName, attachmentUrl } = body;

    if (!studentUserId) {
      throw new ValidationError("Student recipient ID is required.");
    }

    if (!content && !attachmentUrl) {
      throw new ValidationError("Message content or attachment is required.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) throw new Error("School configuration not found.");

    const convId = [session.userId, studentUserId].sort().join("_");

    const newMsg = await Message.create({
      schoolId: school._id,
      conversationId: convId,
      senderId: session.userId,
      receiverId: studentUserId,
      senderRole: "teacher",
      content: content?.trim() || `Shared file: ${attachmentName || "Document"}`,
      attachmentUrls: attachmentUrl
        ? [
            {
              url: attachmentUrl,
              name: attachmentName || "Attachment",
            },
          ]
        : [],
      isRead: false,
    });

    return apiSuccess(
      {
        id: newMsg._id.toString(),
        sender: "teacher",
        text: newMsg.content,
        timestamp: new Date(newMsg.createdAt).toLocaleTimeString("en-PK", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date(newMsg.createdAt).toLocaleDateString("en-PK", {
          month: "short",
          day: "numeric",
        }),
        attachmentName: attachmentName,
        attachmentUrl: attachmentUrl,
        isRead: false,
      },
      "Message delivered to student successfully."
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

    const body = await req.json();
    const { studentUserId } = body;

    if (!studentUserId) {
      throw new ValidationError("Student user ID is required.");
    }

    await connectToDatabase();

    const convId = [session.userId, studentUserId].sort().join("_");

    await Message.updateMany(
      {
        conversationId: convId,
        receiverId: session.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return apiSuccess({ success: true }, "Messages marked as read.");
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

    const { searchParams } = new URL(req.url);
    let messageId = searchParams.get("messageId");
    let deleteAttachmentOnly = searchParams.get("deleteAttachmentOnly") === "true";

    if (!messageId) {
      try {
        const body = await req.json();
        messageId = body.messageId;
        if (body.deleteAttachmentOnly !== undefined) {
          deleteAttachmentOnly = Boolean(body.deleteAttachmentOnly);
        }
      } catch (_) {}
    }

    if (!messageId) {
      throw new ValidationError("Message ID is required.");
    }

    await connectToDatabase();

    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found.");
    }

    const isSender = message.senderId.toString() === session.userId;
    const isAdmin = session.role === "super_admin" || session.role === "principal";

    if (!isSender && !isAdmin) {
      throw new AuthorizationError("You can only delete your own sent messages or attachments.");
    }

    if (deleteAttachmentOnly) {
      message.attachmentUrls = [];
      message.deletedType = "attachment_only";
      await message.save();

      return apiSuccess(
        { id: message._id.toString(), deleteAttachmentOnly: true },
        "Attached document or image deleted successfully."
      );
    } else {
      message.isDeleted = true;
      message.content = "This message was deleted";
      message.attachmentUrls = [];
      message.deletedAt = new Date();
      message.deletedByUserId = session.userId as any;
      message.deletedType = "message";
      await message.save();

      return apiSuccess(
        { id: message._id.toString(), isDeleted: true },
        "Message deleted successfully for all participants."
      );
    }
  } catch (error) {
    return apiError(error);
  }
}
