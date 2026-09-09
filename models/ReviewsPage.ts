import mongoose, { Schema, Document, Model } from "mongoose";
import {
  IReviewsHero,
  IReviewsStats,
  IReviewsCategory,
  IReviewsRole,
  IReviewsSubmissionSettings,
  IReviewsCtaBanner,
  IReviewsSeo,
  DEFAULT_REVIEWS_PAGE_DATA,
} from "@/lib/db/reviews-page-defaults";

export interface IReviewsPageDocument extends Document {
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
  hero: IReviewsHero;
  stats: IReviewsStats;
  categories: IReviewsCategory[];
  roles: IReviewsRole[];
  submissionSettings: IReviewsSubmissionSettings;
  ctaBanner: IReviewsCtaBanner;
  seo: IReviewsSeo;
  draft?: {
    pageTitle?: string;
    pageDescription?: string;
    sectionsOrder?: string[];
    hero?: IReviewsHero;
    stats?: IReviewsStats;
    categories?: IReviewsCategory[];
    roles?: IReviewsRole[];
    submissionSettings?: IReviewsSubmissionSettings;
    ctaBanner?: IReviewsCtaBanner;
    seo?: IReviewsSeo;
    updatedAt?: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const TrustBadgeSchema = new Schema(
  {
    icon: { type: String, default: "ShieldCheck" },
    text: { type: String, required: true },
  },
  { _id: false }
);

const HeroSchema = new Schema(
  {
    badge: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.hero.badge },
    title: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.hero.title },
    titleGradient: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.hero.titleGradient },
    subtitle: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.hero.subtitle },
    primaryButtonText: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.hero.primaryButtonText },
    secondaryButtonText: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.hero.secondaryButtonText },
    trustBadges: { type: [TrustBadgeSchema], default: DEFAULT_REVIEWS_PAGE_DATA.hero.trustBadges },
  },
  { _id: false }
);

const MetricCardSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    value: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "Users" },
    badge: { type: String },
  },
  { _id: false }
);

const StatsSchema = new Schema(
  {
    showScorecard: { type: Boolean, default: true },
    score: { type: Number, default: 4.9 },
    recommendRate: { type: Number, default: 98 },
    totalReviewsText: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.stats.totalReviewsText },
    metricCards: { type: [MetricCardSchema], default: DEFAULT_REVIEWS_PAGE_DATA.stats.metricCards },
  },
  { _id: false }
);

const CategorySchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, default: "Layers" },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const RoleSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, default: "Users" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const SubmissionSettingsSchema = new Schema(
  {
    allowPublicSubmissions: { type: Boolean, default: true },
    requireModeration: { type: Boolean, default: false },
    modalTitle: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.submissionSettings.modalTitle },
    modalSubtitle: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.submissionSettings.modalSubtitle },
    guidelinesText: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.submissionSettings.guidelinesText },
    successMessage: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.submissionSettings.successMessage },
  },
  { _id: false }
);

const CtaBannerSchema = new Schema(
  {
    badge: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.ctaBanner.badge },
    headline: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.ctaBanner.headline },
    description: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.ctaBanner.description },
    primaryButtonText: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.ctaBanner.primaryButtonText },
    primaryButtonLink: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.ctaBanner.primaryButtonLink },
    secondaryButtonText: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.ctaBanner.secondaryButtonText },
    secondaryButtonLink: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.ctaBanner.secondaryButtonLink },
  },
  { _id: false }
);

const SeoSchema = new Schema(
  {
    metaTitle: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.seo.metaTitle },
    metaDescription: { type: String, default: DEFAULT_REVIEWS_PAGE_DATA.seo.metaDescription },
    ogImage: { type: String, default: "" },
    keywords: { type: [String], default: DEFAULT_REVIEWS_PAGE_DATA.seo.keywords },
  },
  { _id: false }
);

const ReviewsPageSchema = new Schema<IReviewsPageDocument>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: false,
    },
    pageTitle: {
      type: String,
      default: "Community Reviews & Feedback",
      trim: true,
    },
    pageDescription: {
      type: String,
      default: "Authentic parent testimonials and community feedback for Seneca Academy.",
      trim: true,
    },
    slug: {
      type: String,
      default: "reviews",
      lowercase: true,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    publishedBy: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
    },
    draftUpdatedAt: {
      type: Date,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
    },
    sectionsOrder: {
      type: [String],
      default: DEFAULT_REVIEWS_PAGE_DATA.sectionsOrder,
    },
    hero: {
      type: HeroSchema,
      default: () => ({ ...DEFAULT_REVIEWS_PAGE_DATA.hero }),
    },
    stats: {
      type: StatsSchema,
      default: () => ({ ...DEFAULT_REVIEWS_PAGE_DATA.stats }),
    },
    categories: {
      type: [CategorySchema],
      default: () => [...DEFAULT_REVIEWS_PAGE_DATA.categories],
    },
    roles: {
      type: [RoleSchema],
      default: () => [...DEFAULT_REVIEWS_PAGE_DATA.roles],
    },
    submissionSettings: {
      type: SubmissionSettingsSchema,
      default: () => ({ ...DEFAULT_REVIEWS_PAGE_DATA.submissionSettings }),
    },
    ctaBanner: {
      type: CtaBannerSchema,
      default: () => ({ ...DEFAULT_REVIEWS_PAGE_DATA.ctaBanner }),
    },
    seo: {
      type: SeoSchema,
      default: () => ({ ...DEFAULT_REVIEWS_PAGE_DATA.seo }),
    },
    draft: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ReviewsPageSchema.index({ slug: 1, isPublished: 1 });
ReviewsPageSchema.index({ schoolId: 1 });

const ReviewsPage: Model<IReviewsPageDocument> =
  mongoose.models.ReviewsPage || mongoose.model<IReviewsPageDocument>("ReviewsPage", ReviewsPageSchema);

export default ReviewsPage;
