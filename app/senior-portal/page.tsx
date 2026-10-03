import { Metadata } from "next";
import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import PrincipalExecutiveDashboard from "@/components/dashboard/PrincipalExecutiveDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Senior Wing Principal Portal (> Grade 2) | Seneca Academy",
  description:
    "Executive institutional command portal for Middle School, High School, Matriculation, Cambridge O/A-Levels and Intermediate College.",
};

export default async function SeniorPortalPage() {
  const stats = await getDashboardStats("senior");

  return <PrincipalExecutiveDashboard stats={stats} forcedWing="senior" />;
}
