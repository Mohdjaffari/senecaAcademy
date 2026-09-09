import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

import User from "../models/User";
import School from "../models/School";
import { hashPassword } from "../lib/auth/password";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/seneca_school_lms";

async function testSignup() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected.");

  let school = await School.findOne();
  if (!school) {
    school = await School.create({
      name: "Seneca Academy",
      code: "SENECA",
      slug: "seneca-academy",
      email: "info@seneca.edu.pk",
      phone: "+92 21 3225 1984",
      address: "Soldier Bazar, Karachi",
      status: "active",
      settings: {
        themeColor: "#810D0B",
        currency: "PKR",
        timezone: "Asia/Karachi",
        gradingSystem: "percentage",
      },
    });
  }

  const testEmail = "testuser@seneca.edu.pk";
  await User.deleteOne({ email: testEmail });

  const passwordHash = await hashPassword("UserPass2026!");

  const newUser = await User.create({
    schoolId: school._id,
    name: "Test User Account",
    email: testEmail,
    phone: "+92 300 9876543",
    passwordHash,
    role: "user",
    status: "active",
    customPermissions: [],
    lastLoginAt: new Date(),
  });

  console.log("🎉 User created successfully with role 'user':", {
    id: newUser._id.toString(),
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
  });

  // Verify finding the user
  const foundUser = await User.findOne({ email: testEmail });
  console.log("🔍 Found user in database with role:", foundUser?.role);

  // Clean up test user
  await User.deleteOne({ email: testEmail });
  console.log("🧹 Cleaned up test user.");

  await mongoose.disconnect();
}

testSignup().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
