import connectToDatabase from "@/lib/db/mongodb";
import Blog from "@/models/Blog";
import BlogSection from "@/components/public/BlogSection";
import BlogsHeroSection from "@/components/public/blogs/BlogsHeroSection";

export const revalidate = 60;

export const metadata = {
  title: "News, Articles & Academic Insights — Seneca Academy Karachi",
  description:
    "Read the latest articles, academic research, board exam preparation tips, and campus news from the faculty and leadership of Seneca Academy Karachi.",
};

async function getBlogs() {
  try {
    await connectToDatabase();
    const blogs = await Blog.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(blogs));
  } catch (e) {
    console.error("Error querying blogs:", e);
    return [];
  }
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <main className="flex flex-col min-h-screen">
      {/* 1. Page Hero */}
      <BlogsHeroSection />

      {/* 2. Interactive Blog Cards & Reader Modal */}
      <BlogSection blogs={blogs} />
    </main>
  );
}
