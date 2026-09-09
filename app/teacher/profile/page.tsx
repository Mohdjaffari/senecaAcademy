"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  GraduationCap,
  Briefcase,
  Clock,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
  Loader2,
  Building,
  Key,
  Users,
  Layers,
  Trash2,
  ChevronRight,
  School,
  IdCard,
  Check,
  Eye,
  EyeOff,
  CalendarDays,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssignedClass {
  _id: string;
  name: string;
  section: string;
  gradeLevel: number;
  stream: string;
  capacity: number;
  roomNumber?: string;
  studentCount: number;
}

interface AssignedSubject {
  _id: string;
  name: string;
  code: string;
  department: string;
  creditHours: number;
  description?: string;
}

interface HeadOfClass {
  _id: string;
  name: string;
  section: string;
  gradeLevel: number;
  stream: string;
}

interface TimetableSlot {
  _id: string;
  day: string;
  period: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  time: string;
  className: string;
  classId?: string;
  subject: string;
  subjectCode?: string;
  room: string;
  notes?: string;
}

interface TeacherProfileData {
  _id: string;
  employeeId: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  status: string;
  joinDate: string;
  assignedClasses: AssignedClass[];
  assignedSubjects: AssignedSubject[];
  headOfClasses: HeadOfClass[];
  timetable: TimetableSlot[];
}

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string;
  joinedDate: string;
}

const DAYS_OF_WEEK = ["All Days", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"dossier" | "classes" | "timetable" | "security">("dossier");
  const [selectedDay, setSelectedDay] = useState<string>("All Days");

  // Raw fetched data
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherProfileData | null>(null);

  // Editable Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | string>("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.data) {
        const u: UserProfileData = data.data.user;
        const t: TeacherProfileData = data.data.teacher;

        setUserData(u);
        setTeacherData(t);

        if (u) {
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setAvatarUrl(u.avatarUrl || "");
        }

        if (t) {
          setQualification(t.qualification || "");
          setSpecialization(t.specialization || "");
          setExperienceYears(t.experienceYears !== undefined ? t.experienceYears : "");
        }
      } else {
        toast.error(data.error?.message || "Failed to load faculty profile data.");
      }
    } catch (err: any) {
      toast.error("Error connecting to server for profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    if (newPassword && newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }

    if (newPassword && !currentPassword) {
      return toast.error("Current password is required to update password.");
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl || "",
        qualification: qualification.trim(),
        specialization: specialization.trim(),
        experienceYears: experienceYears !== "" ? Number(experienceYears) : 0,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update profile.");
      }

      // Broadcast avatar update across topbar and sidebar in real-time
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("seneca_avatar_changed", { detail: { avatarUrl } })
        );
      }

      toast.success("Teacher Profile Updated!", {
        description: "Your official faculty credentials and contact preferences are synchronized with the database.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    toast.info("Profile photo reset. Click 'Save Profile' to apply changes.");
  };

  // Filter timetable by selected day
  const filteredTimetable = (teacherData?.timetable || []).filter((slot) => {
    if (selectedDay === "All Days") return true;
    return slot.day.toLowerCase() === selectedDay.toLowerCase();
  });

  // Calculate total students taught
  const totalStudentsTaught = (teacherData?.assignedClasses || []).reduce(
    (acc, curr) => acc + (curr.studentCount || 0),
    0
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full max-w-7xl mx-auto overflow-x-hidden px-1 sm:px-2">
      {/* 1. Hero Faculty Dossier Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-6 md:p-8 text-white shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-rose-600/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
            {/* Interactive Avatar Preview */}
            <div className="relative shrink-0 self-start sm:self-center">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-3 sm:border-4 border-seneca-amber shadow-2xl ring-4 ring-black/30">
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-seneca-amber to-amber-600 text-zinc-950 font-extrabold text-2xl sm:text-3xl">
                  {name ? name.charAt(0).toUpperCase() : "T"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 rounded-full bg-emerald-500 text-zinc-950 border-2 border-zinc-950 shadow-md">
                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              {/* Badge Pills */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                  <Award className="h-3 w-3 text-seneca-amber" />
                  <span>{teacherData?.employeeId || "Faculty Member"}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{teacherData?.status === "active" ? "Active Faculty" : teacherData?.status || "Active"}</span>
                </span>

                {teacherData?.headOfClasses && teacherData.headOfClasses.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] sm:text-[11px] font-bold border border-amber-400/30">
                    <Sparkles className="h-3 w-3 text-seneca-amber" />
                    <span>Class Teacher ({teacherData.headOfClasses.map(c => `${c.name} ${c.section}`).join(", ")})</span>
                  </span>
                )}
              </div>

              {/* Faculty Name & Department */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading tracking-tight text-white truncate">
                {name || (loading ? "Loading Faculty..." : "Faculty Profile")}
              </h1>

              <p className="text-xs sm:text-sm text-white/85 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{specialization || "Academic Teaching Faculty"}</span>
                {qualification && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="text-seneca-amber-light font-normal text-xs">{qualification}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 pt-2 md:pt-0 shrink-0">
            <Button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={saving || loading}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto h-10 px-5 justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block">Assigned Books</span>
            <span className="text-base sm:text-lg font-bold text-seneca-amber">
              {teacherData?.assignedSubjects?.length || 0} Subjects
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block">Active Classes</span>
            <span className="text-base sm:text-lg font-bold text-white">
              {teacherData?.assignedClasses?.length || 0} Sections
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block">Enrolled Students</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400">
              {totalStudentsTaught} Students
            </span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block">Weekly Periods</span>
            <span className="text-base sm:text-lg font-bold text-sky-400">
              {teacherData?.timetable?.length || 0} Slots
            </span>
          </div>
        </div>
      </div>

      {/* 2. Responsive Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-muted/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-border/80 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("dossier")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px]",
            activeTab === "dossier"
              ? "bg-card text-foreground shadow-sm border border-border/80 font-extrabold text-seneca-crimson dark:text-seneca-amber"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          <IdCard className="h-3.5 w-3.5" />
          <span>Faculty Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab("classes")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px]",
            activeTab === "classes"
              ? "bg-card text-foreground shadow-sm border border-border/80 font-extrabold text-seneca-crimson dark:text-seneca-amber"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Assigned Books & Classes</span>
          <Badge variant="outline" className="text-[9px] h-4 px-1 ml-0.5 bg-muted">
            {(teacherData?.assignedSubjects?.length || 0) + (teacherData?.assignedClasses?.length || 0)}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("timetable")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px]",
            activeTab === "timetable"
              ? "bg-card text-foreground shadow-sm border border-border/80 font-extrabold text-seneca-crimson dark:text-seneca-amber"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Weekly Timetable</span>
          <Badge variant="outline" className="text-[9px] h-4 px-1 ml-0.5 bg-muted">
            {teacherData?.timetable?.length || 0}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px]",
            activeTab === "security"
              ? "bg-card text-foreground shadow-sm border border-border/80 font-extrabold text-seneca-crimson dark:text-seneca-amber"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* 3. Main Dynamic Content Workspaces */}
      {loading ? (
        <Card className="border border-border/80 p-12 sm:p-16 flex flex-col items-center justify-center space-y-3 text-center bg-card/95 backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber" />
          <p className="text-xs font-bold text-muted-foreground">Retrieving Faculty Records from Database...</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: FACULTY CREDENTIALS & PERSONAL DETAILS */}
          {activeTab === "dossier" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* Left Column: Photo Uploader & Institutional ID */}
              <div className="lg:col-span-5 space-y-5">
                {/* Profile Photo Uploader Card */}
                <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-seneca-crimson" />
                      <h3 className="text-xs sm:text-sm font-bold font-heading text-foreground uppercase tracking-wider">
                        Profile Photograph
                      </h3>
                    </div>
                    {avatarUrl && (
                      <Button
                        type="button"
                        onClick={handleRemoveAvatar}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-border/60 text-center">
                      <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-xl mb-2">
                        <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-seneca-amber to-amber-600 text-zinc-950 font-extrabold text-3xl">
                          {name ? name.charAt(0).toUpperCase() : "T"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-foreground">
                        {avatarUrl ? "Current Active Photo" : "Default Initials Avatar"}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        Synchronized across Faculty Portal, Class Gazettes, and Topbar.
                      </span>
                    </div>

                    <ImageUpload
                      value={avatarUrl}
                      onChange={(url) => setAvatarUrl(url)}
                      label="Upload or Select New Faculty Photo"
                      aspectRatio="square"
                    />
                  </div>
                </Card>

                {/* Faculty Institutional ID Summary */}
                <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                    <IdCard className="h-4 w-4 text-seneca-crimson" />
                    <h3 className="text-xs sm:text-sm font-bold font-heading text-foreground uppercase tracking-wider">
                      Faculty Designation
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground font-medium">Employee Code</span>
                      <Badge variant="outline" className="font-mono font-bold text-seneca-crimson dark:text-seneca-amber text-xs">
                        {teacherData?.employeeId || "FAC-2026"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground font-medium">Faculty Role</span>
                      <span className="font-bold text-foreground">Academic Instructor</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground font-medium">Class Teacher Responsibility</span>
                      <span className="font-bold text-foreground">
                        {teacherData?.headOfClasses && teacherData.headOfClasses.length > 0
                          ? `Yes (${teacherData.headOfClasses.map(c => `${c.name} ${c.section}`).join(", ")})`
                          : "No (Subject Specialist)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground font-medium">Institutional Email</span>
                      <span className="font-mono text-muted-foreground text-[11px] truncate max-w-[180px]">
                        {email || "N/A"}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Faculty Editable Details Form */}
              <div className="lg:col-span-7 space-y-5">
                <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-seneca-crimson" />
                      <div>
                        <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                          Faculty Identity & Profile
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Official educational records and communication preferences.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Full Name *</label>
                        <Input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="e.g. Ms. Sarah Ahmed"
                          className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Official Email</label>
                        <Input
                          type="email"
                          value={email}
                          disabled
                          className="h-10 sm:h-11 rounded-xl bg-muted/60 text-xs font-mono text-muted-foreground cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Contact Phone</label>
                        <Input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +92 300 1234567"
                          className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Academic Experience (Years)</label>
                        <Input
                          type="number"
                          min="0"
                          max="60"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="e.g. 8"
                          className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Specialization / Department Focus</label>
                      <Input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Cambridge O-Level & A-Level Physics Specialist"
                        className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Degrees & Certifications</label>
                      <Input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="e.g. M.Sc. Applied Physics • Cambridge CIDTT Certified"
                        className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                      />
                    </div>

                    {/* Action Footer */}
                    <div className="pt-3 border-t border-border/60 flex items-center justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        variant="glow"
                        className="rounded-xl font-bold text-xs gap-1.5 h-10 px-6"
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        <span>Save Faculty Profile</span>
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED TEACHING BOOKS & CLASSES */}
          {activeTab === "classes" && (
            <div className="space-y-6">
              {/* Teaching Books Section */}
              <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-seneca-crimson" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                        Assigned Teaching Books & Curriculum Subjects
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Official academic courses and textbooks assigned to your faculty profile in the LMS.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold self-start sm:self-center">
                    {teacherData?.assignedSubjects?.length || 0} Teaching Subjects
                  </Badge>
                </div>

                {!teacherData?.assignedSubjects || teacherData.assignedSubjects.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border/80">
                    <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs font-bold text-foreground">No subjects currently assigned.</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Contact administration to link academic subjects to your profile.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {teacherData.assignedSubjects.map((subj) => (
                      <div
                        key={subj._id}
                        className="p-4 rounded-2xl bg-muted/30 border border-border/70 hover:border-seneca-amber/40 transition-all space-y-2 relative overflow-hidden group shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-seneca-amber block truncate">
                              {subj.department || "General"}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber transition-colors">
                              {subj.name}
                            </h4>
                          </div>
                          <Badge variant="outline" className="font-mono text-[9px] bg-background font-bold shrink-0">
                            {subj.code}
                          </Badge>
                        </div>

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Credits: {subj.creditHours || 3} hrs/wk</span>
                          <span className="text-emerald-500 font-bold flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Active Course
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Assigned Classes Section */}
              <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <School className="h-5 w-5 text-seneca-amber" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                        Assigned Classes & Sections Roster
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Class sections where you conduct teaching lectures, assignments, and exam grading.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold self-start sm:self-center">
                    {teacherData?.assignedClasses?.length || 0} Class Sections
                  </Badge>
                </div>

                {!teacherData?.assignedClasses || teacherData.assignedClasses.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border/80">
                    <School className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs font-bold text-foreground">No classes currently assigned.</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Your assigned classes will appear here once configured by the principal.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {teacherData.assignedClasses.map((cls) => {
                      const isClassTeacher = (teacherData.headOfClasses || []).some(
                        (h) => h._id === cls._id
                      );

                      return (
                        <div
                          key={cls._id}
                          className={cn(
                            "p-4 rounded-2xl border transition-all space-y-2 relative overflow-hidden shadow-sm",
                            isClassTeacher
                              ? "bg-amber-500/5 border-amber-400/40 shadow-amber-500/5"
                              : "bg-muted/30 border-border/70 hover:border-border"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-xs sm:text-sm text-foreground">
                                  {cls.name}
                                </h4>
                                <Badge className="text-[9px] font-bold bg-seneca-crimson text-white px-1.5 py-0 h-4">
                                  Sec {cls.section}
                                </Badge>
                              </div>
                              <span className="text-[10px] text-muted-foreground block mt-0.5">
                                Stream: {cls.stream || "General"} {cls.roomNumber ? `• ${cls.roomNumber}` : ""}
                              </span>
                            </div>

                            <Badge variant="outline" className="text-[10px] font-bold bg-background text-foreground shrink-0">
                              {cls.studentCount} Students
                            </Badge>
                          </div>

                          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                            {isClassTeacher ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 dark:text-amber-400">
                                <Sparkles className="h-3 w-3" /> Designated Class Teacher
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Subject Teacher</span>
                            )}
                            <span className="text-[10px] text-muted-foreground font-mono">
                              Grade {cls.gradeLevel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 3: WEEKLY TEACHING TIMETABLE */}
          {activeTab === "timetable" && (
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-seneca-amber" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                      Weekly Teaching Timetable Schedule
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Official scheduled lecture periods registered in the active academic session.
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-bold self-start sm:self-center">
                  {teacherData?.timetable?.length || 0} Total Slots
                </Badge>
              </div>

              {/* Day Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {DAYS_OF_WEEK.map((day) => {
                  const count =
                    day === "All Days"
                      ? teacherData?.timetable?.length || 0
                      : (teacherData?.timetable || []).filter(
                          (t) => t.day.toLowerCase() === day.toLowerCase()
                        ).length;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 min-h-[34px]",
                        selectedDay === day
                          ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                      )}
                    >
                      <span>{day}</span>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.2 rounded-full font-mono font-extrabold",
                        selectedDay === day ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Timetable Slots Grid */}
              {filteredTimetable.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-muted/20 border border-dashed border-border/80 space-y-2">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <h4 className="text-xs font-bold text-foreground">
                    No scheduled periods for {selectedDay}
                  </h4>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    The academic coordinator has not assigned any lecture periods for this timeframe yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {filteredTimetable.map((slot) => (
                    <div
                      key={slot._id}
                      className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 hover:border-seneca-amber/40 transition-all space-y-2 shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-foreground text-xs">{slot.day}</span>
                        <Badge
                          variant="outline"
                          className="text-[9px] font-mono bg-seneca-amber/10 text-seneca-amber border-seneca-amber/25 font-bold"
                        >
                          {slot.period}
                        </Badge>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-foreground font-bold text-xs sm:text-sm truncate">
                          {slot.subject}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {slot.className}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-seneca-amber" />
                          {slot.time}
                        </span>
                        <span className="bg-background px-1.5 py-0.5 rounded border border-border/60">
                          {slot.room}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TAB 4: SECURITY & PASSWORDS */}
          {activeTab === "security" && (
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-5 max-w-2xl">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Key className="h-5 w-5 text-seneca-crimson" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                    Update Account Password
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ensure your faculty portal credentials are strong and secure.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Current Password *</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password to verify"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-10 sm:h-11 rounded-xl bg-background text-xs pr-10 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">New Password</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-10 sm:h-11 rounded-xl bg-background text-xs pr-10 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Confirm New Password</label>
                    <Input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Security Tip
                  </p>
                  <p>
                    Choose a password with at least 8 characters including uppercase letters, numbers, and special symbols.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving || !currentPassword || !newPassword}
                    variant="glow"
                    className="rounded-xl font-bold text-xs gap-1.5 h-10 px-6"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
                    <span>Update Password</span>
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
