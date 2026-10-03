"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  UserPlus,
  GraduationCap,
  Calendar,
  Layers,
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  Users,
  Award,
  ChevronRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  BookOpen,
  Heart,
  Bus,
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
import { useCampusPortal } from "@/lib/hooks/useCampusPortal";
import { resolveClassWing } from "@/lib/constants/campus-wing";

interface AdmissionApp {
  id: string;
  applicationNumber: string;
  admissionType?: "Regular" | "Transfer" | "Sibling" | "Scholarship" | "Provisional";
  studentName: string;
  fatherName: string;
  fatherCnic?: string;
  fatherOccupation?: string;
  fatherCompany?: string;
  motherName?: string;
  motherCnic?: string;
  motherOccupation?: string;
  motherPhone?: string;
  guardianType?: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyRelation?: string;
  siblingInSchool?: boolean;
  siblingRollNumber?: string;
  siblingName?: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  bFormNumber?: string;
  placeOfBirth?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;
  medicalInfo?: {
    allergies?: string;
    conditions?: string;
    emergencyNotes?: string;
  };
  applyingForClass: string;
  preferredSection: string;
  stream?: string;
  previousSchool?: string;
  previousMarksOrGrade?: string;
  slcNumber?: string;
  previousSchoolDetails?: {
    schoolName?: string;
    lastGrade?: string;
    slcNumber?: string;
    board?: string;
    marksPercentage?: string;
  };
  address: string;
  transportRequired?: boolean;
  transportRoute?: string;
  pickupPoint?: string;
  documentsChecklist?: {
    bForm?: boolean;
    fatherCnic?: boolean;
    motherCnic?: boolean;
    photos?: boolean;
    slc?: boolean;
    marksheet?: boolean;
    characterCert?: boolean;
    medicalReport?: boolean;
  };
  documentFiles?: {
    bForm?: string;
    fatherCnic?: string;
    motherCnic?: string;
    photo?: string;
    slc?: string;
    reportCard?: string;
  };
  feeCategory?: string;
  status: "submitted" | "under_review" | "test_scheduled" | "approved" | "rejected" | "enrolled";
  formattedDate: string;
}

const ADMISSION_GRADES = [
  { id: "all", name: "All Grades" },
  { id: "Nursery", name: "Nursery" },
  { id: "KG-I", name: "KG-I (Prep-I)" },
  { id: "KG-II", name: "KG-II (Prep-II)" },
  { id: "Grade 1", name: "Grade 1" },
  { id: "Grade 2", name: "Grade 2" },
  { id: "Grade 3", name: "Grade 3" },
  { id: "Grade 4", name: "Grade 4" },
  { id: "Grade 5", name: "Grade 5" },
  { id: "Grade 6", name: "Grade 6" },
  { id: "Grade 7", name: "Grade 7" },
  { id: "Grade 8", name: "Grade 8" },
  { id: "Grade 9", name: "Grade 9" },
  { id: "Grade 10", name: "Grade 10" },
  { id: "Grade 11", name: "Grade 11" },
];

export default function PrincipalAdmissionsPage() {
  const { activeWing, setCampusWing, wingConfig } = useCampusPortal();
  const [admissions, setAdmissions] = useState<AdmissionApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal States
  const [selectedApp, setSelectedApp] = useState<AdmissionApp | null>(null);

  const fetchAdmissions = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admissions");
      const data = await res.json();
      if (data.success && data.data?.admissions) {
        setAdmissions(data.data.admissions);
      }
    } catch (err) {
      console.error("Failed to load admissions:", err);
      toast.error("Error loading admission records.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const scopedAdmissions = useMemo(() => {
    if (activeWing === "all") return admissions;
    return admissions.filter((a: AdmissionApp) => resolveClassWing(undefined, a.applyingForClass) === activeWing);
  }, [admissions, activeWing]);

  const totalApps = scopedAdmissions.length;
  const pendingReview = scopedAdmissions.filter((a: AdmissionApp) => a.status === "submitted" || a.status === "under_review").length;
  const approvedCount = scopedAdmissions.filter((a: AdmissionApp) => a.status === "approved" || a.status === "enrolled").length;
  const testScheduled = scopedAdmissions.filter((a: AdmissionApp) => a.status === "test_scheduled").length;

  const filteredAdmissions = admissions.filter((a) => {
    // Campus portal wing filter
    if (activeWing !== "all") {
      const appWing = resolveClassWing(undefined, a.applyingForClass);
      if (appWing !== activeWing) return false;
    }

    const matchesSearch =
      a.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.applyingForClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.bFormNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || a.status === selectedStatus;
    const matchesGrade = selectedGrade === "all" || a.applyingForClass.toLowerCase().includes(selectedGrade.toLowerCase());
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const handleUpdateStatus = async (app: AdmissionApp, newStatus: string) => {
    // Optimistic UI update
    setAdmissions((prev) =>
      prev.map((item) => (item.id === app.id ? { ...item, status: newStatus as any } : item))
    );
    if (selectedApp?.id === app.id) {
      setSelectedApp({ ...selectedApp, status: newStatus as any });
    }

    try {
      const res = await fetch(`/api/admissions/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message);

      toast.success("Application Status Updated", {
        description: `${app.studentName}'s application set to '${newStatus.replace("_", " ")}'.`,
      });

      fetchAdmissions(true);
    } catch (err: any) {
      toast.error("Update Failed", { description: err.message });
      fetchAdmissions(true);
    }
  };

  const handleExportCSV = () => {
    if (admissions.length === 0) return toast.info("No applications to export.");
    const headers = "Application #,Candidate Name,Father Name,Father CNIC,B-Form,Applying Class,Section,Admission Type,Stream,Parent Phone,Parent Email,Date Applied,Status\n";
    const rows = admissions
      .map(
        (a) =>
          `"${a.applicationNumber}","${a.studentName}","${a.fatherName}","${a.fatherCnic || ""}","${a.bFormNumber || ""}","${a.applyingForClass}","${a.preferredSection || "A"}","${a.admissionType || "Regular"}","${a.stream || "General"}","${a.parentPhone}","${a.parentEmail}","${a.formattedDate}","${a.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Seneca_Admissions_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Admissions roster exported to CSV!");
  };

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
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
                <FileCheck className="h-3 w-3" />
                <span>{wingConfig.name}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Diagnostic Assessments Active</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Admissions Desk & <span className="text-seneca-amber">Candidate Dossiers</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              {activeWing === "junior"
                ? "Review foundational Early Childhood and Primary admission candidates (Playgroup, Nursery, KG, Grade 1, Grade 2), verify B-forms and parent profiles, and approve early enrollments."
                : activeWing === "senior"
                ? "Manage Middle, Secondary (Matric/Cambridge), and Intermediate candidate applications, previous SLC records, Saturday diagnostic assessments, and subject streaming."
                : "Review new admission candidates across all grades (Playgroup to 2nd Year / College), inspect uploaded document checklists, schedule Saturday diagnostic tests, and approve registrations."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Export Roster (CSV)</span>
            </Button>
            <Link href="/dashboard/students">
              <Button
                variant="default"
                size="sm"
                className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto justify-center bg-seneca-amber text-black hover:bg-seneca-amber/90"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Direct Student Enrollment</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Total Applications
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">{totalApps}</div>
          <div className="text-[10px] text-muted-foreground">Session 2026–27 Total</div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Pending Review
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-600">{pendingReview}</div>
          <div className="text-[10px] text-muted-foreground">Awaiting Registrar Assessment</div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Tests Scheduled
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-purple-600">{testScheduled}</div>
          <div className="text-[10px] text-muted-foreground">Saturday Assessment Pool</div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Approved & Enrolled
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-600">{approvedCount}</div>
          <div className="text-[10px] text-muted-foreground">Offered Seneca Seat</div>
        </Card>
      </div>

      {/* 3. Campus Wing Quick Filters & Search */}
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
          All Applications ({admissions.length})
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
          Junior Wing (&le; Gr 2) ({admissions.filter((a) => resolveClassWing(undefined, a.applyingForClass) === "junior").length})
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
          Senior Wing (&gt; Gr 2) ({admissions.filter((a) => resolveClassWing(undefined, a.applyingForClass) === "senior").length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search candidate name, app #, B-form, grade, father..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-11 rounded-xl bg-background border-border/80 text-xs sm:text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="h-10 sm:h-11 px-2.5 sm:px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground truncate"
            >
              {ADMISSION_GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 sm:h-11 px-2.5 sm:px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground truncate"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="test_scheduled">Test Scheduled</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="enrolled">Enrolled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. Applications List Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
          <span className="text-xs font-bold">Loading Admission Applications...</span>
        </div>
      ) : filteredAdmissions.length === 0 ? (
        <Card className="border border-dashed border-border p-8 sm:p-12 text-center rounded-3xl space-y-3">
          <FileCheck className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
          <h3 className="text-sm sm:text-base font-bold text-foreground">No Applications Found</h3>
          <p className="text-xs text-muted-foreground">No candidate dossiers match your search filter.</p>
        </Card>
      ) : (
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px] sm:min-w-full">
              <thead className="bg-muted/80 text-foreground font-extrabold uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Application #</th>
                  <th className="py-3 px-4">Candidate & B-Form</th>
                  <th className="py-3 px-4">Class & Stream</th>
                  <th className="py-3 px-4">Parent / Guardian</th>
                  <th className="py-3 px-4">Date Applied</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAdmissions.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">{a.applicationNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground">{a.studentName}</div>
                      <div className="text-[10px] text-muted-foreground">Father: {a.fatherName}</div>
                      {a.bFormNumber && (
                        <div className="text-[9px] font-mono text-muted-foreground">B-Form: {a.bFormNumber}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="font-bold text-xs bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/25">
                        {a.applyingForClass} - Sec {a.preferredSection || "A"}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground">{a.stream || "General"} • {a.admissionType || "Regular"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{a.parentPhone}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{a.parentEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">{a.formattedDate}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold capitalize",
                          a.status === "approved" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                          a.status === "enrolled" && "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
                          a.status === "test_scheduled" && "bg-purple-500/10 text-purple-600 border-purple-500/30",
                          (a.status === "submitted" || a.status === "under_review") &&
                            "bg-amber-500/10 text-amber-600 border-amber-500/30",
                          a.status === "rejected" && "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        )}
                      >
                        {a.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        onClick={() => setSelectedApp(a)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 text-primary hover:bg-primary/10"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Review</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Comprehensive Admission Dossier & Decision Modal */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4 my-4 shadow-2xl border border-border/80">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base sm:text-xl font-bold">
                      {selectedApp.studentName}
                    </DialogTitle>
                    <Badge variant="outline" className="font-mono text-xs bg-muted">
                      {selectedApp.applicationNumber}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Applied for <span className="font-semibold text-foreground">{selectedApp.applyingForClass} (Sec {selectedApp.preferredSection || "A"})</span> • {selectedApp.stream || "General"} Stream • Type: {selectedApp.admissionType || "Regular"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-bold capitalize self-start sm:self-auto px-3 py-1",
                    selectedApp.status === "approved" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                    selectedApp.status === "enrolled" && "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
                    selectedApp.status === "test_scheduled" && "bg-purple-500/10 text-purple-600 border-purple-500/30",
                    (selectedApp.status === "submitted" || selectedApp.status === "under_review") && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                    selectedApp.status === "rejected" && "bg-rose-500/10 text-rose-600 border-rose-500/30"
                  )}
                >
                  {selectedApp.status.replace("_", " ")}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              {/* Section A: Candidate Demographics */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-seneca-crimson" />
                  Candidate Demographics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Date of Birth</span>
                    <span className="font-bold text-foreground text-xs">{selectedApp.dateOfBirth ? new Date(selectedApp.dateOfBirth).toLocaleDateString("en-PK", { dateStyle: "medium" }) : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Gender & Blood Group</span>
                    <span className="font-bold text-foreground text-xs">{selectedApp.gender} ({selectedApp.bloodGroup})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">B-Form / CNIC</span>
                    <span className="font-bold text-foreground font-mono text-xs">{selectedApp.bFormNumber || "Not Provided"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Religion & Nationality</span>
                    <span className="font-bold text-foreground text-xs">{selectedApp.religion || "Islam"} • {selectedApp.nationality || "Pakistani"}</span>
                  </div>
                </div>
              </div>

              {/* Section B: Parents & Guardian Details */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  Parents & Guardian Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Father&apos;s Profile</span>
                    <div className="font-bold text-foreground text-xs">{selectedApp.fatherName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{selectedApp.fatherCnic || "CNIC on file"}</div>
                    <div className="text-[10px] text-muted-foreground">{selectedApp.fatherOccupation || "Business/Service"} {selectedApp.fatherCompany ? `(${selectedApp.fatherCompany})` : ""}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Mother&apos;s Profile</span>
                    <div className="font-bold text-foreground text-xs">{selectedApp.motherName || "Not specified"}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{selectedApp.motherCnic || "CNIC on file"}</div>
                    <div className="text-[10px] text-muted-foreground">{selectedApp.motherOccupation || "Homemaker"} {selectedApp.motherPhone ? `• ${selectedApp.motherPhone}` : ""}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Primary Contact & Emergency</span>
                    <div className="font-semibold text-foreground">{selectedApp.parentPhone}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{selectedApp.parentEmail}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Emergency: {selectedApp.emergencyContactName || selectedApp.fatherName} ({selectedApp.emergencyRelation || "Parent"}) - {selectedApp.emergencyContact || selectedApp.parentPhone}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Residential Address: </span>{selectedApp.address}
                </div>
              </div>

              {/* Section C: Academic History & Transport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                    Academic History & Siblings
                  </span>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Previous School: </span>
                    <span className="font-semibold text-foreground">{selectedApp.previousSchool || selectedApp.previousSchoolDetails?.schoolName || "First time admission"}</span>
                  </div>
                  {(selectedApp.slcNumber || selectedApp.previousSchoolDetails?.slcNumber) && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">School Leaving Cert (SLC): </span>
                      <span className="font-mono font-semibold text-foreground">{selectedApp.slcNumber || selectedApp.previousSchoolDetails?.slcNumber}</span>
                    </div>
                  )}
                  {selectedApp.siblingInSchool && (
                    <div className="mt-1 p-2 rounded-xl bg-seneca-amber/10 border border-seneca-amber/20 text-[10px] text-seneca-amber-dark font-medium">
                      Sibling currently enrolled: {selectedApp.siblingName || "Yes"} (Roll: {selectedApp.siblingRollNumber || "On File"})
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Bus className="h-3.5 w-3.5 text-emerald-600" />
                    Transport & Medical
                  </span>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Van / Bus Transport: </span>
                    <span className="font-semibold text-foreground">{selectedApp.transportRequired ? `Required (${selectedApp.transportRoute || "Standard Route"})` : "Self Transport / Private"}</span>
                  </div>
                  {selectedApp.pickupPoint && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Pickup Location: </span>
                      <span className="font-semibold text-foreground">{selectedApp.pickupPoint}</span>
                    </div>
                  )}
                  {(selectedApp.medicalInfo?.allergies || selectedApp.medicalInfo?.conditions) && (
                    <div className="mt-1 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-600">
                      <span className="font-bold">Medical Alert: </span>
                      {selectedApp.medicalInfo.allergies && `Allergies: ${selectedApp.medicalInfo.allergies}. `}
                      {selectedApp.medicalInfo.conditions && `Conditions: ${selectedApp.medicalInfo.conditions}.`}
                    </div>
                  )}
                </div>
              </div>

              {/* Section D: Document Checklist & Uploaded Files */}
              <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Document Checklist & Attachments
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className={cn("p-2 rounded-xl border flex items-center gap-1.5", selectedApp.documentsChecklist?.bForm ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-semibold" : "bg-muted/40 border-border text-muted-foreground")}>
                    <span>{selectedApp.documentsChecklist?.bForm ? "✓" : "○"}</span>
                    <span>B-Form / Birth Cert</span>
                  </div>
                  <div className={cn("p-2 rounded-xl border flex items-center gap-1.5", selectedApp.documentsChecklist?.fatherCnic ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-semibold" : "bg-muted/40 border-border text-muted-foreground")}>
                    <span>{selectedApp.documentsChecklist?.fatherCnic ? "✓" : "○"}</span>
                    <span>Father CNIC Copy</span>
                  </div>
                  <div className={cn("p-2 rounded-xl border flex items-center gap-1.5", selectedApp.documentsChecklist?.photos ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-semibold" : "bg-muted/40 border-border text-muted-foreground")}>
                    <span>{selectedApp.documentsChecklist?.photos ? "✓" : "○"}</span>
                    <span>4x Passport Photos</span>
                  </div>
                  <div className={cn("p-2 rounded-xl border flex items-center gap-1.5", selectedApp.documentsChecklist?.slc ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-semibold" : "bg-muted/40 border-border text-muted-foreground")}>
                    <span>{selectedApp.documentsChecklist?.slc ? "✓" : "○"}</span>
                    <span>SLC / Report Card</span>
                  </div>
                </div>

                {/* Uploaded File Previews / Links */}
                {selectedApp.documentFiles && Object.values(selectedApp.documentFiles).some(Boolean) && (
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">Attached Digital Files</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.documentFiles.photo && (
                        <a href={selectedApp.documentFiles.photo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border text-[10px] font-bold text-primary hover:underline">
                          <Eye className="h-3 w-3" /> Candidate Photo
                        </a>
                      )}
                      {selectedApp.documentFiles.bForm && (
                        <a href={selectedApp.documentFiles.bForm} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border text-[10px] font-bold text-primary hover:underline">
                          <Eye className="h-3 w-3" /> B-Form Document
                        </a>
                      )}
                      {selectedApp.documentFiles.fatherCnic && (
                        <a href={selectedApp.documentFiles.fatherCnic} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border text-[10px] font-bold text-primary hover:underline">
                          <Eye className="h-3 w-3" /> Father CNIC
                        </a>
                      )}
                      {selectedApp.documentFiles.slc && (
                        <a href={selectedApp.documentFiles.slc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border text-[10px] font-bold text-primary hover:underline">
                          <Eye className="h-3 w-3" /> SLC Certificate
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Principal Decision Actions */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Registrar / Principal Decision Actions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    onClick={() => handleUpdateStatus(selectedApp, "approved")}
                    size="sm"
                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white w-full justify-center"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    <span>Approve Seat</span>
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedApp, "test_scheduled")}
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs font-bold text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 w-full justify-center"
                  >
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>Schedule Test</span>
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedApp, "enrolled")}
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs font-bold text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 w-full justify-center"
                  >
                    <Award className="h-3.5 w-3.5 mr-1" />
                    <span>Mark Enrolled</span>
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedApp, "rejected")}
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs font-bold text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full justify-center"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Reject</span>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                onClick={() => setSelectedApp(null)}
                variant="outline"
                className="w-full rounded-xl text-xs font-bold"
              >
                Close Dossier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

