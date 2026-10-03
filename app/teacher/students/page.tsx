"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  UserCheck,
  Award,
  AlertCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw,
  X,
  Eye,
  FileText,
  MessageSquare,
  ChevronRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  HelpCircle,
  FolderOpen,
  Send,
  ExternalLink,
  ShieldCheck,
  User,
  Check,
  Copy,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  Info,
  Calendar,
  Layers,
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

// Types
interface EnrolledBookDetail {
  bookId: string;
  bookName: string;
  bookCode: string;
  submittedAssignments: number;
  totalAssignments: number;
  avgScore: number | null;
  attemptedQuizzes: number;
  totalQuizzes: number;
  avgQuizScore: number | null;
}

interface StudentAssignmentRecord {
  assignmentId: string;
  title: string;
  bookName: string;
  bookCode: string;
  totalMarks: number;
  dueDate: string;
  formattedDueDate: string;
  status: "graded" | "submitted" | "late" | "unsubmitted";
  obtainedMarks?: number;
  feedback?: string;
  submittedAt?: string;
  formattedSubmittedAt?: string;
}

interface StudentQuizRecord {
  quizId: string;
  title: string;
  bookName: string;
  bookCode: string;
  totalMarks: number;
  passingMarks: number;
  status: "attempted" | "unattempted";
  score?: number;
  percentage?: number;
  isPassed?: boolean;
  submittedAt?: string;
  formattedSubmittedAt?: string;
}

interface UnifiedStudent {
  id: string;
  studentId: string;
  userId?: string;
  name: string;
  rollNumber: string;
  admissionNumber: string;
  className: string;
  section: string;
  gradeLevel?: number;
  stream: string;
  gender: string;
  attendanceRate: number;
  overallScore: number | null;
  academicStanding: "A*" | "A" | "B" | "C" | "Needs Attention";
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  guardianType: string;
  emergencyContact: string;
  address: string;
  bloodGroup: string;
  status: "active" | "inactive" | "probation";
  avatarUrl?: string;
  enrolledBooks: EnrolledBookDetail[];
  assignments: StudentAssignmentRecord[];
  quizzes: StudentQuizRecord[];
  totalAssignmentsSubmitted: number;
  totalAssignmentsCount: number;
  totalQuizzesAttempted: number;
  totalQuizzesCount: number;
}

interface TeachingBook {
  id: string;
  name: string;
  code: string;
  department: string;
  description: string;
  classes: Array<{ id: string; name: string }>;
  enrolledStudentsCount: number;
  students: any[];
  assignments: any[];
  quizzes: any[];
}

export default function TeacherStudentsPage() {
  const [books, setBooks] = useState<TeachingBook[]>([]);
  const [students, setStudents] = useState<UnifiedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStanding, setSelectedStanding] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "roll" | "score-desc" | "score-asc" | "attendance-desc">("name");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [activeDossier, setActiveDossier] = useState<UnifiedStudent | null>(null);
  const [quickNote, setQuickNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});

  // Fetch both teacher student roster and teaching books
  const fetchTeacherData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [studentsRes, booksRes] = await Promise.all([
        fetch("/api/teacher/students", { cache: "no-store" }),
        fetch("/api/teacher/books", { cache: "no-store" }),
      ]);

      const [studentsData, booksData] = await Promise.all([
        studentsRes.json().catch(() => ({ success: false })),
        booksRes.json().catch(() => ({ success: false })),
      ]);

      let fetchedBooks: TeachingBook[] = [];
      if (booksData?.success && Array.isArray(booksData.data?.books)) {
        fetchedBooks = booksData.data.books;
        setBooks(fetchedBooks);
      }

      // Map book academic records by studentId
      const bookStudentMap = new Map<
        string,
        {
          enrolledBooks: EnrolledBookDetail[];
          assignments: StudentAssignmentRecord[];
          quizzes: StudentQuizRecord[];
          totalAssignmentsSubmitted: number;
          totalAssignmentsCount: number;
          totalQuizzesAttempted: number;
          totalQuizzesCount: number;
        }
      >();

      fetchedBooks.forEach((book) => {
        (book.students || []).forEach((st: any) => {
          const stId = st.studentId || st.id;
          if (!stId) return;

          let entry = bookStudentMap.get(stId);
          if (!entry) {
            entry = {
              enrolledBooks: [],
              assignments: [],
              quizzes: [],
              totalAssignmentsSubmitted: 0,
              totalAssignmentsCount: 0,
              totalQuizzesAttempted: 0,
              totalQuizzesCount: 0,
            };
            bookStudentMap.set(stId, entry);
          }

          if (!entry.enrolledBooks.some((b) => b.bookId === book.id)) {
            entry.enrolledBooks.push({
              bookId: book.id,
              bookName: book.name,
              bookCode: book.code,
              submittedAssignments: st.submittedAssignments || 0,
              totalAssignments: st.totalAssignments || 0,
              avgScore: st.avgScore,
              attemptedQuizzes: st.attemptedQuizzes || 0,
              totalQuizzes: st.totalQuizzes || 0,
              avgQuizScore: st.avgQuizScore,
            });
            entry.totalAssignmentsSubmitted += st.submittedAssignments || 0;
            entry.totalAssignmentsCount += st.totalAssignments || 0;
            entry.totalQuizzesAttempted += st.attemptedQuizzes || 0;
            entry.totalQuizzesCount += st.totalQuizzes || 0;
          }
        });

        // Map Assignments for each student
        (book.assignments || []).forEach((asgn: any) => {
          (asgn.submissions || []).forEach((sub: any) => {
            const subStId = sub.studentId;
            const entry = bookStudentMap.get(subStId);
            if (entry && !entry.assignments.some((a) => a.assignmentId === asgn.id)) {
              entry.assignments.push({
                assignmentId: asgn.id,
                title: asgn.title,
                bookName: book.name,
                bookCode: book.code,
                totalMarks: asgn.totalMarks,
                dueDate: asgn.dueDate,
                formattedDueDate: asgn.formattedDueDate,
                status: sub.status === "graded" ? "graded" : "submitted",
                obtainedMarks: sub.obtainedMarks,
                feedback: sub.feedback,
                submittedAt: sub.submittedAt,
                formattedSubmittedAt: sub.formattedSubmittedAt,
              });
            }
          });

          (asgn.unsubmittedStudents || []).forEach((unsub: any) => {
            const unsubStId = unsub.studentId;
            const entry = bookStudentMap.get(unsubStId);
            if (entry && !entry.assignments.some((a) => a.assignmentId === asgn.id)) {
              entry.assignments.push({
                assignmentId: asgn.id,
                title: asgn.title,
                bookName: book.name,
                bookCode: book.code,
                totalMarks: asgn.totalMarks,
                dueDate: asgn.dueDate,
                formattedDueDate: asgn.formattedDueDate,
                status: "unsubmitted",
                obtainedMarks: 0,
              });
            }
          });
        });

        // Map Quizzes for each student
        (book.quizzes || []).forEach((qz: any) => {
          (qz.attempts || []).forEach((att: any) => {
            const attStId = att.studentId;
            const entry = bookStudentMap.get(attStId);
            if (entry && !entry.quizzes.some((q) => q.quizId === qz.id)) {
              entry.quizzes.push({
                quizId: qz.id,
                title: qz.title,
                bookName: book.name,
                bookCode: book.code,
                totalMarks: qz.totalMarks,
                passingMarks: qz.passingMarks,
                status: "attempted",
                score: att.score,
                percentage: att.percentage,
                isPassed: att.isPassed,
                submittedAt: att.submittedAt,
                formattedSubmittedAt: att.formattedSubmittedAt,
              });
            }
          });

          (qz.unattemptedStudents || []).forEach((unatt: any) => {
            const unattStId = unatt.studentId;
            const entry = bookStudentMap.get(unattStId);
            if (entry && !entry.quizzes.some((q) => q.quizId === qz.id)) {
              entry.quizzes.push({
                quizId: qz.id,
                title: qz.title,
                bookName: book.name,
                bookCode: book.code,
                totalMarks: qz.totalMarks,
                passingMarks: qz.passingMarks,
                status: "unattempted",
                score: 0,
                percentage: 0,
                isPassed: false,
              });
            }
          });
        });
      });

      // 1. If /api/teacher/students returned real students (including Nursery)
      if (studentsData?.success && Array.isArray(studentsData.data?.students)) {
        const rawList: any[] = studentsData.data.students;

        const unifiedList: UnifiedStudent[] = rawList.map((st) => {
          const bInfo = bookStudentMap.get(st.id) || bookStudentMap.get(st.studentId);

          return {
            id: st.id,
            studentId: st.studentId || st.id,
            userId: st.userId,
            name: st.name || "Student",
            rollNumber: st.rollNumber || "ROL-001",
            admissionNumber: st.admissionNumber || "SEN-2026",
            className: st.className || "Class",
            section: st.section || "A",
            gradeLevel: st.gradeLevel,
            stream: st.stream || "General",
            gender: st.gender || "Male",
            attendanceRate: st.attendanceRate ?? 95,
            overallScore: st.overallScore ?? (bInfo?.enrolledBooks?.length ? 85 : null),
            academicStanding: st.academicStanding || "A",
            parentName: st.parentName || "Guardian",
            parentPhone: st.parentPhone || "+92 300 0000000",
            parentEmail: st.parentEmail || "",
            guardianType: st.guardianType || "Father",
            emergencyContact: st.emergencyContact || st.parentPhone || "+92 300 0000000",
            address: st.address || "Karachi, Pakistan",
            bloodGroup: st.bloodGroup || "O+",
            status: st.status || "active",
            avatarUrl: st.avatarUrl,
            enrolledBooks: bInfo?.enrolledBooks || [],
            assignments: bInfo?.assignments || [],
            quizzes: bInfo?.quizzes || [],
            totalAssignmentsSubmitted: bInfo?.totalAssignmentsSubmitted || st.totalAssignmentsSubmitted || 0,
            totalAssignmentsCount: bInfo?.totalAssignmentsCount || st.totalAssignmentsCount || 0,
            totalQuizzesAttempted: bInfo?.totalQuizzesAttempted || st.totalQuizzesAttempted || 0,
            totalQuizzesCount: bInfo?.totalQuizzesCount || st.totalQuizzesCount || 0,
          };
        });

        setStudents(unifiedList);
      } else if (fetchedBooks.length > 0) {
        // Fallback: assemble from books if student API returned empty
        const fallbackMap = new Map<string, UnifiedStudent>();
        fetchedBooks.forEach((book) => {
          (book.students || []).forEach((st: any) => {
            const stId = st.studentId || st.id;
            if (!stId || fallbackMap.has(stId)) return;
            fallbackMap.set(stId, {
              id: stId,
              studentId: stId,
              userId: st.userId,
              name: st.name || "Student",
              rollNumber: st.rollNumber || "ROLL-001",
              admissionNumber: st.admissionNumber || "SEN-2026",
              className: st.className || "Class",
              section: st.section || "A",
              gradeLevel: st.gradeLevel,
              stream: st.stream || "General",
              gender: st.gender || "Not specified",
              attendanceRate: st.attendanceRate || 95,
              overallScore: st.avgScore,
              academicStanding: "A",
              parentName: st.guardianName || "Guardian",
              parentPhone: st.guardianPhone || "+92 300 0000000",
              parentEmail: st.guardianEmail || "",
              guardianType: st.guardianType || "Father",
              emergencyContact: st.emergencyContact || "+92 300 0000000",
              address: st.address || "Karachi, Pakistan",
              bloodGroup: st.bloodGroup || "O+",
              status: st.status || "active",
              avatarUrl: st.avatarUrl,
              enrolledBooks: [],
              assignments: [],
              quizzes: [],
              totalAssignmentsSubmitted: 0,
              totalAssignmentsCount: 0,
              totalQuizzesAttempted: 0,
              totalQuizzesCount: 0,
            });
          });
        });
        setStudents(Array.from(fallbackMap.values()));
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Failed to load teacher students data:", err);
      toast.error("Unable to load latest students list. Please refresh the page.");
      setStudents([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  // Compute unique classes available across both student roster (Nursery, etc.) and books
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, string>();
    // 1. Add all classes from students roster
    students.forEach((s) => {
      if (s.className) {
        const full = `${s.className} (${s.section || "A"})`;
        classMap.set(full, full);
      }
    });
    // 2. Add classes from books
    books.forEach((b) => {
      (b.classes || []).forEach((c) => {
        if (!classMap.has(c.name)) {
          classMap.set(c.name, c.name);
        }
      });
    });
    return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
  }, [books, students]);

  // Filtering Logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // 1. Search Query
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.admissionNumber.toLowerCase().includes(q) ||
          s.parentName.toLowerCase().includes(q) ||
          s.parentPhone.includes(q) ||
          s.parentEmail.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q) ||
          s.enrolledBooks.some(
            (b) => b.bookName.toLowerCase().includes(q) || b.bookCode.toLowerCase().includes(q)
          );

        // 2. Book Filter
        const matchesBook =
          selectedBook === "all" || s.enrolledBooks.some((b) => b.bookId === selectedBook);

        // 3. Class Filter (matches exact class or section or name)
        const sClassFull = `${s.className} (${s.section || "A"})`.toLowerCase();
        const selClassLower = selectedClass.toLowerCase();
        const matchesClass =
          selectedClass === "all" ||
          s.className.toLowerCase() === selClassLower ||
          sClassFull === selClassLower ||
          s.className.toLowerCase().includes(selClassLower) ||
          selClassLower.includes(s.className.toLowerCase());

        // 4. Academic Standing Filter
        const matchesStanding =
          selectedStanding === "all" ||
          (selectedStanding === "A*" && s.academicStanding === "A*") ||
          (selectedStanding === "A" && (s.academicStanding === "A*" || s.academicStanding === "A")) ||
          (selectedStanding === "B" && s.academicStanding === "B") ||
          (selectedStanding === "risk" &&
            (s.academicStanding === "Needs Attention" || s.attendanceRate < 80 || s.status === "probation"));

        return matchesSearch && matchesBook && matchesClass && matchesStanding;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "roll") return a.rollNumber.localeCompare(b.rollNumber);
        if (sortBy === "score-desc") return (b.overallScore || 0) - (a.overallScore || 0);
        if (sortBy === "score-asc") return (a.overallScore || 0) - (b.overallScore || 0);
        if (sortBy === "attendance-desc") return b.attendanceRate - a.attendanceRate;
        return 0;
      });
  }, [students, searchQuery, selectedBook, selectedClass, selectedStanding, sortBy]);

  // Executive Metric Calculations
  const stats = useMemo(() => {
    const total = students.length;
    const avgAttendance =
      total > 0 ? Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / total) : 0;
    const distinctionCount = students.filter((s) => s.academicStanding === "A*").length;
    const meritCount = students.filter((s) => s.academicStanding === "A").length;
    const atRiskCount = students.filter(
      (s) => s.academicStanding === "Needs Attention" || s.attendanceRate < 80 || s.status === "probation"
    ).length;
    const totalBooks = books.length;

    return {
      total,
      avgAttendance,
      distinctionCount,
      meritCount,
      atRiskCount,
      totalBooks,
    };
  }, [students, books]);

  // Export Full Roll Sheet to CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      return toast.info("No students to export matching current filter criteria.");
    }
    const headers =
      "Roll Number,Admission No,Student Name,Class,Section,Enrolled Teaching Books,Attendance %,Average Score %,Academic Standing,Guardian Name,Guardian Phone,Guardian Email\n";

    const rows = filteredStudents
      .map((s) => {
        const booksStr = s.enrolledBooks.map((b) => `${b.bookName} (${b.bookCode})`).join(" | ");
        const scoreStr = s.overallScore !== null ? `${s.overallScore}%` : "N/A";
        return `"${s.rollNumber}","${s.admissionNumber}","${s.name}","${s.className}","${s.section}","${booksStr}","${s.attendanceRate}%","${scoreStr}","${s.academicStanding}","${s.parentName}","${s.parentPhone}","${s.parentEmail}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Seneca_Teaching_Roster_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredStudents.length} student records to CSV!`);
  };

  // Copy phone number / contact
  const handleCopyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Save teacher note on student dossier
  const handleSaveObservation = (studentId: string) => {
    if (!quickNote.trim()) return toast.info("Please write an observation note first.");
    setSavedNotes((prev) => ({
      ...prev,
      [studentId]: quickNote.trim(),
    }));
    setQuickNote("");
    toast.success("Academic observation note saved to student dossier!");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Header & Hero Metric Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-5 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <GraduationCap className="h-3 w-3" />
                <span>My Teaching Students & Class Roster</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Academic Session 2026–2027</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              My Students & <span className="text-seneca-amber">Class Roster</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Access every student studying your curriculum books. Filter instantly by teaching book,
              grade level, and academic standing to track coursework performance and parent communications.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm flex-1 sm:flex-initial justify-center"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Export Roster CSV</span>
            </Button>
            <Button
              asChild
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 flex-1 sm:flex-initial justify-center"
            >
              <Link href="/teacher/attendance">
                <CalendarCheck className="h-3.5 w-3.5" />
                <span>Take Attendance</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Executive Metric Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Students */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-crimson/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {stats.total}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {books.length > 0
                ? `Across ${books.length} Teaching Book${books.length > 1 ? "s" : ""}`
                : `Across ${uniqueClasses.length || 1} Class Section${(uniqueClasses.length || 1) > 1 ? "s" : ""}`}
            </span>
          </div>
        </Card>

        {/* Avg Attendance */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Avg. Attendance
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-600">
              {stats.avgAttendance}%
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-3 w-3" />
              <span>Above Target (90%)</span>
            </span>
          </div>
        </Card>

        {/* High Achievers */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-amber/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Distinction (A*)
            </span>
            <div className="p-2 rounded-xl bg-seneca-amber/15 text-seneca-amber">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {stats.distinctionCount}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Score ≥ 90% in Coursework
            </span>
          </div>
        </Card>

        {/* Merit Achievers */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Merit Standing (A)
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {stats.meritCount}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Score 80%–89% Range
            </span>
          </div>
        </Card>

        {/* Needs Attention / Risk */}
        <Card className="col-span-2 lg:col-span-1 border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Needs Support
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-rose-600">
              {stats.atRiskCount}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Att &lt; 80% or Low Score
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Comprehensive Multi-Filter Bar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
        {/* Row 1: Search & Live View Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search student name, roll number, admission ID, teaching book, parent phone..."
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
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid Card View"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Dense Table View"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={() => fetchTeacherData()}
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0"
              title="Refresh Student Roster"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Row 2: Select Dropdowns for Book, Grade, Standing, and Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Filter 1: Teaching Book */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-seneca-crimson" />
              <span>Teaching Book / Subject</span>
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-seneca-crimson"
            >
              <option value="all">All Teaching Books ({books.length})</option>
              {books.map((b) => (
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
              <option value="all">All Grades & Sections</option>
              {uniqueClasses.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Academic Standing */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Award className="h-3 w-3 text-emerald-600" />
              <span>Academic Standing</span>
            </label>
            <select
              value={selectedStanding}
              onChange={(e) => setSelectedStanding(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Academic Standings</option>
              <option value="A*">Distinction (A* - 90%+)</option>
              <option value="A">High Achievers (A* & A)</option>
              <option value="B">Satisfactory Standing (B)</option>
              <option value="risk">Needs Attention / At-Risk</option>
            </select>
          </div>

          {/* Sort By */}
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
              <option value="name">Name (A → Z)</option>
              <option value="roll">Roll Number (Ascending)</option>
              <option value="score-desc">Highest Average Score</option>
              <option value="score-asc">Lowest Average Score</option>
              <option value="attendance-desc">Highest Attendance %</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {(selectedBook !== "all" || selectedClass !== "all" || selectedStanding !== "all" || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs">
            <span className="text-[11px] font-bold text-muted-foreground">Active Filters:</span>
            {selectedBook !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Book: {books.find((b) => b.id === selectedBook)?.name || selectedBook}</span>
                <button onClick={() => setSelectedBook("all")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedClass !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Class: {selectedClass}</span>
                <button onClick={() => setSelectedClass("all")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedStanding !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Standing: {selectedStanding}</span>
                <button onClick={() => setSelectedStanding("all")} className="p-0.5 hover:text-foreground">
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
                setSelectedStanding("all");
                setSearchQuery("");
              }}
              className="text-[11px] font-bold text-seneca-crimson hover:underline ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </Card>

      {/* 4. Student Roster Display (Grid vs Table) */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
          <p className="text-xs font-bold text-muted-foreground">Loading Teaching Classroom Roster...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-14 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-heading text-foreground">No Students Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              No students enrolled in your teaching books match the selected filter criteria. Try
              adjusting your search query, book selection, or grade filter.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedBook("all");
              setSelectedClass("all");
              setSelectedStanding("all");
              setSearchQuery("");
            }}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold"
          >
            Clear All Filters
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredStudents.map((s) => (
            <Card
              key={s.id}
              onClick={() => setActiveDossier(s)}
              className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 hover:border-seneca-crimson/40 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle top indicator bar based on academic standing */}
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-1",
                  s.academicStanding === "A*"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : s.academicStanding === "A"
                    ? "bg-gradient-to-r from-seneca-amber to-amber-300"
                    : s.academicStanding === "Needs Attention"
                    ? "bg-gradient-to-r from-rose-500 to-red-400"
                    : "bg-gradient-to-r from-blue-500 to-indigo-400"
                )}
              />

              <div className="space-y-3.5">
                {/* Header: Avatar, Name, Roll & Standing Badge */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-seneca-amber/40 group-hover:border-seneca-amber transition-colors shadow-sm">
                      <AvatarImage src={s.avatarUrl} alt={s.name} />
                      <AvatarFallback className="bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white font-bold text-sm">
                        {s.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber transition-colors leading-tight">
                        {s.name}
                      </h4>
                      <p className="text-[11px] font-mono text-muted-foreground pt-0.5">
                        {s.rollNumber} • <span className="font-sans font-semibold">{s.className} (Sec {s.section})</span>
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "font-bold text-xs px-2.5 py-0.5 shrink-0 rounded-full",
                      s.academicStanding === "A*"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : s.academicStanding === "A"
                        ? "bg-seneca-amber/15 text-seneca-amber-dark border-seneca-amber/30"
                        : s.academicStanding === "Needs Attention"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                    )}
                  >
                    Grade {s.academicStanding}
                  </Badge>
                </div>

                {/* Enrolled Teaching Books Chips */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {s.enrolledBooks.length > 0
                      ? `Studying Your Books (${s.enrolledBooks.length}):`
                      : "Class Section:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {s.enrolledBooks.length > 0 ? (
                      s.enrolledBooks.map((b) => (
                        <span
                          key={b.bookId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber-light font-bold text-[10px] border border-seneca-crimson/20"
                        >
                          <BookOpen className="h-2.5 w-2.5" />
                          <span>{b.bookName}</span>
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-seneca-amber/10 text-seneca-amber-dark dark:text-seneca-amber-light font-bold text-[10px] border border-seneca-amber/20">
                        <GraduationCap className="h-2.5 w-2.5" />
                        <span>{s.className} ({s.section})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Performance & Attendance Details Box */}
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 space-y-2 text-xs">
                  {/* Attendance Meter */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Attendance:</span>
                    </span>
                    <span
                      className={cn(
                        "font-extrabold",
                        s.attendanceRate >= 90
                          ? "text-emerald-600"
                          : s.attendanceRate >= 80
                          ? "text-seneca-amber"
                          : "text-rose-600"
                      )}
                    >
                      {s.attendanceRate}%
                    </span>
                  </div>

                  {/* Coursework Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-seneca-amber" />
                      <span>Average Score:</span>
                    </span>
                    <span className="font-extrabold text-foreground">
                      {s.overallScore !== null ? `${s.overallScore}%` : "Not Graded"}
                    </span>
                  </div>

                  {/* Submissions Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      <span>Assignments Completed:</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {s.totalAssignmentsSubmitted} / {s.totalAssignmentsCount}
                    </span>
                  </div>

                  {/* Parent Name */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Parent / Guardian:</span>
                    <span className="font-semibold text-foreground truncate max-w-[140px]">
                      {s.parentName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Quick Actions */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between mt-3 text-xs">
                <span className="text-[11px] font-bold text-seneca-crimson group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>View Student Dossier</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{s.admissionNumber}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Roll No.</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Class / Section</th>
                  <th className="p-3.5">Teaching Books</th>
                  <th className="p-3.5 text-center">Attendance</th>
                  <th className="p-3.5 text-center">Avg. Score</th>
                  <th className="p-3.5 text-center">Standing</th>
                  <th className="p-3.5">Parent / Contact</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setActiveDossier(s)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 pl-5 font-mono font-bold text-foreground">{s.rollNumber}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-seneca-amber/30">
                          <AvatarImage src={s.avatarUrl} alt={s.name} />
                          <AvatarFallback className="bg-seneca-crimson text-white font-bold text-xs">
                            {s.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-bold text-foreground group-hover:text-seneca-crimson transition-colors block">
                            {s.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {s.admissionNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-foreground">{s.className}</span>
                      <span className="text-[10px] text-muted-foreground block">Section {s.section}</span>
                    </td>
                    <td className="p-3.5 max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {s.enrolledBooks.length > 0 ? (
                          s.enrolledBooks.map((b) => (
                            <span
                              key={b.bookId}
                              className="inline-block px-1.5 py-0.5 rounded bg-seneca-crimson/10 text-seneca-crimson font-bold text-[10px]"
                            >
                              {b.bookName}
                            </span>
                          ))
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-seneca-amber/10 text-seneca-amber-dark font-bold text-[10px]">
                            {s.className} ({s.section})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={cn(
                          "font-extrabold px-2 py-0.5 rounded-full text-xs",
                          s.attendanceRate >= 90
                            ? "bg-emerald-500/10 text-emerald-600"
                            : s.attendanceRate >= 80
                            ? "bg-seneca-amber/15 text-seneca-amber"
                            : "bg-rose-500/10 text-rose-600"
                        )}
                      >
                        {s.attendanceRate}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-extrabold text-foreground">
                      {s.overallScore !== null ? `${s.overallScore}%` : "—"}
                    </td>
                    <td className="p-3.5 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-bold text-xs px-2 py-0.5",
                          s.academicStanding === "A*"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : s.academicStanding === "A"
                            ? "bg-seneca-amber/15 text-seneca-amber border-seneca-amber/30"
                            : s.academicStanding === "Needs Attention"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        )}
                      >
                        {s.academicStanding}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-foreground block truncate max-w-[130px]">
                        {s.parentName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{s.parentPhone}</span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDossier(s);
                        }}
                        className="rounded-xl text-xs font-bold gap-1 h-8"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Dossier</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Comprehensive Interactive Student Dossier Dialog Modal */}
      {activeDossier && (
        <Dialog open={!!activeDossier} onOpenChange={() => setActiveDossier(null)}>
          <DialogContent
            className="max-w-3xl w-[95vw] sm:w-full max-h-[85vh] sm:max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-3xl shadow-2xl bg-card border border-border/80"
          >
            {/* Fixed Header */}
            <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b shrink-0 bg-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-14 w-14 border-2 border-seneca-amber shadow-md">
                    <AvatarImage src={activeDossier.avatarUrl} alt={activeDossier.name} />
                    <AvatarFallback className="bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white font-bold text-lg">
                      {activeDossier.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground">
                        {activeDossier.name}
                      </DialogTitle>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-bold text-xs",
                          activeDossier.academicStanding === "A*"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : activeDossier.academicStanding === "A"
                            ? "bg-seneca-amber/15 text-seneca-amber border-seneca-amber/30"
                            : activeDossier.academicStanding === "Needs Attention"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        )}
                      >
                        Grade {activeDossier.academicStanding}
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground font-mono pt-0.5">
                      Roll No: <span className="font-bold text-foreground">{activeDossier.rollNumber}</span> •{" "}
                      Admission: <span className="font-bold text-foreground">{activeDossier.admissionNumber}</span> •{" "}
                      {activeDossier.className} (Sec {activeDossier.section})
                    </DialogDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyContact(activeDossier.parentPhone, "Guardian Phone")}
                    className="rounded-xl text-xs font-bold gap-1.5 h-8"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Phone</span>
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Scrollable Body Container */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* 1. Academic Performance Scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Attendance Rate
                  </span>
                  <p className="text-xl font-extrabold text-emerald-600 pt-1">
                    {activeDossier.attendanceRate}%
                  </p>
                  <span className="text-[10px] text-muted-foreground">Session Record</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-seneca-amber/10 border border-seneca-amber/20 text-center">
                  <span className="text-[10px] font-bold text-seneca-amber-dark dark:text-seneca-amber uppercase tracking-wider">
                    Average Score
                  </span>
                  <p className="text-xl font-extrabold text-seneca-amber pt-1">
                    {activeDossier.overallScore !== null ? `${activeDossier.overallScore}%` : "—"}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Coursework & Quizzes</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    Assignments
                  </span>
                  <p className="text-xl font-extrabold text-blue-600 pt-1">
                    {activeDossier.totalAssignmentsSubmitted} / {activeDossier.totalAssignmentsCount}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Submitted</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                    Quizzes Taken
                  </span>
                  <p className="text-xl font-extrabold text-purple-600 pt-1">
                    {activeDossier.totalQuizzesAttempted} / {activeDossier.totalQuizzesCount}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Attempts</span>
                </div>
              </div>

              {/* 2. Enrolled Books Taught by Teacher */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Enrolled Teaching Books & Subject Mastery</span>
                </h5>
                {activeDossier.enrolledBooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeDossier.enrolledBooks.map((b) => (
                      <div
                        key={b.bookId}
                        className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-xs text-foreground">{b.bookName}</p>
                            <span className="text-[10px] font-mono text-muted-foreground">{b.bookCode}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold font-mono">
                            {b.avgScore !== null ? `${b.avgScore}% Avg` : "No Grades"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/40">
                          <div>
                            <span className="text-muted-foreground">Assignments:</span>
                            <p className="font-bold text-foreground">
                              {b.submittedAssignments} / {b.totalAssignments}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quizzes:</span>
                            <p className="font-bold text-foreground">
                              {b.attemptedQuizzes} / {b.totalQuizzes}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center text-xs text-muted-foreground">
                    Enrolled via Homeroom Class Section {activeDossier.className} ({activeDossier.section}). No individual textbook curriculum subjects assigned.
                  </div>
                )}
              </div>

              {/* 3. Coursework & Assignment Submissions Log */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>Recent Assignment Submissions & Evaluations</span>
                </h5>

                {activeDossier.assignments.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center text-xs text-muted-foreground">
                    No assignments recorded for this student yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeDossier.assignments.map((a, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-card border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{a.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-semibold text-muted-foreground">
                              {a.bookName}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Due: {a.formattedDueDate || a.dueDate} •{" "}
                            {a.formattedSubmittedAt ? `Submitted: ${a.formattedSubmittedAt}` : "No Submission"}
                          </p>
                          {a.feedback && (
                            <p className="text-[11px] text-seneca-amber font-medium italic pt-0.5">
                              Feedback: &quot;{a.feedback}&quot;
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-bold text-xs",
                              a.status === "graded"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : a.status === "submitted"
                                ? "bg-seneca-amber/15 text-seneca-amber border-seneca-amber/30"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            )}
                          >
                            {a.status === "graded"
                              ? `${a.obtainedMarks} / ${a.totalMarks}`
                              : a.status === "submitted"
                              ? "Pending Evaluation"
                              : "Unsubmitted (0 Marks)"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Quiz Assessments Log */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-purple-600" />
                  <span>Quiz Assessments & Exam Results</span>
                </h5>

                {activeDossier.quizzes.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center text-xs text-muted-foreground">
                    No quizzes recorded for this student yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeDossier.quizzes.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-card border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{q.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-semibold text-muted-foreground">
                              {q.bookName}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Pass Mark: {q.passingMarks} / {q.totalMarks} •{" "}
                            {q.formattedSubmittedAt ? `Completed: ${q.formattedSubmittedAt}` : "Not Attempted"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-bold text-xs",
                              q.status === "attempted" && q.isPassed
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : q.status === "attempted" && !q.isPassed
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {q.status === "attempted"
                              ? `${q.score} / ${q.totalMarks} (${q.percentage}%)`
                              : "Not Attempted (0 Marks)"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Parent & Guardian Contact Channel */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                <h5 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Parent & Guardian Official Records</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Guardian Name:</span>
                    <p className="font-bold text-foreground pt-0.5">
                      {activeDossier.parentName} ({activeDossier.guardianType})
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact Phone / WhatsApp:</span>
                    <p className="font-bold text-foreground pt-0.5 flex items-center gap-1.5">
                      <span>{activeDossier.parentPhone}</span>
                      <button
                        onClick={() => handleCopyContact(activeDossier.parentPhone, "Phone")}
                        className="text-seneca-crimson hover:underline"
                        title="Copy"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email Address:</span>
                    <p className="font-bold text-foreground pt-0.5">{activeDossier.parentEmail}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Emergency Contact:</span>
                    <p className="font-bold text-foreground pt-0.5">{activeDossier.emergencyContact}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Residential Address:</span>
                    <p className="font-semibold text-foreground pt-0.5">{activeDossier.address}</p>
                  </div>
                </div>
              </div>

              {/* 6. Teacher Academic Observation & Advisory Note */}
              <div className="p-4 rounded-2xl bg-seneca-amber/5 border border-seneca-amber/20 space-y-3">
                <h5 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-seneca-amber" />
                  <span>Teacher Academic Observation & Advisory Note</span>
                </h5>

                {savedNotes[activeDossier.id] && (
                  <div className="p-3 rounded-xl bg-card border border-seneca-amber/30 text-xs text-foreground space-y-1">
                    <span className="text-[10px] font-bold text-seneca-amber uppercase">
                      Current Note:
                    </span>
                    <p className="italic">&quot;{savedNotes[activeDossier.id]}&quot;</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Write an observation note or advisory for this student..."
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    className="h-10 rounded-xl bg-background text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveObservation(activeDossier.id);
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveObservation(activeDossier.id)}
                    className="rounded-xl text-xs font-bold shrink-0 bg-seneca-amber text-zinc-950 hover:bg-seneca-amber/90"
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            </div>

            {/* Pinned Fixed Footer */}
            <DialogFooter className="p-4 sm:p-5 pt-3 border-t bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2.5 justify-between items-center">
              <Button asChild variant="outline" className="rounded-xl text-xs font-bold gap-1.5 w-full sm:w-auto">
                <Link href={`/teacher/messages?studentId=${activeDossier.id}`}>
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Send Consultation Message</span>
                </Link>
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="rounded-xl text-xs font-bold gap-1.5 flex-1 sm:flex-initial"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveDossier(null)}
                  className="rounded-xl text-xs font-bold bg-seneca-crimson hover:bg-seneca-crimson-dark text-white flex-1 sm:flex-initial"
                >
                  Close Dossier
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
