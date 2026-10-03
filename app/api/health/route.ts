import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let dbPingMs = 0;
  let dbError: string | null = null;
  let dbHost = "unknown";
  let dbName = "unknown";

  const isConfigured = Boolean(process.env.MONGODB_URI);

  if (!isConfigured) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: "MONGODB_URI environment variable is not set.",
        resolution:
          "Please configure MONGODB_URI in your Hostinger hPanel Environment Variables or in your server's .env file.",
        database: {
          configured: false,
          connected: false,
          readyState: 0,
        },
      },
      { status: 503 }
    );
  }

  try {
    const conn = await connectToDatabase();
    const readyState = mongoose.connection.readyState;

    if (readyState === 1 && conn.connection.db) {
      const pingStart = Date.now();
      await conn.connection.db.admin().ping();
      dbPingMs = Date.now() - pingStart;
      dbStatus = "connected";
      dbHost = conn.connection.host || "unknown";
      dbName = conn.connection.name || "unknown";
    } else {
      dbStatus = readyState === 2 ? "connecting" : "disconnected";
    }
  } catch (err: any) {
    dbStatus = "error";
    dbError = err?.message || "Unknown database error";
    console.error("Health check database error:", err);
  }

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      database: {
        configured: true,
        status: dbStatus,
        connected: isHealthy,
        readyState: mongoose.connection.readyState,
        host: dbHost,
        name: dbName,
        latencyMs: dbPingMs,
        error: dbError,
      },
      diagnosticAdvice: !isHealthy
        ? [
            "Verify MONGODB_URI is properly set in Hostinger hPanel.",
            "If using MongoDB Atlas, go to MongoDB Atlas -> Network Access -> Add IP Address -> Select 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0).",
            "Verify the MongoDB database user password doesn't contain unencoded special characters.",
            "Ensure the database user has 'readWrite' privileges on the target database.",
          ]
        : undefined,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
