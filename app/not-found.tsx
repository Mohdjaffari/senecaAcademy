import Link from "next/link";
import { Search, Home, GraduationCap, Lock, CreditCard, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-card/50 to-background px-4 py-16 text-center">
      {/* Brand Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-seneca-amber/30 bg-seneca-amber/10 px-4 py-1.5 text-xs font-bold text-seneca-amber mb-6">
        <Building2 className="h-3.5 w-3.5" />
        <span>Seneca Academy • Soldier Bazar Karachi</span>
      </div>

      {/* 404 Icon & Title */}
      <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-seneca-crimson/10 text-seneca-crimson mb-6 shadow-xl border border-seneca-crimson/20">
        <Search className="h-10 w-10 sm:h-12 sm:w-12" />
      </div>

      <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-seneca-amber font-mono">
        HTTP 404 • Page Not Found
      </span>
      <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold font-heading text-foreground tracking-tight max-w-xl">
        Looking for a Seneca Page?
      </h1>
      <p className="mt-3 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
        The requested address could not be found or has moved. Explore the official Seneca Academy portals and directories below:
      </p>

      {/* Quick Navigation Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full text-left">
        <Link
          href="/"
          className="group p-4 rounded-2xl border border-border bg-card/80 hover:border-seneca-crimson/40 hover:bg-card transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-seneca-crimson/10 text-seneca-crimson group-hover:bg-seneca-crimson group-hover:text-white transition-colors">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Official Website</div>
              <div className="text-[10px] text-muted-foreground">Main campus homepage</div>
            </div>
          </div>
        </Link>

        <Link
          href="/admissions"
          className="group p-4 rounded-2xl border border-border bg-card/80 hover:border-seneca-amber/40 hover:bg-card transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-seneca-amber/10 text-seneca-amber group-hover:bg-seneca-amber group-hover:text-black transition-colors">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Admissions 2026</div>
              <div className="text-[10px] text-muted-foreground">Playgroup to 2nd Year</div>
            </div>
          </div>
        </Link>

        <Link
          href="/login"
          className="group p-4 rounded-2xl border border-border bg-card/80 hover:border-primary/40 hover:bg-card transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Portal Login</div>
              <div className="text-[10px] text-muted-foreground">Admin, Teachers & Students</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="glow" size="lg" className="rounded-full gap-2 font-bold px-7">
          <Link href="/">
            <Home className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full gap-2 font-semibold px-6">
          <Link href="/fee-structure">
            <CreditCard className="h-4 w-4" />
            <span>Fee Structure</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
