import mongoose from "mongoose";
import "./register-models";
import { DatabaseError } from "@/lib/utils/errors";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri || !rawUri.trim()) {
    throw new DatabaseError(
      "MONGODB_URI is not defined. Please configure your MongoDB connection string in your Hostinger environment variables or .env file."
    );
  }

  // Strip accidental surrounding quotes or trailing whitespace
  const uri = rawUri.trim().replace(/^['"]|['"]$/g, "");

  // 1. If connection already active (1 = connected), return cached instance
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. If disconnected (0) or disconnecting (3), clear stale cache
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  // 3. If a connection attempt is in-flight, await it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (_err) {
      cached.promise = null;
      cached.conn = null;
    }
  }

  // 4. Initiate fresh connection with resilient timeouts for cloud deployment
  const opts: mongoose.ConnectOptions = {
    bufferCommands: true, // Allow commands to buffer while connection establishes
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 15000, // 15s timeout for Hostinger/Cloud DNS & TLS negotiation
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
  };

  cached.promise = mongoose
    .connect(uri, opts)
    .then((mongooseInstance) => {
      console.log("✅ MongoDB Connected successfully.");
      return mongooseInstance;
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
      cached.promise = null;
      cached.conn = null;

      let msg = "Failed to connect to the database.";
      if (err?.name === "MongoServerSelectionError") {
        msg =
          "Database connection timed out. If you are using MongoDB Atlas, ensure your Hostinger server IP (or 0.0.0.0/0) is whitelisted in Network Access.";
      } else if (err?.name === "MongoServerError" && (err?.code === 18 || err?.codeName === "AuthenticationFailed")) {
        msg =
          "Database authentication failed. Please verify the username and password in MONGODB_URI.";
      } else if (err?.message) {
        msg = err.message;
      }

      throw new DatabaseError(msg, {
        name: err?.name,
        code: err?.code,
      });
    });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
