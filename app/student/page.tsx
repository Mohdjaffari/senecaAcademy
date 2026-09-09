import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import connectToDatabase from "@/lib/db/mongodb";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Teacher from "@/models/Teacher";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Quiz from "@/models/Quiz";
import QuizAttempt from "@/models/QuizAttempt";
import Fee from "@/models/Fee";
import User from "@/models/User";
import Subject from "@/models/Subject";
import CourseMaterial from "@/models/CourseMaterial";
import Announcement from "@/models/Announcement";
import Exam from "@/models/Exam";
import Result from "@/models/Result";
import Timetable from "@/models/Timetable";
import Attendance from "@/models/Attendance";
import School from "@/models/School";
import StudentLearningDashboard from "@/components/dashboard/StudentLearningDashboard";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/student");
  }
  if (session.role === "user") {
    redirect("/admissions/status");
  }
  if (session.role !== "student" && session.role !== "super_admin") {
    if (session.role === "principal") redirect("/dashboard");
    if (session.role === "teacher") redirect("/teacher");
    redirect("/login");
  }

  await connectToDatabase();

  let studentProfile: any = null;
  let userDoc: any = null;
  let classDoc: any = null;
  let classId: any = null;
  let studentId: any = null;
  let subjectsData: any[] = [];
  let teachersData: any[] = [];
  let assignmentsData: any[] = [];
  let submissionsData: any[] = [];
  let quizzesData: any[] = [];
  let quizAttemptsData: any[] = [];
  let feesData: any[] = [];
  let announcementsData: any[] = [];
  let examsData: any[] = [];
  let resultsData: any[] = [];
  let materialsData: any[] = [];
  let attendanceData: any[] = [];
  let timetableData: any[] = [];
  let schoolBankAccounts: any[] = [];

  try {
    userDoc = await User.findById(session.userId).select("avatarUrl name email phone").lean();
    
    const schoolDoc = (await School.findOne({ status: "active" }).lean()) || (await School.findOne({}).lean());
    if (schoolDoc?.bankAccounts) {
      schoolBankAccounts = schoolDoc.bankAccounts;
    }
    
    // 1. Locate student record matching current logged-in user (or active fallback for super_admin)
    studentProfile = await Student.findOne({ userId: session.userId })
      .populate("classId")
      .lean();

    if (!studentProfile) {
      studentProfile = await Student.findOne({ status: "active" })
        .populate("classId")
        .lean();
    }

    classId = studentProfile?.classId?._id || studentProfile?.classId;
    studentId = studentProfile?._id;

    if (classId) {
      classDoc = await Class.findById(classId)
        .populate({
          path: "classTeacherId",
          populate: { path: "userId", select: "name email phone" },
        })
        .lean();
    }

    // 2. Fetch all Grade/Class-specific database entities
    const [
      rawSubjects,
      rawTeachers,
      rawAssignments,
      rawSubmissions,
      rawQuizzes,
      rawAttempts,
      rawFees,
      rawAnnouncements,
      rawExams,
      rawResults,
      rawMaterials,
      rawAttendance,
      rawTimetable,
    ] = await Promise.all([
      // Only subjects assigned to this student's grade/class
      classId ? Subject.find({ classIds: classId }).lean() : Subject.find({}).limit(8).lean(),
      // Teachers assigned to this grade/class
      classId
        ? Teacher.find({ assignedClassIds: classId })
            .populate("userId", "name email phone avatarUrl")
            .lean()
        : [],
      // Class assignments
      classId
        ? Assignment.find({ classId: classId, status: { $in: ["published", "closed"] } })
            .populate("subjectId", "name code department")
            .populate({ path: "teacherId", populate: { path: "userId", select: "name email" } })
            .sort({ dueDate: 1 })
            .lean()
        : [],
      // Student submissions
      studentId ? Submission.find({ studentId: studentId }).lean() : [],
      // Class quizzes
      classId
        ? Quiz.find({ classId: classId, status: { $in: ["published", "closed"] } })
            .populate("subjectId", "name code department")
            .populate({ path: "teacherId", populate: { path: "userId", select: "name email" } })
            .sort({ startDate: 1 })
            .lean()
        : [],
      // Student quiz attempts
      studentId ? QuizAttempt.find({ studentId: studentId }).lean() : [],
      // Student fee vouchers
      studentId ? Fee.find({ studentId: studentId }).sort({ createdAt: -1 }).lean() : [],
      // Active notices targeted to students
      Announcement.find({
        isPublished: true,
        targetRole: { $in: ["all", "students"] },
      })
        .sort({ publishedAt: -1 })
        .limit(10)
        .lean(),
      // Class exam date sheets
      classId
        ? Exam.find({ classId: classId })
            .populate("subjectId", "name code department")
            .sort({ examDate: 1 })
            .lean()
        : [],
      // Student exam results
      studentId
        ? Result.find({ studentId: studentId })
            .populate("examId", "title examDate")
            .populate("subjectId", "name code department creditHours")
            .sort({ createdAt: -1 })
            .lean()
        : [],
      // Class course materials / handouts
      classId
        ? CourseMaterial.find({ classId: classId, isPublished: true })
            .populate("subjectId", "name code department")
            .populate({ path: "teacherId", populate: { path: "userId", select: "name email" } })
            .sort({ createdAt: -1 })
            .lean()
        : [],
      // Class attendance records for this student
      classId && studentId
        ? Attendance.find({
            classId: classId,
            "records.studentId": studentId,
          })
            .populate("subjectId", "name code")
            .sort({ date: -1 })
            .limit(30)
            .lean()
        : [],
      // Class weekly timetable
      classId
        ? Timetable.find({ classId: classId, status: "active" })
            .populate("subjectId", "name code department")
            .populate({ path: "teacherId", populate: { path: "userId", select: "name email" } })
            .sort({ dayOfWeek: 1, periodNumber: 1 })
            .lean()
        : [],
    ]);

    subjectsData = rawSubjects || [];
    teachersData = rawTeachers || [];
    assignmentsData = rawAssignments || [];
    submissionsData = rawSubmissions || [];
    quizzesData = rawQuizzes || [];
    quizAttemptsData = rawAttempts || [];
    feesData = rawFees || [];
    announcementsData = rawAnnouncements || [];
    examsData = rawExams || [];
    resultsData = rawResults || [];
    materialsData = rawMaterials || [];
    attendanceData = rawAttendance || [];
    timetableData = rawTimetable || [];
  } catch (err) {
    console.error("Error fetching student database records:", err);
  }

  // Calculate Real Attendance Rate from MongoDB Attendance records
  let totalAttendanceDays = 0;
  let presentDays = 0;
  const studentIdStr = studentProfile?._id?.toString();

  attendanceData.forEach((att: any) => {
    const rec = att.records?.find((r: any) => r.studentId?.toString() === studentIdStr);
    if (rec) {
      totalAttendanceDays++;
      if (rec.status === "present" || rec.status === "late") presentDays++;
    }
  });

  const attendanceRate =
    totalAttendanceDays > 0
      ? `${((presentDays / totalAttendanceDays) * 100).toFixed(1)}%`
      : "100%";

  // Calculate Real CGPA and Overall Grade from MongoDB Result documents
  let totalMaxMarks = 0;
  let totalObtMarks = 0;
  resultsData.forEach((res: any) => {
    totalMaxMarks += Number(res.totalMarks) || 100;
    totalObtMarks += Number(res.obtainedMarks) || 0;
  });

  const avgPct = totalMaxMarks > 0 ? (totalObtMarks / totalMaxMarks) * 100 : 0;
  const overallGrade =
    resultsData.length > 0
      ? avgPct >= 90
        ? "A*"
        : avgPct >= 80
        ? "A"
        : avgPct >= 70
        ? "B"
        : avgPct >= 60
        ? "C"
        : avgPct >= 50
        ? "D"
        : "F"
      : "In Progress";

  const termGpa =
    resultsData.length > 0
      ? resultsData.some((r: any) => r.gpa !== undefined && r.gpa !== null)
        ? (
            resultsData.reduce((sum: number, r: any) => sum + (Number(r.gpa) || 0), 0) /
            resultsData.length
          ).toFixed(2)
        : ((avgPct / 100) * 4).toFixed(2)
      : "Term 1";

  // Calculate Real Active Homework count
  const submittedAssignmentIds = new Set(
    submissionsData.map((s: any) => s.assignmentId?.toString())
  );
  const activeHomeworkCount = assignmentsData.filter(
    (a: any) => a.status === "published" && !submittedAssignmentIds.has(a._id?.toString())
  ).length;

  // Calculate Real Available Quizzes count
  const attemptedQuizIds = new Set(
    quizAttemptsData.map((q: any) => q.quizId?.toString())
  );
  const availableQuizzesCount = quizzesData.filter(
    (q: any) => q.status === "published" && !attemptedQuizIds.has(q._id?.toString())
  ).length;

  // Unpaid fee count
  const unpaidFeesCount = feesData.filter(
    (f: any) => f.status === "pending" || f.status === "overdue" || f.status === "partial" || f.status === "unpaid"
  ).length;

  // Map Class Enrolled Subjects with their assigned faculty and real counts
  const mappedSubjects = subjectsData.map((s: any) => {
    const sId = s._id.toString();
    const teacher = teachersData.find((t: any) =>
      t.assignedSubjectIds?.some((asId: any) => asId?.toString() === sId)
    );

    const subPendingAssignments = assignmentsData.filter(
      (a: any) =>
        (a.subjectId?._id?.toString() === sId || a.subjectId?.toString() === sId) &&
        !submittedAssignmentIds.has(a._id?.toString())
    ).length;

    const subActiveQuizzes = quizzesData.filter(
      (q: any) =>
        (q.subjectId?._id?.toString() === sId || q.subjectId?.toString() === sId) &&
        !attemptedQuizIds.has(q._id?.toString())
    ).length;

    const subMaterialsCount = materialsData.filter(
      (m: any) => m.subjectId?._id?.toString() === sId || m.subjectId?.toString() === sId
    ).length;

    return {
      id: sId,
      code: s.code || "SUB-101",
      name: s.name,
      department: s.department || "Academic Faculty",
      creditHours: s.creditHours || 3,
      description: s.description || "",
      teacher: {
        name:
          teacher?.userId?.name ||
          classDoc?.classTeacherId?.userId?.name ||
          "Subject Master",
        title: teacher?.specialization || "Senior Faculty",
        email:
          teacher?.userId?.email ||
          `${s.code?.toLowerCase().replace(/[^a-z0-9]/g, "") || "faculty"}@seneca.edu.pk`,
        initials: (teacher?.userId?.name || s.name || "SF")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      },
      pendingAssignments: subPendingAssignments,
      activeQuizzes: subActiveQuizzes,
      handoutsCount: subMaterialsCount,
    };
  });

  const studentName = userDoc?.name || session.name || "Student User";
  const studentEmail = userDoc?.email || session.email || "student@seneca.edu.pk";
  const admissionNumber = studentProfile?.admissionNumber || "SEN-N/A";
  const rollNumber = studentProfile?.rollNumber || "ROL-00";
  const stream = studentProfile?.stream || classDoc?.stream || "General";
  const feeCategory = studentProfile?.feeCategory || "Standard";
  const className = classDoc?.name
    ? `${classDoc.name} (Section ${classDoc.section || "A"})`
    : studentProfile?.classId?.name
    ? `${studentProfile.classId.name} (${studentProfile.classId.section || "A"})`
    : "Grade Unassigned";

  return (
    <StudentLearningDashboard
      studentId={studentProfile?._id?.toString() || ""}
      classId={classId?.toString() || ""}
      userName={studentName}
      userEmail={studentEmail}
      admissionNumber={admissionNumber}
      rollNumber={rollNumber}
      className={className}
      stream={stream}
      feeCategory={feeCategory}
      stats={{
        activeHomework: activeHomeworkCount,
        availableQuizzes: availableQuizzesCount,
        attendanceRate: attendanceRate,
        unpaidFees: unpaidFeesCount,
        termGpa: termGpa,
        overallGrade: overallGrade,
      }}
      dbSubjects={JSON.parse(JSON.stringify(mappedSubjects))}
      dbAssignments={JSON.parse(JSON.stringify(assignmentsData))}
      dbSubmissions={JSON.parse(JSON.stringify(submissionsData))}
      dbQuizzes={JSON.parse(JSON.stringify(quizzesData))}
      dbQuizAttempts={JSON.parse(JSON.stringify(quizAttemptsData))}
      dbFees={JSON.parse(JSON.stringify(feesData))}
      dbAnnouncements={JSON.parse(JSON.stringify(announcementsData))}
      dbExams={JSON.parse(JSON.stringify(examsData))}
      dbResults={JSON.parse(JSON.stringify(resultsData))}
      dbMaterials={JSON.parse(JSON.stringify(materialsData))}
      dbAttendance={JSON.parse(JSON.stringify(attendanceData))}
      dbTimetable={JSON.parse(JSON.stringify(timetableData))}
      dbBankAccounts={JSON.parse(JSON.stringify(schoolBankAccounts))}
      dbAcademicHistory={JSON.parse(JSON.stringify(studentProfile?.academicHistory || []))}
    />
  );
}
