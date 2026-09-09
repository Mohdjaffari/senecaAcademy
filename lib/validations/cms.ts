import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(2, "Title is required."),
  content: z.string().min(5, "Content is required."),
  icon: z.string().default("📢"),
  colorTheme: z.enum(["blue", "orange", "green", "red"]).default("blue"),
  priority: z.enum(["normal", "urgent"]).default("normal"),
  targetRole: z.enum(["all", "teachers", "students", "public"]).default("all"),
  isPublished: z.boolean().default(true),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;

export const blogSchema = z.object({
  title: z.string().min(3, "Blog title is required."),
  excerpt: z.string().min(10, "Excerpt is required."),
  content: z.string().min(20, "Content is required."),
  category: z.string().default("Academics"),
  coverImageUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("published"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type BlogInput = z.infer<typeof blogSchema>;

export const gallerySchema = z.object({
  caption: z.string().min(2, "Caption is required."),
  subcaption: z.string().optional(),
  imageUrl: z.string().min(5, "Image URL is required."),
  category: z.enum(["campus", "events", "sports", "academics", "lab"]).default("campus"),
  size: z.enum(["default", "large", "wide"]).default("default"),
  isPublished: z.boolean().default(true),
});

export type GalleryInput = z.infer<typeof gallerySchema>;
