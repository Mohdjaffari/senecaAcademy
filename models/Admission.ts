import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AdmissionStatus =
  | "submitted"
  | "under_review"
  | "test_scheduled"
  | "approved"
  | "rejected"
  | "enrolled";

export interface IAdmission extends Document {
  schoolId: Types.ObjectId;
  applicantUserId?: Types.ObjectId;
  applicationNumber: string; // e.g. "ADM-2026-0042"
  admissionType: "Regular" | "Transfer" | "Sibling" | "Scholarship" | "Provisional";
  studentName: string;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "Other";
  bloodGroup?: string;
  bFormNumber?: string;
  placeOfBirth?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;
  medicalInfo?: {
    allergies?: string;
    conditions?: string;
    emergencyNotes?: string;
  };
  applyingForClass: string; // "Nursery", "KG-I", "KG-II", "Grade 1" ... "Grade 11"
  preferredSection?: string; // "A", "B", "C", "D"
  stream?: string; // "General", "Pre-Medical", "Pre-Engineering", "Computer Science", "Cambridge O-Level", "Cambridge A-Level", "Commerce"
  previousSchool?: string;
  previousMarksOrGrade?: string;
  slcNumber?: string;
  previousSchoolDetails?: {
    schoolName?: string;
    lastGrade?: string;
    slcNumber?: string;
    slcDate?: Date;
    board?: string;
    marksPercentage?: string;
  };
  fatherName: string;
  fatherCnic?: string;
  fatherOccupation?: string;
  fatherCompany?: string;
  motherName?: string;
  motherCnic?: string;
  motherOccupation?: string;
  motherPhone?: string;
  guardianType?: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyRelation?: string;
  siblingInSchool?: boolean;
  siblingRollNumber?: string;
  siblingName?: string;
  cnic?: string;
  address: string;
  transportRequired?: boolean;
  transportRoute?: string;
  pickupPoint?: string;
  documentsChecklist?: {
    bForm: boolean;
    fatherCnic: boolean;
    motherCnic: boolean;
    photos: boolean;
    slc: boolean;
    marksheet: boolean;
    characterCert: boolean;
    medicalReport?: boolean;
  };
  documentFiles?: Record<string, { fileName?: string; fileSize?: string; fileUrl?: string; fileType?: string } | string>;
  feeCategory?: string;
  photoUrl?: string;
  source?: string;
  notes?: string;
  status: AdmissionStatus;
  convertedStudentId?: Types.ObjectId;
  reviewedByUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    applicantUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    applicationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    admissionType: {
      type: String,
      enum: ["Regular", "Transfer", "Sibling", "Scholarship", "Provisional"],
      default: "Regular",
    },
    studentName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    bloodGroup: { type: String, trim: true, default: "O+" },
    bFormNumber: { type: String, trim: true },
    placeOfBirth: { type: String, trim: true, default: "Karachi" },
    nationality: { type: String, trim: true, default: "Pakistani" },
    religion: { type: String, trim: true, default: "Islam" },
    motherTongue: { type: String, trim: true, default: "Urdu" },
    medicalInfo: {
      allergies: { type: String, trim: true },
      conditions: { type: String, trim: true },
      emergencyNotes: { type: String, trim: true },
    },
    applyingForClass: { type: String, required: true, trim: true },
    preferredSection: { type: String, default: "A", trim: true },
    stream: { type: String, trim: true, default: "General" },
    previousSchool: { type: String, trim: true },
    previousMarksOrGrade: { type: String, trim: true },
    slcNumber: { type: String, trim: true },
    previousSchoolDetails: {
      schoolName: { type: String, trim: true },
      lastGrade: { type: String, trim: true },
      slcNumber: { type: String, trim: true },
      slcDate: { type: Date },
      board: { type: String, trim: true },
      marksPercentage: { type: String, trim: true },
    },
    fatherName: { type: String, required: true, trim: true },
    fatherCnic: { type: String, trim: true },
    fatherOccupation: { type: String, trim: true },
    fatherCompany: { type: String, trim: true },
    motherName: { type: String, trim: true },
    motherCnic: { type: String, trim: true },
    motherOccupation: { type: String, trim: true },
    motherPhone: { type: String, trim: true },
    guardianType: { type: String, default: "Father" },
    parentPhone: { type: String, required: true, trim: true },
    parentEmail: { type: String, required: true, lowercase: true, trim: true },
    emergencyContact: { type: String, trim: true },
    emergencyContactName: { type: String, trim: true },
    emergencyRelation: { type: String, trim: true, default: "Father" },
    siblingInSchool: { type: Boolean, default: false },
    siblingRollNumber: { type: String, trim: true },
    siblingName: { type: String, trim: true },
    cnic: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    transportRequired: { type: Boolean, default: false },
    transportRoute: { type: String, trim: true },
    pickupPoint: { type: String, trim: true },
    documentsChecklist: {
      bForm: { type: Boolean, default: false },
      fatherCnic: { type: Boolean, default: false },
      motherCnic: { type: Boolean, default: false },
      photos: { type: Boolean, default: false },
      slc: { type: Boolean, default: false },
      marksheet: { type: Boolean, default: false },
      characterCert: { type: Boolean, default: false },
      medicalReport: { type: Boolean, default: false },
    },
    documentFiles: { type: Schema.Types.Mixed, default: {} },
    feeCategory: { type: String, default: "Standard" },
    photoUrl: { type: String, trim: true },
    source: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "test_scheduled",
        "approved",
        "rejected",
        "enrolled",
      ],
      default: "submitted",
      index: true,
    },
    convertedStudentId: { type: Schema.Types.ObjectId, ref: "Student" },
    reviewedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Compound indexes for fast querying and filtering
AdmissionSchema.index({ schoolId: 1, status: 1 });
AdmissionSchema.index({ schoolId: 1, applyingForClass: 1 });
AdmissionSchema.index({ schoolId: 1, applicantUserId: 1 });
AdmissionSchema.index({ schoolId: 1, parentEmail: 1 });
AdmissionSchema.index({ schoolId: 1, createdAt: -1 });

export const Admission: Model<IAdmission> =
  mongoose.models.Admission ||
  mongoose.model<IAdmission>("Admission", AdmissionSchema);

export default Admission;
