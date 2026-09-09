"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Calendar,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Save,
  Users,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Sparkles,
  ChevronRight,
  History,
  Lock,
  ShieldAlert,
  Crown,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Download,
  Phone,
  MessageCircle,
  FileText,
  Check,
  X,
  UserCheck,
  BarChart3,
  CalendarOff,
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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentRecord {
  id: string;
  name: string;
  rollNumber: string;
  admissionNumber: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
  avatarUrl?: string;
  parentName?: string;
  parentPhone?: string;
}

interface HeadClassOption {
  id: string;
  name: string;
  section: string;
  fullName: string;
  gradeLevel?: number;
}

interface AttendanceSessionRecord {
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
    parentName?: string;
    parentPhone?: string;
    avatarUrl?: string;
  }[];
  createdAt: string;
}

interface StudentAggregatedStats {
  studentId: string;
  name: string;
  rollNumber: string;
  admissionNumber: string;
  parentName?: string;
  parentPhone?: string;
  avatarUrl?: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  attendanceRate: number;
  history: {
    date: string;
    formattedDate: string;
    status: "present" | "absent" | "late" | "excused";
    remarks?: string;
  }[];
}

export default function TeacherAttendancePage() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<"register" | "history">("register");

  // Common Head of Class state
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isClassHead, setIsClassHead] = useState<boolean>(false);
  const [headClasses, setHeadClasses] = useState<HeadClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Daily Register state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSubject, setSelectedSubject] = useState("Daily Classroom Attendance (Homeroom)");
  const [roster, setRoster] = useState<StudentRecord[]>([]);
  const [registerSearchQuery, setRegisterSearchQuery] = useState("");
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingRecordFound, setExistingRecordFound] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // History & Analytics state
  const [historySessions, setHistorySessions] = useState<AttendanceSessionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyFilterType, setHistoryFilterType] = useState<"all" | "absent" | "leave" | "risk">("all");
  const [selectedStudentDossier, setSelectedStudentDossier] = useState<StudentAggregatedStats | null>(null);
  const [historySubTab, setHistorySubTab] = useState<"students" | "sessions">("students");

  // 1. Initial Load: permissions and headed classes
  const fetchPermissionsAndClasses = async () => {
    setLoadingInitial(true);
    try {
      const res = await fetch("/api/attendance", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        const canTakeAttendance = Boolean(data.data?.isClassHead);
        const classes: HeadClassOption[] = data.data?.headClasses || [];

        setIsClassHead(canTakeAttendance && classes.length > 0);
        setHeadClasses(classes);

        if (classes.length > 0) {
          const firstClassId = classes[0].id;
          setSelectedClassId(firstClassId);
          loadRegisterForDateAndClass(firstClassId, selectedDate);
          fetchHistoryForClass(firstClassId);
        }
      }
    } catch (err) {
      console.error("Failed to fetch attendance permissions:", err);
      toast.error("Error loading attendance authorization.");
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchPermissionsAndClasses();
  }, []);

  // 2. Load Register data for selected Date & Class
  // Checks if a record already exists for this date, otherwise loads default active roster.
  const loadRegisterForDateAndClass = async (classId: string, date: string) => {
    if (!classId) return;
    setLoadingRegister(true);
    setExistingRecordFound(false);
    try {
      // Step A: Check if attendance session already exists for this date
      const attendanceRes = await fetch(`/api/attendance?classId=${classId}&date=${date}`, {
        cache: "no-store",
      });
      const attendanceData = await attendanceRes.json();

      if (
        attendanceData.success &&
        attendanceData.data?.attendance &&
        attendanceData.data.attendance.length > 0
      ) {
        const existingSession: AttendanceSessionRecord = attendanceData.data.attendance[0];
        setExistingRecordFound(true);
        setLastSaved(new Date(existingSession.createdAt).toLocaleTimeString("en-PK", {
          hour: "2-digit",
          minute: "2-digit",
        }));

        // Map existing session records
        const mappedRecords: StudentRecord[] = existingSession.records.map((r) => ({
          id: r.studentId,
          name: r.studentName,
          rollNumber: r.rollNumber || "ROL-00",
          admissionNumber: r.admissionNumber || "SEN-N/A",
          status: r.status,
          remarks: r.remarks || "",
          parentName: r.parentName,
          parentPhone: r.parentPhone,
          avatarUrl: r.avatarUrl,
        }));
        setRoster(mappedRecords);
      } else {
        // Step B: If no attendance saved yet for this date, fetch class student roster
        setExistingRecordFound(false);
        const studentsRes = await fetch(`/api/students?classId=${classId}&status=active`, {
          cache: "no-store",
        });
        const studentsData = await studentsRes.json();

        if (studentsData.success && studentsData.data?.students) {
          const defaultRecords: StudentRecord[] = studentsData.data.students.map((s: any) => ({
            id: s.id,
            name: s.name,
            rollNumber: s.rollNumber || "ROL-00",
            admissionNumber: s.admissionNumber || "SEN-N/A",
            status: "present",
            remarks: "",
            parentName: s.parentName,
            parentPhone: s.parentPhone || s.guardianPhone,
            avatarUrl: s.avatarUrl,
          }));
          setRoster(defaultRecords);
        } else {
          setRoster([]);
        }
      }
    } catch (err) {
      console.error("Failed to load register for class:", err);
      toast.error("Failed to load student register for this date.");
    } finally {
      setLoadingRegister(false);
    }
  };

  // 3. Load Historical Attendance Sessions for selected Class
  const fetchHistoryForClass = async (classId: string) => {
    if (!classId) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/attendance?classId=${classId}&limit=150`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && data.data?.attendance) {
        setHistorySessions(data.data.attendance);
      } else {
        setHistorySessions([]);
      }
    } catch (err) {
      console.error("Failed to fetch attendance history:", err);
      toast.error("Failed to load historical attendance sessions.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Switch Class
  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    loadRegisterForDateAndClass(newClassId, selectedDate);
    fetchHistoryForClass(newClassId);
  };

  // Switch Date
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    loadRegisterForDateAndClass(selectedClassId, newDate);
  };

  // Daily Register handlers
  const handleStatusChange = (id: string, newStatus: StudentRecord["status"]) => {
    if (!isClassHead) return;
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  const handleRemarksChange = (id: string, remarks: string) => {
    if (!isClassHead) return;
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remarks } : s))
    );
  };

  const handleMarkAll = (status: StudentRecord["status"]) => {
    if (!isClassHead) return;
    setRoster((prev) => prev.map((s) => ({ ...s, status })));
    const label =
      status === "present"
        ? "PRESENT"
        : status === "absent"
        ? "ABSENT"
        : status === "excused"
        ? "ON LEAVE"
        : "LATE";
    toast.info(`Marked all ${roster.length} students as ${label}.`);
  };

  // Submit / Update Daily Register
  const handleSaveAttendance = async () => {
    if (!isClassHead) {
      return toast.error("Unauthorized: Only designated Head of Class can record attendance.");
    }
    if (!selectedClassId) {
      return toast.error("Please select a valid class section.");
    }
    if (roster.length === 0) {
      return toast.error("Cannot submit attendance for an empty student roster.");
    }

    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        classId: selectedClassId,
        subject: selectedSubject,
        records: roster.map((r) => ({
          studentId: r.id,
          status: r.status,
          remarks: r.remarks || "",
        })),
      };

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to record attendance.");
      }

      setLastSaved(new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }));
      setExistingRecordFound(true);
      toast.success("Classroom Attendance Saved Successfully!", {
        description: `${presentCount} Present • ${absentCount} Absent • ${excusedCount} On Leave • ${lateCount} Late`,
      });

      // Refresh history in background
      fetchHistoryForClass(selectedClassId);
    } catch (err: any) {
      toast.error("Attendance Submission Failed", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Metrics for Current Register
  const totalStudents = roster.length;
  const presentCount = roster.filter((s) => s.status === "present").length;
  const absentCount = roster.filter((s) => s.status === "absent").length;
  const lateCount = roster.filter((s) => s.status === "late").length;
  const excusedCount = roster.filter((s) => s.status === "excused").length;
  const presentRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  const filteredRoster = roster.filter((s) => {
    const q = registerSearchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q)
    );
  });

  const selectedClassObj = headClasses.find((c) => c.id === selectedClassId);

  // Compute Aggregated Student Statistics from Historical Sessions
  const aggregatedStudents: StudentAggregatedStats[] = useMemo(() => {
    if (!historySessions || historySessions.length === 0) return [];

    const map = new Map<string, StudentAggregatedStats>();

    // Process from newest to oldest session
    historySessions.forEach((session) => {
      session.records?.forEach((rec) => {
        if (!rec.studentId) return;

        if (!map.has(rec.studentId)) {
          map.set(rec.studentId, {
            studentId: rec.studentId,
            name: rec.studentName,
            rollNumber: rec.rollNumber,
            admissionNumber: rec.admissionNumber,
            parentName: rec.parentName,
            parentPhone: rec.parentPhone,
            avatarUrl: rec.avatarUrl,
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            leaveDays: 0,
            lateDays: 0,
            attendanceRate: 0,
            history: [],
          });
        }

        const student = map.get(rec.studentId)!;
        student.totalDays += 1;

        if (rec.status === "present") student.presentDays += 1;
        else if (rec.status === "absent") student.absentDays += 1;
        else if (rec.status === "excused") student.leaveDays += 1;
        else if (rec.status === "late") student.lateDays += 1;

        student.history.push({
          date: session.date,
          formattedDate: session.formattedDate,
          status: rec.status,
          remarks: rec.remarks,
        });
      });
    });

    // Compute attendance percentage
    const results = Array.from(map.values()).map((st) => {
      const rate =
        st.totalDays > 0
          ? Math.round(((st.presentDays + st.lateDays) / st.totalDays) * 100)
          : 0;
      return {
        ...st,
        attendanceRate: rate,
      };
    });

    // Sort by roll number or name
    return results.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  }, [historySessions]);

  // Filtered Students for History Tab
  const filteredHistoryStudents = useMemo(() => {
    return aggregatedStudents.filter((student) => {
      const query = historySearchQuery.toLowerCase();
      const matchesSearch =
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        student.admissionNumber.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (historyFilterType === "absent") return student.absentDays > 0;
      if (historyFilterType === "leave") return student.leaveDays > 0;
      if (historyFilterType === "risk") return student.attendanceRate < 75;
      return true;
    });
  }, [aggregatedStudents, historySearchQuery, historyFilterType]);

  // Summary Metrics across History
  const historySummary = useMemo(() => {
    const totalSessions = historySessions.length;
    if (totalSessions === 0) {
      return { totalSessions: 0, avgRate: 0, totalAbsences: 0, totalLeaves: 0 };
    }
    const sumRate = historySessions.reduce((acc, s) => acc + s.presentRate, 0);
    const avgRate = Math.round(sumRate / totalSessions);
    const totalAbsences = historySessions.reduce((acc, s) => acc + s.absentCount, 0);
    const totalLeaves = historySessions.reduce((acc, s) => acc + s.excusedCount, 0);

    return { totalSessions, avgRate, totalAbsences, totalLeaves };
  }, [historySessions]);

  // Jump from History session to Edit Register
  const handleEditSessionFromHistory = (dateStr: string) => {
    const d = new Date(dateStr).toISOString().slice(0, 10);
    setSelectedDate(d);
    setActiveTab("register");
    loadRegisterForDateAndClass(selectedClassId, d);
    toast.info(`Loaded register for ${new Date(dateStr).toLocaleDateString("en-PK", { dateStyle: "medium" })}`);
  };

  // CSV Export of Attendance Ledger
  const handleExportCSV = () => {
    if (aggregatedStudents.length === 0) {
      return toast.error("No student attendance records available to export.");
    }

    const headers = [
      "Roll Number",
      "Student Name",
      "Admission No",
      "Total Sessions",
      "Present Days",
      "Absent Days",
      "Days on Leave (Excused)",
      "Days Late",
      "Attendance Rate (%)",
      "Parent Name",
      "Parent Phone",
    ];

    const rows = aggregatedStudents.map((st) => [
      `"${st.rollNumber}"`,
      `"${st.name}"`,
      `"${st.admissionNumber}"`,
      st.totalDays,
      st.presentDays,
      st.absentDays,
      st.leaveDays,
      st.lateDays,
      `${st.attendanceRate}%`,
      `"${st.parentName || "N/A"}"`,
      `"${st.parentPhone || "N/A"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = `Attendance_Ledger_${selectedClassObj?.fullName || "Class"}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Attendance Ledger CSV exported successfully.");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden pb-12">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <CalendarCheck className="h-3 w-3" />
                <span>Classroom Attendance Management</span>
              </span>
              {isClassHead ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-200 text-[10px] sm:text-[11px] font-bold border border-amber-500/30">
                  <Crown className="h-3 w-3 text-seneca-amber-light" />
                  <span>Head of Class Authorized</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-200 text-[10px] sm:text-[11px] font-bold border border-rose-500/30">
                  <Lock className="h-3 w-3 text-rose-300" />
                  <span>Restricted: Head of Class Required</span>
                </span>
              )}
              {existingRecordFound && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Saved Register Loaded ({lastSaved})</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Classroom <span className="text-seneca-amber">Attendance & History</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Record daily classroom student attendance, log approved leaves and excuses, monitor absenteeism, and review student attendance history with comprehensive analytics.
            </p>
          </div>

          {/* Quick Header Navigation Switcher */}
          {isClassHead && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/10 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    activeTab === "register"
                      ? "bg-seneca-amber text-zinc-950 shadow-md font-extrabold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <CalendarCheck className="h-3.5 w-3.5" />
                  <span>Daily Register</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    activeTab === "history"
                      ? "bg-seneca-amber text-zinc-950 shadow-md font-extrabold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Attendance History</span>
                  {historySessions.length > 0 && (
                    <span className="h-4 px-1 rounded-full bg-black/40 text-[9px] font-mono text-white flex items-center justify-center">
                      {historySessions.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === "register" && (
                <Button
                  onClick={handleSaveAttendance}
                  disabled={saving || loadingRegister || roster.length === 0}
                  variant="glow"
                  size="sm"
                  className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{existingRecordFound ? "Update Register" : "Submit Register"}</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {loadingInitial ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
          <p className="text-xs font-bold text-muted-foreground">Checking Class Head Permissions & Roster...</p>
        </div>
      ) : !isClassHead ? (
        /* ========================================================================= */
        /* RESTRICTION NOTICE FOR NON-HEAD TEACHERS                                  */
        /* ========================================================================= */
        <Card className="border border-amber-500/30 bg-card/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 text-center space-y-5">
          <div className="h-16 w-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-seneca-amber">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-seneca-amber-light font-bold text-xs border border-amber-500/30 px-3 py-1">
              Class Teacher Privilege Required
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-foreground">
              Attendance Register is Reserved for <span className="text-seneca-amber">Head of Class</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              You are currently signed in as a <strong>Subject Specialist Teacher</strong> without an active <strong>Head of Class (Class Teacher)</strong> assignment.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 p-3.5 rounded-2xl border border-border">
              Under Seneca LMS academic governance, daily student classroom attendance and leave administration can only be managed by the designated <strong>Head of Class</strong> for each classroom section, or by School Administrators.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline" className="rounded-xl text-xs font-bold gap-1.5">
              <Link href="/teacher/students">
                <Users className="h-4 w-4 text-primary" />
                <span>View My Assigned Students</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl text-xs font-bold gap-1.5">
              <Link href="/teacher/books">
                <BookOpen className="h-4 w-4 text-seneca-amber" />
                <span>View Teaching Books</span>
              </Link>
            </Button>
          </div>
        </Card>
      ) : activeTab === "register" ? (
        /* ========================================================================= */
        /* TAB 1: DAILY REGISTER VIEW                                                */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Live Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl p-3 sm:p-3.5 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Students</span>
              <p className="text-lg sm:text-xl font-extrabold text-foreground pt-0.5">{totalStudents}</p>
            </Card>

            <Card className="border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl shadow-md rounded-2xl p-3 sm:p-3.5 text-center">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Present</span>
              <p className="text-lg sm:text-xl font-extrabold text-emerald-600 pt-0.5">{presentCount}</p>
            </Card>

            <Card className="border border-rose-500/30 bg-rose-500/5 backdrop-blur-xl shadow-md rounded-2xl p-3 sm:p-3.5 text-center">
              <span className="text-[10px] font-bold text-rose-600 uppercase">Absent</span>
              <p className="text-lg sm:text-xl font-extrabold text-rose-600 pt-0.5">{absentCount}</p>
            </Card>

            <Card className="border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl shadow-md rounded-2xl p-3 sm:p-3.5 text-center">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">On Leave</span>
              <p className="text-lg sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 pt-0.5">{excusedCount}</p>
            </Card>

            <Card className="border border-sky-500/30 bg-sky-500/5 backdrop-blur-xl shadow-md rounded-2xl p-3 sm:p-3.5 text-center">
              <span className="text-[10px] font-bold text-sky-600 uppercase">Late</span>
              <p className="text-lg sm:text-xl font-extrabold text-sky-600 pt-0.5">{lateCount}</p>
            </Card>

            <Card className="border border-primary/30 bg-primary/5 backdrop-blur-xl shadow-md rounded-2xl p-3 sm:p-3.5 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-primary uppercase">Attendance Rate</span>
              <p className="text-lg sm:text-xl font-extrabold text-primary pt-0.5">{presentRate}%</p>
            </Card>
          </div>

          {/* Class & Date Selector Controls */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Attendance Date</span>
                  {existingRecordFound && (
                    <span className="text-[10px] text-emerald-600 font-bold">Existing Session</span>
                  )}
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="h-10 rounded-xl bg-background text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-seneca-amber" />
                  <span>Head of Class Section</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {headClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      👑 {cls.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Session Type / Subject</label>
                <Input
                  type="text"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  placeholder="e.g. Daily Classroom Attendance"
                  className="h-10 rounded-xl bg-background text-xs font-medium"
                />
              </div>
            </div>

            {/* Quick Batch Action Buttons & Search */}
            <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <span className="text-[11px] text-muted-foreground mr-1">Batch Actions:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll("present")}
                  className="h-8 text-xs font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 rounded-xl gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Mark All Present</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll("absent")}
                  className="h-8 text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 rounded-xl gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  <span>Mark All Absent</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll("excused")}
                  className="h-8 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 rounded-xl gap-1"
                >
                  <HelpCircle className="h-3 w-3" />
                  <span>Mark All On Leave</span>
                </Button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search student or roll number..."
                  value={registerSearchQuery}
                  onChange={(e) => setRegisterSearchQuery(e.target.value)}
                  className="pl-8 h-8 rounded-xl bg-background text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Student Attendance Register List */}
          {loadingRegister ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-seneca-crimson" />
              <p className="text-xs text-muted-foreground font-bold">Loading Class Student Roster for {selectedDate}...</p>
            </div>
          ) : filteredRoster.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl border border-border bg-card/90 space-y-2">
              <Users className="h-8 w-8 text-muted-foreground mx-auto" />
              <h4 className="font-bold text-foreground text-sm">No Enrolled Students Found</h4>
              <p className="text-xs text-muted-foreground">
                No active students matching your query were found in {selectedClassObj?.fullName || "this class"}.
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {filteredRoster.map((s, index) => (
                <Card
                  key={s.id}
                  className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-sm rounded-2xl p-3.5 sm:p-4 hover:border-seneca-crimson/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Student Identity */}
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                        {index + 1}
                      </span>
                      <Avatar className="h-10 w-10 border border-border shrink-0">
                        {s.avatarUrl ? <AvatarImage src={s.avatarUrl} alt={s.name} /> : null}
                        <AvatarFallback className="bg-seneca-crimson text-white font-bold text-xs">
                          {s.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground">{s.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Roll: <strong className="text-foreground">{s.rollNumber}</strong> • {s.admissionNumber}
                        </p>
                        {s.parentPhone && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                            Parent: {s.parentName || "Guardian"} ({s.parentPhone})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Switcher Toggle Buttons */}
                    <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/60 overflow-x-auto text-xs font-bold shrink-0">
                      {/* Present */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, "present")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 text-xs",
                          s.status === "present"
                            ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Present</span>
                      </button>

                      {/* Absent */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, "absent")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 text-xs",
                          s.status === "absent"
                            ? "bg-rose-600 text-white shadow-sm font-extrabold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Absent</span>
                      </button>

                      {/* On Leave / Excused */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, "excused")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 text-xs",
                          s.status === "excused"
                            ? "bg-amber-500 text-zinc-950 shadow-sm font-extrabold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>On Leave</span>
                      </button>

                      {/* Late */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, "late")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 text-xs",
                          s.status === "late"
                            ? "bg-sky-500 text-white shadow-sm font-extrabold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Late</span>
                      </button>
                    </div>

                    {/* Remarks Input */}
                    <div className="w-full lg:w-72">
                      <Input
                        type="text"
                        placeholder={
                          s.status === "excused"
                            ? "Reason for leave (e.g. sick leave application)..."
                            : s.status === "absent"
                            ? "Absence reason or note..."
                            : "Optional remarks or notes..."
                        }
                        value={s.remarks || ""}
                        onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                        className={cn(
                          "h-9 rounded-xl bg-background text-[11px]",
                          s.status === "excused" && !s.remarks ? "border-amber-500/40" : ""
                        )}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Bottom Save Float Bar */}
          <div className="p-4 rounded-2xl bg-card/95 border border-border/80 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Recording register for <strong className="text-foreground">{selectedClassObj?.fullName || "Selected Class"}</strong> on{" "}
              <strong className="text-foreground">
                {new Date(selectedDate).toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </strong>{" "}
              ({filteredRoster.length} students)
            </div>

            <Button
              onClick={handleSaveAttendance}
              disabled={saving || loadingRegister || roster.length === 0}
              variant="glow"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg justify-center"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{existingRecordFound ? "Update & Save Register" : "Submit Attendance Register"}</span>
            </Button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* TAB 2: ATTENDANCE HISTORY & STUDENT ANALYTICS VIEW                         */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* History KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-center gap-1">
                <CalendarDays className="h-3 w-3 text-primary" />
                <span>Class Sessions</span>
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground pt-1">
                {historySummary.totalSessions}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Recorded Ledger Days</p>
            </Card>

            <Card className="border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl shadow-md rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center justify-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>Avg Attendance</span>
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 pt-1">
                {historySummary.avgRate}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Cumulative Class Rate</p>
            </Card>

            <Card className="border border-rose-500/30 bg-rose-500/5 backdrop-blur-xl shadow-md rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-rose-600 uppercase flex items-center justify-center gap-1">
                <XCircle className="h-3 w-3" />
                <span>Total Absences</span>
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-rose-600 pt-1">
                {historySummary.totalAbsences}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Recorded Days Absent</p>
            </Card>

            <Card className="border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl shadow-md rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center justify-center gap-1">
                <CalendarOff className="h-3 w-3" />
                <span>Leaves / Excuses</span>
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 pt-1">
                {historySummary.totalLeaves}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Excused & Leave Days</p>
            </Card>
          </div>

          {/* Sub-navigation Controls & Filters */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Class Selector for History */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-muted-foreground shrink-0">Class Section:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {headClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      👑 {cls.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-view switcher: Students Ledger vs Class Sessions */}
              <div className="flex items-center gap-2">
                <div className="bg-muted p-1 rounded-xl flex items-center text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setHistorySubTab("students")}
                    className={cn(
                      "px-3 py-1 rounded-lg transition-all flex items-center gap-1",
                      historySubTab === "students"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Student Analytics ({aggregatedStudents.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistorySubTab("sessions")}
                    className={cn(
                      "px-3 py-1 rounded-lg transition-all flex items-center gap-1",
                      historySubTab === "sessions"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Daily Sessions ({historySessions.length})</span>
                  </button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-8 text-xs font-bold gap-1 rounded-xl border-border"
                >
                  <Download className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </div>
            </div>

            {/* Filter Pills and Search */}
            <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <span className="text-[11px] text-muted-foreground mr-1">Filter Students:</span>
                <button
                  type="button"
                  onClick={() => setHistoryFilterType("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-xl transition-all text-xs",
                    historyFilterType === "all"
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  All ({aggregatedStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilterType("absent")}
                  className={cn(
                    "px-2.5 py-1 rounded-xl transition-all text-xs",
                    historyFilterType === "absent"
                      ? "bg-rose-600 text-white font-bold shadow-sm"
                      : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  )}
                >
                  Has Absences
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilterType("leave")}
                  className={cn(
                    "px-2.5 py-1 rounded-xl transition-all text-xs",
                    historyFilterType === "leave"
                      ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                      : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                  )}
                >
                  Has Leaves
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilterType("risk")}
                  className={cn(
                    "px-2.5 py-1 rounded-xl transition-all text-xs",
                    historyFilterType === "risk"
                      ? "bg-rose-700 text-white font-bold shadow-sm"
                      : "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20"
                  )}
                >
                  At Risk (&lt; 75%)
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search student or roll number..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="pl-8 h-8 rounded-xl bg-background text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Sub-view 1: Student Attendance Ledger */}
          {loadingHistory ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-seneca-crimson" />
              <p className="text-xs text-muted-foreground font-bold">Computing Student Attendance History...</p>
            </div>
          ) : historySubTab === "students" ? (
            filteredHistoryStudents.length === 0 ? (
              <Card className="p-8 text-center rounded-2xl border border-border bg-card/90 space-y-2">
                <Users className="h-8 w-8 text-muted-foreground mx-auto" />
                <h4 className="font-bold text-foreground text-sm">No Attendance History Found</h4>
                <p className="text-xs text-muted-foreground">
                  No records match your filter criteria for {selectedClassObj?.fullName || "this class"}.
                </p>
              </Card>
            ) : (
              <div className="border border-border/80 bg-card/95 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-muted-foreground font-bold">
                        <th className="p-3.5 sm:p-4">Student</th>
                        <th className="p-3.5 sm:p-4 text-center">Sessions</th>
                        <th className="p-3.5 sm:p-4 text-center">Present</th>
                        <th className="p-3.5 sm:p-4 text-center">Absent</th>
                        <th className="p-3.5 sm:p-4 text-center">On Leave</th>
                        <th className="p-3.5 sm:p-4 text-center">Late</th>
                        <th className="p-3.5 sm:p-4 text-center">Attendance %</th>
                        <th className="p-3.5 sm:p-4 text-center">Status</th>
                        <th className="p-3.5 sm:p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredHistoryStudents.map((st) => (
                        <tr key={st.studentId} className="hover:bg-muted/30 transition-colors">
                          {/* Student Identity */}
                          <td className="p-3.5 sm:p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-border shrink-0">
                                {st.avatarUrl ? <AvatarImage src={st.avatarUrl} alt={st.name} /> : null}
                                <AvatarFallback className="bg-seneca-crimson text-white font-bold text-xs">
                                  {st.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h5 className="font-bold text-foreground text-xs sm:text-sm">{st.name}</h5>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  Roll: <strong className="text-foreground">{st.rollNumber}</strong> • {st.admissionNumber}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Sessions */}
                          <td className="p-3.5 sm:p-4 text-center font-bold text-foreground">
                            {st.totalDays}
                          </td>

                          {/* Present */}
                          <td className="p-3.5 sm:p-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-extrabold text-xs">
                              {st.presentDays}
                            </span>
                          </td>

                          {/* Absent */}
                          <td className="p-3.5 sm:p-4 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-lg font-extrabold text-xs",
                                st.absentDays > 0 ? "bg-rose-500/15 text-rose-600" : "text-muted-foreground"
                              )}
                            >
                              {st.absentDays}
                            </span>
                          </td>

                          {/* On Leave */}
                          <td className="p-3.5 sm:p-4 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-lg font-extrabold text-xs",
                                st.leaveDays > 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                              )}
                            >
                              {st.leaveDays}
                            </span>
                          </td>

                          {/* Late */}
                          <td className="p-3.5 sm:p-4 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-lg font-extrabold text-xs",
                                st.lateDays > 0 ? "bg-sky-500/15 text-sky-600" : "text-muted-foreground"
                              )}
                            >
                              {st.lateDays}
                            </span>
                          </td>

                          {/* Attendance Rate */}
                          <td className="p-3.5 sm:p-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-extrabold text-xs text-foreground">
                                {st.attendanceRate}%
                              </span>
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    st.attendanceRate >= 85
                                      ? "bg-emerald-500"
                                      : st.attendanceRate >= 75
                                      ? "bg-amber-500"
                                      : "bg-rose-500"
                                  )}
                                  style={{ width: `${st.attendanceRate}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Health Status Badge */}
                          <td className="p-3.5 sm:p-4 text-center">
                            {st.attendanceRate >= 85 ? (
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                Regular
                              </Badge>
                            ) : st.attendanceRate >= 75 ? (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                Warning
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                                Critical (&lt; 75%)
                              </Badge>
                            )}
                          </td>

                          {/* Action */}
                          <td className="p-3.5 sm:p-4 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudentDossier(st)}
                              className="h-7 text-[11px] font-bold gap-1 rounded-xl border-border hover:border-seneca-amber hover:text-seneca-amber"
                            >
                              <FileText className="h-3 w-3" />
                              <span>View History</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            /* Sub-view 2: Class Daily Sessions Ledger */
            historySessions.length === 0 ? (
              <Card className="p-8 text-center rounded-2xl border border-border bg-card/90 space-y-2">
                <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto" />
                <h4 className="font-bold text-foreground text-sm">No Recorded Sessions Yet</h4>
                <p className="text-xs text-muted-foreground">
                  No attendance sessions have been submitted yet for {selectedClassObj?.fullName || "this class"}.
                </p>
              </Card>
            ) : (
              <div className="border border-border/80 bg-card/95 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-muted-foreground font-bold">
                        <th className="p-3.5 sm:p-4">Session Date</th>
                        <th className="p-3.5 sm:p-4 text-center">Total Students</th>
                        <th className="p-3.5 sm:p-4 text-center">Present</th>
                        <th className="p-3.5 sm:p-4 text-center">Absent</th>
                        <th className="p-3.5 sm:p-4 text-center">On Leave</th>
                        <th className="p-3.5 sm:p-4 text-center">Late</th>
                        <th className="p-3.5 sm:p-4 text-center">Present Rate</th>
                        <th className="p-3.5 sm:p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {historySessions.map((session) => (
                        <tr key={session.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3.5 sm:p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-seneca-amber shrink-0" />
                              <div>
                                <span className="font-bold text-foreground text-xs sm:text-sm">
                                  {session.formattedDate}
                                </span>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {new Date(session.date).toISOString().slice(0, 10)} • Head: {session.teacher}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 sm:p-4 text-center font-bold text-foreground">
                            {session.totalStudents}
                          </td>

                          <td className="p-3.5 sm:p-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-extrabold text-xs">
                              {session.presentCount}
                            </span>
                          </td>

                          <td className="p-3.5 sm:p-4 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-lg font-extrabold text-xs",
                                session.absentCount > 0 ? "bg-rose-500/15 text-rose-600" : "text-muted-foreground"
                              )}
                            >
                              {session.absentCount}
                            </span>
                          </td>

                          <td className="p-3.5 sm:p-4 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-lg font-extrabold text-xs",
                                session.excusedCount > 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                              )}
                            >
                              {session.excusedCount}
                            </span>
                          </td>

                          <td className="p-3.5 sm:p-4 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-lg font-extrabold text-xs",
                                session.lateCount > 0 ? "bg-sky-500/15 text-sky-600" : "text-muted-foreground"
                              )}
                            >
                              {session.lateCount}
                            </span>
                          </td>

                          <td className="p-3.5 sm:p-4 text-center font-bold">
                            <Badge
                              className={cn(
                                "font-mono font-bold text-xs",
                                session.presentRate >= 85
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                  : session.presentRate >= 75
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                  : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                              )}
                            >
                              {session.presentRate}%
                            </Badge>
                          </td>

                          <td className="p-3.5 sm:p-4 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSessionFromHistory(session.date)}
                              className="h-7 text-[11px] font-bold gap-1 rounded-xl border-border hover:border-seneca-crimson hover:text-seneca-crimson"
                            >
                              <CalendarCheck className="h-3 w-3" />
                              <span>Edit Register</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT ATTENDANCE DOSSIER MODAL                                          */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedStudentDossier)}
        onOpenChange={(open) => {
          if (!open) setSelectedStudentDossier(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 rounded-3xl">
          {selectedStudentDossier && (
            <div className="space-y-5">
              <DialogHeader className="text-left space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="bg-seneca-crimson/15 text-seneca-crimson font-bold text-xs border border-seneca-crimson/20">
                    Student Attendance Profile
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    {selectedClassObj?.fullName}
                  </span>
                </div>
                <DialogTitle className="text-xl font-black font-heading text-foreground flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    {selectedStudentDossier.avatarUrl ? (
                      <AvatarImage src={selectedStudentDossier.avatarUrl} alt={selectedStudentDossier.name} />
                    ) : null}
                    <AvatarFallback className="bg-seneca-crimson text-white font-bold">
                      {selectedStudentDossier.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span>{selectedStudentDossier.name}</span>
                    <p className="text-xs font-mono font-normal text-muted-foreground">
                      Roll No: <strong className="text-foreground">{selectedStudentDossier.rollNumber}</strong> • Admission: {selectedStudentDossier.admissionNumber}
                    </p>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Comprehensive chronological ledger of dates, presence status, approved leaves, and teacher remarks.
                </DialogDescription>
              </DialogHeader>

              {/* Parent & Contact Quick Trigger */}
              {selectedStudentDossier.parentPhone && (
                <div className="p-3 rounded-2xl bg-muted/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="text-xs">
                    <span className="font-bold text-foreground">
                      Guardian: {selectedStudentDossier.parentName || "Parent / Guardian"}
                    </span>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Phone: {selectedStudentDossier.parentPhone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-bold gap-1 rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                    >
                      <a
                        href={`https://wa.me/${selectedStudentDossier.parentPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp Parent</span>
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-bold gap-1 rounded-xl border-sky-500/30 text-sky-600 hover:bg-sky-500/10"
                    >
                      <a href={`tel:${selectedStudentDossier.parentPhone}`}>
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call</span>
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Sessions</span>
                  <p className="text-base font-extrabold text-foreground">{selectedStudentDossier.totalDays}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[9px] uppercase font-bold text-emerald-600">Present</span>
                  <p className="text-base font-extrabold text-emerald-600">{selectedStudentDossier.presentDays}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[9px] uppercase font-bold text-rose-600">Absent</span>
                  <p className="text-base font-extrabold text-rose-600">{selectedStudentDossier.absentDays}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400">On Leave</span>
                  <p className="text-base font-extrabold text-amber-600 dark:text-amber-400">{selectedStudentDossier.leaveDays}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 col-span-2 sm:col-span-1">
                  <span className="text-[9px] uppercase font-bold text-primary">Cumulative</span>
                  <p className="text-base font-extrabold text-primary">{selectedStudentDossier.attendanceRate}%</p>
                </div>
              </div>

              {/* Chronological History Ledger */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-seneca-amber" />
                  <span>Session by Session History</span>
                </h4>

                <div className="border border-border/80 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/60 text-muted-foreground font-bold">
                        <th className="p-2.5 sm:p-3">Date</th>
                        <th className="p-2.5 sm:p-3 text-center">Status</th>
                        <th className="p-2.5 sm:p-3">Remarks / Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedStudentDossier.history.map((h, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="p-2.5 sm:p-3 font-medium text-foreground">
                            {h.formattedDate}
                          </td>
                          <td className="p-2.5 sm:p-3 text-center">
                            {h.status === "present" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-bold text-[10px]">
                                Present
                              </Badge>
                            ) : h.status === "absent" ? (
                              <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 font-bold text-[10px]">
                                Absent
                              </Badge>
                            ) : h.status === "excused" ? (
                              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold text-[10px]">
                                On Leave
                              </Badge>
                            ) : (
                              <Badge className="bg-sky-500/15 text-sky-600 border-sky-500/30 font-bold text-[10px]">
                                Late
                              </Badge>
                            )}
                          </td>
                          <td className="p-2.5 sm:p-3 text-muted-foreground text-[11px]">
                            {h.remarks ? (
                              <span className="text-foreground font-medium">{h.remarks}</span>
                            ) : (
                              <span className="text-muted-foreground/60 italic">Regular record</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
