import { z } from "zod";

export const HeroSchemaValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().min(1, "Badge text is required").max(100),
  badgeIcon: z.string().default("Compass"),
  showBadge: z.boolean().default(true),
  title: z.string().min(1, "Title is required").max(150),
  highlightedTitle: z.string().max(100).optional().default(""),
  description: z.string().min(1, "Description is required").max(600),
  breadcrumbs: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().optional(),
      })
    )
    .optional()
    .default([{ label: "About Us" }]),
  primaryCta: z.object({
    isVisible: z.boolean().default(true),
    text: z.string().min(1).max(50),
    href: z.string().min(1),
    dynamicBehavior: z.string().optional(),
  }),
  secondaryCta: z.object({
    isVisible: z.boolean().default(true),
    text: z.string().min(1).max(50),
    href: z.string().min(1),
  }),
  variant: z.enum(["crimson", "amber", "emerald", "default"]).default("crimson"),
});

export const VisionMissionItemValidation = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  icon: z.string().default("Compass"),
  iconBgClass: z.string().default("bg-seneca-crimson/10 text-seneca-crimson"),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const VisionMissionSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Strategic Foundations"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  items: z.array(VisionMissionItemValidation).min(1, "At least one Vision/Mission item is required"),
});

export const CoreValueItemValidation = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required").max(100),
  desc: z.string().min(1, "Description is required").max(600),
  icon: z.string().default("Cpu"),
  iconColor: z.string().default("text-seneca-crimson dark:text-seneca-amber-light"),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const CoreValuesSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Ethos & Culture"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  items: z.array(CoreValueItemValidation).min(1, "At least one Core Value is required"),
});

export const MilestoneItemValidation = z.object({
  id: z.string().min(1),
  year: z.string().min(1, "Year is required").max(20),
  category: z.string().min(1, "Category is required").max(100),
  title: z.string().min(1, "Title is required").max(150),
  desc: z.string().min(1, "Description is required").max(1000),
  icon: z.string().default("Landmark"),
  highlights: z.array(z.string()).default([]),
  gradient: z.string().default("from-seneca-crimson to-seneca-crimson-dark"),
  badgeVariant: z.string().default("border-seneca-crimson/30 text-seneca-crimson bg-seneca-crimson/10"),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const MilestonesSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Our Heritage & Evolution"),
  badgeIcon: z.string().default("Compass"),
  heading: z.string().min(1, "Heading is required").max(150),
  highlightedHeading: z.string().max(100).optional().default(""),
  description: z.string().max(600).optional().default(""),
  ribbonTitle: z.string().max(150).default("Looking Toward the Future"),
  ribbonDescription: z.string().max(500).default(""),
  items: z.array(MilestoneItemValidation).min(1, "At least one Milestone is required"),
});

export const PrincipalDeskValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("From the Principal's Desk"),
  heading: z.string().min(1, "Heading is required").max(150),
  name: z.string().min(1, "Principal name is required").max(100),
  designation: z.string().min(1, "Designation is required").max(150),
  photoUrl: z.string().min(1, "Photo URL is required"),
  photoPublicId: z.string().optional(),
  photoAlt: z.string().max(150).default("Principal Photo"),
  qualification: z.string().max(200).default(""),
  office: z.string().max(100).default("Principal Office"),
  messageParagraphs: z.array(z.string().min(1)).min(1, "At least one paragraph is required"),
});

export const CampusCtaValidation = z.object({
  isVisible: z.boolean().default(true),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(600).default(""),
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
  variant: z.string().default("default"),
});

export const SEOValidation = z.object({
  title: z.string().min(1, "SEO Title is required").max(150),
  description: z.string().min(1, "SEO Description is required").max(300),
  keywords: z.string().max(300).optional().default(""),
  ogTitle: z.string().max(150).optional().default(""),
  ogDescription: z.string().max(300).optional().default(""),
  ogImage: z.string().optional(),
});

export const AboutPageFormValidation = z.object({
  pageTitle: z.string().min(1).max(150).default("About Us — Seneca Academy"),
  pageDescription: z.string().max(500).optional().default(""),
  slug: z.string().default("about"),
  isPublished: z.boolean().default(true),
  sectionsOrder: z.array(z.string()).default(["hero", "principal", "visionMission", "coreValues", "milestones", "campusCta"]),
  hero: HeroSchemaValidation,
  principal: PrincipalDeskValidation,
  visionMission: VisionMissionSectionValidation,
  coreValues: CoreValuesSectionValidation,
  milestones: MilestonesSectionValidation,
  campusCta: CampusCtaValidation,
  seo: SEOValidation,
  saveAsDraft: z.boolean().optional().default(false),
});
