import { NextResponse } from "next/server";
import { AppError } from "./errors";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(
  data?: T,
  message?: string,
  statusCode = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  );
}

export function apiError(error: unknown): NextResponse<ApiResponse<null>> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Catch uncaught MongoDB connection & network errors gracefully
  const err = error as any;
  if (
    err?.name === "MongoServerSelectionError" ||
    err?.name === "MongooseServerSelectionError" ||
    err?.name === "MongoNetworkError" ||
    err?.name === "MongoTimeoutError"
  ) {
    console.error("❌ Database Connection Failure in API:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_CONNECTION_ERROR",
          message:
            "Database connection failed. Please ensure your MongoDB cluster is running and your hosting IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).",
          details: process.env.NODE_ENV === "production" ? undefined : err?.message,
        },
      },
      { status: 503 }
    );
  }

  if (err?.name === "MongoServerError" && (err?.code === 18 || err?.codeName === "AuthenticationFailed")) {
    console.error("❌ Database Authentication Failure in API:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_AUTH_ERROR",
          message:
            "Database authentication failed. Please verify your MongoDB database username, password, and database name in MONGODB_URI.",
        },
      },
      { status: 500 }
    );
  }

  if (typeof err?.message === "string" && err.message.includes("MONGODB_URI")) {
    console.error("❌ Missing MONGODB_URI in API:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_CONFIG_ERROR",
          message:
            "Database configuration error: MONGODB_URI is not set. Please add MONGODB_URI to your Hostinger environment variables or .env file.",
        },
      },
      { status: 500 }
    );
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  console.error("Unhandled API Error:", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : message,
      },
    },
    { status: 500 }
  );
}
