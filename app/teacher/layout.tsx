import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Class from "@/models/Class";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardTopbar from "@/components/layout/DashboardTopbar";

export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/teacher");
  }

  if (session.role !== "teacher" && session.role !== "super_admin") {
    if (session.role === "principal") redirect("/dashboard");
    if (session.role === "student") redirect("/student");
    redirect("/login");
  }

  let latestAvatarUrl = session.avatarUrl;
  let isClassTeacher = false;

  try {
    await connectToDatabase();
    const userDoc = await User.findById(session.userId).select("avatarUrl").lean();
    if (userDoc?.avatarUrl) {
      latestAvatarUrl = userDoc.avatarUrl;
    }

    if (session.role === "teacher") {
      let teacherDoc = await Teacher.findOne({ userId: session.userId, status: "active" }).lean();
      if (!teacherDoc) {
        teacherDoc = await Teacher.findOne({ email: session.email, status: "active" }).lean();
      }
      if (teacherDoc) {
        const classesHeaded = await Class.find({
          $or: [
            { classTeacherId: teacherDoc._id },
            { _id: { $in: teacherDoc.headOfClassIds || [] } },
          ],
          status: "active",
        }).lean();
        isClassTeacher = classesHeaded.length > 0;
      }
    } else if (session.role === "super_admin") {
      isClassTeacher = true;
    }
  } catch (_) {}

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-seneca-crimson selection:text-white">
      <DashboardSidebar
        role={session.role}
        userName={session.name}
        userEmail={session.email}
        avatarUrl={latestAvatarUrl}
        isClassTeacher={isClassTeacher}
      />
      <div className="lg:pl-64 flex flex-col flex-1">
        <DashboardTopbar
          userName={session.name}
          userEmail={session.email}
          userRole={session.role}
          avatarUrl={latestAvatarUrl}
        />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

