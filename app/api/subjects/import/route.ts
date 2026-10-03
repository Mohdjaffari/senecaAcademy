import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Subject from "@/models/Subject";
import Class from "@/models/Class";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/utils/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can import curriculum subjects.");
    }

    const body = await req.json();
    const rows: Record<string, string>[] = body.rows || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ValidationError("No subject records provided for import.");
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
    existingClasses.forEach((c) => {
      classMap.set(`${c.name.toLowerCase()}-${c.section.toLowerCase()}`, c._id);
      classMap.set(`${c.name.toLowerCase()} ${c.section.toLowerCase()}`, c._id);
      classMap.set(c.name.toLowerCase(), c._id);
    });

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    const getField = (row: Record<string, string>, ...keys: string[]) => {
      for (const k of keys) {
        const normK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (row[normK] !== undefined && row[normK] !== "") return row[normK];
        if (row[k] !== undefined && row[k] !== "") return row[k];
      }
      return "";
    };

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

        if (!name) {
          errors.push(`Row ${rowNum}: Skipped — Subject Name is required.`);
          skippedCount++;
          continue;
        }

        const creditHours = creditHoursRaw && !isNaN(parseInt(creditHoursRaw, 10)) ? parseInt(creditHoursRaw, 10) : 3;

        // Auto-generate code if omitted
        if (!code) {
          const prefix = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "SUB";
          const randomNum = Math.floor(100 + Math.random() * 900);
          code = `${prefix}-${randomNum}`;
        }
        const finalCode = code.trim().toUpperCase();

        // Resolve class IDs from classNames list (e.g. "Grade 6-A; Grade 7-A" or "Nursery-A")
        const resolvedClassIds: any[] = [];
        if (classNamesRaw) {
          const splitClasses = classNamesRaw.split(/[;,|]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
          for (const s of splitClasses) {
            const foundId = classMap.get(s);
            if (foundId && !resolvedClassIds.includes(foundId)) {
              resolvedClassIds.push(foundId);
            }
          }
        }

        // Check if subject with code exists
        const existingSubject = await Subject.findOne({
          schoolId: school._id,
          code: finalCode,
        });

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
          importedCount++;
        } else {
          await Subject.create({
            schoolId: school._id,
            name: name.trim(),
            code: finalCode,
            department: department.trim(),
            creditHours,
            description: description.trim(),
            classIds: resolvedClassIds,
          });
          importedCount++;
        }
      } catch (rowErr: any) {
        errors.push(`Row ${rowNum}: ${rowErr.message || "Failed to process subject record"}`);
        skippedCount++;
      }
    }

    return apiSuccess(
      {
        importedCount,
        skippedCount,
        errors,
        totalRows: rows.length,
      },
      `Successfully processed ${rows.length} rows (${importedCount} subjects created or updated).`
    );
  } catch (error) {
    return apiError(error);
  }
}
