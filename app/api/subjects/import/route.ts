import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Subject from "@/models/Subject";
import Class from "@/models/Class";
import Teacher from "@/models/Teacher";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/utils/errors";
import { ACADEMIC_SPECTRUM } from "@/lib/constants/academic-spectrum";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can import and analyze curriculum subjects.");
    }

    const body = await req.json();
    const rows: Record<string, string>[] = body.rows || [];
    const isAnalyzeOnly = req.nextUrl.searchParams.get("analyze") === "true" || body.analyzeOnly === true;

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ValidationError("No subject records provided for processing.");
    }

    await connectToDatabase();

    const school =
      (await School.findOne({ status: "active" })) ||
      (await School.findOne({})) ||
      (await School.create({
        name: "Seneca Academy",
        code: "SENECA-MAIN-001",
        status: "active",
      }));

    // Cache existing classes
    const existingClasses = await Class.find({ schoolId: school._id }).lean();
    const classMap = new Map<string, any>();
    const classListByName = new Map<string, any[]>();

    existingClasses.forEach((c) => {
      const normKey1 = `${c.name.trim().toLowerCase()}-${c.section.trim().toLowerCase()}`;
      const normKey2 = `${c.name.trim().toLowerCase()} ${c.section.trim().toLowerCase()}`;
      const normKey3 = `${c.name.trim().toLowerCase()}|${c.section.trim().toLowerCase()}`;
      const strippedKey = `${c.name.trim().toLowerCase()}${c.section.trim().toLowerCase()}`.replace(/[^a-z0-9]/g, "");

      classMap.set(normKey1, c);
      classMap.set(normKey2, c);
      classMap.set(normKey3, c);
      classMap.set(strippedKey, c);

      // Map by name alone to match all sections (e.g. "Grade 9" links to 9-A, 9-B)
      const baseName = c.name.trim().toLowerCase();
      const existing = classListByName.get(baseName) || [];
      existing.push(c);
      classListByName.set(baseName, existing);
    });

    // Cache existing teachers
    const existingTeachers = await Teacher.find({ schoolId: school._id, status: "active" })
      .populate("userId", "name email")
      .lean();
    const teacherMap = new Map<string, any>();
    existingTeachers.forEach((t) => {
      const name = (t.userId as any)?.name?.toLowerCase().trim();
      const empId = t.employeeId?.toLowerCase().trim();
      if (name) teacherMap.set(name, t);
      if (empId) teacherMap.set(empId, t);
    });

    // Cache existing subjects
    const existingSubjects = await Subject.find({ schoolId: school._id }).lean();
    const existingSubjectCodeSet = new Set(existingSubjects.map((s) => s.code.toUpperCase().trim()));

    const getField = (row: Record<string, string>, ...keys: string[]) => {
      for (const k of keys) {
        const normK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (row[normK] !== undefined && row[normK] !== "") return String(row[normK]).trim();
        if (row[k] !== undefined && row[k] !== "") return String(row[k]).trim();
      }
      return "";
    };

    // Helper to determine wing based on class grade level
    const getWingFromGrade = (gradeLevel: number, className: string): string => {
      const spec = ACADEMIC_SPECTRUM.find((s) => s.name.toLowerCase() === className.toLowerCase());
      if (spec?.wing) return spec.wing;
      if (gradeLevel === 0 || /play|nurs|prep|kg/i.test(className)) return "Early Years";
      if (gradeLevel >= 1 && gradeLevel <= 5) return "Primary";
      if (gradeLevel >= 6 && gradeLevel <= 8) return "Middle";
      if (gradeLevel === 9 || gradeLevel === 10) return "Secondary";
      if (gradeLevel >= 11) return "Higher Secondary";
      return "General Wing";
    };

    // ==========================================
    // DIAGNOSTIC PRE-FLIGHT ANALYSIS PASS
    // ==========================================
    const wingBreakdown: Record<string, number> = {
      "Early Years": 0,
      "Primary": 0,
      "Middle": 0,
      "Secondary": 0,
      "Higher Secondary": 0,
    };
    const departmentBreakdown: Record<string, number> = {};
    const classOfferingsImpact: Array<{
      className: string;
      section: string;
      currentEnrolled: number;
      capacity: number;
      incomingStudents: number;
      projectedTotal: number;
      isOverCapacity: boolean;
      excessCount: number;
      isNewClass: boolean;
    }> = [];

    const diagnostics: Array<{
      row: number;
      studentName: string;
      type: "error" | "warning" | "info";
      message: string;
    }> = [];

    const batchCodeSet = new Set<string>();
    let validRowsCount = 0;
    let warningRowsCount = 0;
    let errorRowsCount = 0;
    let totalWeeklyHours = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      const name = getField(row, "name", "subjectname", "subject name", "title");
      let code = getField(row, "code", "subjectcode", "subject code", "coursecode");
      const department = getField(row, "department", "dept") || "General";
      const creditHoursRaw = getField(row, "credithours", "credit hours", "credits", "hours");
      const classNamesRaw = getField(row, "classnames", "applicableclasses", "classes", "applicable classes");
      const teachersRaw = getField(row, "teachers", "assignedteachers", "faculty", "instructor");

      if (!name) {
        diagnostics.push({
          row: rowNum,
          studentName: "Unknown Subject",
          type: "error",
          message: "Missing Subject Name (Required field)",
        });
        errorRowsCount++;
        continue;
      }

      const creditHours = creditHoursRaw && !isNaN(parseInt(creditHoursRaw, 10)) ? parseInt(creditHoursRaw, 10) : 3;
      totalWeeklyHours += creditHours;

      if (!code) {
        const prefix = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "SUB";
        const randomNum = Math.floor(100 + Math.random() * 900);
        code = `${prefix}-${randomNum}`;
        diagnostics.push({
          row: rowNum,
          studentName: name,
          type: "info",
          message: `Subject code was omitted. Auto-generated as '${code}'.`,
        });
      }
      const finalCode = code.toUpperCase().trim();

      // Check code collision
      if (batchCodeSet.has(finalCode)) {
        diagnostics.push({
          row: rowNum,
          studentName: name,
          type: "warning",
          message: `Subject code '${finalCode}' repeated in this CSV batch. Later entries will overwrite earlier ones.`,
        });
        warningRowsCount++;
      } else {
        batchCodeSet.add(finalCode);
      }

      if (existingSubjectCodeSet.has(finalCode)) {
        diagnostics.push({
          row: rowNum,
          studentName: name,
          type: "info",
          message: `Subject code '${finalCode}' already exists in database. Existing syllabus will be updated.`,
        });
      }

      // Check class associations
      let resolvedCount = 0;
      let matchedWing = "General";
      if (classNamesRaw) {
        const splitClasses = classNamesRaw.split(/[;,|]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
        for (const rawName of splitClasses) {
          const stripped = rawName.replace(/[^a-z0-9]/g, "");
          const directMatch = classMap.get(rawName) || classMap.get(stripped);
          if (directMatch) {
            resolvedCount++;
            matchedWing = getWingFromGrade(directMatch.gradeLevel, directMatch.name);
          } else {
            const listMatch = classListByName.get(rawName);
            if (listMatch && listMatch.length > 0) {
              resolvedCount += listMatch.length;
              matchedWing = getWingFromGrade(listMatch[0].gradeLevel, listMatch[0].name);
            } else {
              diagnostics.push({
                row: rowNum,
                studentName: name,
                type: "warning",
                message: `Class '${rawName}' not found in active database roster.`,
              });
              warningRowsCount++;
            }
          }
        }
      } else {
        diagnostics.push({
          row: rowNum,
          studentName: name,
          type: "info",
          message: "No specific class sections assigned. Can be linked later from the syllabus portal.",
        });
      }

      // Check teacher associations
      if (teachersRaw) {
        const splitTeachers = teachersRaw.split(/[;,|]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
        for (const tName of splitTeachers) {
          if (!teacherMap.has(tName)) {
            diagnostics.push({
              row: rowNum,
              studentName: name,
              type: "info",
              message: `Teacher '${tName}' not yet registered in Seneca faculty records.`,
            });
          }
        }
      }

      // Accumulate metrics
      departmentBreakdown[department] = (departmentBreakdown[department] || 0) + 1;
      if (wingBreakdown[matchedWing] !== undefined) {
        wingBreakdown[matchedWing] = (wingBreakdown[matchedWing] || 0) + 1;
      }

      validRowsCount++;
    }

    const analysisReport = {
      totalRows: rows.length,
      validRows: validRowsCount,
      warningRows: warningRowsCount,
      errorRows: errorRowsCount,
      totalWeeklyHours,
      wingBreakdown,
      streamBreakdown: departmentBreakdown, // Department distribution
      genderBreakdown: { Male: 0, Female: 0, Other: 0 },
      classCapacityImpact: classOfferingsImpact,
      diagnostics: diagnostics.slice(0, 50),
      canProceed: validRowsCount > 0,
    };

    // RETURN PRE-FLIGHT ANALYSIS REPORT IF REQUESTED
    if (isAnalyzeOnly) {
      return apiSuccess(
        {
          isAnalysis: true,
          analysis: analysisReport,
        },
        `Pre-flight diagnostics completed for ${rows.length} curriculum subjects.`
      );
    }

    // ==========================================
    // EXECUTION PASS: PERSIST RECORDS IN MONGODB
    // ==========================================
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const executionErrors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      try {
        const name = getField(row, "name", "subjectname", "subject name", "title");
        let code = getField(row, "code", "subjectcode", "subject code", "coursecode");
        const department = getField(row, "department", "dept") || "General";
        const creditHoursRaw = getField(row, "credithours", "credit hours", "credits", "hours");
        const description = getField(row, "description", "desc") || "Core curriculum subject designed for academic rigor.";
        const classNamesRaw = getField(row, "classnames", "applicableclasses", "classes", "applicable classes");
        const teachersRaw = getField(row, "teachers", "assignedteachers", "faculty", "instructor");

        if (!name) {
          executionErrors.push(`Row ${rowNum}: Skipped — Subject Name is required.`);
          skippedCount++;
          continue;
        }

        const creditHours = creditHoursRaw && !isNaN(parseInt(creditHoursRaw, 10)) ? parseInt(creditHoursRaw, 10) : 3;

        if (!code) {
          const prefix = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "SUB";
          const randomNum = Math.floor(100 + Math.random() * 900);
          code = `${prefix}-${randomNum}`;
        }
        const finalCode = code.trim().toUpperCase();

        // Resolve class IDs
        const resolvedClassIds: any[] = [];
        if (classNamesRaw) {
          const splitClasses = classNamesRaw.split(/[;,|]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
          for (const rawName of splitClasses) {
            const stripped = rawName.replace(/[^a-z0-9]/g, "");
            const directMatch = classMap.get(rawName) || classMap.get(stripped);
            if (directMatch && !resolvedClassIds.some((id) => id.toString() === directMatch._id.toString())) {
              resolvedClassIds.push(directMatch._id);
            } else {
              const listMatch = classListByName.get(rawName);
              if (listMatch) {
                for (const c of listMatch) {
                  if (!resolvedClassIds.some((id) => id.toString() === c._id.toString())) {
                    resolvedClassIds.push(c._id);
                  }
                }
              }
            }
          }
        }

        // Resolve teacher IDs
        const resolvedTeacherIds: any[] = [];
        if (teachersRaw) {
          const splitTeachers = teachersRaw.split(/[;,|]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
          for (const tName of splitTeachers) {
            const match = teacherMap.get(tName);
            if (match && !resolvedTeacherIds.includes(match._id)) {
              resolvedTeacherIds.push(match._id);
            }
          }
        }

        // Upsert Subject Record
        const existingSubject = await Subject.findOne({
          schoolId: school._id,
          code: finalCode,
        });

        let targetSubjectId: any;

        if (existingSubject) {
          existingSubject.name = name.trim();
          existingSubject.department = department.trim();
          existingSubject.creditHours = creditHours;
          existingSubject.description = description.trim();
          if (resolvedClassIds.length > 0) {
            const combined = Array.from(new Set([...(existingSubject.classIds || []), ...resolvedClassIds]));
            existingSubject.classIds = combined;
          }
          await existingSubject.save();
          targetSubjectId = existingSubject._id;
          updatedCount++;
        } else {
          const created = await Subject.create({
            schoolId: school._id,
            name: name.trim(),
            code: finalCode,
            department: department.trim(),
            creditHours,
            description: description.trim(),
            classIds: resolvedClassIds,
          });
          targetSubjectId = created._id;
          importedCount++;
        }

        // Link Subject to Teachers if resolved
        if (resolvedTeacherIds.length > 0 && targetSubjectId) {
          for (const tId of resolvedTeacherIds) {
            await Teacher.findByIdAndUpdate(tId, {
              $addToSet: { assignedSubjectIds: targetSubjectId },
            });
          }
        }
      } catch (rowErr: any) {
        executionErrors.push(`Row ${rowNum}: ${rowErr.message || "Failed to process subject record"}`);
        skippedCount++;
      }
    }

    return apiSuccess(
      {
        importedCount,
        updatedCount,
        skippedCount,
        errors: executionErrors,
        totalRows: rows.length,
        analysis: analysisReport,
      },
      `Curriculum import completed: ${importedCount} subjects created and ${updatedCount} updated successfully.`
    );
  } catch (error) {
    return apiError(error);
  }
}
