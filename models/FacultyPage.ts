import mongoose, { Schema, Document, Model } from "mongoose";
import {
  IFacultyHeroData,
  IFacultySectionData,
  IFacultyCareersData,
  IFacultyStandardsData,
  ICampusFacilitiesData,
  IFacultyExperienceCtaData,
  ISEOData,
} from "@/lib/db/faculty-page-defaults";

export interface IFacultyPageDocument extends Document {
  schoolId: mongoose.Types.ObjectId;
  pageTitle: string;
  pageDescription: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: {
    userId?: string;
    name?: string;
    email?: string;
  };
  draftUpdatedAt?: Date;
  lastUpdated?: Date;
  updatedBy?: {
    userId?: string;
    name?: string;
    email?: string;
  };
  sectionsOrder: string[];
  hero: IFacultyHeroData;
  facultySection: IFacultySectionData;
  careers: IFacultyCareersData;
  standards: IFacultyStandardsData;
  facilities: ICampusFacilitiesData;
  experienceCta: IFacultyExperienceCtaData;
  seo: ISEOData;
  draft?: {
    sectionsOrder?: string[];
    hero?: IFacultyHeroData;
    facultySection?: IFacultySectionData;
    careers?: IFacultyCareersData;
    standards?: IFacultyStandardsData;
    facilities?: ICampusFacilitiesData;
    experienceCta?: IFacultyExperienceCtaData;
    seo?: ISEOData;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Master-Level Faculty & Pedagogical Mentors" },
    badgeIcon: { type: String, default: "Users" },
    title: { type: String, default: "Mentorship by Distinguished" },
    highlightedTitle: { type: String, default: "Educators & Leaders." },
    description: { type: String, default: "" },
    leftSpecChip: {
      badgeText: { type: String, default: "100% Certified" },
      description: { type: String, default: "Master & Subject Specialist Faculty" },
      icon: { type: String, default: "GraduationCap" },
    },
    rightSpecChip: {
      badgeText: { type: String, default: "1:12 Mentorship" },
      description: { type: String, default: "Personalized Student Mentorship Ratio" },
      icon: { type: String, default: "Award" },
    },
    primaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Meet Our Educators" },
      href: { type: String, default: "#faculty-team" },
    },
    secondaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Careers at Seneca" },
      href: { type: String, default: "#careers" },
    },
    variant: {
      type: String,
      enum: ["crimson", "amber", "emerald", "default"],
      default: "crimson",
    },
  },
  { _id: false }
);

const FacultyMemberSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    qual: { type: String, required: true },
    exp: { type: String, required: true },
    imgUrl: { type: String, required: true },
    bio: { type: String, default: "" },
    badge: { type: String, default: "" },
    badgeColor: {
      type: String,
      enum: ["crimson", "amber", "emerald", "sky", "indigo"],
      default: "crimson",
    },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const FacultySectionSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "World-Class Educators" },
    heading: { type: String, default: "Mentorship by Distinguished Educators" },
    description: { type: String, default: "" },
    members: { type: [FacultyMemberSchema], default: [] },
  },
  { _id: false }
);

const FacultyCareersSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Careers at Seneca" },
    heading: { type: String, default: "Passionate About Teaching? Join Our Faculty." },
    description: { type: String, default: "" },
    benefits: { type: [String], default: [] },
    applyButtonText: { type: String, default: "Apply as Teacher" },
    isHiringActive: { type: Boolean, default: true },
    contactEmail: { type: String, default: "careers@seneca.edu.pk" },
  },
  { _id: false }
);

const TeachingStandardSchema = new Schema(
  {
    id: { type: String, required: true },
    icon: { type: String, default: "GraduationCap" },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const FacultyStandardsSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Faculty Standards" },
    heading: { type: String, default: "Our Uncompromising Standards for Educators" },
    description: { type: String, default: "" },
    items: { type: [TeachingStandardSchema], default: [] },
  },
  { _id: false }
);

const CampusFacilitySchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, default: "Active" },
    imgUrl: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const CampusFacilitiesSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Campus Infrastructure" },
    heading: { type: String, default: "Purpose-Built Learning Spaces & Facilities" },
    description: { type: String, default: "" },
    facilities: { type: [CampusFacilitySchema], default: [] },
  },
  { _id: false }
);

const FacultyExperienceCtaSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, default: "Experience Seneca Mentorship" },
    description: { type: String, default: "" },
    primaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Apply for Admission" },
      href: { type: String, default: "/admissions" },
    },
    secondaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Visit Campus" },
      href: { type: String, default: "/contact" },
    },
  },
  { _id: false }
);

const SEOSchema = new Schema(
  {
    metaTitle: { type: String, default: "Faculty Educators, Campus Facilities & Careers — Seneca Academy Karachi" },
    metaDescription: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    ogImage: { type: String, default: "" },
  },
  { _id: false }
);

const FacultyPageSchema = new Schema<IFacultyPageDocument>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },
    pageTitle: { type: String, default: "Campus & Faculty Management" },
    pageDescription: { type: String, default: "Public faculty directory, teaching standards, careers, and campus infrastructure." },
    slug: { type: String, default: "faculty", index: true },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    publishedBy: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
    },
    draftUpdatedAt: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
    },
    sectionsOrder: {
      type: [String],
      default: ["hero", "faculty", "careers", "standards", "facilities", "experienceCta"],
    },
    hero: { type: HeroSchema, required: true },
    facultySection: { type: FacultySectionSchema, required: true },
    careers: { type: FacultyCareersSchema, required: true },
    standards: { type: FacultyStandardsSchema, required: true },
    facilities: { type: CampusFacilitiesSchema, required: true },
    experienceCta: { type: FacultyExperienceCtaSchema, required: true },
    seo: { type: SEOSchema, required: true },
    draft: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation in development HMR
const FacultyPage: Model<IFacultyPageDocument> =
  mongoose.models.FacultyPage || mongoose.model<IFacultyPageDocument>("FacultyPage", FacultyPageSchema);

export default FacultyPage;
