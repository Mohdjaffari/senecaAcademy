import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
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
      throw new AuthenticationError("Please log in to view assignments.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search");

    const query: any = {};
    if (classId && classId !== "all") query.classId = classId;
    if (status !== "all") query.status = status;

    const assignments = await Assignment.find(query)
      .populate("classId", "name section")
      .populate("subjectId", "name code department")
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const assignmentIds = assignments.map((a) => a._id);
    const submissionCounts = await Submission.aggregate([
      { $match: { assignmentId: { $in: assignmentIds } } },
      { $group: { _id: "$assignmentId", count: { $sum: 1 } } },
    ]);

    const subCountMap = new Map<string, number>();
    submissionCounts.forEach((item) => {
      subCountMap.set(item._id.toString(), item.count);
    });

    let formatted = assignments.map((a: any) => ({
      id: a._id.toString(),
      title: a.title,
      description: a.description,
      totalMarks: a.totalMarks,
      dueDate: a.dueDate,
      formattedDueDate: new Date(a.dueDate).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: a.status,
      className: a.classId ? `${a.classId.name}-${a.classId.section}` : "Class Section",
      classId: a.classId?._id?.toString(),
      subjectName: a.subjectId?.name || "General Course",
      subjectCode: a.subjectId?.code || "SUB-101",
      teacherName: a.teacherId?.userId?.name || "Lead Teacher",
      submissionCount: subCountMap.get(a._id.toString()) || 0,
      attachmentCount: a.attachmentUrls?.length || 0,
      createdAt: a.createdAt,
    }));

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter(
        (a) =>
          a.title.toLowerCase().includes(s) ||
          a.subjectName.toLowerCase().includes(s) ||
          a.className.toLowerCase().includes(s) ||
          a.teacherName.toLowerCase().includes(s)
      );
    }

    return apiSuccess(
      {
        count: formatted.length,
        assignments: formatted,
      },
      "Assignments retrieved successfully."
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
    const { title, description, classId, subjectId, totalMarks, dueDate, status } = body;

    if (!title || !classId || !subjectId || !dueDate) {
      throw new ValidationError("Missing required assignment fields.");
    }

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    let teacher = (await Teacher.findOne({})) || null;

    if (!school) {
      throw new Error("School record not found.");
    }

    const newAssignment = await Assignment.create({
      schoolId: school._id,
      classId,
      subjectId,
      teacherId: teacher ? teacher._id : school._id,
      title: title.trim(),
      description: description ? description.trim() : "Complete the following coursework before the due date.",
      totalMarks: Number(totalMarks) || 100,
      dueDate: new Date(dueDate),
      status: status || "published",
      attachmentUrls: [],
    });

    return apiSuccess(
      { id: newAssignment._id.toString(), title: newAssignment.title },
      "Assignment published successfully!"
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
    const { id, title, description, classId, totalMarks, dueDate, status } = body;

    if (!id) {
      throw new ValidationError("Assignment ID is required for editing.");
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      throw new NotFoundError("Assignment not found.");
    }

    if (title) assignment.title = title.trim();
    if (description !== undefined) assignment.description = description.trim();
    if (classId) assignment.classId = classId;
    if (totalMarks !== undefined) assignment.totalMarks = Number(totalMarks);
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (status) assignment.status = status;

    await assignment.save();

    return apiSuccess(
      { id: assignment._id.toString(), title: assignment.title },
      "Assignment updated successfully!"
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
      throw new ValidationError("Assignment ID is required.");
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      throw new NotFoundError("Assignment not found.");
    }

    await Promise.all([
      Assignment.findByIdAndDelete(id),
      Submission.deleteMany({ assignmentId: id }),
    ]);

    return apiSuccess(null, `Assignment "${assignment.title}" and its submissions deleted successfully.`);
  } catch (error) {
    return apiError(error);
  }
}
