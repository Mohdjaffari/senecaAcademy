"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  Layers,
  Search,
  Filter,
  Plus,
  Download,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  X,
  BookOpen,
  Users,
  TrendingUp,
  Percent,
  Printer,
  FileSpreadsheet,
  Check,
  UserCheck,
  UserX,
  ArrowRight,
  Info,
  CalendarDays,
  FileText,
  BadgePercent,
  GraduationCap,
  Building,
  School as SchoolIcon,
  HelpCircle,
  BarChart3,
  Flame,
  DoorOpen,
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
import { cn, formatCurrency } from "@/lib/utils";
import { ACADEMIC_SPECTRUM } from "@/lib/constants/academic-spectrum";

interface ExamData {
  id: string;
  title: string;
  examDate: string;
  formattedDate: string;
  startTime: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: "scheduled" | "completed" | "cancelled";
  classId: string;
  className: string;
  gradeLevel?: number;
  stream?: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  evaluatedCount: number;
  avgMarks: number;
  highestMarks: number;
  lowestMarks: number;
}

interface ResultData {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  admissionNumber: string;
  gender: string;
  classId: string;
  className: string;
  gradeLevel?: number;
  stream?: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  examId: string;
  examTitle: string;
  examDate: string;
  obtainedMarks: number;
  totalMarks: number;
  passingMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  remarks: string;
  isPassed: boolean;
  rank: number;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
  fullName: string;
  gradeLevel?: number;
  enrolledCount?: number;
  roomNumber?: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
  classIds?: any[];
}

export default function PrincipalResultsPage() {
  const [exams, setExams] = useState<ExamData[]>([]);
  const [results, setResults] = useState<ResultData[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [subjectsList, setSubjectsList] = useState<SubjectOption[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  
  // Navigation Tabs: "results" | "datesheet" | "exams"
  const [activeTab, setActiveTab] = useState<"results" | "datesheet" | "exams">("results");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [selectedExamFilter, setSelectedExamFilter] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Single Paper Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Single Exam Form State
  const [formTitle, setFormTitle] = useState("Mid-Term Examination 2026");
  const [formClassId, setFormClassId] = useState("");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formExamDate, setFormExamDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00 AM");
  const [formDuration, setFormDuration] = useState("120");
  const [formTotalMarks, setFormTotalMarks] = useState("100");
  const [formPassingMarks, setFormPassingMarks] = useState("40");

  // Class Datesheet Builder Modal States
  const [datesheetModalOpen, setDatesheetModalOpen] = useState(false);
  const [datesheetClassId, setDatesheetClassId] = useState("");
  const [datesheetTermTitle, setDatesheetTermTitle] = useState("Mid-Term Examination 2026");
  const [datesheetStartDate, setDatesheetStartDate] = useState("");
  const [datesheetRows, setDatesheetRows] = useState<
    {
      subjectId: string;
      subjectName: string;
      examDate: string;
      startTime: string;
      durationMinutes: string;
      totalMarks: string;
      passingMarks: string;
    }[]
  >([]);
  const [submittingDatesheet, setSubmittingDatesheet] = useState(false);

  // Printable Datesheet Slip Modal
  const [printableDatesheetClass, setPrintableDatesheetClass] = useState<ClassOption | null>(null);

  // Fetch Exams from API
  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exams", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.exams)) {
        setExams(data.data.exams);
      } else {
        setExams([]);
      }
    } catch (err) {
      console.error("Failed to load exams:", err);
      toast.error("Error loading examination records.");
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Results from API
  const fetchResults = async () => {
    setLoadingResults(true);
    try {
      let url = "/api/results?";
      if (selectedClassFilter !== "all") url += `classId=${selectedClassFilter}&`;
      if (selectedExamFilter !== "all") url += `examId=${selectedExamFilter}&`;
      if (selectedSubjectFilter !== "all") url += `subjectId=${selectedSubjectFilter}&`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.results)) {
        setResults(data.data.results);
        setAnalytics(data.data.analytics);
      } else {
        setResults([]);
        setAnalytics(null);
      }
    } catch (err) {
      console.error("Failed to load results:", err);
      setResults([]);
      setAnalytics(null);
    } finally {
      setLoadingResults(false);
    }
  };

  // Fetch Dependencies (Classes & Subjects)
  const fetchDependencies = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch("/api/classes", { cache: "no-store" }),
        fetch("/api/subjects", { cache: "no-store" }),
      ]);
      const cData = await cRes.json();
      const sData = await sRes.json();
      if (cData.success && Array.isArray(cData.data?.classes)) {
        const mappedClasses = cData.data.classes.map((c: any) => ({
          id: c.id || c._id,
          name: c.name,
          section: c.section,
          fullName: `${c.name}-${c.section}`,
          gradeLevel: c.gradeLevel ?? 0,
          enrolledCount: c.enrolledCount || 0,
          roomNumber: c.roomNumber || `Room-${c.section}`,
        }));
        setClassesList(mappedClasses);
        if (mappedClasses.length > 0) {
          setFormClassId(mappedClasses[0].id);
          setDatesheetClassId(mappedClasses[0].id);
        }
      }
      if (sData.success && Array.isArray(sData.data?.subjects)) {
        setSubjectsList(sData.data.subjects);
        if (sData.data.subjects.length > 0) {
          setFormSubjectId(sData.data.subjects[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load classes or subjects:", err);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedClassFilter, selectedExamFilter, selectedSubjectFilter]);

  // When opening the Datesheet builder for a class, auto-generate rows for subjects
  const handleOpenDatesheetBuilder = (classIdToUse?: string) => {
    const cId = classIdToUse || datesheetClassId || (classesList.length > 0 ? classesList[0].id : "");
    setDatesheetClassId(cId);
    
    // Default datesheet rows using subjects
    const today = new Date();
    const rows = subjectsList.slice(0, 6).map((sub, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() + idx * 2 + 3);
      return {
        subjectId: sub.id,
        subjectName: `${sub.name} (${sub.code})`,
        examDate: d.toISOString().split("T")[0],
        startTime: "09:00 AM",
        durationMinutes: "120",
        totalMarks: "100",
        passingMarks: "40",
      };
    });

    setDatesheetRows(rows);
    setDatesheetModalOpen(true);
  };

  const handleAddDatesheetRow = () => {
    const firstSub = subjectsList.length > 0 ? subjectsList[0] : { id: "", name: "Subject", code: "SUB" };
    setDatesheetRows((prev) => [
      ...prev,
      {
        subjectId: firstSub.id,
        subjectName: `${firstSub.name} (${firstSub.code})`,
        examDate: new Date().toISOString().split("T")[0],
        startTime: "09:00 AM",
        durationMinutes: "120",
        totalMarks: "100",
        passingMarks: "40",
      },
    ]);
  };

  const handleRemoveDatesheetRow = (idx: number) => {
    setDatesheetRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateDatesheetRow = (idx: number, field: string, value: string) => {
    setDatesheetRows((prev) => {
      const updated = [...prev];
      if (field === "subjectId") {
        const sub = subjectsList.find((s) => s.id === value);
        updated[idx] = {
          ...updated[idx],
          subjectId: value,
          subjectName: sub ? `${sub.name} (${sub.code})` : value,
        };
      } else {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return updated;
    });
  };

  // Submit Bulk Datesheet
  const handleSubmitDatesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datesheetClassId) {
      toast.error("Please select a target class section.");
      return;
    }
    if (datesheetRows.length === 0) {
      toast.error("Please add at least one subject examination paper.");
      return;
    }

    setSubmittingDatesheet(true);
    try {
      const targetClass = classesList.find((c) => c.id === datesheetClassId);
      const papersPayload = datesheetRows.map((r) => ({
        title: `${datesheetTermTitle} - ${r.subjectName.split("(")[0].trim()}`,
        classId: datesheetClassId,
        subjectId: r.subjectId,
        examDate: r.examDate,
        startTime: r.startTime,
        durationMinutes: Number(r.durationMinutes) || 120,
        totalMarks: Number(r.totalMarks) || 100,
        passingMarks: Number(r.passingMarks) || 40,
      }));

      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ papers: papersPayload }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to publish datesheet.");
      }

      toast.success("Class Datesheet Published Successfully!", {
        description: `Scheduled ${datesheetRows.length} examination papers for ${targetClass?.fullName || "Class"}.`,
      });

      setDatesheetModalOpen(false);
      fetchExams();
      setActiveTab("datesheet");
    } catch (err: any) {
      toast.error("Datesheet Scheduling Failed", { description: err.message });
    } finally {
      setSubmittingDatesheet(false);
    }
  };

  // Submit Single Paper
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          classId: formClassId,
          subjectId: formSubjectId,
          examDate: formExamDate,
          startTime: formStartTime,
          durationMinutes: Number(formDuration),
          totalMarks: Number(formTotalMarks),
          passingMarks: Number(formPassingMarks),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to schedule exam.");

      toast.success("Examination Paper Scheduled!", {
        description: `${formTitle} has been published to the academic timetable.`,
      });

      setCreateModalOpen(false);
      fetchExams();
    } catch (err: any) {
      toast.error("Scheduling Failed", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to remove this examination paper?")) return;
    try {
      const res = await fetch(`/api/exams?id=${examId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to delete exam.");
      toast.success("Exam paper removed.");
      fetchExams();
      fetchResults();
    } catch (err: any) {
      toast.error("Delete Failed", { description: err.message });
    }
  };

  const handleExportCSV = () => {
    if (activeTab === "results") {
      if (results.length === 0) return toast.info("No results to export.");
      const headers = "Rank,Student Name,Roll No,Admission ID,Class,Subject,Exam Title,Marks Obtained,Total Marks,Percentage,Grade,GPA,Status\n";
      const rows = results
        .map(
          (r) =>
            `${r.rank},"${r.studentName}","${r.rollNumber}","${r.admissionNumber}","${r.className}","${r.subjectName}","${r.examTitle}",${r.obtainedMarks},${r.totalMarks},"${r.percentage}%","${r.grade}",${r.gpa},"${r.isPassed ? "Pass" : "Fail"}"`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Seneca_Results_Gazette_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Results gazette exported to CSV!");
    } else {
      if (exams.length === 0) return toast.info("No exam schedules to export.");
      const headers = "Exam Paper Title,Subject,Class,Date,Time,Duration (Min),Total Marks,Passing Marks,Status\n";
      const rows = exams
        .map(
          (e) =>
            `"${e.title}","${e.subjectName}","${e.className}","${e.formattedDate}","${e.startTime}",${e.durationMinutes},${e.totalMarks},${e.passingMarks},"${e.status}"`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Seneca_Exam_Datesheet_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exam schedules exported to CSV!");
    }
  };

  // Metrics
  const totalExamsCount = exams.length;
  const scheduledExamsCount = exams.filter((e) => e.status === "scheduled").length;
  const completedExamsCount = exams.filter((e) => e.status === "completed").length;
  const evaluatedResultsCount = analytics?.totalEvaluated ?? results.length;
  const overallPassRate = analytics?.passRate ?? 0;
  const overallAvgMarks = analytics?.avgPercentage ?? 0;

  // Filtered Exams for Table & Datesheet
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.className.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClassFilter === "all" || e.classId === selectedClassFilter;
      const matchesStatus = selectedStatus === "all" || e.status === selectedStatus;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [exams, searchQuery, selectedClassFilter, selectedStatus]);

  // Group exams by class for the Datesheet view
  const classDatesheets = useMemo(() => {
    const map = new Map<string, { classInfo: ClassOption; papers: ExamData[] }>();
    classesList.forEach((c) => {
      map.set(c.id, { classInfo: c, papers: [] });
    });

    exams.forEach((e) => {
      if (map.has(e.classId)) {
        map.get(e.classId)!.papers.push(e);
      }
    });

    // Sort papers by date
    map.forEach((item) => {
      item.papers.sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    });

    if (selectedClassFilter !== "all") {
      const single = map.get(selectedClassFilter);
      return single ? [single] : [];
    }

    return Array.from(map.values()).filter((item) => item.papers.length > 0);
  }, [classesList, exams, selectedClassFilter]);

  const handlePrintDatesheet = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-5 sm:space-y-7 animate-in fade-in-50 duration-300 w-full overflow-x-hidden pb-12">
      {/* 1. Header & Hero Metric Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <Award className="h-3 w-3" />
                <span>Examinations & Academic Assessment Wing</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session 2026 Live</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Examinations, Datesheets & <span className="text-seneca-amber">Results</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Supervise class examination schedules, publish official term datesheets for students & parents, and monitor institutional pass rates, GPA distributions, and results gazettes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => handleOpenDatesheetBuilder()}
              variant="default"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto justify-center bg-seneca-amber text-black hover:bg-seneca-amber/90 h-10 sm:h-9"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Set Class Datesheet</span>
            </Button>
            <Button
              onClick={() => setCreateModalOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center h-10 sm:h-9"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Schedule Paper</span>
            </Button>
            <Link href="/dashboard/students">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center h-10 sm:h-9 gap-1.5"
                title="Evaluate Student Results & Promote to Next Grade"
              >
                <GraduationCap className="h-3.5 w-3.5 text-seneca-amber" />
                <span>Promote Students</span>
              </Button>
            </Link>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center h-10 sm:h-9"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (4 Real-Time Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Papers */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Exam Papers
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-crimson/10 text-seneca-crimson shrink-0">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {totalExamsCount} <span className="text-xs font-normal text-muted-foreground">Papers</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Active Status:</span>
            <span className="font-bold text-emerald-600">{scheduledExamsCount} Scheduled</span>
          </div>
        </Card>

        {/* Card 2: Datesheets Published */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Class Datesheets
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-amber/15 text-seneca-amber shrink-0">
              <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {classDatesheets.length} <span className="text-xs font-normal text-muted-foreground">Classes</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Portal Sync:</span>
            <span className="font-bold text-foreground">Published to Parents</span>
          </div>
        </Card>

        {/* Card 3: Evaluated Results */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Evaluated Results
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {evaluatedResultsCount} <span className="text-xs font-normal text-muted-foreground">Entries</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Pass Rate:</span>
            <span className="font-bold text-emerald-600">{overallPassRate}% Passed</span>
          </div>
        </Card>

        {/* Card 4: Average Score */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Average Performance
            </span>
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {overallAvgMarks}%
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Academic Rating:</span>
            <span className={cn(
              "font-bold",
              overallAvgMarks >= 80 ? "text-emerald-600" : overallAvgMarks >= 60 ? "text-amber-600" : "text-rose-600"
            )}>
              {overallAvgMarks >= 80 ? "Grade A (High Honors)" : overallAvgMarks >= 60 ? "Grade B (Satisfactory)" : "Needs Intervention"}
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Main Navigation Tab Selector & Control Strip */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main 3 Tabs */}
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/60 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("results")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                activeTab === "results"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="h-3.5 w-3.5 text-seneca-crimson" />
              <span>Results & Performance Progress</span>
            </button>
            <button
              onClick={() => setActiveTab("datesheet")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                activeTab === "datesheet"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5 text-seneca-amber" />
              <span>Class Datesheet Manager</span>
            </button>
            <button
              onClick={() => setActiveTab("exams")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                activeTab === "exams"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Award className="h-3.5 w-3.5 text-blue-600" />
              <span>Exam Papers Register ({exams.length})</span>
            </button>
          </div>

          {/* Quick Class Dropdown Filter & Search */}
          <div className="flex items-center gap-2">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="h-9.5 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 outline-none"
            >
              <option value="all">All Class Sections</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>

            <Button
              onClick={() => {
                fetchExams();
                fetchResults();
              }}
              variant="outline"
              size="icon"
              className="h-9.5 w-9.5 rounded-xl shrink-0"
              title="Refresh Records"
            >
              <RefreshCw className={cn("h-4 w-4", (loading || loadingResults) && "animate-spin")} />
            </Button>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* TAB 1: CLASS RESULTS & PERFORMANCE PROGRESS                               */}
      {/* ========================================================================= */}
      {activeTab === "results" && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-200">
          {/* Results Analytics Summary Banner */}
          {analytics && analytics.totalEvaluated > 0 && (
            <Card className="border border-border/80 bg-gradient-to-br from-card/95 via-card/90 to-background backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-seneca-crimson" />
                    <span>Academic Performance & Grade Distribution</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Aggregated over {analytics.totalEvaluated} evaluated result cards
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Pass Rate: {analytics.passRate}%
                  </Badge>
                  <Badge variant="outline" className="text-xs font-bold bg-seneca-amber/15 text-seneca-amber border-seneca-amber/30">
                    Avg Score: {analytics.avgPercentage}%
                  </Badge>
                </div>
              </div>

              {/* Grade Spectrum Badges */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { grade: "A+", label: "90% - 100%", count: analytics.gradeDistribution?.["A+"] || 0, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
                  { grade: "A", label: "80% - 89%", count: analytics.gradeDistribution?.["A"] || 0, color: "text-blue-600 bg-blue-500/10 border-blue-500/30" },
                  { grade: "B", label: "70% - 79%", count: analytics.gradeDistribution?.["B"] || 0, color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30" },
                  { grade: "C", label: "60% - 69%", count: analytics.gradeDistribution?.["C"] || 0, color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
                  { grade: "D", label: "50% - 59%", count: analytics.gradeDistribution?.["D"] || 0, color: "text-orange-600 bg-orange-500/10 border-orange-500/30" },
                  { grade: "F", label: "Below 50%", count: analytics.gradeDistribution?.["F"] || 0, color: "text-rose-600 bg-rose-500/10 border-rose-500/30" },
                ].map((item) => (
                  <div key={item.grade} className={cn("p-2.5 rounded-2xl border text-center space-y-1", item.color)}>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-extrabold">{item.grade}</span>
                      <span className="text-[10px] font-mono font-bold">{item.count}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground block font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Top Academic Rankers Strip */}
              {analytics.topRankers && analytics.topRankers.length > 0 && (
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-seneca-amber" />
                    <span>Top Honor Roll Students (High Achievers)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {analytics.topRankers.map((top: ResultData, idx: number) => (
                      <div
                        key={top.id}
                        className="p-2.5 rounded-xl bg-background border border-border/70 flex items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn(
                            "h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                            idx === 0 ? "bg-amber-500 text-white" : idx === 1 ? "bg-slate-400 text-white" : idx === 2 ? "bg-amber-700 text-white" : "bg-muted text-foreground"
                          )}>
                            #{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground truncate block">{top.studentName}</span>
                            <span className="text-[10px] text-muted-foreground">{top.className}</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold font-mono text-emerald-600 shrink-0">
                          {top.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Results Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search result by student name, roll number, admission ID, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-background text-xs"
              />
            </div>
            <div className="text-xs text-muted-foreground font-medium self-end sm:self-auto">
              Showing {results.length} Result Records
            </div>
          </div>

          {/* Results Table Gazette */}
          {loadingResults ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
              <p className="text-xs font-bold text-muted-foreground">Loading Examination Results...</p>
            </div>
          ) : results.length === 0 ? (
            <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-3">
              <Award className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Results Transcribed Yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Results appear here as teachers transcribe scores in their Teacher Examination Ledger.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 px-4">Rank</th>
                      <th className="py-3.5 px-4">Student Particulars</th>
                      <th className="py-3.5 px-4">Class Section</th>
                      <th className="py-3.5 px-4">Subject & Exam</th>
                      <th className="py-3.5 px-4">Marks Obtained</th>
                      <th className="py-3.5 px-4">Grade & GPA</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-muted-foreground">
                          #{r.rank}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">{r.studentName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            Roll: {r.rollNumber} • ID: {r.admissionNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-bold text-xs bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/25">
                            {r.className}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{r.subjectName}</div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{r.examTitle}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-extrabold text-foreground">
                            {r.obtainedMarks} / {r.totalMarks}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{r.percentage}% Score</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-extrabold px-2 py-0.5",
                                r.grade.startsWith("A")
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : r.grade === "B"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                  : r.grade === "C"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                              )}
                            >
                              {r.grade}
                            </Badge>
                            {r.gpa > 0 && (
                              <span className="text-[10px] text-muted-foreground font-mono font-medium">
                                GPA {r.gpa.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold",
                              r.isPassed
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            )}
                          >
                            {r.isPassed ? "Passed" : "Needs Re-take"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLASS EXAMINATION DATESHEET MANAGER                                */}
      {/* ========================================================================= */}
      {activeTab === "datesheet" && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-200">
          {/* Datesheet Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-seneca-amber/15 via-seneca-amber/5 to-transparent border border-seneca-amber/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-seneca-amber text-black font-bold">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Class Datesheet Scheduling & Publication</h3>
                <p className="text-xs text-muted-foreground">
                  Build complete multi-paper examination datesheets for any class section and print official timetable slips.
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleOpenDatesheetBuilder()}
              variant="default"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 bg-seneca-amber text-black hover:bg-seneca-amber/90 shadow-md self-start sm:self-auto h-9"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Publish New Datesheet</span>
            </Button>
          </div>

          {/* Datesheet Class Cards List */}
          {classDatesheets.length === 0 ? (
            <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-3">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Datesheets Scheduled Yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Click &apos;Publish New Datesheet&apos; above to schedule term papers for your classes.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {classDatesheets.map(({ classInfo, papers }) => (
                <Card
                  key={classInfo.id}
                  className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4"
                >
                  {/* Class Datesheet Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 rounded-xl bg-seneca-crimson text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                        {classInfo.section}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          <span>{classInfo.fullName} Examination Datesheet</span>
                          <Badge variant="outline" className="text-[10px] font-bold bg-seneca-amber/15 text-seneca-amber border-seneca-amber/30">
                            {papers.length} Papers Scheduled
                          </Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {classInfo.roomNumber} • Enrolled: {classInfo.enrolledCount || 0} Students
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => setPrintableDatesheetClass(classInfo)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-border shadow-xs"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Print Official Datesheet</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleOpenDatesheetBuilder(classInfo.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1 text-seneca-amber hover:bg-seneca-amber/10"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Paper</span>
                      </Button>
                    </div>
                  </div>

                  {/* Papers Timeline Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {papers.map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl border border-border/80 bg-background space-y-2.5 shadow-xs hover:border-seneca-crimson/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1.5">
                            <Badge variant="outline" className="text-[9px] font-bold bg-muted text-muted-foreground font-mono">
                              Paper #{idx + 1}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold capitalize",
                                p.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                              )}
                            >
                              {p.status}
                            </Badge>
                          </div>

                          <h4 className="text-xs font-bold text-foreground leading-snug">{p.title}</h4>
                          <span className="text-[11px] font-semibold text-seneca-crimson block">
                            {p.subjectName} ({p.subjectCode})
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>Date:</span>
                            </span>
                            <span className="font-bold text-foreground">{p.formattedDate}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>Time:</span>
                            </span>
                            <span className="font-medium text-foreground">{p.startTime} ({p.durationMinutes}m)</span>
                          </div>
                          <div className="flex items-center justify-between pt-0.5 border-t border-border/40">
                            <span className="text-muted-foreground">Total / Pass:</span>
                            <span className="font-bold text-foreground">{p.totalMarks} / {p.passingMarks} Pts</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                          <span className="text-[10px] text-muted-foreground">
                            {p.evaluatedCount > 0 ? `${p.evaluatedCount} evaluated` : "Pending evaluation"}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExam(p.id)}
                            className="h-6 w-6 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                            title="Remove Paper"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MASTER EXAM PAPERS REGISTER                                        */}
      {/* ========================================================================= */}
      {activeTab === "exams" && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-200">
          {/* Search and Status Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by exam title, subject, or class section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-background text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Master Table */}
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
              <p className="text-xs font-bold text-muted-foreground">Loading Examination Register...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-3">
              <Award className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Exam Papers Match</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Adjust your search or filter options.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 px-4">Exam Paper Title</th>
                      <th className="py-3.5 px-4">Class Section</th>
                      <th className="py-3.5 px-4">Subject</th>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4">Total / Pass Marks</th>
                      <th className="py-3.5 px-4">Evaluation</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredExams.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">{e.title}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-bold text-xs bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/25">
                            {e.className}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{e.subjectName}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{e.formattedDate}</div>
                          <div className="text-[10px] text-muted-foreground">{e.startTime} ({e.durationMinutes}m)</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-foreground">{e.totalMarks} Total</span> / <span className="text-emerald-600">{e.passingMarks} Pass</span>
                        </td>
                        <td className="py-3 px-4">
                          {e.evaluatedCount > 0 ? (
                            <span className="text-[11px] font-bold text-emerald-600">
                              {e.evaluatedCount} Transcribed ({e.avgMarks}% avg)
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={() => setSelectedExam(e)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 rounded-lg text-xs font-bold gap-1 text-primary"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Details</span>
                            </Button>
                            <Button
                              onClick={() => handleDeleteExam(e.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                              title="Delete Exam"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SET CLASS EXAMINATION DATESHEET BUILDER                          */}
      {/* ========================================================================= */}
      <Dialog open={datesheetModalOpen} onOpenChange={setDatesheetModalOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-2xl sm:rounded-3xl shadow-2xl border border-border/80 bg-card">
          <form onSubmit={handleSubmitDatesheet} className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-border/60 bg-card/95 backdrop-blur-md space-y-3 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-seneca-amber text-black font-bold">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                      Set Class Examination Datesheet
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Publish multi-subject examination datesheet schedule for a class section
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Class & Term Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Target Class Section *</label>
                  <select
                    value={datesheetClassId}
                    onChange={(e) => setDatesheetClassId(e.target.value)}
                    className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 outline-none"
                  >
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.enrolledCount || 0} Students)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Examination Term Title *</label>
                  <Input
                    required
                    type="text"
                    value={datesheetTermTitle}
                    onChange={(e) => setDatesheetTermTitle(e.target.value)}
                    placeholder="e.g. Mid-Term Examination 2026"
                    className="h-10 rounded-xl text-xs bg-background font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Modal Body: Dynamic Subject Paper Rows */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between gap-2 pb-1">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Subject Papers Schedule ({datesheetRows.length} Papers)</span>
                </span>
                <Button
                  type="button"
                  onClick={handleAddDatesheetRow}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-[10px] font-bold gap-1 rounded-lg border-seneca-crimson/30 text-seneca-crimson hover:bg-seneca-crimson/10"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Subject Paper</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {datesheetRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-border/80 bg-background space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5 font-mono">
                        <span className="h-5 w-5 rounded bg-muted flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>Paper #{idx + 1}</span>
                      </span>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDatesheetRow(idx)}
                        className="h-6 w-6 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                        title="Remove Paper"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Subject *</label>
                        <select
                          value={row.subjectId}
                          onChange={(e) => handleUpdateDatesheetRow(idx, "subjectId", e.target.value)}
                          className="h-9 w-full px-2.5 rounded-xl bg-background border border-border text-xs font-bold"
                        >
                          {subjectsList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Exam Date *</label>
                        <Input
                          required
                          type="date"
                          value={row.examDate}
                          onChange={(e) => handleUpdateDatesheetRow(idx, "examDate", e.target.value)}
                          className="h-9 rounded-xl text-xs bg-background"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Start Time *</label>
                        <Input
                          required
                          type="text"
                          value={row.startTime}
                          onChange={(e) => handleUpdateDatesheetRow(idx, "startTime", e.target.value)}
                          placeholder="09:00 AM"
                          className="h-9 rounded-xl text-xs bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-border/40">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Duration (Mins)</label>
                        <Input
                          type="number"
                          value={row.durationMinutes}
                          onChange={(e) => handleUpdateDatesheetRow(idx, "durationMinutes", e.target.value)}
                          placeholder="120"
                          className="h-8 rounded-lg text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Total Marks</label>
                        <Input
                          type="number"
                          value={row.totalMarks}
                          onChange={(e) => handleUpdateDatesheetRow(idx, "totalMarks", e.target.value)}
                          placeholder="100"
                          className="h-8 rounded-lg text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Pass Marks</label>
                        <Input
                          type="number"
                          value={row.passingMarks}
                          onChange={(e) => handleUpdateDatesheetRow(idx, "passingMarks", e.target.value)}
                          placeholder="40"
                          className="h-8 rounded-lg text-xs bg-background text-emerald-600 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-border/60 bg-card/95 flex items-center justify-between gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDatesheetModalOpen(false)}
                className="rounded-xl text-xs font-bold h-10 sm:h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingDatesheet || datesheetRows.length === 0}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5 shadow-lg shadow-seneca-amber/20 h-10 sm:h-9 px-5 bg-seneca-amber text-black hover:bg-seneca-amber/90"
              >
                {submittingDatesheet ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing Datesheet...</span>
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-4 w-4" />
                    <span>Publish Official Datesheet ({datesheetRows.length} Papers)</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL PRINTABLE DATESHEET SLIP                                 */}
      {/* ========================================================================= */}
      {printableDatesheetClass && (
        <Dialog open={!!printableDatesheetClass} onOpenChange={() => setPrintableDatesheetClass(null)}>
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 my-4 shadow-2xl border border-border/80 bg-card">
            <style jsx global>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-datesheet-slip,
                #printable-datesheet-slip * {
                  visibility: visible !important;
                }
                #printable-datesheet-slip {
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

            <DialogHeader className="border-b border-border/60 pb-3 no-print">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <DialogTitle className="text-base font-bold text-foreground">
                    Official Examination Datesheet Slip
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    {printableDatesheetClass.fullName} • Academic Session 2026
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handlePrintDatesheet}
                    variant="glow"
                    size="sm"
                    className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Datesheet / PDF</span>
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Printable Container */}
            <div id="printable-datesheet-slip" className="p-4 sm:p-6 rounded-2xl border border-border/80 bg-background space-y-4 font-sans text-xs">
              {/* Slip Header */}
              <div className="text-center border-b border-border pb-3 space-y-1">
                <h2 className="font-extrabold text-base tracking-tight text-foreground uppercase font-serif">
                  SENECA ACADEMY
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Academic Wing • Official Examination Datesheet & Seating Timetable
                </p>
                <div className="pt-1.5 flex items-center justify-center gap-3 text-[11px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-muted border text-foreground">
                    Class: {printableDatesheetClass.fullName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-muted border text-foreground">
                    Room: {printableDatesheetClass.roomNumber || "Campus Examination Hall"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                    Session 2026
                  </span>
                </div>
              </div>

              {/* Papers Table */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground font-bold border-b border-border text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Subject</th>
                      <th className="py-2 px-3">Exam Date</th>
                      <th className="py-2 px-3">Day & Time</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3 text-right">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {exams
                      .filter((e) => e.classId === printableDatesheetClass.id)
                      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
                      .map((p, idx) => {
                        const dayName = p.examDate
                          ? new Date(p.examDate).toLocaleDateString("en-US", { weekday: "long" })
                          : "Weekday";
                        return (
                          <tr key={p.id} className="hover:bg-muted/20">
                            <td className="py-2 px-3 font-mono font-bold text-muted-foreground">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold text-foreground">
                              {p.subjectName} ({p.subjectCode})
                            </td>
                            <td className="py-2 px-3 font-semibold text-foreground">{p.formattedDate}</td>
                            <td className="py-2 px-3 text-muted-foreground">
                              {dayName} • {p.startTime}
                            </td>
                            <td className="py-2 px-3">{p.durationMinutes} Minutes</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                              {p.totalMarks} Pts
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Examination Regulations */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5 text-[10px] text-muted-foreground">
                <span className="font-bold text-foreground block">General Examination Instructions for Candidates:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Candidates must arrive 15 minutes before the scheduled start time with official student identity cards.</li>
                  <li>Calculators and formula sheets are strictly permitted only for designated Science and Mathematics assessments.</li>
                  <li>No mobile phones, electronic smartwatches, or unauthorized study materials are permitted in the exam hall.</li>
                </ul>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="border-t border-muted-foreground/40 pt-1 px-3">Controller of Examinations</span>
                <span className="border-t border-muted-foreground/40 pt-1 px-3">Academic Principal</span>
              </div>
            </div>

            <DialogFooter className="pt-2 no-print">
              <Button
                onClick={() => setPrintableDatesheetClass(null)}
                variant="outline"
                className="w-full rounded-xl text-xs font-bold"
              >
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SCHEDULE SINGLE EXAM PAPER MODAL                                 */}
      {/* ========================================================================= */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8 my-6 sm:my-8 shadow-2xl border border-border/80">
          <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
              <Award className="h-4 w-4" />
              <span>Examination Scheduling</span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-extrabold font-heading">
              Schedule Single Examination Paper
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define paper title, target class, date, time slot, and marks threshold
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Exam Paper Title <span className="text-seneca-crimson">*</span>
              </label>
              <Input
                required
                type="text"
                placeholder="e.g. Mid-Term Examination 2026 - Physics"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Target Class</label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                >
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Subject</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                >
                  {subjectsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Exam Date</label>
                <Input
                  required
                  type="date"
                  value={formExamDate}
                  onChange={(e) => setFormExamDate(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Start Time</label>
                <Input
                  required
                  type="text"
                  placeholder="09:00 AM"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Duration (Min)</label>
                <Input
                  required
                  type="number"
                  placeholder="120"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Total Marks</label>
                <Input
                  required
                  type="number"
                  placeholder="100"
                  value={formTotalMarks}
                  onChange={(e) => setFormTotalMarks(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Passing Marks</label>
                <Input
                  required
                  type="number"
                  placeholder="40"
                  value={formPassingMarks}
                  onChange={(e) => setFormPassingMarks(e.target.value)}
                  className="h-11 rounded-xl text-xs text-emerald-600 font-bold"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/60 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson text-white hover:bg-seneca-crimson/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Schedule Paper</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: EXAM PAPER DETAILS MODAL                                         */}
      {/* ========================================================================= */}
      {selectedExam && (
        <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
          <DialogContent className="max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 my-6 sm:my-8 shadow-2xl border border-border/80">
            <DialogHeader className="border-b border-border/60 pb-3">
              <DialogTitle className="text-base sm:text-lg font-bold">{selectedExam.title}</DialogTitle>
              <p className="text-xs text-muted-foreground">
                {selectedExam.subjectName} ({selectedExam.subjectCode}) • {selectedExam.className}
              </p>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-muted/40">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Exam Date & Time</span>
                  <span className="font-bold text-foreground text-xs sm:text-sm">
                    {selectedExam.formattedDate} ({selectedExam.startTime})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Duration</span>
                  <span className="font-bold text-foreground text-xs sm:text-sm">{selectedExam.durationMinutes} Minutes</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Total Marks</span>
                  <span className="font-bold text-foreground text-xs sm:text-sm">{selectedExam.totalMarks} Pts</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Passing Marks</span>
                  <span className="font-bold text-emerald-600 text-xs sm:text-sm">{selectedExam.passingMarks} Pts</span>
                </div>
              </div>

              {selectedExam.evaluatedCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-600 block">Evaluation Performance:</span>
                  <div className="flex items-center justify-between text-xs">
                    <span>Evaluated Students:</span>
                    <strong className="font-mono">{selectedExam.evaluatedCount}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Average Marks:</span>
                    <strong className="font-mono">{selectedExam.avgMarks} / {selectedExam.totalMarks}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Highest Score:</span>
                    <strong className="font-mono text-emerald-600">{selectedExam.highestMarks} Pts</strong>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                onClick={() => setSelectedExam(null)}
                variant="outline"
                className="w-full rounded-xl text-xs font-bold"
              >
                Close Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
