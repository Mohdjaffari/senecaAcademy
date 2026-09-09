import { z } from "zod";

export const TrustBadgeSchema = z.object({
  icon: z.string().default("ShieldCheck"),
  text: z.string().min(1, "Badge text is required").max(60),
});

export const ReviewsHeroSchema = z.object({
  badge: z.string().min(1, "Badge text is required").max(80),
  title: z.string().min(1, "Hero title is required").max(120),
  titleGradient: z.string().min(1, "Gradient text is required").max(80),
  subtitle: z.string().min(1, "Subtitle is required").max(400),
  primaryButtonText: z.string().min(1, "Primary button text is required").max(50),
  secondaryButtonText: z.string().min(1, "Secondary button text is required").max(50),
  trustBadges: z.array(TrustBadgeSchema).default([]),
});

export const ReviewMetricCardSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Card title is required").max(60),
  value: z.string().min(1, "Card value is required").max(30),
  description: z.string().min(1, "Description is required").max(180),
  icon: z.string().default("Users"),
  badge: z.string().optional(),
});

export const ReviewsStatsSchema = z.object({
  showScorecard: z.boolean().default(true),
  score: z.number().min(1).max(5).default(4.9),
  recommendRate: z.number().min(1).max(100).default(98),
  totalReviewsText: z.string().max(120),
  metricCards: z.array(ReviewMetricCardSchema).default([]),
});

export const ReviewsCategorySchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Category label is required").max(60),
  icon: z.string().default("Layers"),
  description: z.string().max(200).default(""),
  isActive: z.boolean().default(true),
});

export const ReviewsRoleSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Role label is required").max(60),
  icon: z.string().default("Users"),
  isActive: z.boolean().default(true),
});

export const ReviewsSubmissionSettingsSchema = z.object({
  allowPublicSubmissions: z.boolean().default(true),
  requireModeration: z.boolean().default(false),
  modalTitle: z.string().min(1, "Modal title is required").max(100),
  modalSubtitle: z.string().min(1, "Modal subtitle is required").max(250),
  guidelinesText: z.string().max(400).default(""),
  successMessage: z.string().max(200).default("Thank you for your review!"),
});

export const ReviewsCtaBannerSchema = z.object({
  badge: z.string().max(60).default("We Value Every Voice"),
  headline: z.string().min(1, "Headline is required").max(120),
  description: z.string().min(1, "Description is required").max(350),
  primaryButtonText: z.string().min(1, "Primary button text is required").max(50),
  primaryButtonLink: z.string().min(1, "Primary button link is required"),
  secondaryButtonText: z.string().min(1, "Secondary button text is required").max(50),
  secondaryButtonLink: z.string().min(1, "Secondary button link is required"),
});

export const ReviewsSeoSchema = z.object({
  metaTitle: z.string().min(1, "Meta title is required").max(120),
  metaDescription: z.string().min(1, "Meta description is required").max(300),
  ogImage: z.string().default(""),
  keywords: z.array(z.string()).default([]),
});

export const ReviewsPageFormValidation = z.object({
  sectionsOrder: z.array(z.string()).default(["hero", "stats", "filters_and_wall", "cta"]),
  hero: ReviewsHeroSchema,
  stats: ReviewsStatsSchema,
  categories: z.array(ReviewsCategorySchema).default([]),
  roles: z.array(ReviewsRoleSchema).default([]),
  submissionSettings: ReviewsSubmissionSettingsSchema,
  ctaBanner: ReviewsCtaBannerSchema,
  seo: ReviewsSeoSchema,
});

export type IReviewsPageFormValidation = z.infer<typeof ReviewsPageFormValidation>;
