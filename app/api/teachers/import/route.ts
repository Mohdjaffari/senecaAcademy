import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Teacher from "@/models/Teacher";
import User from "@/models/User";
import School from "@/models/School";
import { hashPassword } from "@/lib/auth/password";
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
      throw new AuthorizationError("Only administrators can import faculty records.");
    }

    const body = await req.json();
    const rows: Record<string, string>[] = body.rows || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ValidationError("No faculty records provided for import.");
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

    const existingUsers = await User.find({ schoolId: school._id }).select("email").lean();
    const existingEmailSet = new Set(existingUsers.map((u) => u.email.toLowerCase().trim()));

    const existingTeachers = await Teacher.find({ schoolId: school._id }).select("employeeId").lean();
    const existingEmpIdSet = new Set(existingTeachers.map((t) => (t.employeeId || "").toUpperCase().trim()));

    const defaultPasswordHash = await hashPassword("Seneca@2026");

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
        const name = getField(row, "name", "fullname", "teachername", "faculty name");
        let email = getField(row, "email", "facultyemail", "teacher email");
        const phone = getField(row, "phone", "phonenumber", "contact", "mobile") || "+92 300 0000000";
        let employeeId = getField(row, "employeeid", "empid", "employee id");
        const specialization = getField(row, "specialization", "subject", "specialty") || "General Faculty";
        const qualification = getField(row, "qualification", "degree", "education") || "B.Ed / M.A.";
        const expRaw = getField(row, "experienceyears", "experience", "years");

        if (!name) {
          errors.push(`Row ${rowNum}: Skipped — Faculty Name is required.`);
          skippedCount++;
          continue;
        }

        if (!email) {
          const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
          const rand = Math.floor(100 + Math.random() * 900);
          email = `${sanitized}.${rand}@seneca.edu.pk`;
        }

        let emailLower = email.toLowerCase().trim();
        if (existingEmailSet.has(emailLower)) {
          const rand = Math.floor(1000 + Math.random() * 9000);
          const [userPart, domainPart] = emailLower.split("@");
          emailLower = `${userPart}${rand}@${domainPart || "seneca.edu.pk"}`;
        }
        existingEmailSet.add(emailLower);

        if (!employeeId || existingEmpIdSet.has(employeeId.toUpperCase().trim())) {
          const count = await Teacher.countDocuments({ schoolId: school._id });
          employeeId = `TCH-${new Date().getFullYear()}-${String(count + 1 + importedCount).padStart(3, "0")}`;
        }
        existingEmpIdSet.add(employeeId.toUpperCase().trim());

        const experienceYears = expRaw && !isNaN(parseInt(expRaw, 10)) ? parseInt(expRaw, 10) : 2;

        // 1. Create User account
        const newUser = await User.create({
          schoolId: school._id,
          name: name.trim(),
          email: emailLower,
          passwordHash: defaultPasswordHash,
          role: "teacher",
          phone,
          status: "active",
        });

        // 2. Create Teacher profile
        const newTeacher = await Teacher.create({
          schoolId: school._id,
          userId: newUser._id,
          employeeId: employeeId.trim().toUpperCase(),
          specialization: specialization.trim(),
          qualification: qualification.trim(),
          experienceYears,
          assignedClassIds: [],
          assignedSubjectIds: [],
          headOfClassIds: [],
          status: "active",
        });

        newUser.profileId = newTeacher._id;
        await newUser.save();

        importedCount++;
      } catch (rowErr: any) {
        errors.push(`Row ${rowNum}: ${rowErr.message || "Failed to process faculty record"}`);
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
      `Successfully processed ${rows.length} rows (${importedCount} faculty members enrolled).`
    );
  } catch (error) {
    return apiError(error);
  }
}
