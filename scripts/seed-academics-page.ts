import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import connectToDatabase from "../lib/db/mongodb";
import School from "../models/School";
import AcademicsPage from "../models/AcademicsPage";
import { DEFAULT_ACADEMICS_PAGE_DATA } from "../lib/db/academics-page-defaults";

async function seedAcademicsPage() {
  try {
    console.log("Connecting to database with URI:", process.env.MONGODB_URI ? "FOUND" : "NOT FOUND");
    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      console.log("No school found, creating default school record...");
      school = await School.create({
        name: "Seneca Academy",
        campus: "Soldier Bazar Campus, Karachi",
        status: "active",
      });
    }

    console.log(`Using school ID: ${school._id}`);

    const existing = await AcademicsPage.findOne({ schoolId: school._id });
    if (existing) {
      console.log("AcademicsPage already exists in database. Updating to latest schema structure...");
      await AcademicsPage.updateOne({ schoolId: school._id }, { $set: DEFAULT_ACADEMICS_PAGE_DATA });
    } else {
      console.log("Creating default AcademicsPage document in MongoDB...");
      await AcademicsPage.create({
        schoolId: school._id,
        ...DEFAULT_ACADEMICS_PAGE_DATA,
      });
    }

    console.log("✅ Academics Page seed/migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Academics Page:", error);
    process.exit(1);
  }
}

seedAcademicsPage();
