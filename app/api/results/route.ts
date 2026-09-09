import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import Student from "@/models/Student";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to access examination results.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const examId = searchParams.get("examId");
    const subjectId = searchParams.get("subjectId");
    const search = searchParams.get("search");

    const query: any = {};
    if (classId && classId !== "all") query.classId = classId;
    if (examId && examId !== "all") query.examId = examId;
    if (subjectId && subjectId !== "all") query.subjectId = subjectId;

    const results = await Result.find(query)
      .populate("studentId", "name rollNumber admissionNumber gender")
      .populate("classId", "name section gradeLevel stream")
      .populate("subjectId", "name code")
      .populate("examId", "title examDate startTime totalMarks passingMarks")
      .sort({ percentage: -1, obtainedMarks: -1 })
      .lean();

    let formatted = results.map((r: any, idx: number) => ({
      id: r._id.toString(),
      studentId: r.studentId?._id?.toString() || r.studentId?.toString() || "",
      studentName: r.studentId?.name || "Student",
      rollNumber: r.studentId?.rollNumber || "N/A",
      admissionNumber: r.studentId?.admissionNumber || "N/A",
      gender: r.studentId?.gender || "Other",
      classId: r.classId?._id?.toString() || r.classId?.toString() || "",
      className: r.classId ? `${r.classId.name}-${r.classId.section}` : "Class",
      gradeLevel: r.classId?.gradeLevel ?? 0,
      stream: r.classId?.stream || "General",
      subjectId: r.subjectId?._id?.toString() || r.subjectId?.toString() || "",
      subjectName: r.subjectId?.name || "Subject",
      subjectCode: r.subjectId?.code || "SUB",
      examId: r.examId?._id?.toString() || r.examId?.toString() || "",
      examTitle: r.examId?.title || "Exam Paper",
      examDate: r.examId?.examDate
        ? new Date(r.examId.examDate).toLocaleDateString("en-PK", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "",
      obtainedMarks: r.obtainedMarks ?? 0,
      totalMarks: r.totalMarks ?? 100,
      passingMarks: r.examId?.passingMarks ?? 40,
      percentage: r.percentage ?? Math.round(((r.obtainedMarks ?? 0) / (r.totalMarks ?? 100)) * 100),
      grade: r.grade || "F",
      gpa: r.gpa ?? 0,
      remarks: r.remarks || "",
      isPassed: (r.obtainedMarks ?? 0) >= (r.examId?.passingMarks ?? 40),
      rank: idx + 1,
    }));

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter(
        (r) =>
          r.studentName.toLowerCase().includes(s) ||
          r.rollNumber.toLowerCase().includes(s) ||
          r.admissionNumber.toLowerCase().includes(s) ||
          r.subjectName.toLowerCase().includes(s) ||
          r.className.toLowerCase().includes(s) ||
          r.examTitle.toLowerCase().includes(s)
      );
    }

    // Comprehensive Statistical Breakdown
    const totalEvaluated = formatted.length;
    const passedCount = formatted.filter((r) => r.isPassed).length;
    const failedCount = totalEvaluated - passedCount;
    const passRate = totalEvaluated > 0 ? Math.round((passedCount / totalEvaluated) * 100) : 0;
    const avgPercentage =
      totalEvaluated > 0
        ? Math.round(formatted.reduce((acc, r) => acc + r.percentage, 0) / totalEvaluated)
        : 0;

    const gradesMap: Record<string, number> = { "A+": 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    formatted.forEach((r) => {
      const g = r.grade?.trim().toUpperCase();
      if (gradesMap[g] !== undefined) {
        gradesMap[g]++;
      } else {
        gradesMap["F"]++;
      }
    });

    const highest = formatted.length > 0 ? Math.max(...formatted.map((r) => r.percentage)) : 0;
    const lowest = formatted.length > 0 ? Math.min(...formatted.map((r) => r.percentage)) : 0;

    return apiSuccess(
      {
        count: formatted.length,
        analytics: {
          totalEvaluated,
          passedCount,
          failedCount,
          passRate,
          avgPercentage,
          highestPercentage: highest,
          lowestPercentage: lowest,
          gradeDistribution: gradesMap,
          topRankers: formatted.slice(0, 5),
        },
        results: formatted,
      },
      "Examination results and analytics retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}
