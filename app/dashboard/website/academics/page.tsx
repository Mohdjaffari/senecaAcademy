"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  ChevronRight,
  Save,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  LayoutTemplate,
  Sliders,
  RefreshCw,
  EyeOff,
  Clock,
  Send,
  Loader2,
  Layers,
  GraduationCap,
  Binary,
  Award,
  PhoneCall,
  Check,
  X,
  Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import { IconPicker } from "@/components/ui/icon-picker";
import { toast } from "sonner";
import {
  DEFAULT_ACADEMICS_PAGE_DATA,
  IAcademicsPageContent,
  IAcademicDivisionItem,
  IStemFeatureItem,
  IAssessmentTierItem,
  ITrustCardItem,
  ISenecaDifferencePillar,
  ISenecaDifferenceData,
} from "@/lib/db/academics-page-defaults";

// Live Preview Component Imports
import AcademicsHeroSection from "@/components/public/academics/AcademicsHeroSection";
import DivisionListSection from "@/components/public/academics/DivisionListSection";
import StemInnovationSection from "@/components/public/academics/StemInnovationSection";
import AssessmentStandardsSection from "@/components/public/academics/AssessmentStandardsSection";
import AcademicsCtaBanner from "@/components/public/academics/AcademicsCtaBanner";

const SECTION_LABELS: Record<string, { title: string; desc: string; icon: any }> = {
  hero: {
    title: "Hero Banner",
    desc: "Top academic pathway headline, badge, breadcrumbs & CTA buttons",
    icon: LayoutTemplate,
  },
  academicDivisions: {
    title: "Academic Divisions",
    desc: "Pedagogical stages from Early Years Montessori to Senior Matriculation",
    icon: GraduationCap,
  },
  stemInnovation: {
    title: "STEM & Innovation",
    desc: "Coding, laboratory science, and robotics studio showcases",
    icon: Binary,
  },
  assessmentStandards: {
    title: "Assessment Standards",
    desc: "Rigorous evaluation tiers, diagnostics, and board simulations",
    icon: Award,
  },
  ctaBanner: {
    title: "Admissions & Campus CTA",
    desc: "Dynamic admissions-aware banner with trust matrix and helpline",
    icon: PhoneCall,
  },
};

export default function WebsiteAcademicsPageManager() {
  const [data, setData] = useState<IAcademicsPageContent>(DEFAULT_ACADEMICS_PAGE_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraftModified, setIsDraftModified] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");

  // Temporary subject and highlight input states for divisions
  const [newSubjectInputs, setNewSubjectInputs] = useState<Record<string, string>>({});
  const [newHighlightInputs, setNewHighlightInputs] = useState<Record<string, string>>({});

  // Load existing data from API
  const loadAcademicsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/website/academics?preview=true");
      const json = await res.json();
      if (json?.data?.page) {
        setData({
          ...DEFAULT_ACADEMICS_PAGE_DATA,
          ...json.data.page,
          senecaDifference:
            json.data.page.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference,
        });
        setIsDraftModified(!!json.data.page.draft || !!json.data.isDraft);
      }
    } catch (err) {
      console.error("Failed to load academics page data:", err);
      toast.error("Failed to load CMS data. Using local defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicsData();
  }, []);

  // Save Draft Handler
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/website/academics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, saveAsDraft: true }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to save draft.");

      setIsDraftModified(true);
      toast.success("Academics draft saved successfully! You can preview changes before publishing.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  // Publish Handler
  const handlePublish = async () => {
    try {
      setPublishing(true);
      const res = await fetch("/api/website/academics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, saveAsDraft: false }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to publish.");

      setIsDraftModified(false);
      toast.success(
        "Academics page published successfully! Changes are now live on the public site."
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to publish changes.");
    } finally {
      setPublishing(false);
    }
  };

  // Reset to Defaults Handler
  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to reset all Academics page fields to default values?")) {
      setData(DEFAULT_ACADEMICS_PAGE_DATA);
      setIsDraftModified(true);
      toast.info("Reset to standard defaults. Click 'Publish Changes' or 'Save Draft' to persist.");
    }
  };

  // Reorder sections helper
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...data.sectionsOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setData({ ...data, sectionsOrder: newOrder });
    setIsDraftModified(true);
  };

  // Section visibility toggle
  const toggleSectionVisibility = (sectionKey: string) => {
    const updated = { ...data };
    switch (sectionKey) {
      case "hero":
        updated.hero.isVisible = !updated.hero.isVisible;
        break;
      case "academicDivisions":
        updated.academicDivisions.isVisible = !updated.academicDivisions.isVisible;
        break;
      case "stemInnovation":
        updated.stemInnovation.isVisible = !updated.stemInnovation.isVisible;
        break;
      case "assessmentStandards":
        updated.assessmentStandards.isVisible = !updated.assessmentStandards.isVisible;
        break;
      case "ctaBanner":
        updated.ctaBanner.isVisible = !updated.ctaBanner.isVisible;
        break;
    }
    setData(updated);
    setIsDraftModified(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
        <p className="text-xs font-semibold text-muted-foreground">Loading Academics Page CMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/dashboard/website" className="hover:text-foreground transition-colors">
          Website Management
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-bold">Academics</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground tracking-tight">
              Academics Page Management
            </h1>
            {isDraftModified ? (
              <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1">
                <Clock className="h-3 w-3" /> Draft Changes
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Live on Public
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage academic divisions (Montessori to Matric), STEM innovation cards, examination standards, and admissions CTA banners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold gap-1.5 border-border/80"
          >
            <Link href="/academics" target="_blank">
              <Eye className="h-3.5 w-3.5" />
              <span>Public View</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          </Button>

          <Button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            variant="outline"
            size="sm"
            className="rounded-xl font-bold gap-1.5 border-border/80"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Draft</span>
          </Button>

          <Button
            onClick={handlePublish}
            disabled={saving || publishing}
            size="sm"
            className="rounded-xl font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-sm"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Publish Changes</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="bg-card/80 border border-border/80 p-1 rounded-2xl flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="sections" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Layers className="h-3.5 w-3.5" />
            Sections Order
          </TabsTrigger>
          <TabsTrigger value="hero" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="divisions" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <GraduationCap className="h-3.5 w-3.5" />
            Academic Divisions
          </TabsTrigger>
          <TabsTrigger value="stem" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Binary className="h-3.5 w-3.5" />
            STEM &amp; Innovation
          </TabsTrigger>
          <TabsTrigger value="assessment" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Award className="h-3.5 w-3.5" />
            Assessment Standards
          </TabsTrigger>
          <TabsTrigger value="cta" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <PhoneCall className="h-3.5 w-3.5" />
            CTA &amp; Trust Banner
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Sliders className="h-3.5 w-3.5" />
            SEO &amp; Metadata
          </TabsTrigger>
          <TabsTrigger value="difference" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Sparkles className="h-3.5 w-3.5" />
            The Seneca Difference
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 bg-seneca-amber/10 text-seneca-amber border border-seneca-amber/20"
          >
            <Eye className="h-3.5 w-3.5" />
            Live Preview
          </TabsTrigger>
        </TabsList>

        {/* 1. SECTIONS ORDER & VISIBILITY TAB */}
        <TabsContent value="sections" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Section Arrangement &amp; Visibility</CardTitle>
                <CardDescription className="text-xs">
                  Reorder sections or hide specific blocks from appearing on the public Academics page.
                </CardDescription>
              </div>
              <Button
                onClick={handleResetDefaults}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-semibold gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Reset Default Layout
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {data.sectionsOrder.map((secKey, index) => {
                const info = SECTION_LABELS[secKey] || { title: secKey, desc: "", icon: Layers };
                const Icon = info.icon;
                let isVisible = true;
                switch (secKey) {
                  case "hero":
                    isVisible = data.hero.isVisible;
                    break;
                  case "academicDivisions":
                    isVisible = data.academicDivisions.isVisible;
                    break;
                  case "stemInnovation":
                    isVisible = data.stemInnovation.isVisible;
                    break;
                  case "assessmentStandards":
                    isVisible = data.assessmentStandards.isVisible;
                    break;
                  case "ctaBanner":
                    isVisible = data.ctaBanner.isVisible;
                    break;
                }

                return (
                  <div
                    key={secKey}
                    className="p-3.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between gap-3 hover:border-border transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-card border border-border flex items-center justify-center text-seneca-crimson dark:text-seneca-amber font-bold text-xs shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{info.title}</span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            #{index + 1}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{info.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant={isVisible ? "outline" : "secondary"}
                        onClick={() => toggleSectionVisibility(secKey)}
                        className="rounded-xl text-xs h-8 px-2.5 gap-1"
                      >
                        {isVisible ? (
                          <>
                            <Eye className="h-3 w-3 text-emerald-500" />
                            <span className="text-[11px]">Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 text-rose-500" />
                            <span className="text-[11px] text-muted-foreground">Hidden</span>
                          </>
                        )}
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => moveSection(index, "up")}
                          className="h-8 w-8 rounded-lg"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === data.sectionsOrder.length - 1}
                          onClick={() => moveSection(index, "down")}
                          className="h-8 w-8 rounded-lg"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. HERO SECTION TAB */}
        <TabsContent value="hero" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Academics Hero Section Settings</CardTitle>
                <CardDescription className="text-xs">
                  Configure top showcase headline, badge, and dual admissions-state CTA buttons.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant={data.hero.isVisible ? "outline" : "secondary"}
                size="sm"
                onClick={() => {
                  setData({ ...data, hero: { ...data.hero, isVisible: !data.hero.isVisible } });
                  setIsDraftModified(true);
                }}
                className="rounded-xl text-xs"
              >
                {data.hero.isVisible ? "Section Visible" : "Section Hidden"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Badge Text</label>
                  <Input
                    value={data.hero.badge}
                    onChange={(e) => {
                      setData({ ...data, hero: { ...data.hero, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
                <IconPicker
                  label="Badge Icon"
                  value={data.hero.badgeIcon}
                  onChange={(icon) => {
                    setData({ ...data, hero: { ...data.hero, badgeIcon: icon } });
                    setIsDraftModified(true);
                  }}
                />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Hero Color Accent</label>
                  <select
                    value={data.hero.variant}
                    onChange={(e: any) => {
                      setData({ ...data, hero: { ...data.hero, variant: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="w-full h-9 rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="amber">Amber Warmth (Default)</option>
                    <option value="crimson">Crimson Luxury</option>
                    <option value="emerald">Emerald Academic</option>
                    <option value="default">Default Neutral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Main Headline</label>
                  <Input
                    value={data.hero.title}
                    onChange={(e) => {
                      setData({ ...data, hero: { ...data.hero, title: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Highlighted Title (Gradient Effect)</label>
                  <Input
                    value={data.hero.highlightedTitle}
                    onChange={(e) => {
                      setData({ ...data, hero: { ...data.hero, highlightedTitle: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Description Paragraph</label>
                <textarea
                  value={data.hero.description}
                  onChange={(e) => {
                    setData({ ...data, hero: { ...data.hero, description: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Admissions Active CTA Group */}
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>CTA Buttons when Admissions are OPEN</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border">
                    <span className="text-[11px] font-bold block">Primary CTA (Admissions Open)</span>
                    <Input
                      value={data.hero.admissionsOpenState.primaryCta.text}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            admissionsOpenState: {
                              ...data.hero.admissionsOpenState,
                              primaryCta: {
                                ...data.hero.admissionsOpenState.primaryCta,
                                text: e.target.value,
                              },
                            },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Button Text"
                      className="rounded-lg text-xs"
                    />
                    <Input
                      value={data.hero.admissionsOpenState.primaryCta.href}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            admissionsOpenState: {
                              ...data.hero.admissionsOpenState,
                              primaryCta: {
                                ...data.hero.admissionsOpenState.primaryCta,
                                href: e.target.value,
                              },
                            },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="URL (/admissions)"
                      className="rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border">
                    <span className="text-[11px] font-bold block">Secondary CTA (Admissions Open)</span>
                    <Input
                      value={data.hero.admissionsOpenState.secondaryCta.text}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            admissionsOpenState: {
                              ...data.hero.admissionsOpenState,
                              secondaryCta: {
                                ...data.hero.admissionsOpenState.secondaryCta,
                                text: e.target.value,
                              },
                            },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Button Text"
                      className="rounded-lg text-xs"
                    />
                    <Input
                      value={data.hero.admissionsOpenState.secondaryCta.href}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            admissionsOpenState: {
                              ...data.hero.admissionsOpenState,
                              secondaryCta: {
                                ...data.hero.admissionsOpenState.secondaryCta,
                                href: e.target.value,
                              },
                            },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="URL (/fees)"
                      className="rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Admissions Closed CTA Group */}
              <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-zinc-400" />
                  <span>CTA Buttons when Admissions are CLOSED</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border">
                    <span className="text-[11px] font-bold block">Primary CTA (Admissions Closed)</span>
                    <Input
                      value={data.hero.admissionsClosedState.primaryCta.text}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            admissionsClosedState: {
                              ...data.hero.admissionsClosedState,
                              primaryCta: {
                                ...data.hero.admissionsClosedState.primaryCta,
                                text: e.target.value,
                              },
                            },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Button Text"
                      className="rounded-lg text-xs"
                    />
                    <Input
                      value={data.hero.admissionsClosedState.primaryCta.href}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            admissionsClosedState: {
                              ...data.hero.admissionsClosedState,
                              primaryCta: {
                                ...data.hero.admissionsClosedState.primaryCta,
                                href: e.target.value,
                              },
                            },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="URL (/fees)"
                      className="rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border">
                    <span className="text-[11px] font-bold block">Secondary CTA (Admissions Closed)</span>
                    <Input
                      value={data.hero.admissionsClosedState.secondaryCta.text}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            admissionsClosedState: {
                              ...data.hero.admissionsClosedState,
                              secondaryCta: {
                                ...data.hero.admissionsClosedState.secondaryCta,
                                text: e.target.value,
                              },
                            },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Button Text"
                      className="rounded-lg text-xs"
                    />
                    <Input
                      value={data.hero.admissionsClosedState.secondaryCta.href}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            admissionsClosedState: {
                              ...data.hero.admissionsClosedState,
                              secondaryCta: {
                                ...data.hero.admissionsClosedState.secondaryCta,
                                href: e.target.value,
                              },
                            },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="URL (/contact)"
                      className="rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. ACADEMIC DIVISIONS TAB */}
        <TabsContent value="divisions" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Academic Divisions &amp; Wings</CardTitle>
                <CardDescription className="text-xs">
                  Manage the structured stages (Early Years Montessori, Primary, Middle School, Senior Matriculation).
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={data.academicDivisions.isVisible ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setData({
                      ...data,
                      academicDivisions: {
                        ...data.academicDivisions,
                        isVisible: !data.academicDivisions.isVisible,
                      },
                    });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs"
                >
                  {data.academicDivisions.isVisible ? "Section Visible" : "Section Hidden"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const newDivision: IAcademicDivisionItem = {
                      id: `division-${Date.now()}`,
                      name: "New Academic Division",
                      badge: "Academic Wing",
                      gradeRange: "Grade X to Grade Y",
                      description: "Comprehensive curriculum description for this academic stage.",
                      image:
                        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
                      subjects: ["Core Mathematics", "Sciences", "English Literature"],
                      highlights: ["Holistic Pedagogy", "Practical Assessments"],
                      highlightStatement: "Academic Standard",
                      displayOrder: data.academicDivisions.items.length + 1,
                      isActive: true,
                    };
                    setData({
                      ...data,
                      academicDivisions: {
                        ...data.academicDivisions,
                        items: [...data.academicDivisions.items, newDivision],
                      },
                    });
                    setIsDraftModified(true);
                    toast.success("New division added.");
                  }}
                  className="rounded-xl text-xs gap-1 bg-seneca-crimson text-white"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Division
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.academicDivisions.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-5 rounded-2xl border border-border/80 bg-card/60 shadow-xs space-y-4 hover:border-border transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-lg bg-seneca-crimson/10 text-seneca-crimson font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{item.name || "Untitled Division"}</h4>
                        <span className="text-[11px] text-muted-foreground font-mono">{item.gradeRange}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant={item.isActive !== false ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => {
                          const updated = [...data.academicDivisions.items];
                          updated[idx].isActive = !updated[idx].isActive;
                          setData({
                            ...data,
                            academicDivisions: { ...data.academicDivisions, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        className="rounded-lg text-xs h-7 px-2"
                      >
                        {item.isActive !== false ? "Active" : "Disabled"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={idx === 0}
                        onClick={() => {
                          const updated = [...data.academicDivisions.items];
                          const temp = updated[idx];
                          updated[idx] = updated[idx - 1];
                          updated[idx - 1] = temp;
                          setData({
                            ...data,
                            academicDivisions: { ...data.academicDivisions, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        className="h-7 w-7 rounded-lg"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={idx === data.academicDivisions.items.length - 1}
                        onClick={() => {
                          const updated = [...data.academicDivisions.items];
                          const temp = updated[idx];
                          updated[idx] = updated[idx + 1];
                          updated[idx + 1] = temp;
                          setData({
                            ...data,
                            academicDivisions: { ...data.academicDivisions, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        className="h-7 w-7 rounded-lg"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>

                      {data.academicDivisions.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Delete academic division "${item.name}"?`)) {
                              const updated = data.academicDivisions.items.filter((_, i) => i !== idx);
                              setData({
                                ...data,
                                academicDivisions: { ...data.academicDivisions, items: updated },
                              });
                              setIsDraftModified(true);
                            }
                          }}
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Division Card Form */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Image Column */}
                    <div className="md:col-span-4 space-y-2">
                      <ImageUpload
                        label="Division Showcase Photo"
                        value={item.image}
                        onChange={(url) => {
                          const updated = [...data.academicDivisions.items];
                          updated[idx].image = url;
                          setData({
                            ...data,
                            academicDivisions: { ...data.academicDivisions, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        aspectRatio="video"
                      />
                      <Input
                        value={item.imageAlt || ""}
                        onChange={(e) => {
                          const updated = [...data.academicDivisions.items];
                          updated[idx].imageAlt = e.target.value;
                          setData({
                            ...data,
                            academicDivisions: { ...data.academicDivisions, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        placeholder="Image Alt Description"
                        className="rounded-lg text-xs"
                      />
                    </div>

                    {/* Text Details Column */}
                    <div className="md:col-span-8 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-bold text-foreground">Division Name</label>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...data.academicDivisions.items];
                              updated[idx].name = e.target.value;
                              setData({
                                ...data,
                                academicDivisions: { ...data.academicDivisions, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Badge Label</label>
                          <Input
                            value={item.badge}
                            onChange={(e) => {
                              const updated = [...data.academicDivisions.items];
                              updated[idx].badge = e.target.value;
                              setData({
                                ...data,
                                academicDivisions: { ...data.academicDivisions, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Grade Range / Target Age</label>
                          <Input
                            value={item.gradeRange}
                            onChange={(e) => {
                              const updated = [...data.academicDivisions.items];
                              updated[idx].gradeRange = e.target.value;
                              setData({
                                ...data,
                                academicDivisions: { ...data.academicDivisions, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            placeholder="e.g. Grade 1 to Grade 5 (Ages 6–10)"
                            className="rounded-xl text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Highlight Banner Statement</label>
                          <Input
                            value={item.highlightStatement || ""}
                            onChange={(e) => {
                              const updated = [...data.academicDivisions.items];
                              updated[idx].highlightStatement = e.target.value;
                              setData({
                                ...data,
                                academicDivisions: { ...data.academicDivisions, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            placeholder="e.g. Foundation Phase Educational Standard"
                            className="rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">Division Pedagogy Narrative</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...data.academicDivisions.items];
                            updated[idx].description = e.target.value;
                            setData({
                              ...data,
                              academicDivisions: { ...data.academicDivisions, items: updated },
                            });
                            setIsDraftModified(true);
                          }}
                          rows={2}
                          className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>

                      {/* Subjects Builder */}
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-foreground">Curriculum Subjects &amp; Modules</label>
                          <span className="text-[10px] text-muted-foreground">{item.subjects?.length || 0} subjects</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.subjects?.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-[11px] text-foreground font-medium border border-border"
                            >
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...data.academicDivisions.items];
                                  updated[idx].subjects = updated[idx].subjects.filter((_, i) => i !== sIdx);
                                  setData({
                                    ...data,
                                    academicDivisions: { ...data.academicDivisions, items: updated },
                                  });
                                  setIsDraftModified(true);
                                }}
                                className="text-muted-foreground hover:text-rose-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={newSubjectInputs[item.id] || ""}
                            onChange={(e) =>
                              setNewSubjectInputs({ ...newSubjectInputs, [item.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = (newSubjectInputs[item.id] || "").trim();
                                if (val) {
                                  const updated = [...data.academicDivisions.items];
                                  updated[idx].subjects = [...(updated[idx].subjects || []), val];
                                  setData({
                                    ...data,
                                    academicDivisions: { ...data.academicDivisions, items: updated },
                                  });
                                  setNewSubjectInputs({ ...newSubjectInputs, [item.id]: "" });
                                  setIsDraftModified(true);
                                }
                              }
                            }}
                            placeholder="Type subject module and press Add or Enter..."
                            className="rounded-lg text-xs"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const val = (newSubjectInputs[item.id] || "").trim();
                              if (val) {
                                const updated = [...data.academicDivisions.items];
                                updated[idx].subjects = [...(updated[idx].subjects || []), val];
                                setData({
                                  ...data,
                                  academicDivisions: { ...data.academicDivisions, items: updated },
                                });
                                setNewSubjectInputs({ ...newSubjectInputs, [item.id]: "" });
                                setIsDraftModified(true);
                              }
                            }}
                            className="rounded-lg text-xs h-9 px-3 shrink-0"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. STEM & INNOVATION TAB */}
        <TabsContent value="stem" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">STEM &amp; Laboratory Innovation Studio</CardTitle>
                <CardDescription className="text-xs">
                  Highlight coding languages, robotics labs, and practical sciences with customized icons.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={data.stemInnovation.isVisible ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setData({
                      ...data,
                      stemInnovation: {
                        ...data.stemInnovation,
                        isVisible: !data.stemInnovation.isVisible,
                      },
                    });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs"
                >
                  {data.stemInnovation.isVisible ? "Section Visible" : "Section Hidden"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const newStem: IStemFeatureItem = {
                      id: `stem-${Date.now()}`,
                      title: "New STEM Program",
                      desc: "Description of cutting-edge technology or laboratory methodology.",
                      icon: "Binary",
                      iconColor: "text-seneca-crimson dark:text-seneca-amber-light",
                      displayOrder: data.stemInnovation.items.length + 1,
                      isVisible: true,
                    };
                    setData({
                      ...data,
                      stemInnovation: {
                        ...data.stemInnovation,
                        items: [...data.stemInnovation.items, newStem],
                      },
                    });
                    setIsDraftModified(true);
                    toast.success("New STEM card added.");
                  }}
                  className="rounded-xl text-xs gap-1 bg-seneca-crimson text-white"
                >
                  <Plus className="h-3.5 w-3.5" /> Add STEM Card
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.stemInnovation.badge}
                    onChange={(e) => {
                      setData({
                        ...data,
                        stemInnovation: { ...data.stemInnovation, badge: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.stemInnovation.heading}
                    onChange={(e) => {
                      setData({
                        ...data,
                        stemInnovation: { ...data.stemInnovation, heading: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Section Subtitle / Description</label>
                <textarea
                  value={data.stemInnovation.description}
                  onChange={(e) => {
                    setData({
                      ...data,
                      stemInnovation: { ...data.stemInnovation, description: e.target.value },
                    });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* STEM Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {data.stemInnovation.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        Card #{idx + 1}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() => {
                            const updated = [...data.stemInnovation.items];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            setData({
                              ...data,
                              stemInnovation: { ...data.stemInnovation, items: updated },
                            });
                            setIsDraftModified(true);
                          }}
                          className="h-6 w-6 rounded"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === data.stemInnovation.items.length - 1}
                          onClick={() => {
                            const updated = [...data.stemInnovation.items];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            setData({
                              ...data,
                              stemInnovation: { ...data.stemInnovation, items: updated },
                            });
                            setIsDraftModified(true);
                          }}
                          className="h-6 w-6 rounded"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        {data.stemInnovation.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updated = data.stemInnovation.items.filter((_, i) => i !== idx);
                              setData({
                                ...data,
                                stemInnovation: { ...data.stemInnovation, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="h-6 w-6 text-rose-500 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <IconPicker
                      label="Feature Icon"
                      value={item.icon}
                      onChange={(icon) => {
                        const updated = [...data.stemInnovation.items];
                        updated[idx].icon = icon;
                        setData({
                          ...data,
                          stemInnovation: { ...data.stemInnovation, items: updated },
                        });
                        setIsDraftModified(true);
                      }}
                    />

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">Card Title</label>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...data.stemInnovation.items];
                          updated[idx].title = e.target.value;
                          setData({
                            ...data,
                            stemInnovation: { ...data.stemInnovation, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        className="rounded-lg text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">Description</label>
                      <textarea
                        value={item.desc}
                        onChange={(e) => {
                          const updated = [...data.stemInnovation.items];
                          updated[idx].desc = e.target.value;
                          setData({
                            ...data,
                            stemInnovation: { ...data.stemInnovation, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        rows={3}
                        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. ASSESSMENT STANDARDS TAB */}
        <TabsContent value="assessment" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Assessment &amp; Evaluation Standards</CardTitle>
                <CardDescription className="text-xs">
                  Configure evaluation milestones (Monthly Diagnostic Quizzes, Semester Exams, Board Simulations).
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={data.assessmentStandards.isVisible ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setData({
                      ...data,
                      assessmentStandards: {
                        ...data.assessmentStandards,
                        isVisible: !data.assessmentStandards.isVisible,
                      },
                    });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs"
                >
                  {data.assessmentStandards.isVisible ? "Section Visible" : "Section Hidden"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const newTier: IAssessmentTierItem = {
                      id: `assess-${Date.now()}`,
                      tag: "Term Milestone",
                      title: "New Evaluation Tier",
                      description: "Evaluation description and grading methodology.",
                      theme: "crimson",
                      badgeColorClass: "text-seneca-crimson dark:text-seneca-amber-light",
                      displayOrder: data.assessmentStandards.items.length + 1,
                      isVisible: true,
                    };
                    setData({
                      ...data,
                      assessmentStandards: {
                        ...data.assessmentStandards,
                        items: [...data.assessmentStandards.items, newTier],
                      },
                    });
                    setIsDraftModified(true);
                    toast.success("New assessment tier added.");
                  }}
                  className="rounded-xl text-xs gap-1 bg-seneca-crimson text-white"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Assessment Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.assessmentStandards.badge}
                    onChange={(e) => {
                      setData({
                        ...data,
                        assessmentStandards: { ...data.assessmentStandards, badge: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.assessmentStandards.heading}
                    onChange={(e) => {
                      setData({
                        ...data,
                        assessmentStandards: { ...data.assessmentStandards, heading: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Section Description</label>
                <textarea
                  value={data.assessmentStandards.description}
                  onChange={(e) => {
                    setData({
                      ...data,
                      assessmentStandards: { ...data.assessmentStandards, description: e.target.value },
                    });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Assessment Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {data.assessmentStandards.items.map((tier, idx) => (
                  <div
                    key={tier.id || idx}
                    className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-seneca-crimson dark:text-seneca-amber-light">
                        {tier.tag || `Tier #${idx + 1}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() => {
                            const updated = [...data.assessmentStandards.items];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            setData({
                              ...data,
                              assessmentStandards: { ...data.assessmentStandards, items: updated },
                            });
                            setIsDraftModified(true);
                          }}
                          className="h-6 w-6 rounded"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === data.assessmentStandards.items.length - 1}
                          onClick={() => {
                            const updated = [...data.assessmentStandards.items];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            setData({
                              ...data,
                              assessmentStandards: { ...data.assessmentStandards, items: updated },
                            });
                            setIsDraftModified(true);
                          }}
                          className="h-6 w-6 rounded"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        {data.assessmentStandards.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updated = data.assessmentStandards.items.filter((_, i) => i !== idx);
                              setData({
                                ...data,
                                assessmentStandards: { ...data.assessmentStandards, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="h-6 w-6 text-rose-500 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">Tag / Phase</label>
                      <Input
                        value={tier.tag}
                        onChange={(e) => {
                          const updated = [...data.assessmentStandards.items];
                          updated[idx].tag = e.target.value;
                          setData({
                            ...data,
                            assessmentStandards: { ...data.assessmentStandards, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        placeholder="e.g. Monthly Checks"
                        className="rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">Title</label>
                      <Input
                        value={tier.title}
                        onChange={(e) => {
                          const updated = [...data.assessmentStandards.items];
                          updated[idx].title = e.target.value;
                          setData({
                            ...data,
                            assessmentStandards: { ...data.assessmentStandards, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        className="rounded-lg text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">Description</label>
                      <textarea
                        value={tier.description}
                        onChange={(e) => {
                          const updated = [...data.assessmentStandards.items];
                          updated[idx].description = e.target.value;
                          setData({
                            ...data,
                            assessmentStandards: { ...data.assessmentStandards, items: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        rows={3}
                        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. CTA & TRUST BANNER TAB */}
        <TabsContent value="cta" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Academics Admissions CTA &amp; Trust Banner</CardTitle>
                <CardDescription className="text-xs">
                  Dynamic banner supporting template variables (<code>&#123;admissionsSession&#125;</code> and <code>&#123;phone&#125;</code>).
                </CardDescription>
              </div>
              <Button
                type="button"
                variant={data.ctaBanner.isVisible ? "outline" : "secondary"}
                size="sm"
                onClick={() => {
                  setData({
                    ...data,
                    ctaBanner: { ...data.ctaBanner, isVisible: !data.ctaBanner.isVisible },
                  });
                  setIsDraftModified(true);
                }}
                className="rounded-xl text-xs"
              >
                {data.ctaBanner.isVisible ? "Section Visible" : "Section Hidden"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Eyebrow (Admissions Open)</label>
                  <Input
                    value={data.ctaBanner.eyebrowActiveTemplate}
                    onChange={(e) => {
                      setData({
                        ...data,
                        ctaBanner: { ...data.ctaBanner, eyebrowActiveTemplate: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="{admissionsSession} Admissions Active"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Eyebrow (Admissions Closed)</label>
                  <Input
                    value={data.ctaBanner.eyebrowInactiveTemplate}
                    onChange={(e) => {
                      setData({
                        ...data,
                        ctaBanner: { ...data.ctaBanner, eyebrowInactiveTemplate: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Academic Excellence Track"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Background Luxury Style</label>
                  <select
                    value={data.ctaBanner.backgroundTheme}
                    onChange={(e: any) => {
                      setData({
                        ...data,
                        ctaBanner: { ...data.ctaBanner, backgroundTheme: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    className="w-full h-9 rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="crimsonLuxury">Crimson Luxury Gradient</option>
                    <option value="amberLuxury">Amber Warm Gradient</option>
                    <option value="dark">Dark Slate Night</option>
                    <option value="default">Default</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Main Heading</label>
                  <Input
                    value={data.ctaBanner.mainHeading}
                    onChange={(e) => {
                      setData({
                        ...data,
                        ctaBanner: { ...data.ctaBanner, mainHeading: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Highlighted Heading (Gold Gradient)</label>
                  <Input
                    value={data.ctaBanner.highlightedHeading}
                    onChange={(e) => {
                      setData({
                        ...data,
                        ctaBanner: { ...data.ctaBanner, highlightedHeading: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-bold text-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Description (Admissions Open)</label>
                  <textarea
                    value={data.ctaBanner.descriptionOpenTemplate}
                    onChange={(e) => {
                      setData({
                        ...data,
                        ctaBanner: { ...data.ctaBanner, descriptionOpenTemplate: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Description (Admissions Closed)</label>
                  <textarea
                    value={data.ctaBanner.descriptionClosedTemplate}
                    onChange={(e) => {
                      setData({
                        ...data,
                        ctaBanner: { ...data.ctaBanner, descriptionClosedTemplate: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Trust Cards Pillars */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Trust Matrix Mini Pillars</h5>
                    <p className="text-[11px] text-muted-foreground">3 glassmorphism cards displayed inside the CTA banner.</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newCard: ITrustCardItem = {
                        id: `tc-${Date.now()}`,
                        title: "New Trust Card",
                        description: "Feature highlight",
                        icon: "CheckCircle2",
                        theme: "amber",
                        displayOrder: data.ctaBanner.trustCards.length + 1,
                        isVisible: true,
                      };
                      setData({
                        ...data,
                        ctaBanner: {
                          ...data.ctaBanner,
                          trustCards: [...data.ctaBanner.trustCards, newCard],
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs h-7 gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Pillar
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {data.ctaBanner.trustCards.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px]">
                          Pillar #{idx + 1}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={idx === 0}
                            onClick={() => {
                              const updated = [...data.ctaBanner.trustCards];
                              const temp = updated[idx];
                              updated[idx] = updated[idx - 1];
                              updated[idx - 1] = temp;
                              setData({
                                ...data,
                                ctaBanner: { ...data.ctaBanner, trustCards: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="h-6 w-6 rounded"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={idx === data.ctaBanner.trustCards.length - 1}
                            onClick={() => {
                              const updated = [...data.ctaBanner.trustCards];
                              const temp = updated[idx];
                              updated[idx] = updated[idx + 1];
                              updated[idx + 1] = temp;
                              setData({
                                ...data,
                                ctaBanner: { ...data.ctaBanner, trustCards: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="h-6 w-6 rounded"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          {data.ctaBanner.trustCards.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updated = data.ctaBanner.trustCards.filter((_, i) => i !== idx);
                                setData({
                                  ...data,
                                  ctaBanner: { ...data.ctaBanner, trustCards: updated },
                                });
                                setIsDraftModified(true);
                              }}
                              className="h-6 w-6 text-rose-500 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <IconPicker
                        label="Pillar Icon"
                        value={card.icon}
                        onChange={(icon) => {
                          const updated = [...data.ctaBanner.trustCards];
                          updated[idx].icon = icon;
                          setData({
                            ...data,
                            ctaBanner: { ...data.ctaBanner, trustCards: updated },
                          });
                          setIsDraftModified(true);
                        }}
                      />

                      <Input
                        value={card.title}
                        onChange={(e) => {
                          const updated = [...data.ctaBanner.trustCards];
                          updated[idx].title = e.target.value;
                          setData({
                            ...data,
                            ctaBanner: { ...data.ctaBanner, trustCards: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        placeholder="Pillar Title"
                        className="rounded-lg text-xs font-bold"
                      />

                      <Input
                        value={card.description}
                        onChange={(e) => {
                          const updated = [...data.ctaBanner.trustCards];
                          updated[idx].description = e.target.value;
                          setData({
                            ...data,
                            ctaBanner: { ...data.ctaBanner, trustCards: updated },
                          });
                          setIsDraftModified(true);
                        }}
                        placeholder="Subtitle description"
                        className="rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Helpline Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Helpline Prefix Text</label>
                  <Input
                    value={data.ctaBanner.helpline.prefixText}
                    onChange={(e) => {
                      setData({
                        ...data,
                        ctaBanner: {
                          ...data.ctaBanner,
                          helpline: { ...data.ctaBanner.helpline, prefixText: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Helpline Link Template (with &#123;phone&#125;)</label>
                  <Input
                    value={data.ctaBanner.helpline.linkTextTemplate}
                    onChange={(e) => {
                      setData({
                        ...data,
                        ctaBanner: {
                          ...data.ctaBanner,
                          helpline: { ...data.ctaBanner.helpline, linkTextTemplate: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. SEO & METADATA TAB */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Academics Search Engine Optimization (SEO)</CardTitle>
              <CardDescription className="text-xs">
                Configure meta titles, descriptions, and OpenGraph tags for search engines and social links.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">SEO Meta Title</label>
                <Input
                  value={data.seo.title}
                  onChange={(e) => {
                    setData({ ...data, seo: { ...data.seo, title: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">SEO Meta Description</label>
                <textarea
                  value={data.seo.description}
                  onChange={(e) => {
                    setData({ ...data, seo: { ...data.seo, description: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Keywords (Comma-separated)</label>
                <Input
                  value={data.seo.keywords}
                  onChange={(e) => {
                    setData({ ...data, seo: { ...data.seo, keywords: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Social Share Title (OG Title)</label>
                  <Input
                    value={data.seo.ogTitle}
                    onChange={(e) => {
                      setData({ ...data, seo: { ...data.seo, ogTitle: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Social Share Description (OG Desc)</label>
                  <Input
                    value={data.seo.ogDescription}
                    onChange={(e) => {
                      setData({ ...data, seo: { ...data.seo, ogDescription: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* THE SENECA DIFFERENCE TAB */}
        <TabsContent value="difference" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">The Seneca Difference (Pillars)</CardTitle>
                <CardDescription className="text-xs">
                  Manage core institutional pillars displayed prominently on the public homepage.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={data.senecaDifference?.isVisible !== false ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => {
                    const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                    setData({
                      ...data,
                      senecaDifference: {
                        ...current,
                        isVisible: !current.isVisible,
                      },
                    });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs gap-1.5 h-8 px-2.5"
                >
                  {data.senecaDifference?.isVisible !== false ? (
                    <>
                      <Eye className="h-3 w-3 text-emerald-500" />
                      <span className="text-[11px]">Section Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 text-rose-500" />
                      <span className="text-[11px] text-muted-foreground">Section Hidden</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                    const newId = `diff-${Date.now()}`;
                    const newPillars = [
                      ...current.items,
                      {
                        id: newId,
                        title: "New Distinction Pillar",
                        subtitle: "Academic Focus",
                        badge: "Pillar Badge",
                        description: "Detailed description of this Seneca educational advantage and excellence standard.",
                        icon: "Sparkles",
                        displayOrder: current.items.length + 1,
                        isVisible: true,
                      },
                    ];
                    setData({
                      ...data,
                      senecaDifference: { ...current, items: newPillars },
                    });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white h-8 px-3"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Pillar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.senecaDifference?.badge || ""}
                    onChange={(e) => {
                      const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                      setData({
                        ...data,
                        senecaDifference: { ...current, badge: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="e.g. The Seneca Difference"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.senecaDifference?.heading || ""}
                    onChange={(e) => {
                      const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                      setData({
                        ...data,
                        senecaDifference: { ...current, heading: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="e.g. Why Families Choose Seneca Academy"
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Section Subtitle / Description</label>
                <Textarea
                  value={data.senecaDifference?.description || ""}
                  onChange={(e) => {
                    const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                    setData({
                      ...data,
                      senecaDifference: { ...current, description: e.target.value },
                    });
                    setIsDraftModified(true);
                  }}
                  placeholder="Introductory remark guiding parents to understand Seneca's distinctive educational philosophy."
                  className="rounded-xl text-xs min-h-[60px]"
                />
              </div>

              <div className="space-y-3 pt-3">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Distinction Pillars ({(data.senecaDifference?.items || []).length})</span>
                </div>

                <div className="space-y-3">
                  {(data.senecaDifference?.items || []).map((pillar, idx) => (
                    <div
                      key={pillar.id || idx}
                      className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3 hover:border-border transition-all"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-card border flex items-center justify-center text-[10px] font-bold text-foreground">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {pillar.title || `Pillar ${idx + 1}`}
                          </span>
                          {pillar.badge && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {pillar.badge}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={idx === 0}
                            onClick={() => {
                              const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                              const updated = [...current.items];
                              const temp = updated[idx];
                              updated[idx] = updated[idx - 1];
                              updated[idx - 1] = temp;
                              setData({
                                ...data,
                                senecaDifference: { ...current, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={idx === (data.senecaDifference?.items || []).length - 1}
                            onClick={() => {
                              const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                              const updated = [...current.items];
                              const temp = updated[idx];
                              updated[idx] = updated[idx + 1];
                              updated[idx + 1] = temp;
                              setData({
                                ...data,
                                senecaDifference: { ...current, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant={pillar.isVisible !== false ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => {
                              const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                              const updated = [...current.items];
                              updated[idx].isVisible = updated[idx].isVisible === false ? true : false;
                              setData({
                                ...data,
                                senecaDifference: { ...current, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="h-7 px-2 text-[10px] rounded-lg"
                          >
                            {pillar.isVisible !== false ? "Visible" : "Hidden"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Remove pillar "${pillar.title}"?`)) {
                                const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                                const updated = current.items.filter((_, i) => i !== idx);
                                setData({
                                  ...data,
                                  senecaDifference: { ...current, items: updated },
                                });
                                setIsDraftModified(true);
                              }
                            }}
                            className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-bold text-foreground">Pillar Title</label>
                          <Input
                            value={pillar.title}
                            onChange={(e) => {
                              const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                              const updated = [...current.items];
                              updated[idx].title = e.target.value;
                              setData({
                                ...data,
                                senecaDifference: { ...current, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Badge Text</label>
                          <Input
                            value={pillar.badge || ""}
                            onChange={(e) => {
                              const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                              const updated = [...current.items];
                              updated[idx].badge = e.target.value;
                              setData({
                                ...data,
                                senecaDifference: { ...current, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            placeholder="e.g. Next-Gen Tech"
                            className="rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Subtitle / Focus</label>
                          <Input
                            value={pillar.subtitle || ""}
                            onChange={(e) => {
                              const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                              const updated = [...current.items];
                              updated[idx].subtitle = e.target.value;
                              setData({
                                ...data,
                                senecaDifference: { ...current, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            placeholder="e.g. Conceptual Rigor"
                            className="rounded-xl text-xs"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-bold text-foreground">Icon Identifier</label>
                          <Input
                            value={pillar.icon || "Sparkles"}
                            onChange={(e) => {
                              const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                              const updated = [...current.items];
                              updated[idx].icon = e.target.value;
                              setData({
                                ...data,
                                senecaDifference: { ...current, items: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            placeholder="e.g. GraduationCap, Users, Sparkles, BookOpen"
                            className="rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">Pillar Description</label>
                        <Textarea
                          value={pillar.description}
                          onChange={(e) => {
                            const current = data.senecaDifference || DEFAULT_ACADEMICS_PAGE_DATA.senecaDifference!;
                            const updated = [...current.items];
                            updated[idx].description = e.target.value;
                            setData({
                              ...data,
                              senecaDifference: { ...current, items: updated },
                            });
                            setIsDraftModified(true);
                          }}
                          placeholder="Comprehensive description of this pillar..."
                          className="rounded-xl text-xs min-h-[60px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. LIVE PREVIEW TAB */}
        <TabsContent value="preview" className="space-y-4">
          <div className="p-4 rounded-2xl bg-seneca-amber/10 border border-seneca-amber/30 text-xs text-seneca-amber flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="flex items-center gap-2 font-bold">
              <Eye className="h-4 w-4" /> Live Interactive Preview of Academics Content
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveDraft}
                size="sm"
                variant="outline"
                className="rounded-xl text-xs h-7 font-bold"
              >
                Save Draft
              </Button>
              <Button
                onClick={handlePublish}
                size="sm"
                className="rounded-xl text-xs h-7 font-bold bg-seneca-crimson text-white"
              >
                Publish Live
              </Button>
            </div>
          </div>

          <div className="border border-border/80 rounded-3xl overflow-hidden shadow-2xl bg-background">
            {data.sectionsOrder.map((secKey) => {
              switch (secKey) {
                case "hero":
                  return <AcademicsHeroSection key="hero" data={data.hero} />;
                case "academicDivisions":
                  return (
                    <DivisionListSection
                      key="academicDivisions"
                      data={data.academicDivisions}
                    />
                  );
                case "stemInnovation":
                  return (
                    <StemInnovationSection
                      key="stemInnovation"
                      data={data.stemInnovation}
                    />
                  );
                case "assessmentStandards":
                  return (
                    <AssessmentStandardsSection
                      key="assessmentStandards"
                      data={data.assessmentStandards}
                    />
                  );
                case "ctaBanner":
                  return <AcademicsCtaBanner key="ctaBanner" data={data.ctaBanner} />;
                default:
                  return null;
              }
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
