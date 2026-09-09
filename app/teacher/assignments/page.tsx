"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Loader2,
  RefreshCw,
  X,
  FileCheck,
  Download,
  Send,
  Sliders,
  Check,
  BookOpen,
  GraduationCap,
  Users,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  Layers,
  MessageSquare,
  Paperclip,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface StudentSubmission {
  id: string;
  submissionId?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentAvatar?: string;
  rollNumber: string;
  className: string;
  submittedAt: string;
  formattedSubmittedAt: string;
  isLate: boolean;
  content?: string;
  attachmentName: string;
  attachmentUrl?: string;
  score?: number;
  obtainedMarks?: number;
  maxScore: number;
  feedback?: string;
  graded: boolean;
  status: "submitted" | "late" | "graded" | "resubmitted";
  gradedAt?: string;
}

interface UnsubmittedStudent {
  id: string;
  studentId: string;
  name: string;
  email?: string;
  phone?: string;
  rollNumber: string;
  className: string;
  status: "unsubmitted";
  obtainedMarks: number;
  maxMarks: number;
}

interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  className: string;
  classId?: string;
  subjectId?: string;
  subjectName: string;
  subjectCode?: string;
  maxMarks: number;
  totalMarks?: number;
  dueDate: string;
  formattedDueDate: string;
  isPastDue: boolean;
  totalStudents: number;
  submittedCount: number;
  pendingGradingCount: number;
  gradedCount: number;
  unsubmittedCount: number;
  status: "active" | "due_soon" | "completed" | "closed";
  submissions: StudentSubmission[];
  unsubmittedStudents: UnsubmittedStudent[];
}

interface TeachingBook {
  id: string;
  name: string;
  code: string;
  department: string;
  classes: Array<{ id: string; name: string }>;
  enrolledStudentsCount: number;
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [teachingBooks, setTeachingBooks] = useState<TeachingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"due-date" | "pending" | "marks" | "title">("due-date");
  const [viewMode, setViewMode] = useState<"cards" | "stream">("cards");

  // Create Assignment Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [targetBookId, setTargetBookId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [newMarks, setNewMarks] = useState("25");
  const [newDueDate, setNewDueDate] = useState("2026-09-15");
  const [newDueTime, setNewDueTime] = useState("11:59 PM");
  const [creating, setCreating] = useState(false);

  // Edit Assignment Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editMarks, setEditMarks] = useState("25");
  const [editDueDate, setEditDueDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Grading Review Studio Modal
  const [gradingModalItem, setGradingModalItem] = useState<AssignmentItem | null>(null);
  const [gradingFilterTab, setGradingFilterTab] = useState<"all" | "pending" | "graded" | "unsubmitted">("all");
  const [gradingSubmissions, setGradingSubmissions] = useState<StudentSubmission[]>([]);
  const [submittingGradeId, setSubmittingGradeId] = useState<string | null>(null);
  const [bulkZeroing, setBulkZeroing] = useState(false);

  // Confirmation Modals State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [zeroGradeConfirmOpen, setZeroGradeConfirmOpen] = useState(false);

  // Fetch teaching books & live assignments from backend
  const fetchLiveAssignments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/teacher/books", { cache: "no-store" });
      const json = await res.json();

      if (json.success && json.data?.books) {
        const booksList: TeachingBook[] = json.data.books.map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          department: b.department || "Academic Department",
          classes: b.classes || [],
          enrolledStudentsCount: b.enrolledStudentsCount || 25,
        }));
        setTeachingBooks(booksList);

        if (!targetBookId && booksList.length > 0) {
          setTargetBookId(booksList[0].id);
          if (booksList[0].classes.length > 0) {
            setTargetClassId(booksList[0].classes[0].id);
          }
        }

        const liveAsgs: AssignmentItem[] = [];
        json.data.books.forEach((book: any) => {
          (book.assignments || []).forEach((a: any) => {
            const formattedSubs: StudentSubmission[] = (a.submissions || []).map((s: any) => ({
              id: s.id || s.submissionId,
              submissionId: s.id || s.submissionId,
              studentId: s.studentId,
              studentName: s.studentName || "Student",
              studentEmail: s.studentEmail,
              studentAvatar: s.studentAvatar,
              rollNumber: s.rollNumber || "ROLL-001",
              className: s.className || a.className,
              submittedAt: s.submittedAt || new Date().toISOString(),
              formattedSubmittedAt: s.formattedSubmittedAt || "Recently",
              isLate: s.status === "late",
              content: s.content,
              attachmentName: s.attachmentName || "Solution_Document.pdf",
              attachmentUrl: s.attachmentUrl,
              score: s.obtainedMarks,
              obtainedMarks: s.obtainedMarks,
              maxScore: a.totalMarks,
              feedback: s.feedback || "",
              graded: s.status === "graded" || typeof s.obtainedMarks === "number",
              status: s.status || (typeof s.obtainedMarks === "number" ? "graded" : "submitted"),
              gradedAt: s.gradedAt,
            }));

            const unsubs: UnsubmittedStudent[] = (a.unsubmittedStudents || []).map((u: any) => ({
              id: u.id || u.studentId,
              studentId: u.studentId,
              name: u.name || "Student",
              email: u.email,
              phone: u.phone,
              rollNumber: u.rollNumber || "ROLL-001",
              className: u.className || a.className,
              status: "unsubmitted",
              obtainedMarks: 0,
              maxMarks: a.totalMarks,
            }));

            liveAsgs.push({
              id: a.id,
              title: a.title,
              description: a.description,
              className: a.className,
              classId: a.classId,
              subjectId: book.id,
              subjectName: book.name,
              subjectCode: book.code,
              maxMarks: a.totalMarks,
              totalMarks: a.totalMarks,
              dueDate: a.dueDate ? a.dueDate.split("T")[0] : "2026-09-15",
              formattedDueDate: a.formattedDueDate || "Sep 15, 2026",
              isPastDue: a.isPastDue ?? false,
              totalStudents: a.totalTargetStudents || book.enrolledStudentsCount || 25,
              submittedCount: a.submissionsCount || formattedSubs.length,
              pendingGradingCount: a.pendingGradingCount || formattedSubs.filter((s) => !s.graded).length,
              gradedCount: a.gradedCount || formattedSubs.filter((s) => s.graded).length,
              unsubmittedCount: a.unsubmittedCount || unsubs.length,
              status: a.status === "closed" ? "closed" : a.isPastDue ? "due_soon" : "active",
              submissions: formattedSubs,
              unsubmittedStudents: unsubs,
            });
          });
        });

        setAssignments(liveAsgs);
      }
    } catch (_) {
      toast.error("Failed to load assignments repository.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAssignments();
  }, []);

  // Sync classes when targetBookId changes in modal
  useEffect(() => {
    if (targetBookId) {
      const b = teachingBooks.find((item) => item.id === targetBookId);
      if (b && b.classes && b.classes.length > 0) {
        setTargetClassId(b.classes[0].id);
      } else {
        setTargetClassId("");
      }
    }
  }, [targetBookId, teachingBooks]);

  // Sync grading modal submissions
  useEffect(() => {
    if (gradingModalItem) {
      setGradingSubmissions(gradingModalItem.submissions || []);
      setGradingFilterTab("all");
    }
  }, [gradingModalItem]);

  // Unique Classes list for filter
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, string>();
    teachingBooks.forEach((b) => {
      (b.classes || []).forEach((c) => {
        classMap.set(c.id, c.name);
      });
    });
    if (classMap.size === 0) {
      assignments.forEach((a) => {
        if (a.className) classMap.set(a.className, a.className);
      });
    }
    return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
  }, [teachingBooks, assignments]);

  // Filtering Logic
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        // 1. Search Query
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.subjectName.toLowerCase().includes(q) ||
          (a.subjectCode && a.subjectCode.toLowerCase().includes(q)) ||
          a.className.toLowerCase().includes(q) ||
          a.submissions.some((s) => s.studentName.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));

        // 2. Book Filter
        const matchesBook =
          selectedBook === "all" ||
          a.subjectId === selectedBook ||
          a.subjectName.toLowerCase().includes(selectedBook.toLowerCase());

        // 3. Class Filter
        const matchesClass =
          selectedClass === "all" ||
          (a.classId && a.classId === selectedClass) ||
          a.className.toLowerCase().includes(selectedClass.toLowerCase());

        // 4. Status Filter
        const matchesStatus =
          selectedStatus === "all" ||
          (selectedStatus === "pending" && a.pendingGradingCount > 0) ||
          (selectedStatus === "graded" && a.pendingGradingCount === 0 && a.gradedCount > 0) ||
          (selectedStatus === "overdue" && a.isPastDue) ||
          (selectedStatus === "active" && !a.isPastDue && a.status !== "closed");

        return matchesSearch && matchesBook && matchesClass && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "due-date") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (sortBy === "pending") return b.pendingGradingCount - a.pendingGradingCount;
        if (sortBy === "marks") return b.maxMarks - a.maxMarks;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [assignments, searchQuery, selectedBook, selectedClass, selectedStatus, sortBy]);

  // Executive Metrics
  const metrics = useMemo(() => {
    const totalAssignments = assignments.length;
    const totalSubmissions = assignments.reduce((acc, a) => acc + a.submittedCount, 0);
    const totalPending = assignments.reduce((acc, a) => acc + a.pendingGradingCount, 0);
    const totalGraded = assignments.reduce((acc, a) => acc + a.gradedCount, 0);

    return {
      totalAssignments,
      totalSubmissions,
      totalPending,
      totalGraded,
    };
  }, [assignments]);

  // Create New Assignment Handler
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return toast.error("Assignment title is required.");

    const chosenBook = teachingBooks.find((b) => b.id === targetBookId) || teachingBooks[0];
    const chosenClass = chosenBook?.classes.find((c) => c.id === targetClassId) || chosenBook?.classes[0];

    setCreating(true);
    try {
      const payload = {
        title: newTitle.trim(),
        description: newDesc.trim() || `Coursework task for ${chosenBook?.name}.`,
        subjectId: chosenBook?.id,
        classId: chosenClass?.id,
        totalMarks: Number(newMarks) || 25,
        dueDate: newDueDate,
        status: "published",
      };

      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to create assignment.");

      toast.success("Assignment Published Successfully!", {
        description: `Students in ${chosenClass?.name || "assigned section"} have been notified.`,
      });

      setCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      fetchLiveAssignments(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish assignment.");
    } finally {
      setCreating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (a: AssignmentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAssignment(a);
    setEditTitle(a.title);
    setEditDesc(a.description);
    setEditMarks(a.maxMarks.toString());
    setEditDueDate(a.dueDate);
    setEditModalOpen(true);
  };

  // Save Edit Assignment
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !editTitle.trim()) return;

    setSavingEdit(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAssignment.id,
          title: editTitle.trim(),
          description: editDesc.trim(),
          totalMarks: Number(editMarks) || editingAssignment.maxMarks,
          dueDate: editDueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Update failed.");

      toast.success("Assignment Updated Successfully!");
      setEditModalOpen(false);
      setEditingAssignment(null);
      fetchLiveAssignments(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to update assignment.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Assignment Trigger
  const handleDeleteAssignment = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ id, title });
  };

  // Confirm and Execute Delete Assignment
  const handleConfirmDeleteAssignment = async () => {
    if (!deleteConfirm) return;
    const { id, title } = deleteConfirm;

    // Optimistic UI update
    setAssignments((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/assignments?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Delete failed.");

      toast.success(`Deleted assignment "${title}".`);
      fetchLiveAssignments(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete assignment.");
      fetchLiveAssignments(true);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Grade Single Student Submission via API
  const handleSaveSingleGrade = async (sub: StudentSubmission) => {
    if (!gradingModalItem) return;
    const numScore = Number(sub.score);
    if (isNaN(numScore) || numScore < 0 || numScore > gradingModalItem.maxMarks) {
      return toast.error(`Please enter a valid score between 0 and ${gradingModalItem.maxMarks}.`);
    }

    setSubmittingGradeId(sub.studentId);
    try {
      const res = await fetch("/api/teacher/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: gradingModalItem.id,
          studentId: sub.studentId,
          obtainedMarks: numScore,
          feedback: sub.feedback || "Evaluated by subject teacher.",
          status: "graded",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Grading failed.");

      // Update local state
      setGradingSubmissions((prev) =>
        prev.map((s) => (s.studentId === sub.studentId ? { ...s, score: numScore, graded: true, status: "graded" } : s))
      );

      toast.success(`Marks recorded for ${sub.studentName}! (${numScore}/${gradingModalItem.maxMarks})`);
      fetchLiveAssignments(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to save grade.");
    } finally {
      setSubmittingGradeId(null);
    }
  };

  // Update in-memory score & feedback
  const handleUpdateGradeLocal = (studentId: string, score: number, feedback: string) => {
    setGradingSubmissions((prev) =>
      prev.map((sub) => (sub.studentId === studentId ? { ...sub, score, feedback } : sub))
    );
  };

  // Set preset score percentage
  const handleApplyPresetScore = (studentId: string, percentage: number) => {
    if (!gradingModalItem) return;
    const scoreVal = Math.round((gradingModalItem.maxMarks * percentage) / 100);
    setGradingSubmissions((prev) =>
      prev.map((sub) =>
        sub.studentId === studentId
          ? {
              ...sub,
              score: scoreVal,
              feedback:
                percentage === 100
                  ? "Perfect work! All steps and derivations are accurate."
                  : percentage >= 80
                  ? "Good performance, solid understanding demonstrated."
                  : percentage === 0
                  ? "0 marks recorded due to non-submission."
                  : sub.feedback || "",
            }
          : sub
      )
    );
  };

  // Grade All Unsubmitted as 0 Trigger
  const handleGradeAllUnsubmittedZero = () => {
    if (!gradingModalItem || gradingModalItem.unsubmittedStudents.length === 0) {
      return toast.info("No unsubmitted students for this assignment.");
    }
    setZeroGradeConfirmOpen(true);
  };

  // Confirm and Execute Grade All Unsubmitted as 0
  const handleConfirmGradeAllUnsubmittedZero = async () => {
    if (!gradingModalItem || gradingModalItem.unsubmittedStudents.length === 0) return;

    setBulkZeroing(true);
    try {
      const unsubmittedStudentIds = gradingModalItem.unsubmittedStudents.map((u) => u.studentId);
      const res = await fetch("/api/teacher/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade_all_unsubmitted_zero",
          assignmentId: gradingModalItem.id,
          studentIds: unsubmittedStudentIds,
          obtainedMarks: 0,
          feedback: "0 marks assigned due to unsubmitted coursework before the due date deadline.",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to process zero marks.");

      toast.success(`Assigned 0 marks to ${unsubmittedStudentIds.length} unsubmitted students.`);
      fetchLiveAssignments(true);
      setGradingModalItem(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to assign 0 marks.");
    } finally {
      setBulkZeroing(false);
      setZeroGradeConfirmOpen(false);
    }
  };

  // Export Grades CSV for this assignment
  const handleExportGradesCSV = (a: AssignmentItem) => {
    const headers = "Student Name,Roll Number,Class,Submission Status,Submitted At,Score,Max Marks,Feedback\n";
    const subRows = a.submissions.map(
      (s) =>
        `"${s.studentName}","${s.rollNumber}","${s.className}","${s.status}","${s.formattedSubmittedAt}","${s.score ?? "Not Graded"}","${a.maxMarks}","${s.feedback || ""}"`
    );
    const unsubRows = a.unsubmittedStudents.map(
      (u) => `"${u.name}","${u.rollNumber}","${u.className}","Unsubmitted","—","0","${a.maxMarks}","No submission"`
    );
    const allRows = [...subRows, ...unsubRows].join("\n");

    const blob = new Blob([headers + allRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Grades_${a.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Assignment grade sheet exported to CSV!");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-5 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <FileCheck className="h-3 w-3" />
                <span>Assignments & Grading Studio</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Student Submissions Sync</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Assignments & <span className="text-seneca-amber">Grading Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Create structured homework assignments, review submitted student solution files, assign
              numerical marks and feedback, and filter across your assigned curriculum teaching books and grades.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setCreateModalOpen(true)}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 flex-1 sm:flex-initial justify-center"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Assignment</span>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm flex-1 sm:flex-initial justify-center"
            >
              <Link href="/teacher/books">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                <span>Teaching Books</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Executive Grading Studio Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-crimson/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Assignments
            </span>
            <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {metrics.totalAssignments}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Across {teachingBooks.length || 1} Teaching Books
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-amber/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="p-2 rounded-xl bg-seneca-amber/15 text-seneca-amber">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-seneca-amber">
              {metrics.totalSubmissions}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Received from Enrolled Students
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pending Evaluation
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-rose-600">
              {metrics.totalPending}
            </div>
            <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" />
              <span>Requires Teacher Marks</span>
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Evaluated & Graded
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-600">
              {metrics.totalGraded}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3" />
              <span>Synced with Gradebooks</span>
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Comprehensive Multi-Filter Bar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
        {/* Row 1: Search & View Mode Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search assignment title, description, book name, student name, roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-background text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <Button
              onClick={() => fetchLiveAssignments()}
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0"
              title="Refresh Assignments"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Row 2: Select Filters (Book, Grade, Status, Sort) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Filter 1: Teaching Book */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-seneca-crimson" />
              <span>Teaching Book</span>
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-seneca-crimson"
            >
              <option value="all">All Teaching Books ({teachingBooks.length})</option>
              {teachingBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Grade / Class Section */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="h-3 w-3 text-seneca-amber" />
              <span>Grade & Class Section</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-seneca-amber"
            >
              <option value="all">All Assigned Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Submission / Grading Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3 text-rose-600" />
              <span>Grading Queue Status</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Assignments</option>
              <option value="pending">Pending Evaluation (Needs Marks)</option>
              <option value="graded">Fully Graded & Synced</option>
              <option value="overdue">Past Due Date</option>
              <option value="active">Active & Open</option>
            </select>
          </div>

          {/* Filter 4: Sort */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3 text-blue-600" />
              <span>Sort Order</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="due-date">Due Date (Nearest First)</option>
              <option value="pending">Most Pending Submissions</option>
              <option value="marks">Highest Max Marks</option>
              <option value="title">Assignment Title (A → Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedBook !== "all" || selectedClass !== "all" || selectedStatus !== "all" || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs">
            <span className="text-[11px] font-bold text-muted-foreground">Active Filters:</span>
            {selectedBook !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Book: {teachingBooks.find((b) => b.id === selectedBook)?.name || selectedBook}</span>
                <button onClick={() => setSelectedBook("all")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedClass !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Class: {uniqueClasses.find((c) => c.id === selectedClass)?.name || selectedClass}</span>
                <button onClick={() => setSelectedClass("all")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedStatus !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Status: {selectedStatus}</span>
                <button onClick={() => setSelectedStatus("all")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Query: &quot;{searchQuery}&quot;</span>
                <button onClick={() => setSearchQuery("")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={() => {
                setSelectedBook("all");
                setSelectedClass("all");
                setSelectedStatus("all");
                setSearchQuery("");
              }}
              className="text-[11px] font-bold text-seneca-crimson hover:underline ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </Card>

      {/* 4. Assignments Studio Cards List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
          <p className="text-xs font-bold text-muted-foreground">Loading Assignments & Submissions Studio...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-14 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <FileText className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-heading text-foreground">No Assignments Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              No assignments match your current filter criteria. Click &ldquo;Create New Assignment&rdquo; to publish
              coursework for your students.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              onClick={() => {
                setSelectedBook("all");
                setSelectedClass("all");
                setSelectedStatus("all");
                setSearchQuery("");
              }}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold"
            >
              Clear Filters
            </Button>
            <Button
              onClick={() => setCreateModalOpen(true)}
              variant="glow"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Assignment</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((a) => {
            const submissionPercentage =
              a.totalStudents > 0 ? Math.round((a.submittedCount / a.totalStudents) * 100) : 0;

            return (
              <Card
                key={a.id}
                className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-seneca-crimson/40 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/20 text-xs font-bold gap-1"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>{a.subjectName}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-seneca-amber/15 text-seneca-amber-dark dark:text-seneca-amber border-seneca-amber/30 text-xs font-bold"
                      >
                        {a.className}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono font-bold bg-muted text-foreground">
                        Max Marks: {a.maxMarks}
                      </Badge>
                      {a.pendingGradingCount > 0 && (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-xs font-bold animate-pulse">
                          {a.pendingGradingCount} Pending Review
                        </Badge>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                        {a.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed pt-1 line-clamp-2">
                        {a.description}
                      </p>
                    </div>

                    {/* Due Date & Submission Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Clock className={cn("h-3.5 w-3.5", a.isPastDue ? "text-rose-600" : "text-seneca-amber")} />
                        <span>Due Date: {a.formattedDueDate}</span>
                        {a.isPastDue && (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                            Deadline Passed
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{a.gradedCount} Graded</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Users className="h-3.5 w-3.5 text-blue-600" />
                        <span>{a.unsubmittedCount} Unsubmitted</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Progress Bar & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <div className="w-full sm:w-52 text-right space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Submission Progress</span>
                        <span className="text-foreground">
                          {a.submittedCount} / {a.totalStudents} ({submissionPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-seneca-amber to-seneca-crimson rounded-full transition-all"
                          style={{ width: `${submissionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => setGradingModalItem(a)}
                        variant="glow"
                        size="sm"
                        className="rounded-xl text-xs font-bold gap-1.5 shadow-md flex-1 sm:flex-initial justify-center"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        <span>
                          Review & Grade ({a.submissions.length})
                        </span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleOpenEdit(a, e)}
                        className="rounded-xl text-xs font-bold h-8 w-8 p-0"
                        title="Edit Assignment"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleDeleteAssignment(a.id, a.title, e)}
                        className="rounded-xl text-xs font-bold h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Assignment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Create Assignment Modal (Zero Viewport Overflow Layout) */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full rounded-2xl sm:rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
          <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold font-heading">
                  Create New Assignment
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Publish coursework, problem sets, and set deadlines for your classes.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateAssignment} className="flex-1 overflow-hidden flex flex-col min-h-0 text-xs">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Teaching Book Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Teaching Book / Subject *</span>
                </label>
                <select
                  value={targetBookId}
                  onChange={(e) => setTargetBookId(e.target.value)}
                  required
                  className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-seneca-crimson"
                >
                  {teachingBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Class Section */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-seneca-amber" />
                  <span>Target Class / Cohort *</span>
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-seneca-amber"
                >
                  {teachingBooks
                    .find((b) => b.id === targetBookId)
                    ?.classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  {(!teachingBooks.find((b) => b.id === targetBookId)?.classes ||
                    teachingBooks.find((b) => b.id === targetBookId)?.classes.length === 0) && (
                    <option value="">All Assigned Classes</option>
                  )}
                </select>
              </div>

              {/* Assignment Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Assignment Title *</label>
                <Input
                  type="text"
                  placeholder="e.g. Unit 4: Kinematics & Projectile Motion Numerical Practice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="h-10 rounded-xl bg-background text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Total Max Marks *</label>
                  <Input
                    type="number"
                    value={newMarks}
                    onChange={(e) => setNewMarks(e.target.value)}
                    required
                    min={1}
                    className="h-10 rounded-xl bg-background text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Submission Due Date *</label>
                  <Input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-background text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Problem Questions & Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Provide problem statements, formatting rules, and submission guidelines..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl text-xs font-bold flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5 flex-1 sm:flex-initial"
              >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>Publish Assignment</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Edit Assignment Modal */}
      {editingAssignment && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-lg w-[95vw] sm:w-full rounded-2xl sm:rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
            <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-seneca-amber/15 text-seneca-amber">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold font-heading">
                    Edit Assignment
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Update title, instructions, total marks, or submission deadline.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-hidden flex flex-col min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Assignment Title *</label>
                  <Input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-background text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Total Max Marks</label>
                    <Input
                      type="number"
                      value={editMarks}
                      onChange={(e) => setEditMarks(e.target.value)}
                      className="h-10 rounded-xl bg-background text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Due Date</label>
                    <Input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="h-10 rounded-xl bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Instructions & Description</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background border border-border text-xs resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl text-xs font-bold flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingEdit}
                  variant="glow"
                  className="rounded-xl text-xs font-bold gap-1.5 flex-1 sm:flex-initial"
                >
                  {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save Changes</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 7. Interactive Grading Review Studio Modal */}
      {gradingModalItem && (
        <Dialog open={!!gradingModalItem} onOpenChange={() => setGradingModalItem(null)}>
          <DialogContent className="max-w-3xl w-[95vw] sm:w-full rounded-2xl sm:rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
            {/* Fixed Header */}
            <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/20 text-xs font-bold">
                      {gradingModalItem.subjectName}
                    </Badge>
                    <Badge variant="outline" className="bg-seneca-amber/15 text-seneca-amber border-seneca-amber/30 text-xs font-bold">
                      {gradingModalItem.className}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono font-bold bg-muted text-foreground">
                      Max: {gradingModalItem.maxMarks} Marks
                    </Badge>
                  </div>
                  <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-foreground">
                    Grading Studio: {gradingModalItem.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Review submitted student solution files, enter numerical marks, and provide constructive feedback.
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={bulkZeroing || gradingModalItem.unsubmittedStudents.length === 0}
                    onClick={handleGradeAllUnsubmittedZero}
                    className="rounded-xl text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1 h-8"
                    title="Assign 0 to unsubmitted students"
                  >
                    {bulkZeroing ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertCircle className="h-3 w-3" />}
                    <span>Assign 0 to Unsubmitted ({gradingModalItem.unsubmittedStudents.length})</span>
                  </Button>
                </div>
              </div>

              {/* Progress Bar & Filter Tabs */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Grading Status:</span>
                  <span className="text-foreground">
                    {gradingModalItem.gradedCount} of {gradingModalItem.submittedCount} Submissions Graded (
                    {gradingModalItem.submittedCount > 0
                      ? Math.round((gradingModalItem.gradedCount / gradingModalItem.submittedCount) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                    style={{
                      width: `${
                        gradingModalItem.submittedCount > 0
                          ? Math.round((gradingModalItem.gradedCount / gradingModalItem.submittedCount) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>

                {/* Filter Tabs Inside Studio */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <button
                    onClick={() => setGradingFilterTab("all")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                      gradingFilterTab === "all"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All Submissions ({gradingSubmissions.length})
                  </button>
                  <button
                    onClick={() => setGradingFilterTab("pending")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                      gradingFilterTab === "pending"
                        ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Pending Review ({gradingSubmissions.filter((s) => !s.graded).length})
                  </button>
                  <button
                    onClick={() => setGradingFilterTab("graded")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                      gradingFilterTab === "graded"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Already Graded ({gradingSubmissions.filter((s) => s.graded).length})
                  </button>
                  <button
                    onClick={() => setGradingFilterTab("unsubmitted")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                      gradingFilterTab === "unsubmitted"
                        ? "bg-seneca-amber/15 text-seneca-amber border border-seneca-amber/30"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Unsubmitted ({gradingModalItem.unsubmittedStudents.length})
                  </button>
                </div>
              </div>
            </DialogHeader>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              {gradingFilterTab === "unsubmitted" ? (
                /* Unsubmitted Students List */
                <div className="space-y-3">
                  {gradingModalItem.unsubmittedStudents.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <p className="font-bold text-foreground">All students have submitted their coursework!</p>
                    </div>
                  ) : (
                    gradingModalItem.unsubmittedStudents.map((u) => (
                      <Card
                        key={u.studentId}
                        className="p-3.5 rounded-2xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xs">
                              {u.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-foreground text-xs sm:text-sm">{u.name}</h4>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {u.rollNumber} • {u.className}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-bold">
                            Missing Submission
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Marks: 0 / {gradingModalItem.maxMarks}
                          </span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                /* Submissions List */
                <div className="space-y-4">
                  {gradingSubmissions
                    .filter((sub) => {
                      if (gradingFilterTab === "pending") return !sub.graded;
                      if (gradingFilterTab === "graded") return sub.graded;
                      return true;
                    })
                    .map((sub) => {
                      const isGradingThis = submittingGradeId === sub.studentId;

                      return (
                        <Card
                          key={sub.studentId}
                          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-sm space-y-3.5"
                        >
                          {/* Student Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-seneca-amber/30 shadow-sm">
                                <AvatarImage src={sub.studentAvatar} alt={sub.studentName} />
                                <AvatarFallback className="bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white font-bold text-xs">
                                  {sub.studentName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-foreground text-xs sm:text-sm">
                                    {sub.studentName}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px] font-bold px-1.5 py-0.2",
                                      sub.graded
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                        : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                    )}
                                  >
                                    {sub.graded ? `Graded (${sub.score}/${sub.maxScore})` : "Pending Evaluation"}
                                  </Badge>
                                </div>
                                <p className="text-[10px] font-mono text-muted-foreground pt-0.5">
                                  Roll: {sub.rollNumber} • Submitted: {sub.formattedSubmittedAt}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {sub.isLate && (
                                <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]">
                                  Late
                                </Badge>
                              )}
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-xs font-bold gap-1.5 h-8"
                              >
                                <a
                                  href={sub.attachmentUrl || "/docs/sample-syllabus.pdf"}
                                  download={sub.attachmentName}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>{sub.attachmentName}</span>
                                </a>
                              </Button>
                            </div>
                          </div>

                          {/* Student Answer Content (if provided) */}
                          {sub.content && (
                            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-foreground leading-relaxed">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                                Student Solution Notes:
                              </span>
                              {sub.content}
                            </div>
                          )}

                          {/* Marks & Feedback Input Controls */}
                          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-foreground">
                                  Obtained Marks / {sub.maxScore}
                                </label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={sub.maxScore}
                                    value={sub.score ?? ""}
                                    onChange={(e) =>
                                      handleUpdateGradeLocal(
                                        sub.studentId,
                                        Number(e.target.value),
                                        sub.feedback || ""
                                      )
                                    }
                                    placeholder="Marks"
                                    className="h-9 w-24 rounded-xl bg-background text-xs font-bold text-center"
                                  />
                                  <span className="text-xs font-bold text-muted-foreground">/ {sub.maxScore}</span>
                                </div>
                              </div>

                              {/* Quick Score Presets */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                  Quick Score Presets:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  <button
                                    onClick={() => handleApplyPresetScore(sub.studentId, 100)}
                                    className="px-2 py-0.5 rounded-lg bg-background border border-border text-[10px] font-bold hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    100%
                                  </button>
                                  <button
                                    onClick={() => handleApplyPresetScore(sub.studentId, 90)}
                                    className="px-2 py-0.5 rounded-lg bg-background border border-border text-[10px] font-bold hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    90%
                                  </button>
                                  <button
                                    onClick={() => handleApplyPresetScore(sub.studentId, 80)}
                                    className="px-2 py-0.5 rounded-lg bg-background border border-border text-[10px] font-bold hover:bg-seneca-amber/15 hover:text-seneca-amber"
                                  >
                                    80%
                                  </button>
                                  <button
                                    onClick={() => handleApplyPresetScore(sub.studentId, 75)}
                                    className="px-2 py-0.5 rounded-lg bg-background border border-border text-[10px] font-bold hover:bg-muted"
                                  >
                                    75%
                                  </button>
                                  <button
                                    onClick={() => handleApplyPresetScore(sub.studentId, 50)}
                                    className="px-2 py-0.5 rounded-lg bg-background border border-border text-[10px] font-bold hover:bg-muted"
                                  >
                                    50%
                                  </button>
                                  <button
                                    onClick={() => handleApplyPresetScore(sub.studentId, 0)}
                                    className="px-2 py-0.5 rounded-lg bg-background border border-border text-[10px] font-bold hover:bg-rose-50 hover:text-rose-700"
                                  >
                                    0
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Written Constructive Feedback */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-foreground">
                                Teacher Written Feedback & Recommendations
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  value={sub.feedback || ""}
                                  onChange={(e) =>
                                    handleUpdateGradeLocal(
                                      sub.studentId,
                                      sub.score ?? 0,
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Outstanding derivations on step 3. Pay attention to SI units..."
                                  className="h-9 rounded-xl bg-background text-xs flex-1"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={isGradingThis || sub.score === undefined}
                                  onClick={() => handleSaveSingleGrade(sub)}
                                  variant="glow"
                                  className="rounded-xl text-xs font-bold gap-1 shrink-0"
                                >
                                  {isGradingThis ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                  <span>Save Grade</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Pinned Footer */}
            <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2 justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleExportGradesCSV(gradingModalItem)}
                className="rounded-xl text-xs font-bold gap-1.5 w-full sm:w-auto"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Grade Sheet (CSV)</span>
              </Button>

              <Button
                type="button"
                onClick={() => setGradingModalItem(null)}
                className="rounded-xl text-xs font-bold bg-seneca-crimson hover:bg-seneca-crimson-dark text-white w-full sm:w-auto"
              >
                Close Studio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Assignment Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Assignment?"
        description={`Are you sure you want to permanently delete assignment "${deleteConfirm?.title}" and all associated student submissions? This cannot be reversed.`}
        confirmText="Delete Assignment"
        variant="destructive"
        icon="trash"
        onConfirm={handleConfirmDeleteAssignment}
      />

      {/* Bulk Zero Grading Confirmation Dialog */}
      <ConfirmDialog
        open={zeroGradeConfirmOpen}
        onOpenChange={setZeroGradeConfirmOpen}
        title="Assign 0 Marks to Unsubmitted?"
        description={`Are you sure you want to assign 0 marks to all ${gradingModalItem?.unsubmittedStudents.length || 0} unsubmitted students for "${gradingModalItem?.title}"?`}
        confirmText="Assign 0 Marks"
        variant="warning"
        icon="warning"
        onConfirm={handleConfirmGradeAllUnsubmittedZero}
      />
    </div>
  );
}
