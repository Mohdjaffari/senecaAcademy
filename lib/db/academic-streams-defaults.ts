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
  // Preschool / Early Years (EYFS)
  {
    name: "Cambridge Early Years",
    code: "EYFS-CAM",
    tier: "Preschool",
    description: "Cambridge Early Years Foundation Stage (EYFS) holistic play-based inquiry",
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
  {
    name: "General Curriculum",
    code: "PRE-GEN",
    tier: "Preschool",
    description: "Play-based sensory learning & early childhood foundation",
    order: 4,
  },

  // Primary Wing (Cambridge Primary Stages 1–5)
  {
    name: "Cambridge Primary",
    code: "PRI-CAM",
    tier: "Primary",
    description: "Cambridge International Primary framework (English, Math, Science, Computing, Global Perspectives)",
    order: 10,
    isDefault: true,
  },
  {
    name: "General Curriculum",
    code: "PRI-NAT",
    tier: "Primary",
    description: "National standards single curriculum core subjects (English, Urdu, Math, Science)",
    order: 11,
  },

  // Middle Wing (Cambridge Lower Secondary Stages 6–8)
  {
    name: "Cambridge Lower Secondary",
    code: "MID-CAM",
    tier: "Middle",
    description: "Cambridge Lower Secondary Checkpoint curriculum framework in English, Math & Sciences",
    order: 20,
    isDefault: true,
  },
  {
    name: "General Curriculum",
    code: "MID-NAT",
    tier: "Middle",
    description: "Middle school comprehensive national standards (Grades 6–8)",
    order: 21,
  },

  // Secondary Wing (Cambridge Upper Secondary / O-Levels & Matric)
  {
    name: "Cambridge O-Levels",
    code: "O-LEVEL",
    tier: "Secondary",
    description: "Cambridge CAIE GCE O-Level International curriculum framework",
    order: 30,
    isDefault: true,
  },
  {
    name: "Cambridge IGCSE",
    code: "IGCSE",
    tier: "Secondary",
    description: "Cambridge International General Certificate of Secondary Education",
    order: 31,
  },
  {
    name: "Matric Science",
    code: "MAT-BIO",
    tier: "Secondary",
    description: "Matriculation Science group with Biology, Chemistry, Physics",
    order: 32,
  },
  {
    name: "Matric Computer Science",
    code: "MAT-CS",
    tier: "Secondary",
    description: "Matriculation Computer Science group with Programming, Physics, Math",
    order: 33,
  },
  {
    name: "Matric Arts & Humanities",
    code: "MAT-ARTS",
    tier: "Secondary",
    description: "General arts group with Civics, General Science, and Humanities",
    order: 34,
  },

  // Higher Secondary / College Wing (Cambridge A-Levels & Intermediate)
  {
    name: "Cambridge A-Levels",
    code: "A-LEVEL",
    tier: "Higher Secondary",
    description: "Cambridge International Advanced Level (AS & A2) curriculum framework",
    order: 40,
    isDefault: true,
  },
  {
    name: "FSc Pre-Medical",
    code: "FSC-MED",
    tier: "Higher Secondary",
    description: "Pre-Medical curriculum track with Biology, Chemistry, Physics",
    order: 41,
  },
  {
    name: "FSc Pre-Engineering",
    code: "FSC-ENG",
    tier: "Higher Secondary",
    description: "Pre-Engineering curriculum track with Mathematics, Physics, Chemistry",
    order: 42,
  },
  {
    name: "ICS (Computer Science)",
    code: "ICS-GEN",
    tier: "Higher Secondary",
    description: "Intermediate in Computer Science with software development, Physics, and Mathematics",
    order: 43,
  },
  {
    name: "I.Com (Commerce)",
    code: "ICOM",
    tier: "Higher Secondary",
    description: "Intermediate in Commerce with Accounting, Banking, and Economics",
    order: 44,
  },
  {
    name: "FA (Humanities & Arts)",
    code: "FA-GEN",
    tier: "Higher Secondary",
    description: "Faculty of Arts with Humanities, Fine Arts, Civics, and Literature",
    order: 45,
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
  } else {
    // Clean up any legacy long bracketed names in database to professional concise Cambridge titles
    await AcademicStream.updateMany(
      { schoolId, name: { $in: ["Cambridge O-Levels (Sciences)", "Cambridge O-Levels (Science)", "Cambridge O-Levels (Commerce & Arts)"] } },
      { $set: { name: "Cambridge O-Levels" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: { $in: ["Cambridge A-Levels (Pre-Medical & Pre-Eng)", "Cambridge A-Levels (Commerce & Business)"] } },
      { $set: { name: "Cambridge A-Levels" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: "FSc Pre-Medical (Biology, Chemistry, Physics)" },
      { $set: { name: "FSc Pre-Medical" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: "FSc Pre-Engineering (Mathematics, Physics, Chemistry)" },
      { $set: { name: "FSc Pre-Engineering" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: "ICS (Computer Science, Mathematics, Physics)" },
      { $set: { name: "ICS (Computer Science)" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: "I.Com (Commerce, Accounting, Economics)" },
      { $set: { name: "I.Com (Commerce)" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: "FA (Fine Arts, Civics, Humanities)" },
      { $set: { name: "FA (Humanities & Arts)" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: "Matric Science (Biology, Chemistry, Physics)" },
      { $set: { name: "Matric Science" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: "Matric Computer Science (Physics, Tech, Math)" },
      { $set: { name: "Matric Computer Science" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: { $in: ["General Curriculum (National Standards)", "General Primary Curriculum"] } },
      { $set: { name: "General Curriculum" } }
    );
    await AcademicStream.updateMany(
      { schoolId, name: { $in: ["General Curriculum (Middle Standards)", "General Middle Curriculum"] } },
      { $set: { name: "General Curriculum" } }
    );

    // Ensure Cambridge tracks are marked default if unset
    await AcademicStream.updateOne({ schoolId, name: "Cambridge Primary" }, { $set: { isDefault: true } });
    await AcademicStream.updateOne({ schoolId, name: "Cambridge Lower Secondary" }, { $set: { isDefault: true } });
    await AcademicStream.updateOne({ schoolId, name: "Cambridge O-Levels" }, { $set: { isDefault: true } });
    await AcademicStream.updateOne({ schoolId, name: "Cambridge A-Levels" }, { $set: { isDefault: true } });
  }
}
