export interface IHeroData {
  isVisible: boolean;
  badge: string;
  badgeIcon: string;
  showBadge: boolean;
  title: string;
  highlightedTitle: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  primaryCta: {
    isVisible: boolean;
    text: string;
    href: string;
    dynamicBehavior?: string;
  };
  secondaryCta: {
    isVisible: boolean;
    text: string;
    href: string;
  };
  variant: "crimson" | "amber" | "emerald" | "default";
}

export interface IVisionMissionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBgClass: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface IVisionMissionData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  items: IVisionMissionItem[];
}

export interface ICoreValueItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  iconColor: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface ICoreValuesData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  items: ICoreValueItem[];
}

export interface IMilestoneItem {
  id: string;
  year: string;
  category: string;
  title: string;
  desc: string;
  icon: string;
  highlights: string[];
  gradient: string;
  badgeVariant: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface IMilestonesData {
  isVisible: boolean;
  badge: string;
  badgeIcon: string;
  heading: string;
  highlightedHeading: string;
  description: string;
  ribbonTitle: string;
  ribbonDescription: string;
  items: IMilestoneItem[];
}

export interface IPrincipalData {
  isVisible: boolean;
  badge: string;
  heading: string;
  name: string;
  designation: string;
  photoUrl: string;
  photoPublicId?: string;
  photoAlt: string;
  qualification: string;
  office: string;
  messageParagraphs: string[];
}

export interface ICampusCtaData {
  isVisible: boolean;
  heading: string;
  description: string;
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
  variant?: string;
}

export interface ISEOData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
}

export interface IAboutPageContent {
  pageTitle: string;
  pageDescription: string;
  slug: string;
  isPublished: boolean;
  sectionsOrder: string[];
  hero: IHeroData;
  principal: IPrincipalData;
  visionMission: IVisionMissionData;
  coreValues: ICoreValuesData;
  milestones: IMilestonesData;
  campusCta: ICampusCtaData;
  seo: ISEOData;
}

export const DEFAULT_ABOUT_PAGE_DATA: IAboutPageContent = {
  pageTitle: "About Us — Seneca Academy",
  pageDescription:
    "Learn about Seneca Academy's 25-year heritage of academic excellence, leadership from Principal M. Zohaib Ali, vision, mission, and core values in Soldier Bazar, Karachi.",
  slug: "about",
  isPublished: true,
  sectionsOrder: [
    "hero",
    "principal",
    "visionMission",
    "coreValues",
    "milestones",
    "campusCta",
  ],
  hero: {
    isVisible: true,
    badge: "Our Heritage & Purpose",
    badgeIcon: "Compass",
    showBadge: true,
    title: "Nurturing Minds, Building Character",
    highlightedTitle: "Since 2001.",
    description:
      "Seneca Academy is dedicated to providing Karachi's youth with world-class academic preparation, robust moral values, and the leadership skills to excel in higher education and global careers.",
    breadcrumbs: [{ label: "About Us" }],
    primaryCta: {
      isVisible: true,
      text: "Apply for Admission",
      href: "/admissions",
      dynamicBehavior: "admissions_toggle",
    },
    secondaryCta: {
      isVisible: true,
      text: "Explore Academics",
      href: "/academics",
    },
    variant: "crimson",
  },
  principal: {
    isVisible: true,
    badge: "From the Principal's Desk",
    heading: "A Message to Parents and Guardians",
    name: "M. Zohaib Ali",
    designation: "Executive Principal & Academic Director",
    photoUrl:
      "https://images.unsplash.com/photo-1554126807-6b10f6f6692a?auto=format&fit=crop&w=800&q=80",
    photoAlt: "Principal M. Zohaib Ali",
    qualification: "M.Sc. Educational Leadership, Ph.D. Fellow",
    office: "Principal Office",
    messageParagraphs: [
      "Dear Families,",
      "When Seneca Academy first opened its doors in Soldier Bazar over twenty years ago, we made a solemn commitment: to build an educational haven where intellectual rigor and moral compassion walk hand in hand.",
      "Today, education cannot simply be about memorizing past textbooks for a single examination. The world our children will inherit demands adaptable thinkers, ethical problem solvers, and courageous communicators. At Seneca, we blend intensive Karachi Board preparation with hands-on STEM robotics, debates, arts, and physical education.",
      "Every child who enters our gates is valued as an individual with unique potential. We invite you to partner with us in shaping your child's future.",
    ],
  },
  visionMission: {
    isVisible: true,
    badge: "Strategic Foundations",
    heading: "Our Vision and Mission",
    description: "Guiding principles that steer our academic and cultural mission.",
    items: [
      {
        id: "vm-1",
        title: "Our Vision",
        description:
          "To be recognized as a premier educational institution in Pakistan that empowers students with conceptual mastery, scientific curiosity, and moral excellence—producing graduates who become transformative leaders in science, technology, humanities, and civic life.",
        icon: "Compass",
        iconBgClass: "bg-seneca-crimson/10 text-seneca-crimson",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "vm-2",
        title: "Our Mission",
        description:
          "To deliver a stimulating, values-centered learning environment taught by distinguished master educators. We provide individualized mentorship, foster critical inquiry, and prepare every student for 100% board distinction and admission into top-tier universities.",
        icon: "Target",
        iconBgClass: "bg-seneca-amber/10 text-seneca-amber",
        displayOrder: 2,
        isVisible: true,
      },
    ],
  },
  coreValues: {
    isVisible: true,
    badge: "Ethos & Culture",
    heading: "The Four Pillars of Seneca Academy",
    description: "The core foundational values embedded into our daily academic journey.",
    items: [
      {
        id: "cv-1",
        title: "Intellectual Rigor",
        desc: "We encourage deep conceptual understanding, analytical thinking, and scientific inquiry rather than superficial memorization.",
        icon: "Cpu",
        iconColor: "text-seneca-crimson dark:text-seneca-amber-light",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "cv-2",
        title: "Moral Integrity & Empathy",
        desc: "Character development is central to Seneca's ethos. We instill honesty, respect for diversity, and civic responsibility.",
        icon: "HeartHandshake",
        iconColor: "text-seneca-amber",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "cv-3",
        title: "Visionary Leadership",
        desc: "Through debating, student councils, and team projects, we teach students to articulate ideas persuasively and lead with humility.",
        icon: "Target",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        displayOrder: 3,
        isVisible: true,
      },
      {
        id: "cv-4",
        title: "Inclusivity & Mentorship",
        desc: "With small classroom batches capped at 35 students, our faculty mentors each student according to their unique cognitive profile.",
        icon: "Compass",
        iconColor: "text-primary dark:text-amber-300",
        displayOrder: 4,
        isVisible: true,
      },
    ],
  },
  milestones: {
    isVisible: true,
    badge: "Our Heritage & Evolution",
    badgeIcon: "Compass",
    heading: "Twenty-Five Years of",
    highlightedHeading: "Excellence.",
    description:
      "Milestones that define our relentless commitment to the character, intellect, and future of Karachi's youth.",
    ribbonTitle: "Looking Toward the Future",
    ribbonDescription:
      "Continuing our legacy of academic distinction, ethical leadership, and character cultivation for generations to come.",
    items: [
      {
        id: "m-1",
        year: "2001",
        category: "Genesis & Heritage",
        title: "Founding in Soldier Bazar",
        desc: "Seneca Academy was established with a pioneering vision: to deliver rigorous English-medium schooling emphasizing intellectual curiosity, academic discipline, and ethical character in the heart of Karachi.",
        icon: "Landmark",
        highlights: [
          "Soldier Bazar Campus",
          "Character & Moral Rigor",
          "Founding Faculty",
        ],
        gradient: "from-seneca-crimson to-seneca-crimson-dark",
        badgeVariant:
          "border-seneca-crimson/30 text-seneca-crimson bg-seneca-crimson/10",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "m-2",
        year: "2010",
        category: "Secondary Accreditation",
        title: "Matriculation Board Affiliation",
        desc: "Received official accreditation with the Board of Secondary Education Karachi (BSEK), inaugurating dedicated Physics, Chemistry, and Biology laboratories to support comprehensive secondary education.",
        icon: "Award",
        highlights: [
          "BSEK Official Recognition",
          "Dedicated Science Labs",
          "Distinction Cohorts",
        ],
        gradient: "from-amber-600 to-amber-700",
        badgeVariant: "border-amber-500/30 text-amber-600 bg-amber-500/10",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "m-3",
        year: "2018",
        category: "Technological Pedagogy",
        title: "STEM & Robotics Innovation Wing",
        desc: "Expanded campus facilities to launch a dedicated STEM & Robotics laboratory, high-speed computer science workstations, digital multimedia classrooms, and an early Python coding curriculum.",
        icon: "Cpu",
        highlights: [
          "Robotics & Micro-controllers",
          "Smart Multimedia Classrooms",
          "Python & Coding Track",
        ],
        gradient: "from-blue-600 to-indigo-700",
        badgeVariant: "border-blue-500/30 text-blue-600 bg-blue-500/10",
        displayOrder: 3,
        isVisible: true,
      },
      {
        id: "m-4",
        year: "2024",
        category: "Academic Distinction",
        title: "100% Board Distinction Record",
        desc: "Achieved an unbroken five-year streak of 100% A+/A grade pass rates in the Karachi board secondary examinations, producing multiple top-ranking position holders across science and general groups.",
        icon: "GraduationCap",
        highlights: [
          "100% A+/A Grade Record",
          "Top Position Holders",
          "5-Year Distinction Streak",
        ],
        gradient: "from-emerald-600 to-emerald-700",
        badgeVariant:
          "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
        displayOrder: 4,
        isVisible: true,
      },
      {
        id: "m-5",
        year: "2026",
        category: "Digital Transformation",
        title: "Enterprise Learning Management System",
        desc: "Deployed Seneca Academy's custom enterprise Learning Management System (LMS), connecting faculty, parents, and students with real-time academic analytics, diagnostic testing, and online admissions.",
        icon: "Layers",
        highlights: [
          "Real-Time Parent Portal",
          "Saturday Diagnostic Engine",
          "Live Fee & Gradebook Sync",
        ],
        gradient: "from-seneca-crimson via-seneca-amber to-emerald-600",
        badgeVariant:
          "border-seneca-amber/40 text-seneca-amber-dark dark:text-seneca-amber-light bg-seneca-amber/15",
        displayOrder: 5,
        isVisible: true,
      },
    ],
  },
  campusCta: {
    isVisible: true,
    heading: "Experience Our Campus in Person",
    description:
      "We welcome prospective parents for personalized guided tours of our classrooms, science laboratories, robotics studio, and sports grounds in Soldier Bazar.",
    primaryCta: {
      isVisible: true,
      text: "Book a Guided Campus Tour",
      href: "/contact",
    },
    secondaryCta: {
      isVisible: true,
      text: "View Campus Gallery",
      href: "/gallery",
    },
    variant: "default",
  },
  seo: {
    title: "About Us — Seneca Academy Karachi",
    description:
      "Learn about Seneca Academy's 25-year heritage of academic excellence, leadership from Principal M. Zohaib Ali, vision, mission, and core values in Soldier Bazar, Karachi.",
    keywords:
      "Seneca Academy, About Seneca, Soldier Bazar school, Karachi schools, Cambridge school, BSEK distinction, Principal M. Zohaib Ali",
    ogTitle: "About Us — Seneca Academy Karachi",
    ogDescription:
      "25 years of academic distinction, STEM innovation, and character building in Soldier Bazar, Karachi.",
  },
};
