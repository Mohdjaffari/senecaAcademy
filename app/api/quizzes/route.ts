import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Quiz from "@/models/Quiz";
import QuizAttempt from "@/models/QuizAttempt";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import Teacher from "@/models/Teacher";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view quizzes.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search");

    const query: any = {};
    if (classId && classId !== "all") query.classId = classId;
    if (status !== "all") query.status = status;

    const quizzes = await Quiz.find(query)
      .populate("classId", "name section")
      .populate("subjectId", "name code")
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const quizIds = quizzes.map((q) => q._id);
    const attempts = await QuizAttempt.aggregate([
      { $match: { quizId: { $in: quizIds } } },
      {
        $group: {
          _id: "$quizId",
          attemptCount: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },
    ]);

    const attemptMap = new Map<string, { count: number; avg: number }>();
    attempts.forEach((item) => {
      attemptMap.set(item._id.toString(), {
        count: item.attemptCount,
        avg: Math.round(item.avgScore || 0),
      });
    });

    let formatted = quizzes.map((q: any) => {
      const stats = attemptMap.get(q._id.toString()) || { count: 0, avg: 0 };
      return {
        id: q._id.toString(),
        title: q.title,
        description: q.description || "Interactive quiz assessment.",
        durationMinutes: q.durationMinutes,
        totalMarks: q.totalMarks,
        passingMarks: q.passingMarks,
        questionCount: q.questions?.length || 0,
        questions: q.questions || [],
        status: q.status,
        className: q.classId ? `${q.classId.name}-${q.classId.section}` : "Class Section",
        classId: q.classId?._id?.toString(),
        subjectName: q.subjectId?.name || "Subject",
        teacherName: q.teacherId?.userId?.name || "Faculty Mentor",
        attemptCount: stats.count,
        avgScore: stats.avg,
        startDate: q.startDate,
        endDate: q.endDate,
        formattedDate: new Date(q.createdAt).toLocaleDateString("en-PK", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    });

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter(
        (q) =>
          q.title.toLowerCase().includes(s) ||
          q.subjectName.toLowerCase().includes(s) ||
          q.className.toLowerCase().includes(s)
      );
    }

    return apiSuccess(
      {
        count: formatted.length,
        quizzes: formatted,
      },
      "Quizzes retrieved successfully."
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

    const body = await req.json();
    const { title, description, classId, subjectId, durationMinutes, totalMarks, passingMarks, questions, startDate, endDate } = body;

    if (!title || !classId || !subjectId) {
      throw new ValidationError("Missing required quiz fields.");
    }

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    let teacher = (await Teacher.findOne({})) || null;

    if (!school) {
      throw new Error("School record missing.");
    }

    const defaultQuestions = Array.isArray(questions) && questions.length > 0
      ? questions
      : [
          {
            question: "What is the primary fundamental SI unit of temperature?",
            type: "multiple_choice",
            options: ["Celsius", "Fahrenheit", "Kelvin", "Rankine"],
            correctAnswer: 2,
            marks: 2,
          },
          {
            question: "Light travels faster in a vacuum than in glass.",
            type: "true_false",
            options: ["True", "False"],
            correctAnswer: 0,
            marks: 2,
          },
        ];

    const newQuiz = await Quiz.create({
      schoolId: school._id,
      classId,
      subjectId,
      teacherId: teacher ? teacher._id : school._id,
      title: title.trim(),
      description: description ? description.trim() : "Interactive online test.",
      durationMinutes: Number(durationMinutes) || 15,
      totalMarks: Number(totalMarks) || 10,
      passingMarks: Number(passingMarks) || 5,
      questions: defaultQuestions,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "published",
    });

    return apiSuccess(
      { id: newQuiz._id.toString(), title: newQuiz.title },
      "Quiz published successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    await connectToDatabase();
    const body = await req.json();
    const { id, title, description, classId, durationMinutes, totalMarks, passingMarks, questions, startDate, endDate, status } = body;

    if (!id) {
      throw new ValidationError("Quiz ID is required for editing.");
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new NotFoundError("Quiz not found.");
    }

    if (title) quiz.title = title.trim();
    if (description !== undefined) quiz.description = description.trim();
    if (classId) quiz.classId = classId;
    if (durationMinutes !== undefined) quiz.durationMinutes = Number(durationMinutes);
    if (totalMarks !== undefined) quiz.totalMarks = Number(totalMarks);
    if (passingMarks !== undefined) quiz.passingMarks = Number(passingMarks);
    if (Array.isArray(questions)) quiz.questions = questions;
    if (startDate) quiz.startDate = new Date(startDate);
    if (endDate) quiz.endDate = new Date(endDate);
    if (status) quiz.status = status;

    await quiz.save();

    return apiSuccess(
      { id: quiz._id.toString(), title: quiz.title },
      "Quiz updated successfully!"
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

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new ValidationError("Quiz ID is required.");
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new NotFoundError("Quiz not found.");
    }

    await Promise.all([
      Quiz.findByIdAndDelete(id),
      QuizAttempt.deleteMany({ quizId: id }),
    ]);

    return apiSuccess(null, `Quiz "${quiz.title}" and its attempts deleted successfully.`);
  } catch (error) {
    return apiError(error);
  }
}
