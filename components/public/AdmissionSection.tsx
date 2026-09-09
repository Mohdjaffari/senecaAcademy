"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdmissionApplyModal } from "@/components/public/admissions/AdmissionApplyModal";
import { AuthRequiredDialog } from "@/components/public/admissions/AuthRequiredDialog";

export function AdmissionSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [userSession, setUserSession] = useState<{
    userId: string;
    email: string;
    name: string;
  } | null>(null);

  const checkSession = useCallback(async (): Promise<{ userId: string; email: string; name: string } | null> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.session) {
          const s = {
            userId: data.data.session.userId,
            email: data.data.session.email,
            name: data.data.session.name,
          };
          setUserSession(s);
          return s;
        }
      }
      setUserSession(null);
      return null;
    } catch {
      setUserSession(null);
      return null;
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleApplyClick = async () => {
    setCheckingAuth(true);
    const session = await checkSession();
    setCheckingAuth(false);

    if (session) {
      setModalOpen(true);
    } else {
      setAuthDialogOpen(true);
    }
  };

  return (
    <section id="admissions" className="py-14 sm:py-20 lg:py-28 bg-gradient-to-b from-background via-muted/30 to-background border-t border-border">
      <div className="container px-3.5 sm:px-6">
        <div className="rounded-2xl sm:rounded-3xl border border-seneca-crimson/20 bg-gradient-to-br from-card via-card to-seneca-crimson/5 p-4 sm:p-8 lg:p-14 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-seneca-crimson/30 bg-seneca-crimson/10 px-3 py-1 text-[11px] sm:text-xs font-bold text-seneca-crimson dark:text-seneca-amber-light">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Admissions 2026–2027 Open • Playgroup to 2nd Year</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-foreground tracking-tight leading-tight">
                Begin Your Child&apos;s Journey to Academic & Moral Excellence.
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
                We accept online admission registrations from Playgroup, Nursery, Prep/KG, Primary, Middle, Secondary (Matric & O-Levels), through 2nd Year (Intermediate / College). Dynamic active sections are available per grade capped at 35 students.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-background border border-border/80 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-seneca-crimson font-mono">Step 1</span>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">Online Form</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">Submit student & parent details below.</p>
                </div>
                <div className="p-4 rounded-2xl bg-background border border-border/80 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-seneca-amber font-mono">Step 2</span>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">Assessment</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">Diagnostic test & parent interview.</p>
                </div>
                <div className="p-4 rounded-2xl bg-background border border-border/80 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-emerald-600 font-mono">Step 3</span>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">Enrollment</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">Fee voucher & LMS onboarding.</p>
                </div>
              </div>

              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <Button
                  size="lg"
                  variant="glow"
                  disabled={checkingAuth}
                  onClick={handleApplyClick}
                  className="rounded-full px-8 gap-2 font-bold shadow-lg shadow-seneca-crimson/20 w-full sm:w-auto justify-center"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Start Online Application</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <span className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Zero application processing fee</span>
                </span>
              </div>
            </div>

            {/* Right Quick Assessment Highlights */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-md space-y-4 sm:space-y-5">
                <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                  Admission Requirements Checklist
                </h3>
                <ul className="space-y-2.5 sm:space-y-3 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Copy of Student&apos;s B-Form / Birth Certificate</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Copy of Father / Guardian CNIC</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Previous School Leaving Certificate & Report Card</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>4 Recent Passport-sized Photographs (Blue background)</span>
                  </li>
                </ul>

                <div className="pt-3 sm:pt-4 border-t border-border/80">
                  <div className="text-xs font-semibold text-foreground">
                    Need Admissions Assistance?
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Call Admissions Office: <span className="font-bold text-seneca-crimson">+92 335 7413777</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified 6-Step Admission Form Modal */}
      <AdmissionApplyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        admissionsSession="Session 2026–2027"
        initialUserData={userSession}
      />

      {/* Auth Gate Dialog */}
      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        redirectPath="/admissions?apply=true"
        admissionsSession="Session 2026–2027"
      />
    </section>
  );
}

export default AdmissionSection;
