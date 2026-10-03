import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Student from "@/models/Student";
import User from "@/models/User";
import Class from "@/models/Class";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
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
      throw new AuthorizationError("Only administrators can import student records.");
    }

    const body = await req.json();
    const rows: Record<string, string>[] = body.rows || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ValidationError("No student records provided for import.");
    }

    await connectToDatabase();

    const school =
      (await School.findOne({ status: "active" })) ||
      (await School.findOne({})) ||
      (await School.create({
        name: "Seneca Academy",
        code: "SENECA-MAIN-001",
        contactEmail: "admin@seneca.edu.pk",
        phone: "+92 300 0000000",
        address: "Main Campus, Pakistan",
        status: "active",
      }));

    const academicYear =
      (await AcademicYear.findOne({ status: "active" })) ||
      (await AcademicYear.findOne({})) ||
      (await AcademicYear.create({
        schoolId: school._id,
        name: "2026-2027",
        code: "AY-2026-27",
        startDate: new Date("2026-08-01"),
        endDate: new Date("2027-06-30"),
        status: "active",
      }));

    // Cache classes in Map: "classname|section" -> ClassDoc
    const existingClasses = await Class.find({ schoolId: school._id }).lean();
    const classMap = new Map<string, any>();
    existingClasses.forEach((c) => {
      const key = `${c.name.trim().toLowerCase()}|${c.section.trim().toLowerCase()}`;
      classMap.set(key, c);
      // Also map just by lowercase name if section is default "A"
      if (c.section.trim().toLowerCase() === "a") {
        classMap.set(c.name.trim().toLowerCase(), c);
      }
    });

    // Cache existing emails to avoid collisions
    const existingUsers = await User.find({ schoolId: school._id }).select("email").lean();
    const existingEmailSet = new Set(existingUsers.map((u) => u.email.toLowerCase().trim()));

    // Cache existing admission numbers
    const existingStudents = await Student.find({ schoolId: school._id }).select("admissionNumber").lean();
    const existingAdmSet = new Set(existingStudents.map((s) => (s.admissionNumber || "").toLowerCase().trim()));

    const defaultPasswordHash = await hashPassword("Seneca@2026");

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Helper to get field by normalized key or display label
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
        const name = getField(row, "name", "studentname", "student name", "fullname");
        let email = getField(row, "email", "studentemail", "student email");
        const className = getField(row, "classname", "class", "grade", "class name") || "Grade 1";
        const section = getField(row, "section", "classsection", "class section") || "A";
        let rollNumber = getField(row, "rollnumber", "roll", "roll number", "rollno");
        let admissionNumber = getField(row, "admissionnumber", "admission", "admission no", "admission number");
        const fatherName = getField(row, "fathername", "father name", "guardian", "guardianname", "parentname") || "Guardian";
        const parentPhone = getField(row, "parentphone", "phone", "mobile", "guardianphone", "parent phone") || "+92 300 0000000";
        const emergencyContact = getField(row, "emergencycontact", "emergency phone", "emergency contact") || parentPhone;
        const address = getField(row, "address", "residentialaddress", "city") || "Karachi, Pakistan";
        const genderRaw = getField(row, "gender");
        const gender: "Male" | "Female" | "Other" =
          /female|girl|f/i.test(genderRaw) ? "Female" : /other/i.test(genderRaw) ? "Other" : "Male";
        const stream = getField(row, "stream") || "General";
        const bloodGroup = getField(row, "bloodgroup", "blood group") || "O+";
        const dobRaw = getField(row, "dateofbirth", "dob", "birthdate");
        const dateOfBirth = dobRaw && !isNaN(Date.parse(dobRaw)) ? new Date(dobRaw) : new Date("2018-01-01");

        if (!name) {
          errors.push(`Row ${rowNum}: Skipped — Student Name is required.`);
          skippedCount++;
          continue;
        }

        // Auto-generate email if omitted or if duplicate
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

        // Resolve or auto-create Class
        const classKey = `${className.trim().toLowerCase()}|${section.trim().toLowerCase()}`;
        let matchedClass = classMap.get(classKey);

        if (!matchedClass) {
          // Determine grade level integer
          let gradeLevel = 0;
          const numMatch = className.match(/\d+/);
          if (numMatch) {
            gradeLevel = parseInt(numMatch[0], 10);
          } else if (/play|nurs|kg|prep/i.test(className)) {
            gradeLevel = 0;
          }

          matchedClass = await Class.create({
            schoolId: school._id,
            name: className.trim(),
            section: section.trim().toUpperCase(),
            gradeLevel,
            stream,
            capacity: 35,
            roomNumber: `Room-${100 + Math.floor(Math.random() * 400)}`,
            status: "active",
          });
          classMap.set(classKey, matchedClass);
        }

        // Resolve Admission Number
        if (!admissionNumber || existingAdmSet.has(admissionNumber.toLowerCase().trim())) {
          const timestamp = Date.now().toString().slice(-4);
          const rand = Math.floor(10 + Math.random() * 90);
          admissionNumber = `SEN-2026-${timestamp}${rand}`;
        }
        existingAdmSet.add(admissionNumber.toLowerCase().trim());

        if (!rollNumber) {
          const countInClass = await Student.countDocuments({ classId: matchedClass._id });
          rollNumber = `${matchedClass.section}-${String(countInClass + 1).padStart(2, "0")}`;
        }

        // 1. Create User account for student
        const newUser = await User.create({
          schoolId: school._id,
          name: name.trim(),
          email: emailLower,
          passwordHash: defaultPasswordHash,
          role: "student",
          phone: parentPhone,
          status: "active",
        });

        // 2. Create Student profile
        const newStudent = await Student.create({
          schoolId: school._id,
          userId: newUser._id,
          academicYearId: academicYear._id,
          classId: matchedClass._id,
          admissionNumber,
          rollNumber,
          admissionType: "Regular",
          stream,
          dateOfBirth,
          gender,
          bloodGroup,
          address,
          guardian: {
            fatherName,
            phone: parentPhone,
            guardianType: "Father",
            emergencyContact,
          },
          status: "active",
        });

        newUser.profileId = newStudent._id;
        await newUser.save();

        importedCount++;
      } catch (rowErr: any) {
        errors.push(`Row ${rowNum}: ${rowErr.message || "Failed to process record"}`);
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
      `Successfully processed ${rows.length} rows (${importedCount} students enrolled).`
    );
  } catch (error) {
    return apiError(error);
  }
}
