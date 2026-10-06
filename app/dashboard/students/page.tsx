"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Search,
  Filter,
  UserPlus,
  Download,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  Edit,
  ShieldAlert,
  Loader2,
  RefreshCw,
  X,
  Check,
  UserCheck,
  Building,
  Key,
  Home,
  Heart,
  Fingerprint,
  FileText,
  FileCheck,
  Bus,
  School as SchoolIcon,
  ShieldCheck,
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  FileUp,
  ExternalLink,
  Paperclip,
  Trash,
  Plus,
  DoorOpen,
  Copy,
  CheckCheck,
  Receipt,
  CreditCard,
  Printer,
  Share2,
  Landmark,
  BadgePercent,
  Calculator,
  FileSpreadsheet,
  HeartPulse,
  MapPin,
  Hash,
  PhoneCall,
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
import { cn, formatCurrency } from "@/lib/utils";

import {
  formatters,
  validators,
  getPasswordStrength,
  REGEX_PATTERNS,
  ValidationResult,
} from "@/lib/utils/student-validation";

import {
  ACADEMIC_SPECTRUM,
  STREAM_OPTIONS_BY_TIER,
  ALL_STREAM_OPTIONS,
  AcademicGrade,
} from "@/lib/constants/academic-spectrum";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CsvImportModal from "@/components/dashboard/CsvImportModal";
import { STUDENT_IMPORT_COLUMNS, STUDENT_SAMPLE_DATA } from "@/lib/utils/csv-helper";
import { useCampusPortal } from "@/lib/hooks/useCampusPortal";

export interface FeeVoucher {
  id: string;
  voucherNumber: string;
  month: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  feeCategory: string;
  admissionNumber: string;
  rollNumber: string;
  className: string;
  tuitionFee: number;
  admissionFee: number;
  securityFee?: number;
  examFee: number;
  otherCharges: number;
  discount: number;
  fine: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  formattedDueDate: string;
  status: "paid" | "partial" | "pending" | "overdue";
  createdAt?: string;
}

export interface StudentAcademicHistoryItem {
  id?: string;
  fromClassId?: string;
  fromClassName?: string;
  fromGradeLevel?: number;
  fromSection?: string;
  toClassId?: string;
  toClassName?: string;
  toGradeLevel?: number;
  toSection?: string;
  academicYearId?: string;
  academicYearName?: string;
  promotionDate: string;
  status: "promoted" | "transferred" | "retained" | "conditionally_promoted" | "graduated";
  finalPercentage?: number;
  finalGpa?: number;
  overallGrade?: string;
  remarks?: string;
  promotedByUserId?: string;
  promotedByName?: string;
}

export interface AcademicStreamItem {
  id: string;
  _id?: string;
  name: string;
  code?: string;
  tier: string;
  description?: string;
  status: "active" | "archived" | "inactive";
  isDefault?: boolean;
  order?: number;
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  profilePhoto?: string;
  rollNumber: string;
  admissionNumber: string;
  admissionType: "Regular" | "Transfer" | "Sibling" | "Scholarship" | "Provisional";
  stream?: string;
  bFormNumber?: string;
  placeOfBirth?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;
  classId: string;
  className: string;
  gradeName?: string;
  gradeLevel?: number;
  section: string;
  departmentId?: string;
  departmentName?: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  dateOfBirth: string;
  medicalInfo?: {
    allergies?: string;
    conditions?: string;
    emergencyNotes?: string;
  };
  address: string;
  guardian: {
    fatherName?: string;
    fatherCnic?: string;
    fatherOccupation?: string;
    fatherCompany?: string;
    phone?: string;
    email?: string;
    motherName?: string;
    motherCnic?: string;
    motherOccupation?: string;
    motherPhone?: string;
    guardianType?: string;
    emergencyContact?: string;
    emergencyContactName?: string;
    emergencyRelation?: string;
    siblingInSchool?: boolean;
    siblingRollNumber?: string;
    siblingName?: string;
  };
  previousSchool?: string;
  previousSchoolDetails?: {
    schoolName?: string;
    lastGrade?: string;
    slcNumber?: string;
    slcDate?: string;
    board?: string;
    marksPercentage?: string;
  };
  transport?: {
    required: boolean;
    route?: string;
    pickupPoint?: string;
  };
  documents?: {
    bFormSubmitted: boolean;
    fatherCnicSubmitted: boolean;
    motherCnicSubmitted: boolean;
    photosSubmitted: boolean;
    slcSubmitted: boolean;
    marksheetSubmitted: boolean;
    characterCertSubmitted: boolean;
    medicalReportSubmitted: boolean;
    verificationStatus: "verified" | "pending" | "incomplete";
    documentFiles?: {
      [key: string]: { fileName?: string; fileSize?: string; fileUrl?: string; fileType?: string } | string;
    };
  };
  feeCategory?: string;
  status: "active" | "inactive" | "graduated" | "expelled" | "suspended";
  academicHistory?: StudentAcademicHistoryItem[];
  enrollmentDate: string;
  createdAt?: string;
}

const ADMISSION_TYPES = [
  { id: "Regular", label: "Regular Admission", desc: "Standard fresh new session intake", icon: GraduationCap },
  { id: "Transfer", label: "Transfer / Migration", desc: "Joining from another school with SLC", icon: BookOpen },
  { id: "Sibling", label: "Sibling Admission", desc: "20% sibling tuition concession applied", icon: Heart },
  { id: "Scholarship", label: "Merit Scholarship", desc: "High academic / sports scholarship", icon: Award },
  { id: "Provisional", label: "Provisional Intake", desc: "Conditional admission pending result", icon: Clock },
];

const TRANSPORT_ROUTES = [
  "Self Pick & Drop (No Transport)",
  "Route 1: Soldier Bazar • Garden East • Lasbela",
  "Route 2: PECHS • Tariq Road • Bahadurabad",
  "Route 3: Gulshan-e-Iqbal • NIPA • University Road",
  "Route 4: Saddar • Clifton • DHA Phase 1 & 2",
  "Route 5: North Nazimabad • Nazimabad • Liaquatabad",
  "Route 6: Federal B Area • Water Pump • Aisha Manzil",
];

interface GradeDocItem {
  id: string;
  label: string;
  desc: string;
  required: boolean;
  fileAccept: string;
  badge: string;
}

const getGradeDocumentChecklist = (
  gradeName: string,
  admissionType: string
): GradeDocItem[] => {
  const g = gradeName.toLowerCase();
  const isEarlyYears = ["playgroup", "nursery", "prep", "kg", "early"].some((k) => g.includes(k));
  const isPrimaryMiddle = ["grade 1", "grade 2", "grade 3", "grade 4", "grade 5", "grade 6", "grade 7", "grade 8"].some((k) => g.includes(k));
  const isSecondary = ["grade 9", "grade 10", "matric", "o-level", "ssc"].some((k) => g.includes(k));
  const isHigherSecondary = ["1st year", "2nd year", "grade 11", "grade 12", "fsc", "ics", "icom", "fa", "a-level", "college", "hssc"].some((k) => g.includes(k));
  const isTransfer = admissionType === "Transfer";

  if (isEarlyYears) {
    return [
      {
        id: "bForm",
        label: "Student Official B-Form / Birth Certificate",
        desc: "NADRA B-Form or Union Council Birth Certificate (clear photo/scan)",
        required: true,
        fileAccept: "image/*,.pdf",
        badge: "Required",
      },
      {
        id: "fatherCnic",
        label: "Father / Guardian CNIC (Front & Back)",
        desc: "National Identity Card of Father or Legal Guardian",
        required: true,
        fileAccept: "image/*,.pdf",
        badge: "Required",
      },
      {
        id: "photos",
        label: "4x Passport Size Blue-Bg Photographs",
        desc: "Recent blue background passport photos for student file & ID card",
        required: true,
        fileAccept: "image/*",
        badge: "Required",
      },
      {
        id: "motherCnic",
        label: "Mother CNIC Copy",
        desc: "National Identity Card of Mother (optional for registry archive)",
        required: false,
        fileAccept: "image/*,.pdf",
        badge: "Optional",
      },
      {
        id: "medicalReport",
        label: "Child Vaccination & Immunization Record",
        desc: "Polio, BCG, EPI vaccination card or child health certificate",
        required: false,
        fileAccept: "image/*,.pdf",
        badge: "Recommended",
      },
    ];
  }

  if (isPrimaryMiddle) {
    return [
      {
        id: "bForm",
        label: "Student B-Form / Birth Certificate",
        desc: "Official NADRA B-Form / Child Registration Certificate",
        required: true,
        fileAccept: "image/*,.pdf",
        badge: "Required",
      },
      {
        id: "fatherCnic",
        label: "Father / Guardian CNIC",
        desc: "Copy of Father's Computerized National Identity Card",
        required: true,
        fileAccept: "image/*,.pdf",
        badge: "Required",
      },
      {
        id: "photos",
        label: "4x Passport Size Photographs",
        desc: "Recent color photographs with sky blue background",
        required: true,
        fileAccept: "image/*",
        badge: "Required",
      },
      {
        id: "slc",
        label: "Original School Leaving Certificate (SLC)",
        desc: "SLC / Transfer certificate from previous school (countersigned if required)",
        required: isTransfer,
        fileAccept: "image/*,.pdf",
        badge: isTransfer ? "Required (Transfer)" : "Optional",
      },
      {
        id: "marksheet",
        label: "Previous Class Passed Marksheet / Report Card",
        desc: "Annual final examination result card or progress report",
        required: isTransfer,
        fileAccept: "image/*,.pdf",
        badge: isTransfer ? "Required (Transfer)" : "Optional",
      },
      {
        id: "motherCnic",
        label: "Mother CNIC Copy",
        desc: "Copy of Mother's CNIC",
        required: false,
        fileAccept: "image/*,.pdf",
        badge: "Optional",
      },
      {
        id: "characterCert",
        label: "Character / Conduct Certificate",
        desc: "Issued by previous school headmaster / principal",
        required: false,
        fileAccept: "image/*,.pdf",
        badge: "Optional",
      },
    ];
  }

  if (isSecondary) {
    return [
      {
        id: "bForm",
        label: "Student B-Form / Smart CNIC",
        desc: "NADRA B-Form or Juvenile Smart Card",
        required: true,
        fileAccept: "image/*,.pdf",
        badge: "Required",
      },
      {
        id: "fatherCnic",
        label: "Father / Guardian CNIC",
        desc: "Valid CNIC copy of Father or Guardian",
        required: true,
        fileAccept: "image/*,.pdf",
        badge: "Required",
      },
      {
        id: "photos",
        label: "4x Passport Size Photographs",
        desc: "Official passport sized photos for Matriculation / Board registration",
        required: true,
        fileAccept: "image/*",
        badge: "Required",
      },
      {
        id: "marksheet",
        label: "Class 8 / Middle Standard Passing Marksheet",
        desc: "Official Middle Standard examination marksheet or Class 8 report",
        required: true,
        fileAccept: "image/*,.pdf",
        badge: "Required",
      },
      {
        id: "slc",
        label: "Original School Leaving Certificate (SLC)",
        desc: "SLC mentioning Board Enrollment & GR Number",
        required: true,
        fileAccept: "image/*,.pdf",
        badge: "Required",
      },
      {
        id: "characterCert",
        label: "Character Certificate",
        desc: "Certificate of conduct from previous school principal",
        required: true,
        fileAccept: "image/*,.pdf",
        badge: "Required",
      },
      {
        id: "motherCnic",
        label: "Mother CNIC Copy",
        desc: "Copy of Mother's CNIC",
        required: false,
        fileAccept: "image/*,.pdf",
        badge: "Optional",
      },
    ];
  }

  // Grade 11 (Intermediate / A-Levels)
  return [
    {
      id: "bForm",
      label: "Student CNIC / Smart Card / B-Form",
      desc: "NADRA CNIC (if 18) or Juvenile Smart Card / B-Form",
      required: true,
      fileAccept: "image/*,.pdf",
      badge: "Required",
    },
    {
      id: "fatherCnic",
      label: "Father / Guardian CNIC",
      desc: "Copy of Father's CNIC",
      required: true,
      fileAccept: "image/*,.pdf",
      badge: "Required",
    },
    {
      id: "photos",
      label: "4x Passport Size Photographs",
      desc: "Blue background photos for College / Board Registration card",
      required: true,
      fileAccept: "image/*",
      badge: "Required",
    },
    {
      id: "marksheet",
      label: "Matriculation (SSC) / CAIE O-Level Result Card",
      desc: "Official Board / Cambridge Statement of Results with Marks",
      required: true,
      fileAccept: "image/*,.pdf",
      badge: "Required",
    },
    {
      id: "slc",
      label: "College / School Leaving Certificate (SLC / CLC)",
      desc: "Original SLC/CLC issued by secondary school headmaster",
      required: true,
      fileAccept: "image/*,.pdf",
      badge: "Required",
    },
    {
      id: "characterCert",
      label: "Character & Migration Certificate",
      desc: "Board Migration Certificate (if transferring from other Board/Province)",
      required: true,
      fileAccept: "image/*,.pdf",
      badge: "Required",
    },
    {
      id: "motherCnic",
      label: "Mother CNIC Copy",
      desc: "Copy of Mother's CNIC",
      required: false,
      fileAccept: "image/*,.pdf",
      badge: "Optional",
    },
  ];
};

export default function PrincipalStudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [dbDepartments, setDbDepartments] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const { activeWing, setCampusWing, wingConfig } = useCampusPortal();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWingFilter, setSelectedWingFilter] = useState<"all" | "junior" | "senior">("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAdmissionType, setSelectedAdmissionType] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Keep student list in sync with global campus portal
  useEffect(() => {
    if (activeWing) {
      setSelectedWingFilter(activeWing);
    }
  }, [activeWing]);

  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [importCsvModalOpen, setImportCsvModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentData | null>(null);
  const [previewDocModal, setPreviewDocModal] = useState<{ url: string; title: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeEnrollTab, setActiveEnrollTab] = useState<"academic" | "identity" | "parents" | "history" | "documents" | "portal">("academic");

  // Fee Voucher State & Management
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [voucherStudent, setVoucherStudent] = useState<StudentData | null>(null);
  const [submittingVoucher, setSubmittingVoucher] = useState(false);
  const [voucherMonth, setVoucherMonth] = useState("September 2026");
  const [voucherTuition, setVoucherTuition] = useState("12000");
  const [voucherAdmission, setVoucherAdmission] = useState("0");
  const [voucherExam, setVoucherExam] = useState("0");
  const [voucherOtherCharges, setVoucherOtherCharges] = useState("500");
  const [voucherDiscount, setVoucherDiscount] = useState("0");
  const [voucherFine, setVoucherFine] = useState("0");
  const [voucherDueDate, setVoucherDueDate] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<"pending" | "paid" | "partial" | "overdue">("pending");
  const [createdVoucherPreview, setCreatedVoucherPreview] = useState<FeeVoucher | null>(null);

  // Student Dossier Tabs & History
  const [dossierActiveTab, setDossierActiveTab] = useState<"profile" | "progression" | "fees" | "documents">("profile");
  const [studentFees, setStudentFees] = useState<FeeVoucher[]>([]);
  const [loadingStudentFees, setLoadingStudentFees] = useState(false);

  // Student Promotion & Academic Grade Progression Studio
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [promoteStudent, setPromoteStudent] = useState<StudentData | null>(null);
  const [targetPromoteClassId, setTargetPromoteClassId] = useState("");
  const [targetPromoteRollNumber, setTargetPromoteRollNumber] = useState("");
  const [targetPromoteStream, setTargetPromoteStream] = useState("");
  const [targetPromoteStatus, setTargetPromoteStatus] = useState<
    "promoted" | "transferred" | "retained" | "conditionally_promoted" | "graduated"
  >("promoted");
  const [targetPromoteRemarks, setTargetPromoteRemarks] = useState("");
  const [targetPromotePercentage, setTargetPromotePercentage] = useState("");
  const [targetPromoteGrade, setTargetPromoteGrade] = useState("");
  const [targetPromoteGpa, setTargetPromoteGpa] = useState("");
  const [submittingPromotion, setSubmittingPromotion] = useState(false);
  const [loadingStudentResults, setLoadingStudentResults] = useState(false);
  const [studentResultsSummary, setStudentResultsSummary] = useState<{
    resultsCount: number;
    avgPercentage: number;
    overallGrade: string;
    calculatedGpa: number;
    passedExams: number;
    failedExams: number;
    resultsList: any[];
  } | null>(null);

  // Enrollment Tab 6: Initial Fee Voucher
  const [enrollGenerateFee, setEnrollGenerateFee] = useState(true);
  const [enrollAdmissionFee, setEnrollAdmissionFee] = useState("5000");
  const [enrollSecurityFee, setEnrollSecurityFee] = useState("5000");
  const [enrollTuitionFee, setEnrollTuitionFee] = useState("12000");
  const [enrollDueDate, setEnrollDueDate] = useState("");

  // Form State: 1. Academic & Admission Meta
  const [formAdmissionType, setFormAdmissionType] = useState<"Regular" | "Transfer" | "Sibling" | "Scholarship" | "Provisional">("Regular");
  const [formClassName, setFormClassName] = useState("Grade 1");
  const [formSection, setFormSection] = useState("A");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [formStream, setFormStream] = useState("General Curriculum (National Standards)");
  const [formAdmissionNumber, setFormAdmissionNumber] = useState("");
  const [formRollNumber, setFormRollNumber] = useState("");
  const [formFeeCategory, setFormFeeCategory] = useState("Standard");

  // Form State: 2. Student Identity & Demographics
  const [formName, setFormName] = useState("");
  const [formGender, setFormGender] = useState<"Male" | "Female" | "Other">("Male");
  const [formDob, setFormDob] = useState("");
  const [formBForm, setFormBForm] = useState("");
  const [formBloodGroup, setFormBloodGroup] = useState("O+");
  const [formPlaceOfBirth, setFormPlaceOfBirth] = useState("");
  const [formNationality, setFormNationality] = useState("Pakistani");
  const [formReligion, setFormReligion] = useState("Islam");
  const [formMotherTongue, setFormMotherTongue] = useState("Urdu");
  const [formAllergies, setFormAllergies] = useState("");
  const [formMedicalNotes, setFormMedicalNotes] = useState("");

  // Form State: 3. Parents & Guardian Info
  const [formFatherName, setFormFatherName] = useState("");
  const [formFatherCnic, setFormFatherCnic] = useState("");
  const [formFatherOccupation, setFormFatherOccupation] = useState("");
  const [formFatherCompany, setFormFatherCompany] = useState("");
  const [formParentPhone, setFormParentPhone] = useState("");
  const [formParentEmail, setFormParentEmail] = useState("");
  const [formMotherName, setFormMotherName] = useState("");
  const [formMotherCnic, setFormMotherCnic] = useState("");
  const [formMotherOccupation, setFormMotherOccupation] = useState("");
  const [formMotherPhone, setFormMotherPhone] = useState("");
  const [formGuardianType, setFormGuardianType] = useState("Father");
  const [formEmergencyContact, setFormEmergencyContact] = useState("");
  const [formEmergencyRelation, setFormEmergencyRelation] = useState("Father");
  const [formAddress, setFormAddress] = useState("");
  const [formSiblingInSchool, setFormSiblingInSchool] = useState(false);
  const [formSiblingRoll, setFormSiblingRoll] = useState("");
  const [formSiblingName, setFormSiblingName] = useState("");

  // Form State: 4. Previous Academic Background & Logistics
  const [hasPreviousSchool, setHasPreviousSchool] = useState(false);
  const [formPreviousSchool, setFormPreviousSchool] = useState("");
  const [formLastGrade, setFormLastGrade] = useState("");
  const [formSlcNumber, setFormSlcNumber] = useState("");
  const [formSlcDate, setFormSlcDate] = useState("");
  const [formPreviousBoard, setFormPreviousBoard] = useState("Sindh Board (BSEK)");
  const [formPreviousMarks, setFormPreviousMarks] = useState("");
  const [formTransportRoute, setFormTransportRoute] = useState(TRANSPORT_ROUTES[0]);
  const [formPickupPoint, setFormPickupPoint] = useState("");

  // Form State: 5. Document Verification Checklist & Image Files (Clean non-dummy defaults)
  const [docBForm, setDocBForm] = useState(false);
  const [docFatherCnic, setDocFatherCnic] = useState(false);
  const [docMotherCnic, setDocMotherCnic] = useState(false);
  const [docPhotos, setDocPhotos] = useState(false);
  const [docSlc, setDocSlc] = useState(false);
  const [docMarksheet, setDocMarksheet] = useState(false);
  const [docCharacterCert, setDocCharacterCert] = useState(false);
  const [docMedicalReport, setDocMedicalReport] = useState(false);
  const [docVerificationStatus, setDocVerificationStatus] = useState<"verified" | "pending" | "incomplete">("pending");
  const [uploadedDocFiles, setUploadedDocFiles] = useState<{
    [key: string]: { fileName: string; fileSize: string; fileUrl: string; fileType: string };
  }>({});

  // Form State: 6. Portal Access & Credentials
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("Student2026!");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch Classes and Sections directly from DB (no-store real-time)
  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await fetch("/api/classes", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.classes)) {
        setDbClasses(data.data.classes);
        if (data.data.classes.length > 0 && !selectedClassId) {
          const first = data.data.classes[0];
          setSelectedClassId(first.id);
          setFormClassName(first.name);
          setFormSection(first.section);
          if (first.stream) setFormStream(first.stream);
        }
      } else {
        setDbClasses([]);
      }
    } catch (err) {
      console.error("Failed to fetch database classes:", err);
      setDbClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch Departments directly from DB (no-store real-time)
  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.departments)) {
        setDbDepartments(data.data.departments);
      } else {
        setDbDepartments([]);
      }
    } catch (err) {
      console.error("Failed to fetch database departments:", err);
      setDbDepartments([]);
    }
  };

  // Academic Streams State (Live Database Sourced)
  const [dbStreams, setDbStreams] = useState<AcademicStreamItem[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [createStreamModalOpen, setCreateStreamModalOpen] = useState(false);
  const [newStreamName, setNewStreamName] = useState("");
  const [newStreamTier, setNewStreamTier] = useState("Higher Secondary");
  const [newStreamCode, setNewStreamCode] = useState("");
  const [newStreamDescription, setNewStreamDescription] = useState("");
  const [savingNewStream, setSavingNewStream] = useState(false);

  // Fetch Academic Streams directly from MongoDB database (real-time live database)
  const fetchAcademicStreams = async () => {
    setLoadingStreams(true);
    try {
      const res = await fetch("/api/academic-streams", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.streams)) {
        setDbStreams(data.data.streams);
      } else {
        setDbStreams([]);
      }
    } catch (err) {
      console.error("Failed to fetch database academic streams:", err);
      setDbStreams([]);
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleCreateNewStream = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newStreamName.trim()) {
      toast.error("Please enter a stream name / curriculum track title");
      return;
    }
    setSavingNewStream(true);
    try {
      const res = await fetch("/api/academic-streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStreamName.trim(),
          tier: newStreamTier || currentSelectedTier,
          code: newStreamCode.trim(),
          description: newStreamDescription.trim(),
          status: "active",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Academic stream added to database!", {
          description: `"${newStreamName.trim()}" is now available in live enrollment.`,
        });
        const createdStream = data.data.stream;
        setDbStreams((prev) => [createdStream, ...prev]);
        setFormStream(createdStream.name);
        setCreateStreamModalOpen(false);
        setNewStreamName("");
        setNewStreamCode("");
        setNewStreamDescription("");
      } else {
        toast.error("Failed to add stream", {
          description: data.error || data.message || "An error occurred.",
        });
      }
    } catch (err: any) {
      toast.error("Error creating stream", { description: err.message });
    } finally {
      setSavingNewStream(false);
    }
  };

  // Compute available grades from database (or spectrum)
  const availableGradeNames = (() => {
    if (dbClasses.length > 0) {
      const names = Array.from(new Set(dbClasses.map((c: any) => c.name)));
      return names.sort((a, b) => {
        const aCls = dbClasses.find((c: any) => c.name === a);
        const bCls = dbClasses.find((c: any) => c.name === b);
        return (aCls?.gradeLevel ?? 0) - (bCls?.gradeLevel ?? 0);
      });
    }
    return ACADEMIC_SPECTRUM.map((g) => g.name);
  })();

  // Compute current tier for selected grade
  const currentSelectedTier = (() => {
    const matched = ACADEMIC_SPECTRUM.find((s) => s.name.toLowerCase() === formClassName.toLowerCase());
    return matched?.tier || "Primary";
  })();

  // Dynamically compute streams from Live Database for current tier (or All tiers)
  const currentAvailableStreams = (() => {
    if (dbStreams.length > 0) {
      const activeStreams = dbStreams.filter((s) => s.status === "active");
      const tierMatches = activeStreams.filter(
        (s) => s.tier === currentSelectedTier || s.tier === "All"
      );
      if (tierMatches.length > 0) {
        return tierMatches.map((s) => s.name);
      }
      return activeStreams.map((s) => s.name);
    }
    // Fallback while streams are loading initially from database
    return STREAM_OPTIONS_BY_TIER[currentSelectedTier] || ALL_STREAM_OPTIONS;
  })();

  // Auto-generate IDs and Portal Email
  // Auto-generate IDs and Portal Email
  const generateUniqueStudentIDs = (grade = formClassName, sec = formSection) => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const gradeCode = grade.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "SEN";
    const randomRollNum = String(Math.floor(1 + Math.random() * 45)).padStart(2, "0");
    
    setFormAdmissionNumber(`SEN-${year}-${randomNum}`);
    setFormRollNumber(`${gradeCode}-${sec}-${randomRollNum}`);
  };

  const autoSuggestPortalEmail = (nameStr: string) => {
    if (!nameStr.trim()) return;
    const cleanName = nameStr.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setFormEmail(`${cleanName}${randomSuffix}@seneca.edu.pk`);
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return "N/A";
    const birthDate = new Date(dobString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    return `${years} Years, ${months} Months`;
  };

  // Standard Tuition Estimator by Grade
  const getStandardTuitionForGrade = (gradeName: string) => {
    const g = (gradeName || "").toLowerCase();
    if (["playgroup", "nursery", "prep", "kg", "early", "montessori"].some((k) => g.includes(k))) return 9500;
    if (["grade 1", "grade 2", "grade 3", "grade 4", "grade 5", "primary"].some((k) => g.includes(k))) return 11000;
    if (["grade 6", "grade 7", "grade 8", "middle"].some((k) => g.includes(k))) return 12500;
    if (["grade 9", "grade 10", "matric", "ssc"].some((k) => g.includes(k))) return 14500;
    if (["1st year", "2nd year", "grade 11", "grade 12", "fsc", "ics", "icom", "fa", "a-level", "college", "hssc", "o-level"].some((k) => g.includes(k))) return 17500;
    return 12000;
  };

  const getDiscountForCategory = (tuition: number, category?: string, admissionType?: string) => {
    const cat = category || "";
    const adm = admissionType || "";
    if (cat.includes("100%") || cat.includes("Full Scholarship")) return tuition;
    if (cat.includes("50%") || cat.includes("Merit") || adm === "Scholarship") return Math.round(tuition * 0.5);
    if (cat.includes("20%") || cat.includes("Sibling") || adm === "Sibling") return Math.round(tuition * 0.2);
    if (cat.includes("Need-Based")) return Math.round(tuition * 0.3);
    return 0;
  };

  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split("T")[0];
  };

  // Open Fee Voucher Modal for a specific student
  const handleOpenVoucherModal = (student: StudentData) => {
    setVoucherStudent(student);
    const now = new Date();
    const currentMonth = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    setVoucherMonth(currentMonth);

    const standardTuition = getStandardTuitionForGrade(student.className);
    setVoucherTuition(String(standardTuition));
    setVoucherAdmission("0");
    setVoucherExam("0");
    setVoucherOtherCharges("500");

    const disc = getDiscountForCategory(standardTuition, student.feeCategory, student.admissionType);
    setVoucherDiscount(String(disc));
    setVoucherFine("0");
    setVoucherDueDate(getDefaultDueDate());
    setVoucherStatus("pending");
    setVoucherModalOpen(true);
  };

  // Fetch student fees
  const fetchStudentFees = async (studentId: string) => {
    setLoadingStudentFees(true);
    try {
      const res = await fetch(`/api/fees?studentId=${studentId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.fees)) {
        setStudentFees(data.data.fees);
      } else {
        setStudentFees([]);
      }
    } catch (err) {
      console.error("Failed to fetch student fees:", err);
      setStudentFees([]);
    } finally {
      setLoadingStudentFees(false);
    }
  };

  // View Dossier
  const handleViewStudentDossier = async (std: StudentData) => {
    setSelectedStudent(std);
    setDossierActiveTab("profile");
    fetchStudentFees(std.id);

    try {
      const res = await fetch(`/api/students/${std.id}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.student) {
        setSelectedStudent((prev) => ({
          ...std,
          ...(prev || {}),
          ...data.data.student,
          name: data.data.student.name || prev?.name || std.name || "Student",
        }));
      }
    } catch (err) {
      console.error("Failed to fetch deep student dossier data:", err);
    }
  };

  // Open Academic Promotion Studio
  const handleOpenPromoteModal = async (student: StudentData) => {
    const safeStudent = {
      ...student,
      name: student.name || "Student",
    };
    setPromoteStudent(safeStudent);
    setTargetPromoteRollNumber(student.rollNumber || "");
    setTargetPromoteStream(student.stream || "General");
    setTargetPromoteStatus("promoted");
    setTargetPromoteRemarks("");
    setTargetPromotePercentage("");
    setTargetPromoteGrade("");
    setTargetPromoteGpa("");
    setStudentResultsSummary(null);
    setPromoteModalOpen(true);

    // Auto-select candidate next class if available
    const currentClass = dbClasses.find((c) => c.id === student.classId || c.name === student.className);
    if (currentClass && currentClass.gradeLevel !== undefined) {
      const nextGradeClasses = dbClasses.filter((c) => c.gradeLevel === (currentClass.gradeLevel || 0) + 1);
      if (nextGradeClasses.length > 0) {
        setTargetPromoteClassId(nextGradeClasses[0].id);
        if (nextGradeClasses[0].stream) setTargetPromoteStream(nextGradeClasses[0].stream);
      } else {
        const otherClass = dbClasses.find((c) => c.id !== student.classId);
        if (otherClass) setTargetPromoteClassId(otherClass.id);
      }
    } else if (dbClasses.length > 0) {
      setTargetPromoteClassId(dbClasses[0].id);
    }

    // Fetch student's real academic results and calculate performance metrics
    setLoadingStudentResults(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data) {
        const fullStudent = {
          ...safeStudent,
          ...(data.data.student || {}),
          name: data.data.student?.name || safeStudent.name || "Student",
        };
        setPromoteStudent(fullStudent);
        const results = data.data.results || [];
        if (results.length > 0) {
          let totalPercentage = 0;
          let totalGpa = 0;
          let passed = 0;
          let failed = 0;

          results.forEach((r: any) => {
            const p = Number(r.percentage) || (r.totalMarks > 0 ? (r.obtainedMarks / r.totalMarks) * 100 : 0);
            totalPercentage += p;
            totalGpa += Number(r.gpa) || (p >= 80 ? 4.0 : p >= 70 ? 3.5 : p >= 60 ? 3.0 : p >= 50 ? 2.5 : 2.0);
            if (r.status === "failed" || p < 40) failed++;
            else passed++;
          });

          const avgPct = Math.round((totalPercentage / results.length) * 10) / 10;
          const avgGpa = Math.round((totalGpa / results.length) * 100) / 100;
          let calculatedGrade = "A+";
          if (avgPct < 50) calculatedGrade = "F";
          else if (avgPct < 60) calculatedGrade = "D";
          else if (avgPct < 70) calculatedGrade = "C";
          else if (avgPct < 80) calculatedGrade = "B";
          else if (avgPct < 90) calculatedGrade = "A";

          setStudentResultsSummary({
            resultsCount: results.length,
            avgPercentage: avgPct,
            overallGrade: calculatedGrade,
            calculatedGpa: avgGpa,
            passedExams: passed,
            failedExams: failed,
            resultsList: results,
          });

          setTargetPromotePercentage(String(avgPct));
          setTargetPromoteGrade(calculatedGrade);
          setTargetPromoteGpa(String(avgGpa));
          setTargetPromoteRemarks(
            avgPct >= 70
              ? `Demonstrated commendable academic performance across ${results.length} evaluations with an average of ${avgPct}%. Approved for promotion.`
              : `Completed academic evaluations with ${avgPct}%. Recommended for advancement with supplemental academic monitoring.`
          );
        } else {
          setStudentResultsSummary({
            resultsCount: 0,
            avgPercentage: 0,
            overallGrade: "N/A",
            calculatedGpa: 0,
            passedExams: 0,
            failedExams: 0,
            resultsList: [],
          });
          setTargetPromoteRemarks("Regular academic session progression based on classroom evaluation.");
        }
      }
    } catch (err) {
      console.error("Failed to load student evaluation details:", err);
    } finally {
      setLoadingStudentResults(false);
    }
  };

  // Execute Academic Promotion & Grade Progression
  const handleExecutePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteStudent) return;
    if (!targetPromoteClassId) {
      toast.error("Please select a target destination class / grade.");
      return;
    }

    setSubmittingPromotion(true);
    try {
      const payload = {
        toClassId: targetPromoteClassId,
        status: targetPromoteStatus,
        rollNumber: targetPromoteRollNumber.trim() || undefined,
        stream: targetPromoteStream.trim() || undefined,
        remarks: targetPromoteRemarks.trim() || undefined,
        finalPercentage: targetPromotePercentage ? Number(targetPromotePercentage) : undefined,
        finalGpa: targetPromoteGpa ? Number(targetPromoteGpa) : undefined,
        overallGrade: targetPromoteGrade.trim() || undefined,
      };

      const res = await fetch(`/api/students/${promoteStudent.id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to execute student promotion.");
      }

      const updatedStudent = data.data?.student;
      toast.success("Academic Promotion & Grade Progression Executed!", {
        description: `${promoteStudent.name} successfully updated to ${data.data?.toClass?.name || "new grade"} (${data.data?.toClass?.section || "A"}).`,
      });

      // Update in local students state
      if (updatedStudent) {
        setStudents((prev) =>
          prev.map((s) => (s.id === promoteStudent.id ? { ...s, ...updatedStudent } : s))
        );
        if (selectedStudent?.id === promoteStudent.id) {
          setSelectedStudent(updatedStudent);
        }
      } else {
        fetchStudents(true);
      }

      setPromoteModalOpen(false);
      setPromoteStudent(null);
    } catch (err: any) {
      console.error("Promotion failed:", err);
      toast.error("Promotion Error", {
        description: err.message || "An unexpected error occurred during student promotion.",
      });
    } finally {
      setSubmittingPromotion(false);
    }
  };

  // Submit new fee voucher
  const handleGenerateFeeVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherStudent) return;
    if (!voucherMonth.trim()) {
      toast.error("Please enter a billing month / period.");
      return;
    }
    if (!voucherDueDate) {
      toast.error("Please select a valid due date.");
      return;
    }

    setSubmittingVoucher(true);
    try {
      const tFee = Number(voucherTuition) || 0;
      const aFee = Number(voucherAdmission) || 0;
      const eFee = Number(voucherExam) || 0;
      const oFee = Number(voucherOtherCharges) || 0;
      const dFee = Number(voucherDiscount) || 0;
      const fFee = Number(voucherFine) || 0;
      const totalAmount = Math.max(0, tFee + aFee + eFee + oFee + fFee - dFee);

      const payload = {
        studentId: voucherStudent.id,
        month: voucherMonth.trim(),
        tuitionFee: tFee,
        admissionFee: aFee,
        examFee: eFee,
        otherCharges: oFee,
        discount: dFee,
        fine: fFee,
        dueDate: voucherDueDate,
        status: voucherStatus,
      };

      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to generate fee voucher.");
      }

      toast.success("Fee Voucher Issued Successfully!", {
        description: `Challan #${data.data?.voucherNumber} generated for ${voucherStudent.name} (${formatCurrency(totalAmount)})`,
      });

      // Refresh fees in dossier
      fetchStudentFees(voucherStudent.id);

      const newVoucher: FeeVoucher = {
        id: data.data?.id || String(Date.now()),
        voucherNumber: data.data?.voucherNumber || "VCH-2026-0000",
        month: voucherMonth.trim(),
        studentId: voucherStudent.id,
        studentName: voucherStudent.name,
        studentEmail: voucherStudent.email,
        studentPhone: voucherStudent.phone || voucherStudent.guardian?.phone || "",
        feeCategory: voucherStudent.feeCategory || "Standard",
        admissionNumber: voucherStudent.admissionNumber,
        rollNumber: voucherStudent.rollNumber,
        className: `${voucherStudent.className} - ${voucherStudent.section}`,
        tuitionFee: tFee,
        admissionFee: aFee,
        examFee: eFee,
        otherCharges: oFee,
        discount: dFee,
        fine: fFee,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        dueDate: voucherDueDate,
        formattedDueDate: new Date(voucherDueDate).toLocaleDateString("en-PK", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: voucherStatus,
        createdAt: new Date().toISOString(),
      };

      setVoucherModalOpen(false);
      setCreatedVoucherPreview(newVoucher);
    } catch (err: any) {
      toast.error("Fee Voucher Issuance Failed", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmittingVoucher(false);
    }
  };

  // Universal copy to clipboard helper with toast
  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} Copied!`, {
        description: text,
      });
    }
  };

  // Copy WhatsApp summary
  const handleCopyVoucherText = (v: FeeVoucher) => {
    const activeBanks = bankAccounts.filter((b: any) => b.isActive !== false);
    const primaryBank =
      activeBanks.find((b: any) => b.isPrimary) ||
      activeBanks[0] || {
        bankName: "Habib Bank Limited (HBL)",
        accountTitle: "Seneca Academy (Pvt) Ltd",
        accountNumber: "0148-2839102-01",
        iban: "PK36HABB0001482839102001",
        routingCode: "1Link ID: 100928",
      };

    const bankLines =
      activeBanks.length > 0
        ? activeBanks
            .map(
              (b: any) =>
                `• *${b.bankName}:* ${b.accountNumber} (Title: ${b.accountTitle})${b.iban ? `\n  IBAN: ${b.iban}` : ""}${b.routingCode ? `\n  ${b.routingCode}` : ""}`
            )
            .join("\n")
        : `• *Habib Bank Limited (HBL):* 0148-2839102-01\n• *Meezan Bank Limited:* 0192-88472910-01\nAccount Title: Seneca Academy (Pvt) Ltd`;

    const text =
      `🏛️ *SENECA ACADEMY - OFFICIAL FEE CHALLAN* 🏛️\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Challan No:* ${v.voucherNumber}\n` +
      `*Billing Month:* ${v.month}\n` +
      `*Student:* ${v.studentName}\n` +
      `*Admission ID:* ${v.admissionNumber} | *Roll No:* ${v.rollNumber}\n` +
      `*Class:* ${v.className}\n` +
      `──────────────────────────\n` +
      `• Monthly Tuition Fee: ${formatCurrency(v.tuitionFee)}\n` +
      (v.admissionFee > 0 ? `• Admission/Registration: ${formatCurrency(v.admissionFee)}\n` : ``) +
      (v.securityFee && v.securityFee > 0 ? `• Refundable Security Fee: ${formatCurrency(v.securityFee)}\n` : ``) +
      (v.examFee > 0 ? `• Examination Charges: ${formatCurrency(v.examFee)}\n` : ``) +
      (v.otherCharges > 0 ? `• Utility & Lab Charges: ${formatCurrency(v.otherCharges)}\n` : ``) +
      (v.discount > 0 ? `• Concession / Scholarship: -${formatCurrency(v.discount)}\n` : ``) +
      (v.fine > 0 ? `• Late Surcharge: +${formatCurrency(v.fine)}\n` : ``) +
      `──────────────────────────\n` +
      `*NET PAYABLE AMOUNT: ${formatCurrency(v.totalAmount)}*\n` +
      `*DUE DATE:* ${v.formattedDueDate || new Date(v.dueDate).toLocaleDateString("en-PK")}\n` +
      `*PAYMENT STATUS:* ${v.status.toUpperCase()}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💳 *Official Bank Collection Accounts:*\n` +
      `${bankLines}`;

    navigator.clipboard.writeText(text);
    toast.success("Challan Summary Copied to Clipboard!", {
      description: "Ready to share with guardian on WhatsApp / SMS.",
    });
  };

  const handlePreviewInitialVoucher = () => {
    const tFee = Number(enrollTuitionFee) || getStandardTuitionForGrade(formClassName);
    const aFee = Number(enrollAdmissionFee) || 0;
    const sFee = Number(enrollSecurityFee) || 0;
    const dFee = getDiscountForCategory(tFee, formFeeCategory, formAdmissionType);
    const totalAmount = Math.max(0, tFee + aFee + sFee + 1000 - dFee);
    const due = enrollDueDate || getDefaultDueDate();
    const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const draftVoucher: FeeVoucher = {
      id: "preview-" + Date.now(),
      voucherNumber: `SEN-CHAL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      month: `Admission & ${currentMonth}`,
      studentId: "preview",
      studentName: formName.trim() || "Student Name (Pending Enrollment)",
      studentEmail: formEmail.trim() || "student@seneca.edu.pk",
      studentPhone: formParentPhone.trim() || "N/A",
      feeCategory: formFeeCategory || "Standard",
      admissionNumber: formAdmissionNumber.trim() || "SEN-XXXX",
      rollNumber: formRollNumber.trim() || "ROLL-XX",
      className: `${formClassName} - ${formSection}`,
      tuitionFee: tFee,
      admissionFee: aFee,
      securityFee: sFee,
      examFee: 0,
      otherCharges: 1000,
      discount: dFee,
      fine: 0,
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      dueDate: due,
      formattedDueDate: new Date(due).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setCreatedVoucherPreview(draftVoucher);
  };

  const handlePrintChallan = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Form Touch Tracking & Live Validation Engine
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Live Field Validation Engine
  const getValidation = {
    admissionNumber: () => validators.admissionNumber(formAdmissionNumber),
    rollNumber: () => validators.rollNumber(formRollNumber),
    studentName: () => validators.name(formName, true, "Student Full Name"),
    dob: () => validators.dateOfBirth(formDob),
    bForm: () => validators.cnic(formBForm, false, "Student B-Form"),
    fatherName: () => validators.name(formFatherName, true, "Father's Full Name"),
    fatherCnic: () => validators.cnic(formFatherCnic, false, "Father CNIC"),
    fatherPhone: () => validators.phone(formParentPhone, true, "Father WhatsApp Phone"),
    fatherEmail: () => validators.email(formParentEmail, false, "Father Email"),
    motherName: () => validators.name(formMotherName, false, "Mother's Full Name"),
    motherCnic: () => validators.cnic(formMotherCnic, false, "Mother CNIC"),
    motherPhone: () => validators.phone(formMotherPhone, false, "Mother Phone"),
    emergencyContact: () => validators.phone(formEmergencyContact, true, "Emergency Contact"),
    address: () => validators.address(formAddress),
    portalEmail: () => validators.email(formEmail, true, "Student Portal Email"),
    password: () => validators.password(formPassword),
  };

  // Check if a step satisfies all required regex rules
  const isStepValid = (step: "academic" | "identity" | "parents" | "history" | "documents" | "portal"): boolean => {
    if (step === "academic") {
      return getValidation.admissionNumber().isValid && getValidation.rollNumber().isValid;
    }
    if (step === "identity") {
      return getValidation.studentName().isValid && getValidation.dob().isValid && getValidation.bForm().isValid;
    }
    if (step === "parents") {
      return (
        getValidation.fatherName().isValid &&
        getValidation.fatherPhone().isValid &&
        getValidation.fatherCnic().isValid &&
        getValidation.fatherEmail().isValid &&
        getValidation.motherCnic().isValid &&
        getValidation.motherPhone().isValid &&
        getValidation.emergencyContact().isValid &&
        getValidation.address().isValid
      );
    }
    if (step === "history") return true;
    if (step === "documents") return true;
    if (step === "portal") {
      return getValidation.portalEmail().isValid && getValidation.password().isValid;
    }
    return true;
  };

  // Get specific step error messages
  const getStepErrorMessages = (step: "academic" | "identity" | "parents" | "history" | "documents" | "portal"): string[] => {
    const errs: string[] = [];
    if (step === "academic") {
      const a = getValidation.admissionNumber();
      if (!a.isValid) errs.push(a.message || "Invalid Admission ID");
      const r = getValidation.rollNumber();
      if (!r.isValid) errs.push(r.message || "Invalid Roll Number");
    } else if (step === "identity") {
      const n = getValidation.studentName();
      if (!n.isValid) errs.push(n.message || "Invalid Student Name");
      const d = getValidation.dob();
      if (!d.isValid) errs.push(d.message || "Invalid Date of Birth");
      const b = getValidation.bForm();
      if (!b.isValid) errs.push(b.message || "Invalid B-Form");
    } else if (step === "parents") {
      const fn = getValidation.fatherName();
      if (!fn.isValid) errs.push(fn.message || "Father Name is required");
      const fp = getValidation.fatherPhone();
      if (!fp.isValid) errs.push(fp.message || "Father Phone is required");
      const fc = getValidation.fatherCnic();
      if (!fc.isValid) errs.push(fc.message || "Invalid Father CNIC");
      const fe = getValidation.fatherEmail();
      if (!fe.isValid) errs.push(fe.message || "Invalid Father Email");
      const em = getValidation.emergencyContact();
      if (!em.isValid) errs.push(em.message || "Emergency Contact is required");
      const ad = getValidation.address();
      if (!ad.isValid) errs.push(ad.message || "Address is required");
    } else if (step === "portal") {
      const pe = getValidation.portalEmail();
      if (!pe.isValid) errs.push(pe.message || "Invalid Portal Email");
      const pw = getValidation.password();
      if (!pw.isValid) errs.push(pw.message || "Invalid Password");
    }
    return errs;
  };

  const handleNextStep = () => {
    const tabs = ["academic", "identity", "parents", "history", "documents", "portal"] as const;
    const currIdx = tabs.indexOf(activeEnrollTab);

    // Touch all fields of current step
    if (activeEnrollTab === "academic") {
      setTouchedFields((prev) => ({ ...prev, admissionNumber: true, rollNumber: true }));
    } else if (activeEnrollTab === "identity") {
      setTouchedFields((prev) => ({ ...prev, studentName: true, dob: true, bForm: true }));
    } else if (activeEnrollTab === "parents") {
      setTouchedFields((prev) => ({
        ...prev,
        fatherName: true,
        fatherPhone: true,
        fatherCnic: true,
        fatherEmail: true,
        emergencyContact: true,
        address: true,
      }));
    }

    const errors = getStepErrorMessages(activeEnrollTab);
    if (errors.length > 0) {
      toast.error(`Please review the current section:`, {
        description: errors[0],
      });
      return;
    }

    if (currIdx < tabs.length - 1) {
      setActiveEnrollTab(tabs[currIdx + 1]);
    }
  };

  const handleCopyCredentials = () => {
    const text = `Seneca Academy - LMS Student Login Credentials\n` +
      `-----------------------------------------------\n` +
      `Student Name: ${formName}\n` +
      `Class & Section: ${formClassName} (${formSection})\n` +
      `Admission ID: ${formAdmissionNumber}\n` +
      `Roll Number: ${formRollNumber}\n` +
      `Portal Email: ${formEmail}\n` +
      `Initial Password: ${formPassword}\n` +
      `-----------------------------------------------`;
    navigator.clipboard.writeText(text);
    toast.success("Student Login Credentials Copied!", {
      description: "Ready to share with student or guardian.",
    });
  };

  const handleOpenEnrollModal = () => {
    fetchClasses();
    fetchDepartments();
    fetchAcademicStreams();
    const defaultGrade = dbClasses.length > 0 ? dbClasses[0].name : "Grade 1";
    const defaultSection = dbClasses.length > 0 ? dbClasses[0].section : "A";
    const defaultClassId = dbClasses.length > 0 ? dbClasses[0].id : "";

    setFormAdmissionType("Regular");
    setFormClassName(defaultGrade);
    setFormSection(defaultSection);
    setSelectedClassId(defaultClassId);
    setFormStream(dbClasses.length > 0 && dbClasses[0].stream ? dbClasses[0].stream : "General Curriculum (National Standards)");
    setFormFeeCategory("Standard");
    generateUniqueStudentIDs(defaultGrade, defaultSection);

    // Reset Demographics & Student Identity
    setFormName("");
    setFormGender("Male");
    setFormDob("");
    setFormBForm("");
    setFormBloodGroup("O+");
    setFormPlaceOfBirth("");
    setFormNationality("Pakistani");
    setFormReligion("Islam");
    setFormMotherTongue("Urdu");
    setFormAllergies("");
    setFormMedicalNotes("");

    // Reset Parents & Guardian
    setFormFatherName("");
    setFormFatherCnic("");
    setFormFatherOccupation("");
    setFormFatherCompany("");
    setFormParentPhone("");
    setFormParentEmail("");
    setFormMotherName("");
    setFormMotherCnic("");
    setFormMotherOccupation("");
    setFormMotherPhone("");
    setFormGuardianType("Father");
    setFormEmergencyContact("");
    setFormEmergencyRelation("Father");
    setFormAddress("");
    setFormSiblingInSchool(false);
    setFormSiblingRoll("");
    setFormSiblingName("");

    // Reset Previous School & Logistics
    setHasPreviousSchool(false);
    setFormPreviousSchool("");
    setFormLastGrade("");
    setFormSlcNumber("");
    setFormSlcDate("");
    setFormPreviousBoard("Sindh Board (BSEK)");
    setFormPreviousMarks("");
    setFormTransportRoute(TRANSPORT_ROUTES[0]);
    setFormPickupPoint("");

    // Reset Document Checklist & Files (All clean non-verified defaults)
    setDocBForm(false);
    setDocFatherCnic(false);
    setDocMotherCnic(false);
    setDocPhotos(false);
    setDocSlc(false);
    setDocMarksheet(false);
    setDocCharacterCert(false);
    setDocMedicalReport(false);
    setDocVerificationStatus("pending");
    setUploadedDocFiles({});

    // Reset Credentials & Initial Fee Voucher
    setFormEmail("");
    setFormPassword("Student2026!");
    setShowPassword(false);
    setEnrollGenerateFee(true);
    setEnrollAdmissionFee("5000");
    setEnrollSecurityFee("5000");
    setEnrollTuitionFee(String(getStandardTuitionForGrade(defaultGrade)));
    setEnrollDueDate(getDefaultDueDate());

    setTouchedFields({});
    setActiveEnrollTab("academic");
    setEnrollModalOpen(true);
  };

  // Image & File upload handler for document verification
  const handleDocFileUpload = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit. Please upload a compressed image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileUrl = e.target?.result as string;
      const fileSizeKb = Math.round(file.size / 1024);
      const fileSizeStr = fileSizeKb > 1024 ? `${(fileSizeKb / 1024).toFixed(1)} MB` : `${fileSizeKb} KB`;

      setUploadedDocFiles((prev) => ({
        ...prev,
        [docId]: {
          fileName: file.name,
          fileSize: fileSizeStr,
          fileUrl,
          fileType: file.type,
        },
      }));

      // Automatically mark as checked/submitted
      if (docId === "bForm") setDocBForm(true);
      if (docId === "fatherCnic") setDocFatherCnic(true);
      if (docId === "motherCnic") setDocMotherCnic(true);
      if (docId === "photos") setDocPhotos(true);
      if (docId === "slc") setDocSlc(true);
      if (docId === "marksheet") setDocMarksheet(true);
      if (docId === "characterCert") setDocCharacterCert(true);
      if (docId === "medicalReport") setDocMedicalReport(true);

      toast.success(`${file.name} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDocFile = (docId: string) => {
    setUploadedDocFiles((prev) => {
      const updated = { ...prev };
      delete updated[docId];
      return updated;
    });
    toast.info("Document file removed.");
  };

  const fetchStudents = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.students) {
        setStudents(data.data.students);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
      toast.error("Error loading student records.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchDepartments();
    fetchAcademicStreams();
  }, []);

  // Filter students
  const isStudentJunior = (std: StudentData) => {
    if (typeof std.gradeLevel === "number") return std.gradeLevel <= 2;
    const cn = (std.className || std.gradeName || "").toLowerCase();
    return (
      cn.includes("playgroup") ||
      cn.includes("nursery") ||
      cn.includes("prep") ||
      cn.includes("kg") ||
      cn.includes("grade 1") ||
      cn.includes("grade 2") ||
      cn.includes("class 1") ||
      cn.includes("class 2")
    );
  };

  const isStudentSenior = (std: StudentData) => {
    if (typeof std.gradeLevel === "number") return std.gradeLevel > 2;
    const cn = (std.className || std.gradeName || "").toLowerCase();
    return (
      !cn.includes("playgroup") &&
      !cn.includes("nursery") &&
      !cn.includes("prep") &&
      !cn.includes("kg") &&
      !cn.includes("grade 1") &&
      !cn.includes("grade 2") &&
      !cn.includes("class 1") &&
      !cn.includes("class 2")
    );
  };

  const filteredStudents = students.filter((std) => {
    const matchesSearch =
      std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (std.guardian?.fatherName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (std.bFormNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade =
      selectedGrade === "all" ||
      std.className.toLowerCase().includes(selectedGrade.toLowerCase()) ||
      std.gradeName?.toLowerCase() === selectedGrade.toLowerCase();

    const matchesSection =
      selectedSection === "all" ||
      std.section.toUpperCase() === selectedSection.toUpperCase();

    const matchesDepartment =
      selectedDepartment === "all" ||
      std.departmentId === selectedDepartment ||
      dbClasses.some((c: any) => c.id === std.classId && c.departmentId === selectedDepartment);

    const matchesStatus =
      selectedStatus === "all" || std.status === selectedStatus;

    const matchesAdmissionType =
      selectedAdmissionType === "all" || std.admissionType === selectedAdmissionType;

    const matchesWing =
      selectedWingFilter === "all" ||
      (selectedWingFilter === "junior" && isStudentJunior(std)) ||
      (selectedWingFilter === "senior" && isStudentSenior(std));

    return (
      matchesSearch &&
      matchesGrade &&
      matchesSection &&
      matchesDepartment &&
      matchesStatus &&
      matchesAdmissionType &&
      matchesWing
    );
  });

  // Summary Metrics
  const totalStudents = students.length;
  const activeCount = students.filter((s) => s.status === "active").length;
  const boysCount = students.filter((s) => s.gender === "Male").length;
  const girlsCount = students.filter((s) => s.gender === "Female").length;
  const verifiedDocsCount = students.filter((s) => s.documents?.verificationStatus === "verified").length;
  const juniorStudentsCount = students.filter(isStudentJunior).length;
  const seniorStudentsCount = students.filter(isStudentSenior).length;

  // Enrollment Form Submit Handler
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched for visual feedback
    setTouchedFields({
      admissionNumber: true,
      rollNumber: true,
      studentName: true,
      dob: true,
      bForm: true,
      fatherName: true,
      fatherCnic: true,
      fatherPhone: true,
      fatherEmail: true,
      emergencyContact: true,
      address: true,
      portalEmail: true,
      password: true,
    });

    const steps = ["academic", "identity", "parents", "history", "documents", "portal"] as const;
    for (const step of steps) {
      const errs = getStepErrorMessages(step);
      if (errs.length > 0) {
        setActiveEnrollTab(step);
        toast.error(`Validation error in ${step.toUpperCase()} section:`, {
          description: errs[0],
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const transportReq = formTransportRoute !== TRANSPORT_ROUTES[0];
      
      const payload = {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        password: formPassword,
        admissionType: formAdmissionType,
        className: formClassName,
        section: formSection,
        classId: selectedClassId || undefined,
        stream: formStream,
        rollNumber: formRollNumber.trim().toUpperCase(),
        admissionNumber: formAdmissionNumber.trim().toUpperCase(),
        bFormNumber: formBForm.trim(),
        placeOfBirth: formPlaceOfBirth.trim(),
        nationality: formNationality.trim(),
        religion: formReligion.trim(),
        motherTongue: formMotherTongue.trim(),
        gender: formGender,
        dateOfBirth: formDob,
        bloodGroup: formBloodGroup,
        medicalInfo: {
          allergies: formAllergies.trim(),
          conditions: formMedicalNotes.trim(),
          emergencyNotes: formMedicalNotes.trim(),
        },
        address: formAddress.trim(),
        fatherName: formFatherName.trim(),
        fatherCnic: formFatherCnic.trim(),
        fatherOccupation: formFatherOccupation.trim(),
        fatherCompany: formFatherCompany.trim(),
        parentPhone: formParentPhone.trim(),
        parentEmail: (formParentEmail || formEmail).trim().toLowerCase(),
        motherName: formMotherName.trim(),
        motherCnic: formMotherCnic.trim(),
        motherOccupation: formMotherOccupation.trim(),
        motherPhone: formMotherPhone.trim(),
        guardianType: formGuardianType,
        emergencyContact: (formEmergencyContact || formParentPhone).trim(),
        emergencyContactName: formFatherName.trim(),
        emergencyRelation: formEmergencyRelation.trim(),
        siblingInSchool: formSiblingInSchool,
        siblingRollNumber: formSiblingRoll.trim(),
        siblingName: formSiblingName.trim(),
        previousSchool: (formAdmissionType === "Transfer" || hasPreviousSchool) ? formPreviousSchool.trim() : "",
        previousSchoolDetails: (formAdmissionType === "Transfer" || hasPreviousSchool) ? {
          schoolName: formPreviousSchool.trim(),
          lastGrade: formLastGrade.trim(),
          slcNumber: formSlcNumber.trim(),
          slcDate: formSlcDate ? new Date(formSlcDate) : undefined,
          board: formPreviousBoard,
          marksPercentage: formPreviousMarks.trim(),
        } : {
          schoolName: "",
          lastGrade: "",
          slcNumber: "",
          marksPercentage: "",
        },
        transport: {
          required: transportReq,
          route: transportReq ? formTransportRoute : "",
          pickupPoint: transportReq ? formPickupPoint.trim() : "",
        },
        documents: {
          bFormSubmitted: docBForm,
          fatherCnicSubmitted: docFatherCnic,
          motherCnicSubmitted: docMotherCnic,
          photosSubmitted: docPhotos,
          slcSubmitted: docSlc,
          marksheetSubmitted: docMarksheet,
          characterCertSubmitted: docCharacterCert,
          medicalReportSubmitted: docMedicalReport,
          verificationStatus: docVerificationStatus,
          documentFiles: uploadedDocFiles,
        },
        feeCategory: formFeeCategory,
      };

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to enroll student.");
      }

      // Automatically generate initial admission fee voucher if selected
      if (enrollGenerateFee && data.data?.student?.id) {
        try {
          const newStdId = data.data.student.id;
          const initialTuition = Number(enrollTuitionFee) || getStandardTuitionForGrade(formClassName);
          const initialAdmission = Number(enrollAdmissionFee) || 0;
          const initialSecurity = Number(enrollSecurityFee) || 0;
          const initialDiscount = getDiscountForCategory(initialTuition, formFeeCategory, formAdmissionType);
          const initialDue = enrollDueDate || getDefaultDueDate();
          const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
          const initialTotal = Math.max(0, initialTuition + initialAdmission + initialSecurity + 1000 - initialDiscount);

          const feeRes = await fetch("/api/fees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: newStdId,
              month: `Admission & ${currentMonth}`,
              tuitionFee: initialTuition,
              admissionFee: initialAdmission,
              securityFee: initialSecurity,
              examFee: 0,
              otherCharges: 1000,
              discount: initialDiscount,
              fine: 0,
              dueDate: initialDue,
              status: "pending",
            }),
          });

          const feeData = await feeRes.json();
          if (feeData.success && feeData.data?.voucher) {
            const vData = feeData.data.voucher;
            setCreatedVoucherPreview({
              id: vData._id || vData.id || String(Date.now()),
              voucherNumber: vData.voucherNumber || "VCH-2026-0000",
              month: vData.month || `Admission & ${currentMonth}`,
              studentId: newStdId,
              studentName: formName.trim(),
              studentEmail: formEmail.trim(),
              studentPhone: formParentPhone.trim(),
              feeCategory: formFeeCategory || "Standard",
              admissionNumber: formAdmissionNumber.trim(),
              rollNumber: formRollNumber.trim(),
              className: `${formClassName} - ${formSection}`,
              tuitionFee: initialTuition,
              admissionFee: initialAdmission,
              securityFee: initialSecurity,
              examFee: 0,
              otherCharges: 1000,
              discount: initialDiscount,
              fine: 0,
              totalAmount: initialTotal,
              paidAmount: 0,
              balanceAmount: initialTotal,
              dueDate: initialDue,
              formattedDueDate: new Date(initialDue).toLocaleDateString("en-PK", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              status: "pending",
              createdAt: new Date().toISOString(),
            });
          }
        } catch (fErr) {
          console.error("Initial fee voucher creation error:", fErr);
        }
      }

      toast.success("Student Enrolled Successfully!", {
        description: `${formName} has been enrolled in ${formClassName} (${formSection}) with Roll # ${formRollNumber}`,
      });

      setEnrollModalOpen(false);
      fetchStudents(true);
      fetchClasses();
      fetchAcademicStreams();

      // Reset form
      setFormName("");
      setFormFatherName("");
      setFormFatherCnic("");
      setFormParentPhone("");
      setFormBForm("");
      setTouchedFields({});
      setUploadedDocFiles({});
    } catch (err: any) {
      toast.error("Enrollment Failed", {
        description: err.message || "An error occurred during registration.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (student: StudentData, newStatus: string) => {
    // Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, status: newStatus as any } : s))
    );

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message);

      toast.success("Status Updated", {
        description: `${student.name} is now '${newStatus}'.`,
      });
      fetchStudents(true);
    } catch (err: any) {
      toast.error("Action Failed", { description: err.message });
      fetchStudents(true);
    }
  };

  const handleDeleteStudent = (student: StudentData) => {
    setStudentToDelete(student);
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    const student = studentToDelete;

    // Optimistic UI update
    setStudents((prev) => prev.filter((s) => s.id !== student.id));

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete student.");
      }

      toast.success("Student Record Removed", {
        description: `${student.name} has been archived.`,
      });
      fetchStudents(true);
    } catch (err: any) {
      toast.error("Action Failed", { description: err.message });
      fetchStudents(true);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error("No student records available to export.");
      return;
    }

    const headers = [
      "Roll Number",
      "Admission ID",
      "Student Name",
      "Class",
      "Section",
      "Stream",
      "Gender",
      "Date of Birth",
      "Blood Group",
      "B-Form / CNIC",
      "Father Name",
      "Father Phone",
      "Emergency Phone",
      "Address",
      "Transport Route",
      "Fee Category",
      "Status",
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.admissionNumber}"`,
      `"${s.name}"`,
      `"${s.gradeName || s.className}"`,
      `"${s.section}"`,
      `"${s.stream || "General"}"`,
      `"${s.gender}"`,
      `"${s.dateOfBirth}"`,
      `"${s.bloodGroup}"`,
      `"${s.bFormNumber || "N/A"}"`,
      `"${s.guardian?.fatherName || "N/A"}"`,
      `"${s.guardian?.phone || "N/A"}"`,
      `"${s.guardian?.emergencyContact || "N/A"}"`,
      `"${(s.address || "").replace(/"/g, '""')}"`,
      `"${s.transport?.required ? s.transport.route : "Self"}"`,
      `"${s.feeCategory || "Standard"}"`,
      `"${s.status}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Seneca_Students_Roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Comprehensive Student Directory exported to CSV!");
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
                <GraduationCap className="h-3 w-3" />
                <span>Playgroup to 2nd Year Academic Portal</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session 2026–27 Live</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
              Student Admission & <span className="text-seneca-amber">Enrollment Command</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Manage student enrollment from Playgroup through 2nd Year (College) across all active sections, record guardian dossiers, track document verification checklists, and allocate academic streams.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Export Roster (CSV)</span>
            </Button>
            <Button
              onClick={() => setImportCsvModalOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm w-full sm:w-auto justify-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5 text-seneca-amber" />
              <span>Import CSV</span>
            </Button>
            <Button
              onClick={handleOpenEnrollModal}
              variant="glow"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 shadow-lg shadow-seneca-amber/20 w-full sm:w-auto justify-center"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Enroll New Student</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics Cards (4 Stat Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Enrolled */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Total Students
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-crimson/10 text-seneca-crimson shrink-0">
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {totalStudents}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Active Status:</span>
            <span className="font-bold text-emerald-600">{activeCount} Enrolled</span>
          </div>
        </Card>

        {/* Card 2: Gender Demographics */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Demographics
            </span>
            <div className="p-1.5 rounded-xl bg-seneca-amber/15 text-seneca-amber shrink-0">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold font-heading text-foreground truncate">
            {boysCount} <span className="text-xs font-normal text-muted-foreground">Boys</span> / {girlsCount} <span className="text-xs font-normal text-muted-foreground">Girls</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Ratio:</span>
            <span className="font-bold text-foreground font-mono">
              {totalStudents > 0 ? Math.round((boysCount / totalStudents) * 100) : 0}% Boys
            </span>
          </div>
        </Card>

        {/* Card 3: Grade Spectrum */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Class Spectrum
            </span>
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-extrabold font-heading text-foreground truncate">
            {dbClasses.length > 0 ? `${dbClasses.length} Active Sections` : "Playgroup – 2nd Year"}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Spectrum Range:</span>
            <span className="font-bold text-foreground">Playgroup to 2nd Year</span>
          </div>
        </Card>

        {/* Card 4: Document Verification Status */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Documents Verified
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <FileCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold font-heading text-foreground">
            {verifiedDocsCount} <span className="text-xs font-normal text-muted-foreground">Files</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Pending Clearance:</span>
            <span className="font-bold text-amber-600">{totalStudents - verifiedDocsCount} Files</span>
          </div>
        </Card>
      </div>

      {/* 3. Search & Comprehensive Multi-Filter Bar with Campus Wing Control */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl p-3 sm:p-5 space-y-3.5">
        {/* Campus Wing Scope */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border/60">
          {activeWing === "junior" ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-extrabold uppercase tracking-wide">
                Junior Wing Student Roster (≤ Grade 2)
              </span>
              <Badge className="bg-amber-500 text-white text-[10px] font-black ml-1">
                {juniorStudentsCount} Early Learners Enrolled
              </Badge>
            </div>
          ) : activeWing === "senior" ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-seneca-crimson/15 border border-seneca-crimson/30 text-seneca-crimson dark:text-seneca-amber-light">
              <GraduationCap className="h-4 w-4 text-seneca-crimson" />
              <span className="text-xs font-extrabold uppercase tracking-wide">
                Senior Wing Student Roster (&gt; Grade 2)
              </span>
              <Badge className="bg-seneca-crimson text-white text-[10px] font-black ml-1">
                {seniorStudentsCount} Senior Students Enrolled
              </Badge>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border/70">
              <button
                type="button"
                onClick={() => setSelectedWingFilter("all")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                  selectedWingFilter === "all"
                    ? "bg-background text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>All Students</span>
                <span className="px-1.5 py-0.2 rounded-md bg-muted text-[10px] font-extrabold">{totalStudents}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWingFilter("junior")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                  selectedWingFilter === "junior"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-black"
                    : "text-muted-foreground hover:text-amber-600"
                )}
              >
                <Sparkles className="h-3 w-3" />
                <span>Junior Campus (≤ Gr 2)</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-md text-[10px] font-extrabold",
                    selectedWingFilter === "junior" ? "bg-white/20 text-white" : "bg-muted"
                  )}
                >
                  {juniorStudentsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWingFilter("senior")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                  selectedWingFilter === "senior"
                    ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20 font-black"
                    : "text-muted-foreground hover:text-seneca-crimson"
                )}
              >
                <GraduationCap className="h-3 w-3" />
                <span>Senior Campus (&gt; Gr 2)</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-md text-[10px] font-extrabold",
                    selectedWingFilter === "senior" ? "bg-white/20 text-white" : "bg-muted"
                  )}
                >
                  {seniorStudentsCount}
                </span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              Campus Scope:{" "}
              <strong className="text-foreground">
                {activeWing === "junior" || selectedWingFilter === "junior"
                  ? "Playgroup, Nursery, Prep/KG, Grade 1 & 2"
                  : activeWing === "senior" || selectedWingFilter === "senior"
                  ? "Grades 3 through 12 / College"
                  : "Consolidated Dual-Campus"}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by student name, roll number, admission ID, B-Form #, or father name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-11 rounded-xl bg-background border-border/80 text-xs sm:text-sm font-medium w-full"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            {/* Grade Filter (Dynamic from DB / Spectrum) */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="h-10 sm:h-11 px-2.5 sm:px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 outline-none w-full sm:w-auto"
            >
              <option value="all">All Grades</option>
              {availableGradeNames.map((gName) => (
                <option key={gName} value={gName}>
                  {gName}
                </option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="h-10 sm:h-11 px-2.5 sm:px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 outline-none w-full sm:w-auto"
            >
              <option value="all">All Sections</option>
              {["A", "B", "C", "D", "E", "F"].map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>

            {/* Department Filter (Dynamic from DB) */}
            {dbDepartments.length > 0 && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="h-10 sm:h-11 px-2.5 sm:px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 outline-none w-full sm:w-auto"
              >
                <option value="all">All Departments</option>
                {dbDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            )}

            {/* Admission Type Filter */}
            <select
              value={selectedAdmissionType}
              onChange={(e) => setSelectedAdmissionType(e.target.value)}
              className="h-10 sm:h-11 px-2.5 sm:px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 outline-none w-full sm:w-auto"
            >
              <option value="all">All Admission Types</option>
              <option value="Regular">Regular</option>
              <option value="Transfer">Transfer</option>
              <option value="Sibling">Sibling</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Provisional">Provisional</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 sm:h-11 px-2.5 sm:px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 outline-none w-full sm:w-auto col-span-2 sm:col-span-1"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-center rounded-xl bg-muted/60 p-1 border border-border shrink-0 col-span-2 sm:col-span-1 self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-all",
                  viewMode === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-all",
                  viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                title="Card View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span>Showing <strong className="text-foreground">{filteredStudents.length}</strong> of {totalStudents} students:</span>
          {selectedGrade !== "all" && (
            <Badge variant="secondary" className="text-[10px] font-bold gap-1 rounded-md">
              Grade: {selectedGrade}
              <button onClick={() => setSelectedGrade("all")} className="hover:text-rose-500">×</button>
            </Badge>
          )}
          {selectedSection !== "all" && (
            <Badge variant="secondary" className="text-[10px] font-bold gap-1 rounded-md">
              Section {selectedSection}
              <button onClick={() => setSelectedSection("all")} className="hover:text-rose-500">×</button>
            </Badge>
          )}
          {selectedAdmissionType !== "all" && (
            <Badge variant="secondary" className="text-[10px] font-bold gap-1 rounded-md">
              Type: {selectedAdmissionType}
              <button onClick={() => setSelectedAdmissionType("all")} className="hover:text-rose-500">×</button>
            </Badge>
          )}
          {(selectedGrade !== "all" || selectedSection !== "all" || selectedAdmissionType !== "all" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedGrade("all");
                setSelectedSection("all");
                setSelectedAdmissionType("all");
                setSelectedStatus("all");
                setSearchQuery("");
              }}
              className="h-6 px-2 text-[10px] text-seneca-crimson hover:bg-seneca-crimson/10 font-bold rounded-md"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Student Records Display (Table or Grid View) */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
          <span className="text-xs font-bold">Loading Seneca Student Registry...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card className="border border-dashed border-border p-12 text-center rounded-3xl space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Student Records Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No enrolled students match your search criteria. Try modifying your filter or enroll a new student.
          </p>
          <Button onClick={handleOpenEnrollModal} variant="glow" size="sm" className="rounded-xl font-bold text-xs gap-1.5 mt-2">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Enroll New Student</span>
          </Button>
        </Card>
      ) : viewMode === "table" ? (
        /* Table View */
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/80 text-foreground font-extrabold uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Student & Portal ID</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Admission Type</th>
                  <th className="py-3 px-4">Guardian Details</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredStudents.map((std) => {
                  const initials = (std.name || "Student")
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "ST";

                  return (
                    <tr key={std.id} className="hover:bg-muted/30 transition-colors">
                      {/* Student & IDs */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-xs">{std.name}</div>
                            <div className="text-[10px] font-mono text-seneca-crimson font-bold">
                              {std.admissionNumber} • <span className="text-muted-foreground">{std.rollNumber}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{std.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Class & Section */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground">{std.className}</div>
                        <div className="text-[10px] text-muted-foreground">{std.stream || "General Stream"}</div>
                        {std.bFormNumber && (
                          <div className="text-[9px] font-mono text-muted-foreground">B-Form: {std.bFormNumber}</div>
                        )}
                      </td>

                      {/* Admission Type */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold",
                            std.admissionType === "Sibling" && "bg-pink-500/10 text-pink-600 border-pink-500/30",
                            std.admissionType === "Scholarship" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                            std.admissionType === "Transfer" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                            (!std.admissionType || std.admissionType === "Regular") && "bg-muted text-foreground border-border"
                          )}
                        >
                          {std.admissionType || "Regular"}
                        </Badge>
                      </td>

                      {/* Guardian Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{std.guardian?.fatherName || "N/A"}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{std.phone || std.guardian?.phone || "N/A"}</span>
                        </div>
                      </td>

                      {/* Documents Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            std.documents?.verificationStatus === "verified"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          )}
                        >
                          <FileCheck className="h-3 w-3" />
                          <span className="capitalize">{std.documents?.verificationStatus || "Pending"}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold capitalize",
                            std.status === "active" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                            std.status === "suspended" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                            std.status === "inactive" && "bg-rose-500/10 text-rose-600 border-rose-500/30"
                          )}
                        >
                          {std.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => handleOpenPromoteModal(std)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 text-seneca-crimson dark:text-rose-400 border-seneca-crimson/30 hover:bg-seneca-crimson/10 shadow-sm"
                            title="Evaluate Results & Promote Grade / Class"
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Promote</span>
                          </Button>
                          <Button
                            onClick={() => handleOpenVoucherModal(std)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 shadow-sm"
                            title="Generate & Issue Fee Voucher"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Fee Voucher</span>
                          </Button>
                          <Button
                            onClick={() => handleViewStudentDossier(std)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 text-primary hover:bg-primary/10"
                            title="View Full Dossier"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Dossier</span>
                          </Button>
                          <Button
                            onClick={() =>
                              handleToggleStatus(std, std.status === "active" ? "suspended" : "active")
                            }
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-8 px-2 rounded-lg text-[11px] font-bold",
                              std.status === "active" ? "text-amber-600 hover:bg-amber-500/10" : "text-emerald-600 hover:bg-emerald-500/10"
                            )}
                          >
                            {std.status === "active" ? "Suspend" : "Activate"}
                          </Button>
                          <Button
                            onClick={() => handleDeleteStudent(std)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10"
                            title="Delete Student Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid / Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredStudents.map((std) => {
            const initials = (std.name || "Student")
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "ST";

            return (
              <Card
                key={std.id}
                className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden hover:border-seneca-crimson/40 transition-all space-y-3.5 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{std.name}</h4>
                      <p className="text-[10px] font-mono font-bold text-seneca-crimson truncate">{std.admissionNumber}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{std.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-bold capitalize shrink-0 px-2 py-0.5",
                      std.status === "active" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                      std.status === "suspended" && "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    )}
                  >
                    {std.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 sm:p-3 rounded-xl bg-muted/40 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Class / Section:</span>
                    <span className="font-bold text-foreground truncate block text-[11px]">{std.className} - {std.section}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Roll Number:</span>
                    <span className="font-bold text-foreground font-mono text-[11px]">{std.rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Father / Guardian:</span>
                    <span className="font-bold text-foreground truncate block text-[11px]">{std.guardian?.fatherName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Admission Type:</span>
                    <span className="font-bold text-seneca-crimson text-[11px]">{std.admissionType || "Regular"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-border/60">
                  <Button
                    onClick={() => handleOpenPromoteModal(std)}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-[11px] font-bold gap-1 text-seneca-crimson border-seneca-crimson/30 hover:bg-seneca-crimson/10 px-1"
                    title="Evaluate & Promote Student"
                  >
                    <GraduationCap className="h-3 w-3" />
                    <span>Promote</span>
                  </Button>
                  <Button
                    onClick={() => handleOpenVoucherModal(std)}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-[11px] font-bold gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 px-1"
                  >
                    <Receipt className="h-3 w-3" />
                    <span>Voucher</span>
                  </Button>
                  <Button
                    onClick={() => handleViewStudentDossier(std)}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-[11px] font-bold gap-1 text-primary hover:bg-primary/10 px-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Dossier</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Executive Student Enrollment Office Modal (Comprehensive Nursery to Grade 11) */}
      <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-border/80 bg-card">
          {/* Fixed Header */}
          <div className="p-3.5 sm:p-6 pb-2.5 sm:pb-4 border-b border-border/60 bg-card/95 backdrop-blur-md space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="text-[10px] sm:text-xs">Seneca Enrollment Office</span>
              </div>
              <Badge variant="outline" className="text-[9px] sm:text-[10px] font-mono font-bold bg-seneca-crimson/5 text-seneca-crimson border-seneca-crimson/20">
                Session 2026–2027
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-2">
              <DialogTitle className="text-base sm:text-xl font-extrabold font-heading text-foreground">
                Enroll Student <span className="text-seneca-crimson font-normal text-xs sm:text-sm font-sans">(Playgroup to 2nd Year)</span>
              </DialogTitle>
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">
                Step {["academic", "identity", "parents", "history", "documents", "portal"].indexOf(activeEnrollTab) + 1} of 6:{" "}
                <span className="text-seneca-crimson">
                  {activeEnrollTab === "academic" && "Academic Allocation"}
                  {activeEnrollTab === "identity" && "Student Demographics"}
                  {activeEnrollTab === "parents" && "Parents & Guardian"}
                  {activeEnrollTab === "history" && "Academic History & Van"}
                  {activeEnrollTab === "documents" && "Document Checklist"}
                  {activeEnrollTab === "portal" && "Portal Access & Fees"}
                </span>
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-seneca-crimson to-seneca-amber h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((["academic", "identity", "parents", "history", "documents", "portal"].indexOf(activeEnrollTab) + 1) / 6) * 100}%`,
                }}
              />
            </div>

            {/* Horizontal Scrollable Tabs with Step Validation Badges */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 no-scrollbar -mx-1 px-1">
              {[
                { id: "academic", label: "1. Academic", icon: Layers },
                { id: "identity", label: "2. Demographics", icon: Fingerprint },
                { id: "parents", label: "3. Parents", icon: Users },
                { id: "history", label: "4. History & Van", icon: SchoolIcon },
                { id: "documents", label: "5. Documents", icon: FileCheck },
                { id: "portal", label: "6. Portal & Review", icon: Key },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeEnrollTab === tab.id;
                const isComplete = isStepValid(tab.id as any);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveEnrollTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap border shrink-0 relative",
                      isActive
                        ? "bg-seneca-crimson text-white border-seneca-crimson shadow-md shadow-seneca-crimson/20"
                        : isComplete
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15"
                        : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <IconComponent className="h-3 w-3 shrink-0" />
                    <span>{tab.label}</span>
                    {isComplete && !isActive && (
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleEnrollSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="p-3.5 sm:p-6 space-y-4">
              {/* TAB 1: ACADEMIC ALLOCATION & ADMISSION TYPE */}
              {activeEnrollTab === "academic" && (
                <div className="space-y-3.5 sm:space-y-4 animate-in fade-in-50 duration-200">
                  {/* Unique ID Generator Banner */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-seneca-crimson/5 via-seneca-amber/5 to-transparent border border-seneca-crimson/20 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] sm:text-[11px] font-bold text-seneca-crimson uppercase tracking-wider flex items-center gap-1.5 truncate">
                        <Fingerprint className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Auto ID Generator Engine (RegEx Validated)</span>
                      </span>
                      <Button
                        type="button"
                        onClick={() => {
                          generateUniqueStudentIDs(formClassName, formSection);
                          markTouched("admissionNumber");
                          markTouched("rollNumber");
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] sm:text-[11px] font-bold text-seneca-crimson hover:bg-seneca-crimson/10 gap-1 rounded-lg shrink-0"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Regenerate IDs</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] sm:text-[11px] font-bold text-foreground">
                            Official Admission ID <span className="text-seneca-crimson">*</span>
                          </label>
                          {getValidation.admissionNumber().isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Valid ID
                            </span>
                          )}
                        </div>
                        <Input
                          required
                          type="text"
                          value={formAdmissionNumber}
                          onFocus={() => markTouched("admissionNumber")}
                          onChange={(e) => {
                            setFormAdmissionNumber(formatters.formatAdmissionId(e.target.value));
                            markTouched("admissionNumber");
                          }}
                          className={cn(
                            "h-10 sm:h-11 rounded-xl font-mono font-bold text-xs uppercase",
                            touchedFields.admissionNumber && !getValidation.admissionNumber().isValid
                              ? "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500/20"
                              : formAdmissionNumber && getValidation.admissionNumber().isValid
                              ? "border-emerald-500/50 bg-emerald-500/5 focus-visible:ring-emerald-500/20"
                              : "bg-background"
                          )}
                          placeholder="SEN-2026-XXXX"
                        />
                        {touchedFields.admissionNumber && !getValidation.admissionNumber().isValid && (
                          <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {getValidation.admissionNumber().message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] sm:text-[11px] font-bold text-foreground">
                            Assigned Roll # (Class-Section) <span className="text-seneca-crimson">*</span>
                          </label>
                          {getValidation.rollNumber().isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Valid Roll #
                            </span>
                          )}
                        </div>
                        <Input
                          required
                          type="text"
                          value={formRollNumber}
                          onFocus={() => markTouched("rollNumber")}
                          onChange={(e) => {
                            setFormRollNumber(formatters.formatRollNumber(e.target.value));
                            markTouched("rollNumber");
                          }}
                          className={cn(
                            "h-10 sm:h-11 rounded-xl font-mono font-bold text-xs uppercase",
                            touchedFields.rollNumber && !getValidation.rollNumber().isValid
                              ? "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500/20"
                              : formRollNumber && getValidation.rollNumber().isValid
                              ? "border-emerald-500/50 bg-emerald-500/5 focus-visible:ring-emerald-500/20"
                              : "bg-background"
                          )}
                          placeholder="GR1-A-01"
                        />
                        {touchedFields.rollNumber && !getValidation.rollNumber().isValid && (
                          <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {getValidation.rollNumber().message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admission Type Radio Grid */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <span>Admission Type Category</span>
                      <span className="text-seneca-crimson">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {ADMISSION_TYPES.map((type) => {
                        const isSelected = formAdmissionType === type.id;
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.id}
                            onClick={() => {
                              setFormAdmissionType(type.id as any);
                              if (type.id === "Transfer") {
                                setHasPreviousSchool(true);
                              } else {
                                setHasPreviousSchool(false);
                              }
                            }}
                            className={cn(
                              "p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition-all space-y-0.5 sm:space-y-1",
                              isSelected
                                ? "border-seneca-crimson bg-seneca-crimson/5 ring-1 ring-seneca-crimson"
                                : "border-border/80 bg-card hover:bg-muted/40"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                <Icon className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />
                                <span>{type.label}</span>
                              </span>
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight">{type.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Class & Section Selection (100% Database Sourced) */}
                  <div className="space-y-3 pt-1">
                    {dbClasses.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />
                            <span>Target Academic Class & Section (Live Database)</span>
                            <span className="text-seneca-crimson">*</span>
                          </label>
                          <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 bg-emerald-500/5 border-emerald-500/20">
                            ✓ {dbClasses.length} Active Sections in Database
                          </Badge>
                        </div>

                        <select
                          value={selectedClassId}
                          onChange={(e) => {
                            const newClassId = e.target.value;
                            setSelectedClassId(newClassId);
                            const matched = dbClasses.find((c: any) => c.id === newClassId);
                            if (matched) {
                              setFormClassName(matched.name);
                              setFormSection(matched.section);
                              if (matched.stream) setFormStream(matched.stream);
                              generateUniqueStudentIDs(matched.name, matched.section);
                            }
                          }}
                          className="h-11 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-seneca-crimson/30"
                        >
                          {/* Group by Academic Wing */}
                          {["Early Years", "Primary", "Middle", "Secondary", "Higher Secondary"].map((wingName) => {
                            const wingClasses = dbClasses.filter((c: any) => {
                              const spec = ACADEMIC_SPECTRUM.find((s) => s.name.toLowerCase() === c.name.toLowerCase());
                              return spec?.wing === wingName || (wingName === "Primary" && !spec);
                            });

                            if (wingClasses.length === 0) return null;

                            return (
                              <optgroup key={wingName} label={`--- ${wingName} Wing ---`}>
                                {wingClasses.map((cls: any) => (
                                  <option key={cls.id} value={cls.id}>
                                    {cls.fullName || `${cls.name} (Section ${cls.section})`} • {cls.roomNumber || "Campus Room"} ({cls.enrolledCount || 0}/{cls.capacity || 35} Seats)
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                        </select>

                        {/* Selected Class Live Allocation Card */}
                        {(() => {
                          const activeClass = dbClasses.find((c: any) => c.id === selectedClassId) || dbClasses[0];
                          if (!activeClass) return null;
                          const dept = dbDepartments.find((d: any) => d.id === activeClass.departmentId);
                          const occupancy = Math.round(((activeClass.enrolledCount || 0) / (activeClass.capacity || 35)) * 100);

                          return (
                            <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="h-6 w-6 rounded-lg bg-seneca-crimson text-white flex items-center justify-center font-bold text-xs">
                                    {activeClass.section}
                                  </span>
                                  <span className="font-bold text-foreground">{activeClass.name}</span>
                                  {dept && (
                                    <span
                                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                                      style={{
                                        backgroundColor: `${dept.colorCode}18`,
                                        color: dept.colorCode,
                                      }}
                                    >
                                      {dept.name} ({dept.code})
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                  <DoorOpen className="h-3 w-3" />
                                  <span>{activeClass.roomNumber || "Main Wing"}</span>
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-muted-foreground">Classroom Capacity:</span>
                                  <span className="font-bold text-foreground">
                                    {activeClass.enrolledCount || 0} / {activeClass.capacity || 35} Seats ({occupancy}%)
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-300",
                                      occupancy >= 90
                                        ? "bg-rose-500"
                                        : occupancy >= 70
                                        ? "bg-seneca-amber"
                                        : "bg-emerald-500"
                                    )}
                                    style={{ width: `${Math.min(occupancy, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      /* Fallback Spectrum Selector when no classes exist in database yet */
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />
                            <span>Grade Level (Playgroup to 2nd Year)</span>
                            <span className="text-seneca-crimson">*</span>
                          </label>
                          <select
                            value={formClassName}
                            onChange={(e) => {
                              const newGrade = e.target.value;
                              setFormClassName(newGrade);
                              generateUniqueStudentIDs(newGrade, formSection);
                            }}
                            className="h-11 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground"
                          >
                            {ACADEMIC_SPECTRUM.map((s) => (
                              <option key={s.name} value={s.name}>
                                {s.name} ({s.tierLabel})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">Section Letter *</label>
                          <div className="flex items-center gap-1.5">
                            {["A", "B", "C", "D", "E", "F"].map((sec) => (
                              <button
                                key={sec}
                                type="button"
                                onClick={() => {
                                  setFormSection(sec);
                                  generateUniqueStudentIDs(formClassName, sec);
                                }}
                                className={cn(
                                  "h-10 w-10 rounded-xl text-xs font-bold border transition-all",
                                  formSection === sec
                                    ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs"
                                    : "bg-background text-foreground border-border hover:bg-muted"
                                )}
                              >
                                {sec}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Academic Stream (Live Database Sourced) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />
                        <span>Academic Stream / Curriculum Track (Live Database)</span>
                        <span className="text-seneca-crimson">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {loadingStreams ? (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin text-seneca-crimson" /> Syncing DB...
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 bg-emerald-500/5 border-emerald-500/20">
                            ✓ {currentAvailableStreams.length} Tracks in Database
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setNewStreamTier(currentSelectedTier);
                            setNewStreamName("");
                            setNewStreamCode("");
                            setNewStreamDescription("");
                            setCreateStreamModalOpen(true);
                          }}
                          className="text-[10px] font-bold text-seneca-crimson hover:text-seneca-crimson/80 flex items-center gap-1 px-2 py-0.5 rounded-md bg-seneca-crimson/10 border border-seneca-crimson/20 hover:bg-seneca-crimson/15 transition-all cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> + Add Stream
                        </button>
                      </div>
                    </div>
                    <select
                      value={formStream}
                      onChange={(e) => setFormStream(e.target.value)}
                      className="h-11 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 outline-none transition-all cursor-pointer shadow-xs"
                    >
                      {currentAvailableStreams.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                      {/* Ensure current formStream is kept if custom or assigned */}
                      {formStream && !currentAvailableStreams.includes(formStream) && (
                        <option value={formStream}>{formStream}</option>
                      )}
                    </select>
                    <div className="flex flex-wrap items-center justify-between text-[10px] text-muted-foreground pt-0.5 gap-2">
                      <span>Curriculum track automatically tailored to {formClassName} ({currentSelectedTier}).</span>
                      {formStream && (
                        <span className="font-semibold text-foreground/80">
                          Active: <span className="text-seneca-crimson font-bold">{formStream}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STUDENT PROFILE & DEMOGRAPHICS */}
              {activeEnrollTab === "identity" && (
                <div className="space-y-3.5 sm:space-y-4 animate-in fade-in-50 duration-200">
                  {/* Full Student Name */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Full Student Name <span className="text-seneca-crimson">*</span>
                      </label>
                      {getValidation.studentName().isValid && formName.trim() && (
                        <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3" /> Valid Name Format
                        </span>
                      )}
                    </div>
                    <Input
                      required
                      type="text"
                      placeholder="e.g. Muhammad Bilal Farooqi"
                      value={formName}
                      onFocus={() => markTouched("studentName")}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        autoSuggestPortalEmail(e.target.value);
                        markTouched("studentName");
                      }}
                      className={cn(
                        "h-10 sm:h-11 rounded-xl text-xs font-medium",
                        touchedFields.studentName && !getValidation.studentName().isValid
                          ? "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500/20"
                          : formName && getValidation.studentName().isValid
                          ? "border-emerald-500/50 bg-emerald-500/5 focus-visible:ring-emerald-500/20"
                          : "bg-background"
                      )}
                    />
                    {touchedFields.studentName && !getValidation.studentName().isValid ? (
                      <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {getValidation.studentName().message}
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">
                        Letters, spaces, and dots only (e.g. Ayesha Siddiqui).
                      </p>
                    )}
                  </div>

                  {/* DOB with Live Age pill & regex date check */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Date of Birth <span className="text-seneca-crimson">*</span>
                      </label>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        getValidation.dob().isValid
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-rose-500/10 text-rose-600"
                      )}>
                        {calculateAge(formDob)}
                      </span>
                    </div>
                    <Input
                      type="date"
                      required
                      value={formDob}
                      onFocus={() => markTouched("dob")}
                      onChange={(e) => {
                        setFormDob(e.target.value);
                        markTouched("dob");
                      }}
                      className={cn(
                        "h-10 sm:h-11 rounded-xl text-xs",
                        touchedFields.dob && !getValidation.dob().isValid
                          ? "border-rose-500 bg-rose-500/5"
                          : "bg-background"
                      )}
                    />
                    {touchedFields.dob && !getValidation.dob().isValid && (
                      <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {getValidation.dob().message}
                      </p>
                    )}
                  </div>

                  {/* Gender & Blood Group side-by-side */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Gender *</label>
                      <select
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value as any)}
                        className="h-10 sm:h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Blood Group</label>
                      <select
                        value={formBloodGroup}
                        onChange={(e) => setFormBloodGroup(e.target.value)}
                        className="h-10 sm:h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                      >
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="O+">O+</option>
                        <option value="AB+">AB+</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="O-">O-</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  {/* B-Form (Auto-formatted 13 digits) & Place of Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">
                          Student B-Form / National ID #
                        </label>
                        {formBForm && getValidation.bForm().isValid && (
                          <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> 13 Digits
                          </span>
                        )}
                      </div>
                      <Input
                        type="text"
                        placeholder="42101-1234567-1"
                        value={formBForm}
                        maxLength={15}
                        onFocus={() => markTouched("bForm")}
                        onChange={(e) => {
                          setFormBForm(formatters.formatCnic(e.target.value));
                          markTouched("bForm");
                        }}
                        className={cn(
                          "h-10 sm:h-11 rounded-xl text-xs font-mono",
                          touchedFields.bForm && !getValidation.bForm().isValid
                            ? "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500/20"
                            : formBForm && getValidation.bForm().isValid
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "bg-background"
                        )}
                      />
                      {touchedFields.bForm && !getValidation.bForm().isValid ? (
                        <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {getValidation.bForm().message}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">
                          Auto-formatted (XXXXX-XXXXXXX-X). Optional for early years.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Place of Birth (City)</label>
                      <Input
                        type="text"
                        placeholder="Karachi, Pakistan"
                        value={formPlaceOfBirth}
                        onChange={(e) => setFormPlaceOfBirth(e.target.value)}
                        className="h-10 sm:h-11 rounded-xl text-xs bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Nationality</label>
                      <Input
                        type="text"
                        value={formNationality}
                        onChange={(e) => setFormNationality(e.target.value)}
                        className="h-10 sm:h-11 rounded-xl text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Religion</label>
                      <Input
                        type="text"
                        value={formReligion}
                        onChange={(e) => setFormReligion(e.target.value)}
                        className="h-10 sm:h-11 rounded-xl text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Mother Tongue</label>
                      <Input
                        type="text"
                        value={formMotherTongue}
                        onChange={(e) => setFormMotherTongue(e.target.value)}
                        className="h-10 sm:h-11 rounded-xl text-xs bg-background"
                      />
                    </div>
                  </div>

                  {/* Medical & Allergies */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
                    <span className="text-[10px] sm:text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span>Medical Profile & Special Care Directives</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <Input
                        type="text"
                        placeholder="Known Allergies (e.g. Peanuts, Dust, Penicillin)"
                        value={formAllergies}
                        onChange={(e) => setFormAllergies(e.target.value)}
                        className="h-10 rounded-xl text-xs bg-background"
                      />
                      <Input
                        type="text"
                        placeholder="Medical Conditions / Special Directives"
                        value={formMedicalNotes}
                        onChange={(e) => setFormMedicalNotes(e.target.value)}
                        className="h-10 rounded-xl text-xs bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PARENTS & GUARDIAN RECORDS */}
              {activeEnrollTab === "parents" && (
                <div className="space-y-3.5 sm:space-y-4 animate-in fade-in-50 duration-200">
                  {/* Father Info */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-2.5 sm:space-y-3">
                    <span className="text-[10px] sm:text-[11px] font-bold text-foreground uppercase tracking-wider block">
                      Father&apos;s Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Father&apos;s Full Name <span className="text-seneca-crimson">*</span>
                          </label>
                          {formFatherName && getValidation.fatherName().isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Valid
                            </span>
                          )}
                        </div>
                        <Input
                          required
                          type="text"
                          placeholder="e.g. Tariq Mehmood"
                          value={formFatherName}
                          onFocus={() => markTouched("fatherName")}
                          onChange={(e) => {
                            setFormFatherName(e.target.value);
                            markTouched("fatherName");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs",
                            touchedFields.fatherName && !getValidation.fatherName().isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : formFatherName && getValidation.fatherName().isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touchedFields.fatherName && !getValidation.fatherName().isValid && (
                          <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {getValidation.fatherName().message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">Father CNIC Number</label>
                          {formFatherCnic && getValidation.fatherCnic().isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> 13 Digits
                            </span>
                          )}
                        </div>
                        <Input
                          type="text"
                          placeholder="42101-1234567-3"
                          value={formFatherCnic}
                          maxLength={15}
                          onFocus={() => markTouched("fatherCnic")}
                          onChange={(e) => {
                            setFormFatherCnic(formatters.formatCnic(e.target.value));
                            markTouched("fatherCnic");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs font-mono",
                            touchedFields.fatherCnic && !getValidation.fatherCnic().isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : formFatherCnic && getValidation.fatherCnic().isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touchedFields.fatherCnic && !getValidation.fatherCnic().isValid && (
                          <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {getValidation.fatherCnic().message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Father Occupation</label>
                        <Input
                          type="text"
                          placeholder="e.g. Software Engineer / Business"
                          value={formFatherOccupation}
                          onChange={(e) => setFormFatherOccupation(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Company / Employer Name</label>
                        <Input
                          type="text"
                          placeholder="e.g. HBL / Tech Corp"
                          value={formFatherCompany}
                          onChange={(e) => setFormFatherCompany(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Father WhatsApp Phone <span className="text-seneca-crimson">*</span>
                          </label>
                          {formParentPhone && getValidation.fatherPhone().isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Valid Mobile
                            </span>
                          )}
                        </div>
                        <Input
                          required
                          type="tel"
                          placeholder="0300 1234567"
                          value={formParentPhone}
                          maxLength={15}
                          onFocus={() => markTouched("fatherPhone")}
                          onChange={(e) => {
                            setFormParentPhone(formatters.formatPhone(e.target.value));
                            markTouched("fatherPhone");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs",
                            touchedFields.fatherPhone && !getValidation.fatherPhone().isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : formParentPhone && getValidation.fatherPhone().isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touchedFields.fatherPhone && !getValidation.fatherPhone().isValid ? (
                          <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {getValidation.fatherPhone().message}
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground">
                            Pakistani (03XX XXXXXXX) or International (+XX...).
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">Father Email Address</label>
                          {formParentEmail && getValidation.fatherEmail().isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Valid Email
                            </span>
                          )}
                        </div>
                        <Input
                          type="email"
                          placeholder="tariq@gmail.com"
                          value={formParentEmail}
                          onFocus={() => markTouched("fatherEmail")}
                          onChange={(e) => {
                            setFormParentEmail(e.target.value);
                            markTouched("fatherEmail");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs",
                            touchedFields.fatherEmail && !getValidation.fatherEmail().isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : formParentEmail && getValidation.fatherEmail().isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touchedFields.fatherEmail && !getValidation.fatherEmail().isValid && (
                          <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {getValidation.fatherEmail().message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mother Info */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-2.5 sm:space-y-3">
                    <span className="text-[10px] sm:text-[11px] font-bold text-foreground uppercase tracking-wider block">
                      Mother&apos;s Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Mother&apos;s Full Name</label>
                        <Input
                          type="text"
                          placeholder="e.g. Fatima Tariq"
                          value={formMotherName}
                          onChange={(e) => setFormMotherName(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">Mother CNIC Number</label>
                          {formMotherCnic && getValidation.motherCnic().isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Valid
                            </span>
                          )}
                        </div>
                        <Input
                          type="text"
                          placeholder="42101-7654321-2"
                          value={formMotherCnic}
                          maxLength={15}
                          onFocus={() => markTouched("motherCnic")}
                          onChange={(e) => {
                            setFormMotherCnic(formatters.formatCnic(e.target.value));
                            markTouched("motherCnic");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs font-mono",
                            touchedFields.motherCnic && !getValidation.motherCnic().isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : formMotherCnic && getValidation.motherCnic().isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touchedFields.motherCnic && !getValidation.motherCnic().isValid && (
                          <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {getValidation.motherCnic().message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Mother Occupation</label>
                        <Input
                          type="text"
                          placeholder="e.g. Doctor / Educator / Homemaker"
                          value={formMotherOccupation}
                          onChange={(e) => setFormMotherOccupation(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Mother Contact Phone</label>
                        <Input
                          type="tel"
                          placeholder="0321 9876543"
                          value={formMotherPhone}
                          maxLength={15}
                          onChange={(e) => setFormMotherPhone(formatters.formatPhone(e.target.value))}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact & Residence */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">
                          24/7 Emergency Contact Phone <span className="text-seneca-crimson">*</span>
                        </label>
                        {formEmergencyContact && getValidation.emergencyContact().isValid && (
                          <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Valid
                          </span>
                        )}
                      </div>
                      <Input
                        required
                        type="tel"
                        placeholder="0333 1122334"
                        value={formEmergencyContact}
                        maxLength={15}
                        onFocus={() => markTouched("emergencyContact")}
                        onChange={(e) => {
                          setFormEmergencyContact(formatters.formatPhone(e.target.value));
                          markTouched("emergencyContact");
                        }}
                        className={cn(
                          "h-10 rounded-xl text-xs",
                          touchedFields.emergencyContact && !getValidation.emergencyContact().isValid
                            ? "border-rose-500 bg-rose-500/5"
                            : formEmergencyContact && getValidation.emergencyContact().isValid
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "bg-background"
                        )}
                      />
                      {touchedFields.emergencyContact && !getValidation.emergencyContact().isValid && (
                        <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {getValidation.emergencyContact().message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Emergency Contact Relation</label>
                      <Input
                        type="text"
                        placeholder="Father / Uncle / Guardian"
                        value={formEmergencyRelation}
                        onChange={(e) => setFormEmergencyRelation(e.target.value)}
                        className="h-10 rounded-xl text-xs bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Complete Residential Address <span className="text-seneca-crimson">*</span>
                      </label>
                      {formAddress.trim().length >= 5 && (
                        <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3" /> Valid Address
                        </span>
                      )}
                    </div>
                    <Input
                      required
                      type="text"
                      placeholder="House #, Street Name, Sector, City"
                      value={formAddress}
                      onFocus={() => markTouched("address")}
                      onChange={(e) => {
                        setFormAddress(e.target.value);
                        markTouched("address");
                      }}
                      className={cn(
                        "h-10 rounded-xl text-xs",
                        touchedFields.address && !getValidation.address().isValid
                          ? "border-rose-500 bg-rose-500/5"
                          : formAddress && getValidation.address().isValid
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "bg-background"
                      )}
                    />
                    {touchedFields.address && !getValidation.address().isValid && (
                      <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {getValidation.address().message}
                      </p>
                    )}
                  </div>

                  {/* Sibling Link */}
                  <div className="p-3 rounded-2xl bg-seneca-crimson/5 border border-seneca-crimson/20 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />
                        <span className="text-[11px] sm:text-xs">Sibling currently studying at Seneca Academy?</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={formSiblingInSchool}
                        onChange={(e) => setFormSiblingInSchool(e.target.checked)}
                        className="h-4 w-4 rounded text-seneca-crimson shrink-0"
                      />
                    </div>
                    {formSiblingInSchool && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <Input
                          type="text"
                          placeholder="Sibling Student Roll # / Admission ID"
                          value={formSiblingRoll}
                          onChange={(e) => setFormSiblingRoll(e.target.value)}
                          className="h-9 sm:h-10 rounded-xl text-xs bg-background font-mono"
                        />
                        <Input
                          type="text"
                          placeholder="Sibling Full Name"
                          value={formSiblingName}
                          onChange={(e) => setFormSiblingName(e.target.value)}
                          className="h-9 sm:h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ACADEMIC HISTORY & TRANSPORT (CONDITIONAL FOR NEW ADMISSION) */}
              {activeEnrollTab === "history" && (
                <div className="space-y-3.5 sm:space-y-4 animate-in fade-in-50 duration-200">
                  {/* Conditional Previous School Check */}
                  {formAdmissionType !== "Transfer" && !hasPreviousSchool ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                          <h4 className="font-bold text-xs sm:text-sm text-foreground">
                            Fresh / Direct Admission Selected
                          </h4>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                          Prior School Records Not Required
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Since this student is enrolling under <strong>{formAdmissionType} Admission</strong>, previous school records (School Leaving Certificate, past marksheets, previous board enrollment) are not required by default.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setHasPreviousSchool(true)}
                        className="h-8 rounded-xl text-xs font-bold text-primary gap-1 border-primary/30 hover:bg-primary/5 mt-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Record Prior School / Early Childhood History (Optional)</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] sm:text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <SchoolIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>Previous Academic Record (Transfer / Migration)</span>
                        </span>
                        {formAdmissionType !== "Transfer" && (
                          <button
                            type="button"
                            onClick={() => {
                              setHasPreviousSchool(false);
                              setFormPreviousSchool("");
                              setFormLastGrade("");
                              setFormSlcNumber("");
                            }}
                            className="text-[10px] font-bold text-rose-500 hover:underline"
                          >
                            Hide / Not Applicable
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">Previous School Attended</label>
                          <Input
                            type="text"
                            placeholder="e.g. St. Patrick's / Army Public School"
                            value={formPreviousSchool}
                            onChange={(e) => setFormPreviousSchool(e.target.value)}
                            className="h-10 rounded-xl text-xs bg-background"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">Last Class Passed</label>
                          <Input
                            type="text"
                            placeholder="e.g. Grade 4 / Class 8"
                            value={formLastGrade}
                            onChange={(e) => setFormLastGrade(e.target.value)}
                            className="h-10 rounded-xl text-xs bg-background"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">SLC / Transfer Cert #</label>
                          <Input
                            type="text"
                            placeholder="SLC-2025-981"
                            value={formSlcNumber}
                            onChange={(e) => setFormSlcNumber(e.target.value)}
                            className="h-10 rounded-xl text-xs bg-background font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">Previous Board</label>
                          <select
                            value={formPreviousBoard}
                            onChange={(e) => setFormPreviousBoard(e.target.value)}
                            className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                          >
                            <option value="Sindh Board (BSEK)">Sindh Board (BSEK/BIEK)</option>
                            <option value="Federal Board (FBISE)">Federal Board (FBISE)</option>
                            <option value="Cambridge (CAIE / O-Level)">Cambridge (CAIE / O-Level)</option>
                            <option value="Aga Khan University Board (AKU-EB)">Aga Khan Board (AKU-EB)</option>
                            <option value="Montessori / Early Childhood">Early Childhood Direct</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">Marks / Percentage</label>
                          <Input
                            type="text"
                            placeholder="e.g. 88.5% (A+ Grade)"
                            value={formPreviousMarks}
                            onChange={(e) => setFormPreviousMarks(e.target.value)}
                            className="h-10 rounded-xl text-xs bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transport Route Selection */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-2.5 sm:space-y-3">
                    <span className="text-[10px] sm:text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Bus className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>School Transport & Van Service</span>
                    </span>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Selected Transport Route</label>
                      <select
                        value={formTransportRoute}
                        onChange={(e) => setFormTransportRoute(e.target.value)}
                        className="h-10 sm:h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground"
                      >
                        {TRANSPORT_ROUTES.map((route) => (
                          <option key={route} value={route}>
                            {route}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formTransportRoute !== TRANSPORT_ROUTES[0] && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Designated Pickup / Drop-off Point</label>
                        <Input
                          type="text"
                          placeholder="e.g. Near Garden Jamatkhana / Nishtar Road Roundabout"
                          value={formPickupPoint}
                          onChange={(e) => setFormPickupPoint(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENT VERIFICATION CHECKLIST & IMAGE UPLOADS */}
              {activeEnrollTab === "documents" && (
                <div className="space-y-3.5 sm:space-y-4 animate-in fade-in-50 duration-200">
                  {/* Status Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                          <span>Document Requirements for {formClassName}</span>
                          <Badge variant="outline" className="text-[9px] font-bold text-seneca-crimson bg-seneca-crimson/5">
                            {formAdmissionType}
                          </Badge>
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          Upload clear document photos or digital scans (PNG, JPG, PDF up to 5MB).
                        </p>
                      </div>
                    </div>
                    <select
                      value={docVerificationStatus}
                      onChange={(e) => setDocVerificationStatus(e.target.value as any)}
                      className="h-8 px-2 rounded-lg bg-background border border-emerald-500/30 text-xs font-bold text-emerald-600 self-start sm:self-auto"
                    >
                      <option value="verified">All Verified</option>
                      <option value="pending">Pending Documents</option>
                      <option value="incomplete">Incomplete File</option>
                    </select>
                  </div>

                  {/* Grade-Tailored Document Checklist & File Upload Grid */}
                  <div className="space-y-2.5">
                    {getGradeDocumentChecklist(formClassName, formAdmissionType).map((docItem) => {
                      const isSubmitted =
                        docItem.id === "bForm" ? docBForm :
                        docItem.id === "fatherCnic" ? docFatherCnic :
                        docItem.id === "motherCnic" ? docMotherCnic :
                        docItem.id === "photos" ? docPhotos :
                        docItem.id === "slc" ? docSlc :
                        docItem.id === "marksheet" ? docMarksheet :
                        docItem.id === "characterCert" ? docCharacterCert :
                        docMedicalReport;

                      const setSubmitted = (val: boolean) => {
                        if (docItem.id === "bForm") setDocBForm(val);
                        if (docItem.id === "fatherCnic") setDocFatherCnic(val);
                        if (docItem.id === "motherCnic") setDocMotherCnic(val);
                        if (docItem.id === "photos") setDocPhotos(val);
                        if (docItem.id === "slc") setDocSlc(val);
                        if (docItem.id === "marksheet") setDocMarksheet(val);
                        if (docItem.id === "characterCert") setDocCharacterCert(val);
                        if (docItem.id === "medicalReport") setDocMedicalReport(val);
                      };

                      const uploadedFile = uploadedDocFiles[docItem.id];

                      return (
                        <div
                          key={docItem.id}
                          className={cn(
                            "p-3 sm:p-4 rounded-2xl border transition-all space-y-2.5",
                            isSubmitted || uploadedFile
                              ? "bg-emerald-500/5 border-emerald-500/30"
                              : "bg-card border-border/80 hover:border-border"
                          )}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-start sm:items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => setSubmitted(!isSubmitted)}
                                className={cn(
                                  "h-5 w-5 rounded-md flex items-center justify-center border text-xs shrink-0 font-bold mt-0.5 sm:mt-0 transition-colors",
                                  isSubmitted
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                    : "bg-background border-border text-transparent"
                                )}
                              >
                                ✓
                              </button>
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-xs font-bold text-foreground">
                                    {docItem.label}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] font-bold px-1.5 py-0.2",
                                      docItem.required
                                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {docItem.badge}
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground pt-0.5">
                                  {docItem.desc}
                                </p>
                              </div>
                            </div>

                            {/* Status Indicator */}
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold self-start sm:self-auto shrink-0",
                                uploadedFile && isSubmitted
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : uploadedFile
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                  : isSubmitted
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : "bg-muted/70 text-muted-foreground border-border/80"
                              )}
                            >
                              {uploadedFile && isSubmitted
                                ? "Verified & Attached"
                                : uploadedFile
                                ? "File Attached (Pending Verification)"
                                : isSubmitted
                                ? "Physical Copy Received"
                                : "Pending Submission"}
                            </Badge>
                          </div>

                          {/* Image Upload / File Attachment Widget */}
                          <div className="pt-1 border-t border-border/50">
                            {uploadedFile ? (
                              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-background border border-emerald-500/30">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {uploadedFile.fileUrl.startsWith("data:image") ? (
                                    <div
                                      onClick={() =>
                                        setPreviewDocModal({
                                          url: uploadedFile.fileUrl,
                                          title: docItem.label,
                                        })
                                      }
                                      className="h-10 w-10 rounded-lg overflow-hidden border border-border bg-muted cursor-pointer shrink-0 relative group"
                                      title="Click to view image"
                                    >
                                      <img
                                        src={uploadedFile.fileUrl}
                                        alt={docItem.label}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Eye className="h-3.5 w-3.5 text-white" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground border">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-foreground truncate block max-w-[200px] sm:max-w-[280px]">
                                      {uploadedFile.fileName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {uploadedFile.fileSize} • Uploaded & Attached
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setPreviewDocModal({
                                        url: uploadedFile.fileUrl,
                                        title: docItem.label,
                                      })
                                    }
                                    className="h-7 px-2 text-[10px] font-bold gap-1 rounded-lg"
                                  >
                                    <Eye className="h-3 w-3 text-primary" />
                                    <span>Preview</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveDocFile(docItem.id)}
                                    className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                                    title="Remove File"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={`upload-doc-${docItem.id}`}
                                  className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-bold text-seneca-crimson hover:text-seneca-crimson/80 bg-seneca-crimson/5 hover:bg-seneca-crimson/10 border border-seneca-crimson/20 px-3 py-1.5 rounded-xl transition-all"
                                >
                                  <FileUp className="h-3.5 w-3.5" />
                                  <span>Upload Document Photo / Scan</span>
                                </label>
                                <input
                                  id={`upload-doc-${docItem.id}`}
                                  type="file"
                                  accept={docItem.fileAccept}
                                  onChange={(e) => handleDocFileUpload(docItem.id, e)}
                                  className="hidden"
                                />
                                <span className="text-[10px] text-muted-foreground">
                                  PNG, JPG, PDF (Max 5MB)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: PORTAL CREDENTIALS, PASSWORD METER & EXECUTIVE SUMMARY REVIEW */}
              {activeEnrollTab === "portal" && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  {/* Credentials Card */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] sm:text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />
                        <span>LMS Student Portal Login Credentials</span>
                      </span>
                      <Button
                        type="button"
                        onClick={handleCopyCredentials}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-[10px] font-bold gap-1 rounded-lg border-seneca-crimson/30 text-seneca-crimson hover:bg-seneca-crimson/10"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy Login Info</span>
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">
                          Student Portal Email <span className="text-seneca-crimson">*</span>
                        </label>
                        {formEmail && getValidation.portalEmail().isValid && (
                          <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Valid LMS Email
                          </span>
                        )}
                      </div>
                      <Input
                        required
                        type="email"
                        placeholder="student@seneca.edu.pk"
                        value={formEmail}
                        onFocus={() => markTouched("portalEmail")}
                        onChange={(e) => {
                          setFormEmail(e.target.value);
                          markTouched("portalEmail");
                        }}
                        className={cn(
                          "h-10 sm:h-11 rounded-xl text-xs",
                          touchedFields.portalEmail && !getValidation.portalEmail().isValid
                            ? "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500/20"
                            : formEmail && getValidation.portalEmail().isValid
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "bg-background"
                        )}
                      />
                      {touchedFields.portalEmail && !getValidation.portalEmail().isValid && (
                        <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {getValidation.portalEmail().message}
                        </p>
                      )}
                    </div>

                    {/* Password + Strength Meter */}
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Initial Portal Password <span className="text-seneca-crimson">*</span>
                          </label>
                          {(() => {
                            const pwStr = getPasswordStrength(formPassword);
                            return (
                              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md", pwStr.color)}>
                                Strength: {pwStr.label}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="relative">
                          <Input
                            required
                            type={showPassword ? "text" : "password"}
                            value={formPassword}
                            onFocus={() => markTouched("password")}
                            onChange={(e) => {
                              setFormPassword(e.target.value);
                              markTouched("password");
                            }}
                            className={cn(
                              "h-10 sm:h-11 rounded-xl text-xs pr-16 font-mono",
                              touchedFields.password && !getValidation.password().isValid
                                ? "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500/20"
                                : formPassword && getValidation.password().isValid
                                ? "border-emerald-500/50 bg-emerald-500/5"
                                : "bg-background"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground hover:text-foreground px-1"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      {/* Password Criteria Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                        {[
                          { label: "8+ Chars", passed: formPassword.length >= 8 },
                          { label: "Lowercase", passed: /[a-z]/.test(formPassword) },
                          { label: "Uppercase", passed: /[A-Z]/.test(formPassword) },
                          { label: "Number", passed: /\d/.test(formPassword) },
                        ].map((c) => (
                          <div
                            key={c.label}
                            className={cn(
                              "text-[10px] px-2 py-1 rounded-lg border font-medium flex items-center justify-center gap-1 transition-all",
                              c.passed
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-muted/50 text-muted-foreground border-border/60"
                            )}
                          >
                            {c.passed ? <Check className="h-2.5 w-2.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}
                            <span>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fee Category */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-seneca-amber shrink-0" />
                      <span>Fee Structure Tier & Concession Allocation</span>
                    </span>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Fee Concession Category</label>
                      <select
                        value={formFeeCategory}
                        onChange={(e) => setFormFeeCategory(e.target.value)}
                        className="h-10 sm:h-11 w-full px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground"
                      >
                        <option value="Standard">Standard Full Tuition Fee</option>
                        <option value="Sibling Discount (20%)">Sibling Concession (20% Tuition Waiver)</option>
                        <option value="Merit Scholarship (50%)">Academic Merit Scholarship (50% Tuition Waiver)</option>
                        <option value="Full Scholarship (100%)">Honor Roll Full Scholarship (100% Tuition Waiver)</option>
                        <option value="Need-Based Concession">Need-Based Financial Assistance</option>
                      </select>
                    </div>
                  </div>

                  {/* Initial Admission & 1st Month Fee Voucher Card */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="enroll-gen-fee"
                          checked={enrollGenerateFee}
                          onChange={(e) => setEnrollGenerateFee(e.target.checked)}
                          className="h-4 w-4 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <label
                          htmlFor="enroll-gen-fee"
                          className="text-[11px] sm:text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5"
                        >
                          <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Generate Initial Admission & 1st Month Fee Voucher</span>
                        </label>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                        Recommended
                      </Badge>
                    </div>

                    {enrollGenerateFee && (
                      <div className="space-y-3 pt-1 border-t border-emerald-500/20 animate-in fade-in-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Admission Fee (PKR)</label>
                            <Input
                              type="number"
                              value={enrollAdmissionFee}
                              onChange={(e) => setEnrollAdmissionFee(e.target.value)}
                              className="h-9 rounded-xl text-xs bg-background font-mono font-semibold"
                              placeholder="5000"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-muted-foreground">Security Fee (PKR)</label>
                              <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-500/10 px-1 py-0.2 rounded">
                                Refundable
                              </span>
                            </div>
                            <Input
                              type="number"
                              value={enrollSecurityFee}
                              onChange={(e) => setEnrollSecurityFee(e.target.value)}
                              className="h-9 rounded-xl text-xs bg-background font-mono font-semibold text-emerald-700 dark:text-emerald-400 focus-visible:ring-emerald-500/20"
                              placeholder="5000"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Monthly Tuition (PKR)</label>
                            <Input
                              type="number"
                              value={enrollTuitionFee}
                              onChange={(e) => setEnrollTuitionFee(e.target.value)}
                              className="h-9 rounded-xl text-xs bg-background font-mono font-semibold"
                              placeholder="12000"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Fee Due Date</label>
                            <Input
                              type="date"
                              value={enrollDueDate || getDefaultDueDate()}
                              onChange={(e) => setEnrollDueDate(e.target.value)}
                              className="h-9 rounded-xl text-xs bg-background font-medium"
                            />
                          </div>
                        </div>

                        {/* Calculated Breakdown preview with Print Preview Trigger */}
                        {(() => {
                          const t = Number(enrollTuitionFee) || getStandardTuitionForGrade(formClassName);
                          const a = Number(enrollAdmissionFee) || 0;
                          const s = Number(enrollSecurityFee) || 0;
                          const disc = getDiscountForCategory(t, formFeeCategory, formAdmissionType);
                          const other = 1000;
                          const net = Math.max(0, t + a + s + other - disc);
                          return (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-background/90 border border-emerald-500/20 text-xs shadow-sm">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                <span>Tuition: <strong className="text-foreground">{formatCurrency(t)}</strong></span>
                                <span>Admission: <strong className="text-foreground">{formatCurrency(a)}</strong></span>
                                {s > 0 && (
                                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                    Security (Ref): <strong className="text-foreground">{formatCurrency(s)}</strong>
                                  </span>
                                )}
                                {disc > 0 && (
                                  <span className="text-emerald-600 font-bold">Waiver: -{formatCurrency(disc)}</span>
                                )}
                                <span className="font-extrabold text-foreground border-l border-border/80 pl-2">
                                  Initial Net: <span className="text-seneca-crimson text-xs font-mono">{formatCurrency(net)}</span>
                                </span>
                              </div>
                              <Button
                                type="button"
                                onClick={handlePreviewInitialVoucher}
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 self-start sm:self-auto shrink-0 shadow-sm"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                <span>Preview & Print Voucher</span>
                              </Button>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Executive Enrollment Summary Card (Pre-submission Review) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-seneca-crimson/5 via-seneca-amber/5 to-transparent border border-seneca-crimson/25 space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <CheckCheck className="h-4 w-4 text-seneca-crimson shrink-0" />
                        <span>Executive Pre-Enrollment Summary</span>
                      </span>
                      <Badge variant="outline" className="text-[9px] font-bold text-seneca-crimson border-seneca-crimson/30 bg-seneca-crimson/5">
                        Ready to Register
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Student:</span>
                        <span className="font-bold text-foreground truncate block">
                          {formName.trim() || "Not Specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Academic Class:</span>
                        <span className="font-bold text-foreground block">
                          {formClassName} ({formSection})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Admission ID:</span>
                        <span className="font-mono font-bold text-seneca-crimson block">
                          {formAdmissionNumber || "Auto"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Assigned Roll #:</span>
                        <span className="font-mono font-bold text-foreground block">
                          {formRollNumber || "Auto"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Father / Guardian:</span>
                        <span className="font-bold text-foreground truncate block">
                          {formFatherName.trim() || "Not Specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Parent WhatsApp:</span>
                        <span className="font-bold text-foreground block">
                          {formParentPhone || "Not Specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Navigation Footer */}
            <div className="p-3 sm:p-4 border-t border-border/60 bg-card/95 backdrop-blur-md flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0 z-20">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEnrollModalOpen(false)}
                  className="rounded-xl text-xs font-bold flex-1 sm:flex-initial h-10 sm:h-9"
                >
                  Cancel
                </Button>
                {activeEnrollTab !== "academic" && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const tabs = ["academic", "identity", "parents", "history", "documents", "portal"] as const;
                      const currIdx = tabs.indexOf(activeEnrollTab);
                      if (currIdx > 0) setActiveEnrollTab(tabs[currIdx - 1]);
                    }}
                    className="rounded-xl text-xs font-bold flex-1 sm:flex-initial h-10 sm:h-9"
                  >
                    Previous Step
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {activeEnrollTab !== "portal" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNextStep}
                    className="rounded-xl text-xs font-bold gap-1 bg-seneca-crimson/5 text-seneca-crimson hover:bg-seneca-crimson/10 border-seneca-crimson/30 w-full sm:w-auto justify-center h-11 sm:h-9 shadow-sm"
                  >
                    <span>Next Section</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    variant="glow"
                    className="rounded-xl text-xs font-bold gap-1.5 shadow-lg shadow-seneca-crimson/20 w-full sm:w-auto justify-center h-11 sm:h-9"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Enrolling Student...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Confirm Enrollment</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Add Academic Stream to Live Database Dialog */}
      <Dialog open={createStreamModalOpen} onOpenChange={setCreateStreamModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-md rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-2xl p-5 sm:p-6">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-seneca-crimson shrink-0" />
              <span>Add Academic Stream to Database</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Create a new curriculum track or academic specialization saved directly to MongoDB. It will instantly be available in the live enrollment dropdown.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNewStream} className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Stream / Track Title <span className="text-seneca-crimson">*</span></span>
                <span className="text-[10px] text-muted-foreground font-normal">e.g. FSc Pre-Medical, ICS, Cambridge</span>
              </label>
              <Input
                required
                placeholder="e.g. Artificial Intelligence & Robotics Track"
                value={newStreamName}
                onChange={(e) => setNewStreamName(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Applicable Grade Tier <span className="text-seneca-crimson">*</span>
                </label>
                <select
                  value={newStreamTier}
                  onChange={(e) => setNewStreamTier(e.target.value)}
                  className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 outline-none"
                >
                  <option value="Higher Secondary">Higher Secondary / College</option>
                  <option value="Secondary">Secondary / Matric</option>
                  <option value="Middle">Middle Wing</option>
                  <option value="Primary">Primary Wing</option>
                  <option value="Preschool">Preschool / Early Years</option>
                  <option value="All">All Grade Levels</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Stream Code</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                </label>
                <Input
                  placeholder="e.g. AI-ROB"
                  value={newStreamCode}
                  onChange={(e) => setNewStreamCode(e.target.value)}
                  className="h-10 text-xs rounded-xl uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Description & Focus Areas</span>
                <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
              </label>
              <Input
                placeholder="e.g. Programming, Machine Learning, Applied Mathematics"
                value={newStreamDescription}
                onChange={(e) => setNewStreamDescription(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2 flex flex-row items-center justify-end gap-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateStreamModalOpen(false)}
                disabled={savingNewStream}
                className="rounded-xl text-xs font-bold h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingNewStream || !newStreamName.trim()}
                className="bg-seneca-crimson hover:bg-seneca-crimson/90 text-white font-bold text-xs rounded-xl h-9 shadow-sm"
              >
                {savingNewStream ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving to DB...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Save Stream to DB
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Image Lightbox / Full View Modal */}
      {previewDocModal && (
        <Dialog open={!!previewDocModal} onOpenChange={() => setPreviewDocModal(null)}>
          <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-2xl overflow-y-auto">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  {previewDocModal.title}
                </DialogTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const win = window.open();
                    win?.document.write(`<iframe src="${previewDocModal.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                  }}
                  className="h-8 rounded-xl text-xs font-bold gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Full</span>
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-muted/40 rounded-2xl border border-border/60 min-h-[300px]">
              {previewDocModal.url.startsWith("data:image") ? (
                <img
                  src={previewDocModal.url}
                  alt={previewDocModal.title}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
                />
              ) : (
                <iframe
                  src={previewDocModal.url}
                  title={previewDocModal.title}
                  className="w-full h-[60vh] rounded-xl"
                />
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                onClick={() => setPreviewDocModal(null)}
                variant="outline"
                className="h-9 px-4 rounded-xl text-xs font-bold"
              >
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 6. Comprehensive Luxury Student Dossier & Profile View Modal */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-seneca-crimson/20 dark:border-white/10 bg-card/98 backdrop-blur-2xl">
            {/* 1. Executive Fixed Header */}
            <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 bg-gradient-to-r from-card via-card/95 to-seneca-crimson/[0.04] space-y-3.5 shrink-0">
              {/* Institution Seal & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pr-8">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
                  <Fingerprint className="h-4 w-4 shrink-0" />
                  <span>Seneca Academic Directorate • Official Student Dossier</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={() => handleOpenVoucherModal(selectedStudent)}
                    size="sm"
                    variant="glow"
                    className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Issue Fee Voucher</span>
                  </Button>
                  <Button
                    onClick={() => {
                      const s = selectedStudent;
                      setSelectedStudent(null);
                      handleOpenPromoteModal(s);
                    }}
                    size="sm"
                    className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 bg-gradient-to-r from-seneca-crimson to-seneca-amber text-white shadow-sm hover:opacity-90"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Promote Student</span>
                  </Button>
                </div>
              </div>

              {/* Student Identity Hero Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-seneca-crimson via-rose-700 to-seneca-amber text-white font-extrabold text-xl sm:text-2xl shadow-xl ring-4 ring-seneca-crimson/15">
                    {selectedStudent.avatarUrl ? (
                      <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="h-full w-full object-cover rounded-2xl" />
                    ) : (
                      ((selectedStudent.name || "Student").charAt(0) || "S").toUpperCase()
                    )}
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                    </div>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <DialogTitle className="text-base sm:text-xl font-extrabold text-foreground tracking-tight truncate">
                        {selectedStudent.name || "Student"}
                      </DialogTitle>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] sm:text-[10px] font-bold capitalize px-2 py-0.5 rounded-full flex items-center gap-1",
                          selectedStudent.status === "active"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {selectedStudent.status === "active" ? "Active Enrolled" : selectedStudent.status}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] font-bold text-seneca-crimson bg-seneca-crimson/5 border-seneca-crimson/20">
                        {selectedStudent.admissionType || "Regular"}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] font-bold text-seneca-amber bg-seneca-amber/10 border-seneca-amber/30">
                        {selectedStudent.feeCategory || "Standard"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-seneca-crimson" />
                        <span className="truncate max-w-[200px] sm:max-w-none">{selectedStudent.email || "No institutional email"}</span>
                      </span>
                      <span className="hidden sm:inline text-border">•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3.5 w-3.5 text-seneca-amber" />
                        <span>Enrolled {new Date(selectedStudent.enrollmentDate).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedStudent.admissionNumber, "Admission ID")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border/80 hover:border-seneca-crimson/40 text-xs font-mono font-bold text-foreground transition-all shadow-sm group"
                    title="Click to copy Official Admission ID"
                  >
                    <Fingerprint className="h-3.5 w-3.5 text-seneca-crimson" />
                    <span>{selectedStudent.admissionNumber}</span>
                    <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Dossier Segmented Navigation Tabs */}
              <div className="flex items-center gap-1 sm:gap-1.5 pt-1 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
                {[
                  { id: "profile", label: "Student Profile & Bio", icon: UserCheck },
                  { id: "progression", label: "Academic Journey & Progression", icon: GraduationCap, badge: (selectedStudent.academicHistory?.length || 0) + 1 },
                  { id: "fees", label: "Fee Vouchers & Ledger", icon: Receipt, badge: studentFees.length },
                  { id: "documents", label: "Documents & Archive", icon: FileCheck },
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = dossierActiveTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDossierActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0",
                        isActive
                          ? "bg-seneca-crimson text-white border-seneca-crimson shadow-md shadow-seneca-crimson/20"
                          : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <IconComp className="h-3.5 w-3.5 shrink-0" />
                      <span>{tab.label}</span>
                      {tab.badge !== undefined && (
                        <span className={cn(
                          "px-1.5 py-0.2 rounded-full text-[9px] font-extrabold",
                          isActive ? "bg-white text-seneca-crimson" : "bg-seneca-crimson/15 text-seneca-crimson"
                        )}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* TAB 1: PROFILE & DEMOGRAPHICS */}
              {dossierActiveTab === "profile" && (
                <div className="space-y-4 animate-in fade-in-50">
                  {/* Top Academic Allocation 4 Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                        <span>Admission ID</span>
                        <Fingerprint className="h-3.5 w-3.5 text-seneca-crimson" />
                      </div>
                      <div className="font-bold text-foreground font-mono text-xs sm:text-sm truncate">
                        {selectedStudent.admissionNumber}
                      </div>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                        <span>Assigned Roll #</span>
                        <Hash className="h-3.5 w-3.5 text-seneca-amber" />
                      </div>
                      <div className="font-bold text-foreground font-mono text-xs sm:text-sm truncate">
                        {selectedStudent.rollNumber}
                      </div>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                        <span>Class Section</span>
                        <Layers className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="font-bold text-foreground text-xs sm:text-sm truncate">
                        {selectedStudent.className} ({selectedStudent.section})
                      </div>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                        <span>Academic Stream</span>
                        <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                      </div>
                      <div className="font-bold text-seneca-crimson dark:text-seneca-amber text-xs sm:text-sm truncate">
                        {selectedStudent.stream || "General Stream"}
                      </div>
                    </div>
                  </div>

                  {/* Personal Demographics Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-seneca-crimson" />
                        <span>Student Demographics &amp; Biological Record</span>
                      </span>
                      <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                        Verified Bio
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-card/70 border border-border/40 space-y-0.5">
                        <span className="text-muted-foreground text-[10px] block font-medium">Gender</span>
                        <span className="font-bold text-foreground capitalize">{selectedStudent.gender || "Not Specified"}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-card/70 border border-border/40 space-y-0.5">
                        <span className="text-muted-foreground text-[10px] block font-medium">Blood Group</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <HeartPulse className="h-3.5 w-3.5" />
                          {selectedStudent.bloodGroup || "O+"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-card/70 border border-border/40 space-y-0.5">
                        <span className="text-muted-foreground text-[10px] block font-medium">Date of Birth</span>
                        <span className="font-semibold text-foreground">
                          {selectedStudent.dateOfBirth
                            ? new Date(selectedStudent.dateOfBirth).toLocaleDateString("en-PK", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-card/70 border border-border/40 space-y-0.5">
                        <span className="text-muted-foreground text-[10px] block font-medium">B-Form / CNIC #</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedStudent.bFormNumber || "", "B-Form Number")}
                          className="font-mono font-bold text-seneca-crimson dark:text-seneca-amber flex items-center gap-1 hover:underline text-left truncate"
                          title="Click to copy B-Form / CNIC"
                        >
                          <CreditCard className="h-3 w-3 shrink-0" />
                          <span className="truncate">{selectedStudent.bFormNumber || "On File"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Parents, Guardian & Emergency Contact Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-seneca-amber" />
                        <span>Parents, Guardian &amp; Emergency Relations</span>
                      </span>
                      <Badge variant="outline" className="text-[10px] font-bold text-seneca-amber border-seneca-amber/30">
                        Primary Contacts
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      {/* Father / Primary Guardian */}
                      <div className="p-3.5 rounded-xl bg-card/70 border border-border/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-seneca-crimson">
                            Father / Legal Guardian
                          </span>
                          <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground">
                            Primary
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-foreground text-sm block">
                            {selectedStudent.guardian?.fatherName || "N/A"}
                          </span>
                          {selectedStudent.guardian?.fatherCnic && (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                              <span>CNIC:</span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(selectedStudent.guardian?.fatherCnic || "", "Father CNIC")}
                                className="font-bold text-foreground hover:text-seneca-crimson hover:underline"
                              >
                                {selectedStudent.guardian.fatherCnic}
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-foreground pt-1">
                            <Phone className="h-3.5 w-3.5 text-emerald-600" />
                            <a
                              href={`tel:${selectedStudent.phone || selectedStudent.guardian?.phone || ""}`}
                              className="font-bold text-emerald-600 hover:underline"
                            >
                              {selectedStudent.phone || selectedStudent.guardian?.phone || "N/A"}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Mother & Emergency Contact */}
                      <div className="p-3.5 rounded-xl bg-card/70 border border-border/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-seneca-amber">
                            Mother &amp; Emergency Relations
                          </span>
                          <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground">
                            Emergency
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-foreground text-sm block">
                            {selectedStudent.guardian?.motherName || "Mother on File"}
                          </span>
                          {selectedStudent.guardian?.motherCnic && (
                            <div className="text-[11px] font-mono text-muted-foreground">
                              <span>CNIC: {selectedStudent.guardian.motherCnic}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-foreground pt-1">
                            <PhoneCall className="h-3.5 w-3.5 text-seneca-amber" />
                            <a
                              href={`tel:${selectedStudent.guardian?.emergencyContact || selectedStudent.phone || ""}`}
                              className="font-bold text-foreground hover:underline"
                            >
                              {selectedStudent.guardian?.emergencyContact || selectedStudent.phone || "N/A"}
                            </a>
                            <span className="text-[10px] text-muted-foreground">(Emergency)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Residential Address Banner */}
                    <div className="p-3 rounded-xl bg-card/80 border border-border/50 flex items-start gap-2.5 text-xs">
                      <MapPin className="h-4 w-4 text-seneca-crimson shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-bold text-foreground block text-[11px]">Registered Residential Address:</span>
                        <p className="text-muted-foreground leading-relaxed pt-0.5">
                          {selectedStudent.address || "Soldier Bazar, Karachi, Pakistan"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMIC JOURNEY & GRADE PROGRESSION */}
              {dossierActiveTab === "progression" && (
                <div className="space-y-4 animate-in fade-in-50">
                  {/* Current Active Class Placement Hero Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-seneca-crimson/10 via-card to-seneca-amber/10 border border-seneca-crimson/25 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-seneca-crimson text-white flex items-center justify-center font-bold shadow-md shrink-0">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-foreground">Current Active Academic Placement</h4>
                            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                              Active Enrolled
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Official Class: <strong className="text-foreground">{selectedStudent.className}</strong> • Section <strong className="text-foreground">{selectedStudent.section}</strong>
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          const s = selectedStudent;
                          setSelectedStudent(null);
                          handleOpenPromoteModal(s);
                        }}
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-seneca-crimson to-seneca-amber text-white font-bold text-xs gap-1.5 shadow-md hover:opacity-90 w-full sm:w-auto justify-center"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Promote / Advance Grade</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/40 text-xs">
                      <div className="bg-card/80 p-2.5 rounded-xl border border-border/40 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground block">Roll Number</span>
                        <span className="font-mono font-bold text-foreground">{selectedStudent.rollNumber}</span>
                      </div>
                      <div className="bg-card/80 p-2.5 rounded-xl border border-border/40 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground block">Academic Stream</span>
                        <span className="font-semibold text-foreground truncate block">{selectedStudent.stream || "General"}</span>
                      </div>
                      <div className="bg-card/80 p-2.5 rounded-xl border border-border/40 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground block">Admission Type</span>
                        <span className="font-bold text-seneca-crimson">{selectedStudent.admissionType || "Regular"}</span>
                      </div>
                      <div className="bg-card/80 p-2.5 rounded-xl border border-border/40 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground block">Total Milestones</span>
                        <span className="font-bold text-foreground">{(selectedStudent.academicHistory?.length || 0) + 1} Academic Terms</span>
                      </div>
                    </div>
                  </div>

                  {/* Progression History Timeline */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-seneca-crimson" />
                        <span>Official Grade Advancement &amp; Promotion History</span>
                      </h4>
                      <span className="text-[10px] text-muted-foreground">
                        {selectedStudent.academicHistory?.length || 0} Archived Promotion Record{(selectedStudent.academicHistory?.length || 0) === 1 ? "" : "s"}
                      </span>
                    </div>

                    {!selectedStudent.academicHistory || selectedStudent.academicHistory.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-border/60 text-center space-y-2">
                        <div className="h-10 w-10 mx-auto rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <h5 className="font-bold text-xs text-foreground">Inaugural Session Record</h5>
                        <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                          This student is currently in their initial enrolled class ({selectedStudent.className} - {selectedStudent.section}). When the Principal promotes or advances this student at year-end, historical transcripts, percentage, GPA, and endorsements will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-seneca-crimson before:via-seneca-amber before:to-emerald-500">
                        {selectedStudent.academicHistory.map((item, idx) => (
                          <div key={idx} className="relative pl-8 space-y-2 group">
                            {/* Dot */}
                            <div className="absolute left-2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-card bg-seneca-crimson group-hover:scale-125 transition-transform" />

                            <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/30 border border-border/60 hover:border-seneca-crimson/40 transition-all space-y-2.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-foreground text-xs">
                                    {item.fromClassName || "Previous Class"} {item.fromSection ? `(${item.fromSection})` : ""}
                                  </span>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="font-bold text-seneca-crimson text-xs">
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

                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(item.promotionDate).toLocaleDateString("en-PK", { dateStyle: "medium" })}</span>
                                </div>
                              </div>

                              {/* Academic Metrics */}
                              <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-card/60 border border-border/40 text-center">
                                <div>
                                  <span className="text-[9px] text-muted-foreground block">Session Result</span>
                                  <span className="font-bold text-foreground text-xs">{item.finalPercentage !== undefined ? `${item.finalPercentage}%` : "Evaluated"}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-muted-foreground block">Grade Awarded</span>
                                  <span className="font-bold text-seneca-crimson text-xs">{item.overallGrade || "A"}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-muted-foreground block">Session GPA</span>
                                  <span className="font-bold text-foreground font-mono text-xs">{item.finalGpa !== undefined ? item.finalGpa.toFixed(2) : "N/A"}</span>
                                </div>
                              </div>

                              {/* Principal Remarks */}
                              {item.remarks && (
                                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] space-y-1">
                                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    <span className="flex items-center gap-1">
                                      <ShieldCheck className="h-3.5 w-3.5" />
                                      <span>Principal / Head of Academics Remark</span>
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
                  </div>
                </div>
              )}

              {/* TAB 3: FEE VOUCHERS & FINANCIAL LEDGER */}
              {dossierActiveTab === "fees" && (
                <div className="space-y-4 animate-in fade-in-50">
                  {/* Financial Overview Metrics */}
                  {(() => {
                    const totalBilled = studentFees.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
                    const totalPaid = studentFees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
                    const totalPending = studentFees.reduce((acc, f) => acc + (f.balanceAmount || (f.status === "paid" ? 0 : f.totalAmount) || 0), 0);
                    const paidCount = studentFees.filter((f) => f.status === "paid").length;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-0.5">
                          <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Issued Vouchers</span>
                          <span className="text-base sm:text-lg font-extrabold text-foreground">{studentFees.length} Challans</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-0.5">
                          <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Total Billed</span>
                          <span className="text-base sm:text-lg font-extrabold text-foreground">{formatCurrency(totalBilled)}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-0.5">
                          <span className="text-[10px] text-emerald-600 block font-bold uppercase tracking-wider">Cleared ({paidCount})</span>
                          <span className="text-base sm:text-lg font-extrabold text-emerald-600">{formatCurrency(totalPaid)}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-0.5">
                          <span className="text-[10px] text-amber-600 block font-bold uppercase tracking-wider">Outstanding Due</span>
                          <span className="text-base sm:text-lg font-extrabold text-amber-600">{formatCurrency(totalPending)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Vouchers List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Receipt className="h-4 w-4 text-seneca-crimson" />
                        <span>Issued Challan Vouchers ({studentFees.length})</span>
                      </span>
                      <Button
                        onClick={() => handleOpenVoucherModal(selectedStudent)}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 rounded-xl text-[10px] font-bold gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Issue New Challan</span>
                      </Button>
                    </div>

                    {loadingStudentFees ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <span className="text-[11px] font-bold">Loading fee ledger...</span>
                      </div>
                    ) : studentFees.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-border text-center space-y-2 bg-muted/20">
                        <Receipt className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                        <p className="text-xs font-bold text-foreground">No Fee Vouchers Issued Yet</p>
                        <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                          Generate a professional fee challan voucher for {selectedStudent.name} with custom tuition and concessions.
                        </p>
                        <Button
                          onClick={() => handleOpenVoucherModal(selectedStudent)}
                          size="sm"
                          variant="glow"
                          className="rounded-xl text-xs font-bold gap-1.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Issue First Fee Voucher</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {studentFees.map((fee) => (
                          <div
                            key={fee.id}
                            className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-seneca-crimson text-xs">{fee.voucherNumber}</span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] font-bold uppercase",
                                    fee.status === "paid" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                                    fee.status === "pending" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                                    fee.status === "overdue" && "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                  )}
                                >
                                  {fee.status}
                                </Badge>
                              </div>
                              <div className="text-xs font-bold text-foreground flex flex-wrap items-center gap-2">
                                <span>Period: {fee.month}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground font-normal">
                                  Due: {fee.formattedDueDate || new Date(fee.dueDate).toLocaleDateString("en-PK")}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground flex flex-wrap items-center gap-2 pt-0.5">
                                <span>Tuition: {formatCurrency(fee.tuitionFee)}</span>
                                {fee.discount > 0 && (
                                  <span className="text-emerald-600 font-bold">Discount: -{formatCurrency(fee.discount)}</span>
                                )}
                                {fee.admissionFee > 0 && <span>Admission: {formatCurrency(fee.admissionFee)}</span>}
                                {fee.examFee > 0 && <span>Exam: {formatCurrency(fee.examFee)}</span>}
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                              <div className="text-right">
                                <span className="text-[9px] text-muted-foreground block font-bold uppercase">Net Payable</span>
                                <span className="text-sm font-extrabold text-seneca-crimson dark:text-seneca-amber-light">
                                  {formatCurrency(fee.totalAmount)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Button
                                  onClick={() => setCreatedVoucherPreview(fee)}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2.5 rounded-lg text-[10px] font-bold gap-1 border-seneca-crimson/30 text-seneca-crimson hover:bg-seneca-crimson/10"
                                  title="View & Print Challan"
                                >
                                  <Printer className="h-3 w-3" />
                                  <span>Print / Slip</span>
                                </Button>
                                <Button
                                  onClick={() => handleCopyVoucherText(fee)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 rounded-lg text-[10px] font-bold gap-1 text-muted-foreground hover:text-foreground"
                                  title="Copy Summary for WhatsApp"
                                >
                                  <Share2 className="h-3 w-3" />
                                  <span>Share</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: DOCUMENTS & ARCHIVES */}
              {dossierActiveTab === "documents" && (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <FileCheck className="h-4 w-4 text-seneca-crimson" />
                        <span>Document Verification &amp; Clearance File</span>
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold capitalize",
                          selectedStudent.documents?.verificationStatus === "verified"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        )}
                      >
                        {selectedStudent.documents?.verificationStatus || "Pending Verification"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { label: "Student B-Form", ok: selectedStudent.documents?.bFormSubmitted },
                        { label: "Father CNIC", ok: selectedStudent.documents?.fatherCnicSubmitted },
                        { label: "4x Passport Photos", ok: selectedStudent.documents?.photosSubmitted },
                        { label: "Leaving Certificate", ok: selectedStudent.documents?.slcSubmitted },
                      ].map((doc, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-2.5 rounded-xl border flex items-center gap-2",
                            doc.ok ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-600 font-bold" : "bg-card/60 border-border/50 text-muted-foreground font-medium"
                          )}
                        >
                          <span className={cn("h-4 w-4 rounded-md flex items-center justify-center text-[10px]", doc.ok ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground")}>
                            {doc.ok ? "✓" : "○"}
                          </span>
                          <span className="truncate">{doc.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Uploaded File Previews inside Dossier */}
                    {selectedStudent.documents?.documentFiles &&
                      Object.keys(selectedStudent.documents.documentFiles).length > 0 && (
                        <div className="pt-2 border-t border-border/60 space-y-2">
                          <span className="text-xs font-bold text-foreground block">
                            Attached Official Scans &amp; Media:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {Object.entries(selectedStudent.documents.documentFiles).map(([key, val]: any) => {
                              const fileUrl = typeof val === "string" ? val : val?.fileUrl;
                              const fileName = typeof val === "string" ? key : val?.fileName || key;
                              if (!fileUrl) return null;
                              return (
                                <div
                                  key={key}
                                  onClick={() =>
                                    setPreviewDocModal({
                                      url: fileUrl,
                                      title: fileName,
                                    })
                                  }
                                  className="p-2.5 rounded-xl bg-card border border-border/80 hover:border-seneca-crimson/50 cursor-pointer flex items-center justify-between gap-2.5 transition-all shadow-sm group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {fileUrl.startsWith("data:image") ? (
                                      <img
                                        src={fileUrl}
                                        alt={fileName}
                                        className="h-9 w-9 rounded-lg object-cover border shrink-0"
                                      />
                                    ) : (
                                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-foreground group-hover:text-seneca-crimson truncate block">{fileName}</span>
                                      <span className="text-[10px] text-muted-foreground">Click to view full scan</span>
                                    </div>
                                  </div>
                                  <Eye className="h-4 w-4 text-seneca-crimson shrink-0 group-hover:scale-110 transition-transform" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Executive Fixed Footer */}
            <div className="p-3 sm:p-4 border-t border-border/60 bg-card flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleOpenVoucherModal(selectedStudent)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 justify-center"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Issue Voucher</span>
                </Button>
                <Button
                  onClick={() => {
                    const s = selectedStudent;
                    setSelectedStudent(null);
                    handleOpenPromoteModal(s);
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 text-seneca-crimson border-seneca-crimson/30 hover:bg-seneca-crimson/10 justify-center"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Promote</span>
                </Button>
              </div>

              <Button
                onClick={() => setSelectedStudent(null)}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold justify-center"
              >
                Close Dossier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 7. Professional Fee Voucher Generation Dialog */}
      <Dialog open={voucherModalOpen} onOpenChange={setVoucherModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-border/80 bg-card">
          <div className="p-4 sm:p-6 pb-3 border-b border-border/60 bg-card/95 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <Receipt className="h-4 w-4 shrink-0" />
                <span>Accounts & Finance Division</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                Fee Challan Generator
              </Badge>
            </div>

            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              Issue Official Fee Voucher
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure billing cycle, tuition fees, assessment charges, and scholarships for this student.
            </DialogDescription>

            {/* Selected Student Banner */}
            {voucherStudent && (
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {((voucherStudent.name || "Student").charAt(0) || "S").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-foreground truncate block">{voucherStudent.name || "Student"}</span>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      {voucherStudent.admissionNumber} • {voucherStudent.className} ({voucherStudent.section})
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold text-seneca-amber border-seneca-amber/30 shrink-0">
                  {voucherStudent.feeCategory || "Standard"}
                </Badge>
              </div>
            )}
          </div>

          <form onSubmit={handleGenerateFeeVoucher} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            {/* Billing Period & Suggestions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Billing Period / Month <span className="text-seneca-crimson">*</span></span>
                <span className="text-[10px] text-muted-foreground font-normal">e.g. September 2026</span>
              </label>
              <Input
                required
                type="text"
                value={voucherMonth}
                onChange={(e) => setVoucherMonth(e.target.value)}
                placeholder="e.g. September 2026"
                className="h-10 rounded-xl text-xs bg-background"
              />
              <div className="flex flex-wrap items-center gap-1 pt-1">
                {(() => {
                  const now = new Date();
                  const thisMonth = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                  const nextMonth = nextMonthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  return [thisMonth, nextMonth, "1st Term Assessment 2026", "2nd Term 2026"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setVoucherMonth(m)}
                      className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-all",
                        voucherMonth === m
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/40 font-bold"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      {m}
                    </button>
                  ));
                })()}
              </div>
            </div>

            {/* Fee Breakdown Inputs */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Fee Items Breakdown (PKR)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Tuition Fee</label>
                  <Input
                    required
                    type="number"
                    value={voucherTuition}
                    onChange={(e) => setVoucherTuition(e.target.value)}
                    placeholder="12000"
                    className="h-9 rounded-xl text-xs bg-background font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Admission Fee</label>
                  <Input
                    type="number"
                    value={voucherAdmission}
                    onChange={(e) => setVoucherAdmission(e.target.value)}
                    placeholder="0"
                    className="h-9 rounded-xl text-xs bg-background font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Exam / Assessment</label>
                  <Input
                    type="number"
                    value={voucherExam}
                    onChange={(e) => setVoucherExam(e.target.value)}
                    placeholder="0"
                    className="h-9 rounded-xl text-xs bg-background font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Lab & Other Charges</label>
                  <Input
                    type="number"
                    value={voucherOtherCharges}
                    onChange={(e) => setVoucherOtherCharges(e.target.value)}
                    placeholder="500"
                    className="h-9 rounded-xl text-xs bg-background font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-emerald-600 flex items-center justify-between">
                    <span>Concession / Waiver</span>
                  </label>
                  <Input
                    type="number"
                    value={voucherDiscount}
                    onChange={(e) => setVoucherDiscount(e.target.value)}
                    placeholder="0"
                    className="h-9 rounded-xl text-xs bg-background font-mono text-emerald-600 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Late Fine / Surcharge</label>
                  <Input
                    type="number"
                    value={voucherFine}
                    onChange={(e) => setVoucherFine(e.target.value)}
                    placeholder="0"
                    className="h-9 rounded-xl text-xs bg-background font-mono"
                  />
                </div>
              </div>

              {/* Quick Concession Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">Quick Concession:</span>
                {[
                  { label: "0% (Full)", pct: 0 },
                  { label: "20% (Sibling)", pct: 0.2 },
                  { label: "50% (Merit)", pct: 0.5 },
                  { label: "100% (Scholarship)", pct: 1 },
                ].map((item) => {
                  const t = Number(voucherTuition) || 0;
                  const val = Math.round(t * item.pct);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setVoucherDiscount(String(val))}
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-muted hover:bg-emerald-500/10 hover:text-emerald-600 border border-border transition-all"
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Fee Due Date <span className="text-seneca-crimson">*</span>
                </label>
                <Input
                  required
                  type="date"
                  value={voucherDueDate}
                  onChange={(e) => setVoucherDueDate(e.target.value)}
                  className="h-10 rounded-xl text-xs bg-background"
                />
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setVoucherDueDate(d.toISOString().split("T")[0]);
                    }}
                    className="text-[9px] px-2 py-0.5 rounded bg-muted/60 hover:bg-muted font-medium"
                  >
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 15);
                      setVoucherDueDate(d.toISOString().split("T")[0]);
                    }}
                    className="text-[9px] px-2 py-0.5 rounded bg-muted/60 hover:bg-muted font-medium"
                  >
                    +15 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                      setVoucherDueDate(lastDay.toISOString().split("T")[0]);
                    }}
                    className="text-[9px] px-2 py-0.5 rounded bg-muted/60 hover:bg-muted font-medium"
                  >
                    End of Month
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Initial Status</label>
                <select
                  value={voucherStatus}
                  onChange={(e) => setVoucherStatus(e.target.value as any)}
                  className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground"
                >
                  <option value="pending">Pending Payment (Unpaid)</option>
                  <option value="paid">Paid (Mark Cleared / Direct Cash)</option>
                  <option value="partial">Partial Payment</option>
                </select>
                <span className="text-[10px] text-muted-foreground block">
                  Select Pending to issue unpaid bank challan.
                </span>
              </div>
            </div>

            {/* Real-Time Total Calculation Summary */}
            {(() => {
              const t = Number(voucherTuition) || 0;
              const a = Number(voucherAdmission) || 0;
              const e = Number(voucherExam) || 0;
              const o = Number(voucherOtherCharges) || 0;
              const f = Number(voucherFine) || 0;
              const d = Number(voucherDiscount) || 0;
              const gross = t + a + e + o + f;
              const net = Math.max(0, gross - d);

              return (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-background to-background border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Gross Total Charges:</span>
                    <span>{formatCurrency(gross)}</span>
                  </div>
                  {d > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-600 font-bold">
                      <span>Fee Waiver / Concession:</span>
                      <span>-{formatCurrency(d)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-sm font-extrabold text-foreground">
                    <span>Net Payable Amount:</span>
                    <span className="text-seneca-crimson dark:text-seneca-amber-light text-base font-mono">
                      {formatCurrency(net)}
                    </span>
                  </div>
                </div>
              );
            })()}

            <DialogFooter className="pt-3 border-t border-border/60 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVoucherModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingVoucher}
                variant="glow"
                className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submittingVoucher ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Challan...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4" />
                    <span>Generate & Issue Challan</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. Official 3-Part Bank Challan Slip & Printable Modal */}
      {createdVoucherPreview && (
        <Dialog open={!!createdVoucherPreview} onOpenChange={() => setCreatedVoucherPreview(null)}>
          <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-3 sm:p-6 space-y-4 my-2 sm:my-4 shadow-2xl border border-border/80 bg-card">
            <DialogHeader className="border-b border-border/60 pb-3 no-print">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-sm sm:text-base font-bold text-foreground truncate">
                      Fee Challan Voucher #{createdVoucherPreview.voucherNumber}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      {createdVoucherPreview.studentName} • {createdVoucherPreview.className} • Billing: {createdVoucherPreview.month}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={handlePrintChallan}
                    variant="glow"
                    size="sm"
                    className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-sm justify-center"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print PDF</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleCopyVoucherText(createdVoucherPreview)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 justify-center"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Print Container: 3 Slips (School Copy, Bank Copy, Student Copy) */}
            <div id="printable-challan-section" className="space-y-4">
              <style jsx global>{`
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #printable-challan-section,
                  #printable-challan-section * {
                    visibility: visible !important;
                  }
                  #printable-challan-section {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100vw !important;
                    height: auto !important;
                    margin: 0 !important;
                    padding: 12px !important;
                    background: white !important;
                    color: black !important;
                    z-index: 999999 !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                  @page {
                    size: A4 landscape;
                    margin: 8mm;
                  }
                }
              `}</style>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {["BANK COPY", "SCHOOL COPY", "STUDENT / PARENT COPY"].map((copyTitle, idx) => (
                  <div
                    key={copyTitle}
                    className="p-3.5 rounded-xl border border-border/80 bg-background space-y-2.5 text-[11px] font-sans flex flex-col justify-between"
                  >
                    {/* Slip Header */}
                    <div className="text-center border-b border-border pb-2 space-y-0.5">
                      <div className="inline-block font-extrabold text-xs tracking-tight text-foreground font-serif uppercase">
                        SENECA ACADEMY
                      </div>
                      <p className="text-[8px] text-muted-foreground leading-tight">
                        Excellence in Education • Cambridge & Matric Campus
                      </p>
                      <div className="pt-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-muted text-[8px] font-bold uppercase tracking-wider text-foreground border border-border">
                          {copyTitle}
                        </span>
                      </div>
                    </div>

                    {/* Bank & Voucher Meta */}
                    {(() => {
                      const activeBanks = bankAccounts.filter((b: any) => b.isActive !== false);
                      const primaryBank =
                        activeBanks.find((b: any) => b.isPrimary) ||
                        activeBanks[0] || {
                          bankName: "Habib Bank Limited (HBL)",
                          accountTitle: "Seneca Academy (Pvt) Ltd",
                          accountNumber: "0148-2839102-01",
                          iban: "PK36HABB0001482839102001",
                          routingCode: "1Link ID: 100928",
                        };

                      return (
                        <div className="space-y-1 text-[9px] bg-muted/30 p-2 rounded-lg border border-border/50">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Challan No:</span>
                            <span className="font-mono font-bold text-foreground">{createdVoucherPreview.voucherNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Billing Month:</span>
                            <span className="font-bold text-foreground">{createdVoucherPreview.month}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Due Date:</span>
                            <span className="font-bold text-seneca-crimson font-mono">{createdVoucherPreview.formattedDueDate || new Date(createdVoucherPreview.dueDate).toLocaleDateString("en-PK")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bank A/C:</span>
                            <span className="font-mono font-bold text-foreground truncate max-w-[140px]">
                              {primaryBank.bankName.split(" ")[0]}: {primaryBank.accountNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Title / 1Link:</span>
                            <span className="font-semibold text-[8px] text-foreground truncate max-w-[140px]">
                              {primaryBank.accountTitle} {primaryBank.routingCode ? `(${primaryBank.routingCode})` : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Student Info */}
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Student Name:</span>
                        <span className="font-bold text-foreground truncate max-w-[130px]">{createdVoucherPreview.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Admission ID:</span>
                        <span className="font-mono font-bold text-foreground">{createdVoucherPreview.admissionNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roll No / Class:</span>
                        <span className="font-bold text-foreground">{createdVoucherPreview.rollNumber} • {createdVoucherPreview.className}</span>
                      </div>
                    </div>

                    {/* Fee Table */}
                    <div className="border border-border rounded-lg overflow-hidden text-[9px]">
                      <table className="w-full">
                        <thead className="bg-muted text-muted-foreground font-bold border-b border-border">
                          <tr>
                            <th className="py-1 px-1.5 text-left">Particulars</th>
                            <th className="py-1 px-1.5 text-right">Amount (PKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          <tr>
                            <td className="py-1 px-1.5">Tuition Fee</td>
                            <td className="py-1 px-1.5 text-right font-mono">{formatCurrency(createdVoucherPreview.tuitionFee)}</td>
                          </tr>
                          {createdVoucherPreview.admissionFee > 0 && (
                            <tr>
                              <td className="py-1 px-1.5">Admission Fee</td>
                              <td className="py-1 px-1.5 text-right font-mono">{formatCurrency(createdVoucherPreview.admissionFee)}</td>
                            </tr>
                          )}
                          {createdVoucherPreview.securityFee && createdVoucherPreview.securityFee > 0 && (
                            <tr className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              <td className="py-1 px-1.5">Security Fee (Refundable)</td>
                              <td className="py-1 px-1.5 text-right font-mono">{formatCurrency(createdVoucherPreview.securityFee)}</td>
                            </tr>
                          )}
                          {createdVoucherPreview.examFee > 0 && (
                            <tr>
                              <td className="py-1 px-1.5">Exam / Assessment</td>
                              <td className="py-1 px-1.5 text-right font-mono">{formatCurrency(createdVoucherPreview.examFee)}</td>
                            </tr>
                          )}
                          {createdVoucherPreview.otherCharges > 0 && (
                            <tr>
                              <td className="py-1 px-1.5">Lab / Other Charges</td>
                              <td className="py-1 px-1.5 text-right font-mono">{formatCurrency(createdVoucherPreview.otherCharges)}</td>
                            </tr>
                          )}
                          {createdVoucherPreview.discount > 0 && (
                            <tr className="text-emerald-600 font-bold">
                              <td className="py-1 px-1.5">Scholarship Waiver</td>
                              <td className="py-1 px-1.5 text-right font-mono">-{formatCurrency(createdVoucherPreview.discount)}</td>
                            </tr>
                          )}
                          <tr className="bg-muted/40 font-extrabold text-foreground">
                            <td className="py-1.5 px-1.5">Payable by Due Date</td>
                            <td className="py-1.5 px-1.5 text-right text-seneca-crimson font-mono text-[10px]">
                              {formatCurrency(createdVoucherPreview.totalAmount)}
                            </td>
                          </tr>
                          <tr className="text-[8px] text-muted-foreground">
                            <td className="py-1 px-1.5">After Due Date (+Rs.500)</td>
                            <td className="py-1 px-1.5 text-right font-mono">
                              {formatCurrency(createdVoucherPreview.totalAmount + 500)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Instructions & Signatures */}
                    <div className="pt-2 border-t border-border/60 space-y-3">
                      <p className="text-[7.5px] text-muted-foreground leading-tight text-center">
                        Note: Fee once paid is non-refundable. Please preserve this stamp slip for your records.
                      </p>
                      <div className="flex items-center justify-between text-[8px] text-muted-foreground pt-3">
                        <span className="border-t border-muted-foreground/40 pt-0.5 px-1">Officer / Stamp</span>
                        <span className="border-t border-muted-foreground/40 pt-0.5 px-1">Cashier / Teller</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 no-print flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Standard 3-part Challan Ready for Bank & School Records</span>
              </div>
              <Button
                onClick={() => setCreatedVoucherPreview(null)}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold w-full sm:w-auto"
              >
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 9. Executive Academic Promotion & Grade Progression Studio Dialog */}
      <Dialog open={promoteModalOpen} onOpenChange={setPromoteModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-border/80 bg-card">
          <div className="p-3.5 sm:p-6 pb-2.5 sm:pb-3 border-b border-border/60 bg-card/95 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>Academic Board • Grade Progression Studio</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30">
                Executive Promotion
              </Badge>
            </div>

            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              Evaluate & Promote Student
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Evaluate examination transcripts, specify advancement decisions, and officially transition student to next grade / class.
            </DialogDescription>

            {/* Selected Student Banner */}
            {promoteStudent && (
              <div className="p-2.5 sm:p-3 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shrink-0">
                    {((promoteStudent.name || "Student").charAt(0) || "S").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-foreground text-xs sm:text-sm truncate block">{promoteStudent.name || "Student"}</span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground block truncate">
                      Roll #{promoteStudent.rollNumber} • Current: <span className="font-bold text-foreground">{promoteStudent.className} ({promoteStudent.section})</span>
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] sm:text-[10px] font-bold text-seneca-crimson border-seneca-crimson/30 self-start sm:self-auto shrink-0">
                  {promoteStudent.admissionNumber}
                </Badge>
              </div>
            )}
          </div>

          <form onSubmit={handleExecutePromotion} className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 text-xs">
            {/* 1. Real-Time Exam Performance Evaluation Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-seneca-crimson/5 via-card to-seneca-amber/5 border border-seneca-crimson/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs uppercase tracking-wider text-seneca-crimson flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 shrink-0" />
                  <span>Academic Performance Evaluation & Transcript Analysis</span>
                </span>
                {loadingStudentResults && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                    <span>Analyzing DB Transcripts...</span>
                  </span>
                )}
              </div>

              {studentResultsSummary && studentResultsSummary.resultsCount > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-card border border-border/60 text-center">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Total Exams Taken</span>
                    <span className="font-bold text-xs sm:text-sm text-foreground">{studentResultsSummary.resultsCount}</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-card border border-border/60 text-center">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Average Score</span>
                    <span className="font-bold text-xs sm:text-sm text-seneca-crimson">{studentResultsSummary.avgPercentage}%</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-card border border-border/60 text-center">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Overall Grade</span>
                    <span className="font-bold text-xs sm:text-sm text-emerald-600">{studentResultsSummary.overallGrade}</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-card border border-border/60 text-center">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Cumulative GPA</span>
                    <span className="font-bold text-xs sm:text-sm text-foreground font-mono">{studentResultsSummary.calculatedGpa.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-muted/40 text-[11px] text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4 text-seneca-amber shrink-0" />
                  <span>No formal recorded exam results in current class yet. You can manually specify the final evaluation score and grade below.</span>
                </div>
              )}
            </div>

            {/* 2. Destination Class & Section Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Target Promoted Class & Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetPromoteClassId}
                  onChange={(e) => {
                    setTargetPromoteClassId(e.target.value);
                    const targetCls = dbClasses.find((c) => c.id === e.target.value);
                    if (targetCls?.stream) {
                      setTargetPromoteStream(targetCls.stream);
                    }
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-input text-xs font-medium focus:outline-none focus:ring-2 focus:ring-seneca-crimson"
                  required
                >
                  <option value="">-- Select Destination Class --</option>
                  {dbClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - Section {cls.section} {cls.stream ? `(${cls.stream})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Progression Decision / Status</label>
                <select
                  value={targetPromoteStatus}
                  onChange={(e: any) => setTargetPromoteStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-input text-xs font-medium focus:outline-none focus:ring-2 focus:ring-seneca-crimson"
                >
                  <option value="promoted">Promoted (Regular Pass Advancement)</option>
                  <option value="conditionally_promoted">Conditionally Promoted (Trial Period)</option>
                  <option value="transferred">Section / Class Transfer</option>
                  <option value="retained">Retained / Repeat Grade</option>
                  <option value="graduated">Graduated (Final School Year Complete)</option>
                </select>
              </div>
            </div>

            {/* 3. Roll Number & Academic Stream */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">New Roll Number in Destination Class</label>
                <Input
                  value={targetPromoteRollNumber}
                  onChange={(e) => setTargetPromoteRollNumber(e.target.value)}
                  placeholder="e.g. 10A-01"
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Academic Stream (Optional)</label>
                <Input
                  value={targetPromoteStream}
                  onChange={(e) => setTargetPromoteStream(e.target.value)}
                  placeholder="e.g. Pre-Medical, Pre-Engineering, ICS"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            {/* 4. Final Academic Transcript Snapshot */}
            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-2.5">
              <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">
                Academic Snapshot for Student Archive
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Final Percentage (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={targetPromotePercentage}
                    onChange={(e) => setTargetPromotePercentage(e.target.value)}
                    placeholder="e.g. 88.5"
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Overall Grade</label>
                  <Input
                    value={targetPromoteGrade}
                    onChange={(e) => setTargetPromoteGrade(e.target.value)}
                    placeholder="e.g. A+"
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Calculated GPA</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={targetPromoteGpa}
                    onChange={(e) => setTargetPromoteGpa(e.target.value)}
                    placeholder="e.g. 3.85"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 5. Principal Evaluation & Promotion Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Principal / Evaluation Commentary & Endorsement
              </label>
              <textarea
                rows={3}
                value={targetPromoteRemarks}
                onChange={(e) => setTargetPromoteRemarks(e.target.value)}
                placeholder="Enter official remarks, academic recommendations, or honors to record in the student's permanent academic journey..."
                className="w-full p-3 rounded-xl bg-background border border-input text-xs font-medium focus:outline-none focus:ring-2 focus:ring-seneca-crimson"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap no-scrollbar pb-1 pt-1">
                <span className="text-[10px] text-muted-foreground shrink-0">Quick remarks:</span>
                <button
                  type="button"
                  onClick={() =>
                    setTargetPromoteRemarks("Promoted with academic distinction. Excellent critical thinking and consistent term performance.")
                  }
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium shrink-0"
                >
                  Academic Distinction
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTargetPromoteRemarks("Satisfactorily passed all term examinations. Promoted to higher grade.")
                  }
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium shrink-0"
                >
                  Regular Pass
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTargetPromoteRemarks("Conditionally promoted on probation. Recommended for after-school academic support sessions.")
                  }
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium shrink-0"
                >
                  Conditional Advancement
                </button>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <Button
                type="button"
                onClick={() => setPromoteModalOpen(false)}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingPromotion || !targetPromoteClassId}
                size="sm"
                className="rounded-xl bg-gradient-to-r from-seneca-crimson to-seneca-amber text-white font-bold text-xs gap-1.5 shadow-md hover:opacity-90 w-full sm:w-auto justify-center"
              >
                {submittingPromotion ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing Promotion...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Officialize Promotion & Grade Change</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
        title="Archive Student Record?"
        description={`Are you sure you want to permanently remove '${studentToDelete?.name}' (${studentToDelete?.rollNumber})? This will archive their academic records.`}
        confirmText="Yes, Archive Record"
        variant="destructive"
        icon="trash"
        onConfirm={handleConfirmDeleteStudent}
      />

      {/* Bulk CSV Import Modal */}
      <CsvImportModal
        isOpen={importCsvModalOpen}
        onClose={() => setImportCsvModalOpen(false)}
        title="Bulk Student Admission & Enrollment"
        description="Upload a CSV spreadsheet to bulk enroll students across all grades. Class sections will be linked or auto-created, and portal login credentials will be securely provisioned."
        badgeLabel="Student Bulk Import"
        templateFilename="Seneca_Students_Import_Template"
        columns={STUDENT_IMPORT_COLUMNS}
        sampleData={STUDENT_SAMPLE_DATA}
        apiEndpoint="/api/students/import"
        onSuccess={() => fetchStudents()}
        entityNamePlural="students"
      />
    </div>
  );
}
