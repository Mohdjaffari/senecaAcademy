export interface AcademicGrade {
  name: string;
  gradeLevel: number;
  tier: "Preschool" | "Primary" | "Middle" | "Secondary" | "Higher Secondary";
  tierLabel: string;
  wing: string;
  defaultStream: string;
  allowedStreams: string[];
  suggestedRooms: string;
  description: string;
}

export const ACADEMIC_TIERS = [
  { id: "all", label: "All Levels & Wings" },
  { id: "Preschool", label: "Early Years / Preschool", sub: "Playgroup, Nursery, Prep/KG" },
  { id: "Primary", label: "Primary Wing", sub: "Grades 1 – 5" },
  { id: "Middle", label: "Middle Wing", sub: "Grades 6 – 8" },
  { id: "Secondary", label: "Secondary / Matric", sub: "Grade 9 & 10 (Matric & O-Level)" },
  { id: "Higher Secondary", label: "Higher Secondary / College", sub: "1st Year & 2nd Year (FSc / ICS / I.Com)" },
] as const;

export const STREAM_OPTIONS_BY_TIER: Record<string, string[]> = {
  Preschool: [
    "General Curriculum",
    "Montessori Early Years",
    "Early Childhood Education (ECE)",
  ],
  Primary: [
    "General Curriculum (National Standards)",
    "Cambridge Primary",
  ],
  Middle: [
    "General Curriculum (Middle Standards)",
    "Cambridge Lower Secondary",
  ],
  Secondary: [
    "Matric Science (Biology, Chemistry, Physics)",
    "Matric Computer Science (Physics, Tech, Math)",
    "Matric Arts & Humanities",
    "Cambridge O-Levels (Science)",
    "Cambridge O-Levels (Commerce & Arts)",
  ],
  "Higher Secondary": [
    "FSc Pre-Medical (Biology, Chemistry, Physics)",
    "FSc Pre-Engineering (Mathematics, Physics, Chemistry)",
    "ICS (Computer Science, Mathematics, Physics)",
    "I.Com (Commerce, Accounting, Economics)",
    "FA (Fine Arts, Civics, Humanities)",
    "Cambridge A-Levels (Pre-Medical & Pre-Eng)",
    "Cambridge A-Levels (Commerce & Business)",
  ],
};

export const ALL_STREAM_OPTIONS = [
  "General Curriculum",
  "General Curriculum (National Standards)",
  "General Curriculum (Middle Standards)",
  "FSc Pre-Medical (Biology, Chemistry, Physics)",
  "FSc Pre-Engineering (Mathematics, Physics, Chemistry)",
  "ICS (Computer Science, Mathematics, Physics)",
  "I.Com (Commerce, Accounting, Economics)",
  "FA (Fine Arts, Civics, Humanities)",
  "Matric Science (Biology, Chemistry, Physics)",
  "Matric Computer Science (Physics, Tech, Math)",
  "Matric Arts & Humanities",
  "Cambridge O-Levels (Science)",
  "Cambridge O-Levels (Commerce & Arts)",
  "Cambridge A-Levels",
];

// Complete school academic ladder from Playgroup to 2nd Year (12th Grade / College)
export const ACADEMIC_SPECTRUM: AcademicGrade[] = [
  // 1. Preschool / Early Childhood
  {
    name: "Playgroup",
    gradeLevel: 0,
    tier: "Preschool",
    tierLabel: "Early Childhood (ECE)",
    wing: "Early Years",
    defaultStream: "General Curriculum",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Preschool,
    suggestedRooms: "ECE Ground Floor - Play Area 101",
    description: "Toddler sensory learning, motor skills & play-based development.",
  },
  {
    name: "Nursery",
    gradeLevel: 0,
    tier: "Preschool",
    tierLabel: "Early Childhood (ECE)",
    wing: "Early Years",
    defaultStream: "General Curriculum",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Preschool,
    suggestedRooms: "ECE Room 102",
    description: "Foundational phonics, basic numeracy & cognitive discovery.",
  },
  {
    name: "Prep / KG",
    gradeLevel: 0,
    tier: "Preschool",
    tierLabel: "Early Childhood (ECE)",
    wing: "Early Years",
    defaultStream: "General Curriculum",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Preschool,
    suggestedRooms: "ECE Room 103",
    description: "Kindergarten prep, reading fluency & school readiness.",
  },

  // 2. Primary Wing (Grades 1 to 5)
  {
    name: "Grade 1",
    gradeLevel: 1,
    tier: "Primary",
    tierLabel: "Primary Wing",
    wing: "Primary",
    defaultStream: "General Curriculum (National Standards)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Primary Wing Room 201",
    description: "Primary foundation in language, elementary arithmetic & environmental studies.",
  },
  {
    name: "Grade 2",
    gradeLevel: 2,
    tier: "Primary",
    tierLabel: "Primary Wing",
    wing: "Primary",
    defaultStream: "General Curriculum (National Standards)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Primary Wing Room 202",
    description: "Reading comprehension, mathematical problem solving & creative arts.",
  },
  {
    name: "Grade 3",
    gradeLevel: 3,
    tier: "Primary",
    tierLabel: "Primary Wing",
    wing: "Primary",
    defaultStream: "General Curriculum (National Standards)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Primary Wing Room 203",
    description: "General science concepts, social studies & linguistic fluency.",
  },
  {
    name: "Grade 4",
    gradeLevel: 4,
    tier: "Primary",
    tierLabel: "Primary Wing",
    wing: "Primary",
    defaultStream: "General Curriculum (National Standards)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Primary Wing Room 204",
    description: "Analytical math, scientific inquiry & introductory computing.",
  },
  {
    name: "Grade 5",
    gradeLevel: 5,
    tier: "Primary",
    tierLabel: "Primary Wing",
    wing: "Primary",
    defaultStream: "General Curriculum (National Standards)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Primary Wing Room 205",
    description: "Primary graduation milestone, comprehensive assessment & STEM fundamentals.",
  },

  // 3. Middle Wing (Grades 6 to 8)
  {
    name: "Grade 6",
    gradeLevel: 6,
    tier: "Middle",
    tierLabel: "Middle Wing",
    wing: "Middle",
    defaultStream: "General Curriculum (Middle Standards)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Middle,
    suggestedRooms: "Middle Wing Room 301",
    description: "Middle school transition, specialized subject instruction & robotics.",
  },
  {
    name: "Grade 7",
    gradeLevel: 7,
    tier: "Middle",
    tierLabel: "Middle Wing",
    wing: "Middle",
    defaultStream: "General Curriculum (Middle Standards)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Middle,
    suggestedRooms: "Middle Wing Room 302",
    description: "Pre-algebra, integrated sciences (Physics/Chemistry/Bio) & digital skills.",
  },
  {
    name: "Grade 8",
    gradeLevel: 8,
    tier: "Middle",
    tierLabel: "Middle Wing",
    wing: "Middle",
    defaultStream: "General Curriculum (Middle Standards)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Middle,
    suggestedRooms: "Middle Wing Room 303",
    description: "Middle wing graduation & preparatory academic pathway guidance.",
  },

  // 4. Secondary Wing (Grades 9 & 10 / Matric / SSC / O-Levels)
  {
    name: "Grade 9 (9th Class)",
    gradeLevel: 9,
    tier: "Secondary",
    tierLabel: "Secondary / Matric",
    wing: "Secondary",
    defaultStream: "Matric Science (Biology, Chemistry, Physics)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Secondary,
    suggestedRooms: "Secondary Block Room 401",
    description: "Matric Part I / SSC-I / O-Levels Year 1 board curriculum.",
  },
  {
    name: "Grade 10 (10th Class)",
    gradeLevel: 10,
    tier: "Secondary",
    tierLabel: "Secondary / Matric",
    wing: "Secondary",
    defaultStream: "Matric Science (Biology, Chemistry, Physics)",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Secondary,
    suggestedRooms: "Secondary Block Room 402",
    description: "Matric Part II / SSC-II / O-Levels completion & board examinations.",
  },

  // 5. Higher Secondary / College Wing (1st & 2nd Year / HSSC / A-Levels)
  {
    name: "1st Year (11th Class)",
    gradeLevel: 11,
    tier: "Higher Secondary",
    tierLabel: "College / HSSC-I",
    wing: "Higher Secondary",
    defaultStream: "FSc Pre-Medical (Biology, Chemistry, Physics)",
    allowedStreams: STREAM_OPTIONS_BY_TIER["Higher Secondary"],
    suggestedRooms: "College Wing Hall 501",
    description: "Intermediate Part I / HSSC-I (FSc Pre-Med, Pre-Eng, ICS, I.Com, FA).",
  },
  {
    name: "2nd Year (12th Class)",
    gradeLevel: 12,
    tier: "Higher Secondary",
    tierLabel: "College / HSSC-II",
    wing: "Higher Secondary",
    defaultStream: "FSc Pre-Medical (Biology, Chemistry, Physics)",
    allowedStreams: STREAM_OPTIONS_BY_TIER["Higher Secondary"],
    suggestedRooms: "College Wing Hall 502",
    description: "Intermediate Part II / HSSC-II graduation & university entry readiness.",
  },
];

export const AVAILABLE_SECTIONS = ["A", "B", "C", "D", "E", "F"] as const;

export const WINGS = [
  { id: "all", name: "All Academic Wings" },
  { id: "Early Years", name: "Early Years (Playgroup/Nursery/KG)" },
  { id: "Primary", name: "Primary Wing (Grades 1–5)" },
  { id: "Middle", name: "Middle Wing (Grades 6–8)" },
  { id: "Secondary", name: "Secondary / Matric (Grades 9–10)" },
  { id: "Higher Secondary", name: "Higher Secondary / College (11–12)" },
];
