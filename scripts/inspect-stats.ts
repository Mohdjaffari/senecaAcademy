import "dotenv/config";
import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import connectToDatabase from "@/lib/db/mongodb";

async function main() {
  await connectToDatabase();
  console.log("Fetching junior stats...");
  const juniorStats = await getDashboardStats("junior");
  console.log("Junior stats:", JSON.stringify({
    totalStudents: juniorStats.totalStudents,
    totalTeachers: juniorStats.totalTeachers,
    totalClasses: juniorStats.totalClasses,
    totalCapacity: juniorStats.totalCapacity,
    campusOccupancy: juniorStats.campusOccupancy,
    studentTeacherRatio: juniorStats.studentTeacherRatio,
    feeSummary: juniorStats.feeSummary,
    pendingAdmissions: juniorStats.pendingAdmissions,
    totalAdmissions: juniorStats.totalAdmissions,
    todayAttendance: juniorStats.todayAttendance,
    monthlyFeeDataCount: juniorStats.monthlyFeeData.length,
    weeklyAttendanceDataCount: juniorStats.weeklyAttendanceData.length,
    admissionPipelineData: juniorStats.admissionPipelineData,
  }, null, 2));

  console.log("\nFetching senior stats...");
  const seniorStats = await getDashboardStats("senior");
  console.log("Senior stats:", JSON.stringify({
    totalStudents: seniorStats.totalStudents,
    totalTeachers: seniorStats.totalTeachers,
    totalClasses: seniorStats.totalClasses,
    totalCapacity: seniorStats.totalCapacity,
    campusOccupancy: seniorStats.campusOccupancy,
    studentTeacherRatio: seniorStats.studentTeacherRatio,
    feeSummary: seniorStats.feeSummary,
    pendingAdmissions: seniorStats.pendingAdmissions,
    totalAdmissions: seniorStats.totalAdmissions,
    todayAttendance: seniorStats.todayAttendance,
    monthlyFeeDataCount: seniorStats.monthlyFeeData.length,
    weeklyAttendanceDataCount: seniorStats.weeklyAttendanceData.length,
    admissionPipelineData: seniorStats.admissionPipelineData,
  }, null, 2));
  process.exit(0);
}

main().catch(console.error);
