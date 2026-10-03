import { Metadata } from "next";
import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import PrincipalExecutiveDashboard from "@/components/dashboard/PrincipalExecutiveDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Executive Management Dashboard | Seneca Academy",
  description:
    "Comprehensive dual-campus institutional command and analytics center for Seneca Academy.",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return <PrincipalExecutiveDashboard stats={stats} />;
}
