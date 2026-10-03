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

async function seedCompleteSchool() {
  await connectToDatabase();
  console.log("🏫 Connected to MongoDB for Full School Data Sync...");

  // 1. Get or Create School
  let school = await School.findOne({ code: "SENECA-MAIN-001" });
  if (!school) {
    school = await School.findOne();
  }
  if (!school) {
    school = await School.create({
      name: "Seneca Academy",
      code: "SENECA-MAIN-001",
      address: "Plot 12-B, Block 4, Clifton, Karachi, Pakistan",
      phone: "+92 21 35832101",
      email: "info@seneca.edu.pk",
      website: "https://seneca.edu.pk",
      curriculum: ["Federal Board (FBISE)", "Cambridge International (CAIE)"],
      status: "active",
      wings: [
        { name: "Junior Wing", code: "JUNIOR", gradeLevels: [0, 1, 2] },
        { name: "Senior Wing", code: "SENIOR", gradeLevels: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      ],
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

  const defaultPasswordHash = await bcrypt.hash("Seneca2026!", 12);
  const juniorPrincipalHash = await bcrypt.hash("JuniorPrincipal2026!", 12);
  const seniorPrincipalHash = await bcrypt.hash("SeniorPrincipal2026!", 12);

  // 3. Ensure Principals
  await User.findOneAndUpdate(
    { email: "principal.junior@seneca.edu.pk" },
    {
      schoolId: school._id,
      name: "Mrs. Sajida Tariq",
      email: "principal.junior@seneca.edu.pk",
      passwordHash: juniorPrincipalHash,
      role: "principal",
      campusWing: "junior",
      status: "active",
    },
    { upsert: true }
  );

  await User.findOneAndUpdate(
    { email: "principal.senior@seneca.edu.pk" },
    {
      schoolId: school._id,
      name: "M. Zohaib Ali",
      email: "principal.senior@seneca.edu.pk",
      passwordHash: seniorPrincipalHash,
      role: "principal",
      campusWing: "senior",
      status: "active",
    },
    { upsert: true }
  );

  // 4. Create/Upsert Junior Wing Classes (<= Grade 2)
  console.log("🏫 Seeding Junior Wing Classes (Playgroup through Grade 2)...");
  const juniorClassesDef = [
    { name: "Playgroup", gradeLevel: 0, section: "A", capacity: 25, roomNumber: "Montessori Hall 101", stream: "Early Childhood Montessori" },
    { name: "Nursery", gradeLevel: 0, section: "A", capacity: 25, roomNumber: "ECE Room 102", stream: "Early Childhood Foundation" },
    { name: "Kindergarten", gradeLevel: 0, section: "A", capacity: 30, roomNumber: "Kindergarten Studio 103", stream: "Pre-Primary Foundation" },
    { name: "Grade 1", gradeLevel: 1, section: "A", capacity: 30, roomNumber: "Primary Wing Room 201", stream: "Primary Core Curriculum" },
    { name: "Grade 2", gradeLevel: 2, section: "A", capacity: 30, roomNumber: "Primary Wing Room 202", stream: "Primary Core Curriculum" },
  ];

  const juniorClasses: any[] = [];
  for (const c of juniorClassesDef) {
    const cls = await Class.findOneAndUpdate(
      { schoolId: school._id, name: c.name, section: c.section },
      {
        ...c,
        schoolId: school._id,
        academicYearId: academicYear._id,
        status: "active",
      },
      { upsert: true, new: true }
    );
    juniorClasses.push(cls);
  }

  // 5. Create/Upsert Junior Teachers
  console.log("👩‍🏫 Seeding Junior Wing Faculty Mentors...");
  const juniorTeachersDef = [
    { name: "Mrs. Sajida Tariq", email: "teacher.sajida@seneca.edu.pk", spec: "Early Childhood & Montessori Lead", qual: "M.Ed. Early Childhood Education", empId: "TCH-J01", classIdx: 0 },
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

  // 6. Seed Junior Students (10 students per class = 50 students)
  console.log("🧒 Seeding 50 Junior Wing Students...");
  const juniorFirstNames = ["Zayd", "Aila", "Rayyan", "Inaya", "Zaviyar", "Alizeh", "Musa", "Eshaal", "Daniyal", "Anaya"];
  const juniorLastNames = ["Mirza", "Hashmi", "Farooqi", "Siddiqui", "Abbasi", "Bukhari", "Rehman", "Tahir", "Nawaz", "Chishti"];

  const juniorStudents: any[] = [];
  let jCount = 101;

  for (let cIdx = 0; cIdx < juniorClasses.length; cIdx++) {
    const cls = juniorClasses[cIdx];
    for (let sIdx = 0; sIdx < 10; sIdx++) {
      const padNum = String(jCount);
      const fName = juniorFirstNames[sIdx % juniorFirstNames.length];
      const lName = juniorLastNames[(sIdx + cIdx) % juniorLastNames.length];
      const sName = `${fName} ${lName}`;
      const sEmail = `junior.${padNum}@seneca.edu.pk`;

      const u = await User.findOneAndUpdate(
        { email: sEmail },
        {
          schoolId: school._id,
          name: sName,
          email: sEmail,
          passwordHash: defaultPasswordHash,
          role: "student",
          campusWing: "junior",
          status: "active",
        },
        { upsert: true, new: true }
      );

      const rollNumber = `JR-0${cls.gradeLevel}-${padNum}`;
      const admNumber = `SEN-JR-2026-${padNum}`;

      const student = await Student.findOneAndUpdate(
        { userId: u._id },
        {
          schoolId: school._id,
          userId: u._id,
          academicYearId: academicYear._id,
          classId: cls._id,
          admissionNumber: admNumber,
          rollNumber,
          dateOfBirth: new Date(`202${cls.gradeLevel === 0 ? "1-06-15" : cls.gradeLevel === 1 ? "9-04-10" : "8-02-20"}`),
          gender: sIdx % 2 === 0 ? "Male" : "Female",
          bloodGroup: "O+",
          address: `House #${sIdx + 12}, Clifton Block 2, Karachi`,
          guardian: {
            fatherName: `Muhammad ${lName}`,
            motherName: `Mrs. ${lName}`,
            phone: `+92 321 8200${padNum}`,
            email: `parent.junior.${padNum}@gmail.com`,
            emergencyContact: `+92 300 7100${padNum}`,
          },
          status: "active",
        },
        { upsert: true, new: true }
      );

      u.profileId = student._id as any;
      await u.save();

      juniorStudents.push(student);
      jCount++;
    }
  }

  // 7. Seed Junior Fee Vouchers (August, September, October 2026)
  console.log("💳 Seeding Junior Wing Fee Vouchers...");
  const months = ["August 2026", "September 2026", "October 2026"];
  for (const s of juniorStudents) {
    for (let mIdx = 0; mIdx < months.length; mIdx++) {
      const monthName = months[mIdx];
      const voucherNum = `VCH-JR-${monthName.slice(0, 3).toUpperCase()}-${s.admissionNumber.slice(-3)}`;
      const totalAmount = 14500;
      const isPaid = mIdx < 2 || (mIdx === 2 && Math.random() > 0.3);
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
          tuitionFee: 12500,
          examFee: 1500,
          otherCharges: 500,
          discount: 0,
          fine: 0,
          totalAmount,
          paidAmount,
          balanceAmount,
          dueDate: new Date("2026-10-15"),
          paymentDate: isPaid ? new Date("2026-10-05") : undefined,
          paymentMethod: isPaid ? "bank_transfer" : undefined,
          status,
        },
        { upsert: true }
      );
    }
  }

  // 8. Seed Junior Attendance (Past 5 school days)
  console.log("📅 Seeding Junior Classroom Live Attendance...");
  const attendanceDates = [
    new Date("2026-09-28"),
    new Date("2026-09-29"),
    new Date("2026-09-30"),
    new Date("2026-10-01"),
    new Date("2026-10-02"),
  ];

  for (const cls of juniorClasses) {
    const classStudents = juniorStudents.filter((s) => s.classId.toString() === cls._id.toString());
    for (const aDate of attendanceDates) {
      const records = classStudents.map((s, idx) => ({
        studentId: s._id,
        status: idx === 0 ? "absent" : idx === 1 ? "late" : "present",
        remarks: idx === 0 ? "Sick leave notified by parent" : idx === 1 ? "Late by 10 mins" : "On time",
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

  // 9. Seed Admissions for BOTH Junior and Senior Wings
  console.log("📝 Seeding Public Admission Applications across Stages...");
  const admissionsDef = [
    // Junior Wing Applications
    { name: "Zainab Shah", classApplied: "Playgroup", wing: "junior", status: "submitted", type: "Regular", date: "2026-09-20" },
    { name: "Muhammad Ayaan", classApplied: "Nursery", wing: "junior", status: "under_review", type: "Regular", date: "2026-09-22" },
    { name: "Fatima Zahra", classApplied: "Kindergarten", wing: "junior", status: "test_scheduled", type: "Sibling", date: "2026-09-25" },
    { name: "Hamza Bilawal", classApplied: "Grade 1", wing: "junior", status: "approved", type: "Regular", date: "2026-09-27" },
    { name: "Dua Tariq", classApplied: "Grade 2", wing: "junior", status: "enrolled", type: "Transfer", date: "2026-09-28" },
    { name: "Rohail Ahmed", classApplied: "Nursery", wing: "junior", status: "submitted", type: "Regular", date: "2026-10-01" },

    // Senior Wing Applications
    { name: "Shahmeer Khan", classApplied: "Grade 6", wing: "senior", status: "submitted", type: "Regular", date: "2026-09-18" },
    { name: "Areeba Siddiqui", classApplied: "Grade 7", wing: "senior", status: "under_review", type: "Transfer", date: "2026-09-21" },
    { name: "Syed Bilal", classApplied: "Grade 8", wing: "senior", status: "test_scheduled", type: "Regular", date: "2026-09-24" },
    { name: "Mahnoor Malik", classApplied: "Grade 9", wing: "senior", status: "approved", type: "Scholarship", date: "2026-09-26" },
    { name: "Zarrar Haider", classApplied: "Grade 10", wing: "senior", status: "enrolled", type: "Regular", date: "2026-09-29" },
    { name: "Ibrahim Qureshi", classApplied: "Grade 11", wing: "senior", status: "submitted", type: "Regular", date: "2026-10-02" },
  ];

  let admCount = 1001;
  for (const adm of admissionsDef) {
    const appNum = `ADM-2026-${admCount}`;
    await Admission.findOneAndUpdate(
      { applicationNumber: appNum },
      {
        schoolId: school._id,
        applicationNumber: appNum,
        admissionType: adm.type as any,
        studentName: adm.name,
        dateOfBirth: new Date("2018-05-12"),
        gender: admCount % 2 === 0 ? "Female" : "Male",
        bloodGroup: "B+",
        applyingForClass: adm.classApplied,
        preferredSection: "A",
        stream: "General",
        fatherName: `Muhammad ${adm.name.split(" ")[1] || "Khan"}`,
        fatherOccupation: "Executive Professional",
        parentPhone: `+92 300 987${String(admCount).slice(-4)}`,
        parentEmail: `parent.${admCount}@gmail.com`,
        address: "Defence Phase 5, Karachi",
        status: adm.status as any,
        createdAt: new Date(adm.date),
        documentsChecklist: {
          bForm: true,
          fatherCnic: true,
          motherCnic: true,
          photos: true,
          slc: false,
          marksheet: false,
          characterCert: false,
        },
      },
      { upsert: true }
    );
    admCount++;
  }

  console.log("✅ Full School Database Seeding Complete!");
  console.log("- Junior Classes Created: 5 (Playgroup to Grade 2)");
  console.log("- Junior Faculty Mentors: 5 (Assigned)");
  console.log("- Junior Students Seeded: 50 (With full profile and fees)");
  console.log("- Junior Attendance Days: 5 (Recorded)");
  console.log("- Admissions Seeded: 12 (6 Junior, 6 Senior across all statuses)");
  process.exit(0);
}

seedCompleteSchool().catch((err) => {
  console.error("Seeding Error:", err);
  process.exit(1);
});
