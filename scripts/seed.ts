import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import mongoose from "mongoose";
import { hashPassword } from "../lib/auth/password";
import School from "../models/School";
import AcademicYear from "../models/AcademicYear";
import User from "../models/User";
import Principal from "../models/Principal";
import Teacher from "../models/Teacher";
import Class from "../models/Class";
import Subject from "../models/Subject";
import Student from "../models/Student";
import Attendance from "../models/Attendance";
import Assignment from "../models/Assignment";
import Quiz from "../models/Quiz";
import Exam from "../models/Exam";
import Result from "../models/Result";
import Fee from "../models/Fee";
import Admission from "../models/Admission";
import Announcement from "../models/Announcement";
import Blog from "../models/Blog";
import Gallery from "../models/Gallery";
import WebsiteSettings from "../models/WebsiteSettings";
import AdmissionsPage from "../models/AdmissionsPage";
import AuditLog from "../models/AuditLog";
import { DEFAULT_ADMISSIONS_PAGE_DATA } from "../lib/db/admissions-page-defaults";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/seneca_school_lms";

async function seed() {
  console.log("🌱 Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected. Preparing to seed Seneca Academy...");

  // Clear existing collections safely
  console.log("🧹 Clearing collections...");
  await Promise.all([
    School.deleteMany({}),
    AcademicYear.deleteMany({}),
    User.deleteMany({}),
    Principal.deleteMany({}),
    Teacher.deleteMany({}),
    Class.deleteMany({}),
    Subject.deleteMany({}),
    Student.deleteMany({}),
    Attendance.deleteMany({}),
    Assignment.deleteMany({}),
    Quiz.deleteMany({}),
    Exam.deleteMany({}),
    Result.deleteMany({}),
    Fee.deleteMany({}),
    Admission.deleteMany({}),
    Announcement.deleteMany({}),
    Blog.deleteMany({}),
    Gallery.deleteMany({}),
    WebsiteSettings.deleteMany({}),
    AdmissionsPage.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. Create Default School
  console.log("🏛️ Creating Seneca Academy Main Campus...");
  const school = await School.create({
    name: "Seneca Academy",
    code: "SENECA-MAIN-001",
    slug: "seneca-academy",
    email: "info@seneca.edu.pk",
    phone: "+92 335 7413777",
    address: "Soldier Bazar, Karachi, Pakistan",
    websiteUrl: "https://seneca.edu.pk",
    logoUrl: "/logo.png",
    status: "active",
    settings: {
      themeColor: "#810D0B",
      currency: "PKR",
      timezone: "Asia/Karachi",
      gradingSystem: "percentage",
    },
  });

  // 2. Create Current Academic Year
  console.log("📅 Creating Academic Year 2026–2027...");
  const academicYear = await AcademicYear.create({
    schoolId: school._id,
    name: "2026-2027",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2027-06-30"),
    isCurrent: true,
    terms: [
      { name: "First Term", startDate: new Date("2026-08-01"), endDate: new Date("2026-12-20") },
      { name: "Final Term", startDate: new Date("2027-01-05"), endDate: new Date("2027-06-30") },
    ],
  });

  school.currentAcademicYearId = academicYear._id as any;
  await school.save();

  // 3. Create Super Admin & Principal Users
  console.log("🔐 Creating Super Admin & Principal...");
  const superAdminHash = await hashPassword("SenecaSuperAdmin2026!");
  const principalHash = await hashPassword("SenecaAdmin2026!");
  const teacherHash = await hashPassword("Teacher2026!");
  const studentHash = await hashPassword("Student2026!");

  const superAdmin = await User.create({
    schoolId: school._id,
    name: "Executive Super Admin",
    email: "superadmin@seneca.edu.pk",
    passwordHash: superAdminHash,
    role: "super_admin",
    phone: "+92 335 7413777",
    status: "active",
  });

  const principalUser = await User.create({
    schoolId: school._id,
    name: "M. Zohaib Ali",
    email: "principal@seneca.edu.pk",
    passwordHash: principalHash,
    role: "principal",
    phone: "+92 335 7413777",
    status: "active",
    profileModel: "Principal",
  });

  const principalProfile = await Principal.create({
    schoolId: school._id,
    userId: principalUser._id,
    qualification: "M.Sc. Educational Leadership, Ph.D.",
    experienceYears: 18,
    message: "At Seneca, our commitment is to ignite intellectual curiosity and forge moral excellence in every student.",
  });

  principalUser.profileId = principalProfile._id as any;
  await principalUser.save();

  // 4. Create Classes (Grades 5 to 9)
  console.log("🏫 Creating 5 Academic Classes...");
  const classesData = [
    { name: "Grade 5", gradeLevel: 5, section: "A", capacity: 35, roomNumber: "R-101" },
    { name: "Grade 6", gradeLevel: 6, section: "A", capacity: 35, roomNumber: "R-102" },
    { name: "Grade 7", gradeLevel: 7, section: "A", capacity: 35, roomNumber: "R-201" },
    { name: "Grade 8", gradeLevel: 8, section: "A", capacity: 35, roomNumber: "R-202" },
    { name: "Grade 9", gradeLevel: 9, section: "A", capacity: 35, roomNumber: "R-301" },
  ];

  const createdClasses = await Class.insertMany(
    classesData.map((c) => ({
      ...c,
      schoolId: school._id,
      academicYearId: academicYear._id,
      status: "active",
    }))
  );

  // 5. Create Academic Subjects
  console.log("📚 Creating Core Subjects...");
  const subjectsData = [
    { name: "Mathematics", code: "MATH-501", department: "Science", creditHours: 4 },
    { name: "General Science", code: "SCI-501", department: "Science", creditHours: 4 },
    { name: "Computer Science", code: "CS-501", department: "Technology", creditHours: 3 },
    { name: "English Literature", code: "ENG-501", department: "Languages", creditHours: 3 },
    { name: "Urdu Language", code: "URD-501", department: "Languages", creditHours: 3 },
    { name: "Pakistan Studies", code: "PST-501", department: "Social Studies", creditHours: 2 },
  ];

  const createdSubjects = await Subject.insertMany(
    subjectsData.map((s) => ({
      ...s,
      schoolId: school._id,
      classIds: createdClasses.map((c) => c._id),
    }))
  );

  // 6. Create 5 Faculty Teachers
  console.log("👨‍🏫 Creating 5 Faculty Teachers...");
  const teachersInfo = [
    { name: "Sir Tariq Mehmood", email: "teacher.math@seneca.edu.pk", spec: "Mathematics", qual: "M.Sc. Mathematics", empId: "TCH-001", subIdx: 0 },
    { name: "Dr. Ayesha Siddiqui", email: "teacher.science@seneca.edu.pk", spec: "General Science", qual: "Ph.D. Chemistry", empId: "TCH-002", subIdx: 1 },
    { name: "Sir Kamran Khan", email: "teacher.cs@seneca.edu.pk", spec: "Computer Science", qual: "MS Computer Science", empId: "TCH-003", subIdx: 2 },
    { name: "Ms. Fatima Noor", email: "teacher.english@seneca.edu.pk", spec: "English Literature", qual: "M.A. English", empId: "TCH-004", subIdx: 3 },
    { name: "Sir Bilal Ahmed", email: "teacher.urdu@seneca.edu.pk", spec: "Urdu & PST", qual: "M.A. Urdu", empId: "TCH-005", subIdx: 4 },
  ];

  const createdTeachers = [];
  for (let i = 0; i < teachersInfo.length; i++) {
    const t = teachersInfo[i];
    const user = await User.create({
      schoolId: school._id,
      name: t.name,
      email: t.email,
      passwordHash: teacherHash,
      role: "teacher",
      status: "active",
      profileModel: "Teacher",
    });

    const teacher = await Teacher.create({
      schoolId: school._id,
      userId: user._id,
      employeeId: t.empId,
      specialization: t.spec,
      qualification: t.qual,
      experienceYears: 6 + i,
      assignedClassIds: [createdClasses[i]._id],
      assignedSubjectIds: [createdSubjects[t.subIdx]._id],
      salary: 65000 + i * 5000,
    });

    user.profileId = teacher._id as any;
    await user.save();

    // Assign class teacher
    createdClasses[i].classTeacherId = teacher._id as any;
    await createdClasses[i].save();

    createdTeachers.push(teacher);
  }

  // 7. Create 50 Students (10 per class)
  console.log("🎓 Creating 50 Enrolled Students...");
  const firstNames = ["Ahmed", "Ali", "Fatima", "Zainab", "Hassan", "Bilal", "Sara", "Areeba", "Hamza", "Usman"];
  const lastNames = ["Khan", "Shah", "Qureshi", "Malik", "Raza", "Ansari", "Mirza", "Sheikh", "Chaudhry", "Siddiqui"];

  let studentCounter = 1;
  const createdStudents = [];

  for (let cIdx = 0; cIdx < createdClasses.length; cIdx++) {
    const currentClass = createdClasses[cIdx];
    for (let sIdx = 0; sIdx < 10; sIdx++) {
      const padNum = String(studentCounter).padStart(2, "0");
      const fName = firstNames[sIdx % firstNames.length];
      const lName = lastNames[(sIdx + cIdx) % lastNames.length];
      const studentName = `${fName} ${lName}`;
      const email = `student${padNum}@seneca.edu.pk`;

      const user = await User.create({
        schoolId: school._id,
        name: studentName,
        email,
        passwordHash: studentHash,
        role: "student",
        status: "active",
        profileModel: "Student",
      });

      const student = await Student.create({
        schoolId: school._id,
        userId: user._id,
        academicYearId: academicYear._id,
        classId: currentClass._id,
        admissionNumber: `SEN-2026-${padNum}`,
        rollNumber: `0${currentClass.gradeLevel}-A-${padNum}`,
        dateOfBirth: new Date(`201${10 - currentClass.gradeLevel}-04-15`),
        gender: sIdx % 2 === 0 ? "Male" : "Female",
        bloodGroup: "B+",
        address: `House #${studentCounter * 3}, Soldier Bazar, Karachi`,
        guardian: {
          fatherName: `Muhammad ${lName}`,
          motherName: `Mrs. ${lName}`,
          phone: `+92 300 92000${padNum}`,
          email: `guardian${padNum}@gmail.com`,
          emergencyContact: `+92 333 81000${padNum}`,
        },
        status: "active",
      });

      user.profileId = student._id as any;
      await user.save();

      // Create initial Fee Voucher for this student
      await Fee.create({
        schoolId: school._id,
        academicYearId: academicYear._id,
        studentId: student._id,
        classId: currentClass._id,
        voucherNumber: `VCH-2026-08-${padNum}`,
        month: "August 2026",
        tuitionFee: 8500,
        admissionFee: 0,
        examFee: 1000,
        otherCharges: 500,
        discount: 0,
        fine: 0,
        totalAmount: 10000,
        paidAmount: sIdx < 7 ? 10000 : 0,
        balanceAmount: sIdx < 7 ? 0 : 10000,
        dueDate: new Date("2026-08-30"),
        status: sIdx < 7 ? "paid" : "pending",
      });

      createdStudents.push(student);
      studentCounter++;
    }
  }

  // 8. Create Sample Attendance for Today
  console.log("📝 Recording Sample Daily Attendance...");
  for (const c of createdClasses) {
    const classStudents = createdStudents.filter((s) => s.classId.toString() === c._id.toString());
    await Attendance.create({
      schoolId: school._id,
      academicYearId: academicYear._id,
      classId: c._id,
      date: new Date(),
      recordedByTeacherId: c.classTeacherId,
      records: classStudents.map((s, idx) => ({
        studentId: s._id,
        status: idx === 3 ? "late" : idx === 7 ? "absent" : "present",
        remarks: idx === 7 ? "Sick leave applied" : undefined,
      })),
    });
  }

  // 9. Create Sample Assignment & Quizzes
  console.log("📑 Creating Sample Assignment & Quizzes...");
  await Assignment.create({
    schoolId: school._id,
    classId: createdClasses[0]._id,
    subjectId: createdSubjects[0]._id,
    teacherId: createdTeachers[0]._id,
    title: "Algebraic Expressions & Polynomials Exercise 3.2",
    description: "Complete all questions from Section A and submit your solved PDF worksheet before Friday.",
    totalMarks: 50,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    attachmentUrls: [
      { url: "https://example.com/math-ex3.pdf", name: "Algebra-Worksheet.pdf", size: 450000 },
    ],
    status: "published",
  });

  await Quiz.create({
    schoolId: school._id,
    classId: createdClasses[0]._id,
    subjectId: createdSubjects[0]._id,
    teacherId: createdTeachers[0]._id,
    title: "Diagnostic Quiz: Number Theory & Factors",
    description: "15 minutes rapid multiple choice quiz.",
    durationMinutes: 15,
    totalMarks: 5,
    passingMarks: 3,
    questions: [
      {
        question: "What is the smallest prime number?",
        type: "multiple_choice",
        options: ["0", "1", "2", "3"],
        correctAnswer: 2,
        marks: 1,
        explanation: "2 is the only even prime number and the smallest prime.",
      },
      {
        question: "Is 17 a composite number?",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: 1,
        marks: 1,
        explanation: "17 has only two factors (1 and 17), so it is prime.",
      },
      {
        question: "What is the greatest common factor (GCF) of 12 and 18?",
        type: "multiple_choice",
        options: ["3", "6", "9", "12"],
        correctAnswer: 1,
        marks: 1,
        explanation: "The factors of 12 are 1,2,3,4,6,12 and 18 are 1,2,3,6,9,18. Common greatest is 6.",
      },
      {
        question: "What is 7 squared?",
        type: "multiple_choice",
        options: ["14", "42", "49", "56"],
        correctAnswer: 2,
        marks: 1,
      },
      {
        question: "Sum of interior angles in a triangle is 180 degrees.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: 0,
        marks: 1,
      },
    ],
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: "published",
  });

  // 10. Create Website Settings CMS Content
  console.log("🌐 Creating Dynamic CMS Website Settings...");
  await WebsiteSettings.create({
    schoolId: school._id,
    hero: {
      badge: "Admissions Open 2026–2027",
      title1: "Shaping",
      title2: "Tomorrow",
      description: "Beyond ordinary schooling. Seneca Academy cultivates intellect, builds character, and prepares leaders for the future.",
      ctaText: "Explore Academy",
      img1Url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
      img2Url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    },
    stats: [
      { value: "25+", label: "Years of Academic Heritage" },
      { value: "100%", label: "Matric Board Success Rate" },
      { value: "50+", label: "Master-Level Faculty Educators" },
      { value: "3,500+", label: "Alumni Across Top Universities" },
    ],
    about: {
      subtitle: "Discover Seneca",
      title: "About Us",
      description: "Founded on the relentless pursuit of academic excellence, Seneca Academy stands as a premier educational institution fostering critical thinking, discipline, and emotional intelligence.",
      badges: ["Rigorous Curriculum", "Modern STEM Labs", "Character Coaching"],
      years: "25+",
      yearsLabel: "Years Heritage",
    },
    visionMission: {
      vision: "To be recognized as a premier center of educational excellence, fostering innovation and integrity.",
      mission: "To provide a stimulating learning environment that empowers students to reach their highest potential.",
    },
    principalMessage: {
      name: "M. Zohaib Ali",
      title: "Executive Principal",
      quote: "At Seneca, we don't just teach students; we nurture leaders equipped to thrive in the 21st century.",
      description: "Since our inception, our focus has been creating a school culture that balances academic rigor with moral integrity.",
      imgUrl: "https://images.unsplash.com/photo-1554126807-6b10f6f6692a?auto=format&fit=crop&w=800&q=80",
    },
    contact: {
      address: "Soldier Bazar, Karachi, Pakistan",
      phone: "+92 335 7413777",
      email: "info@seneca.edu.pk",
      hours: "Mon - Sat: 8:00 AM - 3:00 PM",
    },
    career: {
      title: "Join Our Faculty",
      description: "Be part of our mission to inspire tomorrow's leaders.",
      email: "careers@seneca.edu.pk",
      subjects: ["Mathematics", "Physics", "Computer Science", "English Literature"],
    },
    footer: {
      brandDesc: "Building character, cultivating intellect, and engineering the leaders of the next generation.",
      copyrightText: "© 2026 Seneca Academy. All rights reserved.",
    },
  });

  // 10b. Create Published Admissions & Fees CMS Page
  console.log("📝 Creating Published Admissions & Fees CMS Page...");
  await AdmissionsPage.create({
    schoolId: school._id,
    ...DEFAULT_ADMISSIONS_PAGE_DATA,
    isPublished: true,
    publishedAt: new Date(),
    publishedBy: {
      userId: superAdmin._id.toString(),
      name: superAdmin.name,
      email: superAdmin.email,
    },
  });

  // 11. Create Sample Announcements
  console.log("📢 Creating Official Announcements...");
  await Announcement.insertMany([
    {
      schoolId: school._id,
      title: "Admissions Open for Session 2026–2027",
      content: "Online registration and entrance assessment booking for Grades 1 through 9 is now live. Limited seats available per section.",
      icon: "🎓",
      colorTheme: "blue",
      priority: "urgent",
      targetRole: "public",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      schoolId: school._id,
      title: "Annual STEM & Robotics Exhibition",
      content: "Join us this Saturday in the main auditorium for our annual project displays by Middle & High school students.",
      icon: "🔬",
      colorTheme: "orange",
      priority: "normal",
      targetRole: "all",
      isPublished: true,
      publishedAt: new Date(),
    },
  ]);

  // 12. Create Sample Blogs
  console.log("✍️ Creating Sample Blog Posts...");
  await Blog.insertMany([
    {
      schoolId: school._id,
      title: "Cultivating Critical Thinking in the Digital Age",
      slug: "cultivating-critical-thinking-in-digital-age",
      excerpt: "How modern educational pedagogy balances screen time with hands-on inquiry and analytical reasoning.",
      content: "In an era saturated with immediate answers, learning how to ask the right questions has never been more vital. At Seneca Academy, our STEM and Humanities curricula are purposefully structured to encourage debate, scientific method experimentation, and original hypothesis formulation...",
      category: "Pedagogy",
      tags: ["Education", "STEM", "Critical Thinking"],
      authorName: "M. Zohaib Ali",
      status: "published",
      publishedAt: new Date(),
    },
    {
      schoolId: school._id,
      title: "Celebrating 100% Board Distinction in Matriculation Examinations",
      slug: "celebrating-100-percent-board-distinction",
      excerpt: "Our 2025-2026 batch achieved top ranks across Karachi with exceptional performance in Computer Science and Bio-Science.",
      content: "We are immensely proud to announce that 100% of our matriculation cohort passed with A-One and A grades in the annual board examinations...",
      category: "Achievements",
      tags: ["Board Results", "Excellence", "Success"],
      authorName: "Dr. Ayesha Siddiqui",
      status: "published",
      publishedAt: new Date(),
    },
  ]);

  // 13. Create Audit Log Entry
  console.log("🛡️ Creating Initial Audit Log...");
  await AuditLog.create({
    schoolId: school._id,
    userId: superAdmin._id,
    userEmail: superAdmin.email,
    userRole: superAdmin.role,
    action: "SYSTEM_INITIALIZED",
    resource: "System",
    details: {
      school: school.name,
      academicYear: academicYear.name,
      seededStudents: 50,
      seededTeachers: 5,
      seededClasses: 5,
    },
  });

  console.log("✨ Seeding completed successfully!");
  console.log("--------------------------------------------------");
  console.log("Credentials Summary:");
  console.log("Super Admin : superadmin@seneca.edu.pk  | SenecaSuperAdmin2026!");
  console.log("Principal   : principal@seneca.edu.pk   | SenecaAdmin2026!");
  console.log("Teacher     : teacher.math@seneca.edu.pk | Teacher2026!");
  console.log("Student     : student01@seneca.edu.pk   | Student2026!");
  console.log("--------------------------------------------------");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
