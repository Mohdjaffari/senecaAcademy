"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Home,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Save,
  Eye,
  LayoutTemplate,
  Info,
  GraduationCap,
  RefreshCw,
  Plus,
  Trash2,
  Link2,
  Type,
  Hash,
  BadgeCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  BookOpen,
  Database,
  Upload,
  ImageIcon,
  X,
  ArrowUpRight,
  UserCircle,
  CalendarClock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────── */
interface HeroData {
  badge: string;
  title1: string;
  title2: string;
  titleSuffix: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  img1Url: string;
  campusTag: string;
  campusTitle: string;
  campusDesc: string;
  statBadge1Value: string;
  statBadge1Label: string;
  statBadge1Sub: string;
  statBadge2Value: string;
  statBadge2Label: string;
  statBadge2Sub: string;
  trustBadge1: string;
  trustBadge2: string;
  trustBadge3: string;
}

interface StatItem {
  value: string;
  label: string;
}

/* ─── Defaults ──────────────────────────────────────────── */
const DEFAULT_HERO: HeroData = {
  badge: "ADMISSIONS OPEN FOR SESSION 2026–27",
  title1: "Shaping",
  title2: "Tomorrow",
  titleSuffix: "Through Rigorous Education & Integrity.",
  description:
    "A premier institution committed to academic rigor, moral integrity, modern robotics, and character building from Playgroup to O-Level.",
  ctaText: "Apply for Admission",
  ctaLink: "/admissions",
  secondaryCtaText: "Contact Admissions Desk",
  secondaryCtaLink: "/contact",
  img1Url: "",
  campusTag: "SOLDIER BAZAR CAMPUS • KARACHI",
  campusTitle: "Center for Excellence & Moral Leadership",
  campusDesc: "Comprehensive education spanning Playgroup, Primary, Middle, and BSEK Matriculation.",
  statBadge1Value: "25+",
  statBadge1Label: "Years of Heritage",
  statBadge1Sub: "Est. in Soldier Bazar",
  statBadge2Value: "100%",
  statBadge2Label: "Board Distinction",
  statBadge2Sub: "Matric & Cambridge Level",
  trustBadge1: "Govt. Recognized Institution",
  trustBadge2: "State-of-the-art STEM Labs",
  trustBadge3: "100% Board Pass Rate",
};

const DEFAULT_STATS: StatItem[] = [
  { value: "25+", label: "Years of Heritage" },
  { value: "100%", label: "Matric & O-Level Success" },
];

/* ─── Helper Components ─────────────────────────────────── */
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-bold text-foreground flex items-center gap-1">
      {children}
      {required && <span className="text-rose-500">*</span>}
    </label>
  );
}

function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>;
}

function SectionCard({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center border", iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">{title}</CardTitle>
            {description && <CardDescription className="text-xs mt-0.5">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">{children}</CardContent>
    </Card>
  );
}

function SaveBar({ onSave, saving, isDirty }: { onSave: () => void; saving: boolean; isDirty: boolean }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6",
        "bg-card/95 backdrop-blur-md border-t border-border/80 flex items-center justify-between gap-4",
        "transition-all duration-300",
        isDirty ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
    >
      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
        <AlertCircle className="h-3.5 w-3.5 text-seneca-amber shrink-0" />
        Unsaved changes — click Save to publish to the live website.
      </p>
      <Button
        onClick={onSave}
        disabled={saving}
        size="sm"
        className="rounded-xl font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-sm shrink-0"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        <span>{saving ? "Saving..." : "Save & Publish"}</span>
      </Button>
    </div>
  );
}

/* ─── Image Uploader Component ──────────────────────────── */
function ImageUploader({
  currentUrl,
  onUpload,
}: {
  currentUrl: string;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/website/upload-image", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Upload failed.");
      onUpload(json.data.url);
      toast.success(`Image uploaded (${json.data.sizeKb} KB, WebP)`);
      setPreview(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer",
          dragOver
            ? "border-seneca-crimson bg-seneca-crimson/5 scale-[1.01]"
            : "border-border/60 hover:border-seneca-crimson/40 hover:bg-muted/40",
          uploading && "pointer-events-none opacity-60"
        )}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          /* Image Preview */
          <div className="relative h-52 rounded-2xl overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="Hero preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-2 text-white">
                <Upload className="h-7 w-7" />
                <span className="text-xs font-bold">Click or drop to replace</span>
              </div>
            </div>
            {/* Remove button */}
            <button
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors z-10 opacity-0 group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); onUpload(""); setPreview(null); }}
              title="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* Loading overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                <div className="text-white text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="text-xs font-semibold">Processing image…</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="h-40 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-seneca-crimson" />
                <p className="text-xs font-semibold">Processing image…</p>
              </>
            ) : (
              <>
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
                  dragOver ? "bg-seneca-crimson/10 text-seneca-crimson" : "bg-muted text-muted-foreground"
                )}>
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {dragOver ? "Drop to upload" : "Upload Hero Image"}
                  </p>
                  <p className="text-xs mt-0.5">
                    Drag & drop or <span className="text-seneca-crimson font-semibold">browse</span> — JPEG, PNG, WebP up to 8 MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
      </div>

      {/* Info strip */}
      <div className="flex items-center gap-2 px-1">
        <Info className="h-3 w-3 text-muted-foreground shrink-0" />
        <p className="text-[10px] text-muted-foreground">
          Images are auto-converted to WebP and resized to 1200px for optimal web performance.
        </p>
      </div>
    </div>
  );
}

/* ─── Read-Only Info Card ────────────────────────────────── */
function ReadOnlyInfoCard({
  title,
  description,
  icon: Icon,
  iconColor,
  href,
  hrefLabel,
  children,
  loading,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  href: string;
  hrefLabel: string;
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center border", iconColor)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">{title}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="rounded-xl gap-1.5 text-xs font-semibold shrink-0">
            <Link href={href}>
              {hrefLabel}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 bg-muted animate-pulse rounded-lg w-full" />
            ))}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Main Page Component ───────────────────────────────── */
export default function WebsiteHomePageManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  // Live DB counts
  const [liveDbStats, setLiveDbStats] = useState({
    currentStudents: 0,
    alumniStudents: 0,
    totalFaculty: 0,
    loadingLive: true,
  });

  // Form state
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);

  // Read-only external data
  const [principalData, setPrincipalData] = useState<Record<string, unknown> | null>(null);
  const [principalLoading, setPrincipalLoading] = useState(true);
  const [admissionsData, setAdmissionsData] = useState<Record<string, unknown> | null>(null);
  const [admissionsLoading, setAdmissionsLoading] = useState(true);

  // Dirty tracking per tab
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());
  const markDirty = useCallback(
    (tab: string) => setDirtyTabs((prev) => new Set(prev).add(tab)),
    []
  );

  /* ─ Load website settings ─ */
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await fetch("/api/website");
        const json = await res.json();
        if (json.success && json.data?.settings) {
          const s = json.data.settings;
          if (s.hero) setHero({ ...DEFAULT_HERO, ...s.hero });
          if (s.stats && s.stats.length > 0) setStats(s.stats);
        }
      } catch {
        toast.error("Could not load settings. Using defaults.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  /* ─ Load live DB counts ─ */
  async function fetchLiveStats() {
    setLiveDbStats((prev) => ({ ...prev, loadingLive: true }));
    try {
      const res = await fetch("/api/website/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setLiveDbStats({
          currentStudents: json.data.currentStudents ?? 0,
          alumniStudents: json.data.alumniStudents ?? 0,
          totalFaculty: json.data.totalFaculty ?? 0,
          loadingLive: false,
        });
      } else {
        setLiveDbStats((prev) => ({ ...prev, loadingLive: false }));
      }
    } catch {
      setLiveDbStats((prev) => ({ ...prev, loadingLive: false }));
    }
  }

  useEffect(() => { fetchLiveStats(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─ Load About page principal data ─ */
  useEffect(() => {
    async function fetchPrincipal() {
      setPrincipalLoading(true);
      try {
        const res = await fetch("/api/website/about");
        const json = await res.json();
        if (json.success && json.data?.page?.principal) {
          setPrincipalData(json.data.page.principal);
        }
      } catch {
        // gracefully show nothing
      } finally {
        setPrincipalLoading(false);
      }
    }
    fetchPrincipal();
  }, []);

  /* ─ Load Admissions data ─ */
  useEffect(() => {
    async function fetchAdmissions() {
      setAdmissionsLoading(true);
      try {
        const res = await fetch("/api/website/admissions");
        const json = await res.json();
        if (json.success && json.data?.page?.globalSettings) {
          setAdmissionsData(json.data.page.globalSettings);
        }
      } catch {
        // gracefully show nothing
      } finally {
        setAdmissionsLoading(false);
      }
    }
    fetchAdmissions();
  }, []);

  /* ─ Save a section ─ */
  async function saveSection(section: string, payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/website", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Save failed.");
      setDirtyTabs((prev) => { const n = new Set(prev); n.delete(section); return n; });
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} section saved & published!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  const saveHero = () => saveSection("hero", { hero });
  const saveStats = () => saveSection("stats", { stats });

  /* ─ Field helpers ─ */
  function setHeroField<K extends keyof HeroData>(key: K, val: HeroData[K]) {
    setHero((prev) => ({ ...prev, [key]: val }));
    markDirty("hero");
  }

  function updateStat(idx: number, key: keyof StatItem, val: string) {
    setStats((prev) => {
      const n = [...prev];
      n[idx] = { ...n[idx], [key]: val };
      return n;
    });
    markDirty("stats");
  }

  function addStat() {
    setStats((prev) => [...prev, { value: "", label: "" }]);
    markDirty("stats");
  }

  function removeStat(idx: number) {
    setStats((prev) => prev.filter((_, i) => i !== idx));
    markDirty("stats");
  }

  /* ─ Loading skeleton ─ */
  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-xl" />
        <div className="h-12 w-full bg-muted animate-pulse rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const admissionsOpen = admissionsData?.admissionsOpen as boolean | undefined;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <Home className="h-3.5 w-3.5" />
            <ChevronRight className="h-3 w-3" />
            <span>Website</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">Home Page</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-foreground">
            Home Page Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage the public homepage hero, statistics, and review live data from other modules.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-xl gap-1.5 text-xs font-semibold border-border/80">
          <Link href="/" target="_blank">
            <Eye className="h-3.5 w-3.5" />
            View Live Page
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* ── Status Cards Row (Principal + Admissions) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Principal Info Card */}
        <ReadOnlyInfoCard
          title="Principal's Message"
          description="Auto-fetched from the About Page. Edit it there."
          icon={UserCircle}
          iconColor="bg-purple-500/10 text-purple-600 border-purple-500/20"
          href="/dashboard/website/about"
          hrefLabel="Edit in About Page"
          loading={principalLoading}
        >
          {principalData ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {principalData.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={principalData.photoUrl as string}
                    alt={principalData.name as string}
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-border/60 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                    <UserCircle className="h-7 w-7 text-purple-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {(principalData.name as string) || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {(principalData.designation as string) || "Principal"}
                  </p>
                </div>
              </div>
              {(principalData.messageParagraphs as string[] | undefined)?.length ? (
                <p className="text-xs text-muted-foreground italic line-clamp-3 border-l-2 border-purple-500/30 pl-3">
                  "{(principalData.messageParagraphs as string[])[0]}"
                </p>
              ) : null}
              <div className="flex items-center gap-2 pt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-muted-foreground font-medium">
                  Showing on public About page
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <UserCircle className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                No principal data found. Add it in the About Page management.
              </p>
            </div>
          )}
        </ReadOnlyInfoCard>

        {/* Admissions Status Card */}
        <ReadOnlyInfoCard
          title="Admissions Status"
          description="Auto-fetched from Admissions management. Edit it there."
          icon={CalendarClock}
          iconColor="bg-seneca-amber/10 text-seneca-amber border-seneca-amber/20"
          href="/dashboard/website/admissions"
          hrefLabel="Edit in Admissions"
          loading={admissionsLoading}
        >
          {admissionsData ? (
            <div className="space-y-3">
              {/* Open/Closed badge */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border",
                  admissionsOpen
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                )}>
                  {admissionsOpen ? (
                    <ToggleRight className="h-3.5 w-3.5" />
                  ) : (
                    <ToggleLeft className="h-3.5 w-3.5" />
                  )}
                  {admissionsOpen ? "Admissions Open" : "Admissions Closed"}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {Boolean(admissionsData.admissionsSession) && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-16 shrink-0">Session</span>
                    <span className="text-xs font-semibold text-foreground">
                      {admissionsData.admissionsSession as string}
                    </span>
                  </div>
                )}
                {Boolean(admissionsData.admissionsDeadline) && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-16 shrink-0">Deadline</span>
                    <span className="text-xs font-semibold text-foreground">
                      {admissionsData.admissionsDeadline as string}
                    </span>
                  </div>
                )}
                {Boolean(admissionsData.admissionsPhone) && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-16 shrink-0">Phone</span>
                    <span className="text-xs font-semibold text-foreground">
                      {admissionsData.admissionsPhone as string}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-medium">
                  Reflected live on the public website
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <CalendarClock className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                No admissions data found. Configure it in Admissions management.
              </p>
            </div>
          )}
        </ReadOnlyInfoCard>
      </div>

      {/* ── Tabs: Hero + Stats only ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto p-1 rounded-2xl bg-muted/60 border border-border/60 gap-1 flex-wrap">
          {[
            { value: "hero", label: "Hero Section", icon: LayoutTemplate },
            { value: "stats", label: "Key Statistics", icon: Sparkles },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {dirtyTabs.has(value) && (
                <span className="h-1.5 w-1.5 rounded-full bg-seneca-amber inline-block ml-0.5" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ══════════════ HERO TAB ══════════════ */}
        <TabsContent value="hero" className="space-y-4 mt-4">

          {/* Badge & Headline */}
          <SectionCard
            title="Badge & Headline"
            description="The main text content of the hero section."
            icon={Type}
            iconColor="bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/20"
          >
            <FieldGroup>
              <FieldLabel>Admissions Badge Text</FieldLabel>
              <Input
                value={hero.badge}
                onChange={(e) => setHeroField("badge", e.target.value)}
                placeholder="e.g. ADMISSIONS OPEN FOR SESSION 2026–27"
                className="rounded-xl text-xs"
              />
            </FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FieldGroup>
                <FieldLabel>Headline Part 1</FieldLabel>
                <Input
                  value={hero.title1}
                  onChange={(e) => setHeroField("title1", e.target.value)}
                  placeholder="e.g. Shaping"
                  className="rounded-xl text-xs"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Headline Gradient Part</FieldLabel>
                <Input
                  value={hero.title2}
                  onChange={(e) => setHeroField("title2", e.target.value)}
                  placeholder="e.g. Tomorrow"
                  className="rounded-xl text-xs"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Headline Suffix</FieldLabel>
                <Input
                  value={hero.titleSuffix}
                  onChange={(e) => setHeroField("titleSuffix", e.target.value)}
                  placeholder="e.g. Through Rigorous Education."
                  className="rounded-xl text-xs"
                />
              </FieldGroup>
            </div>
            <FieldGroup>
              <FieldLabel>Description Subtitle</FieldLabel>
              <Textarea
                value={hero.description}
                onChange={(e) => setHeroField("description", e.target.value)}
                placeholder="Enter the subtitle description..."
                rows={3}
                className="rounded-xl text-xs resize-none"
              />
            </FieldGroup>
          </SectionCard>

          {/* Hero Image Upload */}
          <SectionCard
            title="Hero Image"
            description="Upload a high-quality campus or classroom photo. Images are auto-converted to WebP."
            icon={ImageIcon}
            iconColor="bg-sky-500/10 text-sky-600 border-sky-500/20"
          >
            <ImageUploader
              currentUrl={hero.img1Url}
              onUpload={(url) => { setHeroField("img1Url", url); }}
            />

            {/* Campus card labels */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <FieldGroup>
                <FieldLabel>Campus Tag</FieldLabel>
                <Input
                  value={hero.campusTag}
                  onChange={(e) => setHeroField("campusTag", e.target.value)}
                  placeholder="e.g. SOLDIER BAZAR CAMPUS"
                  className="rounded-xl text-xs"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Campus Title</FieldLabel>
                <Input
                  value={hero.campusTitle}
                  onChange={(e) => setHeroField("campusTitle", e.target.value)}
                  placeholder="e.g. Center for Excellence"
                  className="rounded-xl text-xs"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Campus Description</FieldLabel>
                <Input
                  value={hero.campusDesc}
                  onChange={(e) => setHeroField("campusDesc", e.target.value)}
                  placeholder="Short description..."
                  className="rounded-xl text-xs"
                />
              </FieldGroup>
            </div>
          </SectionCard>

          {/* CTA Buttons */}
          <SectionCard
            title="Call-to-Action Buttons"
            description="The two action buttons displayed below the headline."
            icon={Link2}
            iconColor="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-seneca-crimson/10 text-seneca-crimson text-[10px] flex items-center justify-center font-black">1</span>
                  Primary Button
                </p>
                <FieldGroup>
                  <FieldLabel>Label</FieldLabel>
                  <Input value={hero.ctaText} onChange={(e) => setHeroField("ctaText", e.target.value)} placeholder="e.g. Apply for Admission" className="rounded-lg text-xs" />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Link</FieldLabel>
                  <Input value={hero.ctaLink} onChange={(e) => setHeroField("ctaLink", e.target.value)} placeholder="e.g. /admissions" className="rounded-lg text-xs" />
                </FieldGroup>
              </div>
              <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-muted-foreground/10 text-muted-foreground text-[10px] flex items-center justify-center font-black">2</span>
                  Secondary Button
                </p>
                <FieldGroup>
                  <FieldLabel>Label</FieldLabel>
                  <Input value={hero.secondaryCtaText} onChange={(e) => setHeroField("secondaryCtaText", e.target.value)} placeholder="e.g. Contact Admissions Desk" className="rounded-lg text-xs" />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Link</FieldLabel>
                  <Input value={hero.secondaryCtaLink} onChange={(e) => setHeroField("secondaryCtaLink", e.target.value)} placeholder="e.g. /contact" className="rounded-lg text-xs" />
                </FieldGroup>
              </div>
            </div>
          </SectionCard>

          {/* Floating Stat Badges */}
          <SectionCard
            title="Floating Stat Badges"
            description="Two small floating cards overlaid on the hero image (top-left and bottom-right)."
            icon={Hash}
            iconColor="bg-purple-500/10 text-purple-600 border-purple-500/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {([1, 2] as const).map((n) => (
                <div key={n} className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-seneca-crimson/10 text-seneca-crimson text-[10px] flex items-center justify-center font-black">{n}</span>
                    {n === 1 ? "Top-Left Badge" : "Bottom-Right Badge"}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <FieldGroup>
                      <FieldLabel>Value</FieldLabel>
                      <Input value={hero[`statBadge${n}Value`]} onChange={(e) => setHeroField(`statBadge${n}Value`, e.target.value)} className="rounded-lg text-xs font-bold" placeholder="25+" />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Label</FieldLabel>
                      <Input value={hero[`statBadge${n}Label`]} onChange={(e) => setHeroField(`statBadge${n}Label`, e.target.value)} className="rounded-lg text-xs" placeholder="Years of Heritage" />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Sub-label</FieldLabel>
                      <Input value={hero[`statBadge${n}Sub`]} onChange={(e) => setHeroField(`statBadge${n}Sub`, e.target.value)} className="rounded-lg text-xs" placeholder="Est. in Karachi" />
                    </FieldGroup>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Trust Badges */}
          <SectionCard
            title="Trust Badges"
            description="Three short credential lines displayed below the CTA buttons."
            icon={BadgeCheck}
            iconColor="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            <div className="space-y-3">
              {([1, 2, 3] as const).map((n) => (
                <FieldGroup key={n}>
                  <FieldLabel>Badge {n}</FieldLabel>
                  <Input
                    value={hero[`trustBadge${n}`]}
                    onChange={(e) => setHeroField(`trustBadge${n}`, e.target.value)}
                    placeholder={["Govt. Recognized Institution", "State-of-the-art STEM Labs", "100% Board Pass Rate"][n - 1]}
                    className="rounded-xl text-xs"
                  />
                </FieldGroup>
              ))}
            </div>
          </SectionCard>

          <SaveBar onSave={saveHero} saving={saving} isDirty={dirtyTabs.has("hero")} />
        </TabsContent>

        {/* ══════════════ STATS TAB ══════════════ */}
        <TabsContent value="stats" className="space-y-4 mt-4">

          {/* Live DB Cards */}
          <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/60">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Live Database Counts</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Auto-calculated from the database — read-only. Updates in real-time.
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 text-xs font-semibold border-border/80 shrink-0"
                  onClick={fetchLiveStats}
                  disabled={liveDbStats.loadingLive}
                >
                  {liveDbStats.loadingLive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Current Students", value: liveDbStats.currentStudents, icon: BookOpen, color: "sky", query: "status: active" },
                  { label: "Alumni / Passouts", value: liveDbStats.alumniStudents, icon: GraduationCap, color: "amber", query: "status: graduated" },
                  { label: "Qualified Faculty", value: liveDbStats.totalFaculty, icon: Users, color: "emerald", query: "status: active / on_leave" },
                ].map(({ label, value, icon: Icon, color, query }) => (
                  <div key={label} className={cn("relative p-5 rounded-2xl border overflow-hidden",
                    color === "sky" && "border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/10",
                    color === "amber" && "border-seneca-amber/20 bg-seneca-amber/5 dark:bg-seneca-amber/10",
                    color === "emerald" && "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10"
                  )}>
                    <div className={cn("absolute -top-4 -right-4 h-20 w-20 rounded-full blur-xl pointer-events-none",
                      color === "sky" && "bg-sky-500/10",
                      color === "amber" && "bg-seneca-amber/10",
                      color === "emerald" && "bg-emerald-500/10"
                    )} />
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border",
                        color === "sky" && "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
                        color === "amber" && "bg-seneca-amber/15 text-seneca-amber border-seneca-amber/20",
                        color === "emerald" && "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">LIVE</span>
                      </div>
                    </div>
                    <div className={cn("font-heading text-4xl font-extrabold tracking-tight",
                      color === "sky" && "text-sky-600 dark:text-sky-400",
                      color === "amber" && "text-seneca-amber",
                      color === "emerald" && "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {liveDbStats.loadingLive ? <div className="h-10 w-20 rounded-lg bg-muted animate-pulse" /> : value.toLocaleString()}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{label}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      <code className="text-[10px] bg-muted px-1 rounded">{query}</code>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 flex items-start gap-2.5">
                <Info className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">These 3 stats are automatically fetched from MongoDB</span> — they update whenever students enroll/graduate or teachers join/leave. They appear as the first 3 items in the live stats strip on the public website and cannot be manually edited.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Supplemental Stats */}
          <SectionCard
            title="Supplemental Statistics"
            description="Additional custom stats shown alongside the live counts (heritage, pass rate, etc.)."
            icon={Sparkles}
            iconColor="bg-seneca-amber/10 text-seneca-amber border-seneca-amber/20"
          >
            <div className="space-y-3">
              {stats.map((stat, idx) => (
                <div key={idx} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 p-3 rounded-xl border border-border/70 bg-muted/20">
                  <span className="h-6 w-6 rounded-lg bg-seneca-crimson/10 text-seneca-crimson text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <FieldGroup className="space-y-0">
                    <FieldLabel>Value</FieldLabel>
                    <Input value={stat.value} onChange={(e) => updateStat(idx, "value", e.target.value)} placeholder="e.g. 25+" className="rounded-lg text-xs font-bold h-8" />
                  </FieldGroup>
                  <FieldGroup className="space-y-0">
                    <FieldLabel>Label</FieldLabel>
                    <Input value={stat.label} onChange={(e) => updateStat(idx, "label", e.target.value)} placeholder="e.g. Years of Heritage" className="rounded-lg text-xs h-8" />
                  </FieldGroup>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 shrink-0" onClick={() => removeStat(idx)} disabled={stats.length <= 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed gap-1.5 text-xs font-bold" onClick={addStat}>
                <Plus className="h-3.5 w-3.5" />
                Add Custom Statistic
              </Button>
            </div>

            {/* Combined preview */}
            {stats.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Combined Preview (live + custom)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-4 rounded-xl bg-muted/30 border border-border/60">
                  {[
                    { val: liveDbStats.currentStudents, label: "Current Students" },
                    { val: liveDbStats.alumniStudents, label: "Alumni Passouts" },
                    { val: liveDbStats.totalFaculty, label: "Qualified Faculty" },
                  ].map((s, i) => (
                    <div key={i} className="text-center space-y-1">
                      <div className="font-heading text-xl font-extrabold text-seneca-crimson dark:text-seneca-amber-light">
                        {liveDbStats.loadingLive ? "…" : s.val.toLocaleString() + "+"}
                      </div>
                      <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Live</span>
                      </div>
                    </div>
                  ))}
                  {stats.map((stat, idx) => (
                    <div key={idx} className="text-center space-y-1">
                      <div className="font-heading text-xl font-extrabold text-seneca-crimson dark:text-seneca-amber-light">
                        {stat.value || "—"}
                      </div>
                      <div className="text-[10px] text-muted-foreground leading-tight">{stat.label || "Label"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          <SaveBar onSave={saveStats} saving={saving} isDirty={dirtyTabs.has("stats")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
