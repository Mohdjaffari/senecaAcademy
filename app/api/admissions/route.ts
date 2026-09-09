import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import School from "@/models/School";
import Admission from "@/models/Admission";
import AuditLog from "@/models/AuditLog";
import WebsiteSettings from "@/models/WebsiteSettings";
import { registerStudentPublicSchema } from "@/lib/validations/auth";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view admission applications.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search");

    const query: any = {};
    if (status !== "all") query.status = status;

    const applications = await Admission.find(query)
      .sort({ createdAt: -1 })
      .limit(150)
      .lean();

    let formatted = applications.map((app: any) => ({
      id: app._id.toString(),
      applicantUserId: app.applicantUserId ? app.applicantUserId.toString() : undefined,
      applicationNumber: app.applicationNumber,
      admissionType: app.admissionType || "Regular",
      studentName: app.studentName,
      fatherName: app.fatherName,
      fatherCnic: app.fatherCnic || app.cnic || "",
      fatherOccupation: app.fatherOccupation || "",
      fatherCompany: app.fatherCompany || "",
      motherName: app.motherName || "",
      motherCnic: app.motherCnic || "",
      motherOccupation: app.motherOccupation || "",
      motherPhone: app.motherPhone || "",
      guardianType: app.guardianType || "Father",
      parentEmail: app.parentEmail,
      parentPhone: app.parentPhone,
      emergencyContact: app.emergencyContact || app.parentPhone,
      emergencyContactName: app.emergencyContactName || app.fatherName,
      emergencyRelation: app.emergencyRelation || "Father",
      siblingInSchool: app.siblingInSchool || false,
      siblingRollNumber: app.siblingRollNumber || "",
      siblingName: app.siblingName || "",
      dateOfBirth: app.dateOfBirth,
      gender: app.gender,
      bloodGroup: app.bloodGroup || "O+",
      bFormNumber: app.bFormNumber || "",
      placeOfBirth: app.placeOfBirth || "Karachi",
      nationality: app.nationality || "Pakistani",
      religion: app.religion || "Islam",
      motherTongue: app.motherTongue || "Urdu",
      medicalInfo: app.medicalInfo || { allergies: "", conditions: "", emergencyNotes: "" },
      applyingForClass: app.applyingForClass,
      preferredSection: app.preferredSection || "A",
      stream: app.stream || "General",
      previousSchool: app.previousSchool || "N/A",
      previousMarksOrGrade: app.previousMarksOrGrade || "",
      slcNumber: app.slcNumber || "",
      previousSchoolDetails: app.previousSchoolDetails || {},
      address: app.address,
      transportRequired: app.transportRequired || false,
      transportRoute: app.transportRoute || "",
      pickupPoint: app.pickupPoint || "",
      documentsChecklist: app.documentsChecklist || {
        bForm: false,
        fatherCnic: false,
        motherCnic: false,
        photos: false,
        slc: false,
        marksheet: false,
        characterCert: false,
        medicalReport: false,
      },
      documentFiles: app.documentFiles || {},
      feeCategory: app.feeCategory || "Standard",
      status: app.status,
      createdAt: app.createdAt,
      formattedDate: new Date(app.createdAt).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter(
        (app) =>
          app.applicationNumber.toLowerCase().includes(s) ||
          app.studentName.toLowerCase().includes(s) ||
          app.fatherName.toLowerCase().includes(s) ||
          app.parentPhone.toLowerCase().includes(s) ||
          app.applyingForClass.toLowerCase().includes(s)
      );
    }

    return apiSuccess(
      {
        count: formatted.length,
        admissions: formatted,
      },
      "Admission applications retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please sign in or register to submit an online admission application.");
    }

    const body = await req.json();
    const parseResult = registerStudentPublicSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError("Invalid admission details.", parseResult.error.flatten().fieldErrors);
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("Active school configuration not found.");
    }

    // Check if admissions are currently open
    const websiteSettings = await WebsiteSettings.findOne({ schoolId: school._id }).lean();
    if (websiteSettings && websiteSettings.admissionsOpen === false) {
      const isAdmin = ["super_admin", "principal", "admin"].includes(session.role);
      if (!isAdmin) {
        throw new ValidationError(
          websiteSettings.admissionsClosedNotice ||
            "Admissions for this academic session are currently closed. Please contact the admissions helpdesk."
        );
      }
    }

    const {
      name,
      admissionType = "Regular",
      fatherName,
      fatherCnic,
      fatherOccupation,
      fatherCompany,
      motherName,
      motherCnic,
      motherOccupation,
      motherPhone,
      guardianType,
      dateOfBirth,
      gender,
      bloodGroup,
      bFormNumber,
      placeOfBirth,
      nationality,
      religion,
      motherTongue,
      medicalInfo,
      applyingForClass,
      preferredSection,
      stream,
      previousSchool,
      previousMarksOrGrade,
      slcNumber,
      previousSchoolDetails,
      parentPhone,
      parentEmail,
      emergencyContact,
      emergencyContactName,
      emergencyRelation,
      siblingInSchool,
      siblingRollNumber,
      siblingName,
      cnic,
      address,
      transportRequired,
      transportRoute,
      pickupPoint,
      documentsChecklist,
      documentFiles,
      feeCategory,
    } = parseResult.data;

    // Check for existing active application to prevent duplicate submissions
    const cleanBForm = (bFormNumber || "").trim();
    const duplicateQuery: any = {
      schoolId: school._id,
      status: { $nin: ["rejected"] },
      $or: [
        { applicantUserId: session.userId },
        { parentEmail: (parentEmail || session.email).toLowerCase().trim() },
      ],
    };

    if (cleanBForm) {
      duplicateQuery.$or.push({ bFormNumber: cleanBForm });
    }

    const existingApplication = await Admission.findOne(duplicateQuery);
    if (existingApplication) {
      throw new ValidationError(
        `You have already submitted an active admission application (${existingApplication.applicationNumber}) for candidate ${existingApplication.studentName}. Applicants are limited to one active application. Please track your application status or contact the Admissions Helpdesk for revisions.`
      );
    }

    // Generate unique application number e.g. ADM-2026-9812
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationNumber = `ADM-2026-${randomSuffix}`;

    const admission = await Admission.create({
      schoolId: school._id,
      applicantUserId: session.userId,
      applicationNumber,
      admissionType: admissionType || "Regular",
      studentName: name,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      bloodGroup: bloodGroup || "O+",
      bFormNumber: bFormNumber || "",
      placeOfBirth: placeOfBirth || "Karachi",
      nationality: nationality || "Pakistani",
      religion: religion || "Islam",
      motherTongue: motherTongue || "Urdu",
      medicalInfo: medicalInfo || {
        allergies: "",
        conditions: "",
        emergencyNotes: "",
      },
      applyingForClass,
      preferredSection: preferredSection || "A",
      stream: stream || "General",
      previousSchool: previousSchool || "",
      previousMarksOrGrade: previousMarksOrGrade || "",
      slcNumber: slcNumber || "",
      previousSchoolDetails: previousSchoolDetails || {
        schoolName: previousSchool || "",
        lastGrade: "",
        slcNumber: slcNumber || "",
        board: "",
        marksPercentage: previousMarksOrGrade || "",
      },
      fatherName,
      fatherCnic: fatherCnic || cnic || "",
      fatherOccupation: fatherOccupation || "",
      fatherCompany: fatherCompany || "",
      motherName: motherName || "",
      motherCnic: motherCnic || "",
      motherOccupation: motherOccupation || "",
      motherPhone: motherPhone || "",
      guardianType: guardianType || "Father",
      parentPhone,
      parentEmail: (parentEmail || session.email).toLowerCase().trim(),
      emergencyContact: emergencyContact || parentPhone,
      emergencyContactName: emergencyContactName || fatherName,
      emergencyRelation: emergencyRelation || "Father",
      siblingInSchool: Boolean(siblingInSchool),
      siblingRollNumber: siblingRollNumber || "",
      siblingName: siblingName || "",
      cnic: cnic || fatherCnic || "",
      address,
      transportRequired: Boolean(transportRequired),
      transportRoute: transportRoute || "",
      pickupPoint: pickupPoint || "",
      documentsChecklist: documentsChecklist || {
        bForm: false,
        fatherCnic: false,
        motherCnic: false,
        photos: false,
        slc: false,
        marksheet: false,
        characterCert: false,
        medicalReport: false,
      },
      documentFiles: documentFiles || {},
      feeCategory: feeCategory || "Standard",
      status: "submitted",
    });

    // Log public admission submission in audit logs
    await AuditLog.create({
      schoolId: school._id,
      userId: session.userId,
      action: "PUBLIC_ADMISSION_SUBMITTED",
      resource: "Admission",
      resourceId: admission._id.toString(),
      details: {
        applicationNumber,
        studentName: name,
        applyingForClass,
        preferredSection,
        applicantUserId: session.userId,
      },
    });

    return apiSuccess(
      {
        applicationNumber,
        studentName: name,
        applyingForClass,
        preferredSection,
        status: "submitted",
        createdAt: admission.createdAt,
      },
      "Admission application submitted successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

