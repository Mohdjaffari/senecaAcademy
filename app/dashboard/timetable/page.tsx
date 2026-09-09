"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit,
  Users,
  BookOpen,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Printer,
  ChevronRight,
  Search,
  Crown,
  Info,
  CalendarCheck,
  RefreshCw,
  Sliders,
  Zap,
  Check,
  X,
  Layers,
  ArrowRight,
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

interface TeacherItem {
  id: string;
  name: string;
  employeeId: string;
  specialization: string;
  qualification: string;
  assignedClasses: string[];
  assignedSubjects: string[];
  assignedClassIds: string[];
  assignedSubjectIds: string[];
  assignedSubjectDetails?: { id: string; name: string; code: string }[];
  headOfClasses?: { id: string; fullName: string }[];
}

interface TimetableSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  employeeId: string;
  classId: string;
  className: string;
  gradeLevel: number;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  roomNumber: string;
  notes: string;
}

interface ClassItem {
  id: string;
  name: string;
  section: string;
  gradeLevel: number;
  fullName: string;
}

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  department: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PERIOD_PRESETS = [
  { period: 1, label: "Period 1", start: "08:30 AM", end: "09:15 AM", duration: "45m" },
  { period: 2, label: "Period 2", start: "09:15 AM", end: "10:00 AM", duration: "45m" },
  { period: 3, label: "Period 3", start: "10:15 AM", end: "11:00 AM", duration: "45m" },
  { period: 4, label: "Period 4", start: "11:00 AM", end: "11:45 AM", duration: "45m" },
  { period: 5, label: "Period 5", start: "12:30 PM", end: "01:15 PM", duration: "45m" },
  { period: 6, label: "Period 6", start: "01:15 PM", end: "02:00 PM", duration: "45m" },
  { period: 7, label: "Period 7", start: "02:00 PM", end: "02:45 PM", duration: "45m" },
  { period: 8, label: "Period 8", start: "02:45 PM", end: "03:30 PM", duration: "45m" },
];

const ROOM_PRESETS = [
  "Room 101",
  "Room 102",
  "Room 204",
  "Science Lab 1",
  "Physics Lab",
  "Chemistry Lab",
  "Computer Lab 1",
  "Auditorium",
  "Library Hall",
];

export default function AdminTimetablePage() {
  const searchParams = useSearchParams();
  const initialTeacherId = searchParams.get("teacherId");

  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");

  // Modal State for Adding/Editing Slot
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlot | null>(null);

  // Timing Mode: 'preset' or 'manual'
  const [timingMode, setTimingMode] = useState<"preset" | "manual">("preset");

  // Filter Mode for Class & Subject (Assigned vs All)
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  // Form fields
  const [formDay, setFormDay] = useState("Monday");
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formClassId, setFormClassId] = useState("");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formStartTime, setFormStartTime] = useState("08:30 AM");
  const [formEndTime, setFormEndTime] = useState("09:15 AM");
  const [formRoom, setFormRoom] = useState("Room 101");
  const [formNotes, setFormNotes] = useState("");
  const [overrideConflict, setOverrideConflict] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, sRes] = await Promise.all([
        fetch("/api/teachers"),
        fetch("/api/classes"),
        fetch("/api/subjects"),
      ]);

      const tData = await tRes.json();
      const cData = await cRes.json();
      const sData = await sRes.json();

      const teacherList: TeacherItem[] = tData.data?.teachers || [];
      setTeachers(teacherList);

      const classList: ClassItem[] = (cData.data?.classes || []).map((c: any) => ({
        id: c._id || c.id,
        name: c.name,
        section: c.section,
        gradeLevel: c.gradeLevel,
        fullName: `${c.name}-${c.section}`,
      }));
      setClasses(classList);

      const subjectList: SubjectItem[] = (sData.data?.subjects || []).map((s: any) => ({
        id: s._id || s.id,
        name: s.name,
        code: s.code,
        department: s.department,
      }));
      setSubjects(subjectList);

      // Select initial teacher from URL or default to first
      if (initialTeacherId && teacherList.some((t) => t.id === initialTeacherId)) {
        setSelectedTeacherId(initialTeacherId);
        fetchTeacherSlots(initialTeacherId);
      } else if (teacherList.length > 0) {
        setSelectedTeacherId(teacherList[0].id);
        fetchTeacherSlots(teacherList[0].id);
      }
    } catch (err) {
      toast.error("Failed to load initial timetable data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSlots = async (teacherId: string) => {
    try {
      const res = await fetch(`/api/timetables?teacherId=${teacherId}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.data.slots || []);
      }
    } catch (err) {
      toast.error("Failed to load timetable slots.");
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    fetchTeacherSlots(teacherId);
  };

  const selectedTeacher = useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId);
  }, [teachers, selectedTeacherId]);

  // Filter available classes and subjects for this teacher
  const teacherAvailableClasses = useMemo(() => {
    if (showAllClasses || !selectedTeacher || !selectedTeacher.assignedClassIds?.length) {
      return classes;
    }
    const filtered = classes.filter((c) => selectedTeacher.assignedClassIds.includes(c.id));
    return filtered.length > 0 ? filtered : classes;
  }, [selectedTeacher, classes, showAllClasses]);

  const teacherAvailableSubjects = useMemo(() => {
    if (showAllSubjects || !selectedTeacher || !selectedTeacher.assignedSubjectIds?.length) {
      return subjects;
    }
    const filtered = subjects.filter((s) => selectedTeacher.assignedSubjectIds.includes(s.id));
    return filtered.length > 0 ? filtered : subjects;
  }, [selectedTeacher, subjects, showAllSubjects]);

  const handleOpenAddModal = (day?: string, period?: number) => {
    setEditingSlot(null);
    setFormDay(day || "Monday");
    const p = period || 1;
    setFormPeriod(p);
    const preset = PERIOD_PRESETS.find((pr) => pr.period === p) || PERIOD_PRESETS[0];
    setFormStartTime(preset.start);
    setFormEndTime(preset.end);
    setTimingMode("preset");
    setShowAllClasses(false);
    setShowAllSubjects(false);
    setOverrideConflict(false);

    setFormClassId(teacherAvailableClasses[0]?.id || "");
    setFormSubjectId(teacherAvailableSubjects[0]?.id || "");
    setFormRoom("Room 101");
    setFormNotes("");
    setSlotModalOpen(true);
  };

  const handleOpenEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormDay(slot.dayOfWeek);
    setFormPeriod(slot.periodNumber);
    setFormClassId(slot.classId);
    setFormSubjectId(slot.subjectId);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormRoom(slot.roomNumber);
    setFormNotes(slot.notes);
    setTimingMode("manual");
    setOverrideConflict(true);
    setSlotModalOpen(true);
  };

  const handlePeriodPresetSelect = (preset: (typeof PERIOD_PRESETS)[0]) => {
    setFormPeriod(preset.period);
    setFormStartTime(preset.start);
    setFormEndTime(preset.end);
  };

  const handleAddDuration = (minutes: number) => {
    // Parse current start time or fallback to 08:30 AM
    try {
      const match = formStartTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      let hours = 8;
      let mins = 30;
      let isPM = false;
      if (match) {
        hours = parseInt(match[1], 10);
        mins = parseInt(match[2], 10);
        if (match[3] && match[3].toUpperCase() === "PM" && hours < 12) hours += 12;
        if (match[3] && match[3].toUpperCase() === "AM" && hours === 12) hours = 0;
      }
      const totalStartMins = hours * 60 + mins;
      const totalEndMins = totalStartMins + minutes;
      let endHours = Math.floor(totalEndMins / 60) % 24;
      let endMins = totalEndMins % 60;
      const endPeriod = endHours >= 12 ? "PM" : "AM";
      const displayHours = endHours % 12 === 0 ? 12 : endHours % 12;
      const formattedEnd = `${String(displayHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")} ${endPeriod}`;
      setFormEndTime(formattedEnd);
    } catch (_) {
      setFormEndTime("09:15 AM");
    }
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      toast.error("Please select a faculty member first.");
      return;
    }
    if (!formClassId || !formSubjectId) {
      toast.error("Please select both Class and Teaching Subject.");
      return;
    }

    setSaving(true);
    try {
      if (editingSlot) {
        const res = await fetch(`/api/timetables/${editingSlot.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: formClassId,
            subjectId: formSubjectId,
            dayOfWeek: formDay,
            periodNumber: formPeriod,
            startTime: formStartTime,
            endTime: formEndTime,
            roomNumber: formRoom,
            notes: formNotes,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update slot.");
        toast.success("Timetable slot updated successfully.");
      } else {
        const res = await fetch("/api/timetables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacherId: selectedTeacherId,
            classId: formClassId,
            subjectId: formSubjectId,
            dayOfWeek: formDay,
            periodNumber: formPeriod,
            startTime: formStartTime,
            endTime: formEndTime,
            roomNumber: formRoom,
            notes: formNotes,
            overrideConflict,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create slot.");
        toast.success("Period scheduled successfully.");
      }

      setSlotModalOpen(false);
      fetchTeacherSlots(selectedTeacherId);
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = (slot: TimetableSlot) => {
    setSlotToDelete(slot);
  };

  const handleConfirmDeleteSlot = async () => {
    if (!slotToDelete) return;
    const slotId = slotToDelete.id;

    // Optimistic UI update
    setSlots((prev) => prev.filter((s) => s.id !== slotId));

    try {
      const res = await fetch(`/api/timetables/${slotId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete slot.");
      toast.success("Timetable slot removed.");
      fetchTeacherSlots(selectedTeacherId);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete slot.");
      fetchTeacherSlots(selectedTeacherId);
    }
  };

  // Group slots by day
  const slotsByDay = useMemo(() => {
    const map: Record<string, TimetableSlot[]> = {};
    DAYS_OF_WEEK.forEach((d) => (map[d] = []));
    slots.forEach((s) => {
      if (map[s.dayOfWeek]) {
        map[s.dayOfWeek].push(s);
      }
    });
    // Sort each day by period
    Object.keys(map).forEach((d) => {
      map[d].sort((a, b) => a.periodNumber - b.periodNumber);
    });
    return map;
  }, [slots]);

  const filteredTeachers = teachers.filter((t) => {
    const s = teacherSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(s) ||
      t.employeeId.toLowerCase().includes(s) ||
      t.specialization.toLowerCase().includes(s)
    );
  });

  const selectedClassObj = classes.find((c) => c.id === formClassId);
  const selectedSubjectObj = subjects.find((s) => s.id === formSubjectId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-card via-card to-seneca-crimson/5 border border-border shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold uppercase tracking-wider">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Academic Schedule & LMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Teaching Timetable Scheduler
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure weekly period allocations, classrooms, and subject timings according to each teacher's assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Timetable</span>
          </Button>
          <Button
            onClick={() => handleOpenAddModal()}
            size="sm"
            className="rounded-xl text-xs font-bold bg-seneca-crimson hover:bg-seneca-crimson/90 text-white gap-1.5 shadow-md shadow-seneca-crimson/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Timetable Slot</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Teacher Selector & Profile + Weekly Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Teacher Selection & Overview */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/30">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Select Faculty Specialist</span>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {teachers.length} Faculty
                </Badge>
              </CardTitle>
              <div className="pt-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search name, ID..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-xl"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 max-h-[380px] overflow-y-auto divide-y divide-border/40">
              {filteredTeachers.map((t) => {
                const isSelected = t.id === selectedTeacherId;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTeacherChange(t.id)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 my-0.5",
                      isSelected
                        ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
                        : "hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                        isSelected ? "bg-white/20 text-white" : "bg-seneca-crimson/10 text-seneca-crimson"
                      )}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate">{t.name}</span>
                        <span
                          className={cn(
                            "text-[9px] font-mono px-1 rounded",
                            isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {t.employeeId}
                        </span>
                      </div>
                      <p className={cn("text-[11px] truncate", isSelected ? "text-white/80" : "text-muted-foreground")}>
                        {t.specialization}
                      </p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Teacher Teaching Dossier Card */}
          {selectedTeacher && (
            <Card className="rounded-2xl border-border shadow-sm p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-foreground">Teacher Profile</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                  Active Faculty
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Specialization</span>
                  <p className="font-bold text-foreground">{selectedTeacher.specialization}</p>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Assigned Subjects</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedTeacher.assignedSubjects || []).map((sub, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] font-medium bg-muted/40">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Assigned Classes</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedTeacher.assignedClasses || []).map((cls, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] font-medium">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedTeacher.headOfClasses && selectedTeacher.headOfClasses.length > 0 && (
                  <div className="p-2 rounded-xl bg-seneca-amber/10 border border-seneca-amber/20 text-[11px] text-seneca-amber font-semibold flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 shrink-0" />
                    <span>Head of Class: {selectedTeacher.headOfClasses.map((h) => h.fullName).join(", ")}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Weekly Timetable Schedule Matrix */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="p-5 pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-seneca-crimson" />
                  <span>
                    Weekly Timetable: {selectedTeacher ? selectedTeacher.name : "Select a Teacher"}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Weekly schedule matrix from Monday to Saturday ({slots.length} allocated periods).
                </CardDescription>
              </div>

              <Button
                onClick={() => handleOpenAddModal()}
                size="sm"
                className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Period</span>
              </Button>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {DAYS_OF_WEEK.map((day) => {
                const daySlots = slotsByDay[day] || [];
                return (
                  <div key={day} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                          {day}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {daySlots.length} Periods
                        </Badge>
                      </div>

                      <Button
                        onClick={() => handleOpenAddModal(day)}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px] font-bold text-seneca-crimson hover:bg-seneca-crimson/10 rounded-lg gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Slot</span>
                      </Button>
                    </div>

                    {daySlots.length === 0 ? (
                      <div className="p-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-center">
                        <p className="text-xs text-muted-foreground">
                          No teaching periods scheduled for {day}.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {daySlots.map((s) => (
                          <div
                            key={s.id}
                            className="p-3.5 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border hover:border-seneca-crimson/40 hover:shadow-md transition-all group relative space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-seneca-crimson/10 text-seneca-crimson">
                                Period {s.periodNumber}
                              </span>
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                <button
                                  onClick={() => handleOpenEditModal(s)}
                                  className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                                  title="Edit slot"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(s)}
                                  className="h-6 w-6 rounded-md hover:bg-rose-500/10 flex items-center justify-center text-rose-500"
                                  title="Delete slot"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-bold text-xs text-foreground truncate">
                                {s.subjectName}
                              </h4>
                              <p className="text-[11px] text-muted-foreground font-medium">
                                Class: <span className="text-foreground font-semibold">{s.className}</span>
                              </p>
                            </div>

                            <div className="pt-1 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="h-3 w-3 text-seneca-amber" />
                                {s.startTime} - {s.endTime}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-foreground">
                                <Building className="h-3 w-3 text-primary" />
                                {s.roomNumber}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROFESSIONAL REDESIGNED TIMETABLE MODAL (PRESET + FULL MANUAL CREATION)  */}
      {/* ========================================================================= */}
      <Dialog open={slotModalOpen} onOpenChange={setSlotModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-border/80 bg-card">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-seneca-crimson/10 text-seneca-crimson text-xs font-bold uppercase tracking-wider">
                <CalendarCheck className="h-3.5 w-3.5" />
                <span>{editingSlot ? "Modify Scheduled Slot" : "Timetable Allocation Builder"}</span>
              </div>
              {selectedTeacher && (
                <Badge variant="outline" className="text-[11px] font-bold">
                  {selectedTeacher.name} ({selectedTeacher.employeeId})
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
              {editingSlot ? "Edit Timetable Period" : "Schedule Teaching Period & Class Allocation"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure the day of the week, bell period timing, classroom facility, and assigned subject.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSlot} className="space-y-6 pt-2">
            {/* 1. Day of Week Pill Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-seneca-crimson" />
                <span>1. Select Day of Week</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = formDay === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormDay(d)}
                      className={cn(
                        "py-2.5 px-3 rounded-2xl text-xs font-extrabold transition-all border text-center flex flex-col items-center justify-center gap-0.5",
                        isSelected
                          ? "bg-seneca-crimson text-white border-seneca-crimson shadow-md shadow-seneca-crimson/25 scale-[1.02]"
                          : "bg-muted/40 hover:bg-muted text-foreground border-border/80"
                      )}
                    >
                      <span>{d.slice(0, 3)}</span>
                      <span className={cn("text-[9px] font-medium", isSelected ? "text-white/80" : "text-muted-foreground")}>
                        {d}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Timing Allocation Mode (Preset vs Full Manual Mode) */}
            <div className="space-y-3 p-4 rounded-2xl bg-muted/25 border border-border/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-border/50">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-seneca-amber" />
                  <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    2. Period &amp; Time Schedule
                  </span>
                </div>

                {/* Timing Mode Switcher */}
                <div className="flex items-center gap-1 p-1 bg-muted/80 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setTimingMode("preset")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                      timingMode === "preset"
                        ? "bg-card text-foreground shadow-sm font-extrabold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>Bell Presets</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimingMode("manual")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                      timingMode === "manual"
                        ? "bg-card text-foreground shadow-sm font-extrabold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Sliders className="h-3 w-3 text-seneca-crimson" />
                    <span>Custom Manual Timing</span>
                  </button>
                </div>
              </div>

              {/* Mode A: Bell Period Presets */}
              {timingMode === "preset" ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PERIOD_PRESETS.map((preset) => {
                      const isSelected = formPeriod === preset.period;
                      return (
                        <button
                          key={preset.period}
                          type="button"
                          onClick={() => handlePeriodPresetSelect(preset)}
                          className={cn(
                            "p-2.5 rounded-xl border text-left transition-all space-y-1 relative",
                            isSelected
                              ? "bg-seneca-crimson/10 border-seneca-crimson ring-1 ring-seneca-crimson"
                              : "bg-card hover:bg-muted/50 border-border/70"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-foreground">
                              {preset.label}
                            </span>
                            <span className="text-[9px] font-mono px-1 rounded bg-muted text-muted-foreground font-semibold">
                              {preset.duration}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono font-medium text-seneca-amber">
                            {preset.start}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            to {preset.end}
                          </p>
                          {isSelected && (
                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-seneca-crimson" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Mode B: Full Custom Manual Entry */
                <div className="space-y-3 bg-card p-3.5 rounded-xl border border-border/80">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Period Number</label>
                      <select
                        value={formPeriod}
                        onChange={(e) => setFormPeriod(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            Period {n}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Start Time</label>
                      <Input
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        placeholder="e.g. 08:30 AM"
                        className="h-10 text-xs rounded-xl font-mono font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">End Time</label>
                      <Input
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        placeholder="e.g. 09:15 AM"
                        className="h-10 text-xs rounded-xl font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  {/* Duration Extenders */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold mr-1">
                      Quick Duration:
                    </span>
                    {[30, 40, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleAddDuration(mins)}
                        className="text-[10px] px-2 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted font-mono font-medium text-foreground transition-all"
                      >
                        +{mins}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Class & Subject Allocations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Class Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>Class &amp; Section</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAllClasses((prev) => !prev)}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    {showAllClasses ? "Show Assigned Only" : "Browse All School Classes"}
                  </button>
                </div>

                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select Class --</option>
                  {teacherAvailableClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} (Grade {c.gradeLevel})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-foreground">
                  {showAllClasses
                    ? "Showing all school classes"
                    : `Filtered to teacher's ${teacherAvailableClasses.length} assigned classes`}
                </span>
              </div>

              {/* Subject Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>Teaching Subject</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAllSubjects((prev) => !prev)}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    {showAllSubjects ? "Show Assigned Only" : "Browse All Subjects"}
                  </button>
                </div>

                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select Subject --</option>
                  {teacherAvailableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code || s.department})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-foreground">
                  {showAllSubjects
                    ? "Showing all curriculum subjects"
                    : `Filtered to teacher's ${teacherAvailableSubjects.length} assigned subjects`}
                </span>
              </div>
            </div>

            {/* 4. Classroom / Lab Facility with Quick Preset Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-primary" />
                <span>Classroom / Lab Location</span>
              </label>

              <div className="flex flex-wrap gap-1.5">
                {ROOM_PRESETS.map((rm) => (
                  <button
                    key={rm}
                    type="button"
                    onClick={() => setFormRoom(rm)}
                    className={cn(
                      "text-[10px] px-2.5 py-1 rounded-xl border transition-all font-medium",
                      formRoom === rm
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/80"
                    )}
                  >
                    {rm}
                  </button>
                ))}
              </div>

              <Input
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
                placeholder="Or type custom room e.g. Senior Wing Lab 3"
                className="h-10 text-xs rounded-xl"
              />
            </div>

            {/* 5. Special Instructions & Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Session Instructions / Notes (Optional)
              </label>
              <Input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Lab practical session, Cambridge O-Level past paper revision"
                className="h-10 text-xs rounded-xl"
              />
            </div>

            {/* 6. Live Schedule Preview Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-seneca-crimson/5 via-card to-amber-500/5 border border-border/80 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Live Allocation Preview:
                </span>
                <p className="font-bold text-foreground">
                  <span className="text-seneca-crimson font-extrabold">{formDay}</span> •{" "}
                  <span>Period {formPeriod}</span> ({formStartTime} - {formEndTime})
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {selectedSubjectObj?.name || "Subject"} for{" "}
                  <span className="font-semibold text-foreground">
                    {selectedClassObj?.fullName || "Class"}
                  </span>{" "}
                  • {formRoom || "Room"}
                </p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                Ready to Schedule
              </Badge>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSlotModalOpen(false)}
                className="rounded-xl text-xs w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl text-xs font-bold bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-md shadow-seneca-crimson/20 w-full sm:w-auto px-6 h-10"
              >
                {saving ? "Scheduling..." : editingSlot ? "Save Changes" : "Create Timetable Period"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Timetable Period Confirmation Dialog */}
      <ConfirmDialog
        open={!!slotToDelete}
        onOpenChange={(open) => !open && setSlotToDelete(null)}
        title="Remove Timetable Period?"
        description={`Are you sure you want to remove ${slotToDelete?.subjectName} (${slotToDelete?.className}, Period ${slotToDelete?.periodNumber}) on ${slotToDelete?.dayOfWeek}?`}
        confirmText="Yes, Remove Period"
        variant="destructive"
        icon="trash"
        onConfirm={handleConfirmDeleteSlot}
      />
    </div>
  );
}
