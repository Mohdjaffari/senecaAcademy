"use client";

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Home,
  FileCheck,
  ShieldCheck,
  X,
  Layers,
  Fingerprint,
  Users,
  School as SchoolIcon,
  Key,
  GraduationCap,
  Sparkles,
  Award,
  Heart,
  Clock,
  BookOpen,
  Bus,
  Check,
  FileUp,
  Trash2,
  Eye,
  FileText,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Plus,
  Printer,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  formatters,
  validators,
  REGEX_PATTERNS,
} from "@/lib/utils/student-validation";
import {
  ACADEMIC_SPECTRUM,
  STREAM_OPTIONS_BY_TIER,
  ALL_STREAM_OPTIONS,
} from "@/lib/constants/academic-spectrum";

interface AdmissionApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admissionsSession?: string;
  admissionsDeadline?: string;
  initialUserData?: {
    name?: string;
    email?: string;
    userId?: string;
  } | null;
}

const ADMISSION_TYPES = [
  { id: "Regular", label: "Regular Admission", desc: "Standard fresh academic session intake", icon: GraduationCap },
  { id: "Transfer", label: "Transfer / Migration", desc: "Joining from another school with SLC", icon: BookOpen },
  { id: "Sibling", label: "Sibling Admission", desc: "20% sibling tuition concession applied", icon: Heart },
  { id: "Scholarship", label: "Merit Scholarship", desc: "High academic / sports scholarship", icon: Award },
  { id: "Provisional", label: "Provisional Intake", desc: "Conditional admission pending result", icon: Clock },
];

const TRANSPORT_ROUTES = [
  "Self Pick & Drop (No School Transport)",
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

  if (isHigherSecondary) {
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
  }

  // Primary & Middle (Grade 1 - 8)
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
};

export function AdmissionApplyModal({
  open,
  onOpenChange,
  admissionsSession = "Session 2026–2027",
  admissionsDeadline = "",
  initialUserData,
}: AdmissionApplyModalProps) {
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [activeTab, setActiveTab] = useState<"academic" | "identity" | "parents" | "history" | "documents" | "review">("academic");

  // Existing Active Application State (Prevent duplicate submission)
  const [existingApp, setExistingApp] = useState<{
    applicationNumber: string;
    studentName: string;
    applyingForClass: string;
    status: string;
    createdAt: string;
  } | null>(null);

  // Success State after submission
  const [successData, setSuccessData] = useState<{
    applicationNumber: string;
    studentName: string;
    applyingForClass: string;
    preferredSection?: string;
  } | null>(null);

  // Preview Doc Modal
  // Preview Doc Modal
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  // Touched fields tracking for visual regex feedback
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Dynamic Options (Database-Driven with Fallbacks)
  const [admissionTypesList, setAdmissionTypesList] = useState<any[]>(ADMISSION_TYPES);
  const [transportRoutesList, setTransportRoutesList] = useState<string[]>(TRANSPORT_ROUTES);
  const [dbClasses, setDbClasses] = useState<{ id: string; name: string; gradeLevel: number; streams: string[] }[]>([]);
  const [dbGroups, setDbGroups] = useState<{ name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // 1. Academic & Stream Particulars
  const [admissionType, setAdmissionType] = useState<string>("Regular");
  const [applyingForClass, setApplyingForClass] = useState("Grade 1");
  const [preferredSection, setPreferredSection] = useState("A");
  const [stream, setStream] = useState("General Curriculum");
  const [feeCategory, setFeeCategory] = useState("Standard");

  // 2. Candidate Identity & Demographics
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [bFormNumber, setBFormNumber] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("Karachi");
  const [nationality, setNationality] = useState("Pakistani");
  const [religion, setReligion] = useState("Islam");
  const [motherTongue, setMotherTongue] = useState("Urdu");
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  // 3. Parent & Guardian Info
  const [fatherName, setFatherName] = useState(initialUserData?.name || "");
  const [fatherCnic, setFatherCnic] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [fatherCompany, setFatherCompany] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState(initialUserData?.email || "");
  const [motherName, setMotherName] = useState("");
  const [motherCnic, setMotherCnic] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [guardianType, setGuardianType] = useState("Father");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Father");
  const [address, setAddress] = useState("");
  const [siblingInSchool, setSiblingInSchool] = useState(false);
  const [siblingRollNumber, setSiblingRollNumber] = useState("");
  const [siblingName, setSiblingName] = useState("");

  // 4. Academic History & Transport
  const [hasPreviousSchool, setHasPreviousSchool] = useState(false);
  const [previousSchool, setPreviousSchool] = useState("");
  const [lastGrade, setLastGrade] = useState("");
  const [slcNumber, setSlcNumber] = useState("");
  const [slcDate, setSlcDate] = useState("");
  const [previousBoard, setPreviousBoard] = useState("Sindh Board (BSEK)");
  const [previousMarks, setPreviousMarks] = useState("");
  const [transportRoute, setTransportRoute] = useState(TRANSPORT_ROUTES[0]);
  const [pickupPoint, setPickupPoint] = useState("");

  // 5. Document Checklist & Uploads
  const [docBForm, setDocBForm] = useState(false);
  const [docFatherCnic, setDocFatherCnic] = useState(false);
  const [docMotherCnic, setDocMotherCnic] = useState(false);
  const [docPhotos, setDocPhotos] = useState(false);
  const [docSlc, setDocSlc] = useState(false);
  const [docMarksheet, setDocMarksheet] = useState(false);
  const [docCharacterCert, setDocCharacterCert] = useState(false);
  const [docMedicalReport, setDocMedicalReport] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { fileName: string; fileSize: string; fileUrl: string; fileType: string }>>({});

  // 6. Review & Declaration
  const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);

  // Fetch Database-Driven Academic & Admissions Options
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const loadAcademicOptions = async () => {
      setLoadingOptions(true);
      try {
        const res = await fetch("/api/admissions/options", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && isMounted) {
            if (Array.isArray(data.data.classes) && data.data.classes.length > 0) {
              setDbClasses(data.data.classes);
              setApplyingForClass((prev) => {
                const match = data.data.classes.find((c: any) => c.name === prev);
                return match ? prev : data.data.classes[0].name;
              });
            }
            if (Array.isArray(data.data.groups) && data.data.groups.length > 0) {
              setDbGroups(data.data.groups);
              setStream((prev) => {
                const match = data.data.groups.find((g: any) => g.name === prev);
                return match ? prev : data.data.groups[0].name;
              });
            }
            if (Array.isArray(data.data.admissionTypes) && data.data.admissionTypes.length > 0) {
              const activeTypes = data.data.admissionTypes.filter((t: any) => t.isActive !== false);
              if (activeTypes.length > 0) {
                const iconMap: Record<string, any> = {
                  GraduationCap,
                  BookOpen,
                  Heart,
                  Award,
                  Clock,
                  Users,
                  School: SchoolIcon,
                  Sparkles,
                };
                setAdmissionTypesList(
                  activeTypes.map((t: any) => ({
                    id: t.name || t.id,
                    label: t.label || t.name || t.id,
                    desc: t.desc || "",
                    icon: (t.icon && iconMap[t.icon]) ? iconMap[t.icon] : GraduationCap,
                    concessionTag: t.concessionTag,
                  }))
                );
              }
            }
            if (Array.isArray(data.data.transportRoutes) && data.data.transportRoutes.length > 0) {
              const activeRoutes = data.data.transportRoutes
                .filter((r: any) => r.isActive !== false)
                .map((r: any) =>
                  typeof r === "string"
                    ? r
                    : `${r.name || r.code || "Route"}: ${r.description || (r.areasCovered || []).join(" • ")}`
                );
              if (activeRoutes.length > 0) {
                setTransportRoutesList(activeRoutes);
                setTransportRoute((prev) => (activeRoutes.includes(prev) ? prev : activeRoutes[0]));
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load database academic options:", err);
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    };

    loadAcademicOptions();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Check if user already submitted an admission application
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const checkActiveApplication = async () => {
      setCheckingExisting(true);
      try {
        const res = await fetch("/api/admissions/my-status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            if (data.data?.hasActiveApplication && data.data?.activeApplication) {
              setExistingApp(data.data.activeApplication);
            } else {
              setExistingApp(null);
            }
          }
        }
      } catch (err) {
        console.error("Failed to check active application status:", err);
      } finally {
        if (isMounted) setCheckingExisting(false);
      }
    };

    checkActiveApplication();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Pre-fill user data if provided
  useEffect(() => {
    if (initialUserData?.email && !parentEmail) {
      setParentEmail(initialUserData.email);
    }
  }, [initialUserData, parentEmail]);

  // Helper to mark field as touched
  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Live Age Calculation from DOB
  const calculateAgeDetails = (dobString: string) => {
    if (!dobString) return null;
    const birth = new Date(dobString);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    return { years, months, text: `${years} Years, ${months} Months` };
  };

  const ageDetails = calculateAgeDetails(dateOfBirth);

  // Real-time Regex Validations
  const validation = {
    name: validators.name(name, true, "Student Full Name"),
    dob: validators.dateOfBirth(dateOfBirth),
    bForm: validators.cnic(bFormNumber, false, "Student B-Form"),
    fatherName: validators.name(fatherName, true, "Father / Guardian Name"),
    fatherCnic: validators.cnic(fatherCnic, false, "Father CNIC"),
    parentPhone: validators.phone(parentPhone, true, "Parent Phone Number"),
    parentEmail: validators.email(parentEmail, true, "Parent Email"),
    emergencyContact: validators.phone(emergencyContact || parentPhone, true, "Emergency Contact"),
    address: validators.address(address),
  };

  // Step Validation Checkers
  const isStepValid = (step: "academic" | "identity" | "parents" | "history" | "documents" | "review") => {
    switch (step) {
      case "academic":
        return Boolean(applyingForClass && admissionType);
      case "identity":
        return validation.name.isValid && validation.dob.isValid && Boolean(gender);
      case "parents":
        return (
          validation.fatherName.isValid &&
          validation.parentPhone.isValid &&
          validation.parentEmail.isValid &&
          validation.address.isValid
        );
      case "history":
        if (admissionType === "Transfer" || hasPreviousSchool) {
          return Boolean(previousSchool.trim());
        }
        return true;
      case "documents":
        return docBForm || docFatherCnic || docPhotos || Object.keys(uploadedFiles).length > 0;
      case "review":
        return agreedToDeclaration;
      default:
        return false;
    }
  };

  // File Upload Handler (Base64 encoding for immediate preview & transmission)
  const handleFileUpload = (docId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Exceeds Size Limit", {
        description: "Maximum allowed file size is 5 MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      setUploadedFiles((prev) => ({
        ...prev,
        [docId]: {
          fileName: file.name,
          fileSize: sizeStr,
          fileUrl: result,
          fileType: file.type,
        },
      }));

      // Auto-check the respective checklist item
      if (docId === "bForm") setDocBForm(true);
      if (docId === "fatherCnic") setDocFatherCnic(true);
      if (docId === "motherCnic") setDocMotherCnic(true);
      if (docId === "photos") setDocPhotos(true);
      if (docId === "slc") setDocSlc(true);
      if (docId === "marksheet") setDocMarksheet(true);
      if (docId === "characterCert") setDocCharacterCert(true);
      if (docId === "medicalReport") setDocMedicalReport(true);

      toast.success("Document Attached Successfully", {
        description: `${file.name} (${sizeStr}) uploaded.`,
      });
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (docId: string) => {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  // Form Submit Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      name: true,
      dob: true,
      bForm: true,
      fatherName: true,
      fatherCnic: true,
      parentPhone: true,
      parentEmail: true,
      emergencyContact: true,
      address: true,
    });

    if (!isStepValid("identity")) {
      setActiveTab("identity");
      toast.error("Please provide valid candidate particulars.");
      return;
    }

    if (!isStepValid("parents")) {
      setActiveTab("parents");
      toast.error("Please complete the required parent and contact information.");
      return;
    }

    if (!agreedToDeclaration) {
      setActiveTab("review");
      toast.error("Parent Declaration Required", {
        description: "Please check the declaration box before submitting.",
      });
      return;
    }

    setLoading(true);

    const isNoTransport =
      transportRoute === transportRoutesList[0] ||
      transportRoute === TRANSPORT_ROUTES[0] ||
      transportRoute.toLowerCase().includes("self pick");
    const transportReq = !isNoTransport;

    const payload = {
      name: name.trim(),
      admissionType,
      applyingForClass,
      preferredSection,
      stream,
      feeCategory,
      gender,
      dateOfBirth,
      bloodGroup,
      bFormNumber: bFormNumber.trim(),
      placeOfBirth: placeOfBirth.trim(),
      nationality: nationality.trim(),
      religion: religion.trim(),
      motherTongue: motherTongue.trim(),
      medicalInfo: {
        allergies: allergies.trim(),
        conditions: medicalNotes.trim(),
        emergencyNotes: medicalNotes.trim(),
      },
      fatherName: fatherName.trim(),
      fatherCnic: fatherCnic.trim(),
      fatherOccupation: fatherOccupation.trim(),
      fatherCompany: fatherCompany.trim(),
      motherName: motherName.trim(),
      motherCnic: motherCnic.trim(),
      motherOccupation: motherOccupation.trim(),
      motherPhone: motherPhone.trim(),
      guardianType,
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim().toLowerCase(),
      emergencyContact: (emergencyContact || parentPhone).trim(),
      emergencyContactName: (emergencyContactName || fatherName).trim(),
      emergencyRelation,
      siblingInSchool,
      siblingRollNumber: siblingRollNumber.trim(),
      siblingName: siblingName.trim(),
      address: address.trim(),
      previousSchool: (admissionType === "Transfer" || hasPreviousSchool) ? previousSchool.trim() : "",
      previousMarksOrGrade: previousMarks.trim(),
      slcNumber: slcNumber.trim(),
      previousSchoolDetails: (admissionType === "Transfer" || hasPreviousSchool) ? {
        schoolName: previousSchool.trim(),
        lastGrade: lastGrade.trim(),
        slcNumber: slcNumber.trim(),
        slcDate: slcDate || undefined,
        board: previousBoard,
        marksPercentage: previousMarks.trim(),
      } : undefined,
      transportRequired: transportReq,
      transportRoute: transportReq ? transportRoute : "",
      pickupPoint: transportReq ? pickupPoint.trim() : "",
      documentsChecklist: {
        bForm: docBForm,
        fatherCnic: docFatherCnic,
        motherCnic: docMotherCnic,
        photos: docPhotos,
        slc: docSlc,
        marksheet: docMarksheet,
        characterCert: docCharacterCert,
        medicalReport: docMedicalReport,
      },
      documentFiles: uploadedFiles,
    };

    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to submit admission application.");
      }

      setSuccessData(data.data);
      toast.success("Application Submitted Successfully!", {
        description: `Reference Number: ${data.data.applicationNumber}`,
      });
    } catch (err: any) {
      toast.error("Submission Failed", {
        description: err.message || "Please verify your details and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[96vw] sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-border/80 bg-card">
          {/* Header */}
          <div className="p-3.5 sm:p-6 pb-2.5 sm:pb-3 border-b border-border/60 bg-card/95 backdrop-blur-md space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>Online Admission Dossier</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30">
                {admissionsSession}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
              <DialogTitle className="text-base sm:text-xl font-extrabold font-heading text-foreground">
                Apply for Admission <span className="text-seneca-crimson font-normal text-xs sm:text-sm font-sans">(Playgroup to 2nd Year)</span>
              </DialogTitle>
              {!existingApp && !successData && (
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">
                  Step {["academic", "identity", "parents", "history", "documents", "review"].indexOf(activeTab) + 1} of 6:{" "}
                  <span className="text-seneca-crimson">
                    {activeTab === "academic" && "Academic Level"}
                    {activeTab === "identity" && "Candidate Demographics"}
                    {activeTab === "parents" && "Parents & Guardians"}
                    {activeTab === "history" && "History & School Van"}
                    {activeTab === "documents" && "Document Checklist"}
                    {activeTab === "review" && "Summary & Confirmation"}
                  </span>
                </span>
              )}
            </div>

            {/* Stepper Progress & Tab Buttons */}
            {!existingApp && !successData && (
              <>
                <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-seneca-crimson to-seneca-amber h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${((["academic", "identity", "parents", "history", "documents", "review"].indexOf(activeTab) + 1) / 6) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 no-scrollbar -mx-1 px-1">
                  {[
                    { id: "academic", label: "1. Academic", icon: Layers },
                    { id: "identity", label: "2. Demographics", icon: Fingerprint },
                    { id: "parents", label: "3. Parents", icon: Users },
                    { id: "history", label: "4. History & Van", icon: SchoolIcon },
                    { id: "documents", label: "5. Documents", icon: FileCheck },
                    { id: "review", label: "6. Review & Send", icon: Key },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isValid = isStepValid(tab.id as any);
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap border shrink-0",
                          isActive
                            ? "bg-seneca-crimson text-white border-seneca-crimson shadow-md shadow-seneca-crimson/20"
                            : isValid
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15"
                            : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        <span>{tab.label}</span>
                        {isValid && !isActive && <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Body Content */}
          {checkingExisting ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson" />
              <p className="text-xs font-bold text-muted-foreground">Checking Applicant Records...</p>
            </div>
          ) : existingApp ? (
            /* EXISTING ACTIVE APPLICATION DETECTED */
            <div className="p-6 sm:p-8 text-center space-y-5 flex-1 overflow-y-auto">
              <div className="h-16 w-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
                <FileCheck className="h-8 w-8" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold uppercase text-xs">
                  Active Application on File
                </Badge>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                  You Have Already Applied
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  An active admission application for <strong className="text-foreground">{existingApp.studentName}</strong> (Applying for <strong className="text-foreground">{existingApp.applyingForClass}</strong>) is currently registered under your account.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border max-w-sm mx-auto space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Application Ref:</span>
                  <span className="font-mono font-extrabold text-seneca-crimson">{existingApp.applicationNumber}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge variant="outline" className="text-[10px] font-bold capitalize bg-blue-500/10 text-blue-600 border-blue-500/30">
                    {existingApp.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-seneca-crimson/5 border border-seneca-crimson/20 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                To prevent duplicate admissions dossiers, each applicant account is restricted to <strong>one active submission</strong>. You may track assessment schedules or contact the Admissions Desk if you need to modify information.
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button asChild variant="glow" className="rounded-2xl text-xs font-bold gap-1.5 px-6">
                  <Link href="/admissions/status" onClick={handleClose}>
                    <FileText className="h-4 w-4" />
                    <span>Track Live Status</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl text-xs font-bold gap-1.5 px-5">
                  <Link href="/contact" onClick={handleClose}>
                    <Phone className="h-4 w-4" />
                    <span>Contact Admissions Helpdesk</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : successData ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="p-6 sm:p-8 text-center space-y-5 flex-1 overflow-y-auto">
              <div className="h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-8 w-8 animate-bounce" />
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-none font-bold uppercase text-xs">
                  Application Successfully Transmitted
                </Badge>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                  Candidate Dossier Registered!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your admission request for <strong className="text-foreground">{successData.studentName}</strong> ({successData.applyingForClass}) has been submitted to the Seneca Registrar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/50 border border-border max-w-sm mx-auto space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Official Application Tracking ID
                </span>
                <div className="font-mono text-xl font-extrabold text-seneca-crimson dark:text-seneca-amber-light">
                  {successData.applicationNumber}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-seneca-amber/10 border border-seneca-amber/30 max-w-md mx-auto text-left space-y-1.5 text-xs text-muted-foreground">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-seneca-amber" />
                  <span>Next Steps: Saturday Diagnostic Assessment</span>
                </div>
                <p>
                  Diagnostic assessments are held every Saturday from <strong>09:00 AM to 01:00 PM</strong> at our Soldier Bazar campus. Our admissions team will contact your registered WhatsApp number to confirm your exact time slot.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button asChild variant="glow" className="rounded-2xl text-xs font-bold gap-1.5 px-6">
                  <Link href="/admissions/status" onClick={handleClose}>
                    <FileText className="h-4 w-4" />
                    <span>View Application Tracker</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button onClick={handleClose} variant="outline" className="rounded-2xl text-xs font-bold px-6">
                  Done &amp; Close
                </Button>
              </div>
            </div>
          ) : (
            /* 6-STEP FORM WIZARD */
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
              <div className="p-3.5 sm:p-6 space-y-4">
                {/* TAB 1: ACADEMIC ALLOCATION */}
                {activeTab === "academic" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    {/* Admission Type Selection Cards */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1">
                        <span>Admission Type Category</span>
                        <span className="text-seneca-crimson">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {admissionTypesList.map((type) => {
                          const isSelected = admissionType === type.id;
                          const Icon = type.icon || GraduationCap;
                          return (
                            <div
                              key={type.id}
                              onClick={() => {
                                setAdmissionType(type.id);
                                if (type.id === "Transfer") setHasPreviousSchool(true);
                              }}
                              className={cn(
                                "p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition-all space-y-1",
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
                              {type.concessionTag && (
                                <Badge variant="outline" className="text-[9px] font-bold text-seneca-crimson border-seneca-crimson/30 mt-0.5">
                                  {type.concessionTag}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Class / Grade Selection & Academic Group (Database-Driven) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground flex items-center justify-between">
                          <span>
                            Applying For Class / Grade <span className="text-seneca-crimson">*</span>
                          </span>
                          {loadingOptions && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-normal">
                              <Loader2 className="h-3 w-3 animate-spin text-seneca-crimson" /> Syncing DB
                            </span>
                          )}
                        </label>
                        <select
                          value={applyingForClass}
                          onChange={(e) => {
                            const nextClass = e.target.value;
                            setApplyingForClass(nextClass);
                            const found = dbClasses.find((c) => c.name === nextClass);
                            if (found?.streams && found.streams.length > 0) {
                              setStream(found.streams[0]);
                            }
                          }}
                          className="h-11 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 shadow-sm transition-all cursor-pointer"
                        >
                          {dbClasses.length > 0 ? (
                            dbClasses.map((cls) => (
                              <option key={cls.id || cls.name} value={cls.name}>
                                {cls.name}
                              </option>
                            ))
                          ) : (
                            <option value="Grade 1">Grade 1</option>
                          )}
                        </select>
                        <p className="text-[10px] text-muted-foreground">
                          Official classes configured by Seneca Administration.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground flex items-center justify-between">
                          <span>
                            Academic Group <span className="text-seneca-crimson">*</span>
                          </span>
                          {loadingOptions && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-normal">
                              <Loader2 className="h-3 w-3 animate-spin text-seneca-crimson" /> Syncing DB
                            </span>
                          )}
                        </label>
                        <select
                          value={stream}
                          onChange={(e) => setStream(e.target.value)}
                          className="h-11 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:ring-2 focus:ring-seneca-crimson/30 shadow-sm transition-all cursor-pointer"
                        >
                          {(() => {
                            const selectedClassObj = dbClasses.find((c) => c.name === applyingForClass);
                            const classStreams =
                              selectedClassObj?.streams && selectedClassObj.streams.length > 0
                                ? selectedClassObj.streams
                                : dbGroups.map((g) => g.name);

                            if (classStreams.length > 0) {
                              return classStreams.map((grp) => (
                                <option key={grp} value={grp}>
                                  {grp}
                                </option>
                              ));
                            }
                            return <option value="General Curriculum">General Curriculum</option>;
                          })()}
                        </select>
                        <p className="text-[10px] text-muted-foreground">
                          Curriculum track & department stream.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CANDIDATE IDENTITY & DEMOGRAPHICS */}
                {activeTab === "identity" && (
                  <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Candidate Full Name <span className="text-seneca-crimson">*</span>
                          </label>
                          {name && validation.name.isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Valid Name
                            </span>
                          )}
                        </div>
                        <Input
                          required
                          placeholder="e.g. Muhammad Zayd Khan"
                          value={name}
                          onFocus={() => markTouched("name")}
                          onChange={(e) => {
                            setName(formatters.sanitizeName(e.target.value));
                            markTouched("name");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs",
                            touched.name && !validation.name.isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : name && validation.name.isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touched.name && !validation.name.isValid && (
                          <p className="text-[10px] text-rose-500 font-medium">{validation.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Date of Birth <span className="text-seneca-crimson">*</span>
                          </label>
                          {ageDetails && (
                            <Badge variant="outline" className="text-[9px] font-bold bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30">
                              Age: {ageDetails.text}
                            </Badge>
                          )}
                        </div>
                        <Input
                          required
                          type="date"
                          value={dateOfBirth}
                          onFocus={() => markTouched("dob")}
                          onChange={(e) => {
                            setDateOfBirth(e.target.value);
                            markTouched("dob");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs",
                            touched.dob && !validation.dob.isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : dateOfBirth && validation.dob.isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touched.dob && !validation.dob.isValid && (
                          <p className="text-[10px] text-rose-500 font-medium">{validation.dob.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Blood Group</label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">B-Form / CNIC #</label>
                          {bFormNumber && validation.bForm.isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> 13 Digits
                            </span>
                          )}
                        </div>
                        <Input
                          placeholder="42101-1234567-1"
                          value={bFormNumber}
                          maxLength={15}
                          onFocus={() => markTouched("bForm")}
                          onChange={(e) => {
                            setBFormNumber(formatters.formatCnic(e.target.value));
                            markTouched("bForm");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs font-mono",
                            touched.bForm && !validation.bForm.isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : bFormNumber && validation.bForm.isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touched.bForm && !validation.bForm.isValid && (
                          <p className="text-[10px] text-rose-500 font-medium">{validation.bForm.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Place of Birth</label>
                        <Input
                          placeholder="e.g. Karachi"
                          value={placeOfBirth}
                          onChange={(e) => setPlaceOfBirth(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Nationality</label>
                        <Input
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Mother Tongue</label>
                        <Input
                          value={motherTongue}
                          onChange={(e) => setMotherTongue(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                    </div>

                    {/* Medical / Care Directive */}
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span>Medical Profile & Special Physical Directives (Optional)</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Input
                          placeholder="Known Allergies (e.g. Peanuts, Dust, Penicillin)"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          className="h-9 rounded-xl text-xs bg-background"
                        />
                        <Input
                          placeholder="Special Medical Directives / Notes"
                          value={medicalNotes}
                          onChange={(e) => setMedicalNotes(e.target.value)}
                          className="h-9 rounded-xl text-xs bg-background"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: PARENTS & GUARDIANS */}
                {activeTab === "parents" && (
                  <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                    {/* Father Info */}
                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/80 space-y-2.5">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                        Father&apos;s / Primary Guardian Details
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            Father&apos;s Full Name <span className="text-seneca-crimson">*</span>
                          </label>
                          <Input
                            required
                            placeholder="e.g. Tariq Mehmood"
                            value={fatherName}
                            onFocus={() => markTouched("fatherName")}
                            onChange={(e) => {
                              setFatherName(e.target.value);
                              markTouched("fatherName");
                            }}
                            className={cn(
                              "h-10 rounded-xl text-xs",
                              touched.fatherName && !validation.fatherName.isValid
                                ? "border-rose-500 bg-rose-500/5"
                                : fatherName && validation.fatherName.isValid
                                ? "border-emerald-500/50 bg-emerald-500/5"
                                : "bg-background"
                            )}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">Father CNIC #</label>
                          <Input
                            placeholder="42101-1234567-3"
                            value={fatherCnic}
                            maxLength={15}
                            onFocus={() => markTouched("fatherCnic")}
                            onChange={(e) => {
                              setFatherCnic(formatters.formatCnic(e.target.value));
                              markTouched("fatherCnic");
                            }}
                            className={cn(
                              "h-10 rounded-xl text-xs font-mono",
                              touched.fatherCnic && !validation.fatherCnic.isValid
                                ? "border-rose-500 bg-rose-500/5"
                                : fatherCnic && validation.fatherCnic.isValid
                                ? "border-emerald-500/50 bg-emerald-500/5"
                                : "bg-background"
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">Father Occupation</label>
                          <Input
                            placeholder="e.g. Software Engineer / Business"
                            value={fatherOccupation}
                            onChange={(e) => setFatherOccupation(e.target.value)}
                            className="h-10 rounded-xl text-xs bg-background"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">Employer / Company Name</label>
                          <Input
                            placeholder="e.g. Tech Solutions / Self-Employed"
                            value={fatherCompany}
                            onChange={(e) => setFatherCompany(e.target.value)}
                            className="h-10 rounded-xl text-xs bg-background"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contacts: WhatsApp, Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Parent WhatsApp / Mobile Phone <span className="text-seneca-crimson">*</span>
                          </label>
                          {parentPhone && validation.parentPhone.isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Valid Mobile
                            </span>
                          )}
                        </div>
                        <Input
                          required
                          type="tel"
                          placeholder="0300 1234567"
                          value={parentPhone}
                          maxLength={15}
                          onFocus={() => markTouched("parentPhone")}
                          onChange={(e) => {
                            setParentPhone(formatters.formatPhone(e.target.value));
                            markTouched("parentPhone");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs font-mono",
                            touched.parentPhone && !validation.parentPhone.isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : parentPhone && validation.parentPhone.isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touched.parentPhone && !validation.parentPhone.isValid && (
                          <p className="text-[10px] text-rose-500 font-medium">{validation.parentPhone.message}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Parent Email Address <span className="text-seneca-crimson">*</span>
                          </label>
                          {parentEmail && validation.parentEmail.isValid && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Valid Email
                            </span>
                          )}
                        </div>
                        <Input
                          required
                          type="email"
                          placeholder="parent@gmail.com"
                          value={parentEmail}
                          onFocus={() => markTouched("parentEmail")}
                          onChange={(e) => {
                            setParentEmail(e.target.value);
                            markTouched("parentEmail");
                          }}
                          className={cn(
                            "h-10 rounded-xl text-xs",
                            touched.parentEmail && !validation.parentEmail.isValid
                              ? "border-rose-500 bg-rose-500/5"
                              : parentEmail && validation.parentEmail.isValid
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "bg-background"
                          )}
                        />
                        {touched.parentEmail && !validation.parentEmail.isValid && (
                          <p className="text-[10px] text-rose-500 font-medium">{validation.parentEmail.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Mother Info (Optional) */}
                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/80 space-y-2.5">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                        Mother&apos;s Particulars (Optional)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Input
                          placeholder="Mother's Full Name"
                          value={motherName}
                          onChange={(e) => setMotherName(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                        <Input
                          placeholder="Mother CNIC (42101-XXXXXXX-X)"
                          value={motherCnic}
                          maxLength={15}
                          onChange={(e) => setMotherCnic(formatters.formatCnic(e.target.value))}
                          className="h-10 rounded-xl text-xs bg-background font-mono"
                        />
                      </div>
                    </div>

                    {/* Address & Emergency Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">
                          24/7 Emergency Contact Phone <span className="text-seneca-crimson">*</span>
                        </label>
                        <Input
                          type="tel"
                          placeholder="0333 1122334"
                          value={emergencyContact || parentPhone}
                          maxLength={15}
                          onChange={(e) => setEmergencyContact(formatters.formatPhone(e.target.value))}
                          className="h-10 rounded-xl text-xs bg-background font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Emergency Contact Relation</label>
                        <Input
                          placeholder="Father / Mother / Uncle"
                          value={emergencyRelation}
                          onChange={(e) => setEmergencyRelation(e.target.value)}
                          className="h-10 rounded-xl text-xs bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">
                          Complete Residential Address <span className="text-seneca-crimson">*</span>
                        </label>
                        {address.trim().length >= 5 && (
                          <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Valid Address
                          </span>
                        )}
                      </div>
                      <Input
                        required
                        placeholder="House #, Street Name, Area / Sector, City"
                        value={address}
                        onFocus={() => markTouched("address")}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          markTouched("address");
                        }}
                        className={cn(
                          "h-10 rounded-xl text-xs",
                          touched.address && !validation.address.isValid
                            ? "border-rose-500 bg-rose-500/5"
                            : address && validation.address.isValid
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "bg-background"
                        )}
                      />
                    </div>

                    {/* Sibling Link */}
                    <div className="p-3 rounded-2xl bg-seneca-crimson/5 border border-seneca-crimson/20 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5 text-seneca-crimson shrink-0" />
                          <span>Sibling currently studying at Seneca Academy?</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={siblingInSchool}
                          onChange={(e) => setSiblingInSchool(e.target.checked)}
                          className="h-4 w-4 rounded text-seneca-crimson shrink-0 cursor-pointer"
                        />
                      </div>
                      {siblingInSchool && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <Input
                            placeholder="Sibling Student Roll # / Admission ID"
                            value={siblingRollNumber}
                            onChange={(e) => setSiblingRollNumber(e.target.value)}
                            className="h-9 rounded-xl text-xs bg-background font-mono"
                          />
                          <Input
                            placeholder="Sibling Full Name"
                            value={siblingName}
                            onChange={(e) => setSiblingName(e.target.value)}
                            className="h-9 rounded-xl text-xs bg-background"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: HISTORY & SCHOOL VAN */}
                {activeTab === "history" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    {/* Previous School */}
                    {admissionType !== "Transfer" && !hasPreviousSchool ? (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                            <span>Fresh Session Intake Selected</span>
                          </span>
                          <Badge variant="outline" className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            Prior School Not Required
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Under <strong>{admissionType} Admission</strong>, prior school records are optional. If migrating from another institution, you may record previous transcripts.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setHasPreviousSchool(true)}
                          className="h-8 rounded-xl text-xs font-bold gap-1 text-primary border-primary/30 mt-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Record Prior School History (Optional)</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <SchoolIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>Previous Academic History</span>
                          </span>
                          {admissionType !== "Transfer" && (
                            <button
                              type="button"
                              onClick={() => setHasPreviousSchool(false)}
                              className="text-[10px] font-bold text-rose-500 hover:underline"
                            >
                              Hide / Not Applicable
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">Previous School Name</label>
                            <Input
                              placeholder="e.g. St. Patrick's / Army Public School"
                              value={previousSchool}
                              onChange={(e) => setPreviousSchool(e.target.value)}
                              className="h-10 rounded-xl text-xs bg-background"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">Last Grade Passed</label>
                            <Input
                              placeholder="e.g. Grade 4 / Class 8"
                              value={lastGrade}
                              onChange={(e) => setLastGrade(e.target.value)}
                              className="h-10 rounded-xl text-xs bg-background"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">SLC / Transfer Cert #</label>
                            <Input
                              placeholder="SLC-2025-981"
                              value={slcNumber}
                              onChange={(e) => setSlcNumber(e.target.value)}
                              className="h-10 rounded-xl text-xs bg-background font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">Previous Board</label>
                            <select
                              value={previousBoard}
                              onChange={(e) => setPreviousBoard(e.target.value)}
                              className="h-10 w-full px-3 rounded-xl bg-background border border-border text-xs font-semibold"
                            >
                              <option value="Sindh Board (BSEK)">Sindh Board (BSEK/BIEK)</option>
                              <option value="Federal Board (FBISE)">Federal Board (FBISE)</option>
                              <option value="Cambridge (CAIE / O-Level)">Cambridge (CAIE / O-Level)</option>
                              <option value="Aga Khan University Board (AKU-EB)">Aga Khan Board (AKU-EB)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">Marks / Percentage</label>
                            <Input
                              placeholder="e.g. 88.5% (A+ Grade)"
                              value={previousMarks}
                              onChange={(e) => setPreviousMarks(e.target.value)}
                              className="h-10 rounded-xl text-xs bg-background"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* School Transport Selection */}
                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-3">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Bus className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>Seneca Official Transport Service</span>
                      </span>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">Select Van Route</label>
                        <select
                          value={transportRoute}
                          onChange={(e) => setTransportRoute(e.target.value)}
                          className="h-10 sm:h-11 w-full px-3.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground"
                        >
                          {transportRoutesList.map((route) => (
                            <option key={route} value={route}>
                              {route}
                            </option>
                          ))}
                        </select>
                      </div>

                      {transportRoute !== transportRoutesList[0] &&
                        transportRoute !== TRANSPORT_ROUTES[0] &&
                        !transportRoute.toLowerCase().includes("self pick") && (
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">Designated Pickup / Drop-off Stop</label>
                            <Input
                              placeholder="e.g. Near Garden Jamatkhana / Lasbela Chowk"
                              value={pickupPoint}
                              onChange={(e) => setPickupPoint(e.target.value)}
                              className="h-10 rounded-xl text-xs bg-background"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* TAB 5: DOCUMENT CHECKLIST & UPLOADS */}
                {activeTab === "documents" && (
                  <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs text-foreground">
                          Document Checklist for {applyingForClass} ({admissionType})
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          Upload clear photographs or digital scans (PNG, JPG, PDF up to 5MB).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {getGradeDocumentChecklist(applyingForClass, admissionType).map((docItem) => {
                        const isChecked =
                          docItem.id === "bForm" ? docBForm :
                          docItem.id === "fatherCnic" ? docFatherCnic :
                          docItem.id === "motherCnic" ? docMotherCnic :
                          docItem.id === "photos" ? docPhotos :
                          docItem.id === "slc" ? docSlc :
                          docItem.id === "marksheet" ? docMarksheet :
                          docItem.id === "characterCert" ? docCharacterCert :
                          docMedicalReport;

                        const setChecked = (val: boolean) => {
                          if (docItem.id === "bForm") setDocBForm(val);
                          if (docItem.id === "fatherCnic") setDocFatherCnic(val);
                          if (docItem.id === "motherCnic") setDocMotherCnic(val);
                          if (docItem.id === "photos") setDocPhotos(val);
                          if (docItem.id === "slc") setDocSlc(val);
                          if (docItem.id === "marksheet") setDocMarksheet(val);
                          if (docItem.id === "characterCert") setDocCharacterCert(val);
                          if (docItem.id === "medicalReport") setDocMedicalReport(val);
                        };

                        const file = uploadedFiles[docItem.id];

                        return (
                          <div
                            key={docItem.id}
                            className={cn(
                              "p-3 rounded-2xl border transition-all space-y-2",
                              isChecked || file ? "bg-emerald-500/5 border-emerald-500/30" : "bg-card border-border/80"
                            )}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <div className="flex items-start gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => setChecked(!isChecked)}
                                  className={cn(
                                    "h-5 w-5 rounded-md flex items-center justify-center border text-xs shrink-0 font-bold mt-0.5 transition-colors",
                                    isChecked
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                      : "bg-background border-border text-transparent"
                                  )}
                                >
                                  ✓
                                </button>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-foreground">{docItem.label}</span>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[9px] font-bold px-1.5 py-0.2",
                                        docItem.required ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-muted text-muted-foreground"
                                      )}
                                    >
                                      {docItem.badge}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground pt-0.5">{docItem.desc}</p>
                                </div>
                              </div>
                            </div>

                            {/* Upload or Preview Widget */}
                            <div className="pt-1 border-t border-border/40">
                              {file ? (
                                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-background border border-emerald-500/30">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {file.fileUrl.startsWith("data:image") ? (
                                      <div
                                        onClick={() => setPreviewDoc({ url: file.fileUrl, title: docItem.label })}
                                        className="h-8 w-8 rounded-lg overflow-hidden border border-border bg-muted cursor-pointer shrink-0"
                                      >
                                        <img src={file.fileUrl} alt={docItem.label} className="h-full w-full object-cover" />
                                      </div>
                                    ) : (
                                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                    <span className="text-xs font-bold text-foreground truncate max-w-[180px] sm:max-w-[240px]">
                                      {file.fileName}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setPreviewDoc({ url: file.fileUrl, title: docItem.label })}
                                      className="h-7 px-2 text-[10px] font-bold"
                                    >
                                      <Eye className="h-3 w-3 mr-1" /> Preview
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveFile(docItem.id)}
                                      className="h-7 w-7 p-0 text-rose-500"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <label
                                    htmlFor={`upload-apply-${docItem.id}`}
                                    className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-bold text-seneca-crimson hover:text-seneca-crimson/80 bg-seneca-crimson/5 hover:bg-seneca-crimson/10 border border-seneca-crimson/20 px-3 py-1 rounded-xl transition-all"
                                  >
                                    <FileUp className="h-3.5 w-3.5" />
                                    <span>Upload File / Photo</span>
                                  </label>
                                  <input
                                    id={`upload-apply-${docItem.id}`}
                                    type="file"
                                    accept={docItem.fileAccept}
                                    onChange={(e) => handleFileUpload(docItem.id, e)}
                                    className="hidden"
                                  />
                                  <span className="text-[10px] text-muted-foreground">PNG, JPG, PDF (Max 5MB)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 6: SUMMARY REVIEW & DECLARATION */}
                {activeTab === "review" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Candidate Summary Dossier
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold bg-seneca-crimson/10 text-seneca-crimson">
                          {admissionType}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Student Name:</span>
                          <span className="font-bold text-foreground">{name || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Target Class:</span>
                          <span className="font-bold text-foreground">{applyingForClass}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Gender / Blood:</span>
                          <span className="font-bold text-foreground">{gender} • {bloodGroup}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Father / Guardian:</span>
                          <span className="font-bold text-foreground">{fatherName || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Parent WhatsApp:</span>
                          <span className="font-bold text-foreground font-mono">{parentPhone || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Parent Email:</span>
                          <span className="font-bold text-foreground">{parentEmail || "Not specified"}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-3">
                          <span className="text-muted-foreground block text-[10px]">Residential Address:</span>
                          <span className="font-bold text-foreground">{address || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Academic Group:</span>
                          <span className="font-bold text-foreground">{stream}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Transport Route:</span>
                          <span className="font-bold text-foreground truncate block">{transportRoute.split(":")[0]}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Attached Documents:</span>
                          <span className="font-bold text-emerald-600">{Object.keys(uploadedFiles).length} Files Attached</span>
                        </div>
                      </div>
                    </div>

                    {/* Declaration Checkbox */}
                    <div className="p-3.5 rounded-2xl bg-seneca-crimson/5 border border-seneca-crimson/20 space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreedToDeclaration}
                          onChange={(e) => setAgreedToDeclaration(e.target.checked)}
                          className="h-4 w-4 mt-0.5 rounded text-seneca-crimson cursor-pointer shrink-0"
                        />
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          <strong className="text-foreground">Parent / Guardian Undertaking:</strong> I hereby declare that the particulars provided in this online admission application are authentic and correct. I understand that admission is subject to candidate evaluation during the Saturday diagnostic assessment.
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Wizard Controls */}
              <div className="p-3.5 sm:p-5 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const steps = ["academic", "identity", "parents", "history", "documents", "review"] as const;
                    const currentIndex = steps.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(steps[currentIndex - 1]);
                    } else {
                      handleClose();
                    }
                  }}
                  className="rounded-xl text-xs font-bold gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{activeTab === "academic" ? "Cancel" : "Back"}</span>
                </Button>

                <div className="flex items-center gap-2">
                  {activeTab !== "review" ? (
                    <Button
                      type="button"
                      variant="glow"
                      size="sm"
                      onClick={() => {
                        const steps = ["academic", "identity", "parents", "history", "documents", "review"] as const;
                        const currentIndex = steps.indexOf(activeTab);
                        if (currentIndex < steps.length - 1) {
                          setActiveTab(steps[currentIndex + 1]);
                        }
                      }}
                      className="rounded-xl text-xs font-bold gap-1.5 px-5"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading || !agreedToDeclaration}
                      variant="glow"
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-2 px-6 shadow-md shadow-seneca-crimson/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Transmitting Application...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Submit Official Application</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Attached Document Dialog */}
      {previewDoc && (
        <Dialog open={Boolean(previewDoc)} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-2xl rounded-3xl p-4 sm:p-6 bg-card">
            <DialogHeader className="pb-2 border-b border-border">
              <DialogTitle className="text-sm font-bold text-foreground">{previewDoc.title}</DialogTitle>
            </DialogHeader>
            <div className="py-2 flex items-center justify-center max-h-[70vh] overflow-hidden rounded-2xl bg-black/5">
              <img src={previewDoc.url} alt={previewDoc.title} className="max-h-[65vh] object-contain rounded-xl" />
            </div>
            <div className="pt-2 flex justify-end">
              <Button onClick={() => setPreviewDoc(null)} variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                Close Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default AdmissionApplyModal;
