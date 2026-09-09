"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink,
  ChevronRight,
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  Star,
  Award,
  Sliders,
  RefreshCw,
  Send,
  Loader2,
  Check,
  Globe,
  Layers,
  HeartHandshake,
  Search,
  BookOpen,
  GraduationCap,
  CreditCard,
  Building2,
  User,
  ShieldCheck,
  EyeOff,
  Edit,
  ThumbsUp,
  Filter,
  X,
  MessageSquareQuote,
  Settings2,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { IconPicker } from "@/components/ui/icon-picker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DEFAULT_REVIEWS_PAGE_DATA,
  IReviewsPageData,
  IReviewsCategory,
  IReviewsRole,
  IReviewMetricCard,
  ITrustBadgeItem,
} from "@/lib/db/reviews-page-defaults";

// Public Preview Component
import FeedbackHeroSection from "@/components/public/feedback/FeedbackHeroSection";
import FeedbackList from "@/components/public/feedback/FeedbackList";

interface FeedbackItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  relationship?: string;
  studentGrade?: string;
  rating: number;
  category: string;
  title: string;
  comment: string;
  recommend?: boolean;
  avatarUrl?: string;
  status: "approved" | "pending" | "rejected" | "hidden";
  isFeatured?: boolean;
  likesCount?: number;
  createdAt: string;
}

export default function WebsiteReviewsPageManager() {
  const [data, setData] = useState<IReviewsPageData>(DEFAULT_REVIEWS_PAGE_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraftModified, setIsDraftModified] = useState(false);
  const [activeTab, setActiveTab] = useState("moderation");

  // Moderation state
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [moderationSearch, setModerationSearch] = useState("");
  const [moderationStatus, setModerationStatus] = useState("all");
  const [moderationCategory, setModerationCategory] = useState("all");
  const [moderationRole, setModerationRole] = useState("all");
  const [adminStats, setAdminStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    hidden: 0,
    featured: 0,
  });

  // Edit / Add modal state
  const [editingFeedback, setEditingFeedback] = useState<FeedbackItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New review form
  const [newReviewForm, setNewReviewForm] = useState({
    name: "",
    email: "",
    role: "Parent",
    relationship: "",
    studentGrade: "",
    rating: 5,
    category: "Academic Excellence",
    title: "",
    comment: "",
    recommend: true,
    avatarUrl: "",
    status: "approved" as "approved" | "hidden" | "pending",
    isFeatured: false,
  });

  // Load Page CMS settings
  const loadPageData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/website/reviews?preview=true");
      const json = await res.json();
      if (json?.data?.page) {
        setData({
          ...DEFAULT_REVIEWS_PAGE_DATA,
          ...json.data.page,
          sectionsOrder: json.data.page.sectionsOrder || DEFAULT_REVIEWS_PAGE_DATA.sectionsOrder,
          hero: { ...DEFAULT_REVIEWS_PAGE_DATA.hero, ...(json.data.page.hero || {}) },
          stats: { ...DEFAULT_REVIEWS_PAGE_DATA.stats, ...(json.data.page.stats || {}) },
          categories:
            json.data.page.categories && json.data.page.categories.length > 0
              ? json.data.page.categories
              : DEFAULT_REVIEWS_PAGE_DATA.categories,
          roles:
            json.data.page.roles && json.data.page.roles.length > 0
              ? json.data.page.roles
              : DEFAULT_REVIEWS_PAGE_DATA.roles,
          submissionSettings: {
            ...DEFAULT_REVIEWS_PAGE_DATA.submissionSettings,
            ...(json.data.page.submissionSettings || {}),
          },
          ctaBanner: { ...DEFAULT_REVIEWS_PAGE_DATA.ctaBanner, ...(json.data.page.ctaBanner || {}) },
          seo: { ...DEFAULT_REVIEWS_PAGE_DATA.seo, ...(json.data.page.seo || {}) },
        });
        if (json.data.isDraft) {
          setIsDraftModified(true);
        }
      }
    } catch (err) {
      console.error("Failed to load Reviews CMS configuration:", err);
      toast.error("Failed to load Reviews CMS configuration");
    } finally {
      setLoading(false);
    }
  };

  // Load feedbacks for moderation
  const loadFeedbacks = useCallback(async () => {
    try {
      setFeedbacksLoading(true);
      const params = new URLSearchParams();
      params.set("limit", "150");
      if (moderationStatus !== "all") params.set("status", moderationStatus);
      if (moderationCategory !== "all") params.set("category", moderationCategory);
      if (moderationRole !== "all") params.set("role", moderationRole);
      if (moderationSearch.trim()) params.set("search", moderationSearch.trim());

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.feedbacks) {
          setFeedbacks(json.data.feedbacks);
          if (json.data.stats?.adminCounts) {
            setAdminStats(json.data.stats.adminCounts);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
      toast.error("Failed to load reviews list");
    } finally {
      setFeedbacksLoading(false);
    }
  }, [moderationStatus, moderationCategory, moderationRole, moderationSearch]);

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  // Quick toggle status (hide/unhide)
  const handleToggleStatus = async (item: FeedbackItem) => {
    const newStatus = item.status === "approved" ? "hidden" : "approved";
    // Optimistic UI update
    setFeedbacks((prev) =>
      prev.map((f) => (f._id === item._id ? { ...f, status: newStatus } : f))
    );

    try {
      const res = await fetch(`/api/feedback/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update review status");
      }
      toast.success(
        newStatus === "approved"
          ? `Review by "${item.name}" is now live on the public site.`
          : `Review by "${item.name}" is now hidden from the public site.`
      );
      loadFeedbacks();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
      loadFeedbacks();
    }
  };

  // Quick toggle featured
  const handleToggleFeatured = async (item: FeedbackItem) => {
    const newFeatured = !item.isFeatured;
    // Optimistic UI update
    setFeedbacks((prev) =>
      prev.map((f) => (f._id === item._id ? { ...f, isFeatured: newFeatured } : f))
    );

    try {
      const res = await fetch(`/api/feedback/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: newFeatured }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to toggle featured status");
      }
      toast.success(
        newFeatured
          ? `Featured "${item.name}" review on top spotlight!`
          : `Unfeatured review.`
      );
      loadFeedbacks();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle featured");
      loadFeedbacks();
    }
  };

  // Delete review
  const handleDeleteFeedback = async () => {
    if (!deletingFeedbackId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/feedback/${deletingFeedbackId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete review");
      }
      toast.success("Review deleted permanently.");
      setDeletingFeedbackId(null);
      loadFeedbacks();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review");
    } finally {
      setActionLoading(false);
    }
  };

  // Save edit review
  const handleSaveEditedFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/feedback/${editingFeedback._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFeedback),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update review details");
      }
      toast.success("Review updated successfully!");
      setIsEditModalOpen(false);
      setEditingFeedback(null);
      loadFeedbacks();
    } catch (err: any) {
      toast.error(err.message || "Failed to save edits");
    } finally {
      setActionLoading(false);
    }
  };

  // Add new official review
  const handleCreateOfficialReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.name.trim() || !newReviewForm.title.trim() || !newReviewForm.comment.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newReviewForm,
          email: newReviewForm.email.trim() || "official.review@seneca.edu.pk",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create review");
      }
      toast.success("New official community review added successfully!");
      setIsAddModalOpen(false);
      setNewReviewForm({
        name: "",
        email: "",
        role: "Parent",
        relationship: "",
        studentGrade: "",
        rating: 5,
        category: "Academic Excellence",
        title: "",
        comment: "",
        recommend: true,
        avatarUrl: "",
        status: "approved",
        isFeatured: false,
      });
      loadFeedbacks();
    } catch (err: any) {
      toast.error(err.message || "Failed to create review");
    } finally {
      setActionLoading(false);
    }
  };

  // Save CMS Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/website/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          saveAsDraft: true,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save draft");
      }
      setIsDraftModified(true);
      toast.success("Reviews & Feedback page draft saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  // Publish CMS Live
  const handlePublishLive = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/website/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to publish page");
      }
      setIsDraftModified(false);
      toast.success("Community Reviews & Feedback page published to live website!");
      loadPageData();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish live");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <Loader2 className="h-9 w-9 animate-spin text-seneca-crimson dark:text-seneca-amber" />
        <p className="text-sm font-semibold text-muted-foreground">
          Loading Reviews &amp; Feedback CMS...
        </p>
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
        <span className="text-foreground font-bold">Community Reviews &amp; Feedbacks</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="h-9 w-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center border border-pink-500/20">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground tracking-tight">
              Community Reviews &amp; Feedback Manager
            </h1>
            {isDraftModified ? (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-extrabold animate-pulse">
                Draft Changes Pending
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-extrabold">
                Live on Public
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Moderate parent testimonials, hide/unhide reviews from the public site, manage 5-star ratings, and customize page content.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold gap-1.5 border-border/80"
          >
            <Link href="/feedback" target="_blank">
              <Eye className="h-3.5 w-3.5" />
              <span>View Public Page</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          </Button>

          <Button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            variant="outline"
            size="sm"
            className="rounded-xl font-bold gap-1.5 border-seneca-amber/40 hover:bg-seneca-amber/10"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Draft</span>
          </Button>

          <Button
            onClick={handlePublishLive}
            disabled={saving || publishing}
            size="sm"
            className="rounded-xl font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white shadow-sm"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Publish Live</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs (Non-scrollable flex-wrapping) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/90 border border-border/80 p-1 rounded-2xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="moderation" className="rounded-xl text-xs font-bold gap-1.5 py-2 px-3.5">
            <ShieldCheck className="h-3.5 w-3.5 text-seneca-crimson" />
            <span>Reviews Moderation</span>
            {adminStats.pending > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </TabsTrigger>

          <TabsTrigger value="hero" className="rounded-xl text-xs font-bold gap-1.5 py-2 px-3.5">
            <LayoutTemplate className="h-3.5 w-3.5 text-blue-500" />
            <span>Hero Banner</span>
          </TabsTrigger>

          <TabsTrigger value="stats" className="rounded-xl text-xs font-bold gap-1.5 py-2 px-3.5">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>Satisfaction Metrics</span>
          </TabsTrigger>

          <TabsTrigger value="categories" className="rounded-xl text-xs font-bold gap-1.5 py-2 px-3.5">
            <Layers className="h-3.5 w-3.5 text-emerald-500" />
            <span>Categories &amp; Roles</span>
          </TabsTrigger>

          <TabsTrigger value="settings" className="rounded-xl text-xs font-bold gap-1.5 py-2 px-3.5">
            <Settings2 className="h-3.5 w-3.5 text-purple-500" />
            <span>Form Settings</span>
          </TabsTrigger>

          <TabsTrigger value="cta" className="rounded-xl text-xs font-bold gap-1.5 py-2 px-3.5">
            <HeartHandshake className="h-3.5 w-3.5 text-rose-500" />
            <span>CTA Banner</span>
          </TabsTrigger>

          <TabsTrigger value="seo" className="rounded-xl text-xs font-bold gap-1.5 py-2 px-3.5">
            <Globe className="h-3.5 w-3.5 text-cyan-500" />
            <span>SEO &amp; Metadata</span>
          </TabsTrigger>

          <TabsTrigger value="preview" className="rounded-xl text-xs font-bold gap-1.5 py-2 px-3.5">
            <Eye className="h-3.5 w-3.5 text-seneca-amber" />
            <span>Live Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: REVIEWS MODERATION & MANAGEMENT */}
        <TabsContent value="moderation" className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            <div className="p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card/80 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Reviews</span>
              <p className="text-lg sm:text-xl font-extrabold font-heading text-foreground">{adminStats.total}</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Live (Approved)</span>
              <p className="text-lg sm:text-xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">{adminStats.approved}</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Pending Approval</span>
              <p className="text-lg sm:text-xl font-extrabold font-heading text-amber-600 dark:text-amber-400">{adminStats.pending}</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-500/20 bg-slate-500/5 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Hidden from Public</span>
              <p className="text-lg sm:text-xl font-extrabold font-heading text-foreground">{adminStats.hidden}</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl border border-pink-500/20 bg-pink-500/5 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase">Featured Spotlight</span>
              <p className="text-lg sm:text-xl font-extrabold font-heading text-pink-600 dark:text-pink-400">{adminStats.featured}</p>
            </div>
          </div>

          {/* Search, Status Filter & Action Controls */}
          <Card className="rounded-3xl border-border/80">
            <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Community Reviews List &amp; Moderation</CardTitle>
                <CardDescription className="text-xs">
                  Review submissions from parents and students. Toggle visibility, edit ratings, or add official testimonials.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  size="sm"
                  className="rounded-xl font-bold text-xs gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white flex-1 sm:flex-initial"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Official Review</span>
                </Button>

                <Button
                  onClick={loadFeedbacks}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1"
                  title="Refresh list"
                >
                  <RefreshCw className={feedbacksLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1 border-t border-border/60">
                <div className="relative flex-1 w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={moderationSearch}
                    onChange={(e) => setModerationSearch(e.target.value)}
                    placeholder="Search by name, email, keyword..."
                    className="pl-9 h-9 rounded-xl text-xs bg-muted/30 w-full"
                  />
                  {moderationSearch && (
                    <button
                      onClick={() => setModerationSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/80 flex-wrap sm:flex-nowrap flex-1 sm:flex-initial">
                    {[
                      { id: "all", label: "All" },
                      { id: "approved", label: "Live" },
                      { id: "pending", label: "Pending" },
                      { id: "hidden", label: "Hidden" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setModerationStatus(st.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all",
                          moderationStatus === st.id
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Category select */}
                  <select
                    value={moderationCategory}
                    onChange={(e) => setModerationCategory(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-card border border-border/80 text-xs font-medium text-foreground focus:outline-none flex-1 sm:flex-initial"
                  >
                    <option value="all">All Categories</option>
                    {data.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              {feedbacksLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-seneca-crimson" />
                  <p className="text-xs">Loading reviews...</p>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <MessageSquareQuote className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <h4 className="text-sm font-bold text-foreground">No Reviews Found</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {feedbacks.length === 0
                      ? "There are currently no reviews in the system. Click 'Add Official Review' to post the first testimonial."
                      : "No reviews match your current filter and search query."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {feedbacks.map((item) => {
                    const isLive = item.status === "approved";
                    const isHidden = item.status === "hidden";
                    const isPending = item.status === "pending";

                    return (
                      <div
                        key={item._id}
                        className={cn(
                          "p-4 sm:p-5 rounded-2xl border transition-all duration-200 space-y-3",
                          isLive
                            ? "bg-card/90 border-border/80"
                            : isHidden
                            ? "bg-muted/30 border-dashed border-border opacity-85"
                            : "bg-amber-500/5 border-amber-500/30"
                        )}
                      >
                        {/* Top Header of Review Card */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {item.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-heading font-bold text-sm text-foreground truncate">
                                  {item.name}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-semibold text-muted-foreground py-0"
                                >
                                  {item.role}
                                </Badge>
                                {item.relationship && (
                                  <span className="text-[11px] text-muted-foreground truncate">
                                    • {item.relationship}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground/80 break-all">{item.email}</span>
                            </div>
                          </div>

                          {/* Status and Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                            <div className="flex items-center gap-2">
                              {/* Live status badge */}
                              {isLive && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                                  Live on Public
                                </Badge>
                              )}
                              {isHidden && (
                                <Badge className="bg-slate-500/10 text-muted-foreground border-slate-500/30 text-[10px] font-bold">
                                  Hidden
                                </Badge>
                              )}
                              {isPending && (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
                                  Pending Approval
                                </Badge>
                              )}

                              {/* Show/Hide Toggle Switch */}
                              <div className="flex items-center gap-1.5 pl-2 border-l border-border/80">
                                <span className="text-[11px] font-semibold text-muted-foreground hidden sm:inline">
                                  {isLive ? "Visible" : "Hidden"}
                                </span>
                                <Switch
                                  checked={isLive}
                                  onCheckedChange={() => handleToggleStatus(item)}
                                  title={isLive ? "Click to hide from public" : "Click to show on public"}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Star Featured Button */}
                              <Button
                                type="button"
                                onClick={() => handleToggleFeatured(item)}
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "h-8 px-2.5 rounded-xl text-xs font-semibold gap-1",
                                  item.isFeatured
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                                )}
                                title={item.isFeatured ? "Featured on spotlight" : "Click to feature"}
                              >
                                <Star className={cn("h-3.5 w-3.5", item.isFeatured && "fill-current")} />
                                <span className="hidden md:inline">
                                  {item.isFeatured ? "Featured" : "Feature"}
                                </span>
                              </Button>

                              {/* Edit Button */}
                              <Button
                                type="button"
                                onClick={() => {
                                  setEditingFeedback(item);
                                  setIsEditModalOpen(true);
                                }}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground"
                                title="Edit review details"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>

                              {/* Delete Button */}
                              <Button
                                type="button"
                                onClick={() => setDeletingFeedbackId(item._id)}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 border-border"
                                title="Delete review permanently"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="space-y-1.5 sm:pl-12 pl-0">
                          <div className="flex items-center gap-2 flex-wrap justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      i < item.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-muted text-muted-foreground/30"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                &ldquo;{item.title}&rdquo;
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.comment}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground flex-wrap">
                            <span className="inline-flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{item.likesCount || 0} helpful votes</span>
                            </span>
                            <span className="text-border">•</span>
                            <span>Category: {item.category}</span>
                            {item.recommend && (
                              <>
                                <span className="text-border">•</span>
                                <span className="text-emerald-500 font-semibold">Recommends Seneca</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: HERO BANNER */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="rounded-3xl border-border/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Hero Showcase Banner</CardTitle>
              <CardDescription className="text-xs">
                Configure the top title, highlight gradient phrase, subtitle, and trust badges shown on `/feedback`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Top Badge Tag</label>
                  <Input
                    value={data.hero.badge}
                    onChange={(e) =>
                      setData({ ...data, hero: { ...data.hero, badge: e.target.value } })
                    }
                    className="rounded-xl text-xs"
                    placeholder="e.g. Voice of Our Seneca Community"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Primary Button Text</label>
                  <Input
                    value={data.hero.primaryButtonText}
                    onChange={(e) =>
                      setData({ ...data, hero: { ...data.hero, primaryButtonText: e.target.value } })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Main Headline</label>
                  <Input
                    value={data.hero.title}
                    onChange={(e) =>
                      setData({ ...data, hero: { ...data.hero, title: e.target.value } })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Gradient Highlight Text</label>
                  <Input
                    value={data.hero.titleGradient}
                    onChange={(e) =>
                      setData({ ...data, hero: { ...data.hero, titleGradient: e.target.value } })
                    }
                    className="rounded-xl text-xs text-seneca-crimson font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Hero Subtitle</label>
                <Textarea
                  value={data.hero.subtitle}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })
                  }
                  rows={3}
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold">Trust Proof Badges</label>
                  <Button
                    type="button"
                    onClick={() => {
                      const updated = [
                        ...data.hero.trustBadges,
                        { icon: "ShieldCheck", text: "New Trust Badge" },
                      ];
                      setData({ ...data, hero: { ...data.hero, trustBadges: updated } });
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-semibold gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Badge
                  </Button>
                </div>

                <div className="space-y-2">
                  {data.hero.trustBadges.map((badge, bIdx) => (
                    <div key={bIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border bg-muted/20">
                      <div className="w-full sm:w-44">
                        <IconPicker
                          value={badge.icon}
                          onChange={(iconName) => {
                            const updated = [...data.hero.trustBadges];
                            updated[bIdx].icon = iconName;
                            setData({ ...data, hero: { ...data.hero, trustBadges: updated } });
                          }}
                        />
                      </div>
                      <Input
                        value={badge.text}
                        onChange={(e) => {
                          const updated = [...data.hero.trustBadges];
                          updated[bIdx].text = e.target.value;
                          setData({ ...data, hero: { ...data.hero, trustBadges: updated } });
                        }}
                        className="rounded-xl text-xs flex-1"
                        placeholder="Badge text"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const updated = data.hero.trustBadges.filter((_, i) => i !== bIdx);
                          setData({ ...data, hero: { ...data.hero, trustBadges: updated } });
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 self-end sm:self-auto"
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

        {/* TAB 3: SATISFACTION METRICS */}
        <TabsContent value="stats" className="space-y-6">
          <Card className="rounded-3xl border-border/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Satisfaction Metrics &amp; Proof Points</CardTitle>
              <CardDescription className="text-xs">
                Manage overall satisfaction percentages, average rating scores, and highlight cards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Overall Rating Score</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={data.stats.score}
                    onChange={(e) =>
                      setData({
                        ...data,
                        stats: { ...data.stats, score: parseFloat(e.target.value) || 4.9 },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Recommendation Rate (%)</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={data.stats.recommendRate}
                    onChange={(e) =>
                      setData({
                        ...data,
                        stats: { ...data.stats, recommendRate: parseInt(e.target.value) || 98 },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Total Reviews Caption</label>
                  <Input
                    value={data.stats.totalReviewsText}
                    onChange={(e) =>
                      setData({
                        ...data,
                        stats: { ...data.stats, totalReviewsText: e.target.value },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Metric Highlight Cards */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold">Institutional Highlight Cards</label>
                  <Button
                    type="button"
                    onClick={() => {
                      const newCard: IReviewMetricCard = {
                        id: `metric-${Date.now()}`,
                        title: "New Metric Title",
                        value: "99%",
                        description: "Description of institutional achievement.",
                        icon: "Users",
                        badge: "Verified",
                      };
                      setData({
                        ...data,
                        stats: { ...data.stats, metricCards: [...data.stats.metricCards, newCard] },
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-semibold gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Metric Card
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.stats.metricCards.map((card, cIdx) => (
                    <div key={card.id || cIdx} className="p-4 rounded-2xl border bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-32">
                          <IconPicker
                            value={card.icon}
                            onChange={(iconName) => {
                              const updated = [...data.stats.metricCards];
                              updated[cIdx].icon = iconName;
                              setData({ ...data, stats: { ...data.stats, metricCards: updated } });
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const updated = data.stats.metricCards.filter((_, i) => i !== cIdx);
                            setData({ ...data, stats: { ...data.stats, metricCards: updated } });
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
                        <Input
                          value={card.title}
                          onChange={(e) => {
                            const updated = [...data.stats.metricCards];
                            updated[cIdx].title = e.target.value;
                            setData({ ...data, stats: { ...data.stats, metricCards: updated } });
                          }}
                          className="rounded-xl text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Value</label>
                        <Input
                          value={card.value}
                          onChange={(e) => {
                            const updated = [...data.stats.metricCards];
                            updated[cIdx].value = e.target.value;
                            setData({ ...data, stats: { ...data.stats, metricCards: updated } });
                          }}
                          className="rounded-xl text-xs font-extrabold text-seneca-crimson"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                        <Textarea
                          value={card.description}
                          onChange={(e) => {
                            const updated = [...data.stats.metricCards];
                            updated[cIdx].description = e.target.value;
                            setData({ ...data, stats: { ...data.stats, metricCards: updated } });
                          }}
                          rows={2}
                          className="rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: CATEGORIES & ROLES */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categories */}
            <Card className="rounded-3xl border-border/80">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Feedback Categories</CardTitle>
                  <CardDescription className="text-xs">Focus areas for community ratings.</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    const newCat: IReviewsCategory = {
                      id: `Category-${Date.now()}`,
                      label: "New Category",
                      icon: "Layers",
                      description: "Description of focus area",
                      isActive: true,
                    };
                    setData({ ...data, categories: [...data.categories, newCat] });
                  }}
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Category
                </Button>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {data.categories.map((cat, idx) => (
                  <div key={cat.id || idx} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="w-full sm:w-32">
                        <IconPicker
                          value={cat.icon}
                          onChange={(iconName) => {
                            const updated = [...data.categories];
                            updated[idx].icon = iconName;
                            setData({ ...data, categories: updated });
                          }}
                        />
                      </div>
                      <Input
                        value={cat.label}
                        onChange={(e) => {
                          const updated = [...data.categories];
                          updated[idx].label = e.target.value;
                          setData({ ...data, categories: updated });
                        }}
                        className="rounded-xl text-xs font-bold flex-1"
                      />
                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="sm:hidden font-medium">Active:</span>
                          <Switch
                            checked={cat.isActive}
                            onCheckedChange={(val) => {
                              const updated = [...data.categories];
                              updated[idx].isActive = val;
                              setData({ ...data, categories: updated });
                            }}
                            title="Active toggle"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const updated = data.categories.filter((_, i) => i !== idx);
                            setData({ ...data, categories: updated });
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Roles */}
            <Card className="rounded-3xl border-border/80">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Reviewer Roles</CardTitle>
                  <CardDescription className="text-xs">Allowed affiliation roles on submit modal.</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    const newRole: IReviewsRole = {
                      id: `Role-${Date.now()}`,
                      label: "New Role",
                      icon: "Users",
                      isActive: true,
                    };
                    setData({ ...data, roles: [...data.roles, newRole] });
                  }}
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Role
                </Button>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {data.roles.map((r, idx) => (
                  <div key={r.id || idx} className="p-3 rounded-xl border bg-muted/20">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="w-full sm:w-32">
                        <IconPicker
                          value={r.icon}
                          onChange={(iconName) => {
                            const updated = [...data.roles];
                            updated[idx].icon = iconName;
                            setData({ ...data, roles: updated });
                          }}
                        />
                      </div>
                      <Input
                        value={r.label}
                        onChange={(e) => {
                          const updated = [...data.roles];
                          updated[idx].label = e.target.value;
                          setData({ ...data, roles: updated });
                        }}
                        className="rounded-xl text-xs font-bold flex-1"
                      />
                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="sm:hidden font-medium">Active:</span>
                          <Switch
                            checked={r.isActive}
                            onCheckedChange={(val) => {
                              const updated = [...data.roles];
                              updated[idx].isActive = val;
                              setData({ ...data, roles: updated });
                            }}
                            title="Active toggle"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const updated = data.roles.filter((_, i) => i !== idx);
                            setData({ ...data, roles: updated });
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 5: SUBMISSION SETTINGS */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="rounded-3xl border-border/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Public Review Submission Policy</CardTitle>
              <CardDescription className="text-xs">
                Control whether visitors can submit reviews, auto-approval vs principal moderation, and modal texts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border bg-muted/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground">Allow Public Submissions</span>
                    <p className="text-[11px] text-muted-foreground">
                      When enabled, parents and students can write reviews on the public site.
                    </p>
                  </div>
                  <Switch
                    checked={data.submissionSettings.allowPublicSubmissions}
                    onCheckedChange={(val) =>
                      setData({
                        ...data,
                        submissionSettings: {
                          ...data.submissionSettings,
                          allowPublicSubmissions: val,
                        },
                      })
                    }
                  />
                </div>

                <div className="p-4 rounded-2xl border bg-muted/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground">Require Principal Moderation</span>
                    <p className="text-[11px] text-muted-foreground">
                      If enabled, new submissions are saved as &ldquo;pending&rdquo; until approved by admin.
                    </p>
                  </div>
                  <Switch
                    checked={data.submissionSettings.requireModeration}
                    onCheckedChange={(val) =>
                      setData({
                        ...data,
                        submissionSettings: {
                          ...data.submissionSettings,
                          requireModeration: val,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Modal Title</label>
                  <Input
                    value={data.submissionSettings.modalTitle}
                    onChange={(e) =>
                      setData({
                        ...data,
                        submissionSettings: {
                          ...data.submissionSettings,
                          modalTitle: e.target.value,
                        },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Modal Subtitle</label>
                  <Input
                    value={data.submissionSettings.modalSubtitle}
                    onChange={(e) =>
                      setData({
                        ...data,
                        submissionSettings: {
                          ...data.submissionSettings,
                          modalSubtitle: e.target.value,
                        },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Submission Guidelines Text</label>
                <Textarea
                  value={data.submissionSettings.guidelinesText}
                  onChange={(e) =>
                    setData({
                      ...data,
                      submissionSettings: {
                        ...data.submissionSettings,
                        guidelinesText: e.target.value,
                      },
                    })
                  }
                  rows={2}
                  className="rounded-xl text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: CTA BANNER */}
        <TabsContent value="cta" className="space-y-6">
          <Card className="rounded-3xl border-border/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Bottom Call to Action Banner</CardTitle>
              <CardDescription className="text-xs">
                Encourages parents to contribute their feedback or schedule a visit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Banner Badge</label>
                  <Input
                    value={data.ctaBanner.badge}
                    onChange={(e) =>
                      setData({ ...data, ctaBanner: { ...data.ctaBanner, badge: e.target.value } })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Headline</label>
                  <Input
                    value={data.ctaBanner.headline}
                    onChange={(e) =>
                      setData({ ...data, ctaBanner: { ...data.ctaBanner, headline: e.target.value } })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Description</label>
                <Textarea
                  value={data.ctaBanner.description}
                  onChange={(e) =>
                    setData({ ...data, ctaBanner: { ...data.ctaBanner, description: e.target.value } })
                  }
                  rows={2}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Primary Button Text</label>
                  <Input
                    value={data.ctaBanner.primaryButtonText}
                    onChange={(e) =>
                      setData({
                        ...data,
                        ctaBanner: { ...data.ctaBanner, primaryButtonText: e.target.value },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Secondary Button Link</label>
                  <Input
                    value={data.ctaBanner.secondaryButtonLink}
                    onChange={(e) =>
                      setData({
                        ...data,
                        ctaBanner: { ...data.ctaBanner, secondaryButtonLink: e.target.value },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 7: SEO & METADATA */}
        <TabsContent value="seo" className="space-y-6">
          <Card className="rounded-3xl border-border/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Search Engine Optimization &amp; Social Meta</CardTitle>
              <CardDescription className="text-xs">
                Enhance organic Google rankings and social share previews for `/feedback`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold">Meta Title</label>
                <Input
                  value={data.seo.metaTitle}
                  onChange={(e) =>
                    setData({ ...data, seo: { ...data.seo, metaTitle: e.target.value } })
                  }
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Meta Description</label>
                <Textarea
                  value={data.seo.metaDescription}
                  onChange={(e) =>
                    setData({ ...data, seo: { ...data.seo, metaDescription: e.target.value } })
                  }
                  rows={3}
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Keywords (Comma separated)</label>
                <Input
                  value={data.seo.keywords?.join(", ")}
                  onChange={(e) =>
                    setData({
                      ...data,
                      seo: {
                        ...data.seo,
                        keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  className="rounded-xl text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 8: LIVE PREVIEW */}
        <TabsContent value="preview" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-foreground">Live Interactive Preview</span>
              <Badge variant="outline" className="text-[11px] font-mono font-semibold text-muted-foreground py-0.5">
                /feedback
              </Badge>
              <span className="text-[11px] text-muted-foreground hidden md:inline">
                • Real-time representation with current approved reviews
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 border-border/80 hover:bg-muted"
              >
                <Link href="/feedback" target="_blank">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in Public Tab</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-background shadow-xl overflow-hidden">
            {/* Simulated browser window address bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/60 border-b border-border/70 text-xs text-muted-foreground select-none">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80 inline-block" />
              </div>
              <div className="flex items-center gap-1.5 bg-background/80 border border-border/70 rounded-lg px-3 py-1 text-[11px] font-mono text-muted-foreground max-w-xs sm:max-w-md w-full justify-center shadow-xs">
                <Lock className="h-3 w-3 text-emerald-500 shrink-0" />
                <span className="truncate">senecaschool.edu.pk/feedback</span>
              </div>
              <div className="w-8" />
            </div>

            <div className="w-full">
              <FeedbackHeroSection
                heroData={data.hero}
                statsData={data.stats}
                onOpenSubmitModal={() => toast.info("Submit modal is interactive on public website.")}
              />

              <FeedbackList
                initialFeedbacks={feedbacks.filter((f) => f.status === "approved")}
                onOpenSubmitModal={() => toast.info("Submit modal is interactive on public website.")}
                categories={data.categories}
                roles={data.roles}
                ctaData={data.ctaBanner}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* EDIT FEEDBACK MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Review Details</DialogTitle>
            <DialogDescription className="text-xs">
              Modify reviewer details, rating, category, or status.
            </DialogDescription>
          </DialogHeader>

          {editingFeedback && (
            <form onSubmit={handleSaveEditedFeedback} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Author Name</label>
                  <Input
                    value={editingFeedback.name}
                    onChange={(e) => setEditingFeedback({ ...editingFeedback, name: e.target.value })}
                    className="rounded-xl text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold">Email Address</label>
                  <Input
                    value={editingFeedback.email}
                    onChange={(e) => setEditingFeedback({ ...editingFeedback, email: e.target.value })}
                    className="rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Role</label>
                  <select
                    value={editingFeedback.role}
                    onChange={(e) => setEditingFeedback({ ...editingFeedback, role: e.target.value })}
                    className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs"
                  >
                    {data.roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Rating (Stars)</label>
                  <select
                    value={editingFeedback.rating}
                    onChange={(e) =>
                      setEditingFeedback({ ...editingFeedback, rating: Number(e.target.value) })
                    }
                    className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs font-bold text-amber-500"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Visibility Status</label>
                  <select
                    value={editingFeedback.status}
                    onChange={(e) =>
                      setEditingFeedback({
                        ...editingFeedback,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs font-bold"
                  >
                    <option value="approved">Approved (Live)</option>
                    <option value="hidden">Hidden from Public</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Relationship / Subtitle</label>
                  <Input
                    value={editingFeedback.relationship || ""}
                    onChange={(e) =>
                      setEditingFeedback({ ...editingFeedback, relationship: e.target.value })
                    }
                    placeholder="e.g. Parent of Grade 9 Student"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold">Category</label>
                  <select
                    value={editingFeedback.category}
                    onChange={(e) => setEditingFeedback({ ...editingFeedback, category: e.target.value })}
                    className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs"
                  >
                    {data.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold">Review Title / Headline</label>
                <Input
                  value={editingFeedback.title}
                  onChange={(e) => setEditingFeedback({ ...editingFeedback, title: e.target.value })}
                  className="rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold">Detailed Review Comment</label>
                <Textarea
                  value={editingFeedback.comment}
                  onChange={(e) => setEditingFeedback({ ...editingFeedback, comment: e.target.value })}
                  rows={4}
                  className="rounded-xl text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold">Featured Spotlight</span>
                  <p className="text-[11px] text-muted-foreground">Pin this review to the top spotlight wall.</p>
                </div>
                <Switch
                  checked={editingFeedback.isFeatured}
                  onCheckedChange={(val) => setEditingFeedback({ ...editingFeedback, isFeatured: val })}
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl text-xs font-bold bg-seneca-crimson hover:bg-seneca-crimson-dark text-white"
                >
                  {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  <span>Save Review</span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD OFFICIAL REVIEW MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Official Verified Review</DialogTitle>
            <DialogDescription className="text-xs">
              Manually add parent testimonials, alumni endorsements, or teacher feedback.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOfficialReview} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold">
                  Author Full Name <span className="text-seneca-crimson">*</span>
                </label>
                <Input
                  value={newReviewForm.name}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, name: e.target.value })}
                  placeholder="e.g. Dr. Ayesha Siddiqui"
                  className="rounded-xl text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold">Email Address</label>
                <Input
                  value={newReviewForm.email}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, email: e.target.value })}
                  placeholder="e.g. ayesha.siddiqui@example.com"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold">Affiliation Role</label>
                <select
                  value={newReviewForm.role}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, role: e.target.value })}
                  className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs"
                >
                  {data.roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold">Rating</label>
                <select
                  value={newReviewForm.rating}
                  onChange={(e) =>
                    setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })
                  }
                  className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs font-bold text-amber-500"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold">Initial Status</label>
                <select
                  value={newReviewForm.status}
                  onChange={(e) =>
                    setNewReviewForm({ ...newReviewForm, status: e.target.value as any })
                  }
                  className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs font-bold"
                >
                  <option value="approved">Approved (Live)</option>
                  <option value="hidden">Hidden from Public</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold">Relationship / Grade Subtitle</label>
                <Input
                  value={newReviewForm.relationship}
                  onChange={(e) =>
                    setNewReviewForm({ ...newReviewForm, relationship: e.target.value })
                  }
                  placeholder="e.g. Parent of Grade 10 Board Position Holder"
                  className="rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold">Category Focus</label>
                <select
                  value={newReviewForm.category}
                  onChange={(e) =>
                    setNewReviewForm({ ...newReviewForm, category: e.target.value })
                  }
                  className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs"
                >
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold">
                Review Headline <span className="text-seneca-crimson">*</span>
              </label>
              <Input
                value={newReviewForm.title}
                onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                placeholder="e.g. Outstanding Cambridge foundation and character building"
                className="rounded-xl text-xs font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold">
                Review Comment <span className="text-seneca-crimson">*</span>
              </label>
              <Textarea
                value={newReviewForm.comment}
                onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                placeholder="Write the full testimonial..."
                rows={4}
                className="rounded-xl text-xs leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
              <div className="space-y-0.5">
                <span className="text-xs font-bold">Feature in Spotlight</span>
                <p className="text-[11px] text-muted-foreground">Highlight this review on the featured wall.</p>
              </div>
              <Switch
                checked={newReviewForm.isFeatured}
                onCheckedChange={(val) => setNewReviewForm({ ...newReviewForm, isFeatured: val })}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={actionLoading}
                className="rounded-xl text-xs font-bold bg-seneca-crimson hover:bg-seneca-crimson-dark text-white"
              >
                {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                <span>Add Review to Live</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deletingFeedbackId} onOpenChange={(open) => !open && setDeletingFeedbackId(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Delete Review Permanently?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              This action cannot be undone. This review will be permanently deleted from the database and will no longer appear on public ratings.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingFeedbackId(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={actionLoading}
              onClick={handleDeleteFeedback}
              className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
              <span>Delete Permanently</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
