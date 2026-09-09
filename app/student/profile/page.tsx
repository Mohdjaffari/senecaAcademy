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
  QrCode,
  MapPin,
  HeartPulse,
  Users,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentTimetableSlot {
  _id: string;
  day: string;
  period: string;
  periodNumber: number;
  time: string;
  subject: string;
  subjectCode: string;
  teacherName: string;
  room: string;
}

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Student Profile States (Clean initial values)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [className, setClassName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [stream, setStream] = useState("");
  const [admissionType, setAdmissionType] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [timetable, setTimetable] = useState<StudentTimetableSlot[]>([]);
  const [academicHistory, setAcademicHistory] = useState<any[]>([]);

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
        const u = data.data.user;
        const s = data.data.student;

        if (u) {
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setAvatarUrl(u.avatarUrl || "");
        }

        if (s) {
          setRollNumber(s.rollNumber || "N/A");
          setAdmissionNumber(s.admissionNumber || "N/A");
          setClassName(s.className || "General");
          setAcademicYear(s.academicYear || "2026-2027");
          setStream(s.stream || "General");
          setAdmissionType(s.admissionType || "Regular");
          setBloodGroup(s.bloodGroup || "");
          setAddress(s.address || "");
          setGuardianName(s.guardian?.fatherName || "");
          setGuardianPhone(s.guardian?.phone || "");
          setEmergencyContact(s.guardian?.emergencyContact || "");
          setTimetable(s.timetable || []);
          setAcademicHistory(s.academicHistory || []);
        }
      } else {
        toast.error(data.error?.message || "Failed to load student profile data.");
      }
    } catch (_) {
      toast.error("Error loading student profile from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    if (newPassword && newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }

    if (newPassword && !currentPassword) {
      return toast.error("Current password is required to set a new password.");
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl || "",
        address: address.trim(),
        bloodGroup: bloodGroup.trim(),
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        emergencyContact: emergencyContact.trim(),
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
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to update profile.");

      // Broadcast avatar update across topbar and sidebar in real-time
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("seneca_avatar_changed", { detail: { avatarUrl } })
        );
      }

      toast.success("Student Profile Updated!", {
        description: "Your digital profile, photo, and guardian details have been saved.",
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
    toast.info("Photo reset. Click 'Save Profile' to finalize.");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full max-w-7xl mx-auto overflow-x-hidden px-1 sm:px-2">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-3 sm:border-4 border-seneca-amber shadow-2xl ring-4 ring-black/30 shrink-0">
              <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-seneca-amber to-amber-600 text-zinc-950 font-extrabold text-2xl sm:text-3xl">
                {name ? name.charAt(0).toUpperCase() : "S"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                  <GraduationCap className="h-3 w-3 text-seneca-amber" />
                  <span>Enrolled Student</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Active Registration</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] sm:text-[11px] font-bold border border-sky-500/30 font-mono">
                  {admissionNumber}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading tracking-tight text-white truncate">
                {name || (loading ? "Loading Student..." : "Student Profile")}
              </h1>
              <p className="text-xs sm:text-sm text-white/85 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{className}</span>
                <span className="text-white/40">•</span>
                <span>Roll: {rollNumber}</span>
                <span className="text-white/40">•</span>
                <span className="text-seneca-amber-light">Academic Year: {academicYear}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={saving || loading}
            variant="glow"
            size="sm"
            className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 h-10 px-5 justify-center w-full sm:w-auto"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Main Grid */}
      {loading ? (
        <Card className="border border-border/80 p-12 sm:p-16 flex flex-col items-center justify-center space-y-3 text-center bg-card/95 backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber" />
          <p className="text-xs font-bold text-muted-foreground">Retrieving Academic Record from Database...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column: Photo Uploader & Digital Student ID Card */}
          <div className="lg:col-span-4 space-y-5">
            {/* Photo Uploader */}
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-seneca-crimson" />
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    Student ID Photograph
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
                    <span>Reset</span>
                  </Button>
                )}
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-2xl border border-border/60">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg mb-2">
                  <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-seneca-amber to-amber-600 text-zinc-950 font-extrabold text-2xl">
                    {name ? name.charAt(0).toUpperCase() : "S"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-bold text-foreground">Digital ID Photo</span>
              </div>

              <ImageUpload
                value={avatarUrl}
                onChange={(url) => setAvatarUrl(url)}
                label="Upload Student Photo"
                aspectRatio="square"
              />
            </Card>

            {/* Digital Student Card Preview */}
            <Card className="border border-border/80 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-5 rounded-2xl sm:rounded-3xl space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-seneca-crimson/20 blur-2xl" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-seneca-amber">
                    Seneca Academy
                  </span>
                  <h4 className="text-xs font-bold text-white leading-tight">Digital Student ID</h4>
                </div>
                <Badge variant="outline" className="text-[9px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono">
                  {academicYear}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-seneca-amber shrink-0">
                  <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                  <AvatarFallback className="bg-seneca-amber text-zinc-950 font-bold">
                    {name ? name.charAt(0).toUpperCase() : "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{name}</h4>
                  <p className="text-[11px] text-white/70">Roll: {rollNumber}</p>
                  <p className="text-[10px] font-mono text-seneca-amber font-bold">{admissionNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[10px] text-white/80">
                <div>
                  <span className="text-white/50 block">Class / Section</span>
                  <span className="font-semibold truncate block">{className}</span>
                </div>
                <div>
                  <span className="text-white/50 block">Blood Group</span>
                  <span className="font-semibold text-rose-400">{bloodGroup || "Not Specified"}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Profile Form & Password Security */}
          <div className="lg:col-span-8 space-y-5">
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-seneca-crimson" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                      Personal & Guardian Information
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Official verified student dossier synchronized with school records.
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-seneca-crimson uppercase">
                  Student Record
                </Badge>
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
                      className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Institutional Email</label>
                    <Input
                      type="email"
                      value={email}
                      disabled
                      className="h-10 sm:h-11 rounded-xl bg-muted/60 text-xs font-mono text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Student Phone</label>
                    <Input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +92 300 1234567"
                      className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Blood Group</label>
                    <Input
                      type="text"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      placeholder="e.g. O+, A+, B+"
                      className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Guardian / Father Name</label>
                    <Input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Mr. Tariq Mahmood"
                      className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Guardian Phone</label>
                    <Input
                      type="text"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="e.g. +92 321 8899770"
                      className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Emergency Contact Details</label>
                  <Input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. +92 333 1122334 (Uncle / Emergency Contact)"
                    className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Residential Address</label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. House 42, Sector F-7/2, Islamabad"
                    className="h-10 sm:h-11 rounded-xl bg-background text-xs font-medium"
                  />
                </div>

                {/* Password Section */}
                <div className="pt-4 border-t border-border/60 space-y-3">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Update Account Password</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="h-9 sm:h-10 rounded-xl bg-background text-xs pr-8 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">New Password</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-9 sm:h-10 rounded-xl bg-background text-xs pr-8 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Confirm Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-9 sm:h-10 rounded-xl bg-background text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={saving} variant="glow" className="rounded-xl font-bold text-xs gap-1.5 h-10 px-6">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    <span>Save Student Profile</span>
                  </Button>
                </div>
              </form>
            </Card>

            {/* Academic Journey & Grade Progression History */}
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-seneca-crimson" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                      Academic Journey &amp; Grade Progression
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Official institutional record of academic advancement, grades, and promotion endorsements.
                    </p>
                  </div>
                </div>
                <Badge className="bg-seneca-crimson text-white font-bold text-xs">
                  {academicHistory.length + 1} Academic Terms
                </Badge>
              </div>

              {/* Current Active Placement */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-seneca-crimson/10 via-card to-seneca-amber/10 border border-seneca-crimson/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                      Current Placement
                    </Badge>
                    <span className="font-bold text-foreground text-xs">
                      {className} ({stream || "General"})
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono font-bold text-seneca-crimson">
                    Roll #{rollNumber}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-card/70 p-2 rounded-xl border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Session</span>
                    <span className="font-bold text-foreground">{academicYear}</span>
                  </div>
                  <div className="bg-card/70 p-2 rounded-xl border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Admission Type</span>
                    <span className="font-bold text-seneca-crimson">{admissionType || "Regular"}</span>
                  </div>
                  <div className="bg-card/70 p-2 rounded-xl border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Admission ID</span>
                    <span className="font-mono font-bold text-foreground">{admissionNumber}</span>
                  </div>
                  <div className="bg-card/70 p-2 rounded-xl border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Status</span>
                    <span className="font-bold text-emerald-600">Active Enrolled</span>
                  </div>
                </div>
              </div>

              {/* Archived Timeline */}
              {academicHistory.length === 0 ? (
                <div className="p-5 rounded-2xl bg-muted/20 border border-dashed border-border/60 text-center space-y-1.5">
                  <GraduationCap className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                  <h5 className="font-bold text-xs text-foreground">Inaugural Session Record</h5>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    You are in your initial enrolled grade. When promoted to higher classes, all historical report cards, percentages, GPAs, and Principal remarks will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-seneca-crimson before:via-seneca-amber before:to-emerald-500 pt-2">
                  {academicHistory.map((item: any, idx: number) => (
                    <div key={idx} className="relative pl-8 space-y-2 group">
                      <div className="absolute left-2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-card bg-seneca-crimson group-hover:scale-125 transition-transform" />

                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 hover:border-seneca-crimson/40 transition-all space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-bold text-foreground">
                              {item.fromClassName || "Previous Class"} {item.fromSection ? `(${item.fromSection})` : ""}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-bold text-seneca-crimson">
                              {item.toClassName || "Advanced Class"} {item.toSection ? `(${item.toSection})` : ""}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5",
                                item.status === "promoted" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                                item.status === "conditionally_promoted" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                                item.status === "transferred" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                                item.status === "retained" && "bg-rose-500/10 text-rose-600 border-rose-500/30",
                                item.status === "graduated" && "bg-purple-500/10 text-purple-600 border-purple-500/30"
                              )}
                            >
                              {(item.status || "promoted").replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(item.promotionDate).toLocaleDateString("en-PK", { dateStyle: "medium" })}</span>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-card/60 border border-border/40 text-center text-xs">
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Session Score</span>
                            <span className="font-bold text-foreground">
                              {item.finalPercentage !== undefined ? `${item.finalPercentage}%` : "Evaluated"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Grade Awarded</span>
                            <span className="font-bold text-seneca-crimson">{item.overallGrade || "A"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Session GPA</span>
                            <span className="font-bold text-foreground font-mono">
                              {item.finalGpa !== undefined ? item.finalGpa.toFixed(2) : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Remarks */}
                        {item.remarks && (
                          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] space-y-1">
                            <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                <span>Principal &amp; Academic Board Remark</span>
                              </span>
                              {item.promotedByName && <span>Authorized by: {item.promotedByName}</span>}
                            </div>
                            <p className="italic text-foreground/90">&ldquo;{item.remarks}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Timetable schedule if assigned */}
            {timetable && timetable.length > 0 && (
              <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-seneca-amber" />
                    <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                      Class Timetable Periods
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {timetable.length} Periods
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {timetable.map((slot) => (
                    <div key={slot._id} className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">{slot.day}</span>
                        <Badge variant="outline" className="text-[9px] font-mono bg-seneca-amber/10 text-seneca-amber border-seneca-amber/25">
                          {slot.period}
                        </Badge>
                      </div>
                      <p className="text-foreground font-semibold truncate">{slot.subject}</p>
                      <p className="text-[10px] text-muted-foreground">{slot.time} • {slot.room}</p>
                      <p className="text-[9px] text-muted-foreground/80">{slot.teacherName}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
