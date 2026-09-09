"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CalendarCheck,
  FolderOpen,
  FileText,
  Award,
  MessageSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  Plus,
  ChevronRight,
  Calendar,
  Layers,
  Sliders,
  Check,
  Mail,
  UserCheck,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  id: string;
  period: string;
  time: string;
  subject: string;
  subjectCode?: string;
  className: string;
  section: string;
  room: string;
  day?: string;
  status: string;
}

interface PendingSubmission {
  id: string;
  studentName: string;
  rollNumber: string;
  assignmentTitle: string;
  className: string;
  submittedAt: string;
  status: string;
}

interface RecentMessage {
  id: string;
  senderName: string;
  senderRole: string;
  snippet: string;
  time: string;
}

interface TeachingBookSummary {
  id: string;
  name: string;
  code: string;
  department: string;
  classesCount: number;
  enrolledStudentsCount: number;
}

interface TeacherFacultyDashboardProps {
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  specialization?: string;
  employeeId?: string;
  todayDayName?: string;
  isClassTeacher?: boolean;
  stats: {
    totalStudents: number;
    totalClasses: number;
    activeAssignments: number;
    pendingGrading: number;
    scheduledQuizzes: number;
    totalMaterials: number;
    avgAttendance: string;
    teachingBooksCount: number;
  };
  todaySchedule?: ScheduleItem[];
  pendingSubmissions?: PendingSubmission[];
  recentMessages?: RecentMessage[];
  teachingBooks?: TeachingBookSummary[];
}

export function TeacherFacultyDashboard({
  userName,
  userEmail,
  avatarUrl,
  specialization = "Academic Faculty",
  employeeId = "FAC-2026",
  todayDayName = "Today",
  isClassTeacher = false,
  stats,
  todaySchedule = [],
  pendingSubmissions = [],
  recentMessages = [],
  teachingBooks = [],
}: TeacherFacultyDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "schedule">("overview");

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Hero Faculty Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-5 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <Sparkles className="h-3 w-3 text-seneca-amber" />
                <span>Faculty Classroom Command Center</span>
              </span>
              {isClassTeacher ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 text-amber-200 text-[11px] font-bold border border-amber-500/30">
                  <Crown className="h-3 w-3 text-seneca-amber-light" />
                  <span>Class In-Charge Authorized</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Academic Session 2026–2027</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Welcome Back, <span className="text-seneca-amber">{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Your digital teaching desk is ready. You have{" "}
              <strong className="text-seneca-amber">
                {todaySchedule.length > 0 ? `${todaySchedule.length} classes` : `${stats.totalClasses} class sections`}
              </strong>{" "}
              on your roster and{" "}
              <strong className="text-seneca-amber">{stats.pendingGrading} pending submissions</strong> awaiting marks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isClassTeacher && (
              <Button asChild variant="glow" size="sm" className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20">
                <Link href="/teacher/attendance">
                  <CalendarCheck className="h-4 w-4" />
                  <span>Take Attendance</span>
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Link href="/teacher/books">
                <BookOpen className="h-4 w-4 mr-1.5" />
                <span>Teaching Books</span>
              </Link>
            </Button>
            {!isClassTeacher && (
              <Button asChild variant="glow" size="sm" className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20">
                <Link href="/teacher/assignments">
                  <FileText className="h-4 w-4" />
                  <span>Grading Studio</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Faculty Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-crimson/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-2.5 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson group-hover:bg-seneca-crimson group-hover:text-white transition-colors">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {stats.totalStudents}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Across {stats.totalClasses} Class {stats.totalClasses === 1 ? "Section" : "Sections"}
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-amber/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pending Grading
            </span>
            <div className="p-2.5 rounded-2xl bg-seneca-amber/15 text-seneca-amber group-hover:bg-seneca-amber group-hover:text-zinc-950 transition-colors">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-seneca-amber">
              {stats.pendingGrading}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Submissions Awaiting Evaluation
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isClassTeacher ? "Class Attendance" : "Active Assignments"}
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              {isClassTeacher ? <CalendarCheck className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-600">
              {isClassTeacher ? stats.avgAttendance : stats.activeAssignments}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{isClassTeacher ? "Target Benchmark Met" : "Active Student Tasks"}</span>
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-sky-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Teaching Books
            </span>
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <FolderOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {stats.teachingBooksCount}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {stats.totalMaterials} Courseware Documents
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Today's Class Timetable & Pending Grading Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Today's Live Schedule */}
        <Card className="lg:col-span-7 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold font-heading text-sm sm:text-base text-foreground">
                  Today&apos;s Class Schedule &amp; Timetable
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {todayDayName} • Seneca Academic Session
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold rounded-xl gap-1 border-border/80 hover:border-seneca-crimson/40">
                <Link href="/teacher/timetable">
                  <Clock className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Full Timetable</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-2">
                <Clock className="h-7 w-7 text-muted-foreground mx-auto" />
                <p className="text-xs font-bold text-foreground">No Classes Scheduled for Today</p>
                <p className="text-[11px] text-muted-foreground">
                  Enjoy your preparation time or check your upcoming weekly periods.
                </p>
                <Button asChild variant="outline" size="sm" className="rounded-xl text-xs mt-2">
                  <Link href="/teacher/timetable">View Weekly Timetable</Link>
                </Button>
              </div>
            ) : (
              todaySchedule.map((slot, index) => (
                <div
                  key={slot.id || index}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                    slot.status === "active"
                      ? "bg-primary/10 border-primary/40 shadow-sm"
                      : "bg-card border-border/60 hover:border-seneca-crimson/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center font-mono font-extrabold text-xs shrink-0 mt-0.5",
                        slot.status === "active"
                          ? "bg-seneca-amber text-zinc-950 shadow-sm"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-foreground">{slot.subject}</h4>
                        {slot.subjectCode && (
                          <Badge variant="outline" className="text-[9px] font-mono border-none bg-muted/60">
                            {slot.subjectCode}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-semibold pt-0.5">
                        {slot.className} (Sec {slot.section}) • {slot.room}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-mono">{slot.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isClassTeacher ? (
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold rounded-xl">
                        <Link href="/teacher/attendance">
                          <CalendarCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                          <span>Attendance</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold rounded-xl">
                        <Link href="/teacher/timetable">
                          <Clock className="h-3.5 w-3.5 mr-1 text-blue-600" />
                          <span>Timetable</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right 5 Cols: Pending Homework Grading Review Deck */}
        <Card className="lg:col-span-5 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-seneca-amber/15 text-seneca-amber">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold font-heading text-sm sm:text-base text-foreground">
                    Pending Grading Queue
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Recent student homework submissions</p>
                </div>
              </div>

              <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-seneca-crimson">
                <Link href="/teacher/assignments">
                  <span>View All</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="space-y-2.5">
              {pendingSubmissions.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-border text-center space-y-2">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-foreground">Grading Queue is Clear</p>
                  <p className="text-[11px] text-muted-foreground">
                    All student homework submissions have been evaluated and graded.
                  </p>
                </div>
              ) : (
                pendingSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-2xl bg-muted/40 border border-border/60 hover:border-seneca-amber/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-foreground truncate">{sub.studentName}</h4>
                        <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground border-none">
                          {sub.rollNumber}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate font-medium">{sub.assignmentTitle}</p>
                      <span className="text-[10px] text-muted-foreground">{sub.submittedAt}</span>
                    </div>

                    <Button asChild variant="outline" size="sm" className="h-7 px-2.5 text-[10px] font-bold rounded-lg shrink-0 gap-1">
                      <Link href="/teacher/assignments">
                        <Sliders className="h-3 w-3 text-seneca-amber" />
                        <span>Grade</span>
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <Button asChild variant="glow" size="sm" className="w-full rounded-xl text-xs font-bold gap-1.5 justify-center">
              <Link href="/teacher/assignments">
                <Award className="h-3.5 w-3.5" />
                <span>Open Evaluation Studio</span>
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* 4. Quick Academic Tool Launchpad Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Classroom Suite &amp; Academic Tools
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-5 hover:border-seneca-crimson/40 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="h-10 w-10 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center group-hover:bg-seneca-crimson group-hover:text-white transition-colors">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-heading text-foreground group-hover:text-seneca-crimson transition-colors">
                  My Teaching Books
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                  Explore courseware, syllabus, assignments, quizzes, notices, and student rosters.
                </p>
              </div>
            </div>

            <Button asChild variant="ghost" size="sm" className="mt-4 p-0 h-auto text-xs font-bold text-seneca-crimson group-hover:translate-x-0.5 transition-transform justify-start">
              <Link href="/teacher/books" className="flex items-center gap-1">
                <span>Open Book Center</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>

          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-5 hover:border-seneca-amber/40 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="h-10 w-10 rounded-2xl bg-seneca-amber/15 text-seneca-amber flex items-center justify-center group-hover:bg-seneca-amber group-hover:text-zinc-950 transition-colors">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-heading text-foreground group-hover:text-seneca-amber transition-colors">
                  My Students &amp; Roster
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                  Class rosters, performance dossiers, guardian details, and emergency contacts.
                </p>
              </div>
            </div>

            <Button asChild variant="ghost" size="sm" className="mt-4 p-0 h-auto text-xs font-bold text-seneca-amber-dark dark:text-seneca-amber group-hover:translate-x-0.5 transition-transform justify-start">
              <Link href="/teacher/students" className="flex items-center gap-1">
                <span>View Class Roster</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>

          {isClassTeacher ? (
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-5 hover:border-emerald-500/40 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm font-heading text-foreground group-hover:text-emerald-600 transition-colors">
                      Daily Attendance
                    </h4>
                    <Badge variant="outline" className="text-[9px] font-bold text-seneca-amber border-seneca-amber/30 bg-seneca-amber/10 px-1 py-0 h-4">
                      Head of Class
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                    Mark daily homeroom attendance and monitor class absence trends.
                  </p>
                </div>
              </div>

              <Button asChild variant="ghost" size="sm" className="mt-4 p-0 h-auto text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform justify-start">
                <Link href="/teacher/attendance" className="flex items-center gap-1">
                  <span>Open Register</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </Card>
          ) : (
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-5 hover:border-emerald-500/40 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm font-heading text-foreground group-hover:text-emerald-600 transition-colors">
                    Course Materials Hub
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                    Lecture slides, topic worksheets, lab protocols, and past papers repository.
                  </p>
                </div>
              </div>

              <Button asChild variant="ghost" size="sm" className="mt-4 p-0 h-auto text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform justify-start">
                <Link href="/teacher/materials" className="flex items-center gap-1">
                  <span>Lecture Hub</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </Card>
          )}

          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-5 hover:border-indigo-500/40 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-heading text-foreground group-hover:text-indigo-600 transition-colors">
                  Exam Marks &amp; Gazette
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                  Record Mid-Term &amp; Final Term exam marks, calculate Cambridge letter grades and GPAs.
                </p>
              </div>
            </div>

            <Button asChild variant="ghost" size="sm" className="mt-4 p-0 h-auto text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform justify-start">
              <Link href="/teacher/exams" className="flex items-center gap-1">
                <span>Enter Marks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TeacherFacultyDashboard;
