"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Layers,
  Search,
  Filter,
  Plus,
  Download,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  X,
  Briefcase,
  Building,
  Check,
  Award,
  ChevronRight,
  Fingerprint,
  FileText,
  Bookmark,
  Users,
  School,
  FolderKanban,
  DoorOpen,
  Tag,
  CheckSquare,
  Square,
  ArrowRight,
  HelpCircle,
  BookMarked,
  ShieldCheck,
  TrendingUp,
  Columns,
  Grid,
  SlidersHorizontal,
  TableProperties,
  Calendar,
  Copy,
  Atom,
  Calculator,
  Languages,
  Cpu,
  Globe,
  Palette,
  FlaskConical,
  Laptop,
  Upload,
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
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CsvImportModal from "@/components/dashboard/CsvImportModal";
import { SUBJECT_IMPORT_COLUMNS, SUBJECT_SAMPLE_DATA } from "@/lib/utils/csv-helper";
import { useCampusPortal } from "@/lib/hooks/useCampusPortal";
import { isJuniorGrade, isSeniorGrade } from "@/lib/constants/campus-wing";

interface AssignedClassDetail {
  id: string;
  name: string;
  section: string;
  gradeLevel: number;
  stream?: string;
  roomNumber?: string;
  fullName: string;
}

interface SubjectData {
  id: string;
  name: string;
  code: string;
  department: string;
  creditHours: number;
  description: string;
  offeringClasses: string[];
  classIds: string[];
  assignedClasses?: AssignedClassDetail[];
  assignedTeachers?: Array<{
    id: string;
    name: string;
    employeeId: string;
    specialization: string;
    phone?: string;
    email?: string;
  }>;
  createdAt: string;
}

interface DepartmentOption {
  id: string;
  name: string;
  code: string;
  wing?: string;
  colorCode?: string;
  classCount?: number;
  description?: string;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
  gradeLevel: number;
  stream?: string;
  roomNumber?: string;
  fullName: string;
  departmentName?: string;
}

const DEFAULT_DEPARTMENTS = [
  "Mathematics",
  "Sciences & Robotics",
  "Languages & Literature",
  "Computer Science & AI",
  "Islamic & Social Studies",
  "Cambridge Core",
  "General Curriculum",
  "Arts & Humanities",
  "Commerce & Business Studies",
];

const WING_OPTIONS = [
  { id: "all", name: "All Academic Wings" },
  { id: "Early Years", name: "Early Years (Playgroup - KG)" },
  { id: "Primary", name: "Primary Wing (Grades 1-5)" },
  { id: "Middle", name: "Middle Wing (Grades 6-8)" },
  { id: "Secondary", name: "Secondary / Matric (9-10)" },
  { id: "Higher Secondary", name: "Higher Secondary / College (11-12)" },
];

// Clean stream names so they don't bloat chips
const formatStreamBadge = (stream?: string): string => {
  if (!stream || stream === "General" || stream.includes("General Curriculum")) return "";
  if (stream.includes("Matric Computer Science")) return "Matric CS";
  if (stream.includes("Matric Science")) return "Matric Science";
  if (stream.includes("Matric Arts")) return "Matric Arts";
  if (stream.includes("FSc Pre-Medical")) return "Pre-Med";
  if (stream.includes("FSc Pre-Engineering")) return "Pre-Eng";
  if (stream.includes("ICS")) return "ICS";
  if (stream.includes("I.Com")) return "I.Com";
  if (stream.includes("FA")) return "FA";
  if (stream.includes("Cambridge O-Levels")) return "O-Levels";
  if (stream.includes("Cambridge A-Levels")) return "A-Levels";
  if (stream.includes("Cambridge Primary")) return "Cam Primary";
  if (stream.includes("Cambridge Lower Secondary")) return "Cam Lower Sec";
  if (stream.length > 16) return stream.slice(0, 15) + "…";
  return stream;
};

// Clean class name e.g. "Grade 9 (9th Class)-A" -> "Grade 9-A"
const formatClassShortName = (fullName: string): string => {
  if (!fullName) return "Class";
  return fullName.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
};

// Icon mapper based on course name / discipline
const getDisciplineIcon = (name: string, dept: string) => {
  const text = `${name} ${dept}`.toLowerCase();
  if (text.includes("math") || text.includes("algebra") || text.includes("calculus")) {
    return <Calculator className="h-5 w-5" />;
  }
  if (text.includes("physic") || text.includes("chem") || text.includes("bio") || text.includes("science")) {
    return <Atom className="h-5 w-5" />;
  }
  if (text.includes("computer") || text.includes("ai") || text.includes("tech") || text.includes("code") || text.includes("robot")) {
    return <Cpu className="h-5 w-5" />;
  }
  if (text.includes("english") || text.includes("urdu") || text.includes("language") || text.includes("literature") || text.includes("french")) {
    return <Languages className="h-5 w-5" />;
  }
  if (text.includes("islam") || text.includes("quran") || text.includes("social") || text.includes("history") || text.includes("geography") || text.includes("pakistan")) {
    return <Globe className="h-5 w-5" />;
  }
  if (text.includes("art") || text.includes("draw") || text.includes("music") || text.includes("craft")) {
    return <Palette className="h-5 w-5" />;
  }
  if (text.includes("commerce") || text.includes("account") || text.includes("econom") || text.includes("business")) {
    return <TrendingUp className="h-5 w-5" />;
  }
  return <BookOpen className="h-5 w-5" />;
};

export default function PrincipalSubjectsPage() {
  const { activeWing, setCampusWing, wingConfig } = useCampusPortal();
  const [activeTab, setActiveTab] = useState<"catalog" | "matrix" | "departments">("catalog");
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [departmentsList, setDepartmentsList] = useState<DepartmentOption[]>([]);
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedWingFilter, setSelectedWingFilter] = useState("all");
  const [selectedCreditFilter, setSelectedCreditFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal States (Supports both Create and Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [importCsvModalOpen, setImportCsvModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDepartment, setFormDepartment] = useState("Mathematics");
  const [formCreditHours, setFormCreditHours] = useState("4");
  const [formDescription, setFormDescription] = useState(
    "Comprehensive academic syllabus aligned with National Curriculum & Cambridge standards."
  );
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [classSearchFilter, setClassSearchFilter] = useState("");
  const [activeWingTabInModal, setActiveWingTabInModal] = useState("all");

  const generateUniqueSubjectCode = (nameHint = formName) => {
    const clean = (nameHint || "SUB").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "SUB";
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormCode(`${clean}-${randomNum}`);
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingSubjectId(null);
    const initialDept = departmentsList.length > 0 ? departmentsList[0].name : "Mathematics";
    setFormName("");
    setFormDepartment(initialDept);
    setFormCreditHours("4");
    setFormDescription("Comprehensive academic syllabus aligned with National Curriculum & Cambridge standards.");
    setSelectedClassIds([]);
    setClassSearchFilter("");
    setActiveWingTabInModal("all");
    generateUniqueSubjectCode();
    setModalOpen(true);
  };

  const handleOpenEditModal = (sub: SubjectData) => {
    setModalMode("edit");
    setEditingSubjectId(sub.id);
    setFormName(sub.name);
    setFormCode(sub.code);
    setFormDepartment(sub.department || (departmentsList.length > 0 ? departmentsList[0].name : "Mathematics"));
    setFormCreditHours(String(sub.creditHours || 3));
    setFormDescription(sub.description || "");
    setSelectedClassIds(sub.classIds || []);
    setClassSearchFilter("");
    setActiveWingTabInModal("all");
    setModalOpen(true);
  };

  // Fetch all curriculum subjects
  const fetchSubjects = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/subjects", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.subjects) {
        setSubjects(data.data.subjects);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      toast.error("Error loading curriculum subjects.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch departments from Academic Management
  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.departments) {
        setDepartmentsList(data.data.departments);
      }
    } catch (err) {
      console.error("Failed to fetch departments from Academic Management:", err);
    }
  };

  // Fetch all classes & sections
  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.classes) {
        setClassesList(
          data.data.classes.map((c: any) => ({
            id: c.id,
            name: c.name,
            section: c.section,
            gradeLevel: c.gradeLevel ?? 0,
            stream: c.stream || "General",
            roomNumber: c.roomNumber || "",
            fullName: c.fullName || `${c.name}-${c.section}`,
            departmentName: c.department?.name,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch classes for offering select:", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
    fetchClasses();
  }, []);

  // Compute merged unique department choices
  const departmentChoices = useMemo(() => {
    const list: Array<{ name: string; isFromAcademic: boolean; code?: string; wing?: string; colorCode?: string }> = [];

    // 1. Added from Academic Management
    departmentsList.forEach((dept) => {
      if (!list.some((item) => item.name.toLowerCase() === dept.name.toLowerCase())) {
        list.push({
          name: dept.name,
          isFromAcademic: true,
          code: dept.code,
          wing: dept.wing,
          colorCode: dept.colorCode,
        });
      }
    });

    // 2. Include existing subjects' departments if not already added
    subjects.forEach((sub) => {
      if (sub.department && !list.some((item) => item.name.toLowerCase() === sub.department.toLowerCase())) {
        list.push({
          name: sub.department,
          isFromAcademic: false,
        });
      }
    });

    // 3. Fallback standard curriculum defaults
    DEFAULT_DEPARTMENTS.forEach((def) => {
      if (!list.some((item) => item.name.toLowerCase() === def.toLowerCase())) {
        list.push({
          name: def,
          isFromAcademic: false,
        });
      }
    });

    return list;
  }, [departmentsList, subjects]);

  // Helper to identify class wing/tier
  const getClassWing = (gradeLevel: number): string => {
    if (gradeLevel === 0) return "Early Years";
    if (gradeLevel >= 1 && gradeLevel <= 5) return "Primary";
    if (gradeLevel >= 6 && gradeLevel <= 8) return "Middle";
    if (gradeLevel >= 9 && gradeLevel <= 10) return "Secondary";
    if (gradeLevel >= 11) return "Higher Secondary";
    return "General";
  };

  // Filter subjects for display
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      // Campus portal wing filter
      if (activeWing === "junior") {
        const hasJuniorClass =
          (sub.assignedClasses || []).some((c) => isJuniorGrade(c.gradeLevel)) ||
          (sub.offeringClasses || []).some((c) => /playgroup|nursery|kg|prep|grade 1|grade 2/i.test(c));
        const hasSeniorClass =
          (sub.assignedClasses || []).some((c) => isSeniorGrade(c.gradeLevel)) ||
          (sub.offeringClasses || []).some((c) => /grade [3-9]|grade 1[0-2]|matric|fsc|ics|o-level|a-level|1st year|2nd year/i.test(c));
        if (!hasJuniorClass && hasSeniorClass) return false;
      }
      if (activeWing === "senior") {
        const hasJuniorClass =
          (sub.assignedClasses || []).some((c) => isJuniorGrade(c.gradeLevel)) ||
          (sub.offeringClasses || []).some((c) => /playgroup|nursery|kg|prep|grade 1|grade 2/i.test(c));
        const hasSeniorClass =
          (sub.assignedClasses || []).some((c) => isSeniorGrade(c.gradeLevel)) ||
          (sub.offeringClasses || []).some((c) => /grade [3-9]|grade 1[0-2]|matric|fsc|ics|o-level|a-level|1st year|2nd year/i.test(c));
        if (hasJuniorClass && !hasSeniorClass) return false;
      }

      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.offeringClasses || []).some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.assignedClasses || []).some((c) => c.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.assignedTeachers || []).some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        selectedDept === "all" || sub.department.toLowerCase() === selectedDept.toLowerCase();

      let matchesWing = true;
      if (selectedWingFilter !== "all") {
        matchesWing = (sub.assignedClasses || []).some(
          (c) => getClassWing(c.gradeLevel) === selectedWingFilter
        );
      }

      let matchesCredit = true;
      if (selectedCreditFilter === "1-2") matchesCredit = sub.creditHours <= 2;
      else if (selectedCreditFilter === "3-4") matchesCredit = sub.creditHours >= 3 && sub.creditHours <= 4;
      else if (selectedCreditFilter === "5+") matchesCredit = sub.creditHours >= 5;

      return matchesSearch && matchesDept && matchesWing && matchesCredit;
    });
  }, [subjects, searchQuery, selectedDept, selectedWingFilter, selectedCreditFilter, activeWing]);

  // Summary Metrics
  const totalSubjects = subjects.length;
  const totalCreditHours = subjects.reduce((acc, curr) => acc + (curr.creditHours || 3), 0);
  const activeDepartmentsCount = new Set(subjects.map((s) => s.department)).size;
  const totalClassAssignmentsCount = subjects.reduce((acc, curr) => acc + (curr.classIds?.length || 0), 0);

  const toggleClassOffering = (cId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      return toast.error("Please enter a subject name.");
    }
    if (!formCode.trim()) {
      return toast.error("Please provide or regenerate a course code identifier.");
    }

    setSubmitting(true);
    const isEdit = modalMode === "edit" && editingSubjectId;

    try {
      const url = isEdit ? `/api/subjects/${editingSubjectId}` : "/api/subjects";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          department: formDepartment.trim(),
          creditHours: Number(formCreditHours) || 3,
          description: formDescription.trim(),
          classIds: selectedClassIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || `Failed to ${isEdit ? "update" : "create"} subject.`);
      }

      toast.success(isEdit ? "Subject Updated!" : "Subject Added to Curriculum!", {
        description: `${formName} (${formCode.toUpperCase()}) successfully saved.`,
      });

      setModalOpen(false);
      await fetchSubjects(true);

      // Refresh currently open details modal if applicable
      if (selectedSubject && isEdit && selectedSubject.id === editingSubjectId) {
        const updatedDetailsRes = await fetch(`/api/subjects/${editingSubjectId}`);
        const updatedDetails = await updatedDetailsRes.json();
        if (updatedDetails.success && updatedDetails.data?.subject) {
          setSelectedSubject(updatedDetails.data.subject);
        }
      }
    } catch (err: any) {
      toast.error(isEdit ? "Update Failed" : "Creation Failed", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = (sub: SubjectData) => {
    setSubjectToDelete(sub);
  };

  const handleConfirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    const sub = subjectToDelete;

    // Optimistic UI update
    setSubjects((prev) => prev.filter((item) => item.id !== sub.id));
    if (selectedSubject?.id === sub.id) {
      setSelectedSubject(null);
    }

    try {
      const res = await fetch(`/api/subjects/${sub.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message);

      toast.success("Subject Removed", {
        description: `${sub.name} was removed from the active syllabus.`,
      });
      fetchSubjects(true);
    } catch (err: any) {
      toast.error("Action Failed", { description: err.message });
      fetchSubjects(true);
    }
  };

  const handleExportCSV = () => {
    if (subjects.length === 0) return toast.info("No subjects to export.");
    const headers = "Subject Code,Subject Name,Department,Weekly Credit Hours,Enrolled Classes Count,Assigned Classes Details,Assigned Specialist Teachers\n";
    const rows = subjects
      .map((s) => {
        const classesDetailed = (s.assignedClasses || [])
          .map((c) => `${c.fullName}${c.stream && c.stream !== "General" ? ` (${c.stream})` : ""}`)
          .join(" | ") || (s.offeringClasses || []).join(" | ");
        const teachers = (s.assignedTeachers || []).map((t) => t.name).join(" | ");
        return `"${s.code}","${s.name}","${s.department}","${s.creditHours}","${s.classIds?.length || 0}","${classesDetailed}","${teachers}"`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Seneca_Curriculum_Syllabus_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Curriculum syllabus roster exported to CSV!");
  };

  // Filtered classes in modal
  const filteredModalClasses = useMemo(() => {
    let list = classesList;
    if (activeWingTabInModal !== "all") {
      list = list.filter((c) => getClassWing(c.gradeLevel) === activeWingTabInModal);
    }
    if (classSearchFilter.trim()) {
      const query = classSearchFilter.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(query) ||
          c.name.toLowerCase().includes(query) ||
          c.section.toLowerCase().includes(query) ||
          (c.stream && c.stream.toLowerCase().includes(query))
      );
    }
    return list;
  }, [classesList, classSearchFilter, activeWingTabInModal]);

  return (
    <div className="space-y-5 sm:space-y-7 animate-in fade-in-50 duration-300 w-full overflow-x-hidden pb-12">
      {/* 1. Header & Hero Metric Banner */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 p-4 sm:p-8 text-white shadow-2xl transition-all duration-300",
          activeWing === "junior"
            ? "seneca-junior-hero-gradient"
            : activeWing === "senior"
            ? "seneca-senior-hero-gradient"
            : "seneca-hero-gradient"
        )}
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <BookOpen className="h-3 w-3" />
                <span>{wingConfig.name}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session 2026–27 Active Syllabus</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Academic Subjects & <span className="text-seneca-amber">Curriculum Syllabus</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              {activeWing === "junior"
                ? "Manage foundational Early Years and Lower Primary subjects (Phonics, English, Basic Numeracy, Early Arts & General Knowledge), credit periods, and teacher assignments."
                : activeWing === "senior"
                ? "Oversee Middle, Secondary (Matric/Cambridge), and College intermediate academic syllabi, STEM labs, Cambridge O/A Levels, and specialist faculty allocations."
                : "Manage course catalog across all educational tiers, allocate weekly credit hours, link syllabus to class sections, and coordinate specialist faculty."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Link href="/dashboard/classes">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 h-10 bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm"
                title="Jump to Class & Section Academic Management"
              >
                <FolderKanban className="h-4 w-4 text-seneca-amber-light" />
                <span className="hidden sm:inline">Classes & Depts</span>
              </Button>
            </Link>

            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 h-10 bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Syllabus</span>
            </Button>

            <Button
              onClick={() => setImportCsvModalOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 h-10 bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm"
            >
              <Upload className="h-4 w-4 text-seneca-amber" />
              <span className="hidden sm:inline">Import CSV</span>
            </Button>

            <Button
              onClick={handleOpenCreateModal}
              variant="glow"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 h-10 shadow-lg shadow-seneca-amber/20"
            >
              <Plus className="h-4 w-4 text-seneca-amber-light" />
              <span>Add New Subject</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xs rounded-2xl p-4 sm:p-5 space-y-2 hover:border-seneca-crimson/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Subjects
            </span>
            <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground font-heading">
            {totalSubjects} <span className="text-xs font-semibold text-muted-foreground">Courses</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>Active in Seneca curriculum</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xs rounded-2xl p-4 sm:p-5 space-y-2 hover:border-seneca-amber/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Weekly Teaching Load
            </span>
            <div className="p-2 rounded-xl bg-seneca-amber/10 text-seneca-amber">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground font-heading">
            {totalCreditHours} <span className="text-xs font-semibold text-muted-foreground">Periods / Wk</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-seneca-amber" />
            <span>Credit hours allocated</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xs rounded-2xl p-4 sm:p-5 space-y-2 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Active Disciplines
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
            {activeDepartmentsCount} <span className="text-xs font-semibold text-muted-foreground">Depts</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {departmentsList.length > 0 ? `${departmentsList.length} defined in Academic Desk` : "Curriculum wings"}
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xs rounded-2xl p-4 sm:p-5 space-y-2 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Class Allocations
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-600 dark:text-purple-400 font-heading">
            {totalClassAssignmentsCount} <span className="text-xs font-semibold text-muted-foreground">Enrolled</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            Across {classesList.length} active class sections
          </div>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-border/80 overflow-x-auto pb-1">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("catalog")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0",
              activeTab === "catalog"
                ? "bg-seneca-crimson text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Course Catalog & Syllabus</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] font-bold px-1.5 py-0 rounded-full",
                activeTab === "catalog" ? "bg-white/20 text-white" : "bg-muted text-foreground"
              )}
            >
              {subjects.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("matrix")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0",
              activeTab === "matrix"
                ? "bg-seneca-crimson text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <TableProperties className="h-3.5 w-3.5" />
            <span>Class Curriculum Matrix</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] font-bold px-1.5 py-0 rounded-full",
                activeTab === "matrix" ? "bg-white/20 text-white" : "bg-muted text-foreground"
              )}
            >
              {classesList.length} Classes
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0",
              activeTab === "departments"
                ? "bg-seneca-crimson text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Departmental Wings</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] font-bold px-1.5 py-0 rounded-full",
                activeTab === "departments" ? "bg-white/20 text-white" : "bg-muted text-foreground"
              )}
            >
              {activeDepartmentsCount}
            </Badge>
          </button>
        </div>
      </div>

      {/* 4. Tab 1: Course Catalog & Syllabus */}
      {activeTab === "catalog" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Campus Wing Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-muted/70 border border-border/80 w-fit">
            <button
              type="button"
              onClick={() => setCampusWing("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeWing === "all"
                  ? "bg-card text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Syllabi ({subjects.length})
            </button>
            <button
              type="button"
              onClick={() => setCampusWing("junior")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                activeWing === "junior"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-500/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              Junior Wing (&le; Gr 2)
            </button>
            <button
              type="button"
              onClick={() => setCampusWing("senior")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                activeWing === "senior"
                  ? "bg-seneca-crimson/15 text-seneca-crimson dark:text-seneca-amber-light shadow-sm border border-seneca-crimson/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GraduationCap className="h-3 w-3 text-seneca-crimson" />
              Senior Wing (&gt; Gr 2)
            </button>
          </div>

          {/* Responsive Search & Filter Toolbar */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xs rounded-2xl p-3 sm:p-4">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search subject title, code, department, class, teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-10 rounded-xl bg-background text-xs font-medium w-full"
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

              {/* Filters & Actions */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                {/* Dynamic Department Dropdown */}
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-seneca-crimson col-span-1 sm:w-auto"
                >
                  <option value="all">All Departments ({subjects.length})</option>
                  {departmentChoices.map((d) => {
                    const count = subjects.filter((s) => s.department.toLowerCase() === d.name.toLowerCase()).length;
                    return (
                      <option key={d.name} value={d.name}>
                        {d.name} {count > 0 ? `(${count})` : ""}
                      </option>
                    );
                  })}
                </select>

                {/* Academic Wing Filter */}
                <select
                  value={selectedWingFilter}
                  onChange={(e) => setSelectedWingFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-seneca-crimson col-span-1 sm:w-auto"
                >
                  {WING_OPTIONS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>

                {/* Credit Hours Filter */}
                <select
                  value={selectedCreditFilter}
                  onChange={(e) => setSelectedCreditFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-seneca-crimson col-span-1 sm:w-auto"
                >
                  <option value="all">All Credit Workloads</option>
                  <option value="1-2">1 - 2 Credits (Electives / Labs)</option>
                  <option value="3-4">3 - 4 Credits (Core Standard)</option>
                  <option value="5+">5+ Credits (Major Sciences)</option>
                </select>

                <div className="flex items-center gap-2 col-span-1 sm:col-auto justify-end">
                  <Button
                    onClick={() => {
                      fetchSubjects();
                      fetchDepartments();
                      fetchClasses();
                    }}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl shrink-0"
                    title="Refresh All Academic Data"
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>

                  <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border shrink-0">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        viewMode === "grid" ? "bg-card shadow-xs text-foreground font-bold" : "text-muted-foreground"
                      )}
                      title="Grid View"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        viewMode === "table" ? "bg-card shadow-xs text-foreground font-bold" : "text-muted-foreground"
                      )}
                      title="Table View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Roster Display */}
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-card/50 rounded-3xl border border-border">
              <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
              <p className="text-xs font-bold text-muted-foreground">Loading Seneca Curriculum Syllabus...</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-14 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">No Subjects Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No course syllabi match your current query or filters. You can add new subjects to the academic curriculum.
                </p>
              </div>
              <Button onClick={handleOpenCreateModal} variant="glow" size="sm" className="rounded-xl text-xs font-bold">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add First Subject
              </Button>
            </Card>
          ) : viewMode === "grid" ? (
            /* ========================================================================= */
            /* ULTRA-PREMIUM GRID VIEW WITH EXECUTIVE CARDS                              */
            /* ========================================================================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredSubjects.map((sub) => {
                const assignedCount = sub.assignedClasses?.length || sub.offeringClasses?.length || sub.classIds?.length || 0;
                const assignedList: AssignedClassDetail[] = sub.assignedClasses && sub.assignedClasses.length > 0
                  ? sub.assignedClasses
                  : (sub.offeringClasses || []).map((name, i) => ({
                      id: String(i),
                      name,
                      section: "",
                      gradeLevel: 0,
                      stream: "",
                      roomNumber: "",
                      fullName: name,
                    }));

                return (
                  <Card
                    key={sub.id}
                    className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xs rounded-2xl overflow-hidden hover:border-seneca-crimson/50 hover:shadow-xl transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-3.5">
                      {/* Top Row: Discipline Avatar + Title + Code + Dept Badge */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 ring-2 ring-seneca-crimson/15">
                            {getDisciplineIcon(sub.name, sub.department)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-extrabold text-base text-foreground group-hover:text-seneca-crimson transition-colors truncate leading-tight">
                                {sub.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-[10px] font-mono font-bold px-1.5 py-0 bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30 shadow-2xs shrink-0"
                              >
                                {sub.code}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="font-medium truncate max-w-[150px]">{sub.department}</span>
                              {assignedList.some((c) => isJuniorGrade(c.gradeLevel)) &&
                              !assignedList.some((c) => isSeniorGrade(c.gradeLevel)) ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                  Junior (&le; Gr 2)
                                </span>
                              ) : !assignedList.some((c) => isJuniorGrade(c.gradeLevel)) &&
                                assignedList.some((c) => isSeniorGrade(c.gradeLevel)) ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber-light border border-seneca-crimson/30">
                                  Senior (&gt; Gr 2)
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">
                                  Universal / Both Wings
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {sub.description || "Core academic curriculum subject designed for character & academic excellence."}
                      </p>

                      {/* Key Dual Metrics */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-seneca-amber/15 text-seneca-amber shrink-0">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9.5px] text-muted-foreground uppercase font-bold tracking-wider leading-none">
                              Workload
                            </div>
                            <div className="text-xs font-black text-foreground truncate mt-0.5">
                              {sub.creditHours} Credits / Wk
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
                            <GraduationCap className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9.5px] text-muted-foreground uppercase font-bold tracking-wider leading-none">
                              Sections
                            </div>
                            <div className="text-xs font-black text-foreground truncate mt-0.5">
                              {assignedCount > 0 ? `${assignedCount} Enrolled` : "None Linked"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Specialist Faculty */}
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3 text-seneca-crimson" />
                          <span>Specialist Faculty</span>
                        </span>
                        {sub.assignedTeachers && sub.assignedTeachers.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {sub.assignedTeachers.map((t) => (
                              <div
                                key={t.id}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground bg-background px-2 py-0.5 rounded-lg border border-border shadow-2xs"
                              >
                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[9px] font-black shrink-0">
                                  {t.name.slice(0, 1)}
                                </div>
                                <span className="truncate max-w-[130px]">{t.name}</span>
                                {t.specialization && (
                                  <span className="text-[9px] font-normal text-muted-foreground truncate max-w-[80px]">
                                    ({t.specialization})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground italic flex items-center gap-1 pt-0.5">
                            <span>Faculty Pending Allocation</span>
                          </div>
                        )}
                      </div>

                      {/* Enrolled Classes & Sections (Clean Formatted Chips) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                            <GraduationCap className="h-3 w-3 text-seneca-amber" />
                            <span>Assigned Classes ({assignedCount})</span>
                          </span>
                          {assignedCount > 0 && (
                            <span className="text-[10px] text-seneca-crimson font-bold">Active Syllabus</span>
                          )}
                        </div>

                        {assignedCount > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-0.5">
                            {assignedList.slice(0, 4).map((cls, idx) => {
                              const shortName = formatClassShortName(cls.fullName);
                              const streamBadge = formatStreamBadge(cls.stream);
                              return (
                                <span
                                  key={cls.id || idx}
                                  className="inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-background border border-border/80 text-foreground shadow-2xs hover:border-seneca-amber/50 transition-colors"
                                  title={`Full Title: ${cls.fullName}${cls.stream ? ` • ${cls.stream}` : ""}${cls.roomNumber ? ` • Room: ${cls.roomNumber}` : ""}`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-seneca-amber shrink-0" />
                                  <span>{shortName}</span>
                                  {streamBadge && (
                                    <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                                      {streamBadge}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                            {assignedCount > 4 && (
                              <button
                                onClick={() => setSelectedSubject(sub)}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-muted text-seneca-crimson hover:bg-muted/80 transition-colors"
                              >
                                +{assignedCount - 4} more
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px]">
                            <span className="text-amber-700 dark:text-amber-300 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>No classes linked yet</span>
                            </span>
                            <button
                              onClick={() => handleOpenEditModal(sub)}
                              className="text-seneca-crimson font-bold underline hover:text-seneca-crimson/80"
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-border/60">
                      <Button
                        onClick={() => setSelectedSubject(sub)}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-xs font-bold gap-1.5 h-9 hover:bg-muted shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Details</span>
                      </Button>

                      <Button
                        onClick={() => handleOpenEditModal(sub)}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-xs font-bold gap-1.5 h-9 border-seneca-amber/40 text-seneca-amber hover:bg-seneca-amber/10 shadow-2xs"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>

                      <Link href={`/dashboard/timetable?subjectId=${sub.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-seneca-crimson hover:bg-seneca-crimson/10 shrink-0"
                          title="View Teaching Timetable"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        onClick={() => handleDeleteSubject(sub)}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-500/10 shrink-0"
                        title="Delete Subject"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* ========================================================================= */
            /* TABLE VIEW                                                                */
            /* ========================================================================= */
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 px-4">Subject Code</th>
                      <th className="py-3.5 px-4">Subject Title & Scope</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Assigned Classes</th>
                      <th className="py-3.5 px-4">Specialist Faculty</th>
                      <th className="py-3.5 px-4">Credits</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredSubjects.map((sub) => {
                      const assignedCount = sub.assignedClasses?.length || sub.offeringClasses?.length || sub.classIds?.length || 0;
                      return (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className="font-bold text-[10px] font-mono bg-seneca-crimson/5 text-seneca-crimson border-seneca-crimson/20"
                            >
                              {sub.code}
                            </Badge>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-foreground text-xs sm:text-sm">{sub.name}</div>
                            <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs">
                              {sub.description}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <Badge variant="outline" className="font-bold text-[10px] bg-muted/50">
                              {sub.department}
                            </Badge>
                          </td>

                          <td className="py-3 px-4">
                            {assignedCount > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-seneca-crimson/10 text-seneca-crimson">
                                  {assignedCount} {assignedCount === 1 ? "Class" : "Classes"}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                  {sub.assignedClasses?.map((c) => formatClassShortName(c.fullName)).join(", ") || sub.offeringClasses?.join(", ")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 italic">None linked</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {sub.assignedTeachers && sub.assignedTeachers.length > 0 ? (
                              <div className="font-bold text-foreground text-xs">
                                {sub.assignedTeachers.map((t) => t.name).join(", ")}
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">Faculty Pending</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{sub.creditHours} / Wk</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                onClick={() => setSelectedSubject(sub)}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 rounded-lg text-xs font-bold"
                                title="View Syllabus & Class Details"
                              >
                                <Eye className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <Button
                                onClick={() => handleOpenEditModal(sub)}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 rounded-lg text-xs font-bold text-seneca-amber hover:bg-seneca-amber/10"
                                title="Edit Subject"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteSubject(sub)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10"
                                title="Delete Subject"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 5. Tab 2: Class Curriculum Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Class Curriculum & Syllabus Allocation Matrix</h3>
                <p className="text-xs text-muted-foreground">
                  Master breakdown of active subjects and weekly teaching load assigned to each grade section.
                </p>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                Showing {classesList.length} Class Sections
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {classesList.map((cls) => {
                const classSubjects = subjects.filter((s) => s.classIds?.includes(cls.id));
                const totalCredits = classSubjects.reduce((acc, curr) => acc + (curr.creditHours || 3), 0);

                return (
                  <div
                    key={cls.id}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-seneca-crimson/40 transition-all space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                          <span>{cls.fullName}</span>
                          {cls.stream && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                              {formatStreamBadge(cls.stream) || cls.stream}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {getClassWing(cls.gradeLevel)} Wing {cls.roomNumber ? `• ${cls.roomNumber}` : ""}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold bg-seneca-amber/10 text-seneca-amber border-seneca-amber/30">
                        {totalCredits} Credits/Wk
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Assigned Course Syllabus ({classSubjects.length})
                      </span>
                      {classSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {classSubjects.map((s) => (
                            <span
                              key={s.id}
                              onClick={() => setSelectedSubject(s)}
                              className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-muted/60 hover:bg-seneca-crimson/10 hover:text-seneca-crimson text-foreground border border-border cursor-pointer transition-colors"
                              title={`${s.name} (${s.code}) - ${s.creditHours} Credits`}
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                          No subjects assigned to this class section yet.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* 6. Tab 3: Departmental Wings */}
      {activeTab === "departments" && (
        <div className="space-y-4">
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Academic Disciplines & Departmental Distribution</h3>
                <p className="text-xs text-muted-foreground">
                  Curriculum courses categorized by active academic wings and departments.
                </p>
              </div>
              <Link href="/dashboard/classes">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1">
                  <FolderKanban className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Configure Depts</span>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {departmentChoices.map((dept) => {
                const deptSubjects = subjects.filter((s) => s.department.toLowerCase() === dept.name.toLowerCase());
                const deptCredits = deptSubjects.reduce((acc, curr) => acc + (curr.creditHours || 3), 0);

                return (
                  <div
                    key={dept.name}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-seneca-crimson/40 transition-all space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-foreground">{dept.name}</h4>
                        <div className="text-[10px] text-muted-foreground">
                          {dept.isFromAcademic ? "🏢 Live Academic Dept" : "📚 Standard Discipline"}
                          {dept.wing ? ` • ${dept.wing}` : ""}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold bg-muted/60">
                        {deptSubjects.length} Courses
                      </Badge>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/30 text-xs flex items-center justify-between border border-border/50">
                      <span className="text-[10px] text-muted-foreground font-semibold">Total Teaching Hours:</span>
                      <span className="font-bold text-foreground text-xs">{deptCredits} Credits / Wk</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Course Offerings:
                      </span>
                      {deptSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {deptSubjects.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedSubject(s)}
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-background border border-border hover:border-seneca-crimson/50 text-foreground transition-colors"
                            >
                              {s.name} ({s.code})
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic">No courses in this department.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* 7. Add / Edit Subject Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-7 my-6 shadow-2xl border border-border/80">
          <DialogHeader className="space-y-1 pb-3 border-b border-border/60">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-amber uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              <span>{modalMode === "edit" ? "Curriculum Editor" : "Curriculum Creation"}</span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-extrabold font-heading text-foreground">
              {modalMode === "edit" ? `Edit Subject: ${formName || "Course"}` : "Add New Subject Course"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {modalMode === "edit"
                ? "Update course syllabus metadata, department alignment, credit allocation, and assigned classes."
                : "Define course title, course code identifier, assign academic department & enrolled class sections."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            {/* Auto Code */}
            <div className="p-3.5 rounded-2xl bg-seneca-amber/10 border border-seneca-amber/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-seneca-amber uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5" />
                  <span>Course Code Identifier</span>
                </span>
                <Button
                  type="button"
                  onClick={() => generateUniqueSubjectCode()}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] font-bold text-seneca-amber hover:bg-seneca-amber/15 gap-1 rounded-lg"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerate</span>
                </Button>
              </div>
              <Input
                required
                type="text"
                placeholder="e.g. PHY-402, MTH-101"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                className="h-10 rounded-xl bg-background font-mono font-bold text-xs uppercase"
              />
            </div>

            {/* Subject Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Subject / Course Name <span className="text-seneca-crimson">*</span>
              </label>
              <Input
                required
                type="text"
                placeholder="e.g. Higher Physics & Thermodynamics"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (modalMode === "create" && (!formCode || formCode.startsWith("SUB-"))) {
                    generateUniqueSubjectCode(e.target.value);
                  }
                }}
                className="h-11 rounded-xl text-xs font-bold"
              />
            </div>

            {/* Department Dropdown (Populated with Academic Management Departments) & Credits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <span>Department / Discipline</span>
                    <span className="text-seneca-crimson">*</span>
                  </label>
                  {departmentsList.length > 0 && (
                    <span className="text-[10px] text-seneca-crimson font-semibold">
                      Live Depts Active
                    </span>
                  )}
                </div>
                <select
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-seneca-crimson"
                >
                  {/* Group 1: Configured Departments from Class & Section Academic Management */}
                  {departmentsList.length > 0 && (
                    <optgroup label="🏢 Academic Management Departments">
                      {departmentsList.map((d) => (
                        <option key={`acad-${d.id}`} value={d.name}>
                          {d.name} {d.code ? `(${d.code})` : ""} {d.wing && d.wing !== "All Wings" ? `• ${d.wing}` : ""}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {/* Group 2: Standard & Legacy Curriculum Disciplines */}
                  <optgroup label="📚 Standard Curriculum Disciplines">
                    {departmentChoices
                      .filter((d) => !d.isFromAcademic)
                      .map((d) => (
                        <option key={`std-${d.name}`} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
                <p className="text-[10px] text-muted-foreground">
                  Includes departments added from{" "}
                  <Link href="/dashboard/classes" className="text-seneca-crimson underline font-medium">
                    Class & Section Academic Management
                  </Link>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Weekly Credit Hours <span className="text-seneca-crimson">*</span>
                </label>
                <Input
                  required
                  type="number"
                  min={1}
                  max={25}
                  value={formCreditHours}
                  onChange={(e) => setFormCreditHours(e.target.value)}
                  className="h-11 rounded-xl text-xs font-bold"
                />
                <p className="text-[10px] text-muted-foreground">
                  Total weekly lecture / lab periods required on the timetable.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Course Description & Syllabus Scope</label>
              <Input
                type="text"
                placeholder="Comprehensive academic syllabus aligned with National Curriculum standards..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            {/* Offering Classes & Sections Multi-Select */}
            <div className="space-y-2.5 pt-2 border-t border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-seneca-crimson" />
                    <span>Assign to Classes & Sections</span>
                    <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0 bg-seneca-crimson/10 text-seneca-crimson">
                      {selectedClassIds.length} of {classesList.length} Selected
                    </Badge>
                  </label>
                  <p className="text-[10px] text-muted-foreground">
                    Select which classes study this subject. Students in these sections will automatically enroll.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClassIds(classesList.map((c) => c.id))}
                    className="text-[11px] font-bold text-seneca-crimson hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground text-xs">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedClassIds([])}
                    className="text-[11px] font-bold text-muted-foreground hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Wing Quick Selection Tabs */}
              <div className="flex flex-wrap gap-1">
                {["all", "Early Years", "Primary", "Middle", "Secondary", "Higher Secondary"].map((wing) => (
                  <button
                    key={wing}
                    type="button"
                    onClick={() => setActiveWingTabInModal(wing)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border",
                      activeWingTabInModal === wing
                        ? "bg-foreground text-background border-foreground"
                        : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    {wing === "all" ? "All Wings" : wing}
                  </button>
                ))}
              </div>

              {/* Class Filter Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter classes by name, section, stream..."
                  value={classSearchFilter}
                  onChange={(e) => setClassSearchFilter(e.target.value)}
                  className="h-8 pl-8 text-[11px] rounded-lg bg-background"
                />
              </div>

              {/* Classes Chip Grid */}
              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-2.5 rounded-xl bg-background border border-border">
                {classesList.length === 0 ? (
                  <div className="w-full p-4 text-center text-xs text-muted-foreground">
                    No classes available. Add classes in Academic Management first.
                  </div>
                ) : filteredModalClasses.length === 0 ? (
                  <div className="w-full p-3 text-center text-xs text-muted-foreground">
                    No classes match the filter.
                  </div>
                ) : (
                  filteredModalClasses.map((cls) => {
                    const isSelected = selectedClassIds.includes(cls.id);
                    const streamBadge = formatStreamBadge(cls.stream);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClassOffering(cls.id)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5",
                          isSelected
                            ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs scale-102"
                            : "bg-muted/40 text-foreground border-border hover:bg-muted hover:border-border/80"
                        )}
                      >
                        <span>{formatClassShortName(cls.fullName)}</span>
                        {streamBadge && (
                          <span className={cn("text-[9px] font-normal", isSelected ? "text-white/80" : "text-muted-foreground")}>
                            ({streamBadge})
                          </span>
                        )}
                        {isSelected ? <Check className="h-3.5 w-3.5 shrink-0" /> : <Plus className="h-3 w-3 text-muted-foreground/60 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/60 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Course...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-seneca-amber-light" />
                    <span>{modalMode === "edit" ? "Save Subject Changes" : "Add Subject to Syllabus"}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. Enhanced Subject Details Modal */}
      {selectedSubject && (
        <Dialog open={!!selectedSubject} onOpenChange={() => setSelectedSubject(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 my-6 shadow-2xl border border-border/80">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-xs font-mono shadow-md shrink-0">
                    {getDisciplineIcon(selectedSubject.name, selectedSubject.department)}
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                      {selectedSubject.name}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] font-bold bg-muted/60">
                        {selectedSubject.department}
                      </Badge>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {selectedSubject.creditHours} Weekly Credits
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const sub = selectedSubject;
                    setSelectedSubject(null);
                    handleOpenEditModal(sub);
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 border-seneca-amber/40 text-seneca-amber hover:bg-seneca-amber/10 shrink-0"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Subject</span>
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              {/* Syllabus Description */}
              <div className="p-3.5 rounded-2xl bg-muted/35 border border-border/60 space-y-2">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">
                  Course Description & Scope
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {selectedSubject.description || "Core academic subject designed for curriculum excellence."}
                </p>
              </div>

              {/* Enrolled Classes Breakdown (In Detail) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-seneca-crimson" />
                    <span>
                      Enrolled Classes & Sections (
                      {selectedSubject.assignedClasses?.length || selectedSubject.offeringClasses?.length || 0}
                      )
                    </span>
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-bold bg-seneca-crimson/10 text-seneca-crimson">
                    {selectedSubject.assignedClasses?.length || selectedSubject.offeringClasses?.length || 0} Sections
                  </Badge>
                </div>

                {selectedSubject.assignedClasses && selectedSubject.assignedClasses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {selectedSubject.assignedClasses.map((cls) => {
                      const streamBadge = formatStreamBadge(cls.stream);
                      return (
                        <div
                          key={cls.id}
                          className="p-3 rounded-xl bg-card border border-border/80 flex items-center justify-between shadow-2xs hover:border-seneca-amber/40 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                              <span>{formatClassShortName(cls.fullName || `${cls.name}-${cls.section}`)}</span>
                              {streamBadge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold">
                                  {streamBadge}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <span>Grade Level: {cls.gradeLevel}</span>
                              {cls.roomNumber && <span>• Room: {cls.roomNumber}</span>}
                            </div>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active Enrollment" />
                        </div>
                      );
                    })}
                  </div>
                ) : selectedSubject.offeringClasses && selectedSubject.offeringClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-card border border-border">
                    {selectedSubject.offeringClasses.map((clsName, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-muted/60 text-foreground border border-border"
                      >
                        {formatClassShortName(clsName)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      No Classes Assigned to this Subject
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Click "Edit Subject & Allocations" to assign this course to active grade sections.
                    </p>
                  </div>
                )}
              </div>

              {/* Specialist Faculty */}
              <div className="space-y-2 border-t border-border/60 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-seneca-amber" />
                  <span>Assigned Specialist Faculty</span>
                </span>
                {selectedSubject.assignedTeachers && selectedSubject.assignedTeachers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSubject.assignedTeachers.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-card border border-border flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <div className="font-bold text-foreground text-xs">{t.name}</div>
                          <div className="text-[10px] text-muted-foreground">{t.specialization}</div>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-seneca-crimson bg-seneca-crimson/10 px-1.5 py-0.5 rounded">
                          {t.employeeId}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic p-3 rounded-xl bg-muted/20 text-center border border-border/40">
                    No specialist faculty currently allocated to this subject. Assign teachers via Faculty Management or Timetable Desk.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 flex flex-row items-center justify-between gap-2">
              <Button
                onClick={() => {
                  const sub = selectedSubject;
                  setSelectedSubject(null);
                  handleOpenEditModal(sub);
                }}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5 h-9"
              >
                <Edit className="h-3.5 w-3.5 text-seneca-amber-light" />
                <span>Edit Subject & Allocations</span>
              </Button>
              <Button
                onClick={() => setSelectedSubject(null)}
                variant="outline"
                className="rounded-xl text-xs font-bold h-9"
              >
                Close Syllabus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Subject Confirmation Dialog */}
      <ConfirmDialog
        open={!!subjectToDelete}
        onOpenChange={(open) => !open && setSubjectToDelete(null)}
        title="Remove Curriculum Subject?"
        description={`Are you sure you want to permanently remove '${subjectToDelete?.name}' (${subjectToDelete?.code}) from the curriculum?`}
        confirmText="Yes, Remove Subject"
        variant="destructive"
        icon="trash"
        onConfirm={handleConfirmDeleteSubject}
      />

      {/* Bulk CSV Import Modal */}
      <CsvImportModal
        isOpen={importCsvModalOpen}
        onClose={() => setImportCsvModalOpen(false)}
        title="Bulk Curriculum Syllabus Import"
        description="Upload a CSV spreadsheet to bulk register academic subjects, course codes, departments, weekly credit hours, and map them to appropriate class sections."
        badgeLabel="Subject Syllabus Import"
        templateFilename="Seneca_Curriculum_Subjects_Import_Template"
        columns={SUBJECT_IMPORT_COLUMNS}
        sampleData={SUBJECT_SAMPLE_DATA}
        apiEndpoint="/api/subjects/import"
        onSuccess={() => fetchSubjects()}
        entityNamePlural="subjects"
      />
    </div>
  );
}
