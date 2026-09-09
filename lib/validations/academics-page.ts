import { z } from "zod";

export const HeroSchemaValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().min(1, "Badge text is required").max(100),
  badgeIcon: z.string().default("BookOpen"),
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
    .default([{ label: "Academics" }]),
  variant: z.enum(["amber", "crimson", "emerald", "default"]).default("amber"),
  admissionsOpenState: z.object({
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
  }),
  admissionsClosedState: z.object({
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
  }),
});

export const AcademicDivisionItemValidation = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Division name is required").max(100),
  badge: z.string().min(1, "Badge is required").max(100),
  gradeRange: z.string().min(1, "Grade range is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  image: z.string().min(1, "Image URL is required"),
  imageAlt: z.string().max(150).optional().default(""),
  subjects: z.array(z.string().min(1)).default([]),
  highlights: z.array(z.string().min(1)).default([]),
  highlightStatement: z.string().max(200).optional().default(""),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const AcademicDivisionsSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Educational Wings"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  items: z
    .array(AcademicDivisionItemValidation)
    .min(1, "At least one Academic Division is required"),
});

export const StemFeatureItemValidation = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required").max(100),
  desc: z.string().min(1, "Description is required").max(600),
  icon: z.string().default("Binary"),
  iconColor: z.string().optional().default(""),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const StemInnovationSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Innovation Studio"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(600).default(""),
  items: z.array(StemFeatureItemValidation).min(1, "At least one STEM feature is required"),
});

export const AssessmentTierItemValidation = z.object({
  id: z.string().min(1),
  tag: z.string().min(1, "Tag is required").max(100),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(600),
  theme: z.enum(["crimson", "amber", "emerald", "default"]).default("crimson"),
  badgeColorClass: z.string().default("text-seneca-crimson dark:text-seneca-amber-light"),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const AssessmentStandardsSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Assessment Standards"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(600).default(""),
  items: z
    .array(AssessmentTierItemValidation)
    .min(1, "At least one Assessment Tier is required"),
});

export const TrustCardItemValidation = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(200),
  icon: z.string().default("CheckCircle2"),
  theme: z.string().optional().default("amber"),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const AcademicsCtaBannerValidation = z.object({
  isVisible: z.boolean().default(true),
  eyebrowActiveTemplate: z.string().max(150).default("{admissionsSession} Admissions Active"),
  eyebrowInactiveTemplate: z.string().max(150).default("Academic Excellence Track"),
  mainHeading: z.string().min(1, "Heading is required").max(150),
  highlightedHeading: z.string().max(150).default(""),
  descriptionOpenTemplate: z.string().max(600).default(""),
  descriptionClosedTemplate: z.string().max(600).default(""),
  admissionsOpenCtas: z.object({
    primary: z.object({
      isVisible: z.boolean().default(true),
      text: z.string().min(1).max(50),
      href: z.string().min(1),
    }),
    secondary: z.object({
      isVisible: z.boolean().default(true),
      text: z.string().min(1).max(50),
      href: z.string().min(1),
    }),
  }),
  admissionsClosedCtas: z.object({
    primary: z.object({
      isVisible: z.boolean().default(true),
      text: z.string().min(1).max(50),
      href: z.string().min(1),
    }),
    secondary: z.object({
      isVisible: z.boolean().default(true),
      text: z.string().min(1).max(50),
      href: z.string().min(1),
    }),
  }),
  trustCards: z.array(TrustCardItemValidation).default([]),
  helpline: z.object({
    isVisible: z.boolean().default(true),
    prefixText: z.string().max(150).default("Need guidance with admission criteria?"),
    linkTextTemplate: z.string().max(150).default("Call Admissions: {phone}"),
  }),
  backgroundTheme: z
    .enum(["crimsonLuxury", "amberLuxury", "dark", "default"])
    .default("crimsonLuxury"),
});

export const AcademicsSEOValidation = z.object({
  title: z.string().min(1, "SEO Title is required").max(150),
  description: z.string().min(1, "SEO Description is required").max(300),
  keywords: z.string().max(300).optional().default(""),
  ogTitle: z.string().max(150).optional().default(""),
  ogDescription: z.string().max(300).optional().default(""),
  ogImage: z.string().optional(),
});

export const SenecaDifferencePillarValidation = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required").max(100),
  subtitle: z.string().max(100).optional().default(""),
  badge: z.string().max(100).optional().default(""),
  description: z.string().min(1, "Description is required").max(600),
  icon: z.string().default("Sparkles"),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const SenecaDifferenceSectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("The Seneca Difference"),
  heading: z.string().min(1, "Heading is required").max(150).default("Why Families Choose Seneca Academy"),
  description: z.string().max(600).optional().default(""),
  items: z.array(SenecaDifferencePillarValidation).default([]),
});

export const AcademicsPageFormValidation = z.object({
  pageTitle: z
    .string()
    .min(1)
    .max(150)
    .default("Academics & Curriculum — Seneca Academy Karachi"),
  pageDescription: z.string().max(500).optional().default(""),
  slug: z.string().default("academics"),
  isPublished: z.boolean().default(true),
  sectionsOrder: z
    .array(z.string())
    .default([
      "hero",
      "academicDivisions",
      "stemInnovation",
      "assessmentStandards",
      "ctaBanner",
    ]),
  hero: HeroSchemaValidation,
  academicDivisions: AcademicDivisionsSectionValidation,
  stemInnovation: StemInnovationSectionValidation,
  assessmentStandards: AssessmentStandardsSectionValidation,
  ctaBanner: AcademicsCtaBannerValidation,
  senecaDifference: SenecaDifferenceSectionValidation.optional(),
  seo: AcademicsSEOValidation,
  saveAsDraft: z.boolean().optional().default(false),
});
