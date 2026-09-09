"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import {
  CreditCard,
  ExternalLink,
  ChevronRight,
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  Sliders,
  RefreshCw,
  EyeOff,
  Clock,
  Send,
  Loader2,
  GraduationCap,
  Award,
  PhoneCall,
  Check,
  X,
  FileText,
  HelpCircle,
  Calendar,
  AlertTriangle,
  Globe,
  Compass,
  Layers,
  Phone,
  MessageSquare,
  MapPin,
  Tag,
  ShieldCheck,
  Bus,
  FileUp,
  Settings,
  Laptop,
  Tablet,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DEFAULT_ADMISSIONS_PAGE_DATA,
  IAdmissionsPageData,
  IAdmissionRoadmapStep,
  IFeeCalculatorTier,
  IFeeStructureData,
  IAgeEligibilityItem,
  IRequiredDocumentItem,
  IScholarshipItem,
  IAdmissionsFaqItem,
  IAdmissionTypeItem,
  ITransportRouteItem,
  IDocumentRequirementRule,
} from "@/lib/db/admissions-page-defaults";

// Live Preview Component Imports
import AdmissionsHeroSection from "@/components/public/admissions/AdmissionsHeroSection";
import AdmissionsStatusBanner from "@/components/public/admissions/AdmissionsStatusBanner";
import AdmissionRoadmapSection from "@/components/public/admissions/AdmissionRoadmapSection";
import FeeEstimatorSection from "@/components/public/admissions/FeeEstimatorSection";
import FeeCalculator from "@/components/public/FeeCalculator";
import AgeEligibilityTableSection from "@/components/public/admissions/AgeEligibilityTableSection";
import RequiredDocumentsSection from "@/components/public/admissions/RequiredDocumentsSection";
import ScholarshipsSection from "@/components/public/admissions/ScholarshipsSection";
import AdmissionsFaqSection from "@/components/public/admissions/AdmissionsFaqSection";
import SaturdayBookingCta from "@/components/public/admissions/SaturdayBookingCta";

const SECTION_LABELS: Record<string, { title: string; desc: string; icon: any }> = {
  hero: {
    title: "Hero Section",
    desc: "Main admissions headline, session badge, and action buttons",
    icon: LayoutTemplate,
  },
  statusBanner: {
    title: "Admissions Live Status",
    desc: "Admissions open/closed status bar, session year, and urgent notices",
    icon: Sliders,
  },
  roadmap: {
    title: "4-Step Process Roadmap",
    desc: "Clear step-by-step guidance from campus visit to onboarding",
    icon: Compass,
  },
  feeEstimator: {
    title: "Fee Calculator & Estimator",
    desc: "Interactive tuition and fee breakdown calculator for all grades",
    icon: CreditCard,
  },
  eligibility: {
    title: "Age & Class Eligibility",
    desc: "Grade tier criteria, age brackets, and classroom student caps",
    icon: GraduationCap,
  },
  documents: {
    title: "Required Documents",
    desc: "Checklist of mandatory certificates and identity documents",
    icon: FileText,
  },
  scholarships: {
    title: "Scholarships & Aid",
    desc: "Merit discounts, sibling concessions, and Hafiz-e-Quran aid",
    icon: Award,
  },
  faqs: {
    title: "Admissions FAQs",
    desc: "Common parental questions regarding assessments and schedules",
    icon: HelpCircle,
  },
  saturdayBooking: {
    title: "Saturday Assessment Helpdesk",
    desc: "Campus desk hours, helpline phone, and diagnostic booking CTA",
    icon: Calendar,
  },
};

export default function WebsiteAdmissionsPageManager() {
  const [data, setData] = useState<IAdmissionsPageData>(DEFAULT_ADMISSIONS_PAGE_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraftModified, setIsDraftModified] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [faqSearch, setFaqSearch] = useState("");

  // Load existing data from API
  const loadAdmissionsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/admissions?preview=true");
      const json = await res.json();
      if (json?.data?.page) {
        setData({
          ...DEFAULT_ADMISSIONS_PAGE_DATA,
          ...json.data.page,
          globalSettings: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.globalSettings,
            ...(json.data.page.globalSettings || {}),
          },
          hero: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.hero,
            ...(json.data.page.hero || {}),
          },
          statusBanner: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.statusBanner,
            ...(json.data.page.statusBanner || {}),
          },
          roadmap: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.roadmap,
            ...(json.data.page.roadmap || {}),
          },
          feeStructure: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.feeStructure,
            ...(json.data.page.feeStructure || {}),
            tiers:
              json.data.page.feeStructure?.tiers && json.data.page.feeStructure.tiers.length > 0
                ? json.data.page.feeStructure.tiers
                : DEFAULT_ADMISSIONS_PAGE_DATA.feeStructure.tiers,
          },
          eligibility: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.eligibility,
            ...(json.data.page.eligibility || {}),
          },
          documents: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.documents,
            ...(json.data.page.documents || {}),
          },
          scholarships: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.scholarships,
            ...(json.data.page.scholarships || {}),
          },
          faqs: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.faqs,
            ...(json.data.page.faqs || {}),
          },
          admissionTypes:
            json.data.page.admissionTypes && json.data.page.admissionTypes.length > 0
              ? json.data.page.admissionTypes
              : DEFAULT_ADMISSIONS_PAGE_DATA.admissionTypes,
          transportRoutes:
            json.data.page.transportRoutes && json.data.page.transportRoutes.length > 0
              ? json.data.page.transportRoutes
              : DEFAULT_ADMISSIONS_PAGE_DATA.transportRoutes,
          documentRules:
            json.data.page.documentRules && json.data.page.documentRules.length > 0
              ? json.data.page.documentRules
              : DEFAULT_ADMISSIONS_PAGE_DATA.documentRules,
          saturdayBooking: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.saturdayBooking,
            ...(json.data.page.saturdayBooking || {}),
          },
          seo: {
            ...DEFAULT_ADMISSIONS_PAGE_DATA.seo,
            ...(json.data.page.seo || {}),
          },
        });
        setIsDraftModified(!!json.data.page.draft || !!json.data.isDraft);
      }
    } catch (err) {
      console.error("Failed to load admissions page data:", err);
      toast.error("Failed to load CMS data. Using local defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissionsData();
  }, []);

  // Save Draft Handler
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/admissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, saveAsDraft: true }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to save draft.");

      setIsDraftModified(true);
      toast.success("Admissions draft saved successfully! You can preview changes before publishing.");
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
      const res = await fetch("/api/admin/admissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, saveAsDraft: false }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to publish.");

      setIsDraftModified(false);
      toast.success("Admissions page published live to the public website!");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish live.");
    } finally {
      setPublishing(false);
    }
  };

  // Reset to Defaults Handler
  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to reset the Admissions page to original defaults?")) {
      setData(DEFAULT_ADMISSIONS_PAGE_DATA);
      setIsDraftModified(true);
      toast.info("Reset to default content template. Remember to save or publish.");
    }
  };

  // ----------------------------------------------------
  // SECTION REORDERING HELPERS
  // ----------------------------------------------------
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
  // ROADMAP STEPS HELPERS
  // ----------------------------------------------------
  const addRoadmapStep = () => {
    const nextIdx = (data.roadmap.steps || []).length + 1;
    const newStep: IAdmissionRoadmapStep = {
      id: `step-${Date.now()}`,
      stepNumber: nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`,
      title: "New Admission Step",
      description: "Describe the steps required for this phase of the admission process.",
      badge: "INQUIRY",
      badgeVariant: "crimson",
      colorClass: "text-seneca-crimson bg-seneca-crimson/10 border-seneca-crimson/20",
      isHighlighted: false,
      order: nextIdx,
      isActive: true,
    };
    setData({
      ...data,
      roadmap: {
        ...data.roadmap,
        steps: [...(data.roadmap.steps || []), newStep],
      },
    });
    setIsDraftModified(true);
    toast.success("New roadmap step added.");
  };

  const duplicateRoadmapStep = (index: number) => {
    const item = data.roadmap.steps[index];
    const nextIdx = (data.roadmap.steps || []).length + 1;
    const duplicated: IAdmissionRoadmapStep = {
      ...item,
      id: `step-${Date.now()}`,
      stepNumber: nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`,
      title: `${item.title} (Copy)`,
      order: nextIdx,
    };
    setData({
      ...data,
      roadmap: {
        ...data.roadmap,
        steps: [...data.roadmap.steps, duplicated],
      },
    });
    setIsDraftModified(true);
    toast.success("Roadmap step duplicated.");
  };

  const moveRoadmapStep = (index: number, direction: "up" | "down") => {
    const list = [...data.roadmap.steps];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setData({
      ...data,
      roadmap: { ...data.roadmap, steps: list },
    });
    setIsDraftModified(true);
  };

  const removeRoadmapStep = (index: number) => {
    if (data.roadmap.steps.length <= 1) {
      toast.error("You must have at least one roadmap step.");
      return;
    }
    const updated = data.roadmap.steps.filter((_, i) => i !== index);
    setData({
      ...data,
      roadmap: { ...data.roadmap, steps: updated },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // FEE ESTIMATOR & TIERS HELPERS
  // ----------------------------------------------------
  const addFeeTier = () => {
    const nextIdx = (data.feeStructure?.tiers || []).length + 1;
    const newTier: IFeeCalculatorTier = {
      id: `tier-${Date.now()}`,
      name: `New Grade Division ${nextIdx}`,
      badge: "Standard",
      badgeColor: "emerald",
      gradeRange: "Grade Details",
      admissionFee: 20000,
      securityDeposit: 5000,
      monthlyTuition: 7500,
      annualCharges: 5000,
      labFund: 0,
      features: [
        "Core Academic Curriculum",
        "STEM Labs & Computer Studio",
        "Sports & Physical Education",
      ],
      order: nextIdx,
      isActive: true,
    };
    setData({
      ...data,
      feeStructure: {
        ...data.feeStructure,
        tiers: [...(data.feeStructure?.tiers || []), newTier],
      },
    });
    setIsDraftModified(true);
    toast.success("New fee tier created.");
  };

  const duplicateFeeTier = (index: number) => {
    const item = data.feeStructure.tiers[index];
    const nextIdx = (data.feeStructure.tiers || []).length + 1;
    const duplicated: IFeeCalculatorTier = {
      ...item,
      id: `tier-${Date.now()}`,
      name: `${item.name} (Copy)`,
      order: nextIdx,
    };
    setData({
      ...data,
      feeStructure: {
        ...data.feeStructure,
        tiers: [...data.feeStructure.tiers, duplicated],
      },
    });
    setIsDraftModified(true);
    toast.success("Fee tier duplicated.");
  };

  const moveFeeTier = (index: number, direction: "up" | "down") => {
    const list = [...data.feeStructure.tiers];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setData({
      ...data,
      feeStructure: { ...data.feeStructure, tiers: list },
    });
    setIsDraftModified(true);
  };

  const removeFeeTier = (index: number) => {
    if ((data.feeStructure?.tiers || []).length <= 1) {
      toast.error("You must have at least one fee tier.");
      return;
    }
    const updated = data.feeStructure.tiers.filter((_, i) => i !== index);
    setData({
      ...data,
      feeStructure: { ...data.feeStructure, tiers: updated },
    });
    setIsDraftModified(true);
    toast.success("Fee tier removed.");
  };

  const addTierFeature = (tierIndex: number) => {
    const updatedTiers = [...data.feeStructure.tiers];
    const currentFeatures = updatedTiers[tierIndex].features || [];
    updatedTiers[tierIndex] = {
      ...updatedTiers[tierIndex],
      features: [...currentFeatures, "New Included Curriculum Benefit"],
    };
    setData({
      ...data,
      feeStructure: { ...data.feeStructure, tiers: updatedTiers },
    });
    setIsDraftModified(true);
  };

  const removeTierFeature = (tierIndex: number, featureIndex: number) => {
    const updatedTiers = [...data.feeStructure.tiers];
    const updatedFeatures = (updatedTiers[tierIndex].features || []).filter((_, i) => i !== featureIndex);
    updatedTiers[tierIndex] = {
      ...updatedTiers[tierIndex],
      features: updatedFeatures,
    };
    setData({
      ...data,
      feeStructure: { ...data.feeStructure, tiers: updatedTiers },
    });
    setIsDraftModified(true);
  };

  const updateTierFeature = (tierIndex: number, featureIndex: number, value: string) => {
    const updatedTiers = [...data.feeStructure.tiers];
    const updatedFeatures = [...(updatedTiers[tierIndex].features || [])];
    updatedFeatures[featureIndex] = value;
    updatedTiers[tierIndex] = {
      ...updatedTiers[tierIndex],
      features: updatedFeatures,
    };
    setData({
      ...data,
      feeStructure: { ...data.feeStructure, tiers: updatedTiers },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // ELIGIBILITY HELPERS
  // ----------------------------------------------------
  const addEligibilityRow = () => {
    const newRow: IAgeEligibilityItem = {
      id: `el-${Date.now()}`,
      grade: "New Grade Tier",
      age: "4.0 – 5.0 Years",
      seats: "30 Seats",
      focus: "Curriculum and skills focus overview",
      order: data.eligibility.items.length + 1,
      isActive: true,
    };
    setData({
      ...data,
      eligibility: {
        ...data.eligibility,
        items: [...data.eligibility.items, newRow],
      },
    });
    setIsDraftModified(true);
  };

  const duplicateEligibilityRow = (index: number) => {
    const item = data.eligibility.items[index];
    const duplicated: IAgeEligibilityItem = {
      ...item,
      id: `el-${Date.now()}`,
      grade: `${item.grade} (Copy)`,
      order: data.eligibility.items.length + 1,
    };
    setData({
      ...data,
      eligibility: {
        ...data.eligibility,
        items: [...data.eligibility.items, duplicated],
      },
    });
    setIsDraftModified(true);
    toast.success("Grade tier duplicated.");
  };

  const removeEligibilityRow = (index: number) => {
    if (data.eligibility.items.length <= 1) {
      toast.error("You must have at least one eligibility tier.");
      return;
    }
    const updated = data.eligibility.items.filter((_, i) => i !== index);
    setData({
      ...data,
      eligibility: { ...data.eligibility, items: updated },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // REQUIRED DOCUMENTS HELPERS
  // ----------------------------------------------------
  const addDocument = () => {
    const newDoc: IRequiredDocumentItem = {
      id: `doc-${Date.now()}`,
      documentName: "New Required Document / Certificate",
      description: "Brief explanation of who needs to submit this and why",
      badge: "Mandatory",
      isRequired: true,
      order: data.documents.documents.length + 1,
    };
    setData({
      ...data,
      documents: {
        ...data.documents,
        documents: [...data.documents.documents, newDoc],
      },
    });
    setIsDraftModified(true);
  };

  const removeDocument = (index: number) => {
    if (data.documents.documents.length <= 1) {
      toast.error("You must have at least one document requirement.");
      return;
    }
    const updated = data.documents.documents.filter((_, i) => i !== index);
    setData({
      ...data,
      documents: { ...data.documents, documents: updated },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // SCHOLARSHIPS HELPERS
  // ----------------------------------------------------
  const addScholarship = () => {
    const newSch: IScholarshipItem = {
      id: `sch-${Date.now()}`,
      title: "New Scholarship Category",
      discount: "20% Tuition Waiver",
      desc: "Describe who is eligible and the application procedure.",
      eligibilityCriteria: "Criteria details",
      badge: "Merit",
      order: data.scholarships.scholarships.length + 1,
      isActive: true,
    };
    setData({
      ...data,
      scholarships: {
        ...data.scholarships,
        scholarships: [...data.scholarships.scholarships, newSch],
      },
    });
    setIsDraftModified(true);
  };

  const removeScholarship = (index: number) => {
    if (data.scholarships.scholarships.length <= 1) {
      toast.error("You must have at least one scholarship item.");
      return;
    }
    const updated = data.scholarships.scholarships.filter((_, i) => i !== index);
    setData({
      ...data,
      scholarships: { ...data.scholarships, scholarships: updated },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // FAQS HELPERS
  // ----------------------------------------------------
  const addFaq = () => {
    const newFaq: IAdmissionsFaqItem = {
      id: `faq-${Date.now()}`,
      question: "New Admission Question?",
      answer: "Provide a detailed and helpful response for prospective parents.",
      category: "General",
      featured: false,
      order: data.faqs.items.length + 1,
      isActive: true,
    };
    setData({
      ...data,
      faqs: {
        ...data.faqs,
        items: [...data.faqs.items, newFaq],
      },
    });
    setIsDraftModified(true);
  };

  const removeFaq = (index: number) => {
    if (data.faqs.items.length <= 1) {
      toast.error("You must have at least one FAQ item.");
      return;
    }
    const updated = data.faqs.items.filter((_, i) => i !== index);
    setData({
      ...data,
      faqs: { ...data.faqs, items: updated },
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // ADMISSION TYPES HELPERS
  // ----------------------------------------------------
  const addAdmissionType = () => {
    const newType: IAdmissionTypeItem = {
      id: `type-${Date.now()}`,
      name: "New Type",
      label: "New Admission Category",
      desc: "Short description of this category",
      icon: "GraduationCap",
      concessionTag: "",
      order: (data.admissionTypes || []).length + 1,
      isActive: true,
    };
    setData({
      ...data,
      admissionTypes: [...(data.admissionTypes || []), newType],
    });
    setIsDraftModified(true);
  };

  const removeAdmissionType = (index: number) => {
    if ((data.admissionTypes || []).length <= 1) {
      toast.error("You must have at least one admission type.");
      return;
    }
    const updated = (data.admissionTypes || []).filter((_, i) => i !== index);
    setData({
      ...data,
      admissionTypes: updated,
    });
    setIsDraftModified(true);
  };

  // ----------------------------------------------------
  // TRANSPORT ROUTES HELPERS
  // ----------------------------------------------------
  const addTransportRoute = () => {
    const newRoute: ITransportRouteItem = {
      id: `route-${Date.now()}`,
      name: `Route ${(data.transportRoutes || []).length + 1}`,
      code: `ROUTE-${(data.transportRoutes || []).length + 1}`,
      description: "New Area 1 • New Area 2",
      areasCovered: ["Main Area"],
      fee: "Rs. 4,000 / month",
      order: (data.transportRoutes || []).length + 1,
      isActive: true,
    };
    setData({
      ...data,
      transportRoutes: [...(data.transportRoutes || []), newRoute],
    });
    setIsDraftModified(true);
  };

  const removeTransportRoute = (index: number) => {
    if ((data.transportRoutes || []).length <= 1) {
      toast.error("You must have at least one transport route.");
      return;
    }
    const updated = (data.transportRoutes || []).filter((_, i) => i !== index);
    setData({
      ...data,
      transportRoutes: updated,
    });
    setIsDraftModified(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
        <p className="text-sm font-semibold text-muted-foreground">Loading Admissions Page Content...</p>
      </div>
    );
  }

  // Filtered FAQs
  const filteredFaqs = (data.faqs.items || []).filter((f) => {
    if (!faqSearch) return true;
    return (
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      (f.category || "").toLowerCase().includes(faqSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-20">
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
        <span className="text-foreground font-bold">Admissions & Fees Page</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center border border-seneca-crimson/20 shadow-sm shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground tracking-tight">
                  Admissions & Fees CMS Manager
                </h1>
                {isDraftModified ? (
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-extrabold">
                    Draft Changes Staged
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-extrabold">
                    Live on Website
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage live admissions criteria, open/closed banners, process roadmap, scholarships, transport routes, and FAQs in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold gap-1.5 border-border/80 text-xs flex-1 sm:flex-initial"
          >
            <Link href="/admissions" target="_blank">
              <Eye className="h-3.5 w-3.5" />
              <span>Public Page</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          </Button>

          <Button
            onClick={handleResetDefaults}
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs font-semibold text-muted-foreground hover:text-rose-600 gap-1.5 flex-1 sm:flex-initial"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            variant="outline"
            size="sm"
            className="rounded-xl font-bold gap-1.5 border-seneca-crimson/30 text-seneca-crimson hover:bg-seneca-crimson/5 text-xs flex-1 sm:flex-initial"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Draft</span>
          </Button>

          <Button
            onClick={handlePublish}
            disabled={publishing || saving}
            size="sm"
            className="rounded-xl font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-md transition-all hover:scale-[1.02] text-xs flex-1 sm:flex-initial"
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
          <TabsTrigger value="global" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Sliders className="h-3.5 w-3.5" />
            <span>Master Settings</span>
          </TabsTrigger>
          <TabsTrigger value="hero" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span>Hero Banner</span>
          </TabsTrigger>
          <TabsTrigger value="statusBanner" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Status Banner</span>
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Compass className="h-3.5 w-3.5" />
            <span>4-Step Roadmap</span>
          </TabsTrigger>
          <TabsTrigger value="feeEstimator" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Fee Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Age Criteria</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Required Documents</span>
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Award className="h-3.5 w-3.5" />
            <span>Scholarships</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Admissions FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="admissionTypes" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Tag className="h-3.5 w-3.5" />
            <span>Admission Types</span>
          </TabsTrigger>
          <TabsTrigger value="transportRoutes" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Bus className="h-3.5 w-3.5" />
            <span>Transport Routes</span>
          </TabsTrigger>
          <TabsTrigger value="saturdayBooking" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
            <Calendar className="h-3.5 w-3.5" />
            <span>Saturday Helpdesk</span>
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
        {/* TAB 1: MASTER ADMISSIONS SETTINGS                   */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="global" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-seneca-crimson" />
                    <span>Master Admissions Settings & Global Flags</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Controls global enrollment state, session labels, application submission policies, and hotlines.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-foreground">
                    {data.globalSettings.admissionsOpen ? "Admissions OPEN" : "Admissions CLOSED"}
                  </span>
                  <Switch
                    checked={data.globalSettings.admissionsOpen}
                    onCheckedChange={(checked: boolean) => {
                      if (!checked && !confirm("Are you sure you want to CLOSE admissions? The public website will immediately transition to the inquiries & waitlist mode.")) {
                        return;
                      }
                      setData({
                        ...data,
                        globalSettings: { ...data.globalSettings, admissionsOpen: checked },
                      });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Highlight Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                  data.globalSettings.admissionsOpen
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-background/80 flex items-center justify-center shrink-0 shadow-xs">
                  {data.globalSettings.admissionsOpen ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                  )}
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold">
                    {data.globalSettings.admissionsOpen
                      ? "Enrollment Portal is ACTIVE"
                      : "Admissions Portal is currently CLOSED"}
                  </div>
                  <p className="opacity-90 leading-relaxed">
                    {data.globalSettings.admissionsOpen
                      ? "Parents can fill online admission forms, select classes/streams, attach documents, and receive assessment confirmation."
                      : "The public admissions page displays the closed announcement and redirects visitors to counselor inquiries or upcoming session waitlists."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Academic Session Label</label>
                  <Input
                    value={data.globalSettings.admissionsSession}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        globalSettings: { ...data.globalSettings, admissionsSession: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="e.g. Session 2026–2027"
                    className="rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Opening Date</label>
                  <Input
                    value={data.globalSettings.openingDate || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        globalSettings: { ...data.globalSettings, openingDate: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="e.g. 01 June 2026"
                    className="rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Final Application Deadline</label>
                  <Input
                    value={data.globalSettings.admissionsDeadline || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        globalSettings: { ...data.globalSettings, admissionsDeadline: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="e.g. 31st August 2026"
                    className="rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Toggles & Application Policies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-foreground">Online Submission Gate</div>
                      <div className="text-[11px] text-muted-foreground">Allow applicants to submit new application forms</div>
                    </div>
                    <Switch
                      checked={data.globalSettings.applicationSubmissionEnabled !== false}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          globalSettings: { ...data.globalSettings, applicationSubmissionEnabled: checked },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div>
                      <div className="text-xs font-bold text-foreground">Saturday Assessments Enabled</div>
                      <div className="text-[11px] text-muted-foreground">Schedule Saturday diagnostic assessment slots</div>
                    </div>
                    <Switch
                      checked={data.globalSettings.diagnosticAssessmentEnabled !== false}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          globalSettings: { ...data.globalSettings, diagnosticAssessmentEnabled: checked },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-foreground">Transport Application Option</div>
                      <div className="text-[11px] text-muted-foreground">Show school bus & van routes selector in application</div>
                    </div>
                    <Switch
                      checked={data.globalSettings.transportEnabled !== false}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          globalSettings: { ...data.globalSettings, transportEnabled: checked },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div>
                      <div className="text-xs font-bold text-foreground">Document Uploads Mandatory</div>
                      <div className="text-[11px] text-muted-foreground">Require B-Form & CNIC upload before submission</div>
                    </div>
                    <Switch
                      checked={data.globalSettings.documentUploadsMandatory !== false}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          globalSettings: { ...data.globalSettings, documentUploadsMandatory: checked },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Hotlines & Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Admissions Helpline Phone</label>
                  <Input
                    value={data.globalSettings.admissionsPhone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        globalSettings: { ...data.globalSettings, admissionsPhone: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="+92 335 7413777"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">WhatsApp Number</label>
                  <Input
                    value={data.globalSettings.admissionsWhatsapp || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        globalSettings: { ...data.globalSettings, admissionsWhatsapp: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="+92 335 7413777"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Admissions Email</label>
                  <Input
                    value={data.globalSettings.admissionsEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        globalSettings: { ...data.globalSettings, admissionsEmail: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="admissions@seneca.edu.pk"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Campus Desk Address</label>
                <Input
                  value={data.globalSettings.admissionsOfficeAddress}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setData({
                      ...data,
                      globalSettings: { ...data.globalSettings, admissionsOfficeAddress: e.target.value },
                    });
                    setIsDraftModified(true);
                  }}
                  placeholder="Soldier Bazar, Garden East, Karachi, Pakistan"
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Apply Button Label (When Open)</label>
                  <Input
                    value={data.globalSettings.applyButtonText}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        globalSettings: { ...data.globalSettings, applyButtonText: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Apply for Admission Online"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Waitlist Button Label (When Closed)</label>
                  <Input
                    value={data.globalSettings.closedButtonText || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        globalSettings: { ...data.globalSettings, closedButtonText: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Register for Next Intake Waitlist"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: HERO SECTION                                  */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4 text-seneca-crimson" />
                    <span>Admissions Hero Banner Configuration</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Controls the top header section on the public admissions page.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Visible</span>
                  <Switch
                    checked={data.hero.isVisible}
                    onCheckedChange={(checked: boolean) => {
                      setData({ ...data, hero: { ...data.hero, isVisible: checked } });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Eyebrow Badge Text</label>
                  <Input
                    value={data.hero.badge}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({ ...data, hero: { ...data.hero, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Color Variant</label>
                  <select
                    value={data.hero.variant}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      setData({ ...data, hero: { ...data.hero, variant: e.target.value as any } });
                      setIsDraftModified(true);
                    }}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="crimson">Seneca Crimson (Default)</option>
                    <option value="amber">Warm Amber</option>
                    <option value="emerald">Emerald</option>
                    <option value="default">Neutral / Default</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Main Title (Primary Text)</label>
                  <Input
                    value={data.hero.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({ ...data, hero: { ...data.hero, title: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Highlighted Title (Crimson Accent)</label>
                  <Input
                    value={data.hero.highlightedTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({ ...data, hero: { ...data.hero, highlightedTitle: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-sm font-bold text-seneca-crimson"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Hero Subtitle / Description</label>
                <Textarea
                  value={data.hero.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setData({ ...data, hero: { ...data.hero, description: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={3}
                  className="rounded-xl text-sm resize-none"
                />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Primary Call-to-Action</span>
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
                  <Input
                    value={data.hero.primaryCta.text}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
                    className="rounded-xl text-xs"
                  />
                  <Input
                    value={data.hero.primaryCta.href}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        hero: {
                          ...data.hero,
                          primaryCta: { ...data.hero.primaryCta, href: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Link (e.g. #fee-calculator)"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Secondary Call-to-Action</span>
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
                  <Input
                    value={data.hero.secondaryCta.text}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
                    className="rounded-xl text-xs"
                  />
                  <Input
                    value={data.hero.secondaryCta.href}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        hero: {
                          ...data.hero,
                          secondaryCta: { ...data.hero.secondaryCta, href: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Link (e.g. #admission-process)"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Inline Live Hero Preview */}
              <div className="border border-border/80 rounded-2xl p-4 bg-card/60 space-y-3 pt-4">
                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Live Hero Banner Section Preview</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm">
                  <AdmissionsHeroSection hero={data.hero} globalSettings={data.globalSettings} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: STATUS BANNER (OPEN VS CLOSED STATES)         */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="statusBanner" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Open State Card */}
            <Card className="rounded-3xl border-border/80 shadow-sm">
              <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 pb-4">
                <CardTitle className="text-base font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Open State Banner Content</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Displayed when admissions are active and accepting online submissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Badge Text</label>
                  <Input
                    value={data.statusBanner.openState.badgeText}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        statusBanner: {
                          ...data.statusBanner,
                          openState: { ...data.statusBanner.openState, badgeText: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Main Heading</label>
                  <Input
                    value={data.statusBanner.openState.heading}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        statusBanner: {
                          ...data.statusBanner,
                          openState: { ...data.statusBanner.openState, heading: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Description</label>
                  <Textarea
                    value={data.statusBanner.openState.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                      setData({
                        ...data,
                        statusBanner: {
                          ...data.statusBanner,
                          openState: { ...data.statusBanner.openState, description: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    rows={3}
                    className="rounded-xl text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Apply Button Text</label>
                    <Input
                      value={data.statusBanner.openState.applyButtonLabel}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setData({
                          ...data,
                          statusBanner: {
                            ...data.statusBanner,
                            openState: { ...data.statusBanner.openState, applyButtonLabel: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Secondary Button Text</label>
                    <Input
                      value={data.statusBanner.openState.secondaryButtonLabel}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setData({
                          ...data,
                          statusBanner: {
                            ...data.statusBanner,
                            openState: { ...data.statusBanner.openState, secondaryButtonLabel: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Closed State Card */}
            <Card className="rounded-3xl border-border/80 shadow-sm">
              <CardHeader className="bg-rose-500/10 border-b border-rose-500/20 pb-4">
                <CardTitle className="text-base font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>Closed State Banner Content</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Displayed when admissions are closed to guide parents to counselors and next intakes.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Badge Text</label>
                  <Input
                    value={data.statusBanner.closedState.badgeText}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        statusBanner: {
                          ...data.statusBanner,
                          closedState: { ...data.statusBanner.closedState, badgeText: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Closed Heading</label>
                  <Input
                    value={data.statusBanner.closedState.heading}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        statusBanner: {
                          ...data.statusBanner,
                          closedState: { ...data.statusBanner.closedState, heading: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Closed Message</label>
                  <Textarea
                    value={data.statusBanner.closedState.closedMessage}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                      setData({
                        ...data,
                        statusBanner: {
                          ...data.statusBanner,
                          closedState: { ...data.statusBanner.closedState, closedMessage: e.target.value },
                        },
                      });
                      setIsDraftModified(true);
                    }}
                    rows={3}
                    className="rounded-xl text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Contact Button Text</label>
                    <Input
                      value={data.statusBanner.closedState.contactCounselorsText}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setData({
                          ...data,
                          statusBanner: {
                            ...data.statusBanner,
                            closedState: { ...data.statusBanner.closedState, contactCounselorsText: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Contact Link</label>
                    <Input
                      value={data.statusBanner.closedState.contactCounselorsHref}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setData({
                          ...data,
                          statusBanner: {
                            ...data.statusBanner,
                            closedState: { ...data.statusBanner.closedState, contactCounselorsHref: e.target.value },
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: 4-STEP ROADMAP                                */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Compass className="h-4 w-4 text-seneca-crimson" />
                    <span>Admission Process Roadmap Manager</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure the admission step cards, pill badges, highlight states, and descriptive copy.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Visible</span>
                    <Switch
                      checked={data.roadmap.isVisible}
                      onCheckedChange={(checked: boolean) => {
                        setData({ ...data, roadmap: { ...data.roadmap, isVisible: checked } });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <Button
                    onClick={addRoadmapStep}
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Step</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Header Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Eyebrow Badge</label>
                  <Input
                    value={data.roadmap.badge}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({ ...data, roadmap: { ...data.roadmap, badge: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    placeholder="Clear 4-Step Roadmap"
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.roadmap.heading}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({ ...data, roadmap: { ...data.roadmap, heading: e.target.value } });
                      setIsDraftModified(true);
                    }}
                    placeholder="How Admission Works at Seneca Academy"
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Section Subtitle / Description</label>
                <Textarea
                  value={data.roadmap.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setData({ ...data, roadmap: { ...data.roadmap, description: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  placeholder="We ensure an objective, encouraging, and merit-focused admission journey for every prospective student and their family."
                  className="rounded-xl text-xs resize-none"
                />
              </div>

              {/* Steps List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    Roadmap Step Cards ({data.roadmap.steps.length})
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Cards automatically flow in a 4-column responsive grid on the public page.
                  </span>
                </div>

                <div className="space-y-4">
                  {data.roadmap.steps.map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className={`p-4 rounded-2xl border transition-all space-y-4 ${
                        step.isHighlighted
                          ? "border-seneca-crimson/50 bg-seneca-crimson/[0.02] shadow-sm"
                          : "border-border/80 bg-card hover:border-seneca-crimson/30"
                      }`}
                    >
                      {/* Step Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-border/60">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-lg bg-seneca-crimson/10 text-seneca-crimson font-mono font-black text-xs flex items-center justify-center border border-seneca-crimson/20 shrink-0">
                            {step.stepNumber}
                          </span>
                          <span className="text-xs font-bold text-foreground truncate">
                            Step #{idx + 1}: {step.title || "Untitled Step"}
                          </span>
                          {step.isHighlighted && (
                            <Badge className="bg-seneca-crimson/15 text-seneca-crimson border-seneca-crimson/30 text-[10px] font-bold shrink-0">
                              Featured Highlight
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap w-full sm:w-auto pt-1 sm:pt-0">
                          {/* Active Toggle */}
                          <div className="flex items-center gap-1.5 mr-2">
                            <span className="text-[11px] text-muted-foreground">Active</span>
                            <Switch
                              checked={step.isActive !== false}
                              onCheckedChange={(checked: boolean) => {
                                const updated = [...data.roadmap.steps];
                                updated[idx].isActive = checked;
                                setData({ ...data, roadmap: { ...data.roadmap, steps: updated } });
                                setIsDraftModified(true);
                              }}
                            />
                          </div>

                          {/* Highlight Toggle */}
                          <div className="flex items-center gap-1.5 mr-2">
                            <span className="text-[11px] text-muted-foreground">Highlight</span>
                            <Switch
                              checked={!!step.isHighlighted}
                              onCheckedChange={(checked: boolean) => {
                                const updated = [...data.roadmap.steps];
                                updated[idx].isHighlighted = checked;
                                setData({ ...data, roadmap: { ...data.roadmap, steps: updated } });
                                setIsDraftModified(true);
                              }}
                            />
                          </div>

                          {/* Reorder Buttons */}
                          <Button
                            onClick={() => moveRoadmapStep(idx, "up")}
                            disabled={idx === 0}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => moveRoadmapStep(idx, "down")}
                            disabled={idx === data.roadmap.steps.length - 1}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>

                          {/* Duplicate */}
                          <Button
                            onClick={() => duplicateRoadmapStep(idx)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete */}
                          <Button
                            onClick={() => removeRoadmapStep(idx)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg"
                            title="Delete Step"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
                        <div className="sm:col-span-1 lg:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Number</label>
                          <Input
                            value={step.stepNumber}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.roadmap.steps];
                              updated[idx].stepNumber = e.target.value;
                              setData({ ...data, roadmap: { ...data.roadmap, steps: updated } });
                              setIsDraftModified(true);
                            }}
                            placeholder="01"
                            className="rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                        <div className="sm:col-span-1 lg:col-span-4 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Step Title</label>
                          <Input
                            value={step.title}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.roadmap.steps];
                              updated[idx].title = e.target.value;
                              setData({ ...data, roadmap: { ...data.roadmap, steps: updated } });
                              setIsDraftModified(true);
                            }}
                            placeholder="Campus Visit & Inquiry"
                            className="rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div className="sm:col-span-1 lg:col-span-3 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Badge Pill Text</label>
                          <Input
                            value={step.badge}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.roadmap.steps];
                              updated[idx].badge = e.target.value;
                              setData({ ...data, roadmap: { ...data.roadmap, steps: updated } });
                              setIsDraftModified(true);
                            }}
                            placeholder="INQUIRY"
                            className="rounded-lg text-xs uppercase"
                          />
                        </div>
                        <div className="sm:col-span-1 lg:col-span-3 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Badge Palette</label>
                          <select
                            value={step.badgeVariant || "crimson"}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                              const updated = [...data.roadmap.steps];
                              updated[idx].badgeVariant = e.target.value as any;
                              setData({ ...data, roadmap: { ...data.roadmap, steps: updated } });
                              setIsDraftModified(true);
                            }}
                            className="w-full h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="crimson">Crimson (Rose)</option>
                            <option value="amber">Amber (Orange)</option>
                            <option value="emerald">Emerald (Green)</option>
                            <option value="blue">Sky Blue</option>
                            <option value="neutral">Neutral Slate</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Step Description</label>
                        <Textarea
                          value={step.description}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                            const updated = [...data.roadmap.steps];
                            updated[idx].description = e.target.value;
                            setData({ ...data, roadmap: { ...data.roadmap, steps: updated } });
                            setIsDraftModified(true);
                          }}
                          rows={2}
                          placeholder="Describe instructions, timelines, or requirements for this step..."
                          className="rounded-lg text-xs resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline Live Section Preview Box */}
              <div className="border border-border/80 rounded-2xl p-4 bg-card/60 space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Live Section Preview (Public View)</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Matches current staged draft values in real time.
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm bg-background">
                  <AdmissionRoadmapSection roadmap={data.roadmap} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 5: FEE ESTIMATOR & CALCULATOR                    */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="feeEstimator" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-seneca-crimson" />
                    <span>Tuition Cost & Fee Calculator CMS Manager</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Manage grade tier fees, monthly tuition, admission vouchers, sibling concessions, and curriculum benefits.
                  </CardDescription>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Visible</span>
                    <Switch
                      checked={data.feeStructure?.isVisible !== false}
                      onCheckedChange={(checked: boolean) => {
                        setData({
                          ...data,
                          feeStructure: { ...data.feeStructure, isVisible: checked },
                        });
                        setIsDraftModified(true);
                      }}
                    />
                  </div>
                  <Button
                    onClick={addFeeTier}
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Fee Tier</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-6 space-y-5 sm:space-y-6">
              {/* Section Header Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Eyebrow Badge</label>
                  <Input
                    value={data.feeStructure?.badge || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        feeStructure: { ...data.feeStructure, badge: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Institutional Transparency"
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Section Heading</label>
                  <Input
                    value={data.feeStructure?.heading || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        feeStructure: { ...data.feeStructure, heading: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Fee Structure & Investment in Excellence"
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Section Subtitle / Description</label>
                <Textarea
                  value={data.feeStructure?.description || ""}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setData({
                      ...data,
                      feeStructure: { ...data.feeStructure, description: e.target.value },
                    });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  placeholder="Describe your school's transparent tuition fee policies and quality investments..."
                  className="rounded-xl text-xs resize-none"
                />
              </div>

              {/* Concessions & Discounts Settings */}
              <div className="p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3.5 sm:space-y-4">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Concession Rules & Payment Billing Options</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Sibling Concession (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={data.feeStructure?.siblingDiscountPercent ?? 15}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setData({
                          ...data,
                          feeStructure: {
                            ...data.feeStructure,
                            siblingDiscountPercent: parseFloat(e.target.value) || 0,
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      className="rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Sibling Label Text</label>
                    <Input
                      value={data.feeStructure?.siblingDiscountLabel || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setData({
                          ...data,
                          feeStructure: { ...data.feeStructure, siblingDiscountLabel: e.target.value },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Apply Sibling Concession (15% off)"
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Annual Advance Discount (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={data.feeStructure?.annualAdvanceDiscountPercent ?? 5}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setData({
                          ...data,
                          feeStructure: {
                            ...data.feeStructure,
                            annualAdvanceDiscountPercent: parseFloat(e.target.value) || 0,
                          },
                        });
                        setIsDraftModified(true);
                      }}
                      className="rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Annual Label Text</label>
                    <Input
                      value={data.feeStructure?.annualDiscountLabel || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setData({
                          ...data,
                          feeStructure: { ...data.feeStructure, annualDiscountLabel: e.target.value },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Annual Advance (5% Extra Off)"
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Apply Button Text & Href</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={data.feeStructure?.applyButtonText || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setData({
                            ...data,
                            feeStructure: { ...data.feeStructure, applyButtonText: e.target.value },
                          });
                          setIsDraftModified(true);
                        }}
                        placeholder="Apply for this Grade"
                        className="rounded-xl text-xs"
                      />
                      <Input
                        value={data.feeStructure?.applyButtonHref || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setData({
                            ...data,
                            feeStructure: { ...data.feeStructure, applyButtonHref: e.target.value },
                          });
                          setIsDraftModified(true);
                        }}
                        placeholder="#admissions"
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Disclaimer / Footnote</label>
                    <Input
                      value={data.feeStructure?.disclaimerText || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setData({
                          ...data,
                          feeStructure: { ...data.feeStructure, disclaimerText: e.target.value },
                        });
                        setIsDraftModified(true);
                      }}
                      placeholder="Tuition vouchers are issued bi-monthly..."
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Fee Tiers List */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-foreground">
                      Grade Division Fee Tiers ({data.feeStructure?.tiers?.length || 0})
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Each tier represents an academic division displayed as a clickable tab in the calculator.
                    </p>
                  </div>
                  <Button
                    onClick={addFeeTier}
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs font-bold gap-1 border-seneca-crimson/30 text-seneca-crimson hover:bg-seneca-crimson/5 self-start sm:self-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Tier</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {(data.feeStructure?.tiers || []).map((tier, tIdx) => (
                    <div
                      key={tier.id || tIdx}
                      className="p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card hover:border-seneca-crimson/30 transition-all space-y-3.5 sm:space-y-4"
                    >
                      {/* Tier Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-border/60">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-lg bg-seneca-crimson/10 text-seneca-crimson font-mono font-black text-xs flex items-center justify-center border border-seneca-crimson/20 shrink-0">
                            {tIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground truncate">
                            {tier.name || "Untitled Tier"}
                          </span>
                          {tier.gradeRange && (
                            <span className="text-[11px] text-muted-foreground truncate">({tier.gradeRange})</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap w-full sm:w-auto pt-1 sm:pt-0">
                          {/* Active Toggle */}
                          <div className="flex items-center gap-1.5 mr-2">
                            <span className="text-[11px] text-muted-foreground">Active</span>
                            <Switch
                              checked={tier.isActive !== false}
                              onCheckedChange={(checked: boolean) => {
                                const updated = [...data.feeStructure.tiers];
                                updated[tIdx].isActive = checked;
                                setData({
                                  ...data,
                                  feeStructure: { ...data.feeStructure, tiers: updated },
                                });
                                setIsDraftModified(true);
                              }}
                            />
                          </div>

                          {/* Move Up */}
                          <Button
                            onClick={() => moveFeeTier(tIdx, "up")}
                            disabled={tIdx === 0}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          {/* Move Down */}
                          <Button
                            onClick={() => moveFeeTier(tIdx, "down")}
                            disabled={tIdx === (data.feeStructure?.tiers || []).length - 1}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          {/* Duplicate */}
                          <Button
                            onClick={() => duplicateFeeTier(tIdx)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                            title="Duplicate Tier"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          {/* Delete */}
                          <Button
                            onClick={() => removeFeeTier(tIdx)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg"
                            title="Delete Tier"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Tier Info Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
                        <div className="sm:col-span-1 lg:col-span-4 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Tier Name</label>
                          <Input
                            value={tier.name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.feeStructure.tiers];
                              updated[tIdx].name = e.target.value;
                              setData({
                                ...data,
                                feeStructure: { ...data.feeStructure, tiers: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            placeholder="e.g. Primary School"
                            className="rounded-lg text-xs font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-1 lg:col-span-4 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Grade Range</label>
                          <Input
                            value={tier.gradeRange}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.feeStructure.tiers];
                              updated[tIdx].gradeRange = e.target.value;
                              setData({
                                ...data,
                                feeStructure: { ...data.feeStructure, tiers: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            placeholder="e.g. Grade 1 to Grade 5"
                            className="rounded-lg text-xs"
                          />
                        </div>

                        <div className="sm:col-span-1 lg:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Badge Tag</label>
                          <Input
                            value={tier.badge}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.feeStructure.tiers];
                              updated[tIdx].badge = e.target.value;
                              setData({
                                ...data,
                                feeStructure: { ...data.feeStructure, tiers: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            placeholder="Inquiry"
                            className="rounded-lg text-xs"
                          />
                        </div>

                        <div className="sm:col-span-1 lg:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Badge Color</label>
                          <select
                            value={tier.badgeColor || "emerald"}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                              const updated = [...data.feeStructure.tiers];
                              updated[tIdx].badgeColor = e.target.value;
                              setData({
                                ...data,
                                feeStructure: { ...data.feeStructure, tiers: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="w-full h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="emerald">Emerald (Green)</option>
                            <option value="sky">Sky Blue</option>
                            <option value="indigo">Indigo (Purple)</option>
                            <option value="crimson">Crimson (Rose)</option>
                            <option value="amber">Warm Amber</option>
                          </select>
                        </div>
                      </div>

                      {/* Financial Slabs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 p-3 rounded-xl bg-muted/30 border border-border/60">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Monthly Tuition (Rs)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={tier.monthlyTuition}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.feeStructure.tiers];
                              updated[tIdx].monthlyTuition = parseInt(e.target.value, 10) || 0;
                              setData({
                                ...data,
                                feeStructure: { ...data.feeStructure, tiers: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="rounded-lg text-xs font-bold text-seneca-crimson"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Admission Fee (Rs)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={tier.admissionFee}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.feeStructure.tiers];
                              updated[tIdx].admissionFee = parseInt(e.target.value, 10) || 0;
                              setData({
                                ...data,
                                feeStructure: { ...data.feeStructure, tiers: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Security Deposit (Rs)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={tier.securityDeposit}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.feeStructure.tiers];
                              updated[tIdx].securityDeposit = parseInt(e.target.value, 10) || 0;
                              setData({
                                ...data,
                                feeStructure: { ...data.feeStructure, tiers: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Annual Resource Charges (Rs)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={tier.annualCharges}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const updated = [...data.feeStructure.tiers];
                              updated[tIdx].annualCharges = parseInt(e.target.value, 10) || 0;
                              setData({
                                ...data,
                                feeStructure: { ...data.feeStructure, tiers: updated },
                              });
                              setIsDraftModified(true);
                            }}
                            className="rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* Included Academic Benefits Manager */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Included Academic Benefits / Features ({(tier.features || []).length})
                          </label>
                          <Button
                            onClick={() => addTierFeature(tIdx)}
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[11px] font-bold text-seneca-crimson hover:bg-seneca-crimson/10 gap-1 px-2 rounded-lg"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Benefit</span>
                          </Button>
                        </div>

                        <div className="space-y-1.5">
                          {(tier.features || []).map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <Input
                                value={feat}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  updateTierFeature(tIdx, fIdx, e.target.value)
                                }
                                placeholder="e.g. STEM Labs & Computer Studio"
                                className="rounded-lg text-xs h-8 flex-1 min-w-0"
                              />
                              <Button
                                onClick={() => removeTierFeature(tIdx, fIdx)}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Embedded Live Interactive Preview Box */}
              <div className="border border-border/80 rounded-2xl p-2.5 sm:p-4 bg-card/60 space-y-3 pt-3.5 sm:pt-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Live Interactive Fee Calculator Preview (Public View)</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Interactive testing: click tabs, toggle sibling discount, and test calculations.
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm bg-background w-full">
                  <FeeCalculator feeStructure={data.feeStructure} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 5: AGE ELIGIBILITY MATRIX                        */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="eligibility" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-seneca-crimson" />
                    <span>Age Eligibility & Class Divisions Matrix</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define age brackets, maximum seat quotas, and curriculum focus points for each level.
                  </CardDescription>
                </div>
                <Button
                  onClick={addEligibilityRow}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Division</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-4">
                {data.eligibility.items.map((row, idx) => (
                  <div
                    key={row.id || idx}
                    className="p-4 rounded-2xl border border-border/80 bg-card hover:border-seneca-crimson/30 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          Tier #{idx + 1}
                        </Badge>
                        <span className="text-xs font-bold text-foreground">{row.grade}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => duplicateEligibilityRow(idx)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-[11px] text-muted-foreground">Active</span>
                        <Switch
                          checked={row.isActive !== false}
                          onCheckedChange={(checked: boolean) => {
                            const updated = [...data.eligibility.items];
                            updated[idx].isActive = checked;
                            setData({ ...data, eligibility: { ...data.eligibility, items: updated } });
                            setIsDraftModified(true);
                          }}
                        />
                        <Button
                          onClick={() => removeEligibilityRow(idx)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg ml-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Academic Division / Grade
                        </label>
                        <Input
                          value={row.grade}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updated = [...data.eligibility.items];
                            updated[idx].grade = e.target.value;
                            setData({ ...data, eligibility: { ...data.eligibility, items: updated } });
                            setIsDraftModified(true);
                          }}
                          placeholder="e.g. Primary (Grades 1–5)"
                          className="rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Age Bracket
                        </label>
                        <Input
                          value={row.age}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updated = [...data.eligibility.items];
                            updated[idx].age = e.target.value;
                            setData({ ...data, eligibility: { ...data.eligibility, items: updated } });
                            setIsDraftModified(true);
                          }}
                          placeholder="e.g. 5.5 – 10 Years"
                          className="rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Classroom Cap / Quota
                        </label>
                        <Input
                          value={row.seats || ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updated = [...data.eligibility.items];
                            updated[idx].seats = e.target.value;
                            setData({ ...data, eligibility: { ...data.eligibility, items: updated } });
                            setIsDraftModified(true);
                          }}
                          placeholder="e.g. 35 Seats (Sec A, B, C, D)"
                          className="rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Curriculum & Skills Focus
                      </label>
                      <Input
                        value={row.focus || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const updated = [...data.eligibility.items];
                          updated[idx].focus = e.target.value;
                          setData({ ...data, eligibility: { ...data.eligibility, items: updated } });
                          setIsDraftModified(true);
                        }}
                        placeholder="e.g. CPA Conceptual Math, General Science, STEM foundation"
                        className="rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 6: REQUIRED DOCUMENTS CHECKLIST                  */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-seneca-crimson" />
                    <span>Documents Required Checklist Manager</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    List all mandatory and optional certificates required for student enrollment confirmation.
                  </CardDescription>
                </div>
                <Button
                  onClick={addDocument}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Document</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-4">
                {data.documents.documents.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="p-4 rounded-2xl border border-border/80 bg-card hover:border-seneca-crimson/30 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">Document #{idx + 1}</span>
                        <Badge
                          variant={doc.isRequired ? "crimson" : "outline"}
                          className="text-[10px] font-bold"
                        >
                          {doc.badge || (doc.isRequired ? "Mandatory" : "Optional")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Mandatory</span>
                        <Switch
                          checked={doc.isRequired}
                          onCheckedChange={(checked: boolean) => {
                            const updated = [...data.documents.documents];
                            updated[idx].isRequired = checked;
                            updated[idx].badge = checked ? "Mandatory" : "Optional";
                            setData({ ...data, documents: { ...data.documents, documents: updated } });
                            setIsDraftModified(true);
                          }}
                        />
                        <Button
                          onClick={() => removeDocument(idx)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg ml-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Document Title
                        </label>
                        <Input
                          value={doc.documentName}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updated = [...data.documents.documents];
                            updated[idx].documentName = e.target.value;
                            setData({ ...data, documents: { ...data.documents, documents: updated } });
                            setIsDraftModified(true);
                          }}
                          placeholder="e.g. Original & Copy of Student's NADRA Birth Certificate"
                          className="rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Badge Label
                        </label>
                        <Input
                          value={doc.badge || ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updated = [...data.documents.documents];
                            updated[idx].badge = e.target.value;
                            setData({ ...data, documents: { ...data.documents, documents: updated } });
                            setIsDraftModified(true);
                          }}
                          placeholder="e.g. Mandatory, Mandatory for Transfers"
                          className="rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Description / Verification Instructions
                      </label>
                      <Input
                        value={doc.description || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const updated = [...data.documents.documents];
                          updated[idx].description = e.target.value;
                          setData({ ...data, documents: { ...data.documents, documents: updated } });
                          setIsDraftModified(true);
                        }}
                        placeholder="e.g. Mandatory for age verification and official board registration"
                        className="rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 7: SCHOLARSHIPS & CONCESSIONS                    */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="scholarships" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Award className="h-4 w-4 text-seneca-crimson" />
                    <span>Scholarships & Fee Concessions Manager</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define merit awards, sibling discounts, and financial assistance schemes.
                  </CardDescription>
                </div>
                <Button
                  onClick={addScholarship}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Scholarship</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-4">
                {data.scholarships.scholarships.map((sch, idx) => (
                  <div
                    key={sch.id || idx}
                    className="p-4 rounded-2xl border border-border/80 bg-card hover:border-seneca-crimson/30 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{sch.title}</span>
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                          {sch.discount}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Active</span>
                        <Switch
                          checked={sch.isActive !== false}
                          onCheckedChange={(checked: boolean) => {
                            const updated = [...data.scholarships.scholarships];
                            updated[idx].isActive = checked;
                            setData({ ...data, scholarships: { ...data.scholarships, scholarships: updated } });
                            setIsDraftModified(true);
                          }}
                        />
                        <Button
                          onClick={() => removeScholarship(idx)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg ml-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-7 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Scholarship Title
                        </label>
                        <Input
                          value={sch.title}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updated = [...data.scholarships.scholarships];
                            updated[idx].title = e.target.value;
                            setData({ ...data, scholarships: { ...data.scholarships, scholarships: updated } });
                            setIsDraftModified(true);
                          }}
                          placeholder="e.g. Karachi Board Merit Scholarship"
                          className="rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-5 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Discount / Waiver Tag
                        </label>
                        <Input
                          value={sch.discount}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updated = [...data.scholarships.scholarships];
                            updated[idx].discount = e.target.value;
                            setData({ ...data, scholarships: { ...data.scholarships, scholarships: updated } });
                            setIsDraftModified(true);
                          }}
                          placeholder="e.g. 100% Tuition Waiver"
                          className="rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Description
                      </label>
                      <Textarea
                        value={sch.desc}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                          const updated = [...data.scholarships.scholarships];
                          updated[idx].desc = e.target.value;
                          setData({ ...data, scholarships: { ...data.scholarships, scholarships: updated } });
                          setIsDraftModified(true);
                        }}
                        rows={2}
                        className="rounded-lg text-xs resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Eligibility Criteria Note
                      </label>
                      <Input
                        value={sch.eligibilityCriteria || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const updated = [...data.scholarships.scholarships];
                          updated[idx].eligibilityCriteria = e.target.value;
                          setData({ ...data, scholarships: { ...data.scholarships, scholarships: updated } });
                          setIsDraftModified(true);
                        }}
                        placeholder="e.g. Top 10 Board ranking verified via official gazette"
                        className="rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 8: ADMISSIONS FAQS                               */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="faqs" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-seneca-crimson" />
                    <span>Admissions Frequently Asked Questions</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Provide quick answers for registration, test patterns, and fee deposits.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={faqSearch}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFaqSearch(e.target.value)}
                    placeholder="Search FAQs..."
                    className="h-8 w-44 rounded-xl text-xs"
                  />
                  <Button
                    onClick={addFaq}
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add FAQ</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-4">
                {filteredFaqs.map((faq, idx) => (
                  <div
                    key={faq.id || idx}
                    className="p-4 rounded-2xl border border-border/80 bg-card hover:border-seneca-crimson/30 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          Q#{idx + 1}
                        </Badge>
                        <span className="text-xs font-bold text-foreground line-clamp-1">{faq.question}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Active</span>
                        <Switch
                          checked={faq.isActive !== false}
                          onCheckedChange={(checked: boolean) => {
                            const updated = [...data.faqs.items];
                            const realIdx = data.faqs.items.findIndex((f) => f.id === faq.id);
                            if (realIdx !== -1) {
                              updated[realIdx].isActive = checked;
                              setData({ ...data, faqs: { ...data.faqs, items: updated } });
                              setIsDraftModified(true);
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            const realIdx = data.faqs.items.findIndex((f) => f.id === faq.id);
                            if (realIdx !== -1) removeFaq(realIdx);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg ml-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-9 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Question
                        </label>
                        <Input
                          value={faq.question}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updated = [...data.faqs.items];
                            const realIdx = data.faqs.items.findIndex((f) => f.id === faq.id);
                            if (realIdx !== -1) {
                              updated[realIdx].question = e.target.value;
                              setData({ ...data, faqs: { ...data.faqs, items: updated } });
                              setIsDraftModified(true);
                            }
                          }}
                          placeholder="e.g. When do admissions open for the 2026–2027 academic session?"
                          className="rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Category
                        </label>
                        <Input
                          value={faq.category || "General"}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updated = [...data.faqs.items];
                            const realIdx = data.faqs.items.findIndex((f) => f.id === faq.id);
                            if (realIdx !== -1) {
                              updated[realIdx].category = e.target.value;
                              setData({ ...data, faqs: { ...data.faqs, items: updated } });
                              setIsDraftModified(true);
                            }
                          }}
                          placeholder="e.g. General, Fees, Assessment"
                          className="rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Answer
                      </label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                          const updated = [...data.faqs.items];
                          const realIdx = data.faqs.items.findIndex((f) => f.id === faq.id);
                          if (realIdx !== -1) {
                            updated[realIdx].answer = e.target.value;
                            setData({ ...data, faqs: { ...data.faqs, items: updated } });
                            setIsDraftModified(true);
                          }
                        }}
                        rows={3}
                        className="rounded-lg text-xs resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 9: ADMISSION TYPES                               */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="admissionTypes" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-seneca-crimson" />
                    <span>Admission Categories & Concession Types</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    These options populate the Admission Type selector in the online application modal.
                  </CardDescription>
                </div>
                <Button
                  onClick={addAdmissionType}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Type</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {(data.admissionTypes || []).map((type, idx) => (
                <div
                  key={type.id || idx}
                  className="p-4 rounded-2xl border border-border/80 bg-card hover:border-seneca-crimson/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{type.label}</span>
                      {type.concessionTag && (
                        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">
                          {type.concessionTag}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">Active</span>
                      <Switch
                        checked={type.isActive !== false}
                        onCheckedChange={(checked: boolean) => {
                          const updated = [...(data.admissionTypes || [])];
                          updated[idx].isActive = checked;
                          setData({ ...data, admissionTypes: updated });
                          setIsDraftModified(true);
                        }}
                      />
                      <Button
                        onClick={() => removeAdmissionType(idx)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Public Label</label>
                      <Input
                        value={type.label}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const updated = [...(data.admissionTypes || [])];
                          updated[idx].label = e.target.value;
                          setData({ ...data, admissionTypes: updated });
                          setIsDraftModified(true);
                        }}
                        className="rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Internal ID/Code</label>
                      <Input
                        value={type.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const updated = [...(data.admissionTypes || [])];
                          updated[idx].name = e.target.value;
                          setData({ ...data, admissionTypes: updated });
                          setIsDraftModified(true);
                        }}
                        className="rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Concession Tag</label>
                      <Input
                        value={type.concessionTag || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const updated = [...(data.admissionTypes || [])];
                          updated[idx].concessionTag = e.target.value;
                          setData({ ...data, admissionTypes: updated });
                          setIsDraftModified(true);
                        }}
                        placeholder="e.g. 20% Tuition Discount"
                        className="rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                    <Input
                      value={type.desc}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const updated = [...(data.admissionTypes || [])];
                        updated[idx].desc = e.target.value;
                        setData({ ...data, admissionTypes: updated });
                        setIsDraftModified(true);
                      }}
                      className="rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 10: TRANSPORT ROUTES                             */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="transportRoutes" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Bus className="h-4 w-4 text-seneca-crimson" />
                    <span>School Van & Transport Routes Configuration</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure pickup routes, designated zones, and monthly transportation fees.
                  </CardDescription>
                </div>
                <Button
                  onClick={addTransportRoute}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Route</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {(data.transportRoutes || []).map((route, idx) => (
                <div
                  key={route.id || idx}
                  className="p-4 rounded-2xl border border-border/80 bg-card hover:border-seneca-crimson/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {route.code}
                      </Badge>
                      <span className="text-xs font-bold text-foreground">{route.name}</span>
                      {route.fee && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                          {route.fee}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">Active</span>
                      <Switch
                        checked={route.isActive !== false}
                        onCheckedChange={(checked: boolean) => {
                          const updated = [...(data.transportRoutes || [])];
                          updated[idx].isActive = checked;
                          setData({ ...data, transportRoutes: updated });
                          setIsDraftModified(true);
                        }}
                      />
                      <Button
                        onClick={() => removeTransportRoute(idx)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Route Name</label>
                      <Input
                        value={route.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const updated = [...(data.transportRoutes || [])];
                          updated[idx].name = e.target.value;
                          setData({ ...data, transportRoutes: updated });
                          setIsDraftModified(true);
                        }}
                        className="rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Route Code</label>
                      <Input
                        value={route.code}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const updated = [...(data.transportRoutes || [])];
                          updated[idx].code = e.target.value;
                          setData({ ...data, transportRoutes: updated });
                          setIsDraftModified(true);
                        }}
                        className="rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Monthly Fee</label>
                      <Input
                        value={route.fee || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const updated = [...(data.transportRoutes || [])];
                          updated[idx].fee = e.target.value;
                          setData({ ...data, transportRoutes: updated });
                          setIsDraftModified(true);
                        }}
                        placeholder="e.g. Rs. 4,500 / month"
                        className="rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Areas Covered & Stops</label>
                    <Input
                      value={route.description}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const updated = [...(data.transportRoutes || [])];
                        updated[idx].description = e.target.value;
                        setData({ ...data, transportRoutes: updated });
                        setIsDraftModified(true);
                      }}
                      placeholder="e.g. Soldier Bazar • Garden East • Lasbela"
                      className="rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 11: SATURDAY ASSESSMENT HELPDESK                 */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="saturdayBooking" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-seneca-crimson" />
                    <span>Saturday Diagnostic Assessment & Campus Desk CTA</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Controls the bottom callout banner with campus location, timings, and phone hotlines.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Visible</span>
                  <Switch
                    checked={data.saturdayBooking.isVisible}
                    onCheckedChange={(checked: boolean) => {
                      setData({
                        ...data,
                        saturdayBooking: { ...data.saturdayBooking, isVisible: checked },
                      });
                      setIsDraftModified(true);
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Banner Eyebrow Badge</label>
                  <Input
                    value={data.saturdayBooking.badge}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        saturdayBooking: { ...data.saturdayBooking, badge: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    className="rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Schedule Badge</label>
                  <Input
                    value={data.saturdayBooking.scheduleBadge}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        saturdayBooking: { ...data.saturdayBooking, scheduleBadge: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="e.g. Every Saturday • 9:00 AM – 1:00 PM"
                    className="rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Headline Title</label>
                  <Input
                    value={data.saturdayBooking.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        saturdayBooking: { ...data.saturdayBooking, title: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="e.g. Visit Seneca Academy in"
                    className="rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Highlighted Location Accent</label>
                  <Input
                    value={data.saturdayBooking.highlightedLocation}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        saturdayBooking: { ...data.saturdayBooking, highlightedLocation: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="e.g. Soldier Bazar"
                    className="rounded-xl text-sm font-bold text-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Description</label>
                <Textarea
                  value={data.saturdayBooking.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setData({
                      ...data,
                      saturdayBooking: { ...data.saturdayBooking, description: e.target.value },
                    });
                    setIsDraftModified(true);
                  }}
                  rows={2}
                  className="rounded-xl text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Admissions Phone</span>
                  </label>
                  <Input
                    value={data.saturdayBooking.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        saturdayBooking: { ...data.saturdayBooking, phone: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="+92 335 7413777"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Office Hours</span>
                  </label>
                  <Input
                    value={data.saturdayBooking.officeHours}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        saturdayBooking: { ...data.saturdayBooking, officeHours: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Mon – Sat: 8:00 AM – 3:00 PM"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Campus Address</span>
                  </label>
                  <Input
                    value={data.saturdayBooking.address}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setData({
                        ...data,
                        saturdayBooking: { ...data.saturdayBooking, address: e.target.value },
                      });
                      setIsDraftModified(true);
                    }}
                    placeholder="Soldier Bazar, Garden East, Karachi"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: SECTIONS ORDER & OVERVIEW MAP                 */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="sections" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-seneca-crimson" />
                    <span>Admissions & Fees Page Structure & Component Links</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Reorder page modules, toggle visibility, or jump directly into any section editor tab.
                  </CardDescription>
                </div>
                <Button
                  onClick={handleResetDefaults}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Default Order</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {data.sectionsOrder.map((secKey, idx) => {
                const labelInfo = SECTION_LABELS[secKey] || {
                  title: secKey,
                  desc: "Admissions page module",
                  icon: LayoutTemplate,
                };
                const IconComponent = labelInfo.icon;

                let isVisible = true;
                if (secKey === "hero") isVisible = data.hero.isVisible;
                else if (secKey === "statusBanner") isVisible = data.statusBanner.isVisible;
                else if (secKey === "roadmap") isVisible = data.roadmap.isVisible;
                else if (secKey === "feeEstimator") isVisible = data.feeStructure?.isVisible !== false;
                else if (secKey === "eligibility") isVisible = data.eligibility.isVisible;
                else if (secKey === "documents") isVisible = data.documents.isVisible;
                else if (secKey === "scholarships") isVisible = data.scholarships.isVisible;
                else if (secKey === "faqs") isVisible = data.faqs.isVisible;
                else if (secKey === "saturdayBooking") isVisible = data.saturdayBooking.isVisible;

                const toggleVisibility = (checked: boolean) => {
                  const updated = { ...data };
                  if (secKey === "hero") updated.hero = { ...updated.hero, isVisible: checked };
                  else if (secKey === "statusBanner") updated.statusBanner = { ...updated.statusBanner, isVisible: checked };
                  else if (secKey === "roadmap") updated.roadmap = { ...updated.roadmap, isVisible: checked };
                  else if (secKey === "feeEstimator") updated.feeStructure = { ...updated.feeStructure, isVisible: checked };
                  else if (secKey === "eligibility") updated.eligibility = { ...updated.eligibility, isVisible: checked };
                  else if (secKey === "documents") updated.documents = { ...updated.documents, isVisible: checked };
                  else if (secKey === "scholarships") updated.scholarships = { ...updated.scholarships, isVisible: checked };
                  else if (secKey === "faqs") updated.faqs = { ...updated.faqs, isVisible: checked };
                  else if (secKey === "saturdayBooking") updated.saturdayBooking = { ...updated.saturdayBooking, isVisible: checked };
                  setData(updated);
                  setIsDraftModified(true);
                };

                return (
                  <div
                    key={secKey}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card hover:border-seneca-crimson/30 transition-all shadow-xs gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center border border-seneca-crimson/20 shrink-0">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{labelInfo.title}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-relaxed">{labelInfo.desc}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      {/* Jump to Edit Button */}
                      <Button
                        onClick={() => setActiveTab(secKey)}
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-xl text-xs font-bold gap-1 text-seneca-crimson hover:bg-seneca-crimson/10 border-seneca-crimson/30 px-3 cursor-pointer flex-1 sm:flex-initial"
                      >
                        <span>Edit Section</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>

                      {/* Visibility Switch */}
                      <div className="flex items-center gap-1.5 px-2">
                        <Switch
                          checked={isVisible}
                          onCheckedChange={toggleVisibility}
                        />
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-0.5">
                        <Button
                          onClick={() => moveSection(idx, "up")}
                          disabled={idx === 0}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Move Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => moveSection(idx, "down")}
                          disabled={idx === data.sectionsOrder.length - 1}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Move Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 13: SEO & METADATA                               */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="seo" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-seneca-crimson" />
                <span>Search Engine Optimization & Social Sharing</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Enhance discovery across Google Search, WhatsApp link previews, and educational directories.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Meta Title</label>
                <Input
                  value={data.seo.metaTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setData({ ...data, seo: { ...data.seo, metaTitle: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Meta Description</label>
                <Textarea
                  value={data.seo.metaDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setData({ ...data, seo: { ...data.seo, metaDescription: e.target.value } });
                    setIsDraftModified(true);
                  }}
                  rows={3}
                  className="rounded-xl text-sm resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Keywords (comma separated)</label>
                <Input
                  value={data.seo.keywords?.join(", ") || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const kws = e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean);
                    setData({ ...data, seo: { ...data.seo, keywords: kws } });
                    setIsDraftModified(true);
                  }}
                  placeholder="e.g. Seneca Academy admissions, Karachi school fees, Matric admission"
                  className="rounded-xl text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 14: LIVE INTERACTIVE PREVIEW TAB                 */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="preview" className="space-y-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-seneca-amber/10 border border-seneca-amber/30 text-xs text-seneca-amber flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold">
              <Eye className="h-4 w-4 shrink-0" />
              <span>Live In-Editor Admissions Page Preview</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap w-full sm:w-auto">
              {/* Device Mode Switcher */}
              <div className="flex items-center p-0.5 rounded-xl bg-background border border-border/80 text-foreground">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    previewDevice === "desktop" ? "bg-seneca-crimson text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Desktop View (100%)"
                >
                  <Laptop className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    previewDevice === "tablet" ? "bg-seneca-crimson text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    previewDevice === "mobile" ? "bg-seneca-crimson text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button onClick={handleSaveDraft} size="sm" variant="outline" className="rounded-xl text-xs h-8">
                Save Draft
              </Button>
              <Button onClick={handlePublish} size="sm" className="rounded-xl text-xs h-8 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white">
                Publish Live
              </Button>
            </div>
          </div>

          <div className="flex justify-center bg-muted/20 p-2 sm:p-4 rounded-3xl border border-border/80 overflow-x-auto">
            <div
              className={`transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden border border-border bg-background shadow-2xl ${
                previewDevice === "desktop"
                  ? "w-full"
                  : previewDevice === "tablet"
                  ? "w-[768px]"
                  : "w-[375px]"
              }`}
            >
              {data.sectionsOrder.map((secKey) => {
                switch (secKey) {
                  case "hero":
                    return <AdmissionsHeroSection key="hero" hero={data.hero} globalSettings={data.globalSettings} />;
                  case "statusBanner":
                    return (
                      <AdmissionsStatusBanner
                        key="statusBanner"
                        admissionsOpen={data.globalSettings.admissionsOpen}
                        admissionsSession={data.globalSettings.admissionsSession}
                        admissionsDeadline={data.globalSettings.admissionsDeadline}
                        admissionsNotice={data.globalSettings.admissionsNotice}
                        admissionsClosedNotice={data.globalSettings.admissionsClosedNotice}
                        admissionsAnnouncement={data.globalSettings.admissionsAnnouncement}
                        statusBanner={data.statusBanner}
                      />
                    );
                  case "roadmap":
                    return <AdmissionRoadmapSection key="roadmap" roadmap={data.roadmap} />;
                  case "feeEstimator":
                    return <FeeEstimatorSection key="feeEstimator" feeStructure={data.feeStructure} />;
                  case "eligibility":
                    return <AgeEligibilityTableSection key="eligibility" eligibility={data.eligibility} />;
                  case "documents":
                    return <RequiredDocumentsSection key="documents" documents={data.documents} />;
                  case "scholarships":
                    return <ScholarshipsSection key="scholarships" scholarships={data.scholarships} />;
                  case "faqs":
                    return <AdmissionsFaqSection key="faqs" faqs={data.faqs} />;
                  case "saturdayBooking":
                    return <SaturdayBookingCta key="saturdayBooking" saturdayBooking={data.saturdayBooking} />;
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
