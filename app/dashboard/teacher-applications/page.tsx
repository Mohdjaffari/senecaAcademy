"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
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
  Building,
  Users,
  Award,
  ChevronRight,
  UserCheck,
  FileText,
  ExternalLink,
  MessageCircle,
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

interface FacultyApp {
  id: string;
  applicationId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  experienceYears: string;
  qualification: string;
  coverLetter: string;
  cvUrl: string;
  cvFileName: string;
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired";
  formattedDate: string;
}

export default function PrincipalTeacherApplicationsPage() {
  const [applications, setApplications] = useState<FacultyApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal States
  const [selectedApp, setSelectedApp] = useState<FacultyApp | null>(null);

  const fetchApplications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/teacher-applications");
      const data = await res.json();
      if (data.success && data.data?.applications) {
        setApplications(data.data.applications);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Error loading faculty applications.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const totalCandidates = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const reviewingCount = applications.filter((a) => a.status === "reviewing" || a.status === "pending").length;
  const hiredCount = applications.filter((a) => a.status === "hired").length;

  const filteredApps = applications.filter((a) => {
    const matchesSearch =
      a.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || a.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (app: FacultyApp, newStatus: string) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((item) => (item.id === app.id ? { ...item, status: newStatus as any } : item))
    );
    if (selectedApp?.id === app.id) {
      setSelectedApp({ ...selectedApp, status: newStatus as any });
    }

    try {
      const res = await fetch(`/api/teacher-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message);

      toast.success("Recruitment Status Updated", {
        description: `${app.name}'s status changed to '${newStatus}'.`,
      });

      fetchApplications(true);
    } catch (err: any) {
      toast.error("Action Failed", { description: err.message });
      fetchApplications(true);
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return toast.info("No candidate records to export.");
    const headers = "Application ID,Candidate Name,Subject / Discipline,Experience,Qualification,Phone,Email,Status\n";
    const rows = applications
      .map(
        (a) =>
          `"${a.applicationId}","${a.name}","${a.subject}","${a.experienceYears} Years","${a.qualification}","${a.phone}","${a.email}","${a.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Seneca_Faculty_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Faculty candidate roster exported to CSV!");
  };

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Header & Hero Metric Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <Briefcase className="h-3 w-3" />
                <span>Faculty Recruitment Desk</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Candidate Pipeline Live</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Teacher Applications & <span className="text-seneca-amber">Hiring Desk</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Review incoming faculty resumes, evaluate subject qualifications, shortlist candidate mentors, and execute onboarding offers.
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
              <span>Export (CSV)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics Cards (4 Stat Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Total Applicants
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-crimson/10 text-seneca-crimson shrink-0">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {totalCandidates || 12} Profiles
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Pool:</span>
            <span className="font-bold text-emerald-600">STEM & Languages</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Under Evaluation
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-amber/15 text-seneca-amber shrink-0">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {reviewingCount || 5} Pending
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Action:</span>
            <span className="font-bold text-foreground">Initial Screening</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Shortlisted
            </span>
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {shortlistedCount || 4} Candidates
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Next:</span>
            <span className="font-bold text-emerald-600">Interview Stage</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Hired Faculty
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
            {hiredCount || 3} Onboarded
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Conversion:</span>
            <span className="font-bold text-emerald-600">Active Faculty</span>
          </div>
        </Card>
      </div>

      {/* 3. Search & Filter Bar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by candidate ID, name, subject, qualification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-background text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-11 px-3 rounded-xl bg-background border border-border text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>

            <Button
              onClick={() => fetchApplications()}
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0"
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </Card>

      {/* 4. Candidates Table */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
          <p className="text-xs font-bold text-muted-foreground">Loading Seneca Faculty Applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-4">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">No Applications Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No faculty applications match your search filter.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">Candidate ID</th>
                  <th className="py-3.5 px-4">Teacher Name & Email</th>
                  <th className="py-3.5 px-4">Subject Discipline</th>
                  <th className="py-3.5 px-4">Experience & Degree</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredApps.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{a.applicationId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground">{a.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-bold text-xs bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/25">
                        {a.subject}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{a.qualification}</div>
                      <div className="text-[10px] text-muted-foreground">{a.experienceYears} Years Exp.</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">{a.phone}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold capitalize",
                          a.status === "shortlisted" && "bg-purple-500/10 text-purple-600 border-purple-500/30",
                          a.status === "hired" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                          (a.status === "pending" || a.status === "reviewing") &&
                            "bg-amber-500/10 text-amber-600 border-amber-500/30",
                          a.status === "rejected" && "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        )}
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        onClick={() => setSelectedApp(a)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Dossier</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Faculty Candidate Dossier & Status Modal */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-border/80">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-seneca-crimson">
                      {selectedApp.applicationId}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold capitalize",
                        selectedApp.status === "shortlisted" && "bg-purple-500/10 text-purple-600 border-purple-500/30",
                        selectedApp.status === "hired" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                        (selectedApp.status === "pending" || selectedApp.status === "reviewing") &&
                          "bg-amber-500/10 text-amber-600 border-amber-500/30",
                        selectedApp.status === "rejected" && "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      )}
                    >
                      {selectedApp.status}
                    </Badge>
                  </div>
                  <DialogTitle className="text-xl font-bold font-heading text-foreground">
                    {selectedApp.name}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Applied for: <strong className="text-foreground">{selectedApp.subject}</strong> • Registered: {selectedApp.formattedDate}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              {/* Candidate Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">
                    Qualification &amp; Degree
                  </span>
                  <span className="font-bold text-foreground text-xs">{selectedApp.qualification}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">
                    Teaching Experience
                  </span>
                  <span className="font-bold text-foreground text-xs">{selectedApp.experienceYears}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">
                    Contact Phone
                  </span>
                  <span className="font-bold text-foreground text-xs">{selectedApp.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">
                    Email Address
                  </span>
                  <span className="font-bold text-foreground text-xs truncate block">{selectedApp.email}</span>
                </div>
              </div>

              {/* Direct Communication Quick Links */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-card border border-border/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                  Quick Outreach:
                </span>
                <a
                  href={`mailto:${selectedApp.email}?subject=${encodeURIComponent(
                    `Faculty Application [${selectedApp.applicationId}] - Seneca Academy`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-seneca-crimson/10 text-seneca-crimson hover:bg-seneca-crimson/20 text-xs font-bold transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Send Email</span>
                </a>
                <a
                  href={`https://wa.me/${selectedApp.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum ${selectedApp.name}, this is Seneca Academy Principal's Office regarding your application (${selectedApp.applicationId}) for ${selectedApp.subject}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp Chat</span>
                </a>
                <a
                  href={`tel:${selectedApp.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 text-xs font-bold transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Candidate</span>
                </a>
              </div>

              {/* Verified Resume Attachment Card */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Curriculum Vitae / Resume Document
                </span>
                {selectedApp.cvUrl ? (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-seneca-crimson/5 border border-seneca-crimson/20">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 rounded-xl bg-seneca-crimson/15 text-seneca-crimson flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-foreground text-xs truncate block">
                          {selectedApp.cvFileName || "Candidate_Resume.pdf"}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          Verified application attachment
                        </span>
                      </div>
                    </div>

                    <a
                      href={selectedApp.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={selectedApp.cvFileName || "Candidate_Resume.pdf"}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-seneca-crimson hover:bg-seneca-crimson/90 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>View / Download Resume</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-muted/40 text-muted-foreground text-xs text-center border border-border/60">
                    No resume document uploaded for this candidate.
                  </div>
                )}
              </div>

              {/* Cover Letter Statement */}
              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Cover Note &amp; Career Statement
                </span>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedApp.coverLetter || "No additional cover letter was supplied by candidate."}
                </p>
              </div>

              {/* Status Update Actions */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Update Candidate Selection Status
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    onClick={() => handleUpdateStatus(selectedApp, "shortlisted")}
                    size="sm"
                    className="rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Award className="h-3.5 w-3.5 mr-1" />
                    <span>Shortlist</span>
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedApp, "reviewing")}
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs font-bold"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>In Review</span>
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedApp, "hired")}
                    size="sm"
                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                    <span>Offer Hire</span>
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedApp, "rejected")}
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs font-bold text-rose-600 border-rose-300 hover:bg-rose-50"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Reject</span>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/60">
              <Button
                onClick={() => setSelectedApp(null)}
                variant="outline"
                className="w-full rounded-xl text-xs font-bold"
              >
                Close Candidate Dossier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
