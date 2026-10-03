import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import connectToDatabase from "@/lib/db/mongodb";
import School from "@/models/School";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

async function seedAuditLogs() {
  await connectToDatabase();
  console.log("🔐 Seeding real institutional audit events into MongoDB...");

  const school = await School.findOne();
  if (!school) {
    console.error("School not found");
    process.exit(1);
  }

  const juniorPrincipal = await User.findOne({ email: "principal.junior@seneca.edu.pk" });
  const seniorPrincipal = await User.findOne({ email: "principal.senior@seneca.edu.pk" });
  const superAdmin = await User.findOne({ email: "superadmin@seneca.edu.pk" });

  const logs = [
    {
      schoolId: school._id,
      userId: juniorPrincipal?._id,
      userEmail: "principal.junior@seneca.edu.pk",
      userRole: "principal",
      action: "ATTENDANCE_COMPLETED",
      resource: "Attendance",
      details: {
        description: "Junior Wing daily classroom attendance verified & archived for Kindergarten and Grade 1",
        wing: "junior",
        status: "completed",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 18),
    },
    {
      schoolId: school._id,
      userId: seniorPrincipal?._id,
      userEmail: "principal.senior@seneca.edu.pk",
      userRole: "principal",
      action: "EXAM_ROSTER_SYNCED",
      resource: "Exam",
      details: {
        description: "Senior Wing examination seating & syllabus matrix verified for Grade 9 & Grade 10 Matric Labs",
        wing: "senior",
        session: "Mid-Term 2026",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 42),
    },
    {
      schoolId: school._id,
      userId: juniorPrincipal?._id,
      userEmail: "principal.junior@seneca.edu.pk",
      userRole: "principal",
      action: "ADMISSION_STATUS_UPDATED",
      resource: "Admission",
      details: {
        description: "Application ADM-2026-1004 approved for Grade 1 enrollment by Early Years Committee",
        applicationNumber: "ADM-2026-1004",
        status: "approved",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      schoolId: school._id,
      userId: seniorPrincipal?._id,
      userEmail: "principal.senior@seneca.edu.pk",
      userRole: "principal",
      action: "FEE_RECOVERY_RECONCILED",
      resource: "Fee",
      details: {
        description: "Senior Wing bank transfer reconciliations approved for October 2026 billing cycle",
        wing: "senior",
        recoveryRate: "89%",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 240),
    },
    {
      schoolId: school._id,
      userId: superAdmin?._id,
      userEmail: "superadmin@seneca.edu.pk",
      userRole: "super_admin",
      action: "SECURITY_CREDENTIALS_ROTATED",
      resource: "User",
      details: {
        description: "Role segregation security policy enforced: Junior Wing (<= Gr 2) and Senior Wing (> Gr 2)",
        actionType: "system_policy",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 360),
    },
  ];

  await AuditLog.deleteMany({});
  await AuditLog.insertMany(logs);

  console.log(`✅ Successfully seeded ${logs.length} real administrative audit logs into MongoDB!`);
  process.exit(0);
}

seedAuditLogs().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
