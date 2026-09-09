"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  X,
  Send,
  Eye,
  Edit3,
  Heart,
  MessageSquarePlus,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import FeedbackCard from "./FeedbackCard";
import { formValidators } from "@/lib/utils/validation";
import { IReviewsSubmissionSettings, IReviewsCategory, IReviewsRole } from "@/lib/db/reviews-page-defaults";

interface FeedbackSubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
  settings?: IReviewsSubmissionSettings;
  categories?: IReviewsCategory[];
  roles?: IReviewsRole[];
}

const DEFAULT_CATEGORIES = [
  "Academic Excellence",
  "Faculty & Mentorship",
  "Campus Facilities & Labs",
  "Discipline & Moral Values",
  "Admissions & Administration",
  "Sports & Extracurriculars",
  "General Review",
] as const;

const DEFAULT_ROLES = [
  { id: "Parent", label: "Parent / Guardian", desc: "Current student's parent" },
  { id: "Student", label: "Current Student", desc: "Studying at Seneca" },
  { id: "Alumni", label: "Alumnus / Graduate", desc: "Past student" },
  { id: "Prospective Parent", label: "Prospective Parent", desc: "Considering admission" },
  { id: "Visitor", label: "Campus Visitor", desc: "Attended event / tour" },
  { id: "Teacher", label: "Faculty Member", desc: "Teaching at Seneca" },
] as const;

const RATING_LABELS: Record<number, { text: string; emoji: string }> = {
  1: { text: "Needs Substantial Work", emoji: "😞" },
  2: { text: "Fair / Room for Growth", emoji: "😐" },
  3: { text: "Good Educational Experience", emoji: "🙂" },
  4: { text: "Very Good & Professional", emoji: "😊" },
  5: { text: "Exceptional & Highly Recommended!", emoji: "🌟" },
};

export function FeedbackSubmitModal({
  open,
  onOpenChange,
  onSubmitted,
  settings,
  categories,
  roles,
}: FeedbackSubmitModalProps) {
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [role, setRole] = useState<string>("Parent");
  const [category, setCategory] = useState<string>("Academic Excellence");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const currentRating = hoverRating || rating;

  const resetForm = () => {
    setRating(5);
    setRole("Parent");
    setCategory("Academic Excellence");
    setName("");
    setEmail("");
    setRelationship("");
    setTitle("");
    setComment("");
    setRecommend(true);
    setActiveTab("form");
    setIsSuccess(false);
    setFieldErrors({});
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    const nameVal = formValidators.validateName(name);
    if (!nameVal.isValid) errs.name = nameVal.error || "Invalid name";

    const emailVal = formValidators.validateEmail(email);
    if (!emailVal.isValid) errs.email = emailVal.error || "Invalid email";

    if (!title.trim() || title.trim().length < 3) {
      errs.title = "Please enter a summary title (at least 3 characters).";
    }

    const commentVal = formValidators.validateMessage(comment, 15, 1500);
    if (!commentVal.isValid) errs.comment = commentVal.error || "Review must be at least 15 characters.";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please resolve the highlighted validation errors.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          relationship: relationship.trim() || undefined,
          rating,
          category,
          title: title.trim(),
          comment: comment.trim(),
          recommend,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      setIsSuccess(true);
      toast.success("Thank you! Your review has been published.");
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewData = {
    name: name.trim() || "Your Name",
    role,
    relationship:
      relationship.trim() ||
      (role === "Parent"
        ? "Parent of Seneca Student"
        : role === "Alumni"
        ? "Seneca Alumnus"
        : role === "Student"
        ? "Current Seneca Student"
        : "Community Reviewer"),
    rating,
    category,
    title: title.trim() || "Your Review Headline Will Appear Here",
    comment:
      comment.trim() ||
      "Your detailed thoughts, personal reflections, and experiences regarding Seneca Academy's curriculum, faculty, and learning environment will be showcased here.",
    recommend,
    likesCount: 0,
    createdAt: new Date(),
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-border/80 bg-card shadow-2xl">
        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-seneca-amber">
                Community Feedback
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                Thank You for Your Feedback!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your review has been successfully published. Community reflections help prospective families discover Seneca Academy and guide our continuous improvement.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
                className="rounded-full px-8 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white font-bold"
              >
                Close Window
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-6 sm:p-8 text-white">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-seneca-amber/20 blur-2xl pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-300">
                    <Sparkles className="h-3 w-3" />
                    <span>Parent &amp; Community Voice</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                    {settings?.modalTitle || "Share Your Seneca Experience"}
                  </h3>
                  <p className="text-xs text-white/80">
                    {settings?.modalSubtitle ||
                      "Your authentic rating and remarks inspire future scholars and strengthen our community."}
                  </p>
                </div>
              </div>

              {/* View Form / Preview Switcher */}
              <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeTab === "form"
                      ? "bg-white text-seneca-crimson shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Write Feedback</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeTab === "preview"
                      ? "bg-white text-seneca-crimson shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Live Card Preview</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {activeTab === "preview" ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border text-center">
                    <p className="text-xs text-muted-foreground">
                      This is a live preview of how your review will appear on the public Seneca Academy feedback wall:
                    </p>
                  </div>
                  <FeedbackCard data={previewData} />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("form")}
                      className="rounded-full px-6 text-xs font-bold"
                    >
                      Back to Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="rounded-full px-7 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white text-xs font-bold shadow-md"
                    >
                      {isSubmitting ? "Publishing..." : "Submit Review Now"}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 1. Star Rating Interactive Selector */}
                  <div className="space-y-2.5 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Overall Academic &amp; Campus Rating
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          className="p-1 rounded-full hover:scale-125 focus:outline-none transition-transform"
                        >
                          <Star
                            className={cn(
                              "h-7 w-7 sm:h-8 sm:w-8 transition-colors duration-150",
                              star <= currentRating
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]"
                                : "text-muted-foreground/30 hover:text-amber-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="text-xs font-extrabold text-foreground flex items-center justify-center gap-1.5">
                      <span>{RATING_LABELS[currentRating]?.emoji}</span>
                      <span>{RATING_LABELS[currentRating]?.text}</span>
                    </div>
                  </div>

                  {/* 2. Role Selector Chips */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">
                      Your Affiliation / Role <span className="text-seneca-crimson">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(roles
                        ? roles.filter((r) => r.isActive && r.id !== "all").map((r) => ({ id: r.id, label: r.label, desc: "" }))
                        : DEFAULT_ROLES
                      ).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={cn(
                            "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                            role === r.id
                              ? "bg-seneca-crimson/10 border-seneca-crimson text-seneca-crimson dark:bg-seneca-amber/15 dark:border-seneca-amber dark:text-seneca-amber-light font-bold shadow-xs"
                              : "bg-card border-border hover:bg-muted text-muted-foreground font-medium"
                          )}
                        >
                          <span className="text-xs">{r.label}</span>
                          {r.desc && (
                            <span className="text-[10px] text-muted-foreground/80 font-normal">
                              {r.desc}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Category Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">
                      Review Category Focus <span className="text-seneca-crimson">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(categories
                        ? categories.filter((c) => c.isActive && c.id !== "all").map((c) => c.label)
                        : DEFAULT_CATEGORIES
                      ).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                            category === cat
                              ? "bg-seneca-crimson text-white dark:bg-seneca-amber dark:text-zinc-950 border-transparent shadow-xs font-bold"
                              : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Contact / Profile Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="name" className="text-xs font-bold text-foreground">
                          Your Full Name <span className="text-seneca-crimson">*</span>
                        </label>
                        <span className="text-[10px] text-muted-foreground">Letters only</span>
                      </div>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setName(e.target.value);
                          if (fieldErrors.name) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n.name;
                              return n;
                            });
                          }
                        }}
                        placeholder="e.g., Dr. Samina Rizvi"
                        required
                        className={cn("rounded-xl text-xs", fieldErrors.name && "border-rose-500 focus-visible:ring-rose-500")}
                      />
                      {fieldErrors.name && (
                        <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" />
                          <span>{fieldErrors.name}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-bold text-foreground">
                        Email Address <span className="text-seneca-crimson">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n.email;
                              return n;
                            });
                          }
                        }}
                        placeholder="e.g., parent@example.com"
                        required
                        className={cn("rounded-xl text-xs", fieldErrors.email && "border-rose-500 focus-visible:ring-rose-500")}
                      />
                      {fieldErrors.email && (
                        <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" />
                          <span>{fieldErrors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="relationship" className="text-xs font-bold text-foreground">
                      Student Grade / Association (Optional)
                    </label>
                    <Input
                      id="relationship"
                      value={relationship}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRelationship(e.target.value)}
                      placeholder="e.g., Parent of Grade 9 & Grade 6 Students or Class of 2022"
                      className="rounded-xl text-xs"
                    />
                  </div>

                  {/* 5. Review Title & Comment */}
                  <div className="space-y-1">
                    <label htmlFor="title" className="text-xs font-bold text-foreground">
                      Review Headline / Summary <span className="text-seneca-crimson">*</span>
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTitle(e.target.value);
                        if (fieldErrors.title) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n.title;
                            return n;
                          });
                        }
                      }}
                      placeholder="e.g., Inspiring teachers and state-of-the-art science labs"
                      maxLength={100}
                      required
                      className={cn("rounded-xl text-xs", fieldErrors.title && "border-rose-500 focus-visible:ring-rose-500")}
                    />
                    {fieldErrors.title && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="h-3 w-3" />
                        <span>{fieldErrors.title}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="comment" className="text-xs font-bold text-foreground">
                        Detailed Thoughts &amp; Remarks <span className="text-seneca-crimson">*</span>
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        {comment.length}/1500 chars (min 15)
                      </span>
                    </div>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setComment(e.target.value);
                        if (fieldErrors.comment) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n.comment;
                            return n;
                          });
                        }
                      }}
                      rows={4}
                      placeholder="Share your personal experience with Seneca Academy, our teachers, learning environment, moral values, and student growth..."
                      required
                      className={cn(
                        "w-full rounded-xl border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                        fieldErrors.comment && "border-rose-500 focus-visible:ring-rose-500"
                      )}
                    />
                    {fieldErrors.comment && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="h-3 w-3" />
                        <span>{fieldErrors.comment}</span>
                      </p>
                    )}
                  </div>

                  {/* 6. Recommend Checkbox */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                    <input
                      type="checkbox"
                      id="recommend"
                      checked={recommend}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecommend(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-seneca-crimson focus:ring-seneca-crimson accent-seneca-crimson cursor-pointer"
                    />
                    <label
                      htmlFor="recommend"
                      className="text-xs font-medium text-foreground cursor-pointer"
                    >
                      I wholeheartedly recommend Seneca Academy to prospective parents &amp; students.
                    </label>
                  </div>

                  {/* Submit Bar */}
                  <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      className="w-full sm:w-auto rounded-full text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto rounded-full px-8 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white text-xs font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all gap-2"
                    >
                      {isSubmitting ? (
                        <span>Publishing Review...</span>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Publish Review</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FeedbackSubmitModal;
