import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, ValidationError, AuthorizationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view communications.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const messages = await Message.find({})
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    let formatted = messages.map((m: any) => ({
      id: m._id.toString(),
      conversationId: m.conversationId,
      senderName: m.senderId?.name || "System Admin",
      senderRole: m.senderRole,
      receiverName: m.receiverId?.name || "Faculty / Parent",
      content: m.content,
      isRead: m.isRead,
      createdAt: m.createdAt,
      formattedTime: new Date(m.createdAt).toLocaleTimeString("en-PK", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      formattedDate: new Date(m.createdAt).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
      }),
    }));

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter(
        (m) =>
          m.senderName.toLowerCase().includes(s) ||
          m.receiverName.toLowerCase().includes(s) ||
          m.content.toLowerCase().includes(s)
      );
    }

    return apiSuccess(
      {
        count: formatted.length,
        messages: formatted,
      },
      "Messages retrieved successfully."
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
    const { receiverId, content, isBroadcast } = body;

    if (!content || !content.trim()) {
      throw new ValidationError("Message content cannot be empty.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) throw new Error("School missing.");

    const targetUser = receiverId
      ? await User.findById(receiverId)
      : (await User.findOne({ role: "teacher" })) || (await User.findOne({}));

    if (!targetUser) throw new Error("Receiver user not found.");

    const convId = [session.userId, targetUser._id.toString()].sort().join("_");

    const newMsg = await Message.create({
      schoolId: school._id,
      conversationId: convId,
      senderId: session.userId,
      receiverId: targetUser._id,
      senderRole: session.role || "principal",
      content: content.trim(),
      attachmentUrls: [],
      isRead: false,
    });

    return apiSuccess(
      { id: newMsg._id.toString(), content: newMsg.content },
      isBroadcast ? "Broadcast dispatched to all recipients!" : "Message delivered successfully!"
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

    // Only sender or super_admin / principal can delete
    const isSender = message.senderId.toString() === session.userId;
    const isAdmin = session.role === "super_admin" || session.role === "principal";

    if (!isSender && !isAdmin) {
      throw new AuthorizationError("You can only delete your own messages or sent attachments.");
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

