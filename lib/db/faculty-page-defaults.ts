export interface IFacultyHeroData {
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

export interface IFacultyMember {
  id: string;
  name: string;
  role: string;
  department: string;
  qual: string;
  exp: string;
  imgUrl: string;
  bio?: string;
  badge?: string;
  badgeColor?: "crimson" | "amber" | "emerald" | "sky" | "indigo";
  displayOrder?: number;
  isActive?: boolean;
}

export interface IFacultySectionData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  members: IFacultyMember[];
}

export interface IFacultyCareersData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  benefits: string[];
  applyButtonText: string;
  isHiringActive: boolean;
  contactEmail?: string;
}

export interface ITeachingStandard {
  id: string;
  icon: string;
  title: string;
  desc: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface IFacultyStandardsData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  items: ITeachingStandard[];
}

export interface ICampusFacility {
  id: string;
  title: string;
  desc: string;
  category: string;
  status: string;
  imgUrl?: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface ICampusFacilitiesData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  facilities: ICampusFacility[];
}

export interface IFacultyExperienceCtaData {
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
}

export interface ISEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
}

export interface IFacultyPageData {
  sectionsOrder: string[];
  hero: IFacultyHeroData;
  facultySection: IFacultySectionData;
  careers: IFacultyCareersData;
  standards: IFacultyStandardsData;
  facilities: ICampusFacilitiesData;
  experienceCta: IFacultyExperienceCtaData;
  seo: ISEOData;
}

export const DEFAULT_FACULTY_PAGE_DATA: IFacultyPageData = {
  sectionsOrder: ["hero", "faculty", "careers", "standards", "facilities", "experienceCta"],

  hero: {
    isVisible: true,
    badge: "Master-Level Faculty & Pedagogical Mentors",
    badgeIcon: "Users",
    title: "Mentorship by Distinguished",
    highlightedTitle: "Educators & Leaders.",
    description:
      "At Seneca Academy, our teachers are inspiring role models and mentors who shape intellect, foster curiosity, and nurture moral character.",
    leftSpecChip: {
      badgeText: "100% Certified",
      description: "Master & Subject Specialist Faculty",
      icon: "GraduationCap",
    },
    rightSpecChip: {
      badgeText: "1:12 Mentorship",
      description: "Personalized Student Mentorship Ratio",
      icon: "Award",
    },
    primaryCta: {
      isVisible: true,
      text: "Meet Our Educators",
      href: "#faculty-team",
    },
    secondaryCta: {
      isVisible: true,
      text: "Careers at Seneca",
      href: "#careers",
    },
    variant: "crimson",
  },

  facultySection: {
    isVisible: true,
    badge: "World-Class Educators",
    heading: "Mentorship by Distinguished Educators",
    description:
      "Our educators hold master's and doctoral degrees from renowned universities, combining pedagogical rigor with emotional intelligence and character coaching.",
    members: [
      {
        id: "fac-1",
        name: "Sir Tariq Mehmood",
        role: "Head of Mathematics & Senior Board Coach",
        department: "Mathematics",
        qual: "M.Sc. Applied Mathematics (KU)",
        exp: "16+ Years Experience",
        imgUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        bio: "Specialist in advanced algebra, calculus, and board exam preparation with proven record of top positions.",
        badge: "Senior Board Coach",
        badgeColor: "crimson",
        displayOrder: 1,
        isActive: true,
      },
      {
        id: "fac-2",
        name: "Dr. Ayesha Siddiqui",
        role: "Head of Sciences & Laboratory Director",
        department: "Sciences",
        qual: "Ph.D. Chemistry (HEJ Research Institute)",
        exp: "12+ Years Experience",
        imgUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
        bio: "Directs STEM research labs, Olympiad preparation, and hands-on experimental chemistry curriculum.",
        badge: "Lab Director",
        badgeColor: "emerald",
        displayOrder: 2,
        isActive: true,
      },
      {
        id: "fac-3",
        name: "Sir Kamran Khan",
        role: "Lead Instructor, Computer Science & AI",
        department: "Computer Science",
        qual: "MS Computer Science (FAST-NUCES)",
        exp: "10+ Years Experience",
        imgUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        bio: "Pioneering python coding, robotics kits, algorithm logic, and modern artificial intelligence coursework.",
        badge: "Tech Lead",
        badgeColor: "sky",
        displayOrder: 3,
        isActive: true,
      },
      {
        id: "fac-4",
        name: "Ms. Fatima Noor",
        role: "Head of English Literature & Debate Society",
        department: "Languages & Humanities",
        qual: "M.A. English Literature & Linguistics",
        exp: "8+ Years Experience",
        imgUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80",
        bio: "Mentors inter-school parliamentary debate teams and cultivates critical analytical writing skills.",
        badge: "Debate Mentor",
        badgeColor: "amber",
        displayOrder: 4,
        isActive: true,
      },
      {
        id: "fac-5",
        name: "Sir Bilal Ahmed",
        role: "Senior Physics Faculty & STEM Mentor",
        department: "Sciences",
        qual: "M.Sc. Theoretical Physics",
        exp: "9+ Years Experience",
        imgUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        bio: "Expert in experimental mechanics, wave theory, and conceptual problem-solving techniques.",
        badge: "STEM Mentor",
        badgeColor: "indigo",
        displayOrder: 5,
        isActive: true,
      },
      {
        id: "fac-6",
        name: "Mrs. Zainab Hashmi",
        role: "Head of Junior Wing & Early Childhood Specialist",
        department: "Junior & Primary Wing",
        qual: "M.Ed. Early Childhood Development",
        exp: "14+ Years Experience",
        imgUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
        bio: "Oversees play-based phonics, Montessori foundations, and child psychology in primary classrooms.",
        badge: "Primary Wing Head",
        badgeColor: "emerald",
        displayOrder: 6,
        isActive: true,
      },
    ],
  },

  careers: {
    isVisible: true,
    badge: "Careers at Seneca",
    heading: "Passionate About Teaching? Join Our Faculty.",
    description:
      "We offer competitive salary packages, continuous pedagogical training, small class batches, and a stimulating academic environment in Soldier Bazar, Karachi.",
    benefits: [
      "Market-competitive salary & annual performance increments",
      "80+ hours of annual accredited pedagogical development workshops",
      "Capped class sizes (max 35 students) for personalized mentorship",
      "Medical insurance coverage and provident fund scheme",
      "Modern digital classrooms with smart interactive displays",
    ],
    applyButtonText: "Apply as Teacher",
    isHiringActive: true,
    contactEmail: "careers@seneca.edu.pk",
  },

  standards: {
    isVisible: true,
    badge: "Faculty Standards",
    heading: "Our Uncompromising Standards for Educators",
    description:
      "Every faculty appointment at Seneca Academy undergoes a multi-stage teaching demo, board background verification, and continuous pedagogical coaching.",
    items: [
      {
        id: "std-1",
        icon: "GraduationCap",
        title: "Master & Doctoral Qualifications",
        desc: "All senior department heads hold post-graduate master's or Ph.D. degrees in their respective subject specializations.",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "std-2",
        icon: "BookOpen",
        title: "Pedagogical Excellence Training",
        desc: "Our educators undergo over 80 hours of annual pedagogical workshops covering inquiry-based teaching and digital tools.",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "std-3",
        icon: "HeartHandshake",
        title: "Individualized Mentorship",
        desc: "Small class sizes of max 35 students enable teachers to monitor every child's academic and emotional growth.",
        displayOrder: 3,
        isVisible: true,
      },
      {
        id: "std-4",
        icon: "Award",
        title: "Proven Board Success Track Record",
        desc: "Our board coaches have consistently guided students to top positions across Karachi matriculation examinations.",
        displayOrder: 4,
        isVisible: true,
      },
    ],
  },

  facilities: {
    isVisible: true,
    badge: "Campus Infrastructure",
    heading: "Purpose-Built Learning Spaces & Facilities",
    description:
      "Our campus in Soldier Bazar, Garden East, provides modern academic and co-curricular infrastructure designed for experiential learning.",
    facilities: [
      {
        id: "facil-1",
        title: "Advanced STEM & Robotics Laboratory",
        desc: "Equipped with 3D printers, IoT micro-controller kits, and hands-on electronics workstations.",
        category: "Laboratory",
        status: "Active",
        imgUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "facil-2",
        title: "Olympian Sports Arena & Athletics Court",
        desc: "Multi-purpose synthetic turf for football, basketball court, and professional fitness training.",
        category: "Sports",
        status: "Active",
        imgUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "facil-3",
        title: "Digital Research Library & Media Hub",
        desc: "Over 25,000 reference volumes, academic e-journals, and high-speed multimedia study pods.",
        category: "Library",
        status: "Active",
        imgUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",
        displayOrder: 3,
        isVisible: true,
      },
      {
        id: "facil-4",
        title: "Auditorium & Performing Arts Studio",
        desc: "Acoustically treated 650-seat theater with professional stage lighting and audio broadcasting systems.",
        category: "Auditorium",
        status: "Active",
        imgUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=600&q=80",
        displayOrder: 4,
        isVisible: true,
      },
    ],
  },

  experienceCta: {
    isVisible: true,
    heading: "Experience Seneca Mentorship",
    description:
      "Join our dynamic student community and learn directly from Karachi's leading educators at Seneca Academy.",
    primaryCta: {
      isVisible: true,
      text: "Apply for Admission",
      href: "/admissions",
    },
    secondaryCta: {
      isVisible: true,
      text: "Visit Campus",
      href: "/contact",
    },
  },

  seo: {
    metaTitle: "Faculty Educators, Campus Facilities & Careers — Seneca Academy Karachi",
    metaDescription:
      "Meet distinguished master-level faculty educators and explore modern campus infrastructure at Seneca Academy Karachi. Discover teacher mentorship standards and explore educator career opportunities.",
    keywords: [
      "Seneca Academy faculty",
      "Karachi school teachers",
      "experienced matric teachers",
      "STEM educators Karachi",
      "teaching jobs Karachi",
      "Seneca campus facilities",
      "school robotics lab",
    ],
    ogImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
  },
};
