"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Info,
  X,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const isRegistered = searchParams.get("registered") === "true";
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Instant Redirection State
  const [redirecting, setRedirecting] = useState<{
    active: boolean;
    destination: string;
    roleName: string;
    userName: string;
  }>({
    active: false,
    destination: "",
    roleName: "",
    userName: "",
  });

  useEffect(() => {
    // Pre-warm common routes in the background
    try {
      router.prefetch("/dashboard");
      router.prefetch("/teacher");
      router.prefetch("/student");
    } catch (_) {}

    if (initialEmail) {
      setEmail(initialEmail);
    } else {
      try {
        const savedEmail = localStorage.getItem("seneca_remembered_email");
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch (_) {
        // Safe fallback
      }
    }
  }, [initialEmail, router]);

  // Caps Lock detection on password field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && !e.getModifierState("CapsLock")) {
      setCapsLockActive(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMessage("Please enter your registered institutional email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem("seneca_remembered_email", emailTrimmed);
      } else {
        localStorage.removeItem("seneca_remembered_email");
      }
    } catch (_) {
      // Ignore storage errors
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrimmed,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Invalid email address or password.");
      }

      const role = data.data.user.role;
      const roleDisplayName =
        role === "principal"
          ? "Management Dashboard"
          : role === "super_admin"
          ? "Super Admin Console"
          : role === "teacher"
          ? "Faculty Portal"
          : role === "student"
          ? "Student Workspace"
          : "User Account";

      const destination = redirectPath || data.data.redirectTo || "/";

      // Show immediate stylish transition state
      setRedirecting({
        active: true,
        destination,
        roleName: roleDisplayName,
        userName: data.data.user.name,
      });

      toast.success("Welcome Back to Seneca!", {
        description: `Signed in as ${data.data.user.name}. Opening ${roleDisplayName}...`,
      });

      // Execute high-speed direct navigation
      window.location.replace(destination);
    } catch (err: any) {
      const msg = err.message || "Authentication failed. Please verify your credentials.";
      setErrorMessage(msg);
      toast.error("Sign In Failed", {
        description: msg,
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto space-y-3.5 sm:space-y-4 px-1 sm:px-0 relative overflow-hidden">
      {/* Brand Header - Compact & Professional */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="relative flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-seneca-amber/20 via-seneca-crimson/10 to-card p-2 border border-seneca-amber/30 dark:border-seneca-amber/40 shadow-lg shadow-seneca-amber/5">
          <Image
            src="/logo-seal.png"
            alt="Seneca Academy Crest"
            width={48}
            height={48}
            className="object-contain drop-shadow-sm"
            priority
          />
          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 border-2 border-background shadow-sm">
            <ShieldCheck className="h-2.5 w-2.5 text-white" />
          </div>
        </div>

        <div className="space-y-0.5 px-2">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-foreground">
            Sign In to <span className="text-seneca-crimson dark:text-seneca-amber-light">Seneca</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Enter your institutional email and password to access your dashboard.
          </p>
        </div>
      </div>

      {/* Login Card */}
      <Card className="border border-border/80 shadow-xl bg-card/98 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden w-full transition-all">
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Admission Application Notice Banner */}
          {redirectPath && (redirectPath.includes("admissions") || redirectPath.includes("apply")) && !redirecting.active && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-seneca-crimson/10 border border-seneca-crimson/30 p-3 text-xs text-seneca-crimson dark:text-seneca-amber-light font-medium animate-in fade-in-50">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-seneca-crimson" />
              <div>
                <div className="font-bold text-xs text-foreground">Online Admission Portal</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Sign in with your parent or applicant account to continue with your child&apos;s candidate application.
                </div>
              </div>
            </div>
          )}

          {/* Post-Registration Success Banner */}
          {isRegistered && !redirecting.active && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-semibold animate-in fade-in-50">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="font-bold text-xs">Account Created Successfully!</div>
                <div className="text-[11px] font-normal mt-0.5 text-emerald-600 dark:text-emerald-400">
                  Please enter your password below to sign in.
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && !redirecting.active && (
            <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/25 p-3 text-xs text-destructive font-medium animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed text-[11px]">{errorMessage}</span>
            </div>
          )}

          {/* Instant Redirection Overlay State */}
          {redirecting.active ? (
            <div className="py-6 px-2 text-center space-y-4 animate-in fade-in-50 duration-300">
              <div className="relative flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mx-auto shadow-inner">
                <CheckCircle2 className="h-7 w-7 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Authentication Verified!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Opening <span className="font-bold text-foreground">{redirecting.roleName}</span> for{" "}
                  <span className="font-bold text-seneca-crimson dark:text-seneca-amber">{redirecting.userName}</span>...
                </p>
              </div>

              {/* High-speed animated progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-seneca-crimson to-seneca-amber h-full w-full animate-pulse" />
              </div>

              <div className="pt-1">
                <a
                  href={redirecting.destination}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground underline"
                >
                  Click here if you are not redirected automatically
                </a>
              </div>
            </div>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Email Address */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    Institutional Email <span className="text-seneca-crimson">*</span>
                  </label>
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail("")}
                      className="text-[10px] text-muted-foreground hover:text-foreground font-medium hover:underline inline-flex items-center gap-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="name@seneca.edu.pk"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 sm:h-11 rounded-xl bg-background text-xs sm:text-sm font-medium focus-visible:ring-seneca-crimson/20"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    Password <span className="text-seneca-crimson">*</span>
                  </label>
                  <Link
                    href="/contact"
                    className="text-[11px] font-semibold text-seneca-crimson dark:text-seneca-amber-light hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your account password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    className="pl-9 pr-10 h-10 sm:h-11 rounded-xl bg-background text-xs sm:text-sm font-medium focus-visible:ring-seneca-crimson/20"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted focus:outline-none transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Caps Lock Detection Warning */}
                {capsLockActive && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 animate-pulse">
                    <Info className="h-3 w-3" />
                    <span>Caps Lock is ON</span>
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border text-seneca-crimson focus:ring-seneca-crimson cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Remember email on this device
                  </span>
                </label>
              </div>

              {/* Sign In Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 sm:h-11 text-xs sm:text-sm font-bold gap-1.5 rounded-xl shadow-md shadow-seneca-crimson/20 hover:shadow-lg hover:shadow-seneca-crimson/30 transition-all mt-1.5 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-seneca-crimson text-white hover:brightness-110"
                variant="glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying &amp; Launching...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Sign In to Seneca</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </>
                )}
              </Button>

              {/* Sign Up Navigation */}
              <div className="pt-1 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-seneca-crimson dark:text-seneca-amber-light hover:underline ml-0.5"
                >
                  Register Online →
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Security & System Trust Badges */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground pt-0.5">
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          <span>256-Bit SSL</span>
        </div>
        <div className="h-2.5 w-px bg-border" />
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LMS Online</span>
        </div>
        <div className="h-2.5 w-px bg-border" />
        <div className="flex items-center gap-1">
          <Lock className="h-2.5 w-2.5 text-seneca-amber" />
          <span>Role Guard</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-8 space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-seneca-crimson dark:text-seneca-amber" />
          <p className="text-xs font-bold text-muted-foreground">Loading Seneca Secure Portal...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
