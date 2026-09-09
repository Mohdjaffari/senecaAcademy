import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Feedback from "@/models/Feedback";
import ReviewsPage from "@/models/ReviewsPage";
import { getSession } from "@/lib/auth/session";
import { REGEX_PATTERNS } from "@/lib/utils/validation";

const SEED_FEEDBACKS = [
  {
    name: "Engr. Farhan Siddiqui",
    email: "farhan.siddiqui@example.com",
    role: "Parent",
    relationship: "Parent of Grade 9 & Grade 6 Students",
    studentGrade: "Grade 9 & Grade 6",
    rating: 5,
    category: "Academic Excellence",
    title: "Remarkable conceptual clarity and balanced character building",
    comment:
      "What truly distinguishes Seneca Academy is their perfect balance between rigorous science education and moral character. Both of my children have gained immense conceptual confidence without the need for evening private tuitions. The teachers provide personalized attention and continuous feedback.",
    recommend: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    status: "approved",
    isFeatured: true,
    likesCount: 38,
    createdAt: new Date("2026-08-15T10:30:00Z"),
  },
  {
    name: "Dr. Samina Rizvi",
    email: "samina.rizvi@example.com",
    role: "Parent",
    relationship: "Parent of Grade 10 Board Position Holder",
    studentGrade: "Grade 10 (Matric BSEK)",
    rating: 5,
    category: "Faculty & Mentorship",
    title: "Extraordinary faculty dedication during Matric Board Preparation",
    comment:
      "The faculty's dedication during matric board preparation was extraordinary. From weekly mock examinations to personalized one-on-one feedback sessions, they guided my daughter to achieve 92% in BSEK examinations. We are forever grateful to the principal and science mentors.",
    recommend: true,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    status: "approved",
    isFeatured: true,
    likesCount: 47,
    createdAt: new Date("2026-08-20T14:15:00Z"),
  },
  {
    name: "Hamza Tariq (Alumnus)",
    email: "hamza.tariq@example.com",
    role: "Alumni",
    relationship: "Class of 2022 • FAST-NUCES CS Undergrad",
    studentGrade: "Class of 2022",
    rating: 5,
    category: "Campus Facilities & Labs",
    title: "Robotics lab and Python coding laid my engineering foundation",
    comment:
      "The computer programming and analytical problem-solving foundation I built in Seneca's robotics studio gave me a massive head start in my computer science university degree. Seneca teaches you how to think, innovate, and solve problems independently rather than relying on rote memorization.",
    recommend: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    status: "approved",
    isFeatured: true,
    likesCount: 29,
    createdAt: new Date("2026-08-28T09:00:00Z"),
  },
  {
    name: "Mrs. Ayesha Zubair",
    email: "ayesha.zubair@example.com",
    role: "Parent",
    relationship: "Mother of Kindergarten & Grade 2 Students",
    studentGrade: "Montessori & Primary",
    rating: 5,
    category: "Discipline & Moral Values",
    title: "Safe, nurturing Montessori space with wonderful caring staff",
    comment:
      "Sending my toddlers to Seneca's early years program was the best decision. The air-conditioned thematic Montessori rooms, tactile sensory apparatus, and warm, caring teachers helped my children develop speech, phonics fluency, and social manners remarkably fast.",
    recommend: true,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    status: "approved",
    isFeatured: true,
    likesCount: 31,
    createdAt: new Date("2026-09-01T11:45:00Z"),
  },
  {
    name: "Tariq Mehmood",
    email: "tariq.mehmood@example.com",
    role: "Parent",
    relationship: "Father of Grade 8 Student",
    studentGrade: "Grade 8",
    rating: 5,
    category: "Sports & Extracurriculars",
    title: "Great emphasis on physical sports, debates, and public speaking",
    comment:
      "Seneca doesn't just focus on textbooks; their intra-school sports tournaments, Model UN simulations, and science exhibition galas have transformed my son into an articulate, confident speaker. Highly recommended for holistic child development.",
    recommend: true,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    status: "approved",
    isFeatured: false,
    likesCount: 19,
    createdAt: new Date("2026-09-03T16:20:00Z"),
  },
  {
    name: "Marium Bilal (Student)",
    email: "marium.bilal@example.com",
    role: "Student",
    relationship: "Grade 10 Pre-Medical Cohort",
    studentGrade: "Grade 10",
    rating: 5,
    category: "Academic Excellence",
    title: "Practical science laboratories and supportive teachers",
    comment:
      "The individual workstations in Physics and Chemistry practicals allow us to actually conduct experiments ourselves. Teachers are always approachable during remedial hours to resolve doubts.",
    recommend: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    status: "approved",
    isFeatured: false,
    likesCount: 22,
    createdAt: new Date("2026-09-05T08:10:00Z"),
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const category = searchParams.get("category");
    const minRating = searchParams.get("minRating");
    const search = searchParams.get("search");
    const statusParam = searchParams.get("status");
    const isFeaturedParam = searchParams.get("isFeatured");
    const sort = searchParams.get("sort") || "featured";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const session = await getSession();
    const isAdmin = session && (session.role === "super_admin" || session.role === "principal");

    // Auto-seed if empty
    const count = await Feedback.countDocuments();
    if (count === 0) {
      await Feedback.insertMany(SEED_FEEDBACKS);
    }

    const query: any = {};

    // Status filtering: public only sees "approved", admins can see all or specific
    if (isAdmin && statusParam && statusParam !== "all") {
      query.status = statusParam;
    } else if (isAdmin && statusParam === "all") {
      // no status filter for admin wanting all
    } else {
      query.status = "approved";
    }

    if (isFeaturedParam === "true") {
      query.isFeatured = true;
    }

    if (role && role !== "all") {
      query.role = role;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (minRating && minRating !== "all") {
      query.rating = { $gte: Number(minRating) };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { title: searchRegex },
        { comment: searchRegex },
        { category: searchRegex },
        { relationship: searchRegex },
        { email: searchRegex },
      ];
    }

    // Sort order
    let sortOption: any = { isFeatured: -1, createdAt: -1 };
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "rating_desc") {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === "rating_asc") {
      sortOption = { rating: 1, createdAt: -1 };
    } else if (sort === "likes") {
      sortOption = { likesCount: -1, createdAt: -1 };
    }

    const feedbacks = await Feedback.find(query)
      .sort(sortOption)
      .limit(limit)
      .lean();

    // Aggregated stats from all approved reviews
    const allApproved = await Feedback.find({ status: "approved" }).lean();
    const allReviews = isAdmin ? await Feedback.find({}).lean() : allApproved;

    const totalCount = allApproved.length;
    const totalRatingSum = allApproved.reduce((acc, f) => acc + (f.rating || 5), 0);
    const averageRating = totalCount > 0 ? parseFloat((totalRatingSum / totalCount).toFixed(1)) : 5.0;

    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allApproved.forEach((f) => {
      const r = Math.round(f.rating || 5);
      if (r >= 1 && r <= 5) ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
    });

    const categoryDistribution: Record<string, number> = {};
    allApproved.forEach((f) => {
      if (f.category) {
        categoryDistribution[f.category] = (categoryDistribution[f.category] || 0) + 1;
      }
    });

    const roleDistribution: Record<string, number> = {};
    allApproved.forEach((f) => {
      if (f.role) {
        roleDistribution[f.role] = (roleDistribution[f.role] || 0) + 1;
      }
    });

    const recommendCount = allApproved.filter((f) => f.recommend !== false).length;
    const recommendRate = totalCount > 0 ? Math.round((recommendCount / totalCount) * 100) : 98;

    // Admin-specific counts
    const adminCounts = {
      total: allReviews.length,
      approved: allReviews.filter((r) => r.status === "approved").length,
      pending: allReviews.filter((r) => r.status === "pending").length,
      hidden: allReviews.filter((r) => r.status === "hidden").length,
      featured: allReviews.filter((r) => r.isFeatured).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        feedbacks,
        stats: {
          totalCount,
          averageRating,
          recommendRate,
          ratingDistribution,
          categoryDistribution,
          roleDistribution,
          adminCounts,
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback reviews." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const session = await getSession();
    const isAdmin = session && (session.role === "super_admin" || session.role === "principal");

    const {
      name,
      email,
      role = "Parent",
      relationship,
      studentGrade,
      rating = 5,
      category = "Academic Excellence",
      title,
      comment,
      recommend = true,
      avatarUrl,
      isFeatured = false,
      status: requestedStatus,
    } = body;

    // Strict Regex Validation
    if (!name || name.trim().length < 2 || !REGEX_PATTERNS.NAME.test(name.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid full name (alphabetic characters, 2-60 chars)." },
        { status: 400 }
      );
    }

    if (!email || !REGEX_PATTERNS.EMAIL.test(email.trim().toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address (e.g. name@example.com)." },
        { status: 400 }
      );
    }

    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Please enter a summary title for your review." },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 15) {
      return NextResponse.json(
        { success: false, error: "Review comment must be at least 15 characters long." },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5 stars." },
        { status: 400 }
      );
    }

    // Rate limiting for non-admin public submissions (same email within 1 hour)
    if (!isAdmin) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existingRecent = await Feedback.findOne({
        email: email.trim().toLowerCase(),
        createdAt: { $gte: oneHourAgo },
      });

      if (existingRecent) {
        return NextResponse.json(
          {
            success: false,
            error: "You have recently submitted a review. Thank you for your feedback!",
          },
          { status: 429 }
        );
      }
    }

    // Check CMS moderation setting
    let initialStatus = "approved";
    if (isAdmin && requestedStatus) {
      initialStatus = requestedStatus;
    } else if (!isAdmin) {
      const pageConfig = await ReviewsPage.findOne({}).lean();
      if (pageConfig?.submissionSettings?.requireModeration) {
        initialStatus = "pending";
      }
    }

    const createdFeedback = await Feedback.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      relationship: relationship ? relationship.trim() : undefined,
      studentGrade: studentGrade ? studentGrade.trim() : undefined,
      rating: numRating,
      category,
      title: title.trim(),
      comment: comment.trim(),
      recommend: Boolean(recommend),
      avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
      status: initialStatus,
      isFeatured: isAdmin ? Boolean(isFeatured) : false,
      likesCount: 1,
    });

    const successMessage =
      initialStatus === "pending"
        ? "Thank you! Your review has been submitted for principal review."
        : "Thank you! Your review has been published successfully.";

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: createdFeedback,
    });
  } catch (error: any) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit feedback." },
      { status: 500 }
    );
  }
}
