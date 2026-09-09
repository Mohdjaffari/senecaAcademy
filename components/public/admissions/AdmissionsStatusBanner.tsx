"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdmissionApplyModal } from "./AdmissionApplyModal";
import { AuthRequiredDialog } from "./AuthRequiredDialog";
import { IAdmissionsStatusBannerData } from "@/lib/db/admissions-page-defaults";

interface AdmissionsStatusBannerProps {
  admissionsOpen?: boolean;
  admissionsSession?: string;
  admissionsDeadline?: string;
  admissionsNotice?: string;
  admissionsClosedNotice?: string;
  admissionsAnnouncement?: string;
  statusBanner?: IAdmissionsStatusBannerData;
}

export function AdmissionsStatusBanner({
  admissionsOpen = true,
  admissionsSession = "Session 2026–2027",
  admissionsDeadline = "",
  admissionsNotice = "",
  admissionsClosedNotice = "",
  admissionsAnnouncement = "",
  statusBanner,
}: AdmissionsStatusBannerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shouldApplyOnLoad = searchParams.get("apply") === "true";

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [userSession, setUserSession] = useState<{
    userId: string;
    email: string;
    name: string;
  } | null>(null);

  // Check auth session
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

  // Handle Apply for Admission Button Click with Auth Gate
  const handleApplyClick = async () => {
    setCheckingAuth(true);
    const session = await checkSession();
    setCheckingAuth(false);

    if (session) {
      setApplyModalOpen(true);
    } else {
      setAuthDialogOpen(true);
    }
  };

  // If redirected with ?apply=true, trigger application check
  useEffect(() => {
    if (shouldApplyOnLoad) {
      handleApplyClick();
    }
  }, [shouldApplyOnLoad]);

  if (statusBanner && statusBanner.isVisible === false) {
    return null;
  }

  // Open state variables
  const openBadge = statusBanner?.openState?.badgeText || `${admissionsSession} Admissions Active`;
  const openHeading = statusBanner?.openState?.heading || "Online Admission Application & Diagnostic Assessment Desk";
  const openDescription =
    statusBanner?.openState?.description ||
    admissionsAnnouncement ||
    admissionsNotice ||
    "Admissions are officially open across Playgroup, Primary, Middle, and BSEK Matriculation. Submit your online application below or visit our Soldier Bazar campus.";
  const openApplyBtn = statusBanner?.openState?.applyButtonLabel || "Apply for Admission Online";
  const openSecondaryBtn = statusBanner?.openState?.secondaryButtonLabel || "Fee Calculator";

  // Closed state variables
  const closedBadge = statusBanner?.closedState?.badgeText || `Admissions Closed • ${admissionsSession}`;
  const closedHeading = statusBanner?.closedState?.heading || "Admissions for Current Cycle Have Concluded";
  const closedMessage =
    statusBanner?.closedState?.closedMessage ||
    admissionsClosedNotice ||
    "Admissions for this academic session are currently closed. You may contact our admissions counseling team to register on the priority waiting list for the upcoming session intake.";
  const closedContactText = statusBanner?.closedState?.contactCounselorsText || "Speak with Admissions Counselor";
  const closedContactHref = statusBanner?.closedState?.contactCounselorsHref || "/contact";
  const closedExploreText = statusBanner?.closedState?.exploreCurriculumText || "Explore Curriculum";
  const closedExploreHref = statusBanner?.closedState?.exploreCurriculumHref || "/academics";

  return (
    <>
      <div className="container py-8 sm:py-10">
        {admissionsOpen ? (
          /* ADMISSIONS OPEN BANNER */
          <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-background to-seneca-crimson/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold py-0.5 px-2.5 uppercase tracking-wider"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                    {openBadge}
                  </Badge>

                  {admissionsDeadline && (
                    <Badge
                      variant="outline"
                      className="bg-seneca-amber/15 text-seneca-amber dark:text-seneca-amber-light border-seneca-amber/30 text-xs font-bold py-0.5 px-2.5"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Application Deadline: {admissionsDeadline}
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                  {openHeading}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {openDescription}
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <Button
                  onClick={handleApplyClick}
                  disabled={checkingAuth}
                  size="lg"
                  variant="glow"
                  className="rounded-2xl font-bold text-xs sm:text-sm gap-2 px-6 shadow-lg shadow-emerald-500/20 w-full sm:w-auto justify-center"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{openApplyBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-2xl font-semibold text-xs sm:text-sm px-5 hover:border-seneca-crimson w-full sm:w-auto justify-center"
                >
                  <a href="#fee-calculator">{openSecondaryBtn}</a>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ADMISSIONS CLOSED BANNER */
          <div className="relative overflow-hidden rounded-3xl border-2 border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-background to-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 h-48 w-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 text-xs font-bold py-0.5 px-3 uppercase tracking-wider"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mr-1 text-rose-500" />
                    {closedBadge}
                  </Badge>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                  {closedHeading}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {closedMessage}
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <Button
                  asChild
                  size="lg"
                  variant="glow"
                  className="rounded-2xl font-bold text-xs sm:text-sm gap-2 px-6 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto justify-center"
                >
                  <Link href={closedContactHref}>
                    <PhoneCall className="h-4 w-4" />
                    <span>{closedContactText}</span>
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-2xl font-semibold text-xs sm:text-sm px-5 hover:border-seneca-crimson w-full sm:w-auto justify-center"
                >
                  <Link href={closedExploreHref}>{closedExploreText}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Online Admission Application Modal */}
      <AdmissionApplyModal
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        admissionsSession={admissionsSession}
        admissionsDeadline={admissionsDeadline}
        initialUserData={userSession}
      />

      {/* Auth Required Interstitial Dialog */}
      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        redirectPath="/admissions?apply=true"
        admissionsSession={admissionsSession}
      />
    </>
  );
}

export default AdmissionsStatusBanner;
