import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";
import sharp from "sharp";

/**
 * POST /api/website/upload-image
 * Accepts multipart/form-data with a `file` field (image).
 * Resizes to max 1200px wide, converts to WebP at 80% quality.
 * Returns { url: "data:image/webp;base64,..." }
 *
 * Auth: super_admin or principal only.
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getSession();
    if (!session) throw new AuthenticationError("Authentication required.");
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can upload website images.");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 });
    }

    // Validate MIME type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only JPEG, PNG, WebP, GIF, and AVIF images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 8MB before processing)
    const MAX_SIZE_BYTES = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Image must be under 8 MB." },
        { status: 400 }
      );
    }

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Process with sharp: resize to max 1200px wide, convert to WebP @ 80% quality
    const processed = await sharp(inputBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Convert to base64 data URI
    const base64 = processed.toString("base64");
    const dataUrl = `data:image/webp;base64,${base64}`;

    const sizeKb = Math.round(processed.length / 1024);

    return NextResponse.json({
      success: true,
      message: "Image uploaded and processed successfully.",
      data: {
        url: dataUrl,
        sizeKb,
        format: "webp",
        originalName: file.name,
      },
    });
  } catch (error: unknown) {
    console.error("Image upload error:", error);
    const message = error instanceof Error ? error.message : "Image upload failed.";
    const status =
      error instanceof AuthenticationError
        ? 401
        : error instanceof AuthorizationError
        ? 403
        : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
