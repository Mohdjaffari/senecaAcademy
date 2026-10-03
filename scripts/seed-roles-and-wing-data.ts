import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db/mongodb";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import User from "@/models/User";
import Principal from "@/models/Principal";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import Fee from "@/models/Fee";
import Attendance from "@/models/Attendance";
import Admission from "@/models/Admission";

async function seedRolesAndWingData() {
  await connectToDatabase();
  console.log("🏫 Connected to MongoDB. Seeding role-based database architecture...");

  // 1. School Root
  let school = await School.findOne({ code: "SENECA-MAIN-001" });
  if (!school) {
    school = await School.findOne();
  }
  if (!school) {
    school = await School.create({
      name: "Seneca Academy",
      code: "SENECA-MAIN-001",
      slug: "seneca-academy",
      address: "Plot 12-B, Block 4, Clifton, Karachi, Pakistan",
      phone: "+92 21 35832101",
      email: "info@seneca.edu.pk",
      websiteUrl: "https://seneca.edu.pk",
      status: "active",
      settings: {
        themeColor: "#810D0B",
        currency: "PKR",
        timezone: "Asia/Karachi",
        gradingSystem: "percentage",
      },
    });
  }

  // 2. Academic Year
  let academicYear = await AcademicYear.findOne({ isCurrent: true });
  if (!academicYear) {
    academicYear = await AcademicYear.create({
      schoolId: school._id,
      name: "Academic Year 2026–2027",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2027-05-31"),
      isCurrent: true,
      status: "active",
    });
  }

  // Common password hashes
  const defaultPasswordHash = await bcrypt.hash("Seneca2026!", 12);
  const juniorPrincipalHash = await bcrypt.hash("JuniorPrincipal2026!", 12);
  const juniorAdminHash = await bcrypt.hash("JuniorAdmin2026!", 12);
  const seniorPrincipalHash = await bcrypt.hash("SeniorPrincipal2026!", 12);
  const seniorAdminHash = await bcrypt.hash("SeniorAdmin2026!", 12);
  const superAdminHash = await bcrypt.hash("SenecaSuperAdmin2026!", 12);
  const centralAdminHash = await bcrypt.hash("SenecaAdmin2026!", 12);

  // 3. Upsert Administrative & Principal Users
  console.log("🔑 Configuring Dedicated Wing Administrators & Principals...");

  // (a) Junior Wing Administrator (<= Grade 2)
  await User.findOneAndUpdate(
    { email: "admin.junior@seneca.edu.pk" },
    {
      schoolId: school._id,
      name: "Junior Wing Administration",
      email: "admin.junior@seneca.edu.pk",
      passwordHash: juniorAdminHash,
      role: "super_admin",
      campusWing: "junior",
      phone: "+92 21 35832102",
      status: "active",
    },
    { upsert: true, new: true }
  );

  // (b) Junior Wing Principal (<= Grade 2)
  const juniorPrincipalUser = await User.findOneAndUpdate(
    { email: "principal.junior@seneca.edu.pk" },
    {
      schoolId: school._id,
      name: "Mrs. Sajida Tariq",
      email: "principal.junior@seneca.edu.pk",
      passwordHash: juniorPrincipalHash,
      role: "principal",
      campusWing: "junior",
      phone: "+92 21 35832103",
      status: "active",
      profileModel: "Principal",
    },
    { upsert: true, new: true }
  );

  const juniorPrincipalProfile = await Principal.findOneAndUpdate(
    { userId: juniorPrincipalUser._id },
    {
      schoolId: school._id,
      userId: juniorPrincipalUser._id,
      qualification: "M.Ed. Early Childhood Development, AMI Diploma",
      experienceYears: 16,
      message: "Fostering creative curiosity, foundational literacy, and emotional well-being for our early learners.",
    },
    { upsert: true, new: true }
  );
  juniorPrincipalUser.profileId = juniorPrincipalProfile._id as any;
  await juniorPrincipalUser.save();

  // (c) Senior Wing Administrator (> Grade 2)
  await User.findOneAndUpdate(
    { email: "admin.senior@seneca.edu.pk" },
    {
      schoolId: school._id,
      name: "Senior Wing Administration",
      email: "admin.senior@seneca.edu.pk",
      passwordHash: seniorAdminHash,
      role: "super_admin",
      campusWing: "senior",
      phone: "+92 21 35832104",
      status: "active",
    },
    { upsert: true, new: true }
  );

  // (d) Senior Wing Principal (> Grade 2)
  const seniorPrincipalUser = await User.findOneAndUpdate(
    { email: "principal.senior@seneca.edu.pk" },
    {
      schoolId: school._id,
      name: "M. Zohaib Ali",
      email: "principal.senior@seneca.edu.pk",
      passwordHash: seniorPrincipalHash,
      role: "principal",
      campusWing: "senior",
      phone: "+92 21 35832105",
      status: "active",
      profileModel: "Principal",
    },
    { upsert: true, new: true }
  );

  const seniorPrincipalProfile = await Principal.findOneAndUpdate(
    { userId: seniorPrincipalUser._id },
    {
      schoolId: school._id,
      userId: seniorPrincipalUser._id,
      qualification: "M.Sc. Educational Leadership, Ph.D.",
      experienceYears: 19,
      message: "Instilling academic rigor, scientific inquiry, and ethical leadership in our senior scholars.",
    },
    { upsert: true, new: true }
  );
  seniorPrincipalUser.profileId = seniorPrincipalProfile._id as any;
  await seniorPrincipalUser.save();

  // (e) Central Super Admin
  await User.findOneAndUpdate(
    { email: "superadmin@seneca.edu.pk" },
    {
      schoolId: school._id,
      name: "Executive Super Admin",
      email: "superadmin@seneca.edu.pk",
      passwordHash: superAdminHash,
      role: "super_admin",
      campusWing: "all",
      status: "active",
    },
    { upsert: true }
  );

  await User.findOneAndUpdate(
    { email: "admin@seneca.edu.pk" },
    {
      schoolId: school._id,
      name: "Central School Administration",
      email: "admin@seneca.edu.pk",
      passwordHash: centralAdminHash,
      role: "super_admin",
      campusWing: "all",
      status: "active",
    },
    { upsert: true }
  );

  // 4. Create and Structure Classes for BOTH Wings
  console.log("🏫 Synchronizing Classes for Junior Wing (≤ Grade 2) & Senior Wing (> Grade 2)...");

  const juniorClassesDef = [
    { name: "Playgroup", gradeLevel: 0, section: "A", capacity: 25, roomNumber: "Montessori Hall 101" },
    { name: "Nursery", gradeLevel: 0, section: "A", capacity: 25, roomNumber: "ECE Room 102" },
    { name: "Kindergarten", gradeLevel: 0, section: "A", capacity: 30, roomNumber: "Kindergarten Studio 103" },
    { name: "Grade 1", gradeLevel: 1, section: "A", capacity: 30, roomNumber: "Primary Wing Room 201" },
    { name: "Grade 2", gradeLevel: 2, section: "A", capacity: 30, roomNumber: "Primary Wing Room 202" },
  ];

  const seniorClassesDef = [
    { name: "Grade 3", gradeLevel: 3, section: "A", capacity: 35, roomNumber: "Academic Block Room 301" },
    { name: "Grade 4", gradeLevel: 4, section: "A", capacity: 35, roomNumber: "Academic Block Room 302" },
    { name: "Grade 5", gradeLevel: 5, section: "A", capacity: 35, roomNumber: "Academic Block Room 303" },
    { name: "Grade 6", gradeLevel: 6, section: "A", capacity: 35, roomNumber: "Middle School Room 401" },
    { name: "Grade 7", gradeLevel: 7, section: "A", capacity: 35, roomNumber: "Middle School Room 402" },
    { name: "Grade 8", gradeLevel: 8, section: "A", capacity: 35, roomNumber: "Senior Wing Room 501" },
    { name: "Grade 9", gradeLevel: 9, section: "A", capacity: 35, roomNumber: "Matric Lab Room 502" },
    { name: "Grade 10", gradeLevel: 10, section: "A", capacity: 35, roomNumber: "Senior Board Room 503" },
  ];

  const juniorClasses: any[] = [];
  for (const c of juniorClassesDef) {
    const cls = await Class.findOneAndUpdate(
      { schoolId: school._id, name: c.name, section: c.section },
      { ...c, schoolId: school._id, academicYearId: academicYear._id, status: "active" },
      { upsert: true, new: true }
    );
    juniorClasses.push(cls);
  }

  const seniorClasses: any[] = [];
  for (const c of seniorClassesDef) {
    const cls = await Class.findOneAndUpdate(
      { schoolId: school._id, name: c.name, section: c.section },
      { ...c, schoolId: school._id, academicYearId: academicYear._id, status: "active" },
      { upsert: true, new: true }
    );
    seniorClasses.push(cls);
  }

  // 5. Academic Subjects for BOTH Wings
  console.log("📚 Setting Up Tailored Subjects for Each Academic Wing...");

  const juniorSubjectsDef = [
    { name: "Early Phonics & English Literacy", code: "ENG-JR01", department: "Languages", creditHours: 4 },
    { name: "Foundation Numeracy & Math", code: "NUM-JR01", department: "Mathematics", creditHours: 4 },
    { name: "Urdu Qaida & Haroof", code: "URD-JR01", department: "Languages", creditHours: 3 },
    { name: "Discovery Science & Nature Lab", code: "SCI-JR01", department: "Science", creditHours: 3 },
    { name: "Islamic Moral Values & Nazra", code: "ISL-JR01", department: "Religious Studies", creditHours: 3 },
    { name: "Creative Arts & Montessori Crafts", code: "ART-JR01", department: "Arts & Crafts", creditHours: 2 },
  ];

  const juniorSubjectDocs: any[] = [];
  for (const s of juniorSubjectsDef) {
    const sub = await Subject.findOneAndUpdate(
      { schoolId: school._id, code: s.code },
      {
        ...s,
        schoolId: school._id,
        classIds: juniorClasses.map((c) => c._id),
      },
      { upsert: true, new: true }
    );
    juniorSubjectDocs.push(sub);
  }

  const seniorSubjectsDef = [
    { name: "Advanced Mathematics", code: "MATH-SR01", department: "Science", creditHours: 4 },
    { name: "General Science & Physics", code: "SCI-SR01", department: "Science", creditHours: 4 },
    { name: "Biological Sciences & Ecology", code: "BIO-SR01", department: "Science", creditHours: 3 },
    { name: "Computer Science & IT", code: "CS-SR01", department: "Technology", creditHours: 4 },
    { name: "English Language & Literature", code: "ENG-SR01", department: "Languages", creditHours: 4 },
    { name: "Urdu Adab & Composition", code: "URD-SR01", department: "Languages", creditHours: 3 },
    { name: "Pakistan Studies & History", code: "PST-SR01", department: "Social Studies", creditHours: 3 },
    { name: "Islamiyat & Ethics", code: "ISL-SR01", department: "Religious Studies", creditHours: 3 },
  ];

  const seniorSubjectDocs: any[] = [];
  for (const s of seniorSubjectsDef) {
    const sub = await Subject.findOneAndUpdate(
      { schoolId: school._id, code: s.code },
      {
        ...s,
        schoolId: school._id,
        classIds: seniorClasses.map((c) => c._id),
      },
      { upsert: true, new: true }
    );
    seniorSubjectDocs.push(sub);
  }

  // 6. Faculty Teachers for Both Wings
  console.log("👩‍🏫 Synchronizing Faculty Mentors for Junior and Senior Wings...");

  const juniorTeachersDef = [
    { name: "Mrs. Sajida Tariq", email: "teacher.sajida@seneca.edu.pk", spec: "Early Childhood & Montessori Lead", qual: "M.Ed. Early Childhood", empId: "TCH-J01", classIdx: 0 },
    { name: "Ms. Hina Alvi", email: "teacher.hina@seneca.edu.pk", spec: "Montessori Directress & Phonics", qual: "AMI Montessori Diploma, B.A.", empId: "TCH-J02", classIdx: 1 },
    { name: "Ms. Rabia Khan", email: "teacher.rabia@seneca.edu.pk", spec: "Kindergarten Numeracy & Arts", qual: "B.Ed. Elementary Education", empId: "TCH-J03", classIdx: 2 },
    { name: "Ms. Zainab Noor", email: "teacher.zainab@seneca.edu.pk", spec: "Primary English & Mathematics", qual: "M.A. English Literature", empId: "TCH-J04", classIdx: 3 },
    { name: "Ms. Sadia Farooq", email: "teacher.sadia@seneca.edu.pk", spec: "Primary Science & Social Studies", qual: "M.Sc. Zoology, B.Ed.", empId: "TCH-J05", classIdx: 4 },
  ];

  for (let i = 0; i < juniorTeachersDef.length; i++) {
    const td = juniorTeachersDef[i];
    const u = await User.findOneAndUpdate(
      { email: td.email },
      {
        schoolId: school._id,
        name: td.name,
        email: td.email,
        passwordHash: defaultPasswordHash,
        role: "teacher",
        campusWing: "junior",
        status: "active",
        profileModel: "Teacher",
      },
      { upsert: true, new: true }
    );

    const targetClass = juniorClasses[td.classIdx];
    const teacher = await Teacher.findOneAndUpdate(
      { userId: u._id },
      {
        schoolId: school._id,
        userId: u._id,
        employeeId: td.empId,
        specialization: td.spec,
        qualification: td.qual,
        experienceYears: 7 + i,
        assignedClassIds: [targetClass._id],
        assignedSubjectIds: juniorSubjectDocs.slice(0, 3).map((s) => s._id),
        salary: 75000 + i * 4000,
        status: "active",
      },
      { upsert: true, new: true }
    );

    u.profileId = teacher._id as any;
    await u.save();

    targetClass.classTeacherId = teacher._id as any;
    await targetClass.save();
  }

  const seniorTeachersDef = [
    { name: "Sir Tariq Mehmood", email: "teacher.math@seneca.edu.pk", spec: "Senior Mathematics", qual: "M.Sc. Mathematics", empId: "TCH-S01", classIdx: 0 },
    { name: "Dr. Ayesha Siddiqui", email: "teacher.science@seneca.edu.pk", spec: "General Science & Chemistry", qual: "Ph.D. Chemistry", empId: "TCH-S02", classIdx: 1 },
    { name: "Sir Kamran Khan", email: "teacher.cs@seneca.edu.pk", spec: "Computer Science & ICT", qual: "MS Computer Science", empId: "TCH-S03", classIdx: 2 },
    { name: "Ms. Fatima Noor", email: "teacher.english@seneca.edu.pk", spec: "English Literature", qual: "M.A. English", empId: "TCH-S04", classIdx: 3 },
    { name: "Sir Bilal Ahmed", email: "teacher.urdu@seneca.edu.pk", spec: "Urdu & Pakistan Studies", qual: "M.A. Urdu", empId: "TCH-S05", classIdx: 4 },
    { name: "Dr. Noman Farooqi", email: "teacher.physics@seneca.edu.pk", spec: "Physics Specialist", qual: "Ph.D. Physics", empId: "TCH-S06", classIdx: 5 },
    { name: "Ms. Bushra Sheikh", email: "teacher.biology@seneca.edu.pk", spec: "Biology Specialist", qual: "M.Phil Biological Sciences", empId: "TCH-S07", classIdx: 6 },
  ];

  for (let i = 0; i < seniorTeachersDef.length; i++) {
    const td = seniorTeachersDef[i];
    const u = await User.findOneAndUpdate(
      { email: td.email },
      {
        schoolId: school._id,
        name: td.name,
        email: td.email,
        passwordHash: defaultPasswordHash,
        role: "teacher",
        campusWing: "senior",
        status: "active",
        profileModel: "Teacher",
      },
      { upsert: true, new: true }
    );

    const targetClass = seniorClasses[td.classIdx % seniorClasses.length];
    const teacher = await Teacher.findOneAndUpdate(
      { userId: u._id },
      {
        schoolId: school._id,
        userId: u._id,
        employeeId: td.empId,
        specialization: td.spec,
        qualification: td.qual,
        experienceYears: 10 + i,
        assignedClassIds: [targetClass._id],
        assignedSubjectIds: seniorSubjectDocs.slice(0, 4).map((s) => s._id),
        salary: 95000 + i * 5000,
        status: "active",
      },
      { upsert: true, new: true }
    );

    u.profileId = teacher._id as any;
    await u.save();

    targetClass.classTeacherId = teacher._id as any;
    await targetClass.save();
  }

  // 7. Seed Senior Students & Vouchers (Grades 3 to 10)
  console.log("🧒 Synchronizing Senior Wing Students (Grades 3 to 10)...");
  const seniorFirstNames = ["Hamza", "Ayaan", "Bilal", "Shahmeer", "Zarrar", "Saad", "Daniyal", "Ali", "Mustafa", "Ibrahim"];
  const seniorLastNames = ["Khan", "Siddiqui", "Qureshi", "Malik", "Rehman", "Abbasi", "Farooqi", "Chishti", "Bukhari", "Ansari"];

  const allSeniorStudents: any[] = [];
  let sCount = 201;

  for (let cIdx = 0; cIdx < seniorClasses.length; cIdx++) {
    const cls = seniorClasses[cIdx];
    for (let sIdx = 0; sIdx < 10; sIdx++) {
      const padNum = String(sCount);
      const fName = seniorFirstNames[sIdx % seniorFirstNames.length];
      const lName = seniorLastNames[(sIdx + cIdx) % seniorLastNames.length];
      const sName = `${fName} ${lName}`;
      const sEmail = `senior.${padNum}@seneca.edu.pk`;

      const u = await User.findOneAndUpdate(
        { email: sEmail },
        {
          schoolId: school._id,
          name: sName,
          email: sEmail,
          passwordHash: defaultPasswordHash,
          role: "student",
          campusWing: "senior",
          status: "active",
        },
        { upsert: true, new: true }
      );

      const rollNumber = `SR-${cls.gradeLevel < 10 ? "0" + cls.gradeLevel : cls.gradeLevel}-${padNum}`;
      const admNumber = `SEN-SR-2026-${padNum}`;

      const student = await Student.findOneAndUpdate(
        { userId: u._id },
        {
          schoolId: school._id,
          userId: u._id,
          academicYearId: academicYear._id,
          classId: cls._id,
          admissionNumber: admNumber,
          rollNumber,
          dateOfBirth: new Date(`201${12 - Math.min(cls.gradeLevel, 8)}-04-12`),
          gender: sIdx % 2 === 0 ? "Male" : "Female",
          bloodGroup: "B+",
          address: `House #${sIdx + 30}, Defence Phase 6, Karachi`,
          guardian: {
            fatherName: `Muhammad ${lName}`,
            motherName: `Mrs. ${lName}`,
            phone: `+92 333 5400${padNum}`,
            email: `parent.senior.${padNum}@gmail.com`,
            emergencyContact: `+92 300 6200${padNum}`,
          },
          status: "active",
        },
        { upsert: true, new: true }
      );

      u.profileId = student._id as any;
      await u.save();

      allSeniorStudents.push(student);
      sCount++;
    }
  }

  // 8. Seed Senior Wing Fee Vouchers (August, September, October 2026)
  console.log("💳 Generating Senior Wing Fee Vouchers...");
  const feeMonths = ["August 2026", "September 2026", "October 2026"];
  for (const s of allSeniorStudents) {
    for (let mIdx = 0; mIdx < feeMonths.length; mIdx++) {
      const monthName = feeMonths[mIdx];
      const voucherNum = `VCH-SR-${monthName.slice(0, 3).toUpperCase()}-${s.admissionNumber.slice(-3)}`;
      const totalAmount = 18500;
      const isPaid = mIdx < 2 || (mIdx === 2 && Math.random() > 0.25);
      const paidAmount = isPaid ? totalAmount : 0;
      const balanceAmount = totalAmount - paidAmount;
      const status = isPaid ? "paid" : "pending";

      await Fee.findOneAndUpdate(
        { voucherNumber: voucherNum },
        {
          schoolId: school._id,
          academicYearId: academicYear._id,
          studentId: s._id,
          classId: s.classId,
          voucherNumber: voucherNum,
          month: monthName,
          tuitionFee: 15500,
          examFee: 2000,
          otherCharges: 1000,
          discount: 0,
          fine: 0,
          totalAmount,
          paidAmount,
          balanceAmount,
          dueDate: new Date("2026-10-15"),
          paymentDate: isPaid ? new Date("2026-10-06") : undefined,
          paymentMethod: isPaid ? "bank_transfer" : undefined,
          status,
        },
        { upsert: true }
      );
    }
  }

  // 9. Seed Senior Attendance (Past 5 school days)
  console.log("📅 Generating Senior Wing Live Attendance Records...");
  const attendanceDates = [
    new Date("2026-09-28"),
    new Date("2026-09-29"),
    new Date("2026-09-30"),
    new Date("2026-10-01"),
    new Date("2026-10-02"),
  ];

  for (const cls of seniorClasses) {
    const classStudents = allSeniorStudents.filter((s) => s.classId.toString() === cls._id.toString());
    for (const aDate of attendanceDates) {
      const records = classStudents.map((s, idx) => ({
        studentId: s._id,
        status: idx === 0 ? "absent" : idx === 1 ? "late" : "present",
        remarks: idx === 0 ? "Medical leave approved" : idx === 1 ? "Late arrival" : "On time",
      }));

      await Attendance.findOneAndUpdate(
        { schoolId: school._id, classId: cls._id, date: aDate },
        {
          schoolId: school._id,
          classId: cls._id,
          academicYearId: academicYear._id,
          date: aDate,
          records,
          totalStudents: classStudents.length,
          presentCount: classStudents.length - 1,
          absentCount: 1,
          lateCount: 1,
          status: "completed",
        },
        { upsert: true }
      );
    }
  }

  console.log("\n=======================================================");
  console.log("✅ ROLE-BASED DATABASE ARCHITECTURE FULLY SYNCHRONIZED!");
  console.log("=======================================================");
  console.log("ADMINS & PRINCIPALS CONFIGURED:");
  console.log(" • Junior Wing Principal: principal.junior@seneca.edu.pk / JuniorPrincipal2026!");
  console.log(" • Junior Wing Admin:     admin.junior@seneca.edu.pk     / JuniorAdmin2026!");
  console.log(" • Senior Wing Principal: principal.senior@seneca.edu.pk / SeniorPrincipal2026!");
  console.log(" • Senior Wing Admin:     admin.senior@seneca.edu.pk     / SeniorAdmin2026!");
  console.log(" • Super Admin (Central): superadmin@seneca.edu.pk       / SenecaSuperAdmin2026!");
  console.log(" • Central Admin:         admin@seneca.edu.pk            / SenecaAdmin2026!");
  console.log("\nACADEMIC DATA BOUNDARIES:");
  console.log(` • Junior Wing Classes: ${juniorClasses.length} (Playgroup to Grade 2)`);
  console.log(` • Junior Wing Subjects: ${juniorSubjectDocs.length}`);
  console.log(` • Junior Wing Faculty: ${juniorTeachersDef.length}`);
  console.log(` • Senior Wing Classes: ${seniorClasses.length} (Grade 3 to Grade 10)`);
  console.log(` • Senior Wing Subjects: ${seniorSubjectDocs.length}`);
  console.log(` • Senior Wing Faculty: ${seniorTeachersDef.length}`);
  console.log(` • Senior Wing Students: ${allSeniorStudents.length}`);
  console.log("=======================================================\n");

  process.exit(0);
}

seedRolesAndWingData().catch((err) => {
  console.error("❌ Seeding Error:", err);
  process.exit(1);
});
