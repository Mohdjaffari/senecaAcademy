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

    const { email, password, campusWing } = parseResult.data;

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    let queryEmail = normalizedEmail;
    let effectiveWing = campusWing;

    if (normalizedEmail === "principal.junior@seneca.edu.pk") {
      effectiveWing = "junior";
    } else if (normalizedEmail === "principal.senior@seneca.edu.pk") {
      effectiveWing = "senior";
    }

    // 1. Find user by email, with alias fallback for specialized wing principals
    let user = await User.findOne({ email: queryEmail });
    if (
      !user &&
      (normalizedEmail === "principal.junior@seneca.edu.pk" ||
        normalizedEmail === "principal.senior@seneca.edu.pk")
    ) {
      user =
        (await User.findOne({ email: "principal@seneca.edu.pk" })) ||
        (await User.findOne({ role: "principal" })) ||
        (await User.findOne({ role: "super_admin" }));
    }

    if (!user) {
      throw new AuthenticationError("Invalid email address or password.");
    }

    if (!effectiveWing && user.campusWing) {
      effectiveWing = user.campusWing;
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
      campusWing: effectiveWing || user.campusWing || "all",
    });

    // 6. Role-Based Redirection Engine:
    // - Junior Principal -> /junior-portal
    // - Senior Principal -> /senior-portal
    // - Principal / Super Admin -> /dashboard (or wing portal if specified)
    // - Teacher -> /teacher (Faculty Portal)
    // - Student -> /student (Student Learning Portal)
    // - User -> / (Website Home Page)
    let redirectTo = "/";
    if (user.role === "super_admin" || user.role === "principal") {
      if (effectiveWing === "junior") {
        redirectTo = "/junior-portal";
      } else if (effectiveWing === "senior") {
        redirectTo = "/senior-portal";
      } else {
        redirectTo = "/dashboard";
      }
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
          campusWing: effectiveWing || "all",
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

    if (effectiveWing) {
      response.cookies.set("seneca_campus_wing", effectiveWing, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    return apiError(error);
  }
}
