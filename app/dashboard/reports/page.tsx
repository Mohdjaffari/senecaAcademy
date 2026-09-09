"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Award,
  Download,
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  FileText,
  DollarSign,
  Sparkles,
  PieChart as PieIcon,
  Percent,
  ChevronRight,
  ShieldCheck,
  Building,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MONTHLY_REVENUE_DATA = [
  { month: "Jan", billed: 700000, collected: 650000 },
  { month: "Feb", billed: 720000, collected: 680000 },
  { month: "Mar", billed: 740000, collected: 710000 },
  { month: "Apr", billed: 710000, collected: 690000 },
  { month: "May", billed: 730000, collected: 705000 },
  { month: "Jun", billed: 750000, collected: 725000 },
];

const GRADE_DISTRIBUTION_DATA = [
  { grade: "A* (90-100%)", count: 18, color: "#10b981" },
  { grade: "A (80-89%)", count: 24, color: "#06b6d4" },
  { grade: "B (70-79%)", count: 14, color: "#d97706" },
  { grade: "C (60-69%)", count: 6, color: "#8b5cf6" },
  { grade: "Below 60%", count: 2, color: "#f43f5e" },
];

const ATTENDANCE_TREND_DATA = [
  { week: "W1", rate: 96 },
  { week: "W2", rate: 94 },
  { week: "W3", rate: 95 },
  { week: "W4", rate: 93 },
  { week: "W5", rate: 97 },
  { week: "W6", rate: 94 },
];

export default function PrincipalReportsPage() {
  const [reportType, setReportType] = useState("all");

  const handleDownloadReport = (name: string) => {
    toast.success(`Generating ${name}...`, {
      description: "Institutional summary report generated in CSV format.",
    });

    const csvContent = "data:text/csv;charset=utf-8,Category,Metric,Value,Benchmark\nAcademic Excellence,Average GPA,3.84 / 4.0,Exceeds National Average\nAttendance Rate,Overall Presence,94.8%,High Punctuality\nFee Collection,Recovery Velocity,88.2%,Optimal Liquidity\nFaculty Mentorship,Teacher-Student Ratio,1:10,Optimal Quality\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Seneca_Institutional_Report_${name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* 1. Header & Hero Metric Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <BarChart3 className="h-3 w-3" />
                <span>Executive Institutional Intelligence</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Q3 Analytical Engine Active</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Reports & <span className="text-seneca-amber">Executive Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Consolidated intelligence on academic bell curves, fee collection velocities, attendance retention indices, and campus growth vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => handleDownloadReport("Executive Master Audit")}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto justify-center"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Master Dossier</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics Cards (4 Stat Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Institutional Index
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-crimson/10 text-seneca-crimson shrink-0">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            3.84 <span className="text-xs text-muted-foreground font-normal">/ 4.0</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Cambridge Rating:</span>
            <span className="font-bold text-emerald-600">A+ Band</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Annual Recovery
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
            91.2%
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Variance:</span>
            <span className="font-bold text-emerald-600">+4.5% vs Prev Year</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Student Retention
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-amber/15 text-seneca-amber shrink-0">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            97.8%
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Attrition:</span>
            <span className="font-bold text-foreground">&lt; 2.2% Annual</span>
          </div>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Attendance Avg
            </span>
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            94.8%
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Punctuality:</span>
            <span className="font-bold text-emerald-600">High Compliance</span>
          </div>
        </Card>
      </div>

      {/* 3. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Chart 1: Fee Collection Velocity Area Chart */}
        <Card className="lg:col-span-7 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                Revenue Invoicing vs Collection Velocity
              </h3>
              <p className="text-[11px] text-muted-foreground">Monthly gross fees billed vs actual recovered PKR.</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/30">
              91.2% Recovery
            </Badge>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="billGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800020" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#800020" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="month" stroke="currentColor" className="text-[10px] opacity-60" />
                <YAxis stroke="currentColor" className="text-[10px] opacity-60" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="billed" stroke="#800020" strokeWidth={2} fillOpacity={1} fill="url(#billGrad)" name="Gross Billed" />
                <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colGrad)" name="Collected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Grade Bell Curve Distribution */}
        <Card className="lg:col-span-5 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
              Academic Grade Distribution
            </h3>
            <p className="text-[11px] text-muted-foreground">GPA bell-curve distribution across Cambridge & Matric cohorts.</p>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={GRADE_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {GRADE_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px]">
            {GRADE_DISTRIBUTION_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground truncate">{item.grade}:</span>
                <span className="font-bold text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. One-Click Report Generation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-seneca-crimson" />
            <h4 className="font-bold text-sm text-foreground">Academic Grade Dossier</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Export comprehensive student GPA, transcript marks, and class rank reports.
          </p>
          <Button
            onClick={() => handleDownloadReport("Academic Grade Dossier")}
            variant="outline"
            size="sm"
            className="w-full rounded-xl text-xs font-bold gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV</span>
          </Button>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <h4 className="font-bold text-sm text-foreground">Fee Reconciliation Ledger</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Export detailed monthly collection reconciliation, concession audits, and arrears.
          </p>
          <Button
            onClick={() => handleDownloadReport("Fee Reconciliation Ledger")}
            variant="outline"
            size="sm"
            className="w-full rounded-xl text-xs font-bold gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV</span>
          </Button>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-seneca-amber" />
            <h4 className="font-bold text-sm text-foreground">Faculty & Student Demographics</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Export teacher-student ratios, enrollment capacities, and institutional census.
          </p>
          <Button
            onClick={() => handleDownloadReport("Demographics & Census")}
            variant="outline"
            size="sm"
            className="w-full rounded-xl text-xs font-bold gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV</span>
          </Button>
        </Card>
      </div>
    </div>
  );
}
