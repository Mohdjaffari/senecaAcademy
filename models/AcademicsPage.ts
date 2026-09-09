import mongoose, { Schema, Document, Model } from "mongoose";
import {
  IAcademicsHeroData,
  IAcademicDivisionsData,
  IStemInnovationData,
  IAssessmentStandardsData,
  IAcademicsCtaData,
  ISenecaDifferenceData,
  IAcademicsSEOData,
} from "@/lib/db/academics-page-defaults";

export interface IAcademicsPageDocument extends Document {
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
  hero: IAcademicsHeroData;
  academicDivisions: IAcademicDivisionsData;
  stemInnovation: IStemInnovationData;
  assessmentStandards: IAssessmentStandardsData;
  ctaBanner: IAcademicsCtaData;
  senecaDifference?: ISenecaDifferenceData;
  seo: IAcademicsSEOData;
  draft?: {
    pageTitle?: string;
    pageDescription?: string;
    sectionsOrder?: string[];
    hero?: IAcademicsHeroData;
    academicDivisions?: IAcademicDivisionsData;
    stemInnovation?: IStemInnovationData;
    assessmentStandards?: IAssessmentStandardsData;
    ctaBanner?: IAcademicsCtaData;
    senecaDifference?: ISenecaDifferenceData;
    seo?: IAcademicsSEOData;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Curriculum & Academic Spectrum" },
    badgeIcon: { type: String, default: "BookOpen" },
    showBadge: { type: Boolean, default: true },
    title: { type: String, default: "Comprehensive Pathways from" },
    highlightedTitle: { type: String, default: "Montessori to Matric." },
    description: { type: String, default: "" },
    breadcrumbs: [
      {
        label: { type: String, required: true },
        href: { type: String },
      },
    ],
    variant: {
      type: String,
      enum: ["amber", "crimson", "emerald", "default"],
      default: "amber",
    },
    admissionsOpenState: {
      primaryCta: {
        isVisible: { type: Boolean, default: true },
        text: { type: String, default: "Apply for Admission" },
        href: { type: String, default: "/admissions" },
      },
      secondaryCta: {
        isVisible: { type: Boolean, default: true },
        text: { type: String, default: "View Fee Schedule" },
        href: { type: String, default: "/fees" },
      },
    },
    admissionsClosedState: {
      primaryCta: {
        isVisible: { type: Boolean, default: true },
        text: { type: String, default: "View Fee Schedule" },
        href: { type: String, default: "/fees" },
      },
      secondaryCta: {
        isVisible: { type: Boolean, default: true },
        text: { type: String, default: "Contact Admissions" },
        href: { type: String, default: "/contact" },
      },
    },
  },
  { _id: false }
);

const AcademicDivisionItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    badge: { type: String, required: true },
    gradeRange: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    imageAlt: { type: String },
    subjects: [{ type: String }],
    highlights: [{ type: String }],
    highlightStatement: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const AcademicDivisionsSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Educational Wings" },
    heading: { type: String, default: "Structured Academic Divisions" },
    description: { type: String, default: "" },
    items: [AcademicDivisionItemSchema],
  },
  { _id: false }
);

const StemFeatureItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    icon: { type: String, default: "Binary" },
    iconColor: { type: String },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const StemInnovationSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Innovation Studio" },
    heading: { type: String, default: "STEM, Coding & Laboratory Science" },
    description: { type: String, default: "" },
    items: [StemFeatureItemSchema],
  },
  { _id: false }
);

const AssessmentTierItemSchema = new Schema(
  {
    id: { type: String, required: true },
    tag: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    theme: {
      type: String,
      enum: ["crimson", "amber", "emerald", "default"],
      default: "crimson",
    },
    badgeColorClass: { type: String, default: "text-seneca-crimson dark:text-seneca-amber-light" },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const AssessmentStandardsSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Assessment Standards" },
    heading: { type: String, default: "Rigorous Evaluation & Continuous Feedback" },
    description: { type: String, default: "" },
    items: [AssessmentTierItemSchema],
  },
  { _id: false }
);

const TrustCardItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "CheckCircle2" },
    theme: { type: String, default: "amber" },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const CtaBannerSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    eyebrowActiveTemplate: { type: String, default: "{admissionsSession} Admissions Active" },
    eyebrowInactiveTemplate: { type: String, default: "Academic Excellence Track" },
    mainHeading: { type: String, default: "Give Your Child the" },
    highlightedHeading: { type: String, default: "Seneca Academic Advantage" },
    descriptionOpenTemplate: {
      type: String,
      default:
        "Apply online for {admissionsSession} admissions or schedule a personalized diagnostic assessment for your child in Soldier Bazar, Karachi.",
    },
    descriptionClosedTemplate: {
      type: String,
      default:
        "Schedule a one-on-one diagnostic assessment with our academic advisors and discover our comprehensive Cambridge and BSEK pathways.",
    },
    admissionsOpenCtas: {
      primary: {
        isVisible: { type: Boolean, default: true },
        text: { type: String, default: "Apply for Admission" },
        href: { type: String, default: "/admissions" },
      },
      secondary: {
        isVisible: { type: Boolean, default: true },
        text: { type: String, default: "Book Campus Tour" },
        href: { type: String, default: "/contact" },
      },
    },
    admissionsClosedCtas: {
      primary: {
        isVisible: { type: Boolean, default: true },
        text: { type: String, default: "Book Campus Tour" },
        href: { type: String, default: "/contact" },
      },
      secondary: {
        isVisible: { type: Boolean, default: true },
        text: { type: String, default: "Explore Fee Structure" },
        href: { type: String, default: "/fees" },
      },
    },
    trustCards: [TrustCardItemSchema],
    helpline: {
      isVisible: { type: Boolean, default: true },
      prefixText: { type: String, default: "Need guidance with admission criteria?" },
      linkTextTemplate: { type: String, default: "Call Admissions: {phone}" },
    },
    backgroundTheme: {
      type: String,
      enum: ["crimsonLuxury", "amberLuxury", "dark", "default"],
      default: "crimsonLuxury",
    },
  },
  { _id: false }
);

const SEOSchema = new Schema(
  {
    title: { type: String, default: "Academics & Curriculum — Seneca Academy Karachi" },
    description: { type: String, default: "" },
    keywords: { type: String, default: "" },
    ogTitle: { type: String, default: "Academics & Curriculum — Seneca Academy Karachi" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String },
  },
  { _id: false }
);

const SenecaDifferencePillarSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    badge: { type: String },
    description: { type: String, required: true },
    icon: { type: String, default: "Sparkles" },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const SenecaDifferenceSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "The Seneca Difference" },
    heading: { type: String, default: "Why Families Choose Seneca Academy" },
    description: { type: String, default: "" },
    items: [SenecaDifferencePillarSchema],
  },
  { _id: false }
);

const AcademicsPageSchema = new Schema<IAcademicsPageDocument>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
      unique: true,
      index: true,
    },
    pageTitle: { type: String, default: "Academics & Curriculum — Seneca Academy Karachi" },
    pageDescription: { type: String, default: "" },
    slug: { type: String, default: "academics", index: true },
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
      default: [
        "hero",
        "academicDivisions",
        "stemInnovation",
        "assessmentStandards",
        "ctaBanner",
      ],
    },
    hero: { type: HeroSchema, required: true },
    academicDivisions: { type: AcademicDivisionsSchema, required: true },
    stemInnovation: { type: StemInnovationSchema, required: true },
    assessmentStandards: { type: AssessmentStandardsSchema, required: true },
    ctaBanner: { type: CtaBannerSchema, required: true },
    senecaDifference: { type: SenecaDifferenceSchema },
    seo: { type: SEOSchema, required: true },
    draft: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AcademicsPage: Model<IAcademicsPageDocument> =
  mongoose.models.AcademicsPage ||
  mongoose.model<IAcademicsPageDocument>("AcademicsPage", AcademicsPageSchema);

export default AcademicsPage;
