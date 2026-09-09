import { z } from "zod";

export const FaqsHeroValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().min(1, "Badge text is required").max(100),
  badgeIcon: z.string().optional().default("HelpCircle"),
  title: z.string().min(1, "Title is required").max(150),
  highlightedTitle: z.string().max(100).optional().default(""),
  description: z.string().min(1, "Description is required").max(600),
  leftSpecChip: z.object({
    badgeText: z.string().min(1).max(50),
    description: z.string().min(1).max(100),
    icon: z.string().default("CheckCircle2"),
  }),
  rightSpecChip: z.object({
    badgeText: z.string().min(1).max(50),
    description: z.string().min(1).max(100),
    icon: z.string().default("PhoneCall"),
  }),
  primaryCta: z.object({
    isVisible: z.boolean().default(true),
    text: z.string().min(1).max(50),
    href: z.string().min(1),
  }),
  secondaryCta: z.object({
    isVisible: z.boolean().default(true),
    text: z.string().min(1).max(50),
    href: z.string().min(1),
  }),
  variant: z.enum(["crimson", "amber", "emerald", "default"]).default("amber"),
});

export const FaqCategoryItemValidation = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Category label is required").max(80),
  icon: z.string().default("HelpCircle"),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const FaqQuestionItemValidation = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1, "Category is required"),
  categoryLabel: z.string().min(1, "Category label is required"),
  question: z.string().min(1, "Question is required").max(250),
  answer: z.string().min(1, "Answer is required").max(1500),
  tags: z.array(z.string()).default([]),
  isHighlighted: z.boolean().optional().default(false),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const FaqStatItemValidation = z.object({
  id: z.string().min(1),
  value: z.string().min(1).max(50),
  label: z.string().min(1).max(80),
  description: z.string().min(1).max(150),
  icon: z.string().default("Award"),
});

export const FaqsStatsValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Key Highlights"),
  heading: z.string().min(1).max(150).default("Institutional Proof Points & Standards"),
  items: z.array(FaqStatItemValidation).default([]),
});

export const FaqsHelpdeskValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Personalized Assistance"),
  heading: z.string().min(1).max(150).default("Still Have Questions?"),
  description: z.string().max(500).default(""),
  phone: z.string().min(1).max(60),
  phoneHours: z.string().max(100).default("Mon – Sat, 8:00 AM – 3:00 PM"),
  email: z.string().email("Valid email is required"),
  emailResponseTime: z.string().max(100).default("Response within 24 business hours"),
  campusAddress: z.string().max(200).default("Soldier Bazar, Garden East, Karachi, Pakistan"),
  whatsappNumber: z.string().max(60).default("+92 335 7413777"),
});

export const FaqsSEOValidation = z.object({
  metaTitle: z.string().min(1).max(120),
  metaDescription: z.string().min(1).max(300),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional().default(""),
});

export const FaqsPageFormValidation = z.object({
  sectionsOrder: z.array(z.string()).default(["hero", "stats", "questions", "helpdesk"]),
  hero: FaqsHeroValidation,
  categories: z.array(FaqCategoryItemValidation).default([]),
  questions: z.array(FaqQuestionItemValidation).default([]),
  stats: FaqsStatsValidation,
  helpdesk: FaqsHelpdeskValidation,
  seo: FaqsSEOValidation,
  saveAsDraft: z.boolean().optional().default(false),
});
