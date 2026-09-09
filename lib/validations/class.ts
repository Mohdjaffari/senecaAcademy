import { z } from "zod";

export const classCreateSchema = z.object({
  name: z.string().min(1, "Class name is required. e.g. Grade 5"),
  gradeLevel: z.coerce.number().min(0, "Grade level is required."),
  section: z.string().min(1, "Section is required.").default("A"),
  capacity: z.coerce.number().default(35),
  classTeacherId: z.string().optional(),
  roomNumber: z.string().optional(),
});

export type ClassCreateInput = z.infer<typeof classCreateSchema>;

export const subjectCreateSchema = z.object({
  name: z.string().min(2, "Subject name is required."),
  code: z.string().min(2, "Subject code is required."),
  department: z.string().default("General"),
  creditHours: z.coerce.number().default(3),
  description: z.string().optional(),
  classIds: z.array(z.string()).default([]),
});

export type SubjectCreateInput = z.infer<typeof subjectCreateSchema>;
