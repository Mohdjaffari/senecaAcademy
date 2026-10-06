import mongoose from "mongoose";
import AcademicStream, { IAcademicStream } from "@/models/AcademicStream";

export interface DefaultStreamItem {
  name: string;
  code: string;
  tier: "Preschool" | "Primary" | "Middle" | "Secondary" | "Higher Secondary" | "All";
  description: string;
  order: number;
  isDefault?: boolean;
}

export const INITIAL_DEFAULT_STREAMS: DefaultStreamItem[] = [
  // Preschool
  {
    name: "General Curriculum",
    code: "PRE-GEN",
    tier: "Preschool",
    description: "Play-based sensory learning & early childhood foundation",
    order: 1,
    isDefault: true,
  },
  {
    name: "Montessori Early Years",
    code: "PRE-MONT",
    tier: "Preschool",
    description: "Montessori sensory, language, and practical life discovery",
    order: 2,
  },
  {
    name: "Early Childhood Education (ECE)",
    code: "PRE-ECE",
    tier: "Preschool",
    description: "Holistic social-emotional, cognitive, and fine motor skills",
    order: 3,
  },

  // Primary Wing
  {
    name: "General Curriculum (National Standards)",
    code: "PRI-NAT",
    tier: "Primary",
    description: "National single curriculum core subjects (English, Urdu, Math, Science)",
    order: 10,
    isDefault: true,
  },
  {
    name: "Cambridge Primary",
    code: "PRI-CAM",
    tier: "Primary",
    description: "Cambridge International Primary framework (English, Math, Science)",
    order: 11,
  },

  // Middle Wing
  {
    name: "General Curriculum (Middle Standards)",
    code: "MID-NAT",
    tier: "Middle",
    description: "Middle school comprehensive standards (Grades 6–8)",
    order: 20,
    isDefault: true,
  },
  {
    name: "Cambridge Lower Secondary",
    code: "MID-CAM",
    tier: "Middle",
    description: "Cambridge Lower Secondary Checkpoint curriculum framework",
    order: 21,
  },

  // Secondary / Matric
  {
    name: "Matric Science (Biology, Chemistry, Physics)",
    code: "MAT-BIO",
    tier: "Secondary",
    description: "Matriculation Science group with Biology, Chemistry, Physics",
    order: 30,
    isDefault: true,
  },
  {
    name: "Matric Computer Science (Physics, Tech, Math)",
    code: "MAT-CS",
    tier: "Secondary",
    description: "Matriculation Computer Science group with Programming, Physics, Math",
    order: 31,
  },
  {
    name: "Matric Arts & Humanities",
    code: "MAT-ARTS",
    tier: "Secondary",
    description: "General arts group with Civics, General Science, and Humanities",
    order: 32,
  },
  {
    name: "Cambridge O-Levels (Science)",
    code: "O-SCI",
    tier: "Secondary",
    description: "Cambridge GCE O-Level Pure Sciences (Physics, Chemistry, Biology, Math)",
    order: 33,
  },
  {
    name: "Cambridge O-Levels (Commerce & Arts)",
    code: "O-COM",
    tier: "Secondary",
    description: "Cambridge GCE O-Level Commerce (Accounting, Economics, Business)",
    order: 34,
  },

  // Higher Secondary / College (Intermediate & A-Levels)
  {
    name: "FSc Pre-Medical (Biology, Chemistry, Physics)",
    code: "FSC-MED",
    tier: "Higher Secondary",
    description: "Pre-Medical curriculum track for future medical and healthcare sciences",
    order: 40,
    isDefault: true,
  },
  {
    name: "FSc Pre-Engineering (Mathematics, Physics, Chemistry)",
    code: "FSC-ENG",
    tier: "Higher Secondary",
    description: "Pre-Engineering curriculum track for engineering and applied physical sciences",
    order: 41,
  },
  {
    name: "ICS (Computer Science, Mathematics, Physics)",
    code: "ICS-GEN",
    tier: "Higher Secondary",
    description: "Intermediate in Computer Science with software development and mathematics",
    order: 42,
  },
  {
    name: "I.Com (Commerce, Accounting, Economics)",
    code: "ICOM",
    tier: "Higher Secondary",
    description: "Intermediate in Commerce with Accounting, Banking, and Economics",
    order: 43,
  },
  {
    name: "FA (Fine Arts, Civics, Humanities)",
    code: "FA-GEN",
    tier: "Higher Secondary",
    description: "Faculty of Arts with Humanities, Fine Arts, Civics, and Literature",
    order: 44,
  },
  {
    name: "Cambridge A-Levels (Pre-Medical & Pre-Eng)",
    code: "A-SCI",
    tier: "Higher Secondary",
    description: "Cambridge International Advanced Level STEM (Physics, Chemistry, Bio/Math)",
    order: 45,
  },
  {
    name: "Cambridge A-Levels (Commerce & Business)",
    code: "A-COM",
    tier: "Higher Secondary",
    description: "Cambridge International Advanced Level Business & Accounting",
    order: 46,
  },
];

export async function ensureDefaultAcademicStreams(schoolId: mongoose.Types.ObjectId) {
  const existingCount = await AcademicStream.countDocuments({ schoolId });
  if (existingCount === 0) {
    const docs = INITIAL_DEFAULT_STREAMS.map((s) => ({
      ...s,
      schoolId,
      status: "active",
      isDefault: !!s.isDefault,
    }));
    await AcademicStream.insertMany(docs);
  }
}
