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
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  MessageCircle,
  Building2,
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
  HelpCircle,
  GraduationCap,
  CreditCard,
  Users,
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
  DEFAULT_CONTACT_PAGE_DATA,
  IContactPageData,
  IDepartmentContact,
  IContactFaqItem,
} from "@/lib/db/contact-page-defaults";

// Live Preview Component Imports
import ContactHeroSection from "@/components/public/contact/ContactHeroSection";
import ContactSection from "@/components/public/ContactSection";
import DepartmentContactsSection from "@/components/public/contact/DepartmentContactsSection";
import ContactFaqSection from "@/components/public/contact/ContactFaqSection";
import ContactCtaSection from "@/components/public/contact/ContactCtaSection";

const SECTION_META: Record<string, { title: string; desc: string; icon: any; tab: string }> = {
  hero: { title: "Hero Banner", desc: "Top headline, campus badge, spec chips, and action buttons", icon: LayoutTemplate, tab: "hero" },
  coordinates: { title: "Campus Coordinates & Map", desc: "Physical address, phone hotlines, WhatsApp, and Google Map embed", icon: MapPin, tab: "coordinates" },
  inquiryForm: { title: "Inquiry Form Settings", desc: "Direct inquiry form, subjects list, submit button, and response guarantee", icon: MessageSquare, tab: "inquiryForm" },
  departments: { title: "Department Directory", desc: "Direct routing cards for Admissions, Accounts, Counseling, and Secretariat", icon: Building2, tab: "departments" },
  officeHours: { title: "Office Hours & Schedule", desc: "Weekday, Saturday assessment, and Sunday operational hours", icon: Clock, tab: "officeHours" },
  faq: { title: "Visit & Inquiry FAQs", desc: "Frequently asked questions for parents and visitors", icon: HelpCircle, tab: "faq" },
  cta: { title: "Bottom Experience CTA", desc: "Concluding admission and WhatsApp chat invitation banner", icon: HeartHandshake, tab: "cta" },
};

export default function WebsiteContactUsPageManager() {
  const [data, setData] = useState<IContactPageData>(DEFAULT_CONTACT_PAGE_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraftModified, setIsDraftModified] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [newSubjectInput, setNewSubjectInput] = useState("");

  // Load existing data from API
  const loadContactData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/website/contact?preview=true");
      const json = await res.json();
      if (json?.data?.page) {
        setData({
          ...DEFAULT_CONTACT_PAGE_DATA,
          ...json.data.page,
          sectionsOrder: json.data.page.sectionsOrder || DEFAULT_CONTACT_PAGE_DATA.sectionsOrder,
          hero: { ...DEFAULT_CONTACT_PAGE_DATA.hero, ...(json.data.page.hero || {}) },
          coordinates: { ...DEFAULT_CONTACT_PAGE_DATA.coordinates, ...(json.data.page.coordinates || {}) },
          inquiryForm: {
            ...DEFAULT_CONTACT_PAGE_DATA.inquiryForm,
            ...(json.data.page.inquiryForm || {}),
            subjectsList:
              json.data.page.inquiryForm?.subjectsList && json.data.page.inquiryForm.subjectsList.length > 0
                ? json.data.page.inquiryForm.subjectsList
                : DEFAULT_CONTACT_PAGE_DATA.inquiryForm.subjectsList,
          },
          departments: {
            ...DEFAULT_CONTACT_PAGE_DATA.departments,
            ...(json.data.page.departments || {}),
            departments:
              json.data.page.departments?.departments && json.data.page.departments.departments.length > 0
                ? json.data.page.departments.departments
                : DEFAULT_CONTACT_PAGE_DATA.departments.departments,
          },
          officeHours: {
            ...DEFAULT_CONTACT_PAGE_DATA.officeHours,
            ...(json.data.page.officeHours || {}),
          },
          faq: {
            ...DEFAULT_CONTACT_PAGE_DATA.faq,
            ...(json.data.page.faq || {}),
            items:
              json.data.page.faq?.items && json.data.page.faq.items.length > 0
                ? json.data.page.faq.items
                : DEFAULT_CONTACT_PAGE_DATA.faq.items,
          },
          cta: {
            ...DEFAULT_CONTACT_PAGE_DATA.cta,
            ...(json.data.page.cta || {}),
          },
          seo: {
            ...DEFAULT_CONTACT_PAGE_DATA.seo,
            ...(json.data.page.seo || {}),
          },
        });
        setIsDraftModified(!!json.data.page.draft || !!json.data.isDraft);
      }
    } catch (err) {
      console.error("Failed to load contact page data:", err);
      toast.error("Failed to load CMS data. Using local defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContactData();
  }, []);

  // Save Draft Handler
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/website/contact", {
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
      const res = await fetch("/api/website/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, saveAsDraft: false }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to publish.");

      setIsDraftModified(false);
      toast.success("Contact Us page published successfully! Changes are now live on the public site.");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish changes.");
    } finally {
      setPublishing(false);
    }
  };

  // Reset to Defaults Handler
  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to reset all Contact page fields to default values?")) {
      setData(DEFAULT_CONTACT_PAGE_DATA);
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
  // INQUIRY FORM SUBJECTS HELPERS
  // ----------------------------------------------------
  const addSubjectOption = () => {
    if (!newSubjectInput.trim()) return;
    setData({
      ...data,
      inquiryForm: {
        ...data.inquiryForm,
        subjectsList: [...(data.inquiryForm.subjectsList || []), newSubjectInput.trim()],
      },
    });
    setNewSubjectInput("");
    setIsDraftModified(true);
    toast.success("New inquiry subject option added.");
  };

  const removeSubjectOption = (index: number) => {
    const list = [...data.inquiryForm.subjectsList];
    list.splice(index, 1);
    setData({
      ...data,
      inquiryForm: { ...data.inquiryForm, subjectsList: list },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // DEPARTMENTS DIRECTORY HELPERS
  // ----------------------------------------------------
  const addDepartment = () => {
    const nextIdx = (data.departments.departments || []).length + 1;
    const newDept: IDepartmentContact = {
      id: `dept-${Date.now()}`,
      name: "New Department Wing",
      leadTitle: "Department Coordinator",
      email: "contact@seneca.edu.pk",
      phone: "+92 335 7413777",
      extension: `Ext. 10${nextIdx}`,
      officeHours: "9:00 AM – 2:00 PM (Mon-Fri)",
      icon: "Building2",
      displayOrder: nextIdx,
      isVisible: true,
    };
    setData({
      ...data,
      departments: {
        ...data.departments,
        departments: [...(data.departments.departments || []), newDept],
      },
    });
    setIsDraftModified(true);
    toast.success("Department contact added.");
  };

  const duplicateDepartment = (index: number) => {
    const dept = data.departments.departments[index];
    const duplicated: IDepartmentContact = {
      ...dept,
      id: `dept-${Date.now()}`,
      name: `${dept.name} (Copy)`,
      displayOrder: (data.departments.departments || []).length + 1,
    };
    const updated = [...data.departments.departments];
    updated.splice(index + 1, 0, duplicated);
    setData({
      ...data,
      departments: { ...data.departments, departments: updated },
    });
    setIsDraftModified(true);
    toast.success("Department duplicated.");
  };

  const moveDepartment = (index: number, direction: "up" | "down") => {
    const list = [...data.departments.departments];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setData({
      ...data,
      departments: { ...data.departments, departments: list },
    });
    setIsDraftModified(true);
  };

  const deleteDepartment = (index: number) => {
    if (confirm("Are you sure you want to remove this department contact?")) {
      const list = [...data.departments.departments];
      list.splice(index, 1);
      setData({
        ...data,
        departments: { ...data.departments, departments: list },
      });
      setIsDraftModified(true);
      toast.success("Department removed.");
    }
  };

  const updateDepartment = (index: number, field: keyof IDepartmentContact, value: any) => {
    const list = [...data.departments.departments];
    list[index] = { ...list[index], [field]: value };
    setData({
      ...data,
      departments: { ...data.departments, departments: list },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // FAQS HELPERS
  // ----------------------------------------------------
  const addFaq = () => {
    const nextIdx = (data.faq.items || []).length + 1;
    const newFaq: IContactFaqItem = {
      id: `faq-${Date.now()}`,
      question: "New Campus Visit Question?",
      answer: "Provide a clear and helpful explanation for parents and visitors.",
      displayOrder: nextIdx,
      isVisible: true,
    };
    setData({
      ...data,
      faq: {
        ...data.faq,
        items: [...(data.faq.items || []), newFaq],
      },
    });
    setIsDraftModified(true);
    toast.success("FAQ added.");
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    const list = [...data.faq.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setData({
      ...data,
      faq: { ...data.faq, items: list },
    });
    setIsDraftModified(true);
  };

  const deleteFaq = (index: number) => {
    if (confirm("Are you sure you want to remove this FAQ?")) {
      const list = [...data.faq.items];
      list.splice(index, 1);
      setData({
        ...data,
        faq: { ...data.faq, items: list },
      });
      setIsDraftModified(true);
      toast.success("FAQ removed.");
    }
  };

  const updateFaq = (index: number, field: keyof IContactFaqItem, value: any) => {
    const list = [...data.faq.items];
    list[index] = { ...list[index], [field]: value };
    setData({
      ...data,
      faq: { ...data.faq, items: list },
    });
    setIsDraftModified(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="h-9 w-9 animate-spin text-seneca-crimson" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Loading Contact Us CMS data...
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
            <Badge variant="outline" className="text-[11px] font-bold border-rose-500/30 text-rose-500 bg-rose-500/5">
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
            Contact Us & Campus Visit CMS
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage institutional phone helplines, WhatsApp desk, department email routing, physical address, and inquiry forms.
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
            <Link href="/contact" target="_blank">
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
          <TabsTrigger value="coordinates" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <MapPin className="h-3.5 w-3.5" />
            <span>Coordinates & Map</span>
          </TabsTrigger>
          <TabsTrigger value="inquiryForm" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Inquiry Form</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Building2 className="h-3.5 w-3.5" />
            <span>Department Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="officeHours" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Clock className="h-3.5 w-3.5" />
            <span>Office Hours</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Visit FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="cta" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Bottom CTA</span>
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
                <Layers className="h-4 w-4 text-seneca-crimson" />
                <span>Contact Page Sequence & Layout Map</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Reorder components or click &ldquo;Edit Section&rdquo; to jump directly to that component&apos;s data.
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-card border border-border/70 hover:border-seneca-crimson/40 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center font-bold text-sm shrink-0">
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
                        className="rounded-xl text-xs gap-1 text-seneca-crimson hover:bg-seneca-crimson/10"
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
                  <LayoutTemplate className="h-4 w-4 text-seneca-crimson" />
                  <span>Contact Hero Showcase</span>
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
                    placeholder="Karachi Main Campus"
                  />
                </div>
                <IconPicker
                  label="Badge Icon"
                  value={data.hero.badgeIcon || "MapPin"}
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
                    placeholder="Get in Touch & Book a"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Highlighted Title (Crimson Gradient)</label>
                  <Input
                    value={data.hero.highlightedTitle || ""}
                    onChange={(e) => {
                      setData({ ...data, hero: { ...data.hero, highlightedTitle: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Campus Guided Tour."
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
                    <Sparkles className="h-3.5 w-3.5 text-seneca-crimson" />
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
                      placeholder="24-Hour Response"
                      className="rounded-xl text-xs"
                    />
                    <IconPicker
                      label="Chip Icon"
                      value={data.hero.leftSpecChip.icon || "Clock"}
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
                    placeholder="Direct Admissions Helpline & Support"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-seneca-amber" />
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
                      placeholder="Guided Tours"
                      className="rounded-xl text-xs"
                    />
                    <IconPicker
                      label="Chip Icon"
                      value={data.hero.rightSpecChip.icon || "Building2"}
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
                    placeholder="Saturday Assessment & Campus Walks"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Call-to-Action Buttons */}
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
                      placeholder="Button Text (Send Message Below)"
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
                      placeholder="Target Link (#contact)"
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
                      placeholder="Button Text (Apply for Admission)"
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
                      placeholder="Target Link (/admissions)"
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: CAMPUS COORDINATES & HELPLINES               */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="coordinates" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-seneca-crimson" />
                  <span>Physical Address, Phone Helplines & Google Map</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure official contact numbers, WhatsApp desk, physical address, and map iframe coordinates.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{data.coordinates.isVisible ? "Visible" : "Hidden"}</span>
                <Switch
                  checked={data.coordinates.isVisible}
                  onCheckedChange={(checked: boolean) => {
                    setData({ ...data, coordinates: { ...data.coordinates, isVisible: checked } });
                    setIsDraftModified(true);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.coordinates.badge}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Connect With Us"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.coordinates.heading}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Campus Location & Inquiries"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Description</label>
                  <Textarea
                    value={data.coordinates.description}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, description: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    rows={2}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Address & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Campus Full Address</label>
                  <Input
                    value={data.coordinates.address}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, address: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Soldier Bazar, Garden East, Karachi, Sindh, Pakistan."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">City & Area Tag</label>
                  <Input
                    value={data.coordinates.cityArea}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, cityArea: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Soldier Bazar # 1, Garden East"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Main Helpline Phone</label>
                  <Input
                    value={data.coordinates.mainPhone}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, mainPhone: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="+92 335 7413777"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Admissions Hotline</label>
                  <Input
                    value={data.coordinates.admissionsHotline}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, admissionsHotline: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="+92 21 32250000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">WhatsApp Chat Number</label>
                  <Input
                    value={data.coordinates.whatsappNumber}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, whatsappNumber: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="+92 335 7413777"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">WhatsApp Default Message Template</label>
                  <Input
                    value={data.coordinates.whatsappMessage || ""}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, whatsappMessage: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Hello Seneca Academy! I would like to inquire about admissions and campus visits."
                  />
                </div>
              </div>

              {/* Email Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">General Info Email</label>
                  <Input
                    value={data.coordinates.infoEmail}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, infoEmail: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="info@seneca.edu.pk"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Admissions Email</label>
                  <Input
                    value={data.coordinates.admissionsEmail}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, admissionsEmail: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="admissions@seneca.edu.pk"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Careers Email</label>
                  <Input
                    value={data.coordinates.careersEmail || ""}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, careersEmail: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="careers@seneca.edu.pk"
                  />
                </div>
              </div>

              {/* Google Maps Embed & Directions */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Google Map Embed URL (iframe src)</label>
                  <Input
                    value={data.coordinates.googleMapEmbedUrl}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, googleMapEmbedUrl: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-mono text-[11px]"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Google Map Directions Link</label>
                  <Input
                    value={data.coordinates.googleMapDirectionsUrl || ""}
                    onChange={(e) => {
                      setData({ ...data, coordinates: { ...data.coordinates, googleMapDirectionsUrl: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: INQUIRY FORM SETTINGS                        */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="inquiryForm" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-seneca-crimson" />
                  <span>Public Inquiry & Tour Booking Form Settings</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize the direct inquiry form title, subject options list, submit button text, and response guarantee note.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{data.inquiryForm.isVisible ? "Visible" : "Hidden"}</span>
                <Switch
                  checked={data.inquiryForm.isVisible}
                  onCheckedChange={(checked: boolean) => {
                    setData({ ...data, inquiryForm: { ...data.inquiryForm, isVisible: checked } });
                    setIsDraftModified(true);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Form Heading</label>
                  <Input
                    value={data.inquiryForm.heading}
                    onChange={(e) => {
                      setData({ ...data, inquiryForm: { ...data.inquiryForm, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Send Direct Inquiry or Book a Campus Tour"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Submit Button Text</label>
                  <Input
                    value={data.inquiryForm.submitButtonText}
                    onChange={(e) => {
                      setData({ ...data, inquiryForm: { ...data.inquiryForm, submitButtonText: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Transmit Inquiry"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Form Description</label>
                  <Textarea
                    value={data.inquiryForm.description}
                    onChange={(e) => {
                      setData({ ...data, inquiryForm: { ...data.inquiryForm, description: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    rows={2}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Response Guarantee Footnote</label>
                  <Input
                    value={data.inquiryForm.responseTimeText}
                    onChange={(e) => {
                      setData({ ...data, inquiryForm: { ...data.inquiryForm, responseTimeText: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Our administration will respond within 24 hours."
                  />
                </div>
              </div>

              {/* Subject Options Manager */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-seneca-crimson" />
                    <span>Inquiry Purpose / Subject Dropdown Options ({data.inquiryForm.subjectsList?.length || 0})</span>
                  </h4>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newSubjectInput}
                    onChange={(e) => setNewSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSubjectOption();
                      }
                    }}
                    placeholder="Add a new inquiry subject option (e.g. Saturday Assessment Registration)..."
                    className="rounded-xl text-xs"
                  />
                  <Button
                    type="button"
                    onClick={addSubjectOption}
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Subject</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(data.inquiryForm.subjectsList || []).map((subj, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-card border border-border/60 gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <Input
                          value={subj}
                          onChange={(e) => {
                            const list = [...data.inquiryForm.subjectsList];
                            list[sIdx] = e.target.value;
                            setData({ ...data, inquiryForm: { ...data.inquiryForm, subjectsList: list } });
                            setIsDraftModified(true);
                          }}
                          className="rounded-lg text-xs h-8 border-transparent focus:border-input bg-transparent"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={data.inquiryForm.subjectsList.length <= 1}
                        onClick={() => removeSubjectOption(sIdx)}
                        className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Feedback Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Submission Success Heading</label>
                  <Input
                    value={data.inquiryForm.successHeading}
                    onChange={(e) => {
                      setData({ ...data, inquiryForm: { ...data.inquiryForm, successHeading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Inquiry Dispatched Successfully!"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Submission Success Message</label>
                  <Input
                    value={data.inquiryForm.successMessage}
                    onChange={(e) => {
                      setData({ ...data, inquiryForm: { ...data.inquiryForm, successMessage: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Thank you for contacting Seneca Academy..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 5: DEPARTMENT CONTACTS DIRECTORY                */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="departments" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-seneca-crimson" />
                  <span>Department Routing & Direct Extension Contacts</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage specialized contact cards for Admissions, Accounts, Principal Secretariat, and Student Care.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{data.departments.isVisible ? "Visible" : "Hidden"}</span>
                  <Switch
                    checked={data.departments.isVisible}
                    onCheckedChange={(checked: boolean) => {
                      setData({ ...data, departments: { ...data.departments, isVisible: checked } });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addDepartment}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Department</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.departments.badge}
                    onChange={(e) => {
                      setData({ ...data, departments: { ...data.departments, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Department Directory"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.departments.heading}
                    onChange={(e) => {
                      setData({ ...data, departments: { ...data.departments, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Direct Department Contacts"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Description</label>
                  <Textarea
                    value={data.departments.description || ""}
                    onChange={(e) => {
                      setData({ ...data, departments: { ...data.departments, description: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    rows={2}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Department Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.departments.departments || []).map((dept, dIdx) => (
                  <div
                    key={dept.id || dIdx}
                    className="p-4 rounded-2xl bg-card border border-border/70 hover:border-seneca-crimson/40 transition-all space-y-3 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold flex items-center justify-center">
                            {dIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground">{dept.name || "Department Card"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={dIdx === 0}
                            onClick={() => moveDepartment(dIdx, "up")}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={dIdx === (data.departments.departments || []).length - 1}
                            onClick={() => moveDepartment(dIdx, "down")}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateDepartment(dIdx)}
                            className="h-7 w-7 rounded-lg"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDepartment(dIdx)}
                            className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold">Department Name</label>
                          <Input
                            value={dept.name}
                            onChange={(e) => updateDepartment(dIdx, "name", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="Admissions & Registrar"
                          />
                        </div>
                        <IconPicker
                          label="Icon"
                          value={dept.icon}
                          onChange={(icon) => updateDepartment(dIdx, "icon", icon)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold">Lead Title / Officer</label>
                          <Input
                            value={dept.leadTitle}
                            onChange={(e) => updateDepartment(dIdx, "leadTitle", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="Director of Admissions"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold">Email Inbox</label>
                          <Input
                            value={dept.email}
                            onChange={(e) => updateDepartment(dIdx, "email", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="admissions@seneca.edu.pk"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold">Phone Number</label>
                          <Input
                            value={dept.phone}
                            onChange={(e) => updateDepartment(dIdx, "phone", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="+92 335 7413777"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold">Extension / Hours</label>
                          <Input
                            value={dept.extension || ""}
                            onChange={(e) => updateDepartment(dIdx, "extension", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="Ext. 101"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 6: OFFICE HOURS & ACCESS SCHEDULE               */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="officeHours" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-seneca-amber" />
                  <span>Admissions Office Operating Schedule</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Define weekday, Saturday assessment, and weekend visiting hours.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{data.officeHours.isVisible ? "Visible" : "Hidden"}</span>
                <Switch
                  checked={data.officeHours.isVisible}
                  onCheckedChange={(checked: boolean) => {
                    setData({ ...data, officeHours: { ...data.officeHours, isVisible: checked } });
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
                    value={data.officeHours.badge}
                    onChange={(e) => {
                      setData({ ...data, officeHours: { ...data.officeHours, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Hours & Access"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.officeHours.heading}
                    onChange={(e) => {
                      setData({ ...data, officeHours: { ...data.officeHours, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Admissions Office Operating Schedule"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Monday – Friday Hours</label>
                  <Input
                    value={data.officeHours.weekdayHours}
                    onChange={(e) => {
                      setData({ ...data, officeHours: { ...data.officeHours, weekdayHours: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Monday to Friday: 8:00 AM – 3:00 PM"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Saturday Assessment Hours</label>
                  <Input
                    value={data.officeHours.saturdayHours}
                    onChange={(e) => {
                      setData({ ...data, officeHours: { ...data.officeHours, saturdayHours: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Saturday: 9:00 AM – 1:00 PM (Assessment Day)"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Sunday & Holidays Status</label>
                  <Input
                    value={data.officeHours.sundayHours}
                    onChange={(e) => {
                      setData({ ...data, officeHours: { ...data.officeHours, sundayHours: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Sunday: Closed (Online inquiry forms monitored)"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <label className="text-xs font-bold text-foreground">Visitor Security Clearance Notice</label>
                <Textarea
                  value={data.officeHours.visitorNotice || ""}
                  onChange={(e) => {
                    setData({ ...data, officeHours: { ...data.officeHours, visitorNotice: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  className="rounded-xl text-xs"
                  placeholder="Please bring a valid CNIC / Identity card at the main security gate for visitor badge clearance."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 7: VISIT & INQUIRY FAQS                         */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="faq" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-seneca-crimson" />
                  <span>Campus Visit & Inquiry FAQs</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage frequently asked questions regarding campus tours, visitor parking, and required assessment documents.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{data.faq.isVisible ? "Visible" : "Hidden"}</span>
                  <Switch
                    checked={data.faq.isVisible}
                    onCheckedChange={(checked: boolean) => {
                      setData({ ...data, faq: { ...data.faq, isVisible: checked } });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addFaq}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add FAQ</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.faq.badge}
                    onChange={(e) => {
                      setData({ ...data, faq: { ...data.faq, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Visit & Inquiry FAQs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.faq.heading}
                    onChange={(e) => {
                      setData({ ...data, faq: { ...data.faq, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Frequently Asked Questions About Visiting"
                  />
                </div>
              </div>

              {/* FAQs List */}
              <div className="space-y-4">
                {(data.faq.items || []).map((faqItem, fIdx) => (
                  <div
                    key={faqItem.id || fIdx}
                    className="p-4 rounded-2xl bg-card border border-border/70 hover:border-seneca-crimson/30 transition-all space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold flex items-center justify-center">
                          {fIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground truncate max-w-sm sm:max-w-md">
                          {faqItem.question || "FAQ Item"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={fIdx === 0}
                          onClick={() => moveFaq(fIdx, "up")}
                          className="h-7 w-7 rounded-lg"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={fIdx === (data.faq.items || []).length - 1}
                          onClick={() => moveFaq(fIdx, "down")}
                          className="h-7 w-7 rounded-lg"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFaq(fIdx)}
                          className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Input
                        value={faqItem.question}
                        onChange={(e) => updateFaq(fIdx, "question", e.target.value)}
                        className="rounded-xl text-xs font-semibold"
                        placeholder="e.g. Do I need an appointment before visiting?"
                      />
                      <Textarea
                        value={faqItem.answer}
                        onChange={(e) => updateFaq(fIdx, "answer", e.target.value)}
                        rows={2}
                        className="rounded-xl text-xs leading-relaxed"
                        placeholder="Detailed answer for visitors..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 8: BOTTOM CTA BANNER                            */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="cta" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-seneca-crimson" />
                  <span>Bottom Call-to-Action Banner</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure concluding campus visit and WhatsApp chat action buttons.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{data.cta.isVisible ? "Visible" : "Hidden"}</span>
                <Switch
                  checked={data.cta.isVisible}
                  onCheckedChange={(checked: boolean) => {
                    setData({ ...data, cta: { ...data.cta, isVisible: checked } });
                    setIsDraftModified(true);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">CTA Headline</label>
                <Input
                  value={data.cta.heading}
                  onChange={(e) => {
                    setData({ ...data, cta: { ...data.cta, heading: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs"
                  placeholder="Experience the Seneca Difference in Person"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">CTA Description</label>
                <Textarea
                  value={data.cta.description}
                  onChange={(e) => {
                    setData({ ...data, cta: { ...data.cta, description: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Primary Button (Admission)</span>
                    <Switch
                      checked={data.cta.primaryCta.isVisible}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          cta: {
                            ...data.cta,
                            primaryCta: { ...data.cta.primaryCta, isVisible: checked },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={data.cta.primaryCta.text}
                      onChange={(e) => {
                        setData({
                          ...data,
                          cta: {
                            ...data.cta,
                            primaryCta: { ...data.cta.primaryCta, text: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Apply for Admission"
                      className="rounded-xl text-xs"
                    />
                    <Input
                      value={data.cta.primaryCta.href}
                      onChange={(e) => {
                        setData({
                          ...data,
                          cta: {
                            ...data.cta,
                            primaryCta: { ...data.cta.primaryCta, href: e.target.value },
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
                    <span className="text-xs font-bold">Secondary Button (WhatsApp)</span>
                    <Switch
                      checked={data.cta.secondaryCta.isVisible}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          cta: {
                            ...data.cta,
                            secondaryCta: { ...data.cta.secondaryCta, isVisible: checked },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={data.cta.secondaryCta.text}
                      onChange={(e) => {
                        setData({
                          ...data,
                          cta: {
                            ...data.cta,
                            secondaryCta: { ...data.cta.secondaryCta, text: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Chat on WhatsApp"
                      className="rounded-xl text-xs"
                    />
                    <Input
                      value={data.cta.secondaryCta.href}
                      onChange={(e) => {
                        setData({
                          ...data,
                          cta: {
                            ...data.cta,
                            secondaryCta: { ...data.cta.secondaryCta, href: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="https://wa.me/923357413777"
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 9: SEO & METADATA                               */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-seneca-crimson" />
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
                  placeholder="Contact Seneca Academy, Karachi school contact, Soldier Bazar school phone"
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
                    https://seneca.edu.pk/contact
                  </p>
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {data.seo.metaTitle || "Contact & Campus Guided Tour — Seneca Academy Karachi"}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {data.seo.metaDescription || "Get in touch with Seneca Academy Karachi in Soldier Bazar. Book a guided campus visit, call our admissions helpline at +92 335 7413777, or send an inquiry online."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 10: LIVE INTERACTIVE PREVIEW                    */}
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
                    https://seneca.edu.pk/contact (Preview Mode)
                  </span>
                </div>

                {/* Render All Dynamic Components */}
                <div className="pointer-events-auto">
                  {data.sectionsOrder.map((sectionKey) => {
                    switch (sectionKey) {
                      case "hero":
                        return <ContactHeroSection key="hero-prev" hero={data.hero} />;
                      case "coordinates":
                      case "inquiryForm":
                      case "officeHours":
                        return (
                          <ContactSection
                            key="contact-prev"
                            coordinates={data.coordinates}
                            inquiryForm={data.inquiryForm}
                            officeHours={data.officeHours}
                          />
                        );
                      case "departments":
                        return (
                          <DepartmentContactsSection
                            key="dept-prev"
                            departments={data.departments}
                          />
                        );
                      case "faq":
                        return <ContactFaqSection key="faq-prev" faq={data.faq} />;
                      case "cta":
                        return <ContactCtaSection key="cta-prev" cta={data.cta} />;
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
