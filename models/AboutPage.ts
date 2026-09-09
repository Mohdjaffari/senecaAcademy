import mongoose, { Schema, Document, Model } from "mongoose";
import {
  IHeroData,
  IVisionMissionData,
  ICoreValuesData,
  IMilestonesData,
  IPrincipalData,
  ICampusCtaData,
  ISEOData,
} from "@/lib/db/about-page-defaults";

export interface IAboutPageDocument extends Document {
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
  hero: IHeroData;
  principal: IPrincipalData;
  visionMission: IVisionMissionData;
  coreValues: ICoreValuesData;
  milestones: IMilestonesData;
  campusCta: ICampusCtaData;
  seo: ISEOData;
  draft?: {
    pageTitle?: string;
    pageDescription?: string;
    sectionsOrder?: string[];
    hero?: IHeroData;
    principal?: IPrincipalData;
    visionMission?: IVisionMissionData;
    coreValues?: ICoreValuesData;
    milestones?: IMilestonesData;
    campusCta?: ICampusCtaData;
    seo?: ISEOData;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Our Heritage & Purpose" },
    badgeIcon: { type: String, default: "Compass" },
    showBadge: { type: Boolean, default: true },
    title: { type: String, default: "Nurturing Minds, Building Character" },
    highlightedTitle: { type: String, default: "Since 2001." },
    description: { type: String, default: "" },
    breadcrumbs: [
      {
        label: { type: String, required: true },
        href: { type: String },
      },
    ],
    primaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Apply for Admission" },
      href: { type: String, default: "/admissions" },
      dynamicBehavior: { type: String, default: "admissions_toggle" },
    },
    secondaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Explore Academics" },
      href: { type: String, default: "/academics" },
    },
    variant: {
      type: String,
      enum: ["crimson", "amber", "emerald", "default"],
      default: "crimson",
    },
  },
  { _id: false }
);

const PrincipalSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "From the Principal's Desk" },
    heading: { type: String, default: "A Message to Parents and Guardians" },
    name: { type: String, default: "M. Zohaib Ali" },
    designation: { type: String, default: "Executive Principal & Academic Director" },
    photoUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1554126807-6b10f6f6692a?auto=format&fit=crop&w=800&q=80",
    },
    photoPublicId: { type: String },
    photoAlt: { type: String, default: "Principal M. Zohaib Ali" },
    qualification: { type: String, default: "M.Sc. Educational Leadership, Ph.D. Fellow" },
    office: { type: String, default: "Principal Office" },
    messageParagraphs: [{ type: String }],
  },
  { _id: false }
);

const VisionMissionItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "Compass" },
    iconBgClass: { type: String, default: "bg-seneca-crimson/10 text-seneca-crimson" },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const VisionMissionSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Strategic Foundations" },
    heading: { type: String, default: "Our Vision and Mission" },
    description: { type: String, default: "" },
    items: [VisionMissionItemSchema],
  },
  { _id: false }
);

const CoreValueItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    icon: { type: String, default: "Cpu" },
    iconColor: { type: String, default: "text-seneca-crimson dark:text-seneca-amber-light" },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const CoreValuesSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Ethos & Culture" },
    heading: { type: String, default: "The Four Pillars of Seneca Academy" },
    description: { type: String, default: "" },
    items: [CoreValueItemSchema],
  },
  { _id: false }
);

const MilestoneItemSchema = new Schema(
  {
    id: { type: String, required: true },
    year: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    icon: { type: String, default: "Landmark" },
    highlights: [{ type: String }],
    gradient: { type: String, default: "from-seneca-crimson to-seneca-crimson-dark" },
    badgeVariant: {
      type: String,
      default: "border-seneca-crimson/30 text-seneca-crimson bg-seneca-crimson/10",
    },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const MilestonesSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Our Heritage & Evolution" },
    badgeIcon: { type: String, default: "Compass" },
    heading: { type: String, default: "Twenty-Five Years of" },
    highlightedHeading: { type: String, default: "Excellence." },
    description: { type: String, default: "" },
    ribbonTitle: { type: String, default: "Looking Toward the Future" },
    ribbonDescription: { type: String, default: "" },
    items: [MilestoneItemSchema],
  },
  { _id: false }
);

const CampusCtaSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, default: "Experience Our Campus in Person" },
    description: { type: String, default: "" },
    primaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Book a Guided Campus Tour" },
      href: { type: String, default: "/contact" },
    },
    secondaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "View Campus Gallery" },
      href: { type: String, default: "/gallery" },
    },
    variant: { type: String, default: "default" },
  },
  { _id: false }
);

const SEOSchema = new Schema(
  {
    title: { type: String, default: "About Us — Seneca Academy Karachi" },
    description: { type: String, default: "" },
    keywords: { type: String, default: "" },
    ogTitle: { type: String, default: "About Us — Seneca Academy Karachi" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String },
  },
  { _id: false }
);

const AboutPageSchema = new Schema<IAboutPageDocument>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
      unique: true,
      index: true,
    },
    pageTitle: { type: String, default: "About Us — Seneca Academy" },
    pageDescription: { type: String, default: "" },
    slug: { type: String, default: "about", index: true },
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
      default: ["hero", "principal", "visionMission", "coreValues", "milestones", "campusCta"],
    },
    hero: { type: HeroSchema, required: true },
    principal: { type: PrincipalSchema, required: true },
    visionMission: { type: VisionMissionSchema, required: true },
    coreValues: { type: CoreValuesSchema, required: true },
    milestones: { type: MilestonesSchema, required: true },
    campusCta: { type: CampusCtaSchema, required: true },
    seo: { type: SEOSchema, required: true },
    draft: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AboutPage: Model<IAboutPageDocument> =
  mongoose.models.AboutPage || mongoose.model<IAboutPageDocument>("AboutPage", AboutPageSchema);

export default AboutPage;
