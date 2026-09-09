"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Building,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Award,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Layers,
  Download,
  Printer,
  ShieldCheck,
  Search,
  Filter,
  Info,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

interface SlotItem {
  id: string;
  dayOfWeek: string;
  periodNumber: number;
  time: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode?: string;
  teacherName: string;
  roomNumber: string;
}

interface HolidayItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
}

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  icon: string;
  colorTheme: string;
  priority: string;
  publishedAt: string;
}

interface ExamItem {
  id: string;
  title: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  totalMarks: number;
}

interface AttendanceRecordItem {
  id: string;
  date: string;
  dateFormatted: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
  recordedByTeacher: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentCalendarPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "attendance_log" | "timetable">("calendar");

  // Filter & Search for attendance log
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent" | "late" | "excused">("all");

  // Selected Day Details Modal
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    date: Date;
    dateStr: string;
    attendance?: AttendanceRecordItem;
    holidays: HolidayItem[];
    exams: ExamItem[];
    slots: SlotItem[];
  } | null>(null);

  useEffect(() => {
    fetchStudentCalendar();
  }, []);

  const fetchStudentCalendar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/calendar");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast.error(json.message || "Failed to load calendar data.");
      }
    } catch (err) {
      toast.error("Failed to fetch student calendar and attendance.");
    } finally {
      setLoading(false);
    }
  };

  const student = data?.student;
  const classTeacher = data?.classTeacher;
  const attendance = data?.attendance;
  const attendanceRecords: AttendanceRecordItem[] = attendance?.records || [];
  const weeklyTimetable: SlotItem[] = data?.weeklyTimetable || [];
  const todaySlots: SlotItem[] = data?.today?.slots || [];
  const holidays: HolidayItem[] = data?.holidays || [];
  const notices: NoticeItem[] = data?.notices || [];
  const exams: ExamItem[] = data?.exams || [];

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Filtered attendance records for log table
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      const matchesSearch =
        rec.dateFormatted.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        rec.date.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        (rec.remarks || "").toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        rec.recordedByTeacher.toLowerCase().includes(attendanceSearch.toLowerCase());
      const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [attendanceRecords, attendanceSearch, statusFilter]);

  // Export Attendance CSV
  const handleExportCSV = () => {
    if (attendanceRecords.length === 0) {
      toast.error("No attendance records to export.");
      return;
    }
    const headers = "Date,Status,Class Teacher,Remarks\n";
    const rows = attendanceRecords
      .map(
        (r) =>
          `"${r.dateFormatted}","${r.status.toUpperCase()}","${r.recordedByTeacher}","${(r.remarks || "").replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Seneca_Attendance_${student?.rollNumber || "Student"}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Attendance ledger exported successfully.");
  };

  // Day Click Inspector
  const handleDayClick = (dayNum: number) => {
    const thisDate = new Date(year, month, dayNum);
    const dateStr = thisDate.toISOString().slice(0, 10);
    const dayName = DAYS_OF_WEEK[thisDate.getDay()];

    const att = attendanceRecords.find((r) => r.date === dateStr);
    const dayHolidays = holidays.filter((h) => {
      const start = new Date(h.startDate);
      const end = new Date(h.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return thisDate >= start && thisDate <= end;
    });
    const dayExams = exams.filter(
      (e) => new Date(e.examDate).toDateString() === thisDate.toDateString()
    );
    const daySlots = weeklyTimetable.filter((s) => s.dayOfWeek === dayName);

    setSelectedDayInfo({
      date: thisDate,
      dateStr: thisDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      attendance: att,
      holidays: dayHolidays,
      exams: dayExams,
      slots: daySlots,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        <div className="h-36 rounded-3xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 rounded-3xl bg-muted/40 animate-pulse lg:col-span-2" />
          <div className="h-96 rounded-3xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-foreground">
      {/* 1. ACADEMIC CALENDAR & OFFICIAL ATTENDANCE BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-seneca-crimson/[0.04] p-6 shadow-lg backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-seneca-crimson/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold uppercase tracking-wider border border-seneca-crimson/20">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Official School Calendar &amp; Homeroom Attendance</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
              Academic Schedule, Attendance &amp; Leaves
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-foreground/90">
                <span className="text-seneca-crimson font-bold">Class:</span> {student?.className}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-foreground/90">
                <span className="text-seneca-crimson font-bold">Roll No:</span> {student?.rollNumber}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  Attendance Authority:{" "}
                  <strong className="text-foreground">{classTeacher?.name || "Class Teacher"}</strong>
                </span>
              </span>
            </div>
          </div>

          {/* Quick Attendance Rate Pill */}
          <div className="flex items-center gap-4 bg-muted/40 p-3.5 rounded-2xl border border-border/60 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Overall Attendance
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-emerald-600 font-heading">
                  {attendance?.rate || "100%"}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">Verified</span>
              </div>
            </div>

            <div className="h-10 w-px bg-border/80" />

            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Working Days
              </span>
              <span className="text-lg font-bold text-foreground mt-0.5">
                {attendance?.totalDays || 0} Recorded
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL CLASS TEACHER ATTENDANCE METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border-border/80 bg-card p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] uppercase font-extrabold tracking-wider">Present</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black font-heading text-emerald-700 dark:text-emerald-400">
            {attendance?.presentDays || 0}
          </p>
          <span className="text-[10px] text-muted-foreground block">On-time sessions</span>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] uppercase font-extrabold tracking-wider">Late Arrival</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black font-heading text-amber-700 dark:text-amber-400">
            {attendance?.lateDays || 0}
          </p>
          <span className="text-[10px] text-muted-foreground block">Late homeroom entries</span>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] uppercase font-extrabold tracking-wider">Absent</span>
            <XCircle className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black font-heading text-rose-700 dark:text-rose-400">
            {attendance?.absentDays || 0}
          </p>
          <span className="text-[10px] text-muted-foreground block">Unexcused absences</span>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] uppercase font-extrabold tracking-wider">Excused Leave</span>
            <FileText className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black font-heading text-blue-700 dark:text-blue-400">
            {attendance?.excusedDays || 0}
          </p>
          <span className="text-[10px] text-muted-foreground block">Sanctioned leaves</span>
        </Card>

        <Card className="col-span-2 sm:col-span-2 md:col-span-1 rounded-2xl border-border/80 bg-card p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-seneca-crimson">
            <span className="text-[11px] uppercase font-extrabold tracking-wider">Class Teacher</span>
            <User className="h-4 w-4" />
          </div>
          <p className="text-xs font-bold text-foreground truncate pt-1">
            {classTeacher?.name || "Assigned Teacher"}
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            Homeroom Authority
          </span>
        </Card>
      </div>

      {/* 3. NAVIGATION VIEW TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "calendar"
                ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>School Calendar &amp; Attendance Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("attendance_log")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative",
              activeTab === "attendance_log"
                ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Daily Homeroom Attendance Log ({attendanceRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("timetable")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "timetable"
                ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Weekly Class Timetable</span>
          </button>
        </div>

        {activeTab === "attendance_log" && (
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold gap-1.5 border-border/80 hover:border-emerald-500 hover:text-emerald-600"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Official CSV</span>
          </Button>
        )}
      </div>

      {/* 4. TAB 1: ACADEMIC CALENDAR & DAILY ATTENDANCE GRID */}
      {activeTab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Interactive Month Grid */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
              <CardHeader className="p-4 sm:p-5 border-b border-border flex flex-row items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-seneca-crimson" />
                  <CardTitle className="text-base font-bold">{monthName}</CardTitle>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={handlePrevMonth}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setCurrentDate(new Date())}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-bold rounded-lg"
                  >
                    Current Month
                  </Button>
                  <Button
                    onClick={handleNextMonth}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    title="Next Month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-3">
                {/* Attendance Legend Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50 text-[11px]">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                    Daily Attendance:
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Late
                    </span>
                    <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-bold">
                      <span className="h-2 w-2 rounded-full bg-rose-500" /> Absent
                    </span>
                    <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400 font-bold">
                      <span className="h-2 w-2 rounded-full bg-blue-500" /> Leave
                    </span>
                    <span className="flex items-center gap-1 text-purple-700 dark:text-purple-400 font-bold">
                      <span>📝</span> Exam
                    </span>
                    <span className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold">
                      <span>🏖️</span> Holiday
                    </span>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-muted-foreground">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[85px] rounded-xl bg-muted/10 opacity-30" />
                  ))}

                  {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const thisDate = new Date(year, month, dayNum);
                    const dateStr = thisDate.toISOString().slice(0, 10);
                    const isToday = thisDate.toDateString() === new Date().toDateString();

                    // Attendance on this day (Class teacher homeroom record)
                    const att = attendanceRecords.find((r) => r.date === dateStr);

                    // Holidays on this day
                    const dayHolidays = holidays.filter((h) => {
                      const start = new Date(h.startDate);
                      const end = new Date(h.endDate);
                      start.setHours(0, 0, 0, 0);
                      end.setHours(23, 59, 59, 999);
                      return thisDate >= start && thisDate <= end;
                    });

                    // Exams on this day
                    const dayExams = exams.filter(
                      (e) => new Date(e.examDate).toDateString() === thisDate.toDateString()
                    );

                    const hasHoliday = dayHolidays.length > 0;
                    const hasExam = dayExams.length > 0;

                    return (
                      <div
                        key={dayNum}
                        onClick={() => handleDayClick(dayNum)}
                        className={cn(
                          "min-h-[88px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer hover:scale-[1.02] hover:shadow-md",
                          hasHoliday
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
                            : hasExam
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-950 dark:text-purple-100"
                            : att?.status === "present"
                            ? "bg-emerald-500/[0.06] border-emerald-500/30"
                            : att?.status === "late"
                            ? "bg-amber-500/[0.06] border-amber-500/30"
                            : att?.status === "absent"
                            ? "bg-rose-500/[0.08] border-rose-500/40"
                            : att?.status === "excused"
                            ? "bg-blue-500/[0.06] border-blue-500/30"
                            : "bg-card border-border/70 hover:bg-muted/30",
                          isToday && "ring-2 ring-seneca-crimson shadow-sm font-bold"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center",
                              isToday ? "bg-seneca-crimson text-white font-extrabold" : "text-foreground"
                            )}
                          >
                            {dayNum}
                          </span>

                          <div className="flex items-center gap-1">
                            {hasHoliday && <span className="text-[11px]" title={dayHolidays[0].title}>🏖️</span>}
                            {hasExam && <span className="text-[11px]" title={`Exam: ${dayExams[0].subjectName}`}>📝</span>}
                          </div>
                        </div>

                        {/* Attendance / Event Indicator Badge */}
                        <div className="space-y-1 mt-1">
                          {hasHoliday ? (
                            <div className="text-[9px] font-bold truncate px-1 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                              {dayHolidays[0].title}
                            </div>
                          ) : hasExam ? (
                            <div className="text-[9px] font-bold truncate px-1 py-0.5 rounded bg-purple-500/20 text-purple-800 dark:text-purple-200">
                              {dayExams[0].subjectName}
                            </div>
                          ) : att ? (
                            <div
                              className={cn(
                                "text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1",
                                att.status === "present"
                                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                  : att.status === "late"
                                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                  : att.status === "absent"
                                  ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                                  : "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  att.status === "present"
                                    ? "bg-emerald-500"
                                    : att.status === "late"
                                    ? "bg-amber-500"
                                    : att.status === "absent"
                                    ? "bg-rose-500"
                                    : "bg-blue-500"
                                )}
                              />
                              <span className="truncate">{att.status}</span>
                            </div>
                          ) : (
                            <span className="text-[9px] text-muted-foreground/50 block">Class Day</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Today's Homeroom Class Period Schedule */}
            <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
              <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-seneca-crimson" />
                    <span>Today&apos;s Class Schedule ({data?.today?.dayName})</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {todaySlots.length} Scheduled Periods for your class.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5">
                {todaySlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No classes scheduled for today.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {todaySlots.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1.5 hover:border-seneca-crimson/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <Badge className="bg-seneca-crimson/10 text-seneca-crimson text-[9px] font-bold">
                            Period {s.periodNumber}
                          </Badge>
                          <span className="text-[10px] font-mono text-seneca-amber-dark dark:text-seneca-amber font-semibold">
                            {s.time}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-foreground">{s.subjectName}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          Teacher: <span className="font-semibold text-foreground">{s.teacherName}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3 text-primary" /> {s.roomNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right 4 Cols: Notices, Leaves & Class Teacher Homeroom Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Homeroom & Attendance Policy Note */}
            <Card className="rounded-3xl border-border shadow-sm p-5 bg-card space-y-3.5">
              <div className="flex items-center gap-2 text-seneca-crimson font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Attendance Policy</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Daily classroom attendance is taken exclusively by your designated Class Teacher (
                <strong className="text-foreground">{classTeacher?.name || "Class Teacher"}</strong>) during morning
                homeroom assembly. There is no separate subject-wise attendance; your single daily homeroom record serves as
                the official institutional attendance.
              </p>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-[11px] space-y-1">
                <span className="font-bold text-foreground block">Class Teacher Contact:</span>
                <p className="text-muted-foreground">{classTeacher?.email || "faculty@seneca.edu.pk"}</p>
                <p className="text-muted-foreground">{classTeacher?.phone || "+92 (042) 111-SENECA"}</p>
              </div>
            </Card>

            {/* Official Circular Notices */}
            <Card className="rounded-3xl border-border shadow-sm p-5 bg-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-seneca-crimson" />
                  <span>School Notices &amp; Circulars</span>
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {notices.length} Notices
                </Badge>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto">
                {notices.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No circular notices at this time.</p>
                ) : (
                  notices.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>{n.icon || "📢"}</span>
                          <span className="truncate max-w-[180px]">{n.title}</span>
                        </span>
                        {n.priority === "urgent" && (
                          <Badge className="bg-rose-500 text-white text-[8px] font-extrabold">
                            URGENT
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-3">{n.content}</p>
                      <span className="text-[9px] text-muted-foreground block font-mono">
                        {new Date(n.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Upcoming School Holidays */}
            <Card className="rounded-3xl border-border shadow-sm p-5 bg-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Upcoming Holidays &amp; Breaks</span>
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {holidays.length} Leaves
                </Badge>
              </div>

              <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
                {holidays.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No upcoming holidays scheduled.</p>
                ) : (
                  holidays.map((h) => {
                    const s = new Date(h.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    const e = new Date(h.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <div
                        key={h.id}
                        className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-amber-900 dark:text-amber-200">{h.title}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {s === e ? s : `${s} – ${e}`}
                          </span>
                        </div>
                        <span className="text-base">🏖️</span>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 5. TAB 2: DAILY HOMEROOM ATTENDANCE LOG (OFFICIAL LEDGER) */}
      {activeTab === "attendance_log" && (
        <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-seneca-crimson" />
                <span>Class Teacher Homeroom Attendance Ledger</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Chronological record of student presence recorded by Class Teacher {classTeacher?.name}.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search date or remarks..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-card border-border/80"
                />
              </div>

              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/60 text-xs">
                {(["all", "present", "late", "absent", "excused"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] transition-all",
                      statusFilter === st
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto rounded-2xl border border-border/80">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] uppercase font-bold border-b border-border/80">
                <tr>
                  <th className="px-4 py-3.5">Session Date</th>
                  <th className="px-4 py-3.5">Recorded Status</th>
                  <th className="px-4 py-3.5">Marked By Authority</th>
                  <th className="px-4 py-3.5">Official Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-foreground whitespace-nowrap">
                        {row.dateFormatted}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Badge
                          className={cn(
                            "text-[10px] font-extrabold uppercase px-2.5 py-0.5",
                            row.status === "present"
                              ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                              : row.status === "late"
                              ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                              : row.status === "absent"
                              ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                              : "bg-blue-500/15 text-blue-600 border border-blue-500/30"
                          )}
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-seneca-crimson" />
                        <span>{row.recordedByTeacher}</span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {row.remarks || "Regular Homeroom Assembly Presence"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No attendance records found matching the specified filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 6. TAB 3: WEEKLY CLASS TIMETABLE */}
      {activeTab === "timetable" && (
        <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card space-y-4 p-6">
          <div className="border-b border-border/80 pb-4">
            <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-seneca-crimson" />
              <span>Weekly Academic Teaching Timetable ({student?.className})</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Official weekly period allocation and room designations for enrolled subjects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
              const daySlots = weeklyTimetable.filter((s) => s.dayOfWeek === day);
              return (
                <div
                  key={day}
                  className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <span className="font-bold text-sm text-foreground">{day}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {daySlots.length} Periods
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {daySlots.length > 0 ? (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 rounded-xl bg-card border border-border/60 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-extrabold text-seneca-crimson">
                              Period {slot.periodNumber}
                            </span>
                            <span className="font-mono text-muted-foreground font-semibold">
                              {slot.time}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-foreground">{slot.subjectName}</h4>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                            <span>{slot.teacherName}</span>
                            <span>{slot.roomNumber}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-4 text-center">
                        No periods scheduled.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 7. DAY DETAILS MODAL INSPECTOR */}
      <Dialog open={!!selectedDayInfo} onOpenChange={() => setSelectedDayInfo(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-seneca-crimson" />
              <DialogTitle className="text-lg font-bold font-heading">
                {selectedDayInfo?.dateStr}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Daily schedule, homeroom attendance status, and academic notices for this date.
            </DialogDescription>
          </DialogHeader>

          {selectedDayInfo && (
            <div className="space-y-4 my-2">
              {/* Attendance Status */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">
                  Class Homeroom Attendance
                </span>
                {selectedDayInfo.attendance ? (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            "text-xs font-bold uppercase",
                            selectedDayInfo.attendance.status === "present"
                              ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                              : selectedDayInfo.attendance.status === "late"
                              ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                              : selectedDayInfo.attendance.status === "absent"
                              ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                              : "bg-blue-500/15 text-blue-600 border border-blue-500/30"
                          )}
                        >
                          {selectedDayInfo.attendance.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Marked by {selectedDayInfo.attendance.recordedByTeacher}
                        </span>
                      </div>
                      {selectedDayInfo.attendance.remarks && (
                        <p className="text-[11px] text-muted-foreground italic pt-1">
                          Note: &ldquo;{selectedDayInfo.attendance.remarks}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No attendance mark recorded on this date (Weekend / Off-day).
                  </p>
                )}
              </div>

              {/* Holidays or Exams */}
              {selectedDayInfo.holidays.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <span>🏖️</span> School Holiday: {selectedDayInfo.holidays[0].title}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedDayInfo.holidays[0].description}
                  </p>
                </div>
              )}

              {selectedDayInfo.exams.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <span>📝</span> Scheduled Exam: {selectedDayInfo.exams[0].title} (
                    {selectedDayInfo.exams[0].subjectName})
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Room: {selectedDayInfo.exams[0].roomNumber} • Time: {selectedDayInfo.exams[0].startTime} -{" "}
                    {selectedDayInfo.exams[0].endTime}
                  </p>
                </div>
              )}

              {/* Day Timetable */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Scheduled Class Periods ({selectedDayInfo.slots.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedDayInfo.slots.length > 0 ? (
                    selectedDayInfo.slots.map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-card border border-border/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-foreground block">{s.subjectName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {s.teacherName} • Room {s.roomNumber}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {s.time}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-2">
                      No timetable periods for this day.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedDayInfo(null)}
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
