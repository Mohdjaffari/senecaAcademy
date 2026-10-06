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
  { id: "Preschool", label: "Cambridge Early Years (EYFS)", sub: "Playgroup, Nursery, Kindergarten (Prep/KG)" },
  { id: "Primary", label: "Cambridge Primary Wing", sub: "Stages 1 – 5 (Grades 1 – 5)" },
  { id: "Middle", label: "Cambridge Lower Secondary", sub: "Stages 6 – 8 (Grades 6 – 8 Checkpoint)" },
  { id: "Secondary", label: "Cambridge Upper Secondary & Matric", sub: "IGCSE, O-Levels & Matric (Grades 9 & 10)" },
  { id: "Higher Secondary", label: "Cambridge College & A-Levels", sub: "AS & A-Levels (11th & 12th) & Intermediate College" },
] as const;

export const STREAM_OPTIONS_BY_TIER: Record<string, string[]> = {
  Preschool: [
    "Cambridge Early Years",
    "Montessori Early Years",
    "Early Childhood Education (ECE)",
    "General Curriculum",
  ],
  Primary: [
    "Cambridge Primary",
    "General Curriculum",
  ],
  Middle: [
    "Cambridge Lower Secondary",
    "General Curriculum",
  ],
  Secondary: [
    "Cambridge O-Levels",
    "Cambridge IGCSE",
    "Matric Science",
    "Matric Computer Science",
    "Matric Arts & Humanities",
  ],
  "Higher Secondary": [
    "Cambridge A-Levels",
    "FSc Pre-Medical",
    "FSc Pre-Engineering",
    "ICS (Computer Science)",
    "I.Com (Commerce)",
    "FA (Humanities & Arts)",
  ],
};

export const ALL_STREAM_OPTIONS = [
  "Cambridge Early Years",
  "Montessori Early Years",
  "Early Childhood Education (ECE)",
  "General Curriculum",
  "Cambridge Primary",
  "Cambridge Lower Secondary",
  "Cambridge O-Levels",
  "Cambridge IGCSE",
  "Matric Science",
  "Matric Computer Science",
  "Matric Arts & Humanities",
  "Cambridge A-Levels",
  "FSc Pre-Medical",
  "FSc Pre-Engineering",
  "ICS (Computer Science)",
  "I.Com (Commerce)",
  "FA (Humanities & Arts)",
];

// Complete school academic ladder from Playgroup to 2nd Year (12th Grade / College)
export const ACADEMIC_SPECTRUM: AcademicGrade[] = [
  // 1. Cambridge Early Years / Preschool (EYFS)
  {
    name: "Playgroup",
    gradeLevel: 0,
    tier: "Preschool",
    tierLabel: "Cambridge Early Years (EYFS)",
    wing: "Early Years",
    defaultStream: "Cambridge Early Years",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Preschool,
    suggestedRooms: "Cambridge Early Years Suite 101",
    description: "Toddler sensory learning, motor skills & play-based discovery.",
  },
  {
    name: "Nursery",
    gradeLevel: 0,
    tier: "Preschool",
    tierLabel: "Cambridge Early Years (EYFS)",
    wing: "Early Years",
    defaultStream: "Cambridge Early Years",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Preschool,
    suggestedRooms: "Cambridge Early Years Room 102",
    description: "Foundational phonics, basic numeracy, sensory discovery & cognitive inquiry.",
  },
  {
    name: "Prep / KG",
    gradeLevel: 0,
    tier: "Preschool",
    tierLabel: "Cambridge Early Years (EYFS)",
    wing: "Early Years",
    defaultStream: "Cambridge Early Years",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Preschool,
    suggestedRooms: "Cambridge Early Years Room 103",
    description: "Kindergarten graduation, reading fluency & Cambridge Stage 1 transition readiness.",
  },

  // 2. Cambridge Primary Wing (Stages 1 to 5 / Grades 1 to 5)
  {
    name: "Grade 1",
    gradeLevel: 1,
    tier: "Primary",
    tierLabel: "Cambridge Primary",
    wing: "Primary",
    defaultStream: "Cambridge Primary",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Cambridge Primary Room 201",
    description: "Cambridge Stage 1 in English, Mathematics, Science, Global Perspectives & Digital Literacy.",
  },
  {
    name: "Grade 2",
    gradeLevel: 2,
    tier: "Primary",
    tierLabel: "Cambridge Primary",
    wing: "Primary",
    defaultStream: "Cambridge Primary",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Cambridge Primary Room 202",
    description: "Cambridge Stage 2 comprehension, analytical arithmetic, scientific inquiry & creative arts.",
  },
  {
    name: "Grade 3",
    gradeLevel: 3,
    tier: "Primary",
    tierLabel: "Cambridge Primary",
    wing: "Primary",
    defaultStream: "Cambridge Primary",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Cambridge Primary Room 203",
    description: "Cambridge Stage 3 science concepts, linguistic fluency & introductory computational thinking.",
  },
  {
    name: "Grade 4",
    gradeLevel: 4,
    tier: "Primary",
    tierLabel: "Cambridge Primary",
    wing: "Primary",
    defaultStream: "Cambridge Primary",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Cambridge Primary Room 204",
    description: "Cambridge Stage 4 STEM problem solving, environmental sciences & literature studies.",
  },
  {
    name: "Grade 5",
    gradeLevel: 5,
    tier: "Primary",
    tierLabel: "Cambridge Primary",
    wing: "Primary",
    defaultStream: "Cambridge Primary",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Primary,
    suggestedRooms: "Cambridge Primary Room 205",
    description: "Cambridge Primary Progression & Checkpoint assessment milestone, comprehensive STEM foundations.",
  },

  // 3. Cambridge Lower Secondary Wing (Stages 6 to 8 / Grades 6 to 8)
  {
    name: "Grade 6",
    gradeLevel: 6,
    tier: "Middle",
    tierLabel: "Cambridge Lower Secondary",
    wing: "Middle",
    defaultStream: "Cambridge Lower Secondary",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Middle,
    suggestedRooms: "Cambridge Lower Secondary Room 301",
    description: "Cambridge Stage 6 lower secondary transition, specialized science & robotics.",
  },
  {
    name: "Grade 7",
    gradeLevel: 7,
    tier: "Middle",
    tierLabel: "Cambridge Lower Secondary",
    wing: "Middle",
    defaultStream: "Cambridge Lower Secondary",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Middle,
    suggestedRooms: "Cambridge Lower Secondary Room 302",
    description: "Cambridge Stage 7 algebra, integrated sciences (Physics/Chemistry/Bio) & digital skills.",
  },
  {
    name: "Grade 8",
    gradeLevel: 8,
    tier: "Middle",
    tierLabel: "Cambridge Lower Secondary",
    wing: "Middle",
    defaultStream: "Cambridge Lower Secondary",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Middle,
    suggestedRooms: "Cambridge Lower Secondary Room 303",
    description: "Cambridge Lower Secondary Checkpoint examinations & preparatory IGCSE/O-Level pathway guidance.",
  },

  // 4. Cambridge Upper Secondary Wing (Grades 9 & 10 / IGCSE / O-Levels / Matric)
  {
    name: "Grade 9 (9th Class)",
    gradeLevel: 9,
    tier: "Secondary",
    tierLabel: "Cambridge O-Levels / Matric",
    wing: "Secondary",
    defaultStream: "Cambridge O-Levels",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Secondary,
    suggestedRooms: "Cambridge O-Level Block Room 401",
    description: "Cambridge CAIE O-Level / IGCSE Year 1 & Matric Part I board syllabus.",
  },
  {
    name: "Grade 10 (10th Class)",
    gradeLevel: 10,
    tier: "Secondary",
    tierLabel: "Cambridge O-Levels / Matric",
    wing: "Secondary",
    defaultStream: "Cambridge O-Levels",
    allowedStreams: STREAM_OPTIONS_BY_TIER.Secondary,
    suggestedRooms: "Cambridge O-Level Block Room 402",
    description: "Cambridge CAIE O-Level / IGCSE final examinations & Matric Part II graduation.",
  },

  // 5. Cambridge College & Sixth Form Wing (1st & 2nd Year / AS & A-Levels / HSSC)
  {
    name: "1st Year (11th Class)",
    gradeLevel: 11,
    tier: "Higher Secondary",
    tierLabel: "Cambridge College / A-Levels",
    wing: "Higher Secondary",
    defaultStream: "Cambridge A-Levels",
    allowedStreams: STREAM_OPTIONS_BY_TIER["Higher Secondary"],
    suggestedRooms: "Cambridge College Hall 501",
    description: "Cambridge Advanced AS-Levels & Intermediate Part I (FSc Pre-Med, Pre-Eng, ICS, I.Com).",
  },
  {
    name: "2nd Year (12th Class)",
    gradeLevel: 12,
    tier: "Higher Secondary",
    tierLabel: "Cambridge College / A-Levels",
    wing: "Higher Secondary",
    defaultStream: "Cambridge A-Levels",
    allowedStreams: STREAM_OPTIONS_BY_TIER["Higher Secondary"],
    suggestedRooms: "Cambridge College Hall 502",
    description: "Cambridge Advanced A2-Levels & Intermediate Part II graduation, university admission portfolio readiness.",
  },
];

export const AVAILABLE_SECTIONS = ["A", "B", "C", "D", "E", "F"] as const;

export const WINGS = [
  { id: "all", name: "All Academic Wings" },
  { id: "Early Years", name: "Cambridge Early Years (Playgroup/Nursery/KG)" },
  { id: "Primary", name: "Cambridge Primary Wing (Grades 1–5)" },
  { id: "Middle", name: "Cambridge Lower Secondary Wing (Grades 6–8)" },
  { id: "Secondary", name: "Cambridge Upper Secondary & Matric (Grades 9–10)" },
  { id: "Higher Secondary", name: "Cambridge College & A-Levels (Grades 11–12 / AS & A2)" },
];
