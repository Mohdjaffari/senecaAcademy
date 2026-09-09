"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Layers,
  Flag,
  Sun,
  Umbrella,
  Flame,
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

export interface HolidayItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: "national_holiday" | "religious_holiday" | "summer_break" | "winter_break" | "administrative_closure" | "heatwave_alert" | "rain_emergency" | "exam_prep";
  targetAudience: "all" | "teachers" | "students";
  isMultiDay: boolean;
  durationDays: number;
  monthName: string;
  year: number;
  autoCreateNotice?: boolean;
}

const HOLIDAY_TYPE_CONFIG: Record<string, { label: string; badgeClass: string; icon: string; dotColor: string }> = {
  national_holiday: {
    label: "National Holiday",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: "🇵🇰",
    dotColor: "bg-emerald-500",
  },
  religious_holiday: {
    label: "Religious / Eid",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: "🌙",
    dotColor: "bg-amber-500",
  },
  summer_break: {
    label: "Summer Vacation",
    badgeClass: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    icon: "☀️",
    dotColor: "bg-orange-500",
  },
  winter_break: {
    label: "Winter Vacation",
    badgeClass: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    icon: "❄️",
    dotColor: "bg-sky-500",
  },
  heatwave_alert: {
    label: "Heatwave Alert Closure",
    badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    icon: "🔥",
    dotColor: "bg-rose-500",
  },
  rain_emergency: {
    label: "Rain Emergency / Monsoon",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: "🌧️",
    dotColor: "bg-blue-500",
  },
  administrative_closure: {
    label: "Admin / School Closure",
    badgeClass: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: "🏛️",
    dotColor: "bg-purple-500",
  },
  exam_prep: {
    label: "Preparatory Leave",
    badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    icon: "📚",
    dotColor: "bg-indigo-500",
  },
};

export default function AdminCalendarHolidaysPage() {
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayItem | null>(null);
  const [holidayToDelete, setHolidayToDelete] = useState<HolidayItem | null>(null);

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formType, setFormType] = useState<HolidayItem["type"]>("national_holiday");
  const [formAudience, setFormAudience] = useState<"all" | "teachers" | "students">("all");
  const [formAutoNotice, setFormAutoNotice] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/holidays");
      const data = await res.json();
      if (data.success) {
        setHolidays(data.data.holidays || []);
      }
    } catch (err) {
      toast.error("Failed to load school holiday calendar.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleOpenAddModal = (dateStr?: string) => {
    setEditingHoliday(null);
    setFormTitle("");
    setFormDescription("");
    const todayStr = dateStr || new Date().toISOString().split("T")[0];
    setFormStartDate(todayStr);
    setFormEndDate(todayStr);
    setFormType("national_holiday");
    setFormAudience("all");
    setFormAutoNotice(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (holiday: HolidayItem) => {
    setEditingHoliday(holiday);
    setFormTitle(holiday.title);
    setFormDescription(holiday.description);
    setFormStartDate(new Date(holiday.startDate).toISOString().split("T")[0]);
    setFormEndDate(new Date(holiday.endDate).toISOString().split("T")[0]);
    setFormType(holiday.type);
    setFormAudience(holiday.targetAudience);
    setFormAutoNotice(!!holiday.autoCreateNotice);
    setModalOpen(true);
  };

  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStartDate || !formEndDate) {
      toast.error("Please fill title, start date, and end date.");
      return;
    }

    setSaving(true);
    try {
      if (editingHoliday) {
        const res = await fetch(`/api/holidays/${editingHoliday.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            description: formDescription.trim(),
            startDate: formStartDate,
            endDate: formEndDate,
            type: formType,
            targetAudience: formAudience,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update holiday.");
        toast.success("Holiday record updated successfully.");
      } else {
        const res = await fetch("/api/holidays", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            description: formDescription.trim(),
            startDate: formStartDate,
            endDate: formEndDate,
            type: formType,
            targetAudience: formAudience,
            autoCreateNotice: formAutoNotice,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to declare holiday.");
        toast.success(
          formAutoNotice
            ? "Holiday scheduled & official school notice broadcasted!"
            : "School holiday scheduled successfully."
        );
      }

      setModalOpen(false);
      fetchHolidays(true);
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHoliday = (holiday: HolidayItem) => {
    setHolidayToDelete(holiday);
  };

  const handleConfirmDeleteHoliday = async () => {
    if (!holidayToDelete) return;
    const holidayId = holidayToDelete.id;

    // Optimistic UI update
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));

    try {
      const res = await fetch(`/api/holidays/${holidayId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete holiday.");
      toast.success("Holiday removed.");
      fetchHolidays(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete.");
      fetchHolidays(true);
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Compute days in month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Filtered list
  const filteredHolidays = holidays.filter((h) => {
    const matchesType = filterType === "all" || h.type === filterType;
    const matchesSearch =
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-card via-card to-amber-500/5 border border-border shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Academic Calendar & Leaves</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            School Holidays & Leave Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Declare school-wide holidays, seasonal vacations, and send automated official notices to students & faculty.
          </p>
        </div>

        <Button
          onClick={() => handleOpenAddModal()}
          className="rounded-xl text-xs font-bold bg-seneca-crimson hover:bg-seneca-crimson/90 text-white gap-1.5 shadow-md shadow-seneca-crimson/20 self-start md:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Declare School Holiday</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border p-4 bg-card space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Scheduled Leaves</span>
          <p className="text-2xl font-extrabold text-foreground">{holidays.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> All terms combined
          </span>
        </Card>

        <Card className="rounded-2xl border-border p-4 bg-card space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">National & Religious</span>
          <p className="text-2xl font-extrabold text-seneca-amber">
            {holidays.filter((h) => h.type === "national_holiday" || h.type === "religious_holiday").length}
          </p>
          <span className="text-[10px] text-muted-foreground font-medium">Public Gazetted Holidays</span>
        </Card>

        <Card className="rounded-2xl border-border p-4 bg-card space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Academic Breaks</span>
          <p className="text-2xl font-extrabold text-sky-600">
            {holidays.filter((h) => h.type === "summer_break" || h.type === "winter_break").length}
          </p>
          <span className="text-[10px] text-muted-foreground font-medium">Spring / Summer / Winter</span>
        </Card>

        <Card className="rounded-2xl border-border p-4 bg-card space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Auto-Notices Broadcast</span>
          <p className="text-2xl font-extrabold text-primary">
            {holidays.filter((h) => h.autoCreateNotice).length}
          </p>
          <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
            <Bell className="h-3 w-3" /> Published to Portal Feed
          </span>
        </Card>
      </div>

      {/* Main Grid: Interactive Calendar & Leaves List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Calendar View */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-seneca-crimson" />
                <CardTitle className="text-base font-bold">{monthName}</CardTitle>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  onClick={handlePrevMonth}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setCurrentDate(new Date())}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs font-bold rounded-lg"
                >
                  Today
                </Button>
                <Button
                  onClick={handleNextMonth}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-muted-foreground mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty slots before first day of month */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[70px] rounded-xl bg-muted/10 opacity-30" />
                ))}

                {/* Days of Month */}
                {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const thisDate = new Date(year, month, dayNum);
                  const isToday =
                    thisDate.toDateString() === new Date().toDateString();

                  // Find holidays on this day
                  const dayHolidays = holidays.filter((h) => {
                    const start = new Date(h.startDate);
                    const end = new Date(h.endDate);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return thisDate >= start && thisDate <= end;
                  });

                  const hasHoliday = dayHolidays.length > 0;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

                  return (
                    <div
                      key={dayNum}
                      onClick={() => handleOpenAddModal(dateStr)}
                      className={cn(
                        "min-h-[75px] sm:min-h-[85px] p-1.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer hover:border-seneca-crimson/50",
                        hasHoliday
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm"
                          : "bg-card border-border/60 hover:bg-muted/30",
                        isToday && "ring-2 ring-seneca-crimson"
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
                          <span className="text-[11px]">{HOLIDAY_TYPE_CONFIG[dayHolidays[0].type]?.icon || "🏖️"}</span>
                        )}
                      </div>

                      {/* Holiday Badge Chips */}
                      <div className="space-y-1 mt-1">
                        {dayHolidays.slice(0, 2).map((h) => (
                          <div
                            key={h.id}
                            className="text-[9px] font-bold truncate px-1 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30"
                            title={h.title}
                          >
                            {h.title}
                          </div>
                        ))}
                        {dayHolidays.length > 2 && (
                          <span className="text-[8px] font-bold text-muted-foreground">
                            +{dayHolidays.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Scheduled Holidays List & Notices */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-seneca-crimson" />
                  <span>Scheduled Leaves & Notices</span>
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {filteredHolidays.length} Records
                </Badge>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search holidays..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-xl"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-8 px-2 rounded-xl border border-input bg-background text-[11px] font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="national_holiday">National</option>
                  <option value="religious_holiday">Religious</option>
                  <option value="academic_break">Term Break</option>
                  <option value="emergency_closure">Emergency</option>
                  <option value="school_event">School Event</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-4 max-h-[520px] overflow-y-auto divide-y divide-border/60">
              {filteredHolidays.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground space-y-2">
                  <p className="text-xs">No school holidays match your filter.</p>
                  <Button
                    onClick={() => handleOpenAddModal()}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold"
                  >
                    Add School Holiday
                  </Button>
                </div>
              ) : (
                filteredHolidays.map((h) => {
                  const conf = HOLIDAY_TYPE_CONFIG[h.type] || HOLIDAY_TYPE_CONFIG.national_holiday;
                  const sDate = new Date(h.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const eDate = new Date(h.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const isSingle = sDate === eDate;

                  return (
                    <div key={h.id} className="py-3 px-2 space-y-2 hover:bg-muted/30 rounded-xl transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{conf.icon}</span>
                          <div>
                            <h4 className="font-bold text-xs text-foreground">{h.title}</h4>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {isSingle ? sDate : `${sDate} – ${eDate}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(h)}
                            className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(h)}
                            className="h-7 w-7 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-rose-500"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {h.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 pl-7">
                          {h.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pl-7 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Badge className={cn("text-[9px] font-bold px-1.5 py-0.5", conf.badgeClass)}>
                            {conf.label}
                          </Badge>
                          <Badge variant="outline" className="text-[9px]">
                            {h.targetAudience === "all"
                              ? "All School"
                              : h.targetAudience === "teachers"
                              ? "Faculty Only"
                              : "Students Only"}
                          </Badge>
                        </div>

                        {h.autoCreateNotice && (
                          <span className="text-[10px] font-semibold text-seneca-amber flex items-center gap-1">
                            <Send className="h-2.5 w-2.5" /> Notice Sent
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add / Edit Holiday Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-border">
          <DialogHeader className="space-y-1 pb-2 border-b border-border">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
              <CalendarIcon className="h-4 w-4" />
              <span>{editingHoliday ? "Modify School Holiday" : "Declare School Holiday / Leave"}</span>
            </div>
            <DialogTitle className="text-lg font-extrabold font-heading text-foreground">
              {editingHoliday ? "Edit Holiday Details" : "Schedule Campus Holiday & Publish Notice"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set calendar leave dates, holiday type, target audience, and automatically alert students and faculty.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveHoliday} className="space-y-4 pt-2">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Holiday / Leave Title</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Pakistan Independence Day, Spring Vacation"
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>

            {/* Type & Target Audience */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Holiday Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="national_holiday">National Holiday 🇵🇰</option>
                  <option value="religious_holiday">Religious / Eid Holiday 🌙</option>
                  <option value="academic_break">Academic Term Break 🏖️</option>
                  <option value="emergency_closure">Emergency Weather / Closure ⚠️</option>
                  <option value="school_event">Campus Event / Annual Day 🎉</option>
                  <option value="exam_prep">Preparatory Leave 📚</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Applicable For</label>
                <select
                  value={formAudience}
                  onChange={(e) => setFormAudience(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All School (Students & Faculty)</option>
                  <option value="teachers">Faculty & Staff Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Start Date</label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => {
                    setFormStartDate(e.target.value);
                    if (!formEndDate || formEndDate < e.target.value) {
                      setFormEndDate(e.target.value);
                    }
                  }}
                  className="h-10 text-xs rounded-xl font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">End Date</label>
                <Input
                  type="date"
                  value={formEndDate}
                  min={formStartDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="h-10 text-xs rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            {/* Description & Notice Content */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Description / Notice Content
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Details of the leave, campus closure instructions, or resume date..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Auto Broadcast Notice Checkbox */}
            {!editingHoliday && (
              <div className="p-3 rounded-2xl bg-seneca-crimson/5 border border-seneca-crimson/20 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="autoNoticeCheck"
                  checked={formAutoNotice}
                  onChange={(e) => setFormAutoNotice(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-seneca-crimson focus:ring-seneca-crimson"
                />
                <label htmlFor="autoNoticeCheck" className="text-xs cursor-pointer">
                  <span className="font-bold text-foreground block">
                    Auto-Broadcast Notice to Students & Faculty
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Automatically publishes an official bulletin banner on student and faculty dashboards with urgent alerts.
                  </span>
                </label>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl text-xs font-bold bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-md shadow-seneca-crimson/20"
              >
                {saving ? "Saving..." : editingHoliday ? "Save Changes" : "Declare Holiday & Alert"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Holiday Confirmation Dialog */}
      <ConfirmDialog
        open={!!holidayToDelete}
        onOpenChange={(open) => !open && setHolidayToDelete(null)}
        title="Remove Calendar Holiday?"
        description={`Are you sure you want to remove '${holidayToDelete?.title}' (${holidayToDelete?.startDate}) from the school calendar?`}
        confirmText="Yes, Remove Holiday"
        variant="destructive"
        icon="trash"
        onConfirm={handleConfirmDeleteHoliday}
      />
    </div>
  );
}
