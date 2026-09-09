"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "Enter password", color: "bg-muted" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak (add numbers/symbols)", color: "bg-red-500" };
    if (score === 2 || score === 3)
      return { score: 2, label: "Good password", color: "bg-amber-500" };
    return { score: 3, label: "Strong password", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side Validation Checks
    if (name.trim().length < 2) {
      setErrorMessage("Please enter your full name (minimum 2 characters).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (phone.trim().length < 10) {
      setErrorMessage("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      toast.error("Weak Password", {
        description: "Please choose a password with 8 or more characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify and re-enter.");
      toast.error("Password Mismatch", {
        description: "Your password confirmation does not match.",
      });
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the terms and honor code to continue.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error?.message || "Registration failed. Please verify your details."
        );
      }

      toast.success("Account Created Successfully!", {
        description: `Welcome ${name}! Please sign in to access your portal.`,
      });

      // Instant navigation to Login page with success indicator and pre-filled email
      window.location.href = `/login?registered=true&email=${encodeURIComponent(email.trim())}`;
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account.");
      toast.error("Registration Error", {
        description: err.message || "Please check your information and try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto space-y-3.5 sm:space-y-4 px-1 sm:px-0 relative overflow-hidden">
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
        </div>
        <div className="space-y-0.5 px-2">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-foreground">
            Create Your <span className="text-seneca-crimson dark:text-seneca-amber-light">Account</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Join Seneca Academy LMS to access courses, schedules, attendance, and records.
          </p>
        </div>
      </div>

      {/* Main Registration Card */}
      <Card className="border border-border/80 bg-card/98 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden w-full">
        <CardContent className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed text-[11px]">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Full Name <span className="text-seneca-crimson">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  required
                  type="text"
                  placeholder="e.g. Muhammad Bilal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 h-10 sm:h-11 rounded-xl bg-background text-xs sm:text-sm font-medium focus-visible:ring-seneca-crimson/20"
                />
              </div>
            </div>

            {/* Email Address & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Email Address <span className="text-seneca-crimson">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    required
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 sm:h-11 rounded-xl bg-background text-xs sm:text-sm font-medium focus-visible:ring-seneca-crimson/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Phone / WhatsApp <span className="text-seneca-crimson">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    required
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 h-10 sm:h-11 rounded-xl bg-background text-xs sm:text-sm font-medium focus-visible:ring-seneca-crimson/20"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Password <span className="text-seneca-crimson">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-10 sm:h-11 rounded-xl bg-background text-xs sm:text-sm font-medium focus-visible:ring-seneca-crimson/20"
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
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Confirm Password <span className="text-seneca-crimson">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-9 h-10 sm:h-11 rounded-xl bg-background text-xs sm:text-sm font-medium focus-visible:ring-seneca-crimson/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted focus:outline-none transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className="font-bold text-foreground">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-1">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      strength.score >= 1 ? strength.color : "bg-muted"
                    )}
                    style={{ width: "33%" }}
                  />
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      strength.score >= 2 ? strength.color : "bg-muted"
                    )}
                    style={{ width: "33%" }}
                  />
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      strength.score >= 3 ? strength.color : "bg-muted"
                    )}
                    style={{ width: "34%" }}
                  />
                </div>
              </div>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start gap-2 pt-0.5">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-border mt-0.5 text-seneca-crimson focus:ring-seneca-crimson cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-muted-foreground leading-tight select-none">
                I agree to the{" "}
                <Link href="/about" className="text-seneca-crimson dark:text-seneca-amber-light font-bold hover:underline">
                  Seneca Institutional Honor Code
                </Link>{" "}
                and Student Privacy Policy.
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="glow"
              className="w-full h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-bold gap-1.5 shadow-md shadow-seneca-crimson/20 hover:shadow-lg hover:shadow-seneca-crimson/30 transition-all mt-1 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-seneca-crimson text-white hover:brightness-110"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sign Up &amp; Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </>
              )}
            </Button>
          </form>

          {/* Already have an account link */}
          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-seneca-crimson dark:text-seneca-amber-light hover:underline ml-0.5"
            >
              Sign In Here →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
