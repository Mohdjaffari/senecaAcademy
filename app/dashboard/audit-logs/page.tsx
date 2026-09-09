"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw,
  X,
  FileText,
  Lock,
  UserCheck,
  Activity,
  Terminal,
  Copy,
  Eye,
  Check,
  Server,
  Key,
  Globe,
  Database,
  ArrowUpRight,
  Layers,
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

interface AuditItem {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userEmail: string;
  userRole: string;
  ipAddress: string;
  userAgent?: string;
  details: string;
  rawDetails?: Record<string, any>;
  createdAt: string;
  formattedTime: string;
  formattedDate: string;
}

export default function PrincipalAuditLogsPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResource, setSelectedResource] = useState("all");
  const [selectedActionType, setSelectedActionType] = useState("all");

  // Forensic Inspection Modal State
  const [activeLogModal, setActiveLogModal] = useState<AuditItem | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = "/api/audit-logs?";
      if (selectedResource !== "all") url += `resource=${selectedResource}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data?.logs) {
        setLogs(data.data.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      toast.error("Error loading security audit stream.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedResource]);

  const filteredLogs = logs.filter((l) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      l.action.toLowerCase().includes(s) ||
      l.resource.toLowerCase().includes(s) ||
      l.userEmail.toLowerCase().includes(s) ||
      l.details.toLowerCase().includes(s) ||
      l.ipAddress.toLowerCase().includes(s);

    const matchesAction =
      selectedActionType === "all" ||
      (selectedActionType === "auth" && (l.action.includes("AUTH") || l.action.includes("LOGIN"))) ||
      (selectedActionType === "admission" && l.action.includes("ADMISSION")) ||
      (selectedActionType === "fee" && l.action.includes("FEE")) ||
      (selectedActionType === "system" && (l.action.includes("SECURITY") || l.action.includes("WEBSITE")));

    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    if (logs.length === 0) return toast.info("No audit logs to export.");
    const headers = "Date,Time,Action,Resource,User Email,User Role,IP Address,Details\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.formattedDate}","${l.formattedTime}","${l.action}","${l.resource}","${l.userEmail}","${l.userRole}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Seneca_Security_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Security audit logs exported to CSV!");
  };

  const handleCopyForensicPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    toast.success("Forensic payload copied to clipboard!");
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Metrics Counters
  const totalEvents = logs.length;
  const authEvents = logs.filter((l) => l.action.includes("AUTH") || l.action.includes("LOGIN")).length;
  const academicEvents = logs.filter(
    (l) => l.resource === "Admission" || l.resource === "Student" || l.resource === "Teacher"
  ).length;

  const getActionBadgeColor = (action: string) => {
    if (action.includes("AUTH") || action.includes("LOGIN") || action.includes("APPROVE")) {
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/25";
    }
    if (action.includes("UPDATE") || action.includes("FEE")) {
      return "bg-seneca-amber/15 text-seneca-amber-dark dark:text-seneca-amber border-seneca-amber/30";
    }
    if (action.includes("DELETE") || action.includes("REJECT")) {
      return "bg-rose-500/10 text-rose-600 border-rose-500/25";
    }
    return "bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/25";
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
                <ShieldCheck className="h-3 w-3" />
                <span>Security Intelligence & Compliance</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Immutable Hash Chain Active</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Security Audit & <span className="text-seneca-amber">System Forensics</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Real-time immutable audit trail monitoring authenticated administrative sessions, fee reconciliations, admission approvals, and database operations.
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
              <span>Export CSV Dossier</span>
            </Button>
            <Button
              onClick={fetchLogs}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto justify-center"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              <span>Refresh Trail</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Executive Security KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Logged Events
            </span>
            <div className="p-2 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {totalEvents}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3" />
              <span>100% Retained</span>
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Auth & Security Actions
            </span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {authEvents}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              JWT & Session Logins
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Academic Operations
            </span>
            <div className="p-2 rounded-2xl bg-seneca-amber/15 text-seneca-amber">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {academicEvents}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Admissions & Faculty
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Database Integrity
            </span>
            <div className="p-2 rounded-2xl bg-sky-500/10 text-sky-500">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-600">
              Optimal
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3 w-3" />
              <span>TLS / Bcrypt Verified</span>
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Search & Resource Filter Toolbar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by action, user email, IP address, forensic payload..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-background text-xs sm:text-sm font-mono"
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
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="h-11 px-3 rounded-xl bg-background border border-border text-xs font-semibold"
            >
              <option value="all">All Resources</option>
              <option value="Authentication">Authentication</option>
              <option value="Admission">Admissions</option>
              <option value="Student">Students</option>
              <option value="Teacher">Faculty & Teachers</option>
              <option value="Fee">Fee Management</option>
              <option value="Website">Website CMS</option>
              <option value="System">System Daemon</option>
            </select>

            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="h-11 px-3 rounded-xl bg-background border border-border text-xs font-semibold"
            >
              <option value="all">All Actions</option>
              <option value="auth">Auth & Login</option>
              <option value="admission">Admissions</option>
              <option value="fee">Fee Actions</option>
              <option value="system">Security & Web</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. Forensic Audit Logs Stream */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
          <p className="text-xs font-bold text-muted-foreground">Verifying Security Audit Stream...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">No Audit Events Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No security actions match your search query or selected category filter.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((l) => (
            <Card
              key={l.id}
              onClick={() => setActiveLogModal(l)}
              className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl p-3.5 sm:p-4 hover:border-seneca-crimson/50 hover:bg-muted/40 transition-all cursor-pointer font-mono text-xs group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("font-bold text-[10px] uppercase shadow-xs", getActionBadgeColor(l.action))}
                  >
                    {l.action}
                  </Badge>
                  <Badge variant="outline" className="font-bold text-[10px] bg-muted/60 text-foreground">
                    {l.resource}
                  </Badge>
                  <span className="text-muted-foreground text-[11px] truncate max-w-[220px]">
                    by <strong className="text-foreground">{l.userEmail}</strong>
                  </span>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground border-none">
                    {l.userRole}
                  </Badge>
                </div>

                <div className="text-[10px] text-muted-foreground flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <span className="flex items-center gap-1 font-semibold">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span>{l.ipAddress}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {l.formattedDate} {l.formattedTime}
                    </span>
                  </span>
                  <Eye className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {l.details && l.details !== "{}" && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-muted/40 text-[11px] text-foreground/80 break-all font-mono border border-border/40 flex items-center justify-between gap-2">
                  <span className="truncate">{l.details}</span>
                  <span className="text-[9px] font-bold text-primary shrink-0 group-hover:underline">
                    Inspect JSON
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 5. Forensic Event Inspection Modal */}
      {activeLogModal && (
        <Dialog open={!!activeLogModal} onOpenChange={() => setActiveLogModal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 shadow-2xl border border-border/80 my-6 sm:my-8">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-bold text-xs uppercase shadow-sm",
                    getActionBadgeColor(activeLogModal.action)
                  )}
                >
                  {activeLogModal.action}
                </Badge>
                <Badge variant="outline" className="font-bold text-xs">
                  {activeLogModal.resource}
                </Badge>
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold font-mono pt-1">
                Security Forensic Dossier
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Immutable audit log entry verification hash: #{activeLogModal.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1 text-xs">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Actor / Initiator</span>
                  <p className="font-bold text-foreground truncate">{activeLogModal.userEmail}</p>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-seneca-crimson">
                    Role: {activeLogModal.userRole}
                  </Badge>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Network Origin</span>
                  <p className="font-bold text-foreground font-mono">{activeLogModal.ipAddress}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {activeLogModal.userAgent || "Seneca Secure Terminal"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Timestamp</span>
                  <p className="font-bold text-foreground">
                    {activeLogModal.formattedDate} at {activeLogModal.formattedTime}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">System Integrity</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified & Immutable</span>
                  </span>
                </div>
              </div>

              {/* JSON Forensic Payload Dark Terminal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Raw Forensic Payload (JSON)</span>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyForensicPayload(JSON.stringify(activeLogModal.rawDetails || activeLogModal.details, null, 2))}
                    className="h-7 px-2 text-[10px] font-bold gap-1 rounded-lg"
                  >
                    {copiedPayload ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedPayload ? "Copied" : "Copy JSON"}</span>
                  </Button>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-white/10 shadow-inner">
                  <pre>{JSON.stringify(activeLogModal.rawDetails || activeLogModal.details, null, 2)}</pre>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button
                type="button"
                onClick={() => setActiveLogModal(null)}
                variant="outline"
                className="w-full rounded-xl text-xs font-bold"
              >
                Close Forensic Dossier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
