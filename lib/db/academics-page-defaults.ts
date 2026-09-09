export interface IAcademicsHeroData {
  isVisible: boolean;
  badge: string;
  badgeIcon: string;
  showBadge: boolean;
  title: string;
  highlightedTitle: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  variant: "amber" | "crimson" | "emerald" | "default";
  admissionsOpenState: {
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
  };
  admissionsClosedState: {
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
  };
}

export interface IAcademicDivisionItem {
  id: string;
  name: string;
  badge: string;
  gradeRange: string;
  description: string;
  image: string;
  imageAlt?: string;
  subjects: string[];
  highlights: string[];
  highlightStatement?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface IAcademicDivisionsData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  items: IAcademicDivisionItem[];
}

export interface IStemFeatureItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  iconColor?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface IStemInnovationData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  items: IStemFeatureItem[];
}

export interface IAssessmentTierItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  theme: "crimson" | "amber" | "emerald" | "default";
  badgeColorClass: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface IAssessmentStandardsData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  items: IAssessmentTierItem[];
}

export interface ITrustCardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  theme?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface IAcademicsCtaData {
  isVisible: boolean;
  eyebrowActiveTemplate: string;
  eyebrowInactiveTemplate: string;
  mainHeading: string;
  highlightedHeading: string;
  descriptionOpenTemplate: string;
  descriptionClosedTemplate: string;
  admissionsOpenCtas: {
    primary: { isVisible: boolean; text: string; href: string };
    secondary: { isVisible: boolean; text: string; href: string };
  };
  admissionsClosedCtas: {
    primary: { isVisible: boolean; text: string; href: string };
    secondary: { isVisible: boolean; text: string; href: string };
  };
  trustCards: ITrustCardItem[];
  helpline: {
    isVisible: boolean;
    prefixText: string;
    linkTextTemplate: string;
  };
  backgroundTheme: "crimsonLuxury" | "amberLuxury" | "dark" | "default";
}

export interface IAcademicsSEOData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
}

export interface ISenecaDifferencePillar {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description: string;
  icon?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface ISenecaDifferenceData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  items: ISenecaDifferencePillar[];
}

export interface IAcademicsPageContent {
  pageTitle: string;
  pageDescription: string;
  slug: string;
  isPublished: boolean;
  sectionsOrder: string[];
  hero: IAcademicsHeroData;
  academicDivisions: IAcademicDivisionsData;
  stemInnovation: IStemInnovationData;
  assessmentStandards: IAssessmentStandardsData;
  ctaBanner: IAcademicsCtaData;
  senecaDifference?: ISenecaDifferenceData;
  seo: IAcademicsSEOData;
}

export const DEFAULT_ACADEMICS_PAGE_DATA: IAcademicsPageContent = {
  pageTitle: "Academics & Curriculum — Seneca Academy Karachi",
  pageDescription:
    "Explore Seneca Academy's structured academic divisions from Early Years Montessori to Senior Matriculation (BSEK). Discover our STEM labs, sciences, and humanities curriculum.",
  slug: "academics",
  isPublished: true,
  sectionsOrder: [
    "hero",
    "academicDivisions",
    "stemInnovation",
    "assessmentStandards",
    "ctaBanner",
  ],
  senecaDifference: {
    isVisible: true,
    badge: "The Seneca Difference",
    heading: "Why Families Choose Seneca Academy",
    description:
      "We cultivate a vibrant intellectual environment where children are valued as unique individuals and guided toward exemplary achievements.",
    items: [
      {
        id: "diff-1",
        title: "Inquiry & Board Rigor",
        badge: "Curriculum Rigor",
        subtitle: "Conceptual Clarity",
        description:
          "Combining 21st-century conceptual thinking with structured matriculation board coaching. Our students master concepts without rote dependency.",
        icon: "GraduationCap",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "diff-2",
        title: "Master-Level Faculty",
        badge: "Distinguished Mentors",
        subtitle: "Personalized Guidance",
        description:
          "Over 50 experienced educators holding post-graduate degrees who mentor each child individually with small 35-student classroom caps.",
        icon: "Users",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "diff-3",
        title: "STEM & Robotics Lab",
        badge: "Next-Gen Tech",
        subtitle: "Future Ready",
        description:
          "Dedicated computer labs, Python coding modules, experimental science apparatus, and interactive digital smart boards.",
        icon: "Sparkles",
        displayOrder: 3,
        isVisible: true,
      },
    ],
  },
  hero: {
    isVisible: true,
    badge: "Curriculum & Academic Spectrum",
    badgeIcon: "BookOpen",
    showBadge: true,
    title: "Comprehensive Pathways from",
    highlightedTitle: "Montessori to Matric.",
    description:
      "Our progressive curriculum is engineered to ignite curiosity in early childhood, build conceptual mastery in middle school, and secure top positions in Karachi Board matriculation examinations.",
    breadcrumbs: [{ label: "Academics" }],
    variant: "amber",
    admissionsOpenState: {
      primaryCta: {
        isVisible: true,
        text: "Apply for Admission",
        href: "/admissions",
      },
      secondaryCta: {
        isVisible: true,
        text: "View Fee Schedule",
        href: "/fees",
      },
    },
    admissionsClosedState: {
      primaryCta: {
        isVisible: true,
        text: "View Fee Schedule",
        href: "/fees",
      },
      secondaryCta: {
        isVisible: true,
        text: "Contact Admissions",
        href: "/contact",
      },
    },
  },
  academicDivisions: {
    isVisible: true,
    badge: "Educational Wings",
    heading: "Structured Academic Divisions",
    description: "Pedagogical journeys tailored to each cognitive developmental milestone.",
    items: [
      {
        id: "stage-1",
        name: "Early Years & Montessori",
        badge: "Foundation Phase",
        gradeRange: "Playgroup to Kindergarten (Ages 3–5)",
        description:
          "Our early childhood pedagogy blends authentic Montessori apparatus with multi-sensory phonics, cognitive discovery, and social motor skill development in safe, air-conditioned themed learning spaces.",
        image:
          "https://images.unsplash.com/photo-1587691592099-24045742c181?auto=format&fit=crop&w=800&q=80",
        imageAlt: "Early Years & Montessori Classroom",
        subjects: [
          "Jolly Phonics & Pre-Reading Fluency",
          "Sensory Motor Apparatus & Tactile Math",
          "Urdu Phonics & Oral Expression",
          "Creative Arts, Music & Rhythms",
          "15:1 Student-to-Teacher Ratio with dedicated assistant",
        ],
        highlights: [
          "Montessori Method",
          "Phonics Fluency",
          "Tactile Mathematics",
          "15:1 Ratio",
        ],
        highlightStatement: "Foundation Phase Educational Standard",
        displayOrder: 1,
        isActive: true,
      },
      {
        id: "stage-2",
        name: "Primary School",
        badge: "Inquiry Phase",
        gradeRange: "Grade 1 to Grade 5 (Ages 6–10)",
        description:
          "Primary years transition students into conceptual inquiry. We implement Singapore-style Concrete-Pictorial-Abstract (CPA) mathematics, experimental general science labs, bilingual English/Urdu reading comprehension, and digital literacy.",
        image:
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
        imageAlt: "Primary School Students in Science Lab",
        subjects: [
          "Singapore Conceptual Mathematics",
          "Inquiry-based General Science & Nature Studies",
          "English Literature & Creative Writing",
          "Computer Literacy & Block Coding Logic",
          "Weekly hands-on laboratory experiments",
        ],
        highlights: [
          "Singapore CPA Math",
          "General Science Lab",
          "Bilingual Literacy",
          "Digital Logic",
        ],
        highlightStatement: "Inquiry Phase Educational Standard",
        displayOrder: 2,
        isActive: true,
      },
      {
        id: "stage-3",
        name: "Middle School",
        badge: "Analytical Phase",
        gradeRange: "Grade 6 to Grade 8 (Ages 11–13)",
        description:
          "Middle school sharpens abstract reasoning and laboratory discipline. Students study separate Physics, Chemistry, and Biology modules, write algorithmic Python code, participate in Model United Nations style debates, and conduct historical research.",
        image:
          "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
        imageAlt: "Middle School Robotics and Science Workstations",
        subjects: [
          "Physics (Mechanics, Optics, Energy)",
          "Chemistry (Matter, Reactions, Atomic Structure)",
          "Biology (Cellular Systems, Genetics, Ecology)",
          "Advanced Mathematics & Python Coding",
          "Model UN & Debate Society",
        ],
        highlights: [
          "Separate Sciences",
          "Python Coding",
          "Advanced Math",
          "Model UN Society",
        ],
        highlightStatement: "Analytical Phase Educational Standard",
        displayOrder: 3,
        isActive: true,
      },
      {
        id: "stage-4",
        name: "Senior & Board Matriculation",
        badge: "Leadership & Board Phase",
        gradeRange: "Grade 9 & Grade 10 (Ages 14–16)",
        description:
          "An intensive, result-oriented coaching framework affiliated with the Board of Secondary Education Karachi (BSEK). We provide comprehensive syllabus coverage, mock examination series, and specialized laboratory practicals.",
        image:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
        imageAlt: "Senior Secondary Board Examination Preparation",
        subjects: [
          "Computer Science & Pre-Medical Cohorts",
          "Intensive Board Mock Series & Lab Practicals",
          "100% Board Distinction Track Record",
          "Targeted University Entrance Counseling",
        ],
        highlights: [
          "CS & Pre-Med Tracks",
          "100% Distinction Record",
          "Mock Exam Series",
          "Career Counseling",
        ],
        highlightStatement: "Leadership & Board Phase Educational Standard",
        displayOrder: 4,
        isActive: true,
      },
    ],
  },
  stemInnovation: {
    isVisible: true,
    badge: "Innovation Studio",
    heading: "STEM, Coding & Laboratory Science",
    description: "We empower students to be creators of technology, not merely passive consumers.",
    items: [
      {
        id: "stem-1",
        title: "Python & Algorithmic Logic",
        desc: "Starting in Grade 6, students learn real-world syntax, conditional logic, and algorithmic problem solving.",
        icon: "Binary",
        iconColor: "text-seneca-crimson dark:text-seneca-amber-light",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "stem-2",
        title: "Robotics & Hardware Labs",
        desc: "Hands-on projects with micro-controllers, sensors, and mechanical circuits in our dedicated innovation studio.",
        icon: "Cpu",
        iconColor: "text-seneca-amber",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "stem-3",
        title: "Practical Sciences",
        desc: "Individual workstations for Physics, Chemistry, and Biology experiments aligned with modern safety standards.",
        icon: "Microscope",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        displayOrder: 3,
        isVisible: true,
      },
    ],
  },
  assessmentStandards: {
    isVisible: true,
    badge: "Assessment Standards",
    heading: "Rigorous Evaluation & Continuous Feedback",
    description: "We evaluate student growth through continuous formative assessments and structured term examinations.",
    items: [
      {
        id: "assess-1",
        tag: "Monthly Checks",
        title: "Diagnostic Quizzes",
        description: "Bi-weekly low-stakes quizzes to identify learning gaps immediately and provide personalized remediation.",
        theme: "crimson",
        badgeColorClass: "text-seneca-crimson dark:text-seneca-amber-light",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "assess-2",
        tag: "Term Exams",
        title: "Mid-Term & Finals",
        description: "Comprehensive semester examinations with official report cards, class rankings, and teacher feedback remarks.",
        theme: "amber",
        badgeColorClass: "text-seneca-amber",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "assess-3",
        tag: "Board Simulations",
        title: "Senior Mock Series",
        description: "Full 3-hour BSEK simulation examinations conducted under strict board room conditions with marking schemes.",
        theme: "emerald",
        badgeColorClass: "text-emerald-600 dark:text-emerald-400",
        displayOrder: 3,
        isVisible: true,
      },
    ],
  },
  ctaBanner: {
    isVisible: true,
    eyebrowActiveTemplate: "{admissionsSession} Admissions Active",
    eyebrowInactiveTemplate: "Academic Excellence Track",
    mainHeading: "Give Your Child the",
    highlightedHeading: "Seneca Academic Advantage",
    descriptionOpenTemplate:
      "Apply online for {admissionsSession} admissions or schedule a personalized diagnostic assessment for your child in Soldier Bazar, Karachi.",
    descriptionClosedTemplate:
      "Schedule a one-on-one diagnostic assessment with our academic advisors and discover our comprehensive Cambridge and BSEK pathways.",
    admissionsOpenCtas: {
      primary: {
        isVisible: true,
        text: "Apply for Admission",
        href: "/admissions",
      },
      secondary: {
        isVisible: true,
        text: "Book Campus Tour",
        href: "/contact",
      },
    },
    admissionsClosedCtas: {
      primary: {
        isVisible: true,
        text: "Book Campus Tour",
        href: "/contact",
      },
      secondary: {
        isVisible: true,
        text: "Explore Fee Structure",
        href: "/fees",
      },
    },
    trustCards: [
      {
        id: "tc-1",
        title: "Diagnostic Assessment",
        description: "Personalized screening",
        icon: "CheckCircle2",
        theme: "amber",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "tc-2",
        title: "Cambridge & BSEK",
        description: "Dual excellence track",
        icon: "GraduationCap",
        theme: "amber",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "tc-3",
        title: "Direct Registrar Desk",
        description: "Quick online approval",
        icon: "ShieldCheck",
        theme: "emerald",
        displayOrder: 3,
        isVisible: true,
      },
    ],
    helpline: {
      isVisible: true,
      prefixText: "Need guidance with admission criteria?",
      linkTextTemplate: "Call Admissions: {phone}",
    },
    backgroundTheme: "crimsonLuxury",
  },
  seo: {
    title: "Academics & Curriculum — Seneca Academy Karachi",
    description:
      "Explore Seneca Academy's structured academic divisions from Early Years Montessori to Senior Matriculation (BSEK). Discover our STEM labs, sciences, and humanities curriculum.",
    keywords:
      "Seneca Academics, Montessori, Primary School, Middle School, BSEK Matriculation, STEM Robotics, Karachi Cambridge curriculum",
    ogTitle: "Academics & Curriculum — Seneca Academy Karachi",
    ogDescription:
      "Structured educational pathways from Montessori to BSEK Matriculation with state-of-the-art STEM laboratories in Karachi.",
  },
};
