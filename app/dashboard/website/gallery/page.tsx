"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  ExternalLink,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Loader2,
  X,
  CheckCircle2,
  Building2,
  BookOpen,
  FlaskConical,
  Trophy,
  PartyPopper,
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

interface GalleryPhoto {
  id: string;
  caption: string;
  subcaption: string;
  imageUrl: string;
  category: "campus" | "events" | "sports" | "academics" | "lab";
  size: "default" | "large" | "wide";
  isPublished: boolean;
  formattedDate: string;
}

export default function WebsiteGalleryPageManager() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newSubcaption, setNewSubcaption] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState<"campus" | "events" | "sports" | "academics" | "lab">("campus");
  const [uploading, setUploading] = useState(false);

  // Preview Lightbox Modal
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  // Delete Confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingCaption, setDeletingCaption] = useState<string>("");

  const fetchPhotos = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/website/gallery");
      const data = await res.json();
      if (data.success && data.data?.items) {
        setPhotos(data.data.items);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
      toast.error("Error loading campus gallery photos.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const filteredPhotos = photos.filter((p) => {
    const matchesSearch =
      p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subcaption && p.subcaption.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Category Counts
  const stats = {
    total: photos.length,
    campus: photos.filter((p) => p.category === "campus").length,
    academics: photos.filter((p) => p.category === "academics").length,
    lab: photos.filter((p) => p.category === "lab").length,
    sports: photos.filter((p) => p.category === "sports").length,
    events: photos.filter((p) => p.category === "events").length,
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim() || !newUrl.trim()) {
      return toast.error("Please provide both photo caption and select an image.");
    }

    setUploading(true);
    try {
      const res = await fetch("/api/website/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: newCaption.trim(),
          subcaption: newSubcaption.trim(),
          imageUrl: newUrl.trim(),
          category: newCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to upload photo.");

      toast.success("Photo Published to Campus Gallery!", {
        description: `'${newCaption}' is now showcased on the public gallery.`,
      });

      setUploadModalOpen(false);
      setNewCaption("");
      setNewSubcaption("");
      setNewUrl("");
      fetchPhotos(true);
    } catch (err: any) {
      toast.error("Upload Failed", { description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!deletingId) return;
    const id = deletingId;
    const caption = deletingCaption;
    setDeletingId(null);

    // Optimistic UI update
    setPhotos((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/website/gallery/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to delete.");

      toast.info("Photo Removed", { description: `'${caption}' has been deleted from gallery.` });
      fetchPhotos(true);
    } catch (err: any) {
      toast.error("Delete Failed", { description: err.message });
      fetchPhotos(true);
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
        <span className="text-foreground font-bold">Campus Photo Gallery</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Camera className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground tracking-tight">
              Campus Photo Gallery & Visual Media
            </h1>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-extrabold">
              Live on Public
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Curate high-resolution campus photography, robotics exhibitions, annual sports galas, and classroom life showcased on the public portal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold gap-1.5 border-border/80 flex-1 sm:flex-initial"
          >
            <Link href="/gallery" target="_blank">
              <Eye className="h-3.5 w-3.5" />
              <span>Live Public Preview</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          </Button>

          <Button
            onClick={() => setUploadModalOpen(true)}
            size="sm"
            className="rounded-xl font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex-1 sm:flex-initial"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Upload New Photo</span>
          </Button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card/80 space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <ImageIcon className="h-3 w-3" /> Total Photos
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-foreground">{stats.total}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-1">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
            <Building2 className="h-3 w-3" /> Campus
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400">{stats.campus}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-1">
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> Academics
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-purple-600 dark:text-purple-400">{stats.academics}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 space-y-1">
          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase flex items-center gap-1">
            <FlaskConical className="h-3 w-3" /> AI & Labs
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-cyan-600 dark:text-cyan-400">{stats.lab}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
            <Trophy className="h-3 w-3" /> Sports
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-amber-600 dark:text-amber-400">{stats.sports}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-2xl border border-pink-500/20 bg-pink-500/5 space-y-1">
          <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase flex items-center gap-1">
            <PartyPopper className="h-3 w-3" /> Galas & Events
          </span>
          <p className="text-lg sm:text-xl font-extrabold font-heading text-pink-600 dark:text-pink-400">{stats.events}</p>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xs rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search photo captions, subcaptions, categories..."
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
            {/* Category select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold flex-1 sm:flex-initial"
            >
              <option value="all">All Categories ({photos.length})</option>
              <option value="campus">Campus & Grounds ({stats.campus})</option>
              <option value="academics">Academics & Classrooms ({stats.academics})</option>
              <option value="lab">Science & AI Labs ({stats.lab})</option>
              <option value="sports">Sports & Athletics ({stats.sports})</option>
              <option value="events">Annual Events & Gala ({stats.events})</option>
            </select>

            <Button
              onClick={() => fetchPhotos()}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shrink-0"
              title="Refresh photo stream"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Photo Grid Stream */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-muted-foreground">Loading Seneca Campus Photographs...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-4">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">No Photos Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {photos.length === 0
                ? "There are currently no photos uploaded to the gallery. Click 'Upload New Photo' to showcase your first campus photo."
                : "No gallery images match your current filter and search query."}
            </p>
          </div>
          <Button
            onClick={() => setUploadModalOpen(true)}
            size="sm"
            className="rounded-xl text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Upload Photo</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border border-border/80 rounded-2xl sm:rounded-3xl group relative shadow-xs bg-card flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300"
            >
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge
                  variant="outline"
                  className="absolute top-2.5 left-2.5 text-[10px] font-bold capitalize bg-black/60 text-white backdrop-blur-md border-white/20"
                >
                  {item.category}
                </Badge>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(item)}
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                  title="Enlarge Photo"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-3.5 space-y-1.5">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">{item.caption}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingId(item.id);
                      setDeletingCaption(item.caption);
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1 shrink-0"
                    title="Delete Photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {item.subcaption && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{item.subcaption}</p>
                )}
                <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
                  <span>Uploaded: {item.formattedDate}</span>
                  <span className="text-emerald-600 font-bold">Live on Web</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Photo Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl border border-border/80 my-6 sm:my-8">
          <DialogHeader className="border-b border-border/60 pb-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <Camera className="h-4 w-4" />
              <span>Campus Media Uploader</span>
            </div>
            <DialogTitle className="text-lg font-bold">Publish Campus Photo</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new photograph to the public photo showcase.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadPhoto} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Photo Caption <span className="text-seneca-crimson">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Cambridge Science & Robotics Lab"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="h-10 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Subcaption / Description</label>
              <Input
                placeholder="e.g. Students engaged in hands-on physics experiments"
                value={newSubcaption}
                onChange={(e) => setNewSubcaption(e.target.value)}
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <ImageUpload
              value={newUrl}
              onChange={setNewUrl}
              label="Select Campus Photograph *"
              aspectRatio="video"
            />

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
              >
                <option value="campus">Campus & Grounds</option>
                <option value="academics">Academics & Classrooms</option>
                <option value="lab">Science & AI Labs</option>
                <option value="sports">Sports & Athletics</option>
                <option value="events">Annual Events & Gala</option>
              </select>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="rounded-xl text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span>Publish Photo</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enlarge Photo Modal */}
      {previewPhoto && (
        <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
          <DialogContent className="max-w-2xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl">
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-black">
              <img
                src={previewPhoto.imageUrl}
                alt={previewPhoto.caption}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground">{previewPhoto.caption}</h3>
                <Badge variant="outline" className="capitalize text-xs font-bold">
                  {previewPhoto.category}
                </Badge>
              </div>
              {previewPhoto.subcaption && (
                <p className="text-xs text-muted-foreground">{previewPhoto.subcaption}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600">Delete Photo Permanently?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete &ldquo;{deletingCaption}&rdquo;? This will permanently remove the photo from the public campus gallery.
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
              onClick={handleDeletePhoto}
              className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span>Delete Photo</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
