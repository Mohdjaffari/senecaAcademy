"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Info,
  ExternalLink,
  ChevronRight,
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  Users,
  HeartHandshake,
  Landmark,
  Building2,
  Sliders,
  RefreshCw,
  EyeOff,
  Clock,
  Send,
  Loader2,
  Check,
  Compass,
  X,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import { IconPicker } from "@/components/ui/icon-picker";
import { toast } from "sonner";
import {
  DEFAULT_ABOUT_PAGE_DATA,
  IAboutPageContent,
  IVisionMissionItem,
  ICoreValueItem,
  IMilestoneItem,
} from "@/lib/db/about-page-defaults";

// Live Preview Component Imports
import AboutHeroSection from "@/components/public/about/AboutHeroSection";
import PrincipalDeskSection from "@/components/public/about/PrincipalDeskSection";
import VisionMissionSection from "@/components/public/about/VisionMissionSection";
import CoreValuesSection from "@/components/public/about/CoreValuesSection";
import MilestonesTimelineSection from "@/components/public/about/MilestonesTimelineSection";
import CampusExperienceCta from "@/components/public/about/CampusExperienceCta";

const SECTION_LABELS: Record<string, { title: string; desc: string; icon: any }> = {
  hero: { title: "Hero Banner", desc: "Showcase headline, badge, breadcrumbs & CTA buttons", icon: LayoutTemplate },
  principal: { title: "Principal's Desk", desc: "Executive message, leader photograph & credentials", icon: Users },
  visionMission: { title: "Vision & Mission", desc: "Strategic foundation cards with customizable icons", icon: HeartHandshake },
  coreValues: { title: "Core Values", desc: "The four institutional pillars of Seneca Academy", icon: Landmark },
  milestones: { title: "Milestones Timeline", desc: "Historical chronological timeline & achievements", icon: Clock },
  campusCta: { title: "Campus Experience CTA", desc: "In-person campus tour booking call-to-action", icon: Building2 },
};

export default function WebsiteAboutUsPageManager() {
  const [data, setData] = useState<IAboutPageContent>(DEFAULT_ABOUT_PAGE_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraftModified, setIsDraftModified] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");

  // Load existing data from API
  const loadAboutData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/website/about?preview=true");
      const json = await res.json();
      if (json?.data?.page) {
        setData(json.data.page);
        setIsDraftModified(!!json.data.page.draft || !!json.data.isDraft);
      }
    } catch (err) {
      console.error("Failed to load about page data:", err);
      toast.error("Failed to load CMS data. Using local defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAboutData();
  }, []);

  // Save Draft Handler
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/website/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, saveAsDraft: true }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to save draft.");

      setIsDraftModified(true);
      toast.success("Draft saved successfully! You can preview changes before publishing.");
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
      // Save directly as published
      const res = await fetch("/api/website/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, saveAsDraft: false }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to publish.");

      setIsDraftModified(false);
      toast.success("About Us page published successfully! Changes are now live on the public site.");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish changes.");
    } finally {
      setPublishing(false);
    }
  };

  // Reset to Defaults Handler
  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to reset all About page fields to default values?")) {
      setData(DEFAULT_ABOUT_PAGE_DATA);
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
      case "principal":
        updated.principal.isVisible = !updated.principal.isVisible;
        break;
      case "visionMission":
        updated.visionMission.isVisible = !updated.visionMission.isVisible;
        break;
      case "coreValues":
        updated.coreValues.isVisible = !updated.coreValues.isVisible;
        break;
      case "milestones":
        updated.milestones.isVisible = !updated.milestones.isVisible;
        break;
      case "campusCta":
        updated.campusCta.isVisible = !updated.campusCta.isVisible;
        break;
    }
    setData(updated);
    setIsDraftModified(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
        <p className="text-xs font-semibold text-muted-foreground">Loading About Page CMS...</p>
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
        <span className="text-foreground font-bold">About Us</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <Info className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground tracking-tight">
              About Page Management
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
            Manage the content, history, leadership message, and campus information displayed on the public About page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold gap-1.5 border-border/80"
          >
            <Link href="/about" target="_blank">
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
          <TabsTrigger value="principal" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Users className="h-3.5 w-3.5" />
            Principal&apos;s Desk
          </TabsTrigger>
          <TabsTrigger value="visionMission" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <HeartHandshake className="h-3.5 w-3.5" />
            Vision & Mission
          </TabsTrigger>
          <TabsTrigger value="coreValues" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Landmark className="h-3.5 w-3.5" />
            Core Values
          </TabsTrigger>
          <TabsTrigger value="milestones" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Clock className="h-3.5 w-3.5" />
            Milestones Timeline
          </TabsTrigger>
          <TabsTrigger value="campusCta" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Building2 className="h-3.5 w-3.5" />
            Campus CTA
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Sliders className="h-3.5 w-3.5" />
            SEO & Metadata
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 bg-seneca-amber/10 text-seneca-amber border border-seneca-amber/20">
            <Eye className="h-3.5 w-3.5" />
            Live Preview
          </TabsTrigger>
        </TabsList>

        {/* 1. SECTIONS ORDER & VISIBILITY TAB */}
        <TabsContent value="sections" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Section Arrangement & Visibility</CardTitle>
                <CardDescription className="text-xs">
                  Reorder sections or hide specific blocks from appearing on the public About page.
                </CardDescription>
              </div>
              <Button onClick={handleResetDefaults} variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                <RefreshCw className="h-3 w-3" /> Reset Default Layout
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {data.sectionsOrder.map((secKey, index) => {
                const info = SECTION_LABELS[secKey] || { title: secKey, desc: "", icon: Layers };
                const Icon = info.icon;
                let isVisible = true;
                switch (secKey) {
                  case "hero": isVisible = data.hero.isVisible; break;
                  case "principal": isVisible = data.principal.isVisible; break;
                  case "visionMission": isVisible = data.visionMission.isVisible; break;
                  case "coreValues": isVisible = data.coreValues.isVisible; break;
                  case "milestones": isVisible = data.milestones.isVisible; break;
                  case "campusCta": isVisible = data.campusCta.isVisible; break;
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
                <CardTitle className="text-base font-bold">About Hero Section Settings</CardTitle>
                <CardDescription className="text-xs">
                  Configure the primary top showcase headline, badge icon, and call-to-action buttons.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Primary Action Button</span>
                    <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.hero.primaryCta.isVisible}
                        onChange={(e) => {
                          setData({
                            ...data,
                            hero: {
                              ...data.hero,
                              primaryCta: { ...data.hero.primaryCta, isVisible: e.target.checked },
                            },
                          });
                          setIsDraftModified(true);
                        }}
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <Input
                    value={data.hero.primaryCta.text}
                    onChange={(e) => {
                      setData({
                        ...data,
                        hero: {
                          ...data.hero,
                          primaryCta: { ...data.hero.primaryCta, text: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Button Text"
                    className="rounded-lg text-xs"
                  />
                  <Input
                    value={data.hero.primaryCta.href}
                    onChange={(e) => {
                      setData({
                        ...data,
                        hero: {
                          ...data.hero,
                          primaryCta: { ...data.hero.primaryCta, href: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="URL Link (/admissions)"
                    className="rounded-lg text-xs"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Secondary Action Button</span>
                    <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.hero.secondaryCta.isVisible}
                        onChange={(e) => {
                          setData({
                            ...data,
                            hero: {
                              ...data.hero,
                              secondaryCta: { ...data.hero.secondaryCta, isVisible: e.target.checked },
                            },
                          });
                          setIsDraftModified(true);
                        }}
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <Input
                    value={data.hero.secondaryCta.text}
                    onChange={(e) => {
                      setData({
                        ...data,
                        hero: {
                          ...data.hero,
                          secondaryCta: { ...data.hero.secondaryCta, text: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Button Text"
                    className="rounded-lg text-xs"
                  />
                  <Input
                    value={data.hero.secondaryCta.href}
                    onChange={(e) => {
                      setData({
                        ...data,
                        hero: {
                          ...data.hero,
                          secondaryCta: { ...data.hero.secondaryCta, href: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="URL Link (/academics)"
                    className="rounded-lg text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PRINCIPAL'S DESK TAB */}
        <TabsContent value="principal" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Principal&apos;s Desk & Leadership Message</CardTitle>
                <CardDescription className="text-xs">
                  Manage the Principal address, official credentials, office identifier, and photograph.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant={data.principal.isVisible ? "outline" : "secondary"}
                size="sm"
                onClick={() => {
                  setData({ ...data, principal: { ...data.principal, isVisible: !data.principal.isVisible } });
                  setIsDraftModified(true);
                }}
                className="rounded-xl text-xs"
              >
                {data.principal.isVisible ? "Section Visible" : "Section Hidden"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Photo Upload Column */}
                <div className="md:col-span-4 space-y-3">
                  <ImageUpload
                    label="Principal Portrait Photo"
                    value={data.principal.photoUrl}
                    onChange={(url) => {
                      setData({ ...data, principal: { ...data.principal, photoUrl: url } });
                      setIsDraftModified(true);
                    }}
                    aspectRatio="portrait"
                  />
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Photo Alt Text</label>
                    <Input
                      value={data.principal.photoAlt}
                      onChange={(e) => {
                        setData({ ...data, principal: { ...data.principal, photoAlt: e.target.value } });
                        setIsDraftModified(true);
                      }}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Information & Message Column */}
                <div className="md:col-span-8 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Section Badge</label>
                      <Input
                        value={data.principal.badge}
                        onChange={(e) => {
                          setData({ ...data, principal: { ...data.principal, badge: e.target.value } });
                          setIsDraftModified(true);
                        }}
                        className="rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Section Heading</label>
                      <Input
                        value={data.principal.heading}
                        onChange={(e) => {
                          setData({ ...data, principal: { ...data.principal, heading: e.target.value } });
                          setIsDraftModified(true);
                        }}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Principal Name</label>
                      <Input
                        value={data.principal.name}
                        onChange={(e) => {
                          setData({ ...data, principal: { ...data.principal, name: e.target.value } });
                          setIsDraftModified(true);
                        }}
                        className="rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Official Designation</label>
                      <Input
                        value={data.principal.designation}
                        onChange={(e) => {
                          setData({ ...data, principal: { ...data.principal, designation: e.target.value } });
                          setIsDraftModified(true);
                        }}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Academic Qualification</label>
                      <Input
                        value={data.principal.qualification}
                        onChange={(e) => {
                          setData({ ...data, principal: { ...data.principal, qualification: e.target.value } });
                          setIsDraftModified(true);
                        }}
                        className="rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Office Label</label>
                      <Input
                        value={data.principal.office}
                        onChange={(e) => {
                          setData({ ...data, principal: { ...data.principal, office: e.target.value } });
                          setIsDraftModified(true);
                        }}
                        className="rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Message Paragraphs Editor */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">Message Paragraphs</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setData({
                            ...data,
                            principal: {
                              ...data.principal,
                              messageParagraphs: [...data.principal.messageParagraphs, ""],
                            },
                          });
                          setIsDraftModified(true);
                        }}
                        className="rounded-xl text-xs h-7 gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add Paragraph
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {data.principal.messageParagraphs.map((para, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2">
                          <textarea
                            value={para}
                            onChange={(e) => {
                              const updatedParas = [...data.principal.messageParagraphs];
                              updatedParas[pIdx] = e.target.value;
                              setData({
                                ...data,
                                principal: { ...data.principal, messageParagraphs: updatedParas },
                              });
                              setIsDraftModified(true);
                            }}
                            rows={2}
                            className="flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder={`Paragraph ${pIdx + 1}...`}
                          />
                          {data.principal.messageParagraphs.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updatedParas = data.principal.messageParagraphs.filter((_, i) => i !== pIdx);
                                setData({
                                  ...data,
                                  principal: { ...data.principal, messageParagraphs: updatedParas },
                                });
                                setIsDraftModified(true);
                              }}
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. VISION & MISSION TAB */}
        <TabsContent value="visionMission" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Vision & Mission Cards Manager</CardTitle>
                <CardDescription className="text-xs">
                  Create, reorder, and edit strategic foundation cards.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newCard: IVisionMissionItem = {
                    id: `vm-${Date.now()}`,
                    title: "New Strategic Pillar",
                    description: "Describe the foundational purpose and pedagogical commitment here.",
                    icon: "Compass",
                    iconBgClass: "bg-seneca-crimson/10 text-seneca-crimson",
                    displayOrder: data.visionMission.items.length + 1,
                    isVisible: true,
                  };
                  setData({
                    ...data,
                    visionMission: {
                      ...data.visionMission,
                      items: [...data.visionMission.items, newCard],
                    },
                  });
                  setIsDraftModified(true);
                }}
                className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson text-white hover:bg-seneca-crimson/90"
              >
                <Plus className="h-3.5 w-3.5" /> Add Vision/Mission Card
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.visionMission.badge}
                    onChange={(e) => {
                      setData({ ...data, visionMission: { ...data.visionMission, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.visionMission.heading}
                    onChange={(e) => {
                      setData({ ...data, visionMission: { ...data.visionMission, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 pt-2">
                {data.visionMission.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-border/80 bg-card space-y-3 shadow-xs hover:border-seneca-crimson/40 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px]">#{idx + 1}</Badge>
                        {item.title || "Untitled Card"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const duplicated: IVisionMissionItem = {
                              ...item,
                              id: `vm-${Date.now()}`,
                              title: `${item.title} (Copy)`,
                              displayOrder: data.visionMission.items.length + 1,
                            };
                            setData({
                              ...data,
                              visionMission: {
                                ...data.visionMission,
                                items: [...data.visionMission.items, duplicated],
                              },
                            });
                            setIsDraftModified(true);
                          }}
                          className="h-7 w-7 rounded-lg"
                          title="Duplicate"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={data.visionMission.items.length <= 1}
                          onClick={() => {
                            const filtered = data.visionMission.items.filter((_, i) => i !== idx);
                            setData({
                              ...data,
                              visionMission: { ...data.visionMission, items: filtered },
                            });
                            setIsDraftModified(true);
                          }}
                          className="h-7 w-7 text-rose-500 rounded-lg hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-bold">Card Title</label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...data.visionMission.items];
                            updated[idx].title = e.target.value;
                            setData({ ...data, visionMission: { ...data.visionMission, items: updated } });
                            setIsDraftModified(true);
                          }}
                          className="rounded-lg text-xs"
                        />
                      </div>
                      <IconPicker
                        label="Icon"
                        value={item.icon}
                        onChange={(icon) => {
                          const updated = [...data.visionMission.items];
                          updated[idx].icon = icon;
                          setData({ ...data, visionMission: { ...data.visionMission, items: updated } });
                          setIsDraftModified(true);
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold">Description Text</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...data.visionMission.items];
                          updated[idx].description = e.target.value;
                          setData({ ...data, visionMission: { ...data.visionMission, items: updated } });
                          setIsDraftModified(true);
                        }}
                        rows={3}
                        className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. CORE VALUES TAB */}
        <TabsContent value="coreValues" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Core Values Manager</CardTitle>
                <CardDescription className="text-xs">
                  The Four Pillars of Seneca Academy and character development standards.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newCard: ICoreValueItem = {
                    id: `cv-${Date.now()}`,
                    title: "New Core Value",
                    desc: "Describe the moral or academic pillar here.",
                    icon: "HeartHandshake",
                    iconColor: "text-seneca-amber",
                    displayOrder: data.coreValues.items.length + 1,
                    isVisible: true,
                  };
                  setData({
                    ...data,
                    coreValues: {
                      ...data.coreValues,
                      items: [...data.coreValues.items, newCard],
                    },
                  });
                  setIsDraftModified(true);
                }}
                className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson text-white hover:bg-seneca-crimson/90"
              >
                <Plus className="h-3.5 w-3.5" /> Add Core Value
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.coreValues.badge}
                    onChange={(e) => {
                      setData({ ...data, coreValues: { ...data.coreValues, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.coreValues.heading}
                    onChange={(e) => {
                      setData({ ...data, coreValues: { ...data.coreValues, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Core Values Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {data.coreValues.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-border/80 bg-card space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-foreground">
                        Pillar #{idx + 1}: {item.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={data.coreValues.items.length <= 1}
                          onClick={() => {
                            const filtered = data.coreValues.items.filter((_, i) => i !== idx);
                            setData({ ...data, coreValues: { ...data.coreValues, items: filtered } });
                            setIsDraftModified(true);
                          }}
                          className="h-7 w-7 text-rose-500 rounded-lg"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold">Pillar Title</label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...data.coreValues.items];
                            updated[idx].title = e.target.value;
                            setData({ ...data, coreValues: { ...data.coreValues, items: updated } });
                            setIsDraftModified(true);
                          }}
                          className="rounded-lg text-xs"
                        />
                      </div>
                      <IconPicker
                        label="Icon"
                        value={item.icon}
                        onChange={(icon) => {
                          const updated = [...data.coreValues.items];
                          updated[idx].icon = icon;
                          setData({ ...data, coreValues: { ...data.coreValues, items: updated } });
                          setIsDraftModified(true);
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold">Description</label>
                      <textarea
                        value={item.desc}
                        onChange={(e) => {
                          const updated = [...data.coreValues.items];
                          updated[idx].desc = e.target.value;
                          setData({ ...data, coreValues: { ...data.coreValues, items: updated } });
                          setIsDraftModified(true);
                        }}
                        rows={2}
                        className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. MILESTONES TIMELINE TAB */}
        <TabsContent value="milestones" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Milestones Timeline Manager</CardTitle>
                <CardDescription className="text-xs">
                  Manage historical years, achievements, and highlight tags displayed along the animated timeline.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMilestone: IMilestoneItem = {
                    id: `m-${Date.now()}`,
                    year: "2027",
                    category: "Future Innovation",
                    title: "Upcoming Milestone",
                    desc: "Details about new campus wings, international partnerships, or student accomplishments.",
                    icon: "Sparkles",
                    highlights: ["Campus Expansion", "Global Partnership"],
                    gradient: "from-seneca-crimson to-seneca-amber",
                    badgeVariant: "border-seneca-amber/40 text-seneca-amber bg-seneca-amber/10",
                    displayOrder: data.milestones.items.length + 1,
                    isVisible: true,
                  };
                  setData({
                    ...data,
                    milestones: {
                      ...data.milestones,
                      items: [...data.milestones.items, newMilestone],
                    },
                  });
                  setIsDraftModified(true);
                }}
                className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson text-white hover:bg-seneca-crimson/90"
              >
                <Plus className="h-3.5 w-3.5" /> Add Milestone
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.milestones.badge}
                    onChange={(e) => {
                      setData({ ...data, milestones: { ...data.milestones, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Section Heading Prefix</label>
                  <Input
                    value={data.milestones.heading}
                    onChange={(e) => {
                      setData({ ...data, milestones: { ...data.milestones, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Highlighted Word (Gradient)</label>
                  <Input
                    value={data.milestones.highlightedHeading}
                    onChange={(e) => {
                      setData({ ...data, milestones: { ...data.milestones, highlightedHeading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Ribbon Title</label>
                  <Input
                    value={data.milestones.ribbonTitle}
                    onChange={(e) => {
                      setData({ ...data, milestones: { ...data.milestones, ribbonTitle: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-bold text-seneca-amber"
                  />
                </div>
              </div>

              {/* Milestones List */}
              <div className="space-y-3 pt-2">
                {data.milestones.items.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl border border-border/80 bg-card space-y-3 shadow-xs hover:border-seneca-crimson/40 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-seneca-crimson dark:text-seneca-amber">
                          {m.year}
                        </span>
                        <Badge variant="outline" className="text-[10px]">{m.category}</Badge>
                        <span className="text-xs font-bold text-foreground truncate max-w-xs">{m.title}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={data.milestones.items.length <= 1}
                          onClick={() => {
                            const filtered = data.milestones.items.filter((_, i) => i !== idx);
                            setData({ ...data, milestones: { ...data.milestones, items: filtered } });
                            setIsDraftModified(true);
                          }}
                          className="h-7 w-7 text-rose-500 rounded-lg"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold">Year</label>
                        <Input
                          value={m.year}
                          onChange={(e) => {
                            const updated = [...data.milestones.items];
                            updated[idx].year = e.target.value;
                            setData({ ...data, milestones: { ...data.milestones, items: updated } });
                            setIsDraftModified(true);
                          }}
                          className="rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold">Category Badge</label>
                        <Input
                          value={m.category}
                          onChange={(e) => {
                            const updated = [...data.milestones.items];
                            updated[idx].category = e.target.value;
                            setData({ ...data, milestones: { ...data.milestones, items: updated } });
                            setIsDraftModified(true);
                          }}
                          className="rounded-lg text-xs"
                        />
                      </div>
                      <IconPicker
                        label="Beacon Icon"
                        value={m.icon}
                        onChange={(icon) => {
                          const updated = [...data.milestones.items];
                          updated[idx].icon = icon;
                          setData({ ...data, milestones: { ...data.milestones, items: updated } });
                          setIsDraftModified(true);
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold">Milestone Title</label>
                      <Input
                        value={m.title}
                        onChange={(e) => {
                          const updated = [...data.milestones.items];
                          updated[idx].title = e.target.value;
                          setData({ ...data, milestones: { ...data.milestones, items: updated } });
                          setIsDraftModified(true);
                        }}
                        className="rounded-lg text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold">Description Narrative</label>
                      <textarea
                        value={m.desc}
                        onChange={(e) => {
                          const updated = [...data.milestones.items];
                          updated[idx].desc = e.target.value;
                          setData({ ...data, milestones: { ...data.milestones, items: updated } });
                          setIsDraftModified(true);
                        }}
                        rows={2}
                        className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>

                    {/* Highlights Tags */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-bold text-foreground block">
                        Achievement Highlights (Comma Separated)
                      </label>
                      <Input
                        value={m.highlights.join(", ")}
                        onChange={(e) => {
                          const updated = [...data.milestones.items];
                          updated[idx].highlights = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setData({ ...data, milestones: { ...data.milestones, items: updated } });
                          setIsDraftModified(true);
                        }}
                        placeholder="e.g. Science Labs, 100% Board Pass, Robotics Wing"
                        className="rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. CAMPUS CTA TAB */}
        <TabsContent value="campusCta" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Campus Experience CTA</CardTitle>
                <CardDescription className="text-xs">
                  Bottom call-to-action inviting families for personalized guided tours.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant={data.campusCta.isVisible ? "outline" : "secondary"}
                size="sm"
                onClick={() => {
                  setData({ ...data, campusCta: { ...data.campusCta, isVisible: !data.campusCta.isVisible } });
                  setIsDraftModified(true);
                }}
                className="rounded-xl text-xs"
              >
                {data.campusCta.isVisible ? "Section Visible" : "Section Hidden"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Section Heading</label>
                <Input
                  value={data.campusCta.heading}
                  onChange={(e) => {
                    setData({ ...data, campusCta: { ...data.campusCta, heading: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Description</label>
                <textarea
                  value={data.campusCta.description}
                  onChange={(e) => {
                    setData({ ...data, campusCta: { ...data.campusCta, description: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-1.5">
                  <span className="text-xs font-bold block">Primary CTA Button</span>
                  <Input
                    value={data.campusCta.primaryCta.text}
                    onChange={(e) => {
                      setData({
                        ...data,
                        campusCta: {
                          ...data.campusCta,
                          primaryCta: { ...data.campusCta.primaryCta, text: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Button Text"
                    className="rounded-lg text-xs"
                  />
                  <Input
                    value={data.campusCta.primaryCta.href}
                    onChange={(e) => {
                      setData({
                        ...data,
                        campusCta: {
                          ...data.campusCta,
                          primaryCta: { ...data.campusCta.primaryCta, href: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="URL (/contact)"
                    className="rounded-lg text-xs"
                  />
                </div>

                <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-1.5">
                  <span className="text-xs font-bold block">Secondary CTA Button</span>
                  <Input
                    value={data.campusCta.secondaryCta.text}
                    onChange={(e) => {
                      setData({
                        ...data,
                        campusCta: {
                          ...data.campusCta,
                          secondaryCta: { ...data.campusCta.secondaryCta, text: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Button Text"
                    className="rounded-lg text-xs"
                  />
                  <Input
                    value={data.campusCta.secondaryCta.href}
                    onChange={(e) => {
                      setData({
                        ...data,
                        campusCta: {
                          ...data.campusCta,
                          secondaryCta: { ...data.campusCta.secondaryCta, href: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="URL (/gallery)"
                    className="rounded-lg text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. SEO TAB */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">About Page Search Engine Optimization (SEO)</CardTitle>
              <CardDescription className="text-xs">
                Configure meta titles, descriptions, and OpenGraph tags for Google and social previews.
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

        {/* 9. LIVE PREVIEW TAB */}
        <TabsContent value="preview" className="space-y-4">
          <div className="p-4 rounded-2xl bg-seneca-amber/10 border border-seneca-amber/30 text-xs text-seneca-amber flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold">
              <Eye className="h-4 w-4" /> Live Interactive Preview of In-Editor State
            </span>
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveDraft} size="sm" variant="outline" className="rounded-xl text-xs h-7">
                Save Draft
              </Button>
              <Button onClick={handlePublish} size="sm" className="rounded-xl text-xs h-7 bg-seneca-crimson text-white">
                Publish Live
              </Button>
            </div>
          </div>

          <div className="border border-border/80 rounded-3xl overflow-hidden shadow-2xl bg-background">
            {data.sectionsOrder.map((secKey) => {
              switch (secKey) {
                case "hero":
                  return <AboutHeroSection key="hero" data={data.hero} />;
                case "principal":
                  return <PrincipalDeskSection key="principal" data={data.principal} />;
                case "visionMission":
                  return <VisionMissionSection key="visionMission" data={data.visionMission} />;
                case "coreValues":
                  return <CoreValuesSection key="coreValues" data={data.coreValues} />;
                case "milestones":
                  return <MilestonesTimelineSection key="milestones" data={data.milestones} />;
                case "campusCta":
                  return <CampusExperienceCta key="campusCta" data={data.campusCta} />;
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
