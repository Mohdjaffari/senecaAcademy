import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import School from "@/models/School";
import { hashPassword } from "@/lib/auth/password";
import { signupUserSchema } from "@/lib/validations/auth";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { ValidationError, ConflictError } from "@/lib/utils/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod schema validation
    const parseResult = signupUserSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid registration details.",
        parseResult.error.flatten().fieldErrors
      );
    }

    const { name, email, phone, password, role } = parseResult.data;

    // 2. Connect to MongoDB database
    await connectToDatabase();

    // 3. Check for existing user with same email (case-insensitive)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new ConflictError(
        "An account with this email address already exists. Please sign in instead."
      );
    }

    // 4. Resolve default Seneca Academy school ID
    let school = await School.findOne({ status: "active" });
    if (!school) {
      school = await School.findOne({});
    }

    if (!school) {
      throw new Error(
        "School system record not found. Please contact administration."
      );
    }

    // 5. Convert plaintext password to secure bcrypt hash (12 rounds)
    const passwordHash = await hashPassword(password);

    // 6. Create User document in MongoDB
    const newUser = await User.create({
      schoolId: school._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: "user",
      status: "active",
      customPermissions: [],
      lastLoginAt: new Date(),
    });

    return apiSuccess(
      {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      "Account registered successfully! Please sign in with your email and password."
    );
  } catch (error) {
    return apiError(error);
  }
}
