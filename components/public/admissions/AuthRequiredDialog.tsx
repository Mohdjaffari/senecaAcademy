"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  UserPlus,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  Sparkles,
  Calendar,
  KeyRound,
  GraduationCap,
} from "lucide-react";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string;
  admissionsSession?: string;
}

export function AuthRequiredDialog({
  open,
  onOpenChange,
  redirectPath = "/admissions?apply=true",
  admissionsSession = "Session 2026–2027",
}: AuthRequiredDialogProps) {
  const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`;
  const signupUrl = `/signup?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-3xl p-5 sm:p-7 shadow-2xl border border-border/80 bg-card overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-seneca-crimson via-seneca-amber to-seneca-crimson" />

        <div className="pt-2 text-center space-y-4">
          {/* Institutional Crest / Icon */}
          <div className="relative mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-seneca-crimson/15 via-seneca-amber/10 to-card p-3 border border-seneca-crimson/25 shadow-lg shadow-seneca-crimson/5">
            <GraduationCap className="h-8 w-8 text-seneca-crimson dark:text-seneca-amber" />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-sm">
              <Lock className="h-3 w-3" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1.5">
              <Badge
                variant="outline"
                className="bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber border-seneca-crimson/30 text-[10px] font-bold py-0.5 px-2.5 uppercase"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {admissionsSession}
              </Badge>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
              Parent Portal Authentication Required
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              To safeguard your child&apos;s candidate records, upload official documents, and receive live Saturday assessment updates, please sign in or register an account.
            </DialogDescription>
          </div>

          {/* Value Propositions / Why Sign In */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 text-left space-y-2 text-xs">
            <div className="flex items-start gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Official Candidate Dossier:</strong> Securely upload B-Form, photograph, and previous transcripts.
              </span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-seneca-amber shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Saturday Assessment Booking:</strong> Automated diagnostic interview scheduling.
              </span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <FileCheck className="h-4 w-4 text-seneca-crimson shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Live Status Tracker:</strong> Track verification and fee concessions directly.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              asChild
              variant="glow"
              className="w-full h-11 rounded-2xl text-xs sm:text-sm font-bold gap-2 shadow-md shadow-seneca-crimson/20"
            >
              <Link href={loginUrl}>
                <KeyRound className="h-4 w-4" />
                <span>Sign In to Continue Application</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full h-10 rounded-2xl text-xs font-bold gap-2 border-border/80 hover:border-seneca-crimson"
            >
              <Link href={signupUrl}>
                <UserPlus className="h-4 w-4" />
                <span>Create New Parent / Applicant Account</span>
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              Cancel &amp; Return
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthRequiredDialog;
