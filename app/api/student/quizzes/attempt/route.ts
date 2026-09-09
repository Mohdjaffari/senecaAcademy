import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import QuizAttempt from "@/models/QuizAttempt";
import Quiz from "@/models/Quiz";
import Student from "@/models/Student";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, ValidationError } from "@/lib/utils/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    await connectToDatabase();

    const body = await req.json();
    const { quizId, studentId, answers, score, percentage, isPassed } = body;

    if (!quizId) {
      throw new ValidationError("Quiz ID is required.");
    }

    let targetStudentId = studentId;
    if (!targetStudentId) {
      const student = await Student.findOne({ userId: session.userId });
      if (student) targetStudentId = student._id;
    }

    if (!targetStudentId) {
      const student = await Student.findOne({ status: "active" });
      if (student) targetStudentId = student._id;
    }

    if (!targetStudentId) {
      throw new ValidationError("Student profile not found.");
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ValidationError("Quiz not found.");
    }

    // STRICT DUE DATE / END DATE ENFORCEMENT
    const now = new Date();
    if (quiz.status === "closed") {
      throw new ValidationError("This quiz is closed by the instructor. No new attempts are permitted.");
    }

    if (quiz.endDate && now > new Date(quiz.endDate)) {
      throw new ValidationError(
        `This quiz ended on ${new Date(quiz.endDate).toLocaleString("en-PK")}. Submissions are strictly locked.`
      );
    }

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));

    const attempt = await QuizAttempt.findOneAndUpdate(
      {
        quizId: quiz._id,
        studentId: targetStudentId,
      },
      {
        schoolId: school ? school._id : quiz.schoolId,
        classId: quiz.classId,
        answers: answers || [],
        score: score || 0,
        percentage: percentage || 0,
        isPassed: !!isPassed,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return apiSuccess(
      {
        id: attempt._id.toString(),
        score: attempt.score,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
      },
      "Quiz attempt saved successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}
