"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Search,
  Filter,
  UserPlus,
  Download,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  Edit,
  ShieldAlert,
  Loader2,
  RefreshCw,
  X,
  Briefcase,
  BookOpen,
  Award,
  Building,
  Check,
  ChevronRight,
  Fingerprint,
  BookMarked,
  Info,
  Crown,
  KeyRound,
  Lock,
  UserCheck,
  ShieldCheck,
  CalendarCheck,
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
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface SubjectOption {
  id: string;
  name: string;
  code: string;
  department: string;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
  fullName: string;
  gradeLevel: number;
}

interface StudentInTeacherRoster {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  admissionNumber: string;
  className: string;
  section: string;
  gender: string;
  parentName: string;
  parentPhone: string;
  attendanceRate: number;
  gradeAverage: string;
  isHeadClass: boolean;
  status: string;
}

interface TeacherData {
  id: string;
  userId?: string;
  name: string;
  email: string;
  rawPassword?: string;
  phone: string;
  employeeId: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  joinDate: string;
  status: "active" | "on_leave" | "suspended" | "terminated";
  userStatus?: string;
  isClassHead?: boolean;
  headOfClassIds?: string[];
  headOfClasses?: Array<{ id: string; name: string; section: string; fullName: string; gradeLevel: number }>;
  headOfClassNames?: string[];
  assignedClassIds?: string[];
  assignedSubjectIds?: string[];
  assignedClasses: string[];
  assignedSubjects: string[];
  assignedSubjectDetails?: Array<{
    id: string;
    name: string;
    code: string;
    department: string;
  }>;
  createdAt: string;
}

const DEPARTMENTS = [
  { id: "all", name: "All Faculty" },
  { id: "Mathematics", name: "Mathematics" },
  { id: "Physics & Chemistry", name: "Sciences" },
  { id: "English & Literature", name: "English" },
  { id: "Urdu & Islamic Studies", name: "Urdu & Islam" },
  { id: "Computer Science", name: "Computer Sci" },
  { id: "Cambridge", name: "Cambridge Wing" },
];

const SPECIALIZATION_SUGGESTIONS = [
  "Mathematics & Higher Algebra",
  "Physics (Matric & Intermediate)",
  "Chemistry & Organic Lab",
  "Biology & Zoology",
  "Computer Science & Programming",
  "English Language & Literature",
  "Urdu & Classical Poetry",
  "Islamic Studies & Ethics",
  "Pakistan Studies & History",
  "Commerce, Accounting & Finance",
  "Early Childhood & Montessori Education",
  "Cambridge O & A-Levels Specialist",
];

export default function PrincipalTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([]);
  const [allClasses, setAllClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | "head" | "specialist">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Visibility state for passwords (keyed by teacher ID)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Modal States
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherData | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherData | null>(null);
  const [dossierTab, setDossierTab] = useState<"overview" | "students">("overview");
  const [submitting, setSubmitting] = useState(false);

  // Student roster state inside dossier
  const [teacherStudents, setTeacherStudents] = useState<StudentInTeacherRoster[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Form State
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("Teacher2026!");
  const [formSpecialization, setFormSpecialization] = useState("Mathematics");
  const [formQualification, setFormQualification] = useState("M.Sc Mathematics");
  const [formExperience, setFormExperience] = useState("4");
  const [formPhone, setFormPhone] = useState("+92 300 9876543");
  const [formAssignedSubjectIds, setFormAssignedSubjectIds] = useState<string[]>([]);
  const [formAssignedClassIds, setFormAssignedClassIds] = useState<string[]>([]);
  const [formHeadOfClassIds, setFormHeadOfClassIds] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<"active" | "on_leave" | "suspended" | "terminated">("active");

  const generateUniqueEmployeeID = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormEmployeeId(`TCH-${year}-${randomNum}`);
  };

  const handleOpenOnboardModal = () => {
    setEditingTeacher(null);
    generateUniqueEmployeeID();
    setFormName("");
    setFormEmail("");
    setFormPassword("Teacher2026!");
    setFormSpecialization("Mathematics & Higher Algebra");
    setFormQualification("M.Sc Mathematics");
    setFormExperience("4");
    setFormPhone("+92 300 9876543");
    setFormAssignedSubjectIds([]);
    setFormAssignedClassIds([]);
    setFormHeadOfClassIds([]);
    setFormStatus("active");
    setOnboardModalOpen(true);
  };

  const handleOpenEditModal = (t: TeacherData) => {
    setEditingTeacher(t);
    setFormEmployeeId(t.employeeId);
    setFormName(t.name);
    setFormEmail(t.email);
    setFormPassword(t.rawPassword || "Teacher2026!");
    setFormSpecialization(t.specialization);
    setFormQualification(t.qualification);
    setFormExperience(String(t.experienceYears || 1));
    setFormPhone(t.phone || "");
    setFormAssignedSubjectIds(t.assignedSubjectIds || []);
    setFormAssignedClassIds(t.assignedClassIds || []);
    setFormHeadOfClassIds(t.headOfClassIds || []);
    setFormStatus(t.status || "active");
    setOnboardModalOpen(true);
  };

  const fetchTeachers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/teachers", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.teachers) {
        setTeachers(data.data.teachers);
      }
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      toast.error("Error loading faculty records.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchSubjectsAndClasses = async () => {
    try {
      const [subjRes, classRes] = await Promise.all([
        fetch("/api/subjects", { cache: "no-store" }),
        fetch("/api/classes", { cache: "no-store" }),
      ]);
      const subjData = await subjRes.json();
      const classData = await classRes.json();

      if (subjData.success && subjData.data?.subjects) {
        setAllSubjects(
          subjData.data.subjects.map((s: any) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            department: s.department,
          }))
        );
      }

      if (classData.success && classData.data?.classes) {
        setAllClasses(
          classData.data.classes.map((c: any) => ({
            id: c.id,
            name: c.name,
            section: c.section,
            fullName: c.fullName,
            gradeLevel: c.gradeLevel,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load options:", err);
    }
  };

  const fetchStudentsForTeacher = async (teacherId: string) => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/teachers/${teacherId}/students`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.students) {
        setTeacherStudents(data.data.students);
      } else {
        setTeacherStudents([]);
      }
    } catch (err) {
      console.error("Failed to fetch teacher's students:", err);
      setTeacherStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjectsAndClasses();
  }, []);

  const handleOpenDossier = (t: TeacherData, tab: "overview" | "students" = "overview") => {
    setSelectedTeacher(t);
    setDossierTab(tab);
    setStudentSearchQuery("");
    fetchStudentsForTeacher(t.id);
  };

  const togglePasswordVisibility = (teacherId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`, {
      description: text,
    });
  };

  // Filter teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assignedSubjects || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.assignedClasses || []).some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.headOfClassNames || []).some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept =
      selectedDept === "all" || t.specialization.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;
    const matchesRole =
      selectedRoleFilter === "all" ||
      (selectedRoleFilter === "head" && t.isClassHead) ||
      (selectedRoleFilter === "specialist" && !t.isClassHead);

    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  });

  // Summary Metrics
  const totalFaculty = teachers.length;
  const activeCount = teachers.filter((t) => t.status === "active").length;
  const classHeadCount = teachers.filter((t) => t.isClassHead).length;
  const onLeaveCount = teachers.filter((t) => t.status === "on_leave" || t.status === "suspended").length;
  const specialistCount = teachers.filter((t) => !t.isClassHead).length;

  const toggleSubjectAssignment = (subjId: string) => {
    setFormAssignedSubjectIds((prev) =>
      prev.includes(subjId) ? prev.filter((id) => id !== subjId) : [...prev, subjId]
    );
  };

  const toggleClassAssignment = (classId: string) => {
    setFormAssignedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const toggleHeadOfClassAssignment = (classId: string) => {
    setFormHeadOfClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let res;
      if (editingTeacher) {
        res = await fetch(`/api/teachers/${editingTeacher.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            phone: formPhone,
            password: formPassword,
            status: formStatus,
            specialization: formSpecialization,
            qualification: formQualification,
            experienceYears: Number(formExperience),
            assignedSubjectIds: formAssignedSubjectIds,
            assignedClassIds: formAssignedClassIds,
            headOfClassIds: formHeadOfClassIds,
          }),
        });
      } else {
        res = await fetch("/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            password: formPassword,
            employeeId: formEmployeeId,
            specialization: formSpecialization,
            qualification: formQualification,
            experienceYears: Number(formExperience),
            phone: formPhone,
            assignedSubjectIds: formAssignedSubjectIds,
            assignedClassIds: formAssignedClassIds,
            headOfClassIds: formHeadOfClassIds,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save faculty record.");
      }

      toast.success(editingTeacher ? "Faculty Profile Updated!" : "Faculty Member Onboarded!", {
        description: `${formName} credentials, status, and teaching allocations saved.`,
      });

      setOnboardModalOpen(false);
      setEditingTeacher(null);
      fetchTeachers(true);
    } catch (err: any) {
      toast.error("Operation Failed", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (t: TeacherData, newStatus: "active" | "on_leave" | "suspended" | "terminated") => {
    // Optimistic UI update
    setTeachers((prev) =>
      prev.map((item) => (item.id === t.id ? { ...item, status: newStatus } : item))
    );
    if (selectedTeacher && selectedTeacher.id === t.id) {
      setSelectedTeacher({ ...selectedTeacher, status: newStatus });
    }

    try {
      const res = await fetch(`/api/teachers/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message);

      toast.success(`Status updated for ${t.name}`, {
        description: `Faculty account status is now '${newStatus.replace("_", " ").toUpperCase()}'.`,
      });
      fetchTeachers(true);
    } catch (err: any) {
      toast.error("Status Update Failed", { description: err.message });
      fetchTeachers(true);
    }
  };

  const handleDeleteTeacher = (t: TeacherData) => {
    setTeacherToDelete(t);
  };

  const handleConfirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    const t = teacherToDelete;

    // Optimistic UI update
    setTeachers((prev) => prev.filter((item) => item.id !== t.id));
    if (selectedTeacher?.id === t.id) {
      setSelectedTeacher(null);
    }

    try {
      const res = await fetch(`/api/teachers/${t.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message);

      toast.success("Faculty Record Removed", {
        description: `${t.name} was successfully removed from Seneca directory.`,
      });
      fetchTeachers(true);
    } catch (err: any) {
      toast.error("Action Failed", { description: err.message });
      fetchTeachers(true);
    }
  };

  const handleExportCSV = () => {
    if (teachers.length === 0) return toast.info("No faculty records to export.");
    const headers = "Employee ID,Teacher Name,Email,Portal Password,Phone,Specialization,Qualification,Status,Head of Class,Assigned Subjects,Assigned Classes\n";
    const rows = teachers
      .map(
        (t) =>
          `"${t.employeeId}","${t.name}","${t.email}","${t.rawPassword || "Teacher2026!"}","${t.phone}","${t.specialization}","${t.qualification}","${t.status}","${(t.headOfClassNames || []).join(" | ") || "None"}","${(t.assignedSubjects || []).join(" | ")}","${(t.assignedClasses || []).join(" | ")}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Seneca_Faculty_Credentials_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Faculty roster and credentials exported to CSV!");
  };

  const filteredStudentRoster = teacherStudents.filter((s) => {
    const q = studentSearchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q) ||
      s.parentName.toLowerCase().includes(q) ||
      s.parentPhone.includes(q)
    );
  });

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Page Header & Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <ShieldCheck className="h-3 w-3" />
                <span>Admin Faculty & Credentials Control</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-seneca-amber-light text-[10px] sm:text-[11px] font-bold border border-amber-500/30">
                <Crown className="h-3 w-3 text-seneca-amber" />
                <span>{classHeadCount} Designated Class Heads</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Faculty & Specialist <span className="text-seneca-amber">Teacher Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              View teacher credentials (email & password), change account status, inspect assigned student cohorts, and appoint <strong>Head of Class</strong> leaders authorized to take classroom attendance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 h-10 bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export Roster & Passwords</span>
            </Button>

            <Button
              onClick={handleOpenOnboardModal}
              variant="glow"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 h-10 shadow-lg shadow-seneca-amber/25"
            >
              <UserPlus className="h-4 w-4 text-seneca-amber-light" />
              <span>Onboard Faculty Member</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-sm rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Faculty
            </span>
            <Users className="h-4 w-4 text-seneca-crimson" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-heading">
            {totalFaculty} <span className="text-xs font-medium text-muted-foreground">Teachers</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
            <span>Active:</span>
            <span className="font-bold text-emerald-600">{activeCount} In Service</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-sm rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Head of Class (Class Heads)
            </span>
            <Crown className="h-4 w-4 text-seneca-amber" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-seneca-amber font-heading">
            {classHeadCount} <span className="text-xs font-medium text-muted-foreground">In-Charge</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
            <span>Privilege:</span>
            <span className="font-bold text-foreground">Attendance Authorized</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-sm rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              On Leave / Suspended
            </span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-heading">
            {onLeaveCount} <span className="text-xs font-medium text-muted-foreground">Staff</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
            <span>Status Control:</span>
            <span className="font-bold text-foreground">Switch Anytime</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-sm rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Subject Specialists
            </span>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-heading">
            {specialistCount} <span className="text-xs font-medium text-muted-foreground">Specialists</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
            <span>Pedagogical Core:</span>
            <span className="font-bold text-purple-600">All Wings</span>
          </div>
        </Card>
      </div>

      {/* 3. Filter Toolbar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-sm rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search teacher, email, class, employee ID..."
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
            {/* Role Filter */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
              className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none"
            >
              <option value="all">All Designations</option>
              <option value="head">👑 Class Heads Only</option>
              <option value="specialist">Subject Specialists</option>
            </select>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
            </select>

            <Button
              onClick={() => fetchTeachers()}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shrink-0"
              title="Refresh Roster"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>

            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border shrink-0">
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
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Faculty Directory Display */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
          <p className="text-xs font-bold text-muted-foreground">Loading Seneca Faculty & Credentials Directory...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-4">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">No Faculty Records Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No teachers match your search query or selected filters.
            </p>
          </div>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedDept("all");
              setSelectedStatus("all");
              setSelectedRoleFilter("all");
            }}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold"
          >
            Clear Filters
          </Button>
        </Card>
      ) : viewMode === "table" ? (
        /* ========================================================================= */
        /* TABLE VIEW WITH CREDENTIALS, STATUS CHANGER & CLASS HEAD BADGES           */
        /* ========================================================================= */
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">Faculty & Credentials</th>
                  <th className="py-3.5 px-4">Portal Password</th>
                  <th className="py-3.5 px-4">Designation & Role</th>
                  <th className="py-3.5 px-4">Teaching Allocations</th>
                  <th className="py-3.5 px-4">Status & Control</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTeachers.map((t) => {
                  const initials = t.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const isPasswordRevealed = revealedPasswords[t.id] || false;
                  const passwordText = t.rawPassword || "Teacher2026!";

                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Teacher Identity & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-seneca-amber to-seneca-crimson text-white flex items-center justify-center font-bold text-[11px] shadow-sm shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground hover:text-seneca-amber cursor-pointer" onClick={() => handleOpenDossier(t, "overview")}>
                                {t.name}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {t.employeeId}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-0.5">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono">{t.email}</span>
                              <button
                                onClick={() => copyToClipboard(t.email, "Email")}
                                className="p-0.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Copy Email"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Portal Password (Admin Can View & Copy) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 bg-muted/50 border border-border/80 px-2.5 py-1.5 rounded-xl w-fit">
                          <KeyRound className="h-3.5 w-3.5 text-seneca-amber shrink-0" />
                          <span className="font-mono font-bold text-xs tracking-wider text-foreground">
                            {isPasswordRevealed ? passwordText : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(t.id)}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
                            title={isPasswordRevealed ? "Hide Password" : "Show Password"}
                          >
                            {isPasswordRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(passwordText, "Password")}
                            className="p-1 rounded-md text-muted-foreground hover:text-seneca-amber hover:bg-muted transition-colors"
                            title="Copy Password"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Designation / Head of Class */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {t.isClassHead ? (
                            <Badge className="font-bold text-[10px] bg-amber-500/15 text-amber-700 dark:text-seneca-amber-light border-amber-500/30 gap-1">
                              <Crown className="h-3 w-3 text-seneca-amber" />
                              <span>Head of Class: {(t.headOfClassNames || []).join(", ") || "Assigned"}</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="font-medium text-[10px] text-muted-foreground border-border">
                              Subject Specialist
                            </Badge>
                          )}
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {t.specialization} • {t.qualification}
                          </div>
                        </div>
                      </td>

                      {/* Teaching Allocations & Students */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-[240px]">
                          {t.assignedSubjects && t.assignedSubjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {t.assignedSubjects.slice(0, 2).map((sub, i) => (
                                <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-seneca-crimson/10 text-seneca-crimson border border-seneca-crimson/20">
                                  {sub}
                                </span>
                              ))}
                              {t.assignedSubjects.length > 2 && (
                                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-muted text-muted-foreground">
                                  +{t.assignedSubjects.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">General</span>
                          )}

                          <button
                            onClick={() => handleOpenDossier(t, "students")}
                            className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Users className="h-3 w-3" />
                            <span>View Enrolled Students</span>
                          </button>
                        </div>
                      </td>

                      {/* Status Dropdown Switcher */}
                      <td className="py-3 px-4">
                        <select
                          value={t.status}
                          onChange={(e) => handleToggleStatus(t, e.target.value as any)}
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer transition-all",
                            t.status === "active" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                            t.status === "on_leave" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                            t.status === "suspended" && "bg-rose-500/10 text-rose-600 border-rose-500/30",
                            t.status === "terminated" && "bg-zinc-500/10 text-zinc-500 border-zinc-500/30"
                          )}
                        >
                          <option value="active">Active</option>
                          <option value="on_leave">On Leave</option>
                          <option value="suspended">Suspended</option>
                          <option value="terminated">Terminated</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/timetable?teacherId=${t.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 rounded-lg text-xs font-bold text-seneca-crimson hover:bg-seneca-crimson/10"
                              title="Set Teaching Timetable"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleOpenDossier(t, "overview")}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 rounded-lg text-xs font-bold"
                            title="View Dossier & Students"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                          </Button>
                          <Button
                            onClick={() => handleOpenEditModal(t)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 rounded-lg text-xs font-bold text-seneca-amber"
                            title="Edit Profile, Password & Head of Class"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteTeacher(t)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10"
                            title="Delete Teacher"
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
      ) : (
        /* ========================================================================= */
        /* GRID / CARD VIEW WITH CREDENTIALS & QUICK CONTROLS                        */
        /* ========================================================================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredTeachers.map((t) => {
            const initials = t.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const isPasswordRevealed = revealedPasswords[t.id] || false;
            const passwordText = t.rawPassword || "Teacher2026!";

            return (
              <Card
                key={t.id}
                className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl overflow-hidden hover:border-seneca-amber/50 transition-all space-y-3 p-4 sm:p-5 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top: Identity & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-seneca-amber to-seneca-crimson text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-seneca-amber transition-colors">
                          {t.name}
                        </h4>
                        <span className="font-mono text-[10px] text-muted-foreground">{t.employeeId}</span>
                      </div>
                    </div>

                    <select
                      value={t.status}
                      onChange={(e) => handleToggleStatus(t, e.target.value as any)}
                      className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-lg border focus:outline-none cursor-pointer",
                        t.status === "active" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                        t.status === "on_leave" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                        t.status === "suspended" && "bg-rose-500/10 text-rose-600 border-rose-500/30",
                        t.status === "terminated" && "bg-zinc-500/10 text-zinc-500 border-zinc-500/30"
                      )}
                    >
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="suspended">Suspended</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  {/* Head of Class Badge */}
                  {t.isClassHead ? (
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-1.5 text-xs">
                      <Crown className="h-3.5 w-3.5 text-seneca-amber shrink-0" />
                      <div className="min-w-0 text-[11px] font-bold text-amber-700 dark:text-seneca-amber-light truncate">
                        Head of Class: {(t.headOfClassNames || []).join(", ")}
                      </div>
                    </div>
                  ) : null}

                  {/* Credentials Box (Admin Direct View) */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>Email:</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-medium text-foreground truncate max-w-[140px]">{t.email}</span>
                        <button onClick={() => copyToClipboard(t.email, "Email")} className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <KeyRound className="h-3 w-3 text-seneca-amber" />
                        <span>Password:</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-foreground">
                          {isPasswordRevealed ? passwordText : "••••••••"}
                        </span>
                        <button onClick={() => togglePasswordVisibility(t.id)} className="text-muted-foreground hover:text-foreground">
                          {isPasswordRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button onClick={() => copyToClipboard(passwordText, "Password")} className="text-muted-foreground hover:text-seneca-amber">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expertise */}
                  <div className="text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Specialization:</span>
                      <span className="font-semibold text-foreground truncate max-w-[150px]">{t.specialization}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Assigned Classes:</span>
                      <span className="font-semibold text-foreground truncate max-w-[150px]">
                        {(t.assignedClasses || []).join(", ") || "General"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <Button
                    onClick={() => handleOpenDossier(t, "students")}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl text-xs font-bold gap-1"
                  >
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>View Students</span>
                  </Button>
                  <Link href={`/dashboard/timetable?teacherId=${t.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-seneca-crimson hover:bg-seneca-crimson/10"
                      title="Set Teaching Timetable"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleOpenEditModal(t)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-seneca-amber hover:bg-seneca-amber/10"
                    title="Edit Profile & Head of Class"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ONBOARD / EDIT TEACHER MODAL (WITH HEAD OF CLASS & PASSWORD CONTROLS)  */}
      {/* ========================================================================= */}
      <Dialog open={onboardModalOpen} onOpenChange={setOnboardModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-7 my-6 shadow-2xl border border-border/80">
          <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-amber uppercase tracking-wider">
              <Briefcase className="h-4 w-4" />
              <span>{editingTeacher ? "Edit Faculty Profile & Designations" : "Faculty Recruitment & Onboarding"}</span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-extrabold font-heading text-foreground">
              {editingTeacher ? `Edit ${editingTeacher.name}` : "Onboard Faculty Specialist"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure credentials, status, Head of Class privileges, and teaching allocations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOnboardSubmit} className="space-y-5 pt-2">
            {/* Employee ID */}
            {!editingTeacher && (
              <div className="p-3.5 rounded-2xl bg-seneca-amber/10 border border-seneca-amber/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-seneca-amber uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="h-3.5 w-3.5" />
                    <span>Auto Faculty Employee ID</span>
                  </span>
                  <Button
                    type="button"
                    onClick={generateUniqueEmployeeID}
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
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  className="h-10 rounded-xl bg-background font-mono font-bold text-xs uppercase"
                />
              </div>
            )}

            {/* 1. Identity & Credentials */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                1. Faculty Identity & Credentials
              </span>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Teacher Full Name <span className="text-seneca-crimson">*</span>
                </label>
                <Input
                  required
                  type="text"
                  placeholder="e.g. Dr. Salman Khan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Institutional Email <span className="text-seneca-crimson">*</span>
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="teacher@seneca.edu.pk"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Portal Password {editingTeacher ? "(Reset or Leave Current)" : <span className="text-seneca-crimson">*</span>}
                  </label>
                  <div className="relative">
                    <Input
                      required={!editingTeacher}
                      type="text"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="h-11 rounded-xl text-xs font-mono font-bold pl-8"
                    />
                    <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-seneca-amber" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Phone / WhatsApp</label>
                  <Input
                    type="tel"
                    placeholder="+92 300 9876543"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-bold"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="on_leave">On Leave (Temporary)</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Head of Class (Class Teacher) Designation */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-seneca-amber" />
                  <span>👑 Head of Class Designation (Attendance Authorized)</span>
                </span>
                <span className="text-[10px] text-seneca-amber font-bold">
                  {formHeadOfClassIds.length} Classes Appointed
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Appointing a teacher as <strong>Head of Class</strong> authorizes them to take daily classroom attendance and oversee student progress. Non-head teachers cannot record student attendance.
              </p>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-background border border-border">
                {allClasses.map((cls) => {
                  const isHead = formHeadOfClassIds.includes(cls.id);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => toggleHeadOfClassAssignment(cls.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5",
                        isHead
                          ? "bg-seneca-amber text-zinc-950 border-seneca-amber shadow-sm"
                          : "bg-muted/40 text-foreground border-border hover:bg-muted"
                      )}
                    >
                      <Crown className={cn("h-3 w-3", isHead ? "text-zinc-950" : "text-muted-foreground")} />
                      <span>{cls.fullName}</span>
                      {isHead && <Check className="h-3 w-3 text-zinc-950" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Specialization & Qualification */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                3. Subject Expertise & Qualifications
              </span>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Subject Specialization <span className="text-seneca-crimson">*</span>
                </label>
                <Input
                  required
                  type="text"
                  placeholder="e.g. Physics (Matric & Intermediate)"
                  value={formSpecialization}
                  onChange={(e) => setFormSpecialization(e.target.value)}
                  className="h-11 rounded-xl text-xs font-bold"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SPECIALIZATION_SUGGESTIONS.slice(0, 5).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setFormSpecialization(sug)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground border border-border"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Qualification</label>
                  <Input
                    type="text"
                    value={formQualification}
                    onChange={(e) => setFormQualification(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Experience (Years)</label>
                  <Input
                    type="number"
                    min={0}
                    value={formExperience}
                    onChange={(e) => setFormExperience(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 4. Multi-Subject & Multi-Grade Allocation */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                4. Teaching Allocations (Subjects & Classes)
              </span>

              {/* Select Subjects */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Assigned Subjects ({formAssignedSubjectIds.length} Selected)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-background border border-border">
                  {allSubjects.map((sub) => {
                    const isSelected = formAssignedSubjectIds.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleSubjectAssignment(sub.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5",
                          isSelected
                            ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs"
                            : "bg-muted/40 text-foreground border-border hover:bg-muted"
                        )}
                      >
                        <span>{sub.name}</span>
                        <span className="text-[9px] font-mono opacity-80 font-normal">({sub.code})</span>
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Classes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Assigned Classes ({formAssignedClassIds.length} Selected)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-background border border-border">
                  {allClasses.map((cls) => {
                    const isSelected = formAssignedClassIds.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClassAssignment(cls.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5",
                          isSelected
                            ? "bg-seneca-amber text-black border-seneca-amber shadow-xs"
                            : "bg-muted/40 text-foreground border-border hover:bg-muted"
                        )}
                      >
                        <span>{cls.fullName}</span>
                        {isSelected && <Check className="h-3 w-3 text-black" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/60 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOnboardModalOpen(false)}
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
                    <span>Saving Faculty Member...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>{editingTeacher ? "Update Faculty Profile" : "Onboard & Create Account"}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 6. COMPREHENSIVE FACULTY DOSSIER & STUDENT ROSTER MODAL                   */}
      {/* ========================================================================= */}
      {selectedTeacher && (
        <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 my-6 shadow-2xl border border-border/80">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-seneca-amber to-seneca-crimson text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
                    {selectedTeacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-base sm:text-lg font-bold">{selectedTeacher.name}</DialogTitle>
                      {selectedTeacher.isClassHead && (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-seneca-amber-light text-[10px] font-bold border-amber-500/30 gap-1">
                          <Crown className="h-3 w-3 text-seneca-amber" />
                          <span>Class Head</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{selectedTeacher.employeeId} • {selectedTeacher.specialization}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border shrink-0">
                  <button
                    onClick={() => setDossierTab("overview")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                      dossierTab === "overview"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Credentials & Overview</span>
                  </button>
                  <button
                    onClick={() => setDossierTab("students")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                      dossierTab === "students"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Enrolled Students ({teacherStudents.length})</span>
                  </button>
                </div>
              </div>
            </DialogHeader>

            {dossierTab === "overview" ? (
              /* TAB 1: CREDENTIALS & PROFILE OVERVIEW */
              <div className="space-y-4 text-xs">
                {/* Credentials Banner */}
                <div className="p-4 rounded-2xl bg-seneca-amber/10 border border-seneca-amber/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-seneca-amber uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4" />
                      <span>LMS Portal Credentials</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold bg-background">
                      Status: {selectedTeacher.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Email Address</span>
                        <span className="font-mono font-bold text-foreground text-xs">{selectedTeacher.email}</span>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(selectedTeacher.email, "Email")}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Portal Password</span>
                        <span className="font-mono font-bold text-foreground text-xs">
                          {revealedPasswords[selectedTeacher.id] ? (selectedTeacher.rawPassword || "Teacher2026!") : "••••••••••••"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => togglePasswordVisibility(selectedTeacher.id)}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                        >
                          {revealedPasswords[selectedTeacher.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          onClick={() => copyToClipboard(selectedTeacher.rawPassword || "Teacher2026!", "Password")}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-seneca-amber"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Switcher Banner */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-foreground block">Change Faculty Account Status</span>
                    <span className="text-[10px] text-muted-foreground">Sets active state and portal login privileges.</span>
                  </div>
                  <select
                    value={selectedTeacher.status}
                    onChange={(e) => handleToggleStatus(selectedTeacher, e.target.value as any)}
                    className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>

                {/* Head of Class & Teaching Allocations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                      <Crown className="h-3.5 w-3.5 text-seneca-amber" />
                      <span>Head of Class Authority</span>
                    </span>
                    {selectedTeacher.isClassHead ? (
                      <div className="space-y-1 pt-1">
                        <Badge className="bg-seneca-amber text-zinc-950 font-bold text-xs">
                          👑 Class Head: {(selectedTeacher.headOfClassNames || []).join(", ")}
                        </Badge>
                        <p className="text-[10px] text-emerald-600 font-semibold">✓ Authorized to record daily classroom attendance.</p>
                      </div>
                    ) : (
                      <div className="space-y-1 pt-1">
                        <span className="text-muted-foreground italic text-xs block">Not designated as Head of Class.</span>
                        <p className="text-[10px] text-muted-foreground">Attendance recording is locked for subject specialists.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Faculty Record &amp; Contact
                    </span>
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Status:</span>
                        <span className="font-bold capitalize text-foreground">{selectedTeacher.status.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contact Phone:</span>
                        <span className="font-bold text-foreground">{selectedTeacher.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Subjects & Classes */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Assigned Teaching Workload
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1">Subjects:</span>
                      <div className="flex flex-wrap gap-1">
                        {(selectedTeacher.assignedSubjects || []).map((sub, i) => (
                          <Badge key={i} variant="outline" className="bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/20 text-[10px] font-bold">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1">Teaching Classes:</span>
                      <div className="flex flex-wrap gap-1">
                        {(selectedTeacher.assignedClasses || []).map((cls, i) => (
                          <Badge key={i} variant="outline" className="bg-background text-foreground text-[10px] font-bold">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: ENROLLED STUDENTS ROSTER */
              <div className="space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search students in teacher's classes..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="pl-8 h-9 rounded-xl bg-background text-xs"
                    />
                  </div>

                  <span className="text-[11px] text-muted-foreground font-semibold px-2">
                    {filteredStudentRoster.length} Students Enrolled
                  </span>
                </div>

                {loadingStudents ? (
                  <div className="p-12 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-seneca-crimson" />
                    <p className="text-xs text-muted-foreground font-bold">Loading Student Roster...</p>
                  </div>
                ) : filteredStudentRoster.length === 0 ? (
                  <div className="p-8 text-center bg-muted/30 rounded-2xl space-y-1">
                    <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="font-bold text-foreground text-xs">No Students Found</p>
                    <p className="text-[10px] text-muted-foreground">No students matched the query in this teacher's assigned classes.</p>
                  </div>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                    {filteredStudentRoster.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl bg-card border border-border/80 hover:border-seneca-amber/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="bg-seneca-crimson text-white font-bold text-xs">
                              {s.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground">{s.name}</span>
                              {s.isHeadClass && (
                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-seneca-amber-light text-[9px] font-bold border-amber-500/30 px-1 py-0">
                                  👑 Head Class
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {s.rollNumber} • {s.className} (Sec {s.section})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground block">Guardian: {s.parentName}</span>
                            <span className="font-mono text-[10px] text-foreground">{s.parentPhone}</span>
                          </div>
                          <div className="text-right pl-2 border-l border-border/60">
                            <span className="text-[10px] text-muted-foreground block">Attendance</span>
                            <span className={cn(
                              "font-bold font-mono",
                              s.attendanceRate >= 90 ? "text-emerald-600" : s.attendanceRate >= 80 ? "text-seneca-amber" : "text-rose-600"
                            )}>
                              {s.attendanceRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="pt-2 border-t border-border/60 gap-2">
              <Button
                onClick={() => {
                  const target = selectedTeacher;
                  setSelectedTeacher(null);
                  handleOpenEditModal(target);
                }}
                variant="outline"
                className="flex-1 rounded-xl text-xs font-bold text-seneca-amber gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Profile & Credentials</span>
              </Button>
              <Button
                onClick={() => setSelectedTeacher(null)}
                variant="outline"
                className="rounded-xl text-xs font-bold"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!teacherToDelete}
        onOpenChange={(open) => !open && setTeacherToDelete(null)}
        title="Remove Faculty Member?"
        description={`Are you sure you want to permanently remove '${teacherToDelete?.name}' from the Seneca faculty roster? This will unassign all their courses.`}
        confirmText="Yes, Remove Faculty"
        variant="destructive"
        icon="trash"
        onConfirm={handleConfirmDeleteTeacher}
      />
    </div>
  );
}
