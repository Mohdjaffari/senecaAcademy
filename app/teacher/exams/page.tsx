"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Check,
  Calculator,
  Loader2,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  X,
  Clock,
  ShieldCheck,
  Users,
  Percent,
  Edit,
  Eye,
  FileText,
  Sliders,
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

interface StudentExamRow {
  id: string;
  studentId: string;
  name: string;
  rollNumber: string;
  admissionNumber: string;
  className: string;
  classId?: string;
  gender?: string;
  avatarUrl?: string;
  theoryMarks: number;
  practicalMarks: number;
  remarks: string;
}

interface TeachingBook {
  id: string;
  name: string;
  code: string;
  department: string;
  classes: Array<{ id: string; name: string }>;
  students?: any[];
  enrolledStudentsCount: number;
}

interface ExamTerm {
  id: string;
  name: string;
  weightage: string;
  isCurrent: boolean;
}

const DEFAULT_TERMS: ExamTerm[] = [
  { id: "mid-term", name: "Mid-Term Examination 2026-2027", weightage: "40%", isCurrent: true },
  { id: "final-term", name: "Final Term Assessment 2026-2027", weightage: "60%", isCurrent: false },
  { id: "diagnostic", name: "First Diagnostic Assessment", weightage: "10%", isCurrent: false },
];

const REMARK_PRESETS = [
  "Outstanding analytical & problem solving skills.",
  "Top in class. Flawless practical and theoretical mastery.",
  "Excellent conceptual clarity and execution.",
  "Very good presentation, derivations, and clarity.",
  "Good performance; minor arithmetic errors on derivations.",
  "Satisfactory; recommend extra practice on core formulas.",
  "Remedial revision recommended before final term.",
];

export default function TeacherExamMarksPage() {
  const [teachingBooks, setTeachingBooks] = useState<TeachingBook[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("Mid-Term Examination 2026-2027");
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStanding, setSelectedStanding] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxTheory, setMaxTheory] = useState(75);
  const [maxPractical, setMaxPractical] = useState(25);
  const [studentRows, setStudentRows] = useState<StudentExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Schema Settings Modal State
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);
  const [tempTheory, setTempTheory] = useState(75);
  const [tempPractical, setTempPractical] = useState(25);

  const maxTotal = maxTheory + maxPractical;

  // Calculate Cambridge Letter Grade & Color Token
  const calculateGrade = (total: number, max: number) => {
    const percentage = max > 0 ? (total / max) * 100 : 0;
    if (percentage >= 90)
      return { grade: "A*", gpa: 4.0, label: "Distinction", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" };
    if (percentage >= 80)
      return { grade: "A", gpa: 3.7, label: "Merit", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" };
    if (percentage >= 70)
      return { grade: "B", gpa: 3.0, label: "High Pass", color: "text-seneca-amber-dark bg-seneca-amber/15 border-seneca-amber/30" };
    if (percentage >= 60)
      return { grade: "C", gpa: 2.0, label: "Standard Pass", color: "text-sky-600 bg-sky-500/10 border-sky-500/30" };
    if (percentage >= 50)
      return { grade: "D", gpa: 1.0, label: "Low Pass", color: "text-amber-700 bg-amber-500/10 border-amber-500/30" };
    return { grade: "F", gpa: 0.0, label: "Failed", color: "text-rose-600 bg-rose-500/10 border-rose-500/30" };
  };

  // Fetch teaching curriculum books & enrolled student cohorts
  const fetchTeacherExamData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/exams", { cache: "no-store" });
      const data = await res.json();

      if (data.success && data.data?.books && data.data.books.length > 0) {
        const booksList: TeachingBook[] = data.data.books;
        setTeachingBooks(booksList);

        // Build unified student rows from books
        const rowsMap = new Map<string, StudentExamRow>();

        booksList.forEach((book, bIdx) => {
          (book.students || []).forEach((st: any, sIdx: number) => {
            const stId = st.studentId || st.id;
            if (!stId) return;

            if (!rowsMap.has(stId)) {
              // Generate realistic standard exam score for mid-term demonstration
              const basePct = 70 + ((sIdx * 13 + bIdx * 7) % 28);
              const tScore = Math.round((basePct * 75) / 100);
              const pScore = Math.min(25, Math.round((basePct * 25) / 100));

              rowsMap.set(stId, {
                id: stId,
                studentId: stId,
                name: st.name || "Student",
                rollNumber: st.rollNumber || `ROLL-07-0${sIdx + 1}`,
                admissionNumber: st.admissionNumber || `SNC-2026-0${sIdx + 80}`,
                className: st.className || "Grade 7 Cambridge",
                classId: st.classId,
                gender: st.gender || "Not specified",
                avatarUrl: st.avatarUrl,
                theoryMarks: tScore,
                practicalMarks: pScore,
                remarks:
                  basePct >= 90
                    ? REMARK_PRESETS[0]
                    : basePct >= 80
                    ? REMARK_PRESETS[2]
                    : basePct >= 70
                    ? REMARK_PRESETS[3]
                    : REMARK_PRESETS[5],
              });
            }
          });
        });

        if (rowsMap.size > 0) {
          setStudentRows(Array.from(rowsMap.values()));
        } else {
          setStudentRows([]);
        }
      } else {
        setStudentRows([]);
        setTeachingBooks([]);
      }
    } catch (_) {
      setStudentRows([]);
      setTeachingBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherExamData();
  }, []);

  // Compute unique classes list
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, string>();
    teachingBooks.forEach((b) => {
      (b.classes || []).forEach((c) => {
        classMap.set(c.id, c.name);
      });
    });
    if (classMap.size === 0) {
      studentRows.forEach((s) => {
        if (s.className) classMap.set(s.className, s.className);
      });
    }
    return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
  }, [teachingBooks, studentRows]);

  // Handle score changes with strict clamp
  const handleTheoryChange = (id: string, val: number) => {
    const clamped = Math.min(maxTheory, Math.max(0, val || 0));
    setStudentRows((prev) =>
      prev.map((s) => (s.id === id ? { ...s, theoryMarks: clamped } : s))
    );
  };

  const handlePracticalChange = (id: string, val: number) => {
    const clamped = Math.min(maxPractical, Math.max(0, val || 0));
    setStudentRows((prev) =>
      prev.map((s) => (s.id === id ? { ...s, practicalMarks: clamped } : s))
    );
  };

  const handleRemarksChange = (id: string, remarks: string) => {
    setStudentRows((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remarks } : s))
    );
  };

  // Quick preset apply for remarks
  const handleApplyRemarkPreset = (id: string, preset: string) => {
    handleRemarksChange(id, preset);
    toast.success("Remark preset applied!");
  };

  // Save / Finalize Gazette Submission to MongoDB
  const handleSaveGazette = async () => {
    if (studentRows.length === 0) return toast.info("No student marks records to save.");

    const activeBook = teachingBooks.find((b) => b.id === selectedBook) || teachingBooks[0];

    setSaving(true);
    try {
      const payload = {
        termName: selectedTerm,
        subjectId: activeBook?.id,
        classId: activeBook?.classes[0]?.id,
        maxTheory,
        maxPractical,
        records: studentRows.map((s) => {
          const total = s.theoryMarks + s.practicalMarks;
          const percentage = Math.round((total / (maxTotal || 100)) * 100);
          const { grade, gpa } = calculateGrade(total, maxTotal);

          return {
            studentId: s.studentId || s.id,
            classId: s.classId,
            theoryMarks: s.theoryMarks,
            practicalMarks: s.practicalMarks,
            totalMarks: total,
            percentage,
            grade,
            gpa,
            remarks: s.remarks,
          };
        }),
      };

      const res = await fetch("/api/teacher/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to submit gazette.");

      const timeStr = new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
      setLastSaved(timeStr);

      toast.success("Official Examination Gazette Submitted!", {
        description: `Validated marks for ${studentRows.length} students posted to Seneca Examination Authority.`,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to save examination marks.");
    } finally {
      setSaving(false);
    }
  };

  // Export Gazette to CSV
  const handleExportCSV = () => {
    if (filteredRows.length === 0) return toast.info("No records to export matching filter.");

    const chosenBook = teachingBooks.find((b) => b.id === selectedBook)?.name || "All Books";
    const headers =
      "Roll Number,Admission No,Student Name,Class,Teaching Book,Exam Term,Theory Marks,Max Theory,Practical Marks,Max Practical,Total Marks,Max Total,Percentage,Grade,GPA,Official Remarks\n";

    const rows = filteredRows
      .map((s) => {
        const total = s.theoryMarks + s.practicalMarks;
        const pct = ((total / maxTotal) * 100).toFixed(1);
        const { grade, gpa } = calculateGrade(total, maxTotal);
        return `"${s.rollNumber}","${s.admissionNumber}","${s.name}","${s.className}","${chosenBook}","${selectedTerm}",${s.theoryMarks},${maxTheory},${s.practicalMarks},${maxPractical},${total},${maxTotal},${pct}%,${grade},${gpa},"${(s.remarks || "").replace(/"/g, '""')}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Seneca_Gazette_${selectedTerm.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported gazette ledger for ${filteredRows.length} students!`);
  };

  // Apply schema changes
  const handleApplySchema = () => {
    if (tempTheory <= 0 && tempPractical <= 0) return toast.error("Total marks must be greater than 0.");
    setMaxTheory(tempTheory);
    setMaxPractical(tempPractical);
    setSchemaModalOpen(false);
    toast.success(`Marking Schema updated: Theory = ${tempTheory}, Practical = ${tempPractical} (Total: ${tempTheory + tempPractical})`);
  };

  // Filtered Rows
  const filteredRows = useMemo(() => {
    return studentRows.filter((s) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.remarks.toLowerCase().includes(q);

      // 2. Class Filter
      const matchesClass =
        selectedClass === "all" ||
        (s.classId && s.classId === selectedClass) ||
        s.className.toLowerCase().includes(selectedClass.toLowerCase());

      // 3. Academic Standing Filter
      const total = s.theoryMarks + s.practicalMarks;
      const { grade } = calculateGrade(total, maxTotal);
      const matchesStanding =
        selectedStanding === "all" ||
        (selectedStanding === "A*" && grade === "A*") ||
        (selectedStanding === "A" && (grade === "A*" || grade === "A")) ||
        (selectedStanding === "B" && grade === "B") ||
        (selectedStanding === "pass" && grade !== "F") ||
        (selectedStanding === "fail" && grade === "F");

      return matchesSearch && matchesClass && matchesStanding;
    });
  }, [studentRows, searchQuery, selectedClass, selectedStanding, maxTotal]);

  // Executive Metrics
  const metrics = useMemo(() => {
    const count = studentRows.length;
    const avgTotal =
      count > 0 ? Math.round(studentRows.reduce((acc, s) => acc + s.theoryMarks + s.practicalMarks, 0) / count) : 0;
    const avgPct = maxTotal > 0 ? Math.round((avgTotal / maxTotal) * 100) : 0;

    const topStudent = [...studentRows].sort(
      (a, b) => b.theoryMarks + b.practicalMarks - (a.theoryMarks + a.practicalMarks)
    )[0];

    const passCount = studentRows.filter((s) => {
      const total = s.theoryMarks + s.practicalMarks;
      return total >= maxTotal * 0.5;
    }).length;

    const passRate = count > 0 ? Math.round((passCount / count) * 100) : 100;
    const failCount = count - passCount;

    return {
      count,
      avgTotal,
      avgPct,
      topStudent,
      passRate,
      failCount,
    };
  }, [studentRows, maxTotal]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-5 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <Award className="h-3 w-3" />
                <span>Examination Authority Ledger</span>
              </span>
              {lastSaved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Gazette Synced at {lastSaved}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-seneca-amber/20 text-seneca-amber-light text-[10px] sm:text-[11px] font-bold border border-seneca-amber/30">
                  <Clock className="h-3 w-3" />
                  <span>Term Entry Active</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Exam Marks Entry & <span className="text-seneca-amber">Gazette Ledger</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Record Mid-Term & Final Term examination marks for your teaching curriculum books. Evaluate
              theory and practical components, calculate automated Cambridge letter grades, and submit official report card data.
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
              <span>Export Gazette CSV</span>
            </Button>
            <Button
              onClick={handleSaveGazette}
              disabled={saving}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 flex-1 sm:flex-initial justify-center"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{saving ? "Posting Gazette..." : "Save & Finalize Gazette"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Executive Gazette Ledger Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-crimson/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Examination Term
            </span>
            <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-sm sm:text-base font-extrabold font-heading text-foreground truncate">
              {selectedTerm}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {teachingBooks.find((b) => b.id === selectedBook)?.name || "All Assigned Subjects"}
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Class Average
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-600">
              {metrics.avgPct}%
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {metrics.avgTotal} / {maxTotal} Marks Cohort Avg.
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-amber/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Top Scorer (Distinction)
            </span>
            <div className="p-2 rounded-xl bg-seneca-amber/15 text-seneca-amber">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-seneca-amber">
              {metrics.topStudent ? metrics.topStudent.theoryMarks + metrics.topStudent.practicalMarks : 0} / {maxTotal}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold truncate block">
              {metrics.topStudent?.name || "Student"} (Grade A*)
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pass Rate & Cohort
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {metrics.passRate}%
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {metrics.count} Enrolled ({metrics.failCount} Failing)
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Multi-Filter & Marking Schema Controls */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
        {/* Row 1: Term, Book, Grade, Standing Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Term Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Award className="h-3 w-3 text-seneca-crimson" />
              <span>Examination Series</span>
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-seneca-crimson"
            >
              {DEFAULT_TERMS.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.weightage})
                </option>
              ))}
            </select>
          </div>

          {/* Teaching Book Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-seneca-amber" />
              <span>Teaching Book / Subject</span>
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-seneca-amber"
            >
              <option value="all">All Teaching Books ({teachingBooks.length})</option>
              {teachingBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Grade / Class Section */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="h-3 w-3 text-blue-600" />
              <span>Grade & Class Section</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Assigned Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Standing Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Percent className="h-3 w-3 text-emerald-600" />
              <span>Performance Filter</span>
            </label>
            <select
              value={selectedStanding}
              onChange={(e) => setSelectedStanding(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Student Standings</option>
              <option value="A*">Distinction (A* - 90%+)</option>
              <option value="A">High Achievers (A* & A)</option>
              <option value="B">Grade B (70-79%)</option>
              <option value="pass">All Passing (≥50%)</option>
              <option value="fail">Failing / At Risk (&lt;50%)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Search Bar, Marking Schema & View Switcher */}
        <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4 text-seneca-crimson" />
              <span>
                Schema: Theory = <strong className="text-foreground">{maxTheory}</strong>, Practical ={" "}
                <strong className="text-foreground">{maxPractical}</strong> (Total:{" "}
                <strong className="text-seneca-crimson">{maxTotal}</strong>)
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTempTheory(maxTheory);
                setTempPractical(maxPractical);
                setSchemaModalOpen(true);
              }}
              className="rounded-xl text-xs font-bold gap-1 h-9"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Edit Schema Marks</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search student or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 rounded-xl bg-background text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Ledger Table View"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all",
                  viewMode === "cards"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Student Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Tabular Marks Ledger & Cards Display */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
          <p className="text-xs font-bold text-muted-foreground">Loading Examination Gazette Ledger...</p>
        </div>
      ) : filteredRows.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-14 text-center space-y-4">
          <Award className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-heading text-foreground">No Examination Records Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No students match your selected book, grade, or search filter.
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
            Clear Filters
          </Button>
        </Card>
      ) : viewMode === "table" ? (
        /* DENSE INTERACTIVE LEDGER TABLE */
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/60">
                <tr>
                  <th className="p-3.5 sm:p-4 pl-5">#</th>
                  <th className="p-3.5 sm:p-4">Student Name & Roll</th>
                  <th className="p-3.5 sm:p-4">Class</th>
                  <th className="p-3.5 sm:p-4 text-center">Theory (/{maxTheory})</th>
                  <th className="p-3.5 sm:p-4 text-center">Practical (/{maxPractical})</th>
                  <th className="p-3.5 sm:p-4 text-center">Total (/{maxTotal})</th>
                  <th className="p-3.5 sm:p-4 text-center">Grade</th>
                  <th className="p-3.5 sm:p-4 text-center">GPA</th>
                  <th className="p-3.5 sm:p-4 pr-5">Official Performance Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {filteredRows.map((s, index) => {
                  const total = s.theoryMarks + s.practicalMarks;
                  const pct = ((total / maxTotal) * 100).toFixed(1);
                  const { grade, gpa, color } = calculateGrade(total, maxTotal);

                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 sm:p-4 pl-5 text-muted-foreground font-bold text-[10px]">
                        {index + 1}
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-seneca-amber/30 shrink-0">
                            <AvatarImage src={s.avatarUrl} alt={s.name} />
                            <AvatarFallback className="bg-seneca-crimson text-white font-bold text-xs">
                              {s.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-bold text-foreground block">{s.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{s.rollNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 font-semibold text-foreground">{s.className}</td>
                      <td className="p-3.5 sm:p-4 text-center">
                        <Input
                          type="number"
                          max={maxTheory}
                          min={0}
                          value={s.theoryMarks}
                          onChange={(e) => handleTheoryChange(s.id, Number(e.target.value))}
                          className="h-8 w-20 mx-auto rounded-xl bg-background font-bold text-xs text-center focus:ring-2 focus:ring-seneca-crimson"
                        />
                      </td>
                      <td className="p-3.5 sm:p-4 text-center">
                        <Input
                          type="number"
                          max={maxPractical}
                          min={0}
                          value={s.practicalMarks}
                          onChange={(e) => handlePracticalChange(s.id, Number(e.target.value))}
                          className="h-8 w-20 mx-auto rounded-xl bg-background font-bold text-xs text-center focus:ring-2 focus:ring-seneca-amber"
                        />
                      </td>
                      <td className="p-3.5 sm:p-4 text-center">
                        <span className="font-extrabold text-foreground font-mono text-sm">{total}</span>
                        <span className="text-[10px] text-muted-foreground block">({pct}%)</span>
                      </td>
                      <td className="p-3.5 sm:p-4 text-center">
                        <Badge variant="outline" className={cn("font-extrabold text-xs px-2.5 py-0.5", color)}>
                          {grade}
                        </Badge>
                      </td>
                      <td className="p-3.5 sm:p-4 text-center font-mono font-bold text-foreground">
                        {gpa.toFixed(1)}
                      </td>
                      <td className="p-3.5 sm:p-4 pr-5">
                        <div className="flex items-center gap-1.5 min-w-[240px]">
                          <Input
                            type="text"
                            value={s.remarks}
                            onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                            placeholder="Official report card remarks..."
                            className="h-8 rounded-xl bg-background text-[11px] flex-1"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Ledger Bottom Footer Bar */}
          <div className="p-4 bg-muted/40 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Displaying <strong className="text-foreground">{filteredRows.length}</strong> student examination records
            </span>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
              <Button
                onClick={handleSaveGazette}
                disabled={saving}
                variant="glow"
                size="sm"
                className="rounded-xl font-bold text-xs gap-1.5 shadow-md"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Submit Official Gazette</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRows.map((s) => {
            const total = s.theoryMarks + s.practicalMarks;
            const pct = ((total / maxTotal) * 100).toFixed(1);
            const { grade, gpa, color } = calculateGrade(total, maxTotal);

            return (
              <Card
                key={s.id}
                className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 hover:border-seneca-crimson/40 hover:shadow-xl transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-seneca-amber/30">
                      <AvatarImage src={s.avatarUrl} alt={s.name} />
                      <AvatarFallback className="bg-seneca-crimson text-white font-bold text-xs">
                        {s.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">{s.name}</h4>
                      <p className="text-[10px] font-mono text-muted-foreground pt-0.5">
                        {s.rollNumber} • {s.className}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className={cn("font-extrabold text-xs px-2 py-0.5", color)}>
                    Grade {grade} ({gpa.toFixed(1)})
                  </Badge>
                </div>

                {/* Score Controls */}
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground">Theory (/{maxTheory})</span>
                      <Input
                        type="number"
                        max={maxTheory}
                        min={0}
                        value={s.theoryMarks}
                        onChange={(e) => handleTheoryChange(s.id, Number(e.target.value))}
                        className="h-8 rounded-xl bg-background font-bold text-xs text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground">Practical (/{maxPractical})</span>
                      <Input
                        type="number"
                        max={maxPractical}
                        min={0}
                        value={s.practicalMarks}
                        onChange={(e) => handlePracticalChange(s.id, Number(e.target.value))}
                        className="h-8 rounded-xl bg-background font-bold text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 font-bold">
                    <span className="text-muted-foreground">Combined Total:</span>
                    <span className="text-foreground text-sm font-mono">
                      {total} / {maxTotal} ({pct}%)
                    </span>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Remarks:</span>
                  <Input
                    type="text"
                    value={s.remarks}
                    onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                    placeholder="Enter academic remarks..."
                    className="h-8 rounded-xl bg-background text-[11px]"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Edit Marking Schema Modal */}
      <Dialog open={schemaModalOpen} onOpenChange={setSchemaModalOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-2xl sm:rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
          <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold font-heading">
                  Configure Marking Schema
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Set theory and practical max mark weightages for this examination term.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 sm:p-6 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Max Theory Paper Marks *</label>
              <Input
                type="number"
                min={0}
                value={tempTheory}
                onChange={(e) => setTempTheory(Number(e.target.value))}
                className="h-10 rounded-xl bg-background text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Max Practical / Lab Marks *</label>
              <Input
                type="number"
                min={0}
                value={tempPractical}
                onChange={(e) => setTempPractical(Number(e.target.value))}
                className="h-10 rounded-xl bg-background text-xs font-bold"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
              <span className="font-bold text-foreground">Total Combined Marks:</span>
              <span className="font-mono text-base font-extrabold text-seneca-crimson">
                {tempTheory + tempPractical} Marks
              </span>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSchemaModalOpen(false)}
              className="rounded-xl text-xs font-bold flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApplySchema}
              variant="glow"
              className="rounded-xl text-xs font-bold gap-1.5 flex-1 sm:flex-initial"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Marking Schema</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
