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
  Users,
  Briefcase,
  GraduationCap,
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
  Search,
  BookOpen,
  Award,
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
  DEFAULT_FACULTY_PAGE_DATA,
  IFacultyPageData,
  IFacultyMember,
  ITeachingStandard,
  ICampusFacility,
} from "@/lib/db/faculty-page-defaults";

// Live Preview Component Imports
import FacultyHeroSection from "@/components/public/faculty/FacultyHeroSection";
import FacultySection from "@/components/public/FacultySection";
import FacultyStandardsSection from "@/components/public/faculty/FacultyStandardsSection";
import CampusFacilitiesSection from "@/components/public/faculty/CampusFacilitiesSection";
import FacultyExperienceCta from "@/components/public/faculty/FacultyExperienceCta";

const SECTION_META: Record<string, { title: string; desc: string; icon: any; tab: string }> = {
  hero: { title: "Hero Banner", desc: "Top showcase headline, faculty badges, and action buttons", icon: LayoutTemplate, tab: "hero" },
  faculty: { title: "Faculty Directory", desc: "World-class educators directory, credentials, and bios", icon: Users, tab: "faculty" },
  careers: { title: "Careers at Seneca", desc: "Teacher recruitment banner, benefits list & hiring status", icon: Briefcase, tab: "careers" },
  standards: { title: "Faculty Standards", desc: "Pedagogical standards & qualification commitments", icon: GraduationCap, tab: "standards" },
  facilities: { title: "Campus Facilities", desc: "Laboratories, sports arena, library & auditorium showcase", icon: Building2, tab: "facilities" },
  experienceCta: { title: "Mentorship CTA", desc: "Bottom student mentorship & campus tour booking banner", icon: HeartHandshake, tab: "experienceCta" },
};

const DEPARTMENT_OPTIONS = [
  "Mathematics",
  "Sciences",
  "Computer Science",
  "Languages & Humanities",
  "Junior & Primary Wing",
  "Arts & Sports",
  "Leadership & Administration",
];

const BADGE_COLORS = [
  { label: "Crimson", value: "crimson", bg: "bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/20" },
  { label: "Emerald", value: "emerald", bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { label: "Amber", value: "amber", bg: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { label: "Sky", value: "sky", bg: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  { label: "Indigo", value: "indigo", bg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
];

export default function WebsiteCampusFacultyPageManager() {
  const [data, setData] = useState<IFacultyPageData>(DEFAULT_FACULTY_PAGE_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraftModified, setIsDraftModified] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [facultySearch, setFacultySearch] = useState("");
  const [newBenefitInput, setNewBenefitInput] = useState("");

  // Load existing data from API
  const loadFacultyData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/website/faculty?preview=true");
      const json = await res.json();
      if (json?.data?.page) {
        setData({
          ...DEFAULT_FACULTY_PAGE_DATA,
          ...json.data.page,
          sectionsOrder: json.data.page.sectionsOrder || DEFAULT_FACULTY_PAGE_DATA.sectionsOrder,
          hero: { ...DEFAULT_FACULTY_PAGE_DATA.hero, ...(json.data.page.hero || {}) },
          facultySection: {
            ...DEFAULT_FACULTY_PAGE_DATA.facultySection,
            ...(json.data.page.facultySection || {}),
            members:
              json.data.page.facultySection?.members && json.data.page.facultySection.members.length > 0
                ? json.data.page.facultySection.members
                : DEFAULT_FACULTY_PAGE_DATA.facultySection.members,
          },
          careers: {
            ...DEFAULT_FACULTY_PAGE_DATA.careers,
            ...(json.data.page.careers || {}),
            benefits:
              json.data.page.careers?.benefits && json.data.page.careers.benefits.length > 0
                ? json.data.page.careers.benefits
                : DEFAULT_FACULTY_PAGE_DATA.careers.benefits,
          },
          standards: {
            ...DEFAULT_FACULTY_PAGE_DATA.standards,
            ...(json.data.page.standards || {}),
            items:
              json.data.page.standards?.items && json.data.page.standards.items.length > 0
                ? json.data.page.standards.items
                : DEFAULT_FACULTY_PAGE_DATA.standards.items,
          },
          facilities: {
            ...DEFAULT_FACULTY_PAGE_DATA.facilities,
            ...(json.data.page.facilities || {}),
            facilities:
              json.data.page.facilities?.facilities && json.data.page.facilities.facilities.length > 0
                ? json.data.page.facilities.facilities
                : DEFAULT_FACULTY_PAGE_DATA.facilities.facilities,
          },
          experienceCta: {
            ...DEFAULT_FACULTY_PAGE_DATA.experienceCta,
            ...(json.data.page.experienceCta || {}),
          },
          seo: {
            ...DEFAULT_FACULTY_PAGE_DATA.seo,
            ...(json.data.page.seo || {}),
          },
        });
        setIsDraftModified(!!json.data.page.draft || !!json.data.isDraft);
      }
    } catch (err) {
      console.error("Failed to load campus & faculty page data:", err);
      toast.error("Failed to load CMS data. Using local defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, []);

  // Save Draft Handler
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/website/faculty", {
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
      const res = await fetch("/api/website/faculty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, saveAsDraft: false }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to publish.");

      setIsDraftModified(false);
      toast.success("Campus & Faculty page published successfully! Changes are now live on the public site.");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish changes.");
    } finally {
      setPublishing(false);
    }
  };

  // Reset to Defaults Handler
  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to reset all Campus & Faculty page fields to default values?")) {
      setData(DEFAULT_FACULTY_PAGE_DATA);
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
  // FACULTY MEMBERS HELPERS
  // ----------------------------------------------------
  const addFacultyMember = () => {
    const nextIdx = (data.facultySection.members || []).length + 1;
    const newMember: IFacultyMember = {
      id: `fac-${Date.now()}`,
      name: "New Faculty Educator",
      role: "Subject Specialist Instructor",
      department: "Sciences",
      qual: "M.Sc. / Master Degree",
      exp: "5+ Years Experience",
      imgUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      bio: "Inspiring educator dedicated to concept mastery, pedagogical excellence, and student mentorship.",
      badge: "Subject Specialist",
      badgeColor: "crimson",
      displayOrder: nextIdx,
      isActive: true,
    };
    setData({
      ...data,
      facultySection: {
        ...data.facultySection,
        members: [...(data.facultySection.members || []), newMember],
      },
    });
    setIsDraftModified(true);
    toast.success("New faculty educator added.");
  };

  const duplicateFacultyMember = (index: number) => {
    const member = data.facultySection.members[index];
    const duplicated: IFacultyMember = {
      ...member,
      id: `fac-${Date.now()}`,
      name: `${member.name} (Copy)`,
      displayOrder: (data.facultySection.members || []).length + 1,
    };
    const updated = [...data.facultySection.members];
    updated.splice(index + 1, 0, duplicated);
    setData({
      ...data,
      facultySection: { ...data.facultySection, members: updated },
    });
    setIsDraftModified(true);
    toast.success("Faculty member duplicated.");
  };

  const moveFacultyMember = (index: number, direction: "up" | "down") => {
    const list = [...data.facultySection.members];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    list.forEach((item, idx) => {
      item.displayOrder = idx + 1;
    });

    setData({
      ...data,
      facultySection: { ...data.facultySection, members: list },
    });
    setIsDraftModified(true);
  };

  const deleteFacultyMember = (index: number) => {
    if (confirm("Are you sure you want to remove this faculty member?")) {
      const list = [...data.facultySection.members];
      list.splice(index, 1);
      setData({
        ...data,
        facultySection: { ...data.facultySection, members: list },
      });
      setIsDraftModified(true);
      toast.success("Faculty member removed.");
    }
  };

  const updateFacultyMember = (index: number, field: keyof IFacultyMember, value: any) => {
    const list = [...data.facultySection.members];
    list[index] = { ...list[index], [field]: value };
    setData({
      ...data,
      facultySection: { ...data.facultySection, members: list },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // CAREERS BENEFITS HELPERS
  // ----------------------------------------------------
  const addCareerBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setData({
      ...data,
      careers: {
        ...data.careers,
        benefits: [...(data.careers.benefits || []), newBenefitInput.trim()],
      },
    });
    setNewBenefitInput("");
    setIsDraftModified(true);
    toast.success("Perk/Benefit added.");
  };

  const removeCareerBenefit = (index: number) => {
    const list = [...data.careers.benefits];
    list.splice(index, 1);
    setData({
      ...data,
      careers: { ...data.careers, benefits: list },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // TEACHING STANDARDS HELPERS
  // ----------------------------------------------------
  const addStandard = () => {
    const nextIdx = (data.standards.items || []).length + 1;
    const newStd: ITeachingStandard = {
      id: `std-${Date.now()}`,
      icon: "GraduationCap",
      title: "New Teaching Standard",
      desc: "Specify the pedagogical requirement, certification standard, or coaching commitment.",
      displayOrder: nextIdx,
      isVisible: true,
    };
    setData({
      ...data,
      standards: {
        ...data.standards,
        items: [...(data.standards.items || []), newStd],
      },
    });
    setIsDraftModified(true);
    toast.success("Teaching standard added.");
  };

  const moveStandard = (index: number, direction: "up" | "down") => {
    const list = [...data.standards.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setData({
      ...data,
      standards: { ...data.standards, items: list },
    });
    setIsDraftModified(true);
  };

  const deleteStandard = (index: number) => {
    if (confirm("Are you sure you want to remove this standard card?")) {
      const list = [...data.standards.items];
      list.splice(index, 1);
      setData({
        ...data,
        standards: { ...data.standards, items: list },
      });
      setIsDraftModified(true);
      toast.success("Standard removed.");
    }
  };

  const updateStandard = (index: number, field: keyof ITeachingStandard, value: any) => {
    const list = [...data.standards.items];
    list[index] = { ...list[index], [field]: value };
    setData({
      ...data,
      standards: { ...data.standards, items: list },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // CAMPUS FACILITIES HELPERS
  // ----------------------------------------------------
  const addFacility = () => {
    const nextIdx = (data.facilities.facilities || []).length + 1;
    const newFacility: ICampusFacility = {
      id: `facil-${Date.now()}`,
      title: "New Campus Facility",
      desc: "Describe the infrastructure, equipment, capacity, and learning advantages.",
      category: "Laboratory",
      status: "Active",
      imgUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80",
      displayOrder: nextIdx,
      isVisible: true,
    };
    setData({
      ...data,
      facilities: {
        ...data.facilities,
        facilities: [...(data.facilities.facilities || []), newFacility],
      },
    });
    setIsDraftModified(true);
    toast.success("Campus facility added.");
  };

  const moveFacility = (index: number, direction: "up" | "down") => {
    const list = [...data.facilities.facilities];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setData({
      ...data,
      facilities: { ...data.facilities, facilities: list },
    });
    setIsDraftModified(true);
  };

  const deleteFacility = (index: number) => {
    if (confirm("Are you sure you want to remove this facility?")) {
      const list = [...data.facilities.facilities];
      list.splice(index, 1);
      setData({
        ...data,
        facilities: { ...data.facilities, facilities: list },
      });
      setIsDraftModified(true);
      toast.success("Facility removed.");
    }
  };

  const updateFacility = (index: number, field: keyof ICampusFacility, value: any) => {
    const list = [...data.facilities.facilities];
    list[index] = { ...list[index], [field]: value };
    setData({
      ...data,
      facilities: { ...data.facilities, facilities: list },
    });
    setIsDraftModified(true);
  };

  // Filtered faculty members
  const filteredFaculty = (data.facultySection.members || []).filter(
    (m) =>
      m.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
      m.role.toLowerCase().includes(facultySearch.toLowerCase()) ||
      m.department.toLowerCase().includes(facultySearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="h-9 w-9 animate-spin text-seneca-crimson" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Loading Campus & Faculty CMS data...
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
            <Badge variant="outline" className="text-[11px] font-bold border-seneca-crimson/30 text-seneca-crimson bg-seneca-crimson/5">
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
            Campus & Faculty CMS Manager
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage faculty directory, teacher careers banner, pedagogical standards, and campus infrastructure cards.
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
            <Link href="/faculty" target="_blank">
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
          <TabsTrigger value="faculty" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Users className="h-3.5 w-3.5" />
            <span>Faculty Directory</span>
          </TabsTrigger>
          <TabsTrigger value="careers" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Careers at Seneca</span>
          </TabsTrigger>
          <TabsTrigger value="standards" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Teaching Standards</span>
          </TabsTrigger>
          <TabsTrigger value="facilities" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Building2 className="h-3.5 w-3.5" />
            <span>Campus Facilities</span>
          </TabsTrigger>
          <TabsTrigger value="experienceCta" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Mentorship CTA</span>
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
                <span>Page Layout & Component Sequence</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Reorder page sections or click &ldquo;Jump to Edit&rdquo; to customize that component&apos;s data.
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
                  <span>Faculty & Campus Hero Showcase</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure top headline, eyebrow badge, floating spec chips, and call-to-action buttons.
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
                    placeholder="Master-Level Faculty & Pedagogical Mentors"
                  />
                </div>
                <IconPicker
                  label="Badge Icon"
                  value={data.hero.badgeIcon || "Users"}
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
                    placeholder="Mentorship by Distinguished"
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
                    placeholder="Educators & Leaders."
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
                    Left Floating Spec Chip
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
                      placeholder="100% Certified"
                      className="rounded-xl text-xs"
                    />
                    <IconPicker
                      label="Chip Icon"
                      value={data.hero.leftSpecChip.icon || "GraduationCap"}
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
                    placeholder="Master & Subject Specialist Faculty"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-seneca-amber" />
                    Right Floating Spec Chip
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
                      placeholder="1:12 Mentorship"
                      className="rounded-xl text-xs"
                    />
                    <IconPicker
                      label="Chip Icon"
                      value={data.hero.rightSpecChip.icon || "Award"}
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
                    placeholder="Personalized Student Mentorship Ratio"
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
                      placeholder="Button Text (Meet Our Educators)"
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
                      placeholder="Target Link (#faculty-team)"
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
                      placeholder="Button Text (Careers at Seneca)"
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
                      placeholder="Target Link (#careers)"
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: WORLD-CLASS EDUCATORS / FACULTY DIRECTORY    */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="faculty" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-seneca-crimson" />
                  <span>World-Class Faculty Educators Directory</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Add, edit, reorder, or feature teacher profiles with departments, credentials, and photos.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{data.facultySection.isVisible ? "Visible" : "Hidden"}</span>
                  <Switch
                    checked={data.facultySection.isVisible}
                    onCheckedChange={(checked: boolean) => {
                      setData({ ...data, facultySection: { ...data.facultySection, isVisible: checked } });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addFacultyMember}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Faculty Member</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Section Header Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.facultySection.badge}
                    onChange={(e) => {
                      setData({ ...data, facultySection: { ...data.facultySection, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="World-Class Educators"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.facultySection.heading}
                    onChange={(e) => {
                      setData({ ...data, facultySection: { ...data.facultySection, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Mentorship by Distinguished Educators"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Subtitle / Description</label>
                  <Textarea
                    value={data.facultySection.description}
                    onChange={(e) => {
                      setData({ ...data, facultySection: { ...data.facultySection, description: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    rows={2}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  placeholder="Search faculty by name, department, or designation..."
                  className="pl-10 rounded-2xl text-xs"
                />
              </div>

              {/* Faculty Cards List */}
              <div className="space-y-4">
                {filteredFaculty.map((member, idx) => {
                  const originalIndex = data.facultySection.members.findIndex((m) => m.id === member.id);

                  return (
                    <div
                      key={member.id || idx}
                      className="p-4 sm:p-5 rounded-3xl bg-card border border-border/70 hover:border-seneca-crimson/30 transition-all space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-lg bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold flex items-center justify-center">
                            #{originalIndex + 1}
                          </span>
                          <span className="text-sm font-bold text-foreground truncate">{member.name || "Untitled Educator"}</span>
                          <Badge variant="outline" className="text-[11px] font-medium">
                            {member.department}
                          </Badge>
                          {member.isActive === false && (
                            <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                              Draft / Inactive
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <div className="flex items-center gap-1.5 mr-2">
                            <span className="text-[11px] text-muted-foreground">Active</span>
                            <Switch
                              checked={member.isActive !== false}
                              onCheckedChange={(checked: boolean) =>
                                updateFacultyMember(originalIndex, "isActive", checked)
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={originalIndex === 0}
                            onClick={() => moveFacultyMember(originalIndex, "up")}
                            className="h-8 w-8 rounded-xl"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={originalIndex === data.facultySection.members.length - 1}
                            onClick={() => moveFacultyMember(originalIndex, "down")}
                            className="h-8 w-8 rounded-xl"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateFacultyMember(originalIndex)}
                            className="h-8 w-8 rounded-xl"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteFacultyMember(originalIndex)}
                            className="h-8 w-8 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Full Name</label>
                          <Input
                            value={member.name}
                            onChange={(e) => updateFacultyMember(originalIndex, "name", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="e.g. Sir Tariq Mehmood"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Designation / Role</label>
                          <Input
                            value={member.role}
                            onChange={(e) => updateFacultyMember(originalIndex, "role", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="e.g. Head of Mathematics"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Department Wing</label>
                          <div className="flex gap-2">
                            <Input
                              value={member.department}
                              onChange={(e) => updateFacultyMember(originalIndex, "department", e.target.value)}
                              className="rounded-xl text-xs"
                              placeholder="e.g. Sciences"
                              list={`dept-list-${originalIndex}`}
                            />
                            <datalist id={`dept-list-${originalIndex}`}>
                              {DEPARTMENT_OPTIONS.map((d) => (
                                <option key={d} value={d} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Academic Qualifications</label>
                          <Input
                            value={member.qual}
                            onChange={(e) => updateFacultyMember(originalIndex, "qual", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="e.g. M.Sc. Applied Mathematics (KU)"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Teaching Experience</label>
                          <Input
                            value={member.exp}
                            onChange={(e) => updateFacultyMember(originalIndex, "exp", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="e.g. 16+ Years Experience"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Card Badge Text</label>
                          <Input
                            value={member.badge || ""}
                            onChange={(e) => updateFacultyMember(originalIndex, "badge", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="e.g. Senior Board Coach"
                          />
                        </div>
                      </div>

                      {/* Photo Upload & Bio */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-1.5 md:col-span-1">
                          <ImageUpload
                            value={member.imgUrl}
                            onChange={(url) => updateFacultyMember(originalIndex, "imgUrl", url)}
                            label="Educator Photograph"
                            aspectRatio="portrait"
                          />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-foreground">Badge Accent Color</label>
                            <div className="flex flex-wrap gap-2">
                              {BADGE_COLORS.map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  onClick={() => updateFacultyMember(originalIndex, "badgeColor", color.value)}
                                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                                    (member.badgeColor || "crimson") === color.value
                                      ? `${color.bg} ring-2 ring-primary ring-offset-1`
                                      : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted"
                                  }`}
                                >
                                  {color.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-foreground">Short Bio / Philosophy</label>
                            <Textarea
                              value={member.bio || ""}
                              onChange={(e) => updateFacultyMember(originalIndex, "bio", e.target.value)}
                              rows={3}
                              className="rounded-xl text-xs"
                              placeholder="Brief teaching philosophy or specialization highlights..."
                            />
                          </div>
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
        {/* TAB 4: CAREERS AT SENECA                            */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="careers" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-seneca-crimson" />
                  <span>Careers & Teacher Recruitment Banner</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage educator hiring status, perks checklist, application CTA, and contact email.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{data.careers.isVisible ? "Visible" : "Hidden"}</span>
                  <Switch
                    checked={data.careers.isVisible}
                    onCheckedChange={(checked: boolean) => {
                      setData({ ...data, careers: { ...data.careers, isVisible: checked } });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span>Active Hiring Mode</span>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    When active, public visitors can click &ldquo;Apply as Teacher&rdquo; to open the teacher application dialog.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {data.careers.isHiringActive ? "Hiring ACTIVE" : "Hiring PAUSED"}
                  </span>
                  <Switch
                    checked={data.careers.isHiringActive}
                    onCheckedChange={(checked: boolean) => {
                      setData({ ...data, careers: { ...data.careers, isHiringActive: checked } });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Eyebrow Badge</label>
                  <Input
                    value={data.careers.badge}
                    onChange={(e) => {
                      setData({ ...data, careers: { ...data.careers, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Careers at Seneca"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Main Heading</label>
                  <Input
                    value={data.careers.heading}
                    onChange={(e) => {
                      setData({ ...data, careers: { ...data.careers, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Passionate About Teaching? Join Our Faculty."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Description / Intro</label>
                <Textarea
                  value={data.careers.description}
                  onChange={(e) => {
                    setData({ ...data, careers: { ...data.careers, description: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Apply Button Label</label>
                  <Input
                    value={data.careers.applyButtonText}
                    onChange={(e) => {
                      setData({ ...data, careers: { ...data.careers, applyButtonText: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Apply as Teacher"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">HR / Careers Email</label>
                  <Input
                    value={data.careers.contactEmail || ""}
                    onChange={(e) => {
                      setData({ ...data, careers: { ...data.careers, contactEmail: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="careers@seneca.edu.pk"
                  />
                </div>
              </div>

              {/* Benefits Checklist Manager */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-seneca-crimson" />
                    <span>Faculty Perks & Benefits Checklist ({data.careers.benefits?.length || 0})</span>
                  </h4>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCareerBenefit();
                      }
                    }}
                    placeholder="Add a new teacher benefit / perk..."
                    className="rounded-xl text-xs"
                  />
                  <Button
                    type="button"
                    onClick={addCareerBenefit}
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Perk</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {(data.careers.benefits || []).map((benefit, bIdx) => (
                    <div
                      key={bIdx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/60 gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <Input
                          value={benefit}
                          onChange={(e) => {
                            const list = [...data.careers.benefits];
                            list[bIdx] = e.target.value;
                            setData({ ...data, careers: { ...data.careers, benefits: list } });
                            setIsDraftModified(true);
                          }}
                          className="rounded-lg text-xs h-8 border-transparent focus:border-input bg-transparent"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCareerBenefit(bIdx)}
                        className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 5: TEACHING STANDARDS                           */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="standards" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-seneca-crimson" />
                  <span>Teaching Standards & Pedagogical Commitments</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Highlight rigorous qualifications, training hours, and individualized mentorship standards.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{data.standards.isVisible ? "Visible" : "Hidden"}</span>
                  <Switch
                    checked={data.standards.isVisible}
                    onCheckedChange={(checked: boolean) => {
                      setData({ ...data, standards: { ...data.standards, isVisible: checked } });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addStandard}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Standard</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.standards.badge}
                    onChange={(e) => {
                      setData({ ...data, standards: { ...data.standards, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Faculty Standards"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.standards.heading}
                    onChange={(e) => {
                      setData({ ...data, standards: { ...data.standards, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Our Uncompromising Standards for Educators"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Description</label>
                  <Textarea
                    value={data.standards.description || ""}
                    onChange={(e) => {
                      setData({ ...data, standards: { ...data.standards, description: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    rows={2}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Standards Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.standards.items || []).map((std, sIdx) => (
                  <div
                    key={std.id || sIdx}
                    className="p-4 rounded-2xl bg-card border border-border/70 hover:border-seneca-crimson/40 transition-all space-y-3 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold flex items-center justify-center">
                            {sIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground">{std.title || "Standard Card"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={sIdx === 0}
                            onClick={() => moveStandard(sIdx, "up")}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={sIdx === (data.standards.items || []).length - 1}
                            onClick={() => moveStandard(sIdx, "down")}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteStandard(sIdx)}
                            className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold">Standard Title</label>
                          <Input
                            value={std.title}
                            onChange={(e) => updateStandard(sIdx, "title", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="e.g. Master & Doctoral Qualifications"
                          />
                        </div>
                        <IconPicker
                          label="Icon"
                          value={std.icon}
                          onChange={(icon) => updateStandard(sIdx, "icon", icon)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold">Description</label>
                        <Textarea
                          value={std.desc}
                          onChange={(e) => updateStandard(sIdx, "desc", e.target.value)}
                          rows={2}
                          className="rounded-xl text-xs leading-relaxed"
                          placeholder="Explain this teaching standard..."
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
        {/* TAB 6: CAMPUS INFRASTRUCTURE & FACILITIES           */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="facilities" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span>Campus Infrastructure & Facilities Showcase</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage science labs, sports arena, research library, and smart auditorium cards.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{data.facilities.isVisible ? "Visible" : "Hidden"}</span>
                  <Switch
                    checked={data.facilities.isVisible}
                    onCheckedChange={(checked: boolean) => {
                      setData({ ...data, facilities: { ...data.facilities, isVisible: checked } });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addFacility}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Campus Facility</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Badge</label>
                  <Input
                    value={data.facilities.badge}
                    onChange={(e) => {
                      setData({ ...data, facilities: { ...data.facilities, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Campus Infrastructure"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.facilities.heading}
                    onChange={(e) => {
                      setData({ ...data, facilities: { ...data.facilities, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs"
                    placeholder="Purpose-Built Learning Spaces & Facilities"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Description</label>
                  <Textarea
                    value={data.facilities.description || ""}
                    onChange={(e) => {
                      setData({ ...data, facilities: { ...data.facilities, description: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    rows={2}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Facilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.facilities.facilities || []).map((facil, fIdx) => (
                  <div
                    key={facil.id || fIdx}
                    className="p-4 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 transition-all space-y-3 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center justify-center">
                            {fIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground">{facil.title || "Facility Card"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={fIdx === 0}
                            onClick={() => moveFacility(fIdx, "up")}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={fIdx === (data.facilities.facilities || []).length - 1}
                            onClick={() => moveFacility(fIdx, "down")}
                            className="h-7 w-7 rounded-lg"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteFacility(fIdx)}
                            className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold">Facility Title</label>
                          <Input
                            value={facil.title}
                            onChange={(e) => updateFacility(fIdx, "title", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="e.g. Advanced STEM & Robotics Lab"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold">Category</label>
                          <Input
                            value={facil.category}
                            onChange={(e) => updateFacility(fIdx, "category", e.target.value)}
                            className="rounded-xl text-xs"
                            placeholder="Laboratory"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold">Description</label>
                        <Textarea
                          value={facil.desc}
                          onChange={(e) => updateFacility(fIdx, "desc", e.target.value)}
                          rows={2}
                          className="rounded-xl text-xs leading-relaxed"
                          placeholder="Facility highlights & specifications..."
                        />
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <ImageUpload
                          value={facil.imgUrl}
                          onChange={(url) => updateFacility(fIdx, "imgUrl", url)}
                          label="Facility Image"
                          aspectRatio="video"
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
        {/* TAB 7: MENTORSHIP & CAMPUS CTA                      */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="experienceCta" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-seneca-crimson" />
                  <span>Bottom Mentorship & Campus Experience CTA</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure the concluding call-to-action banner for admissions and campus visits.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{data.experienceCta.isVisible ? "Visible" : "Hidden"}</span>
                <Switch
                  checked={data.experienceCta.isVisible}
                  onCheckedChange={(checked: boolean) => {
                    setData({ ...data, experienceCta: { ...data.experienceCta, isVisible: checked } });
                    setIsDraftModified(true);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">CTA Headline</label>
                <Input
                  value={data.experienceCta.heading}
                  onChange={(e) => {
                    setData({ ...data, experienceCta: { ...data.experienceCta, heading: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-xs"
                  placeholder="Experience Seneca Mentorship"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">CTA Description</label>
                <Textarea
                  value={data.experienceCta.description}
                  onChange={(e) => {
                    setData({ ...data, experienceCta: { ...data.experienceCta, description: e.target.value } });
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
                      checked={data.experienceCta.primaryCta.isVisible}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          experienceCta: {
                            ...data.experienceCta,
                            primaryCta: { ...data.experienceCta.primaryCta, isVisible: checked },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={data.experienceCta.primaryCta.text}
                      onChange={(e) => {
                        setData({
                          ...data,
                          experienceCta: {
                            ...data.experienceCta,
                            primaryCta: { ...data.experienceCta.primaryCta, text: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Apply for Admission"
                      className="rounded-xl text-xs"
                    />
                    <Input
                      value={data.experienceCta.primaryCta.href}
                      onChange={(e) => {
                        setData({
                          ...data,
                          experienceCta: {
                            ...data.experienceCta,
                            primaryCta: { ...data.experienceCta.primaryCta, href: e.target.value },
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
                    <span className="text-xs font-bold">Secondary Button (Visit Campus)</span>
                    <Switch
                      checked={data.experienceCta.secondaryCta.isVisible}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          experienceCta: {
                            ...data.experienceCta,
                            secondaryCta: { ...data.experienceCta.secondaryCta, isVisible: checked },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={data.experienceCta.secondaryCta.text}
                      onChange={(e) => {
                        setData({
                          ...data,
                          experienceCta: {
                            ...data.experienceCta,
                            secondaryCta: { ...data.experienceCta.secondaryCta, text: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Visit Campus"
                      className="rounded-xl text-xs"
                    />
                    <Input
                      value={data.experienceCta.secondaryCta.href}
                      onChange={(e) => {
                        setData({
                          ...data,
                          experienceCta: {
                            ...data.experienceCta,
                            secondaryCta: { ...data.experienceCta.secondaryCta, href: e.target.value },
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
        {/* TAB 8: SEO & METADATA                               */}
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
                  placeholder="Seneca faculty, Karachi teachers, STEM educators, campus facilities"
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
                    https://seneca.edu.pk/faculty
                  </p>
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {data.seo.metaTitle || "Faculty Educators & Campus — Seneca Academy Karachi"}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {data.seo.metaDescription || "Meet distinguished master-level faculty educators and explore modern campus infrastructure at Seneca Academy Karachi."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 9: LIVE INTERACTIVE PREVIEW                      */}
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
                    https://seneca.edu.pk/faculty (Preview Mode)
                  </span>
                </div>

                {/* Render All Dynamic Components */}
                <div className="pointer-events-auto">
                  {data.sectionsOrder.map((sectionKey) => {
                    switch (sectionKey) {
                      case "hero":
                        return <FacultyHeroSection key="hero-prev" hero={data.hero} />;
                      case "faculty":
                        return (
                          <div key="fac-prev" className="scroll-mt-24">
                            <FacultySection facultySection={data.facultySection} careers={data.careers} />
                          </div>
                        );
                      case "careers":
                        // If faculty was already rendered, skip duplicate
                        if (data.sectionsOrder.includes("faculty")) return null;
                        return (
                          <div key="car-prev" className="scroll-mt-24">
                            <FacultySection facultySection={data.facultySection} careers={data.careers} />
                          </div>
                        );
                      case "standards":
                        return <FacultyStandardsSection key="std-prev" standards={data.standards} />;
                      case "facilities":
                        return <CampusFacilitiesSection key="facil-prev" facilities={data.facilities} />;
                      case "experienceCta":
                        return <FacultyExperienceCta key="cta-prev" experienceCta={data.experienceCta} />;
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
