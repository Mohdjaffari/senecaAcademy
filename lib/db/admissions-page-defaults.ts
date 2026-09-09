export interface IAdmissionsGlobalSettings {
  admissionsOpen: boolean;
  admissionsSession: string;
  admissionsDeadline?: string;
  openingDate?: string;
  closingDate?: string;
  admissionsNotice: string;
  admissionsClosedNotice?: string;
  admissionsAnnouncement?: string;
  applicationSubmissionEnabled: boolean;
  diagnosticAssessmentEnabled: boolean;
  assessmentDay: string;
  assessmentStartTime: string;
  assessmentEndTime: string;
  assessmentCampus: string;
  admissionsPhone: string;
  admissionsEmail: string;
  admissionsWhatsapp?: string;
  admissionsOfficeAddress: string;
  applicationFeeEnabled: boolean;
  applicationFeeAmount?: string;
  transportEnabled: boolean;
  documentUploadsMandatory: boolean;
  allowDuplicateApplications: boolean;
  maxActiveApplications: number;
  generalInstructions?: string;
  applyButtonText: string;
  closedButtonText?: string;
}

export interface IAdmissionsHeroCta {
  isVisible: boolean;
  text: string;
  href: string;
}

export interface IAdmissionsHeroData {
  isVisible: boolean;
  badge: string;
  badgeIcon: string;
  showBadge: boolean;
  title: string;
  highlightedTitle: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  primaryCta: IAdmissionsHeroCta;
  secondaryCta: IAdmissionsHeroCta;
  variant: "crimson" | "amber" | "emerald" | "default";
}

export interface IAdmissionsStatusBannerData {
  isVisible: boolean;
  openState: {
    badgeText: string;
    heading: string;
    description: string;
    sessionText: string;
    deadlineText: string;
    applyButtonLabel: string;
    secondaryButtonLabel: string;
    contactButtonText: string;
    supportingText: string;
  };
  closedState: {
    badgeText: string;
    heading: string;
    closedMessage: string;
    contactCounselorsText: string;
    contactCounselorsHref: string;
    exploreCurriculumText: string;
    exploreCurriculumHref: string;
    waitingListMessage: string;
    upcomingSessionMessage: string;
  };
}

export interface IAdmissionRoadmapStep {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  badge: string;
  badgeVariant?: "crimson" | "amber" | "emerald" | "blue" | "neutral";
  colorClass?: string;
  isHighlighted?: boolean;
  icon?: string;
  order: number;
  isActive: boolean;
  link?: string;
  linkText?: string;
}

export interface IAdmissionRoadmapData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  steps: IAdmissionRoadmapStep[];
}

export interface IFeeCalculatorTier {
  id: string;
  name: string;
  badge: string;
  badgeColor?: "emerald" | "sky" | "indigo" | "crimson" | "amber" | "neutral" | string;
  gradeRange: string;
  admissionFee: number;
  securityDeposit: number;
  monthlyTuition: number;
  annualCharges: number;
  labFund?: number;
  features: string[];
  order: number;
  isActive: boolean;
}

export interface IFeeStructureData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  siblingDiscountPercent: number;
  annualAdvanceDiscountPercent: number;
  siblingDiscountLabel: string;
  annualDiscountLabel: string;
  disclaimerText?: string;
  applyButtonText: string;
  applyButtonHref?: string;
  tiers: IFeeCalculatorTier[];
}

export interface IAgeEligibilityItem {
  id: string;
  grade: string;
  age: string;
  minAge?: string;
  maxAge?: string;
  ageDisplayText?: string;
  seats: string;
  focus: string;
  order: number;
  isActive: boolean;
}

export interface IAgeEligibilityData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  items: IAgeEligibilityItem[];
}

export interface IRequiredDocumentItem {
  id: string;
  documentName: string;
  description?: string;
  badge?: string;
  isRequired: boolean;
  order: number;
}

export interface IRequiredDocumentsData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  documents: IRequiredDocumentItem[];
}

export interface IScholarshipItem {
  id: string;
  title: string;
  shortTitle?: string;
  discount: string;
  desc: string;
  eligibilityCriteria?: string;
  badge?: string;
  icon?: string;
  ctaText?: string;
  ctaUrl?: string;
  order: number;
  isActive: boolean;
}

export interface IScholarshipsData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  scholarships: IScholarshipItem[];
}

export interface IAdmissionsFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  featured?: boolean;
  order: number;
  isActive: boolean;
}

export interface IAdmissionsFaqData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  items: IAdmissionsFaqItem[];
}

export interface IAdmissionTypeItem {
  id: string;
  name: string;
  label: string;
  desc: string;
  icon: string;
  concessionTag?: string;
  order: number;
  isActive: boolean;
}

export interface ITransportRouteItem {
  id: string;
  name: string;
  code: string;
  description: string;
  areasCovered: string[];
  fee?: string;
  order: number;
  isActive: boolean;
}

export interface IDocumentRequirementRule {
  id: string;
  key: string;
  documentName: string;
  description: string;
  fileAccept: string;
  badge: string;
  isRequired: boolean;
  applicableTiers: ("earlyYears" | "primary" | "middle" | "secondary" | "higherSecondary" | "transfer" | "all")[];
  order: number;
  isActive: boolean;
}

export interface ISaturdayBookingData {
  isVisible: boolean;
  badge: string;
  title: string;
  highlightedLocation: string;
  description: string;
  scheduleBadge: string;
  officeHours: string;
  phone: string;
  whatsapp?: string;
  address: string;
  directionsUrl?: string;
  note?: string;
}

export interface IAdmissionsSEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
}

export interface IAdmissionsPageData {
  pageTitle: string;
  pageDescription: string;
  slug: string;
  isPublished: boolean;
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
}

export const DEFAULT_ADMISSIONS_PAGE_DATA: IAdmissionsPageData = {
  pageTitle: "Admissions & Fee Structure 2026–2027",
  pageDescription:
    "Official admission guidelines, transparent tuition fee calculator, Saturday diagnostic assessments, age criteria, and document requirements for Seneca Academy in Soldier Bazar, Karachi.",
  slug: "admissions",
  isPublished: true,
  sectionsOrder: [
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
  globalSettings: {
    admissionsOpen: true,
    admissionsSession: "Session 2026–2027",
    admissionsDeadline: "31st August 2026",
    openingDate: "01 June 2026",
    closingDate: "31 August 2026",
    admissionsNotice: "ADMISSIONS OPEN FOR SESSION 2026–27 (LIMITED SEATS)",
    admissionsClosedNotice:
      "Admissions for Session 2026–27 are currently closed. Inquiries open for next intake cycle.",
    admissionsAnnouncement:
      "Diagnostic assessments are conducted every Saturday from 9:00 AM to 1:00 PM at our Soldier Bazar Campus.",
    applicationSubmissionEnabled: true,
    diagnosticAssessmentEnabled: true,
    assessmentDay: "Every Saturday",
    assessmentStartTime: "09:00 AM",
    assessmentEndTime: "01:00 PM",
    assessmentCampus: "Soldier Bazar Campus, Karachi",
    admissionsPhone: "+92 335 7413777",
    admissionsEmail: "admissions@seneca.edu.pk",
    admissionsWhatsapp: "+92 335 7413777",
    admissionsOfficeAddress: "Soldier Bazar, Garden East, Karachi, Pakistan",
    applicationFeeEnabled: false,
    applicationFeeAmount: "Rs. 0 (Free Registration)",
    transportEnabled: true,
    documentUploadsMandatory: true,
    allowDuplicateApplications: false,
    maxActiveApplications: 1,
    generalInstructions:
      "Please ensure student B-Form and Father's CNIC are readily available before starting the application.",
    applyButtonText: "Apply for Admission Online",
    closedButtonText: "Register for Next Intake Waitlist",
  },
  hero: {
    isVisible: true,
    badge: "Admissions & Fees Session 2026–2027",
    badgeIcon: "GraduationCap",
    showBadge: true,
    title: "Transparent Fee Structure &",
    highlightedTitle: "Admission Process.",
    description:
      "Explore our transparent tuition breakdown, interactive cost calculator, Saturday assessment roadmap, and age eligibility criteria for Seneca Academy, Karachi.",
    breadcrumbs: [{ label: "Admissions & Fees" }],
    primaryCta: {
      isVisible: true,
      text: "Tuition Cost Calculator",
      href: "#fee-calculator",
    },
    secondaryCta: {
      isVisible: true,
      text: "Admission Roadmap",
      href: "#admission-process",
    },
    variant: "crimson",
  },
  statusBanner: {
    isVisible: true,
    openState: {
      badgeText: "Session 2026–2027 Live Intake",
      heading: "Admissions Open for Session 2026–2027",
      description:
        "Online enrollment applications are currently open across Playgroup, Primary, Middle, and BSEK Matriculation divisions. Complete verification online or visit our campus desk.",
      sessionText: "Academic Year 2026–27",
      deadlineText: "Final Deadline: 31st August 2026",
      applyButtonLabel: "Apply for Admission Online",
      secondaryButtonLabel: "Check Application Status",
      contactButtonText: "Helpline: +92 335 7413777",
      supportingText: "Zero Registration Fee • Saturday Assessments 9:00 AM – 1:00 PM",
    },
    closedState: {
      badgeText: "Admissions Notice",
      heading: "Admissions for Session 2026–2027 are Currently Closed",
      closedMessage:
        "Classroom capacity caps have been reached for the current intake. You may register for the next academic cycle waitlist or schedule an in-person counseling consultation.",
      contactCounselorsText: "Speak with Admissions Counselor",
      contactCounselorsHref: "/contact",
      exploreCurriculumText: "Explore Curriculum & Fees",
      exploreCurriculumHref: "/academics",
      waitingListMessage: "Inquiries open for upcoming 2027–2028 Academic Intake.",
      upcomingSessionMessage: "Next intake registrations commence December 2026.",
    },
  },
  roadmap: {
    isVisible: true,
    badge: "Clear 4-Step Roadmap",
    heading: "How Admission Works at Seneca Academy",
    description:
      "We ensure an objective, encouraging, and merit-focused admission journey for every prospective student and their family.",
    steps: [
      {
        id: "step-1",
        stepNumber: "01",
        title: "Campus Visit & Inquiry",
        description:
          "Visit our Soldier Bazar campus Monday to Saturday (8:00 AM – 3:00 PM) or contact our admissions desk to collect the official prospectus and registration pack.",
        badge: "INQUIRY",
        badgeVariant: "crimson",
        colorClass: "text-seneca-crimson bg-seneca-crimson/10 border-seneca-crimson/20",
        isHighlighted: false,
        order: 1,
        isActive: true,
      },
      {
        id: "step-2",
        stepNumber: "02",
        title: "Saturday Diagnostic Assessment",
        description:
          "Students participate in grade-readiness assessments in English, Mathematics, and General Science. Pre-school applicants attend an informal sensory observation session.",
        badge: "EVERY SATURDAY",
        badgeVariant: "amber",
        colorClass: "text-seneca-amber bg-seneca-amber/10 border-seneca-amber/20",
        isHighlighted: false,
        order: 2,
        isActive: true,
      },
      {
        id: "step-3",
        stepNumber: "03",
        title: "Leadership Dialogue & Offer",
        description:
          "Following the assessment, parents meet with the Academic Director for personalized feedback and discussion of the student's development goals.",
        badge: "SEAT CONFIRMATION",
        badgeVariant: "emerald",
        colorClass: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
        isHighlighted: true,
        order: 3,
        isActive: true,
      },
      {
        id: "step-4",
        stepNumber: "04",
        title: "LMS Activation & Onboarding",
        description:
          "Upon document verification and fee voucher deposit, newly enrolled students receive their custom Seneca LMS login credentials, uniform guide, and academic calendar.",
        badge: "PORTAL ACCESS",
        badgeVariant: "crimson",
        colorClass: "text-primary bg-primary/10 border-primary/20",
        isHighlighted: false,
        order: 4,
        isActive: true,
      },
    ],
  },
  feeStructure: {
    isVisible: true,
    badge: "Institutional Transparency",
    heading: "Fee Structure & Investment in Excellence",
    description:
      "Our transparent fee schedule supports high-caliber faculty salaries, modern STEM labs, and small class sizes. No hidden surcharges.",
    siblingDiscountPercent: 15,
    annualAdvanceDiscountPercent: 5,
    siblingDiscountLabel: "Apply Sibling Concession (15% off monthly tuition)",
    annualDiscountLabel: "Annual Advance (5% Extra Off)",
    disclaimerText: "Tuition vouchers are issued bi-monthly. Sibling concessions apply to the younger child.",
    applyButtonText: "Apply for this Grade",
    applyButtonHref: "#admissions",
    tiers: [
      {
        id: "tier-early-years",
        name: "Early Years & Montessori",
        badge: "Foundation",
        badgeColor: "emerald",
        gradeRange: "Playgroup to Kindergarten",
        admissionFee: 15000,
        securityDeposit: 5000,
        monthlyTuition: 6500,
        annualCharges: 4000,
        features: [
          "Activity-based Montessori Phonics",
          "Tactile Mathematics & Motor Skills",
          "Air-conditioned thematic activity rooms",
          "15:1 Student-to-Teacher Ratio",
        ],
        order: 1,
        isActive: true,
      },
      {
        id: "tier-primary",
        name: "Primary School",
        badge: "Inquiry",
        badgeColor: "sky",
        gradeRange: "Grade 1 to Grade 5",
        admissionFee: 20000,
        securityDeposit: 5000,
        monthlyTuition: 7800,
        annualCharges: 5500,
        features: [
          "Singapore Conceptual Mathematics",
          "Bilingual Phonics & Grammar Mastery",
          "Hands-on Science Explorations",
          "Introductory Coding & Computer Literacy",
        ],
        order: 2,
        isActive: true,
      },
      {
        id: "tier-middle",
        name: "Middle School",
        badge: "Analytical",
        badgeColor: "indigo",
        gradeRange: "Grade 6 to Grade 8",
        admissionFee: 25000,
        securityDeposit: 10000,
        monthlyTuition: 9200,
        annualCharges: 7000,
        labFund: 3000,
        features: [
          "Specialized Physics, Chemistry, Biology Modules",
          "Advanced ICT & Python Programming Logic",
          "Debate Club & Model United Nations Prep",
          "Sports Complex & Gymnasium Coaching",
        ],
        order: 3,
        isActive: true,
      },
      {
        id: "tier-matric",
        name: "Matriculation (BSEK)",
        badge: "Senior",
        badgeColor: "crimson",
        gradeRange: "Grade 9 & Grade 10",
        admissionFee: 30000,
        securityDeposit: 10000,
        monthlyTuition: 11000,
        annualCharges: 8000,
        features: [
          "Targeted Board Examination Coaching",
          "Physics, Chemistry & Bio Experimentation",
          "Computer Science Practical Projects",
          "Career Guidance & University Counseling",
        ],
        order: 4,
        isActive: true,
      },
    ],
  },
  eligibility: {
    isVisible: true,
    badge: "Enrollment Guidelines",
    heading: "Age Criteria & Class Divisions",
    description:
      "We strictly maintain small classroom sizes capped at 30–35 students per section to guarantee individual student mentorship.",
    items: [
      {
        id: "el-1",
        grade: "Nursery (Early Years)",
        age: "3.0 – 3.5 Years",
        seats: "30 Seats (Sec A, B, C, D)",
        focus: "Phonics, sensory-motor development, social play",
        order: 1,
        isActive: true,
      },
      {
        id: "el-2",
        grade: "Kindergarten (KG-I & KG-II)",
        age: "4.0 – 5.0 Years",
        seats: "30 Seats (Sec A, B, C, D)",
        focus: "Early numeracy, Jolly Phonics, bilingual foundations",
        order: 2,
        isActive: true,
      },
      {
        id: "el-3",
        grade: "Primary (Grades 1–5)",
        age: "5.5 – 10 Years",
        seats: "35 Seats (Sec A, B, C, D)",
        focus: "CPA Conceptual Math, General Science, STEM foundation",
        order: 3,
        isActive: true,
      },
      {
        id: "el-4",
        grade: "Middle (Grades 6–8)",
        age: "11 – 13.5 Years",
        seats: "35 Seats (Sec A, B, C, D)",
        focus: "Dedicated Science Labs, Python coding, English debates",
        order: 4,
        isActive: true,
      },
      {
        id: "el-5",
        grade: "Matriculation (Grades 9–10)",
        age: "14 – 16 Years",
        seats: "35 Seats (Sec A, B, C, D)",
        focus: "BSEK Board coaching in Pre-Medical, Pre-Eng & CS (100% Pass)",
        order: 5,
        isActive: true,
      },
      {
        id: "el-6",
        grade: "Intermediate (Grade 11 / A1)",
        age: "16 – 17.5 Years",
        seats: "35 Seats (Sec A, B, C, D)",
        focus: "BIEK / Cambridge AS & A-Levels (Pre-Med, Pre-Eng, Computer Science, Commerce)",
        order: 6,
        isActive: true,
      },
    ],
  },
  documents: {
    isVisible: true,
    badge: "Documentation Pack",
    heading: "Documents Required for Admission Verification",
    description:
      "Please present original documents along with photocopies during the enrollment confirmation desk visit.",
    documents: [
      {
        id: "doc-1",
        documentName: "Original & Copy of Student's NADRA Birth Certificate / Form-B",
        description: "Official proof of age and parentage",
        badge: "Mandatory",
        isRequired: true,
        order: 1,
      },
      {
        id: "doc-2",
        documentName: "4 Recent Passport-sized Photographs (white background)",
        description: "For student file, admission voucher, and security ID",
        badge: "Mandatory",
        isRequired: true,
        order: 2,
      },
      {
        id: "doc-3",
        documentName: "Attested Copies of Father / Guardian's Computerized CNIC",
        description: "Parent identity verification for school registry",
        badge: "Mandatory",
        isRequired: true,
        order: 3,
      },
      {
        id: "doc-4",
        documentName: "Original School Leaving Certificate (SLC) & Previous Academic Report Card (Grades 1–10)",
        description: "Required for transfer cases from recognized institutions",
        badge: "Mandatory",
        isRequired: true,
        order: 4,
      },
      {
        id: "doc-5",
        documentName: "Copy of Student's Immunization / Vaccination Record",
        description: "To ensure student health safety on campus",
        badge: "Mandatory",
        isRequired: true,
        order: 5,
      },
    ],
  },
  scholarships: {
    isVisible: true,
    badge: "Merit & Aid",
    heading: "Scholarships & Fee Concessions",
    description:
      "Seneca Academy is committed to rewarding exceptional academic talent and supporting deserving families through transparent concession schemes.",
    scholarships: [
      {
        id: "sch-1",
        title: "Karachi Board Merit Scholarship",
        discount: "100% Tuition Waiver",
        desc: "Granted to students securing top 10 positions across the Karachi Board matriculation examinations.",
        eligibilityCriteria: "Top 10 Board ranking verified via official gazette",
        badge: "Full Merit",
        order: 1,
        isActive: true,
      },
      {
        id: "sch-2",
        title: "Sibling Concession",
        discount: "15% Monthly Discount",
        desc: "Applied automatically to the monthly tuition of the second and every subsequent sibling enrolled concurrently.",
        eligibilityCriteria: "Both siblings active in regular rolls",
        badge: "Family Aid",
        order: 2,
        isActive: true,
      },
      {
        id: "sch-3",
        title: "Hafiz-e-Quran Concession",
        discount: "20% Tuition Waiver",
        desc: "Special recognition awarded to certified Huffaz upon successful verification by our Islamic Studies faculty.",
        eligibilityCriteria: "Sanad verification & oral evaluation",
        badge: "Religious Merit",
        order: 3,
        isActive: true,
      },
      {
        id: "sch-4",
        title: "Need-Based Financial Assistance",
        discount: "Up to 50% Concession",
        desc: "Evaluated confidentially by the Seneca Welfare Board for families facing demonstrable financial hardships.",
        eligibilityCriteria: "Income declaration and committee interview",
        badge: "Financial Aid",
        order: 4,
        isActive: true,
      },
    ],
  },
  faqs: {
    isVisible: true,
    badge: "Admissions Helpdesk",
    heading: "Frequently Asked Questions",
    description: "Got questions? We're here to answer everything about enrollment and assessments.",
    items: [
      {
        id: "faq-1",
        question: "When do admissions open for the 2026–2027 academic session?",
        answer:
          "Admissions for Session 2026–2027 are officially open. Diagnostic entrance assessments take place every Saturday at our Soldier Bazar campus.",
        category: "General",
        order: 1,
        isActive: true,
      },
      {
        id: "faq-2",
        question: "Is there any registration fee to take the entrance test?",
        answer:
          "No. Seneca Academy maintains complete transparency and charges zero application processing fees for registration or sitting the diagnostic assessment.",
        category: "Fees",
        order: 2,
        isActive: true,
      },
      {
        id: "faq-3",
        question: "What subjects are tested in the Grade 1 to 10 diagnostic assessment?",
        answer:
          "The test evaluates core competency in English (Reading Comprehension & Grammar), Mathematics (Problem Solving & Arithmetic), and General Science / Urdu.",
        category: "Assessment",
        order: 3,
        isActive: true,
      },
      {
        id: "faq-4",
        question: "What payment methods are supported for tuition fee vouchers?",
        answer:
          "Fees can be paid at Meezan Bank & HBL branches in Soldier Bazar, via 1Link/1Bill online banking apps, or directly at the school accounts desk using debit/credit cards.",
        category: "Fees",
        order: 4,
        isActive: true,
      },
    ],
  },
  admissionTypes: [
    {
      id: "Regular",
      name: "Regular",
      label: "Regular Admission",
      desc: "Standard fresh academic session intake for Montessori to College",
      icon: "GraduationCap",
      order: 1,
      isActive: true,
    },
    {
      id: "Transfer",
      name: "Transfer",
      label: "Transfer / Migration",
      desc: "Joining from another school with valid School Leaving Certificate (SLC)",
      icon: "BookOpen",
      order: 2,
      isActive: true,
    },
    {
      id: "Sibling",
      name: "Sibling",
      label: "Sibling Admission",
      desc: "20% sibling tuition concession applied automatically on concurrent rolls",
      icon: "Heart",
      concessionTag: "20% Tuition Discount",
      order: 3,
      isActive: true,
    },
    {
      id: "Scholarship",
      name: "Scholarship",
      label: "Merit Scholarship",
      desc: "High academic distinction, sports excellence or Board position holders",
      icon: "Award",
      concessionTag: "Up to 100% Waiver",
      order: 4,
      isActive: true,
    },
    {
      id: "Provisional",
      name: "Provisional",
      label: "Provisional Intake",
      desc: "Conditional admission pending official Board / School result declaration",
      icon: "Clock",
      order: 5,
      isActive: true,
    },
  ],
  transportRoutes: [
    {
      id: "self",
      name: "Self Pick & Drop",
      code: "ROUTE-0",
      description: "Self Pick & Drop (No School Transport Required)",
      areasCovered: ["Campus Direct Access"],
      fee: "Free",
      order: 1,
      isActive: true,
    },
    {
      id: "route-1",
      name: "Route 1",
      code: "ROUTE-1",
      description: "Soldier Bazar • Garden East • Lasbela • Nishtar Road",
      areasCovered: ["Soldier Bazar", "Garden East", "Lasbela", "Nishtar Road", "Albemarle Road"],
      fee: "Rs. 3,500 / month",
      order: 2,
      isActive: true,
    },
    {
      id: "route-2",
      name: "Route 2",
      code: "ROUTE-2",
      description: "PECHS • Tariq Road • Bahadurabad • Khalid Bin Waleed",
      areasCovered: ["PECHS Block 2 & 6", "Tariq Road", "Bahadurabad", "Kashmir Road"],
      fee: "Rs. 4,500 / month",
      order: 3,
      isActive: true,
    },
    {
      id: "route-3",
      name: "Route 3",
      code: "ROUTE-3",
      description: "Gulshan-e-Iqbal • NIPA • University Road • Hassan Square",
      areasCovered: ["Gulshan Blocks 1-7", "NIPA", "Hassan Square", "Civic Center"],
      fee: "Rs. 5,000 / month",
      order: 4,
      isActive: true,
    },
    {
      id: "route-4",
      name: "Route 4",
      code: "ROUTE-4",
      description: "Saddar • Clifton • DHA Phase 1 & 2 • Cantt Station",
      areasCovered: ["Saddar", "Cantt Station", "Clifton Blocks 2-5", "DHA Phase 1 & 2"],
      fee: "Rs. 5,500 / month",
      order: 5,
      isActive: true,
    },
    {
      id: "route-5",
      name: "Route 5",
      code: "ROUTE-5",
      description: "North Nazimabad • Nazimabad • Liaquatabad • Teen Hatti",
      areasCovered: ["North Nazimabad Blocks A-N", "Nazimabad 1-4", "Liaquatabad", "Teen Hatti"],
      fee: "Rs. 4,500 / month",
      order: 6,
      isActive: true,
    },
    {
      id: "route-6",
      name: "Route 6",
      code: "ROUTE-6",
      description: "Federal B Area • Water Pump • Aisha Manzil • Dastagir",
      areasCovered: ["FB Area Blocks 1-16", "Water Pump", "Aisha Manzil", "Yaseenabad"],
      fee: "Rs. 4,500 / month",
      order: 7,
      isActive: true,
    },
  ],
  documentRules: [
    {
      id: "bForm",
      key: "bForm",
      documentName: "Student Official B-Form / Birth Certificate",
      description: "NADRA B-Form or Union Council Birth Certificate (clear photo/scan)",
      fileAccept: "image/*,.pdf",
      badge: "Required",
      isRequired: true,
      applicableTiers: ["all"],
      order: 1,
      isActive: true,
    },
    {
      id: "fatherCnic",
      key: "fatherCnic",
      documentName: "Father / Guardian CNIC (Front & Back)",
      description: "National Identity Card of Father or Legal Guardian",
      fileAccept: "image/*,.pdf",
      badge: "Required",
      isRequired: true,
      applicableTiers: ["all"],
      order: 2,
      isActive: true,
    },
    {
      id: "photos",
      key: "photos",
      documentName: "4x Passport Size Blue-Bg Photographs",
      description: "Recent blue background passport photos for student file & ID card",
      fileAccept: "image/*",
      badge: "Required",
      isRequired: true,
      applicableTiers: ["all"],
      order: 3,
      isActive: true,
    },
    {
      id: "motherCnic",
      key: "motherCnic",
      documentName: "Mother CNIC Copy",
      description: "National Identity Card of Mother (optional for registry archive)",
      fileAccept: "image/*,.pdf",
      badge: "Optional",
      isRequired: false,
      applicableTiers: ["all"],
      order: 4,
      isActive: true,
    },
    {
      id: "medicalReport",
      key: "medicalReport",
      documentName: "Child Vaccination & Immunization Record",
      description: "Polio, BCG, EPI vaccination card or child health certificate",
      fileAccept: "image/*,.pdf",
      badge: "Optional",
      isRequired: false,
      applicableTiers: ["earlyYears", "primary"],
      order: 5,
      isActive: true,
    },
    {
      id: "prevReport",
      key: "prevReport",
      documentName: "Previous School Final Report Card / Marksheet",
      description: "Official transcript or report card of the last completed grade",
      fileAccept: "image/*,.pdf",
      badge: "Required",
      isRequired: true,
      applicableTiers: ["primary", "middle", "secondary", "higherSecondary", "transfer"],
      order: 6,
      isActive: true,
    },
    {
      id: "slcCertificate",
      key: "slcCertificate",
      documentName: "Original School Leaving Certificate (SLC / CLC)",
      description: "Counter-signed SLC from the previous educational institution",
      fileAccept: "image/*,.pdf",
      badge: "Required",
      isRequired: true,
      applicableTiers: ["primary", "middle", "secondary", "higherSecondary", "transfer"],
      order: 7,
      isActive: true,
    },
    {
      id: "characterCertificate",
      key: "characterCertificate",
      documentName: "Character / Conduct Certificate",
      description: "Testimonial issued by previous school Principal / Headmaster",
      fileAccept: "image/*,.pdf",
      badge: "Optional",
      isRequired: false,
      applicableTiers: ["secondary", "higherSecondary", "transfer"],
      order: 8,
      isActive: true,
    },
  ],
  saturdayBooking: {
    isVisible: true,
    badge: "Saturday Diagnostic Assessments & Campus Desk",
    title: "Visit Seneca Academy in",
    highlightedLocation: "Soldier Bazar",
    description:
      "Our admissions office is open Monday to Saturday, 8:00 AM to 3:00 PM. Schedule your child's Saturday diagnostic assessment or speak one-on-one with our senior academic counselors.",
    scheduleBadge: "Every Saturday • 9:00 AM – 1:00 PM",
    officeHours: "Mon – Sat: 8:00 AM – 3:00 PM",
    phone: "+92 335 7413777",
    whatsapp: "+92 335 7413777",
    address: "Soldier Bazar, Garden East, Karachi, Pakistan",
    directionsUrl: "/contact",
    note: "No pre-booking fee required. Walk-ins welcome with prior phone notice.",
  },
  seo: {
    metaTitle: "Admissions & Fee Structure 2026–2027 — Seneca Academy Karachi",
    metaDescription:
      "Official admission guidelines, transparent tuition fee calculator, Saturday diagnostic assessments, age criteria, and document requirements for Seneca Academy in Soldier Bazar, Karachi.",
    keywords: [
      "Seneca Academy admissions",
      "Karachi school admissions 2026",
      "Soldier Bazar school fees",
      "Matric school admission Karachi",
      "Montessori admission Karachi",
      "Seneca fee structure",
    ],
    ogImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
  },
};

