import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/seneca_school_lms";

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB:", MONGODB_URI);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("No database instance");
  }

  const usersCollection = db.collection("users");
  const schoolsCollection = db.collection("schools");

  const school = await schoolsCollection.findOne();
  console.log("School found:", school?._id, school?.name);

  const schoolId = school?._id || new mongoose.Types.ObjectId();

  const juniorPasswordHash = await bcrypt.hash("JuniorPrincipal2026!", 12);
  const seniorPasswordHash = await bcrypt.hash("SeniorPrincipal2026!", 12);

  // 1. Junior Wing Principal (<= Grade 2)
  const juniorResult = await usersCollection.updateOne(
    { email: "principal.junior@seneca.edu.pk" },
    {
      $set: {
        email: "principal.junior@seneca.edu.pk",
        name: "Mrs. Sajida Tariq",
        passwordHash: juniorPasswordHash,
        role: "principal",
        campusWing: "junior",
        status: "active",
        schoolId: schoolId,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log("Junior Principal upsert result:", juniorResult);

  // 2. Senior Wing Principal (> Grade 2)
  const seniorResult = await usersCollection.updateOne(
    { email: "principal.senior@seneca.edu.pk" },
    {
      $set: {
        email: "principal.senior@seneca.edu.pk",
        name: "M. Zohaib Ali",
        passwordHash: seniorPasswordHash,
        role: "principal",
        campusWing: "senior",
        status: "active",
        schoolId: schoolId,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log("Senior Principal upsert result:", seniorResult);

  // 3. Print verified principals
  const principals = await usersCollection
    .find({ email: { $in: ["principal.junior@seneca.edu.pk", "principal.senior@seneca.edu.pk", "principal@seneca.edu.pk"] } })
    .toArray();
  console.log("\nVerified Principals in DB:");
  for (const p of principals) {
    console.log(`- ${p.email} | Name: ${p.name} | Role: ${p.role} | Wing: ${p.campusWing} | Status: ${p.status}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
