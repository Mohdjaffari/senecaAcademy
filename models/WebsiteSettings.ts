import mongoose, { Schema, Document, Model } from "mongoose";

export interface INavbarLink {
  id?: string;
  label: string;
  href: string;
  isExternal?: boolean;
  isVisible: boolean;
  order: number;
}

export interface ISenecaPillar {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}

export interface IFAQItem {
  id?: string;
  _id?: string;
  category: string;
  categoryLabel?: string;
  question: string;
  answer: string;
  tags?: string[];
  order?: number;
  isActive?: boolean;
}

export interface ICampusFacility {
  id?: string;
  _id?: string;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  icon?: string;
  imgUrl?: string;
}

export interface IFeeTier {
  id?: string;
  _id?: string;
  name: string;
  badge: string;
  badgeColor?: string;
  gradeRange: string;
  admissionFee: string;
  securityDeposit: string;
  monthlyTuition: string;
  annualCharges?: string;
  labFund?: string;
  features?: string[];
  isPopular?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface IAcademicStage {
  id?: string;
  _id?: string;
  name: string;
  badge: string;
  badgeColor?: string;
  gradeRange?: string;
  description: string;
  highlights?: string[];
  image?: string;
  order?: number;
  isActive?: boolean;
}

export interface IWebsiteSettings extends Document {
  schoolId: mongoose.Types.ObjectId;
  admissionsOpen: boolean;
  admissionsDeadline?: string;
  admissionsSession?: string;
  admissionsNotice: string;
  admissionsClosedNotice?: string;
  admissionsAnnouncement?: string;
  navbarLinks: INavbarLink[];
  hero: {
    badge: string;
    title1: string;
    title2: string;
    titleSuffix?: string;
    description: string;
    ctaText: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    img1Url?: string;
    img2Url?: string;
    campusTag?: string;
    campusTitle?: string;
    campusDesc?: string;
    statBadge1Value?: string;
    statBadge1Label?: string;
    statBadge1Sub?: string;
    statBadge2Value?: string;
    statBadge2Label?: string;
    statBadge2Sub?: string;
    trustBadge1?: string;
    trustBadge2?: string;
    trustBadge3?: string;
  };
  senecaDifference: ISenecaPillar[];
  stats: {
    value: string;
    label: string;
  }[];
  about: {
    subtitle: string;
    title: string;
    description: string;
    badges: string[];
    imgUrl?: string;
    years: string;
    yearsLabel: string;
  };
  visionMission: {
    vision: string;
    mission: string;
  };
  principalMessage: {
    name: string;
    title: string;
    quote: string;
    description: string;
    imgUrl?: string;
  };
  academicsPage: {
    bannerTitle: string;
    bannerDesc: string;
    preschoolDesc: string;
    primaryDesc: string;
    middleDesc: string;
    highDesc: string;
    stemLabDesc: string;
  };
  facultyPage: {
    bannerTitle: string;
    bannerDesc: string;
    standardsStatement: string;
  };
  fees: {
    preschool: { admission: string; security: string; tuition: string };
    middle: { admission: string; security: string; tuition: string };
    high: { admission: string; lab: string; tuition: string };
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    hours: string;
    mapEmbedUrl?: string;
  };
  career: {
    title: string;
    description: string;
    email: string;
    subjects: string[];
  };
  footer: {
    brandDesc: string;
    copyrightText: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  faqs?: IFAQItem[];
  campusFacilities?: ICampusFacility[];
  feeTiers?: IFeeTier[];
  academicStages?: IAcademicStage[];
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteSettingsSchema = new Schema<IWebsiteSettings>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, unique: true, index: true },
    admissionsOpen: { type: Boolean, default: true },
    admissionsDeadline: { type: String, default: "" },
    admissionsSession: { type: String, default: "Session 2026–2027" },
    admissionsNotice: { type: String, default: "ADMISSIONS OPEN FOR SESSION 2026–27 (LIMITED SEATS)" },
    admissionsClosedNotice: {
      type: String,
      default: "Admissions for Session 2026–27 are currently closed. Inquiries open for next cycle.",
    },
    admissionsAnnouncement: { type: String, default: "" },
    navbarLinks: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        isExternal: { type: Boolean, default: false },
        isVisible: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
      },
    ],
    hero: {
      badge: { type: String, default: "Admissions Open 2026–2027" },
      title1: { type: String, default: "Shaping" },
      title2: { type: String, default: "Tomorrow" },
      titleSuffix: { type: String, default: "Through Rigorous Education & Integrity." },
      description: {
        type: String,
        default:
          "Beyond ordinary schooling. Seneca Academy cultivates intellect, builds character, and prepares leaders for the future.",
      },
      ctaText: { type: String, default: "Explore Academy" },
      ctaLink: { type: String, default: "/admissions" },
      secondaryCtaText: { type: String, default: "Contact Admissions Desk" },
      secondaryCtaLink: { type: String, default: "/contact" },
      img1Url: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
      },
      img2Url: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
      },
      campusTag: { type: String, default: "SOLDIER BAZAR CAMPUS • KARACHI" },
      campusTitle: { type: String, default: "Center for Excellence & Moral Leadership" },
      campusDesc: {
        type: String,
        default: "Comprehensive education spanning Playgroup, Primary, Middle, and BSEK Matriculation.",
      },
      statBadge1Value: { type: String, default: "25+" },
      statBadge1Label: { type: String, default: "Years of Heritage" },
      statBadge1Sub: { type: String, default: "Est. in Soldier Bazar" },
      statBadge2Value: { type: String, default: "100%" },
      statBadge2Label: { type: String, default: "Board Distinction" },
      statBadge2Sub: { type: String, default: "Matric & Cambridge Level" },
      trustBadge1: { type: String, default: "Govt. Recognized Institution" },
      trustBadge2: { type: String, default: "State-of-the-art STEM Labs" },
      trustBadge3: { type: String, default: "100% Board Pass Rate" },
    },
    senecaDifference: [
      {
        title: { type: String, default: "Cambridge Curriculum Standard" },
        subtitle: { type: String, default: "Global Rigor" },
        description: { type: String, default: "Aligned with international benchmarks emphasizing critical analytical inquiry." },
        badge: { type: String, default: "Academic Excellence" },
      },
      {
        title: { type: String, default: "Robotics & AI Innovation Lab" },
        subtitle: { type: String, default: "Next-Gen Tech" },
        description: { type: String, default: "Early computer science, robotics, and STEM engineering pedagogy." },
        badge: { type: String, default: "STEM Leadership" },
      },
      {
        title: { type: String, default: "Character & Ethical Foundation" },
        subtitle: { type: String, default: "Moral Compass" },
        description: { type: String, default: "Instilling empathy, integrity, discipline, and responsible civic leadership." },
        badge: { type: String, default: "Holistic Growth" },
      },
    ],
    stats: [
      {
        value: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
    about: {
      subtitle: { type: String, default: "Discover Seneca" },
      title: { type: String, default: "About Us" },
      description: {
        type: String,
        default:
          "Founded on the pursuit of unparalleled academic excellence, Seneca Academy stands as a beacon of progressive education.",
      },
      badges: [{ type: String }],
      imgUrl: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
      },
      years: { type: String, default: "25+" },
      yearsLabel: { type: String, default: "Years Heritage" },
    },
    visionMission: {
      vision: {
        type: String,
        default:
          "To be recognized as a center of educational excellence, fostering innovation, creativity, and character development.",
      },
      mission: {
        type: String,
        default:
          "To provide an inclusive, stimulating, and challenging learning environment that empowers students to reach their full potential.",
      },
    },
    principalMessage: {
      name: { type: String, default: "Dr. Ayesha Siddiqui" },
      title: { type: String, default: "Principal & Academic Director" },
      quote: {
        type: String,
        default:
          "At Seneca, we do not just teach students; we nurture leaders equipped to thrive in the 21st century.",
      },
      description: {
        type: String,
        default:
          "Since our inception, our focus has been creating a school culture that balances academic rigor with emotional intelligence.",
      },
      imgUrl: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1554126807-6b10f6f6692a?auto=format&fit=crop&w=800&q=80",
      },
    },
    academicsPage: {
      bannerTitle: { type: String, default: "Comprehensive Academic Pathways" },
      bannerDesc: { type: String, default: "From Playgroup to Cambridge O-Level & Matriculation, our structured curriculum fosters holistic excellence." },
      preschoolDesc: { type: String, default: "Montessori & Play-based foundational literacy and motor skills." },
      primaryDesc: { type: String, default: "Core conceptual inquiry in mathematics, languages, and environmental sciences." },
      middleDesc: { type: String, default: "Rigorous preparation bridging primary learning to Cambridge O-Level." },
      highDesc: { type: String, default: "Cambridge CAIE O-Level and Matriculation science cohorts." },
      stemLabDesc: { type: String, default: "State-of-the-art physics, chemistry, biology, and robotics AI laboratories." },
    },
    facultyPage: {
      bannerTitle: { type: String, default: "Distinguished Academic Mentors" },
      bannerDesc: { type: String, default: "Meet our passionate educators dedicated to shaping young leaders." },
      standardsStatement: { type: String, default: "Our faculty comprises Cambridge-certified subject specialists committed to individual student mentorship." },
    },
    fees: {
      preschool: {
        admission: { type: String, default: "Rs. 15,000" },
        security: { type: String, default: "Rs. 5,000" },
        tuition: { type: String, default: "Rs. 6,500" },
      },
      middle: {
        admission: { type: String, default: "Rs. 25,000" },
        security: { type: String, default: "Rs. 10,000" },
        tuition: { type: String, default: "Rs. 8,500" },
      },
      high: {
        admission: { type: String, default: "Rs. 35,000" },
        lab: { type: String, default: "Rs. 5,000" },
        tuition: { type: String, default: "Rs. 11,500" },
      },
    },
    contact: {
      address: { type: String, default: "Soldier Bazar, Karachi, Pakistan" },
      phone: { type: String, default: "+92 335 7413777" },
      email: { type: String, default: "info@seneca.edu.pk" },
      hours: { type: String, default: "Mon - Sat: 8:00 AM - 3:00 PM" },
      mapEmbedUrl: {
        type: String,
        default:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.8876!2d67.0282!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f0c3a5f5555%3A0x3c8c6fbd3b7d3d3d!2sSoldier%20Bazaar%2C%20Karachi%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s",
      },
    },
    career: {
      title: { type: String, default: "Join Our Faculty" },
      description: {
        type: String,
        default:
          "Be a part of our mission to shape the future. We are looking for passionate educators who inspire excellence.",
      },
      email: { type: String, default: "careers@seneca.edu.pk" },
      subjects: [{ type: String }],
    },
    footer: {
      brandDesc: {
        type: String,
        default:
          "Building character, cultivating intellect, and engineering the leaders of the next generation.",
      },
      copyrightText: { type: String, default: "© 2026 Seneca Academy. All rights reserved." },
      facebook: { type: String, default: "https://facebook.com" },
      instagram: { type: String, default: "https://instagram.com" },
      linkedin: { type: String, default: "https://linkedin.com" },
      youtube: { type: String, default: "https://youtube.com" },
    },
    faqs: [
      {
        category: { type: String, default: "admissions" },
        categoryLabel: { type: String, default: "Admissions & Enrollment" },
        question: { type: String, required: true },
        answer: { type: String, required: true },
        tags: [{ type: String }],
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    campusFacilities: [
      {
        title: { type: String, default: "Robotics & AI Innovation Lab" },
        subtitle: { type: String, default: "Next-Gen STEM" },
        description: { type: String, default: "Equipped with modern micro-controllers, 3D printing, and programming workstations." },
        badge: { type: String, default: "STEM Excellence" },
        icon: { type: String, default: "Cpu" },
        imgUrl: { type: String, default: "" },
      },
    ],
    feeTiers: [
      {
        name: { type: String, required: true },
        badge: { type: String, default: "Standard" },
        badgeColor: { type: String, default: "emerald" },
        gradeRange: { type: String, default: "" },
        admissionFee: { type: String, default: "Rs. 15,000" },
        securityDeposit: { type: String, default: "Rs. 5,000" },
        monthlyTuition: { type: String, default: "Rs. 6,500" },
        annualCharges: { type: String, default: "Rs. 4,000" },
        labFund: { type: String, default: "" },
        features: [{ type: String }],
        isPopular: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    academicStages: [
      {
        name: { type: String, required: true },
        badge: { type: String, default: "Academic Wing" },
        badgeColor: { type: String, default: "emerald" },
        gradeRange: { type: String, default: "" },
        description: { type: String, default: "" },
        highlights: [{ type: String }],
        image: { type: String, default: "" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models && mongoose.models.WebsiteSettings) {
  delete mongoose.models.WebsiteSettings;
}

export const WebsiteSettings: Model<IWebsiteSettings> =
  mongoose.models.WebsiteSettings ||
  mongoose.model<IWebsiteSettings>("WebsiteSettings", WebsiteSettingsSchema);

export default WebsiteSettings;
