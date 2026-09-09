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
import { AuthenticationError, AuthorizationError, ValidationError, ConflictError } from "@/lib/utils/errors";
import { validators } from "@/lib/utils/student-validation";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view student records.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = {};
    if (classId && classId !== "all") query.classId = classId;
    if (status && status !== "all") query.status = status;

    const students = await Student.find(query)
      .populate("userId", "name email phone avatarUrl status")
      .populate("classId", "name grade gradeLevel section room capacity")
      .sort({ createdAt: -1 })
      .lean();

    let filtered = students;
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = students.filter((std: any) => {
        const nameMatch = (std.userId?.name || "").toLowerCase().includes(s);
        const emailMatch = (std.userId?.email || "").toLowerCase().includes(s);
        const rollMatch = (std.rollNumber || "").toLowerCase().includes(s);
        const admMatch = (std.admissionNumber || "").toLowerCase().includes(s);
        const fatherMatch = (std.guardian?.fatherName || "").toLowerCase().includes(s);
        const bFormMatch = (std.bFormNumber || "").toLowerCase().includes(s);
        const classMatch = (std.classId?.name || "").toLowerCase().includes(s);
        return nameMatch || emailMatch || rollMatch || admMatch || fatherMatch || bFormMatch || classMatch;
      });
    }

    return apiSuccess(
      {
        count: filtered.length,
        students: filtered.map((std: any) => ({
          id: std._id.toString(),
          name: std.userId?.name || "Student",
          email: std.userId?.email || "",
          phone: std.guardian?.phone || std.userId?.phone || "",
          rollNumber: std.rollNumber,
          admissionNumber: std.admissionNumber,
          admissionType: std.admissionType || "Regular",
          stream: std.stream || "General",
          bFormNumber: std.bFormNumber || "",
          placeOfBirth: std.placeOfBirth || "",
          nationality: std.nationality || "Pakistani",
          religion: std.religion || "Islam",
          motherTongue: std.motherTongue || "Urdu",
          classId: std.classId?._id?.toString() || "",
          className: std.classId ? `${std.classId.name}-${std.classId.section}` : "Unassigned",
          gradeName: std.classId?.name || "",
          gradeLevel: std.classId?.gradeLevel ?? 0,
          section: std.classId?.section || "A",
          gender: std.gender,
          bloodGroup: std.bloodGroup || "N/A",
          dateOfBirth: std.dateOfBirth,
          medicalInfo: std.medicalInfo || { allergies: "", conditions: "", emergencyNotes: "" },
          address: std.address,
          guardian: std.guardian || {},
          previousSchool: std.previousSchool || std.previousSchoolDetails?.schoolName || "",
          previousSchoolDetails: std.previousSchoolDetails || {},
          transport: std.transport || { required: false, route: "", pickupPoint: "" },
          documents: std.documents || {
            bFormSubmitted: false,
            fatherCnicSubmitted: false,
            motherCnicSubmitted: false,
            photosSubmitted: false,
            slcSubmitted: false,
            marksheetSubmitted: false,
            characterCertSubmitted: false,
            medicalReportSubmitted: false,
            verificationStatus: "pending",
            documentFiles: std.documents?.documentFiles || {},
          },
          feeCategory: std.feeCategory || "Standard",
          academicHistory: std.academicHistory || [],
          status: std.status,
          enrollmentDate: std.enrollmentDate,
          createdAt: std.createdAt,
        })),
      },
      "Student records retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can enroll new students.");
    }

    const body = await req.json();
    const {
      name,
      email,
      password,
      admissionType = "Regular",
      className = "Grade 1",
      section = "A",
      classId,
      stream = "General",
      rollNumber,
      admissionNumber: customAdmissionNumber,
      bFormNumber,
      placeOfBirth,
      nationality = "Pakistani",
      religion = "Islam",
      motherTongue = "Urdu",
      gender = "Male",
      dateOfBirth,
      bloodGroup = "O+",
      medicalInfo,
      address = "Karachi, Pakistan",
      fatherName,
      fatherCnic,
      fatherOccupation,
      fatherCompany,
      parentPhone,
      parentEmail,
      motherName,
      motherCnic,
      motherOccupation,
      motherPhone,
      guardianType = "Father",
      emergencyContact,
      emergencyContactName,
      emergencyRelation,
      siblingInSchool = false,
      siblingRollNumber,
      siblingName,
      previousSchool,
      previousSchoolDetails,
      transport,
      documents,
      feeCategory = "Standard",
    } = body;

    // Validate required and formatted fields using regex
    const nameCheck = validators.name(name || "", true, "Student Name");
    if (!nameCheck.isValid) throw new ValidationError(nameCheck.message || "Invalid student name.");

    const emailCheck = validators.email(email || "", true, "Student Portal Email");
    if (!emailCheck.isValid) throw new ValidationError(emailCheck.message || "Invalid portal email address.");

    const passwordCheck = validators.password(password || "");
    if (!passwordCheck.isValid) throw new ValidationError(passwordCheck.message || "Invalid password format.");

    const fatherNameCheck = validators.name(fatherName || "", true, "Father's Full Name");
    if (!fatherNameCheck.isValid) throw new ValidationError(fatherNameCheck.message || "Invalid father name.");

    const phoneCheck = validators.phone(parentPhone || "", true, "Parent Phone Number");
    if (!phoneCheck.isValid) throw new ValidationError(phoneCheck.message || "Invalid parent phone number.");

    if (bFormNumber) {
      const bFormCheck = validators.cnic(bFormNumber, false, "Student B-Form");
      if (!bFormCheck.isValid) throw new ValidationError(bFormCheck.message || "Invalid B-Form number format.");
    }

    if (fatherCnic) {
      const fCnicCheck = validators.cnic(fatherCnic, false, "Father CNIC");
      if (!fCnicCheck.isValid) throw new ValidationError(fCnicCheck.message || "Invalid Father CNIC format.");
    }

    if (motherCnic) {
      const mCnicCheck = validators.cnic(motherCnic, false, "Mother CNIC");
      if (!mCnicCheck.isValid) throw new ValidationError(mCnicCheck.message || "Invalid Mother CNIC format.");
    }

    if (motherPhone) {
      const mPhoneCheck = validators.phone(motherPhone, false, "Mother Phone Number");
      if (!mPhoneCheck.isValid) throw new ValidationError(mPhoneCheck.message || "Invalid mother phone number.");
    }

    if (emergencyContact) {
      const emPhoneCheck = validators.phone(emergencyContact, false, "Emergency Contact");
      if (!emPhoneCheck.isValid) throw new ValidationError(emPhoneCheck.message || "Invalid emergency contact number.");
    }

    if (parentEmail) {
      const pEmailCheck = validators.email(parentEmail, false, "Parent Email");
      if (!pEmailCheck.isValid) throw new ValidationError(pEmailCheck.message || "Invalid parent email format.");
    }

    await connectToDatabase();

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new ConflictError("A user with this portal email address already exists.");
    }

    // 2. Resolve school and academic year
    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    let academicYear =
      (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne({}));

    if (!school || !academicYear) {
      throw new Error("School or academic year record missing.");
    }

    // 3. Resolve target class (find or create class from Playgroup to 2nd Year + Section)
    let targetClassId = classId;
    const targetClassName = className.trim();
    const targetSection = (section || "A").trim().toUpperCase();

    if (!targetClassId || targetClassId === "all" || targetClassId.length !== 24) {
      // Find existing class matching name and section
      let matchedClass = await Class.findOne({
        schoolId: school._id,
        academicYearId: academicYear._id,
        name: targetClassName,
        section: targetSection,
      });

      if (!matchedClass) {
        // Compute numeric grade level (Playgroup to 2nd Year)
        let gradeLevel = 1;
        const low = targetClassName.toLowerCase();
        if (low.includes("playgroup") || low.includes("nursery") || low.includes("prep") || low.includes("kg")) {
          gradeLevel = 0;
        } else if (low.includes("1st year") || low.includes("11th")) {
          gradeLevel = 11;
        } else if (low.includes("2nd year") || low.includes("12th")) {
          gradeLevel = 12;
        } else {
          const numMatch = targetClassName.match(/\d+/);
          if (numMatch) gradeLevel = parseInt(numMatch[0], 10);
        }

        matchedClass = await Class.create({
          schoolId: school._id,
          academicYearId: academicYear._id,
          name: targetClassName,
          gradeLevel,
          section: targetSection,
          stream: stream || "General / Core Curriculum",
          capacity: 35,
          roomNumber: `Room-${targetSection}`,
          status: "active",
        });
      }
      targetClassId = matchedClass._id;
    }

    // 4. Generate Guaranteed Unique Admission ID (SEN-2026-XXXX)
    let admissionNumber = customAdmissionNumber ? customAdmissionNumber.trim().toUpperCase() : "";
    if (!admissionNumber) {
      const studentCount = await Student.countDocuments();
      let candidate = `SEN-${new Date().getFullYear()}-${String(studentCount + 1).padStart(4, "0")}`;
      const exists = await Student.findOne({ admissionNumber: candidate });
      if (exists) {
        candidate = `SEN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      admissionNumber = candidate;
    }

    // 5. Generate Guaranteed Unique Roll Number if not provided
    let finalRollNumber = rollNumber ? rollNumber.trim().toUpperCase() : "";
    if (!finalRollNumber) {
      const countInClass = await Student.countDocuments({ classId: targetClassId });
      const gradePrefix = targetClassName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
      finalRollNumber = `${gradePrefix}-${targetSection}-${String(countInClass + 1).padStart(2, "0")}`;
    }

    // 6. Hash student password
    const passwordHash = await hashPassword(password);

    // 7. Create Student User Account
    const newUser = await User.create({
      schoolId: school._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: parentPhone.trim(),
      passwordHash,
      role: "student",
      status: "active",
      customPermissions: [],
      lastLoginAt: new Date(),
    });

    // 8. Create Comprehensive Student Profile Record
    const newStudent = await Student.create({
      schoolId: school._id,
      userId: newUser._id,
      academicYearId: academicYear._id,
      classId: targetClassId,
      admissionNumber,
      rollNumber: finalRollNumber,
      admissionType,
      stream,
      bFormNumber: bFormNumber ? bFormNumber.trim() : "",
      placeOfBirth: placeOfBirth ? placeOfBirth.trim() : "Karachi",
      nationality: nationality ? nationality.trim() : "Pakistani",
      religion: religion ? religion.trim() : "Islam",
      motherTongue: motherTongue ? motherTongue.trim() : "Urdu",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date("2015-01-01"),
      gender: gender || "Male",
      bloodGroup: bloodGroup || "O+",
      medicalInfo: medicalInfo || {
        allergies: "",
        conditions: "",
        emergencyNotes: "",
      },
      address: address || "Soldier Bazar, Karachi",
      previousSchool: previousSchool ? previousSchool.trim() : (previousSchoolDetails?.schoolName || ""),
      previousSchoolDetails: previousSchoolDetails || {
        schoolName: previousSchool || "",
        lastGrade: "",
        slcNumber: "",
        marksPercentage: "",
      },
      guardian: {
        fatherName: fatherName.trim(),
        fatherCnic: fatherCnic ? fatherCnic.trim() : "",
        fatherOccupation: fatherOccupation ? fatherOccupation.trim() : "",
        fatherCompany: fatherCompany ? fatherCompany.trim() : "",
        phone: parentPhone.trim(),
        email: parentEmail ? parentEmail.toLowerCase().trim() : email.toLowerCase().trim(),
        motherName: motherName ? motherName.trim() : "",
        motherCnic: motherCnic ? motherCnic.trim() : "",
        motherOccupation: motherOccupation ? motherOccupation.trim() : "",
        motherPhone: motherPhone ? motherPhone.trim() : "",
        guardianType: guardianType || "Father",
        emergencyContact: emergencyContact ? emergencyContact.trim() : parentPhone.trim(),
        emergencyContactName: emergencyContactName ? emergencyContactName.trim() : fatherName.trim(),
        emergencyRelation: emergencyRelation ? emergencyRelation.trim() : "Father",
        siblingInSchool: Boolean(siblingInSchool),
        siblingRollNumber: siblingRollNumber ? siblingRollNumber.trim() : "",
        siblingName: siblingName ? siblingName.trim() : "",
      },
      transport: transport || {
        required: false,
        route: "",
        pickupPoint: "",
      },
      documents: documents || {
        bFormSubmitted: false,
        fatherCnicSubmitted: false,
        motherCnicSubmitted: false,
        photosSubmitted: false,
        slcSubmitted: false,
        marksheetSubmitted: false,
        characterCertSubmitted: false,
        medicalReportSubmitted: false,
        verificationStatus: "pending",
      },
      feeCategory: feeCategory || "Standard",
      enrollmentDate: new Date(),
      status: "active",
    });

    return apiSuccess(
      {
        id: newStudent._id.toString(),
        admissionNumber: newStudent.admissionNumber,
        rollNumber: newStudent.rollNumber,
        name: newUser.name,
      },
      "Student successfully enrolled and LMS account created!"
    );
  } catch (error) {
    return apiError(error);
  }
}

