"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Phone,
  Mail,
  ArrowRight,
  User,
  GraduationCap,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  applicationNumber: string;
  studentName: string;
  applyingForClass: string;
  fatherName: string;
  parentPhone: string;
  status: "submitted" | "under_review" | "test_scheduled" | "approved" | "rejected" | "enrolled";
  dateOfBirth: string;
  gender: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  Application["status"],
  { label: string; color: string; desc: string; step: number }
> = {
  submitted: {
    label: "Application Submitted",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    desc: "Your application has been received and queued for document verification.",
    step: 1,
  },
  under_review: {
    label: "Under Document Review",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    desc: "Admissions committee is reviewing previous academic transcripts and documents.",
    step: 2,
  },
  test_scheduled: {
    label: "Assessment Scheduled",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    desc: "Please attend the diagnostic interview and aptitude assessment as scheduled.",
    step: 3,
  },
  approved: {
    label: "Admission Approved",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    desc: "Congratulations! Admission offer letter is available for collection at the campus.",
    step: 4,
  },
  enrolled: {
    label: "Officially Enrolled",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    desc: "Fee voucher cleared and student roll number generated.",
    step: 4,
  },
  rejected: {
    label: "Application Closed",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    desc: "Seat capacity reached for the requested grade level.",
    step: 2,
  },
};

export default function AdmissionStatusPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<{ role: string; name: string } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [authRes, statusRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/admissions/my-status"),
      ]);

      const authData = await authRes.json();
      if (authData.success && authData.data?.session) {
        setSession(authData.data.session);
      }

      const statusData = await statusRes.json();
      if (!statusRes.ok || !statusData.success) {
        throw new Error(statusData.error?.message || "Failed to load application status.");
      }

      setApplications(statusData.data.applications || []);
    } catch (err: any) {
      setError(err.message || "Please log in to track your application.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background py-10 sm:py-16">
      <div className="container max-w-4xl mx-auto px-4 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Admissions 2026–2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              Admission Application <span className="text-seneca-crimson dark:text-seneca-amber-light">Tracker</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Live status, document verification updates, and Saturday assessment schedules.
            </p>
          </div>
          <Button
            onClick={fetchStatus}
            variant="outline"
            size="sm"
            disabled={loading}
            className="rounded-xl gap-2 text-xs font-bold self-start sm:self-auto"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>Refresh Status</span>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
            <p className="text-xs font-bold text-muted-foreground">Checking Admissions Records...</p>
          </div>
        )}

        {/* Error / Not Logged In State */}
        {!loading && error && (
          <Card className="border border-destructive/30 bg-destructive/5 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Authentication Required</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                {error}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild variant="glow" className="rounded-xl text-xs font-bold">
                <Link href="/login?redirect=/admissions/status">Sign In to View Application</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl text-xs font-bold">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Role is staff or student, not prospective user */}
        {!loading && !error && session && session.role !== "user" && (
          <Card className="border border-seneca-amber/30 bg-seneca-amber/5 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <GraduationCap className="h-10 w-10 text-seneca-amber mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Logged in as {session.role.replace("_", " ").toUpperCase()}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                The public admission application tracker is designed for applicant parents. Institutional faculty and staff can access their workspace directly below.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {["super_admin", "principal"].includes(session.role) ? (
                <Button asChild variant="glow" className="rounded-xl text-xs font-bold">
                  <Link href="/dashboard/admissions">Manage Admissions in Admin Dashboard</Link>
                </Button>
              ) : session.role === "teacher" ? (
                <Button asChild variant="glow" className="rounded-xl text-xs font-bold">
                  <Link href="/teacher">Open Teacher Portal</Link>
                </Button>
              ) : (
                <Button asChild variant="glow" className="rounded-xl text-xs font-bold">
                  <Link href="/student">Open Student Portal</Link>
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* No Applications Found State (for user role) */}
        {!loading && !error && (!session || session.role === "user") && applications.length === 0 && (
          <Card className="border border-border/80 bg-card/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl">
            <div className="h-16 w-16 rounded-3xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center mx-auto">
              <FileText className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-xl font-bold font-heading text-foreground">
                No Active Applications Found
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We couldn&apos;t find any submitted admission applications under your email address. If you haven&apos;t applied yet, submissions for the 2026–2027 academic session are currently open.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild variant="glow" className="rounded-xl text-xs font-bold gap-2 px-6">
                <Link href="/admissions">
                  <GraduationCap className="h-4 w-4" />
                  <span>Apply for Admission Now</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Applications List */}
        {!loading && !error && applications.length > 0 && (
          <div className="space-y-6">
            {applications.map((app) => {
              const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;

              return (
                <Card
                  key={app.id}
                  className="border border-border/80 bg-card/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl"
                >
                  <CardHeader className="p-5 sm:p-6 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center font-extrabold text-sm font-mono shrink-0">
                        {app.applyingForClass}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-foreground">
                            {app.studentName}
                          </h2>
                          <Badge variant="outline" className={cn("text-[10px] font-bold", config.color)}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          Application ID: <span className="font-bold text-foreground">{app.applicationNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground sm:text-right">
                      Submitted on: {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-8 space-y-6">
                    {/* Status Progress Timeline */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                        Application Progress
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs font-semibold">
                        {[
                          { title: "Submitted", step: 1 },
                          { title: "Review", step: 2 },
                          { title: "Assessment", step: 3 },
                          { title: "Decision", step: 4 },
                        ].map((s) => (
                          <div key={s.title} className="space-y-1.5">
                            <div
                              className={cn(
                                "h-2 w-full rounded-full transition-all duration-300",
                                config.step >= s.step
                                  ? "bg-seneca-crimson dark:bg-seneca-amber"
                                  : "bg-muted"
                              )}
                            />
                            <span
                              className={cn(
                                config.step >= s.step
                                  ? "text-foreground font-bold"
                                  : "text-muted-foreground"
                              )}
                            >
                              {s.title}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-3.5 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5 mt-2">
                        <Clock className="h-4 w-4 text-seneca-amber shrink-0 mt-0.5" />
                        <span>{config.desc}</span>
                      </div>
                    </div>

                    {/* Applicant Information Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Father / Guardian:</span>
                        <span className="font-bold text-foreground">{app.fatherName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Applying for Grade:</span>
                        <span className="font-bold text-foreground">{app.applyingForClass}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Emergency Contact:</span>
                        <span className="font-bold text-foreground">{app.parentPhone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Admissions Helpdesk Support Card */}
        <Card className="border border-border/80 bg-muted/30 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground">Need help with your application?</h2>
              <p className="text-xs text-muted-foreground">
                Contact our Admissions Desk at Soldier Bazar Campus (Mon–Sat, 8:00 AM – 3:00 PM).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
                <a href="tel:+922132251984">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>021-32251984</span>
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
                <a href="mailto:admissions@seneca.edu.pk">
                  <Mail className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Email Admissions</span>
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
