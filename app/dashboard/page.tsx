import connectToDatabase from "@/lib/db/mongodb";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Class from "@/models/Class";
import Admission from "@/models/Admission";
import Fee from "@/models/Fee";
import Attendance from "@/models/Attendance";
import AuditLog from "@/models/AuditLog";
import PrincipalExecutiveDashboard from "@/components/dashboard/PrincipalExecutiveDashboard";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  try {
    await connectToDatabase();

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingAdmissions,
      totalAdmissions,
      recentAdmissions,
      recentLogs,
      activeClasses,
      feeAggregate,
      admissionStatusAggregate,
      studentCountsPerClass,
      monthlyFeeAggregate,
      recentAttendanceDocs,
    ] = await Promise.all([
      Student.countDocuments({ status: "active" }),
      Teacher.countDocuments({ status: "active" }),
      Class.countDocuments({ status: "active" }),
      Admission.countDocuments({ status: { $in: ["submitted", "under_review", "test_scheduled"] } }),
      Admission.countDocuments({}),
      Admission.find().sort({ createdAt: -1 }).limit(6).lean(),
      AuditLog.find().sort({ createdAt: -1 }).limit(6).lean(),
      Class.find({ status: "active" }).populate("classTeacherId", "name").sort({ gradeLevel: 1, section: 1 }).lean(),
      Fee.aggregate([
        {
          $group: {
            _id: null,
            totalBilled: { $sum: "$totalAmount" },
            totalCollected: { $sum: "$paidAmount" },
            totalOutstanding: { $sum: "$balanceAmount" },
          },
        },
      ]),
      Admission.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Student.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$classId", count: { $sum: 1 } } },
      ]),
      Fee.aggregate([
        {
          $group: {
            _id: "$month",
            billed: { $sum: "$totalAmount" },
            collected: { $sum: "$paidAmount" },
            outstanding: { $sum: "$balanceAmount" },
            createdAt: { $min: "$createdAt" },
          },
        },
        { $sort: { createdAt: 1 } },
        { $limit: 12 },
      ]),
      Attendance.find({})
        .sort({ date: -1 })
        .limit(30)
        .lean(),
    ]);

    // 1. Campus Capacity & Occupancy Matrix
    const totalCapacity = activeClasses.reduce((acc: number, c: any) => acc + (c.capacity || 35), 0);
    const campusOccupancy = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
    const studentTeacherRatio = totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : totalStudents;

    // 2. Financial Summary & Recovery Rate
    const feeSummary = feeAggregate[0] || {
      totalBilled: 0,
      totalCollected: 0,
      totalOutstanding: 0,
    };
    const recoveryRate = feeSummary.totalBilled > 0
      ? Math.round((feeSummary.totalCollected / feeSummary.totalBilled) * 100)
      : 0;

    // 3. Grade Enrollment vs Capacity (Bar Chart)
    const classStudentMap = new Map<string, number>();
    studentCountsPerClass.forEach((item: any) => {
      if (item._id) {
        classStudentMap.set(item._id.toString(), item.count);
      }
    });

    const gradeEnrollmentData = activeClasses.slice(0, 10).map((c: any) => {
      const enrolled = classStudentMap.get(c._id.toString()) || 0;
      const capacity = c.capacity || 35;
      return {
        grade: `${c.name}${c.section ? `-${c.section}` : ""}`,
        enrolled,
        capacity,
        occupancy: capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0,
      };
    });

    // 4. Admission Pipeline Funnel (Donut/Pie Chart)
    const statusColorMap: Record<string, { label: string; color: string }> = {
      submitted: { label: "Submitted", color: "#3b82f6" },
      under_review: { label: "Under Review", color: "#f59e0b" },
      test_scheduled: { label: "Test Scheduled", color: "#8b5cf6" },
      approved: { label: "Approved", color: "#10b981" },
      enrolled: { label: "Enrolled", color: "#810D0B" },
      rejected: { label: "Rejected", color: "#ef4444" },
    };

    const admissionPipelineData = (admissionStatusAggregate || []).map((item: any) => {
      const meta = statusColorMap[item._id] || { label: item._id || "Other", color: "#6b7280" };
      const pct = totalAdmissions > 0 ? Math.round((item.count / totalAdmissions) * 100) : 0;
      return {
        name: meta.label,
        rawStatus: item._id,
        count: item.count,
        value: pct,
        color: meta.color,
      };
    });

    // 5. Monthly Cash Flow Velocity (Area Chart)
    const monthlyFeeData = (monthlyFeeAggregate || []).map((item: any) => ({
      month: item._id || "Current",
      billed: item.billed || 0,
      collected: item.collected || 0,
      outstanding: item.outstanding || 0,
    }));

    // 6. Attendance Analytics (Today and Weekly Curve)
    const attendanceByDate = new Map<string, { total: number; present: number; late: number; dayName: string }>();
    recentAttendanceDocs.forEach((doc: any) => {
      const dateObj = new Date(doc.date);
      const dateKey = dateObj.toISOString().split("T")[0];
      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });

      let current = attendanceByDate.get(dateKey);
      if (!current) {
        current = { total: 0, present: 0, late: 0, dayName };
        attendanceByDate.set(dateKey, current);
      }

      if (Array.isArray(doc.records)) {
        doc.records.forEach((r: any) => {
          current!.total += 1;
          if (r.status === "present") current!.present += 1;
          else if (r.status === "late") current!.late += 1;
        });
      }
    });

    const sortedDates = Array.from(attendanceByDate.keys()).sort().slice(-6);
    const weeklyAttendanceData = sortedDates.map((dKey) => {
      const data = attendanceByDate.get(dKey)!;
      const studentAttendance = data.total > 0
        ? Number((((data.present + data.late) / data.total) * 100).toFixed(1))
        : 0;
      const punctuality = (data.present + data.late) > 0
        ? Number(((data.present / (data.present + data.late)) * 100).toFixed(1))
        : 100;

      return {
        day: data.dayName,
        date: dKey,
        studentAttendance,
        teacherAttendance: 100,
        punctuality,
        present: data.present + data.late,
        total: data.total,
      };
    });

    // Today / Latest Attendance status
    const latestDateKey = sortedDates[sortedDates.length - 1];
    const latestAttendance = latestDateKey ? attendanceByDate.get(latestDateKey) : null;
    const todayAttendance = latestAttendance && latestAttendance.total > 0
      ? {
          percentage: Number((((latestAttendance.present + latestAttendance.late) / latestAttendance.total) * 100).toFixed(1)),
          presentCount: latestAttendance.present + latestAttendance.late,
          totalCount: latestAttendance.total,
          punctuality: latestAttendance.present + latestAttendance.late > 0
            ? Number(((latestAttendance.present / (latestAttendance.present + latestAttendance.late)) * 100).toFixed(1))
            : 100,
          dateString: latestDateKey,
          isRecorded: true,
        }
      : {
          percentage: 0,
          presentCount: 0,
          totalCount: totalStudents,
          punctuality: 0,
          dateString: "Today",
          isRecorded: false,
        };

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalCapacity,
      campusOccupancy,
      studentTeacherRatio,
      pendingAdmissions,
      totalAdmissions,
      recentAdmissions: JSON.parse(JSON.stringify(recentAdmissions)),
      recentLogs: JSON.parse(JSON.stringify(recentLogs)),
      feeSummary: {
        totalBilled: feeSummary.totalBilled || 0,
        totalCollected: feeSummary.totalCollected || 0,
        totalOutstanding: feeSummary.totalOutstanding || 0,
        recoveryRate,
      },
      classesList: JSON.parse(JSON.stringify(activeClasses)),
      gradeEnrollmentData,
      admissionPipelineData,
      monthlyFeeData,
      weeklyAttendanceData,
      todayAttendance,
    };
  } catch (error) {
    console.error("Dashboard stats query error:", error);
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      totalCapacity: 0,
      campusOccupancy: 0,
      studentTeacherRatio: 0,
      pendingAdmissions: 0,
      totalAdmissions: 0,
      recentAdmissions: [],
      recentLogs: [],
      feeSummary: { totalBilled: 0, totalCollected: 0, totalOutstanding: 0, recoveryRate: 0 },
      classesList: [],
      gradeEnrollmentData: [],
      admissionPipelineData: [],
      monthlyFeeData: [],
      weeklyAttendanceData: [],
      todayAttendance: {
        percentage: 0,
        presentCount: 0,
        totalCount: 0,
        punctuality: 0,
        dateString: "Today",
        isRecorded: false,
      },
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return <PrincipalExecutiveDashboard stats={stats} />;
}
