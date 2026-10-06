import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Student from "@/models/Student";
import User from "@/models/User";
import Class from "@/models/Class";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import AcademicStream from "@/models/AcademicStream";
import { hashPassword } from "@/lib/auth/password";
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
      throw new AuthorizationError("Only administrators can import and analyze student enrollment records.");
    }

    const body = await req.json();
    const rows: Record<string, string>[] = body.rows || [];
    const isAnalyzeOnly = req.nextUrl.searchParams.get("analyze") === "true" || body.analyzeOnly === true;

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ValidationError("No student records provided for processing.");
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

    // Cache existing classes
    const existingClasses = await Class.find({ schoolId: school._id }).lean();
    const classMap = new Map<string, any>();
    existingClasses.forEach((c) => {
      const key = `${c.name.trim().toLowerCase()}|${c.section.trim().toLowerCase()}`;
      classMap.set(key, c);
      if (c.section.trim().toLowerCase() === "a") {
        classMap.set(c.name.trim().toLowerCase(), c);
      }
    });

    // Cache active academic streams
    const dbStreams = await AcademicStream.find({ schoolId: school._id, status: "active" }).lean();
    const streamNamesSet = new Set(dbStreams.map((s) => s.name.toLowerCase().trim()));

    // Cache existing emails to avoid collisions
    const existingUsers = await User.find({ schoolId: school._id }).select("email").lean();
    const existingEmailSet = new Set(existingUsers.map((u) => u.email.toLowerCase().trim()));

    // Cache existing admission numbers
    const existingStudents = await Student.find({ schoolId: school._id }).select("admissionNumber bFormNumber").lean();
    const existingAdmSet = new Set(existingStudents.map((s) => (s.admissionNumber || "").toLowerCase().trim()));
    const existingBFormSet = new Set(existingStudents.map((s) => (s.bFormNumber || "").toLowerCase().trim()).filter(Boolean));

    // Field normalization extractor
    const getField = (row: Record<string, string>, ...keys: string[]) => {
      for (const k of keys) {
        const normK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (row[normK] !== undefined && row[normK] !== "") return String(row[normK]).trim();
        if (row[k] !== undefined && row[k] !== "") return String(row[k]).trim();
      }
      return "";
    };

    // Helper to determine wing based on class name / grade level
    const determineWing = (className: string, gradeLevel: number): string => {
      const spec = ACADEMIC_SPECTRUM.find((s) => s.name.toLowerCase() === className.toLowerCase());
      if (spec?.wing) return spec.wing;
      if (gradeLevel === 0 || /play|nurs|prep|kg/i.test(className)) return "Early Years";
      if (gradeLevel >= 1 && gradeLevel <= 5) return "Primary";
      if (gradeLevel >= 6 && gradeLevel <= 8) return "Middle";
      if (gradeLevel === 9 || gradeLevel === 10) return "Secondary";
      if (gradeLevel >= 11) return "Higher Secondary";
      return "Primary";
    };

    // Track statistics for pre-flight analysis
    const wingBreakdown: Record<string, number> = {
      "Early Years": 0,
      "Primary": 0,
      "Middle": 0,
      "Secondary": 0,
      "Higher Secondary": 0,
    };
    const streamBreakdown: Record<string, number> = {};
    const genderBreakdown = { Male: 0, Female: 0, Other: 0 };
    const classImpactMap = new Map<string, {
      className: string;
      section: string;
      currentEnrolled: number;
      capacity: number;
      incomingStudents: number;
      isNewClass: boolean;
    }>();

    const diagnostics: Array<{
      row: number;
      studentName: string;
      type: "error" | "warning" | "info";
      message: string;
    }> = [];

    // Local set tracking duplicates within the CSV itself
    const batchEmailSet = new Set<string>();
    const batchAdmSet = new Set<string>();
    const batchBFormSet = new Set<string>();

    let validRowsCount = 0;
    let errorRowsCount = 0;
    let warningRowsCount = 0;

    // PRE-FLIGHT ANALYSIS PASS
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      const name = getField(row, "name", "studentname", "student name", "fullname");
      const email = getField(row, "email", "studentemail", "student email");
      const className = getField(row, "classname", "class", "grade", "class name") || "Grade 1";
      const section = (getField(row, "section", "classsection", "class section") || "A").toUpperCase();
      const stream = getField(row, "stream", "academicstream", "track", "specialization") || "General Curriculum";
      const bForm = getField(row, "bformnumber", "bform", "cnic", "studentcnic", "b-form");
      const admissionNumber = getField(row, "admissionnumber", "admission", "admission no", "admission number");
      const parentPhone = getField(row, "parentphone", "phone", "mobile", "guardianphone", "parent phone");
      const fatherName = getField(row, "fathername", "father name", "guardian", "guardianname", "parentname");
      const genderRaw = getField(row, "gender");
      const gender: "Male" | "Female" | "Other" =
        /female|girl|f/i.test(genderRaw) ? "Female" : /other/i.test(genderRaw) ? "Other" : "Male";

      if (!name) {
        diagnostics.push({
          row: rowNum,
          studentName: "Unknown",
          type: "error",
          message: "Missing Student Full Name (Required field)",
        });
        errorRowsCount++;
        continue;
      }

      // Check for email collision
      if (email) {
        const emLower = email.toLowerCase();
        if (existingEmailSet.has(emLower)) {
          diagnostics.push({
            row: rowNum,
            studentName: name,
            type: "warning",
            message: `Email '${email}' is already taken. A unique institutional address will be auto-generated.`,
          });
          warningRowsCount++;
        } else if (batchEmailSet.has(emLower)) {
          diagnostics.push({
            row: rowNum,
            studentName: name,
            type: "warning",
            message: `Duplicate email '${email}' repeated in CSV batch. Suffix will be appended.`,
          });
          warningRowsCount++;
        } else {
          batchEmailSet.add(emLower);
        }
      }

      // Check for admission ID collision
      if (admissionNumber) {
        const admLower = admissionNumber.toLowerCase();
        if (existingAdmSet.has(admLower) || batchAdmSet.has(admLower)) {
          diagnostics.push({
            row: rowNum,
            studentName: name,
            type: "warning",
            message: `Admission ID '${admissionNumber}' already registered. A new institutional ID will be issued.`,
          });
          warningRowsCount++;
        } else {
          batchAdmSet.add(admLower);
        }
      }

      // Check for B-Form collision
      if (bForm) {
        const bfNorm = bForm.replace(/[^0-9]/g, "");
        if (bfNorm.length > 5) {
          if (existingBFormSet.has(bfNorm) || batchBFormSet.has(bfNorm)) {
            diagnostics.push({
              row: rowNum,
              studentName: name,
              type: "warning",
              message: `B-Form / CNIC '${bForm}' already on record. Please verify applicant identity.`,
            });
            warningRowsCount++;
          } else {
            batchBFormSet.add(bfNorm);
          }
        }
      }

      // Check parent phone
      if (!parentPhone) {
        diagnostics.push({
          row: rowNum,
          studentName: name,
          type: "warning",
          message: "Parent contact mobile is missing. Defaults will be applied.",
        });
        warningRowsCount++;
      }

      // Check stream alignment
      if (stream && !streamNamesSet.has(stream.toLowerCase())) {
        diagnostics.push({
          row: rowNum,
          studentName: name,
          type: "info",
          message: `Specialization '${stream}' not found in registered database tracks. Will be recorded directly.`,
        });
      }

      // Calculate grade level
      let gradeLevel = 1;
      const numMatch = className.match(/\d+/);
      if (numMatch) {
        gradeLevel = parseInt(numMatch[0], 10);
      } else if (/play|nurs|kg|prep/i.test(className)) {
        gradeLevel = 0;
      }
      const wing = determineWing(className, gradeLevel);
      wingBreakdown[wing] = (wingBreakdown[wing] || 0) + 1;
      streamBreakdown[stream] = (streamBreakdown[stream] || 0) + 1;
      genderBreakdown[gender] = (genderBreakdown[gender] || 0) + 1;

      // Track class capacity impact
      const classKey = `${className.toLowerCase()}|${section.toLowerCase()}`;
      const matched = classMap.get(classKey);
      if (!classImpactMap.has(classKey)) {
        classImpactMap.set(classKey, {
          className,
          section,
          currentEnrolled: matched ? (matched.enrolledCount || 0) : 0,
          capacity: matched ? (matched.capacity || 35) : 35,
          incomingStudents: 1,
          isNewClass: !matched,
        });
      } else {
        const item = classImpactMap.get(classKey)!;
        item.incomingStudents += 1;
      }

      validRowsCount++;
    }

    // Process class impact summary
    const classCapacityImpact = Array.from(classImpactMap.values()).map((ci) => {
      const projectedTotal = ci.currentEnrolled + ci.incomingStudents;
      const isOverCapacity = projectedTotal > ci.capacity;
      const excessCount = isOverCapacity ? projectedTotal - ci.capacity : 0;
      return {
        ...ci,
        projectedTotal,
        isOverCapacity,
        excessCount,
      };
    });

    // Check for capacity warnings
    classCapacityImpact.forEach((ci) => {
      if (ci.isOverCapacity) {
        diagnostics.push({
          row: 0,
          studentName: `${ci.className} (Section ${ci.section})`,
          type: "warning",
          message: `Section capacity exceeded: ${ci.projectedTotal}/${ci.capacity} seats (${ci.excessCount} over capacity).`,
        });
        warningRowsCount++;
      }
    });

    const analysisReport = {
      totalRows: rows.length,
      validRows: validRowsCount,
      warningRows: warningRowsCount,
      errorRows: errorRowsCount,
      wingBreakdown,
      streamBreakdown,
      genderBreakdown,
      classCapacityImpact,
      diagnostics: diagnostics.slice(0, 50),
      canProceed: validRowsCount > 0,
    };

    // IF ANALYZE ONLY, RETURN DIAGNOSTICS IMMEDIATELY
    if (isAnalyzeOnly) {
      return apiSuccess(
        {
          isAnalysis: true,
          analysis: analysisReport,
        },
        `Pre-flight diagnostics completed for ${rows.length} rows.`
      );
    }

    // ==========================================
    // EXECUTION PASS: PERSIST RECORDS TO DATABASE
    // ==========================================
    const defaultPasswordHash = await hashPassword("Seneca@2026");
    let importedCount = 0;
    let skippedCount = 0;
    const executionErrors: string[] = [];

    // Track classes updated for enrolledCount increment
    const updatedClassCounts = new Map<string, number>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      try {
        const name = getField(row, "name", "studentname", "student name", "fullname");
        let email = getField(row, "email", "studentemail", "student email");
        const className = getField(row, "classname", "class", "grade", "class name") || "Grade 1";
        const section = (getField(row, "section", "classsection", "class section") || "A").toUpperCase();
        let rollNumber = getField(row, "rollnumber", "roll", "roll number", "rollno");
        let admissionNumber = getField(row, "admissionnumber", "admission", "admission no", "admission number");
        const fatherName = getField(row, "fathername", "father name", "guardian", "guardianname", "parentname") || "Father";
        const fatherCnic = getField(row, "fathercnic", "father cnic", "guardiancnic");
        const parentPhone = getField(row, "parentphone", "phone", "mobile", "guardianphone", "parent phone") || "+92 300 0000000";
        const emergencyContact = getField(row, "emergencycontact", "emergency phone", "emergency contact") || parentPhone;
        const address = getField(row, "address", "residentialaddress", "city") || "Karachi, Pakistan";
        const genderRaw = getField(row, "gender");
        const gender: "Male" | "Female" | "Other" =
          /female|girl|f/i.test(genderRaw) ? "Female" : /other/i.test(genderRaw) ? "Other" : "Male";
        const stream = getField(row, "stream", "academicstream", "track", "specialization") || "General Curriculum";
        const bloodGroup = getField(row, "bloodgroup", "blood group") || "O+";
        const bFormNumber = getField(row, "bformnumber", "bform", "cnic", "studentcnic", "b-form");
        const dobRaw = getField(row, "dateofbirth", "dob", "birthdate");
        const dateOfBirth = dobRaw && !isNaN(Date.parse(dobRaw)) ? new Date(dobRaw) : new Date("2018-01-01");
        const admissionTypeRaw = getField(row, "admissiontype", "admission type");
        const admissionType: "Regular" | "Transfer" | "Sibling" | "Scholarship" | "Provisional" =
          /transfer/i.test(admissionTypeRaw) ? "Transfer" :
          /sibling/i.test(admissionTypeRaw) ? "Sibling" :
          /scholar/i.test(admissionTypeRaw) ? "Scholarship" :
          /provis/i.test(admissionTypeRaw) ? "Provisional" : "Regular";
        const feeCategory = getField(row, "feecategory", "fee category", "fee") || "Standard";
        const transportRoute = getField(row, "transportroute", "transport", "route", "busroute");
        const previousSchool = getField(row, "previousschool", "lastschool", "schoolname");

        if (!name) {
          executionErrors.push(`Row ${rowNum}: Skipped — Student Name is required.`);
          skippedCount++;
          continue;
        }

        // Auto-generate student email if omitted or duplicate
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

        // Resolve or create Class section
        const classKey = `${className.trim().toLowerCase()}|${section.trim().toLowerCase()}`;
        let matchedClass = classMap.get(classKey);

        if (!matchedClass) {
          let gradeLevel = 1;
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
            enrolledCount: 0,
            roomNumber: `Room-${100 + Math.floor(Math.random() * 400)}`,
            status: "active",
          });
          classMap.set(classKey, matchedClass);
        }

        // Resolve unique Admission Number
        if (!admissionNumber || existingAdmSet.has(admissionNumber.toLowerCase().trim())) {
          const timestamp = Date.now().toString().slice(-4);
          const rand = Math.floor(10 + Math.random() * 90);
          admissionNumber = `SEN-2026-${timestamp}${rand}`;
        }
        existingAdmSet.add(admissionNumber.toLowerCase().trim());

        // Resolve Roll Number
        if (!rollNumber) {
          const currentCount = (matchedClass.enrolledCount || 0) + (updatedClassCounts.get(String(matchedClass._id)) || 0);
          rollNumber = `${matchedClass.section}-${String(currentCount + 1).padStart(2, "0")}`;
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
          admissionType,
          stream,
          dateOfBirth,
          gender,
          bloodGroup,
          bFormNumber: bFormNumber || undefined,
          address,
          previousSchool: previousSchool || undefined,
          guardian: {
            fatherName,
            fatherCnic: fatherCnic || undefined,
            phone: parentPhone,
            guardianType: "Father",
            emergencyContact,
          },
          transport: transportRoute ? {
            required: !/self|no/i.test(transportRoute),
            route: transportRoute,
          } : undefined,
          feeCategory: feeCategory as any,
          enrollmentDate: new Date(),
          status: "active",
        });

        newUser.profileId = newStudent._id;
        await newUser.save();

        // Accumulate enrolled count for class
        const currentCount = updatedClassCounts.get(String(matchedClass._id)) || 0;
        updatedClassCounts.set(String(matchedClass._id), currentCount + 1);

        importedCount++;
      } catch (rowErr: any) {
        executionErrors.push(`Row ${rowNum}: ${rowErr.message || "Failed to process record"}`);
        skippedCount++;
      }
    }

    // ATOMICALLY UPDATE ENROLLED COUNTS ON ALL AFFECTED CLASSES
    for (const [classIdStr, incCount] of updatedClassCounts.entries()) {
      await Class.findByIdAndUpdate(classIdStr, {
        $inc: { enrolledCount: incCount },
      });
    }

    return apiSuccess(
      {
        importedCount,
        skippedCount,
        errors: executionErrors,
        totalRows: rows.length,
        analysis: analysisReport,
        classesUpdated: updatedClassCounts.size,
      },
      `Bulk enrollment finalized: ${importedCount} students registered successfully across ${updatedClassCounts.size} class sections.`
    );
  } catch (error) {
    return apiError(error);
  }
}
