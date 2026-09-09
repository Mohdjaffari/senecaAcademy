"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  Sparkles,
  Newspaper,
  Calendar,
  User,
  ExternalLink,
  X,
  Loader2,
  ChevronRight,
  GraduationCap,
  Trophy,
  Building2,
  CreditCard,
  PartyPopper,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  tags: string[];
  authorName: string;
  status: "draft" | "published";
  formattedDate: string;
}

export default function WebsiteBlogsPageManager() {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Create Article Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Academics");
  const [newAuthor, setNewAuthor] = useState("Principal Dr. Ayesha Siddiqui");
  const [newCover, setNewCover] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newStatus, setNewStatus] = useState<"published" | "draft">("published");
  const [publishing, setPublishing] = useState(false);

  // Read Modal
  const [readArticle, setReadArticle] = useState<BlogArticle | null>(null);

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<string>("");

  const fetchBlogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/website/blogs");
      const data = await res.json();
      if (data.success && data.data?.blogs) {
        setBlogs(data.data.blogs);
      }
    } catch (err) {
      console.error("Failed to load blog articles:", err);
      toast.error("Error loading news articles.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate stats
  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.status === "published").length,
    drafts: blogs.filter((b) => b.status === "draft").length,
    academics: blogs.filter((b) => b.category === "Academics").length,
    achievements: blogs.filter((b) => b.category === "Achievements").length,
    campusLife: blogs.filter((b) => b.category === "Campus Life").length,
  };

  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      return toast.error("Please provide both headline and body content.");
    }

    setPublishing(true);
    try {
      const res = await fetch("/api/website/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          authorName: newAuthor.trim(),
          coverImageUrl:
            newCover.trim() ||
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
          excerpt: newExcerpt.trim() || newTitle.slice(0, 120),
          content: newContent.trim(),
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to publish.");

      toast.success(
        newStatus === "published"
          ? "News Article Published Live!"
          : "Article Saved as Draft!",
        {
          description: `'${newTitle}' has been recorded in the newsroom.`,
        }
      );

      setCreateModalOpen(false);
      setNewTitle("");
      setNewExcerpt("");
      setNewContent("");
      setNewCover("");
      setNewStatus("published");
      fetchBlogs(true);
    } catch (err: any) {
      toast.error("Publish Failed", { description: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!deletingId) return;
    const id = deletingId;
    const title = deletingTitle;
    setDeletingId(null);

    // Optimistic UI update
    setBlogs((prev) => prev.filter((b) => b.id !== id));

    try {
      const res = await fetch(`/api/website/blogs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to delete.");

      toast.info("Article Removed", { description: `'${title}' has been deleted.` });
      fetchBlogs(true);
    } catch (err: any) {
      toast.error("Delete Failed", { description: err.message });
      fetchBlogs(true);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground flex-wrap">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/dashboard/website" className="hover:text-foreground transition-colors">
          Website Management
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-bold">Blogs & Campus News</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Newspaper className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground tracking-tight">
              Blogs & Campus News Management
            </h1>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-extrabold">
              Live on Public
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Author institutional announcements, student Olympiad triumphs, academic research spotlights, and public newsletters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold gap-1.5 border-border/80 flex-1 sm:flex-initial"
          >
            <Link href="/blogs" target="_blank">
              <Eye className="h-3.5 w-3.5" />
              <span>Live Public Newsfeed</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          </Button>

          <Button
            onClick={() => setCreateModalOpen(true)}
            size="sm"
            className="rounded-xl font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white shadow-sm flex-1 sm:flex-initial"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create News Article</span>
          </Button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card/80 space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <FileText className="h-3 w-3" /> Total Articles
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-foreground">{stats.total}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Published
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">{stats.published}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-1">
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1">
            <GraduationCap className="h-3 w-3" /> Academics
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-purple-600 dark:text-purple-400">{stats.academics}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
            <Trophy className="h-3 w-3" /> Awards
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-amber-600 dark:text-amber-400">{stats.achievements}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-1">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
            <Building2 className="h-3 w-3" /> Campus Life
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400">{stats.campusLife}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-500/20 bg-slate-500/5 space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> Drafts
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-foreground">{stats.drafts}</p>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xs rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search news by headline, excerpt, author byline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold flex-1 sm:flex-initial"
            >
              <option value="all">All Categories ({blogs.length})</option>
              <option value="Academics">Academics ({stats.academics})</option>
              <option value="Achievements">Achievements & Awards ({stats.achievements})</option>
              <option value="Campus Life">Campus Life ({stats.campusLife})</option>
              <option value="Admissions">Admissions</option>
              <option value="Events">Events & Celebrations</option>
            </select>

            <Button
              onClick={() => fetchBlogs()}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shrink-0"
              title="Refresh news articles"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Articles Grid Stream */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
          <p className="text-xs font-bold text-muted-foreground">Loading Seneca News Articles...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-4">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">No News Articles Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {blogs.length === 0
                ? "There are currently no articles in the newsroom. Click 'Create News Article' to publish the first story."
                : "No published stories match your current search or category filter."}
            </p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            size="sm"
            className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create News Article</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBlogs.map((b) => (
            <Card
              key={b.id}
              className="overflow-hidden border border-border/80 rounded-2xl sm:rounded-3xl group shadow-xs bg-card flex flex-col justify-between hover:border-seneca-crimson/40 transition-all duration-300"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <img
                    src={b.coverImageUrl}
                    alt={b.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge
                    variant="outline"
                    className="absolute top-3 left-3 text-[10px] font-bold bg-seneca-crimson text-white border-none shadow-sm"
                  >
                    {b.category}
                  </Badge>
                  {b.status === "draft" && (
                    <Badge
                      variant="outline"
                      className="absolute top-3 right-3 text-[10px] font-bold bg-amber-500/90 text-black border-none"
                    >
                      Draft
                    </Badge>
                  )}
                </div>

                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="h-3 w-3" />
                      <span>{b.formattedDate}</span>
                    </span>
                    <span>•</span>
                    <span className="truncate">by {b.authorName}</span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base font-heading text-foreground line-clamp-2 leading-snug">
                    {b.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {b.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-2">
                <Button
                  type="button"
                  onClick={() => setReadArticle(b)}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 text-seneca-crimson dark:text-seneca-amber hover:text-seneca-crimson hover:bg-seneca-crimson/10"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Read Story</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setDeletingId(b.id);
                    setDeletingTitle(b.title);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Write News Article Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl border border-border/80 my-6 sm:my-8">
          <DialogHeader className="border-b border-border/60 pb-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              <span>Campus Newsroom Publisher</span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold">Write Official News Article</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Publish achievements, announcements, and academic updates on the public newsfeed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePublishArticle} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Article Headline <span className="text-seneca-crimson">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Seneca Students Triumph at Cambridge Mathematics Olympiad"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-10 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                >
                  <option value="Academics">Academics</option>
                  <option value="Achievements">Achievements & Awards</option>
                  <option value="Campus Life">Campus Life</option>
                  <option value="Admissions">Admissions</option>
                  <option value="Events">Events & Celebrations</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Author Byline</label>
                <Input
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="h-10 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <ImageUpload
              value={newCover}
              onChange={setNewCover}
              label="Article Cover Photograph *"
              aspectRatio="video"
            />

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Short Summary / Excerpt</label>
              <textarea
                rows={2}
                placeholder="Brief highlight shown on blog cards..."
                value={newExcerpt}
                onChange={(e) => setNewExcerpt(e.target.value)}
                className="w-full p-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Article Body Content <span className="text-seneca-crimson">*</span>
              </label>
              <textarea
                required
                rows={6}
                placeholder="Write full article body details..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Publication Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
              >
                <option value="published">Publish Live Immediately</option>
                <option value="draft">Save as Draft (Hidden from Public)</option>
              </select>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={publishing}
                className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white"
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="h-3.5 w-3.5 mr-1" />
                    <span>{newStatus === "published" ? "Publish Article" : "Save Draft"}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Read Full Article Lightbox Modal */}
      {readArticle && (
        <Dialog open={!!readArticle} onOpenChange={() => setReadArticle(null)}>
          <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl border border-border/80 my-6 sm:my-8">
            <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden bg-muted">
              <img
                src={readArticle.coverImageUrl}
                alt={readArticle.title}
                className="h-full w-full object-cover"
              />
              <Badge className="absolute top-3 left-3 bg-seneca-crimson text-white border-none">
                {readArticle.category}
              </Badge>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span>Published: {readArticle.formattedDate}</span>
                <span>•</span>
                <span className="font-semibold text-foreground">By {readArticle.authorName}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold font-heading text-foreground">
                {readArticle.title}
              </h2>
            </div>

            <div className="pt-2 border-t border-border/60 text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {readArticle.content}
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button
                type="button"
                onClick={() => setReadArticle(null)}
                variant="outline"
                className="w-full rounded-xl text-xs font-bold"
              >
                Close Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600">Delete Article Permanently?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete &ldquo;{deletingTitle}&rdquo;? This will permanently remove the article from the public newsroom.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingId(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteArticle}
              className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span>Delete Article</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
