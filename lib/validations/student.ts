import { z } from "zod";

export const studentCreateSchema = z.object({
  name: z.string().min(2, "Student name is required.").max(120),
  email: z.string().email("Valid email is required.").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  classId: z.string().min(1, "Class selection is required."),
  admissionNumber: z.string().min(1, "Admission number is required."),
  rollNumber: z.string().min(1, "Roll number is required."),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  gender: z.enum(["Male", "Female", "Other"]),
  bloodGroup: z.string().optional(),
  address: z.string().min(5, "Address is required."),
  previousSchool: z.string().optional(),
  guardian: z.object({
    fatherName: z.string().min(2, "Father's name is required."),
    motherName: z.string().optional(),
    phone: z.string().min(10, "Guardian phone is required."),
    email: z.string().email().optional().or(z.literal("")),
    cnic: z.string().optional(),
    occupation: z.string().optional(),
    emergencyContact: z.string().min(10, "Emergency contact is required."),
  }),
});

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;

export const studentUpdateSchema = studentCreateSchema.partial().extend({
  id: z.string().min(1, "Student ID is required."),
  status: z.enum(["active", "inactive", "graduated", "expelled", "suspended"]).optional(),
});

export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
