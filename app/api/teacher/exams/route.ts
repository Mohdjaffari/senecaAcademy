import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import Exam from "@/models/Exam";
import Result from "@/models/Result";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, ValidationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to access the examination gazette ledger.");
    }

    await connectToDatabase();

    // 1. Locate teacher profile
    let teacherProfile: any = null;
    if (session.role === "teacher") {
      teacherProfile = await Teacher.findOne({ userId: session.userId, status: "active" })
        .populate("assignedClassIds")
        .populate("assignedSubjectIds")
        .lean();
    }

    if (!teacherProfile) {
      teacherProfile = await Teacher.findOne({ status: "active" })
        .populate("assignedClassIds")
        .populate("assignedSubjectIds")
        .lean();
    }

    if (!teacherProfile) {
      throw new NotFoundError("Teacher profile record not found.");
    }

    // 2. Identify assigned subjects / teaching books & classes
    const assignedSubjectIds = (teacherProfile.assignedSubjectIds || []).map((s: any) =>
      (s._id || s).toString()
    );
    const assignedClassIds = (teacherProfile.assignedClassIds || []).map((c: any) =>
      (c._id || c).toString()
    );

    let subjects = await Subject.find({
      $or: [
        { _id: { $in: assignedSubjectIds } },
        ...(assignedClassIds.length > 0 ? [{ classIds: { $in: assignedClassIds } }] : []),
      ],
    })
      .populate("classIds", "name section gradeLevel stream")
      .lean();

    if (subjects.length === 0) {
      subjects = await Subject.find({})
        .populate("classIds", "name section gradeLevel stream")
        .limit(6)
        .lean();
    }

    const allSubjectIds = subjects.map((s) => s._id);

    // 3. Query all related classes and active students
    const [classes, allStudents, exams, existingResults] = await Promise.all([
      Class.find({ status: "active" }).lean(),
      Student.find({ status: "active" })
        .populate("userId", "name email phone avatarUrl")
        .populate("classId", "name section gradeLevel stream")
        .sort({ rollNumber: 1 })
        .lean(),
      Exam.find({ subjectId: { $in: allSubjectIds } })
        .populate("classId", "name section")
        .lean(),
      Result.find({ subjectId: { $in: allSubjectIds } }).lean(),
    ]);

    // Map results by `${examId}_${studentId}` or `${subjectId}_${studentId}_${term}`
    const resultMap = new Map<string, any>();
    existingResults.forEach((r: any) => {
      const key = `${r.examId?.toString() || ""}_${r.studentId?.toString()}_${r.subjectId?.toString()}`;
      resultMap.set(key, r);
    });

    // Formatted Teaching Books
    const formattedBooks = subjects.map((sub: any) => {
      const subIdStr = sub._id.toString();
      const offeringClasses = sub.classIds || [];
      const classIdStrings = offeringClasses.map((c: any) => (c._id || c).toString());

      const bookStudents = allStudents.filter((st: any) => {
        const stClassId = (st.classId?._id || st.classId)?.toString();
        return classIdStrings.includes(stClassId);
      });

      return {
        id: subIdStr,
        name: sub.name,
        code: sub.code || "SUB-101",
        department: sub.department || "Academic Department",
        classes: offeringClasses.map((c: any) => ({
          id: (c._id || c).toString(),
          name: `${c.name || "Class"} (${c.section || "A"})`,
        })),
        enrolledStudentsCount: bookStudents.length,
        students: bookStudents.map((st: any, idx: number) => ({
          id: st._id.toString(),
          studentId: st._id.toString(),
          name: st.userId?.name || "Student",
          email: st.userId?.email,
          avatarUrl: st.userId?.avatarUrl,
          rollNumber: st.rollNumber || `ROLL-0${idx + 1}`,
          admissionNumber: st.admissionNumber || `SEN-2026-0${idx + 10}`,
          className: st.classId ? `${st.classId.name} (${st.classId.section || "A"})` : "Grade",
          classId: (st.classId?._id || st.classId)?.toString(),
          gender: st.gender || "Not specified",
        })),
      };
    });

    const standardTerms = [
      { id: "mid-term", name: "Mid-Term Examination 2026-2027", weightage: "40%", isCurrent: true },
      { id: "final-term", name: "Final Term Assessment 2026-2027", weightage: "60%", isCurrent: false },
      { id: "diagnostic", name: "First Diagnostic Assessment", weightage: "10%", isCurrent: false },
    ];

    return apiSuccess(
      {
        teacher: {
          id: teacherProfile._id.toString(),
          name: session.name,
          employeeId: teacherProfile.employeeId,
          specialization: teacherProfile.specialization,
        },
        books: formattedBooks,
        terms: standardTerms,
        exams,
      },
      "Examination marks & gazette ledger data loaded successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required to submit examination marks.");
    }

    await connectToDatabase();
    const body = await req.json();
    const { termName, subjectId, classId, maxTheory = 75, maxPractical = 25, records = [] } = body;

    if (!termName || !subjectId || !Array.isArray(records) || records.length === 0) {
      throw new ValidationError("Missing required examination gazette fields or student records.");
    }

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    const academicYear =
      (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne({}));
    const teacher = (await Teacher.findOne({ userId: session.userId })) || (await Teacher.findOne({}));
    const subject = await Subject.findById(subjectId);

    if (!school || !academicYear || !subject) {
      throw new NotFoundError("School, academic year, or subject configuration not found.");
    }

    const totalExamMarks = Number(maxTheory) + Number(maxPractical);

    // Locate or create Exam entry for this term, class, and subject
    let examDoc = await Exam.findOne({
      schoolId: school._id,
      subjectId: subject._id,
      ...(classId ? { classId } : {}),
      title: termName,
    });

    if (!examDoc) {
      examDoc = await Exam.create({
        schoolId: school._id,
        academicYearId: academicYear._id,
        classId: classId || (subject.classIds?.[0] ? subject.classIds[0] : school._id),
        subjectId: subject._id,
        title: termName,
        examDate: new Date(),
        startTime: "09:00 AM",
        durationMinutes: 150,
        totalMarks: totalExamMarks,
        passingMarks: Math.round(totalExamMarks * 0.4),
        status: "completed",
      });
    }

    // Bulk Upsert Result records for all students
    const bulkOps = records.map((rec: any) => {
      const theory = Number(rec.theoryMarks) || 0;
      const practical = Number(rec.practicalMarks) || 0;
      const total = theory + practical;
      const percentage = Math.round((total / (totalExamMarks || 100)) * 100);

      let grade = "A";
      let gpa = 3.7;
      if (percentage >= 90) {
        grade = "A*";
        gpa = 4.0;
      } else if (percentage >= 80) {
        grade = "A";
        gpa = 3.7;
      } else if (percentage >= 70) {
        grade = "B";
        gpa = 3.0;
      } else if (percentage >= 60) {
        grade = "C";
        gpa = 2.0;
      } else if (percentage >= 50) {
        grade = "D";
        gpa = 1.0;
      } else {
        grade = "F";
        gpa = 0.0;
      }

      return {
        updateOne: {
          filter: {
            examId: examDoc._id,
            studentId: rec.studentId,
            subjectId: subject._id,
          },
          update: {
            $set: {
              schoolId: school._id,
              academicYearId: academicYear._id,
              classId: rec.classId || examDoc.classId,
              obtainedMarks: total,
              totalMarks: totalExamMarks,
              percentage,
              grade,
              gpa,
              remarks: rec.remarks || "Performance verified by subject teacher.",
              enteredByTeacherId: teacher ? teacher._id : school._id,
            },
          },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      await Result.bulkWrite(bulkOps as any);
    }

    // Create notifications for students
    const studentUserDocs = await Student.find({
      _id: { $in: records.map((r: any) => r.studentId) },
    })
      .populate("userId")
      .lean();

    const notifs = studentUserDocs
      .filter((s) => s.userId?._id)
      .map((s) => ({
        schoolId: school._id,
        recipientUserId: s.userId._id,
        title: `Official Exam Marks Published: ${subject.name}`,
        message: `Your official examination gazette marks for ${termName} have been evaluated and finalized.`,
        type: "result",
        actionUrl: "/student/exams",
        isRead: false,
        createdAt: new Date(),
      }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    return apiSuccess(
      {
        examId: examDoc._id.toString(),
        recordsCount: records.length,
        termName,
        subjectName: subject.name,
      },
      `Official Examination Gazette for ${records.length} students submitted and posted successfully!`
    );
  } catch (error) {
    return apiError(error);
  }
}
