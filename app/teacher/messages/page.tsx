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
  Clock,
  Phone,
  Mail,
  Megaphone,
  Plus,
  X,
  FileText,
  Smile,
  MoreVertical,
  Check,
  Info,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  UserCheck,
  Filter,
  Download,
  FileSpreadsheet,
  Mic,
  ExternalLink,
  Calendar,
  Award,
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
  sender: "teacher" | "student" | string;
  text: string;
  timestamp: string;
  date?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  isRead?: boolean;
  readAt?: Date;
  isDeleted?: boolean;
}

interface StudentContact {
  id: string;
  studentId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  initials: string;
  rollNumber: string;
  admissionNumber: string;
  className: string;
  classId?: string;
  stream: string;
  subjects: string[];
  displaySubject: string;
  isHomeroomStudent: boolean;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  onlineStatus: "online" | "away" | "offline";
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  messages: ChatMessage[];
}

interface TeacherHeaderInfo {
  id: string;
  name?: string;
  employeeId?: string;
  specialization?: string;
  totalStudents: number;
  totalClasses: number;
}

const QUICK_ACADEMIC_REPLIES = [
  "✅ Reviewed and approved.",
  "📄 Please review the notes in Course Materials.",
  "⭐ Great job on your latest assessment problem!",
  "🧪 Practical lab session is scheduled for tomorrow.",
  "🕒 Let's discuss this during tomorrow's consultation hour.",
  "📝 Please resubmit with complete step-by-step working.",
];

export default function TeacherMessagesPage() {
  const [students, setStudents] = useState<StudentContact[]>([]);
  const [teacherInfo, setTeacherInfo] = useState<TeacherHeaderInfo | null>(null);
  const [classList, setClassList] = useState<{ id: string; name: string }[]>([]);
  const [subjectList, setSubjectList] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Chat State
  const [activeStudentId, setActiveStudentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "homeroom">("all");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [messageInput, setMessageInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ name: string; url?: string; isImage?: boolean } | null>(null);
  const [sending, setSending] = useState(false);

  // Deletion & Image Lightbox State
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Mobile View Switch
  const [mobileChatActive, setMobileChatActive] = useState(false);

  // Side Drawer / Dossier Modal
  const [dossierOpen, setDossierOpen] = useState(false);

  // Broadcast Modal State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastClassId, setBroadcastClassId] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastText, setBroadcastText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/teacher/messages");
      const json = await res.json();

      if (json.success && json.data) {
        setTeacherInfo(json.data.teacher);
        const list: StudentContact[] = json.data.students || [];
        setStudents(list);
        setClassList(json.data.classes || []);
        setSubjectList(json.data.subjects || []);

        if (list.length > 0 && !activeStudentId) {
          setActiveStudentId(list[0].id);
        }
        if (isManualRefresh) {
          toast.success("Student inquiries synchronized successfully.");
        }
      } else {
        toast.error(json.message || "Unable to load student messages.");
      }
    } catch (err) {
      toast.error("Failed to connect to messaging server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === activeStudentId) || students[0] || null;
  }, [students, activeStudentId]);

  // Auto scroll to bottom when active messages change
  useEffect(() => {
    if (activeStudent?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeStudent?.messages, mobileChatActive]);

  // Select Student and mark incoming messages as read
  const handleSelectStudent = async (student: StudentContact) => {
    setActiveStudentId(student.id);
    setMobileChatActive(true);

    // Optimistically mark unread as 0
    if (student.unreadCount > 0) {
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, unreadCount: 0 } : s))
      );

      try {
        await fetch("/api/teacher/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentUserId: student.userId }),
        });
      } catch (_) {}
    }
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || messageInput).trim();
    if (!textToSend && !attachedFile) return;
    if (!activeStudent) return;

    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      sender: "teacher",
      text: textToSend || `Sent document: ${attachedFile?.name}`,
      timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }),
      date: "Today",
      attachmentName: attachedFile?.name,
      attachmentUrl: attachedFile?.url,
      isRead: false,
    };

    // Optimistically update UI
    setStudents((prev) =>
      prev.map((s) =>
        s.id === activeStudent.id
          ? {
              ...s,
              lastMessage: newMsg.text,
              lastTime: newMsg.timestamp,
              messages: [...s.messages, newMsg],
            }
          : s
      )
    );

    setMessageInput("");
    const sentAttachment = attachedFile;
    setAttachedFile(null);

    try {
      const res = await fetch("/api/teacher/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentUserId: activeStudent.userId,
          content: textToSend,
          attachmentName: sentAttachment?.name,
          attachmentUrl: sentAttachment?.url,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Message sent to ${activeStudent.name}`, { duration: 1600 });
      }
    } catch (err) {
      toast.error("Failed to deliver message.");
    } finally {
      setSending(false);
    }
  };

  // Quick reply chip click
  const handleQuickReply = (text: string) => {
    handleSendMessage(undefined, text);
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
    if (!messageToDelete || !activeStudent) return;
    setIsDeleting(true);

    try {
      const res = await fetch("/api/teacher/messages", {
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
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id !== activeStudent.id) return s;
            const updatedMessages = s.messages.map((m) => {
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
              ...s,
              messages: updatedMessages,
              lastMessage: lastMsg
                ? lastMsg.isDeleted
                  ? "This message was deleted"
                  : lastMsg.text
                : s.lastMessage,
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

  // File upload simulator/picker
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

  // Broadcast modal dispatch
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastText.trim()) {
      return toast.error("Please fill in both title and advisory message.");
    }

    const targetClassName =
      classList.find((c) => c.id === broadcastClassId)?.name || "All Enrolled Classes";

    toast.success("Broadcast Section Notice Dispatched!", {
      description: `Announcement "${broadcastTitle}" broadcasted to ${targetClassName}.`,
    });

    setBroadcastModalOpen(false);
    setBroadcastTitle("");
    setBroadcastText("");
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.displaySubject.toLowerCase().includes(q);

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "unread" && s.unreadCount > 0) ||
        (activeTab === "homeroom" && s.isHomeroomStudent);

      const matchesClass =
        selectedClassFilter === "all" || s.classId === selectedClassFilter;

      return matchesSearch && matchesTab && matchesClass;
    });
  }, [students, searchQuery, activeTab, selectedClassFilter]);

  const totalUnreadCount = useMemo(() => {
    return students.reduce((acc, s) => acc + (s.unreadCount || 0), 0);
  }, [students]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-muted/40" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
          <div className="lg:col-span-5 h-full rounded-3xl bg-muted/40" />
          <div className="lg:col-span-7 h-full rounded-3xl bg-muted/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10 font-sans text-foreground">
      {/* 1. WhatsApp-Style Top Banner / Navigation Strip */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-seneca-crimson/[0.07] p-4 sm:p-6 shadow-md transition-all",
          mobileChatActive ? "hidden lg:block" : "block"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WhatsApp-Style Faculty Desk</span>
              </span>
              {totalUnreadCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-seneca-crimson text-white text-xs font-extrabold shadow-xs">
                  {totalUnreadCount} Unread Inquiries
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2">
              <span>Subject Student Consultations</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Direct academic guidance for enrolled students taking{" "}
              <strong className="text-foreground">
                {teacherInfo?.specialization || "your assigned subjects"}
              </strong>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => fetchTeacherData(true)}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="rounded-xl text-xs font-bold gap-1.5 h-9"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span className="hidden sm:inline">Sync</span>
            </Button>

            <Button
              onClick={() => setBroadcastModalOpen(true)}
              variant="glow"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 h-9 shadow-md shadow-seneca-amber/10"
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span>Broadcast Notice</span>
            </Button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Enrolled Students</p>
              <p className="text-sm font-extrabold text-foreground">{students.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Unread Messages</p>
              <p className="text-sm font-extrabold text-emerald-600">{totalUnreadCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Class Sections</p>
              <p className="text-sm font-extrabold text-foreground">{classList.length || "Active"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Assigned Subjects</p>
              <p className="text-sm font-extrabold text-foreground">{subjectList.length || 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WhatsApp Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 min-h-[640px] max-h-[760px] h-[calc(100vh-190px)]">
        {/* Left Column: WhatsApp-Style Student Chat Threads */}
        <Card
          className={cn(
            "lg:col-span-5 xl:col-span-4 border border-border/80 bg-card shadow-xl rounded-3xl p-3 flex flex-col h-full overflow-hidden transition-all",
            mobileChatActive ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Top Search & Filter Strip */}
          <div className="space-y-2.5 pb-2 border-b border-border/60 shrink-0">
            {/* WhatsApp-Style Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search students, roll no, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9.5 rounded-2xl bg-muted/50 border-border/60 text-xs focus:bg-background transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-2xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "flex-1 py-1 px-2 rounded-xl transition-all text-center",
                  activeTab === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={cn(
                  "flex-1 py-1 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1",
                  activeTab === "unread"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Unread</span>
                {totalUnreadCount > 0 && (
                  <span className="h-4 px-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-black">
                    {totalUnreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("homeroom")}
                className={cn(
                  "flex-1 py-1 px-2 rounded-xl transition-all text-center",
                  activeTab === "homeroom"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Homeroom
              </button>
            </div>

            {/* Class Quick Filter Selector (if multiple classes) */}
            {classList.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSelectedClassFilter("all")}
                  className={cn(
                    "px-2.5 py-0.5 rounded-lg border font-bold shrink-0 transition-all",
                    selectedClassFilter === "all"
                      ? "bg-seneca-crimson text-white border-seneca-crimson"
                      : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                  )}
                >
                  All Sections
                </button>
                {classList.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClassFilter(c.id)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-lg border font-bold shrink-0 transition-all truncate max-w-[150px]",
                      selectedClassFilter === c.id
                        ? "bg-seneca-crimson text-white border-seneca-crimson"
                        : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/30 pr-0.5 space-y-0.5 mt-1">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <Users className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-xs font-bold text-foreground">No students match your filter</p>
                <p className="text-[11px] text-muted-foreground">
                  Try clearing your search query or selecting "All Sections".
                </p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = student.id === activeStudent?.id;
                return (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={cn(
                      "p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all flex items-start gap-3 relative select-none",
                      isSelected
                        ? "bg-muted/90 border border-border shadow-xs"
                        : "hover:bg-muted/40 border border-transparent"
                    )}
                  >
                    {/* WhatsApp-Style Avatar with Status Indicator */}
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar className="h-11 w-11 border border-border">
                        {student.avatarUrl ? (
                          <AvatarImage src={student.avatarUrl} alt={student.name} />
                        ) : null}
                        <AvatarFallback
                          className={cn(
                            "font-bold text-xs text-white",
                            student.isHomeroomStudent ? "bg-seneca-crimson" : "bg-zinc-800"
                          )}
                        >
                          {student.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>

                    {/* Student Info & Last Message */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                          <span>{student.name}</span>
                          {student.isHomeroomStudent && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-seneca-crimson/10 text-seneca-crimson border border-seneca-crimson/20">
                              Homeroom
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {student.lastTime}
                        </span>
                      </div>

                      {/* Class and Subject Tag */}
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="font-semibold text-foreground/80">{student.className}</span>
                        <span>•</span>
                        <span className="truncate">{student.displaySubject}</span>
                      </div>

                      {/* Last Message Snippet */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          <CheckCheck className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                          <span className="truncate">{student.lastMessage}</span>
                        </p>
                        {student.unreadCount > 0 && (
                          <span className="h-4.5 min-w-4.5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 animate-bounce">
                            {student.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Column: WhatsApp-Style Chat Console */}
        <Card
          className={cn(
            "lg:col-span-7 xl:col-span-8 border border-border/80 bg-card shadow-xl rounded-3xl flex flex-col h-full overflow-hidden transition-all",
            !mobileChatActive ? "hidden lg:flex" : "flex"
          )}
        >
          {activeStudent ? (
            <>
              {/* WhatsApp Chat Header */}
              <div className="p-3 sm:p-3.5 bg-muted/50 border-b border-border/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileChatActive(false)}
                    className="lg:hidden h-8 w-8 rounded-full shrink-0 -ml-1 text-muted-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-border">
                      {activeStudent.avatarUrl ? (
                        <AvatarImage src={activeStudent.avatarUrl} alt={activeStudent.name} />
                      ) : null}
                      <AvatarFallback className="font-bold text-xs text-white bg-seneca-crimson">
                        {activeStudent.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {activeStudent.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 h-4 font-extrabold bg-muted text-foreground border-border/80"
                      >
                        Roll: {activeStudent.rollNumber}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Online</span>
                      </span>
                      <span>•</span>
                      <span className="text-foreground/80 font-medium">
                        {activeStudent.className} ({activeStudent.displaySubject})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDossierOpen(true)}
                    className="rounded-xl text-xs font-bold gap-1.5 h-8.5 px-2.5 bg-background border-border"
                    title="View Student Academic Profile"
                  >
                    <Info className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span className="hidden sm:inline">Student Dossier</span>
                  </Button>
                </div>
              </div>

              {/* WhatsApp Messages Stream with Wallpaper Styling */}
              <div
                className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3.5 bg-muted/15 relative"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(120, 120, 120, 0.08) 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }}
              >
                {/* Academic Advisory Banner */}
                <div className="mx-auto max-w-md text-center py-2 px-3 rounded-2xl bg-muted/60 border border-border/60 text-[10px] text-muted-foreground shadow-2xs space-y-0.5">
                  <p className="font-bold text-foreground flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Official Seneca Academy Consultation Channel</span>
                  </p>
                  <p>
                    Messages in this channel are recorded for academic records and homeroom oversight.
                  </p>
                </div>

                {/* Date Divider */}
                <div className="flex items-center justify-center my-2">
                  <span className="px-3 py-0.5 rounded-full bg-muted/80 text-[10px] font-bold text-muted-foreground border border-border/50 uppercase tracking-wider">
                    Today
                  </span>
                </div>

                {/* Message Bubbles */}
                {activeStudent.messages.map((m) => {
                  const isTeacher = m.sender === "teacher";
                  return (
                    <div
                      key={m.id}
                      className={cn("flex flex-col relative group/msg", isTeacher ? "items-end" : "items-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] sm:max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm space-y-1.5 relative group",
                          isTeacher
                            ? m.isDeleted
                              ? "bg-muted/70 text-muted-foreground border border-border/80 rounded-tr-none"
                              : "bg-gradient-to-br from-seneca-crimson via-seneca-crimson to-seneca-crimson-dark text-white rounded-tr-none"
                            : m.isDeleted
                            ? "bg-muted/70 text-muted-foreground border border-border/80 rounded-tl-none italic"
                            : "bg-card text-foreground border border-border/80 rounded-tl-none shadow-xs"
                        )}
                      >
                        {/* Student Name tag if student message and not deleted */}
                        {!isTeacher && !m.isDeleted && (
                          <p className="text-[10px] font-black text-seneca-crimson dark:text-seneca-amber-light">
                            {activeStudent.name}
                          </p>
                        )}

                        {/* Deleted Message Placeholder */}
                        {m.isDeleted ? (
                          <div className="flex items-center gap-1.5 py-1 text-xs italic opacity-85">
                            <Ban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span>This message was deleted</span>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap">{m.text}</p>

                            {/* Image Attachment Preview */}
                            {m.attachmentName && isImageFile(m.attachmentUrl, m.attachmentName) && (
                              <div className="mt-1.5 rounded-xl overflow-hidden border border-border/40 relative group/img bg-black/10">
                                {m.attachmentUrl ? (
                                  <img
                                    src={m.attachmentUrl}
                                    alt={m.attachmentName || "Attachment"}
                                    className="max-h-56 w-full object-cover rounded-xl cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                                    onClick={() =>
                                      setPreviewImage({
                                        url: m.attachmentUrl!,
                                        title: m.attachmentName || "Image Attachment",
                                      })
                                    }
                                  />
                                ) : (
                                  <div className="p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <ImageIcon className="h-4 w-4" />
                                    <span>{m.attachmentName}</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-2">
                                  <span className="text-[10px] text-white font-medium truncate max-w-[140px] drop-shadow-sm">
                                    {m.attachmentName}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {m.attachmentUrl && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewImage({
                                            url: m.attachmentUrl!,
                                            title: m.attachmentName || "Image",
                                          })
                                        }
                                        className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                                        title="Preview image"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    {m.attachmentUrl && (
                                      <a
                                        href={m.attachmentUrl}
                                        download={m.attachmentName || "image"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                                        title="Download image"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </a>
                                    )}
                                    {isTeacher && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenDelete(m)}
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
                            {m.attachmentName && !isImageFile(m.attachmentUrl, m.attachmentName) && (
                              <div
                                className={cn(
                                  "p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-mono transition-all",
                                  isTeacher
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "bg-muted/70 border-border text-foreground"
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      isTeacher ? "text-seneca-amber-light" : "text-seneca-crimson"
                                    )}
                                  />
                                  <span className="truncate font-sans font-medium text-[11px]">
                                    {m.attachmentName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {m.attachmentUrl && (
                                    <a
                                      href={m.attachmentUrl}
                                      download={m.attachmentName || "document"}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1 rounded-lg hover:bg-white/20 shrink-0"
                                      title="Download file"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                  {isTeacher && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDelete(m)}
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

                        {/* WhatsApp-Style Timestamp & Checkmarks */}
                        <div
                          className={cn(
                            "text-[9px] flex items-center justify-end gap-1 pt-0.5",
                            isTeacher && !m.isDeleted ? "text-white/75" : "text-muted-foreground"
                          )}
                        >
                          <span>{m.timestamp}</span>
                          {isTeacher && !m.isDeleted && (
                            <CheckCheck
                              className={cn(
                                "h-3 w-3",
                                m.isRead ? "text-cyan-300" : "text-white/60"
                              )}
                            />
                          )}
                        </div>

                        {/* Quick Delete Floating Action Button on Teacher's Sent Messages */}
                        {isTeacher && !m.isDeleted && (
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(m)}
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

              {/* Quick Academic Replies Strip */}
              <div className="px-3 sm:px-4 py-1.5 bg-muted/30 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
                <span className="text-muted-foreground font-bold shrink-0">Faculty Suggestions:</span>
                {QUICK_ACADEMIC_REPLIES.map((reply, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickReply(reply)}
                    className="px-2.5 py-1 rounded-xl bg-background border border-border/80 text-foreground hover:border-seneca-crimson hover:text-seneca-crimson transition-all shrink-0 truncate max-w-[210px] shadow-2xs"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Attached File Preview Bar */}
              {attachedFile && (
                <div className="px-4 py-2 bg-seneca-amber/10 border-t border-seneca-amber/20 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2.5 text-seneca-amber-dark dark:text-seneca-amber font-mono text-[11px] min-w-0">
                    {attachedFile.isImage && attachedFile.url ? (
                      <img
                        src={attachedFile.url}
                        alt="Preview"
                        className="h-8 w-8 rounded-lg object-cover border border-seneca-amber/40 shrink-0"
                      />
                    ) : (
                      <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">
                      Ready to send: <strong>{attachedFile.name}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-muted-foreground hover:text-rose-600 p-1 rounded-lg"
                    title="Remove attachment"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* WhatsApp-Style Input Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 sm:p-3 bg-card border-t border-border/60 flex items-center gap-2 shrink-0"
              >
                {/* File Attachment Hidden Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 rounded-2xl shrink-0 text-muted-foreground hover:text-foreground border-border"
                  title="Attach Academic Document / PDF"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Input
                  type="text"
                  placeholder={`Message ${activeStudent.name}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={sending}
                  className="h-10 rounded-2xl bg-muted/40 border-border/70 text-xs focus:bg-background"
                />

                <Button
                  type="submit"
                  variant="glow"
                  size="icon"
                  disabled={sending || (!messageInput.trim() && !attachedFile)}
                  className="h-10 w-10 rounded-2xl shrink-0 shadow-md shadow-seneca-crimson/20"
                  title="Send Message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-foreground">Select a Student to Chat</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Choose a student from the left panel to review inquiries, provide homework assistance, or send study notes.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* 3. Student Academic Dossier Modal / Drawer */}
      <Dialog open={dossierOpen} onOpenChange={setDossierOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 border border-border shadow-2xl">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-lg font-bold font-heading flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-seneca-crimson" />
              <span>Student Academic Dossier</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official academic profile and guardian consultation details.
            </DialogDescription>
          </DialogHeader>

          {activeStudent && (
            <div className="space-y-4 text-xs">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center gap-3.5">
                <Avatar className="h-14 w-14 border-2 border-seneca-crimson">
                  {activeStudent.avatarUrl ? (
                    <AvatarImage src={activeStudent.avatarUrl} alt={activeStudent.name} />
                  ) : null}
                  <AvatarFallback className="font-bold text-sm text-white bg-seneca-crimson">
                    {activeStudent.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-foreground">{activeStudent.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-bold">
                      Roll: {activeStudent.rollNumber}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      Adm: {activeStudent.admissionNumber}
                    </Badge>
                    {activeStudent.isHomeroomStudent && (
                      <Badge className="text-[10px] font-bold bg-seneca-crimson text-white">
                        Homeroom Student
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Class Section</p>
                  <p className="font-extrabold text-foreground">{activeStudent.className}</p>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Academic Stream</p>
                  <p className="font-extrabold text-foreground">{activeStudent.stream}</p>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border space-y-1 col-span-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                    Enrolled Subjects with Faculty
                  </p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {activeStudent.subjects.map((sub, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] font-semibold">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border space-y-1 col-span-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                    Guardian & Emergency Contact
                  </p>
                  <div className="flex items-center justify-between pt-0.5">
                    <div>
                      <p className="font-bold text-foreground">{activeStudent.guardianName}</p>
                      <p className="text-[11px] text-muted-foreground">{activeStudent.guardianPhone}</p>
                    </div>
                    <a
                      href={`tel:${activeStudent.guardianPhone}`}
                      className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDossierOpen(false)}
              className="rounded-xl text-xs font-bold w-full"
            >
              Close Dossier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Broadcast Section Advisory Modal */}
      <Dialog open={broadcastModalOpen} onOpenChange={setBroadcastModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl border border-border/80">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-lg font-bold font-heading flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-seneca-amber" />
              <span>Broadcast Section Notice</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send an official notice to all registered students taking your subject in a section.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Target Class Section *</label>
              <select
                value={broadcastClassId}
                onChange={(e) => setBroadcastClassId(e.target.value)}
                className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
              >
                <option value="">All Taught Sections</option>
                {classList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Advisory Title *</label>
              <Input
                type="text"
                placeholder="e.g. Physics Problem Set #4 Solutions Published"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                required
                className="h-10 rounded-xl bg-background text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Advisory Message *</label>
              <textarea
                rows={4}
                placeholder="Type your official announcement..."
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-background border border-border text-xs resize-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBroadcastModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button type="submit" variant="glow" className="rounded-xl text-xs font-bold gap-1.5">
                <Megaphone className="h-3.5 w-3.5" />
                <span>Send Section Broadcast</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Message & Attachment Deletion Modal */}
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

      {/* 6. Image Lightbox Dialog */}
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
