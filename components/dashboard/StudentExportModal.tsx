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
  PhoneCall,
  CreditCard,
  Settings2,
  Sparkles,
  Check,
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
import { isJuniorGrade, isSeniorGrade } from "@/lib/constants/campus-wing";

export interface ExportStudentData {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  admissionNumber: string;
  className: string;
  gradeName?: string;
  gradeLevel?: number;
  section: string;
  stream?: string;
  gender: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  bFormNumber?: string;
  address?: string;
  guardian?: {
    fatherName?: string;
    fatherCnic?: string;
    phone?: string;
    emergencyContact?: string;
  };
  transport?: {
    required?: boolean;
    route?: string;
  };
  feeCategory?: string;
  status: string;
  enrollmentDate?: string;
  documents?: {
    verificationStatus?: string;
  };
}

interface StudentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredStudents: ExportStudentData[];
  allStudents: ExportStudentData[];
  campusWing: "all" | "junior" | "senior";
}

interface ColumnDefinition {
  id: string;
  label: string;
  category: "identity" | "academic" | "guardian" | "administrative";
  accessor: (s: ExportStudentData) => string;
}

const ALL_EXPORT_COLUMNS: ColumnDefinition[] = [
  // Identity & Demographics
  { id: "admissionNumber", label: "Admission ID", category: "identity", accessor: (s) => s.admissionNumber || "" },
  { id: "rollNumber", label: "Roll Number", category: "identity", accessor: (s) => s.rollNumber || "" },
  { id: "name", label: "Student Full Name", category: "identity", accessor: (s) => s.name || "" },
  { id: "gender", label: "Gender", category: "identity", accessor: (s) => s.gender || "Unspecified" },
  { id: "dateOfBirth", label: "Date of Birth", category: "identity", accessor: (s) => s.dateOfBirth || "" },
  { id: "bFormNumber", label: "B-Form / CNIC", category: "identity", accessor: (s) => s.bFormNumber || "N/A" },
  { id: "bloodGroup", label: "Blood Group", category: "identity", accessor: (s) => s.bloodGroup || "N/A" },
  { id: "email", label: "Portal Login Email", category: "identity", accessor: (s) => s.email || "" },

  // Academic Information
  { id: "className", label: "Grade / Class", category: "academic", accessor: (s) => s.gradeName || s.className || "" },
  { id: "section", label: "Class Section", category: "academic", accessor: (s) => s.section || "" },
  { id: "stream", label: "Academic Specialization & Study Track", category: "academic", accessor: (s) => s.stream || "General Curriculum" },
  { id: "campusWing", label: "Campus Wing", category: "academic", accessor: (s) => isJuniorGrade(s.gradeLevel ?? 1) ? "Junior Campus (Early Years – Gr 2)" : "Senior Campus (Grades 3 – 12)" },

  // Guardian & Demographics
  { id: "fatherName", label: "Father / Guardian Name", category: "guardian", accessor: (s) => s.guardian?.fatherName || "N/A" },
  { id: "fatherCnic", label: "Father CNIC", category: "guardian", accessor: (s) => s.guardian?.fatherCnic || "N/A" },
  { id: "parentPhone", label: "Primary Parent Mobile", category: "guardian", accessor: (s) => s.guardian?.phone || "N/A" },
  { id: "emergencyContact", label: "Emergency Contact", category: "guardian", accessor: (s) => s.guardian?.emergencyContact || "N/A" },
  { id: "address", label: "Residential Address", category: "guardian", accessor: (s) => (s.address || "").replace(/"/g, '""') },

  // Administrative & Bursar
  { id: "transportRoute", label: "Transport Bus Route", category: "administrative", accessor: (s) => s.transport?.required ? (s.transport.route || "School Van") : "Self Pick & Drop" },
  { id: "feeCategory", label: "Tuition Fee Category", category: "administrative", accessor: (s) => s.feeCategory || "Standard" },
  { id: "docStatus", label: "Document Clearance Status", category: "administrative", accessor: (s) => s.documents?.verificationStatus || "Pending" },
  { id: "enrollmentDate", label: "Enrollment Date", category: "administrative", accessor: (s) => s.enrollmentDate ? new Date(s.enrollmentDate).toISOString().split("T")[0] : "2026-08-01" },
  { id: "status", label: "Registration Status", category: "administrative", accessor: (s) => s.status || "active" },
];

const PRESETS = [
  {
    id: "master",
    label: "Master Institutional Dossier",
    desc: "Complete comprehensive 22-column registry for administration and official board archives.",
    icon: Shield,
    columns: ALL_EXPORT_COLUMNS.map((c) => c.id),
  },
  {
    id: "examination",
    label: "Examination & Attendance Roll",
    desc: "Exam hall verification and daily attendance roll with Roll Number, Class, Section, and B-Form.",
    icon: FileText,
    columns: ["rollNumber", "admissionNumber", "name", "className", "section", "stream", "bFormNumber", "status"],
  },
  {
    id: "guardian",
    label: "Parent & Emergency Directory",
    desc: "Parent contact register with student name, father name, phone, emergency numbers, and address.",
    icon: PhoneCall,
    columns: ["name", "className", "section", "fatherName", "parentPhone", "emergencyContact", "address", "transportRoute"],
  },
  {
    id: "bursar",
    label: "Bursar & Accounts Register",
    desc: "Fee ledger with admission number, class, fee concession status, parent phone, and enrollment status.",
    icon: CreditCard,
    columns: ["admissionNumber", "rollNumber", "name", "className", "section", "feeCategory", "parentPhone", "status"],
  },
  {
    id: "custom",
    label: "Custom Field Selection",
    desc: "Pick & choose exact fields required for custom institutional reporting.",
    icon: Settings2,
    columns: [],
  },
];

export default function StudentExportModal({
  isOpen,
  onClose,
  filteredStudents,
  allStudents,
  campusWing,
}: StudentExportModalProps) {
  const [selectedScope, setSelectedScope] = useState<"filtered" | "all" | "junior" | "senior">("filtered");
  const [selectedPreset, setSelectedPreset] = useState<string>("master");
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>(ALL_EXPORT_COLUMNS.map((c) => c.id));
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Compute records based on selected scope
  const targetRecords = useMemo(() => {
    switch (selectedScope) {
      case "filtered":
        return filteredStudents;
      case "all":
        return allStudents;
      case "junior":
        return allStudents.filter((s) => isJuniorGrade(s.gradeLevel ?? 1));
      case "senior":
        return allStudents.filter((s) => isSeniorGrade(s.gradeLevel ?? 1));
      default:
        return filteredStudents;
    }
  }, [selectedScope, filteredStudents, allStudents]);

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

  // Select / Deselect All
  const handleSelectAllColumns = () => {
    setSelectedPreset("custom");
    setSelectedColumnIds(ALL_EXPORT_COLUMNS.map((c) => c.id));
  };

  const handleClearAllColumns = () => {
    setSelectedPreset("custom");
    setSelectedColumnIds([]);
  };

  // Execute CSV Generation & Download
  const handleDownloadCSV = () => {
    if (targetRecords.length === 0) {
      toast.error("No student records available for the selected scope.");
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

      const rows = targetRecords.map((std) => {
        return activeColumns.map((c) => {
          const val = c.accessor(std);
          return `"${String(val).replace(/"/g, '""')}"`;
        });
      });

      // Construct file content with UTF-8 BOM (\uFEFF) for native Excel compatibility
      let csvContent = "\uFEFF";

      if (includeMetadata) {
        csvContent += `# SENECA ACADEMY — INSTITUTIONAL STUDENT REGISTRY EXPORT\r\n`;
        csvContent += `# Academic Session: 2026-2027 | Generated: ${new Date().toLocaleString()} | Scope: ${selectedScope.toUpperCase()} (${targetRecords.length} Records)\r\n`;
        csvContent += `# Campus: Dual-Campus Consolidated (Junior Wing <= Grade 2 | Senior Wing > Grade 2)\r\n`;
      }

      csvContent += [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `Seneca_Academy_Student_Roster_${selectedScope}_${timestamp}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Institutional Student Roster Exported Successfully!", {
        description: `Exported ${targetRecords.length} records with ${activeColumns.length} columns to ${filename}.`,
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
                  <span>Institutional Data Export</span>
                </Badge>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Excel & CSV Compatible (UTF-8 BOM)
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                Student Enrollment & Roster Export
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground max-w-xl">
                Generate official institutional spreadsheets, examination roll sheets, parent directories, and accounts records formatted with zero encoding errors.
              </DialogDescription>
            </div>

            {/* Live Count Pill */}
            <div className="p-2.5 px-3.5 rounded-2xl bg-muted/60 border border-border/80 text-right shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Target Pool</span>
              <span className="text-base font-extrabold text-seneca-crimson">
                {targetRecords.length} Students
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Scope Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Step 1: Choose Export Scope & Population</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Select which student records to include
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "filtered", label: "Active View", sub: `${filteredStudents.length} Filtered`, icon: Layers },
                { id: "all", label: "All Students", sub: `${allStudents.length} Consolidated`, icon: Users },
                { id: "junior", label: "Junior Wing", sub: "Early Years – Gr 2", icon: Sparkles },
                { id: "senior", label: "Senior Wing", sub: "Grades 3 – 12", icon: GraduationCap },
              ].map((scope) => {
                const Icon = scope.icon;
                const isSelected = selectedScope === scope.id;
                return (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setSelectedScope(scope.id as any)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer",
                      isSelected
                        ? "border-seneca-crimson bg-seneca-crimson/5 ring-1 ring-seneca-crimson shadow-xs"
                        : "border-border/80 bg-card hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-seneca-crimson" : "text-muted-foreground")} />
                        <span>{scope.label}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">{scope.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Institutional Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Step 2: Institutional Preset Template</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Standard templates for school administration
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
                Appends official school header banner with export timestamp and campus scope
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
              {isExporting ? "Generating Spreadsheet..." : `Download CSV (${targetRecords.length} Records)`}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
