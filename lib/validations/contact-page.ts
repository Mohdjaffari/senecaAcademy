import { z } from "zod";

export const ContactHeroValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().min(1, "Badge text is required").max(100),
  badgeIcon: z.string().optional().default("MapPin"),
  title: z.string().min(1, "Title is required").max(150),
  highlightedTitle: z.string().max(100).optional().default(""),
  description: z.string().min(1, "Description is required").max(600),
  leftSpecChip: z.object({
    badgeText: z.string().min(1).max(50),
    description: z.string().min(1).max(100),
    icon: z.string().default("Clock"),
  }),
  rightSpecChip: z.object({
    badgeText: z.string().min(1).max(50),
    description: z.string().min(1).max(100),
    icon: z.string().default("Building2"),
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

export const CampusCoordinatesValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Connect With Us"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(600).default(""),
  address: z.string().min(1, "Campus address is required").max(300),
  cityArea: z.string().min(1, "City area is required").max(150),
  postalCode: z.string().max(30).optional().default(""),
  mainPhone: z.string().min(1, "Main helpline phone is required").max(60),
  admissionsHotline: z.string().min(1, "Admissions hotline is required").max(60),
  whatsappNumber: z.string().min(1, "WhatsApp number is required").max(60),
  whatsappMessage: z.string().max(300).optional().default(""),
  infoEmail: z.string().email("Valid info email is required"),
  admissionsEmail: z.string().email("Valid admissions email is required"),
  careersEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  googleMapEmbedUrl: z.string().min(1, "Google Maps embed URL is required"),
  googleMapDirectionsUrl: z.string().optional().default(""),
});

export const DepartmentContactItemValidation = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Department name is required").max(100),
  leadTitle: z.string().min(1, "Lead title is required").max(100),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required").max(60),
  extension: z.string().max(40).optional().default(""),
  officeHours: z.string().max(100).optional().default(""),
  icon: z.string().default("GraduationCap"),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const DepartmentContactsValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Department Directory"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  departments: z.array(DepartmentContactItemValidation).default([]),
});

export const OfficeHoursValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Hours & Access"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  weekdayHours: z.string().min(1, "Weekday hours are required").max(150),
  saturdayHours: z.string().min(1, "Saturday hours are required").max(150),
  sundayHours: z.string().min(1, "Sunday hours are required").max(150),
  visitorNotice: z.string().max(400).optional().default(""),
});

export const InquiryFormSettingsValidation = z.object({
  isVisible: z.boolean().default(true),
  heading: z.string().min(1, "Form heading is required").max(150),
  description: z.string().max(500).default(""),
  subjectsList: z.array(z.string().min(1)).min(1, "At least one subject option is required"),
  submitButtonText: z.string().max(60).default("Transmit Inquiry"),
  responseTimeText: z.string().max(150).default("Our administration will respond within 24 hours."),
  successHeading: z.string().max(100).default("Inquiry Dispatched Successfully!"),
  successMessage: z.string().max(400).default("Thank you for contacting Seneca Academy."),
});

export const ContactFaqItemValidation = z.object({
  id: z.string().min(1),
  question: z.string().min(1, "Question is required").max(200),
  answer: z.string().min(1, "Answer is required").max(1000),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const ContactFaqValidation = z.object({
  isVisible: z.boolean().default(true),
  badge: z.string().max(100).default("Visit & Inquiry FAQs"),
  heading: z.string().min(1, "Heading is required").max(150),
  description: z.string().max(500).optional().default(""),
  items: z.array(ContactFaqItemValidation).default([]),
});

export const ContactCtaValidation = z.object({
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

export const ContactSEOValidation = z.object({
  metaTitle: z.string().min(1).max(120),
  metaDescription: z.string().min(1).max(300),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional().default(""),
});

export const ContactPageFormValidation = z.object({
  sectionsOrder: z.array(z.string()).default(["hero", "coordinates", "departments", "officeHours", "faq", "cta"]),
  hero: ContactHeroValidation,
  coordinates: CampusCoordinatesValidation,
  inquiryForm: InquiryFormSettingsValidation,
  departments: DepartmentContactsValidation,
  officeHours: OfficeHoursValidation,
  faq: ContactFaqValidation,
  cta: ContactCtaValidation,
  seo: ContactSEOValidation,
  saveAsDraft: z.boolean().optional().default(false),
});
