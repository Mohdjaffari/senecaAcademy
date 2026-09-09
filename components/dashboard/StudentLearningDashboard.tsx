"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  HelpCircle,
  CalendarCheck,
  Award,
  CreditCard,
  User,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Search,
  Printer,
  Download,
  UploadCloud,
  Timer,
  Check,
  Megaphone,
  School as SchoolIcon,
  FileBadge,
  Send,
  QrCode,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  Inbox,
  FileQuestion,
  FileCheck,
  Lock,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

export interface StudentDashboardProps {
  studentId?: string;
  classId?: string;
  userName: string;
  userEmail: string;
  admissionNumber: string;
  rollNumber: string;
  className: string;
  stream?: string;
  feeCategory?: string;
  stats: {
    activeHomework: number;
    availableQuizzes: number;
    attendanceRate: string;
    unpaidFees: number;
    termGpa?: string;
    overallGrade?: string;
  };
  dbSubjects?: any[];
  dbAssignments?: any[];
  dbSubmissions?: any[];
  dbQuizzes?: any[];
  dbQuizAttempts?: any[];
  dbFees?: any[];
  dbAnnouncements?: any[];
  dbExams?: any[];
  dbResults?: any[];
  dbMaterials?: any[];
  dbAttendance?: any[];
  dbTimetable?: any[];
  dbBankAccounts?: any[];
  dbAcademicHistory?: any[];
}

export function StudentLearningDashboard({
  studentId = "",
  classId = "",
  userName,
  userEmail,
  admissionNumber,
  rollNumber,
  className,
  stream = "General",
  feeCategory = "Standard",
  stats,
  dbSubjects = [],
  dbAssignments = [],
  dbSubmissions = [],
  dbQuizzes = [],
  dbQuizAttempts = [],
  dbFees = [],
  dbAnnouncements = [],
  dbExams = [],
  dbResults = [],
  dbMaterials = [],
  dbAttendance = [],
  dbTimetable = [],
  dbBankAccounts = [],
  dbAcademicHistory = [],
}: StudentDashboardProps) {
  // Search & Department Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  // VULMS Utility Modals
  const [accountBookOpen, setAccountBookOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [gradeBookOpen, setGradeBookOpen] = useState(false);
  const [servicesHubOpen, setServicesHubOpen] = useState(false);
  const [noticesModalOpen, setNoticesModalOpen] = useState(false);
  const [timetableModalOpen, setTimetableModalOpen] = useState(false);
  const [academicJourneyOpen, setAcademicJourneyOpen] = useState(false);
  const [challanPrintFee, setChallanPrintFee] = useState<any | null>(null);

  // Subject Course Card Specific Modals
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [assignmentsModalOpen, setAssignmentsModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [handoutsModalOpen, setHandoutsModalOpen] = useState(false);

  // Active Quiz State
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizTimeLeft, setQuizTimeLeft] = useState(600); // in seconds
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Homework upload state
  const [hwSubmitting, setHwSubmitting] = useState<string | null>(null);
  const [hwSelectedFiles, setHwSelectedFiles] = useState<{ [hwId: string]: string }>({});

  // Leave application state
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDays, setLeaveDays] = useState("1");
  const [leaveDate, setLeaveDate] = useState("");

  // Local state for Fee Vouchers to reflect instant payments
  const [feesList, setFeesList] = useState<any[]>(dbFees);
  useEffect(() => {
    setFeesList(dbFees);
  }, [dbFees]);

  // Local state for submissions
  const [submissionsList, setSubmissionsList] = useState<any[]>(dbSubmissions);
  useEffect(() => {
    setSubmissionsList(dbSubmissions);
  }, [dbSubmissions]);

  // Local state for quiz attempts
  const [attemptsList, setAttemptsList] = useState<any[]>(dbQuizAttempts);
  useEffect(() => {
    setAttemptsList(dbQuizAttempts);
  }, [dbQuizAttempts]);

  // Extract unique departments from real subjects
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    dbSubjects.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set);
  }, [dbSubjects]);

  // Filtered courses based on search & department
  const filteredCourses = useMemo(() => {
    return dbSubjects.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.teacher?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        selectedDept === "all" ||
        (course.department || "").toLowerCase() === selectedDept.toLowerCase();
      return matchesSearch && matchesDept;
    });
  }, [dbSubjects, searchQuery, selectedDept]);

  // Subject-specific assignments
  const subjectAssignments = useMemo(() => {
    if (!selectedSubject) return [];
    return dbAssignments.filter(
      (a) =>
        a.subjectId?._id?.toString() === selectedSubject.id ||
        a.subjectId?.toString() === selectedSubject.id
    );
  }, [selectedSubject, dbAssignments]);

  // Subject-specific quizzes
  const subjectQuizzes = useMemo(() => {
    if (!selectedSubject) return [];
    return dbQuizzes.filter(
      (q) =>
        q.subjectId?._id?.toString() === selectedSubject.id ||
        q.subjectId?.toString() === selectedSubject.id
    );
  }, [selectedSubject, dbQuizzes]);

  // Active quiz object
  const currentQuiz = subjectQuizzes[activeQuizIndex] || subjectQuizzes[0];
  const isCurrentQuizExpired = useMemo(
    () => Boolean(currentQuiz?.endDate && new Date() > new Date(currentQuiz.endDate)),
    [currentQuiz]
  );

  // Subject-specific handouts / course materials
  const subjectMaterials = useMemo(() => {
    if (!selectedSubject) return [];
    return dbMaterials.filter(
      (m) =>
        m.subjectId?._id?.toString() === selectedSubject.id ||
        m.subjectId?.toString() === selectedSubject.id
    );
  }, [selectedSubject, dbMaterials]);

  // Quiz timer
  useEffect(() => {
    let interval: any = null;
    if (quizModalOpen && !quizSubmitted && !isCurrentQuizExpired && quizTimeLeft > 0) {
      interval = setInterval(() => {
        setQuizTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizModalOpen, quizSubmitted, isCurrentQuizExpired, quizTimeLeft]);

  // Open Quiz Modal
  const handleOpenQuizModal = (subject: any) => {
    setSelectedSubject(subject);
    setActiveQuizIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    const quizes = dbQuizzes.filter(
      (q) =>
        q.subjectId?._id?.toString() === subject.id ||
        q.subjectId?.toString() === subject.id
    );
    const q = quizes[0];
    setQuizTimeLeft((q?.durationMinutes || 15) * 60);
    setQuizModalOpen(true);
  };

  const handleQuizOptionSelect = (qIdx: number, optIdx: number) => {
    if (quizSubmitted || isCurrentQuizExpired) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleQuizSubmit = async () => {
    if (!currentQuiz || isCurrentQuizExpired) {
      if (isCurrentQuizExpired) toast.error("This quiz is expired and submissions are locked.");
      return;
    }
    setSubmittingQuiz(true);
    let correctCount = 0;
    const questions = currentQuiz.questions || [];
    const formattedAnswers = questions.map((q: any, idx: number) => {
      const chosen = quizAnswers[idx] !== undefined ? quizAnswers[idx] : -1;
      const isCorrect = chosen === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: idx,
        selectedOption: chosen,
        isCorrect,
        marksAwarded: isCorrect ? (q.marks || 1) : 0,
      };
    });

    const totalQ = questions.length || 1;
    const score = correctCount;
    const percentage = Math.round((correctCount / totalQ) * 100);
    const isPassed = percentage >= (currentQuiz.passingMarks || 50);

    try {
      const res = await fetch("/api/student/quizzes/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: currentQuiz._id || currentQuiz.id,
          studentId: studentId,
          answers: formattedAnswers,
          score,
          percentage,
          isPassed,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuizSubmitted(true);
        setAttemptsList((prev) => [...prev, { quizId: currentQuiz._id || currentQuiz.id, score, percentage, isPassed }]);
        toast.success(`Quiz Completed! You scored ${percentage}% (${correctCount}/${totalQ})`);
      } else {
        toast.error(data.message || "Failed to submit quiz attempt.");
      }
    } catch (err) {
      setQuizSubmitted(true);
      toast.success(`Quiz Completed! You scored ${percentage}%`);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizTimeLeft((currentQuiz?.durationMinutes || 15) * 60);
  };

  // Submit Homework to MongoDB
  const handleHomeworkSubmit = async (hwId: string) => {
    const fileName = hwSelectedFiles[hwId];
    if (!fileName) {
      toast.error("Please choose a file or document to upload first.");
      return;
    }
    setHwSubmitting(hwId);
    try {
      const res = await fetch("/api/student/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: hwId,
          studentId: studentId,
          fileName: fileName,
          fileUrl: `/uploads/assignments/${encodeURIComponent(fileName)}`,
          content: "Homework document submitted by student.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionsList((prev) => [
          ...prev,
          {
            assignmentId: hwId,
            studentId,
            attachmentUrls: [{ name: fileName, url: `/uploads/assignments/${fileName}` }],
            status: "submitted",
            submittedAt: new Date(),
          },
        ]);
        toast.success("Assignment submitted successfully to teacher!");
      } else {
        toast.error(data.message || "Failed to submit assignment.");
      }
    } catch (err) {
      toast.error("Error submitting assignment.");
    } finally {
      setHwSubmitting(null);
    }
  };

  // Pay Fee Voucher via API
  const handlePayOnline = async (voucherId: string) => {
    toast.loading("Processing payment with Seneca Online Banking Gateway...", { id: "pay" });
    try {
      const res = await fetch("/api/student/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeId: voucherId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeesList((prev) =>
          prev.map((f) =>
            (f._id || f.id) === voucherId
              ? {
                  ...f,
                  status: "paid",
                  paidAmount: f.totalAmount,
                  balanceAmount: 0,
                  updatedAt: new Date(),
                }
              : f
          )
        );
        toast.success("Fee voucher paid successfully! Official receipt generated.", { id: "pay" });
      } else {
        toast.error(data.message || "Payment could not be completed.", { id: "pay" });
      }
    } catch (err) {
      toast.error("Error processing online payment.", { id: "pay" });
    }
  };

  // Leave Request
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      toast.error("Please enter the reason for your leave request.");
      return;
    }
    toast.success("Leave application submitted to Headmaster & Class Teacher for review.");
    setLeaveReason("");
  };

  // Build Timetable Slot Grid from dbTimetable
  const timetableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timetablePeriods = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-6 pb-12 font-sans text-foreground">
      {/* 1. VULMS SCHOOL STUDENT BANNER & UTILITY HUB */}
      <div className="relative overflow-hidden rounded-3xl border border-seneca-crimson/20 bg-gradient-to-br from-card via-card/95 to-seneca-crimson/[0.04] p-6 shadow-xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-seneca-crimson/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-40 w-40 rounded-full bg-seneca-amber/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Real Student Identity Card Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-seneca-crimson to-seneca-crimson-dark text-white font-extrabold text-2xl shadow-lg ring-4 ring-seneca-crimson/20">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <Check className="h-3 w-3 text-white stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
                  {userName}
                </h1>
                <Badge variant="outline" className="bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30 font-bold px-2.5 py-0.5 text-xs">
                  {className}
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold text-xs">
                  Active Enrolled
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-foreground/80">
                  <span className="text-seneca-crimson font-bold">Roll No:</span> {rollNumber}
                </span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="flex items-center gap-1 font-semibold text-foreground/80">
                  <span className="text-seneca-crimson font-bold">Admission ID:</span> {admissionNumber}
                </span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-seneca-amber" />
                  <span>{stream}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-seneca-amber/10 px-2.5 py-1 text-xs font-bold text-seneca-amber-dark dark:text-seneca-amber border border-seneca-amber/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Term Standing: {stats.termGpa} ({stats.overallGrade})</span>
                </div>
                <Link
                  href="/student/calendar"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-600 border border-blue-500/20 transition-all hover:scale-105"
                  title="View Official School Calendar & Class Attendance Log"
                >
                  <CalendarCheck className="h-3.5 w-3.5" />
                  <span>Class Attendance: {stats.attendanceRate}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Quick VULMS Action Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60 w-full lg:w-auto">
            <Button
              onClick={() => setNoticesModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-2 px-2.5 sm:px-3 items-center justify-center gap-1 rounded-xl border-border/80 hover:border-seneca-crimson hover:bg-seneca-crimson/5 transition-all text-xs font-bold w-full"
            >
              <Megaphone className="h-4 w-4 text-seneca-crimson" />
              <span>Notices ({dbAnnouncements.length})</span>
            </Button>

            <Button
              onClick={() => setAccountBookOpen(true)}
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-2 px-3 items-center justify-center gap-1 rounded-xl border-border/80 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-xs font-bold relative"
            >
              {stats.unpaidFees > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-seneca-crimson animate-ping" />
              )}
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>Account Book</span>
            </Button>

            <Button
              onClick={() => setDateSheetOpen(true)}
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-2 px-3 items-center justify-center gap-1 rounded-xl border-border/80 hover:border-seneca-amber hover:bg-seneca-amber/5 transition-all text-xs font-bold"
            >
              <Calendar className="h-4 w-4 text-seneca-amber-dark dark:text-seneca-amber" />
              <span>Date Sheet ({dbExams.length})</span>
            </Button>

            <Button
              onClick={() => setGradeBookOpen(true)}
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-2 px-3 items-center justify-center gap-1 rounded-xl border-border/80 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-xs font-bold"
            >
              <Award className="h-4 w-4 text-indigo-600" />
              <span>Grade Book</span>
            </Button>

            <Button
              onClick={() => setServicesHubOpen(true)}
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-2 px-3 items-center justify-center gap-1 rounded-xl border-border/80 hover:border-seneca-crimson hover:bg-seneca-crimson/5 transition-all text-xs font-bold"
            >
              <FileBadge className="h-4 w-4 text-seneca-crimson" />
              <span>Services</span>
            </Button>

            <Button
              onClick={() => setTimetableModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-2 px-3 items-center justify-center gap-1 rounded-xl border-border/80 hover:border-purple-500 hover:bg-purple-500/5 transition-all text-xs font-bold"
            >
              <Clock className="h-4 w-4 text-purple-600" />
              <span>Timetable</span>
            </Button>

            <Button
              onClick={() => setAcademicJourneyOpen(true)}
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-2 px-2.5 sm:px-3 items-center justify-center gap-1 rounded-xl border-border/80 hover:border-seneca-crimson hover:bg-seneca-crimson/5 transition-all text-xs font-bold text-seneca-crimson col-span-2 sm:col-span-1"
              title="View Academic Journey & Grade Progression History"
            >
              <GraduationCap className="h-4 w-4 text-seneca-crimson" />
              <span>Journey ({dbAcademicHistory.length + 1})</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. URGENT NOTICE TICKER BANNER (From Database Announcements) */}
      {dbAnnouncements.length > 0 ? (
        <div className="flex items-center gap-3 rounded-2xl bg-seneca-crimson/10 border border-seneca-crimson/20 px-4 py-3 text-xs">
          <div className="flex items-center gap-1.5 text-seneca-crimson font-extrabold uppercase tracking-wider shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-seneca-crimson opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-seneca-crimson" />
            </span>
            <Megaphone className="h-4 w-4" />
            <span>Notice:</span>
          </div>
          <div className="flex-1 truncate font-medium text-foreground/90">
            {dbAnnouncements[0].title}: {dbAnnouncements[0].content}
          </div>
          <Button
            onClick={() => setNoticesModalOpen(true)}
            variant="link"
            size="sm"
            className="h-auto p-0 font-bold text-seneca-crimson hover:underline shrink-0"
          >
            View All ({dbAnnouncements.length}) →
          </Button>
        </div>
      ) : null}

      {/* 3. VULMS COURSE DASHBOARD (DATABASE SUBJECTS GRID FOR HIS GRADE) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-seneca-crimson" />
              <span>Assigned Subjects &amp; Learning Hub</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Official subjects assigned to {className}. Click buttons to access assignments, quizzes, handouts, and attendance.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search subject or faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-card border-border/80"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Department Filter Tabs (Extracted from actual DB subjects) */}
        {availableDepartments.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedDept("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap",
                selectedDept === "all"
                  ? "bg-seneca-crimson text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              All Subjects ({dbSubjects.length})
            </button>
            {availableDepartments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap",
                  selectedDept.toLowerCase() === dept.toLowerCase()
                    ? "bg-seneca-crimson text-white shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        )}

        {/* Subjects Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="group border border-border/80 bg-card/95 backdrop-blur-xl shadow-md hover:shadow-xl hover:border-seneca-crimson/40 transition-all rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                {/* Course Top Header */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-seneca-crimson text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md">
                          {course.code}
                        </Badge>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {course.creditHours} Credit Hours
                        </span>
                      </div>
                      <h3 className="font-bold text-base font-heading text-foreground group-hover:text-seneca-crimson transition-colors leading-snug">
                        {course.name}
                      </h3>
                      {course.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      )}
                    </div>

                    <div className="h-9 w-9 rounded-xl bg-seneca-crimson/10 text-seneca-crimson font-bold text-xs flex items-center justify-center shrink-0 border border-seneca-crimson/20">
                      {course.teacher.initials}
                    </div>
                  </div>

                  {/* Assigned Teacher Info from Database */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                    <User className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-foreground">{course.teacher.name}</span>
                      <span className="text-[10px] block text-muted-foreground truncate">
                        {course.teacher.title} • {course.teacher.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 DEDICATED SUBJECT TEACHER CONTENT BUTTONS */}
                <div className="p-3 bg-muted/30 border-t border-border/60 grid grid-cols-3 gap-2">
                  {/* 1. Assignments */}
                  <Button
                    onClick={() => {
                      setSelectedSubject(course);
                      setAssignmentsModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full h-auto py-2.5 px-2 rounded-xl text-[11px] font-bold border-border/80 hover:border-seneca-crimson hover:bg-seneca-crimson/10 hover:text-seneca-crimson transition-all flex flex-col items-center justify-center gap-1 relative group/btn"
                  >
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-seneca-crimson" />
                      {course.pendingAssignments > 0 && (
                        <span className="h-4 px-1.5 rounded-full bg-seneca-crimson text-white text-[9px] font-extrabold flex items-center justify-center">
                          {course.pendingAssignments}
                        </span>
                      )}
                    </div>
                    <span className="truncate">Assignments</span>
                  </Button>

                  {/* 2. Quizzes */}
                  <Button
                    onClick={() => handleOpenQuizModal(course)}
                    variant="outline"
                    size="sm"
                    className="w-full h-auto py-2.5 px-2 rounded-xl text-[11px] font-bold border-border/80 hover:border-seneca-amber hover:bg-seneca-amber/10 hover:text-seneca-amber-dark dark:hover:text-seneca-amber transition-all flex flex-col items-center justify-center gap-1 relative group/btn"
                  >
                    <div className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5 text-seneca-amber-dark dark:text-seneca-amber" />
                      {course.activeQuizzes > 0 && (
                        <span className="h-4 px-1.5 rounded-full bg-seneca-amber text-zinc-950 text-[9px] font-extrabold flex items-center justify-center">
                          {course.activeQuizzes}
                        </span>
                      )}
                    </div>
                    <span className="truncate">Quizzes</span>
                  </Button>

                  {/* 3. Handouts */}
                  <Button
                    onClick={() => {
                      setSelectedSubject(course);
                      setHandoutsModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full h-auto py-2.5 px-2 rounded-xl text-[11px] font-bold border-border/80 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-1 group/btn"
                  >
                    <div className="flex items-center gap-1">
                      <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({course.handoutsCount})
                      </span>
                    </div>
                    <span className="truncate">Handouts</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/60 space-y-3">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-base text-foreground">No Subjects Enrolled Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              There are currently no subjects assigned to {className} in the database. When the administration assigns subjects to this grade, they will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* 4. VULMS SCHOOL COMPREHENSIVE MODALS CONNECTED TO DATABASE */}

      {/* MODAL 4: SUBJECT ASSIGNMENTS MODAL */}
      <Dialog open={assignmentsModalOpen} onOpenChange={setAssignmentsModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-seneca-crimson text-white font-bold text-xs">
                {selectedSubject?.code || "COURSE"}
              </Badge>
              <DialogTitle className="text-xl font-bold font-heading">
                Homework &amp; Assignments
              </DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedSubject?.name} • Faculty: {selectedSubject?.teacher?.name}
            </p>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {subjectAssignments.length > 0 ? (
              subjectAssignments.map((hw) => {
                const isSubmitted = submissionsList.some(
                  (sub) => sub.assignmentId?.toString() === (hw._id || hw.id).toString()
                );
                const submission = submissionsList.find(
                  (sub) => sub.assignmentId?.toString() === (hw._id || hw.id).toString()
                );
                const isPastDue = hw.dueDate ? new Date() > new Date(hw.dueDate) : false;

                return (
                  <div
                    key={hw._id || hw.id}
                    className="border border-border/80 rounded-2xl p-4 bg-card hover:border-seneca-crimson/40 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground">{hw.title}</h4>
                          {isSubmitted ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[10px] font-bold">
                              {typeof submission?.obtainedMarks === "number"
                                ? `Graded: ${submission.obtainedMarks}/${hw.totalMarks} Marks`
                                : "Submitted (Pending Faculty Evaluation)"}
                            </Badge>
                          ) : isPastDue ? (
                            <Badge className="bg-rose-500/15 text-rose-600 border border-rose-500/30 text-[10px] font-extrabold flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              <span>Deadline Passed • 0 Marks</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Pending Submission</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-3">
                          <span className={cn("flex items-center gap-1 font-semibold", isPastDue ? "text-rose-600" : "text-seneca-crimson")}>
                            <Clock className="h-3 w-3" /> Due: {new Date(hw.dueDate).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span>Total Marks: {hw.totalMarks || 100}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/80 bg-muted/50 p-2.5 rounded-xl border border-border/40 leading-relaxed">
                      {hw.description}
                    </p>

                    {isSubmitted ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 gap-2">
                        <span className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> Solution uploaded successfully
                        </span>
                        {submission?.feedback && (
                          <span className="text-[11px] italic font-medium">&ldquo;{submission.feedback}&rdquo;</span>
                        )}
                      </div>
                    ) : isPastDue ? (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
                        <span className="font-bold flex items-center gap-1.5">
                          <XCircle className="h-4 w-4 shrink-0" />
                          <span>Submissions Closed — The deadline for this assignment has passed.</span>
                        </span>
                        <Badge variant="outline" className="bg-background text-rose-600 border-rose-500/30 text-[10px] font-extrabold shrink-0">
                          Marks: 0 / {hw.totalMarks}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                        <label className="flex-1 flex items-center gap-2 border border-dashed border-border rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-muted cursor-pointer transition-colors truncate">
                          <UploadCloud className="h-4 w-4 text-seneca-crimson shrink-0" />
                          <span className="truncate">
                            {hwSelectedFiles[hw._id || hw.id] || "Choose homework document / PDF..."}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const fName = e.target.files[0].name;
                                setHwSelectedFiles((prev) => ({
                                  ...prev,
                                  [hw._id || hw.id]: fName,
                                }));
                              }
                            }}
                          />
                        </label>

                        <Button
                          onClick={() => handleHomeworkSubmit(hw._id || hw.id)}
                          disabled={hwSubmitting === (hw._id || hw.id)}
                          size="sm"
                          className="bg-seneca-crimson hover:bg-seneca-crimson-dark text-white font-bold text-xs rounded-xl gap-1.5 shrink-0"
                        >
                          {hwSubmitting === (hw._id || hw.id) ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          <span>Submit Solution</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl space-y-2">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Assignments Published</h4>
                <p className="text-xs text-muted-foreground">
                  The subject faculty has not published any homework assignments for this course yet.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignmentsModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: SUBJECT QUIZ MODAL */}
      <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-seneca-amber text-zinc-950 font-bold text-xs">
                  {selectedSubject?.code || "COURSE"}
                </Badge>
                <DialogTitle className="text-xl font-bold font-heading">
                  {currentQuiz?.title || "Interactive Class Test / Quiz"}
                </DialogTitle>
              </div>

              {!quizSubmitted && currentQuiz && !isCurrentQuizExpired && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-seneca-crimson/10 text-seneca-crimson border border-seneca-crimson/20 px-2.5 py-1 rounded-xl">
                  <Timer className="h-3.5 w-3.5" />
                  <span>
                    {Math.floor(quizTimeLeft / 60)}:{(quizTimeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
            {currentQuiz && (
              <p className="text-xs text-muted-foreground">
                {currentQuiz.description || "Answer all questions and submit before time expires."} • {currentQuiz.questions?.length || 0} Questions • Total Marks: {currentQuiz.totalMarks || 10}
              </p>
            )}

            {isCurrentQuizExpired && !quizSubmitted && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-2 mt-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>This quiz deadline expired on {new Date(currentQuiz.endDate).toLocaleString("en-PK")}. New attempts are strictly locked.</span>
                </span>
                <Badge variant="outline" className="bg-background text-rose-600 border-rose-500/30 text-[10px] font-extrabold shrink-0">
                  Score: 0 / {currentQuiz.totalMarks || 10}
                </Badge>
              </div>
            )}
          </DialogHeader>

          <div className="space-y-5 my-3">
            {currentQuiz && currentQuiz.questions && currentQuiz.questions.length > 0 ? (
              currentQuiz.questions.map((q: any, qIdx: number) => {
                const isOptionChosen = quizAnswers[qIdx] !== undefined;
                const isCorrect = quizAnswers[qIdx] === q.correctAnswer;

                return (
                  <div
                    key={q._id || qIdx}
                    className="border border-border/80 rounded-2xl p-4 bg-card space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-foreground">
                        Q{qIdx + 1}. {q.question}
                      </h4>
                      {quizSubmitted && (
                        <Badge
                          className={cn(
                            "text-[10px] font-bold",
                            isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                          )}
                        >
                          {isCorrect ? `Correct (+${q.marks || 1})` : "Incorrect (0)"}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {(q.options || []).map((opt: string, optIdx: number) => {
                        const isOptionSelected = quizAnswers[qIdx] === optIdx;
                        const isOptionCorrect = q.correctAnswer === optIdx;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleQuizOptionSelect(qIdx, optIdx)}
                            disabled={quizSubmitted}
                            className={cn(
                              "w-full text-left p-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-between",
                              !quizSubmitted &&
                                isOptionSelected &&
                                "border-seneca-crimson bg-seneca-crimson/10 text-seneca-crimson font-bold",
                              !quizSubmitted &&
                                !isOptionSelected &&
                                "border-border/60 hover:border-border hover:bg-muted/50",
                              quizSubmitted &&
                                isOptionCorrect &&
                                "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold",
                              quizSubmitted &&
                                isOptionSelected &&
                                !isOptionCorrect &&
                                "border-red-500 bg-red-500/10 text-red-600 font-bold"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-full border flex items-center justify-center text-[10px] shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </span>
                            {quizSubmitted && isOptionCorrect && (
                              <Check className="h-4 w-4 text-emerald-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && q.explanation && (
                      <div className="text-xs bg-muted/60 p-3 rounded-xl text-muted-foreground border border-border/40 leading-relaxed">
                        💡 <strong className="text-foreground">Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl space-y-2">
                <FileQuestion className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Quizzes Active</h4>
                <p className="text-xs text-muted-foreground">
                  There are currently no active quizzes published in the database for {selectedSubject?.name}.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2">
            {currentQuiz && currentQuiz.questions && currentQuiz.questions.length > 0 && (
              quizSubmitted ? (
                <Button
                  variant="outline"
                  onClick={resetQuiz}
                  size="sm"
                  className="rounded-xl text-xs gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retake Practice Test</span>
                </Button>
              ) : (
                <Button
                  onClick={handleQuizSubmit}
                  disabled={submittingQuiz}
                  size="sm"
                  className="bg-seneca-crimson hover:bg-seneca-crimson-dark text-white font-bold text-xs rounded-xl gap-1.5"
                >
                  {submittingQuiz ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>Submit Quiz Responses</span>
                </Button>
              )
            )}

            <Button
              variant="outline"
              onClick={() => setQuizModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: SUBJECT HANDOUTS / MATERIALS */}
      <Dialog open={handoutsModalOpen} onOpenChange={setHandoutsModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white font-bold text-xs">
                {selectedSubject?.code || "COURSE"}
              </Badge>
              <DialogTitle className="text-xl font-bold font-heading">
                Subject Handouts &amp; Study Notes
              </DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Official curriculum materials published for {selectedSubject?.name}
            </p>
          </DialogHeader>

          <div className="space-y-3 my-3">
            {subjectMaterials.length > 0 ? (
              subjectMaterials.map((mat) => (
                <div
                  key={mat._id || mat.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card hover:border-blue-500/40 transition-all gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-foreground">{mat.title}</h4>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>{mat.fileName || "Course Handout"}</span>
                        <span>•</span>
                        <span>
                          {mat.fileSize
                            ? `${(mat.fileSize / (1024 * 1024)).toFixed(1)} MB`
                            : "PDF Document"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs font-bold gap-1.5 border-border/80 hover:border-blue-500 hover:text-blue-600 shrink-0"
                  >
                    <a
                      href={mat.fileUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => toast.success(`Accessing document: ${mat.title}`)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl space-y-2">
                <FolderOpen className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Handouts Uploaded</h4>
                <p className="text-xs text-muted-foreground">
                  The subject teacher has not uploaded any downloadable lecture handouts or past papers for this course yet.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHandoutsModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 1: ACCOUNT BOOK (From DB Fees) */}
      <Dialog open={accountBookOpen} onOpenChange={setAccountBookOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <DialogTitle className="text-xl font-bold font-heading">
                  Student Account Book &amp; Fee Vouchers
                </DialogTitle>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold text-xs">
                Seneca School Accounts
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Official invoices and payment status for {userName} ({admissionNumber}).
            </p>
          </DialogHeader>

          <div className="space-y-4 my-3">
            {feesList.length > 0 ? (
              feesList.map((fee) => {
                const isPaid = fee.status === "paid";

                return (
                  <div
                    key={fee._id || fee.id}
                    className="border border-border/80 rounded-2xl p-5 bg-card hover:border-emerald-500/40 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-foreground">
                            {fee.month} Tuition Fee Voucher
                          </h4>
                          {isPaid ? (
                            <Badge className="bg-emerald-500 text-white font-bold text-[10px]">
                              PAID &amp; CLEARED
                            </Badge>
                          ) : (
                            <Badge className="bg-seneca-crimson text-white font-bold text-[10px] animate-pulse">
                              UNPAID ({fee.status.toUpperCase()})
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Voucher #{fee.voucherNumber || fee.voucherNo} • Due Date: {new Date(fee.dueDate).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Payable Amount</span>
                        <span className="text-xl font-black text-foreground">
                          {formatCurrency(fee.totalAmount || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown table */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/40 p-3 rounded-xl border border-border/40">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Tuition Fee</span>
                        <span className="font-semibold text-foreground">{formatCurrency(fee.tuitionFee || 0)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Admission Fee</span>
                        <span className="font-semibold text-foreground">{formatCurrency(fee.admissionFee || 0)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Exam / Lab Charges</span>
                        <span className="font-semibold text-foreground">{formatCurrency((fee.examFee || 0) + (fee.otherCharges || 0))}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Fine / Discount</span>
                        <span className="font-semibold text-foreground">
                          {fee.fine > 0 ? `+${formatCurrency(fee.fine)}` : fee.discount > 0 ? `-${formatCurrency(fee.discount)}` : "None"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
                      <div className="text-[11px] text-muted-foreground">
                        {isPaid ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Cleared online with zero outstanding balance.
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">
                            Please settle before due date to avoid standard late fee.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setChallanPrintFee(fee)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-bold gap-1.5 border-border/80 hover:border-seneca-crimson hover:text-seneca-crimson"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Print 3-Part Challan</span>
                        </Button>

                        {!isPaid && (
                          <Button
                            onClick={() => handlePayOnline(fee._id || fee.id)}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl gap-1.5 shadow-sm"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Pay Online Now</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl space-y-2">
                <CreditCard className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Fee Invoices Found</h4>
                <p className="text-xs text-muted-foreground">
                  There are currently no fee vouchers generated for your student account in the database.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAccountBookOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: 3-PART BANK CHALLAN PRINT PREVIEW (From Actual Fee Object) */}
      <Dialog open={!!challanPrintFee} onOpenChange={() => setChallanPrintFee(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card print:p-0 print:border-none print:shadow-none">
          <DialogHeader className="print:hidden">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold font-heading">
                3-Part Bank Deposit Challan Preview
              </DialogTitle>
              <Button
                onClick={() => window.print()}
                size="sm"
                className="bg-seneca-crimson text-white font-bold text-xs rounded-xl gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Document</span>
              </Button>
            </div>
          </DialogHeader>

          {challanPrintFee && (() => {
            const activeBanks = (dbBankAccounts || []).filter((b: any) => b.isActive !== false);
            const primaryBank =
              activeBanks.find((b: any) => b.isPrimary) ||
              activeBanks[0] || {
                bankName: "Habib Bank Limited (HBL) / Meezan Bank",
                accountTitle: "Seneca Academy (Pvt) Ltd",
                accountNumber: "0148-2839102-01",
                iban: "PK36HABB0001482839102001",
                routingCode: "1Link ID: 100928",
                instructions: "Payable at any branch nationwide, mobile banking, or 1Link 1Bill.",
              };

            return (
              <div className="space-y-4 my-2">
                <div className="text-center pb-2 border-b border-border/80">
                  <h3 className="font-extrabold text-base text-foreground font-heading">
                    SENECA INTERNATIONAL SCHOOL &amp; COLLEGE
                  </h3>
                  <p className="text-[11px] font-bold text-foreground">
                    {primaryBank.bankName}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    A/C: <span className="font-bold text-foreground">{primaryBank.accountNumber}</span> • Title: <span className="font-bold text-foreground">{primaryBank.accountTitle}</span>
                    {primaryBank.routingCode ? ` • ${primaryBank.routingCode}` : ""}
                  </p>
                  {primaryBank.iban && (
                    <p className="text-[9px] text-muted-foreground font-mono">
                      IBAN: {primaryBank.iban}
                    </p>
                  )}
                </div>

                {/* 3 Columns: Bank Copy, School Copy, Student Copy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                  {["BANK COPY", "SCHOOL ACCOUNTS COPY", "STUDENT COPY"].map((copyName, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-dashed border-border/80 rounded-2xl p-3.5 bg-card flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="bg-seneca-crimson text-white text-center font-extrabold text-[10px] py-1 rounded-md mb-2">
                          {copyName}
                        </div>

                        <div className="space-y-1 text-muted-foreground">
                          <p><strong className="text-foreground">Voucher:</strong> {challanPrintFee.voucherNumber || challanPrintFee.voucherNo}</p>
                          <p><strong className="text-foreground">Student:</strong> {userName}</p>
                          <p><strong className="text-foreground">Roll No:</strong> {rollNumber}</p>
                          <p><strong className="text-foreground">Class:</strong> {className}</p>
                          <p><strong className="text-foreground text-seneca-crimson">Due Date:</strong> {new Date(challanPrintFee.dueDate).toLocaleDateString("en-PK")}</p>
                        </div>

                        <div className="my-3 border-t border-b border-border py-2 space-y-1">
                          <div className="flex justify-between">
                            <span>Tuition Fee</span>
                            <span>{formatCurrency(challanPrintFee.tuitionFee || 0)}</span>
                          </div>
                          {challanPrintFee.admissionFee > 0 && (
                            <div className="flex justify-between">
                              <span>Admission Fee</span>
                              <span>{formatCurrency(challanPrintFee.admissionFee)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Exam &amp; Lab</span>
                            <span>{formatCurrency((challanPrintFee.examFee || 0) + (challanPrintFee.otherCharges || 0))}</span>
                          </div>
                          {challanPrintFee.fine > 0 && (
                            <div className="flex justify-between text-seneca-crimson">
                              <span>Late Fine</span>
                              <span>{formatCurrency(challanPrintFee.fine)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-extrabold text-foreground border-t border-border/60 pt-1 text-xs">
                            <span>Total Payable</span>
                            <span>{formatCurrency(challanPrintFee.totalAmount || 0)}</span>
                          </div>
                        </div>

                        <p className="text-[9px] text-muted-foreground leading-tight italic">
                          {primaryBank.instructions || `Payable at any ${primaryBank.bankName} branch nationwide.`}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-border flex justify-between text-[9px] text-muted-foreground">
                        <span>Cashier Stamp</span>
                        <span>Authorized Sign</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <DialogFooter className="print:hidden">
            <Button
              variant="outline"
              onClick={() => setChallanPrintFee(null)}
              className="rounded-xl text-xs"
            >
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: DATE SHEET (From DB Exams) */}
      <Dialog open={dateSheetOpen} onOpenChange={setDateSheetOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-seneca-amber-dark dark:text-seneca-amber" />
                <DialogTitle className="text-xl font-bold font-heading">
                  Examination Date Sheet &amp; Schedule
                </DialogTitle>
              </div>
              <Button
                onClick={() => {
                  toast.success("Printing official Roll Number Slip with examination timetable.");
                  window.print();
                }}
                size="sm"
                className="bg-seneca-crimson text-white font-bold text-xs rounded-xl gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Roll No Slip</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Candidate: {userName} • Roll Number: {rollNumber} • Class: {className}
            </p>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {dbExams.length > 0 ? (
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground font-bold border-b border-border">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Exam Date &amp; Day</th>
                      <th className="p-3">Start Time</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {dbExams.map((exam: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          <span className="font-bold text-seneca-crimson block text-[10px]">
                            {exam.subjectId?.code || "EXAM"}
                          </span>
                          {exam.subjectId?.name || exam.title}
                        </td>
                        <td className="p-3 text-muted-foreground font-medium">
                          {new Date(exam.examDate).toLocaleDateString("en-PK", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3 text-muted-foreground">{exam.startTime || "09:00 AM"}</td>
                        <td className="p-3 text-foreground font-medium">
                          {exam.durationMinutes || 120} Mins
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold uppercase">
                            {exam.status || "Scheduled"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl space-y-2">
                <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Upcoming Exams Scheduled</h4>
                <p className="text-xs text-muted-foreground">
                  There are no scheduled examinations in the database for {className} at this time.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDateSheetOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: GRADE BOOK (From DB Results) */}
      <Dialog open={gradeBookOpen} onOpenChange={setGradeBookOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                <DialogTitle className="text-xl font-bold font-heading">
                  Academic Grade Book &amp; Report Card
                </DialogTitle>
              </div>
              <Badge className="bg-indigo-600 text-white font-bold text-xs">
                Term Standing: {stats.termGpa}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Official exam results recorded by teachers in the database.
            </p>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {dbResults.length > 0 ? (
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground font-bold border-b border-border">
                    <tr>
                      <th className="p-3">Course / Assessment</th>
                      <th className="p-3">Obtained / Max</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {dbResults.map((res: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          <span className="font-bold text-seneca-crimson block text-[10px]">
                            {res.subjectId?.code || "COURSE"}
                          </span>
                          {res.subjectId?.name || res.examId?.title || "Exam Result"}
                        </td>
                        <td className="p-3 text-muted-foreground font-semibold">
                          {res.obtainedMarks} / {res.totalMarks}
                        </td>
                        <td className="p-3 font-extrabold text-foreground">
                          {res.percentage ? `${res.percentage}%` : `${Math.round(((res.obtainedMarks || 0) / (res.totalMarks || 100)) * 100)}%`}
                        </td>
                        <td className="p-3">
                          <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 font-extrabold text-[10px]">
                            {res.grade || "A"}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground italic text-[11px]">
                          {res.remarks || "Satisfactory Performance"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl space-y-2">
                <Award className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Exam Results Published Yet</h4>
                <p className="text-xs text-muted-foreground">
                  The examination board has not yet uploaded finalized marks for your student dossier in this term.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGradeBookOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: ACADEMIC JOURNEY & GRADE PROGRESSION HISTORY */}
      <Dialog open={academicJourneyOpen} onOpenChange={setAcademicJourneyOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader className="border-b border-border/60 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-seneca-crimson shrink-0" />
                <DialogTitle className="text-lg sm:text-xl font-bold font-heading">
                  Academic Journey &amp; Grade Progression
                </DialogTitle>
              </div>
              <Badge className="bg-seneca-crimson text-white font-bold text-xs self-start sm:self-auto">
                {dbAcademicHistory.length + 1} Academic Terms
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Official institutional record of promotions, grade advancements, term transcripts, and Principal remarks.
            </p>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            {/* Current Active Enrolled Placement */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-seneca-crimson/10 via-card to-seneca-amber/10 border border-seneca-crimson/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-seneca-crimson text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">Current Active Grade Placement</h4>
                      <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                        Active Enrolled
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Class: <strong className="text-foreground">{className}</strong> • Stream: <strong className="text-foreground">{stream}</strong>
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono font-bold text-seneca-crimson border-seneca-crimson/30 self-start sm:self-auto shrink-0">
                  Roll #{rollNumber}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40 text-xs">
                <div className="bg-card/70 p-2 rounded-xl border border-border/40">
                  <span className="text-[10px] text-muted-foreground block">Admission ID</span>
                  <span className="font-mono font-bold text-foreground">{admissionNumber}</span>
                </div>
                <div className="bg-card/70 p-2 rounded-xl border border-border/40">
                  <span className="text-[10px] text-muted-foreground block">Current GPA</span>
                  <span className="font-bold text-foreground font-mono">{stats.termGpa || "3.80"}</span>
                </div>
                <div className="bg-card/70 p-2 rounded-xl border border-border/40">
                  <span className="text-[10px] text-muted-foreground block">Current Standing</span>
                  <span className="font-bold text-seneca-crimson">{stats.overallGrade || "A"}</span>
                </div>
                <div className="bg-card/70 p-2 rounded-xl border border-border/40">
                  <span className="text-[10px] text-muted-foreground block">Fee Category</span>
                  <span className="font-medium text-foreground truncate block">{feeCategory}</span>
                </div>
              </div>
            </div>

            {/* Historical Promotions Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-seneca-crimson" />
                <span>Institutional Promotion &amp; Grade History</span>
              </h4>

              {dbAcademicHistory.length === 0 ? (
                <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-border/60 text-center space-y-2">
                  <GraduationCap className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                  <h5 className="font-bold text-xs text-foreground">Inaugural Session Record</h5>
                  <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                    You are currently in your initial enrolled academic session ({className}). When your Principal officially promotes you to the next grade upon term completion, past transcripts and promotion records will be permanently archived here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-seneca-crimson before:via-seneca-amber before:to-emerald-500">
                  {dbAcademicHistory.map((item: any, idx: number) => (
                    <div key={idx} className="relative pl-8 space-y-2 group">
                      <div className="absolute left-2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-card bg-seneca-crimson group-hover:scale-125 transition-transform" />

                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 hover:border-seneca-crimson/40 transition-all space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground text-xs">
                              {item.fromClassName || "Previous Class"} {item.fromSection ? `(${item.fromSection})` : ""}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="font-bold text-seneca-crimson text-xs">
                              {item.toClassName || "Advanced Class"} {item.toSection ? `(${item.toSection})` : ""}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5",
                                item.status === "promoted" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                                item.status === "conditionally_promoted" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                                item.status === "transferred" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                                item.status === "retained" && "bg-rose-500/10 text-rose-600 border-rose-500/30",
                                item.status === "graduated" && "bg-purple-500/10 text-purple-600 border-purple-500/30"
                              )}
                            >
                              {(item.status || "promoted").replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(item.promotionDate).toLocaleDateString("en-PK", { dateStyle: "medium" })}</span>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-card/60 border border-border/40 text-center">
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Session Result</span>
                            <span className="font-bold text-foreground text-xs">
                              {item.finalPercentage !== undefined ? `${item.finalPercentage}%` : "Evaluated"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Grade Awarded</span>
                            <span className="font-bold text-seneca-crimson text-xs">{item.overallGrade || "A"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Session GPA</span>
                            <span className="font-bold text-foreground font-mono text-xs">
                              {item.finalGpa !== undefined ? item.finalGpa.toFixed(2) : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Remarks */}
                        {item.remarks && (
                          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] space-y-1">
                            <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                <span>Principal &amp; Academic Board Remark</span>
                              </span>
                              {item.promotedByName && <span>Authorized by: {item.promotedByName}</span>}
                            </div>
                            <p className="italic text-foreground/90">&ldquo;{item.remarks}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAcademicJourneyOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 9: STUDENT SERVICES HUB */}
      <Dialog open={servicesHubOpen} onOpenChange={setServicesHubOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileBadge className="h-5 w-5 text-seneca-crimson" />
              <DialogTitle className="text-xl font-bold font-heading">
                Student Services &amp; Digital Requests
              </DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Official student certifications, leave applications, and digital student pass.
            </p>
          </DialogHeader>

          <Tabs defaultValue="bonafide" className="w-full my-2">
            <TabsList className="grid grid-cols-3 w-full rounded-2xl">
              <TabsTrigger value="bonafide" className="text-xs font-bold rounded-xl">
                Bonafide Certificate
              </TabsTrigger>
              <TabsTrigger value="leave" className="text-xs font-bold rounded-xl">
                Leave Request
              </TabsTrigger>
              <TabsTrigger value="idcard" className="text-xs font-bold rounded-xl">
                Student ID Card
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: BONAFIDE CERTIFICATE (Connected to real student profile) */}
            <TabsContent value="bonafide" className="space-y-3 pt-2">
              <div className="border-2 border-dashed border-seneca-crimson/30 rounded-2xl p-5 bg-seneca-crimson/[0.02] text-center space-y-3">
                <SchoolIcon className="h-8 w-8 text-seneca-crimson mx-auto" />
                <h4 className="font-extrabold text-base text-foreground font-heading">
                  BONAFIDE STUDENT CERTIFICATE
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                  This is to certify that <strong className="text-foreground">{userName}</strong>, Roll No. <strong className="text-foreground">{rollNumber}</strong>, Admission ID <strong className="text-foreground">{admissionNumber}</strong>, is a regular enrolled student of <strong className="text-foreground">{className}</strong> ({stream}) at Seneca International School &amp; College.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold">
                    Official Student Document
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => {
                  toast.success("Printing official Bonafide Certificate.");
                  window.print();
                }}
                className="w-full bg-seneca-crimson hover:bg-seneca-crimson-dark text-white font-bold text-xs rounded-xl gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Official Certificate</span>
              </Button>
            </TabsContent>

            {/* TAB 2: LEAVE APPLICATION */}
            <TabsContent value="leave" className="space-y-3 pt-2">
              <form onSubmit={handleLeaveSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Leave Duration (Days)</label>
                  <Input
                    type="number"
                    min="1"
                    max="14"
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Reason for Absence</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the medical reason or emergency for taking leave..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full text-xs rounded-xl border border-input bg-background p-3 focus:outline-none focus:ring-2 focus:ring-seneca-crimson"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-seneca-crimson hover:bg-seneca-crimson-dark text-white font-bold text-xs rounded-xl gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Leave Request</span>
                </Button>
              </form>
            </TabsContent>

            {/* TAB 3: DIGITAL ID CARD */}
            <TabsContent value="idcard" className="space-y-3 pt-2">
              <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-seneca-crimson/30 shadow-lg bg-gradient-to-br from-card via-card to-seneca-crimson/10 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-1.5">
                    <SchoolIcon className="h-4 w-4 text-seneca-crimson" />
                    <span className="text-xs font-black text-foreground font-heading">SENECA SCHOOL</span>
                  </div>
                  <Badge className="bg-seneca-crimson text-white text-[9px] font-bold">STUDENT PASS</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl bg-seneca-crimson text-white font-black text-xl flex items-center justify-center shrink-0">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <h5 className="font-bold text-foreground">{userName}</h5>
                    <p className="text-[11px] text-muted-foreground">{className}</p>
                    <p className="text-[10px] text-seneca-crimson font-semibold">ID: {admissionNumber}</p>
                    <p className="text-[10px] text-muted-foreground">Roll: {rollNumber}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[9px] text-muted-foreground">
                  <span>Enrolled Student</span>
                  <QrCode className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setServicesHubOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 10: TIMETABLE (From DB Timetable for his class) */}
      <Dialog open={timetableModalOpen} onOpenChange={setTimetableModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <DialogTitle className="text-xl font-bold font-heading">
                Weekly Class Routine &amp; Timetable
              </DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Class Schedule for {className}
            </p>
          </DialogHeader>

          <div className="overflow-x-auto rounded-2xl border border-border my-2">
            {dbTimetable.length > 0 ? (
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-muted text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="p-2.5">Period</th>
                    {timetableDays.map((day) => (
                      <th key={day} className="p-2.5">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {timetablePeriods.map((period) => {
                    const entriesForPeriod = dbTimetable.filter((t: any) => t.periodNumber === period);
                    const timing = entriesForPeriod[0]
                      ? `${entriesForPeriod[0].startTime} - ${entriesForPeriod[0].endTime}`
                      : `Period ${period}`;

                    return (
                      <tr key={period} className="hover:bg-muted/30">
                        <td className="p-2.5 font-bold text-muted-foreground text-[10px] whitespace-nowrap">
                          {timing}
                        </td>
                        {timetableDays.map((day) => {
                          const entry = dbTimetable.find(
                            (t: any) => t.periodNumber === period && t.dayOfWeek === day
                          );

                          return (
                            <td key={day} className="p-2.5">
                              {entry ? (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-foreground block">
                                    {entry.subjectId?.code || entry.subjectId?.name || "Subject"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground block">
                                    {entry.roomNumber || "Classroom"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/40 text-[10px]">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center space-y-2">
                <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Timetable Configured</h4>
                <p className="text-xs text-muted-foreground">
                  The administration has not yet scheduled weekly timetable periods for {className}.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTimetableModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 11: NOTICES & CIRCULARS (From DB Announcements) */}
      <Dialog open={noticesModalOpen} onOpenChange={setNoticesModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-seneca-crimson" />
              <DialogTitle className="text-xl font-bold font-heading">
                School Circulars &amp; Official Notices
              </DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Official notifications published for students.
            </p>
          </DialogHeader>

          <div className="space-y-3 my-2">
            {dbAnnouncements.length > 0 ? (
              dbAnnouncements.map((n: any, idx: number) => (
                <div key={idx} className="border border-border/80 rounded-2xl p-4 bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                    <Badge className="bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30 text-[10px] font-bold uppercase">
                      {n.priority || "Notice"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.content}</p>
                  <span className="text-[10px] text-muted-foreground block font-semibold">
                    Published: {new Date(n.publishedAt || n.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl space-y-2">
                <Megaphone className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Circulars Published</h4>
                <p className="text-xs text-muted-foreground">
                  There are currently no active public announcements on the notice board.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNoticesModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentLearningDashboard;
