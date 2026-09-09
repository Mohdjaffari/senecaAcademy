"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  Lock,
  UserPlus,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileCheck,
  Phone,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdmissionApplyModal } from "@/components/public/admissions/AdmissionApplyModal";

export default function AdmissionApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{
    userId: string;
    email: string;
    name: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.session && isMounted) {
            setSession({
              userId: data.data.session.userId,
              email: data.data.session.email,
              name: data.data.session.name,
            });
            setModalOpen(true);
          } else if (isMounted) {
            setSession(null);
          }
        } else if (isMounted) {
          setSession(null);
        }
      } catch {
        if (isMounted) setSession(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background py-10 sm:py-16">
      <div className="container max-w-4xl mx-auto px-4 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/admissions" className="hover:text-foreground">Admissions</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-bold text-foreground">Apply Online</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
            <p className="text-xs font-bold text-muted-foreground">Verifying Seneca Portal Session...</p>
          </div>
        )}

        {/* Unauthenticated State */}
        {!loading && !session && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
            <Card className="border border-border/90 bg-card/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden text-center p-6 sm:p-10 space-y-6">
              <div className="relative mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-seneca-crimson/15 via-seneca-amber/10 to-card p-4 border border-seneca-crimson/25 shadow-xl shadow-seneca-crimson/5">
                <GraduationCap className="h-10 w-10 text-seneca-crimson dark:text-seneca-amber" />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-sm">
                  <Lock className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber border-seneca-crimson/30 text-xs font-bold py-0.5 px-3 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Session 2026–2027 Admissions
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                  Parent / Applicant Authentication Required
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  To initiate and securely track your child&apos;s candidate dossier, upload official records (B-Form, birth certificate, photographs), and book your diagnostic assessment, please sign in or register below.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 text-left space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Candidate Data Protection:</strong> All records and certificates are stored under your verified parent profile.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-seneca-amber shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Saturday Assessment Booking:</strong> Automated diagnostic interview scheduling slot confirmation.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <FileCheck className="h-4 w-4 text-seneca-crimson shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Single Dossier Policy:</strong> Each account submits one active application to ensure prompt registrar evaluation.
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  asChild
                  variant="glow"
                  className="w-full h-12 rounded-2xl text-xs sm:text-sm font-bold gap-2 shadow-lg shadow-seneca-crimson/20"
                >
                  <Link href="/login?redirect=/admissions/apply">
                    <KeyRound className="h-4 w-4" />
                    <span>Sign In to Continue Online Application</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 rounded-2xl text-xs sm:text-sm font-bold gap-2 border-border hover:border-seneca-crimson"
                >
                  <Link href="/signup?redirect=/admissions/apply">
                    <UserPlus className="h-4 w-4" />
                    <span>Create Parent / Applicant Account</span>
                  </Link>
                </Button>

                <Button asChild variant="ghost" className="w-full h-9 rounded-xl text-xs text-muted-foreground">
                  <Link href="/admissions">Return to Admissions Overview</Link>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Authenticated State - Renders the Modal / Wizard */}
        {!loading && session && (
          <div className="space-y-6">
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold font-heading text-foreground">
                  Welcome, {session.name}!
                </h2>
                <p className="text-xs text-muted-foreground">
                  Signed in as <strong className="text-foreground">{session.email}</strong>. The Online Admission Dossier is active below.
                </p>
              </div>
              <Button
                onClick={() => setModalOpen(true)}
                variant="glow"
                className="rounded-2xl text-xs font-bold gap-2 px-8"
              >
                <UserPlus className="h-4 w-4" />
                <span>Open Admission Application Form</span>
              </Button>
            </Card>

            <AdmissionApplyModal
              open={modalOpen}
              onOpenChange={(op) => {
                setModalOpen(op);
                if (!op) router.push("/admissions");
              }}
              admissionsSession="Session 2026–2027"
              initialUserData={session}
            />
          </div>
        )}
      </div>
    </div>
  );
}
