import { z } from "zod";

export const GlobalSettingsValidation = z.object({
  admissionsOpen: z.boolean().default(true),
  admissionsSession: z.string().min(1, "Session is required").max(100),
  admissionsDeadline: z.string().optional().default(""),
  openingDate: z.string().optional().default(""),
  closingDate: z.string().optional().default(""),
  admissionsNotice: z.string().min(1, "Notice is required").max(300),
  admissionsClosedNotice: z.string().optional().default(""),
  admissionsAnnouncement: z.string().optional().default(""),
  applicationSubmissionEnabled: z.boolean().default(true),
  diagnosticAssessmentEnabled: z.boolean().default(true),
  assessmentDay: z.string().default("Every Saturday"),
  assessmentStartTime: z.string().default("09:00 AM"),
  assessmentEndTime: z.string().default("01:00 PM"),
  assessmentCampus: z.string().default("Soldier Bazar Campus, Karachi"),
  admissionsPhone: z.string().min(1, "Phone is required").max(50),
  admissionsEmail: z.string().min(1, "Email is required").max(100),
  admissionsWhatsapp: z.string().optional().default(""),
  admissionsOfficeAddress: z.string().min(1, "Address is required").max(200),
  applicationFeeEnabled: z.boolean().default(false),
  applicationFeeAmount: z.string().optional().default("Rs. 0 (Free Registration)"),
  transportEnabled: z.boolean().default(true),
  documentUploadsMandatory: z.boolean().default(true),
  allowDuplicateApplications: z.boolean().default(false),
  maxActiveApplications: z.number().default(1),
  generalInstructions: z.string().optional().default(""),
  applyButtonText: z.string().min(1, "Apply button text is required").max(80),
  closedButtonText: z.string().optional().default("Register for Next Intake Waitlist"),
});

export const HeroCtaValidation = z.object({
  isVisible: z.boolean().default(true),
  text: z.string().min(1, "CTA text required").max(60),
  href: z.string().min(1, "CTA link required"),
});

export const HeroValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().min(1, "Badge text is required").max(120),
  badgeIcon: z.string().default("GraduationCap"),
  showBadge: z.boolean().default(true),
  title: z.string().min(1, "Title is required").max(150),
  highlightedTitle: z.string().max(100).optional().default(""),
  description: z.string().min(1, "Description is required").max(800),
  breadcrumbs: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().optional(),
      })
    )
    .optional()
    .default([{ label: "Admissions & Fees" }]),
  primaryCta: HeroCtaValidation,
  secondaryCta: HeroCtaValidation,
  variant: z.enum(["crimson", "amber", "emerald", "default"]).default("crimson"),
});

export const StatusBannerValidation = z.object({
  isVisible: z.boolean().default(true),
  openState: z.object({
    badgeText: z.string().default("Session 2026–2027 Live Intake"),
    heading: z.string().default("Admissions Open for Session 2026–2027"),
    description: z.string().default(""),
    sessionText: z.string().default("Academic Year 2026–27"),
    deadlineText: z.string().default("Final Deadline: 31st August 2026"),
    applyButtonLabel: z.string().default("Apply for Admission Online"),
    secondaryButtonLabel: z.string().default("Check Application Status"),
    contactButtonText: z.string().default("Helpline: +92 335 7413777"),
    supportingText: z.string().default("Zero Registration Fee • Saturday Assessments 9:00 AM – 1:00 PM"),
  }),
  closedState: z.object({
    badgeText: z.string().default("Admissions Notice"),
    heading: z.string().default("Admissions for Session 2026–2027 are Currently Closed"),
    closedMessage: z.string().default(""),
    contactCounselorsText: z.string().default("Speak with Admissions Counselor"),
    contactCounselorsHref: z.string().default("/contact"),
    exploreCurriculumText: z.string().default("Explore Curriculum & Fees"),
    exploreCurriculumHref: z.string().default("/academics"),
    waitingListMessage: z.string().default("Inquiries open for upcoming 2027–2028 Academic Intake."),
    upcomingSessionMessage: z.string().default("Next intake registrations commence December 2026."),
  }),
});

export const RoadmapStepValidation = z.object({
  id: z.string().min(1),
  stepNumber: z.string().min(1).max(10),
  title: z.string().min(1, "Step title is required").max(100),
  description: z.string().min(1, "Step description is required").max(500),
  badge: z.string().optional().default(""),
  badgeVariant: z.enum(["crimson", "amber", "emerald", "blue", "neutral"]).optional().default("crimson"),
  colorClass: z.string().optional().default("text-seneca-crimson bg-seneca-crimson/10 border-seneca-crimson/20"),
  isHighlighted: z.boolean().optional().default(false),
  icon: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  link: z.string().optional(),
  linkText: z.string().optional(),
});

export const RoadmapSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Clear 4-Step Roadmap"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  steps: z.array(RoadmapStepValidation).min(1, "At least one step is required"),
});

export const FeeCalculatorTierValidation = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Tier name is required").max(100),
  badge: z.string().max(50).optional().default("Standard"),
  badgeColor: z.string().optional().default("emerald"),
  gradeRange: z.string().max(100).optional().default(""),
  admissionFee: z.number().nonnegative().default(0),
  securityDeposit: z.number().nonnegative().default(0),
  monthlyTuition: z.number().nonnegative().default(0),
  annualCharges: z.number().nonnegative().default(0),
  labFund: z.number().nonnegative().optional().default(0),
  features: z.array(z.string()).default([]),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const FeeStructureValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Institutional Transparency"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  siblingDiscountPercent: z.number().min(0).max(100).default(15),
  annualAdvanceDiscountPercent: z.number().min(0).max(100).default(5),
  siblingDiscountLabel: z.string().max(150).default("Apply Sibling Concession (15% off monthly tuition)"),
  annualDiscountLabel: z.string().max(150).default("Annual Advance (5% Extra Off)"),
  disclaimerText: z.string().max(400).optional().default(""),
  applyButtonText: z.string().max(80).default("Apply for this Grade"),
  applyButtonHref: z.string().optional().default("#admissions"),
  tiers: z.array(FeeCalculatorTierValidation).min(1, "At least one fee tier is required"),
});

export const AgeEligibilityItemValidation = z.object({
  id: z.string().min(1),
  grade: z.string().min(1, "Grade name is required").max(100),
  age: z.string().min(1, "Age bracket is required").max(100),
  minAge: z.string().optional(),
  maxAge: z.string().optional(),
  ageDisplayText: z.string().optional(),
  seats: z.string().max(100).optional().default(""),
  focus: z.string().max(300).optional().default(""),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const AgeEligibilitySectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Enrollment Guidelines"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  items: z.array(AgeEligibilityItemValidation).min(1, "At least one grade tier is required"),
});

export const RequiredDocumentItemValidation = z.object({
  id: z.string().min(1),
  documentName: z.string().min(1, "Document title is required").max(200),
  description: z.string().max(300).optional().default(""),
  badge: z.string().max(50).optional().default("Mandatory"),
  isRequired: z.boolean().default(true),
  order: z.number().default(0),
});

export const RequiredDocumentsSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Documentation Pack"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  documents: z.array(RequiredDocumentItemValidation).min(1, "At least one document is required"),
});

export const ScholarshipItemValidation = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Scholarship title is required").max(120),
  shortTitle: z.string().optional(),
  discount: z.string().min(1, "Discount percentage/text is required").max(100),
  desc: z.string().min(1, "Description is required").max(400),
  eligibilityCriteria: z.string().max(300).optional().default(""),
  badge: z.string().max(50).optional().default("Merit"),
  icon: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const ScholarshipsSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Merit & Aid"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  scholarships: z.array(ScholarshipItemValidation).min(1, "At least one scholarship is required"),
});

export const AdmissionsFaqItemValidation = z.object({
  id: z.string().min(1),
  question: z.string().min(1, "Question is required").max(300),
  answer: z.string().min(1, "Answer is required").max(1500),
  category: z.string().max(50).optional().default("General"),
  featured: z.boolean().optional().default(false),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const AdmissionsFaqSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Admissions Helpdesk"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  items: z.array(AdmissionsFaqItemValidation).min(1, "At least one FAQ is required"),
});

export const AdmissionTypeItemValidation = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  label: z.string().min(1),
  desc: z.string().default(""),
  icon: z.string().default("GraduationCap"),
  concessionTag: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const TransportRouteItemValidation = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().default(""),
  areasCovered: z.array(z.string()).default([]),
  fee: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const DocumentRequirementRuleValidation = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  documentName: z.string().min(1),
  description: z.string().default(""),
  fileAccept: z.string().default("image/*,.pdf"),
  badge: z.string().default("Required"),
  isRequired: z.boolean().default(true),
  applicableTiers: z.array(z.string()).default(["all"]),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const SaturdayBookingValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(120).default("Saturday Diagnostic Assessments & Campus Desk"),
  title: z.string().min(1, "Title is required").max(150),
  highlightedLocation: z.string().max(100).default("Soldier Bazar"),
  description: z.string().min(1, "Description is required").max(600),
  scheduleBadge: z.string().max(100).default("Every Saturday • 9:00 AM – 1:00 PM"),
  officeHours: z.string().max(100).default("Mon – Sat: 8:00 AM – 3:00 PM"),
  phone: z.string().min(1, "Phone number is required").max(50),
  whatsapp: z.string().max(50).optional().default(""),
  address: z.string().min(1, "Address is required").max(200),
  directionsUrl: z.string().optional().default("/contact"),
  note: z.string().max(300).optional().default(""),
});

export const AdmissionsSEOValidation = z.object({
  metaTitle: z.string().min(1, "Meta title is required").max(120),
  metaDescription: z.string().min(1, "Meta description is required").max(300),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional().default(""),
});

export const AdmissionsPageFormValidation = z.object({
  pageTitle: z.string().min(1, "Page title is required").max(150),
  pageDescription: z.string().max(500).optional().default(""),
  sectionsOrder: z.array(z.string()).default([
    "hero",
    "statusBanner",
    "roadmap",
    "feeEstimator",
    "eligibility",
    "documents",
    "scholarships",
    "faqs",
    "saturdayBooking",
  ]),
  globalSettings: GlobalSettingsValidation,
  hero: HeroValidation,
  statusBanner: StatusBannerValidation,
  roadmap: RoadmapSectionValidation,
  feeStructure: FeeStructureValidation,
  eligibility: AgeEligibilitySectionValidation,
  documents: RequiredDocumentsSectionValidation,
  scholarships: ScholarshipsSectionValidation,
  faqs: AdmissionsFaqSectionValidation,
  admissionTypes: z.array(AdmissionTypeItemValidation).default([]),
  transportRoutes: z.array(TransportRouteItemValidation).default([]),
  documentRules: z.array(DocumentRequirementRuleValidation).default([]),
  saturdayBooking: SaturdayBookingValidation,
  seo: AdmissionsSEOValidation,
  saveAsDraft: z.boolean().optional().default(false),
});

export type AdmissionsPageFormData = z.infer<typeof AdmissionsPageFormValidation>;
