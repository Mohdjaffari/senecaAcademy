import { z } from "zod";

export const teacherCreateSchema = z.object({
  name: z.string().min(2, "Teacher name is required.").max(120),
  email: z.string().email("Valid email is required.").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  employeeId: z.string().min(2, "Employee ID is required."),
  specialization: z.string().min(2, "Subject specialization is required."),
  qualification: z.string().min(2, "Highest qualification is required."),
  experienceYears: z.coerce.number().min(0, "Experience must be 0 or more."),
  assignedClassIds: z.array(z.string()).default([]),
  assignedSubjectIds: z.array(z.string()).default([]),
  salary: z.coerce.number().optional(),
});

export type TeacherCreateInput = z.infer<typeof teacherCreateSchema>;
