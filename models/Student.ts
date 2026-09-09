import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAcademicHistory {
  _id?: mongoose.Types.ObjectId | string;
  fromClassId: mongoose.Types.ObjectId;
  fromClassName: string;
  fromGradeLevel?: number;
  fromSection?: string;
  toClassId: mongoose.Types.ObjectId;
  toClassName: string;
  toGradeLevel?: number;
  toSection?: string;
  academicYearId?: mongoose.Types.ObjectId;
  academicYearName?: string;
  promotionDate: Date;
  status: "promoted" | "transferred" | "retained" | "conditional";
  finalPercentage?: number;
  finalGpa?: number;
  overallGrade?: string;
  remarks?: string;
  promotedByUserId?: mongoose.Types.ObjectId;
  promotedByName?: string;
}

export interface IStudent extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | any;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId | any;
  admissionNumber: string; // e.g. "SEN-2026-0042"
  rollNumber: string; // e.g. "11-A-12"
  admissionType: "Regular" | "Transfer" | "Sibling" | "Scholarship" | "Provisional";
  stream?: string; // e.g. "Pre-Medical", "Pre-Engineering", "Computer Science", "General", "Cambridge O-Level", "Cambridge A-Level", "Commerce"
  bFormNumber?: string; // B-Form / National ID
  placeOfBirth?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "Other";
  bloodGroup?: string;
  medicalInfo?: {
    allergies?: string;
    conditions?: string;
    emergencyNotes?: string;
  };
  address: string;
  previousSchoolDetails?: {
    schoolName?: string;
    lastGrade?: string;
    slcNumber?: string;
    slcDate?: Date;
    board?: string;
    marksPercentage?: string;
  };
  previousSchool?: string;
  guardian: {
    fatherName: string;
    fatherCnic?: string;
    fatherOccupation?: string;
    fatherCompany?: string;
    phone: string;
    email?: string;
    motherName?: string;
    motherCnic?: string;
    motherOccupation?: string;
    motherPhone?: string;
    guardianType?: "Father" | "Mother" | "Legal Guardian" | "Other";
    emergencyContact: string;
    emergencyContactName?: string;
    emergencyRelation?: string;
    siblingInSchool?: boolean;
    siblingRollNumber?: string;
    siblingName?: string;
  };
  transport?: {
    required: boolean;
    route?: string;
    pickupPoint?: string;
  };
  documents?: {
    bFormSubmitted: boolean;
    fatherCnicSubmitted: boolean;
    motherCnicSubmitted: boolean;
    photosSubmitted: boolean;
    slcSubmitted: boolean;
    marksheetSubmitted: boolean;
    characterCertSubmitted: boolean;
    medicalReportSubmitted: boolean;
    verificationStatus: "verified" | "pending" | "incomplete";
    documentFiles?: {
      bFormUrl?: string;
      fatherCnicUrl?: string;
      motherCnicUrl?: string;
      photosUrl?: string;
      slcUrl?: string;
      marksheetUrl?: string;
      characterCertUrl?: string;
      medicalReportUrl?: string;
      [key: string]: string | undefined;
    };
  };
  feeCategory?: "Standard" | "Sibling Discount (20%)" | "Merit Scholarship (50%)" | "Full Scholarship (100%)" | "Need-Based Concession";
  enrollmentDate: Date;
  academicHistory?: IAcademicHistory[];
  status: "active" | "inactive" | "graduated" | "expelled" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const AcademicHistorySchema = new Schema<IAcademicHistory>(
  {
    fromClassId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    fromClassName: { type: String, required: true },
    fromGradeLevel: { type: Number },
    fromSection: { type: String },
    toClassId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    toClassName: { type: String, required: true },
    toGradeLevel: { type: Number },
    toSection: { type: String },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    academicYearName: { type: String },
    promotionDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["promoted", "transferred", "retained", "conditional"],
      default: "promoted",
    },
    finalPercentage: { type: Number },
    finalGpa: { type: Number },
    overallGrade: { type: String },
    remarks: { type: String, trim: true },
    promotedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    promotedByName: { type: String },
  },
  { _id: true, timestamps: true }
);

const StudentSchema = new Schema<IStudent>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    admissionNumber: { type: String, required: true, uppercase: true, trim: true },
    rollNumber: { type: String, required: true, uppercase: true, trim: true },
    admissionType: {
      type: String,
      enum: ["Regular", "Transfer", "Sibling", "Scholarship", "Provisional"],
      default: "Regular",
    },
    stream: { type: String, trim: true, default: "General" },
    bFormNumber: { type: String, trim: true },
    placeOfBirth: { type: String, trim: true },
    nationality: { type: String, trim: true, default: "Pakistani" },
    religion: { type: String, trim: true, default: "Islam" },
    motherTongue: { type: String, trim: true, default: "Urdu" },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    bloodGroup: { type: String, trim: true },
    medicalInfo: {
      allergies: { type: String, trim: true },
      conditions: { type: String, trim: true },
      emergencyNotes: { type: String, trim: true },
    },
    address: { type: String, required: true, trim: true },
    previousSchoolDetails: {
      schoolName: { type: String, trim: true },
      lastGrade: { type: String, trim: true },
      slcNumber: { type: String, trim: true },
      slcDate: { type: Date },
      board: { type: String, trim: true },
      marksPercentage: { type: String, trim: true },
    },
    previousSchool: { type: String, trim: true },
    guardian: {
      fatherName: { type: String, required: true, trim: true },
      fatherCnic: { type: String, trim: true },
      fatherOccupation: { type: String, trim: true },
      fatherCompany: { type: String, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, lowercase: true, trim: true },
      motherName: { type: String, trim: true },
      motherCnic: { type: String, trim: true },
      motherOccupation: { type: String, trim: true },
      motherPhone: { type: String, trim: true },
      guardianType: { type: String, default: "Father" },
      emergencyContact: { type: String, required: true, trim: true },
      emergencyContactName: { type: String, trim: true },
      emergencyRelation: { type: String, trim: true },
      siblingInSchool: { type: Boolean, default: false },
      siblingRollNumber: { type: String, trim: true },
      siblingName: { type: String, trim: true },
    },
    transport: {
      required: { type: Boolean, default: false },
      route: { type: String, trim: true },
      pickupPoint: { type: String, trim: true },
    },
    documents: {
      bFormSubmitted: { type: Boolean, default: false },
      fatherCnicSubmitted: { type: Boolean, default: false },
      motherCnicSubmitted: { type: Boolean, default: false },
      photosSubmitted: { type: Boolean, default: false },
      slcSubmitted: { type: Boolean, default: false },
      marksheetSubmitted: { type: Boolean, default: false },
      characterCertSubmitted: { type: Boolean, default: false },
      medicalReportSubmitted: { type: Boolean, default: false },
      verificationStatus: {
        type: String,
        enum: ["verified", "pending", "incomplete"],
        default: "pending",
      },
      documentFiles: { type: Schema.Types.Mixed, default: {} },
    },
    feeCategory: {
      type: String,
      default: "Standard",
    },
    enrollmentDate: { type: Date, default: Date.now },
    academicHistory: [AcademicHistorySchema],
    status: {
      type: String,
      enum: ["active", "inactive", "graduated", "expelled", "suspended"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

StudentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });
StudentSchema.index({ schoolId: 1, classId: 1, rollNumber: 1 }, { unique: true });

export const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
