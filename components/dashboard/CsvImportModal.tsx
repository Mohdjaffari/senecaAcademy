"use client";

import { useState, useRef, useTransition } from "react";
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
  const [importResults, setImportResults] = useState<{
    success: boolean;
    importedCount: number;
    failedCount: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Sample Template
  const handleDownloadTemplate = () => {
    downloadSampleCSVTemplate(templateFilename, columns, sampleData);
    toast.success(`Sample CSV template (${templateFilename}.csv) downloaded!`);
  };

  // Process File
  const processUploadedFile = (uploadedFile: File) => {
    if (!uploadedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a valid .csv file.");
      return;
    }

    setFile(uploadedFile);
    setImportResults(null);
    setParseErrors([]);

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
          `Warning: Missing required column(s): ${missingNames}. Please review your CSV headers.`,
        ]);
        toast.warning(`Missing required column(s): ${missingNames}`);
      } else {
        toast.success(`Successfully parsed ${parsed.rows.length} rows from CSV!`);
      }
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
      const failed = res.failedCount ?? (res.errors ? res.errors.length : 0);
      const errors = res.errors || [];

      setImportResults({
        success: true,
        importedCount: imported,
        failedCount: failed,
        errors,
      });

      if (imported > 0) {
        toast.success(`Bulk Import Complete: Successfully imported ${imported} ${entityNamePlural}!`);
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
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl shadow-2xl bg-card border border-border/80">
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
                  RFC-4180 Standard
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
                  Drag and drop your CSV file here, or{" "}
                  <span className="text-seneca-crimson underline">browse device</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Only .csv files supported. Maximum 2,000 rows per batch.
                </p>
              </div>

              {/* Required Columns Guide */}
              <div className="pt-4 border-t border-border/40 w-full max-w-lg text-left">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-seneca-amber" />
                  <span>Expected Columns in CSV:</span>
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
            /* Step 2: File Selected & Preview Mode */
            <div className="space-y-4">
              {/* File Info Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/70 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[280px] sm:max-w-md">
                      {file.name}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows parsed
                    </p>
                  </div>
                </div>

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

              {/* Warning/Parse Errors if any */}
              {parseErrors.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>File Verification Notice</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pl-2 text-[11px]">
                    {parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Import Results Box if completed */}
              {importResults && (
                <div
                  className={cn(
                    "p-4 rounded-2xl border text-xs space-y-2",
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
                      Import Finished: {importResults.importedCount} {entityNamePlural} imported successfully!
                    </span>
                  </div>
                  {importResults.failedCount > 0 && (
                    <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {importResults.failedCount} rows could not be imported.
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

              {/* Live Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Data Preview (Showing First 5 Rows)
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {parsedRows.length} Total Records
                    </Badge>
                  </div>
                </div>

                <div className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-muted/70 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="p-2.5 pl-3">#</th>
                          {columns.slice(0, 6).map((col) => (
                            <th key={col.key} className="p-2.5 truncate max-w-[140px]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {parsedRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="p-2.5 pl-3 font-mono text-muted-foreground">{idx + 1}</td>
                            {columns.slice(0, 6).map((col) => {
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
                </div>
              </div>
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
              disabled={isSubmitting || parsedRows.length === 0}
              variant="glow"
              className="rounded-xl text-xs font-bold gap-2 w-full sm:w-auto shadow-lg shadow-seneca-amber/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Importing {parsedRows.length} Records...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Confirm & Import {parsedRows.length} Records</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
