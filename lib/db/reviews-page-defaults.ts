export interface ITrustBadgeItem {
  icon: string;
  text: string;
}

export interface IReviewsHero {
  badge: string;
  title: string;
  titleGradient: string;
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  trustBadges: ITrustBadgeItem[];
}

export interface IReviewMetricCard {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: string;
  badge?: string;
}

export interface IReviewsStats {
  showScorecard: boolean;
  score: number;
  recommendRate: number;
  totalReviewsText: string;
  metricCards: IReviewMetricCard[];
}

export interface IReviewsCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  isActive: boolean;
}

export interface IReviewsRole {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
}

export interface IReviewsSubmissionSettings {
  allowPublicSubmissions: boolean;
  requireModeration: boolean;
  modalTitle: string;
  modalSubtitle: string;
  guidelinesText: string;
  successMessage: string;
}

export interface IReviewsCtaBanner {
  badge: string;
  headline: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export interface IReviewsSeo {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  keywords: string[];
}

export interface IReviewsPageData {
  sectionsOrder: string[];
  hero: IReviewsHero;
  stats: IReviewsStats;
  categories: IReviewsCategory[];
  roles: IReviewsRole[];
  submissionSettings: IReviewsSubmissionSettings;
  ctaBanner: IReviewsCtaBanner;
  seo: IReviewsSeo;
  isPublished?: boolean;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
}

export const DEFAULT_REVIEWS_PAGE_DATA: IReviewsPageData = {
  sectionsOrder: ["hero", "stats", "filters_and_wall", "cta"],
  hero: {
    badge: "Voice of Our Seneca Community",
    title: "Real Stories & Authentic Reviews from",
    titleGradient: "Seneca Families",
    subtitle:
      "Discover unfiltered parent testimonials, alumni achievements, and student experiences from our campuses in Soldier Bazar, Karachi. We celebrate transparency, academic rigor, and moral excellence.",
    primaryButtonText: "Write Your Review",
    secondaryButtonText: "Browse All Reviews",
    trustBadges: [
      { icon: "ShieldCheck", text: "100% Verified Community" },
      { icon: "CheckCircle2", text: "Direct Principal Oversight" },
      { icon: "HeartHandshake", text: "Unbiased Feedback Policy" },
    ],
  },
  stats: {
    showScorecard: true,
    score: 4.9,
    recommendRate: 98,
    totalReviewsText: "Based on 340+ verified parent, alumni & student responses",
    metricCards: [
      {
        id: "parent-satisfaction",
        title: "Parent Satisfaction",
        value: "98.6%",
        description: "Rated highly for personalized teacher care and safe campus environment.",
        icon: "Users",
        badge: "Annual Survey",
      },
      {
        id: "academic-growth",
        title: "Academic Confidence",
        value: "99.2%",
        description: "Zero private tuitions needed due to rigorous classroom conceptual focus.",
        icon: "GraduationCap",
        badge: "Board Position Holders",
      },
      {
        id: "facilities-rating",
        title: "Campus & Labs Rating",
        value: "4.9 / 5",
        description: "Modern robotics studio, air-conditioned Montessori & science labs.",
        icon: "Sparkles",
        badge: "State of Art",
      },
    ],
  },
  categories: [
    {
      id: "all",
      label: "All Categories",
      icon: "Layers",
      description: "Comprehensive community feedback across all school dimensions",
      isActive: true,
    },
    {
      id: "Academic Excellence",
      label: "Academics",
      icon: "BookOpen",
      description: "Curriculum rigor, board preparation, and conceptual clarity",
      isActive: true,
    },
    {
      id: "Faculty & Mentorship",
      label: "Faculty & Mentors",
      icon: "GraduationCap",
      description: "Teacher dedication, approachability, and mentorship",
      isActive: true,
    },
    {
      id: "Campus Facilities & Labs",
      label: "Campus & Labs",
      icon: "Building2",
      description: "Science labs, robotics studio, classrooms, and libraries",
      isActive: true,
    },
    {
      id: "Discipline & Moral Values",
      label: "Values & Ethics",
      icon: "ShieldCheck",
      description: "Character building, Islamic ethics, and respectful conduct",
      isActive: true,
    },
    {
      id: "Admissions & Administration",
      label: "Admissions Desk",
      icon: "CreditCard",
      description: "Admissions transparency, counseling, and parent service",
      isActive: true,
    },
    {
      id: "Sports & Extracurriculars",
      label: "Sports & Arts",
      icon: "Sparkles",
      description: "Athletics, debates, Model UN, and physical wellness",
      isActive: true,
    },
  ],
  roles: [
    { id: "all", label: "All Roles", icon: "Users", isActive: true },
    { id: "Parent", label: "Parents", icon: "ShieldCheck", isActive: true },
    { id: "Student", label: "Students", icon: "Sparkles", isActive: true },
    { id: "Alumni", label: "Alumni", icon: "GraduationCap", isActive: true },
    { id: "Prospective Parent", label: "Prospective Families", icon: "HeartHandshake", isActive: true },
    { id: "Teacher", label: "Faculty Members", icon: "BookOpen", isActive: true },
  ],
  submissionSettings: {
    allowPublicSubmissions: true,
    requireModeration: false,
    modalTitle: "Share Your Seneca Experience",
    modalSubtitle:
      "Your candid feedback helps us maintain educational excellence and guides prospective parents.",
    guidelinesText:
      "Please keep reviews constructive and respectful. Submissions are reviewed for authenticity.",
    successMessage: "Thank you! Your review has been submitted and published successfully.",
  },
  ctaBanner: {
    badge: "We Value Every Voice",
    headline: "Are you a current parent, alumnus, or student?",
    description:
      "Help prospective families make informed choices. Your honest review only takes 2 minutes and strengthens our educational community.",
    primaryButtonText: "Submit Your Review",
    primaryButtonLink: "#write-review",
    secondaryButtonText: "Schedule Campus Visit",
    secondaryButtonLink: "/contact",
  },
  seo: {
    metaTitle: "Parent & Community Feedback & Reviews — Seneca Academy Karachi",
    metaDescription:
      "Explore authentic reviews and ratings from parents, students, and alumni of Seneca Academy in Soldier Bazar, Karachi. Discover feedback on academics, faculty, and campus life.",
    ogImage: "/images/og-feedback.jpg",
    keywords: [
      "Seneca Academy reviews",
      "Karachi school parent feedback",
      "best schools in soldier bazar reviews",
      "seneca academy ratings",
      "matric board school reviews karachi",
    ],
  },
  isPublished: true,
};
