"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Building,
  GraduationCap,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarCheck,
  Bell,
  CheckCircle2,
  Crown,
  Layers,
  ArrowRight,
  Info,
  CalendarDays,
  FileText,
  Loader2,
  Filter,
  Search,
  School,
  ExternalLink,
  Flame,
  AlertCircle,
  MapPin,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SlotItem {
  id: string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  time: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  department: string;
  classId: string;
  className: string;
  gradeLevel: number;
  section: string;
  roomNumber: string;
  isHeadOfClass: boolean;
  notes: string;
}

interface HolidayItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  targetAudience: string;
}

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  icon: string;
  colorTheme: string;
  priority: string;
  publishedAt: string;
}

interface TimetableApiResponse {
  teacher: {
    id: string;
    name: string;
    employeeId: string;
    specialization: string;
    qualification: string;
    assignedClasses: Array<{ id: string; name: string; gradeLevel: number; section: string; stream: string; fullName: string }>;
    assignedSubjects: Array<{ id: string; name: string; code: string; department: string; creditHours: number }>;
    headOfClasses: Array<{ id: string; name: string; section: string; gradeLevel: number; fullName: string }>;
  };
  today: {
    dayName: string;
    dateFormatted: string;
    slots: Array<any>;
  };
  weeklySlots: SlotItem[];
  holidays: HolidayItem[];
  notices: NoticeItem[];
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const HOLIDAY_TYPE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: string; dotColor: string }
> = {
  national_holiday: {
    label: "National Holiday",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    icon: "🇵🇰",
    dotColor: "bg-emerald-500",
  },
  religious_holiday: {
    label: "Religious / Eid Holiday",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    icon: "🌙",
    dotColor: "bg-amber-500",
  },
  academic_break: {
    label: "Academic Term Break",
    badgeClass: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
    icon: "🏖️",
    dotColor: "bg-sky-500",
  },
  emergency_closure: {
    label: "Emergency Closure",
    badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    icon: "⚠️",
    dotColor: "bg-rose-500",
  },
  school_event: {
    label: "Campus Event / Annual Day",
    badgeClass: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    icon: "🎉",
    dotColor: "bg-purple-500",
  },
  exam_prep: {
    label: "Preparatory Leave",
    badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400",
    icon: "📚",
    dotColor: "bg-indigo-500",
  },
};

export default function TeacherTimetablePage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "today" | "calendar">("weekly");
  const [data, setData] = useState<TimetableApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters for weekly matrix
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("All Days");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Month navigation for calendar view
  const [currentDate, setCurrentDate] = useState(new Date());

  // Day inspection modal
  const [selectedDateModal, setSelectedDateModal] = useState<Date | null>(null);

  useEffect(() => {
    fetchTeacherTimetable();
  }, []);

  const fetchTeacherTimetable = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/timetable");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        toast.error(json.error?.message || "Failed to load timetable.");
      }
    } catch (err) {
      toast.error("Failed to fetch teaching timetable.");
    } finally {
      setLoading(false);
    }
  };

  const weeklySlots: SlotItem[] = data?.weeklySlots || [];
  const todaySlots = data?.today?.slots || [];
  const holidays: HolidayItem[] = data?.holidays || [];
  const notices: NoticeItem[] = data?.notices || [];
  const teacher = data?.teacher;

  // Filter weekly slots based on day, class, and search query
  const filteredWeeklySlots = useMemo(() => {
    return weeklySlots.filter((slot) => {
      // Day filter
      if (selectedDayFilter !== "All Days" && slot.dayOfWeek.toLowerCase() !== selectedDayFilter.toLowerCase()) {
        return false;
      }
      // Class filter
      if (selectedClassFilter !== "all" && slot.classId !== selectedClassFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubject = slot.subjectName.toLowerCase().includes(q) || slot.subjectCode.toLowerCase().includes(q);
        const matchClass = slot.className.toLowerCase().includes(q);
        const matchRoom = slot.roomNumber.toLowerCase().includes(q);
        if (!matchSubject && !matchClass && !matchRoom) return false;
      }
      return true;
    });
  }, [weeklySlots, selectedDayFilter, selectedClassFilter, searchQuery]);

  // Group weekly slots by day
  const slotsByDay = useMemo(() => {
    const map: Record<string, SlotItem[]> = {};
    DAYS_OF_WEEK.forEach((d) => (map[d] = []));
    filteredWeeklySlots.forEach((s) => {
      if (map[s.dayOfWeek]) {
        map[s.dayOfWeek].push(s);
      }
    });
    Object.keys(map).forEach((d) => {
      map[d].sort((a, b) => a.periodNumber - b.periodNumber);
    });
    return map;
  }, [filteredWeeklySlots]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Check holidays for a specific date
  const getHolidaysForDate = (targetDate: Date) => {
    return holidays.filter((h) => {
      const start = new Date(h.startDate);
      const end = new Date(h.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return targetDate >= start && targetDate <= end;
    });
  };

  // Get scheduled classes for a specific date's day of week
  const getClassesForDate = (targetDate: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[targetDate.getDay()];
    return weeklySlots.filter((s) => s.dayOfWeek.toLowerCase() === dayName.toLowerCase());
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-6">
        <div className="h-36 rounded-3xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-3xl bg-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2 md:px-4 pb-16 overflow-x-hidden">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-rose-600/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <CalendarCheck className="h-3 w-3 text-seneca-amber" />
                <span>Faculty Academic Schedule</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
                <span>Active Session 2026</span>
              </span>

              {teacher?.employeeId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] sm:text-[11px] font-mono font-bold border border-sky-500/30">
                  {teacher.employeeId}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading tracking-tight text-white truncate">
              Teaching Timetable & School Calendar
            </h1>

            <p className="text-xs sm:text-sm text-white/85 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{teacher?.name || "Faculty Member"}</span>
              <span className="text-white/40">•</span>
              <span>{teacher?.specialization || "Academic Faculty"}</span>
              {teacher?.headOfClasses && teacher.headOfClasses.length > 0 && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-seneca-amber-light font-bold flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Class Teacher ({teacher.headOfClasses.map((c) => c.fullName).join(", ")})
                  </span>
                </>
              )}
            </p>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 self-start md:self-auto overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("weekly")}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[38px] flex-1 sm:flex-initial justify-center",
                activeTab === "weekly"
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Weekly Matrix</span>
              <Badge variant="outline" className={cn("text-[9px] h-4 px-1 ml-0.5", activeTab === "weekly" ? "bg-zinc-950 text-white" : "bg-white/20 text-white")}>
                {weeklySlots.length}
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab("today")}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[38px] flex-1 sm:flex-initial justify-center",
                activeTab === "today"
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Today ({todaySlots.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[38px] flex-1 sm:flex-initial justify-center",
                activeTab === "calendar"
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>School Calendar</span>
              <Badge variant="outline" className={cn("text-[9px] h-4 px-1 ml-0.5", activeTab === "calendar" ? "bg-zinc-950 text-white" : "bg-white/20 text-white")}>
                {holidays.length}
              </Badge>
            </button>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center sm:text-left">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block">Weekly Classes</span>
            <span className="text-base sm:text-lg font-bold text-seneca-amber">
              {weeklySlots.length} Periods
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block">Today's Load</span>
            <span className="text-base sm:text-lg font-bold text-white">
              {todaySlots.length} Periods ({data?.today?.dayName})
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block">Assigned Classes</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400">
              {teacher?.assignedClasses?.length || 0} Sections
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block">School Calendar Events</span>
            <span className="text-base sm:text-lg font-bold text-sky-400">
              {holidays.length} Admin Leaves
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Workspaces */}

      {/* TAB 1: WEEKLY MATRIX VIEW */}
      {activeTab === "weekly" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-sm rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Day filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {["All Days", ...DAYS_OF_WEEK].map((day) => {
                  const count =
                    day === "All Days"
                      ? weeklySlots.length
                      : weeklySlots.filter((s) => s.dayOfWeek.toLowerCase() === day.toLowerCase()).length;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDayFilter(day)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 min-h-[34px]",
                        selectedDayFilter === day
                          ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                      )}
                    >
                      <span>{day}</span>
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.2 rounded-full font-mono font-extrabold",
                          selectedDayFilter === day ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Class filter dropdown & Search */}
              <div className="flex items-center gap-2">
                {teacher?.assignedClasses && teacher.assignedClasses.length > 0 && (
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Class Sections</option>
                    {teacher.assignedClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                )}

                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search subject, room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-8 pr-3 w-36 sm:w-44 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {DAYS_OF_WEEK.filter((d) => selectedDayFilter === "All Days" || selectedDayFilter === d).map((day) => {
              const daySlots = slotsByDay[day] || [];
              const isToday = day.toLowerCase() === data?.today?.dayName?.toLowerCase();

              return (
                <Card
                  key={day}
                  className={cn(
                    "rounded-2xl sm:rounded-3xl border border-border/80 shadow-md overflow-hidden bg-card/95 backdrop-blur-xl transition-all",
                    isToday && "ring-2 ring-seneca-crimson border-seneca-crimson/50"
                  )}
                >
                  <CardHeader className="p-3.5 sm:p-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-foreground">{day}</span>
                      {isToday && (
                        <Badge className="bg-seneca-crimson text-white text-[9px] font-extrabold uppercase px-1.5 py-0 h-4">
                          Today
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {daySlots.length} Period{daySlots.length === 1 ? "" : "s"}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-3.5 sm:p-4 space-y-3">
                    {daySlots.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground space-y-1">
                        <Clock className="h-6 w-6 mx-auto text-muted-foreground/40 mb-1" />
                        <p className="text-xs font-semibold">No classes scheduled for {day}</p>
                      </div>
                    ) : (
                      daySlots.map((s) => (
                        <div
                          key={s.id}
                          className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 hover:border-seneca-crimson/40 hover:bg-card transition-all space-y-2.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-seneca-crimson/10 text-seneca-crimson border border-seneca-crimson/20">
                              Period {s.periodNumber}
                            </span>
                            {s.isHeadOfClass && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1">
                                <Crown className="h-2.5 w-2.5" /> Class Teacher
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">
                              {s.subjectName}
                            </h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Class: <span className="font-semibold text-foreground">{s.className}</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1 font-mono font-medium text-foreground">
                              <Clock className="h-3 w-3 text-seneca-amber" />
                              {s.time}
                            </span>
                            <span className="flex items-center gap-1 font-medium bg-background px-1.5 py-0.5 rounded border border-border/60">
                              <Building className="h-3 w-3 text-primary" />
                              {s.roomNumber}
                            </span>
                          </div>

                          {/* Quick Actions Strip */}
                          <div className="pt-1.5 flex items-center gap-1.5">
                            <Link href={`/teacher/attendance?classId=${s.classId}`} className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 rounded-lg text-[10px] font-bold gap-1 text-seneca-crimson dark:text-seneca-amber hover:bg-seneca-crimson/10 border-seneca-crimson/30"
                              >
                                <CalendarCheck className="h-3 w-3" />
                                <span>Attendance</span>
                              </Button>
                            </Link>

                            <Link href={`/teacher/students?classId=${s.classId}`} className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 rounded-lg text-[10px] font-bold gap-1"
                              >
                                <Users className="h-3 w-3" />
                                <span>Students</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TODAY'S CLASS AGENDA */}
      {activeTab === "today" && (
        <div className="space-y-5">
          <Card className="rounded-2xl sm:rounded-3xl border border-border/80 shadow-xl overflow-hidden bg-card/95 backdrop-blur-xl">
            <CardHeader className="p-4 sm:p-6 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-seneca-crimson" />
                  <span>Today's Teaching Schedule ({data?.today?.dateFormatted})</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Immediate classroom actions, roll call, and period timelines.
                </CardDescription>
              </div>
              <Badge className="bg-seneca-crimson text-white text-xs font-bold px-3 py-1 self-start sm:self-center">
                {todaySlots.length} Periods Scheduled Today
              </Badge>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {todaySlots.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No teaching periods scheduled for today ({data?.today?.dayName}).</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Enjoy your curriculum preparation time, student mentoring, or department consultation hours!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaySlots.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border/80 hover:border-seneca-crimson/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="h-12 w-12 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson flex flex-col items-center justify-center font-extrabold text-sm shrink-0 border border-seneca-crimson/20">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none">Period</span>
                          <span className="text-base font-black leading-none mt-0.5">{s.periodNumber}</span>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-foreground truncate">{s.subject}</h4>
                            <Badge variant="outline" className="text-[9px] font-mono font-bold bg-background">
                              {s.subjectCode}
                            </Badge>
                            {s.isHeadOfClass && (
                              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold">
                                Head of Class
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Class: <strong className="text-foreground">{s.className}</strong></span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>Room: <strong className="text-foreground">{s.room}</strong></span>
                          </p>

                          <span className="text-xs font-mono font-bold text-seneca-amber flex items-center gap-1 mt-1">
                            <Clock className="h-3.5 w-3.5" /> {s.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                        <Link href={`/teacher/attendance?classId=${s.classId}`}>
                          <Button
                            size="sm"
                            className="rounded-xl text-xs font-bold bg-seneca-crimson hover:bg-seneca-crimson/90 text-white gap-1.5 shadow-md shadow-seneca-crimson/20 h-9"
                          >
                            <CalendarCheck className="h-3.5 w-3.5" />
                            <span>Mark Roll Call</span>
                          </Button>
                        </Link>
                        <Link href={`/teacher/students?classId=${s.classId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs font-bold gap-1.5 h-9"
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>Class Roster</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: INTERACTIVE SCHOOL CALENDAR & ADMIN HOLIDAYS */}
      {activeTab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left: Monthly Calendar Grid */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="rounded-2xl sm:rounded-3xl border border-border/80 shadow-xl overflow-hidden bg-card/95 backdrop-blur-xl">
              <CardHeader className="p-4 sm:p-5 border-b border-border/60 flex flex-row items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-seneca-crimson" />
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    {monthName}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    onClick={handlePrevMonth}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-xl"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setCurrentDate(new Date())}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-bold rounded-xl"
                  >
                    Today
                  </Button>
                  <Button
                    onClick={handleNextMonth}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-xl"
                    aria-label="Next Month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-3 sm:p-5">
                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-[11px] text-muted-foreground mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day Matrix */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[75px] rounded-xl bg-muted/5 opacity-30" />
                  ))}

                  {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const thisDate = new Date(year, month, dayNum);
                    const isToday = thisDate.toDateString() === new Date().toDateString();

                    const dayHolidays = getHolidaysForDate(thisDate);
                    const hasHoliday = dayHolidays.length > 0;
                    const primaryHoliday = dayHolidays[0];

                    const dayClasses = getClassesForDate(thisDate);
                    const hasClasses = dayClasses.length > 0;

                    const holidayConfig = primaryHoliday ? HOLIDAY_TYPE_CONFIG[primaryHoliday.type] : null;

                    return (
                      <div
                        key={dayNum}
                        onClick={() => setSelectedDateModal(thisDate)}
                        className={cn(
                          "min-h-[65px] sm:min-h-[80px] p-1 sm:p-1.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer hover:scale-[1.02]",
                          hasHoliday
                            ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
                            : "bg-card border-border/60 hover:bg-muted/30",
                          isToday && "ring-2 ring-seneca-crimson border-seneca-crimson/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center",
                              isToday ? "bg-seneca-crimson text-white font-extrabold" : "text-foreground"
                            )}
                          >
                            {dayNum}
                          </span>

                          {hasHoliday && (
                            <span className="text-[11px] leading-none">
                              {holidayConfig?.icon || "🏖️"}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-1">
                          {hasHoliday ? (
                            <div className="text-[8px] sm:text-[9px] font-bold truncate px-1 py-0.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200">
                              {primaryHoliday.title}
                            </div>
                          ) : hasClasses ? (
                            <div className="text-[8px] sm:text-[9px] font-semibold text-primary">
                              {dayClasses.length} Classes
                            </div>
                          ) : (
                            <div className="text-[8px] sm:text-[9px] text-muted-foreground/60">Off</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Official Admin School Calendar & Holiday Circulars */}
          <div className="lg:col-span-4 space-y-4">
            {/* List of Admin Configured Holidays */}
            <Card className="rounded-2xl sm:rounded-3xl border border-border/80 shadow-md p-4 sm:p-5 bg-card/95 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                <span className="text-xs sm:text-sm font-bold font-heading text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Admin School Leaves ({holidays.length})</span>
                </span>
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto no-scrollbar">
                {holidays.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground space-y-1">
                    <p className="text-xs font-semibold">No school leaves scheduled yet.</p>
                    <p className="text-[10px]">Official holidays configured by admin will appear here.</p>
                  </div>
                ) : (
                  holidays.map((h) => {
                    const cfg = HOLIDAY_TYPE_CONFIG[h.type] || {
                      label: "School Holiday",
                      badgeClass: "bg-muted text-muted-foreground",
                      icon: "🏖️",
                    };
                    const s = new Date(h.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const e = new Date(h.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });

                    return (
                      <div
                        key={h.id}
                        className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1 hover:border-amber-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5 truncate">
                            <span>{cfg.icon}</span>
                            <span className="truncate">{h.title}</span>
                          </span>
                          <Badge variant="outline" className={cn("text-[9px] font-bold shrink-0", cfg.badgeClass)}>
                            {cfg.label}
                          </Badge>
                        </div>
                        {h.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {h.description}
                          </p>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground block pt-1 border-t border-amber-500/10">
                          Dates: {s === e ? s : `${s} – ${e}`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Official Holiday Circulars / Broadcast Notices */}
            <Card className="rounded-2xl sm:rounded-3xl border border-border/80 shadow-md p-4 sm:p-5 bg-card/95 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                <span className="text-xs sm:text-sm font-bold font-heading text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Bell className="h-4 w-4 text-seneca-crimson" />
                  <span>Administrative Circulars</span>
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {notices.length} Notices
                </Badge>
              </div>

              <div className="space-y-2.5 max-h-[260px] overflow-y-auto no-scrollbar">
                {notices.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No recent holiday announcements.</p>
                ) : (
                  notices.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-2xl bg-muted/40 border border-border/70 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1 truncate">
                          <span>{n.icon || "📢"}</span>
                          <span className="truncate">{n.title}</span>
                        </span>
                        {n.priority === "urgent" && (
                          <Badge className="bg-rose-500 text-white text-[8px] px-1 py-0 font-extrabold shrink-0">
                            URGENT
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{n.content}</p>
                      <span className="text-[9px] text-muted-foreground block font-mono pt-1">
                        Published: {new Date(n.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 3. Day Inspection Modal */}
      {selectedDateModal && (
        <Dialog open={!!selectedDateModal} onOpenChange={(open) => !open && setSelectedDateModal(null)}>
          <DialogContent className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card/98 backdrop-blur-2xl p-4 sm:p-6 max-w-lg">
            <DialogHeader className="border-b border-border/60 pb-3">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-seneca-crimson" />
                <span>
                  {selectedDateModal.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Academic schedule and administrative event breakdown.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Holidays on this date */}
              {getHolidaysForDate(selectedDateModal).length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>School Holiday / Event</span>
                  </h4>
                  {getHolidaysForDate(selectedDateModal).map((h) => {
                    const cfg = HOLIDAY_TYPE_CONFIG[h.type];
                    return (
                      <div key={h.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-950 dark:text-amber-200">{h.title}</span>
                          <Badge variant="outline" className="text-[9px]">{cfg?.label || "Holiday"}</Badge>
                        </div>
                        {h.description && <p className="text-[11px] text-muted-foreground">{h.description}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* Scheduled Classes on this day */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-seneca-crimson" />
                  <span>Scheduled Teaching Classes ({getClassesForDate(selectedDateModal).length})</span>
                </h4>

                {getClassesForDate(selectedDateModal).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No teaching periods scheduled on this weekday.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                    {getClassesForDate(selectedDateModal).map((s) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-foreground">
                            Period {s.periodNumber}: {s.subjectName} ({s.className})
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {s.time} • Room: {s.roomNumber}
                          </span>
                        </div>
                        <Link href={`/teacher/attendance?classId=${s.classId}`}>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold rounded-lg">
                            Roll Call
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
