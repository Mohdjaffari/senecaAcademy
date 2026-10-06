"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
  Loader2,
  Sparkles,
  HelpCircle,
  Eye,
  Info,
  Layers,
  GraduationCap,
  Users,
  AlertTriangle,
  RefreshCw,
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
import {
  parseCSV,
  downloadSampleCSVTemplate,
  CSVColumnDefinition,
} from "@/lib/utils/csv-helper";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  badgeLabel: string;
  templateFilename: string;
  columns: CSVColumnDefinition[];
  sampleData: Record<string, string>[];
  apiEndpoint: string;
  onSuccess: () => void;
  entityNamePlural?: string;
}

export default function CsvImportModal({
  isOpen,
  onClose,
  title,
  description,
  badgeLabel,
  templateFilename,
  columns,
  sampleData,
  apiEndpoint,
  onSuccess,
  entityNamePlural = "records",
}: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "classes" | "preview" | "issues">("analytics");
  const [analysisReport, setAnalysisReport] = useState<{
    totalRows: number;
    validRows: number;
    warningRows: number;
    errorRows: number;
    wingBreakdown: Record<string, number>;
    streamBreakdown: Record<string, number>;
    genderBreakdown: { Male: number; Female: number; Other: number };
    classCapacityImpact: Array<{
      className: string;
      section: string;
      currentEnrolled: number;
      capacity: number;
      incomingStudents: number;
      projectedTotal: number;
      isOverCapacity: boolean;
      excessCount: number;
      isNewClass: boolean;
    }>;
    diagnostics: Array<{
      row: number;
      studentName: string;
      type: "error" | "warning" | "info";
      message: string;
    }>;
    canProceed: boolean;
  } | null>(null);

  const [importResults, setImportResults] = useState<{
    success: boolean;
    importedCount: number;
    failedCount: number;
    errors: string[];
    classesUpdated?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Sample Template
  const handleDownloadTemplate = () => {
    downloadSampleCSVTemplate(templateFilename, columns, sampleData);
    toast.success(`Sample CSV template (${templateFilename}.csv) downloaded!`);
  };

  // Run Pre-flight Analysis on the CSV
  const runPreflightAnalysis = async (rowsToAnalyze: Record<string, string>[]) => {
    if (!rowsToAnalyze || rowsToAnalyze.length === 0) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch(`${apiEndpoint}?analyze=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: rowsToAnalyze, analyzeOnly: true }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.analysis) {
        setAnalysisReport(data.data.analysis);
      }
    } catch (err) {
      console.error("Preflight analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Process Uploaded File
  const processUploadedFile = (uploadedFile: File) => {
    if (!uploadedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a valid .csv file.");
      return;
    }

    setFile(uploadedFile);
    setImportResults(null);
    setParseErrors([]);
    setAnalysisReport(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);

      if (parsed.errors.length > 0) {
        setParseErrors(parsed.errors);
        toast.error("Error reading CSV content.");
        return;
      }

      setRawHeaders(parsed.headers);
      setParsedRows(parsed.rows);

      // Validate required columns
      const normalizedUploaded = parsed.normalizedHeaders;
      const missingRequired = columns
        .filter((c) => c.required)
        .filter((c) => {
          const normKey = c.key.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normLabel = c.label.toLowerCase().replace(/[^a-z0-9]/g, "");
          return !normalizedUploaded.includes(normKey) && !normalizedUploaded.includes(normLabel);
        });

      if (missingRequired.length > 0) {
        const missingNames = missingRequired.map((m) => `"${m.label}"`).join(", ");
        setParseErrors((prev) => [
          ...prev,
          `Warning: Missing recommended column(s): ${missingNames}. System will auto-assign defaults where applicable.`,
        ]);
        toast.warning(`Note: Missing columns: ${missingNames}`);
      } else {
        toast.success(`Successfully parsed ${parsed.rows.length} rows from CSV!`);
      }

      // Automatically launch diagnostic pre-flight analysis
      runPreflightAnalysis(parsed.rows);
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setRawHeaders([]);
    setParseErrors([]);
    setAnalysisReport(null);
    setImportResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit to Backend Import API
  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) {
      toast.error("No valid data rows to import.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedRows }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error?.message || "Bulk import failed.");
      }

      const res = data.data || {};
      const imported = res.importedCount ?? parsedRows.length;
      const failed = res.skippedCount ?? (res.errors ? res.errors.length : 0);
      const errors = res.errors || [];
      const classesUpdated = res.classesUpdated || 0;

      setImportResults({
        success: true,
        importedCount: imported,
        failedCount: failed,
        errors,
        classesUpdated,
      });

      if (imported > 0) {
        toast.success(`Bulk Enrollment Complete: Enrolled ${imported} ${entityNamePlural} successfully!`);
        onSuccess();
      } else {
        toast.warning("Import finished, but 0 records were created. Check the error list.");
      }
    } catch (err: any) {
      console.error("CSV Import error:", err);
      toast.error(err.message || "An unexpected error occurred during bulk import.");
      setImportResults({
        success: false,
        importedCount: 0,
        failedCount: parsedRows.length,
        errors: [err.message || "Failed to process import."],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-3xl shadow-2xl bg-card border border-border/80">
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
                  <span>{badgeLabel}</span>
                </Badge>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  RFC-4180 Certified & UTF-8 Validated
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground max-w-xl">
                {description}
              </DialogDescription>
            </div>

            <Button
              type="button"
              onClick={handleDownloadTemplate}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 shrink-0 border-seneca-amber/30 text-seneca-amber-dark dark:text-seneca-amber hover:bg-seneca-amber/10 shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-seneca-amber" />
              <span>Download Template (.csv)</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Step 1: Upload Dropzone if no file selected */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3",
                isDragging
                  ? "border-seneca-amber bg-seneca-amber/5 scale-[1.01]"
                  : "border-border hover:border-seneca-crimson/50 hover:bg-muted/30"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-16 w-16 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center shadow-inner">
                <Upload className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Drag and drop your enrollment CSV file here, or{" "}
                  <span className="text-seneca-crimson underline">browse device</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Official spreadsheet format with support for all academic tiers, streams, and guardian records.
                </p>
              </div>

              {/* Supported Columns Guide */}
              <div className="pt-4 border-t border-border/40 w-full max-w-xl text-left">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-seneca-amber" />
                  <span>Institutional Columns Recognized:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {columns.map((col) => (
                    <span
                      key={col.key}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-md font-semibold border",
                        col.required
                          ? "bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {col.label} {col.required && "*"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: File Selected & Diagnostics Mode */
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/70 shadow-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[280px] sm:max-w-md">
                      {file.name}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} total applicant records detected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => runPreflightAnalysis(parsedRows)}
                    variant="outline"
                    size="sm"
                    disabled={isAnalyzing || isSubmitting}
                    className="rounded-xl text-xs h-8 gap-1.5"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", isAnalyzing && "animate-spin")} />
                    <span>Re-Analyze</span>
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="ghost"
                    size="sm"
                    disabled={isSubmitting}
                    className="rounded-xl text-xs text-muted-foreground hover:text-foreground h-8"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    <span>Change File</span>
                  </Button>
                </div>
              </div>

              {/* Import Results Box if Completed */}
              {importResults && (
                <div
                  className={cn(
                    "p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in-50",
                    importResults.importedCount > 0
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                  )}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {importResults.importedCount > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                    )}
                    <span>
                      Bulk Enrollment Complete: {importResults.importedCount} {entityNamePlural} registered successfully!
                    </span>
                  </div>
                  {importResults.classesUpdated ? (
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Roster counts and capacities updated across {importResults.classesUpdated} class sections.
                    </p>
                  ) : null}
                  {importResults.failedCount > 0 && (
                    <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {importResults.failedCount} records could not be enrolled.
                    </p>
                  )}
                  {importResults.errors.length > 0 && (
                    <div className="mt-2 p-2 rounded-xl bg-background/80 text-[10px] font-mono max-h-24 overflow-y-auto text-muted-foreground space-y-0.5">
                      {importResults.errors.map((msg, i) => (
                        <div key={i}>{msg}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Top Pre-flight Diagnostic KPI Cards */}
              {analysisReport && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-muted/50 border border-border/80">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Parsed</span>
                    <span className="text-lg font-extrabold text-foreground">{analysisReport.totalRows} Records</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Ready to Enroll</span>
                    <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{analysisReport.validRows} Valid</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">Class Sections</span>
                    <span className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
                      {analysisReport.classCapacityImpact.length} Sections
                    </span>
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl border",
                    analysisReport.warningRows > 0
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                      : "bg-muted/50 border-border/80 text-foreground"
                  )}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Notices / Warnings</span>
                    <span className="text-lg font-extrabold">
                      {analysisReport.warningRows} {analysisReport.warningRows === 1 ? "Notice" : "Notices"}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Tabs for Diagnostics */}
              <div className="flex items-center gap-1 border-b border-border/80 pb-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab("analytics")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
                    activeTab === "analytics"
                      ? "bg-seneca-crimson text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Wing & Specialization Breakdown</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("classes")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
                    activeTab === "classes"
                      ? "bg-seneca-crimson text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Class Sections & Capacity ({analysisReport?.classCapacityImpact.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
                    activeTab === "preview"
                      ? "bg-seneca-crimson text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Raw Data Table ({parsedRows.length})</span>
                </button>

                {analysisReport && analysisReport.diagnostics.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("issues")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
                      activeTab === "issues"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Diagnostics Log ({analysisReport.diagnostics.length})</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Wing & Specialization Breakdown */}
              {activeTab === "analytics" && (
                <div className="space-y-3">
                  {isAnalyzing ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-seneca-crimson" />
                      <span className="text-xs font-bold">Running Institutional Diagnostics & Verification...</span>
                    </div>
                  ) : analysisReport ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Wing Distribution Card */}
                      <div className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-2.5">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-seneca-crimson" />
                          <span>Campus Wing Distribution</span>
                        </span>
                        <div className="space-y-1.5">
                          {Object.entries(analysisReport.wingBreakdown).map(([wing, count]) => (
                            count > 0 && (
                              <div key={wing} className="flex items-center justify-between text-xs p-2 rounded-xl bg-muted/40">
                                <span className="font-semibold text-foreground">{wing}</span>
                                <Badge variant="secondary" className="font-mono text-xs font-bold">
                                  {count} Students ({Math.round((count / analysisReport.totalRows) * 100)}%)
                                </Badge>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {/* Academic Tracks Card */}
                      <div className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-2.5">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-seneca-crimson" />
                          <span>Academic Specializations & Study Tracks</span>
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {Object.entries(analysisReport.streamBreakdown).map(([stream, count]) => (
                            <div key={stream} className="flex items-center justify-between text-xs p-2 rounded-xl bg-muted/40">
                              <span className="font-semibold text-foreground truncate max-w-[200px]" title={stream}>
                                {stream}
                              </span>
                              <Badge className="bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/20 font-mono text-xs font-bold">
                                {count}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      Click &quot;Re-Analyze&quot; above to inspect enrollment breakdown.
                    </p>
                  )}
                </div>
              )}

              {/* Tab 2: Class Sections & Capacity Impact */}
              {activeTab === "classes" && (
                <div className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/70 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="p-2.5 pl-3">Class & Section</th>
                          <th className="p-2.5">Current Enrolled</th>
                          <th className="p-2.5">Incoming</th>
                          <th className="p-2.5">Projected Total</th>
                          <th className="p-2.5">Capacity</th>
                          <th className="p-2.5 text-right pr-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {analysisReport?.classCapacityImpact.map((ci, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="p-2.5 pl-3 font-bold text-foreground">
                              {ci.className} • Section {ci.section}
                              {ci.isNewClass && (
                                <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 font-bold">
                                  New Section
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-muted-foreground">{ci.currentEnrolled}</td>
                            <td className="p-2.5 font-bold text-seneca-crimson">+{ci.incomingStudents}</td>
                            <td className="p-2.5 font-bold text-foreground">{ci.projectedTotal}</td>
                            <td className="p-2.5 text-muted-foreground">{ci.capacity} Seats</td>
                            <td className="p-2.5 text-right pr-3">
                              {ci.isOverCapacity ? (
                                <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/30 font-bold">
                                  Exceeds by {ci.excessCount}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold">
                                  Normal ({Math.round((ci.projectedTotal / ci.capacity) * 100)}%)
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Raw Data Preview */}
              {activeTab === "preview" && (
                <div className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-muted/70 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="p-2.5 pl-3">#</th>
                          {columns.slice(0, 7).map((col) => (
                            <th key={col.key} className="p-2.5 truncate max-w-[140px]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {parsedRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="p-2.5 pl-3 font-mono text-muted-foreground">{idx + 1}</td>
                            {columns.slice(0, 7).map((col) => {
                              const normKey = col.key.toLowerCase().replace(/[^a-z0-9]/g, "");
                              const val =
                                row[normKey] ||
                                row[col.key] ||
                                row[col.label] ||
                                Object.entries(row).find(([k]) =>
                                  k.toLowerCase().replace(/[^a-z0-9]/g, "") === normKey
                                )?.[1] ||
                                "—";
                              return (
                                <td key={col.key} className="p-2.5 truncate max-w-[140px]">
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 10 && (
                    <div className="p-2 bg-muted/40 text-center text-[10px] text-muted-foreground border-t border-border/60">
                      Showing first 10 of {parsedRows.length} total applicant records. All records will be imported.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Diagnostics Log */}
              {activeTab === "issues" && analysisReport && (
                <div className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-y-auto max-h-64 divide-y divide-border/60 p-1">
                    {analysisReport.diagnostics.map((diag, idx) => (
                      <div key={idx} className="p-2.5 flex items-start gap-2.5 text-xs">
                        {diag.type === "error" ? (
                          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : diag.type === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            {diag.row > 0 && (
                              <span className="font-mono text-[10px] font-bold text-muted-foreground">
                                Row {diag.row}:
                              </span>
                            )}
                            <span className="font-bold text-foreground">{diag.studentName}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{diag.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-5 border-t bg-card shrink-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl text-xs font-bold w-full sm:w-auto"
          >
            {importResults?.importedCount ? "Close Window" : "Cancel"}
          </Button>

          {file && !importResults?.success && (
            <Button
              type="button"
              onClick={handleExecuteImport}
              disabled={isSubmitting || parsedRows.length === 0 || isAnalyzing}
              variant="glow"
              className="rounded-xl text-xs font-bold gap-2 w-full sm:w-auto shadow-lg shadow-seneca-amber/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Enrolling {parsedRows.length} Students...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Confirm & Enroll {parsedRows.length} Students</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
