import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, ValidationError } from "@/lib/utils/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError("Invalid login details.", parseResult.error.flatten().fieldErrors);
    }

    const { email, password } = parseResult.data;

    await connectToDatabase();

    // 1. Find user by lowercase email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new AuthenticationError("Invalid email address or password.");
    }

    // 2. Check if account is active
    if (user.status !== "active") {
      throw new AuthenticationError(
        `Your account status is '${user.status}'. Please contact school administration.`
      );
    }

    // 3. Verify password hash using bcrypt
    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AuthenticationError("Invalid email address or password.");
    }

    // 4. Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // 5. Create JWT session and set HTTP-only cookie
    const token = await createSession({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId.toString(),
      profileId: user.profileId?.toString(),
    });

    // 6. Role-Based Redirection Engine:
    // - Principal / Super Admin -> /dashboard (Management Dashboard)
    // - Teacher -> /teacher (Faculty Portal)
    // - Student -> /student (Student Learning Portal)
    // - User -> / (Website Home Page)
    let redirectTo = "/";
    if (user.role === "super_admin" || user.role === "principal") {
      redirectTo = "/dashboard";
    } else if (user.role === "teacher") {
      redirectTo = "/teacher";
    } else if (user.role === "student") {
      redirectTo = "/student";
    } else if (user.role === "user") {
      redirectTo = "/";
    }

    const response = apiSuccess(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId.toString(),
        },
        redirectTo,
      },
      "Login successful."
    );

    response.cookies.set("seneca_lms_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
