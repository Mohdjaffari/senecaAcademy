"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Archive,
  RefreshCw,
  Eye,
  ExternalLink,
  Trash2,
  Sparkles,
  Calendar,
  Send,
  MessageCircle,
  Inbox,
  User,
  ArrowUpDown,
  Check,
  FileText,
  Save,
  Loader2,
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

interface ContactInquiry {
  id: string;
  submissionId: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "replied" | "archived";
  notes: string;
  repliedAt: string | null;
  createdAt: string;
}

interface InquiryCounts {
  total: number;
  new: number;
  inProgress: number;
  replied: number;
  archived: number;
}

export default function AdminContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [counts, setCounts] = useState<InquiryCounts>({
    total: 0,
    new: 0,
    inProgress: 0,
    replied: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchInquiries = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/contact?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setInquiries(data.data.submissions || []);
        if (data.data.counts) {
          setCounts(data.data.counts);
        }
      } else {
        toast.error("Failed to load contact inquiries.");
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      toast.error("Network error while loading inquiries.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [selectedStatus]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenDetail = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setEditingNotes(inquiry.notes || "");
    // If status was new, automatically upgrade to in_progress to signal it has been opened/read
    if (inquiry.status === "new") {
      updateStatus(inquiry.id, "in_progress", inquiry.notes, false);
    }
  };

  const updateStatus = async (
    id: string,
    newStatus: "new" | "in_progress" | "replied" | "archived",
    notes?: string,
    showToast = true
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: notes !== undefined ? notes : editingNotes,
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (showToast) {
          toast.success(`Inquiry marked as ${newStatus.replace("_", " ")}.`);
        }
        // Update local list
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: newStatus,
                  notes: notes !== undefined ? notes : editingNotes,
                  repliedAt: newStatus === "replied" ? new Date().toISOString() : item.repliedAt,
                }
              : item
          )
        );

        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  notes: notes !== undefined ? notes : editingNotes,
                  repliedAt: newStatus === "replied" ? new Date().toISOString() : prev.repliedAt,
                }
              : null
          );
        }
        // Refresh counts silently
        fetchInquiries(true);
      } else {
        toast.error(data.error?.message || "Failed to update inquiry.");
      }
    } catch (err) {
      toast.error("Error communicating with server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setUpdatingId(selectedInquiry.id);
    try {
      const res = await fetch(`/api/contact/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editingNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Admin internal notes updated.");
        setSelectedInquiry((prev) => (prev ? { ...prev, notes: editingNotes } : null));
        setInquiries((prev) =>
          prev.map((item) => (item.id === selectedInquiry.id ? { ...item, notes: editingNotes } : item))
        );
      } else {
        toast.error("Failed to update notes.");
      }
    } catch {
      toast.error("Error saving notes.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Contact inquiry deleted.");
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        setDeleteConfirmId(null);
        fetchInquiries(true);
      } else {
        toast.error(data.error?.message || "Failed to delete.");
      }
    } catch {
      toast.error("Error deleting inquiry.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
            ● New
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase tracking-wider">
            In Review
          </Badge>
        );
      case "replied":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
            ✓ Replied
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatWhatsAppLink = (phone: string, name: string, submissionId: string) => {
    const cleanDigits = phone.replace(/\D/g, "");
    const text = `Assalam-o-Alaikum ${name}, this is Seneca Academy Administration regarding your contact inquiry (${submissionId}). How can we assist you today?`;
    return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seneca-crimson/10 border border-seneca-crimson/20 text-seneca-crimson text-xs font-bold mb-2">
            <Inbox className="h-3.5 w-3.5" />
            <span>Public Communications Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Public Contact Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Review incoming parent questions, campus tour bookings, and public messages submitted through the
            website contact portal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInquiries()}
            disabled={loading}
            className="rounded-xl text-xs font-bold gap-1.5 shadow-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="rounded-2xl border border-border/80 shadow-xs hover:border-seneca-crimson/40 transition-all bg-card/60 backdrop-blur-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Inquiries
              </span>
              <div className="text-2xl sm:text-3xl font-black text-foreground font-heading">{counts.total}</div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center text-foreground">
              <Inbox className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-amber-500/30 shadow-xs hover:border-amber-500/60 transition-all bg-amber-500/5 backdrop-blur-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                New Unread
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-heading">
                {counts.new}
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-sky-500/30 shadow-xs hover:border-sky-500/60 transition-all bg-sky-500/5 backdrop-blur-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                In Review
              </span>
              <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 font-heading">
                {counts.inProgress}
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-emerald-500/30 shadow-xs hover:border-emerald-500/60 transition-all bg-emerald-500/5 backdrop-blur-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Replied / Handled
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                {counts.replied}
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-2xl border border-border/70">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, topic..."
            className="pl-9 h-9 rounded-xl text-xs bg-background border-border/80 focus-visible:ring-1"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Messages" },
            { id: "new", label: `New (${counts.new})` },
            { id: "in_progress", label: `In Review (${counts.inProgress})` },
            { id: "replied", label: `Replied (${counts.replied})` },
            { id: "archived", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                selectedStatus === tab.id
                  ? "bg-seneca-crimson text-white shadow-xs"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/60 hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Inquiries List / Table */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
          <span className="text-xs font-semibold">Loading inquiries from database...</span>
        </div>
      ) : inquiries.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border-dashed border-border/80">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-foreground text-sm">No Contact Inquiries Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No messages matched your search query "${searchQuery}".`
              : "When visitors submit the public contact form on the website, their messages will appear here in real-time."}
          </p>
        </Card>
      ) : (
        <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Applicant / Sender</th>
                  <th className="py-3 px-4">Topic / Subject</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    onClick={() => handleOpenDetail(inquiry)}
                    className={cn(
                      "hover:bg-muted/40 transition-colors cursor-pointer group",
                      inquiry.status === "new" && "bg-amber-500/[0.03] font-medium"
                    )}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      <span className="text-seneca-crimson">{inquiry.submissionId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground group-hover:text-seneca-crimson transition-colors">
                        {inquiry.fullName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{inquiry.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground max-w-xs truncate">{inquiry.subject}</div>
                      <div className="text-[11px] text-muted-foreground max-w-xs truncate">{inquiry.message}</div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      <span className="font-medium text-foreground">{inquiry.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      <div>{new Date(inquiry.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}</div>
                      <div className="text-[10px] text-muted-foreground/70">
                        {new Date(inquiry.createdAt).toLocaleTimeString("en-PK", { timeStyle: "short" })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(inquiry.status)}</td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(inquiry)}
                          className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          <span>View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(inquiry.id)}
                          className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
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
        </div>
      )}

      {/* 5. Detail Inquiry Modal / Dossier */}
      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-border/80">
            <DialogHeader className="border-b border-border/60 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-seneca-crimson">
                      {selectedInquiry.submissionId}
                    </span>
                    {getStatusBadge(selectedInquiry.status)}
                  </div>
                  <DialogTitle className="text-xl font-bold font-heading text-foreground">
                    {selectedInquiry.subject}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Received on{" "}
                      {new Date(selectedInquiry.createdAt).toLocaleString("en-PK", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </span>
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Applicant Profile Information Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-muted/40 border border-border/60">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                  Sender Name
                </span>
                <span className="text-sm font-bold text-foreground block">{selectedInquiry.fullName}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                  Direct WhatsApp / Call
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-foreground">{selectedInquiry.phone}</span>
                  <a
                    href={formatWhatsAppLink(
                      selectedInquiry.phone,
                      selectedInquiry.fullName,
                      selectedInquiry.submissionId
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px] font-bold"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                  Verified Email
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-foreground">{selectedInquiry.email}</span>
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                      `Re: [${selectedInquiry.submissionId}] ${selectedInquiry.subject} - Seneca Academy`
                    )}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-seneca-crimson/10 text-seneca-crimson hover:bg-seneca-crimson/20 text-[10px] font-bold"
                  >
                    <Mail className="h-3 w-3" />
                    <span>Send Email Response</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Complete Message Content */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Inquiry Content &amp; Details
              </span>
              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
                <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>
            </div>

            {/* Admin Notes Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Internal Administrative Notes
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveNotes}
                  disabled={updatingId === selectedInquiry.id}
                  className="h-7 text-xs font-bold text-seneca-crimson hover:bg-seneca-crimson/10 gap-1 rounded-lg"
                >
                  <Save className="h-3 w-3" />
                  <span>Save Note</span>
                </Button>
              </div>
              <textarea
                rows={3}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Log internal follow-up notes (e.g. 'Called on WhatsApp at 2 PM, scheduled campus tour for Saturday morning')..."
                className="w-full rounded-xl border border-input bg-transparent p-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Action State Buttons */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Update Status Workflow
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  size="sm"
                  variant={selectedInquiry.status === "in_progress" ? "default" : "outline"}
                  onClick={() => updateStatus(selectedInquiry.id, "in_progress")}
                  disabled={updatingId === selectedInquiry.id}
                  className="rounded-xl text-xs font-bold"
                >
                  Mark In Review
                </Button>

                <Button
                  size="sm"
                  variant={selectedInquiry.status === "replied" ? "default" : "outline"}
                  onClick={() => updateStatus(selectedInquiry.id, "replied")}
                  disabled={updatingId === selectedInquiry.id}
                  className={cn(
                    "rounded-xl text-xs font-bold",
                    selectedInquiry.status === "replied" && "bg-emerald-600 hover:bg-emerald-700 text-white"
                  )}
                >
                  Mark Replied
                </Button>

                <Button
                  size="sm"
                  variant={selectedInquiry.status === "archived" ? "default" : "outline"}
                  onClick={() => updateStatus(selectedInquiry.id, "archived")}
                  disabled={updatingId === selectedInquiry.id}
                  className="rounded-xl text-xs font-bold"
                >
                  Archive
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(selectedInquiry.id, "new")}
                  disabled={updatingId === selectedInquiry.id}
                  className="rounded-xl text-xs font-bold"
                >
                  Mark as New
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/60 flex sm:justify-between items-center w-full">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmId(selectedInquiry.id)}
                className="rounded-xl text-xs font-bold gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Message</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-xl text-xs font-bold"
              >
                Close Window
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 6. Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="max-w-md rounded-2xl p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to delete this contact submission? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-xl text-xs font-bold"
              >
                Permanently Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
