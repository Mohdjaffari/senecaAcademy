import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import connectToDatabase from "@/lib/db/mongodb";
import Class from "@/models/Class";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Subject from "@/models/Subject";
import Fee from "@/models/Fee";
import Attendance from "@/models/Attendance";
import Admission from "@/models/Admission";
import User from "@/models/User";

async function audit() {
  await connectToDatabase();
  console.log("=== SENECA LMS DATABASE AUDIT ===");

  const users = await User.find({ role: { $in: ["super_admin", "principal", "teacher"] } }, "email role campusWing name").lean();
  console.log("\n--- Admins, Principals & Teachers in DB (" + users.length + ") ---");
  users.forEach((u) => console.log(` • [${u.role.toUpperCase()}] [Wing: ${u.campusWing || "all"}] ${u.name} <${u.email}>`));

  const classes = await Class.find().sort({ gradeLevel: 1, name: 1 }).lean();
  console.log("\n--- Classes in DB (" + classes.length + ") ---");
  classes.forEach((c) => console.log(` • ${c.name} (Grade: ${c.gradeLevel}, Section: ${c.section}, Capacity: ${c.capacity})`));

  const subjects = await Subject.find().lean();
  console.log("\n--- Subjects in DB (" + subjects.length + ") ---");
  subjects.forEach((s) => console.log(` • [${s.code}] ${s.name} (${s.department || "General"})`));

  const juniorClasses = classes.filter((c) => c.gradeLevel <= 2);
  const seniorClasses = classes.filter((c) => c.gradeLevel > 2);
  const juniorClassIds = juniorClasses.map((c) => c._id);
  const seniorClassIds = seniorClasses.map((c) => c._id);

  const juniorStudentsCount = await Student.countDocuments({ classId: { $in: juniorClassIds } });
  const seniorStudentsCount = await Student.countDocuments({ classId: { $in: seniorClassIds } });
  console.log("\n--- Students Summary ---");
  console.log(` • Junior Wing Students (<= Grade 2): ${juniorStudentsCount}`);
  console.log(` • Senior Wing Students (> Grade 2): ${seniorStudentsCount}`);

  const juniorFeesCount = await Fee.countDocuments({ classId: { $in: juniorClassIds } });
  const seniorFeesCount = await Fee.countDocuments({ classId: { $in: seniorClassIds } });
  console.log("\n--- Fee Vouchers Summary ---");
  console.log(` • Junior Wing Vouchers: ${juniorFeesCount}`);
  console.log(` • Senior Wing Vouchers: ${seniorFeesCount}`);

  const juniorAttendanceCount = await Attendance.countDocuments({ classId: { $in: juniorClassIds } });
  const seniorAttendanceCount = await Attendance.countDocuments({ classId: { $in: seniorClassIds } });
  console.log("\n--- Attendance Sessions Summary ---");
  console.log(` • Junior Wing Attendance: ${juniorAttendanceCount}`);
  console.log(` • Senior Wing Attendance: ${seniorAttendanceCount}`);

  const admissions = await Admission.find().lean();
  console.log("\n--- Admissions Summary (" + admissions.length + ") ---");
  admissions.forEach((a) => console.log(` • ${a.applicationNumber}: ${a.studentName} applying for ${a.applyingForClass} [${a.status}]`));

  process.exit(0);
}

audit().catch((e) => {
  console.error("Audit error:", e);
  process.exit(1);
});
