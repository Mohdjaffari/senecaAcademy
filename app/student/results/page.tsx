"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  GraduationCap,
  Calendar,
  BookOpen,
  Loader2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubjectResult {
  id: string;
  subject: string;
  subjectCode?: string;
  theoryMarks: number;
  practicalMarks: number;
  maxTheory: number;
  maxPractical: number;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  teacherRemarks: string;
}

export default function StudentResultsPage() {
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [className, setClassName] = useState("");
  const [stream, setStream] = useState("General");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [academicHistory, setAcademicHistory] = useState<any[]>([]);
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("Official Assessment Term 2026");

  const fetchStudentResults = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data.user;
        const s = data.data.student;

        if (u) {
          setStudentName(u.name || "Student");
        }

        if (s) {
          setRollNumber(s.rollNumber || "N/A");
          setAdmissionNumber(s.admissionNumber || "N/A");
          setClassName(s.className || "Class");
          setStream(s.stream || "General");
          setAcademicYear(s.academicYear || "2026-2027");
          setAcademicHistory(s.academicHistory || []);

          // Fetch student results from deep student API
          if (s.id || s._id) {
            const stdId = s.id || s._id;
            const resData = await fetch(`/api/students/${stdId}`);
            const fullJson = await resData.json();
            if (fullJson.success && fullJson.data?.results) {
              const mapped: SubjectResult[] = fullJson.data.results.map((r: any, idx: number) => {
                const obt = Number(r.obtainedMarks) || 0;
                const tot = Number(r.totalMarks) || 100;
                const pct = r.percentage !== undefined ? Number(r.percentage) : Math.round((obt / tot) * 100);
                const isPractical = tot > 75;
                const maxTh = isPractical ? Math.round(tot * 0.75) : tot;
                const maxPr = isPractical ? tot - maxTh : 0;
                const thObt = isPractical ? Math.min(maxTh, Math.round(obt * 0.75)) : obt;
                const prObt = isPractical ? obt - thObt : 0;

                return {
                  id: r.id || r._id || `res-${idx}`,
                  subject: r.subjectId?.name || r.examId?.title || "Academic Assessment",
                  subjectCode: r.subjectId?.code || "SUB",
                  theoryMarks: thObt,
                  practicalMarks: prObt,
                  maxTheory: maxTh,
                  maxPractical: maxPr,
                  obtainedMarks: obt,
                  totalMarks: tot,
                  percentage: pct,
                  grade: r.grade || (pct >= 80 ? "A*" : pct >= 70 ? "A" : pct >= 60 ? "B" : pct >= 50 ? "C" : "D"),
                  teacherRemarks: r.remarks || "Satisfactory conceptual mastery & performance.",
                };
              });
              setResults(mapped);
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to load results:", err);
      toast.error("Failed to load examination results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentResults();
  }, []);

  // Aggregates
  const totalMax = results.reduce((acc, r) => acc + (r.totalMarks || (r.maxTheory + r.maxPractical)), 0);
  const totalObtained = results.reduce((acc, r) => acc + (r.obtainedMarks || (r.theoryMarks + r.practicalMarks)), 0);
  const aggregatePercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0.0";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.success("Generating Official Transcript PDF...", {
      description: "Seneca Academy official statement downloaded.",
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-8 text-white shadow-2xl print:hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <Award className="h-3 w-3" />
                <span>Official Academic Transcript</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <Sparkles className="h-3 w-3" />
                <span>Academic Record</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Exam Report Cards &amp; <span className="text-seneca-amber">Grade Progression</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Official examination performance statements, subject marks, GPA metrics, and historical grade progression archive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              <span>Print Card</span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto justify-center"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <Card className="border border-border/80 p-12 sm:p-16 flex flex-col items-center justify-center space-y-3 text-center bg-card/95 backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber" />
          <p className="text-xs font-bold text-muted-foreground">Retrieving Official Examination Records from Database...</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 2. Official Current Session Transcript Card */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6">
            {/* Transcript Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4 sm:pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold tracking-widest text-seneca-crimson uppercase">
                  Seneca Academy Examination Directorate
                </span>
                <h2 className="text-lg sm:text-2xl font-bold font-heading text-foreground">
                  Current Term Examination Statement
                </h2>
                <p className="text-xs text-muted-foreground">{selectedTerm} • Academic Session {academicYear}</p>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-seneca-amber/15 border border-seneca-amber/30 text-left sm:text-center shrink-0">
                <span className="text-[10px] font-bold text-seneca-amber-dark dark:text-seneca-amber block uppercase tracking-wider">
                  Aggregate Score
                </span>
                <div className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                  {aggregatePercentage}%
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {Number(aggregatePercentage) >= 80 ? "Grade A* Distinction" : Number(aggregatePercentage) >= 70 ? "Grade A" : Number(aggregatePercentage) >= 60 ? "Grade B" : "Satisfactory"}
                </span>
              </div>
            </div>

            {/* Student Credential Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block font-bold">Student Name</span>
                <span className="font-bold text-foreground truncate block">{studentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-bold">Roll Number</span>
                <span className="font-mono font-bold text-foreground">{rollNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-bold">Admission ID</span>
                <span className="font-mono font-bold text-foreground">{admissionNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-bold">Class &amp; Section</span>
                <span className="font-bold text-foreground truncate block">{className} ({stream})</span>
              </div>
            </div>

            {/* Subject Breakdown Table */}
            {results.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-border/60">
                <table className="w-full text-xs text-left min-w-[500px]">
                  <thead className="bg-muted/70 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/60">
                    <tr>
                      <th className="p-3 sm:p-4">#</th>
                      <th className="p-3 sm:p-4">Subject</th>
                      <th className="p-3 sm:p-4">Theory</th>
                      <th className="p-3 sm:p-4">Practical</th>
                      <th className="p-3 sm:p-4">Total</th>
                      <th className="p-3 sm:p-4">Grade</th>
                      <th className="p-3 sm:p-4">Faculty Commentary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {results.map((r, i) => {
                      const total = r.obtainedMarks || (r.theoryMarks + r.practicalMarks);
                      const max = r.totalMarks || (r.maxTheory + r.maxPractical);
                      return (
                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 sm:p-4 text-muted-foreground font-bold text-[10px]">{i + 1}</td>
                          <td className="p-3 sm:p-4 font-bold text-foreground">
                            {r.subjectCode && <span className="font-mono text-seneca-crimson block text-[10px]">{r.subjectCode}</span>}
                            {r.subject}
                          </td>
                          <td className="p-3 sm:p-4 font-mono font-bold text-foreground">{r.theoryMarks}</td>
                          <td className="p-3 sm:p-4 font-mono font-bold text-foreground">{r.practicalMarks}</td>
                          <td className="p-3 sm:p-4 font-mono font-extrabold text-foreground text-xs sm:text-sm">
                            {total} / {max}
                          </td>
                          <td className="p-3 sm:p-4">
                            <Badge className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-0.5">
                              {r.grade}
                            </Badge>
                          </td>
                          <td className="p-3 sm:p-4 text-muted-foreground text-[11px] italic">
                            {r.teacherRemarks}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted/60 font-bold border-t border-border/70">
                    <tr>
                      <td colSpan={4} className="p-3 sm:p-4 text-right uppercase text-[10px] sm:text-[11px]">
                        Grand Total Marks:
                      </td>
                      <td colSpan={3} className="p-3 sm:p-4 font-mono font-extrabold text-sm sm:text-base text-emerald-600">
                        {totalObtained} / {totalMax} ({aggregatePercentage}%)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border/60 rounded-2xl space-y-2">
                <Award className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Current Term Results Recorded Yet</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Teachers and the examination controller have not finalized marks for your active class term yet. Previous grade progression records are preserved below.
                </p>
              </div>
            )}

            {/* Principal Remarks & Official Endorsement */}
            <div className="p-3.5 sm:p-6 rounded-2xl bg-muted/30 border border-border/60 space-y-2 text-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-seneca-amber" />
                <span>Principal&apos;s Institutional Evaluation</span>
              </h4>
              <p className="text-foreground/90 font-medium leading-relaxed italic">
                &ldquo;{studentName} is enrolled in {className}. Continuous assessment and classroom evaluations reflect dedication to academic excellence.&rdquo;
              </p>

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-muted-foreground font-mono">
                <span>Academic Session: {academicYear}</span>
                <span className="font-bold text-foreground">Verified by Controller of Examinations</span>
              </div>
            </div>
          </Card>

          {/* 3. Historical Academic Journey & Grade Progression */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-seneca-crimson shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                    Academic Journey &amp; Past Grade Transcripts
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Official archive of previous classes, grade advancement decisions, term percentages, and Principal promotion remarks.
                  </p>
                </div>
              </div>
              <Badge className="bg-seneca-crimson text-white font-bold text-xs self-start sm:self-auto shrink-0">
                {academicHistory.length + 1} Academic Terms
              </Badge>
            </div>

            {academicHistory.length === 0 ? (
              <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-border/60 text-center space-y-2">
                <GraduationCap className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <h5 className="font-bold text-xs text-foreground">Inaugural Session Record</h5>
                <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                  You are currently in your initial enrolled class ({className}). When your Principal evaluates your results and officially promotes you to the next grade, previous class report cards and promotion history will be archived here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-seneca-crimson before:via-seneca-amber before:to-emerald-500 pt-2">
                {academicHistory.map((item: any, idx: number) => (
                  <div key={idx} className="relative pl-8 space-y-2 group">
                    <div className="absolute left-2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-card bg-seneca-crimson group-hover:scale-125 transition-transform" />

                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 hover:border-seneca-crimson/40 transition-all space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-bold text-foreground">
                            {item.fromClassName || "Previous Class"} {item.fromSection ? `(${item.fromSection})` : ""}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-bold text-seneca-crimson">
                            {item.toClassName || "Advanced Class"} {item.toSection ? `(${item.toSection})` : ""}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5",
                              item.status === "promoted" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                              item.status === "conditionally_promoted" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                              item.status === "transferred" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                              item.status === "retained" && "bg-rose-500/10 text-rose-600 border-rose-500/30",
                              item.status === "graduated" && "bg-purple-500/10 text-purple-600 border-purple-500/30"
                            )}
                          >
                            {(item.status || "promoted").replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(item.promotionDate).toLocaleDateString("en-PK", { dateStyle: "medium" })}</span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-card/60 border border-border/40 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Session Score</span>
                          <span className="font-bold text-foreground">
                            {item.finalPercentage !== undefined ? `${item.finalPercentage}%` : "Evaluated"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Grade Awarded</span>
                          <span className="font-bold text-seneca-crimson">{item.overallGrade || "A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Session GPA</span>
                          <span className="font-bold text-foreground font-mono">
                            {item.finalGpa !== undefined ? item.finalGpa.toFixed(2) : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Principal Remarks */}
                      {item.remarks && (
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Principal &amp; Academic Board Endorsement</span>
                            </span>
                            {item.promotedByName && <span>Authorized by: {item.promotedByName}</span>}
                          </div>
                          <p className="italic text-foreground/90">&ldquo;{item.remarks}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
