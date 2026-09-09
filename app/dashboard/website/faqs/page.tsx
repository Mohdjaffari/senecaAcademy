"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
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
  HelpCircle,
  Award,
  PhoneCall,
  Sliders,
  RefreshCw,
  Send,
  Loader2,
  Check,
  Globe,
  Layers,
  Smartphone,
  Tablet,
  Monitor,
  HeartHandshake,
  Search,
  BookOpen,
  GraduationCap,
  CreditCard,
  Building2,
  Laptop,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import { IconPicker } from "@/components/ui/icon-picker";
import { toast } from "sonner";
import {
  DEFAULT_FAQS_PAGE_DATA,
  IFaqsPageData,
  IFaqCategory,
  IFaqQuestionItem,
  IFaqStatItem,
} from "@/lib/db/faqs-page-defaults";

// Live Preview Component
import FaqsInteractiveContainer from "@/components/public/faqs/FaqsInteractiveContainer";

const SECTION_META: Record<string, { title: string; desc: string; icon: any; tab: string }> = {
  hero: { title: "Hero Banner", desc: "Top showcase headline, knowledge base badge, and action buttons", icon: LayoutTemplate, tab: "hero" },
  stats: { title: "Proof Points & Stats", desc: "Institutional highlights bar (100% Pass Rate, PKR 0 Fee, 15:1 Ratio)", icon: Award, tab: "stats" },
  questions: { title: "Questions & Answers", desc: "Categorized Q&A items knowledge base with tags and search", icon: HelpCircle, tab: "questions" },
  helpdesk: { title: "Admissions Helpdesk CTA", desc: "Personalized assistance, phone, email, and WhatsApp helpdesk cards", icon: PhoneCall, tab: "helpdesk" },
};

export default function WebsiteFAQsPageManager() {
  const [data, setData] = useState<IFaqsPageData>(DEFAULT_FAQS_PAGE_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraftModified, setIsDraftModified] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedAdminCategory, setSelectedAdminCategory] = useState<string>("all");

  // Load existing data from API
  const loadFaqsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/website/faqs?preview=true");
      const json = await res.json();
      if (json?.data?.page) {
        setData({
          ...DEFAULT_FAQS_PAGE_DATA,
          ...json.data.page,
          sectionsOrder: json.data.page.sectionsOrder || DEFAULT_FAQS_PAGE_DATA.sectionsOrder,
          hero: { ...DEFAULT_FAQS_PAGE_DATA.hero, ...(json.data.page.hero || {}) },
          categories:
            json.data.page.categories && json.data.page.categories.length > 0
              ? json.data.page.categories
              : DEFAULT_FAQS_PAGE_DATA.categories,
          questions:
            json.data.page.questions && json.data.page.questions.length > 0
              ? json.data.page.questions
              : DEFAULT_FAQS_PAGE_DATA.questions,
          stats: {
            ...DEFAULT_FAQS_PAGE_DATA.stats,
            ...(json.data.page.stats || {}),
            items:
              json.data.page.stats?.items && json.data.page.stats.items.length > 0
                ? json.data.page.stats.items
                : DEFAULT_FAQS_PAGE_DATA.stats.items,
          },
          helpdesk: {
            ...DEFAULT_FAQS_PAGE_DATA.helpdesk,
            ...(json.data.page.helpdesk || {}),
          },
          seo: {
            ...DEFAULT_FAQS_PAGE_DATA.seo,
            ...(json.data.page.seo || {}),
          },
        });
        setIsDraftModified(!!json.data.page.draft || !!json.data.isDraft);
      }
    } catch (err) {
      console.error("Failed to load FAQs page data:", err);
      toast.error("Failed to load CMS data. Using local defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqsData();
  }, []);

  // Save Draft Handler
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/website/faqs", {
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
      const res = await fetch("/api/website/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, saveAsDraft: false }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to publish.");

      setIsDraftModified(false);
      toast.success("FAQs Knowledge Base published successfully! Changes are now live on the public site.");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish changes.");
    } finally {
      setPublishing(false);
    }
  };

  // Reset to Defaults Handler
  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to reset all FAQ questions, categories, and settings to default values?")) {
      setData(DEFAULT_FAQS_PAGE_DATA);
      setIsDraftModified(true);
      toast.info("Reset to standard defaults. Click 'Publish Changes' or 'Save Draft' to persist.");
    }
  };

  // Move Section in sectionsOrder
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

  // ----------------------------------------------------
  // CATEGORIES HELPERS
  // ----------------------------------------------------
  const addCategory = () => {
    const nextIdx = (data.categories || []).length + 1;
    const newCatId = `cat-${Date.now()}`;
    const newCat: IFaqCategory = {
      id: newCatId,
      label: "New FAQ Category",
      icon: "HelpCircle",
      displayOrder: nextIdx,
      isVisible: true,
    };
    setData({
      ...data,
      categories: [...(data.categories || []), newCat],
    });
    setIsDraftModified(true);
    toast.success("New FAQ category added.");
  };

  const moveCategory = (index: number, direction: "up" | "down") => {
    const list = [...data.categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setData({ ...data, categories: list });
    setIsDraftModified(true);
  };

  const deleteCategory = (index: number) => {
    const cat = data.categories[index];
    if (cat.id === "all") {
      toast.error("The 'All Questions' master category cannot be removed.");
      return;
    }
    if (confirm(`Are you sure you want to remove the category "${cat.label}"?`)) {
      const list = [...data.categories];
      list.splice(index, 1);
      setData({ ...data, categories: list });
      setIsDraftModified(true);
      toast.success("Category removed.");
    }
  };

  const updateCategory = (index: number, field: keyof IFaqCategory, value: any) => {
    const list = [...data.categories];
    list[index] = { ...list[index], [field]: value };
    setData({ ...data, categories: list });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // QUESTIONS & ANSWERS HELPERS
  // ----------------------------------------------------
  const addQuestion = () => {
    const nextIdx = (data.questions || []).length + 1;
    const defaultCat = data.categories.find((c) => c.id !== "all") || data.categories[0];
    const newQ: IFaqQuestionItem = {
      id: `faq-${Date.now()}`,
      categoryId: defaultCat ? defaultCat.id : "admissions",
      categoryLabel: defaultCat ? defaultCat.label : "Admissions & Enrollment",
      question: "What is the new question title?",
      answer: "Provide a comprehensive, verified explanation for students and parents.",
      tags: ["admissions", "general"],
      isHighlighted: false,
      displayOrder: nextIdx,
      isActive: true,
    };
    setData({
      ...data,
      questions: [newQ, ...(data.questions || [])],
    });
    setIsDraftModified(true);
    toast.success("New FAQ question added at top.");
  };

  const duplicateQuestion = (index: number) => {
    const item = data.questions[index];
    const duplicated: IFaqQuestionItem = {
      ...item,
      id: `faq-${Date.now()}`,
      question: `${item.question} (Copy)`,
      displayOrder: (data.questions || []).length + 1,
    };
    const updated = [...data.questions];
    updated.splice(index + 1, 0, duplicated);
    setData({ ...data, questions: updated });
    setIsDraftModified(true);
    toast.success("Question duplicated.");
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const list = [...data.questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setData({ ...data, questions: list });
    setIsDraftModified(true);
  };

  const deleteQuestion = (index: number) => {
    if (confirm("Are you sure you want to remove this FAQ question?")) {
      const list = [...data.questions];
      list.splice(index, 1);
      setData({ ...data, questions: list });
      setIsDraftModified(true);
      toast.success("Question removed.");
    }
  };

  const updateQuestion = (index: number, field: keyof IFaqQuestionItem, value: any) => {
    const list = [...data.questions];
    list[index] = { ...list[index], [field]: value };

    // If categoryId changed, sync categoryLabel automatically
    if (field === "categoryId") {
      const cat = data.categories.find((c) => c.id === value);
      if (cat) {
        list[index].categoryLabel = cat.label;
      }
    }

    setData({ ...data, questions: list });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // STATS BAR HELPERS
  // ----------------------------------------------------
  const addStat = () => {
    const nextIdx = (data.stats.items || []).length + 1;
    const newStat: IFaqStatItem = {
      id: `stat-${Date.now()}`,
      value: "100%",
      label: "New Highlight",
      description: "Brief statistical description or proof point",
      icon: "Award",
    };
    setData({
      ...data,
      stats: {
        ...data.stats,
        items: [...(data.stats.items || []), newStat],
      },
    });
    setIsDraftModified(true);
    toast.success("New highlight stat added.");
  };

  const deleteStat = (index: number) => {
    const list = [...data.stats.items];
    list.splice(index, 1);
    setData({
      ...data,
      stats: { ...data.stats, items: list },
    });
    setIsDraftModified(true);
    toast.success("Highlight stat removed.");
  };

  const updateStat = (index: number, field: keyof IFaqStatItem, value: any) => {
    const list = [...data.stats.items];
    list[index] = { ...list[index], [field]: value };
    setData({
      ...data,
      stats: { ...data.stats, items: list },
    });
    setIsDraftModified(true);
  };

  // Filtered Questions in Admin View
  const filteredAdminQuestions = (data.questions || []).filter((q) => {
    const matchesCat =
      selectedAdminCategory === "all" || q.categoryId === selectedAdminCategory;
    const query = faqSearch.toLowerCase().trim();
    if (!query) return matchesCat;
    const matchesQuery =
      q.question.toLowerCase().includes(query) ||
      q.answer.toLowerCase().includes(query) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCat && matchesQuery;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="h-9 w-9 animate-spin text-seneca-amber" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Loading FAQs Knowledge Base CMS data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-border/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5">
              Website CMS
            </Badge>
            {isDraftModified && (
              <Badge variant="secondary" className="text-[11px] bg-amber-500/10 text-amber-600 border border-amber-500/20 gap-1 flex items-center">
                <AlertCircle className="w-3 h-3" />
                Unpublished Changes
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
            FAQs Knowledge Base CMS Manager
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage categorized Q&A items, parent assistance guides, categories, proof point stats, and helpdesk hotlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="rounded-xl text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5"
          >
            <Link href="/faqs" target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View Public Page</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={saving}
            onClick={handleSaveDraft}
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            disabled={publishing}
            onClick={handlePublish}
            size="sm"
            className="rounded-xl font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-md transition-all hover:scale-[1.02] text-xs"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Publish Live</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/80 border border-border/80 p-1 rounded-2xl flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="sections" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Layers className="h-3.5 w-3.5" />
            <span>Sections Order</span>
          </TabsTrigger>
          <TabsTrigger value="hero" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span>Hero Banner</span>
          </TabsTrigger>
          <TabsTrigger value="questions" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Questions & Answers ({data.questions?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Layers className="h-3.5 w-3.5" />
            <span>FAQ Categories ({data.categories?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Award className="h-3.5 w-3.5" />
            <span>Proof Points & Stats</span>
          </TabsTrigger>
          <TabsTrigger value="helpdesk" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Helpdesk CTA</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Globe className="h-3.5 w-3.5" />
            <span>SEO & Meta</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 bg-seneca-amber/10 text-seneca-amber border border-seneca-amber/20 hover:bg-seneca-amber/20">
            <Eye className="h-3.5 w-3.5" />
            <span>Live Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: SECTIONS ORDER & QUICK JUMP                  */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="sections" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-seneca-amber" />
                <span>FAQs Page Layout Sequence</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Reorder page sections or click &ldquo;Edit Section&rdquo; to jump directly to that component&apos;s data.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              {data.sectionsOrder.map((sectionKey, index) => {
                const meta = SECTION_META[sectionKey] || {
                  title: sectionKey,
                  desc: "Custom page component",
                  icon: Layers,
                  tab: sectionKey,
                };
                const Icon = meta.icon;

                return (
                  <div
                    key={sectionKey}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-card border border-border/70 hover:border-seneca-amber/40 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-seneca-amber/10 text-seneca-amber font-bold text-sm flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <h4 className="text-sm font-bold text-foreground truncate">{meta.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{meta.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab(meta.tab)}
                        className="rounded-xl text-xs gap-1 text-seneca-amber hover:bg-seneca-amber/10"
                      >
                        <span>Edit Section</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={index === 0}
                        onClick={() => moveSection(index, "up")}
                        className="h-8 w-8 rounded-xl"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={index === data.sectionsOrder.length - 1}
                        onClick={() => moveSection(index, "down")}
                        className="h-8 w-8 rounded-xl"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: HERO BANNER                                  */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="hero" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-seneca-amber" />
                  <span>FAQs Hero Banner Settings</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure top headline, eyebrow badge, floating quick-spec chips, and action buttons.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{data.hero.isVisible ? "Visible" : "Hidden"}</span>
                <Switch
                  checked={data.hero.isVisible}
                  onCheckedChange={(checked: boolean) => {
                    setData({ ...data, hero: { ...data.hero, isVisible: checked } });
                    setIsDraftModified(true);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Eyebrow Badge Text</label>
                  <Input
                    value={data.hero.badge}
                    onChange={(e) => {
                      setData({ ...data, hero: { ...data.hero, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Institutional Knowledge Base"
                  />
                </div>
                <IconPicker
                  label="Badge Icon"
                  value={data.hero.badgeIcon || "HelpCircle"}
                  onChange={(icon) => {
                    setData({ ...data, hero: { ...data.hero, badgeIcon: icon } });
                    setIsDraftModified(true);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Main Title (Prefix)</label>
                  <Input
                    value={data.hero.title}
                    onChange={(e) => {
                      setData({ ...data, hero: { ...data.hero, title: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Frequently Asked Questions &"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Highlighted Title (Gradient Text)</label>
                  <Input
                    value={data.hero.highlightedTitle || ""}
                    onChange={(e) => {
                      setData({ ...data, hero: { ...data.hero, highlightedTitle: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Admissions Helpdesk."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Hero Subtitle / Description</label>
                <Textarea
                  value={data.hero.description}
                  onChange={(e) => {
                    setData({ ...data, hero: { ...data.hero, description: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={3}
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              {/* Floating Spec Chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-seneca-amber" />
                    Left Floating Info Chip
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={data.hero.leftSpecChip.badgeText}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            leftSpecChip: { ...data.hero.leftSpecChip, badgeText: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="20+ Verified Answers"
                      className="rounded-xl text-xs"
                    />
                    <IconPicker
                      label="Chip Icon"
                      value={data.hero.leftSpecChip.icon || "CheckCircle2"}
                      onChange={(icon) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            leftSpecChip: { ...data.hero.leftSpecChip, icon },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <Input
                    value={data.hero.leftSpecChip.description}
                    onChange={(e) => {
                      setData({
                        ...data,
                        hero: {
                          ...data.hero,
                          leftSpecChip: { ...data.hero.leftSpecChip, description: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Updated for Academic Session 2026–2027"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-seneca-crimson" />
                    Right Floating Info Chip
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={data.hero.rightSpecChip.badgeText}
                      onChange={(e) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            rightSpecChip: { ...data.hero.rightSpecChip, badgeText: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Direct Counseling"
                      className="rounded-xl text-xs"
                    />
                    <IconPicker
                      label="Chip Icon"
                      value={data.hero.rightSpecChip.icon || "PhoneCall"}
                      onChange={(icon) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            rightSpecChip: { ...data.hero.rightSpecChip, icon },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <Input
                    value={data.hero.rightSpecChip.description}
                    onChange={(e) => {
                      setData({
                        ...data,
                        hero: {
                          ...data.hero,
                          rightSpecChip: { ...data.hero.rightSpecChip, description: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Saturday Assessment & Campus Helpdesk"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Primary Action Button</span>
                    <Switch
                      checked={data.hero.primaryCta.isVisible}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            primaryCta: { ...data.hero.primaryCta, isVisible: checked },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      placeholder="Explore Admissions & Fees"
                      className="rounded-xl text-xs"
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
                      placeholder="/admissions"
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Secondary Action Button</span>
                    <Switch
                      checked={data.hero.secondaryCta.isVisible}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          hero: {
                            ...data.hero,
                            secondaryCta: { ...data.hero.secondaryCta, isVisible: checked },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      placeholder="Contact Helpdesk"
                      className="rounded-xl text-xs"
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
                      placeholder="/contact"
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: QUESTIONS & ANSWERS (FULL CRUD)              */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="questions" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-seneca-amber" />
                  <span>Questions & Answers Knowledge Base Directory</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Add, edit, tag, feature, reorder, or duplicate Q&A items across categories.
                </CardDescription>
              </div>

              <Button
                type="button"
                onClick={addQuestion}
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Question</span>
              </Button>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Filter Controls Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-2xl bg-muted/20 border border-border/60">
                <div className="sm:col-span-8 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Search Q&As by title, answer, or tags..."
                    className="pl-9 rounded-xl text-xs h-9"
                  />
                </div>
                <div className="sm:col-span-4">
                  <select
                    value={selectedAdminCategory}
                    onChange={(e) => setSelectedAdminCategory(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium"
                  >
                    <option value="all">All Categories ({data.questions.length})</option>
                    {data.categories
                      .filter((c) => c.id !== "all")
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label} (
                          {data.questions.filter((q) => q.categoryId === cat.id).length})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {filteredAdminQuestions.map((qItem, idx) => {
                  const originalIndex = data.questions.findIndex((q) => q.id === qItem.id);

                  return (
                    <div
                      key={qItem.id || idx}
                      className="p-4 sm:p-5 rounded-3xl bg-card border border-border/70 hover:border-seneca-amber/40 transition-all space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="h-6 w-6 rounded-lg bg-seneca-amber/10 text-seneca-amber text-xs font-bold flex items-center justify-center">
                            #{originalIndex + 1}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-bold">
                            {qItem.categoryLabel}
                          </Badge>
                          {qItem.isHighlighted && (
                            <Badge className="text-[10px] bg-seneca-crimson text-white">
                              Featured
                            </Badge>
                          )}
                          {qItem.isActive === false && (
                            <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                              Draft / Inactive
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <div className="flex items-center gap-1.5 mr-2">
                            <span className="text-[11px] text-muted-foreground">Active</span>
                            <Switch
                              checked={qItem.isActive !== false}
                              onCheckedChange={(checked: boolean) =>
                                updateQuestion(originalIndex, "isActive", checked)
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={originalIndex === 0}
                            onClick={() => moveQuestion(originalIndex, "up")}
                            className="h-8 w-8 rounded-xl"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={originalIndex === data.questions.length - 1}
                            onClick={() => moveQuestion(originalIndex, "down")}
                            className="h-8 w-8 rounded-xl"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateQuestion(originalIndex)}
                            className="h-8 w-8 rounded-xl"
                            title="Duplicate Question"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteQuestion(originalIndex)}
                            className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8 space-y-1">
                          <label className="text-[11px] font-bold">Question Title</label>
                          <Input
                            value={qItem.question}
                            onChange={(e) => updateQuestion(originalIndex, "question", e.target.value)}
                            className="rounded-xl text-xs font-semibold"
                            placeholder="e.g. What is the admissions procedure for Session 2026–2027?"
                          />
                        </div>
                        <div className="sm:col-span-4 space-y-1">
                          <label className="text-[11px] font-bold">Assigned Category</label>
                          <select
                            value={qItem.categoryId}
                            onChange={(e) => updateQuestion(originalIndex, "categoryId", e.target.value)}
                            className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs"
                          >
                            {data.categories
                              .filter((c) => c.id !== "all")
                              .map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.label}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold">Answer Text (Markdown/Paragraphs supported)</label>
                        <Textarea
                          value={qItem.answer}
                          onChange={(e) => updateQuestion(originalIndex, "answer", e.target.value)}
                          rows={3}
                          className="rounded-xl text-xs leading-relaxed"
                          placeholder="Provide a comprehensive explanation..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                        <div className="sm:col-span-9 space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">
                            Search Tags (comma-separated for keyword discovery)
                          </label>
                          <Input
                            value={(qItem.tags || []).join(", ")}
                            onChange={(e) => {
                              const tags = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              updateQuestion(originalIndex, "tags", tags);
                            }}
                            className="rounded-xl text-xs h-8"
                            placeholder="admissions, bsek, fee, tuition, requirements"
                          />
                        </div>

                        <div className="sm:col-span-3 flex items-center justify-end gap-2 pt-4 sm:pt-0">
                          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={qItem.isHighlighted || false}
                              onChange={(e) => updateQuestion(originalIndex, "isHighlighted", e.target.checked)}
                              className="rounded accent-seneca-crimson h-4 w-4"
                            />
                            <span>Featured Question</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: FAQ CATEGORIES MANAGER                       */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-seneca-amber" />
                  <span>FAQ Categories & Navigation Filter Tabs</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Create custom thematic categories with Lucide icons for the sticky public filter bar.
                </CardDescription>
              </div>

              <Button
                type="button"
                onClick={addCategory}
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-amber hover:bg-seneca-amber/90 text-zinc-950"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Category</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.categories.map((cat, cIdx) => (
                  <div
                    key={cat.id || cIdx}
                    className="p-4 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-seneca-amber/10 text-seneca-amber text-xs font-bold flex items-center justify-center">
                            {cIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground">{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={cIdx === 0}
                            onClick={() => moveCategory(cIdx, "up")}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={cIdx === data.categories.length - 1}
                            onClick={() => moveCategory(cIdx, "down")}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          {cat.id !== "all" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCategory(cIdx)}
                              className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold">Category Name</label>
                          <Input
                            value={cat.label}
                            disabled={cat.id === "all"}
                            onChange={(e) => updateCategory(cIdx, "label", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="e.g. Admissions & Enrollment"
                          />
                        </div>
                        <IconPicker
                          label="Icon"
                          value={cat.icon || "HelpCircle"}
                          onChange={(icon) => updateCategory(cIdx, "icon", icon)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 5: PROOF POINTS & STATS BAR                     */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="stats" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="h-4 w-4 text-seneca-amber" />
                  <span>Institutional Proof Points & Standards Highlights</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Quick metrics bar displayed on top of the FAQ hub (Pass rate, free registration, ratios).
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{data.stats.isVisible ? "Visible" : "Hidden"}</span>
                  <Switch
                    checked={data.stats.isVisible}
                    onCheckedChange={(checked: boolean) => {
                      setData({ ...data, stats: { ...data.stats, isVisible: checked } });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addStat}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-amber text-zinc-950"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Stat Card</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(data.stats.items || []).map((stat, sIdx) => (
                  <div
                    key={stat.id || sIdx}
                    className="p-4 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <span className="text-xs font-bold text-foreground">Card #{sIdx + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteStat(sIdx)}
                          className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold">Metric Value</label>
                          <Input
                            value={stat.value}
                            onChange={(e) => updateStat(sIdx, "value", e.target.value)}
                            className="rounded-xl text-xs font-black"
                            placeholder="100%"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold">Metric Label</label>
                          <Input
                            value={stat.label}
                            onChange={(e) => updateStat(sIdx, "label", e.target.value)}
                            className="rounded-xl text-xs font-bold"
                            placeholder="Board Pass Rate"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold">Description</label>
                          <Input
                            value={stat.description}
                            onChange={(e) => updateStat(sIdx, "description", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="Consistent A-One grades"
                          />
                        </div>
                        <IconPicker
                          label="Card Icon"
                          value={stat.icon || "Award"}
                          onChange={(icon) => updateStat(sIdx, "icon", icon)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 6: HELPDESK & PERSONALIZED ASSISTANCE CTA       */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="helpdesk" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-seneca-crimson" />
                  <span>Admissions Helpdesk & Counseling Cards</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure helpline phone number, email inboxes, campus desk directions, and WhatsApp chat.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{data.helpdesk.isVisible ? "Visible" : "Hidden"}</span>
                <Switch
                  checked={data.helpdesk.isVisible}
                  onCheckedChange={(checked: boolean) => {
                    setData({ ...data, helpdesk: { ...data.helpdesk, isVisible: checked } });
                    setIsDraftModified(true);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.helpdesk.badge}
                    onChange={(e) => {
                      setData({ ...data, helpdesk: { ...data.helpdesk, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Personalized Assistance"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.helpdesk.heading}
                    onChange={(e) => {
                      setData({ ...data, helpdesk: { ...data.helpdesk, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Still Have Questions?"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Description</label>
                  <Textarea
                    value={data.helpdesk.description}
                    onChange={(e) => {
                      setData({ ...data, helpdesk: { ...data.helpdesk, description: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    rows={2}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Helpline Phone Number</label>
                  <Input
                    value={data.helpdesk.phone}
                    onChange={(e) => {
                      setData({ ...data, helpdesk: { ...data.helpdesk, phone: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="+92 335 7413777"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Phone Helpline Hours</label>
                  <Input
                    value={data.helpdesk.phoneHours}
                    onChange={(e) => {
                      setData({ ...data, helpdesk: { ...data.helpdesk, phoneHours: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Mon – Sat, 8:00 AM – 3:00 PM"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">WhatsApp Chat Number</label>
                  <Input
                    value={data.helpdesk.whatsappNumber}
                    onChange={(e) => {
                      setData({ ...data, helpdesk: { ...data.helpdesk, whatsappNumber: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="+92 335 7413777"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Email Address</label>
                  <Input
                    value={data.helpdesk.email}
                    onChange={(e) => {
                      setData({ ...data, helpdesk: { ...data.helpdesk, email: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="info@seneca.edu.pk"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Email Response Guarantee</label>
                  <Input
                    value={data.helpdesk.emailResponseTime}
                    onChange={(e) => {
                      setData({ ...data, helpdesk: { ...data.helpdesk, emailResponseTime: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Response within 24 business hours"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 7: SEO & METADATA                               */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-seneca-amber" />
                <span>Search Engine Optimization & Social Sharing</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Optimize title tags, meta descriptions, search ranking keywords, and OpenGraph social share previews.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-5">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-foreground">Page Meta Title</label>
                  <span className="text-[11px] text-muted-foreground">
                    {(data.seo.metaTitle || "").length}/60 characters
                  </span>
                </div>
                <Input
                  value={data.seo.metaTitle}
                  onChange={(e) => {
                    setData({ ...data, seo: { ...data.seo, metaTitle: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-foreground">Meta Description</label>
                  <span className="text-[11px] text-muted-foreground">
                    {(data.seo.metaDescription || "").length}/160 characters
                  </span>
                </div>
                <Textarea
                  value={data.seo.metaDescription}
                  onChange={(e) => {
                    setData({ ...data, seo: { ...data.seo, metaDescription: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={3}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Target Keywords (comma-separated)</label>
                <Input
                  value={(data.seo.keywords || []).join(", ")}
                  onChange={(e) => {
                    const kw = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    setData({ ...data, seo: { ...data.seo, keywords: kw } });
                    setIsDraftModified(true);
                  }}
                  placeholder="Seneca Academy FAQs, Karachi school questions, matric admissions Karachi"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <ImageUpload
                  value={data.seo.ogImage}
                  onChange={(url) => {
                    setData({ ...data, seo: { ...data.seo, ogImage: url } });
                    setIsDraftModified(true);
                  }}
                  label="Social Sharing Image (OG Image 1200x630)"
                  aspectRatio="video"
                />
              </div>

              {/* Google Search Snippet Preview */}
              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2 mt-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Google Search Snippet Preview
                </span>
                <div className="space-y-1">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                    https://seneca.edu.pk/faqs
                  </p>
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {data.seo.metaTitle || "Frequently Asked Questions (FAQs) — Seneca Academy Karachi"}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {data.seo.metaDescription || "Find instant answers to common questions regarding admissions, fees, BSEK matriculation curriculum, and Seneca LMS portal."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 8: LIVE INTERACTIVE PREVIEW                    */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="preview" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-seneca-amber" />
                  <span>Real-Time Interactive Preview</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Rendered live with current draft inputs across viewport sizes.
                </CardDescription>
              </div>

              <div className="flex items-center gap-1.5 bg-background border border-border/70 p-1 rounded-2xl">
                <Button
                  type="button"
                  variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewDevice("desktop")}
                  className="rounded-xl text-xs gap-1 h-7 px-2.5"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </Button>
                <Button
                  type="button"
                  variant={previewDevice === "tablet" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewDevice("tablet")}
                  className="rounded-xl text-xs gap-1 h-7 px-2.5"
                >
                  <Tablet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Tablet</span>
                </Button>
                <Button
                  type="button"
                  variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewDevice("mobile")}
                  className="rounded-xl text-xs gap-1 h-7 px-2.5"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-2 sm:p-6 bg-muted/20 flex justify-center">
              <div
                className={`transition-all duration-300 bg-background border border-border rounded-3xl shadow-xl overflow-hidden ${
                  previewDevice === "desktop"
                    ? "w-full"
                    : previewDevice === "tablet"
                    ? "w-[768px] max-w-full"
                    : "w-[380px] max-w-full"
                }`}
              >
                {/* Simulated browser bar */}
                <div className="bg-muted/60 border-b border-border px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="ml-2 font-mono text-[11px] truncate">
                    https://seneca.edu.pk/faqs (Preview Mode)
                  </span>
                </div>

                {/* Render Interactive Public FAQs */}
                <div className="pointer-events-auto">
                  <FaqsInteractiveContainer initialData={data} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
