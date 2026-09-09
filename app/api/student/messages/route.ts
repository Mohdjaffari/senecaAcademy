import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Teacher from "@/models/Teacher";
import Subject from "@/models/Subject";
import Message from "@/models/Message";
import User from "@/models/User";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, ValidationError, NotFoundError, AuthorizationError } from "@/lib/utils/errors";

interface FormattedChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  date: string;
  attachmentName?: string;
  attachmentUrl?: string;
  isRead: boolean;
  isDeleted?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to access teacher chat.");
    }

    await connectToDatabase();

    // 1. Locate student record
    let studentProfile: any = null;
    if (session.role === "student") {
      studentProfile = await Student.findOne({ userId: session.userId, status: "active" })
        .populate("classId")
        .lean();
    } else {
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId");
      if (studentId) {
        studentProfile = await Student.findById(studentId).populate("classId").lean();
      } else {
        studentProfile = await Student.findOne({ status: "active" }).populate("classId").lean();
      }
    }

    if (!studentProfile) {
      studentProfile = await Student.findOne({ status: "active" }).populate("classId").lean();
    }

    if (!studentProfile) {
      throw new NotFoundError("Student record not found.");
    }

    const classId = studentProfile.classId?._id || studentProfile.classId;
    const studentUserId = session.userId;

    // 2. Fetch Class & Homeroom Teacher
    const classDoc: any = classId
      ? await Class.findById(classId)
          .populate({
            path: "classTeacherId",
            populate: { path: "userId", select: "name email phone avatarUrl" },
          })
          .lean()
      : null;

    // 3. Fetch Enrolled Subjects for this Class
    const enrolledSubjects: any[] = classId
      ? await Subject.find({ classIds: classId }).lean()
      : await Subject.find({}).limit(8).lean();

    const subjectIds = enrolledSubjects.map((s) => s._id.toString());
    const subjectMap = new Map<string, any>();
    enrolledSubjects.forEach((s) => subjectMap.set(s._id.toString(), s));

    // 4. Fetch Teachers assigned to these subjects or class
    const teacherDocs: any[] = await Teacher.find({
      status: "active",
      $or: [
        { assignedClassIds: classId },
        { assignedSubjectIds: { $in: subjectIds } },
        ...(classDoc?.classTeacherId?._id ? [{ _id: classDoc.classTeacherId._id }] : []),
      ],
    })
      .populate("userId", "name email phone avatarUrl")
      .populate("assignedSubjectIds", "name code department")
      .lean();

    // Fallback if no specific teachers found in database, fetch all active teachers
    let allTeachers = teacherDocs;
    if (allTeachers.length === 0) {
      allTeachers = await Teacher.find({ status: "active" })
        .populate("userId", "name email phone avatarUrl")
        .populate("assignedSubjectIds", "name code department")
        .limit(6)
        .lean();
    }

    // 5. Build Teacher Chat Dossiers with their assigned subjects for this student
    const teacherChatList: any[] = [];
    const seenUserIds = new Set<string>();

    for (const tch of allTeachers) {
      const user = tch.userId;
      if (!user) continue;
      const uId = user._id.toString();
      if (seenUserIds.has(uId)) continue;
      seenUserIds.add(uId);

      // Find subjects this teacher teaches for this specific student's grade
      const taughtSubjectNames: string[] = [];
      if (tch.assignedSubjectIds && Array.isArray(tch.assignedSubjectIds)) {
        tch.assignedSubjectIds.forEach((sub: any) => {
          const subId = (sub._id || sub).toString();
          if (subjectMap.has(subId)) {
            const realSub = subjectMap.get(subId);
            taughtSubjectNames.push(`${realSub.name} (${realSub.code || "SUB"})`);
          }
        });
      }

      const isClassTeacher =
        classDoc?.classTeacherId?._id?.toString() === tch._id?.toString() ||
        classDoc?.classTeacherId?.userId?._id?.toString() === uId;

      let displaySubject = taughtSubjectNames.join(" • ");
      if (!displaySubject) {
        displaySubject = tch.specialization || "Subject Faculty";
      }

      // Fetch Real Conversation Messages from MongoDB
      const convId = [studentUserId, uId].sort().join("_");
      const messages = await Message.find({ conversationId: convId })
        .sort({ createdAt: 1 })
        .lean();

      let unreadCount = 0;
      const formattedMessages: FormattedChatMessage[] = messages.map((m: any) => {
        const isFromStudent = m.senderId?.toString() === studentUserId;
        if (!isFromStudent && !m.isRead) {
          unreadCount++;
        }
        return {
          id: m._id.toString(),
          sender: isFromStudent ? "student" : "teacher",
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
          isDeleted: Boolean(m.isDeleted),
        };
      });

      // Default starter message if no messages yet
      if (formattedMessages.length === 0) {
        const greetingText = isClassTeacher
          ? `Hello ${studentProfile?.userId?.name || session.name || "Student"}! I am your Homeroom Class Teacher for ${studentProfile?.classId?.name || "your grade"}. Please reach out here for any academic guidance, attendance queries, or school assistance.`
          : `Hello! I am your teacher for ${displaySubject}. Feel free to ask questions about your course assignments, upcoming quizzes, or lecture notes.`;

        formattedMessages.push({
          id: `starter-${tch._id}`,
          sender: "teacher",
          text: greetingText,
          timestamp: "Recent",
          date: "Today",
          attachmentName: undefined,
          attachmentUrl: undefined,
          isRead: true,
        });
      }

      const lastMsgObj = formattedMessages[formattedMessages.length - 1];

      teacherChatList.push({
        id: tch._id.toString(),
        userId: uId,
        name: user.name || "Faculty Teacher",
        email: user.email,
        phone: user.phone || "+92 (042) 111-SENECA",
        avatarUrl: user.avatarUrl,
        initials: (user.name || "T")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        subject: displaySubject,
        department: tch.specialization || "Academic Department",
        qualification: tch.qualification || "Senior Faculty",
        isClassTeacher,
        onlineStatus: "online", // Active consultation status
        unreadCount,
        lastMessage: lastMsgObj?.text || "Conversation started",
        lastTime: lastMsgObj?.timestamp || "Now",
        messages: formattedMessages,
      });
    }

    // Sort: Class Teacher first, then by last message time / unread
    teacherChatList.sort((a, b) => {
      if (a.isClassTeacher && !b.isClassTeacher) return -1;
      if (!a.isClassTeacher && b.isClassTeacher) return 1;
      return b.unreadCount - a.unreadCount;
    });

    return apiSuccess(
      {
        student: {
          id: studentProfile._id.toString(),
          name: session.name,
          rollNumber: studentProfile.rollNumber,
          className: studentProfile.classId?.name
            ? `${studentProfile.classId.name} (${studentProfile.classId.section || "A"})`
            : "Enrolled Grade",
        },
        teachers: teacherChatList,
      },
      "Subject teachers and conversations loaded successfully."
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
    const { teacherUserId, content, attachmentName, attachmentUrl } = body;

    if (!teacherUserId) {
      throw new ValidationError("Teacher recipient ID is required.");
    }

    if (!content && !attachmentUrl) {
      throw new ValidationError("Message content or attachment is required.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) throw new Error("School configuration not found.");

    const convId = [session.userId, teacherUserId].sort().join("_");

    const newMsg = await Message.create({
      schoolId: school._id,
      conversationId: convId,
      senderId: session.userId,
      receiverId: teacherUserId,
      senderRole: "student",
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
        sender: "student",
        text: newMsg.content,
        timestamp: new Date(newMsg.createdAt).toLocaleTimeString("en-PK", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachmentName: attachmentName,
        attachmentUrl: attachmentUrl,
        isRead: false,
      },
      "Message delivered to subject teacher successfully."
    );
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
