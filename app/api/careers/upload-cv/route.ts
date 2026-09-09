import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

/**
 * POST /api/careers/upload-cv
 * Public endpoint to upload applicant resume / curriculum vitae (PDF, DOC, DOCX up to 5MB)
 * Saves to public/uploads/resumes directory with base64 fallback.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No resume file was provided." },
        { status: 400 }
      );
    }

    const originalName = file.name || "resume.pdf";
    const extension = path.extname(originalName).toLowerCase();
    const allowedExtensions = [".pdf", ".doc", ".docx"];

    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file format. Only PDF, DOC, and DOCX documents are accepted.",
        },
        { status: 400 }
      );
    }

    // Max 5MB
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: "Resume file size exceeds the 5 MB limit. Please upload a smaller file.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sizeKb = Math.round(file.size / 1024);

    // Sanitize filename
    const safeBaseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const uniqueFileName = `${Date.now()}_${safeBaseName}${extension}`;

    let fileUrl: string;

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
      await fs.mkdir(uploadDir, { recursive: true });
      const targetFilePath = path.join(uploadDir, uniqueFileName);
      await fs.writeFile(targetFilePath, buffer);
      fileUrl = `/uploads/resumes/${uniqueFileName}`;
    } catch (fsError) {
      console.warn("Could not write CV file to public directory, falling back to data URL:", fsError);
      const mimeType =
        extension === ".pdf"
          ? "application/pdf"
          : extension === ".docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/msword";
      fileUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      message: "Resume uploaded successfully.",
      data: {
        url: fileUrl,
        fileName: originalName,
        savedFileName: uniqueFileName,
        sizeKb,
      },
    });
  } catch (error: any) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred during resume upload.",
      },
      { status: 500 }
    );
  }
}
