"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  HelpCircle,
  FolderOpen,
  Users,
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Award,
  Download,
  Upload,
  Send,
  Sparkles,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Megaphone,
  Layers,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Trash2,
  Sliders,
  Calendar,
  Phone,
  Edit,
  BarChart2,
  Lock,
  Eye,
  CheckSquare,
  XCircle,
  Paperclip,
  FileUp,
  Copy,
  MoreVertical,
  ArrowUp,
  ArrowDown,
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

interface SubmissionItem {
  id: string;
  submissionId?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  rollNumber: string;
  className: string;
  submittedAt: string;
  formattedSubmittedAt: string;
  content?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  obtainedMarks?: number;
  maxMarks: number;
  feedback?: string;
  status: "submitted" | "late" | "graded" | "resubmitted";
  gradedAt?: string;
}

interface UnsubmittedStudentItem {
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
  totalMarks: number;
  dueDate: string;
  formattedDueDate: string;
  className: string;
  classId?: string;
  status: "draft" | "published" | "closed";
  isPastDue?: boolean;
  totalTargetStudents?: number;
  submissionsCount: number;
  unsubmittedCount?: number;
  pendingGradingCount: number;
  gradedCount: number;
  submissions: SubmissionItem[];
  unsubmittedStudents?: UnsubmittedStudentItem[];
}

interface QuizQuestion {
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correctAnswer: number;
  marks: number;
  explanation?: string;
}

interface QuizAttemptItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  rollNumber: string;
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  submittedAt: string;
  formattedSubmittedAt: string;
  answers?: any[];
}

interface QuizItem {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questionsCount: number;
  questions: QuizQuestion[];
  className: string;
  classId?: string;
  status: "draft" | "published" | "closed";
  startDate?: string;
  endDate?: string;
  formattedEndDate?: string;
  isExpired?: boolean;
  totalTargetStudents?: number;
  attemptsCount?: number;
  unattemptedCount?: number;
  attempts?: QuizAttemptItem[];
  unattemptedStudents?: { studentId: string; name: string; rollNumber: string; className: string; score: number; totalMarks: number }[];
}

interface MaterialItem {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  formattedSize: string;
  mimeType: string;
  className: string;
  classId?: string;
  isPublished: boolean;
  createdAt: string;
  formattedDate: string;
}

interface StudentRosterItem {
  id: string;
  studentId: string;
  userId?: string;
  name: string;
  email?: string;
  phone: string;
  rollNumber: string;
  admissionNumber: string;
  className: string;
  classId?: string;
  guardianName: string;
  guardianPhone?: string;
  submittedAssignments: number;
  totalAssignments: number;
  avgScore: number | null;
}

interface BookModule {
  id: string;
  name: string;
  code: string;
  department: string;
  description: string;
  creditHours: number;
  classes: { id: string; name: string }[];
  enrolledStudentsCount: number;
  students: StudentRosterItem[];
  assignments: AssignmentItem[];
  totalAssignments: number;
  totalSubmissions: number;
  totalPendingGrading: number;
  quizzes: QuizItem[];
  totalQuizzes: number;
  materials: MaterialItem[];
  totalMaterials: number;
}

const FEEDBACK_PRESETS = [
  "Excellent problem-solving and rigorous step-by-step calculations.",
  "Good conceptual understanding. Please review foundational derivations.",
  "Well-structured report with clear diagrams and accurate observations.",
  "Incomplete assignment submission. Zero marks recorded as per academic policy.",
  "Zero marks assigned due to unsubmitted coursework before the due date.",
  "Outstanding derivation! Keep up the brilliant performance.",
];

export default function TeacherBooksPage() {
  const [books, setBooks] = useState<BookModule[]>([]);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Selected Book
  const [activeBookId, setActiveBookId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "assignments" | "quizzes" | "materials" | "students" | "notifications"
  >("assignments");

  // Assignment Checking Desk Sub-Tab / Filter
  const [assignmentStudentFilter, setAssignmentStudentFilter] = useState<Record<string, "all" | "submitted" | "unsubmitted">>({});

  // Grading / Checking Submission Modal State
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    submissionId?: string;
    assignmentId: string;
    studentId: string;
    studentName: string;
    rollNumber: string;
    className: string;
    attachmentName?: string;
    attachmentUrl?: string;
    content?: string;
    obtainedMarks?: number;
    maxMarks: number;
    feedback?: string;
    status?: string;
    isUnsubmitted?: boolean;
  } | null>(null);
  const [gradingMarks, setGradingMarks] = useState<string>("");
  const [gradingFeedback, setGradingFeedback] = useState<string>("");
  const [gradingStatus, setGradingStatus] = useState<"graded" | "resubmitted">("graded");
  const [savingGrade, setSavingGrade] = useState(false);

  // Create / Edit Assignment Modal State
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [asgTitle, setAsgTitle] = useState("");
  const [asgDescription, setAsgDescription] = useState("");
  const [asgMarks, setAsgMarks] = useState("25");
  const [asgDueDate, setAsgDueDate] = useState("");
  const [asgClassId, setAsgClassId] = useState("");
  const [asgStatus, setAsgStatus] = useState<"published" | "draft" | "closed">("published");
  const [savingAsg, setSavingAsg] = useState(false);

  // Create / Edit Quiz Modal State & Question Builder
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizDuration, setQuizDuration] = useState("20");
  const [quizTotalMarks, setQuizTotalMarks] = useState("10");
  const [quizPassMarks, setQuizPassMarks] = useState("6");
  const [quizEndDate, setQuizEndDate] = useState("");
  const [quizClassId, setQuizClassId] = useState("");
  const [quizStatus, setQuizStatus] = useState<"published" | "draft" | "closed">("published");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const questionsEndRef = useRef<HTMLDivElement>(null);

  // View Quiz Results / Attempts Modal State
  const [viewQuizModalOpen, setViewQuizModalOpen] = useState(false);
  const [selectedQuizDetails, setSelectedQuizDetails] = useState<QuizItem | null>(null);

  // Create / Edit Material Modal State
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [matTitle, setMatTitle] = useState("");
  const [matDescription, setMatDescription] = useState("");
  const [matFileName, setMatFileName] = useState("");
  const [matClassId, setMatClassId] = useState("");
  const [matCategory, setMatCategory] = useState("Lecture Notes");
  const [selectedFileObject, setSelectedFileObject] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [savingMat, setSavingMat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subject Notification Modal State
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyClassId, setNotifyClassId] = useState("");
  const [sendingNotify, setSendingNotify] = useState(false);

  // Deletion Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "assignment" | "quiz" | "material";
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetchBooksData();
  }, []);

  const fetchBooksData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/teacher/books");
      const json = await res.json();
      if (json.success && json.data) {
        setTeacherInfo(json.data.teacher);
        const bookList: BookModule[] = json.data.books || [];
        setBooks(bookList);
        if (bookList.length > 0 && !activeBookId) {
          setActiveBookId(bookList[0].id);
        }
        if (isManual) toast.success("Teaching curriculum books synchronized.");
      } else {
        toast.error(json.message || "Failed to load teaching books.");
      }
    } catch (_) {
      toast.error("Error connecting to curriculum server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const activeBook = useMemo(() => {
    return books.find((b) => b.id === activeBookId) || books[0] || null;
  }, [books, activeBookId]);

  // Total summary across all books
  const totals = useMemo(() => {
    let totalAssignments = 0;
    let totalPendingGrading = 0;
    let totalQuizzes = 0;
    let totalMaterials = 0;
    let totalStudents = 0;

    books.forEach((b) => {
      totalAssignments += b.totalAssignments;
      totalPendingGrading += b.totalPendingGrading;
      totalQuizzes += b.totalQuizzes;
      totalMaterials += b.totalMaterials;
      totalStudents += b.enrolledStudentsCount;
    });

    return { totalAssignments, totalPendingGrading, totalQuizzes, totalMaterials, totalStudents };
  }, [books]);

  // Open Grading Modal for a submitted student
  const handleOpenGrading = (sub: SubmissionItem, assignmentId: string) => {
    setSelectedSubmission({
      submissionId: sub.id,
      assignmentId,
      studentId: sub.studentId,
      studentName: sub.studentName,
      rollNumber: sub.rollNumber,
      className: sub.className,
      attachmentName: sub.attachmentName,
      attachmentUrl: sub.attachmentUrl,
      content: sub.content,
      obtainedMarks: sub.obtainedMarks,
      maxMarks: sub.maxMarks,
      feedback: sub.feedback || "",
      status: sub.status,
      isUnsubmitted: false,
    });
    setGradingMarks(sub.obtainedMarks !== undefined ? String(sub.obtainedMarks) : "");
    setGradingFeedback(sub.feedback || "");
    setGradingStatus(sub.status === "resubmitted" ? "resubmitted" : "graded");
    setGradingModalOpen(true);
  };

  // Open Grading Modal for an unsubmitted student (defaults to 0 marks)
  const handleOpenUnsubmittedGrading = (unsub: UnsubmittedStudentItem, assignment: AssignmentItem) => {
    setSelectedSubmission({
      assignmentId: assignment.id,
      studentId: unsub.studentId,
      studentName: unsub.name,
      rollNumber: unsub.rollNumber,
      className: unsub.className,
      obtainedMarks: 0,
      maxMarks: assignment.totalMarks,
      feedback: "0 marks awarded - assignment not submitted before the due date.",
      status: "graded",
      isUnsubmitted: true,
    });
    setGradingMarks("0");
    setGradingFeedback("0 marks awarded - assignment not submitted before the due date.");
    setGradingStatus("graded");
    setGradingModalOpen(true);
  };

  // Quick Award 0 Marks for a single unsubmitted student
  const handleQuickAwardZero = async (unsub: UnsubmittedStudentItem, assignmentId: string) => {
    try {
      const res = await fetch("/api/teacher/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          studentId: unsub.studentId,
          obtainedMarks: 0,
          feedback: "0 marks recorded - non-submission before deadline.",
          status: "graded",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`0 Marks assigned to ${unsub.name} for non-submission.`);
        fetchBooksData(false);
      } else {
        toast.error(data.message || "Failed to assign 0 marks.");
      }
    } catch (_) {
      toast.error("Error connecting to evaluation server.");
    }
  };

  // Bulk Award 0 Marks to ALL unsubmitted students for an assignment
  const handleGradeAllUnsubmittedZero = async (asg: AssignmentItem) => {
    const unsubs = asg.unsubmittedStudents || [];
    if (unsubs.length === 0) {
      return toast.info("All enrolled students have already submitted this assignment!");
    }

    const studentIds = unsubs.map((u) => u.studentId);
    toast.loading(`Assigning 0 marks to ${studentIds.length} unsubmitted students...`, { id: "bulk-zero" });

    try {
      const res = await fetch("/api/teacher/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade_all_unsubmitted_zero",
          assignmentId: asg.id,
          studentIds,
          feedback: `0 marks recorded for unsubmitted task (${asg.title}) after deadline.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`All ${studentIds.length} missing submissions marked with 0 marks!`, { id: "bulk-zero" });
        fetchBooksData(false);
      } else {
        toast.error(data.message || "Failed to process bulk zero marks.", { id: "bulk-zero" });
      }
    } catch (_) {
      toast.error("Error processing bulk grading.", { id: "bulk-zero" });
    }
  };

  // Submit Grade / Set Marks from Modal
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const numMarks = Number(gradingMarks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > selectedSubmission.maxMarks) {
      return toast.error(`Please enter valid marks between 0 and ${selectedSubmission.maxMarks}`);
    }

    setSavingGrade(true);
    try {
      let res;
      if (selectedSubmission.submissionId) {
        res = await fetch("/api/teacher/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: selectedSubmission.submissionId,
            obtainedMarks: numMarks,
            feedback: gradingFeedback.trim(),
            status: gradingStatus,
          }),
        });
      } else {
        res = await fetch("/api/teacher/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignmentId: selectedSubmission.assignmentId,
            studentId: selectedSubmission.studentId,
            obtainedMarks: numMarks,
            feedback: gradingFeedback.trim(),
            status: gradingStatus,
          }),
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success(
          `Marks (${numMarks}/${selectedSubmission.maxMarks}) assigned to ${selectedSubmission.studentName}!`,
          { description: "Student notified with marks and feedback." }
        );
        setGradingModalOpen(false);
        fetchBooksData(false);
      } else {
        toast.error(data.message || "Failed to save marks.");
      }
    } catch (_) {
      toast.error("Error connecting to grading server.");
    } finally {
      setSavingGrade(false);
    }
  };

  // -------------------------------------------------------------
  // ASSIGNMENT: Open Create vs Edit Modal
  // -------------------------------------------------------------
  const handleOpenCreateAssignment = () => {
    setEditingAssignmentId(null);
    setAsgTitle("");
    setAsgDescription("");
    setAsgMarks("25");
    setAsgDueDate("");
    setAsgClassId(activeBook?.classes[0]?.id || "");
    setAsgStatus("published");
    setAssignmentModalOpen(true);
  };

  const handleOpenEditAssignment = (asg: AssignmentItem) => {
    setEditingAssignmentId(asg.id);
    setAsgTitle(asg.title);
    setAsgDescription(asg.description || "");
    setAsgMarks(String(asg.totalMarks || 25));
    if (asg.dueDate) {
      const dt = new Date(asg.dueDate);
      const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setAsgDueDate(localIso);
    } else {
      setAsgDueDate("");
    }
    setAsgClassId(asg.classId || activeBook?.classes[0]?.id || "");
    setAsgStatus(asg.status || "published");
    setAssignmentModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgDueDate || !activeBook) {
      return toast.error("Please provide title, due date, and target class.");
    }

    setSavingAsg(true);
    try {
      const targetClass = asgClassId || activeBook.classes[0]?.id;
      const isEditing = Boolean(editingAssignmentId);

      const endpoint = "/api/assignments";
      const method = isEditing ? "PATCH" : "POST";
      const payload: any = {
        title: asgTitle.trim(),
        description: asgDescription.trim() || `Official coursework problem set for ${activeBook.name}`,
        classId: targetClass,
        subjectId: activeBook.id,
        totalMarks: Number(asgMarks) || 25,
        dueDate: new Date(asgDueDate).toISOString(),
        status: asgStatus,
      };
      if (isEditing) {
        payload.id = editingAssignmentId;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          isEditing
            ? `Assignment "${asgTitle}" updated successfully!`
            : `Assignment "${asgTitle}" published for ${activeBook.name}!`
        );
        setAssignmentModalOpen(false);
        fetchBooksData(true);
      } else {
        toast.error(data.message || "Failed to save assignment.");
      }
    } catch (_) {
      toast.error("Error saving assignment.");
    } finally {
      setSavingAsg(false);
    }
  };

  const handleDeleteAssignment = (asgId: string, title: string) => {
    setDeleteConfirm({ type: "assignment", id: asgId, title });
  };

  // -------------------------------------------------------------
  // QUIZ: Open Create vs Edit Modal & Question Builder
  // -------------------------------------------------------------
  const handleOpenCreateQuiz = () => {
    setEditingQuizId(null);
    setQuizTitle("");
    setQuizDescription("");
    setQuizDuration("20");
    setQuizTotalMarks("10");
    setQuizPassMarks("6");
    setQuizEndDate("");
    setQuizClassId(activeBook?.classes[0]?.id || "");
    setQuizStatus("published");
    setQuizQuestions([]); // Clean slate: do NOT show default dummy questions!
    setQuizModalOpen(true);
  };

  const handleOpenEditQuiz = (quiz: QuizItem) => {
    setEditingQuizId(quiz.id);
    setQuizTitle(quiz.title);
    setQuizDescription(quiz.description || "");
    setQuizDuration(String(quiz.durationMinutes || 20));
    setQuizTotalMarks(String(quiz.totalMarks || 10));
    setQuizPassMarks(String(quiz.passingMarks || 6));
    if (quiz.endDate) {
      const dt = new Date(quiz.endDate);
      const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setQuizEndDate(localIso);
    } else {
      setQuizEndDate("");
    }
    setQuizClassId(quiz.classId || activeBook?.classes[0]?.id || "");
    setQuizStatus(quiz.status || "published");
    setQuizQuestions(quiz.questions && Array.isArray(quiz.questions) ? quiz.questions : []);
    setQuizModalOpen(true);
  };

  const handleAddQuestion = (type: "multiple_choice" | "true_false" = "multiple_choice") => {
    const qNum = quizQuestions.length + 1;
    setQuizQuestions((prev) => [
      ...prev,
      {
        question: "",
        type,
        options: type === "true_false" ? ["True", "False"] : ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        marks: 2,
        explanation: "",
      },
    ]);
    setTimeout(() => {
      questionsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
  };

  const handleDuplicateQuestion = (qIndex: number) => {
    const target = quizQuestions[qIndex];
    if (!target) return;
    const copy: QuizQuestion = {
      question: target.question ? `${target.question} (Copy)` : "",
      type: target.type,
      options: [...target.options],
      correctAnswer: target.correctAnswer,
      marks: target.marks,
      explanation: target.explanation || "",
    };
    setQuizQuestions((prev) => {
      const next = [...prev];
      next.splice(qIndex + 1, 0, copy);
      return next;
    });
    toast.success(`Question Q${qIndex + 1} duplicated.`);
  };

  const handleMoveQuestion = (qIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? qIndex - 1 : qIndex + 1;
    if (targetIndex < 0 || targetIndex >= quizQuestions.length) return;
    setQuizQuestions((prev) => {
      const next = [...prev];
      const temp = next[qIndex];
      next[qIndex] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleAddOption = (qIndex: number) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        if (q.options.length >= 6) {
          toast.error("Maximum 6 options allowed per question.");
          return q;
        }
        const optLetter = String.fromCharCode(65 + q.options.length);
        return {
          ...q,
          options: [...q.options, `Option ${optLetter}`],
        };
      })
    );
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        if (q.options.length <= 2) {
          toast.error("A multiple-choice question must have at least 2 options.");
          return q;
        }
        const nextOpts = q.options.filter((_, oIdx) => oIdx !== optIndex);
        let nextCorrect = q.correctAnswer;
        if (nextCorrect === optIndex) nextCorrect = 0;
        else if (nextCorrect > optIndex) nextCorrect -= 1;
        return {
          ...q,
          options: nextOpts,
          correctAnswer: nextCorrect,
        };
      })
    );
  };

  const handleSyncTotalMarks = () => {
    const calculated = quizQuestions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);
    setQuizTotalMarks(String(calculated));
    setQuizPassMarks(String(Math.max(1, Math.ceil(calculated * 0.5))));
    toast.success(`Total marks synchronized to ${calculated} (Pass mark set to ${Math.max(1, Math.ceil(calculated * 0.5))})`);
  };

  const handleUpdateQuestion = (qIndex: number, field: keyof QuizQuestion, value: any) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, [field]: value } : q))
    );
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oIdx) => (oIdx === optIndex ? value : opt)),
            }
          : q
      )
    );
  };

  const handleRemoveQuestion = (qIndex: number) => {
    setQuizQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
    toast.info("Question removed.");
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || !activeBook) {
      return toast.error("Please fill in quiz title.");
    }

    if (quizQuestions.length === 0) {
      return toast.error("Please add at least 1 question to the quiz before saving.");
    }

    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.question.trim()) {
        return toast.error(`Please enter the question prompt for Question Q${i + 1}.`);
      }
      if (q.options.length < 2) {
        return toast.error(`Question Q${i + 1} must have at least 2 options.`);
      }
      if (q.options.some((opt) => !opt.trim())) {
        return toast.error(`Please fill out all option choices for Question Q${i + 1}.`);
      }
    }

    setSavingQuiz(true);
    try {
      const targetClass = quizClassId || activeBook.classes[0]?.id;
      const now = new Date();
      const end = quizEndDate ? new Date(quizEndDate) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const calculatedMarks = quizQuestions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);

      const isEditing = Boolean(editingQuizId);
      const endpoint = "/api/quizzes";
      const method = isEditing ? "PATCH" : "POST";
      const payload: any = {
        title: quizTitle.trim(),
        description: quizDescription.trim() || `Diagnostic & Comprehension Quiz for ${activeBook.name}`,
        classId: targetClass,
        subjectId: activeBook.id,
        durationMinutes: Number(quizDuration) || 20,
        totalMarks: Number(quizTotalMarks) || calculatedMarks || 10,
        passingMarks: Number(quizPassMarks) || 6,
        questions: quizQuestions,
        startDate: now.toISOString(),
        endDate: end.toISOString(),
        status: quizStatus,
      };
      if (isEditing) {
        payload.id = editingQuizId;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          isEditing
            ? `Quiz "${quizTitle}" updated with ${quizQuestions.length} questions!`
            : `Quiz "${quizTitle}" created with ${quizQuestions.length} questions!`
        );
        setQuizModalOpen(false);
        fetchBooksData(true);
      } else {
        toast.error(data.message || "Failed to save quiz.");
      }
    } catch (_) {
      toast.error("Error saving quiz.");
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = (quizId: string, title: string) => {
    setDeleteConfirm({ type: "quiz", id: quizId, title });
  };

  // -------------------------------------------------------------
  // COURSE MATERIAL: Open Create vs Edit Modal
  // -------------------------------------------------------------
  const handleOpenUploadMaterial = () => {
    setEditingMaterialId(null);
    setMatTitle("");
    setMatDescription("");
    setMatFileName("");
    setMatClassId(activeBook?.classes[0]?.id || "");
    setMatCategory("Lecture Notes");
    setSelectedFileObject(null);
    setMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (mat: MaterialItem) => {
    setEditingMaterialId(mat.id);
    setMatTitle(mat.title);
    setMatDescription(mat.description || "");
    setMatFileName(mat.fileName || "");
    setMatClassId(mat.classId || activeBook?.classes[0]?.id || "");
    setMatCategory("Lecture Notes");
    setSelectedFileObject(null);
    setMaterialModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileObject(file);
      if (!matTitle) {
        setMatTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      }
      setMatFileName(file.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFileObject(file);
      if (!matTitle) {
        setMatTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      }
      setMatFileName(file.name);
    }
  };

  const handleClearSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFileObject(null);
    setMatFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !activeBook) {
      return toast.error("Please provide a title for the course material.");
    }

    setSavingMat(true);
    try {
      const targetClass = matClassId || activeBook.classes[0]?.id;
      const isEditing = Boolean(editingMaterialId);
      const sampleFileName =
        matFileName.trim() ||
        selectedFileObject?.name ||
        `${activeBook.name.replace(/\s+/g, "_")}_Chapter_Notes.pdf`;

      const fileSize = selectedFileObject?.size || 1024 * 1024 * 3.5;
      const mimeType = selectedFileObject?.type || "application/pdf";

      const endpoint = "/api/materials";
      const method = isEditing ? "PATCH" : "POST";
      const payload: any = {
        title: matTitle.trim(),
        description: matDescription.trim() || `[${matCategory}] Course notes & slides for ${activeBook.name}`,
        classId: targetClass,
        subjectId: activeBook.id,
        fileName: sampleFileName,
        fileUrl: `/uploads/materials/${encodeURIComponent(sampleFileName)}`,
        fileSize,
        mimeType,
        isPublished: true,
      };
      if (isEditing) {
        payload.id = editingMaterialId;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          isEditing
            ? `Course material "${matTitle}" updated!`
            : `Course material "${matTitle}" uploaded and published!`
        );
        setMaterialModalOpen(false);
        fetchBooksData(true);
      } else {
        toast.error(data.message || "Failed to save material.");
      }
    } catch (_) {
      toast.error("Error saving material.");
    } finally {
      setSavingMat(false);
    }
  };

  const handleDeleteMaterial = (matId: string, title: string) => {
    setDeleteConfirm({ type: "material", id: matId, title });
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id, title } = deleteConfirm;
    try {
      if (type === "assignment") {
        const res = await fetch(`/api/assignments?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          toast.success(`Assignment "${title}" deleted successfully.`);
          fetchBooksData(false);
        } else {
          toast.error(data.message || "Failed to delete assignment.");
        }
      } else if (type === "quiz") {
        const res = await fetch(`/api/quizzes?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          toast.success(`Quiz "${title}" deleted successfully.`);
          fetchBooksData(false);
        } else {
          toast.error(data.message || "Failed to delete quiz.");
        }
      } else if (type === "material") {
        const res = await fetch(`/api/materials?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          toast.success(`Course material removed successfully.`);
          fetchBooksData(false);
        } else {
          toast.error(data.message || "Failed to delete material.");
        }
      }
    } catch (_) {
      toast.error(`Error deleting ${type}.`);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // -------------------------------------------------------------
  // NOTIFICATIONS: Broadcast Notice Submit
  // -------------------------------------------------------------
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyTitle.trim() || !notifyMessage.trim() || !activeBook) {
      return toast.error("Please enter both title and notification message.");
    }

    setSendingNotify(true);
    try {
      const res = await fetch("/api/teacher/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_notification",
          subjectId: activeBook.id,
          classId: notifyClassId || undefined,
          title: notifyTitle.trim(),
          message: notifyMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Subject advisory dispatched to students!");
        setNotifyModalOpen(false);
        setNotifyTitle("");
        setNotifyMessage("");
      } else {
        toast.error(data.message || "Failed to send notification.");
      }
    } catch (_) {
      toast.error("Error sending notification.");
    } finally {
      setSendingNotify(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
        <div className="h-32 rounded-3xl bg-muted/40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-36 rounded-3xl bg-muted/40" />
          <div className="h-36 rounded-3xl bg-muted/40" />
          <div className="h-36 rounded-3xl bg-muted/40" />
        </div>
        <div className="h-96 rounded-3xl bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-foreground">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-seneca-crimson/[0.08] p-5 sm:p-7 shadow-lg">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-seneca-amber/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold border border-seneca-crimson/20">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Faculty Curriculum &amp; Teaching Books</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{books.length} Active Teaching Courses</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
              My Teaching Books &amp; Courseware Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Create, edit, and manage detailed assignments &amp; quizzes, upload textbook materials &amp; lecture slides,
              evaluate submitted student work, award marks with feedback, and auto-enforce strict due date policies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => fetchBooksData(true)}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="rounded-2xl text-xs font-bold gap-1.5 h-10 px-3.5 bg-background shadow-xs"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span>Sync Books</span>
            </Button>

            <Button
              onClick={() => setNotifyModalOpen(true)}
              variant="glow"
              size="sm"
              className="rounded-2xl text-xs font-bold gap-1.5 h-10 px-4 shadow-md shadow-seneca-amber/20"
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span>Broadcast Subject Notice</span>
            </Button>
          </div>
        </div>

        {/* Global Teaching KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3.5 mt-5 pt-4 border-t border-border/60">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center font-bold shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Teaching Books</p>
              <p className="text-base font-black text-foreground">{books.length}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Enrolled Students</p>
              <p className="text-base font-black text-foreground">{totals.totalStudents}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Active Assignments</p>
              <p className="text-base font-black text-foreground">{totals.totalAssignments}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Needs Checking</p>
              <p className="text-base font-black text-rose-600">{totals.totalPendingGrading}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Course Quizzes</p>
              <p className="text-base font-black text-foreground">{totals.totalQuizzes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Bookshelf / Course Cards Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-heading text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-seneca-crimson" />
            <span>Select Teaching Book / Subject</span>
          </h2>
          <span className="text-xs text-muted-foreground">
            Click on any book module to manage its coursework &amp; check submissions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => {
            const isSelected = book.id === activeBook?.id;
            return (
              <div
                key={book.id}
                onClick={() => setActiveBookId(book.id)}
                className={cn(
                  "p-4 rounded-3xl border transition-all cursor-pointer relative select-none flex flex-col justify-between gap-3 group",
                  isSelected
                    ? "bg-card border-seneca-crimson shadow-lg ring-2 ring-seneca-crimson/20"
                    : "bg-card/70 border-border hover:border-border/80 hover:bg-card hover:shadow-md"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5",
                        isSelected
                          ? "bg-seneca-crimson text-white border-seneca-crimson"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {book.code}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {book.creditHours} Credit Hrs • {book.department}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-black font-heading text-foreground group-hover:text-seneca-crimson transition-colors">
                      {book.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {book.description}
                    </p>
                  </div>

                  {/* Class Sections Offering */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {book.classes.map((cls) => (
                      <span
                        key={cls.id}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-muted text-foreground/80 border border-border/60"
                      >
                        {cls.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="pt-3 border-t border-border/50 grid grid-cols-4 gap-1 text-center text-xs">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Students</p>
                    <p className="font-extrabold text-foreground">{book.enrolledStudentsCount}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Assignments</p>
                    <p className="font-extrabold text-foreground">{book.totalAssignments}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Checking</p>
                    <p
                      className={cn(
                        "font-extrabold",
                        book.totalPendingGrading > 0 ? "text-rose-600 animate-pulse" : "text-emerald-600"
                      )}
                    >
                      {book.totalPendingGrading}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Quizzes</p>
                    <p className="font-extrabold text-foreground">{book.totalQuizzes}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Active Book Command Center */}
      {activeBook && (
        <Card className="border border-border/80 bg-card shadow-xl rounded-3xl overflow-hidden">
          {/* Active Book Header Bar */}
          <div className="p-5 sm:p-6 bg-muted/40 border-b border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-seneca-crimson text-white font-extrabold text-[10px]">
                  {activeBook.code}
                </Badge>
                <span className="text-xs font-bold text-muted-foreground">{activeBook.department}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-foreground">
                {activeBook.name} — Courseware &amp; Evaluation Desk
              </h2>
              <p className="text-xs text-muted-foreground">
                Managing {activeBook.enrolledStudentsCount} enrolled students across{" "}
                {activeBook.classes.map((c) => c.name).join(", ")}.
              </p>
            </div>

            {/* Quick Action Buttons for Active Book */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleOpenCreateAssignment}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 h-9 bg-background shadow-xs hover:border-seneca-crimson hover:text-seneca-crimson"
              >
                <Plus className="h-3.5 w-3.5 text-seneca-crimson" />
                <span>New Assignment</span>
              </Button>

              <Button
                onClick={handleOpenCreateQuiz}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 h-9 bg-background shadow-xs hover:border-indigo-600 hover:text-indigo-600"
              >
                <Plus className="h-3.5 w-3.5 text-indigo-600" />
                <span>New Quiz</span>
              </Button>

              <Button
                onClick={handleOpenUploadMaterial}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 h-9 bg-background shadow-xs hover:border-amber-600 hover:text-amber-600"
              >
                <Upload className="h-3.5 w-3.5 text-amber-600" />
                <span>Upload Material</span>
              </Button>
            </div>
          </div>

          {/* 5 Operational Tabs */}
          <div className="border-b border-border/70 px-4 sm:px-6 bg-card flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("assignments")}
              className={cn(
                "py-3.5 px-3 border-b-2 transition-all shrink-0 flex items-center gap-2",
                activeTab === "assignments"
                  ? "border-seneca-crimson text-seneca-crimson"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              <span>Assignments &amp; Checking Desk</span>
              {activeBook.totalPendingGrading > 0 && (
                <span className="h-4.5 px-1.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                  {activeBook.totalPendingGrading} pending
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("quizzes")}
              className={cn(
                "py-3.5 px-3 border-b-2 transition-all shrink-0 flex items-center gap-2",
                activeTab === "quizzes"
                  ? "border-seneca-crimson text-seneca-crimson"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Quizzes ({activeBook.totalQuizzes})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("materials")}
              className={cn(
                "py-3.5 px-3 border-b-2 transition-all shrink-0 flex items-center gap-2",
                activeTab === "materials"
                  ? "border-seneca-crimson text-seneca-crimson"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <FolderOpen className="h-4 w-4" />
              <span>Course Materials &amp; Notes ({activeBook.totalMaterials})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={cn(
                "py-3.5 px-3 border-b-2 transition-all shrink-0 flex items-center gap-2",
                activeTab === "students"
                  ? "border-seneca-crimson text-seneca-crimson"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              <span>Enrolled Students ({activeBook.enrolledStudentsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={cn(
                "py-3.5 px-3 border-b-2 transition-all shrink-0 flex items-center gap-2",
                activeTab === "notifications"
                  ? "border-seneca-crimson text-seneca-crimson"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Megaphone className="h-4 w-4" />
              <span>Course Notifications</span>
            </button>
          </div>

          {/* Tab Content Areas */}
          <div className="p-4 sm:p-6 bg-card min-h-[420px]">
            {/* TAB 1: Assignments & Checking Desk */}
            {activeTab === "assignments" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold font-heading text-foreground">
                      Book Assignments &amp; Submissions Evaluation Desk
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Create, edit, and evaluate coursework. Check submitted student solution files, award marks with feedback, and auto-grade overdue unsubmitted tasks as 0.
                    </p>
                  </div>

                  <Button
                    onClick={handleOpenCreateAssignment}
                    variant="glow"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1.5 h-9"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Assignment</span>
                  </Button>
                </div>

                {activeBook.assignments.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 space-y-3">
                    <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">No Assignments for this Book Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Publish your first assignment problem set or homework task for students taking {activeBook.name}.
                    </p>
                    <Button
                      onClick={handleOpenCreateAssignment}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create Assignment Now</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeBook.assignments.map((asg) => {
                      const filterMode = assignmentStudentFilter[asg.id] || "all";
                      const unsubs = asg.unsubmittedStudents || [];
                      const isPastDue = asg.isPastDue;

                      return (
                        <div
                          key={asg.id}
                          className="p-5 rounded-3xl border border-border/80 bg-muted/20 space-y-4 shadow-xs"
                        >
                          {/* Assignment Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-extrabold text-foreground">
                                  {asg.title}
                                </h4>
                                <Badge variant="outline" className="text-[10px] font-bold">
                                  {asg.className}
                                </Badge>
                                <Badge className="bg-seneca-crimson text-white text-[10px] font-extrabold">
                                  Total: {asg.totalMarks} Marks
                                </Badge>
                                {isPastDue ? (
                                  <Badge className="bg-rose-500/15 text-rose-600 border border-rose-500/30 text-[10px] font-extrabold flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    <span>Deadline Passed (Submissions Locked)</span>
                                  </Badge>
                                ) : (
                                  <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Active (Submissions Open)</span>
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{asg.description}</p>
                            </div>

                            {/* Right actions: due date, turnout, Edit/Delete buttons */}
                            <div className="flex items-center gap-3 text-xs shrink-0 flex-wrap">
                              <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Due Date</p>
                                <p className="font-bold text-foreground">{asg.formattedDueDate}</p>
                              </div>
                              <div className="text-right pl-3 border-l border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Turnout</p>
                                <p className="font-bold text-foreground">
                                  {asg.submissionsCount} Submitted • {unsubs.length} Missing
                                </p>
                              </div>

                              {/* Edit & Delete Assignment Buttons */}
                              <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditAssignment(asg)}
                                  className="p-2 rounded-xl bg-background border border-border/80 hover:border-seneca-crimson hover:text-seneca-crimson transition-all"
                                  title="Edit Assignment"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                                  className="p-2 rounded-xl bg-background border border-rose-500/20 text-rose-600 hover:bg-rose-500 hover:text-white transition-all"
                                  title="Delete Assignment"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Filter Sub-Tabs & Actions Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/60 text-xs">
                              <button
                                type="button"
                                onClick={() =>
                                  setAssignmentStudentFilter((prev) => ({ ...prev, [asg.id]: "all" }))
                                }
                                className={cn(
                                  "px-2.5 py-1 rounded-lg font-bold transition-all",
                                  filterMode === "all"
                                    ? "bg-seneca-crimson text-white shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                All Students ({asg.submissions.length + unsubs.length})
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setAssignmentStudentFilter((prev) => ({ ...prev, [asg.id]: "submitted" }))
                                }
                                className={cn(
                                  "px-2.5 py-1 rounded-lg font-bold transition-all",
                                  filterMode === "submitted"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                Submitted ({asg.submissions.length})
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setAssignmentStudentFilter((prev) => ({ ...prev, [asg.id]: "unsubmitted" }))
                                }
                                className={cn(
                                  "px-2.5 py-1 rounded-lg font-bold transition-all",
                                  filterMode === "unsubmitted"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                Unsubmitted ({unsubs.length})
                              </button>
                            </div>

                            {/* Quick Bulk Action for Unsubmitted */}
                            {unsubs.length > 0 && (
                              <Button
                                onClick={() => handleGradeAllUnsubmittedZero(asg)}
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-xs font-bold gap-1.5 h-8 text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Mark All Unsubmitted as 0</span>
                              </Button>
                            )}
                          </div>

                          {/* Student Submissions & Unsubmitted Roster Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                            {/* Render Submitted Students */}
                            {(filterMode === "all" || filterMode === "submitted") &&
                              asg.submissions.map((sub) => {
                                const isGraded = sub.status === "graded";
                                return (
                                  <div
                                    key={sub.id}
                                    className={cn(
                                      "p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3",
                                      isGraded
                                        ? "bg-card border-border/80"
                                        : "bg-rose-500/[0.04] border-rose-500/30 shadow-xs"
                                    )}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                          <Avatar className="h-9 w-9 border">
                                            <AvatarFallback className="font-bold text-xs bg-seneca-crimson text-white">
                                              {sub.studentName.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h5 className="text-xs font-bold text-foreground">
                                              {sub.studentName}
                                            </h5>
                                            <p className="text-[10px] text-muted-foreground">
                                              Roll: {sub.rollNumber} • {sub.className}
                                            </p>
                                          </div>
                                        </div>

                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "text-[10px] font-extrabold",
                                            isGraded
                                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                              : "bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse"
                                          )}
                                        >
                                          {isGraded
                                            ? `Graded: ${sub.obtainedMarks}/${sub.maxMarks}`
                                            : "Needs Checking"}
                                        </Badge>
                                      </div>

                                      {/* Submitted Document & Content */}
                                      <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <FileText className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />
                                          <span className="truncate text-[11px] font-semibold">
                                            {sub.attachmentName || "Solution_Document.pdf"}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                          {sub.formattedSubmittedAt}
                                        </span>
                                      </div>

                                      {/* Feedback if already graded */}
                                      {sub.feedback && (
                                        <p className="text-[11px] text-muted-foreground italic line-clamp-2 px-1">
                                          "{sub.feedback}"
                                        </p>
                                      )}
                                    </div>

                                    {/* Evaluation Action */}
                                    <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                                      <span className="text-[10px] text-muted-foreground">
                                        {isGraded ? "Marks published" : "Pending evaluation"}
                                      </span>

                                      <Button
                                        onClick={() => handleOpenGrading(sub, asg.id)}
                                        variant={isGraded ? "outline" : "glow"}
                                        size="sm"
                                        className="rounded-xl text-xs font-bold gap-1.5 h-8 px-3"
                                      >
                                        <Award className="h-3.5 w-3.5" />
                                        <span>{isGraded ? "Update Marks" : "Check & Set Marks"}</span>
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}

                            {/* Render Unsubmitted Students */}
                            {(filterMode === "all" || filterMode === "unsubmitted") &&
                              unsubs.map((unsub) => {
                                return (
                                  <div
                                    key={unsub.id}
                                    className="p-4 rounded-2xl border border-dashed border-rose-500/40 bg-rose-500/[0.02] flex flex-col justify-between gap-3"
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                          <Avatar className="h-9 w-9 border border-rose-500/20">
                                            <AvatarFallback className="font-bold text-xs bg-muted text-muted-foreground">
                                              {unsub.name.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h5 className="text-xs font-bold text-foreground">
                                              {unsub.name}
                                            </h5>
                                            <p className="text-[10px] text-muted-foreground">
                                              Roll: {unsub.rollNumber} • {unsub.className}
                                            </p>
                                          </div>
                                        </div>

                                        <Badge
                                          variant="outline"
                                          className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-extrabold"
                                        >
                                          0 Marks (Unsubmitted)
                                        </Badge>
                                      </div>

                                      <div className="p-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                                        <span>⚠️ No submission uploaded</span>
                                        <span className="font-mono text-[10px]">Score: 0/{asg.totalMarks}</span>
                                      </div>
                                    </div>

                                    {/* Action Buttons for Unsubmitted Student */}
                                    <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                                      <span className="text-[10px] text-rose-600 font-semibold">
                                        {isPastDue ? "Overdue (0 Marks)" : "Pending submission"}
                                      </span>

                                      <div className="flex items-center gap-1.5">
                                        <Button
                                          onClick={() => handleQuickAwardZero(unsub, asg.id)}
                                          variant="outline"
                                          size="sm"
                                          className="rounded-xl text-xs font-bold gap-1 h-8 px-2 text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                                        >
                                          <Check className="h-3 w-3" />
                                          <span>Award 0</span>
                                        </Button>

                                        <Button
                                          onClick={() => handleOpenUnsubmittedGrading(unsub, asg)}
                                          variant="outline"
                                          size="sm"
                                          className="rounded-xl text-xs font-bold gap-1 h-8 px-2"
                                        >
                                          <Edit className="h-3 w-3" />
                                          <span>Custom Grade</span>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Quizzes & Tests Desk */}
            {activeTab === "quizzes" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold font-heading text-foreground">
                      Book Quizzes &amp; Diagnostic Assessments Desk
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Author multiple-choice and true/false quizzes with custom question marks, timing, and deadline controls. Edit, delete, and inspect student attempts &amp; scores.
                    </p>
                  </div>

                  <Button
                    onClick={handleOpenCreateQuiz}
                    variant="glow"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1.5 h-9"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Quiz</span>
                  </Button>
                </div>

                {activeBook.quizzes.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 space-y-3">
                    <HelpCircle className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">No Quizzes Created for this Book</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Create interactive quizzes with question authoring to test student comprehension for {activeBook.name}.
                    </p>
                    <Button
                      onClick={handleOpenCreateQuiz}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create Quiz Now</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeBook.quizzes.map((quiz) => {
                      const isExpired = quiz.isExpired;
                      return (
                        <div
                          key={quiz.id}
                          className="p-5 rounded-3xl border border-border/80 bg-muted/20 space-y-3.5 flex flex-col justify-between shadow-xs"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {quiz.className}
                              </Badge>
                              <div className="flex items-center gap-1.5">
                                <Badge className="bg-indigo-600 text-white text-[10px] font-extrabold">
                                  {quiz.totalMarks} Marks ({quiz.durationMinutes} Mins)
                                </Badge>
                                {/* Edit and Delete Quiz buttons */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditQuiz(quiz)}
                                  className="p-1.5 rounded-lg bg-background border border-border/80 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                                  title="Edit Quiz & Questions"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                                  className="p-1.5 rounded-lg bg-background border border-rose-500/20 text-rose-600 hover:bg-rose-500 hover:text-white transition-all"
                                  title="Delete Quiz"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-base font-extrabold text-foreground">
                              {quiz.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {quiz.description || "Curriculum topic assessment."}
                            </p>

                            <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1 text-muted-foreground">
                              <span className="font-semibold">📝 {quiz.questionsCount} Questions</span>
                              <span>•</span>
                              <span className="font-semibold">🎯 Pass: {quiz.passingMarks} Marks</span>
                              <span>•</span>
                              <span className="font-semibold">👥 {quiz.attemptsCount || 0} Attempts</span>
                            </div>

                            {quiz.endDate && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                <span>Due / End Date: <strong className="text-foreground">{quiz.formattedEndDate}</strong></span>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                            {isExpired ? (
                              <Badge
                                variant="outline"
                                className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-bold flex items-center gap-1"
                              >
                                <Lock className="h-3 w-3" />
                                <span>Expired (Closed)</span>
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold flex items-center gap-1"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Active &amp; Published</span>
                              </Badge>
                            )}

                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => {
                                  setSelectedQuizDetails(quiz);
                                  setViewQuizModalOpen(true);
                                }}
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-xs font-bold gap-1 h-8 bg-background shadow-xs hover:border-indigo-600 hover:text-indigo-600"
                              >
                                <BarChart2 className="h-3.5 w-3.5" />
                                <span>View Results &amp; Attempts</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Course Materials & Notes */}
            {activeTab === "materials" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold font-heading text-foreground">
                      Course Materials, Lecture Notes &amp; Textbook Chapters
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Upload study guides, slide presentations, chapter PDFs, and problem worksheets for students taking {activeBook.name}. Edit or remove materials anytime.
                    </p>
                  </div>

                  <Button
                    onClick={handleOpenUploadMaterial}
                    variant="glow"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1.5 h-9"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Material</span>
                  </Button>
                </div>

                {activeBook.materials.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 space-y-3">
                    <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">No Materials Uploaded Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Upload lecture presentations, chapter PDFs, and problem sheets for students.
                    </p>
                    <Button
                      onClick={handleOpenUploadMaterial}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Course Material</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeBook.materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-muted/20 space-y-3 flex flex-col justify-between hover:border-seneca-crimson transition-all shadow-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
                              <FileText className="h-4 w-4" />
                            </span>
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {mat.className}
                            </Badge>
                          </div>

                          <h4 className="text-sm font-extrabold text-foreground truncate">
                            {mat.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {mat.description || mat.fileName}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-muted-foreground">
                            {mat.formattedSize} • {mat.formattedDate}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <a
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-background border hover:bg-seneca-crimson hover:text-white transition-colors"
                              title="Download / View Material"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleOpenEditMaterial(mat)}
                              className="p-1.5 rounded-lg bg-background border hover:border-amber-500 hover:text-amber-600 transition-colors"
                              title="Edit Material"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                              className="p-1.5 rounded-lg bg-background border border-rose-500/20 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"
                              title="Delete Material"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Enrolled Students Roster */}
            {activeTab === "students" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold font-heading text-foreground">
                      Students Enrolled in {activeBook.name} ({activeBook.students.length})
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Roster of active students taking this subject with academic progress metrics.
                    </p>
                  </div>

                  <Link href="/teacher/messages">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-1.5 h-9"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-seneca-crimson" />
                      <span>Open Student Chat Desk</span>
                    </Button>
                  </Link>
                </div>

                <div className="rounded-2xl border border-border/80 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 text-muted-foreground text-[10px] uppercase font-bold border-b border-border/80">
                        <tr>
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Roll Number</th>
                          <th className="py-3 px-4">Class Section</th>
                          <th className="py-3 px-4">Guardian Contact</th>
                          <th className="py-3 px-4 text-center">Assignments Submitted</th>
                          <th className="py-3 px-4 text-center">Subject Average</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {activeBook.students.map((st) => (
                          <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-foreground">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-7 w-7 border">
                                  <AvatarFallback className="font-bold text-[10px] bg-zinc-800 text-white">
                                    {st.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-extrabold text-foreground">{st.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{st.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-muted-foreground">
                              {st.rollNumber}
                            </td>
                            <td className="py-3 px-4 font-semibold text-foreground">{st.className}</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              <p className="font-medium text-foreground">{st.guardianName}</p>
                              <p className="text-[10px]">{st.phone}</p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {st.submittedAssignments} / {st.totalAssignments}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {st.avgScore !== null ? (
                                <Badge
                                  className={cn(
                                    "text-[10px] font-extrabold text-white",
                                    st.avgScore >= 80
                                      ? "bg-emerald-600"
                                      : st.avgScore >= 60
                                      ? "bg-amber-600"
                                      : "bg-rose-600"
                                  )}
                                >
                                  {st.avgScore}%
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-mono">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link href="/teacher/messages">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs font-bold text-seneca-crimson hover:bg-seneca-crimson/10"
                                >
                                  Consultation
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Course Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-5 max-w-2xl">
                <div>
                  <h3 className="text-base font-bold font-heading text-foreground">
                    Broadcast Subject Advisory Notice
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Instantly broadcast study announcements or test notices to all students enrolled in{" "}
                    {activeBook.name}.
                  </p>
                </div>

                <form
                  onSubmit={handleSendNotification}
                  className="p-5 rounded-3xl border border-border bg-muted/20 space-y-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Target Class Section *</label>
                    <select
                      value={notifyClassId}
                      onChange={(e) => setNotifyClassId(e.target.value)}
                      className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                    >
                      <option value="">All Sections Taking {activeBook.name}</option>
                      {activeBook.classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Notice Subject / Title *</label>
                    <Input
                      type="text"
                      placeholder={`e.g. ${activeBook.name} Term Practical Exam Date`}
                      value={notifyTitle}
                      onChange={(e) => setNotifyTitle(e.target.value)}
                      required
                      className="h-10 rounded-xl bg-background text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Notice Content *</label>
                    <textarea
                      rows={4}
                      placeholder="Write announcement details for your students..."
                      value={notifyMessage}
                      onChange={(e) => setNotifyMessage(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl bg-background border border-border text-xs resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="glow"
                      disabled={sendingNotify}
                      className="rounded-xl text-xs font-bold gap-1.5 h-10 px-5"
                    >
                      <Megaphone className="h-3.5 w-3.5" />
                      <span>{sendingNotify ? "Dispatching..." : "Send Subject Broadcast"}</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 4. Interactive Assignment Checking & Grading Dialog */}
      <Dialog open={gradingModalOpen} onOpenChange={setGradingModalOpen}>
        <DialogContent className="max-w-xl w-[95vw] sm:w-full rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
          <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
            <DialogTitle className="text-lg font-bold font-heading flex items-center gap-2">
              <Award className="h-5 w-5 text-seneca-crimson" />
              <span>Assignment Checking &amp; Evaluation Desk</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Evaluate student submission, assign marks, and write constructive remarks.
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <form onSubmit={handleSaveGrade} className="flex-1 overflow-hidden flex flex-col min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* Student and Submission Info */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground">
                        {selectedSubmission.studentName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Roll: {selectedSubmission.rollNumber} • {selectedSubmission.className}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold bg-background">
                      Max Marks: {selectedSubmission.maxMarks}
                    </Badge>
                  </div>

                  {/* Submitted File Card (if submitted) */}
                  {selectedSubmission.attachmentUrl ? (
                    <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-seneca-crimson shrink-0" />
                        <span className="font-medium text-[11px] truncate">
                          {selectedSubmission.attachmentName || "Solution_File.pdf"}
                        </span>
                      </div>
                      <a
                        href={selectedSubmission.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-seneca-crimson hover:text-white transition-colors"
                        title="Inspect Solution Document"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 font-semibold">
                      ⚠️ No solution document was submitted by the student.
                    </div>
                  )}

                  {selectedSubmission.content && (
                    <div className="p-2 rounded-xl bg-background text-[11px] text-foreground/80">
                      <span className="font-bold">Student Notes:</span> {selectedSubmission.content}
                    </div>
                  )}
                </div>

                {/* Marks Input & Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      Assigned Marks / Number * (Max: {selectedSubmission.maxMarks})
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={selectedSubmission.maxMarks}
                      step="0.5"
                      placeholder={`0 - ${selectedSubmission.maxMarks}`}
                      value={gradingMarks}
                      onChange={(e) => setGradingMarks(e.target.value)}
                      required
                      className="h-10 rounded-xl bg-background text-sm font-extrabold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Evaluation Status *</label>
                    <select
                      value={gradingStatus}
                      onChange={(e) => setGradingStatus(e.target.value as any)}
                      className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                    >
                      <option value="graded">Graded &amp; Approved</option>
                      <option value="resubmitted">Needs Corrections / Resubmit</option>
                    </select>
                  </div>
                </div>

                {/* Feedback Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Evaluation Remarks / Feedback *</label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                    <span className="text-muted-foreground font-bold shrink-0">Presets:</span>
                    {FEEDBACK_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGradingFeedback(preset)}
                        className="px-2 py-0.5 rounded-lg bg-muted border border-border/80 text-foreground hover:border-seneca-crimson truncate max-w-[200px]"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Write constructive guidance and notes for the student..."
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background border border-border text-xs resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGradingModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="glow"
                  disabled={savingGrade}
                  className="rounded-xl text-xs font-bold gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{savingGrade ? "Publishing Grade..." : "Save & Publish Grade"}</span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. Create / Edit Assignment Modal */}
      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent className="max-w-xl w-[95vw] sm:w-full rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
          <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-seneca-crimson/25 via-seneca-crimson/10 to-transparent border border-seneca-crimson/30 text-seneca-crimson flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-black font-heading text-foreground">
                    {editingAssignmentId ? "Edit Coursework Assignment" : "Create New Assignment"}
                  </DialogTitle>
                  {activeBook && (
                    <Badge className="bg-seneca-crimson/15 text-seneca-crimson border border-seneca-crimson/30 text-[10px] font-bold px-2 py-0.5">
                      {activeBook.name}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  {editingAssignmentId
                    ? "Update problem description, total points, or submission due date."
                    : "Publish homework, problem sets, or report tasks with strict due date lockout."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveAssignment} className="flex-1 overflow-hidden flex flex-col min-h-0 text-xs">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="space-y-3 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Target Class Section *</span>
                  </label>
                  <select
                    value={asgClassId}
                    onChange={(e) => setAsgClassId(e.target.value)}
                    className="h-10 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-seneca-crimson/20 focus:border-seneca-crimson transition-all cursor-pointer"
                  >
                    {activeBook?.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Assignment Title *</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Chapter 4 Numerical Problem Set & Lab Questions"
                    value={asgTitle}
                    onChange={(e) => setAsgTitle(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-background border-border text-xs font-medium focus-visible:ring-2 focus-visible:ring-seneca-crimson/20 focus-visible:border-seneca-crimson"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    <span>Total Max Marks *</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={asgMarks}
                    onChange={(e) => setAsgMarks(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-background border-border text-xs font-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Due Date &amp; Time *</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-background border-border text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Instructions &amp; Problem Details *</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions, question references, submission requirements..."
                  value={asgDescription}
                  onChange={(e) => setAsgDescription(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-background border border-border text-xs resize-none focus:outline-none focus:ring-2 focus:ring-seneca-crimson/20 focus:border-seneca-crimson transition-all"
                />
              </div>

              {editingAssignmentId && (
                <div className="space-y-1 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
                  <label className="text-[11px] font-extrabold text-foreground">Assignment Status</label>
                  <select
                    value={asgStatus}
                    onChange={(e) => setAsgStatus(e.target.value as any)}
                    className="h-10 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-semibold"
                  >
                    <option value="published">Published (Active)</option>
                    <option value="closed">Closed (Submissions Locked)</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              )}
            </div>

            <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignmentModalOpen(false)}
                className="rounded-xl text-xs font-bold h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                disabled={savingAsg}
                className="rounded-xl text-xs font-bold gap-1.5 h-10 px-5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{savingAsg ? "Saving..." : editingAssignmentId ? "Update Assignment" : "Publish Assignment"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Create / Edit Quiz Modal & Detailed Question Builder */}
      <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
          <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500/25 via-indigo-500/10 to-transparent border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-black font-heading text-foreground">
                    {editingQuizId ? "Edit Quiz & Question Items" : "Create Diagnostic Assessment / Quiz"}
                  </DialogTitle>
                  {activeBook && (
                    <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5">
                      {activeBook.name}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Configure test duration, passing thresholds, lock deadlines, and author questions with instant feedback.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveQuiz} className="flex-1 overflow-hidden flex flex-col min-h-0 text-xs">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* General Quiz Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Target Class Section *</span>
                  </label>
                <select
                  value={quizClassId}
                  onChange={(e) => setQuizClassId(e.target.value)}
                  className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                >
                  {activeBook?.classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Quiz Title *</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Chapter 3 Comprehensive Diagnostic Assessment"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  required
                  className="h-10 rounded-xl bg-background text-xs font-medium focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 text-indigo-600" />
                    <span>Duration (Mins) *</span>
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max="180"
                    value={quizDuration}
                    onChange={(e) => setQuizDuration(e.target.value)}
                    required
                    className="h-9 rounded-xl bg-background text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    <Award className="h-3 w-3 text-amber-500" />
                    <span>Total Marks *</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={quizTotalMarks}
                    onChange={(e) => setQuizTotalMarks(e.target.value)}
                    required
                    className="h-9 rounded-xl bg-background text-xs font-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Passing Marks *</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={quizPassMarks}
                    onChange={(e) => setQuizPassMarks(e.target.value)}
                    required
                    className="h-9 rounded-xl bg-background text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Quiz Due Date &amp; Time (Lock Deadline)</span>
                </label>
                <Input
                  type="datetime-local"
                  value={quizEndDate}
                  onChange={(e) => setQuizEndDate(e.target.value)}
                  className="h-9 rounded-xl bg-background text-xs"
                />
              </div>
            </div>

            {/* Questions Authoring Section */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-foreground">
                      Authored Questions ({quizQuestions.length})
                    </h4>
                    <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 bg-indigo-500/10 border-indigo-500/30">
                      Calculated Marks: {quizQuestions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0)}
                    </Badge>
                    {quizQuestions.length > 0 &&
                      quizQuestions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0) !== Number(quizTotalMarks) && (
                        <button
                          type="button"
                          onClick={handleSyncTotalMarks}
                          className="text-[10px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Sync with Total Marks ({quizQuestions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0)})</span>
                        </button>
                      )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Define question prompts, answer choices, correct answers, and explanation guides.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    onClick={() => handleAddQuestion("multiple_choice")}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1 h-8 bg-background shadow-xs hover:border-indigo-600 hover:text-indigo-600"
                  >
                    <Plus className="h-3.5 w-3.5 text-indigo-600" />
                    <span>MCQ</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleAddQuestion("true_false")}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1 h-8 bg-background shadow-xs hover:border-indigo-600 hover:text-indigo-600"
                  >
                    <Plus className="h-3.5 w-3.5 text-indigo-600" />
                    <span>True / False</span>
                  </Button>
                </div>
              </div>

              {/* Empty State when no questions added yet */}
              {quizQuestions.length === 0 ? (
                <div className="p-8 rounded-3xl border-2 border-dashed border-border/80 bg-muted/20 text-center space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-foreground">No Questions Added Yet</h5>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto mt-0.5">
                      Start building this assessment by authoring your first question. Choose a format below to begin:
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <Button
                      type="button"
                      onClick={() => handleAddQuestion("multiple_choice")}
                      variant="glow"
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-1.5 h-9 px-4 shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Add Multiple Choice (MCQ)</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleAddQuestion("true_false")}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-1.5 h-9 px-4 bg-background hover:border-indigo-600 hover:text-indigo-600 shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5 text-indigo-600" />
                      <span>+ Add True / False Question</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-2xl border border-border/80 bg-card space-y-3 shadow-xs hover:border-border transition-all"
                    >
                      {/* Question Card Top Bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5">
                            Q{qIdx + 1}
                          </Badge>
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const newType = e.target.value as "multiple_choice" | "true_false";
                              handleUpdateQuestion(qIdx, "type", newType);
                              if (newType === "true_false") {
                                handleUpdateQuestion(qIdx, "options", ["True", "False"]);
                                handleUpdateQuestion(qIdx, "correctAnswer", 0);
                              } else {
                                handleUpdateQuestion(qIdx, "options", ["Option A", "Option B", "Option C", "Option D"]);
                              }
                            }}
                            className="h-7 px-2.5 rounded-lg bg-muted text-[11px] font-semibold border border-border"
                          >
                            <option value="multiple_choice">Multiple Choice (MCQ)</option>
                            <option value="true_false">True / False</option>
                          </select>
                        </div>

                        {/* Question Action Controls */}
                        <div className="flex items-center gap-1.5">
                          {/* Move Up Button */}
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(qIdx, "up")}
                            disabled={qIdx === 0}
                            className="p-1 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Question Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>

                          {/* Move Down Button */}
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(qIdx, "down")}
                            disabled={qIdx === quizQuestions.length - 1}
                            className="p-1 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Question Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>

                          {/* Duplicate Question Button */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateQuestion(qIdx)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                            title="Duplicate Question"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          {/* Marks Input */}
                          <div className="flex items-center gap-1 pl-1 border-l border-border/70">
                            <label className="text-[10px] text-muted-foreground font-bold">Marks:</label>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={q.marks}
                              onChange={(e) => handleUpdateQuestion(qIdx, "marks", Number(e.target.value) || 1)}
                              className="h-7 w-12 text-center rounded-lg text-xs font-bold"
                            />
                          </div>

                          {/* Delete Question Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors ml-1"
                            title="Remove Question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">Question Prompt *</label>
                        <Input
                          type="text"
                          placeholder="e.g. What is the SI unit of electric current?"
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(qIdx, "question", e.target.value)}
                          required
                          className="h-9 rounded-xl bg-background text-xs"
                        />
                      </div>

                      {/* Options & Correct Answer Selection */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                          <span>Options (Click radio to mark the correct answer):</span>
                          <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            <span>Correct Answer: {q.options[q.correctAnswer] || "None"}</span>
                          </span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctAnswer === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={cn(
                                  "p-2 rounded-xl border flex items-center gap-2 transition-all",
                                  isCorrect
                                    ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
                                    : "bg-muted/40 border-border"
                                )}
                              >
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => handleUpdateQuestion(qIdx, "correctAnswer", optIdx)}
                                  className="h-4 w-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                  disabled={q.type === "true_false"}
                                  className="h-7 rounded-lg text-xs bg-background flex-1"
                                />
                                {isCorrect && (
                                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                )}
                                {q.type === "multiple_choice" && q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                                    className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                                    title="Delete Option"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Add Option button for MCQ */}
                        {q.type === "multiple_choice" && q.options.length < 6 && (
                          <div className="pt-1">
                            <Button
                              type="button"
                              onClick={() => handleAddOption(qIdx)}
                              variant="outline"
                              size="sm"
                              className="h-6 px-2.5 rounded-lg text-[10px] font-bold gap-1 text-muted-foreground hover:text-indigo-600"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Another Option</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground font-semibold">
                          Explanation / Solution Remark (Shown to student on test submission):
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Fundamental SI unit derivation or textbook reference..."
                          value={q.explanation || ""}
                          onChange={(e) => handleUpdateQuestion(qIdx, "explanation", e.target.value)}
                          className="h-8 rounded-lg text-xs bg-muted/30"
                        />
                      </div>
                    </div>
                  ))}

                  {/* BOTTOM ACTION BAR: Add Next Question Button directly below the last added question */}
                  <div
                    ref={questionsEndRef}
                    className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-indigo-500/40 bg-indigo-500/[0.03] space-y-2 text-center transition-all hover:bg-indigo-500/[0.06]"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-foreground">
                      <Plus className="h-4 w-4 text-indigo-600" />
                      <span>Add Question #{quizQuestions.length + 1}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Add another question directly to this assessment without having to scroll back up
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <Button
                        type="button"
                        onClick={() => handleAddQuestion("multiple_choice")}
                        variant="glow"
                        size="sm"
                        className="rounded-xl text-xs font-bold gap-1.5 h-9 px-4 shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>+ Add Multiple Choice (MCQ)</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleAddQuestion("true_false")}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs font-bold gap-1.5 h-9 px-4 bg-background hover:border-indigo-600 hover:text-indigo-600 shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5 text-indigo-600" />
                        <span>+ Add True / False</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>

            <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuizModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                disabled={savingQuiz}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{savingQuiz ? "Saving Quiz..." : editingQuizId ? "Update Quiz" : "Publish Full Quiz"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. View Quiz Attempts & Results Modal */}
      <Dialog open={viewQuizModalOpen} onOpenChange={setViewQuizModalOpen}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
          <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
            <DialogTitle className="text-lg font-bold font-heading flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-600" />
              <span>Quiz Attempts &amp; Results: {selectedQuizDetails?.title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Detailed list of students who completed the diagnostic quiz and their achieved scores.
            </DialogDescription>
          </DialogHeader>

          {selectedQuizDetails && (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* Quiz Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Marks</p>
                    <p className="text-sm font-extrabold text-foreground">{selectedQuizDetails.totalMarks} Marks</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Passing Marks</p>
                    <p className="text-sm font-extrabold text-foreground">{selectedQuizDetails.passingMarks} Marks</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Attempts</p>
                    <p className="text-sm font-extrabold text-indigo-600">{selectedQuizDetails.attemptsCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                    <p className="text-sm font-extrabold text-foreground">
                      {selectedQuizDetails.isExpired ? "Expired / Locked" : "Active"}
                    </p>
                  </div>
                </div>

                {/* Student Attempts Table */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-foreground">
                    Completed Quiz Submissions ({selectedQuizDetails.attempts?.length || 0})
                  </h4>

                  {(!selectedQuizDetails.attempts || selectedQuizDetails.attempts.length === 0) ? (
                    <div className="p-8 rounded-2xl bg-muted/30 border border-dashed border-border text-center text-muted-foreground">
                      No student attempts recorded for this quiz yet.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/60 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                          <tr>
                            <th className="py-2.5 px-3">Student</th>
                            <th className="py-2.5 px-3">Roll Number</th>
                            <th className="py-2.5 px-3 text-center">Score</th>
                            <th className="py-2.5 px-3 text-center">Percentage</th>
                            <th className="py-2.5 px-3 text-center">Result</th>
                            <th className="py-2.5 px-3 text-right">Attempt Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {selectedQuizDetails.attempts.map((att) => (
                            <tr key={att.id} className="hover:bg-muted/30">
                              <td className="py-2.5 px-3 font-bold text-foreground">{att.studentName}</td>
                              <td className="py-2.5 px-3 font-mono text-muted-foreground">{att.rollNumber}</td>
                              <td className="py-2.5 px-3 text-center font-extrabold text-foreground">
                                {att.score} / {att.totalMarks}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold">{att.percentage}%</td>
                              <td className="py-2.5 px-3 text-center">
                                <Badge
                                  className={cn(
                                    "text-[10px] font-extrabold text-white",
                                    att.isPassed ? "bg-emerald-600" : "bg-rose-600"
                                  )}
                                >
                                  {att.isPassed ? "Passed" : "Failed"}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-3 text-right text-muted-foreground text-[11px]">
                                {att.formattedSubmittedAt}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Unattempted Students List */}
                {selectedQuizDetails.unattemptedStudents && selectedQuizDetails.unattemptedStudents.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-extrabold text-xs text-muted-foreground">
                      Unattempted Students ({selectedQuizDetails.unattemptedStudents.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedQuizDetails.unattemptedStudents.map((st) => (
                        <span
                          key={st.studentId}
                          className="px-2.5 py-1 rounded-xl bg-muted border border-border text-[11px] font-medium text-foreground flex items-center gap-1.5"
                        >
                          <span>{st.name}</span>
                          <span className="text-[10px] text-muted-foreground">({st.rollNumber})</span>
                          {selectedQuizDetails.isExpired && (
                            <span className="text-[9px] font-bold text-rose-600">• 0 Marks (Expired)</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewQuizModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Close Desk
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 8. Upload / Edit Material Modal */}
      <Dialog open={materialModalOpen} onOpenChange={setMaterialModalOpen}>
        <DialogContent className="max-w-xl w-[95vw] sm:w-full rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
          <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500/25 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-black font-heading text-foreground">
                    {editingMaterialId ? "Edit Course Material" : "Upload Course Material"}
                  </DialogTitle>
                  {activeBook && (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5">
                      {activeBook.name}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  {editingMaterialId
                    ? "Update material details, category classification, or document attachment."
                    : "Publish lecture slides, chapter notes, formula sheets, or exam guides for enrolled students."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveMaterial} className="flex-1 overflow-hidden flex flex-col min-h-0 text-xs">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Section 1: Academic Class & Title */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
                    <span>Target Class Section *</span>
                  </label>
                  <select
                    value={matClassId}
                    onChange={(e) => setMatClassId(e.target.value)}
                    className="h-10 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                  >
                    {activeBook?.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                    <span>Material Document Title *</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Chapter 5 Optics Ray Diagrams & Summary Notes"
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-background border-border text-xs font-medium focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
                  />
                </div>
              </div>

              {/* Section 2: Interactive Category Chips */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-amber-600" />
                    <span>Material Category *</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-600">Selected: {matCategory}</span>
                </div>

                {/* Quick Category Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: "Lecture Notes", label: "Lecture Notes", icon: "📖" },
                    { id: "Textbook Chapter", label: "Textbook Chapter", icon: "📚" },
                    { id: "Formula Sheet", label: "Formula Sheet", icon: "📐" },
                    { id: "Lab Manual", label: "Lab Manual", icon: "🧪" },
                    { id: "Past Papers", label: "Past Papers", icon: "📝" },
                    { id: "Revision Guide", label: "Revision Guide", icon: "📑" },
                  ].map((cat) => {
                    const isSelected = matCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setMatCategory(cat.id)}
                        className={cn(
                          "py-1.5 px-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all text-left",
                          isSelected
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/50 shadow-xs ring-1 ring-amber-500/30"
                            : "bg-background/80 border-border text-muted-foreground hover:text-foreground hover:bg-background"
                        )}
                      >
                        <span className="text-xs">{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1 pt-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span>Custom Document Label / Display Filename (Optional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Optics_Full_Revision_Notes.pdf"
                    value={matFileName}
                    onChange={(e) => setMatFileName(e.target.value)}
                    className="h-9 rounded-xl bg-background border-border text-xs"
                  />
                </div>
              </div>

              {/* Section 3: Professional File Upload & Dropzone */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-amber-600" />
                    <span>{editingMaterialId ? "File Attachment (Click or drop to replace)" : "Attach Document File"}</span>
                  </span>
                  {selectedFileObject && (
                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      className="text-[10px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 hover:underline"
                    >
                      <X className="h-3 w-3" />
                      <span>Clear File</span>
                    </button>
                  )}
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDropFile}
                  className={cn(
                    "p-5 rounded-2xl border-2 border-dashed cursor-pointer text-center space-y-2.5 transition-all relative overflow-hidden group",
                    isDraggingFile
                      ? "border-amber-500 bg-amber-500/15 ring-4 ring-amber-500/20 scale-[0.99]"
                      : selectedFileObject
                      ? "border-emerald-500/50 bg-emerald-500/[0.04] shadow-xs"
                      : "border-border/80 hover:border-amber-500/60 bg-gradient-to-b from-muted/30 via-background to-muted/20 hover:bg-muted/40"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                  />

                  {selectedFileObject ? (
                    <div className="space-y-2">
                      <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-xs">
                        <FileCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-foreground truncate max-w-sm mx-auto">
                          {selectedFileObject.name}
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1 text-[10px]">
                          <span className="font-bold text-muted-foreground">
                            {(selectedFileObject.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <span>•</span>
                          <Badge className="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5">
                            ✓ Ready to Upload
                          </Badge>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Click to select a different file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-600 mx-auto flex items-center justify-center border border-amber-500/20 transition-colors shadow-xs">
                        <FileUp className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-foreground">
                          {isDraggingFile ? "Drop document to upload" : "Drag and drop your file here, or click to browse"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Supports PDF, Word (.docx), PowerPoint (.pptx), Text, and Zip (Max 50MB)
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 pt-1">
                        {["PDF", "DOCX", "PPTX", "ZIP"].map((fmt) => (
                          <span
                            key={fmt}
                            className="px-2 py-0.5 rounded-lg bg-muted border border-border text-[9px] font-bold text-muted-foreground"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                  <span>Description &amp; Key Learning Takeaways</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of lecture notes, core chapter derivations, or study guidelines..."
                  value={matDescription}
                  onChange={(e) => setMatDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-background border border-border text-xs resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMaterialModalOpen(false)}
                className="rounded-xl text-xs font-bold h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                disabled={savingMat}
                className="rounded-xl text-xs font-bold gap-1.5 h-10 px-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-md shadow-amber-500/20"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{savingMat ? "Saving Material..." : editingMaterialId ? "Update Material" : "Publish Material"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unified Deletion Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={
          deleteConfirm?.type === "assignment"
            ? "Delete Assignment?"
            : deleteConfirm?.type === "quiz"
            ? "Delete Quiz?"
            : "Remove Course Material?"
        }
        description={
          deleteConfirm?.type === "assignment"
            ? `Are you sure you want to permanently delete assignment "${deleteConfirm?.title}" and all its student submissions?`
            : deleteConfirm?.type === "quiz"
            ? `Are you sure you want to permanently delete quiz "${deleteConfirm?.title}" and all its recorded student attempts?`
            : `Are you sure you want to remove "${deleteConfirm?.title}" from this course?`
        }
        confirmText={
          deleteConfirm?.type === "material"
            ? "Remove Material"
            : `Delete ${deleteConfirm?.type === "quiz" ? "Quiz" : "Assignment"}`
        }
        variant="destructive"
        icon="trash"
        onConfirm={handleExecuteDelete}
      />
    </div>
  );
}
