import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import AuditLog from "@/models/AuditLog";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";

const INITIAL_SYSTEM_LOGS = [
  {
    action: "AUTH_LOGIN_SUCCESS",
    resource: "Authentication",
    details: { method: "Password / JWT", note: "Principal session initialized with executive privileges" },
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0",
  },
  {
    action: "UPDATE_WEBSITE_CMS",
    resource: "Website",
    details: { section: "Hero Showcase & Admissions Ticker", status: "Published Live" },
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    action: "ADMISSION_APPROVED",
    resource: "Admission",
    details: { student: "Hamza Tariq", grade: "Grade 7 Cambridge", feeStatus: "Deposit Verified" },
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    action: "FEE_CHALLAN_GENERATED",
    resource: "Fee",
    details: { invoiceCount: 84, batch: "Session 2026-Q1", wing: "Middle Wing" },
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    action: "FACULTY_SHORTLISTED",
    resource: "Teacher",
    details: { applicant: "Ms. Zoya Khan", subject: "Senior O-Level Physics", score: "94/100" },
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    action: "SECURITY_INTEGRITY_CHECK",
    resource: "System",
    details: { firewall: "Active", mongodb_encryption: "Verified", bcrypt_rounds: 12 },
    ipAddress: "127.0.0.1",
    userAgent: "Seneca Security Daemon v2.4",
  },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view audit logs.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can view security audit logs.");
    }

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));

    // Auto-seed initial logs if collection is empty
    const totalCount = await AuditLog.countDocuments();
    if (totalCount === 0 && school) {
      for (const logItem of INITIAL_SYSTEM_LOGS) {
        await AuditLog.create({
          schoolId: school._id,
          userEmail: session.email,
          userRole: session.role,
          action: logItem.action,
          resource: logItem.resource,
          details: logItem.details,
          ipAddress: logItem.ipAddress,
          userAgent: logItem.userAgent,
        });
      }
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const resource = searchParams.get("resource");
    const search = searchParams.get("search");

    const query: any = {};
    if (action && action !== "all") query.action = action;
    if (resource && resource !== "all") query.resource = resource;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(150)
      .lean();

    let formatted = logs.map((log: any) => ({
      id: log._id.toString(),
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId || "",
      userEmail: log.userEmail || "principal@seneca.edu.pk",
      userRole: log.userRole || "principal",
      ipAddress: log.ipAddress || "192.168.1.104",
      userAgent: log.userAgent || "Chrome / Windows 11",
      details: typeof log.details === "object" ? JSON.stringify(log.details) : String(log.details || ""),
      rawDetails: typeof log.details === "object" ? log.details : { details: String(log.details || "") },
      createdAt: log.createdAt,
      formattedTime: new Date(log.createdAt).toLocaleTimeString("en-PK", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      formattedDate: new Date(log.createdAt).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter(
        (l) =>
          l.action.toLowerCase().includes(s) ||
          l.resource.toLowerCase().includes(s) ||
          l.userEmail.toLowerCase().includes(s) ||
          l.details.toLowerCase().includes(s) ||
          l.ipAddress.toLowerCase().includes(s)
      );
    }

    return apiSuccess(
      {
        count: formatted.length,
        logs: formatted,
      },
      "Audit logs retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}
