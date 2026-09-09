import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/seneca_school_lms";

async function clearUsers() {
  console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected.");

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established.");
  }

  // Count existing users before deletion
  const usersCollection = db.collection("users");
  const count = await usersCollection.countDocuments();
  console.log(`📊 Found ${count} total users in database.`);

  if (count > 0) {
    const result = await usersCollection.deleteMany({});
    console.log(`🧹 Successfully deleted ${result.deletedCount} user records from database.`);
  } else {
    console.log("ℹ️ No users found to delete.");
  }

  console.log("✨ User cleanup completed successfully.");
  await mongoose.disconnect();
}

clearUsers().catch((err) => {
  console.error("❌ Failed to clear users:", err);
  process.exit(1);
});
