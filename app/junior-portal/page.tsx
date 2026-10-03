import { Metadata } from "next";
import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import PrincipalExecutiveDashboard from "@/components/dashboard/PrincipalExecutiveDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Junior Wing Principal Portal (≤ Grade 2) | Seneca Academy",
  description:
    "Executive institutional command portal for Early Childhood Education, Playgroup, Nursery, Kindergarten, Grade 1 and Grade 2.",
};

export default async function JuniorPortalPage() {
  const stats = await getDashboardStats("junior");

  return <PrincipalExecutiveDashboard stats={stats} forcedWing="junior" />;
}
