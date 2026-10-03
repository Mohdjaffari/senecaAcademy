"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Layers,
  CreditCard,
  UserPlus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building,
  Sparkles,
  Download,
  Bell,
  Search,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Check,
  ChevronRight,
  Printer,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCampusPortal } from "@/lib/hooks/useCampusPortal";
import { CAMPUS_WINGS } from "@/lib/constants/campus-wing";

export interface PrincipalDashboardProps {
  forcedWing?: "all" | "junior" | "senior";
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalCapacity: number;
    campusOccupancy: number;
    studentTeacherRatio: number;
    pendingAdmissions: number;
    totalAdmissions: number;
    recentAdmissions: any[];
    recentLogs: any[];
    feeSummary: {
      totalBilled: number;
      totalCollected: number;
      totalOutstanding: number;
      recoveryRate: number;
    };
    classesList: any[];
    wingStats?: {
      junior: {
        totalStudents: number;
        totalTeachers: number;
        totalClasses: number;
        totalCapacity: number;
        campusOccupancy: number;
        studentTeacherRatio: number;
      };
      senior: {
        totalStudents: number;
        totalTeachers: number;
        totalClasses: number;
        totalCapacity: number;
        campusOccupancy: number;
        studentTeacherRatio: number;
      };
    };
    gradeEnrollmentData: {
      grade: string;
      gradeLevel?: number;
      wing?: "junior" | "senior";
      enrolled: number;
      capacity: number;
      occupancy: number;
    }[];
    admissionPipelineData: {
      name: string;
      rawStatus: string;
      count: number;
      value: number;
      color: string;
    }[];
    monthlyFeeData: {
      month: string;
      billed: number;
      collected: number;
      outstanding: number;
    }[];
    weeklyAttendanceData: {
      day: string;
      date: string;
      studentAttendance: number;
      teacherAttendance: number;
      punctuality: number;
      present: number;
      total: number;
    }[];
    todayAttendance: {
      percentage: number;
      presentCount: number;
      totalCount: number;
      punctuality: number;
      dateString: string;
      isRecorded: boolean;
    };
  };
}

export function PrincipalExecutiveDashboard({ stats, forcedWing }: PrincipalDashboardProps) {
  const { activeWing: hookWing, setCampusWing } = useCampusPortal(forcedWing);
  const activeWing = forcedWing || hookWing;
  const wingConfig = CAMPUS_WINGS[activeWing];

  const {
    totalStudents = 0,
    totalTeachers = 0,
    totalClasses = 0,
    totalCapacity = 0,
    campusOccupancy = 0,
    studentTeacherRatio = 0,
    pendingAdmissions = 0,
    totalAdmissions = 0,
    recentAdmissions = [],
    recentLogs = [],
    feeSummary = { totalBilled: 0, totalCollected: 0, totalOutstanding: 0, recoveryRate: 0 },
    classesList = [],
    gradeEnrollmentData = [],
    admissionPipelineData = [],
    monthlyFeeData = [],
    weeklyAttendanceData = [],
    todayAttendance = {
      percentage: 0,
      presentCount: 0,
      totalCount: 0,
      punctuality: 0,
      dateString: "Today",
      isRecorded: false,
    },
    wingStats,
  } = stats || {};

  // Dynamically resolve metrics based on the active campus portal
  const isJunior = activeWing === "junior";
  const isSenior = activeWing === "senior";

  const effectiveStudents = isJunior
    ? (wingStats?.junior?.totalStudents ?? totalStudents)
    : isSenior
    ? (wingStats?.senior?.totalStudents ?? totalStudents)
    : totalStudents;

  const effectiveTeachers = isJunior
    ? (wingStats?.junior?.totalTeachers ?? totalTeachers)
    : isSenior
    ? (wingStats?.senior?.totalTeachers ?? totalTeachers)
    : totalTeachers;

  const effectiveClasses = isJunior
    ? (wingStats?.junior?.totalClasses ?? totalClasses)
    : isSenior
    ? (wingStats?.senior?.totalClasses ?? totalClasses)
    : totalClasses;

  const effectiveCapacity = isJunior
    ? (wingStats?.junior?.totalCapacity ?? totalCapacity)
    : isSenior
    ? (wingStats?.senior?.totalCapacity ?? totalCapacity)
    : totalCapacity;

  const effectiveOccupancy = isJunior
    ? (wingStats?.junior?.campusOccupancy ?? campusOccupancy)
    : isSenior
    ? (wingStats?.senior?.campusOccupancy ?? campusOccupancy)
    : campusOccupancy;

  const effectiveRatio = isJunior
    ? (wingStats?.junior?.studentTeacherRatio ?? studentTeacherRatio)
    : isSenior
    ? (wingStats?.senior?.studentTeacherRatio ?? studentTeacherRatio)
    : studentTeacherRatio;

  const filteredGradeEnrollmentData = gradeEnrollmentData.filter((item) => {
    if (isJunior) {
      return item.wing === "junior" || (typeof item.gradeLevel === "number" && item.gradeLevel <= 2);
    }
    if (isSenior) {
      return item.wing === "senior" || (typeof item.gradeLevel === "number" && item.gradeLevel > 2);
    }
    return true;
  });

  const handleBroadcastNotice = () => {
    toast.info("Institutional Broadcast", {
      description: "Redirecting to Announcements and Messaging center...",
    });
  };

  const handleExportReport = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden">
      {/* Dedicated Campus Principal Portal Banner */}
      {forcedWing && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card/90 border border-border/80 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs",
                isJunior
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-seneca-crimson/15 text-seneca-crimson border-seneca-crimson/30"
              )}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-foreground">
                  {isJunior
                    ? "Junior Wing Principal Portal"
                    : "Senior Wing Principal Portal"}
                </span>
                <Badge
                  className={cn(
                    "text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                    isJunior
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-seneca-crimson text-white shadow-xs"
                  )}
                >
                  {isJunior ? "≤ Grade 2 Dedicated" : "> Grade 2 Dedicated"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isJunior
                  ? "Early Childhood to Grade 2 Foundation Command Center (Playgroup, Nursery, KG, Gr 1, Gr 2)"
                  : "Middle, High School, Matric & College Command Center (Grades 3 through 12)"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Executive Banner & Campus Command Lockup */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 text-white shadow-2xl transition-all duration-300",
          isJunior
            ? "seneca-junior-hero-gradient"
            : isSenior
            ? "seneca-senior-hero-gradient"
            : "seneca-hero-gradient"
        )}
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-64 w-64 rounded-full bg-seneca-crimson-light/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <Sparkles className="h-3 w-3" />
                <span>
                  {isJunior
                    ? "Junior Wing Portal (Playgroup – Grade 2)"
                    : isSenior
                    ? "Senior Wing Portal (Grades 3 – 12 / College)"
                    : "Executive Command Center"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Database Connected</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              {isJunior ? (
                <>
                  Junior Campus <span className="text-seneca-amber">Executive Portal</span>
                </>
              ) : isSenior ? (
                <>
                  Senior Campus <span className="text-seneca-amber">Executive Portal</span>
                </>
              ) : (
                <>
                  Principal Executive <span className="text-seneca-amber">Dashboard</span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              {isJunior
                ? "Dedicated executive suite for Playgroup, Nursery, Prep/KG, Grade 1, and Grade 2 (Early Years & Lower Primary). Real-time attendance, Montessori teacher assignments, and classroom dynamics."
                : isSenior
                ? "Dedicated executive suite for Grade 3 to Grade 12 / 2nd Year College (Upper Primary, Middle, Matric, Cambridge & Intermediate). Academic tracking, specialized faculty, and examination readiness."
                : "Real-time institutional academic metrics, live student attendance, fee recovery dynamics, and admission pipeline monitoring across all campus wings for Seneca Academy."}
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center"
            >
              <Link href="/dashboard/calendar">
                <Bell className="h-3.5 w-3.5 mr-1.5 text-seneca-amber" />
                <span>Broadcast Notice</span>
              </Link>
            </Button>
            <Button
              onClick={handleExportReport}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto justify-center"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Executive Summary</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top-Tier KPI Metrics Grid (Mobile 1 col, Tablet 2 col, Desktop 5 col) */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Metric 1: Active Enrolled Students */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden hover:border-seneca-crimson/50 transition-all hover:scale-[1.01] duration-200">
          <CardContent className="p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {isJunior ? "Junior Students" : isSenior ? "Senior Students" : "Active Students"}
              </span>
              <div className="p-2 rounded-xl bg-seneca-crimson/10 text-seneca-crimson">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                {effectiveStudents}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{effectiveClasses} Active Class Sections</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Wing Capacity:</span>
              <span className="font-bold text-foreground">
                {effectiveOccupancy}% ({effectiveStudents}/{effectiveCapacity || "—"})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Academic Mentors / Teachers */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden hover:border-seneca-amber/50 transition-all hover:scale-[1.01] duration-200">
          <CardContent className="p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {isJunior ? "Junior Faculty" : isSenior ? "Senior Faculty" : "Faculty Mentors"}
              </span>
              <div className="p-2 rounded-xl bg-seneca-amber/15 text-seneca-amber">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                {effectiveTeachers}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{effectiveTeachers > 0 ? "Active Faculty Roster" : "No Faculty Registered"}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Student : Teacher:</span>
              <span className="font-bold text-foreground">
                {effectiveTeachers > 0 ? `1 : ${effectiveRatio}` : "—"} Ratio
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Fee Recovery & Revenue */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all hover:scale-[1.01] duration-200">
          <CardContent className="p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Fee Collection
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold font-heading text-foreground truncate">
                {formatCurrency(feeSummary.totalCollected)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{feeSummary.recoveryRate || 0}% Recovery Rate</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Outstanding:</span>
              <span className="font-bold text-rose-500 truncate">
                {formatCurrency(feeSummary.totalOutstanding)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Admission Pipeline */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:scale-[1.01] duration-200">
          <CardContent className="p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Admissions 2026
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                {pendingAdmissions}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Pending Reviews</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Total Applications:</span>
              <span className="font-bold text-foreground">{totalAdmissions} Total</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 5: Today's Campus Attendance */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden hover:border-seneca-crimson/50 transition-all hover:scale-[1.01] duration-200 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Today&apos;s Attendance
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                {todayAttendance.isRecorded ? `${todayAttendance.percentage}%` : "Not Marked"}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <Check className="h-3.5 w-3.5" />
                <span>
                  {todayAttendance.isRecorded
                    ? `${todayAttendance.presentCount}/${todayAttendance.totalCount} Present`
                    : "Pending Roll Call"}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{todayAttendance.isRecorded ? "Punctuality Rate:" : "Attendance Session:"}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {todayAttendance.isRecorded ? `${todayAttendance.punctuality}% On-Time` : todayAttendance.dateString}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Interactive Visual Charts Row 1: Area Chart & Donut Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Chart 1: Cash Flow & Monthly Fee Recovery (Area Chart - 7 Cols) */}
        <Card className="lg:col-span-7 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-seneca-crimson dark:text-seneca-amber-light" />
                <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Fee Invoicing vs Cash Recovery Velocity
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Monthly cash inflow comparison & recovery tracking (PKR)
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold bg-muted self-start sm:self-auto">
              Live Database
            </Badge>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-4">
            <div className="h-60 sm:h-72 w-full">
              {monthlyFeeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyFeeData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#810D0B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#810D0B" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis
                      width={45}
                      tick={{ fontSize: 9 }}
                      tickFormatter={(val) => val >= 1000 ? `${Math.round(val / 1000)}k` : `${val}`}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                      contentStyle={{
                        backgroundColor: "rgba(24, 24, 27, 0.95)",
                        borderRadius: "12px",
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Area
                      type="monotone"
                      dataKey="billed"
                      name="Total Invoiced"
                      stroke="#d97706"
                      fillOpacity={1}
                      fill="url(#colorBilled)"
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      name="Recovered Cash"
                      stroke="#810D0B"
                      fillOpacity={1}
                      fill="url(#colorCollected)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground border border-dashed border-border/80 rounded-2xl">
                  <CreditCard className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No Fee Invoices Recorded</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                    Generated student fee vouchers and collected dues will chart cash velocity here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Admissions Funnel & Application Breakdown (Pie/Donut - 5 Cols) */}
        <Card className="lg:col-span-5 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2 flex flex-row items-center justify-between border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Admission Pipeline Funnel
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Candidate application stage distribution
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold text-purple-600 bg-purple-500/10">
              Live Pipeline
            </Badge>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-4 flex flex-col justify-between">
            <div className="h-52 sm:h-56 w-full">
              {admissionPipelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={admissionPipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {admissionPipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} candidate${Number(val) === 1 ? "" : "s"} (${item.payload.value}%)`,
                        item.payload.name,
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(24, 24, 27, 0.95)",
                        borderRadius: "12px",
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground border border-dashed border-border/80 rounded-2xl">
                  <UserPlus className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No Admission Applications</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                    Public portal application submissions will automatically appear in this pipeline funnel.
                  </p>
                </div>
              )}
            </div>

            {/* Pipeline Stage Badges */}
            {admissionPipelineData.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-border/60 text-[10px] sm:text-[11px]">
                {admissionPipelineData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                    <span className="font-bold text-foreground ml-auto">{item.count} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Second Visual Charts Row: Grade Capacity & Weekly Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Chart 3: Grade Capacity & Enrollment (Bar Chart - 6 Cols) */}
        <Card className="lg:col-span-6 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-seneca-amber" />
              <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                Grade Capacity vs Current Enrolled
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Class section occupancy matrix across grade levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-4">
            <div className="h-64 sm:h-72 w-full">
              {filteredGradeEnrollmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredGradeEnrollmentData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="grade"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      tick={{ fontSize: 9 }}
                    />
                    <YAxis width={30} tick={{ fontSize: 9 }} />
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} students`, name]}
                      contentStyle={{
                        backgroundColor: "rgba(24, 24, 27, 0.95)",
                        borderRadius: "12px",
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                    <Bar dataKey="enrolled" name="Enrolled Students" fill="#810D0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacity" name="Class Capacity" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground border border-dashed border-border/80 rounded-2xl">
                  <Layers className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No Active Classes Configured</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                    Classes and student enrollments will display grade capacity metrics here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Weekly Attendance Dynamics (Line Chart - 6 Cols) */}
        <Card className="lg:col-span-6 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                Weekly Attendance & Punctuality Dynamics
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Daily percentage curves for students and punctuality
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-4">
            <div className="h-64 sm:h-72 w-full">
              {weeklyAttendanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyAttendanceData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} width={35} tick={{ fontSize: 9 }} tickFormatter={(val) => `${val}%`} />
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val}%`, name]}
                      contentStyle={{
                        backgroundColor: "rgba(24, 24, 27, 0.95)",
                        borderRadius: "12px",
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                    <Line
                      type="monotone"
                      dataKey="studentAttendance"
                      name="Student Attendance %"
                      stroke="#810D0B"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="punctuality"
                      name="Punctuality %"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground border border-dashed border-border/80 rounded-2xl">
                  <Activity className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No Attendance Records Logged</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                    Daily classroom attendance logged by faculty will plot weekly dynamics here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Operational Hubs: Admissions Review Desk & Security Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Admissions Review Action Desk (7 Cols) */}
        <Card className="lg:col-span-7 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                Recent Admission Submissions
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                New candidate applications awaiting committee action
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold shrink-0">
              <Link href="/dashboard/admissions">
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {recentAdmissions && recentAdmissions.length > 0 ? (
              recentAdmissions.slice(0, 5).map((app: any) => (
                <div
                  key={app._id}
                  className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-muted/40 transition-colors gap-3"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center font-bold text-xs font-mono shrink-0">
                      {app.applyingForClass}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-foreground truncate">{app.studentName}</div>
                      <div className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                        Guardian: <span className="font-semibold text-foreground">{app.fatherName}</span> •{" "}
                        <span className="font-mono text-[9px] sm:text-[10px]">{app.applicationNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] sm:text-[10px] font-bold capitalize px-2 py-0.5",
                        app.status === "approved" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                        app.status === "submitted" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                        app.status === "under_review" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                        app.status === "test_scheduled" && "bg-purple-500/10 text-purple-600 border-purple-500/30",
                        app.status === "enrolled" && "bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30",
                        app.status === "rejected" && "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      )}
                    >
                      {(app.status || "submitted").replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No new admission submissions found in database.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Security & Institutional Audit Logs (5 Cols) */}
        <Card className="lg:col-span-5 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                Live Audit & Security Feed
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Timestamped administrative & system events
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold shrink-0">
              <Link href="/dashboard/audit-logs">
                <span>View Logs</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.slice(0, 5).map((log: any) => (
                <div key={log._id} className="p-3 sm:p-3.5 text-xs space-y-1 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs truncate">{log.action}</span>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
                    {typeof log.details === "string"
                      ? log.details
                      : typeof log.details === "object" && log.details !== null
                      ? log.details.description ||
                        log.details.message ||
                        Object.entries(log.details)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" • ")
                      : log.resource || log.entity || "System event recorded"}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No administrative audit logs logged yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PrincipalExecutiveDashboard;
