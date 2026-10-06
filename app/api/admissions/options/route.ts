import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Class from "@/models/Class";
import Department from "@/models/Department";
import School from "@/models/School";
import AcademicStream from "@/models/AcademicStream";
import AdmissionsPage from "@/models/AdmissionsPage";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { DEFAULT_ADMISSIONS_PAGE_DATA } from "@/lib/db/admissions-page-defaults";
import { ensureDefaultAcademicStreams } from "@/lib/db/academic-streams-defaults";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));

    if (school) {
      await ensureDefaultAcademicStreams(school._id);
    }

    const query: any = { status: "active" };
    if (school) {
      query.schoolId = school._id;
    }

    // 1. Fetch active classes added by Admin/Principal
    const classes = await Class.find(query)
      .sort({ gradeLevel: 1, name: 1 })
      .lean();

    // 2. Fetch active departments / academic groups added by Admin/Principal
    const departments = await Department.find(query)
      .sort({ createdAt: 1 })
      .lean();

    // 3. Extract distinct class names and unique groups
    const classMap = new Map<string, { id: string; name: string; gradeLevel: number; streams: Set<string> }>();

    for (const cls of classes) {
      const className = cls.name.trim();
      if (!classMap.has(className)) {
        classMap.set(className, {
          id: cls._id.toString(),
          name: className,
          gradeLevel: cls.gradeLevel ?? 0,
          streams: new Set<string>(),
        });
      }
      if (cls.stream && cls.stream.trim()) {
        classMap.get(className)?.streams.add(cls.stream.trim());
      }
    }

    const formattedClasses = Array.from(classMap.values()).map((c) => ({
      id: c.id,
      name: c.name,
      gradeLevel: c.gradeLevel,
      streams: Array.from(c.streams),
    }));

    // Extract all distinct streams / groups
    const groupSet = new Set<string>();

    // 3. Fetch academic streams from AcademicStream collection
    const dbStreams = await AcademicStream.find(query)
      .sort({ order: 1, name: 1 })
      .lean();

    for (const st of dbStreams) {
      if (st.name && st.name.trim()) {
        groupSet.add(st.name.trim());
      }
    }

    // Add groups from Departments
    for (const d of departments) {
      if (d.name && d.name.trim()) {
        groupSet.add(d.name.trim());
      }
    }

    // Add groups from Class streams
    for (const cls of classes) {
      if (cls.stream && cls.stream.trim()) {
        groupSet.add(cls.stream.trim());
      }
    }

    // Baseline fallbacks if database is brand new with 0 entries
    if (formattedClasses.length === 0) {
      const defaultClasses = [
        { id: "pg", name: "Playgroup", gradeLevel: 0, streams: ["General Curriculum"] },
        { id: "nur", name: "Nursery", gradeLevel: 0, streams: ["General Curriculum"] },
        { id: "kg1", name: "KG-I (Prep-I)", gradeLevel: 0, streams: ["General Curriculum"] },
        { id: "kg2", name: "KG-II (Prep-II)", gradeLevel: 0, streams: ["General Curriculum"] },
        { id: "g1", name: "Grade 1", gradeLevel: 1, streams: ["General Curriculum"] },
        { id: "g2", name: "Grade 2", gradeLevel: 2, streams: ["General Curriculum"] },
        { id: "g3", name: "Grade 3", gradeLevel: 3, streams: ["General Curriculum"] },
        { id: "g4", name: "Grade 4", gradeLevel: 4, streams: ["General Curriculum"] },
        { id: "g5", name: "Grade 5", gradeLevel: 5, streams: ["General Curriculum"] },
        { id: "g6", name: "Grade 6", gradeLevel: 6, streams: ["General Curriculum"] },
        { id: "g7", name: "Grade 7", gradeLevel: 7, streams: ["General Curriculum"] },
        { id: "g8", name: "Grade 8", gradeLevel: 8, streams: ["General Curriculum"] },
        { id: "g9", name: "Grade 9 (Matric)", gradeLevel: 9, streams: ["Science (Biology)", "Science (Computer Science)"] },
        { id: "g10", name: "Grade 10 (Matric)", gradeLevel: 10, streams: ["Science (Biology)", "Science (Computer Science)"] },
        { id: "g11", name: "Grade 11 (1st Year)", gradeLevel: 11, streams: ["Pre-Medical", "Pre-Engineering", "Computer Science (ICS)", "Commerce (I.Com)"] },
        { id: "caie-o", name: "Cambridge O-Level", gradeLevel: 9, streams: ["Cambridge Science", "Cambridge Commerce"] },
        { id: "caie-a", name: "Cambridge A-Level", gradeLevel: 11, streams: ["Pre-Medical", "Pre-Engineering", "Business & Economics"] },
      ];
      defaultClasses.forEach((c) => formattedClasses.push(c));
    }

    if (groupSet.size === 0) {
      [
        "General Curriculum (Standard)",
        "Science (Biology / Medical Track)",
        "Science (Computer Science & IT)",
        "Science (Pre-Engineering & Mathematics)",
        "Commerce & Business Studies",
        "Cambridge International (CAIE)",
      ].forEach((g) => groupSet.add(g));
    }

    const formattedGroups = Array.from(groupSet).map((name) => ({
      name,
    }));

    // 4. Fetch dynamic admission types, transport routes, and document rules from AdmissionsPage CMS
    const admissionsPage = await AdmissionsPage.findOne(school ? { schoolId: school._id } : {}).lean();

    const admissionTypes =
      admissionsPage?.admissionTypes && admissionsPage.admissionTypes.length > 0
        ? admissionsPage.admissionTypes.filter((t: any) => t.isActive !== false)
        : DEFAULT_ADMISSIONS_PAGE_DATA.admissionTypes;

    const transportRoutes =
      admissionsPage?.transportRoutes && admissionsPage.transportRoutes.length > 0
        ? admissionsPage.transportRoutes.filter((r: any) => r.isActive !== false)
        : DEFAULT_ADMISSIONS_PAGE_DATA.transportRoutes;

    const documentRules =
      admissionsPage?.documentRules && admissionsPage.documentRules.length > 0
        ? admissionsPage.documentRules.filter((d: any) => d.isActive !== false)
        : DEFAULT_ADMISSIONS_PAGE_DATA.documentRules;

    const globalSettings = admissionsPage?.globalSettings || DEFAULT_ADMISSIONS_PAGE_DATA.globalSettings;

    return apiSuccess(
      {
        classes: formattedClasses,
        groups: formattedGroups,
        admissionTypes,
        transportRoutes,
        documentRules,
        globalSettings,
        totalClasses: formattedClasses.length,
        totalGroups: formattedGroups.length,
      },
      "Admission academic options retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}
