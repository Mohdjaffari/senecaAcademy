import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Blog from "@/models/Blog";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const query: any = {};
    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;

    const blogs = await Blog.find(query).sort({ createdAt: -1 }).lean();

    const formatted = blogs.map((b: any) => ({
      id: b._id.toString(),
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      coverImageUrl: b.coverImageUrl || "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      category: b.category,
      tags: b.tags || [],
      authorName: b.authorName,
      status: b.status,
      publishedAt: b.publishedAt || b.createdAt,
      formattedDate: new Date(b.createdAt).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    return apiSuccess({ count: formatted.length, blogs: formatted }, "Blogs retrieved successfully.");
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Unauthorized action.");
    }

    const body = await req.json();
    const { title, excerpt, content, coverImageUrl, category, tags, authorName, status } = body;

    if (!title || !content) {
      throw new ValidationError("Blog title and content are required.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) throw new Error("School missing.");

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") + `-${Date.now().toString().slice(-4)}`;

    const newBlog = await Blog.create({
      schoolId: school._id,
      title: title.trim(),
      slug,
      excerpt: excerpt || title.slice(0, 120),
      content: content.trim(),
      coverImageUrl: coverImageUrl || "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      category: category || "Academics",
      tags: Array.isArray(tags) ? tags : ["Education", "Campus"],
      authorName: authorName || session.name || "Principal's Editorial Office",
      authorId: session.userId,
      status: status || "published",
      publishedAt: new Date(),
    });

    return apiSuccess({ blog: newBlog }, "Blog article published successfully!");
  } catch (error) {
    return apiError(error);
  }
}
