"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  GraduationCap,
  CreditCard,
  Briefcase,
  MessageSquare,
  ShieldAlert,
  Trash2,
  ChevronRight,
  Sparkles,
  Clock,
  X,
  FileText,
  HelpCircle,
  Award,
  FolderOpen,
  CalendarCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/lib/auth/permissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "admissions" | "fees" | "faculty" | "messages" | "security" | "assignments" | "quizzes" | "materials" | "attendance" | "exams";
  unread: boolean;
  href: string;
  createdAt?: string;
}

interface NotificationDropdownProps {
  userRole?: UserRole;
}

export function NotificationDropdown({ userRole }: NotificationDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread">("all");

  // Context determinations
  const isStudent = userRole === "student" || pathname?.startsWith("/student");
  const isTeacher = userRole === "teacher" || pathname?.startsWith("/teacher");

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success && data.data) {
        const notifs: NotificationItem[] = data.data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(data.data.unreadCount !== undefined ? data.data.unreadCount : notifs.filter(n => n.unread).length);
      }
    } catch (_) {
      // Fallback silently
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll every 45 seconds for new live notifications
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 45000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchNotifications(true);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnreadCount(0);

      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      if (!res.ok) throw new Error("Failed to mark all as read");
      toast.success("All notifications marked as read.");
    } catch (_) {
      toast.error("Error updating notifications.");
    }
  };

  const handleClearAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications([]);
      setUnreadCount(0);

      const res = await fetch("/api/notifications?all=true", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to clear tray");
      toast.info("Notification tray cleared.");
    } catch (_) {
      toast.error("Error clearing notification tray.");
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    // Mark as read in local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - (item.unread ? 1 : 0)));
    setOpen(false);

    // Call API to mark as read in background
    if (item.unread) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        });
      } catch (_) {}
    }

    if (item.href) {
      router.push(item.href);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => {
      const target = notifications.find((n) => n.id === id);
      return target?.unread ? Math.max(0, prev - 1) : prev;
    });

    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
    } catch (_) {}
  };

  const getCategoryIcon = (category: NotificationItem["category"]) => {
    switch (category) {
      case "admissions":
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case "fees":
        return <CreditCard className="h-4 w-4 text-seneca-amber" />;
      case "faculty":
        return <Briefcase className="h-4 w-4 text-indigo-500" />;
      case "messages":
        return <MessageSquare className="h-4 w-4 text-sky-500" />;
      case "security":
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      case "assignments":
        return <FileText className="h-4 w-4 text-seneca-crimson" />;
      case "quizzes":
        return <HelpCircle className="h-4 w-4 text-seneca-amber" />;
      case "materials":
        return <FolderOpen className="h-4 w-4 text-indigo-500" />;
      case "attendance":
        return <CalendarCheck className="h-4 w-4 text-emerald-500" />;
      case "exams":
        return <Award className="h-4 w-4 text-seneca-amber" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === "unread") return n.unread;
    return true;
  });

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-muted/80 transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4 text-foreground/80" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-seneca-crimson px-1 text-[9.5px] font-black text-white shadow-md animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[320px] sm:w-[380px] md:w-[400px] rounded-2xl sm:rounded-3xl p-0 shadow-2xl border border-border/80 bg-card/98 backdrop-blur-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200 z-50 max-w-[95vw]"
      >
        {/* Header Strip */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-b from-muted/60 to-transparent border-b border-border/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-seneca-crimson/10 text-seneca-crimson shrink-0">
                <Bell className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-xs sm:text-sm font-bold text-foreground leading-none truncate">
                  {isStudent
                    ? "Student Notifications"
                    : isTeacher
                    ? "Faculty Notifications"
                    : "Campus Alerts"}
                </h3>
                <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                  {unreadCount} Unread Alert{unreadCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[10.5px] font-bold text-seneca-crimson hover:bg-seneca-crimson/10 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Mark Read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Clear notification tray"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Pill Controls */}
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/40 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedFilter("all")}
              className={cn(
                "px-2.5 py-0.5 rounded-full font-bold transition-all text-[10px]",
                selectedFilter === "all"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("unread")}
              className={cn(
                "px-2.5 py-0.5 rounded-full font-bold transition-all text-[10px]",
                selectedFilter === "unread"
                  ? "bg-seneca-crimson text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List Body */}
        <div className="max-h-[340px] sm:max-h-[360px] overflow-y-auto divide-y divide-border/40 p-1.5 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-seneca-crimson dark:text-seneca-amber" />
              <p className="text-xs font-bold text-muted-foreground">Checking live alerts...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                <Sparkles className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-xs font-bold text-foreground">All caught up!</p>
              <p className="text-[11px] text-muted-foreground max-w-[220px]">
                {selectedFilter === "unread"
                  ? "You have no unread notifications right now."
                  : "No recent alerts found in your notifications tray."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "group relative flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all hover:bg-muted/60",
                  item.unread ? "bg-seneca-amber/5 dark:bg-seneca-amber/10" : "opacity-80 hover:opacity-100"
                )}
              >
                {/* Unread indicator dot */}
                {item.unread && (
                  <span className="absolute left-1 sm:left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-seneca-crimson shadow-xs" />
                )}

                {/* Category Icon Frame */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-card border border-border/80 shadow-xs shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4
                      className={cn(
                        "text-xs leading-snug truncate",
                        item.unread ? "font-bold text-foreground" : "font-semibold text-muted-foreground"
                      )}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[9.5px] font-mono text-muted-foreground/80 shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed break-words">
                    {item.description}
                  </p>
                </div>

                {/* Dismiss X button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                  title="Dismiss alert"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Link Strip */}
        <div className="p-2.5 bg-muted/40 border-t border-border/60 text-center">
          <Link
            href={
              isStudent
                ? "/student/messages"
                : isTeacher
                ? "/teacher/messages"
                : "/dashboard/audit-logs"
            }
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-seneca-crimson dark:text-seneca-amber hover:underline"
          >
            <span>
              {isStudent || isTeacher
                ? "Open Communications Desk"
                : "View System Audit & Activity"}
            </span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationDropdown;
