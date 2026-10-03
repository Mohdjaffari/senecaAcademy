import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
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
      throw new AuthorizationError("Only administrators can import class sections.");
    }

    const body = await req.json();
    const rows: Record<string, string>[] = body.rows || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ValidationError("No class records provided for import.");
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
        const name = getField(row, "name", "classname", "class name", "grade");
        const section = getField(row, "section", "classsection", "class section") || "A";
        const gradeLevelRaw = getField(row, "gradelevel", "grade level", "level");
        const stream = getField(row, "stream", "track") || "General";
        const capacityRaw = getField(row, "capacity", "maxstudents", "limit");
        const roomNumber = getField(row, "roomnumber", "room", "room number") || `Room-${100 + Math.floor(Math.random() * 400)}`;

        if (!name) {
          errors.push(`Row ${rowNum}: Skipped — Class Name is required.`);
          skippedCount++;
          continue;
        }

        let gradeLevel = 0;
        if (gradeLevelRaw && !isNaN(parseInt(gradeLevelRaw, 10))) {
          gradeLevel = parseInt(gradeLevelRaw, 10);
        } else {
          const numMatch = name.match(/\d+/);
          if (numMatch) {
            gradeLevel = parseInt(numMatch[0], 10);
          } else if (/play|nurs|kg|prep/i.test(name)) {
            gradeLevel = 0;
          }
        }

        const capacity = capacityRaw && !isNaN(parseInt(capacityRaw, 10)) ? parseInt(capacityRaw, 10) : 35;

        // Check duplicate class+section in same school
        const existing = await Class.findOne({
          schoolId: school._id,
          name: name.trim(),
          section: section.trim().toUpperCase(),
        });

        if (existing) {
          existing.capacity = capacity;
          existing.roomNumber = roomNumber;
          existing.stream = stream;
          existing.gradeLevel = gradeLevel;
          await existing.save();
          importedCount++;
        } else {
          await Class.create({
            schoolId: school._id,
            name: name.trim(),
            section: section.trim().toUpperCase(),
            gradeLevel,
            stream,
            capacity,
            roomNumber,
            status: "active",
          });
          importedCount++;
        }
      } catch (rowErr: any) {
        errors.push(`Row ${rowNum}: ${rowErr.message || "Failed to process class record"}`);
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
      `Successfully processed ${rows.length} rows (${importedCount} classes created or updated).`
    );
  } catch (error) {
    return apiError(error);
  }
}
