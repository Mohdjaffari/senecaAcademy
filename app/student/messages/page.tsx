"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Users,
  Paperclip,
  Sparkles,
  CheckCheck,
  Mail,
  GraduationCap,
  X,
  FileText,
  ArrowLeft,
  Info,
  ShieldCheck,
  Download,
  RefreshCw,
  Trash2,
  Ban,
  AlertTriangle,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "student" | "teacher";
  text: string;
  timestamp: string;
  date?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  isRead?: boolean;
  isDeleted?: boolean;
}

interface TeacherContact {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  initials: string;
  subject: string;
  department: string;
  qualification: string;
  isClassTeacher?: boolean;
  onlineStatus: "online" | "away" | "offline";
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  messages: ChatMessage[];
}

const QUICK_CONSULTATION_CHIPS = [
  "Sir/Ma'am, I have a doubt in Question 4 of the homework.",
  "Is there a practical lab session scheduled for tomorrow?",
  "I have uploaded my assignment solution for your review.",
  "Could you please share the revision notes and formula sheet?",
  "When will the next class quiz / test be conducted?",
];

export default function StudentMessagesPage() {
  const [teachers, setTeachers] = useState<TeacherContact[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTeacherId, setActiveTeacherId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ name: string; url?: string; isImage?: boolean } | null>(null);
  const [sending, setSending] = useState(false);
  const [teacherDossierOpen, setTeacherDossierOpen] = useState(false);

  // Deletion & Image Lightbox State
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Mobile specific: show chat view vs show list view
  const [mobileChatActive, setMobileChatActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchTeachersAndMessages();
  }, []);

  const fetchTeachersAndMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/messages");
      const json = await res.json();
      if (json.success && json.data) {
        setStudentInfo(json.data.student);
        const list: TeacherContact[] = json.data.teachers || [];
        setTeachers(list);
        if (list.length > 0 && !activeTeacherId) {
          setActiveTeacherId(list[0].id);
        }
      } else {
        toast.error(json.message || "Failed to load subject teachers.");
      }
    } catch (err) {
      toast.error("Error connecting to chat server.");
    } finally {
      setLoading(false);
    }
  };

  const activeTeacher = useMemo(() => {
    return teachers.find((t) => t.id === activeTeacherId) || teachers[0] || null;
  }, [teachers, activeTeacherId]);

  // Auto scroll to bottom when active messages change
  useEffect(() => {
    if (activeTeacher?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTeacher?.messages, mobileChatActive]);

  // Handle send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || messageInput).trim();
    if (!textToSend && !attachedFile) return;
    if (!activeTeacher) return;

    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      sender: "student",
      text: textToSend || `Sent document: ${attachedFile?.name}`,
      timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }),
      date: "Today",
      attachmentName: attachedFile?.name,
      attachmentUrl: attachedFile?.url,
      isRead: false,
    };

    // Optimistically update UI
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === activeTeacher.id
          ? {
              ...t,
              lastMessage: newMsg.text,
              lastTime: newMsg.timestamp,
              messages: [...t.messages, newMsg],
            }
          : t
      )
    );

    setMessageInput("");
    const sentAttachment = attachedFile;
    setAttachedFile(null);

    try {
      const res = await fetch("/api/student/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherUserId: activeTeacher.userId,
          content: textToSend,
          attachmentName: sentAttachment?.name,
          attachmentUrl: sentAttachment?.url,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Message sent to ${activeTeacher.name}`, { duration: 1800 });
      }
    } catch (err) {
      toast.error("Failed to deliver message.");
    } finally {
      setSending(false);
    }
  };

  // Quick chip click
  const handleQuickQuestion = (text: string) => {
    handleSendMessage(text);
  };

  const isImageFile = (url?: string, name?: string) => {
    if (!url && !name) return false;
    if (url?.startsWith("data:image/")) return true;
    return /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(name || url || "");
  };

  const handleOpenDelete = (msg: ChatMessage) => {
    setMessageToDelete(msg);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (deleteAttachmentOnly = false) => {
    if (!messageToDelete || !activeTeacher) return;
    setIsDeleting(true);

    try {
      const res = await fetch("/api/student/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: messageToDelete.id,
          deleteAttachmentOnly,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          deleteAttachmentOnly
            ? "Attachment removed successfully."
            : "Message deleted for everyone."
        );
        // Update local state
        setTeachers((prev) =>
          prev.map((t) => {
            if (t.id !== activeTeacher.id) return t;
            const updatedMessages = t.messages.map((m) => {
              if (m.id !== messageToDelete.id) return m;
              if (deleteAttachmentOnly) {
                return {
                  ...m,
                  attachmentName: undefined,
                  attachmentUrl: undefined,
                };
              } else {
                return {
                  ...m,
                  isDeleted: true,
                  text: "This message was deleted",
                  attachmentName: undefined,
                  attachmentUrl: undefined,
                };
              }
            });
            const lastMsg = updatedMessages[updatedMessages.length - 1];
            return {
              ...t,
              messages: updatedMessages,
              lastMessage: lastMsg
                ? lastMsg.isDeleted
                  ? "This message was deleted"
                  : lastMsg.text
                : t.lastMessage,
            };
          })
        );
        setDeleteDialogOpen(false);
        setMessageToDelete(null);
      } else {
        toast.error(data.message || "Failed to delete message.");
      }
    } catch (err) {
      toast.error("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  // File attach simulator/picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImg = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          url: event.target?.result as string,
          isImage: isImg,
        });
      };
      reader.readAsDataURL(file);
      toast.info(`Attached: ${file.name}`);
    }
  };

  // Filtered teachers by search
  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
    );
  }, [teachers, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <div className="h-28 rounded-3xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
          <div className="lg:col-span-4 h-full rounded-3xl bg-muted/40 animate-pulse" />
          <div className="lg:col-span-8 h-full rounded-3xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10 font-sans text-foreground">
      {/* 1. Header Banner (Hidden on active mobile chat for maximum screen estate) */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-seneca-crimson/[0.06] p-4 sm:p-6 shadow-md transition-all",
          mobileChatActive ? "hidden lg:block" : "block"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold uppercase tracking-wider border border-seneca-crimson/20">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Subject Teacher Consultation Desk</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-foreground tracking-tight">
              Teacher Chat &amp; Academic Guidance
            </h1>
            <p className="text-xs text-muted-foreground">
              Direct communication with assigned subject faculty for{" "}
              <strong className="text-foreground">{studentInfo?.className || "your grade"}</strong>. Ask academic doubts, assignment queries &amp; test guidance.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/50 p-2.5 rounded-2xl border border-border/60 shrink-0 text-xs">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">
              {teachers.length} Enrolled Subject Teachers
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN WHATSAPP-STYLE CHAT INTERFACE */}
      <div className="border border-border/80 bg-card rounded-3xl shadow-xl overflow-hidden min-h-[620px] h-[78vh] flex flex-col lg:grid lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SUBJECT TEACHER ROSTER (WhatsApp Chat List)                  */}
        {/* ========================================================================= */}
        <div
          className={cn(
            "lg:col-span-4 border-r border-border/80 bg-muted/20 flex flex-col h-full",
            mobileChatActive ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Top Search & Filter Bar */}
          <div className="p-3.5 sm:p-4 border-b border-border/70 bg-card space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-seneca-crimson" />
                  <span>My Subject Faculty</span>
                </span>
                <Badge className="bg-seneca-crimson/10 text-seneca-crimson text-[10px] font-bold">
                  {teachers.length}
                </Badge>
              </div>

              <button
                onClick={fetchTeachersAndMessages}
                title="Refresh contacts"
                className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by teacher name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-muted/40 border-border/70 focus:bg-background transition-all"
              />
            </div>
          </div>

          {/* Teacher Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-2 space-y-1">
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((tch) => {
                const isSelected = tch.id === activeTeacher?.id;
                return (
                  <div
                    key={tch.id}
                    onClick={() => {
                      setActiveTeacherId(tch.id);
                      setMobileChatActive(true);
                      setTeachers((prev) =>
                        prev.map((t) => (t.id === tch.id ? { ...t, unreadCount: 0 } : t))
                      );
                    }}
                    className={cn(
                      "p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 select-none relative group",
                      isSelected
                        ? "bg-seneca-crimson/10 border border-seneca-crimson/30 shadow-xs"
                        : "hover:bg-muted/60 border border-transparent"
                    )}
                  >
                    {/* Avatar with Online indicator */}
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-border/80 shadow-xs">
                        {tch.avatarUrl && <AvatarImage src={tch.avatarUrl} alt={tch.name} />}
                        <AvatarFallback className="bg-gradient-to-br from-seneca-crimson to-seneca-crimson-dark text-white font-extrabold text-xs">
                          {tch.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card" />
                    </div>

                    {/* Teacher Details & Last Message */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4
                          className={cn(
                            "text-xs font-bold truncate",
                            isSelected ? "text-seneca-crimson font-black" : "text-foreground"
                          )}
                        >
                          {tch.name}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-semibold shrink-0 ml-1">
                          {tch.lastTime}
                        </span>
                      </div>

                      {/* Subject Tag */}
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9.5px] px-1.5 py-0 font-bold truncate max-w-[190px]",
                            tch.isClassTeacher
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                          )}
                        >
                          {tch.isClassTeacher ? "Homeroom Head • " : ""}
                          {tch.subject}
                        </Badge>
                      </div>

                      {/* Last Message Snippet */}
                      <p className="text-[11px] text-muted-foreground truncate font-medium pt-0.5 flex items-center gap-1">
                        <CheckCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{tch.lastMessage}</span>
                      </p>
                    </div>

                    {/* Unread Count Badge */}
                    {tch.unreadCount > 0 && (
                      <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-seneca-crimson text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                        {tch.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <Users className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-bold text-foreground">No teachers match your search</p>
                <p className="text-[11px] text-muted-foreground">
                  Try searching with a different subject or teacher name.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: WHATSAPP-STYLE LIVE CHAT CONSOLE                             */}
        {/* ========================================================================= */}
        <div
          className={cn(
            "lg:col-span-8 flex flex-col h-full bg-[#efeae2]/10 dark:bg-[#0b141a]/60 relative",
            !mobileChatActive ? "hidden lg:flex" : "flex"
          )}
        >
          {activeTeacher ? (
            <>
              {/* WhatsApp Header Bar */}
              <div className="p-3 sm:p-3.5 bg-card/95 backdrop-blur-xl border-b border-border/80 flex items-center justify-between shadow-xs z-10 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {/* Mobile Back to List Button */}
                  <button
                    onClick={() => setMobileChatActive(false)}
                    className="lg:hidden p-1.5 -ml-1 rounded-xl text-foreground hover:bg-muted transition-colors"
                    title="Back to teachers list"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  {/* Teacher Avatar */}
                  <div
                    onClick={() => setTeacherDossierOpen(true)}
                    className="relative shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border border-border">
                      {activeTeacher.avatarUrl && (
                        <AvatarImage src={activeTeacher.avatarUrl} alt={activeTeacher.name} />
                      )}
                      <AvatarFallback className="bg-seneca-crimson text-white font-extrabold text-xs">
                        {activeTeacher.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                  </div>

                  {/* Name & Online Status */}
                  <div
                    onClick={() => setTeacherDossierOpen(true)}
                    className="cursor-pointer min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-foreground truncate leading-tight">
                        {activeTeacher.name}
                      </h3>
                      {activeTeacher.isClassTeacher && (
                        <Badge className="bg-seneca-amber text-zinc-950 text-[9px] font-extrabold px-1.5 py-0">
                          Class Teacher
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold truncate flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Online • {activeTeacher.subject}</span>
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    onClick={() => {
                      window.location.href = `mailto:${activeTeacher.email}?subject=Seneca LMS Academic Query - ${studentInfo?.name || "Student"}`;
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                    title={`Email ${activeTeacher.name}`}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => setTeacherDossierOpen(true)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                    title="Teacher Information Dossier"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Message Scroll Wall */}
              <div
                className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 relative"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(120, 120, 120, 0.08) 1px, transparent 0)`,
                  backgroundSize: "24px 24px",
                }}
              >
                {/* Academic Consultation Security Encryption Notice */}
                <div className="flex justify-center my-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/90 border border-border/60 shadow-2xs text-[10px] text-muted-foreground font-medium max-w-md text-center">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Academic Consultation Channel for <strong>{activeTeacher.subject}</strong>. All messages are archived for student guidance.
                    </span>
                  </div>
                </div>

                {/* Message Bubbles */}
                {activeTeacher.messages.map((msg, idx) => {
                  const isStudent = msg.sender === "student";

                  return (
                    <div
                      key={msg.id || idx}
                      className={cn(
                        "flex flex-col max-w-[85%] sm:max-w-[75%] space-y-1 transition-all relative group/msg",
                        isStudent ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "relative px-3.5 py-2.5 rounded-2xl shadow-sm text-xs leading-relaxed space-y-1 group",
                          isStudent
                            ? msg.isDeleted
                              ? "bg-muted/70 text-muted-foreground border border-border/80 rounded-tr-xs italic"
                              : "bg-emerald-600 dark:bg-emerald-700 text-white rounded-tr-xs"
                            : msg.isDeleted
                            ? "bg-muted/70 text-muted-foreground border border-border/80 rounded-tl-xs italic"
                            : "bg-card border border-border/80 text-foreground rounded-tl-xs"
                        )}
                      >
                        {/* Sender Tag for teacher */}
                        {!isStudent && !msg.isDeleted && (
                          <div className="flex items-center justify-between gap-2 pb-0.5 border-b border-border/40">
                            <span className="font-bold text-[10px] text-seneca-crimson truncate">
                              {activeTeacher.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-semibold">
                              {activeTeacher.subject}
                            </span>
                          </div>
                        )}

                        {/* Deleted Message Placeholder */}
                        {msg.isDeleted ? (
                          <div className="flex items-center gap-1.5 py-1 text-xs italic opacity-85">
                            <Ban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span>This message was deleted</span>
                          </div>
                        ) : (
                          <>
                            {/* Text Content */}
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                            {/* Image Attachment Preview */}
                            {msg.attachmentName && isImageFile(msg.attachmentUrl, msg.attachmentName) && (
                              <div className="mt-1.5 rounded-xl overflow-hidden border border-border/40 relative group/img bg-black/10">
                                {msg.attachmentUrl ? (
                                  <img
                                    src={msg.attachmentUrl}
                                    alt={msg.attachmentName || "Attachment"}
                                    className="max-h-56 w-full object-cover rounded-xl cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                                    onClick={() =>
                                      setPreviewImage({
                                        url: msg.attachmentUrl!,
                                        title: msg.attachmentName || "Image Attachment",
                                      })
                                    }
                                  />
                                ) : (
                                  <div className="p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <ImageIcon className="h-4 w-4" />
                                    <span>{msg.attachmentName}</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-2">
                                  <span className="text-[10px] text-white font-medium truncate max-w-[140px] drop-shadow-sm">
                                    {msg.attachmentName}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {msg.attachmentUrl && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewImage({
                                            url: msg.attachmentUrl!,
                                            title: msg.attachmentName || "Image",
                                          })
                                        }
                                        className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                                        title="Preview image"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    {msg.attachmentUrl && (
                                      <a
                                        href={msg.attachmentUrl}
                                        download={msg.attachmentName || "image"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                                        title="Download image"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </a>
                                    )}
                                    {isStudent && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenDelete(msg)}
                                        className="p-1 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors"
                                        title="Delete image"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Document Attachment Render */}
                            {msg.attachmentName && !isImageFile(msg.attachmentUrl, msg.attachmentName) && (
                              <div
                                className={cn(
                                  "flex items-center justify-between gap-2 p-2 rounded-xl text-[11px] font-semibold mt-1.5 transition-all",
                                  isStudent
                                    ? "bg-black/20 text-white"
                                    : "bg-muted/60 text-foreground border border-border/50"
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-4 w-4 shrink-0 text-seneca-amber" />
                                  <span className="truncate font-sans font-medium text-[11px]">
                                    {msg.attachmentName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {msg.attachmentUrl && (
                                    <a
                                      href={msg.attachmentUrl}
                                      download={msg.attachmentName || "document"}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1 rounded-lg hover:bg-white/20 shrink-0"
                                      title="Download file"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                  {isStudent && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDelete(msg)}
                                      className="p-1 rounded-lg hover:bg-rose-500/30 text-rose-300 shrink-0"
                                      title="Delete document attachment"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Timestamp & Delivery status */}
                        <div
                          className={cn(
                            "flex items-center justify-end gap-1 text-[9px] pt-0.5",
                            isStudent && !msg.isDeleted ? "text-emerald-100" : "text-muted-foreground"
                          )}
                        >
                          <span>{msg.timestamp}</span>
                          {isStudent && !msg.isDeleted && <CheckCheck className="h-3 w-3 text-emerald-200" />}
                        </div>

                        {/* Quick Delete Floating Action Button on Student's Sent Messages */}
                        {isStudent && !msg.isDeleted && (
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(msg)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2.5 -left-8 p-1.5 rounded-full bg-card/95 border border-border shadow-md hover:bg-rose-600 hover:text-white text-muted-foreground transition-all z-10"
                            title="Delete message"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Consultation Chips Strip */}
              <div className="px-3 py-2 bg-card/60 backdrop-blur-md border-t border-border/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-seneca-amber" />
                  <span>Quick Ask:</span>
                </span>
                {QUICK_CONSULTATION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(chip)}
                    className="px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-seneca-crimson hover:text-white border border-border/60 text-[10.5px] font-medium transition-all whitespace-nowrap shrink-0 text-foreground/90 shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Attachment Preview Chip (If Selected) */}
              {attachedFile && (
                <div className="px-4 py-2 bg-muted/90 border-t border-border/60 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {attachedFile.isImage && attachedFile.url ? (
                      <img
                        src={attachedFile.url}
                        alt="Preview"
                        className="h-8 w-8 rounded-lg object-cover border border-border shrink-0"
                      />
                    ) : (
                      <FileText className="h-4 w-4 text-seneca-crimson shrink-0" />
                    )}
                    <span className="font-semibold text-foreground truncate text-[11px]">
                      Ready to send: <strong>{attachedFile.name}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-rose-500 transition-colors"
                    title="Remove attachment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* WhatsApp Message Input Bar */}
              <div className="p-3 sm:p-3.5 bg-card border-t border-border/80 flex items-center gap-2 shrink-0">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Attachment Clip Button */}
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-2xl text-muted-foreground hover:text-seneca-crimson hover:bg-seneca-crimson/10 shrink-0"
                  title="Attach homework document or problem screenshot"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                {/* Text Input Pill */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex-1 flex items-center gap-2"
                >
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${activeTeacher.name} (${activeTeacher.subject})...`}
                    className="h-11 rounded-2xl bg-muted/40 border-border/70 text-xs sm:text-sm px-4 focus:bg-background transition-all"
                  />

                  {/* Circular Send Button */}
                  <Button
                    type="submit"
                    disabled={sending || (!messageInput.trim() && !attachedFile)}
                    size="icon"
                    className="h-11 w-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {sending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="font-bold text-base text-foreground">Select a Subject Teacher</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Choose a teacher from the list to start asking academic questions, assignment doubts, or practical guidance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. TEACHER INFORMATION DOSSIER DIALOG */}
      <Dialog open={teacherDossierOpen} onOpenChange={setTeacherDossierOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-seneca-crimson" />
              <DialogTitle className="text-lg font-bold font-heading">
                Subject Faculty Dossier
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Official faculty profile &amp; teaching assignment details.
            </DialogDescription>
          </DialogHeader>

          {activeTeacher && (
            <div className="space-y-4 my-2 text-xs">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                <Avatar className="h-14 w-14 border-2 border-seneca-crimson/30">
                  {activeTeacher.avatarUrl && (
                    <AvatarImage src={activeTeacher.avatarUrl} alt={activeTeacher.name} />
                  )}
                  <AvatarFallback className="bg-seneca-crimson text-white font-extrabold text-sm">
                    {activeTeacher.initials}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="font-bold text-sm text-foreground">{activeTeacher.name}</h4>
                  <Badge className="bg-seneca-crimson/10 text-seneca-crimson text-[10px] font-bold mt-0.5">
                    {activeTeacher.qualification}
                  </Badge>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {activeTeacher.department}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-card border border-border/60 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Assigned Subject for your Class
                  </span>
                  <p className="font-bold text-xs text-foreground">{activeTeacher.subject}</p>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border/60 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Official Email
                  </span>
                  <p className="font-semibold text-xs text-foreground">{activeTeacher.email}</p>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border/60 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Faculty Desk / Contact
                  </span>
                  <p className="font-semibold text-xs text-foreground">{activeTeacher.phone}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  onClick={() => setTeacherDossierOpen(false)}
                  variant="outline"
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>
                <Button
                  asChild
                  className="bg-seneca-crimson hover:bg-seneca-crimson-dark text-white rounded-xl text-xs font-bold"
                >
                  <a href={`mailto:${activeTeacher.email}`}>
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    Send Direct Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. Message & Attachment Deletion Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-5 sm:p-6 border border-border shadow-2xl">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-base font-bold font-heading flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
              <span>Delete Message & Attachments</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose whether to remove attached media or completely delete this message for everyone.
            </DialogDescription>
          </DialogHeader>

          {messageToDelete && (
            <div className="space-y-3.5 text-xs py-1">
              <div className="p-3 rounded-2xl bg-muted/50 border border-border/60 text-muted-foreground space-y-1">
                <p className="text-[10px] uppercase font-bold text-foreground/70">Selected Message Preview:</p>
                <p className="line-clamp-2 text-foreground italic">&ldquo;{messageToDelete.text}&rdquo;</p>
                {messageToDelete.attachmentName && (
                  <div className="flex items-center gap-1.5 text-[11px] text-seneca-crimson font-medium pt-1">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Attached: {messageToDelete.attachmentName}</span>
                  </div>
                )}
              </div>

              {messageToDelete.attachmentName ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">Select deletion option:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(true)}
                      disabled={isDeleting}
                      className="flex items-start gap-3 p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-left transition-all group"
                    >
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
                        <Paperclip className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Delete Attachment Only</p>
                        <p className="text-[11px] text-muted-foreground">
                          Removes the attached image or document, keeping your message text in the chat.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(false)}
                      disabled={isDeleting}
                      className="flex items-start gap-3 p-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-left transition-all group"
                    >
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 shrink-0 mt-0.5">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-rose-600 dark:text-rose-400">Delete for Everyone</p>
                        <p className="text-[11px] text-muted-foreground">
                          Completely deletes this message and attachment. It will show as &ldquo;This message was deleted&rdquo;.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>This message will be deleted for everyone in this consultation channel.</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border/60 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setMessageToDelete(null);
              }}
              disabled={isDeleting}
              className="rounded-xl text-xs font-semibold h-9"
            >
              Cancel
            </Button>

            {!messageToDelete?.attachmentName && (
              <Button
                type="button"
                onClick={() => handleConfirmDelete(false)}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-9 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? "Deleting..." : "Delete for Everyone"}</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Image Lightbox Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl rounded-3xl p-4 bg-background/95 backdrop-blur-xl border border-border shadow-2xl">
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
            <DialogTitle className="text-sm font-bold truncate">
              {previewImage?.title || "Image Preview"}
            </DialogTitle>
            {previewImage?.url && (
              <a
                href={previewImage.url}
                download={previewImage.title || "image"}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors mr-6"
                title="Download Image"
              >
                <Download className="h-4 w-4" />
              </a>
            )}
          </DialogHeader>
          <div className="flex items-center justify-center max-h-[75vh] overflow-hidden rounded-2xl bg-black/5 p-2">
            {previewImage?.url && (
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
