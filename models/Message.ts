import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  schoolId: mongoose.Types.ObjectId;
  conversationId: string; // sorted concatenated user IDs: "uid1_uid2"
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  senderRole: "teacher" | "student" | "principal" | "super_admin";
  content: string;
  attachmentUrls?: {
    url: string;
    name: string;
    size?: number;
  }[];
  isRead: boolean;
  readAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedByUserId?: mongoose.Types.ObjectId;
  deletedType?: "message" | "attachment_only";
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderRole: {
      type: String,
      enum: ["teacher", "student", "principal", "super_admin"],
      required: true,
    },
    content: { type: String, required: true, trim: true },
    attachmentUrls: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: Number },
      },
    ],
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    deletedType: {
      type: String,
      enum: ["message", "attachment_only"],
    },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
