"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Building,
  Save,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Award,
  Globe,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  AlertTriangle,
  Clock,
  ExternalLink,
  Eye,
  Megaphone,
  Check,
  X,
  FileText,
  BadgeCheck,
  CreditCard,
  Landmark,
  Plus,
  Trash2,
  Edit,
  Copy,
  QrCode,
  ArrowUpRight,
  HelpCircle,
  Receipt,
  DollarSign,
  Share2,
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

export interface BankAccountItem {
  id?: string;
  _id?: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  branchName?: string;
  branchCode?: string;
  routingCode?: string; // 1Link Biller ID or Raast ID
  instructions?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export default function PrincipalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // School Profile State
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [gradingSystem, setGradingSystem] = useState("percentage");
  const [academicSession, setAcademicSession] = useState("");

  // Institutional Bank Accounts State
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([]);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccountIndex, setEditingAccountIndex] = useState<number | null>(null);
  const [accountForm, setAccountForm] = useState<BankAccountItem>({
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    iban: "",
    branchName: "",
    branchCode: "",
    routingCode: "",
    instructions: "",
    isPrimary: false,
    isActive: true,
  });

  // Admissions Engine State
  const [admissionsOpen, setAdmissionsOpen] = useState(false);
  const [admissionsSession, setAdmissionsSession] = useState("");
  const [admissionsDeadline, setAdmissionsDeadline] = useState("");
  const [admissionsNotice, setAdmissionsNotice] = useState("");
  const [admissionsClosedNotice, setAdmissionsClosedNotice] = useState("");
  const [admissionsAnnouncement, setAdmissionsAnnouncement] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        if (data.data?.school) {
          const s = data.data.school;
          setSchoolName(s.name || "");
          setSchoolCode(s.code || "");
          setSchoolEmail(s.email || "");
          setSchoolPhone(s.phone || "");
          setSchoolAddress(s.address || "");
          setCurrency(s.settings?.currency || "PKR");
          setTimezone(s.settings?.timezone || "Asia/Karachi");
          setGradingSystem(s.settings?.gradingSystem || "percentage");

          if (s.bankAccounts && Array.isArray(s.bankAccounts)) {
            setBankAccounts(s.bankAccounts);
          } else {
            setBankAccounts([]);
          }
        }
        if (data.data?.academicYear) {
          setAcademicSession(data.data.academicYear.name || "");
        }
        if (data.data?.admissions) {
          const adm = data.data.admissions;
          setAdmissionsOpen(Boolean(adm.admissionsOpen));
          setAdmissionsSession(adm.admissionsSession || "");
          setAdmissionsDeadline(adm.admissionsDeadline || "");
          setAdmissionsNotice(adm.admissionsNotice || "");
          setAdmissionsClosedNotice(adm.admissionsClosedNotice || "");
          setAdmissionsAnnouncement(adm.admissionsAnnouncement || "");
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      toast.error("Error loading settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const openAddAccountModal = () => {
    setEditingAccountIndex(null);
    setAccountForm({
      bankName: "",
      accountTitle: schoolName || "",
      accountNumber: "",
      iban: "",
      branchName: "",
      branchCode: "",
      routingCode: "",
      instructions: "",
      isPrimary: bankAccounts.length === 0,
      isActive: true,
    });
    setAccountModalOpen(true);
  };

  const openEditAccountModal = (index: number) => {
    setEditingAccountIndex(index);
    const acc = bankAccounts[index];
    setAccountForm({ ...acc });
    setAccountModalOpen(true);
  };

  const handleSaveAccountModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.bankName.trim() || !accountForm.accountTitle.trim() || !accountForm.accountNumber.trim()) {
      toast.error("Please fill in Bank Name, Account Title, and Account Number.");
      return;
    }

    let updated = [...bankAccounts];
    if (accountForm.isPrimary) {
      updated = updated.map((a) => ({ ...a, isPrimary: false }));
    }

    if (editingAccountIndex !== null) {
      updated[editingAccountIndex] = { ...accountForm };
    } else {
      updated.push({ ...accountForm });
    }

    // Ensure at least one primary
    if (!updated.some((a) => a.isPrimary) && updated.length > 0) {
      updated[0].isPrimary = true;
    }

    setBankAccounts(updated);
    setAccountModalOpen(false);
    toast.success(
      editingAccountIndex !== null ? "Bank account updated in staging!" : "Bank account added to staging!",
      { description: "Click 'Save All Settings' to commit changes to database and fee vouchers." }
    );
  };

  const handleDeleteAccount = (index: number) => {
    const accToDelete = bankAccounts[index];
    const updated = bankAccounts.filter((_, i) => i !== index);
    if (accToDelete.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setBankAccounts(updated);
    toast.info("Bank account removed.", {
      description: "Click 'Save All Settings' to apply this deletion.",
    });
  };

  const handleTogglePrimary = (index: number) => {
    const updated = bankAccounts.map((a, i) => ({
      ...a,
      isPrimary: i === index,
    }));
    setBankAccounts(updated);
    toast.success(`${bankAccounts[index].bankName} set as Primary Account for Fee Vouchers.`);
  };

  const handleToggleActive = (index: number) => {
    const updated = bankAccounts.map((a, i) =>
      i === index ? { ...a, isActive: !a.isActive } : a
    );
    setBankAccounts(updated);
    toast.info(`Account status changed to ${!bankAccounts[index].isActive ? "Active" : "Inactive"}.`);
  };

  const handleCopyAccount = (acc: BankAccountItem) => {
    const text = `🏦 *School Bank Details - Seneca Academy*\n• *Bank:* ${acc.bankName}\n• *Title:* ${acc.accountTitle}\n• *Account #:* ${acc.accountNumber}\n• *IBAN:* ${acc.iban || "N/A"}\n• *Branch:* ${acc.branchName || "Karachi"}\n• *1Link / Raast:* ${acc.routingCode || "Supported"}`;
    navigator.clipboard.writeText(text);
    toast.success("Bank details copied to clipboard!");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: schoolName,
          email: schoolEmail,
          phone: schoolPhone,
          address: schoolAddress,
          settings: {
            currency,
            timezone,
            gradingSystem,
          },
          bankAccounts,
          admissions: {
            admissionsOpen,
            admissionsDeadline,
            admissionsSession,
            admissionsNotice,
            admissionsClosedNotice,
            admissionsAnnouncement,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to update settings.");

      toast.success("School, Banking & Admission Settings Saved!", {
        description: "Bank accounts and online payment parameters are now synchronized with all fee vouchers.",
      });
    } catch (err: any) {
      toast.error("Save Failed", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden pb-12">
      {/* 1. Header & Hero Metric Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <Settings className="h-3 w-3" />
                <span>Institutional Administration</span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border",
                  admissionsOpen
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full animate-pulse",
                    admissionsOpen ? "bg-emerald-400" : "bg-rose-400"
                  )}
                />
                <span>Admissions {admissionsOpen ? "OPEN & ACTIVE" : "CLOSED"}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              School Settings & <span className="text-seneca-amber">System Parameters</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Manage school identity, control public admission cycles, set application deadlines, and synchronize website banners and online application workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.open("/", "_blank")}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              <span>Preview Public Website</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Settings Edit Form */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
          <p className="text-xs font-bold text-muted-foreground">Loading School & Admission Parameters...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* ========================================================================= */}
          {/* CARD 1: ADMISSIONS LIFECYCLE & CAMPAIGN CONTROLLER                         */}
          {/* ========================================================================= */}
          <Card className="border-2 border-seneca-amber/30 bg-gradient-to-br from-card via-card to-seneca-amber/5 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-seneca-amber/15 text-seneca-amber">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                      1. Admission Cycle & Enrollment Controller
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-extrabold uppercase",
                        admissionsOpen
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      )}
                    >
                      {admissionsOpen ? "✓ Public Applications Active" : "✕ Applications Paused"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Toggle institution-wide admissions status, set application end dates, and configure public website banners.
                  </p>
                </div>
              </div>

              {/* Status Switch Buttons */}
              <div className="flex items-center p-1 bg-muted/80 rounded-2xl border border-border/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setAdmissionsOpen(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    admissionsOpen
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Admissions Open</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdmissionsOpen(false)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    !admissionsOpen
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Admissions Closed</span>
                </button>
              </div>
            </div>

            {/* ADMISSIONS OPEN CONFIGURATION */}
            {admissionsOpen ? (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                  <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <p className="font-bold">Admissions are LIVE on the Public Website:</p>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      &bull; Top Announcement Ticker displays active admission notice.<br />
                      &bull; Hero Section shows &quot;Apply for Admission&quot; buttons and sparkles badge.<br />
                      &bull; Online Admission Desk and diagnostic assessment booking forms are active.<br />
                      &bull; Candidates can register and submit admission applications.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Target Admission Session <span className="text-seneca-crimson">*</span>
                    </label>
                    <Input
                      required
                      type="text"
                      placeholder="e.g. Session 2026–2027, Fall 2026"
                      value={admissionsSession}
                      onChange={(e) => setAdmissionsSession(e.target.value)}
                      className="h-11 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Admission End Date / Deadline <span className="text-seneca-crimson">*</span>
                    </label>
                    <Input
                      required
                      type="date"
                      value={admissionsDeadline}
                      onChange={(e) => setAdmissionsDeadline(e.target.value)}
                      className="h-11 rounded-xl text-xs font-semibold"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Candidates will see this deadline in banners and admission guidelines.
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Public Topbar Ticker / Announcement Headline
                  </label>
                  <Input
                    required
                    type="text"
                    placeholder="e.g. ADMISSIONS OPEN FOR SESSION 2026–27 (LIMITED SEATS)"
                    value={admissionsNotice}
                    onChange={(e) => setAdmissionsNotice(e.target.value)}
                    className="h-11 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Assessment Schedule & Guidance Notice
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Diagnostic entrance tests conducted every Saturday at Soldier Bazar campus."
                    value={admissionsAnnouncement}
                    onChange={(e) => setAdmissionsAnnouncement(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>
              </div>
            ) : (
              /* ADMISSIONS CLOSED CONFIGURATION */
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-800 dark:text-rose-300 space-y-1">
                    <p className="font-bold">Admissions are CLOSED on the Public Website:</p>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      &bull; Top Announcement Ticker displays &quot;Admissions Closed for this Session&quot;.<br />
                      &bull; Direct application submission buttons are hidden or replaced with inquiries.<br />
                      &bull; Hero banners display &quot;Admissions Closed — Inquiries Open for Next Cycle&quot;.<br />
                      &bull; Online application API rejects new submissions with your closed notice.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Closed Session Reference</label>
                    <Input
                      type="text"
                      value={admissionsSession}
                      onChange={(e) => setAdmissionsSession(e.target.value)}
                      className="h-11 rounded-xl text-xs font-semibold"
                      placeholder="e.g. Session 2026–2027"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Closed Public Announcement / Guidance Message
                    </label>
                    <Input
                      required
                      type="text"
                      placeholder="e.g. Admissions for Session 2026–27 are currently closed. Inquiries open for next cycle."
                      value={admissionsClosedNotice}
                      onChange={(e) => setAdmissionsClosedNotice(e.target.value)}
                      className="h-11 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* ========================================================================= */}
          {/* CARD 2: SCHOOL CAMPUS IDENTITY & REGISTRATION                             */}
          {/* ========================================================================= */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-foreground">
                  2. Campus Identity & Registration Profile
                </h3>
                <p className="text-xs text-muted-foreground">
                  Institutional name, registration code, campus contact lines, and postal address.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Official Institution Name</label>
                <Input
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">School Code / Prefix</label>
                <Input
                  disabled
                  value={schoolCode}
                  className="h-11 rounded-xl text-xs font-mono font-bold bg-muted"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Admin Institutional Email</label>
                <Input
                  required
                  type="email"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Admin Telephone / Hotline</label>
                <Input
                  required
                  type="tel"
                  value={schoolPhone}
                  onChange={(e) => setSchoolPhone(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">Campus Physical Address</label>
                <Input
                  required
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>
            </div>
          </Card>

          {/* ========================================================================= */}
          {/* CARD 3: ACADEMIC PARAMETERS & GRADING                                      */}
          {/* ========================================================================= */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-foreground">
                  3. Academic Parameters & Financial Currency
                </h3>
                <p className="text-xs text-muted-foreground">
                  Session definitions, timezone, and evaluation grading scale.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Current Academic Year</label>
                <Input
                  disabled
                  value={academicSession}
                  className="h-11 rounded-xl text-xs font-bold bg-muted"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">System Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                >
                  <option value="PKR">Pakistani Rupee (PKR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Grading Evaluation System</label>
                <select
                  value={gradingSystem}
                  onChange={(e) => setGradingSystem(e.target.value as any)}
                  className="h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                >
                  <option value="percentage">Percentage Scale (0-100%)</option>
                  <option value="gpa">GPA Scale (4.0 Max)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* ========================================================================= */}
          {/* CARD 4: INSTITUTIONAL BANK ACCOUNTS & FEE VOUCHER BILLING               */}
          {/* ========================================================================= */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold font-heading text-foreground">
                      4. Institutional Bank Accounts & Fee Collection Gateways
                    </h3>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                      {bankAccounts.filter((a) => a.isActive !== false).length} Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure official bank accounts, 1Link/Raast IDs, IBANs, and branch details to print dynamically on student fee vouchers and enable online payments.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={openAddAccountModal}
                variant="glow"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                <Plus className="h-4 w-4" />
                <span>Add Bank Account</span>
              </Button>
            </div>

            {/* List of Configured Bank Accounts */}
            {bankAccounts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3">
                <Landmark className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">No Bank Accounts Configured</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Add at least one bank account so that generated fee challan vouchers and online payment gateways display official deposit details.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={openAddAccountModal}
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-bold gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Configure First Bank Account</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {bankAccounts.map((acc, index) => {
                  const isPrimary = Boolean(acc.isPrimary);
                  const isActive = acc.isActive !== false;

                  return (
                    <div
                      key={index}
                      className={cn(
                        "relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4",
                        isPrimary
                          ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.04] via-card to-background shadow-md shadow-emerald-500/5"
                          : "border-border/80 bg-card hover:border-border"
                      )}
                    >
                      {/* Top Bar: Bank Name & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                              <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              {acc.bankName}
                            </span>
                            {isPrimary && (
                              <Badge className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border-0 shadow-xs">
                                ★ Primary on Vouchers
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-full",
                                isActive
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                              )}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-xs font-semibold text-muted-foreground">
                            Title: <span className="text-foreground font-bold">{acc.accountTitle}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            onClick={() => openEditAccountModal(index)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                            title="Edit Account Details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleCopyAccount(acc)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-emerald-600"
                            title="Copy Account Details"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleDeleteAccount(index)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-600"
                            title="Remove Account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/40 p-3 rounded-xl text-[11px] border border-border/50">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Account Number:</span>
                          <span className="font-mono font-bold text-foreground select-all">{acc.accountNumber}</span>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px]">IBAN:</span>
                          <span className="font-mono text-[10px] font-semibold text-foreground select-all truncate block">
                            {acc.iban || "—"}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px]">Branch / Code:</span>
                          <span className="font-medium text-foreground truncate block">
                            {acc.branchName ? `${acc.branchName} ${acc.branchCode ? `(${acc.branchCode})` : ""}` : "Soldier Bazar Campus"}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-foreground block text-[10px]">1Link / Raast:</span>
                          <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400 truncate block">
                            {acc.routingCode || "Supported"}
                          </span>
                        </div>
                      </div>

                      {/* Deposit Instructions Note */}
                      {acc.instructions && (
                        <p className="text-[11px] text-muted-foreground italic bg-background/80 p-2 rounded-lg border border-border/40">
                          &quot;{acc.instructions}&quot;
                        </p>
                      )}

                      {/* Bottom Quick Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
                        <Button
                          type="button"
                          onClick={() => handleToggleActive(index)}
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-bold rounded-lg px-2.5"
                        >
                          {isActive ? "Deactivate Account" : "Activate Account"}
                        </Button>

                        {!isPrimary && isActive && (
                          <Button
                            type="button"
                            onClick={() => handleTogglePrimary(index)}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg px-2.5"
                          >
                            Set as Primary for Vouchers
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LIVE CHALLAN VOUCHER PREVIEW CARD */}
            {bankAccounts.length > 0 && (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 text-white border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-seneca-amber" />
                    <span className="text-xs font-bold uppercase tracking-wider text-seneca-amber">
                      Live Voucher Synchronization Preview
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    This is how banking details appear on printed 3-part Fee Challans
                  </span>
                </div>

                {(() => {
                  const primaryAcc = bankAccounts.find((a) => a.isPrimary && a.isActive) || bankAccounts.find((a) => a.isActive) || bankAccounts[0];
                  return (
                    <div className="p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700 space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-700 pb-2">
                        <div>
                          <div className="font-extrabold text-sm text-white uppercase tracking-wider">
                            SENECA ACADEMY
                          </div>
                          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                            <Landmark className="h-3 w-3" />
                            <span>{primaryAcc.bankName}</span>
                          </div>
                        </div>
                        <div className="text-right sm:text-right">
                          <span className="text-[10px] text-zinc-400 block">Bank Account Title</span>
                          <span className="font-bold text-white text-xs">{primaryAcc.accountTitle}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Account Number:</span>
                          <span className="font-mono font-bold text-white">{primaryAcc.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">IBAN:</span>
                          <span className="font-mono text-[10px] font-bold text-white truncate block">{primaryAcc.iban || "PK36HABB0001482839102001"}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">1Link / Online Biller:</span>
                          <span className="font-mono font-bold text-emerald-400">{primaryAcc.routingCode || "1Link ID: 100928"}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-300 italic pt-1 border-t border-zinc-700/60">
                        {primaryAcc.instructions || "Payable at any branch nationwide, mobile banking, or 1Link 1Bill."}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </Card>

          {/* Save Button Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              variant="glow"
              className="rounded-xl text-xs font-bold gap-2 px-8 h-11 shadow-lg shadow-seneca-amber/20"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save All Settings & Bank Accounts</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT BANK ACCOUNT                                            */}
      {/* ========================================================================= */}
      <Dialog open={accountModalOpen} onOpenChange={setAccountModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4">
          <DialogHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {editingAccountIndex !== null ? "Edit Bank Account Details" : "Add Institutional Bank Account"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Configure account credentials for student fee challans and online payments.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveAccountModal} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Bank Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Habib Bank Limited (HBL) or Meezan Bank"
                  value={accountForm.bankName}
                  onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                  className="h-10 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Account Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Seneca Academy (Pvt) Ltd"
                  value={accountForm.accountTitle}
                  onChange={(e) => setAccountForm({ ...accountForm, accountTitle: e.target.value })}
                  className="h-10 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Account Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. 0148-2839102-01"
                  value={accountForm.accountNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                  className="h-10 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">IBAN (24 Characters)</label>
                <Input
                  placeholder="e.g. PK36HABB0001482839102001"
                  value={accountForm.iban}
                  onChange={(e) => setAccountForm({ ...accountForm, iban: e.target.value.toUpperCase() })}
                  className="h-10 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Branch Name & City</label>
                <Input
                  placeholder="e.g. Soldier Bazar Branch, Karachi"
                  value={accountForm.branchName}
                  onChange={(e) => setAccountForm({ ...accountForm, branchName: e.target.value })}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Branch Code</label>
                <Input
                  placeholder="e.g. 0148"
                  value={accountForm.branchCode}
                  onChange={(e) => setAccountForm({ ...accountForm, branchCode: e.target.value })}
                  className="h-10 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  1Link / Raast / Online Biller Code
                </label>
                <Input
                  placeholder="e.g. 1Link Biller ID: 100928 • Raast ID: 03357413777"
                  value={accountForm.routingCode}
                  onChange={(e) => setAccountForm({ ...accountForm, routingCode: e.target.value })}
                  className="h-10 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Voucher Deposit Instructions
                </label>
                <Input
                  placeholder="e.g. Payable at any branch nationwide, via mobile banking apps, or 1Link 1Bill."
                  value={accountForm.instructions}
                  onChange={(e) => setAccountForm({ ...accountForm, instructions: e.target.value })}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(accountForm.isPrimary)}
                  onChange={(e) => setAccountForm({ ...accountForm, isPrimary: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                />
                <span>Set as Primary Account for Fee Challan Vouchers</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={accountForm.isActive !== false}
                  onChange={(e) => setAccountForm({ ...accountForm, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                />
                <span>Account is Active for Fee Collections</span>
              </label>
            </div>

            <DialogFooter className="gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAccountModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {editingAccountIndex !== null ? "Update Account" : "Add to List"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
