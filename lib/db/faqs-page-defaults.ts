export interface IFaqsHeroData {
  isVisible: boolean;
  badge: string;
  badgeIcon?: string;
  title: string;
  highlightedTitle?: string;
  description: string;
  leftSpecChip: {
    badgeText: string;
    description: string;
    icon: string;
  };
  rightSpecChip: {
    badgeText: string;
    description: string;
    icon: string;
  };
  primaryCta: {
    isVisible: boolean;
    text: string;
    href: string;
  };
  secondaryCta: {
    isVisible: boolean;
    text: string;
    href: string;
  };
  variant?: "crimson" | "amber" | "emerald" | "default";
}

export interface IFaqCategory {
  id: string;
  label: string;
  icon: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface IFaqQuestionItem {
  id: string;
  categoryId: string;
  categoryLabel: string;
  question: string;
  answer: string;
  tags: string[];
  isHighlighted?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface IFaqStatItem {
  id: string;
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface IFaqsStatsData {
  isVisible: boolean;
  badge: string;
  heading: string;
  items: IFaqStatItem[];
}

export interface IFaqsHelpdeskData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  phone: string;
  phoneHours: string;
  email: string;
  emailResponseTime: string;
  campusAddress: string;
  whatsappNumber: string;
}

export interface ISEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
}

export interface IFaqsPageData {
  sectionsOrder: string[];
  hero: IFaqsHeroData;
  categories: IFaqCategory[];
  questions: IFaqQuestionItem[];
  stats: IFaqsStatsData;
  helpdesk: IFaqsHelpdeskData;
  seo: ISEOData;
}

export const DEFAULT_FAQS_PAGE_DATA: IFaqsPageData = {
  sectionsOrder: ["hero", "stats", "questions", "helpdesk"],

  hero: {
    isVisible: true,
    badge: "Institutional Knowledge Base",
    badgeIcon: "HelpCircle",
    title: "Frequently Asked Questions &",
    highlightedTitle: "Admissions Helpdesk.",
    description:
      "Find instant, verified answers regarding our admission roadmaps, Cambridge & BSEK matriculation streams, fee structures, faculty standards, and Seneca LMS portal.",
    leftSpecChip: {
      badgeText: "20+ Verified Answers",
      description: "Updated for Academic Session 2026–2027",
      icon: "CheckCircle2",
    },
    rightSpecChip: {
      badgeText: "Direct Counseling",
      description: "Saturday Assessment & Campus Helpdesk",
      icon: "PhoneCall",
    },
    primaryCta: {
      isVisible: true,
      text: "Explore Admissions & Fees",
      href: "/admissions",
    },
    secondaryCta: {
      isVisible: true,
      text: "Contact Helpdesk",
      href: "/contact",
    },
    variant: "amber",
  },

  categories: [
    { id: "all", label: "All Questions", icon: "HelpCircle", displayOrder: 0, isVisible: true },
    { id: "admissions", label: "Admissions & Enrollment", icon: "GraduationCap", displayOrder: 1, isVisible: true },
    { id: "academics", label: "Academics & Board", icon: "BookOpen", displayOrder: 2, isVisible: true },
    { id: "fees", label: "Fees & Scholarships", icon: "CreditCard", displayOrder: 3, isVisible: true },
    { id: "campus", label: "Campus & Facilities", icon: "Building2", displayOrder: 4, isVisible: true },
    { id: "lms", label: "Seneca LMS Portal", icon: "Laptop", displayOrder: 5, isVisible: true },
  ],

  questions: [
    // 1. Admissions
    {
      id: "adm-1",
      categoryId: "admissions",
      categoryLabel: "Admissions & Enrollment",
      question: "What is the admissions procedure for Session 2026–2027?",
      answer:
        "Admissions follow a streamlined 4-step roadmap: (1) Visit our Soldier Bazar campus or call the admissions desk to collect the registration pack; (2) Attend the diagnostic assessment on any Saturday; (3) Meet the Academic Director for leadership dialogue; and (4) Complete document verification and obtain your Seneca LMS login credentials.",
      tags: ["admissions", "process", "enrollment", "roadmap", "2026"],
      isHighlighted: true,
      displayOrder: 1,
      isActive: true,
    },
    {
      id: "adm-2",
      categoryId: "admissions",
      categoryLabel: "Admissions & Enrollment",
      question: "Is there any application processing or entrance assessment fee?",
      answer:
        "No. Seneca Academy maintains absolute transparency and charges PKR 0 for submitting the initial application inquiry or sitting for the Saturday diagnostic assessment.",
      tags: ["admissions", "free", "fee", "cost", "zero charge"],
      isHighlighted: false,
      displayOrder: 2,
      isActive: true,
    },
    {
      id: "adm-3",
      categoryId: "admissions",
      categoryLabel: "Admissions & Enrollment",
      question: "What subjects are tested in the diagnostic assessment?",
      answer:
        "For Pre-School (Montessori to KG), children participate in an informal sensory observation session. For Grades 1 through 10, candidates sit for an age-appropriate diagnostic test covering English (Reading & Grammar), Mathematics (Problem Solving & Arithmetic), and General Science / Urdu.",
      tags: ["assessment", "test", "subjects", "english", "math", "science"],
      isHighlighted: false,
      displayOrder: 3,
      isActive: true,
    },
    {
      id: "adm-4",
      categoryId: "admissions",
      categoryLabel: "Admissions & Enrollment",
      question: "What documents are required during admission verification?",
      answer:
        "You will need: (1) Original & photocopy of student's NADRA Birth Certificate / Form-B; (2) 4 passport-sized photographs (white background); (3) Attested copies of Father/Guardian CNIC; (4) School Leaving Certificate (SLC) & previous report cards (for Grade 1 and above); and (5) Vaccination record copy.",
      tags: ["documents", "b-form", "cnic", "slc", "requirements"],
      isHighlighted: false,
      displayOrder: 4,
      isActive: true,
    },
    {
      id: "adm-5",
      categoryId: "admissions",
      categoryLabel: "Admissions & Enrollment",
      question: "Can students transfer into Seneca Academy mid-academic term?",
      answer:
        "Yes, subject to seat availability in the requested grade level and presentation of a valid School Leaving Certificate (SLC) and clear academic transcripts from the previous accredited school.",
      tags: ["transfer", "mid-term", "relocation", "seats"],
      isHighlighted: false,
      displayOrder: 5,
      isActive: true,
    },

    // 2. Academics
    {
      id: "acad-1",
      categoryId: "academics",
      categoryLabel: "Academics & Board",
      question: "Which educational board is Seneca Academy affiliated with?",
      answer:
        "Seneca Academy is officially recognized by the Directorate of Inspection & Registration of Private Educational Institutions Sindh (DIRIS) and affiliated with the Board of Secondary Education Karachi (BSEK).",
      tags: ["affiliation", "board", "bsek", "matric", "diris"],
      isHighlighted: true,
      displayOrder: 6,
      isActive: true,
    },
    {
      id: "acad-2",
      categoryId: "academics",
      categoryLabel: "Academics & Board",
      question: "What academic streams are offered in Grades 9 and 10?",
      answer:
        "We offer specialized matriculation groups: (1) Computer Science Group (with modern Python coding and robotics micro-controllers) and (2) Bio-Science Group (with dedicated Physics, Chemistry, and Biology laboratory modules).",
      tags: ["streams", "computer science", "biology", "matric", "grade 9", "grade 10"],
      isHighlighted: false,
      displayOrder: 7,
      isActive: true,
    },
    {
      id: "acad-3",
      categoryId: "academics",
      categoryLabel: "Academics & Board",
      question: "What is Seneca Academy's track record in Karachi Board examinations?",
      answer:
        "Seneca Academy holds a consistent 100% board pass rate record with over 85% of our candidates achieving A-One and A grades in BSEK annual examinations.",
      tags: ["results", "distinction", "100%", "board results", "achievements"],
      isHighlighted: false,
      displayOrder: 8,
      isActive: true,
    },
    {
      id: "acad-4",
      categoryId: "academics",
      categoryLabel: "Academics & Board",
      question: "Do Seneca Academy students require evening private tuitions?",
      answer:
        "No. Our rigorous classroom pedagogy, conceptual learning frameworks, weekly revision mock series, and remedial mentorship periods during school hours are intentionally designed so students do not need external evening tuitions.",
      tags: ["tuition", "coaching", "after-school", "mentorship"],
      isHighlighted: false,
      displayOrder: 9,
      isActive: true,
    },

    // 3. Fees & Scholarships
    {
      id: "fee-1",
      categoryId: "fees",
      categoryLabel: "Fees & Scholarships",
      question: "Where can I view the itemized fee structure?",
      answer:
        "You can access our interactive Fee Calculator on the Admissions & Fees page. It provides real-time monthly tuition breakdowns, admission charges, refundable security deposits, and annual resource costs for Montessori through Matriculation.",
      tags: ["fees", "tuition", "cost", "calculator", "breakdown"],
      isHighlighted: true,
      displayOrder: 10,
      isActive: true,
    },
    {
      id: "fee-2",
      categoryId: "fees",
      categoryLabel: "Fees & Scholarships",
      question: "Are sibling discounts available for families with multiple children?",
      answer:
        "Yes. Seneca Academy automatically provides a 15% concession on monthly tuition for the second child and each subsequent sibling enrolled concurrently.",
      tags: ["sibling", "discount", "concession", "family"],
      isHighlighted: false,
      displayOrder: 11,
      isActive: true,
    },
    {
      id: "fee-3",
      categoryId: "fees",
      categoryLabel: "Fees & Scholarships",
      question: "What scholarships and financial concessions are offered?",
      answer:
        "We offer: (1) Karachi Board Merit Scholarship (100% tuition waiver for top position holders); (2) Sibling Concession (15% monthly discount); (3) Hafiz-e-Quran Concession (20% waiver); and (4) Need-Based Financial Assistance (up to 50% concession for deserving families evaluated by the Seneca Welfare Board).",
      tags: ["scholarship", "financial aid", "merit", "hafiz", "waiver"],
      isHighlighted: false,
      displayOrder: 12,
      isActive: true,
    },
    {
      id: "fee-4",
      categoryId: "fees",
      categoryLabel: "Fees & Scholarships",
      question: "What payment channels are supported for fee voucher deposits?",
      answer:
        "Tuition fee vouchers can be paid via: (1) Meezan Bank branches; (2) Habib Bank Limited (HBL) branches; (3) Online banking & mobile apps using 1Link / 1Bill consumer codes; and (4) Directly at the school accounts desk using debit/credit cards.",
      tags: ["payment", "meezan", "hbl", "1link", "online payment", "bank"],
      isHighlighted: false,
      displayOrder: 13,
      isActive: true,
    },

    // 4. Campus & Faculty
    {
      id: "cam-1",
      categoryId: "campus",
      categoryLabel: "Campus & Facilities",
      question: "Where is Seneca Academy located in Karachi?",
      answer:
        "Our main campus is centrally located in Soldier Bazar, Garden East, Karachi, Pakistan, offering secure access, 24/7 CCTV surveillance, and dedicated pick-up/drop-off zones.",
      tags: ["location", "soldier bazar", "karachi", "address", "campus"],
      isHighlighted: true,
      displayOrder: 14,
      isActive: true,
    },
    {
      id: "cam-2",
      categoryId: "campus",
      categoryLabel: "Campus & Facilities",
      question: "What is the typical class size and student-teacher ratio?",
      answer:
        "We strictly cap our classrooms at 30 students for Early Years/Montessori and 35 students for Primary, Middle, and Senior sections. Our overall campus student-to-teacher ratio is maintained at 15:1.",
      tags: ["ratio", "class size", "capacity", "mentorship"],
      isHighlighted: false,
      displayOrder: 15,
      isActive: true,
    },
    {
      id: "cam-3",
      categoryId: "campus",
      categoryLabel: "Campus & Facilities",
      question: "What science and computer laboratory facilities exist?",
      answer:
        "Our campus features dedicated Physics, Chemistry, and Biology experimentation laboratories equipped with modern apparatus, as well as a STEM Computer Studio with high-speed internet and robotics micro-controllers.",
      tags: ["labs", "stem", "physics", "chemistry", "biology", "computer lab"],
      isHighlighted: false,
      displayOrder: 16,
      isActive: true,
    },

    // 5. Seneca LMS Portal
    {
      id: "lms-1",
      categoryId: "lms",
      categoryLabel: "Seneca LMS Portal",
      question: "What is the Seneca LMS Portal and how do students & parents access it?",
      answer:
        "Seneca LMS is our integrated cloud portal connecting students, parents, and teachers. It provides live attendance tracking, homework assignments, online quizzes, digital fee vouchers, and terminal examination report cards. Credentials are provided upon enrollment.",
      tags: ["lms", "portal", "login", "portal access", "attendance"],
      isHighlighted: true,
      displayOrder: 17,
      isActive: true,
    },
    {
      id: "lms-2",
      categoryId: "lms",
      categoryLabel: "Seneca LMS Portal",
      question: "Can parents monitor daily attendance and academic progress online?",
      answer:
        "Yes. Parents can log into the Seneca LMS from any smartphone or computer to view instant daily attendance, teacher feedback, upcoming exam schedules, and graded assignment results.",
      tags: ["parent portal", "monitoring", "grades", "progress", "homework"],
      isHighlighted: false,
      displayOrder: 18,
      isActive: true,
    },
    {
      id: "lms-3",
      categoryId: "lms",
      categoryLabel: "Seneca LMS Portal",
      question: "What should I do if I forget my LMS portal login credentials?",
      answer:
        "You can reset your password using the 'Forgot Password' link on the LMS Login page, or contact the Seneca IT Helpdesk at info@seneca.edu.pk / +92 335 7413777 for instant reset assistance.",
      tags: ["password", "reset", "helpdesk", "credentials", "support"],
      isHighlighted: false,
      displayOrder: 19,
      isActive: true,
    },
  ],

  stats: {
    isVisible: true,
    badge: "Key Highlights",
    heading: "Institutional Proof Points & Standards",
    items: [
      {
        id: "stat-1",
        value: "100%",
        label: "Board Pass Rate",
        description: "Consistent A-One & A grades in BSEK matric exams",
        icon: "Award",
      },
      {
        id: "stat-2",
        value: "PKR 0",
        label: "Assessment Fee",
        description: "Zero registration cost for Saturday entrance evaluation",
        icon: "CreditCard",
      },
      {
        id: "stat-3",
        value: "15:1",
        label: "Student-Teacher Ratio",
        description: "Small batches capped at max 35 students per class",
        icon: "Users",
      },
      {
        id: "stat-4",
        value: "15%",
        label: "Sibling Concession",
        description: "Automatic monthly discount for 2nd child & beyond",
        icon: "HeartHandshake",
      },
    ],
  },

  helpdesk: {
    isVisible: true,
    badge: "Personalized Assistance",
    heading: "Still Have Questions?",
    description:
      "Our academic counselors and admissions officers are here to assist you with any inquiries regarding admissions, curriculum, or enrollment.",
    phone: "+92 335 7413777",
    phoneHours: "Mon – Sat, 8:00 AM – 3:00 PM",
    email: "info@seneca.edu.pk",
    emailResponseTime: "Response within 24 business hours",
    campusAddress: "Soldier Bazar, Garden East, Karachi, Pakistan",
    whatsappNumber: "+92 335 7413777",
  },

  seo: {
    metaTitle: "Frequently Asked Questions (FAQs) — Seneca Academy Karachi",
    metaDescription:
      "Find instant answers to common questions regarding admissions, fees, BSEK matriculation curriculum, Seneca LMS portal, and campus life in Soldier Bazar, Karachi.",
    keywords: [
      "Seneca Academy FAQs",
      "Karachi school questions",
      "matric admissions Karachi",
      "school fee discounts Karachi",
      "Seneca LMS login help",
      "Soldier Bazar school timings",
    ],
    ogImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  },
};
