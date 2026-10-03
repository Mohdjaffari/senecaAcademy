import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address.").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  expectedRole: z.enum(["super_admin", "principal", "teacher", "student", "user"]).optional(),
  campusWing: z.enum(["all", "junior", "senior"]).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupUserSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters.")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(10, "Please provide a valid phone number (at least 10 digits).")
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password cannot exceed 128 characters."),
  role: z.enum(["super_admin", "principal", "teacher", "student", "user"]).optional().default("user"),
});

export type SignupUserInput = z.infer<typeof signupUserSchema>;

export const registerStudentPublicSchema = z.object({
  name: z.string().min(2, "Student full name is required.").max(120),
  fatherName: z.string().min(2, "Father's name is required.").max(120),
  motherName: z.string().max(120).optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  gender: z.enum(["Male", "Female", "Other"]),
  bloodGroup: z.string().optional(),
  admissionType: z.enum(["Regular", "Transfer", "Sibling", "Scholarship", "Provisional"]).optional().default("Regular"),
  bFormNumber: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  motherTongue: z.string().optional(),
  medicalInfo: z
    .object({
      allergies: z.string().optional(),
      conditions: z.string().optional(),
      emergencyNotes: z.string().optional(),
    })
    .optional(),
  applyingForClass: z.string().min(1, "Class selection is required."),
  preferredSection: z.string().optional().default("A"),
  stream: z.string().optional().default("General"),
  previousSchool: z.string().optional(),
  previousMarksOrGrade: z.string().optional(),
  slcNumber: z.string().optional(),
  previousSchoolDetails: z
    .object({
      schoolName: z.string().optional(),
      lastGrade: z.string().optional(),
      slcNumber: z.string().optional(),
      slcDate: z.string().optional(),
      board: z.string().optional(),
      marksPercentage: z.string().optional(),
    })
    .optional(),
  fatherCnic: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherCompany: z.string().optional(),
  motherCnic: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherPhone: z.string().optional(),
  guardianType: z.string().optional(),
  parentPhone: z.string().min(10, "Valid phone number is required."),
  parentEmail: z.string().email("Valid email is required.").toLowerCase().trim(),
  emergencyContact: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  siblingInSchool: z.boolean().optional(),
  siblingRollNumber: z.string().optional(),
  siblingName: z.string().optional(),
  cnic: z.string().optional(),
  address: z.string().min(5, "Residential address is required."),
  transportRequired: z.boolean().optional().default(false),
  transportRoute: z.string().optional(),
  pickupPoint: z.string().optional(),
  documentsChecklist: z
    .object({
      bForm: z.boolean().optional(),
      fatherCnic: z.boolean().optional(),
      motherCnic: z.boolean().optional(),
      photos: z.boolean().optional(),
      slc: z.boolean().optional(),
      marksheet: z.boolean().optional(),
      characterCert: z.boolean().optional(),
      medicalReport: z.boolean().optional(),
    })
    .optional(),
  documentFiles: z.record(z.any()).optional(),
  feeCategory: z.string().optional().default("Standard"),
  password: z.string().min(8, "Password must be at least 8 characters.").optional().default("Student2026!"),
});

export type RegisterStudentPublicInput = z.infer<typeof registerStudentPublicSchema>;

export const createUserAdminSchema = z.object({
  name: z.string().min(2, "Name is required.").max(120),
  email: z.string().email("Valid email is required.").toLowerCase().trim(),
  password: z.string().min(8, "Temporary password must be at least 8 characters."),
  role: z.enum(["super_admin", "principal", "teacher", "student", "user"]),
  phone: z.string().optional(),
  assignedClassId: z.string().optional(),
  assignedSubjectIds: z.array(z.string()).optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
});

export type CreateUserAdminInput = z.infer<typeof createUserAdminSchema>;
