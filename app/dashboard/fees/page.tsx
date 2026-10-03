"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  DollarSign,
  Calendar,
  Layers,
  Search,
  Filter,
  Plus,
  Download,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  X,
  Building,
  Users,
  TrendingUp,
  Percent,
  Check,
  Receipt,
  FileCheck,
  Printer,
  ChevronRight,
  ShieldCheck,
  Landmark,
  FileText,
  AlertCircle,
  HelpCircle,
  Copy,
  ExternalLink,
  Wallet,
  ArrowUpRight,
  Coins,
  History,
  CheckCircle,
  Upload,
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
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCampusPortal } from "@/lib/hooks/useCampusPortal";
import { resolveClassWing } from "@/lib/constants/campus-wing";

interface FeeVoucher {
  id: string;
  voucherNumber: string;
  month: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  fatherName: string;
  fatherPhone: string;
  feeCategory: string;
  admissionNumber: string;
  rollNumber: string;
  classId: string;
  className: string;
  rawClassName: string;
  section: string;
  tuitionFee: number;
  admissionFee: number;
  securityFee: number;
  examFee: number;
  otherCharges: number;
  discount: number;
  fine: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  formattedDueDate: string;
  status: "paid" | "partial" | "pending" | "overdue" | "under_review";
  paidSlipUrl?: string;
  paidSlipBankName?: string;
  paidSlipTxnRef?: string;
  paidSlipDepositDate?: string;
  paidSlipNotes?: string;
  paidSlipUploadedAt?: string;
  approvalStatus?: "none" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

interface FeeSummary {
  totalBilled: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionRate: number;
  statusCounts: {
    all: number;
    paid: number;
    partial: number;
    pending: number;
    overdue: number;
    under_review: number;
  };
}

interface FeePaymentItem {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentDate: string;
  formattedDate: string;
  paymentMethod: "cash" | "bank_transfer" | "online_card" | "cheque";
  transactionReference: string;
  notes: string;
  studentName: string;
  admissionNumber: string;
  rollNumber: string;
  className: string;
  voucherNumber: string;
  month: string;
  receivedBy: string;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
  studentCount?: number;
}

interface StudentOption {
  id: string;
  name: string;
  admissionNumber: string;
  rollNumber: string;
  className: string;
  feeCategory: string;
}

interface BankAccountItem {
  id?: string;
  _id?: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  branchName?: string;
  branchCode?: string;
  routingCode?: string;
  instructions?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export default function PrincipalFeesPage() {
  const { activeWing, setCampusWing, wingConfig } = useCampusPortal();
  const [fees, setFees] = useState<FeeVoucher[]>([]);
  const [payments, setPayments] = useState<FeePaymentItem[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([]);
  const [summary, setSummary] = useState<FeeSummary>({
    totalBilled: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0,
    statusCounts: { all: 0, paid: 0, partial: 0, pending: 0, overdue: 0, under_review: 0 },
  });
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [studentsList, setStudentsList] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<"ledger" | "batch" | "reconciliation">("ledger");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals
  const [createSingleModalOpen, setCreateSingleModalOpen] = useState(false);
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [printSlipModalOpen, setPrintSlipModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);

  const [selectedVoucher, setSelectedVoucher] = useState<FeeVoucher | null>(null);
  const [selectedPaymentVoucher, setSelectedPaymentVoucher] = useState<FeeVoucher | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<FeeVoucher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Paid Slip Verification State
  const [verifySlipModalOpen, setVerifySlipModalOpen] = useState(false);
  const [selectedVoucherForSlip, setSelectedVoucherForSlip] = useState<FeeVoucher | null>(null);
  const [rejectReasonPromptOpen, setRejectReasonPromptOpen] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [verifyingSlip, setVerifyingSlip] = useState(false);

  // Record Payment Form
  const [payAmount, setPayAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<"cash" | "bank_transfer" | "online_card" | "cheque">("cash");
  const [payRef, setPayRef] = useState<string>("");
  const [payNotes, setPayNotes] = useState<string>("");
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paySubmitting, setPaySubmitting] = useState(false);

  // Single Voucher Form
  const [singleStudentId, setSingleStudentId] = useState("");
  const [singleMonth, setSingleMonth] = useState("October 2026");
  const [singleTuition, setSingleTuition] = useState("14500");
  const [singleAdmission, setSingleAdmission] = useState("0");
  const [singleSecurity, setSingleSecurity] = useState("0");
  const [singleExamFee, setSingleExamFee] = useState("1500");
  const [singleOtherCharges, setSingleOtherCharges] = useState("500");
  const [singleDiscount, setSingleDiscount] = useState("0");
  const [singleFine, setSingleFine] = useState("0");
  const [singleDueDate, setSingleDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [singleSubmitting, setSingleSubmitting] = useState(false);

  // Batch Generation Form
  const [batchClassId, setBatchClassId] = useState("");
  const [batchMonth, setBatchMonth] = useState("October 2026");
  const [batchTuition, setBatchTuition] = useState("14500");
  const [batchAdmission, setBatchAdmission] = useState("0");
  const [batchSecurity, setBatchSecurity] = useState("0");
  const [batchExamFee, setBatchExamFee] = useState("1500");
  const [batchOtherCharges, setBatchOtherCharges] = useState("500");
  const [batchBaseDiscount, setBatchBaseDiscount] = useState("0");
  const [batchFine, setBatchFine] = useState("0");
  const [batchDueDate, setBatchDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  // Fetch all fees and summary from API
  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeWing !== "all") params.append("wing", activeWing);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedClassId !== "all") params.append("classId", selectedClassId);
      if (selectedMonth !== "all") params.append("month", selectedMonth);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/fees?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setFees(data.data.fees || []);
        if (data.data.bankAccounts && Array.isArray(data.data.bankAccounts)) {
          setBankAccounts(data.data.bankAccounts);
        }
        if (data.data.summary) {
          setSummary(data.data.summary);
        }
        if (data.data.payments) {
          setPayments(data.data.payments);
        }
      }
    } catch (err) {
      console.error("Failed to load fee vouchers:", err);
      toast.error("Error loading fee ledger.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes and students options
  const fetchMetadata = async () => {
    try {
      const [classesRes, studentsRes] = await Promise.all([
        fetch("/api/classes?status=active"),
        fetch("/api/students?limit=200"),
      ]);

      const classesData = await classesRes.json();
      const studentsData = await studentsRes.json();

      if (classesData.success && classesData.data?.classes) {
        const mappedClasses: ClassOption[] = classesData.data.classes.map((c: any) => ({
          id: c.id || c._id,
          name: c.name,
          section: c.section,
          studentCount: c.studentCount || 0,
        }));
        setClassesList(mappedClasses);
        if (mappedClasses.length > 0) {
          setBatchClassId(mappedClasses[0].id);
        }
      }

      if (studentsData.success && studentsData.data?.students) {
        const mappedStudents: StudentOption[] = studentsData.data.students.map((s: any) => ({
          id: s.id || s._id,
          name: s.name,
          admissionNumber: s.admissionNumber,
          rollNumber: s.rollNumber,
          className: s.className || "Class",
          feeCategory: s.feeCategory || "Standard",
        }));
        setStudentsList(mappedStudents);
        if (mappedStudents.length > 0) {
          setSingleStudentId(mappedStudents[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load metadata:", err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchFees();
  }, [selectedStatus, selectedClassId, selectedMonth, activeWing]);

  // Months set for dropdown filter
  const availableMonths = Array.from(new Set(fees.map((f) => f.month))).filter(Boolean);

  // Single Voucher Submission
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleStudentId) {
      toast.error("Please select a target student.");
      return;
    }
    setSingleSubmitting(true);

    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: singleStudentId,
          month: singleMonth,
          tuitionFee: Number(singleTuition),
          admissionFee: Number(singleAdmission),
          securityFee: Number(singleSecurity),
          examFee: Number(singleExamFee),
          otherCharges: Number(singleOtherCharges),
          discount: Number(singleDiscount),
          fine: Number(singleFine),
          dueDate: singleDueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to generate voucher.");

      toast.success("Fee Voucher Issued!", {
        description: `Voucher #${data.data.voucherNumber} created for ${singleMonth}.`,
      });

      setCreateSingleModalOpen(false);
      fetchFees();
    } catch (err: any) {
      toast.error("Generation Failed", { description: err.message });
    } finally {
      setSingleSubmitting(false);
    }
  };

  // Batch Generation Submission
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchClassId) {
      toast.error("Please select a class section for batch generation.");
      return;
    }
    setBatchSubmitting(true);

    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: true,
          classId: batchClassId,
          month: batchMonth,
          tuitionFee: Number(batchTuition),
          admissionFee: Number(batchAdmission),
          securityFee: Number(batchSecurity),
          examFee: Number(batchExamFee),
          otherCharges: Number(batchOtherCharges),
          discount: Number(batchBaseDiscount),
          fine: Number(batchFine),
          dueDate: batchDueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Batch generation failed.");

      toast.success("Batch Challans Generated Successfully!", {
        description: data.message || `Generated vouchers for ${data.data?.className}.`,
      });

      setActiveTab("ledger");
      fetchFees();
    } catch (err: any) {
      toast.error("Batch Failed", { description: err.message });
    } finally {
      setBatchSubmitting(false);
    }
  };

  // Open Record Payment Modal
  const handleOpenPaymentModal = (voucher: FeeVoucher) => {
    setSelectedPaymentVoucher(voucher);
    setPayAmount(voucher.balanceAmount > 0 ? String(voucher.balanceAmount) : String(voucher.totalAmount));
    setPayMethod("cash");
    setPayRef("Cash Desk Counter");
    setPayNotes("");
    setPayDate(new Date().toISOString().slice(0, 10));
    setRecordPaymentModalOpen(true);
  };

  // Submit Payment Record
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentVoucher) return;
    const amountNum = Number(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }
    setPaySubmitting(true);

    try {
      const res = await fetch("/api/fees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeId: selectedPaymentVoucher.id,
          amount: amountNum,
          paymentMethod: payMethod,
          transactionReference: payRef,
          notes: payNotes,
          paymentDate: payDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to record payment.");

      toast.success("Payment Reconciled & Receipt Issued!", {
        description: `Receipt #${data.data?.payment?.receiptNumber} recorded for ${selectedPaymentVoucher.studentName}.`,
      });

      setRecordPaymentModalOpen(false);
      fetchFees();
    } catch (err: any) {
      toast.error("Payment Failed", { description: err.message });
    } finally {
      setPaySubmitting(false);
    }
  };

  // Void/Delete Voucher
  const handleDeleteVoucher = async () => {
    if (!voucherToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/fees?id=${voucherToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to delete voucher.");

      toast.success("Fee Voucher Voided", {
        description: `Voucher #${voucherToDelete.voucherNumber} has been removed.`,
      });

      setDeleteConfirmModalOpen(false);
      setVoucherToDelete(null);
      fetchFees();
    } catch (err: any) {
      toast.error("Deletion Failed", { description: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Ledger CSV
  const handleExportCSV = () => {
    if (fees.length === 0) return toast.info("No fee records to export.");
    const headers =
      "Voucher #,Student Name,Admission #,Roll #,Class,Billing Month,Tuition,Exam Fee,Other Charges,Discount,Fine,Total Billed,Paid Amount,Balance,Due Date,Status\n";
    const rows = fees
      .map(
        (f) =>
          `"${f.voucherNumber}","${f.studentName}","${f.admissionNumber}","${f.rollNumber}","${f.className}","${f.month}","${f.tuitionFee}","${f.examFee}","${f.otherCharges}","${f.discount}","${f.fine}","${f.totalAmount}","${f.paidAmount}","${f.balanceAmount}","${f.formattedDueDate}","${f.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Seneca_Fee_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fee ledger exported to CSV!");
  };

  // Filtered in-memory search & campus wing
  const displayedFees = fees.filter((f) => {
    // Campus portal wing filter
    if (activeWing !== "all") {
      const voucherWing = resolveClassWing(undefined, f.className || f.rawClassName);
      if (voucherWing !== activeWing) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.voucherNumber.toLowerCase().includes(q) ||
      f.studentName.toLowerCase().includes(q) ||
      f.admissionNumber.toLowerCase().includes(q) ||
      f.rollNumber.toLowerCase().includes(q) ||
      f.className.toLowerCase().includes(q) ||
      f.fatherName.toLowerCase().includes(q)
    );
  });

  // Dynamically compute summary for the active wing scope
  const activeSummary = useMemo(() => {
    if (activeWing === "all") return summary;
    const totalBilled = displayedFees.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
    const totalCollected = displayedFees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const totalPending = displayedFees.reduce(
      (acc, f) => (f.status === "pending" || f.status === "partial" ? acc + (f.balanceAmount || 0) : acc),
      0
    );
    const totalOverdue = displayedFees.reduce(
      (acc, f) => (f.status === "overdue" ? acc + (f.balanceAmount || 0) : acc),
      0
    );
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
    const statusCounts = {
      all: displayedFees.length,
      paid: displayedFees.filter((f) => f.status === "paid").length,
      partial: displayedFees.filter((f) => f.status === "partial").length,
      pending: displayedFees.filter((f) => f.status === "pending").length,
      overdue: displayedFees.filter((f) => f.status === "overdue").length,
      under_review: displayedFees.filter((f) => f.status === "under_review").length,
    };
    return { totalBilled, totalCollected, totalPending, totalOverdue, collectionRate, statusCounts };
  }, [summary, activeWing, displayedFees]);

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden pb-12">
      {/* 1. Header & Hero Metric Banner */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 p-4 sm:p-8 text-white shadow-2xl transition-all duration-300",
          activeWing === "junior"
            ? "seneca-junior-hero-gradient"
            : activeWing === "senior"
            ? "seneca-senior-hero-gradient"
            : "seneca-hero-gradient"
        )}
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <Landmark className="h-3 w-3" />
                <span>{wingConfig.name}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Real-Time Database Ledger</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Fee Management & <span className="text-seneca-amber">Revenue Ledger</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              {activeWing === "junior"
                ? "Supervise Early Years and Primary fee collections, automated nursery/KG billing batches, 3-copy challans, and online receipt verifications."
                : activeWing === "senior"
                ? "Oversee Middle, Secondary (Matric/Cambridge), and Intermediate tuition fees, lab charges, admission installments, and treasury reconciliations."
                : "Supervise class fee collections, issue 3-copy printable bank challans, automate class-wide billing batches, and record cash & online reconciliations."}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm flex-1 sm:flex-none justify-center"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={() => setActiveTab("batch")}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-seneca-amber/20 hover:bg-seneca-amber/30 text-seneca-amber-light border-seneca-amber/30 flex-1 sm:flex-none justify-center"
            >
              <Layers className="h-3.5 w-3.5 mr-1.5" />
              <span>Batch Billing</span>
            </Button>
            <Button
              onClick={() => setCreateSingleModalOpen(true)}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 flex-1 sm:flex-none justify-center"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Issue Single Challan</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (100% Real Database Calculations) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Card 1: Total Billed */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Total Billed Gross
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-crimson/10 text-seneca-crimson shrink-0">
              <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-extrabold font-heading text-foreground truncate">
            {formatCurrency(activeSummary.totalBilled)}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Total Challans:</span>
            <span className="font-bold text-foreground">{activeSummary.statusCounts.all} Vouchers</span>
          </div>
        </Card>

        {/* Card 2: Collected Revenue */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Collected Revenue
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400 truncate">
            {formatCurrency(activeSummary.totalCollected)}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Verified Paid:</span>
            <span className="font-bold text-emerald-600">{activeSummary.statusCounts.paid} Settled</span>
          </div>
        </Card>

        {/* Card 3: Pending Receivables */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Pending Receivables
            </span>
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-extrabold font-heading text-foreground truncate">
            {formatCurrency(activeSummary.totalPending)}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Pending Roll:</span>
            <span className="font-bold text-amber-600">{activeSummary.statusCounts.pending} Vouchers</span>
          </div>
        </Card>

        {/* Card 4: Recovery Velocity & Overdue */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Recovery Velocity
            </span>
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-extrabold font-heading text-foreground flex items-baseline gap-1.5">
            <span>{activeSummary.collectionRate}%</span>
            {activeSummary.statusCounts.overdue > 0 && (
              <span className="text-[9px] font-bold text-rose-600 bg-rose-500/10 px-1 py-0.5 rounded">
                {activeSummary.statusCounts.overdue} Overdue
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Overdue Amount:</span>
            <span className="font-bold text-rose-600">{formatCurrency(activeSummary.totalOverdue)}</span>
          </div>
        </Card>

        {/* Card 5: Paid Slips Review */}
        <Card
          onClick={() => {
            setActiveTab("ledger");
            setSelectedStatus("under_review");
          }}
          className="border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/15 cursor-pointer backdrop-blur-xl shadow-xl rounded-2xl p-3 sm:p-5 space-y-1.5 sm:space-y-2 transition-all col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate flex items-center gap-1">
              <Upload className="h-3 w-3 text-amber-500" />
              <span>Paid Slips Review</span>
            </span>
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-extrabold font-heading text-amber-600 dark:text-amber-400 truncate flex items-center gap-2">
            <span>{activeSummary.statusCounts.under_review || 0} Slips</span>
            {(activeSummary.statusCounts.under_review || 0) > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Awaiting Bursar:</span>
            <span className="font-bold text-amber-600 underline">Review Slips</span>
          </div>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("ledger")}
          className={cn(
            "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "ledger"
              ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Receipt className="h-4 w-4" />
          <span>Fee Challans Ledger</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {fees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("batch")}
          className={cn(
            "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "batch"
              ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Batch Class Challan Generator</span>
        </button>

        <button
          onClick={() => setActiveTab("reconciliation")}
          className={cn(
            "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "reconciliation"
              ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <History className="h-4 w-4" />
          <span>Payment Reconciliation & Receipts</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {payments.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FEE CHALLANS LEDGER & CASH DESK                                     */}
      {/* ========================================================================= */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          {/* Institutional Wing Scope Indicator (Locked per Principal Portal) */}
          {activeWing !== "all" && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-card border border-border/80 shadow-sm text-xs font-semibold text-muted-foreground w-fit">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  activeWing === "junior" ? "bg-amber-500 animate-pulse" : "bg-seneca-crimson animate-pulse"
                )}
              />
              <span>
                Campus Portal Scope:{" "}
                <strong className="text-foreground">
                  {activeWing === "junior"
                    ? "Junior Wing (Playgroup – Grade 2)"
                    : "Senior Wing (Grade 3 – 12 / College)"}
                </strong>
              </span>
            </div>
          )}

          {/* Filter Toolbar */}
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center">
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by student, voucher #, roll #, admission #, parent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-background text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Class Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                >
                  <option value="all">All Class Sections</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - Section {c.section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold capitalize"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">✓ Paid ({summary.statusCounts.paid})</option>
                  <option value="under_review">📋 Under Verification ({summary.statusCounts.under_review || 0})</option>
                  <option value="partial">⏳ Partial ({summary.statusCounts.partial})</option>
                  <option value="pending">🕒 Pending ({summary.statusCounts.pending})</option>
                  <option value="overdue">⚠️ Overdue ({summary.statusCounts.overdue})</option>
                </select>
              </div>

              {/* Month & Actions */}
              <div className="md:col-span-2 flex items-center justify-between sm:justify-end gap-1.5">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-10 px-2 rounded-xl bg-background border border-border text-xs font-semibold flex-1 md:flex-none"
                >
                  <option value="all">All Months</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <div className="flex items-center border border-border rounded-xl p-0.5 bg-muted/40">
                  <button
                    onClick={() => setViewMode("table")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      viewMode === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Table View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Grid Card View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  onClick={fetchFees}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl shrink-0"
                  title="Refresh Database"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Fees Table or Card Grid */}
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber-light" />
              <p className="text-xs font-bold text-muted-foreground">Loading Seneca Fee Ledger...</p>
            </div>
          ) : displayedFees.length === 0 ? (
            <Card className="border border-border/80 bg-card/90 rounded-3xl p-10 sm:p-12 text-center space-y-4">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">No Fee Vouchers Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No fee records match your active search filters or selected class section.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedClassId("all");
                  setSelectedMonth("all");
                  setSearchQuery("");
                }}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold"
              >
                Reset Filters
              </Button>
            </Card>
          ) : viewMode === "table" ? (
            /* Table View */
            <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Voucher #</th>
                      <th className="py-3 px-4">Student & Roll</th>
                      <th className="py-3 px-4">Class Section</th>
                      <th className="py-3 px-4">Billing Month</th>
                      <th className="py-3 px-4">Total Billed</th>
                      <th className="py-3 px-4">Paid / Balance</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {displayedFees.map((f) => (
                      <tr key={f.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-foreground text-xs flex items-center gap-1.5">
                            <Receipt className="h-3.5 w-3.5 text-seneca-crimson dark:text-seneca-amber-light shrink-0" />
                            <span>{f.voucherNumber}</span>
                          </div>
                          {f.feeCategory !== "Standard" && (
                            <span className="text-[9px] text-seneca-amber font-semibold block truncate max-w-[130px]">
                              {f.feeCategory}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground text-xs">{f.studentName}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Roll: <span className="font-semibold text-foreground">{f.rollNumber}</span> • {f.admissionNumber}
                          </div>
                          {f.fatherName && f.fatherName !== "Parent / Guardian" && (
                            <div className="text-[9px] text-muted-foreground">
                              S/D/O: {f.fatherName}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <Badge variant="outline" className="text-[10px] font-semibold bg-muted/50">
                              {f.className}
                            </Badge>
                            <div>
                              {resolveClassWing(undefined, f.className || f.rawClassName) === "junior" ? (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                  Junior Wing
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber-light border border-seneca-crimson/20">
                                  Senior Wing
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-semibold text-foreground text-xs">{f.month}</td>

                        <td className="py-3 px-4">
                          <div className="font-extrabold text-foreground text-xs">
                            {formatCurrency(f.totalAmount)}
                          </div>
                          {f.discount > 0 && (
                            <div className="text-[9px] text-emerald-600 font-semibold">
                              Disc: -{formatCurrency(f.discount)}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-emerald-600 text-xs">
                            Paid: {formatCurrency(f.paidAmount)}
                          </div>
                          {f.balanceAmount > 0 ? (
                            <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              Bal: {formatCurrency(f.balanceAmount)}
                            </div>
                          ) : (
                            <div className="text-[10px] font-bold text-emerald-600">
                              ✓ Cleared
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-xs text-foreground font-medium">{f.formattedDueDate}</div>
                          {f.status === "overdue" && (
                            <span className="text-[9px] font-bold text-rose-600">Past Due</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider",
                              f.status === "paid" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                              f.status === "under_review" && "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse",
                              f.status === "partial" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                              f.status === "pending" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                              f.status === "overdue" && "bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse"
                            )}
                          >
                            {f.status === "under_review" ? "Under Review" : f.status}
                          </Badge>
                          {f.approvalStatus === "rejected" && (
                            <span className="text-[9px] font-bold text-rose-600 block mt-0.5">Slip Rejected</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Verify Slip Button if student uploaded receipt */}
                            {(f.paidSlipUrl || f.status === "under_review") && (
                              <Button
                                onClick={() => {
                                  setSelectedVoucherForSlip(f);
                                  setVerifySlipModalOpen(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/40 gap-1 animate-pulse"
                                title="Inspect & Verify Submitted Fee Slip"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Verify Slip</span>
                              </Button>
                            )}

                            {/* Record Payment Button (if balance remaining) */}
                            {f.status !== "paid" && (
                              <Button
                                onClick={() => handleOpenPaymentModal(f)}
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                                title="Record Payment"
                              >
                                <Coins className="h-3 w-3 mr-1" />
                                <span>Pay</span>
                              </Button>
                            )}

                            {/* Print Challan Slip Button */}
                            <Button
                              onClick={() => {
                                setSelectedVoucher(f);
                                setPrintSlipModalOpen(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[10px] font-bold gap-1"
                              title="Print 3-Part Bank Challan Slip"
                            >
                              <Printer className="h-3 w-3 text-seneca-crimson dark:text-seneca-amber-light" />
                              <span>Slip</span>
                            </Button>

                            {/* Delete / Void Button */}
                            <Button
                              onClick={() => {
                                setVoucherToDelete(f);
                                setDeleteConfirmModalOpen(true);
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                              title="Void Voucher"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            /* Grid Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {displayedFees.map((f) => (
                <Card
                  key={f.id}
                  className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl p-4 space-y-3 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
                    <div>
                      <span className="font-mono text-xs font-bold text-seneca-crimson dark:text-seneca-amber-light flex items-center gap-1">
                        <Receipt className="h-3.5 w-3.5" />
                        {f.voucherNumber}
                      </span>
                      <h4 className="text-sm font-bold text-foreground mt-0.5">{f.studentName}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        Roll: <span className="font-semibold text-foreground">{f.rollNumber}</span> • {f.className}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase",
                        f.status === "paid" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                        f.status === "partial" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                        f.status === "pending" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                        f.status === "overdue" && "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      )}
                    >
                      {f.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Billing Month</span>
                      <span className="font-semibold text-foreground">{f.month}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Due Date</span>
                      <span className="font-semibold text-foreground">{f.formattedDueDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Total Billed</span>
                      <span className="font-extrabold text-foreground">{formatCurrency(f.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Balance Due</span>
                      <span className={cn("font-extrabold", f.balanceAmount > 0 ? "text-rose-600" : "text-emerald-600")}>
                        {formatCurrency(f.balanceAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {f.status !== "paid" ? (
                      <Button
                        onClick={() => handleOpenPaymentModal(f)}
                        size="sm"
                        variant="glow"
                        className="flex-1 h-8 text-xs font-bold gap-1.5"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        <span>Record Payment</span>
                      </Button>
                    ) : (
                      <div className="flex-1 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Fully Paid & Cleared</span>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        setSelectedVoucher(f);
                        setPrintSlipModalOpen(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs font-bold gap-1"
                      title="Print 3-Part Challan"
                    >
                      <Printer className="h-3.5 w-3.5 text-primary" />
                      <span>Slip</span>
                    </Button>

                    <Button
                      onClick={() => {
                        setVoucherToDelete(f);
                        setDeleteConfirmModalOpen(true);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                      title="Void"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BATCH CLASS CHALLAN GENERATOR                                       */}
      {/* ========================================================================= */}
      {activeTab === "batch" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
                <Layers className="h-4 w-4" />
                <span>Automated Fee Engine</span>
              </div>
              <h2 className="text-xl font-extrabold font-heading text-foreground">
                Batch Class Fee Challan Generator
              </h2>
              <p className="text-xs text-muted-foreground">
                Issue monthly fee challans for all enrolled students in a class section in one single transaction. Scholarship concessions are computed automatically.
              </p>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Target Class Section <span className="text-seneca-crimson">*</span>
                  </label>
                  <select
                    value={batchClassId}
                    onChange={(e) => setBatchClassId(e.target.value)}
                    className="h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                    required
                  >
                    <option value="">Select Target Class</option>
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Billing Month / Term <span className="text-seneca-crimson">*</span>
                  </label>
                  <Input
                    required
                    type="text"
                    placeholder="e.g. October 2026, 1st Term 2026"
                    value={batchMonth}
                    onChange={(e) => setBatchMonth(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Tuition Fee (PKR)</label>
                  <Input
                    required
                    type="number"
                    value={batchTuition}
                    onChange={(e) => setBatchTuition(e.target.value)}
                    className="h-11 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Exam / Lab Fee</label>
                  <Input
                    type="number"
                    value={batchExamFee}
                    onChange={(e) => setBatchExamFee(e.target.value)}
                    className="h-11 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Other Charges / Utilities</label>
                  <Input
                    type="number"
                    value={batchOtherCharges}
                    onChange={(e) => setBatchOtherCharges(e.target.value)}
                    className="h-11 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Admission Fee (If New)</label>
                  <Input
                    type="number"
                    value={batchAdmission}
                    onChange={(e) => setBatchAdmission(e.target.value)}
                    className="h-11 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Security Fee (Refundable)</label>
                  <Input
                    type="number"
                    value={batchSecurity}
                    onChange={(e) => setBatchSecurity(e.target.value)}
                    className="h-11 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Base Discount / Concession</label>
                  <Input
                    type="number"
                    value={batchBaseDiscount}
                    onChange={(e) => setBatchBaseDiscount(e.target.value)}
                    className="h-11 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Challan Due Date <span className="text-seneca-crimson">*</span>
                  </label>
                  <Input
                    required
                    type="date"
                    value={batchDueDate}
                    onChange={(e) => setBatchDueDate(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Late Fine After Due Date (PKR)</label>
                  <Input
                    type="number"
                    value={batchFine}
                    onChange={(e) => setBatchFine(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                    placeholder="e.g. 500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("ledger")}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={batchSubmitting || !batchClassId}
                  variant="glow"
                  className="rounded-xl text-xs font-bold gap-2 px-6"
                >
                  {batchSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Class Vouchers...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="h-4 w-4" />
                      <span>Publish Batch Challans</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Side Explainer Card */}
          <div className="space-y-4">
            <Card className="border border-border/80 bg-gradient-to-br from-seneca-crimson/5 to-seneca-amber/10 backdrop-blur-xl shadow-lg rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-seneca-crimson dark:text-seneca-amber-light">
                <Sparkles className="h-4 w-4" />
                <span>Smart Scholarship Discount Matrix</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When batch vouchers are published, the engine automatically calculates tuition discounts based on each student&apos;s registered scholarship profile:
              </p>
              <div className="space-y-2 text-xs divide-y divide-border/40">
                <div className="flex justify-between py-1.5">
                  <span className="font-semibold text-foreground">Full Scholarship</span>
                  <span className="font-bold text-emerald-600">100% Tuition Waiver</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="font-semibold text-foreground">Merit Scholarship</span>
                  <span className="font-bold text-emerald-600">50% Tuition Discount</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="font-semibold text-foreground">Sibling Discount</span>
                  <span className="font-bold text-emerald-600">20% Tuition Discount</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="font-semibold text-foreground">Need-Based Concession</span>
                  <span className="font-bold text-emerald-600">30% Relief</span>
                </div>
              </div>
            </Card>

            <Card className="border border-border/80 bg-card/90 rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>100% Audit Compliance</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Every generated voucher is stamped with an immutable voucher serial number, tracking creation timestamp, and assigned to the active academic session.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAYMENT RECONCILIATION & CASH LEDGER                                */}
      {/* ========================================================================= */}
      {activeTab === "reconciliation" && (
        <div className="space-y-4">
          <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                  Cash Desk & Payment Reconciliation Ledger
                </h3>
                <p className="text-xs text-muted-foreground">
                  Audit trail of all fees collected via Cash Counter, 1Link/Bank Transfers, Online Cards, and Cheques.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-bold self-start sm:self-auto bg-emerald-500/10 text-emerald-600">
                {payments.length} Verified Receipts
              </Badge>
            </div>

            {payments.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-muted-foreground">
                <History className="h-10 w-10 mx-auto opacity-60" />
                <p className="text-xs font-bold">No payment transactions recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-3">Receipt #</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Student & Class</th>
                      <th className="py-3 px-3">Voucher #</th>
                      <th className="py-3 px-3">Amount Paid</th>
                      <th className="py-3 px-3">Payment Mode</th>
                      <th className="py-3 px-3">Reference / Notes</th>
                      <th className="py-3 px-3 text-right">Cashier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-foreground">{p.receiptNumber}</td>
                        <td className="py-3 px-3 text-muted-foreground">{p.formattedDate}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-foreground">{p.studentName}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {p.rollNumber} • {p.className}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{p.voucherNumber}</td>
                        <td className="py-3 px-3 font-extrabold text-emerald-600 text-xs">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-[10px] font-bold capitalize">
                            {p.paymentMethod.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground text-[11px]">
                          <div>{p.transactionReference}</div>
                          {p.notes && <div className="text-[9px] italic text-muted-foreground">{p.notes}</div>}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-foreground">{p.receivedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ISSUE SINGLE FEE CHALLAN                                          */}
      {/* ========================================================================= */}
      <Dialog open={createSingleModalOpen} onOpenChange={setCreateSingleModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-border/80">
          <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
              <Receipt className="h-4 w-4" />
              <span>Challan Generation</span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-extrabold font-heading">
              Issue Student Fee Challan
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Generate an individual fee voucher with customizable tuition, exams, security & concessions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSingleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Target Student <span className="text-seneca-crimson">*</span>
              </label>
              <select
                value={singleStudentId}
                onChange={(e) => setSingleStudentId(e.target.value)}
                className="h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                required
              >
                <option value="">Select Enrolled Student</option>
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Roll: {s.rollNumber} • {s.admissionNumber}) — {s.className}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Billing Month</label>
                <Input
                  required
                  type="text"
                  placeholder="e.g. October 2026"
                  value={singleMonth}
                  onChange={(e) => setSingleMonth(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Due Date</label>
                <Input
                  required
                  type="date"
                  value={singleDueDate}
                  onChange={(e) => setSingleDueDate(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Tuition Fee</label>
                <Input
                  required
                  type="number"
                  placeholder="14500"
                  value={singleTuition}
                  onChange={(e) => setSingleTuition(e.target.value)}
                  className="h-11 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Exam Fee</label>
                <Input
                  type="number"
                  placeholder="1500"
                  value={singleExamFee}
                  onChange={(e) => setSingleExamFee(e.target.value)}
                  className="h-11 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Other Charges</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={singleOtherCharges}
                  onChange={(e) => setSingleOtherCharges(e.target.value)}
                  className="h-11 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Admission Fee</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={singleAdmission}
                  onChange={(e) => setSingleAdmission(e.target.value)}
                  className="h-11 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Security Fee</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={singleSecurity}
                  onChange={(e) => setSingleSecurity(e.target.value)}
                  className="h-11 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Concession / Discount</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={singleDiscount}
                  onChange={(e) => setSingleDiscount(e.target.value)}
                  className="h-11 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateSingleModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={singleSubmitting}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {singleSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Challan...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Issue Fee Voucher</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: CASH DESK / RECORD PAYMENT MODAL                                  */}
      {/* ========================================================================= */}
      {selectedPaymentVoucher && (
        <Dialog open={recordPaymentModalOpen} onOpenChange={setRecordPaymentModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-border/80">
            <DialogHeader className="space-y-1 pb-3 border-b border-border/60">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <Coins className="h-4 w-4" />
                <span>Cash Desk Reconciler</span>
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Record Payment for Voucher #{selectedPaymentVoucher.voucherNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedPaymentVoucher.studentName} ({selectedPaymentVoucher.rollNumber}) • {selectedPaymentVoucher.className}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 pt-2">
              <div className="bg-muted/40 p-3.5 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Billed Amount:</span>
                  <span className="font-bold text-foreground">{formatCurrency(selectedPaymentVoucher.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Already Paid:</span>
                  <span>{formatCurrency(selectedPaymentVoucher.paidAmount)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/60 text-sm font-extrabold text-rose-600">
                  <span>Outstanding Balance:</span>
                  <span>{formatCurrency(selectedPaymentVoucher.balanceAmount)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Payment Amount to Collect (PKR) <span className="text-seneca-crimson">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    required
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="h-11 rounded-xl text-sm font-extrabold"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPayAmount(String(selectedPaymentVoucher.balanceAmount))}
                    className="h-11 text-xs font-bold rounded-xl shrink-0"
                  >
                    Full Balance
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                  >
                    <option value="cash">Cash Counter</option>
                    <option value="bank_transfer">Bank Transfer / 1Link</option>
                    <option value="online_card">Debit / Credit Card</option>
                    <option value="cheque">Cheque / Pay Order</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Payment Date</label>
                  <Input
                    required
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Deposit / Transaction Reference
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Cash Receipt #04, 1Link Ref #994827"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Cashier Notes (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. Received by Mr. Aslam (Accounts Desk)"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="pt-2 border-t border-border/60 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecordPaymentModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={paySubmitting}
                  variant="glow"
                  className="rounded-xl text-xs font-bold gap-1.5"
                >
                  {paySubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Reconciling Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirm & Issue Receipt</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: OFFICIAL PRINTABLE 3-COPY BANK CHALLAN SLIP                       */}
      {/* ========================================================================= */}
      {selectedVoucher && (
        <Dialog open={printSlipModalOpen} onOpenChange={setPrintSlipModalOpen}>
          <DialogContent className="w-[98vw] max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold font-heading">
                  Official 3-Part Fee Challan Slip
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Challan #{selectedVoucher.voucherNumber} • {selectedVoucher.studentName}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  variant="glow"
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-seneca-amber/20"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Slip (A4)</span>
                </Button>
                <Button
                  onClick={() => setPrintSlipModalOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Printable 3-Copy Layout */}
            {(() => {
              const activeBanks = bankAccounts.filter((b) => b.isActive !== false);
              const primaryBank =
                activeBanks.find((b) => b.isPrimary) ||
                activeBanks[0] || {
                  bankName: "Habib Bank Limited (HBL) / Meezan Bank",
                  accountTitle: "Seneca Academy (Pvt) Ltd",
                  accountNumber: "0148-2839102-01",
                  iban: "PK36HABB0001482839102001",
                  routingCode: "1Link ID: 100928",
                  instructions: "Payable at any branch nationwide, mobile banking, or 1Link 1Bill.",
                };

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 print:grid-cols-3 print:gap-2 print:text-black">
                  {[
                    { title: "BANK COPY", badgeColor: "bg-blue-600 text-white" },
                    { title: "ACCOUNTS COPY", badgeColor: "bg-seneca-crimson text-white" },
                    { title: "STUDENT / PARENT COPY", badgeColor: "bg-emerald-700 text-white" },
                  ].map((copy, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-dashed border-border/80 p-3.5 rounded-2xl bg-card/60 flex flex-col justify-between space-y-3 print:border-black print:bg-white print:p-2 text-xs"
                    >
                      {/* Header */}
                      <div className="space-y-1 text-center border-b border-border/60 pb-2 print:border-black">
                        <div className="flex items-center justify-center gap-1">
                          <div className="h-5 w-5 rounded-full bg-seneca-crimson flex items-center justify-center text-white text-[10px] font-bold">
                            S
                          </div>
                          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-foreground">
                            SENECA ACADEMY
                          </h4>
                        </div>
                        <p className="text-[9.5px] font-bold text-foreground">
                          {primaryBank.bankName}
                        </p>
                        <div className="text-[8.5px] text-muted-foreground font-semibold">
                          Title: <span className="text-foreground font-bold">{primaryBank.accountTitle}</span>
                        </div>
                        <div className="text-[8px] font-mono text-muted-foreground font-medium">
                          A/C: <span className="font-bold text-foreground">{primaryBank.accountNumber}</span>
                          {primaryBank.routingCode ? ` • ${primaryBank.routingCode}` : ""}
                        </div>
                        {primaryBank.iban && (
                          <div className="text-[7.5px] font-mono text-muted-foreground">
                            IBAN: {primaryBank.iban}
                          </div>
                        )}
                        <div className={cn("text-[9px] font-bold py-0.5 px-2 rounded-full inline-block mt-1", copy.badgeColor)}>
                          {copy.title}
                        </div>
                      </div>

                  {/* Student Credentials */}
                  <div className="space-y-1 bg-muted/40 p-2 rounded-xl text-[10px] print:bg-transparent">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Challan #:</span>
                      <span className="font-mono font-bold text-foreground">{selectedVoucher.voucherNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-bold text-seneca-crimson">{selectedVoucher.formattedDueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Month:</span>
                      <span className="font-bold text-foreground">{selectedVoucher.month}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Student:</span>
                      <span className="font-bold text-foreground truncate max-w-[130px]">
                        {selectedVoucher.studentName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Roll / Adm:</span>
                      <span className="font-semibold text-foreground">
                        {selectedVoucher.rollNumber} ({selectedVoucher.admissionNumber})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Class:</span>
                      <span className="font-semibold text-foreground">{selectedVoucher.className}</span>
                    </div>
                  </div>

                  {/* Fee Items Table */}
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between py-0.5 border-b border-border/40">
                      <span className="text-muted-foreground">Tuition Fee</span>
                      <span className="font-semibold">{formatCurrency(selectedVoucher.tuitionFee)}</span>
                    </div>
                    {selectedVoucher.examFee > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-border/40">
                        <span className="text-muted-foreground">Exam / Lab Fee</span>
                        <span className="font-semibold">{formatCurrency(selectedVoucher.examFee)}</span>
                      </div>
                    )}
                    {selectedVoucher.otherCharges > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-border/40">
                        <span className="text-muted-foreground">Other Charges</span>
                        <span className="font-semibold">{formatCurrency(selectedVoucher.otherCharges)}</span>
                      </div>
                    )}
                    {selectedVoucher.admissionFee > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-border/40">
                        <span className="text-muted-foreground">Admission Fee</span>
                        <span className="font-semibold">{formatCurrency(selectedVoucher.admissionFee)}</span>
                      </div>
                    )}
                    {selectedVoucher.securityFee > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-border/40">
                        <span className="text-muted-foreground">Security Deposit</span>
                        <span className="font-semibold">{formatCurrency(selectedVoucher.securityFee)}</span>
                      </div>
                    )}
                    {selectedVoucher.discount > 0 && (
                      <div className="flex justify-between py-0.5 text-emerald-600 font-semibold border-b border-border/40">
                        <span>Concession / Disc</span>
                        <span>-{formatCurrency(selectedVoucher.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-1.5 font-extrabold text-xs text-foreground">
                      <span>Payable By Due Date:</span>
                      <span className="text-seneca-crimson dark:text-seneca-amber-light">
                        {formatCurrency(selectedVoucher.totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 text-[9px] text-muted-foreground">
                      <span>After Due Date (+500):</span>
                      <span className="font-bold text-rose-600">
                        {formatCurrency(selectedVoucher.totalAmount + 500)}
                      </span>
                    </div>
                  </div>

                  {/* Stamp & Signatures */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    {primaryBank.instructions && (
                      <p className="text-[7.5px] text-muted-foreground italic text-center leading-tight">
                        {primaryBank.instructions}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-[8px] text-center text-muted-foreground pt-2">
                      <div className="border-t border-muted-foreground/40 pt-1">
                        Cashier / Bank Officer
                      </div>
                      <div className="border-t border-muted-foreground/40 pt-1">
                        Bank Stamp
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button
                onClick={() => setPrintSlipModalOpen(false)}
                variant="outline"
                className="w-full rounded-xl text-xs font-bold"
              >
                Close Slip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRM VOID / DELETE VOUCHER                                     */}
      {/* ========================================================================= */}
      <Dialog open={deleteConfirmModalOpen} onOpenChange={setDeleteConfirmModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-border/80">
          <DialogHeader className="space-y-2">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 w-fit">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold">
              Void Fee Voucher #{voucherToDelete?.voucherNumber}?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to void and remove this fee challan for {voucherToDelete?.studentName}? All associated payment records will also be removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmModalOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteVoucher}
              variant="destructive"
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Voiding...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Yes, Void Voucher</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    {/* ========================================================================= */}
    {/* MODAL 5: VERIFY PAID FEE CHALLAN & BANK RECEIPT                           */}
    {/* ========================================================================= */}
    {verifySlipModalOpen && selectedVoucherForSlip && (
      <Dialog open={verifySlipModalOpen} onOpenChange={setVerifySlipModalOpen}>
        <DialogContent className="w-[96vw] max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 my-4 space-y-4">
          <DialogHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold font-heading">
                  Verify Paid Fee Challan &amp; Bank Receipt
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Challan #{selectedVoucherForSlip.voucherNumber} • {selectedVoucherForSlip.month}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            {/* Student Identity Card */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground text-sm">{selectedVoucherForSlip.studentName}</h4>
                <p className="text-[11px] text-muted-foreground">
                  Roll: <span className="font-bold text-foreground">{selectedVoucherForSlip.rollNumber}</span> • Adm: {selectedVoucherForSlip.admissionNumber}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {selectedVoucherForSlip.className} • Guardian: {selectedVoucherForSlip.fatherName} ({selectedVoucherForSlip.fatherPhone || "N/A"})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Payable Dues</span>
                <span className="text-lg font-extrabold font-heading text-foreground font-mono">
                  {formatCurrency(selectedVoucherForSlip.totalAmount)}
                </span>
              </div>
            </div>

            {/* Receipt Image Display */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Submitted Deposit Slip Image / Document:</span>
                {selectedVoucherForSlip.paidSlipUrl && (
                  <a
                    href={selectedVoucherForSlip.paidSlipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-[11px] flex items-center gap-1 font-bold"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Open High-Resolution</span>
                  </a>
                )}
              </label>

              {selectedVoucherForSlip.paidSlipUrl ? (
                <div className="rounded-2xl border border-border/80 p-2 bg-black/5 text-center overflow-hidden">
                  <img
                    src={selectedVoucherForSlip.paidSlipUrl}
                    alt="Paid slip receipt"
                    className="max-h-64 mx-auto rounded-xl object-contain shadow-xs"
                  />
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-border/80 text-center text-muted-foreground italic">
                  No image attached with this voucher.
                </div>
              )}
            </div>

            {/* Deposit Metadata */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposited Bank / Channel:</span>
                <span className="font-bold text-foreground">{selectedVoucherForSlip.paidSlipBankName || "Bank Branch Deposit"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slip / Transaction Reference:</span>
                <span className="font-mono font-bold text-foreground">{selectedVoucherForSlip.paidSlipTxnRef || "N/A"}</span>
              </div>
              {selectedVoucherForSlip.paidSlipDepositDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit Date:</span>
                  <span className="text-foreground">
                    {new Date(selectedVoucherForSlip.paidSlipDepositDate).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                  </span>
                </div>
              )}
              {selectedVoucherForSlip.paidSlipNotes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Depositor Remarks:</span>
                  <span className="text-foreground font-medium">{selectedVoucherForSlip.paidSlipNotes}</span>
                </div>
              )}
              {selectedVoucherForSlip.paidSlipUploadedAt && (
                <div className="flex justify-between text-[10px] pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Submitted On:</span>
                  <span className="text-muted-foreground">
                    {new Date(selectedVoucherForSlip.paidSlipUploadedAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVerifySlipModalOpen(false)}
              className="rounded-xl text-xs font-bold w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setRejectionReasonInput("");
                setRejectReasonPromptOpen(true);
              }}
              className="rounded-xl text-xs font-bold gap-1 w-full sm:w-auto"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject Slip</span>
            </Button>
            <Button
              type="button"
              onClick={async () => {
                setVerifyingSlip(true);
                try {
                  const res = await fetch("/api/fees/verify-slip", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ feeId: selectedVoucherForSlip.id, action: "approve" }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    throw new Error(data.message || data.error?.message || "Failed to approve slip.");
                  }
                  toast.success("Fee Challan Approved & Settled!", {
                    description: `Official Receipt ${data.data?.receiptNumber} generated.`,
                  });
                  setVerifySlipModalOpen(false);
                  fetchFees();
                } catch (err: any) {
                  toast.error("Approval failed", { description: err.message });
                } finally {
                  setVerifyingSlip(false);
                }
              }}
              disabled={verifyingSlip}
              variant="glow"
              className="rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-emerald-500/20 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
            >
              {verifyingSlip ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Approve &amp; Mark Paid</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}

    {/* ========================================================================= */}
    {/* MODAL 6: REJECTION REASON PROMPT                                          */}
    {/* ========================================================================= */}
    {rejectReasonPromptOpen && selectedVoucherForSlip && (
      <Dialog open={rejectReasonPromptOpen} onOpenChange={setRejectReasonPromptOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-border/80 space-y-4">
          <DialogHeader className="space-y-1">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 w-fit">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold">
              Reject Paid Fee Slip #{selectedVoucherForSlip.voucherNumber}?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please enter the reason for rejecting this fee deposit slip. The student will be notified and prompted to re-upload.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-xs">
            <label className="font-bold text-foreground">
              Rejection Feedback / Notes <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Deposit amount does not match payable total, or bank stamp is illegible. Please upload a clear photo of the stamped slip."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectReasonPromptOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={verifyingSlip || !rejectionReasonInput.trim()}
              onClick={async () => {
                setVerifyingSlip(true);
                try {
                  const res = await fetch("/api/fees/verify-slip", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      feeId: selectedVoucherForSlip.id,
                      action: "reject",
                      rejectionReason: rejectionReasonInput.trim(),
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    throw new Error(data.message || data.error?.message || "Failed to reject slip.");
                  }
                  toast.warning("Fee Slip Rejected", {
                    description: "Student will be prompted to re-upload with your remarks.",
                  });
                  setRejectReasonPromptOpen(false);
                  setVerifySlipModalOpen(false);
                  setRejectionReasonInput("");
                  fetchFees();
                } catch (err: any) {
                  toast.error("Rejection failed", { description: err.message });
                } finally {
                  setVerifyingSlip(false);
                }
              }}
              variant="destructive"
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              {verifyingSlip ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              <span>Confirm Rejection</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    </div>
  );
}
