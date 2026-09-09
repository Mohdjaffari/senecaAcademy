"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Award,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Users,
  BookOpen,
  Trophy,
  History,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LiveStats {
  currentStudents: number;
  alumniStudents: number;
  totalFaculty: number;
}

export interface HeroDataProps {
  badge?: string;
  title1?: string;
  title2?: string;
  titleSuffix?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  img1Url?: string;
  img2Url?: string;
  campusTag?: string;
  campusTitle?: string;
  campusDesc?: string;
  statBadge1Value?: string;
  statBadge1Label?: string;
  statBadge1Sub?: string;
  statBadge2Value?: string;
  statBadge2Label?: string;
  statBadge2Sub?: string;
  trustBadge1?: string;
  trustBadge2?: string;
  trustBadge3?: string;
}

interface HeroProps {
  heroData?: HeroDataProps;
  statsData?: { value: string; label: string }[];
  admissionsOpen?: boolean;
  liveStats?: LiveStats;
}

/** Format a raw number into a compact display string  e.g. 1542 → "1,500+" */
function formatCount(n: number): string {
  if (n <= 0) return "0";
  if (n < 100) return `${n}`;
  // Round down to nearest 10 and add "+"
  const rounded = Math.floor(n / 10) * 10;
  return `${rounded.toLocaleString()}+`;
}

export function HeroSection({
  heroData,
  statsData,
  admissionsOpen = true,
  liveStats,
}: HeroProps) {
  const [data, setData] = useState<HeroDataProps>(heroData || {});
  const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(admissionsOpen);
  const [liveCounts, setLiveCounts] = useState<LiveStats>(
    liveStats ?? { currentStudents: 0, alumniStudents: 0, totalFaculty: 0 }
  );

  // Baseline editable stats (heritage, pass rate) from DB settings
  const [baseStats, setBaseStats] = useState<{ value: string; label: string }[]>(
    statsData && statsData.length > 0
      ? statsData
      : [
          { value: "25+", label: "Years of Academic Heritage" },
          { value: "100%", label: "Matric Board Pass Rate" },
        ]
  );

  // Sync SSR props on hydration
  useEffect(() => {
    if (heroData) setData(heroData);
    if (statsData && statsData.length > 0) setBaseStats(statsData);
    setIsAdmissionsOpen(admissionsOpen);
    if (liveStats) setLiveCounts(liveStats);
  }, [heroData, statsData, admissionsOpen, liveStats]);

  // Client-side refresh from /api/website (catches stale SSR cache)
  useEffect(() => {
    async function loadDynamicHero() {
      try {
        const res = await fetch("/api/website");
        const json = await res.json();
        if (json.success && json.data?.settings) {
          const s = json.data.settings;
          if (s.hero) setData(s.hero);
          if (s.stats && Array.isArray(s.stats) && s.stats.length > 0) setBaseStats(s.stats);
        }
      } catch (_) {}
    }
    loadDynamicHero();
  }, []);

  // Client-side refresh for admissions status from the Admissions module
  useEffect(() => {
    async function loadAdmissionsStatus() {
      try {
        const res = await fetch("/api/website/admissions");
        const json = await res.json();
        if (json.success && json.data?.page?.globalSettings) {
          const g = json.data.page.globalSettings;
          if (g.admissionsOpen !== undefined) setIsAdmissionsOpen(g.admissionsOpen);
        }
      } catch (_) {}
    }
    loadAdmissionsStatus();
  }, []);

  // Client-side live stats refresh
  useEffect(() => {
    async function loadLiveStats() {
      try {
        const res = await fetch("/api/website/stats");
        const json = await res.json();
        if (json.success && json.data) {
          setLiveCounts(json.data);
        }
      } catch (_) {}
    }
    loadLiveStats();
  }, []);

  const [userActiveApp, setUserActiveApp] = useState<any>(null);

  // Check if logged-in parent has an active admission application
  useEffect(() => {
    async function checkUserApp() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.hasSubmittedApplication && json.data?.latestApplication) {
            setUserActiveApp(json.data.latestApplication);
          }
        }
      } catch (_) {}
    }
    checkUserApp();
  }, []);

  /* ── Resolve display values ── */
  const badgeText =
    data.badge ||
    (isAdmissionsOpen ? "Admissions Open 2026–2027" : "Admissions Closed for Current Session");
  const title1 = data.title1 || "Shaping";
  const title2 = data.title2 || "Tomorrow";
  const titleSuffix =
    data.titleSuffix !== undefined ? data.titleSuffix : "Through Rigorous Education & Integrity.";
  const description =
    data.description ||
    "Beyond ordinary schooling. Seneca Academy cultivates intellect, builds character, and prepares leaders for the future.";
  const ctaText = data.ctaText || (isAdmissionsOpen ? "Explore Academy" : "Explore Curriculum");
  const ctaLink = data.ctaLink || (isAdmissionsOpen ? "/admissions" : "/academics");
  const secondaryCtaText =
    data.secondaryCtaText || (isAdmissionsOpen ? "Contact Admissions Desk" : "Contact Desk");
  const secondaryCtaLink = data.secondaryCtaLink || "/contact";
  const imgUrl =
    data.img1Url ||
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80";
  const campusTag = data.campusTag || "SOLDIER BAZAR CAMPUS • KARACHI";
  const campusTitle = data.campusTitle || "Center for Excellence & Moral Leadership";
  const campusDesc =
    data.campusDesc ||
    "Comprehensive education spanning Playgroup, Primary, Middle, and BSEK Matriculation.";
  const stat1Val = data.statBadge1Value || "25+";
  const stat1Label = data.statBadge1Label || "Years of Heritage";
  const stat1Sub = data.statBadge1Sub || "Est. in Soldier Bazar";
  const stat2Val = data.statBadge2Value || "100%";
  const stat2Label = data.statBadge2Label || "Board Distinction";
  const stat2Sub = data.statBadge2Sub || "Matric & Cambridge Level";
  const trust1 = data.trustBadge1 || "Govt. Recognized Institution";
  const trust2 = data.trustBadge2 || "State-of-the-art STEM Labs";
  const trust3 = data.trustBadge3 || "100% Board Pass Rate";

  /* ── Rich metadata mapper for stats styling & contextual icons ── */
  const getStatMeta = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("student")) {
      return {
        icon: <BookOpen className="h-4 w-4 text-sky-500 dark:text-sky-400" />,
        bgIcon: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
        badge: "Real-Time",
      };
    }
    if (l.includes("alumni") || l.includes("passout")) {
      return {
        icon: <GraduationCap className="h-4 w-4 text-amber-500 dark:text-amber-400" />,
        bgIcon: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
        badge: "Alumni Network",
      };
    }
    if (l.includes("faculty") || l.includes("teacher") || l.includes("educat")) {
      return {
        icon: <Users className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />,
        bgIcon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        badge: "Active Faculty",
      };
    }
    if (l.includes("heritage") || l.includes("year")) {
      return {
        icon: <History className="h-4 w-4 text-seneca-crimson dark:text-rose-400" />,
        bgIcon: "bg-seneca-crimson/10 border-seneca-crimson/20 text-seneca-crimson dark:text-rose-400",
        badge: "Legacy",
      };
    }
    if (l.includes("matric") || l.includes("board")) {
      return {
        icon: <Trophy className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />,
        bgIcon: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
        badge: "Board Merit",
      };
    }
    if (
      l.includes("intermediate") ||
      l.includes("result") ||
      l.includes("cambridge") ||
      l.includes("hssc")
    ) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-teal-500 dark:text-teal-400" />,
        bgIcon: "bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400",
        badge: "Excellence",
      };
    }
    return {
      icon: <Award className="h-4 w-4 text-seneca-amber" />,
      bgIcon: "bg-seneca-amber/10 border-seneca-amber/20 text-seneca-amber",
      badge: "Accredited",
    };
  };

  /* ── Build final stats strip: live counts first, then base stats ── */
  const liveStatsStrip: {
    value: string;
    label: string;
    icon: React.ReactNode;
    bgIcon: string;
    badge: string;
    live: boolean;
  }[] = [
    {
      value: formatCount(liveCounts.currentStudents),
      label: "Current Students",
      live: true,
      ...getStatMeta("student"),
    },
    {
      value: formatCount(liveCounts.alumniStudents),
      label: "Alumni Passouts",
      live: true,
      ...getStatMeta("alumni"),
    },
    {
      value:
        liveCounts.totalFaculty > 0
          ? `${liveCounts.totalFaculty}+`
          : baseStats.find((s) => s.label.toLowerCase().includes("educat"))?.value || "50+",
      label: "Qualified Faculty",
      live: true,
      ...getStatMeta("faculty"),
    },
    // Append remaining base stats (heritage, pass rate, intermediate, etc.)
    ...baseStats
      .filter(
        (s) =>
          !["student", "alumni", "faculty", "teacher", "educator"].some((kw) =>
            s.label.toLowerCase().includes(kw)
          )
      )
      .map((s) => ({
        value: s.value,
        label: s.label,
        live: false,
        ...getStatMeta(s.label),
      })),
  ];

  return (
    <section className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-16 lg:pb-24 bg-gradient-to-b from-seneca-crimson/5 via-background to-background">
      {/* Background Subtle Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/0.1)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10" />

      {/* Ambient Lighting Orbs */}
      <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-seneca-crimson/10 dark:bg-seneca-crimson/20 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-seneca-amber/10 dark:bg-seneca-amber/15 blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Narrative with entrance motion */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Active Admission Application Alert (for role === 'user' who submitted) */}
            {userActiveApp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 sm:py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-foreground text-xs shadow-xs max-w-xl mx-auto lg:mx-0 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold text-foreground">
                    Application #{userActiveApp.applicationNumber} ({userActiveApp.studentName}) is{" "}
                    <span className="capitalize font-bold text-emerald-600 dark:text-emerald-400">
                      {userActiveApp.status.replace("_", " ")}
                    </span>
                  </span>
                </div>
                <Link
                  href="/admissions/status"
                  className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                >
                  <span>Track Status</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            )}

            {/* Admissions Badge */}
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold shadow-xs mx-auto lg:mx-0 backdrop-blur-md transition-all ${
                isAdmissionsOpen
                  ? "border-seneca-amber/30 bg-seneca-amber/10 dark:bg-seneca-amber/15 text-seneca-amber dark:text-seneca-amber-light"
                  : "border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isAdmissionsOpen ? (
                <Sparkles
                  className="h-3.5 w-3.5 text-seneca-amber animate-spin"
                  style={{ animationDuration: "6s" }}
                />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span>{badgeText}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              {title1}{" "}
              <span className="bg-gradient-to-r from-seneca-crimson via-seneca-crimson-light to-seneca-amber dark:from-seneca-amber-light dark:via-orange-400 dark:to-seneca-amber bg-clip-text text-transparent">
                {title2}
              </span>
              {titleSuffix ? ` ${titleSuffix}` : ""}
            </h1>

            {/* Description Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {description}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                asChild
                variant="glow"
                className="rounded-full gap-2 px-8 font-bold shadow-lg shadow-seneca-crimson/20 hover:shadow-xl transition-all"
              >
                <Link href={ctaLink}>
                  <span>{ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full px-7 font-semibold hover:border-seneca-crimson hover:text-seneca-crimson dark:hover:border-seneca-amber dark:hover:text-seneca-amber-light transition-all bg-card/60 backdrop-blur-sm"
              >
                <Link href={secondaryCtaLink}>
                  <span>{secondaryCtaText}</span>
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-muted-foreground">
              {trust1 && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{trust1}</span>
                </div>
              )}
              {trust2 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-seneca-amber dark:text-seneca-amber-light shrink-0" />
                  <span>{trust2}</span>
                </div>
              )}
              {trust3 && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-seneca-crimson dark:text-seneca-amber shrink-0" />
                  <span>{trust3}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Visual Image with Floating Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative h-[380px] sm:h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-card bg-muted group">
                <Image
                  src={imgUrl}
                  alt="Seneca Academy Campus"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-seneca-amber-light inline-block px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                    {campusTag}
                  </span>
                  <h3 className="text-lg font-bold font-heading text-white">{campusTitle}</h3>
                  <p className="text-xs text-white/80 line-clamp-2">{campusDesc}</p>
                </div>
              </div>

              {/* Floating Stat Badge 1: Heritage */}
              <div className="absolute -top-4 left-2 sm:-left-6 rounded-2xl bg-card/95 backdrop-blur-md p-3.5 shadow-xl border border-border/80 flex items-center gap-3 transition-transform hover:-translate-y-1">
                <div className="h-10 w-10 rounded-xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center font-bold text-sm">
                  {stat1Val}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{stat1Label}</div>
                  <div className="text-[10px] text-muted-foreground">{stat1Sub}</div>
                </div>
              </div>

              {/* Floating Stat Badge 2: Pass Rate */}
              <div className="absolute -bottom-4 right-2 sm:-right-6 rounded-2xl bg-card/95 backdrop-blur-md p-3.5 shadow-xl border border-border/80 flex items-center gap-3 transition-transform hover:translate-y-1">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  {stat2Val}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{stat2Label}</div>
                  <div className="text-[10px] text-muted-foreground">{stat2Sub}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom Stats Strip Showcase ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.6 }}
          className="mt-16 sm:mt-20"
        >
          <div className="relative rounded-3xl p-4 sm:p-6 lg:p-7 bg-card/85 dark:bg-card/45 backdrop-blur-xl border border-border/80 shadow-xl shadow-seneca-crimson/5 overflow-hidden">
            {/* Ambient Background Gradient Lights */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-seneca-amber/15 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-seneca-crimson/15 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Header Eyebrow Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3.5 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                  Verified Institutional Benchmarks & Live Academy Data
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <ShieldCheck className="h-4 w-4 text-seneca-crimson dark:text-seneca-amber" />
                <span>Certified Sindh Board & BSEK Standards</span>
              </div>
            </div>

            {/* Responsive Card Grid */}
            <div
              className={`grid gap-3 sm:gap-4 ${
                liveStatsStrip.length <= 4
                  ? "grid-cols-2 md:grid-cols-4"
                  : liveStatsStrip.length === 5
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
              }`}
            >
              {liveStatsStrip.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="relative overflow-hidden rounded-2xl p-4 sm:p-4.5 bg-background/80 hover:bg-background border border-border/70 hover:border-seneca-crimson/40 dark:hover:border-seneca-amber/40 shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Top hover accent bar */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-seneca-crimson to-seneca-amber opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Top Bar inside Card: Icon & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`p-2 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs ${stat.bgIcon}`}
                    >
                      {stat.icon}
                    </div>

                    {stat.live ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90 px-2 py-0.5 rounded-full bg-muted/60 border border-border/50">
                        {stat.badge}
                      </span>
                    )}
                  </div>

                  {/* Stat Value & Label */}
                  <div className="space-y-1">
                    <div className="font-heading text-2xl sm:text-3xl lg:text-3xl font-black tracking-tight text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors leading-snug line-clamp-2">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
