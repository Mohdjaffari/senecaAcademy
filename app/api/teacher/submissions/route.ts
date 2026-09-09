import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Submission from "@/models/Submission";
import Assignment from "@/models/Assignment";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Notification from "@/models/Notification";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, ValidationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    const status = searchParams.get("status");

    const query: any = {};
    if (assignmentId) query.assignmentId = assignmentId;
    if (status && status !== "all") query.status = status;

    const submissions = await Submission.find(query)
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name email phone avatarUrl" },
      })
      .populate("classId", "name section")
      .populate("assignmentId", "title totalMarks dueDate subjectId")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = submissions.map((s: any) => ({
      id: s._id.toString(),
      submissionId: s._id.toString(),
      assignmentId: s.assignmentId?._id?.toString(),
      assignmentTitle: s.assignmentId?.title || "Assignment",
      totalMarks: s.assignmentId?.totalMarks || 100,
      studentId: s.studentId?._id?.toString(),
      studentName: s.studentId?.userId?.name || "Student",
      studentEmail: s.studentId?.userId?.email,
      studentAvatar: s.studentId?.userId?.avatarUrl,
      rollNumber: s.studentId?.rollNumber || "ROLL-001",
      className: s.classId ? `${s.classId.name} (${s.classId.section || "A"})` : "Grade",
      submittedAt: s.submittedAt,
      formattedSubmittedAt: new Date(s.submittedAt).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      content: s.content,
      attachmentName: s.attachmentUrls?.[0]?.name || "Solution_File.pdf",
      attachmentUrl: s.attachmentUrls?.[0]?.url,
      obtainedMarks: s.obtainedMarks,
      feedback: s.feedback,
      status: s.status,
      gradedAt: s.gradedAt,
    }));

    return apiSuccess({ count: formatted.length, submissions: formatted }, "Submissions retrieved.");
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

    await connectToDatabase();
    const body = await req.json();
    const { action, assignmentId, studentId, studentIds, obtainedMarks = 0, feedback, status = "graded" } = body;

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    const teacher = await Teacher.findOne({ userId: session.userId }) || await Teacher.findOne({});

    if (action === "grade_all_unsubmitted_zero" && assignmentId && Array.isArray(studentIds)) {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new NotFoundError("Assignment not found.");

      const ops = studentIds.map((stId: string) => ({
        updateOne: {
          filter: { assignmentId: assignment._id, studentId: stId },
          update: {
            $set: {
              schoolId: school ? school._id : assignment.schoolId,
              classId: assignment.classId,
              submittedAt: new Date(),
              content: "Non-submission recorded by faculty after deadline.",
              attachmentUrls: [],
              obtainedMarks: 0,
              feedback: feedback || "0 marks assigned due to unsubmitted coursework before the due date.",
              status: "graded",
              gradedByTeacherId: teacher?._id,
              gradedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

      if (ops.length > 0) {
        await Submission.bulkWrite(ops as any);
      }

      return apiSuccess({ count: studentIds.length }, `${studentIds.length} unsubmitted students marked with 0 marks.`);
    }

    // Direct Grade/Mark for a single student (creates or updates submission)
    if (assignmentId && studentId) {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new NotFoundError("Assignment not found.");

      const maxMarks = assignment.totalMarks || 100;
      const numMarks = Number(obtainedMarks);
      if (isNaN(numMarks) || numMarks < 0 || numMarks > maxMarks) {
        throw new ValidationError(`Marks must be between 0 and ${maxMarks}.`);
      }

      const submission = await Submission.findOneAndUpdate(
        { assignmentId: assignment._id, studentId },
        {
          $set: {
            schoolId: school ? school._id : assignment.schoolId,
            classId: assignment.classId,
            submittedAt: new Date(),
            content: numMarks === 0 ? "Non-submission recorded by faculty." : "Teacher graded evaluation.",
            obtainedMarks: numMarks,
            feedback: feedback || (numMarks === 0 ? "0 marks awarded for unsubmitted assignment." : "Evaluated by subject teacher."),
            status: status || "graded",
            gradedByTeacherId: teacher?._id,
            gradedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      // Notify student
      const student = await Student.findById(studentId).populate("userId");
      const studentUser = (student as any)?.userId;
      if (studentUser?._id) {
        await Notification.create({
          schoolId: school ? school._id : assignment.schoolId,
          recipientUserId: studentUser._id,
          title: `Assignment Graded: ${assignment.title}`,
          message: `Evaluation published for ${assignment.title}: ${numMarks}/${maxMarks} marks. ${feedback ? `Feedback: "${feedback}"` : ""}`,
          type: "submission",
          actionUrl: "/student/assignments",
          isRead: false,
        });
      }

      return apiSuccess(
        {
          id: submission._id.toString(),
          obtainedMarks: submission.obtainedMarks,
          feedback: submission.feedback,
          status: submission.status,
          gradedAt: submission.gradedAt,
        },
        "Marks and feedback saved successfully."
      );
    }

    throw new ValidationError("Invalid parameters for grading.");
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

    const body = await req.json();
    const { submissionId, obtainedMarks, feedback, status = "graded" } = body;

    if (!submissionId) {
      throw new ValidationError("Submission ID is required.");
    }

    if (obtainedMarks === undefined || obtainedMarks === null || isNaN(Number(obtainedMarks))) {
      throw new ValidationError("Please provide valid obtained marks / score.");
    }

    await connectToDatabase();

    const teacher = await Teacher.findOne({ userId: session.userId });

    const submission = await Submission.findById(submissionId)
      .populate("assignmentId")
      .populate({ path: "studentId", populate: { path: "userId" } });

    if (!submission) {
      throw new NotFoundError("Student submission record not found.");
    }

    const assignment: any = submission.assignmentId;
    const maxMarks = assignment?.totalMarks || 100;
    const numMarks = Number(obtainedMarks);

    if (numMarks < 0 || numMarks > maxMarks) {
      throw new ValidationError(`Obtained marks must be between 0 and ${maxMarks}.`);
    }

    submission.obtainedMarks = numMarks;
    submission.feedback = feedback?.trim() || "Graded by subject faculty.";
    submission.status = status;
    submission.gradedAt = new Date();
    if (teacher) {
      submission.gradedByTeacherId = teacher._id;
    }

    await submission.save();

    // Create Notification for the student
    const studentUser = (submission.studentId as any)?.userId;
    if (studentUser?._id) {
      const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
      await Notification.create({
        schoolId: school ? school._id : submission.schoolId,
        recipientUserId: studentUser._id,
        title: `Assignment Graded: ${assignment?.title || "Coursework"}`,
        message: `Your teacher has evaluated your submission. Score: ${numMarks}/${maxMarks} marks. ${
          feedback ? `Feedback: "${feedback.trim()}"` : ""
        }`,
        type: "submission",
        actionUrl: "/student/assignments",
        isRead: false,
      });
    }

    return apiSuccess(
      {
        id: submission._id.toString(),
        obtainedMarks: submission.obtainedMarks,
        feedback: submission.feedback,
        status: submission.status,
        gradedAt: submission.gradedAt,
      },
      "Student assignment graded and marks published successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}
