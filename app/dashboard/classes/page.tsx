"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  GraduationCap,
  Users,
  Search,
  Filter,
  Plus,
  Download,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  X,
  Briefcase,
  Building,
  Check,
  DoorOpen,
  UserCheck,
  Award,
  ChevronRight,
  TrendingUp,
  FolderKanban,
  Wand2,
  BookOpen,
  ShieldCheck,
  Tag,
  Palette,
  CheckSquare,
  Square,
  ArrowRight,
  Info,
  BookMarked,
  School,
  FolderPlus,
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
import {
  ACADEMIC_SPECTRUM,
  ACADEMIC_TIERS,
  STREAM_OPTIONS_BY_TIER,
  AVAILABLE_SECTIONS,
  WINGS,
  AcademicGrade,
} from "@/lib/constants/academic-spectrum";

interface DepartmentData {
  id: string;
  name: string;
  code: string;
  description: string;
  wing: string;
  colorCode: string;
  status: "active" | "archived";
  classCount: number;
  createdAt: string;
}

interface AllocatedSubject {
  id: string;
  name: string;
  code: string;
  department: string;
  creditHours: number;
  specialistTeachers?: Array<{
    id: string;
    name: string;
    employeeId: string;
    specialization: string;
    phone?: string;
  }>;
}

interface ClassData {
  id: string;
  name: string;
  gradeLevel: number;
  section: string;
  fullName: string;
  capacity: number;
  enrolledCount: number;
  occupancyRate: number;
  roomNumber: string;
  status: "active" | "archived";
  stream?: string;
  department?: {
    id: string;
    name: string;
    code: string;
    colorCode: string;
    wing: string;
  } | null;
  classTeacher?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    specialization: string;
  } | null;
  allocatedSubjects?: AllocatedSubject[];
  createdAt: string;
}

interface TeacherOption {
  id: string;
  name: string;
  specialization: string;
  employeeId?: string;
}

export default function PrincipalClassesPage() {
  const [activeTab, setActiveTab] = useState<"classes" | "allocations" | "departments" | "wizard">("classes");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [teachersList, setTeachersList] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWing, setSelectedWing] = useState("all");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassData | null>(null);
  const [createDeptModalOpen, setCreateDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<DepartmentData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Single Class Form State
  const [selectedTier, setSelectedTier] = useState<string>("Primary");
  const [formName, setFormName] = useState("Grade 1");
  const [formGradeLevel, setFormGradeLevel] = useState(1);
  const [formSection, setFormSection] = useState("A");
  const [formDepartmentId, setFormDepartmentId] = useState("none");
  const [formStream, setFormStream] = useState("General / Primary Core Curriculum");
  const [formCapacity, setFormCapacity] = useState("35");
  const [formRoomNumber, setFormRoomNumber] = useState("Primary Wing Room 201");
  const [formClassTeacherId, setFormClassTeacherId] = useState("none");

  // Standalone Department Form State
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptDescription, setDeptDescription] = useState("");
  const [deptWing, setDeptWing] = useState("All Wings");
  const [deptColorCode, setDeptColorCode] = useState("#810D0B");

  // Batch Wizard State (Playgroup to 2nd Year Matrix)
  const [wizardRows, setWizardRows] = useState<
    Array<{
      name: string;
      gradeLevel: number;
      tier: string;
      wing: string;
      enabled: boolean;
      sections: string[];
      departmentId: string;
      capacity: number;
      stream: string;
      roomPrefix: string;
    }>
  >(() =>
    ACADEMIC_SPECTRUM.map((spec) => ({
      name: spec.name,
      gradeLevel: spec.gradeLevel,
      tier: spec.tier,
      wing: spec.wing,
      enabled: true,
      sections: ["A", "B"],
      departmentId: "none",
      capacity: 35,
      stream: spec.defaultStream,
      roomPrefix: spec.suggestedRooms.split(" ")[0] || "Wing",
    }))
  );

  const fetchClasses = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/classes", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.classes) {
        setClasses(data.data.classes);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      toast.error("Error loading class records.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchDepartments = async (silent = false) => {
    if (!silent) setLoadingDepts(true);
    try {
      const res = await fetch("/api/departments", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.departments) {
        setDepartments(data.data.departments);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setDepartments([]);
    } finally {
      if (!silent) setLoadingDepts(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.teachers) {
        setTeachersList(
          data.data.teachers.map((t: any) => ({
            id: t.id,
            name: t.name,
            specialization: t.specialization,
            employeeId: t.employeeId,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch teachers for dropdown:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchDepartments();
    fetchTeachers();
  }, []);

  // Filter classes
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.stream || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.department?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.classTeacher?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWing =
      selectedWing === "all" ||
      (selectedWing === "Early Years" &&
        (cls.gradeLevel === 0 ||
          cls.name.toLowerCase().includes("nursery") ||
          cls.name.toLowerCase().includes("kg") ||
          cls.name.toLowerCase().includes("playgroup") ||
          cls.name.toLowerCase().includes("prep"))) ||
      (selectedWing === "Primary" && cls.gradeLevel >= 1 && cls.gradeLevel <= 5) ||
      (selectedWing === "Middle" && cls.gradeLevel >= 6 && cls.gradeLevel <= 8) ||
      (selectedWing === "Secondary" && (cls.gradeLevel === 9 || cls.gradeLevel === 10)) ||
      (selectedWing === "Higher Secondary" && (cls.gradeLevel === 11 || cls.gradeLevel === 12));

    const matchesDept = selectedDeptFilter === "all" || cls.department?.id === selectedDeptFilter;

    return matchesSearch && matchesWing && matchesDept;
  });

  // Summary Metrics
  const totalClasses = classes.length;
  const totalCapacity = classes.reduce((acc, curr) => acc + (curr.capacity || 35), 0);
  const totalEnrolled = classes.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0);
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
  const totalDepartments = departments.length;

  // Grade selection preset handler
  const handleSelectGradePreset = (preset: AcademicGrade) => {
    setSelectedTier(preset.tier);
    setFormName(preset.name);
    setFormGradeLevel(preset.gradeLevel);
    setFormRoomNumber(preset.suggestedRooms);
    setFormStream(preset.defaultStream);
  };

  const handleOpenCreateClassModal = () => {
    setEditingClass(null);
    setSelectedTier("Primary");
    setFormName("Grade 1");
    setFormGradeLevel(1);
    setFormSection("A");
    setFormCapacity("35");
    setFormStream("General / Primary Core Curriculum");
    setFormRoomNumber("Primary Wing Room 201");
    setFormClassTeacherId("none");
    setFormDepartmentId("none");
    setCreateModalOpen(true);
  };

  const handleOpenEditClassModal = (cls: ClassData) => {
    setEditingClass(cls);
    setFormName(cls.name);
    setFormGradeLevel(cls.gradeLevel);
    setFormSection(cls.section);
    setFormCapacity(String(cls.capacity));
    setFormStream(cls.stream || "General / Core Curriculum");
    setFormRoomNumber(cls.roomNumber);
    setFormDepartmentId(cls.department?.id || "none");
    setFormClassTeacherId(cls.classTeacher?.id || "none");

    const matchedPreset = ACADEMIC_SPECTRUM.find(
      (s) => s.name.toLowerCase() === cls.name.toLowerCase() || s.gradeLevel === cls.gradeLevel
    );
    if (matchedPreset) {
      setSelectedTier(matchedPreset.tier);
    } else {
      setSelectedTier(
        cls.gradeLevel === 0
          ? "Preschool"
          : cls.gradeLevel <= 5
          ? "Primary"
          : cls.gradeLevel <= 8
          ? "Middle"
          : cls.gradeLevel <= 10
          ? "Secondary"
          : "Higher Secondary"
      );
    }

    setCreateModalOpen(true);
  };

  // Submit Handler for Create / Edit Class Section
  const handleCreateOrEditClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formName.trim(),
        gradeLevel: Number(formGradeLevel),
        section: formSection.trim().toUpperCase(),
        capacity: Number(formCapacity) || 35,
        roomNumber: formRoomNumber.trim(),
        stream: formStream,
        departmentId: formDepartmentId !== "none" ? formDepartmentId : undefined,
        classTeacherId: formClassTeacherId !== "none" ? formClassTeacherId : undefined,
      };

      let res;
      if (editingClass) {
        res = await fetch(`/api/classes/${editingClass.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save class section.");
      }

      toast.success(editingClass ? "Class Section Updated!" : "Class Section Created!", {
        description: `${formName}-${formSection.toUpperCase()} saved in academic registry.`,
      });

      setCreateModalOpen(false);
      setEditingClass(null);
      fetchClasses(true);
    } catch (err: any) {
      toast.error("Operation Failed", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = (cls: ClassData) => {
    setClassToDelete(cls);
  };

  const handleConfirmDeleteClass = async () => {
    if (!classToDelete) return;
    const cls = classToDelete;

    // Optimistic UI update
    setClasses((prev) => prev.filter((item) => item.id !== cls.id));

    try {
      const res = await fetch(`/api/classes/${cls.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message);

      toast.success("Class Section Removed", {
        description: `${cls.fullName} was successfully deleted.`,
      });
      fetchClasses(true);
    } catch (err: any) {
      toast.error("Action Failed", { description: err.message });
      fetchClasses(true);
    }
  };

  // Department Add / Edit Handlers (Standalone modal)
  const handleOpenCreateDeptModal = () => {
    setEditingDept(null);
    setDeptName("");
    setDeptCode("");
    setDeptDescription("");
    setDeptWing("All Wings");
    setDeptColorCode("#810D0B");
    setCreateDeptModalOpen(true);
  };

  const handleOpenEditDeptModal = (dept: DepartmentData) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptDescription(dept.description);
    setDeptWing(dept.wing || "All Wings");
    setDeptColorCode(dept.colorCode || "#810D0B");
    setCreateDeptModalOpen(true);
  };

  const handleDeptNameChange = (val: string) => {
    setDeptName(val);
    if (!editingDept && (!deptCode || deptCode.endsWith("-DEPT"))) {
      const clean = val.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase();
      if (clean) {
        setDeptCode(`${clean}-DEPT`);
      }
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      toast.error("Please provide both Department Name and Code.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: deptName.trim(),
        code: deptCode.toUpperCase().trim(),
        description: deptDescription.trim() || `Department for ${deptName.trim()}`,
        wing: deptWing,
        colorCode: deptColorCode,
      };

      let res;
      if (editingDept) {
        res = await fetch(`/api/departments/${editingDept.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to save department.");

      toast.success(editingDept ? "Academic Department Updated!" : "Academic Department Created!", {
        description: `${deptName} (${deptCode}) successfully saved.`,
      });

      setCreateDeptModalOpen(false);
      setEditingDept(null);
      fetchDepartments();
    } catch (err: any) {
      toast.error("Operation Failed", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDept = (dept: DepartmentData) => {
    setDeptToDelete(dept);
  };

  const handleConfirmDeleteDept = async () => {
    if (!deptToDelete) return;
    const dept = deptToDelete;

    // Optimistic UI update
    setDepartments((prev) => prev.filter((d) => d.id !== dept.id));

    try {
      const res = await fetch(`/api/departments/${dept.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message);

      toast.success("Department Removed", { description: `${dept.name} was deleted.` });
      fetchDepartments(true);
    } catch (err: any) {
      toast.error("Action Failed", { description: err.message });
      fetchDepartments(true);
    }
  };

  // Batch Wizard handlers
  const toggleWizardRow = (idx: number) => {
    setWizardRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, enabled: !row.enabled } : row))
    );
  };

  const toggleWizardSection = (idx: number, sec: string) => {
    setWizardRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const exists = row.sections.includes(sec);
        const updated = exists ? row.sections.filter((s) => s !== sec) : [...row.sections, sec].sort();
        return { ...row, sections: updated };
      })
    );
  };

  const handleSelectAllWizard = (enableAll: boolean) => {
    setWizardRows((prev) => prev.map((row) => ({ ...row, enabled: enableAll })));
  };

  const handleExecuteBatchProvision = async () => {
    const activeRows = wizardRows.filter((r) => r.enabled && r.sections.length > 0);
    if (activeRows.length === 0) {
      toast.error("Please enable at least one grade and select at least one section.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        classes: activeRows.map((r) => ({
          name: r.name,
          gradeLevel: r.gradeLevel,
          sections: r.sections,
          capacity: r.capacity,
          stream: r.stream,
          departmentId: r.departmentId !== "none" ? r.departmentId : undefined,
          roomPrefix: r.roomPrefix,
        })),
      };

      const res = await fetch("/api/classes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Batch provisioning failed.");
      }

      toast.success("Batch Provisioning Complete!", {
        description: data.message || `Classes successfully created across academic ladder.`,
      });

      setActiveTab("classes");
      fetchClasses(true);
    } catch (err: any) {
      toast.error("Batch Creation Failed", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (classes.length === 0) return toast.info("No classes to export.");
    const headers = "Class Title,Section,Grade Level,Academic Department,Academic Stream,Room,Homeroom Coordinator,Enrolled,Capacity,Occupancy\n";
    const rows = classes
      .map(
        (c) =>
          `"${c.name}","${c.section}","${c.gradeLevel}","${c.department?.name || "General"}","${c.stream || "General"}","${c.roomNumber}","${c.classTeacher?.name || "Unassigned"}","${c.enrolledCount}","${c.capacity}","${c.occupancyRate}%"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Seneca_Academic_Sections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Academic roster exported to CSV!");
  };

  const availableStreamsForCurrentTier =
    STREAM_OPTIONS_BY_TIER[selectedTier] || STREAM_OPTIONS_BY_TIER["Primary"];

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Header & Hero Metric Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <Layers className="h-3 w-3" />
                <span>Playgroup to 2nd Year Academic Architecture</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session 2026–27 Active</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Class & Section <span className="text-seneca-amber">Academic Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Configure class sections from Playgroup through 2nd Year (Intermediate), allocate academic streams, manage classroom capacities, and oversee specialist faculty allocations.
            </p>
          </div>

          {/* Action Buttons on Class Management Page */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={handleOpenCreateDeptModal}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-seneca-amber-light border-seneca-amber/30 shadow-sm w-full sm:w-auto justify-center gap-1.5"
            >
              <FolderPlus className="h-3.5 w-3.5 text-seneca-amber-light" />
              <span>Add Department</span>
            </Button>
            <Button
              onClick={handleOpenCreateClassModal}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto justify-center"
            >
              <Plus className="h-3.5 w-3.5 text-seneca-amber-light" />
              <span>Add Class Section</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Total Sections
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-crimson/10 text-seneca-crimson shrink-0">
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {totalClasses}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Academic Ladder:</span>
            <span className="font-bold text-seneca-crimson">Playgroup &rarr; 2nd Year</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Enrolled Students
            </span>
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {totalEnrolled}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Registration:</span>
            <span className="font-bold text-blue-600">Active Students</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Campus Capacity
            </span>
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {totalCapacity}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Seat Allocation:</span>
            <span className="font-bold text-foreground">Max Capacity</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Seat Occupancy
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-emerald-600">
            {overallOccupancy}%
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Academic Wings:</span>
            <span className="font-bold text-emerald-600">{totalDepartments} Departments</span>
          </div>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("classes")}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0",
            activeTab === "classes"
              ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Classes & Sections ({totalClasses})</span>
        </button>

        <button
          onClick={() => setActiveTab("allocations")}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0",
            activeTab === "allocations"
              ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <BookMarked className="h-3.5 w-3.5" />
          <span>Subject & Faculty Allocations</span>
        </button>

        <button
          onClick={() => setActiveTab("departments")}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0",
            activeTab === "departments"
              ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <FolderKanban className="h-3.5 w-3.5" />
          <span>Academic Departments ({totalDepartments})</span>
        </button>

        <button
          onClick={() => setActiveTab("wizard")}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0",
            activeTab === "wizard"
              ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Wand2 className="h-3.5 w-3.5 text-seneca-amber" />
          <span>Playgroup &rarr; 2nd Year Setup Wizard</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CLASSES & SECTIONS DIRECTORY                                       */}
      {/* ========================================================================= */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-sm rounded-2xl p-3 sm:p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search class, section, stream, room..."
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

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedWing}
                  onChange={(e) => setSelectedWing(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-seneca-crimson"
                >
                  {WINGS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-seneca-crimson max-w-[160px] truncate"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>

                <Button
                  onClick={() => fetchClasses()}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl shrink-0"
                  title="Refresh Classes"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>

                <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                    )}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      viewMode === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                    )}
                    title="Table View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Classes Data Display */}
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
              <p className="text-xs font-bold text-muted-foreground">Loading Seneca Academic Registry...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-4">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">No Classes Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No classes match your current search query or wing filter. You can create a new class section or use the setup wizard.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedWing("all");
                    setSelectedDeptFilter("all");
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={() => setActiveTab("wizard")}
                  variant="glow"
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>Run Playgroup &rarr; 2nd Year Setup Wizard</span>
                </Button>
              </div>
            </Card>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredClasses.map((cls) => {
                return (
                  <Card
                    key={cls.id}
                    className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl overflow-hidden hover:border-seneca-crimson/50 transition-all space-y-3.5 p-4 sm:p-5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-extrabold text-sm shadow-md shrink-0">
                          {cls.section}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-seneca-crimson transition-colors">
                            {cls.name}
                          </h4>
                          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate flex items-center gap-1">
                            <DoorOpen className="h-3 w-3 text-muted-foreground" />
                            <span>{cls.roomNumber}</span>
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold capitalize shrink-0 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      >
                        {cls.status}
                      </Badge>
                    </div>

                    {/* Department & Stream Badge */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {cls.department ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
                          style={{
                            backgroundColor: `${cls.department.colorCode}18`,
                            color: cls.department.colorCode,
                            borderColor: `${cls.department.colorCode}40`,
                            borderWidth: "1px",
                          }}
                        >
                          <Tag className="h-2.5 w-2.5" />
                          <span>{cls.department.name}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                          General Department
                        </span>
                      )}

                      {cls.stream && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted/80 text-foreground border border-border truncate max-w-[180px]">
                          {cls.stream}
                        </span>
                      )}
                    </div>

                    {/* Class Info Box */}
                    <div className="space-y-2 p-2.5 sm:p-3 rounded-xl bg-muted/40 text-xs">
                      {/* Allocated Subjects Pill */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                          <BookOpen className="h-3.5 w-3.5 text-seneca-crimson" />
                          <span>Curriculum Syllabus:</span>
                        </span>
                        <span className="font-bold text-foreground">
                          {cls.allocatedSubjects?.length || 0} Subjects
                        </span>
                      </div>

                      {/* Visual Capacity Bar */}
                      <div className="space-y-1 pt-1.5 border-t border-border/40">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Classroom Occupancy:</span>
                          <span className="font-bold text-foreground">
                            {cls.enrolledCount} / {cls.capacity} ({cls.occupancyRate}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border/50">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              cls.occupancyRate >= 90
                                ? "bg-rose-500"
                                : cls.occupancyRate >= 70
                                ? "bg-seneca-amber"
                                : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(cls.occupancyRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                      <Button
                        onClick={() => setSelectedClass(cls)}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-xs font-bold gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>View Section</span>
                      </Button>

                      <Button
                        onClick={() => handleOpenEditClassModal(cls)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-seneca-amber hover:bg-seneca-amber/10"
                        title="Edit Class"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        onClick={() => handleDeleteClass(cls)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10"
                        title="Delete Class"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 px-4">Class & Section</th>
                      <th className="py-3.5 px-4">Academic Department & Stream</th>
                      <th className="py-3.5 px-4">Room / Campus</th>
                      <th className="py-3.5 px-4">Curriculum</th>
                      <th className="py-3.5 px-4">Occupancy</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredClasses.map((cls) => (
                      <tr key={cls.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              {cls.section}
                            </div>
                            <div>
                              <div className="font-bold text-foreground text-xs">{cls.name}</div>
                              <div className="text-[10px] text-muted-foreground">
                                Level: {cls.gradeLevel === 0 ? "Early Years" : `Grade ${cls.gradeLevel}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {cls.department ? (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{
                                  backgroundColor: `${cls.department.colorCode}18`,
                                  color: cls.department.colorCode,
                                }}
                              >
                                {cls.department.name}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">General Department</span>
                            )}
                            {cls.stream && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                {cls.stream}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground flex items-center gap-1">
                            <DoorOpen className="h-3 w-3 text-muted-foreground" />
                            <span>{cls.roomNumber}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <BookOpen className="h-3.5 w-3.5 text-seneca-crimson" />
                            <span>{cls.allocatedSubjects?.length || 0} Subjects</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1 w-32">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-foreground">
                                {cls.enrolledCount} / {cls.capacity}
                              </span>
                              <span className="text-muted-foreground font-semibold">{cls.occupancyRate}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  cls.occupancyRate >= 90
                                    ? "bg-rose-500"
                                    : cls.occupancyRate >= 70
                                    ? "bg-seneca-amber"
                                    : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(cls.occupancyRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold capitalize bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          >
                            {cls.status}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={() => setSelectedClass(cls)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 rounded-lg text-xs font-bold"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" />
                            </Button>
                            <Button
                              onClick={() => handleOpenEditClassModal(cls)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 rounded-lg text-xs font-bold text-seneca-amber"
                              title="Edit Class"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteClass(cls)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10"
                              title="Delete Class"
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
      {/* TAB 2: SUBJECT & TEACHER ALLOCATIONS                                      */}
      {/* ========================================================================= */}
      {activeTab === "allocations" && (
        <div className="space-y-4">
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-seneca-crimson font-bold text-xs uppercase tracking-wider">
              <BookMarked className="h-4 w-4" />
              <span>Subject-Specialist Faculty Allocation System</span>
            </div>
            <h3 className="text-lg font-bold font-heading text-foreground">
              Cross-Grade Subject & Specialist Faculty Matrix
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              In Seneca Academy, faculty members are subject experts (e.g. Physics, Mathematics, Computer Science, Urdu, English) who teach across multiple classes and grades. View the subject curriculum and assigned specialist teachers for every class section below.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.map((cls) => {
              const subjects = cls.allocatedSubjects || [];
              return (
                <Card
                  key={cls.id}
                  className="border border-border/80 bg-card/95 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-seneca-crimson/40 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {cls.section}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-foreground">{cls.fullName}</h4>
                        <div className="text-[10px] text-muted-foreground">
                          {cls.stream || "General Curriculum"} &bull; {cls.roomNumber}
                        </div>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-bold">
                      {subjects.length} Subjects
                    </Badge>
                  </div>

                  {/* Subject List */}
                  {subjects.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border/80 text-center space-y-1">
                      <p className="text-xs text-muted-foreground">No subjects linked to this class section yet.</p>
                      <Link
                        href="/dashboard/subjects"
                        className="text-[11px] font-bold text-seneca-crimson hover:underline inline-flex items-center gap-1"
                      >
                        <span>Manage Curriculum in Subjects Desk</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {subjects.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-foreground">{sub.name}</span>
                              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded bg-muted text-muted-foreground border">
                                {sub.code}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Dept: {sub.department} &bull; {sub.creditHours} Credits/Wk
                            </div>
                          </div>

                          {/* Specialist Teachers */}
                          <div className="text-right">
                            {sub.specialistTeachers && sub.specialistTeachers.length > 0 ? (
                              <div>
                                <div className="text-[11px] font-bold text-foreground">
                                  {sub.specialistTeachers.map((t) => t.name).join(", ")}
                                </div>
                                <div className="text-[9px] text-emerald-600 font-semibold">Specialist Faculty</div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">Faculty Pending</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACADEMIC DEPARTMENTS (NO HODs)                                     */}
      {/* ========================================================================= */}
      {activeTab === "departments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                Academic Departments
              </h3>
              <p className="text-xs text-muted-foreground">
                Manage subject departments across Early Years, Primary, Middle, Secondary (Matric) and College wings.
              </p>
            </div>
            <Button
              onClick={handleOpenCreateDeptModal}
              variant="glow"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Department</span>
            </Button>
          </div>

          {loadingDepts ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-seneca-crimson" />
              <p className="text-xs font-bold text-muted-foreground">Loading Academic Departments...</p>
            </div>
          ) : departments.length === 0 ? (
            <Card className="border border-border/80 bg-card/90 rounded-2xl p-8 text-center space-y-3">
              <FolderKanban className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">No academic departments created yet.</p>
              <Button onClick={handleOpenCreateDeptModal} variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                Create First Department
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <Card
                  key={dept.id}
                  className="border border-border/80 bg-card/95 shadow-md rounded-2xl p-4 sm:p-5 space-y-3.5 hover:border-seneca-crimson/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xs font-mono shadow-xs shrink-0"
                        style={{ backgroundColor: dept.colorCode || "#810D0B" }}
                      >
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{dept.name}</h4>
                        <span className="font-mono text-[10px] font-extrabold text-muted-foreground uppercase">
                          {dept.code}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold shrink-0">
                      {dept.wing}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {dept.description || "Curriculum alignment and section management department."}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="font-semibold text-muted-foreground">
                      <strong className="text-foreground">{dept.classCount}</strong> Affiliated Classes
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleOpenEditDeptModal(dept)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs font-bold text-seneca-amber"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        onClick={() => handleDeleteDept(dept)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PLAYGROUP TO 2ND YEAR BATCH PROVISIONING WIZARD                    */}
      {/* ========================================================================= */}
      {activeTab === "wizard" && (
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
                <Wand2 className="h-4 w-4 text-seneca-amber" />
                <span>Automated Academic Architecture Setup</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold font-heading text-foreground">
                Playgroup to 2nd Year Provisioning Matrix
              </h3>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Configure your school's full academic ladder from Early Years (Playgroup/Nursery) through College (1st & 2nd Year), select active sections (A, B, C, D), and provision all class sections with 1 click.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => handleSelectAllWizard(true)}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold"
              >
                Select All
              </Button>
              <Button
                onClick={() => handleSelectAllWizard(false)}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold"
              >
                Deselect All
              </Button>
              <Button
                onClick={handleExecuteBatchProvision}
                disabled={submitting}
                variant="glow"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-seneca-crimson/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Provisioning Classes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-seneca-amber-light" />
                    <span>Provision Selected Classes Now</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-3 w-12 text-center">Active</th>
                  <th className="py-3 px-4">Grade / Academic Level</th>
                  <th className="py-3 px-4">Academic Tier</th>
                  <th className="py-3 px-4">Sections to Generate</th>
                  <th className="py-3 px-4">Default Stream</th>
                  <th className="py-3 px-4">Seat Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {wizardRows.map((row, idx) => {
                  return (
                    <tr
                      key={idx}
                      className={cn(
                        "transition-colors",
                        row.enabled ? "bg-card hover:bg-muted/20" : "bg-muted/10 opacity-60"
                      )}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleWizardRow(idx)}
                          className="p-1 text-seneca-crimson focus:outline-none"
                        >
                          {row.enabled ? (
                            <CheckSquare className="h-5 w-5 text-seneca-crimson" />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground text-xs sm:text-sm">{row.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {row.gradeLevel === 0 ? "Preschool Foundation" : `Level Order: ${row.gradeLevel}`}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {row.tier}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {AVAILABLE_SECTIONS.map((sec) => {
                            const isSecActive = row.sections.includes(sec);
                            return (
                              <button
                                key={sec}
                                type="button"
                                disabled={!row.enabled}
                                onClick={() => toggleWizardSection(idx, sec)}
                                className={cn(
                                  "h-7 w-7 rounded-lg text-xs font-bold transition-all border",
                                  isSecActive
                                    ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs"
                                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                                )}
                              >
                                {sec}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-xs text-foreground font-medium truncate max-w-[180px] block">
                          {row.stream}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-bold text-foreground">{row.capacity} Seats</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 5. Create / Edit Class Section Modal Dialog (CLEAN, POLISHED UX)          */}
      {/* ========================================================================= */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-6 sm:p-8 my-6 shadow-2xl border border-border/80">
          <DialogHeader className="space-y-1.5 pb-4 border-b border-border/60">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>{editingClass ? "Edit Class Section" : "Academic Class Section Setup"}</span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
              {editingClass ? `Edit ${editingClass.fullName}` : "Create Class & Section"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure class identity (Playgroup to 2nd Year), section code, stream, and campus allocation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrEditClassSubmit} className="space-y-6 pt-3">
            {/* Step 1: Academic Tier & Grade Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  <span>Academic Tier & Grade Level</span>
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Playgroup through 2nd Year
                </span>
              </div>

              {/* Tier Segmented Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-muted/60 border border-border">
                {ACADEMIC_TIERS.filter((t) => t.id !== "all").map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTier(t.id);
                      const firstInTier = ACADEMIC_SPECTRUM.find((s) => s.tier === t.id);
                      if (firstInTier) {
                        handleSelectGradePreset(firstInTier);
                      }
                    }}
                    className={cn(
                      "py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all text-center truncate",
                      selectedTier === t.id
                        ? "bg-card shadow-sm text-seneca-crimson font-extrabold border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.id === "Preschool"
                      ? "Preschool"
                      : t.id === "Primary"
                      ? "Primary (1–5)"
                      : t.id === "Middle"
                      ? "Middle (6–8)"
                      : t.id === "Secondary"
                      ? "Secondary (9–10)"
                      : "College (11–12)"}
                  </button>
                ))}
              </div>

              {/* Grade Chips in Selected Tier */}
              <div className="flex flex-wrap gap-2 pt-1">
                {ACADEMIC_SPECTRUM.filter((s) => s.tier === selectedTier).map((preset) => {
                  const isSelected = formName === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectGradePreset(preset)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-xs",
                        isSelected
                          ? "bg-seneca-crimson text-white border-seneca-crimson shadow-sm"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      )}
                    >
                      <span>{preset.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Class Full Name Preview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-seneca-crimson/10 via-seneca-amber/10 to-transparent border border-seneca-crimson/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-seneca-crimson">
                  Live Section Identifier Preview
                </span>
                <div className="text-base sm:text-lg font-black text-foreground font-heading">
                  {formName} - Section {formSection.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Track: <strong className="text-foreground">{formStream}</strong>
                </div>
              </div>
              <Badge className="bg-seneca-crimson text-white font-bold text-xs px-3 py-1 shadow-sm">
                {selectedTier}
              </Badge>
            </div>

            {/* Step 2: Class Title & Section Code */}
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center text-[10px] font-black">
                  2
                </span>
                <span>Section Code & Customization</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Class Title <span className="text-seneca-crimson">*</span>
                  </label>
                  <Input
                    required
                    type="text"
                    placeholder="e.g. 1st Year (11th Class)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-11 rounded-xl text-xs font-bold bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Section Identifier <span className="text-seneca-crimson">*</span>
                    </label>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Selected: <strong>Section {formSection.toUpperCase() || "A"}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {["A", "B", "C", "D", "E", "F"].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setFormSection(sec)}
                        className={cn(
                          "h-11 w-10 rounded-xl text-xs font-bold transition-all border shrink-0",
                          formSection.toUpperCase() === sec
                            ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs"
                            : "bg-background text-foreground border-border hover:bg-muted"
                        )}
                      >
                        {sec}
                      </button>
                    ))}
                    <div className="relative flex-1 min-w-[90px]">
                      <Input
                        type="text"
                        placeholder="Custom"
                        value={["A", "B", "C", "D", "E", "F"].includes(formSection.toUpperCase()) ? "" : formSection}
                        onChange={(e) => setFormSection(e.target.value.toUpperCase())}
                        className="h-11 rounded-xl text-xs font-bold uppercase text-center bg-background"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Academic Stream & Department Allocation */}
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center text-[10px] font-black">
                  3
                </span>
                <span>Academic Stream & Department Allocation</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Academic Stream */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Academic Stream / Curriculum Track <span className="text-seneca-crimson">*</span>
                  </label>
                  <select
                    value={formStream}
                    onChange={(e) => setFormStream(e.target.value)}
                    className="h-11 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-seneca-crimson/30 transition-all text-foreground"
                  >
                    {availableStreamsForCurrentTier.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic Department Dropdown (Clean, full-width, professional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Academic Department / Wing Division
                  </label>
                  <select
                    value={formDepartmentId}
                    onChange={(e) => setFormDepartmentId(e.target.value)}
                    className="h-11 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-seneca-crimson/30 transition-all text-foreground"
                  >
                    <option value="none">-- General Wing / Unallocated --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Classroom Location & Capacity */}
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center text-[10px] font-black">
                  4
                </span>
                <span>Classroom Location & Student Capacity</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Max Student Capacity <span className="text-seneca-crimson">*</span>
                  </label>
                  <Input
                    required
                    type="number"
                    min={1}
                    max={100}
                    placeholder="35"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="h-11 rounded-xl text-xs font-bold bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Assigned Room / Campus Wing <span className="text-seneca-crimson">*</span>
                  </label>
                  <Input
                    required
                    type="text"
                    placeholder="e.g. College Wing Room 501"
                    value={formRoomNumber}
                    onChange={(e) => setFormRoomNumber(e.target.value)}
                    className="h-11 rounded-xl text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/60 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl text-xs font-bold h-11 px-5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5 h-11 px-6 shadow-md shadow-seneca-crimson/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Section...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-seneca-amber-light" />
                    <span>{editingClass ? "Update Class Section" : "Create Class Section"}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 6. Create / Edit Academic Department Modal (PROFESSIONAL DIALOG)           */}
      {/* ========================================================================= */}
      <Dialog open={createDeptModalOpen} onOpenChange={setCreateDeptModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5 my-6 shadow-2xl border border-border/80">
          <DialogHeader className="space-y-1.5 pb-4 border-b border-border/60">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
              <FolderPlus className="h-4 w-4 text-seneca-amber" />
              <span>Academic Curriculum Architecture</span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
              {editingDept ? `Edit Department: ${editingDept.name}` : "Create Academic Department"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define academic subject departments, configure campus wing alignment, and set color themes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeptSubmit} className="space-y-5 pt-1">
            {/* Live Department Badge Preview */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-xs font-mono shadow-sm shrink-0"
                  style={{ backgroundColor: deptColorCode || "#810D0B" }}
                >
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">
                    {deptName || "Department Name Preview"}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground uppercase">
                    Code: {deptCode || "CODE-DEPT"} &bull; Wing: {deptWing}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-bold"
                style={{
                  borderColor: deptColorCode,
                  color: deptColorCode,
                  backgroundColor: `${deptColorCode}15`,
                }}
              >
                Live Theme
              </Badge>
            </div>

            {/* Department Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Department Name <span className="text-seneca-crimson">*</span>
              </label>
              <Input
                required
                type="text"
                placeholder="e.g. Science & Mathematics Department"
                value={deptName}
                onChange={(e) => handleDeptNameChange(e.target.value)}
                className="h-11 rounded-xl text-xs font-bold bg-background"
              />
            </div>

            {/* Department Code & Wing Alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Department Code <span className="text-seneca-crimson">*</span>
                </label>
                <Input
                  required
                  type="text"
                  placeholder="e.g. SCI-MATH"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  className="h-11 rounded-xl text-xs font-mono font-bold uppercase bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Campus Wing Alignment</label>
                <select
                  value={deptWing}
                  onChange={(e) => setDeptWing(e.target.value)}
                  className="h-11 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-seneca-crimson/30"
                >
                  <option value="All Wings">All Wings</option>
                  <option value="Early Years">Early Years (Playgroup/Nursery/KG)</option>
                  <option value="Primary">Primary Wing (1–5)</option>
                  <option value="Middle">Middle Wing (6–8)</option>
                  <option value="Secondary">Secondary / Matric (9–10)</option>
                  <option value="Higher Secondary">Senior / College (11–12)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Description & Scope</label>
              <Input
                type="text"
                placeholder="Curriculum standards and class section management department."
                value={deptDescription}
                onChange={(e) => setDeptDescription(e.target.value)}
                className="h-11 rounded-xl text-xs bg-background"
              />
            </div>

            {/* Theme Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Department Theme Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={deptColorCode}
                  onChange={(e) => setDeptColorCode(e.target.value)}
                  className="h-11 w-14 rounded-xl border border-border cursor-pointer bg-background p-1"
                />
                <Input
                  type="text"
                  value={deptColorCode}
                  onChange={(e) => setDeptColorCode(e.target.value)}
                  className="h-11 rounded-xl text-xs font-mono uppercase bg-background flex-1"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/60 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDeptModalOpen(false)}
                className="rounded-xl text-xs font-bold h-11 px-5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                variant="glow"
                className="rounded-xl text-xs font-bold h-11 px-6 gap-1.5 shadow-md shadow-seneca-crimson/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-seneca-amber-light" />
                    <span>{editingDept ? "Update Department" : "Create Department"}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 7. Class Section Details Modal                                            */}
      {/* ========================================================================= */}
      {selectedClass && (
        <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
          <DialogContent className="max-w-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 my-6 shadow-2xl border border-border/80">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-extrabold text-base shadow-md shrink-0">
                  {selectedClass.section}
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold">{selectedClass.fullName}</DialogTitle>
                  <p className="text-xs text-muted-foreground">{selectedClass.roomNumber}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-muted/40">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Grade / Academic Level</span>
                  <span className="font-bold text-foreground text-xs sm:text-sm">{selectedClass.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Section Identifier</span>
                  <span className="font-bold text-foreground font-mono text-xs sm:text-sm">
                    Section {selectedClass.section}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Academic Department</span>
                  <span className="font-bold text-foreground text-xs">
                    {selectedClass.department?.name || "General Department"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Academic Track / Stream</span>
                  <span className="font-bold text-foreground text-xs">{selectedClass.stream || "General"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Enrolled Students</span>
                  <span className="font-bold text-foreground text-xs sm:text-sm">
                    {selectedClass.enrolledCount} / {selectedClass.capacity} Seats
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Seat Occupancy</span>
                  <span className="font-bold text-emerald-600 text-xs sm:text-sm">
                    {selectedClass.occupancyRate}%
                  </span>
                </div>
              </div>

              {/* Allocated Curriculum Subjects */}
              <div className="space-y-1.5 border-t border-border/60 pt-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center justify-between">
                  <span>Curriculum Subjects & Specialist Teachers</span>
                  <span className="text-seneca-crimson">
                    {selectedClass.allocatedSubjects?.length || 0} Subjects
                  </span>
                </span>

                {selectedClass.allocatedSubjects && selectedClass.allocatedSubjects.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedClass.allocatedSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-foreground">
                            {sub.name} <span className="text-[10px] font-mono text-muted-foreground">({sub.code})</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">Dept: {sub.department}</div>
                        </div>

                        <div className="text-right text-[11px] font-semibold text-foreground">
                          {sub.specialistTeachers && sub.specialistTeachers.length > 0
                            ? sub.specialistTeachers.map((t) => t.name).join(", ")
                            : "Specialist Pending"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic p-2 rounded-xl bg-muted/20 text-center">
                    No curriculum subjects currently allocated to this section.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                onClick={() => {
                  const target = selectedClass;
                  setSelectedClass(null);
                  handleOpenEditClassModal(target);
                }}
                variant="outline"
                className="flex-1 rounded-xl text-xs font-bold text-seneca-amber gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Section</span>
              </Button>
              <Button
                onClick={() => setSelectedClass(null)}
                variant="outline"
                className="rounded-xl text-xs font-bold"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Class Section Confirmation Dialog */}
      <ConfirmDialog
        open={!!classToDelete}
        onOpenChange={(open) => !open && setClassToDelete(null)}
        title="Remove Class Section?"
        description={`Are you sure you want to permanently delete '${classToDelete?.fullName}'? This action cannot be undone.`}
        confirmText="Yes, Remove Section"
        variant="destructive"
        icon="trash"
        onConfirm={handleConfirmDeleteClass}
      />

      {/* Delete Department Confirmation Dialog */}
      <ConfirmDialog
        open={!!deptToDelete}
        onOpenChange={(open) => !open && setDeptToDelete(null)}
        title="Remove Academic Department?"
        description={`Are you sure you want to delete department '${deptToDelete?.name}' (${deptToDelete?.code})?`}
        confirmText="Yes, Remove Department"
        variant="destructive"
        icon="trash"
        onConfirm={handleConfirmDeleteDept}
      />
    </div>
  );
}
