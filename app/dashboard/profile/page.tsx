"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Key,
  Lock,
  Save,
  Sparkles,
  Calendar,
  Building,
  Award,
  Loader2,
  CheckCircle2,
  Briefcase,
  Layers,
  Camera,
  Trash2,
  UploadCloud,
  Check,
  X,
  Eye,
  EyeOff,
  School,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string;
  joinedDate: string;
}

interface PrincipalDetails {
  qualification: string;
  experienceYears: number;
  message?: string;
  signatureUrl?: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
}

export default function PrincipalProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [principalDetails, setPrincipalDetails] = useState<PrincipalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | string>("");
  const [message, setMessage] = useState("");
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
        const p = data.data.principal;

        setProfile(u);
        setPrincipalDetails(p);

        if (u) {
          setName(u.name || "");
          setPhone(u.phone || "");
          setAvatarUrl(u.avatarUrl || "");
        }

        if (p) {
          setQualification(p.qualification || "");
          setExperienceYears(p.experienceYears !== undefined ? p.experienceYears : "");
          setMessage(p.message || "");
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Error loading profile credentials.");
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
      return toast.error("Current password is required to update password.");
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl || "",
        qualification: qualification.trim(),
        experienceYears: experienceYears !== "" ? Number(experienceYears) : 0,
        message: message.trim(),
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

      toast.success("Profile Updated Successfully!", {
        description: "Your executive credentials and profile settings have been saved to the database.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      fetchProfile();
    } catch (err: any) {
      toast.error("Update Failed", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    toast.info("Profile photo reset. Save changes to finalize.");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full max-w-7xl mx-auto overflow-x-hidden px-1 sm:px-2">
      {/* 1. Header & Hero Profile Showcase Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
            {/* Interactive Avatar Frame */}
            <div className="relative group shrink-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 bg-gradient-to-br from-seneca-amber to-seneca-crimson flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl ring-4 ring-black/30">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{name.charAt(0).toUpperCase() || "P"}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 rounded-full bg-seneca-amber text-zinc-950 shadow-md border-2 border-zinc-950">
                <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                  <ShieldCheck className="h-3 w-3 text-seneca-amber" />
                  <span>Executive Administrator</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active Session</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading tracking-tight text-white truncate">
                {name || (loading ? "Loading Principal Profile..." : "Executive Profile")}
              </h1>
              <p className="text-xs sm:text-sm text-white/80">{profile?.email || ""}</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving || loading}
            variant="glow"
            size="sm"
            className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto h-10 px-5 justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </Button>
        </div>

        {/* School Overview Stats Strip */}
        {principalDetails && (
          <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center sm:text-left">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] text-white/60 uppercase tracking-wider block">Total Students</span>
              <span className="text-base sm:text-lg font-bold text-emerald-400">
                {principalDetails.totalStudents} Enrolled
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] text-white/60 uppercase tracking-wider block">Faculty Members</span>
              <span className="text-base sm:text-lg font-bold text-seneca-amber">
                {principalDetails.totalTeachers} Teachers
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] text-white/60 uppercase tracking-wider block">Active Classes</span>
              <span className="text-base sm:text-lg font-bold text-sky-400">
                {principalDetails.totalClasses} Sections
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Profile Work Area */}
      {loading ? (
        <Card className="border border-border/80 p-12 sm:p-16 flex flex-col items-center justify-center space-y-3 text-center bg-card/95 backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber" />
          <p className="text-xs font-bold text-muted-foreground">Loading Executive Profile Details...</p>
        </Card>
      ) : (
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column: Avatar Management Card & Institutional Dossier */}
          <div className="lg:col-span-5 space-y-5">
            {/* Profile Picture Uploader Card */}
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
                    <span>Remove Photo</span>
                  </Button>
                )}
              </div>

              {/* Centered Preview + Direct Dropzone */}
              <div className="space-y-3">
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-border/60">
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl overflow-hidden shadow-lg border-4 border-background bg-gradient-to-br from-seneca-amber to-seneca-crimson flex items-center justify-center text-white font-extrabold text-3xl mb-2">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{name.charAt(0).toUpperCase() || "P"}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {avatarUrl ? "Current Custom Photo" : "Default Avatar"}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Visible across Topbar, Admin Sidebar & Principal Desk
                  </span>
                </div>

                <ImageUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  label="Select or Drag New Profile Photo"
                  aspectRatio="square"
                />
              </div>
            </Card>

            {/* Institutional Dossier */}
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3.5">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                <Briefcase className="h-4 w-4 text-seneca-crimson" />
                <h3 className="text-xs sm:text-sm font-bold font-heading text-foreground uppercase tracking-wider">
                  Executive Dossier
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground font-medium">Designation</span>
                  <span className="font-bold text-foreground">Principal & Academic Director</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground font-medium">System Role</span>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-seneca-crimson dark:text-seneca-amber">
                    {profile?.role?.toUpperCase() || "ADMIN"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground font-medium">Academic Wing</span>
                  <span className="font-bold text-foreground">Cambridge & Matriculation Wing</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Contact Credentials & Security Passwords */}
          <div className="lg:col-span-7 space-y-5">
            {/* Card 1: Executive Information */}
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <User className="h-5 w-5 text-seneca-crimson" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">1. Executive Credentials</h3>
                  <p className="text-xs text-muted-foreground">Official contact details and display identity.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Full Name *</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 sm:h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Institutional Email</label>
                  <Input
                    disabled
                    value={profile?.email || ""}
                    className="h-10 sm:h-11 rounded-xl text-xs bg-muted/60 font-mono text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Direct Telephone</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="h-10 sm:h-11 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Experience (Years)</label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="e.g. 15"
                    className="h-10 sm:h-11 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground">Highest Academic Qualification</label>
                  <Input
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. Ph.D. in Educational Leadership & Curriculum Development"
                    className="h-10 sm:h-11 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
            </Card>

            {/* Card 2: Security & Password Update */}
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Key className="h-5 w-5 text-seneca-crimson" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">2. Security & Password</h3>
                  <p className="text-xs text-muted-foreground">Update your administrative login credentials.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password to authorize changes"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-10 sm:h-11 rounded-xl text-xs pr-10 font-medium"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">New Password</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-10 sm:h-11 rounded-xl text-xs pr-10 font-medium"
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
                      className="h-10 sm:h-11 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit Button Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5 px-8 h-10"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save All Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
