import mongoose, { Schema, Document, Model } from "mongoose";
import {
  IFaqsHeroData,
  IFaqCategory,
  IFaqQuestionItem,
  IFaqsStatsData,
  IFaqsHelpdeskData,
  ISEOData,
} from "@/lib/db/faqs-page-defaults";

export interface IFaqPageDocument extends Document {
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
  hero: IFaqsHeroData;
  categories: IFaqCategory[];
  questions: IFaqQuestionItem[];
  stats: IFaqsStatsData;
  helpdesk: IFaqsHelpdeskData;
  seo: ISEOData;
  draft?: {
    pageTitle?: string;
    pageDescription?: string;
    sectionsOrder?: string[];
    hero?: IFaqsHeroData;
    categories?: IFaqCategory[];
    questions?: IFaqQuestionItem[];
    stats?: IFaqsStatsData;
    helpdesk?: IFaqsHelpdeskData;
    seo?: ISEOData;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Institutional Knowledge Base" },
    badgeIcon: { type: String, default: "HelpCircle" },
    title: { type: String, default: "Frequently Asked Questions &" },
    highlightedTitle: { type: String, default: "Admissions Helpdesk." },
    description: {
      type: String,
      default:
        "Find instant, verified answers regarding our admission roadmaps, Cambridge & BSEK matriculation streams, fee structures, faculty standards, and Seneca LMS portal.",
    },
    leftSpecChip: {
      badgeText: { type: String, default: "20+ Verified Answers" },
      description: { type: String, default: "Updated for Academic Session 2026–2027" },
      icon: { type: String, default: "CheckCircle2" },
    },
    rightSpecChip: {
      badgeText: { type: String, default: "Direct Counseling" },
      description: { type: String, default: "Saturday Assessment & Campus Helpdesk" },
      icon: { type: String, default: "PhoneCall" },
    },
    primaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Explore Admissions & Fees" },
      href: { type: String, default: "/admissions" },
    },
    secondaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Contact Helpdesk" },
      href: { type: String, default: "/contact" },
    },
    variant: { type: String, enum: ["crimson", "amber", "emerald", "default"], default: "amber" },
  },
  { _id: false }
);

const CategoryItemSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, default: "HelpCircle" },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const QuestionItemSchema = new Schema(
  {
    id: { type: String, required: true },
    categoryId: { type: String, required: true },
    categoryLabel: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    tags: { type: [String], default: [] },
    isHighlighted: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const StatItemSchema = new Schema(
  {
    id: { type: String, required: true },
    value: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "Award" },
  },
  { _id: false }
);

const StatsSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Key Highlights" },
    heading: { type: String, default: "Institutional Proof Points & Standards" },
    items: { type: [StatItemSchema], default: [] },
  },
  { _id: false }
);

const HelpdeskSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Personalized Assistance" },
    heading: { type: String, default: "Still Have Questions?" },
    description: {
      type: String,
      default:
        "Our academic counselors and admissions officers are here to assist you with any inquiries regarding admissions, curriculum, or enrollment.",
    },
    phone: { type: String, default: "+92 335 7413777" },
    phoneHours: { type: String, default: "Mon – Sat, 8:00 AM – 3:00 PM" },
    email: { type: String, default: "info@seneca.edu.pk" },
    emailResponseTime: { type: String, default: "Response within 24 business hours" },
    campusAddress: { type: String, default: "Soldier Bazar, Garden East, Karachi, Pakistan" },
    whatsappNumber: { type: String, default: "+92 335 7413777" },
  },
  { _id: false }
);

const SEOSchema = new Schema(
  {
    metaTitle: {
      type: String,
      default: "Frequently Asked Questions (FAQs) — Seneca Academy Karachi",
    },
    metaDescription: {
      type: String,
      default:
        "Find instant answers to common questions regarding admissions, fees, BSEK matriculation curriculum, Seneca LMS portal, and campus life in Soldier Bazar, Karachi.",
    },
    keywords: {
      type: [String],
      default: [
        "Seneca Academy FAQs",
        "Karachi school questions",
        "matric admissions Karachi",
        "school fee discounts Karachi",
        "Seneca LMS login help",
      ],
    },
    ogImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    },
  },
  { _id: false }
);

const FaqPageSchema = new Schema<IFaqPageDocument>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },
    pageTitle: { type: String, default: "Frequently Asked Questions" },
    pageDescription: {
      type: String,
      default: "Centralized knowledge base and FAQ directory for Seneca Academy Karachi.",
    },
    slug: { type: String, default: "faqs", index: true },
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
      default: ["hero", "stats", "questions", "helpdesk"],
    },
    hero: { type: HeroSchema, default: () => ({}) },
    categories: { type: [CategoryItemSchema], default: [] },
    questions: { type: [QuestionItemSchema], default: [] },
    stats: { type: StatsSchema, default: () => ({}) },
    helpdesk: { type: HelpdeskSchema, default: () => ({}) },
    seo: { type: SEOSchema, default: () => ({}) },
    draft: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

const FaqPage: Model<IFaqPageDocument> =
  mongoose.models.FaqPage || mongoose.model<IFaqPageDocument>("FaqPage", FaqPageSchema);

export default FaqPage;
