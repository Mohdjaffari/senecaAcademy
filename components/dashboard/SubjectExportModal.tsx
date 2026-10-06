"use client";

import { useState, useMemo } from "react";
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  GraduationCap,
  Users,
  Shield,
  FileText,
  BookOpen,
  Settings2,
  Sparkles,
  Check,
  Building,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ExportSubjectData {
  id: string;
  name: string;
  code: string;
  department: string;
  creditHours: number;
  description: string;
  offeringClasses?: string[];
  classIds?: string[];
  assignedClasses?: Array<{
    id: string;
    name: string;
    section: string;
    gradeLevel: number;
    stream?: string;
    fullName: string;
  }>;
  assignedTeachers?: Array<{
    id: string;
    name: string;
    employeeId?: string;
    specialization?: string;
  }>;
  createdAt?: string;
}

interface SubjectExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredSubjects: ExportSubjectData[];
  allSubjects: ExportSubjectData[];
  departments: string[];
}

interface ColumnDefinition {
  id: string;
  label: string;
  category: "basic" | "curriculum" | "faculty";
  accessor: (s: ExportSubjectData) => string;
}

const ALL_EXPORT_COLUMNS: ColumnDefinition[] = [
  { id: "code", label: "Subject Code", category: "basic", accessor: (s) => s.code || "" },
  { id: "name", label: "Subject Title", category: "basic", accessor: (s) => s.name || "" },
  { id: "department", label: "Academic Department", category: "basic", accessor: (s) => s.department || "General" },
  { id: "creditHours", label: "Weekly Credit Hours / Periods", category: "curriculum", accessor: (s) => String(s.creditHours || 3) },
  { id: "classesCount", label: "Offering Classes Count", category: "curriculum", accessor: (s) => String(s.classIds?.length || s.assignedClasses?.length || 0) },
  {
    id: "classesList",
    label: "Assigned Classes Details",
    category: "curriculum",
    accessor: (s) => {
      if (s.assignedClasses && s.assignedClasses.length > 0) {
        return s.assignedClasses
          .map((c) => `${c.fullName}${c.stream && c.stream !== "General" ? ` (${c.stream})` : ""}`)
          .join(" | ");
      }
      return (s.offeringClasses || []).join(" | ") || "Unassigned";
    },
  },
  { id: "teachersCount", label: "Assigned Faculty Count", category: "faculty", accessor: (s) => String(s.assignedTeachers?.length || 0) },
  {
    id: "teachersList",
    label: "Assigned Specialist Teachers",
    category: "faculty",
    accessor: (s) => (s.assignedTeachers || []).map((t) => `${t.name}${t.employeeId ? ` (${t.employeeId})` : ""}`).join(" | ") || "None",
  },
  { id: "description", label: "Curriculum Description & Scope", category: "curriculum", accessor: (s) => (s.description || "").replace(/"/g, '""') },
  { id: "session", label: "Academic Session", category: "basic", accessor: () => "Session 2026-2027" },
];

const PRESETS = [
  {
    id: "master",
    label: "Official Curriculum & Syllabus Master",
    desc: "Comprehensive 10-column master catalog with full course descriptions and class links.",
    icon: Shield,
    columns: ALL_EXPORT_COLUMNS.map((c) => c.id),
  },
  {
    id: "faculty",
    label: "Faculty Teaching Load Allocations",
    desc: "Curriculum allocations focusing on assigned teachers, credit hours, and department alignment.",
    icon: Users,
    columns: ["code", "name", "department", "creditHours", "teachersCount", "teachersList"],
  },
  {
    id: "schedule",
    label: "Classroom Academic Matrix",
    desc: "Classroom distribution showing which class sections offer each course.",
    icon: GraduationCap,
    columns: ["code", "name", "department", "creditHours", "classesCount", "classesList"],
  },
  {
    id: "custom",
    label: "Custom Field Selection",
    desc: "Tailor the exact spreadsheet columns needed for reporting.",
    icon: Settings2,
    columns: [],
  },
];

export default function SubjectExportModal({
  isOpen,
  onClose,
  filteredSubjects,
  allSubjects,
  departments,
}: SubjectExportModalProps) {
  const [selectedScope, setSelectedScope] = useState<"filtered" | "all" | string>("filtered");
  const [selectedPreset, setSelectedPreset] = useState<string>("master");
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>(ALL_EXPORT_COLUMNS.map((c) => c.id));
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Compute records based on selected scope
  const targetRecords = useMemo(() => {
    if (selectedScope === "filtered") return filteredSubjects;
    if (selectedScope === "all") return allSubjects;
    // By department
    return allSubjects.filter((s) => s.department === selectedScope);
  }, [selectedScope, filteredSubjects, allSubjects]);

  // Handle Preset Change
  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = PRESETS.find((p) => p.id === presetId);
    if (found && presetId !== "custom") {
      setSelectedColumnIds(found.columns);
    }
  };

  // Toggle Single Column
  const toggleColumn = (colId: string) => {
    setSelectedPreset("custom");
    setSelectedColumnIds((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const handleSelectAllColumns = () => {
    setSelectedPreset("custom");
    setSelectedColumnIds(ALL_EXPORT_COLUMNS.map((c) => c.id));
  };

  const handleClearAllColumns = () => {
    setSelectedPreset("custom");
    setSelectedColumnIds([]);
  };

  // Generate CSV & Download
  const handleDownloadCSV = () => {
    if (targetRecords.length === 0) {
      toast.error("No subject records found for the selected scope.");
      return;
    }
    if (selectedColumnIds.length === 0) {
      toast.error("Please select at least one column to export.");
      return;
    }

    setIsExporting(true);

    try {
      const activeColumns = ALL_EXPORT_COLUMNS.filter((c) => selectedColumnIds.includes(c.id));
      const headers = activeColumns.map((c) => `"${c.label.replace(/"/g, '""')}"`);

      const rows = targetRecords.map((sub) => {
        return activeColumns.map((c) => {
          const val = c.accessor(sub);
          return `"${String(val).replace(/"/g, '""')}"`;
        });
      });

      // Construct file content with UTF-8 BOM (\uFEFF)
      let csvContent = "\uFEFF";

      if (includeMetadata) {
        csvContent += `# SENECA ACADEMY — INSTITUTIONAL CURRICULUM SYLLABUS ROSTER\r\n`;
        csvContent += `# Academic Session: 2026-2027 | Generated: ${new Date().toLocaleString()} | Scope: ${selectedScope.toUpperCase()} (${targetRecords.length} Subjects)\r\n`;
        csvContent += `# Institutional Standards: Cambridge International & National Standards Dual-Curriculum\r\n`;
      }

      csvContent += [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `Seneca_Curriculum_Syllabus_${selectedScope}_${timestamp}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Curriculum Syllabus Exported Successfully!", {
        description: `Exported ${targetRecords.length} courses with ${activeColumns.length} columns to ${filename}.`,
      });

      onClose();
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error("Export Failed", { description: err.message || "An unexpected error occurred." });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-3xl shadow-2xl bg-card border border-border/80">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b shrink-0 bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/20 font-bold text-[10px] uppercase tracking-wider"
                >
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  <span>Curriculum Export Suite</span>
                </Badge>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Excel & CSV Compatible (UTF-8 BOM)
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                Export Curriculum Syllabus & Faculty Roster
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground max-w-xl">
                Export verified course catalog sheets, teaching load allocations, and classroom syllabus schedules formatted for institutional reporting.
              </DialogDescription>
            </div>

            {/* Live Count Pill */}
            <div className="p-2.5 px-3.5 rounded-2xl bg-muted/60 border border-border/80 text-right shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Target Pool</span>
              <span className="text-base font-extrabold text-seneca-crimson">
                {targetRecords.length} Courses
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Scope Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Step 1: Choose Curriculum Scope</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Select which courses to include
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedScope("filtered")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer",
                  selectedScope === "filtered"
                    ? "border-seneca-crimson bg-seneca-crimson/5 ring-1 ring-seneca-crimson shadow-xs"
                    : "border-border/80 bg-card hover:bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Layers className={cn("h-3.5 w-3.5", selectedScope === "filtered" ? "text-seneca-crimson" : "text-muted-foreground")} />
                    <span>Active View</span>
                  </span>
                  {selectedScope === "filtered" && <CheckCircle2 className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">{filteredSubjects.length} Courses</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScope("all")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer",
                  selectedScope === "all"
                    ? "border-seneca-crimson bg-seneca-crimson/5 ring-1 ring-seneca-crimson shadow-xs"
                    : "border-border/80 bg-card hover:bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <BookOpen className={cn("h-3.5 w-3.5", selectedScope === "all" ? "text-seneca-crimson" : "text-muted-foreground")} />
                    <span>All Courses</span>
                  </span>
                  {selectedScope === "all" && <CheckCircle2 className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">{allSubjects.length} Consolidated</p>
              </button>

              {departments.slice(0, 2).map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedScope(dept)}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer",
                    selectedScope === dept
                      ? "border-seneca-crimson bg-seneca-crimson/5 ring-1 ring-seneca-crimson shadow-xs"
                      : "border-border/80 bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5 truncate">
                      <Building className={cn("h-3.5 w-3.5 shrink-0", selectedScope === dept ? "text-seneca-crimson" : "text-muted-foreground")} />
                      <span className="truncate">{dept}</span>
                    </span>
                    {selectedScope === dept && <CheckCircle2 className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {allSubjects.filter((s) => s.department === dept).length} Courses
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Institutional Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Step 2: Choose Preset Template</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Standard templates for syllabus & academic registry
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer space-y-1",
                      isSelected
                        ? "border-seneca-crimson bg-seneca-crimson/5 ring-1 ring-seneca-crimson shadow-xs"
                        : "border-border/80 bg-card hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-seneca-crimson" : "text-muted-foreground")} />
                        <span>{preset.label}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug">{preset.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Granular Column Selection Matrix */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Selected Fields ({selectedColumnIds.length} of {ALL_EXPORT_COLUMNS.length})</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllColumns}
                  className="text-[10px] font-bold text-seneca-crimson hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-muted-foreground text-[10px]">•</span>
                <button
                  type="button"
                  onClick={handleClearAllColumns}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-3 rounded-2xl bg-muted/40 border border-border/80 max-h-48 overflow-y-auto">
              {ALL_EXPORT_COLUMNS.map((col) => {
                const isChecked = selectedColumnIds.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleColumn(col.id)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-xl text-left text-xs font-semibold transition-all border",
                      isChecked
                        ? "bg-background border-seneca-crimson/40 text-foreground shadow-2xs"
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span className="truncate pr-1 text-[11px]">{col.label}</span>
                    <span
                      className={cn(
                        "h-4 w-4 rounded-md flex items-center justify-center shrink-0 text-[10px]",
                        isChecked ? "bg-seneca-crimson text-white" : "border border-border"
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Institutional Formatting Options */}
          <div className="p-3 rounded-2xl bg-card border border-border/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">Include Institutional Header & Session Stamp</span>
              <span className="text-[10px] text-muted-foreground">
                Appends official school header banner with export timestamp and syllabus scope
              </span>
            </div>
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="h-4 w-4 rounded accent-seneca-crimson cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-5 border-t bg-card shrink-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-xl text-xs font-bold w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleDownloadCSV}
            disabled={isExporting || targetRecords.length === 0 || selectedColumnIds.length === 0}
            variant="glow"
            className="rounded-xl text-xs font-bold gap-2 w-full sm:w-auto shadow-lg shadow-seneca-amber/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>
              {isExporting ? "Generating Spreadsheet..." : `Download CSV (${targetRecords.length} Courses)`}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
