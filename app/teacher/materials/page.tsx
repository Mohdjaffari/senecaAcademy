"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  Download,
  Trash2,
  Search,
  Eye,
  BookOpen,
  Sparkles,
  Loader2,
  RefreshCw,
  X,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Edit,
  Check,
  Share2,
  Layers,
  LayoutGrid,
  List,
  SlidersHorizontal,
  HardDrive,
  Globe,
  GraduationCap,
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
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface MaterialItem {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  formattedSize: string;
  mimeType: string;
  fileUrl: string;
  isPublished: boolean;
  className: string;
  classId?: string;
  subjectId?: string;
  subjectName: string;
  subjectCode?: string;
  formattedDate: string;
  category?: "slides" | "worksheet" | "past_paper" | "lab_guide" | "general";
}

interface TeachingBook {
  id: string;
  name: string;
  code: string;
  department: string;
  description: string;
  classes: Array<{ id: string; name: string }>;
  materialsCount?: number;
}

const DOCUMENT_CATEGORIES = [
  { id: "all", label: "All Document Types" },
  { id: "slides", label: "Lecture Slides & Notes" },
  { id: "worksheet", label: "Worksheets & Practice Sets" },
  { id: "past_paper", label: "Past Papers & Mark Schemes" },
  { id: "lab_guide", label: "Laboratory & Practical Guides" },
];

export default function TeacherCourseMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [teachingBooks, setTeachingBooks] = useState<TeachingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "title" | "size-desc" | "book">("newest");
  const [viewMode, setViewMode] = useState<"grouped" | "grid" | "table">("grouped");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBookId, setEditBookId] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [editFileName, setEditFileName] = useState("");
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Preview / Details Modal State
  const [previewMaterial, setPreviewMaterial] = useState<MaterialItem | null>(null);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Load Teaching Books & Course Materials from Database strictly for this Teacher
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [booksRes, matRes] = await Promise.all([
        fetch("/api/teacher/books", { cache: "no-store" }),
        fetch("/api/materials", { cache: "no-store" }),
      ]);

      const booksData = await booksRes.json();
      const matData = await matRes.json();

      let booksList: TeachingBook[] = [];
      if (booksData.success && Array.isArray(booksData.data?.books)) {
        booksList = booksData.data.books.map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          department: b.department || "Academic Department",
          description: b.description || "",
          classes: b.classes || [],
        }));
      }
      setTeachingBooks(booksList);

      if (matData.success && Array.isArray(matData.data?.materials)) {
        const mappedMaterials: MaterialItem[] = matData.data.materials.map((m: any) => {
          let cat: "slides" | "worksheet" | "past_paper" | "lab_guide" | "general" = "general";
          const lower = (m.title + " " + m.fileName).toLowerCase();
          if (
            lower.includes("slide") ||
            lower.includes("lecture") ||
            lower.includes("unit") ||
            lower.includes("chapter")
          ) {
            cat = "slides";
          } else if (
            lower.includes("worksheet") ||
            lower.includes("practice") ||
            lower.includes("numerical") ||
            lower.includes("problem")
          ) {
            cat = "worksheet";
          } else if (
            lower.includes("past") ||
            lower.includes("paper") ||
            lower.includes("workbook") ||
            lower.includes("exam")
          ) {
            cat = "past_paper";
          } else if (
            lower.includes("lab") ||
            lower.includes("experiment") ||
            lower.includes("protocol") ||
            lower.includes("optics")
          ) {
            cat = "lab_guide";
          }

          const matchedBook = booksList.find((b) => b.id === m.subjectId || b.name === m.subjectName);

          return {
            ...m,
            subjectId: m.subjectId || matchedBook?.id,
            subjectName: m.subjectName || matchedBook?.name || "Curriculum Book",
            subjectCode: m.subjectCode || matchedBook?.code || "SUB-101",
            category: cat,
          };
        });
        setMaterials(mappedMaterials);
      } else {
        setMaterials([]);
      }
    } catch (_) {
      toast.error("Failed to load course materials repository.");
      setMaterials([]);
      setTeachingBooks([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Unique Classes list for filter
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, string>();
    teachingBooks.forEach((b) => {
      (b.classes || []).forEach((c) => {
        classMap.set(c.id, c.name);
      });
    });
    if (classMap.size === 0) {
      materials.forEach((m) => {
        if (m.className) classMap.set(m.className, m.className);
      });
    }
    return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
  }, [teachingBooks, materials]);

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.fileName.toLowerCase().includes(q) ||
          m.subjectName.toLowerCase().includes(q) ||
          (m.subjectCode && m.subjectCode.toLowerCase().includes(q)) ||
          m.className.toLowerCase().includes(q);

        const matchesBook =
          selectedBook === "all" ||
          m.subjectId === selectedBook ||
          m.subjectName.toLowerCase().includes(selectedBook.toLowerCase());

        const matchesClass =
          selectedClass === "all" ||
          (m.classId && m.classId === selectedClass) ||
          m.className.toLowerCase().includes(selectedClass.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" || m.category === selectedCategory;

        const matchesStatus =
          selectedStatus === "all" ||
          (selectedStatus === "published" && m.isPublished) ||
          (selectedStatus === "draft" && !m.isPublished);

        return matchesSearch && matchesBook && matchesClass && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.formattedDate || 0).getTime() - new Date(a.formattedDate || 0).getTime();
        }
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "size-desc") return (b.fileSize || 0) - (a.fileSize || 0);
        if (sortBy === "book") return a.subjectName.localeCompare(b.subjectName);
        return 0;
      });
  }, [materials, searchQuery, selectedBook, selectedClass, selectedCategory, selectedStatus, sortBy]);

  // Grouped by Teaching Book
  const groupedByBook = useMemo(() => {
    const groups: Array<{
      book: TeachingBook;
      materials: MaterialItem[];
      totalSize: string;
    }> = [];

    teachingBooks.forEach((book) => {
      const bookMaterials = filteredMaterials.filter(
        (m) => m.subjectId === book.id || m.subjectName === book.name || m.subjectCode === book.code
      );
      const totalBytes = bookMaterials.reduce((acc, m) => acc + (m.fileSize || 0), 0);
      const totalSize = (totalBytes / (1024 * 1024)).toFixed(1) + " MB";

      groups.push({
        book,
        materials: bookMaterials,
        totalSize,
      });
    });

    const orphanMaterials = filteredMaterials.filter(
      (m) => !teachingBooks.some((b) => b.id === m.subjectId || b.name === m.subjectName || b.code === m.subjectCode)
    );
    if (orphanMaterials.length > 0) {
      const totalBytes = orphanMaterials.reduce((acc, m) => acc + (m.fileSize || 0), 0);
      groups.push({
        book: {
          id: "general-courseware",
          name: "General Courseware & Supplementary Library",
          code: "GEN-100",
          department: "General Faculty",
          description: "Supplementary lecture resources and reference materials.",
          classes: [],
        },
        materials: orphanMaterials,
        totalSize: (totalBytes / (1024 * 1024)).toFixed(1) + " MB",
      });
    }

    return groups;
  }, [teachingBooks, filteredMaterials]);

  // Repository Metrics
  const metrics = useMemo(() => {
    const totalDocs = materials.length;
    const totalBytes = materials.reduce((acc, m) => acc + (m.fileSize || 0), 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
    const publishedCount = materials.filter((m) => m.isPublished).length;
    const activeBooksCount = teachingBooks.length;

    return {
      totalDocs,
      totalMB,
      publishedCount,
      activeBooksCount,
    };
  }, [materials, teachingBooks]);

  // Open Edit Modal
  const handleOpenEdit = (m: MaterialItem) => {
    setEditingMaterial(m);
    setEditTitle(m.title);
    setEditDescription(m.description);
    setEditBookId(m.subjectId || teachingBooks[0]?.id || "");
    setEditClassId(m.classId || "");
    setEditFileName(m.fileName);
    setEditIsPublished(m.isPublished);
    setEditModalOpen(true);
  };

  // Save Edit Submission
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !editTitle.trim()) return;

    setSavingEdit(true);
    try {
      const payload = {
        id: editingMaterial.id,
        title: editTitle.trim(),
        description: editDescription.trim(),
        subjectId: editBookId || undefined,
        classId: editClassId || undefined,
        fileName: editFileName.trim() || editingMaterial.fileName,
        isPublished: editIsPublished,
      };

      const res = await fetch("/api/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Update failed.");

      toast.success("Course Material Updated Successfully!");
      setEditModalOpen(false);
      setEditingMaterial(null);
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to update material.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle Publish Status Directly
  const handleTogglePublish = async (m: MaterialItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedStatus = !m.isPublished;
      const res = await fetch("/api/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, isPublished: updatedStatus }),
      });

      if (res.ok) {
        setMaterials((prev) =>
          prev.map((item) => (item.id === m.id ? { ...item, isPublished: updatedStatus } : item))
        );
        toast.success(
          updatedStatus
            ? `"${m.title}" is now Published to students!`
            : `"${m.title}" set to Draft mode (hidden from students).`
        );
      }
    } catch (_) {
      toast.error("Failed to update publication status.");
    }
  };

  // Delete Material Trigger
  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ id, name });
  };

  // Confirm and Execute Delete Material
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/materials?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        toast.error(data.error || "Failed to delete material.");
        return;
      }
      setMaterials((prev) => prev.filter((m) => m.id !== deleteConfirm.id));
      toast.success(`Removed "${deleteConfirm.name}" from course library.`);
    } catch (_) {
      toast.error("Failed to delete material.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Copy shareable link
  const handleCopyLink = (m: MaterialItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${m.fileUrl}`;
    navigator.clipboard.writeText(url);
    toast.success("Document link copied to clipboard!");
  };

  // Helper: Get icon based on file type / category
  const getDocIcon = (m: MaterialItem) => {
    const fn = (m.fileName || "").toLowerCase();
    if (fn.endsWith(".xlsx") || fn.endsWith(".csv")) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
    }
    if (fn.endsWith(".docx") || fn.endsWith(".doc")) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    if (fn.endsWith(".pptx") || fn.endsWith(".ppt")) {
      return <FileCode className="h-5 w-5 text-orange-600" />;
    }
    if (m.category === "lab_guide") {
      return <HardDrive className="h-5 w-5 text-purple-600" />;
    }
    return <FileText className="h-5 w-5 text-seneca-crimson" />;
  };

  // Helper to render a Material Card
  const renderMaterialCard = (m: MaterialItem) => (
    <Card
      key={m.id}
      onClick={() => setPreviewMaterial(m)}
      className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 hover:border-seneca-crimson/40 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
    >
      {/* Status indicator top strip */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          m.isPublished
            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
            : "bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/20"
        )}
      />

      <div className="space-y-3 pt-1">
        {/* Header: Icon, Title & Size */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-muted/60 text-foreground shrink-0 group-hover:bg-seneca-crimson/10 group-hover:text-seneca-crimson transition-colors shadow-sm">
              {getDocIcon(m)}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber transition-colors line-clamp-2">
                {m.title}
              </h4>
              <p className="text-[10px] font-mono text-muted-foreground pt-0.5 truncate max-w-[170px]">
                {m.fileName}
              </p>
            </div>
          </div>

          <Badge variant="outline" className="font-bold text-[10px] font-mono bg-muted/40 shrink-0">
            {m.formattedSize}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {m.description || "Official teaching course material for student learning and assessment."}
        </p>

        {/* Teaching Book & Class Tag Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Badge
            variant="outline"
            className="bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/20 text-[10px] font-bold gap-1"
          >
            <BookOpen className="h-2.5 w-2.5" />
            <span>{m.subjectName}</span>
          </Badge>

          <Badge
            variant="outline"
            className="bg-seneca-amber/15 text-seneca-amber border-seneca-amber/30 text-[10px] font-bold"
          >
            {m.className}
          </Badge>

          <button
            onClick={(e) => handleTogglePublish(m, e)}
            className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ml-auto",
              m.isPublished
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            )}
            title="Click to toggle status"
          >
            {m.isPublished ? "Published" : "Draft"}
          </button>
        </div>
      </div>

      {/* Footer: Date & Quick Actions */}
      <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{m.formattedDate}</span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => handleCopyLink(m, e)}
            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            title="Copy Share Link"
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenEdit(m)}
            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            title="Edit Document"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            title="Download Document"
          >
            <a href={m.fileUrl} download={m.fileName} target="_blank" rel="noreferrer">
              <Download className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => handleDelete(m.id, m.title, e)}
            className="h-7 w-7 p-0 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            title="Delete Document"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Hero Header Banner (Without Upload Button) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-5 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <FolderOpen className="h-3 w-3" />
                <span>Teaching Books &amp; Courseware Repository</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Instant Student LMS Sync</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Course Materials &amp; <span className="text-seneca-amber">Lecture Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Explore and manage lecture slides, topic workbooks, laboratory guides, and past
              papers published strictly for your assigned teaching curriculum books.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm flex-1 sm:flex-initial justify-center"
            >
              <Link href="/teacher/books">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                <span>Teaching Books</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Executive Repository KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-crimson/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Documents
            </span>
            <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {metrics.totalDocs}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Across {metrics.activeBooksCount} Teaching Books
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Live Published
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-600">
              {metrics.publishedCount} / {metrics.totalDocs}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3" />
              <span>Visible in Student Portal</span>
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-seneca-amber/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Storage Footprint
            </span>
            <div className="p-2 rounded-xl bg-seneca-amber/15 text-seneca-amber">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {metrics.totalMB} MB
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              CDN Cached &amp; Compressed
            </span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Teaching Books
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {teachingBooks.length}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Assigned Curriculum Subjects
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Comprehensive Multi-Filter Bar */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
        {/* Row 1: Search & View Mode Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search material title, topic, file name, teaching book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-background text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => setViewMode("grouped")}
                className={cn(
                  "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "grouped"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grouped by Teaching Book"
              >
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">By Book</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid Card View"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Dense Table View"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={() => fetchData()}
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0"
              title="Refresh Repository"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Row 2: Select Filters (Book, Class, Category, Status, Sort) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Filter 1: Teaching Book */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-seneca-crimson" />
              <span>Teaching Book</span>
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-seneca-crimson"
            >
              <option value="all">All Teaching Books ({teachingBooks.length})</option>
              {teachingBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Grade / Class Section */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="h-3 w-3 text-seneca-amber" />
              <span>Target Class</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-seneca-amber"
            >
              <option value="all">All Assigned Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Document Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <FolderOpen className="h-3 w-3 text-blue-600" />
              <span>Document Type</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Globe className="h-3 w-3 text-emerald-600" />
              <span>Publish Status</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Draft / Hidden Only</option>
            </select>
          </div>

          {/* Filter 5: Sort */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3 text-purple-600" />
              <span>Sort By</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Newest First</option>
              <option value="title">Title (A → Z)</option>
              <option value="size-desc">Largest File Size</option>
              <option value="book">Book Name</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedBook !== "all" ||
          selectedClass !== "all" ||
          selectedCategory !== "all" ||
          selectedStatus !== "all" ||
          searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs">
            <span className="text-[11px] font-bold text-muted-foreground">Active Filters:</span>
            {selectedBook !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Book: {teachingBooks.find((b) => b.id === selectedBook)?.name || selectedBook}</span>
                <button onClick={() => setSelectedBook("all")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedClass !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Class: {uniqueClasses.find((c) => c.id === selectedClass)?.name || selectedClass}</span>
                <button onClick={() => setSelectedClass("all")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory("all")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedStatus !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Status: {selectedStatus}</span>
                <button onClick={() => setSelectedStatus("all")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 rounded-lg text-[11px] font-semibold">
                <span>Query: &quot;{searchQuery}&quot;</span>
                <button onClick={() => setSearchQuery("")} className="p-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={() => {
                setSelectedBook("all");
                setSelectedClass("all");
                setSelectedCategory("all");
                setSelectedStatus("all");
                setSearchQuery("");
              }}
              className="text-[11px] font-bold text-seneca-crimson hover:underline ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </Card>

      {/* 4. Course Materials Display (Grouped by Book vs Grid vs Table) */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
          <p className="text-xs font-bold text-muted-foreground">Loading Courseware Repository...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-14 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <FolderOpen className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-heading text-foreground">No Course Materials Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {materials.length === 0
                ? "No course materials have been added for your assigned teaching books yet. Course materials added for your teaching books will appear here."
                : "No course materials match your selected filter criteria. Try adjusting or clearing your filters."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            {materials.length > 0 ? (
              <Button
                onClick={() => {
                  setSelectedBook("all");
                  setSelectedClass("all");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Link href="/teacher/books">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>View Teaching Books</span>
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === "grouped" ? (
        /* GROUPED BY TEACHING BOOK VIEW */
        <div className="space-y-8">
          {groupedByBook.map((group) => {
            if (group.materials.length === 0 && selectedBook !== "all") return null;

            return (
              <div key={group.book.id} className="space-y-3.5">
                {/* Book Header Banner (Without Upload Button) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 sm:p-4 rounded-2xl bg-muted/50 border border-border/70 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-seneca-crimson/10 text-seneca-crimson font-bold">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                          {group.book.name}
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-mono font-bold">
                          {group.book.code}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {group.book.department} • {group.materials.length} Documents ({group.totalSize})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Materials in this Book */}
                {group.materials.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-border/70 text-center text-xs text-muted-foreground">
                    No course materials published for this teaching book yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.materials.map((m) => renderMaterialCard(m))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === "grid" ? (
        /* STANDARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredMaterials.map((m) => renderMaterialCard(m))}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Document</th>
                  <th className="p-3.5">Teaching Book</th>
                  <th className="p-3.5">Target Class</th>
                  <th className="p-3.5">File Size</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMaterials.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setPreviewMaterial(m)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 pl-5 max-w-[240px]">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-muted/60 shrink-0">{getDocIcon(m)}</div>
                        <div>
                          <span className="font-bold text-foreground group-hover:text-seneca-crimson transition-colors block truncate">
                            {m.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate block">
                            {m.fileName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-foreground block">{m.subjectName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{m.subjectCode}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-foreground">{m.className}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">{m.formattedSize}</td>
                    <td className="p-3.5 text-muted-foreground">{m.formattedDate}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={(e) => handleTogglePublish(m, e)}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors",
                          m.isPublished
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        )}
                        title="Click to toggle publish"
                      >
                        {m.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(m)}
                          className="h-8 w-8 p-0 rounded-xl"
                          title="Edit Document"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-xl"
                          title="Download"
                        >
                          <a href={m.fileUrl} download={m.fileName} target="_blank" rel="noreferrer">
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDelete(m.id, m.title, e)}
                          className="h-8 w-8 p-0 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Edit Course Material Modal */}
      {editingMaterial && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-lg w-[95vw] sm:w-full rounded-2xl sm:rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
            <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-seneca-amber/15 text-seneca-amber">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold font-heading">
                    Edit Course Material
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Update document details, target classes, or publication status.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-hidden flex flex-col min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Teaching Book *</label>
                  <select
                    value={editBookId}
                    onChange={(e) => setEditBookId(e.target.value)}
                    className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                  >
                    {teachingBooks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Document Title *</label>
                  <Input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-background text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Description</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background border border-border text-xs resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">File Name</label>
                  <Input
                    type="text"
                    value={editFileName}
                    onChange={(e) => setEditFileName(e.target.value)}
                    className="h-10 rounded-xl bg-background text-xs font-mono"
                  />
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground text-xs block">Publication Status</span>
                    <span className="text-[10px] text-muted-foreground">
                      {editIsPublished ? "Currently visible to students" : "Currently hidden (Draft)"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsPublished}
                    onChange={(e) => setEditIsPublished(e.target.checked)}
                    className="h-4 w-4 rounded text-seneca-crimson focus:ring-seneca-crimson"
                  />
                </div>
              </div>

              <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl text-xs font-bold flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingEdit}
                  variant="glow"
                  className="rounded-xl text-xs font-bold gap-1.5 flex-1 sm:flex-initial"
                >
                  {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>{savingEdit ? "Saving..." : "Save Changes"}</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 6. Document Preview & Details Dossier Modal */}
      {previewMaterial && (
        <Dialog open={!!previewMaterial} onOpenChange={() => setPreviewMaterial(null)}>
          <DialogContent className="max-w-lg w-[95vw] sm:w-full rounded-2xl sm:rounded-3xl p-0 overflow-hidden shadow-2xl border border-border/80 bg-card max-h-[85vh] sm:max-h-[88vh] flex flex-col gap-0">
            <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 shrink-0 bg-card text-left">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson shrink-0">
                  {getDocIcon(previewMaterial)}
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold font-heading">
                    {previewMaterial.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground font-mono">
                    {previewMaterial.fileName} • {previewMaterial.formattedSize}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <h5 className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                  Courseware Association
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground text-[10px]">Teaching Book:</span>
                    <p className="font-bold text-foreground text-xs">{previewMaterial.subjectName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Target Class:</span>
                    <p className="font-bold text-foreground text-xs">{previewMaterial.className}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Published Date:</span>
                    <p className="font-bold text-foreground text-xs">{previewMaterial.formattedDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Visibility:</span>
                    <p className="font-bold text-xs text-emerald-600">
                      {previewMaterial.isPublished ? "Live (Public to Class)" : "Draft (Private)"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <h5 className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                  Description &amp; Syllabus Scope
                </h5>
                <p className="p-3 rounded-xl bg-card border border-border/60 text-xs text-foreground leading-relaxed">
                  {previewMaterial.description ||
                    "Official course material for classroom instruction, homework preparation, and final examination revision."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-seneca-amber/10 border border-seneca-amber/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-seneca-amber" />
                  <span className="font-bold text-xs text-foreground">Cloud Sync &amp; Download Ready</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">CDN: Global Fast</span>
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2 justify-between items-center">
              <Button
                asChild
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5 w-full sm:w-auto"
              >
                <a href={previewMaterial.fileUrl} download={previewMaterial.fileName} target="_blank" rel="noreferrer">
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Document</span>
                </a>
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => {
                    const m = previewMaterial;
                    setPreviewMaterial(null);
                    handleOpenEdit(m);
                  }}
                  variant="outline"
                  className="rounded-xl text-xs font-bold flex-1 sm:flex-initial"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  <span>Edit</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setPreviewMaterial(null)}
                  variant="outline"
                  className="rounded-xl text-xs font-bold flex-1 sm:flex-initial"
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 7. Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Course Material?"
        description={`Are you sure you want to permanently delete "${deleteConfirm?.name}" from your teaching repository? This action cannot be undone.`}
        confirmText="Delete Material"
        variant="destructive"
        icon="trash"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
