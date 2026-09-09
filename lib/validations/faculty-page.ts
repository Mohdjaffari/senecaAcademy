import { z } from "zod";

export const FacultyHeroValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().min(1, "Badge text is required").max(100),
  badgeIcon: z.string().optional().default("Users"),
  title: z.string().min(1, "Title is required").max(150),
  highlightedTitle: z.string().max(100).optional().default(""),
  description: z.string().min(1, "Description is required").max(600),
  leftSpecChip: z.object({
    badgeText: z.string().min(1).max(50),
    description: z.string().min(1).max(100),
    icon: z.string().default("GraduationCap"),
  }),
  rightSpecChip: z.object({
    badgeText: z.string().min(1).max(50),
    description: z.string().min(1).max(100),
    icon: z.string().default("Award"),
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
  variant: z.enum(["crimson", "amber", "emerald", "default"]).default("crimson"),
});

export const FacultyMemberValidation = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role is required").max(120),
  department: z.string().min(1, "Department is required").max(80),
  qual: z.string().min(1, "Qualification is required").max(120),
  exp: z.string().min(1, "Experience is required").max(80),
  imgUrl: z.string().min(1, "Image URL is required"),
  bio: z.string().max(500).optional().default(""),
  badge: z.string().max(50).optional().default(""),
  badgeColor: z.enum(["crimson", "amber", "emerald", "sky", "indigo"]).optional().default("crimson"),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const FacultySectionValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("World-Class Educators"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(600).default(""),
  members: z.array(FacultyMemberValidation).default([]),
});

export const FacultyCareersValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Careers at Seneca"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(600).default(""),
  benefits: z.array(z.string()).default([]),
  applyButtonText: z.string().max(60).default("Apply as Teacher"),
  isHiringActive: z.boolean().default(true),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

export const TeachingStandardValidation = z.object({
  id: z.string().min(1),
  icon: z.string().default("GraduationCap"),
  title: z.string().min(1, "Title is required").max(100),
  desc: z.string().min(1, "Description is required").max(500),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const FacultyStandardsValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Faculty Standards"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  items: z.array(TeachingStandardValidation).default([]),
});

export const CampusFacilityValidation = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Facility title is required").max(120),
  desc: z.string().min(1, "Description is required").max(500),
  category: z.string().min(1, "Category is required").max(60),
  status: z.string().default("Active"),
  imgUrl: z.string().optional().default(""),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const CampusFacilitiesValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Campus Infrastructure"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  facilities: z.array(CampusFacilityValidation).default([]),
});

export const FacultyExperienceCtaValidation = z.object({
  isVisible: z.boolean().default(true),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().min(1, "Description is required").max(500),
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
});

export const FacultySEOValidation = z.object({
  metaTitle: z.string().min(1).max(120),
  metaDescription: z.string().min(1).max(300),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional().default(""),
});

export const FacultyPageFormValidation = z.object({
  sectionsOrder: z.array(z.string()).default(["hero", "faculty", "careers", "standards", "facilities", "experienceCta"]),
  hero: FacultyHeroValidation,
  facultySection: FacultySectionValidation,
  careers: FacultyCareersValidation,
  standards: FacultyStandardsValidation,
  facilities: CampusFacilitiesValidation,
  experienceCta: FacultyExperienceCtaValidation,
  seo: FacultySEOValidation,
  saveAsDraft: z.boolean().optional().default(false),
});
