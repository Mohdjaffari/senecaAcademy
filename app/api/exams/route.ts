import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Exam from "@/models/Exam";
import Result from "@/models/Result";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view exam records.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search");

    const query: any = {};
    if (classId && classId !== "all") query.classId = classId;
    if (status !== "all") query.status = status;

    const exams = await Exam.find(query)
      .populate("classId", "name section gradeLevel stream roomNumber")
      .populate("subjectId", "name code")
      .sort({ examDate: 1 })
      .lean();

    const examIds = exams.map((e) => e._id);
    const results = await Result.aggregate([
      { $match: { examId: { $in: examIds } } },
      {
        $group: {
          _id: "$examId",
          evaluatedCount: { $sum: 1 },
          avgMarks: { $avg: "$obtainedMarks" },
          highestMarks: { $max: "$obtainedMarks" },
          lowestMarks: { $min: "$obtainedMarks" },
        },
      },
    ]);

    const resultMap = new Map<string, { count: number; avg: number; highest: number; lowest: number }>();
    results.forEach((r) => {
      resultMap.set(r._id.toString(), {
        count: r.evaluatedCount,
        avg: Math.round(r.avgMarks || 0),
        highest: r.highestMarks || 0,
        lowest: r.lowestMarks || 0,
      });
    });

    let formatted = exams.map((e: any) => {
      const stats = resultMap.get(e._id.toString()) || { count: 0, avg: 0, highest: 0, lowest: 0 };
      return {
        id: e._id.toString(),
        title: e.title,
        examDate: e.examDate ? new Date(e.examDate).toISOString().split("T")[0] : "",
        formattedDate: e.examDate
          ? new Date(e.examDate).toLocaleDateString("en-PK", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        startTime: e.startTime,
        durationMinutes: e.durationMinutes || 120,
        totalMarks: e.totalMarks || 100,
        passingMarks: e.passingMarks || 40,
        status: e.status || "scheduled",
        classId: e.classId?._id?.toString() || e.classId?.toString() || "",
        className: e.classId ? `${e.classId.name}-${e.classId.section}` : "Class Section",
        gradeLevel: e.classId?.gradeLevel ?? 0,
        stream: e.classId?.stream || "General",
        subjectId: e.subjectId?._id?.toString() || e.subjectId?.toString() || "",
        subjectName: e.subjectId?.name || "Subject",
        subjectCode: e.subjectId?.code || "SUB",
        evaluatedCount: stats.count,
        avgMarks: stats.avg,
        highestMarks: stats.highest,
        lowestMarks: stats.lowest,
      };
    });

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter(
        (e) =>
          e.title.toLowerCase().includes(s) ||
          e.subjectName.toLowerCase().includes(s) ||
          e.className.toLowerCase().includes(s)
      );
    }

    return apiSuccess(
      {
        count: formatted.length,
        exams: formatted,
      },
      "Exams and results retrieved successfully."
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
      throw new AuthorizationError("Only administrators can schedule examinations & datesheets.");
    }

    const body = await req.json();
    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    let academicYear = (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne({}));

    if (!school || !academicYear) {
      throw new Error("School or academic session configuration missing.");
    }

    // Support BATCH Datesheet scheduling (array of papers)
    if (Array.isArray(body.papers) && body.papers.length > 0) {
      const createdExams = [];
      for (const p of body.papers) {
        if (!p.title || !p.classId || !p.subjectId || !p.examDate || !p.startTime) continue;
        const exam = await Exam.create({
          schoolId: school._id,
          academicYearId: academicYear._id,
          classId: p.classId,
          subjectId: p.subjectId,
          title: p.title.trim(),
          examDate: new Date(p.examDate),
          startTime: p.startTime.trim(),
          durationMinutes: Number(p.durationMinutes) || 120,
          totalMarks: Number(p.totalMarks) || 100,
          passingMarks: Number(p.passingMarks) || 40,
          status: "scheduled",
        });
        createdExams.push(exam);
      }

      return apiSuccess(
        { count: createdExams.length, exams: createdExams },
        `Official Datesheet published with ${createdExams.length} examination papers!`
      );
    }

    // Single exam creation
    const { title, classId, subjectId, examDate, startTime, durationMinutes, totalMarks, passingMarks } = body;

    if (!title || !classId || !subjectId || !examDate || !startTime) {
      throw new ValidationError("Missing required exam schedule fields.");
    }

    const newExam = await Exam.create({
      schoolId: school._id,
      academicYearId: academicYear._id,
      classId,
      subjectId,
      title: title.trim(),
      examDate: new Date(examDate),
      startTime: startTime.trim(),
      durationMinutes: Number(durationMinutes) || 120,
      totalMarks: Number(totalMarks) || 100,
      passingMarks: Number(passingMarks) || 40,
      status: "scheduled",
    });

    return apiSuccess(
      { id: newExam._id.toString(), title: newExam.title },
      "Examination scheduled successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can delete examination records.");
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      throw new ValidationError("Exam ID is required.");
    }

    await connectToDatabase();
    await Promise.all([
      Exam.findByIdAndDelete(id),
      Result.deleteMany({ examId: id }),
    ]);

    return apiSuccess({ id }, "Examination paper and associated records removed successfully.");
  } catch (error) {
    return apiError(error);
  }
}
