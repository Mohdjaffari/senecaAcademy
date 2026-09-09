import mongoose, { Schema, Document, Model } from "mongoose";
import {
  IAdmissionsGlobalSettings,
  IAdmissionsHeroData,
  IAdmissionsStatusBannerData,
  IAdmissionRoadmapData,
  IFeeStructureData,
  IAgeEligibilityData,
  IRequiredDocumentsData,
  IScholarshipsData,
  IAdmissionsFaqData,
  IAdmissionTypeItem,
  ITransportRouteItem,
  IDocumentRequirementRule,
  ISaturdayBookingData,
  IAdmissionsSEOData,
} from "@/lib/db/admissions-page-defaults";

export interface IAdmissionsPageDocument extends Document {
  schoolId: mongoose.Types.ObjectId;
  pageTitle: string;
  pageDescription: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: {
    userId?: string;
    name?: string;
    email?: string;
  };
  draftUpdatedAt?: Date;
  lastUpdated?: Date;
  updatedBy?: {
    userId?: string;
    name?: string;
    email?: string;
  };
  sectionsOrder: string[];
  globalSettings: IAdmissionsGlobalSettings;
  hero: IAdmissionsHeroData;
  statusBanner: IAdmissionsStatusBannerData;
  roadmap: IAdmissionRoadmapData;
  feeStructure: IFeeStructureData;
  eligibility: IAgeEligibilityData;
  documents: IRequiredDocumentsData;
  scholarships: IScholarshipsData;
  faqs: IAdmissionsFaqData;
  admissionTypes: IAdmissionTypeItem[];
  transportRoutes: ITransportRouteItem[];
  documentRules: IDocumentRequirementRule[];
  saturdayBooking: ISaturdayBookingData;
  seo: IAdmissionsSEOData;
  draft?: {
    pageTitle?: string;
    pageDescription?: string;
    sectionsOrder?: string[];
    globalSettings?: IAdmissionsGlobalSettings;
    hero?: IAdmissionsHeroData;
    statusBanner?: IAdmissionsStatusBannerData;
    roadmap?: IAdmissionRoadmapData;
    feeStructure?: IFeeStructureData;
    eligibility?: IAgeEligibilityData;
    documents?: IRequiredDocumentsData;
    scholarships?: IScholarshipsData;
    faqs?: IAdmissionsFaqData;
    admissionTypes?: IAdmissionTypeItem[];
    transportRoutes?: ITransportRouteItem[];
    documentRules?: IDocumentRequirementRule[];
    saturdayBooking?: ISaturdayBookingData;
    seo?: IAdmissionsSEOData;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GlobalSettingsSchema = new Schema(
  {
    admissionsOpen: { type: Boolean, default: true },
    admissionsSession: { type: String, default: "Session 2026–2027" },
    admissionsDeadline: { type: String, default: "31st August 2026" },
    openingDate: { type: String, default: "01 June 2026" },
    closingDate: { type: String, default: "31 August 2026" },
    admissionsNotice: { type: String, default: "ADMISSIONS OPEN FOR SESSION 2026–27 (LIMITED SEATS)" },
    admissionsClosedNotice: {
      type: String,
      default: "Admissions for Session 2026–27 are currently closed. Inquiries open for next intake cycle.",
    },
    admissionsAnnouncement: { type: String, default: "" },
    applicationSubmissionEnabled: { type: Boolean, default: true },
    diagnosticAssessmentEnabled: { type: Boolean, default: true },
    assessmentDay: { type: String, default: "Every Saturday" },
    assessmentStartTime: { type: String, default: "09:00 AM" },
    assessmentEndTime: { type: String, default: "01:00 PM" },
    assessmentCampus: { type: String, default: "Soldier Bazar Campus, Karachi" },
    admissionsPhone: { type: String, default: "+92 335 7413777" },
    admissionsEmail: { type: String, default: "admissions@seneca.edu.pk" },
    admissionsWhatsapp: { type: String, default: "+92 335 7413777" },
    admissionsOfficeAddress: { type: String, default: "Soldier Bazar, Garden East, Karachi, Pakistan" },
    applicationFeeEnabled: { type: Boolean, default: false },
    applicationFeeAmount: { type: String, default: "Rs. 0 (Free Registration)" },
    transportEnabled: { type: Boolean, default: true },
    documentUploadsMandatory: { type: Boolean, default: true },
    allowDuplicateApplications: { type: Boolean, default: false },
    maxActiveApplications: { type: Number, default: 1 },
    generalInstructions: { type: String, default: "" },
    applyButtonText: { type: String, default: "Apply for Admission Online" },
    closedButtonText: { type: String, default: "Register for Next Intake Waitlist" },
  },
  { _id: false }
);

const HeroSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Admissions & Fees Session 2026–2027" },
    badgeIcon: { type: String, default: "GraduationCap" },
    showBadge: { type: Boolean, default: true },
    title: { type: String, default: "Transparent Fee Structure &" },
    highlightedTitle: { type: String, default: "Admission Process." },
    description: { type: String, default: "" },
    breadcrumbs: [
      {
        label: { type: String, required: true },
        href: { type: String },
      },
    ],
    primaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Tuition Cost Calculator" },
      href: { type: String, default: "#fee-calculator" },
    },
    secondaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Admission Roadmap" },
      href: { type: String, default: "#admission-process" },
    },
    variant: {
      type: String,
      enum: ["crimson", "amber", "emerald", "default"],
      default: "crimson",
    },
  },
  { _id: false }
);

const StatusBannerSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    openState: {
      badgeText: { type: String, default: "Session 2026–2027 Live Intake" },
      heading: { type: String, default: "Admissions Open for Session 2026–2027" },
      description: { type: String, default: "" },
      sessionText: { type: String, default: "Academic Year 2026–27" },
      deadlineText: { type: String, default: "Final Deadline: 31st August 2026" },
      applyButtonLabel: { type: String, default: "Apply for Admission Online" },
      secondaryButtonLabel: { type: String, default: "Check Application Status" },
      contactButtonText: { type: String, default: "Helpline: +92 335 7413777" },
      supportingText: { type: String, default: "Zero Registration Fee • Saturday Assessments 9:00 AM – 1:00 PM" },
    },
    closedState: {
      badgeText: { type: String, default: "Admissions Notice" },
      heading: { type: String, default: "Admissions for Session 2026–2027 are Currently Closed" },
      closedMessage: { type: String, default: "" },
      contactCounselorsText: { type: String, default: "Speak with Admissions Counselor" },
      contactCounselorsHref: { type: String, default: "/contact" },
      exploreCurriculumText: { type: String, default: "Explore Curriculum & Fees" },
      exploreCurriculumHref: { type: String, default: "/academics" },
      waitingListMessage: { type: String, default: "Inquiries open for upcoming 2027–2028 Academic Intake." },
      upcomingSessionMessage: { type: String, default: "Next intake registrations commence December 2026." },
    },
  },
  { _id: false }
);

const RoadmapStepSchema = new Schema(
  {
    id: { type: String, required: true },
    stepNumber: { type: String, default: "01" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    badge: { type: String, default: "" },
    badgeVariant: {
      type: String,
      enum: ["crimson", "amber", "emerald", "blue", "neutral"],
      default: "crimson",
    },
    colorClass: { type: String, default: "text-seneca-crimson bg-seneca-crimson/10 border-seneca-crimson/20" },
    isHighlighted: { type: Boolean, default: false },
    icon: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    link: { type: String },
    linkText: { type: String },
  },
  { _id: false }
);

const RoadmapSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Clear 4-Step Roadmap" },
    heading: { type: String, default: "How Admission Works at Seneca Academy" },
    description: { type: String, default: "" },
    steps: [RoadmapStepSchema],
  },
  { _id: false }
);

const FeeCalculatorTierSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    badge: { type: String, default: "Standard" },
    badgeColor: { type: String, default: "emerald" },
    gradeRange: { type: String, default: "" },
    admissionFee: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    monthlyTuition: { type: Number, default: 0 },
    annualCharges: { type: Number, default: 0 },
    labFund: { type: Number, default: 0 },
    features: [{ type: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const FeeStructureSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Institutional Transparency" },
    heading: { type: String, default: "Fee Structure & Investment in Excellence" },
    description: { type: String, default: "" },
    siblingDiscountPercent: { type: Number, default: 15 },
    annualAdvanceDiscountPercent: { type: Number, default: 5 },
    siblingDiscountLabel: { type: String, default: "Apply Sibling Concession (15% off monthly tuition)" },
    annualDiscountLabel: { type: String, default: "Annual Advance (5% Extra Off)" },
    disclaimerText: { type: String, default: "" },
    applyButtonText: { type: String, default: "Apply for this Grade" },
    applyButtonHref: { type: String, default: "#admissions" },
    tiers: [FeeCalculatorTierSchema],
  },
  { _id: false }
);

const AgeEligibilityItemSchema = new Schema(
  {
    id: { type: String, required: true },
    grade: { type: String, required: true },
    age: { type: String, required: true },
    minAge: { type: String },
    maxAge: { type: String },
    ageDisplayText: { type: String },
    seats: { type: String, default: "" },
    focus: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const AgeEligibilitySchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Enrollment Guidelines" },
    heading: { type: String, default: "Age Criteria & Class Divisions" },
    description: { type: String, default: "" },
    items: [AgeEligibilityItemSchema],
  },
  { _id: false }
);

const RequiredDocumentItemSchema = new Schema(
  {
    id: { type: String, required: true },
    documentName: { type: String, required: true },
    description: { type: String, default: "" },
    badge: { type: String, default: "Mandatory" },
    isRequired: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const RequiredDocumentsSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Documentation Pack" },
    heading: { type: String, default: "Documents Required for Admission Verification" },
    description: { type: String, default: "" },
    documents: [RequiredDocumentItemSchema],
  },
  { _id: false }
);

const ScholarshipItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    shortTitle: { type: String },
    discount: { type: String, required: true },
    desc: { type: String, default: "" },
    eligibilityCriteria: { type: String, default: "" },
    badge: { type: String, default: "Merit" },
    icon: { type: String },
    ctaText: { type: String },
    ctaUrl: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const ScholarshipsSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Merit & Aid" },
    heading: { type: String, default: "Scholarships & Fee Concessions" },
    description: { type: String, default: "" },
    scholarships: [ScholarshipItemSchema],
  },
  { _id: false }
);

const AdmissionsFaqItemSchema = new Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "General" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const AdmissionsFaqSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Admissions Helpdesk" },
    heading: { type: String, default: "Frequently Asked Questions" },
    description: { type: String, default: "" },
    items: [AdmissionsFaqItemSchema],
  },
  { _id: false }
);

const AdmissionTypeItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    desc: { type: String, default: "" },
    icon: { type: String, default: "GraduationCap" },
    concessionTag: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const TransportRouteItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String, default: "" },
    areasCovered: [{ type: String }],
    fee: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const DocumentRequirementRuleSchema = new Schema(
  {
    id: { type: String, required: true },
    key: { type: String, required: true },
    documentName: { type: String, required: true },
    description: { type: String, default: "" },
    fileAccept: { type: String, default: "image/*,.pdf" },
    badge: { type: String, default: "Required" },
    isRequired: { type: Boolean, default: true },
    applicableTiers: [{ type: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const SaturdayBookingSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Saturday Diagnostic Assessments & Campus Desk" },
    title: { type: String, default: "Visit Seneca Academy in" },
    highlightedLocation: { type: String, default: "Soldier Bazar" },
    description: { type: String, default: "" },
    scheduleBadge: { type: String, default: "Every Saturday • 9:00 AM – 1:00 PM" },
    officeHours: { type: String, default: "Mon – Sat: 8:00 AM – 3:00 PM" },
    phone: { type: String, default: "+92 335 7413777" },
    whatsapp: { type: String, default: "+92 335 7413777" },
    address: { type: String, default: "Soldier Bazar, Garden East, Karachi, Pakistan" },
    directionsUrl: { type: String, default: "/contact" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const AdmissionsSEOSchema = new Schema(
  {
    metaTitle: { type: String, default: "Admissions & Fee Structure 2026–2027 — Seneca Academy Karachi" },
    metaDescription: { type: String, default: "" },
    keywords: [{ type: String }],
    ogImage: { type: String, default: "" },
  },
  { _id: false }
);

const AdmissionsPageSchema = new Schema<IAdmissionsPageDocument>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
      unique: true,
      index: true,
    },
    pageTitle: { type: String, default: "Admissions & Fee Structure 2026–2027" },
    pageDescription: { type: String, default: "" },
    slug: { type: String, default: "admissions", index: true },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    publishedBy: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
    },
    draftUpdatedAt: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
    },
    sectionsOrder: {
      type: [String],
      default: [
        "hero",
        "statusBanner",
        "roadmap",
        "feeEstimator",
        "eligibility",
        "documents",
        "scholarships",
        "faqs",
        "saturdayBooking",
      ],
    },
    globalSettings: { type: GlobalSettingsSchema, required: true },
    hero: { type: HeroSchema, required: true },
    statusBanner: { type: StatusBannerSchema, required: true },
    roadmap: { type: RoadmapSchema, required: true },
    feeStructure: { type: FeeStructureSchema, required: true },
    eligibility: { type: AgeEligibilitySchema, required: true },
    documents: { type: RequiredDocumentsSchema, required: true },
    scholarships: { type: ScholarshipsSchema, required: true },
    faqs: { type: AdmissionsFaqSchema, required: true },
    admissionTypes: [AdmissionTypeItemSchema],
    transportRoutes: [TransportRouteItemSchema],
    documentRules: [DocumentRequirementRuleSchema],
    saturdayBooking: { type: SaturdayBookingSchema, required: true },
    seo: { type: AdmissionsSEOSchema, required: true },
    draft: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AdmissionsPage: Model<IAdmissionsPageDocument> =
  mongoose.models.AdmissionsPage ||
  mongoose.model<IAdmissionsPageDocument>("AdmissionsPage", AdmissionsPageSchema);

export default AdmissionsPage;
