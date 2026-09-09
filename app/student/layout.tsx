import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/student");
  }

  if (session.role !== "student" && session.role !== "super_admin") {
    if (session.role === "principal") redirect("/dashboard");
    if (session.role === "teacher") redirect("/teacher");
    redirect("/login");
  }

  let avatarUrl = session.avatarUrl;
  try {
    await connectToDatabase();
    const userDoc = await User.findById(session.userId).select("avatarUrl").lean();
    if (userDoc?.avatarUrl) {
      avatarUrl = userDoc.avatarUrl;
    }
  } catch (_) {}

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-seneca-crimson selection:text-white">
      <DashboardSidebar
        role={session.role}
        userName={session.name}
        userEmail={session.email}
        avatarUrl={avatarUrl}
      />
      <div className="lg:pl-64 flex flex-col flex-1">
        <DashboardTopbar
          userName={session.name}
          userEmail={session.email}
          userRole={session.role}
          avatarUrl={avatarUrl}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
