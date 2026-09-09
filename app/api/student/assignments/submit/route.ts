import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Submission from "@/models/Submission";
import Assignment from "@/models/Assignment";
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
    const { assignmentId, studentId, fileName, fileUrl, content } = body;

    if (!assignmentId) {
      throw new ValidationError("Assignment ID is required.");
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

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new ValidationError("Assignment not found.");
    }

    // STRICT DUE DATE ENFORCEMENT
    const now = new Date();
    if (assignment.status === "closed") {
      throw new ValidationError("This assignment has been closed by the subject teacher. Submissions are not accepted.");
    }

    if (assignment.dueDate && now > new Date(assignment.dueDate)) {
      throw new ValidationError(
        `Submission deadline passed on ${new Date(assignment.dueDate).toLocaleString("en-PK")}. Submissions are strictly closed.`
      );
    }

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));

    const submission = await Submission.findOneAndUpdate(
      {
        assignmentId: assignment._id,
        studentId: targetStudentId,
      },
      {
        schoolId: school ? school._id : assignment.schoolId,
        classId: assignment.classId,
        submittedAt: new Date(),
        content: content || "Homework uploaded by student.",
        attachmentUrls: [
          {
            name: fileName || "homework_submission.pdf",
            url: fileUrl || "/uploads/homework/submission.pdf",
            size: 1024 * 1024 * 2,
          },
        ],
        status: "submitted",
      },
      { upsert: true, new: true }
    );

    return apiSuccess(
      {
        id: submission._id.toString(),
        assignmentId: submission.assignmentId.toString(),
        status: submission.status,
        submittedAt: submission.submittedAt,
      },
      "Assignment submitted successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}
