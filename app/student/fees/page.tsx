"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building,
  QrCode,
  Sparkles,
  Calendar,
  DollarSign,
  Receipt,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  X,
  Loader2,
  ExternalLink,
  Lock,
  Upload,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  Eye,
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

interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  consumerId: string;
  month: string;
  tuitionFee: number;
  labCharges: number;
  libraryDues: number;
  examFund: number;
  otherCharges?: number;
  totalAmount: number;
  dueDate: string;
  validDate: string;
  status: "paid" | "partial" | "pending" | "overdue" | "under_review";
  paidDate?: string;
  transactionRef?: string;
  paymentMethod?: string;
  // Paid slip verification fields
  paidSlipUrl?: string;
  paidSlipBankName?: string;
  paidSlipTxnRef?: string;
  paidSlipDepositDate?: string;
  paidSlipNotes?: string;
  paidSlipUploadedAt?: string;
  approvalStatus?: "none" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
  studentName?: string;
  rollNumber?: string;
  admissionNumber?: string;
  className?: string;
  fatherName?: string;
}

const FALLBACK_INVOICES: FeeInvoice[] = [
  {
    id: "inv-3",
    invoiceNumber: "SNC-2026-09-081",
    consumerId: "9940810926",
    month: "September 2026",
    tuitionFee: 18000,
    labCharges: 2500,
    libraryDues: 500,
    examFund: 1000,
    totalAmount: 22000,
    dueDate: "Sep 10, 2026",
    validDate: "Sep 20, 2026",
    status: "pending",
    approvalStatus: "none",
    studentName: "Ayan Tariq",
    rollNumber: "ROL-07-01",
    admissionNumber: "SEN-2024-081",
    className: "Grade 7 Cambridge - Section A",
    fatherName: "Tariq Mehmood",
  },
  {
    id: "inv-2",
    invoiceNumber: "SNC-2026-08-081",
    consumerId: "9940810826",
    month: "August 2026",
    tuitionFee: 18000,
    labCharges: 2500,
    libraryDues: 500,
    examFund: 1000,
    totalAmount: 22000,
    dueDate: "Aug 10, 2026",
    validDate: "Aug 20, 2026",
    status: "paid",
    approvalStatus: "approved",
    paidDate: "Aug 06, 2026 • 11:24 AM",
    transactionRef: "HBL-OL-98421045",
    paymentMethod: "HBL Bank Deposit (1LINK)",
    paidSlipBankName: "Habib Bank Limited (HBL)",
    studentName: "Ayan Tariq",
    rollNumber: "ROL-07-01",
    admissionNumber: "SEN-2024-081",
    className: "Grade 7 Cambridge - Section A",
    fatherName: "Tariq Mehmood",
  },
  {
    id: "inv-1",
    invoiceNumber: "SNC-2026-07-081",
    consumerId: "9940810726",
    month: "July 2026",
    tuitionFee: 18000,
    labCharges: 2500,
    libraryDues: 500,
    examFund: 0,
    totalAmount: 21000,
    dueDate: "Jul 10, 2026",
    validDate: "Jul 20, 2026",
    status: "paid",
    approvalStatus: "approved",
    paidDate: "Jul 05, 2026 • 04:15 PM",
    transactionRef: "MZN-TXN-87311902",
    paymentMethod: "Meezan Bank Branch Deposit",
    paidSlipBankName: "Meezan Bank",
    studentName: "Ayan Tariq",
    rollNumber: "ROL-07-01",
    admissionNumber: "SEN-2024-081",
    className: "Grade 7 Cambridge - Section A",
    fatherName: "Tariq Mehmood",
  },
];

export default function StudentFeesPage() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>(FALLBACK_INVOICES);
  const [loadingFees, setLoadingFees] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "under_review" | "paid">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Challan Modal
  const [selectedChallan, setSelectedChallan] = useState<FeeInvoice | null>(null);

  // Upload Paid Slip Modal
  const [uploadSlipModalOpen, setUploadSlipModalOpen] = useState(false);
  const [selectedVoucherForSlip, setSelectedVoucherForSlip] = useState<FeeInvoice | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [bankName, setBankName] = useState("Habib Bank Limited (HBL)");
  const [transactionRef, setTransactionRef] = useState("");
  const [depositDate, setDepositDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // View Submitted Slip Modal
  const [viewSlipModalOpen, setViewSlipModalOpen] = useState(false);
  const [slipToView, setSlipToView] = useState<FeeInvoice | null>(null);

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<FeeInvoice | null>(null);

  // Clearance Certificate Modal
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);

  // 1. Fetch Real Invoices
  const fetchStudentFees = async () => {
    setLoadingFees(true);
    try {
      const res = await fetch("/api/fees", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.fees && data.data.fees.length > 0) {
        const mapped: FeeInvoice[] = data.data.fees.map((f: any) => ({
          id: f.id,
          invoiceNumber: f.voucherNumber,
          consumerId: f.voucherNumber.replace(/[^0-9]/g, "").padStart(10, "9940"),
          month: f.month,
          tuitionFee: f.tuitionFee,
          labCharges: f.examFee,
          libraryDues: 0,
          examFund: 0,
          otherCharges: f.otherCharges || 0,
          totalAmount: f.totalAmount,
          dueDate: f.formattedDueDate,
          validDate: new Date(new Date(f.dueDate).getTime() + 10 * 86400000).toLocaleDateString("en-PK", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          status: f.status,
          paidDate: f.paidAmount > 0 ? f.formattedDueDate : undefined,
          transactionRef: f.paidSlipTxnRef || undefined,
          paymentMethod: f.paidSlipBankName || undefined,
          paidSlipUrl: f.paidSlipUrl,
          paidSlipBankName: f.paidSlipBankName,
          paidSlipTxnRef: f.paidSlipTxnRef,
          paidSlipDepositDate: f.paidSlipDepositDate,
          paidSlipNotes: f.paidSlipNotes,
          paidSlipUploadedAt: f.paidSlipUploadedAt,
          approvalStatus: f.approvalStatus,
          rejectionReason: f.rejectionReason,
          studentName: f.studentName,
          rollNumber: f.rollNumber,
          admissionNumber: f.admissionNumber,
          className: f.className,
          fatherName: f.fatherName,
        }));
        setInvoices(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch fees from server, using existing state:", err);
    } finally {
      setLoadingFees(false);
    }
  };

  useEffect(() => {
    fetchStudentFees();
  }, []);

  const pendingInvoice = invoices.find((i) => i.status === "pending" || i.status === "overdue");

  const handlePrint = () => {
    window.print();
  };

  // Open Slip Upload Modal
  const handleOpenUploadSlip = (inv: FeeInvoice) => {
    setSelectedVoucherForSlip(inv);
    setSlipFile(null);
    setSlipPreviewUrl(inv.paidSlipUrl || null);
    setBankName(inv.paidSlipBankName || "Habib Bank Limited (HBL)");
    setTransactionRef(inv.paidSlipTxnRef || "");
    setDepositDate(new Date().toISOString().slice(0, 10));
    setNotes(inv.paidSlipNotes || "");
    setUploadSlipModalOpen(true);
  };

  // Handle File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      return toast.error("File exceeds 8MB limit. Please choose a smaller image or PDF.");
    }

    setSlipFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setSlipPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setSlipPreviewUrl(null);
    }
  };

  // Submit Paid Fee Slip
  const handleSubmitPaidSlip = async () => {
    if (!selectedVoucherForSlip) return;
    if (!slipFile && !selectedVoucherForSlip.paidSlipUrl) {
      return toast.error("Please select an image or PDF of your stamped deposit receipt.");
    }
    if (!bankName.trim()) {
      return toast.error("Please enter or select the bank name where fee was paid.");
    }

    setUploadingSlip(true);
    try {
      const formData = new FormData();
      formData.append("feeId", selectedVoucherForSlip.id);
      formData.append("bankName", bankName);
      formData.append("transactionRef", transactionRef);
      formData.append("depositDate", depositDate);
      formData.append("notes", notes);
      if (slipFile) {
        formData.append("file", slipFile);
      }

      const res = await fetch("/api/student/fees/upload-slip", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error?.message || "Upload failed.");
      }

      toast.success("Paid Fee Slip Submitted Successfully!", {
        description: "Your receipt has been submitted for bursar verification. Status updated to Under Verification.",
      });

      setUploadSlipModalOpen(false);

      // Update local state immediately
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedVoucherForSlip.id
            ? {
                ...inv,
                status: "under_review",
                approvalStatus: "pending",
                paidSlipUrl: data.data?.paidSlipUrl || slipPreviewUrl || undefined,
                paidSlipBankName: bankName,
                paidSlipTxnRef: transactionRef,
                paidSlipDepositDate: depositDate,
                paidSlipNotes: notes,
                paidSlipUploadedAt: new Date().toISOString(),
                rejectionReason: undefined,
              }
            : inv
        )
      );

      // Refresh in background
      fetchStudentFees();
    } catch (err: any) {
      toast.error("Failed to submit paid fee slip", {
        description: err.message || "An error occurred while uploading. Please try again.",
      });
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleViewReceipt = (inv: FeeInvoice) => {
    setReceiptInvoice(inv);
    setReceiptModalOpen(true);
  };

  const handleOpenViewSlip = (inv: FeeInvoice) => {
    setSlipToView(inv);
    setViewSlipModalOpen(true);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && (inv.status === "pending" || inv.status === "overdue")) ||
      (activeTab === "under_review" && (inv.status === "under_review" || inv.approvalStatus === "pending")) ||
      (activeTab === "paid" && inv.status === "paid");

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.month.toLowerCase().includes(q) ||
      inv.consumerId.toLowerCase().includes(q) ||
      (inv.transactionRef || "").toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in-50 duration-300 w-full overflow-x-hidden pb-12">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-950 p-4 sm:p-8 text-white shadow-2xl print:hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-seneca-amber/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-seneca-amber-light border border-white/10">
                <CreditCard className="h-3 w-3" />
                <span>Bursar &amp; Student Accounts Portal</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Official Fee Challan System</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Fee Vouchers &amp; <span className="text-seneca-amber">Payment Challans</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Print official 3-part bank deposit challans, upload stamped bank receipts for bursar verification, track approval status, and download clearance certificates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <Button
              onClick={() => setClearanceModalOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm justify-center h-9 sm:h-9"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              <span>No-Dues Certificate</span>
            </Button>
            {pendingInvoice && (
              <Button
                onClick={() => handleOpenUploadSlip(pendingInvoice)}
                variant="glow"
                size="sm"
                className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 justify-center h-9 sm:h-9"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Paid Fee Slip</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Account Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-5 print:hidden">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Standing</span>
          <div className="text-sm sm:text-base font-extrabold font-heading text-emerald-600 pt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 shrink-0" />
            <span className="truncate">Active Student</span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold truncate">
            1LINK: 9940810926
          </span>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Tuition</span>
          <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold font-heading text-foreground pt-1">
            Rs. 18,000
          </div>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold truncate">
            Standard Cambridge Cohort
          </span>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Payable</span>
          <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold font-heading text-seneca-amber pt-1 truncate">
            {pendingInvoice ? `Rs. ${pendingInvoice.totalAmount.toLocaleString()}` : "Rs. 0"}
          </div>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold truncate">
            {pendingInvoice ? `Due: ${pendingInvoice.dueDate}` : "All Dues Cleared"}
          </span>
        </Card>

        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Cleared Receipts</span>
          <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold font-heading text-emerald-600 pt-1">
            {invoices.filter((i) => i.status === "paid").length} Paid
          </div>
          <span className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold truncate">
            Verified by Bursar
          </span>
        </Card>
      </div>

      {/* 3. Invoices & Vouchers Ledger */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden print:hidden">
        <div className="p-3.5 sm:p-5 bg-muted/30 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-background p-1 rounded-2xl border border-border/60 text-xs font-bold w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={cn("px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs shrink-0", activeTab === "all" ? "bg-seneca-crimson text-white shadow-xs" : "text-muted-foreground")}
            >
              All ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={cn("px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs shrink-0", activeTab === "pending" ? "bg-seneca-crimson text-white shadow-xs" : "text-muted-foreground")}
            >
              Pending Dues
            </button>
            <button
              onClick={() => setActiveTab("under_review")}
              className={cn("px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs shrink-0 flex items-center gap-1", activeTab === "under_review" ? "bg-amber-600 text-white shadow-xs" : "text-amber-600 dark:text-amber-400")}
            >
              <span>Under Verification</span>
              {invoices.filter((i) => i.status === "under_review" || i.approvalStatus === "pending").length > 0 && (
                <span className="h-4 px-1 rounded-full bg-amber-500/20 text-[9px] font-bold">
                  {invoices.filter((i) => i.status === "under_review" || i.approvalStatus === "pending").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              className={cn("px-2.5 sm:px-3 py-1.5 rounded-xl transition-all text-xs shrink-0", activeTab === "paid" ? "bg-seneca-crimson text-white shadow-xs" : "text-muted-foreground")}
            >
              Paid Receipts
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search challan or month..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 sm:h-9 rounded-xl bg-background text-xs"
            />
          </div>
        </div>

        {/* Desktop / Tablet Table View (hidden on small mobile screens < 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/70 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/60">
              <tr>
                <th className="p-3.5 sm:p-4">Challan / Consumer ID</th>
                <th className="p-3.5 sm:p-4">Billing Term</th>
                <th className="p-3.5 sm:p-4">Tuition</th>
                <th className="p-3.5 sm:p-4">Total Amount</th>
                <th className="p-3.5 sm:p-4">Due Date</th>
                <th className="p-3.5 sm:p-4">Status</th>
                <th className="p-3.5 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 sm:p-4">
                    <div className="font-mono font-bold text-foreground">{inv.invoiceNumber}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">1LINK: {inv.consumerId}</div>
                  </td>
                  <td className="p-3.5 sm:p-4 font-bold text-foreground">{inv.month}</td>
                  <td className="p-3.5 sm:p-4 font-mono text-muted-foreground">Rs. {inv.tuitionFee.toLocaleString()}</td>
                  <td className="p-3.5 sm:p-4 font-mono font-extrabold text-foreground text-sm">
                    Rs. {inv.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3.5 sm:p-4 text-muted-foreground font-mono text-[11px]">{inv.dueDate}</td>
                  <td className="p-3.5 sm:p-4">
                    {inv.status === "paid" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        <span>Paid &amp; Verified</span>
                      </Badge>
                    ) : inv.status === "under_review" || inv.approvalStatus === "pending" ? (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Under Verification</span>
                      </Badge>
                    ) : inv.approvalStatus === "rejected" ? (
                      <Badge className="bg-rose-500/15 text-rose-600 border border-rose-500/30 text-[10px] font-bold">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Slip Rejected</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-seneca-amber/20 text-seneca-amber-dark dark:text-seneca-amber border border-seneca-amber/40 text-[10px] font-bold">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Pending Due</span>
                      </Badge>
                    )}
                  </td>
                  <td className="p-3.5 sm:p-4 text-right space-x-1.5">
                    {inv.status === "paid" ? (
                      <>
                        <Button
                          onClick={() => handleViewReceipt(inv)}
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl font-bold text-[11px] text-emerald-600 hover:text-emerald-700"
                        >
                          <Receipt className="h-3 w-3 mr-1" />
                          <span>Receipt</span>
                        </Button>
                        <Button
                          onClick={() => setSelectedChallan(inv)}
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl font-bold text-[11px]"
                          title="Print 3-part bank challan"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : inv.status === "under_review" || inv.approvalStatus === "pending" ? (
                      <>
                        <Button
                          onClick={() => handleOpenViewSlip(inv)}
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl font-bold text-[11px] text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          <span>View Submitted Slip</span>
                        </Button>
                        <Button
                          onClick={() => setSelectedChallan(inv)}
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl font-bold text-[11px]"
                          title="Print 3-part bank challan"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleOpenUploadSlip(inv)}
                          variant="glow"
                          size="sm"
                          className="h-8 rounded-xl font-bold text-[11px] gap-1 shadow-sm"
                        >
                          <Upload className="h-3 w-3" />
                          <span>{inv.approvalStatus === "rejected" ? "Re-upload Slip" : "Upload Paid Slip"}</span>
                        </Button>
                        <Button
                          onClick={() => setSelectedChallan(inv)}
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl font-bold text-[11px]"
                        >
                          <Receipt className="h-3 w-3 mr-1" />
                          <span>Challan</span>
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (displayed on <768px for perfect touch responsiveness) */}
        <div className="md:hidden divide-y divide-border/60 p-2 space-y-2.5">
          {filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-foreground text-sm">{inv.month}</h4>
                  <p className="text-[10px] font-mono text-muted-foreground">{inv.invoiceNumber} • 1LINK: {inv.consumerId}</p>
                </div>
                <div>
                  {inv.status === "paid" ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[9px] font-bold">
                      Paid &amp; Verified
                    </Badge>
                  ) : inv.status === "under_review" || inv.approvalStatus === "pending" ? (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] font-bold animate-pulse">
                      Under Verification
                    </Badge>
                  ) : inv.approvalStatus === "rejected" ? (
                    <Badge className="bg-rose-500/15 text-rose-600 border border-rose-500/30 text-[9px] font-bold">
                      Slip Rejected
                    </Badge>
                  ) : (
                    <Badge className="bg-seneca-amber/20 text-seneca-amber-dark dark:text-seneca-amber border border-seneca-amber/40 text-[9px] font-bold">
                      Pending Due
                    </Badge>
                  )}
                </div>
              </div>

              {inv.approvalStatus === "rejected" && inv.rejectionReason && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 space-y-0.5">
                  <div className="font-bold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Bursar Feedback:</span>
                  </div>
                  <p className="text-[10px] text-foreground">{inv.rejectionReason}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Total Amount</span>
                  <span className="font-extrabold text-foreground font-mono text-sm">
                    Rs. {inv.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Due Date</span>
                  <span className="font-medium text-foreground text-[11px] font-mono">{inv.dueDate}</span>
                </div>
              </div>

              {/* Mobile Actions Button Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  onClick={() => setSelectedChallan(inv)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 w-full justify-center h-8"
                >
                  <Printer className="h-3 w-3" />
                  <span>View Challan</span>
                </Button>

                {inv.status === "paid" ? (
                  <Button
                    onClick={() => handleViewReceipt(inv)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold text-emerald-600 hover:text-emerald-700 w-full justify-center h-8"
                  >
                    <Receipt className="h-3 w-3 mr-1" />
                    <span>Receipt</span>
                  </Button>
                ) : inv.status === "under_review" || inv.approvalStatus === "pending" ? (
                  <Button
                    onClick={() => handleOpenViewSlip(inv)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 border-amber-500/30 w-full justify-center h-8"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    <span>View Slip</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleOpenUploadSlip(inv)}
                    variant="glow"
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1 w-full justify-center h-8"
                  >
                    <Upload className="h-3 w-3" />
                    <span>{inv.approvalStatus === "rejected" ? "Re-upload" : "Upload Slip"}</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 4. OFFICIAL 3-PART BANK DEPOSIT CHALLAN MODAL (PRINTABLE)                 */}
      {/* ========================================================================= */}
      {selectedChallan && (
        <Dialog open={!!selectedChallan} onOpenChange={(open) => !open && setSelectedChallan(null)}>
          <DialogContent className="w-[96vw] max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 my-4">
            <DialogHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between gap-2">
              <div>
                <DialogTitle className="text-base sm:text-xl font-bold font-heading">
                  Official 3-Part Bank Deposit Challan
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Challan #{selectedChallan.invoiceNumber} • 1LINK Bill ID: {selectedChallan.consumerId}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handlePrint} variant="glow" size="sm" className="rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-seneca-amber/20">
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Slip (A4)</span>
                </Button>
              </div>
            </DialogHeader>

            {/* Printable 3-Copy Layout */}
            <div id="printable-challan-container" className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2 print:text-black">
                {[
                  { title: "BANK COPY (BRANCH LEDGER)", badge: "bg-blue-600 text-white" },
                  { title: "SCHOOL ACCOUNTS COPY", badge: "bg-seneca-crimson text-white" },
                  { title: "STUDENT / DEPOSITOR COPY", badge: "bg-emerald-700 text-white" },
                ].map((copy, i) => (
                  <div
                    key={i}
                    className="p-3 sm:p-4 rounded-2xl border-2 border-dashed border-border/80 bg-card flex flex-col justify-between space-y-3 relative overflow-hidden text-xs print:border-black print:bg-white print:p-2"
                  >
                    {/* Header */}
                    <div className="text-center border-b border-border/60 pb-2 space-y-1 print:border-black">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-seneca-crimson flex items-center justify-center text-white text-[10px] font-bold">
                          S
                        </div>
                        <span className="font-extrabold uppercase text-[11px] text-foreground tracking-wider">
                          SENECA ACADEMY
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-foreground">
                        Habib Bank Limited (HBL) / Meezan Bank
                      </p>
                      <div className="text-[8.5px] text-muted-foreground">
                        Title: <strong className="text-foreground">Seneca Academy Education Trust</strong>
                      </div>
                      <div className="text-[8.5px] font-mono text-muted-foreground">
                        A/C: <strong className="text-foreground">0042-79012345-03</strong> • 1Link: <strong className="text-foreground">{selectedChallan.consumerId}</strong>
                      </div>
                      <div className={cn("text-[9px] font-bold py-0.5 px-2 rounded-full inline-block mt-0.5", copy.badge)}>
                        {copy.title}
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-1 bg-muted/40 p-2 rounded-xl text-[10px] print:bg-transparent">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Challan #:</span>
                        <span className="font-mono font-bold text-foreground">{selectedChallan.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Billing Month:</span>
                        <span className="font-bold text-foreground">{selectedChallan.month}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="text-seneca-crimson font-bold">{selectedChallan.dueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Student Name:</span>
                        <span className="font-bold text-foreground truncate max-w-[120px]">
                          {selectedChallan.studentName || "Ayan Tariq"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roll / Adm:</span>
                        <span className="font-mono text-foreground">
                          {selectedChallan.rollNumber || "ROL-07-01"} ({selectedChallan.admissionNumber || "SEN-2024-081"})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Class:</span>
                        <span className="text-foreground truncate max-w-[120px]">
                          {selectedChallan.className || "Grade 7 Cambridge"}
                        </span>
                      </div>
                    </div>

                    {/* Fee Items Table */}
                    <div className="border-t border-border/60 pt-2 space-y-1 text-[10px]">
                      <div className="flex justify-between py-0.5 border-b border-border/30">
                        <span className="text-muted-foreground">Monthly Tuition Fee:</span>
                        <span className="font-mono font-semibold">Rs. {selectedChallan.tuitionFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-border/30">
                        <span className="text-muted-foreground">Science Lab / IT Fee:</span>
                        <span className="font-mono font-semibold">Rs. {selectedChallan.labCharges.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-border/30">
                        <span className="text-muted-foreground">Library &amp; Exam Dues:</span>
                        <span className="font-mono font-semibold">
                          Rs. {(selectedChallan.libraryDues + selectedChallan.examFund).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-foreground border-t border-border/60 pt-1 text-xs">
                        <span>Payable By Due Date:</span>
                        <span className="font-mono text-seneca-crimson">
                          Rs. {selectedChallan.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground pt-0.5">
                        <span>After Due Date (+500):</span>
                        <span className="font-mono font-bold text-rose-600">
                          Rs. {(selectedChallan.totalAmount + 500).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Barcode & Cashier Box */}
                    <div className="pt-2 text-center space-y-2 border-t border-border/60">
                      <div className="h-6 w-full bg-foreground/10 rounded flex items-center justify-center font-mono text-[9px] tracking-widest text-muted-foreground">
                        ||| |||| | ||||| || |||||| |
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[8px] text-center text-muted-foreground pt-1">
                        <div className="border-t border-muted-foreground/40 pt-1">
                          Cashier Signature
                        </div>
                        <div className="border-t border-muted-foreground/40 pt-1">
                          Bank Stamp / Date
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-2">
              <span className="text-[11px] text-muted-foreground text-center sm:text-left">
                Payable at all online branches of HBL, Meezan Bank, or mobile banking using 1LINK.
              </span>
              <Button onClick={() => setSelectedChallan(null)} variant="outline" size="sm" className="rounded-xl text-xs font-bold w-full sm:w-auto">
                Close Challan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* 5. UPLOAD PAID FEE SLIP MODAL                                             */}
      {/* ========================================================================= */}
      {uploadSlipModalOpen && selectedVoucherForSlip && (
        <Dialog open={uploadSlipModalOpen} onOpenChange={setUploadSlipModalOpen}>
          <DialogContent className="w-[96vw] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 my-4 space-y-4">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-seneca-amber/15 text-seneca-amber">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold font-heading">
                    Upload Paid Fee Slip / Receipt
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Challan #{selectedVoucherForSlip.invoiceNumber} • {selectedVoucherForSlip.month}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              {/* Amount Due Pill */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Amount Paid</span>
                  <span className="text-lg sm:text-xl font-extrabold font-heading text-foreground">
                    Rs. {selectedVoucherForSlip.totalAmount.toLocaleString()}
                  </span>
                </div>
                <Badge className="bg-seneca-amber/20 text-seneca-amber-dark dark:text-seneca-amber font-bold text-xs">
                  Due Date: {selectedVoucherForSlip.dueDate}
                </Badge>
              </div>

              {/* File Dropzone / Camera Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Bank Stamp Receipt Photo or PDF <span className="text-seneca-crimson">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {slipPreviewUrl ? (
                  <div className="relative rounded-2xl border border-border/80 overflow-hidden bg-black/5 p-2 text-center">
                    <img
                      src={slipPreviewUrl}
                      alt="Paid slip receipt"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-xs"
                    />
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 text-[11px] rounded-xl font-bold"
                      >
                        Change File
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSlipFile(null);
                          setSlipPreviewUrl(null);
                        }}
                        className="h-7 text-[11px] rounded-xl text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-border/80 hover:border-seneca-amber/80 rounded-2xl p-5 sm:p-6 text-center bg-muted/20 hover:bg-muted/30 transition-all space-y-2"
                  >
                    <div className="h-10 w-10 rounded-full bg-seneca-amber/15 text-seneca-amber flex items-center justify-center mx-auto">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-xs">Click or tap to upload receipt image</p>
                      <p className="text-[10px] text-muted-foreground">
                        Supports camera snapshot, JPG, PNG, WebP or PDF (Max 8MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Deposit Bank / Gateway <span className="text-seneca-crimson">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                  <option value="Meezan Bank">Meezan Bank</option>
                  <option value="Allied Bank Limited (ABL)">Allied Bank Limited (ABL)</option>
                  <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                  <option value="MCB Bank">MCB Bank</option>
                  <option value="EasyPaisa Mobile Account">EasyPaisa Mobile Account</option>
                  <option value="JazzCash Mobile Account">JazzCash Mobile Account</option>
                  <option value="School Bursar Cash Counter">School Bursar Cash Counter</option>
                  <option value="Other Bank Transfer">Other Bank Transfer</option>
                </select>
              </div>

              {/* Transaction Ref & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Bank Deposit Slip # / Txn ID
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. HBL-0049210"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="h-9 rounded-xl bg-background text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Deposit Date</label>
                  <Input
                    type="date"
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="h-9 rounded-xl bg-background text-xs"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Depositor Remarks (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. Paid at HBL F-7 branch by father"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9 rounded-xl bg-background text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadSlipModalOpen(false)}
                className="rounded-xl text-xs font-bold w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitPaidSlip}
                disabled={uploadingSlip || (!slipFile && !selectedVoucherForSlip.paidSlipUrl)}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-seneca-amber/20 w-full sm:w-auto"
              >
                {uploadingSlip ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>{uploadingSlip ? "Submitting Slip..." : "Submit for Verification"}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* 6. VIEW SUBMITTED SLIP MODAL                                              */}
      {/* ========================================================================= */}
      {viewSlipModalOpen && slipToView && (
        <Dialog open={viewSlipModalOpen} onOpenChange={setViewSlipModalOpen}>
          <DialogContent className="w-[96vw] max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 my-4 space-y-4">
            <DialogHeader className="border-b border-border/60 pb-2">
              <DialogTitle className="text-base font-bold font-heading">
                Submitted Paid Fee Slip
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Challan #{slipToView.invoiceNumber} • {slipToView.month}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              {slipToView.paidSlipUrl ? (
                <div className="rounded-2xl border border-border/80 p-2 bg-black/5 text-center">
                  <img
                    src={slipToView.paidSlipUrl}
                    alt="Submitted fee receipt"
                    className="max-h-56 mx-auto rounded-xl object-contain shadow-xs"
                  />
                  <div className="pt-2 text-center">
                    <Button asChild variant="outline" size="sm" className="h-7 text-[10px] rounded-xl font-bold">
                      <a href={slipToView.paidSlipUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        <span>Open High-Res Image</span>
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-center">No image attached.</p>
              )}

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank / Gateway:</span>
                  <span className="font-bold text-foreground">{slipToView.paidSlipBankName || "Bank Deposit"}</span>
                </div>
                {slipToView.paidSlipTxnRef && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slip / Txn Ref:</span>
                    <span className="font-mono font-bold text-foreground">{slipToView.paidSlipTxnRef}</span>
                  </div>
                )}
                {slipToView.paidSlipNotes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Notes:</span>
                    <span className="text-foreground">{slipToView.paidSlipNotes}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-border/40 text-[10px]">
                  <span className="text-muted-foreground">Verification Status:</span>
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[9px]">
                    Under Bursar Verification
                  </Badge>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                onClick={() => setViewSlipModalOpen(false)}
                variant="outline"
                className="w-full rounded-xl text-xs font-bold"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* 7. OFFICIAL FEE RECEIPT MODAL                                             */}
      {/* ========================================================================= */}
      {receiptModalOpen && receiptInvoice && (
        <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
          <DialogContent className="w-[96vw] max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-border/80 my-4 space-y-4">
            <DialogHeader className="border-b border-border/60 pb-3 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold font-heading">
                    Official Fee Payment Receipt
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Verified by Seneca Academy Bursar Office
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                  Total Amount Received
                </span>
                <p className="text-xl sm:text-2xl font-black font-heading text-emerald-600">
                  Rs. {receiptInvoice.totalAmount.toLocaleString()}
                </p>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Txn Ref: {receiptInvoice.transactionRef || "BANK-CONFIRMED"}
                </span>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/60 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voucher #:</span>
                  <span className="font-mono font-bold text-foreground">{receiptInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Month:</span>
                  <span className="font-bold text-foreground">{receiptInvoice.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Date:</span>
                  <span className="text-foreground">{receiptInvoice.paidDate || "Confirmed"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Channel:</span>
                  <span className="text-foreground">{receiptInvoice.paymentMethod || "Bank Transfer"}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-xl text-xs font-bold w-full sm:w-auto">
                <Printer className="h-3 w-3 mr-1" />
                <span>Print Receipt</span>
              </Button>
              <Button onClick={() => setReceiptModalOpen(false)} variant="glow" size="sm" className="rounded-xl text-xs font-bold w-full sm:w-auto">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* 8. NO-DUES CLEARANCE CERTIFICATE MODAL                                    */}
      {/* ========================================================================= */}
      {clearanceModalOpen && (
        <Dialog open={clearanceModalOpen} onOpenChange={setClearanceModalOpen}>
          <DialogContent className="w-[96vw] max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-border/80 my-4 space-y-4">
            <DialogHeader className="border-b border-border/60 pb-3 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <DialogTitle className="text-lg font-bold font-heading">
                Institutional Financial Clearance Certificate
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Seneca Academy Academic Bursar &amp; Student Accounts
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground text-center">
              <p>
                This certifies that enrolled student <strong className="text-foreground">Ayan Tariq</strong> (Roll No: <strong className="text-foreground">ROL-07-01</strong>, Admission No: <strong className="text-foreground">SEN-2024-081</strong>) currently holds an active financial standing with verified dues clearance.
              </p>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-left space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Certificate ID:</span>
                  <span className="font-bold text-foreground">CLR-2026-09-8419</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified On:</span>
                  <span className="text-foreground">{new Date().toLocaleDateString("en-PK", { dateStyle: "medium" })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Outstanding Balance:</span>
                  <span className="font-bold text-emerald-600">Rs. 0 (Fully Cleared)</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-xl text-xs font-bold w-full sm:w-auto">
                <Printer className="h-3 w-3 mr-1" />
                <span>Print Certificate</span>
              </Button>
              <Button onClick={() => setClearanceModalOpen(false)} variant="glow" size="sm" className="rounded-xl text-xs font-bold w-full sm:w-auto">
                Dismiss
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
