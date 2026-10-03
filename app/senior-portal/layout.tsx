import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardTopbar from "@/components/layout/DashboardTopbar";

export default async function SeniorPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/senior-portal");
  }

  if (session.role !== "super_admin" && session.role !== "principal") {
    if (session.role === "teacher") redirect("/teacher");
    if (session.role === "student") redirect("/student");
    redirect("/login");
  }

  let latestAvatarUrl = session.avatarUrl;
  try {
    await connectToDatabase();
    const userDoc = await User.findById(session.userId).select("avatarUrl").lean();
    if (userDoc?.avatarUrl) {
      latestAvatarUrl = userDoc.avatarUrl;
    }
  } catch (_) {}

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-seneca-crimson selection:text-white">
      <DashboardSidebar
        role={session.role}
        userName={session.name}
        userEmail={session.email}
        avatarUrl={latestAvatarUrl}
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
