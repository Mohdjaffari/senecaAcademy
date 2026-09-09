"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  Sparkles,
  Loader2,
  RefreshCw,
  X,
  Building,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  LayoutGrid,
  List,
  Share2,
  Printer,
  FileSpreadsheet,
  Check,
  UserCheck,
  UserX,
  ArrowRight,
  Info,
  PhoneCall,
  MessageSquare,
  DoorOpen,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ACADEMIC_SPECTRUM } from "@/lib/constants/academic-spectrum";

interface AttendanceRecord {
  id: string;
  date: string;
  formattedDate: string;
  classInfo: {
    id: string;
    name: string;
    section: string;
    fullName: string;
  };
  teacher: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  presentRate: number;
  records: {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    rollNumber: string;
    status: "present" | "absent" | "late" | "excused";
    remarks?: string;
  }[];
  createdAt?: string;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
  fullName: string;
  gradeLevel?: number;
  capacity?: number;
  enrolledCount?: number;
  roomNumber?: string;
  classTeacher?: {
    id?: string;
    name?: string;
    phone?: string;
  };
  department?: {
    id?: string;
    name?: string;
    code?: string;
    colorCode?: string;
    wing?: string;
  };
}

const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

export default function PrincipalAttendancePage() {
  const [sessions, setSessions] = useState<AttendanceRecord[]>([]);
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedWingFilter, setSelectedWingFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedDatePreset, setSelectedDatePreset] = useState<"today" | "yesterday" | "all" | "custom">("today");
  const [viewMode, setViewMode] = useState<"radar" | "ledger">("radar");

  // Detailed Student Roll Dialog (Read-only progress & inspection)
  const [selectedSession, setSelectedSession] = useState<AttendanceRecord | null>(null);
  const [rollFilterStatus, setRollFilterStatus] = useState<"all" | "present" | "absent" | "late" | "excused">("all");
  const [rollSearchQuery, setRollSearchQuery] = useState("");

  // Fetch Attendance Sessions from Database
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = "/api/attendance?";
      if (selectedClassFilter !== "all") url += `classId=${selectedClassFilter}&`;
      if (selectedDate && selectedDatePreset !== "all") url += `date=${selectedDate}&`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.attendance)) {
        setSessions(data.data.attendance);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error("Failed to load attendance:", err);
      toast.error("Error loading attendance records.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Active Classes from Database
  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await fetch("/api/classes", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.classes)) {
        const mapped = data.data.classes.map((c: any) => ({
          id: c.id || c._id,
          name: c.name,
          section: c.section,
          fullName: `${c.name}-${c.section}`,
          gradeLevel: c.gradeLevel ?? 0,
          capacity: c.capacity || 35,
          enrolledCount: c.enrolledCount || 0,
          roomNumber: c.roomNumber || `Room-${c.section}`,
          classTeacher: c.classTeacher
            ? {
                id: c.classTeacher.id,
                name: c.classTeacher.name,
                phone: c.classTeacher.phone,
              }
            : undefined,
          department: c.department
            ? {
                id: c.department.id,
                name: c.department.name,
                code: c.department.code,
                colorCode: c.department.colorCode,
                wing: c.department.wing,
              }
            : undefined,
        }));
        setClassesList(mapped);
      } else {
        setClassesList([]);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setClassesList([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedClassFilter, selectedDate, selectedDatePreset]);

  // Date Preset Switcher Handler
  const handleDatePreset = (preset: "today" | "yesterday" | "all" | "custom") => {
    setSelectedDatePreset(preset);
    if (preset === "today") {
      setSelectedDate(getTodayDateString());
    } else if (preset === "yesterday") {
      setSelectedDate(getYesterdayDateString());
    } else if (preset === "all") {
      setSelectedDate("");
    }
  };

  // Helper to determine Academic Wing of a class
  const getAcademicWing = (className: string) => {
    const spec = ACADEMIC_SPECTRUM.find((s) => s.name.toLowerCase() === className.toLowerCase());
    if (spec?.wing) return spec.wing;
    const low = className.toLowerCase();
    if (["playgroup", "nursery", "prep", "kg", "early"].some((k) => low.includes(k))) return "Early Years";
    if (["grade 1", "grade 2", "grade 3", "grade 4", "grade 5"].some((k) => low.includes(k))) return "Primary";
    if (["grade 6", "grade 7", "grade 8"].some((k) => low.includes(k))) return "Middle";
    if (["grade 9", "grade 10", "matric", "o-level", "ssc"].some((k) => low.includes(k))) return "Secondary";
    if (["1st year", "2nd year", "grade 11", "grade 12", "fsc", "ics", "icom", "fa", "a-level"].some((k) => low.includes(k)))
      return "Higher Secondary";
    return "Primary";
  };

  // 100% Real Database Calculations (No Dummy or Hardcoded Fallbacks)
  const totalEnrolledStudents = useMemo(() => {
    return classesList.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  }, [classesList]);

  const totalPresent = useMemo(() => {
    return sessions.reduce((acc, curr) => acc + (curr.presentCount || 0), 0);
  }, [sessions]);

  const totalAbsent = useMemo(() => {
    return sessions.reduce((acc, curr) => acc + (curr.absentCount || 0), 0);
  }, [sessions]);

  const totalLate = useMemo(() => {
    return sessions.reduce((acc, curr) => acc + (curr.lateCount || 0), 0);
  }, [sessions]);

  const totalExcused = useMemo(() => {
    return sessions.reduce((acc, curr) => acc + (curr.excusedCount || 0), 0);
  }, [sessions]);

  const totalRecordedStudents = useMemo(() => {
    return sessions.reduce((acc, curr) => acc + (curr.totalStudents || 0), 0);
  }, [sessions]);

  const institutionalRate = useMemo(() => {
    if (totalRecordedStudents === 0) return 0;
    return Math.round(((totalPresent + totalLate) / totalRecordedStudents) * 100);
  }, [totalRecordedStudents, totalPresent, totalLate]);

  const reportedClassesCount = useMemo(() => {
    const set = new Set(sessions.map((s) => s.classInfo.id));
    return set.size;
  }, [sessions]);

  const totalActiveClassesCount = classesList.length;
  const complianceRate = useMemo(() => {
    if (totalActiveClassesCount === 0) return 0;
    return Math.round((reportedClassesCount / totalActiveClassesCount) * 100);
  }, [reportedClassesCount, totalActiveClassesCount]);

  // Wing Statistics computed 100% from Database
  const wingBreakdown = useMemo(() => {
    const wings = [
      { id: "Early Years", label: "Early Years Wing", color: "text-amber-500", bg: "bg-amber-500" },
      { id: "Primary", label: "Primary Wing (Grades 1-5)", color: "text-emerald-500", bg: "bg-emerald-500" },
      { id: "Middle", label: "Middle Wing (Grades 6-8)", color: "text-blue-500", bg: "bg-blue-500" },
      { id: "Secondary", label: "Secondary / Matric", color: "text-indigo-500", bg: "bg-indigo-500" },
      { id: "Higher Secondary", label: "College (1st & 2nd Yr)", color: "text-purple-500", bg: "bg-purple-500" },
    ];

    return wings.map((w) => {
      const wingClasses = classesList.filter((c) => getAcademicWing(c.name) === w.id);
      const wingClassIds = new Set(wingClasses.map((c) => c.id));
      const wingSessions = sessions.filter((s) => wingClassIds.has(s.classInfo.id));

      const wTotal = wingSessions.reduce((acc, s) => acc + (s.totalStudents || 0), 0);
      const wPresent = wingSessions.reduce((acc, s) => acc + (s.presentCount || 0) + (s.lateCount || 0), 0);
      const wRate = wTotal > 0 ? Math.round((wPresent / wTotal) * 100) : 0;
      const wReported = wingSessions.length;
      const wCapacity = wingClasses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

      return {
        ...w,
        totalClasses: wingClasses.length,
        reportedClasses: wReported,
        enrolledCount: wCapacity,
        recordedStudents: wTotal,
        presentCount: wPresent,
        attendanceRate: wRate,
      };
    });
  }, [classesList, sessions]);

  // Filtered Sessions for Ledger Table & Search
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch =
        s.classInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.formattedDate.toLowerCase().includes(searchQuery.toLowerCase());

      const wing = getAcademicWing(s.classInfo.name);
      const matchesWing = selectedWingFilter === "all" || wing === selectedWingFilter;

      return matchesSearch && matchesWing;
    });
  }, [sessions, searchQuery, selectedWingFilter]);

  // Filtered Classes for Radar Grid
  const filteredClassesForRadar = useMemo(() => {
    return classesList.filter((c) => {
      const matchesSearch =
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.classTeacher?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.roomNumber || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClassFilter === "all" || c.id === selectedClassFilter;
      const wing = getAcademicWing(c.name);
      const matchesWing = selectedWingFilter === "all" || wing === selectedWingFilter;

      return matchesSearch && matchesClass && matchesWing;
    });
  }, [classesList, searchQuery, selectedClassFilter, selectedWingFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      toast.info("No attendance records to export for this selection.");
      return;
    }
    const headers = "Date,Academic Class,Faculty Mentor,Total Students,Present,Absent,Late,Excused,Attendance Rate (%)\n";
    const rows = sessions
      .map(
        (s) =>
          `"${s.formattedDate}","${s.classInfo.fullName}","${s.teacher}",${s.totalStudents},${s.presentCount},${s.absentCount},${s.lateCount},${s.excusedCount},"${s.presentRate}%"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Seneca_Attendance_Progress_Radar_${selectedDate || "All"}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Attendance progress radar logs exported to CSV!");
  };

  // Filtered Student Roll inside Modal
  const filteredRollRecords = useMemo(() => {
    if (!selectedSession) return [];
    return selectedSession.records.filter((r) => {
      const matchesFilter = rollFilterStatus === "all" || r.status === rollFilterStatus;
      const matchesSearch =
        r.studentName.toLowerCase().includes(rollSearchQuery.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(rollSearchQuery.toLowerCase()) ||
        r.admissionNumber.toLowerCase().includes(rollSearchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [selectedSession, rollFilterStatus, rollSearchQuery]);

  // WhatsApp Absentee Alert Trigger
  const handleSendWhatsAppAlert = (studentName: string, rollNo: string, className: string, dateStr: string) => {
    const text = `🏛️ *SENECA ACADEMY - OFFICIAL ATTENDANCE NOTICE* 🏛️\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Dear Guardian / Parent,\n\n` +
      `This is an official automated notification from Seneca Academy Administration.\n` +
      `Your child *${studentName}* (Roll #: ${rollNo}) in class *${className}* has been marked *ABSENT* today (${dateStr}).\n\n` +
      `If this absence is due to illness or pre-approved leave, please notify the school office at 021-32250000 or reply to this message.\n\n` +
      `Seneca Academy Student Affairs Desk`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    toast.success(`WhatsApp alert template generated for ${studentName}!`);
  };

  const handlePrintAttendanceSheet = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300 w-full overflow-x-hidden pb-12">
      {/* 1. Header & Hero Metric Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-7 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <CalendarCheck className="h-3 w-3" />
                <span>Executive Attendance Oversight</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Classroom Progress Sync</span>
              </span>
              <span className="text-[10px] text-white/70 font-mono">
                {totalActiveClassesCount} Active Class Sections
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Class Attendance <span className="text-seneca-amber">Progress Radar</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Supervise classroom attendance submission progress, inspect individual section rolls, review punctuality rates, and audit absentees across all educational wings (Playgroup through 2nd Year).
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center h-10 sm:h-9"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Export Audit Report (CSV)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Live KPI Cards (4 Real-Time Analytics Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Attendance Rate */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md sm:shadow-xl rounded-2xl p-3 sm:p-5 space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Institutional Rate
            </span>
            <div className={cn(
              "p-1.5 rounded-xl shrink-0",
              institutionalRate >= 85 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : institutionalRate >= 70 ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
            )}>
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
              {institutionalRate}%
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              ({totalRecordedStudents} recorded)
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Progress Status:</span>
            <span className={cn(
              "font-bold",
              institutionalRate >= 90 ? "text-emerald-600" : institutionalRate >= 75 ? "text-amber-600" : institutionalRate > 0 ? "text-rose-600" : "text-muted-foreground"
            )}>
              {institutionalRate >= 90 ? "High Punctuality" : institutionalRate >= 75 ? "Satisfactory" : institutionalRate > 0 ? "Needs Review" : "No Roll Today"}
            </span>
          </div>
        </Card>

        {/* Card 2: Total Present */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md sm:shadow-xl rounded-2xl p-3 sm:p-5 space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Students Present
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
              {totalPresent}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              / {totalEnrolledStudents || totalRecordedStudents} enrolled
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>In Classrooms:</span>
            <span className="font-bold text-emerald-600">Active & Marked</span>
          </div>
        </Card>

        {/* Card 3: Absent Students */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md sm:shadow-xl rounded-2xl p-3 sm:p-5 space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Absent Today
            </span>
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-extrabold font-heading text-rose-600 dark:text-rose-400">
              {totalAbsent}
            </span>
            {totalRecordedStudents > 0 && (
              <span className="text-[10px] text-rose-500/80 font-medium">
                ({Math.round((totalAbsent / totalRecordedStudents) * 100)}% unexcused)
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Follow-up:</span>
            <span className="font-bold text-foreground">
              {totalAbsent > 0 ? "WhatsApp Alert Ready" : "Zero Absentees"}
            </span>
          </div>
        </Card>

        {/* Card 4: Section Compliance & Submission Progress */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md sm:shadow-xl rounded-2xl p-3 sm:p-5 space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Section Compliance
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-amber/15 text-seneca-amber shrink-0">
              <DoorOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
              {reportedClassesCount} / {totalActiveClassesCount}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              ({complianceRate}%)
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Late Check-ins:</span>
            <span className="font-bold text-seneca-amber">{totalLate} students</span>
          </div>
        </Card>
      </div>

      {/* 3. Academic Wing Distribution Strip (Live Progress by Tier) */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-seneca-crimson shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-foreground font-heading">
              Academic Wing Progress Breakdown
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            Calculated across all {totalActiveClassesCount} class sections
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {wingBreakdown.map((wing) => (
            <div
              key={wing.id}
              onClick={() => setSelectedWingFilter(selectedWingFilter === wing.id ? "all" : wing.id)}
              className={cn(
                "p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5",
                selectedWingFilter === wing.id
                  ? "bg-seneca-crimson/5 border-seneca-crimson ring-1 ring-seneca-crimson shadow-xs"
                  : "bg-muted/30 border-border/70 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground truncate">{wing.label.split(" ")[0]} Wing</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-bold px-1.5 py-0.2",
                    wing.attendanceRate >= 90
                      ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/30"
                      : wing.attendanceRate >= 70
                      ? "text-amber-600 bg-amber-500/10 border-amber-500/30"
                      : "text-muted-foreground bg-muted border-border"
                  )}
                >
                  {wing.attendanceRate}%
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Reported:</span>
                  <span className="font-bold text-foreground">
                    {wing.reportedClasses}/{wing.totalClasses} Sections
                  </span>
                </div>
                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/40">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", wing.bg)}
                    style={{ width: `${Math.min(wing.attendanceRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Controls, Date Presets & Filter Toolbar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search class section, mentor teacher, room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-background text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Date Presets + Picker */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center bg-muted/50 p-0.5 rounded-xl border border-border/60">
              <button
                onClick={() => handleDatePreset("today")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                  selectedDatePreset === "today" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Today
              </button>
              <button
                onClick={() => handleDatePreset("yesterday")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                  selectedDatePreset === "yesterday" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yesterday
              </button>
              <button
                onClick={() => handleDatePreset("all")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                  selectedDatePreset === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Dates
              </button>
            </div>

            {selectedDatePreset !== "all" && (
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedDatePreset("custom");
                }}
                className="h-10 rounded-xl text-xs bg-background w-36 sm:w-auto"
              />
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center bg-muted/50 p-0.5 rounded-xl border border-border/60">
              <button
                onClick={() => setViewMode("radar")}
                title="Class Section Radar View"
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === "radar" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("ledger")}
                title="Historical Audit Ledger View"
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === "ledger" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button
              onClick={() => {
                fetchAttendance();
                fetchClasses();
              }}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shrink-0"
              title="Refresh Data"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Quick Class Section Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          <button
            onClick={() => setSelectedClassFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0",
              selectedClassFilter === "all"
                ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs"
                : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
            )}
          >
            All Sections ({classesList.length})
          </button>
          {classesList.map((cls) => {
            const isSelected = selectedClassFilter === cls.id;
            const hasSession = sessions.some((s) => s.classInfo.id === cls.id);
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassFilter(cls.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5",
                  isSelected
                    ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                )}
              >
                <span>{cls.fullName}</span>
                {hasSession && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 5. Main Attendance Display: VIEW 1 - Class Section Radar Grid */}
      {viewMode === "radar" && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
              <p className="text-xs font-bold text-muted-foreground">Synchronizing Classroom Attendance Radar...</p>
            </div>
          ) : filteredClassesForRadar.length === 0 ? (
            <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 text-center space-y-3">
              <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Classes Match Your Filter</h3>
                <p className="text-xs text-muted-foreground">Adjust your wing or section filter above.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredClassesForRadar.map((cls) => {
                const session = sessions.find((s) => s.classInfo.id === cls.id);
                const isReported = !!session;
                const rate = session ? session.presentRate : 0;

                return (
                  <Card
                    key={cls.id}
                    className={cn(
                      "border rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all shadow-md space-y-3 flex flex-col justify-between",
                      isReported
                        ? "bg-card/95 border-border/80 hover:border-seneca-crimson/40 hover:shadow-lg"
                        : "bg-card/60 border-dashed border-amber-500/40"
                    )}
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-lg bg-seneca-crimson text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            {cls.section}
                          </span>
                          <div>
                            <h3 className="font-bold text-sm text-foreground">{cls.name}</h3>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <DoorOpen className="h-3 w-3" />
                              <span>{cls.roomNumber || "Campus Room"}</span>
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5",
                            isReported
                              ? rate >= 90
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : rate >= 75
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse"
                          )}
                        >
                          {isReported ? `${rate}% Present` : "Awaiting Teacher Roll"}
                        </Badge>
                      </div>

                      {/* Mentor Teacher & Capacity */}
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>Class Mentor:</span>
                          </span>
                          <span className="font-semibold text-foreground truncate max-w-[150px]">
                            {session ? session.teacher : cls.classTeacher?.name || "Assigned Faculty"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>Enrolled Students:</span>
                          </span>
                          <span className="font-bold text-foreground">
                            {cls.enrolledCount || (session ? session.totalStudents : 0)} Students
                          </span>
                        </div>
                      </div>

                      {/* Roll Counts Breakdown */}
                      {isReported ? (
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {session.presentCount} Present
                            </div>
                            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20">
                              {session.absentCount} Absent
                            </div>
                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              {session.lateCount} Late
                            </div>
                          </div>

                          <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                rate >= 90 ? "bg-emerald-500" : rate >= 75 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                          <span>Attendance roll not yet submitted by class teacher.</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions (Read-Only Inspection) */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                      {isReported ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSession(session);
                            setRollFilterStatus("all");
                            setRollSearchQuery("");
                          }}
                          className="w-full rounded-xl text-xs font-bold gap-1.5 h-8.5 bg-seneca-crimson/5 hover:bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/25 shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect Attendance Roll ({session.totalStudents})</span>
                        </Button>
                      ) : (
                        <div className="w-full py-1.5 px-2.5 rounded-xl bg-muted/50 border border-border/60 text-center text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Teacher Submission Pending</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Main Attendance Display: VIEW 2 - Audit Ledger Table */}
      {viewMode === "ledger" && (
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
              <p className="text-xs font-bold text-muted-foreground">Loading Seneca Attendance Sessions...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-10 sm:p-12 text-center space-y-3">
              <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Attendance Logs Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No classroom attendance records have been submitted for this selection date.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Class Section</th>
                    <th className="py-3.5 px-4">Class Mentor</th>
                    <th className="py-3.5 px-4">Present / Total</th>
                    <th className="py-3.5 px-4">Attendance Rate</th>
                    <th className="py-3.5 px-4">Absent / Late</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-3 px-4 font-semibold text-foreground">{s.formattedDate}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-bold text-xs bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/25">
                          {s.classInfo.fullName}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{s.teacher}</td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {s.presentCount} / {s.totalStudents} Students
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{s.presentRate}%</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                s.presentRate >= 90 ? "bg-emerald-500" : s.presentRate >= 75 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${s.presentRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-rose-600 font-semibold">{s.absentCount} Absent</span>
                          <span>•</span>
                          <span className="text-amber-600 font-semibold">{s.lateCount} Late</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => {
                            setSelectedSession(s);
                            setRollFilterStatus("all");
                            setRollSearchQuery("");
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 text-seneca-crimson hover:bg-seneca-crimson/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect Roll</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* 6. Interactive Student Roll Inspection & Attendance Dossier Modal */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl sm:rounded-3xl p-0 shadow-2xl border border-border/80 bg-card">
            <style jsx global>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-attendance-dossier,
                #printable-attendance-dossier * {
                  visibility: visible !important;
                }
                #printable-attendance-dossier {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100vw !important;
                  height: auto !important;
                  margin: 0 !important;
                  padding: 16px !important;
                  background: white !important;
                  color: black !important;
                  z-index: 999999 !important;
                }
                .no-print {
                  display: none !important;
                }
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
              }
            `}</style>

            <div id="printable-attendance-dossier" className="flex-1 flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-border/60 bg-card/95 backdrop-blur-md space-y-3 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                      <span>{selectedSession.classInfo.fullName} Attendance Progress Roll</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-bold px-2 py-0.5",
                          selectedSession.presentRate >= 90
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        )}
                      >
                        {selectedSession.presentRate}% Present
                      </Badge>
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground">
                      Session Date: <strong>{selectedSession.formattedDate}</strong> • Recorded by Mentor: <strong>{selectedSession.teacher}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 no-print">
                    <Button
                      type="button"
                      onClick={handlePrintAttendanceSheet}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-border shadow-xs"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Print Roll Sheet</span>
                    </Button>
                  </div>
                </div>

                {/* Progress KPI Chips in Modal */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold pt-1">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <span className="text-[10px] text-muted-foreground block font-medium">Present</span>
                    <span className="text-sm font-extrabold">{selectedSession.presentCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    <span className="text-[10px] text-muted-foreground block font-medium">Absent</span>
                    <span className="text-sm font-extrabold">{selectedSession.absentCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <span className="text-[10px] text-muted-foreground block font-medium">Late Arrival</span>
                    <span className="text-sm font-extrabold">{selectedSession.lateCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    <span className="text-[10px] text-muted-foreground block font-medium">Excused</span>
                    <span className="text-sm font-extrabold">{selectedSession.excusedCount}</span>
                  </div>
                </div>

                {/* Status Chips Filter & Student Search (no-print) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 no-print">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {[
                      { id: "all", label: `All (${selectedSession.totalStudents})` },
                      { id: "present", label: `Present (${selectedSession.presentCount})` },
                      { id: "absent", label: `Absent (${selectedSession.absentCount})` },
                      { id: "late", label: `Late (${selectedSession.lateCount})` },
                      { id: "excused", label: `Excused (${selectedSession.excusedCount})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setRollFilterStatus(tab.id as any)}
                        className={cn(
                          "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap border shrink-0",
                          rollFilterStatus === tab.id
                            ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs"
                            : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <Input
                    type="text"
                    placeholder="Search student or roll #..."
                    value={rollSearchQuery}
                    onChange={(e) => setRollSearchQuery(e.target.value)}
                    className="h-8 rounded-xl text-xs w-full sm:w-44 bg-background"
                  />
                </div>
              </div>

              {/* Modal Body: Student Roll List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
                {filteredRollRecords.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    No student attendance records match this filter.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredRollRecords.map((r, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2",
                          r.status === "absent"
                            ? "bg-rose-500/5 border-rose-500/30"
                            : r.status === "late"
                            ? "bg-amber-500/5 border-amber-500/30"
                            : "bg-card border-border/70"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center font-mono font-bold text-xs text-foreground shrink-0 border">
                            {r.rollNumber.split("-").pop() || String(idx + 1).padStart(2, "0")}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">{r.studentName}</h4>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {r.admissionNumber} • Roll: {r.rollNumber}
                            </span>
                            {r.remarks && (
                              <span className="text-[10px] text-amber-600 block italic">
                                Note: {r.remarks}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold capitalize px-2 py-0.5",
                              r.status === "present" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                              r.status === "absent" && "bg-rose-500/10 text-rose-600 border-rose-500/30",
                              r.status === "late" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                              r.status === "excused" && "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            )}
                          >
                            {r.status}
                          </Badge>

                          {/* WhatsApp Absent Alert Trigger (no-print) */}
                          {r.status === "absent" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleSendWhatsAppAlert(
                                  r.studentName,
                                  r.rollNumber,
                                  selectedSession.classInfo.fullName,
                                  selectedSession.formattedDate
                                )
                              }
                              className="h-7 px-2 text-[10px] font-bold text-emerald-600 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 gap-1 rounded-lg no-print"
                              title="Send WhatsApp Absentee Alert to Parent"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span className="hidden sm:inline">WhatsApp Parent Notice</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 sm:p-4 border-t border-border/60 bg-card flex items-center justify-between gap-2 shrink-0 no-print">
                <span className="text-xs text-muted-foreground font-medium">
                  Total {selectedSession.totalStudents} Enrolled Students in Class Roster
                </span>
                <Button
                  onClick={() => setSelectedSession(null)}
                  variant="outline"
                  className="rounded-xl text-xs font-bold px-4 h-9"
                >
                  Close Dossier
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
