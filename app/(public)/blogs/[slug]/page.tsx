import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/db/mongodb";
import Blog from "@/models/Blog";
import BlogArticleDetail from "@/components/public/BlogArticleDetail";

export const revalidate = 60;

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_BLOGS = [
  {
    _id: "fb-1",
    title: "Cultivating Critical Thinking in the Digital Age",
    slug: "cultivating-critical-thinking-in-digital-age",
    excerpt:
      "How modern educational pedagogy balances screen time with hands-on inquiry, scientific experimentation, and analytical reasoning.",
    content: `In an era saturated with immediate digital answers, learning how to ask the right questions has never been more vital for students. At Seneca Academy, our STEM and Humanities curricula are purposefully structured to move students beyond passive memorization into active, analytical inquiry.

### 1. Moving Beyond Surface-Level Answers
Modern children have access to limitless information at their fingertips. However, access to data is not the same as understanding. Our pedagogical model emphasizes:
- **Socratic Dialogue in Classrooms:** Teachers pose open-ended problems that require hypothesis formulation rather than single-word recitation.
- **Hands-On STEM Experimentation:** In our dedicated physics, chemistry, and biology laboratories, students test theories through empirical observation before reading conclusions in a textbook.
- **Structured Debates & Ethical Inquiries:** Students learn to construct evidence-backed arguments, dissect logical fallacies, and listen respectfully to contrasting viewpoints.

### 2. The Balance Between Screen Time and Deep Focus
While digital tools and programming languages like Python empower 21st-century learners, deep intellectual focus requires dedicated intervals of offline synthesis. At Seneca, we integrate interactive digital smartboards with traditional notebook writing, mental math exercises, and laboratory notebooks.

### 3. Fostering Lifelong Intellectual Independence
Our ultimate goal is not merely preparing students to achieve top marks in the BSEK Matriculation examinations—though our 100% distinction rate speaks to that excellence. We strive to graduate young women and men who possess the ethical grounding, curiosity, and intellectual discipline to lead in world-class universities and global careers.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    category: "Pedagogy",
    authorName: "M. Zohaib Ali (Principal)",
    authorRole: "Principal & Head of Pedagogy",
    publishedAt: new Date().toISOString(),
    views: "2.8k",
    readTime: "4 min read",
    shares: "420",
    tags: ["Education", "STEM", "Critical Thinking", "Pedagogy"],
  },
  {
    _id: "fb-2",
    title: "Celebrating 100% Board Distinction in Matriculation Examinations",
    slug: "celebrating-100-percent-board-distinction",
    excerpt:
      "Our 2025-2026 cohort achieved top ranks across Karachi with exceptional performance in Computer Science and Bio-Science groups.",
    content: `We are immensely proud to announce that 100% of our matriculation cohort passed with A-One and A grades in the annual Board of Secondary Education Karachi (BSEK) examinations.

### A Legacy of Board Excellence in Soldier Bazar
For 25 years, Seneca Academy has maintained an unwavering standard of academic rigor. This year's outstanding results reflect:
- **100% Pass Rate Across Science & Computer Groups:** Zero failures or compartment cases.
- **85%+ Distinction Aggregate:** The vast majority of our candidates secured A-One and A grades.
- **Top Ranks in Computer Science:** Our students demonstrated unprecedented mastery in practical coding and theory modules.

### Targeted Revision & Mock Examination Series
Our students' consistent board success is not accidental. Beginning in Grade 9, our subject department heads implement a structured mock examination schedule that mirrors official board patterns, eliminating exam anxiety and instilling confident time management.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    category: "Achievements",
    authorName: "Dr. Ayesha Siddiqui",
    authorRole: "Academic Director & Board Coordinator",
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    views: "3.5k",
    readTime: "3 min read",
    shares: "890",
    tags: ["Board Results", "Matric", "Excellence", "Distinction"],
  },
  {
    _id: "fb-3",
    title: "The Importance of Character Building Alongside Academic Rigor",
    slug: "character-building-alongside-academic-rigor",
    excerpt:
      "Why top academic grades alone are insufficient for future leadership without empathy, moral discipline, and ethical integrity.",
    content: `Academic brilliance without ethical grounding produces intellect without direction. At Seneca Academy, our Latin motto—*Non scholae, sed vitae discimus* (We learn not for school, but for life)—is the foundation of our student culture.

### The 4 Pillars of Seneca Character
1. **Integrity & Honesty:** Truthfulness in academic submissions, examinations, and personal interactions.
2. **Empathy & Community Service:** Regular participation in outreach initiatives that instill a deep sense of civic responsibility.
3. **Discipline & Self-Regulation:** Punctuality, respectful classroom decorum, and mindful speech.
4. **Resilience & Grit:** Treating setbacks in problem-solving as essential milestones toward mastery.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
    category: "School Life",
    authorName: "Sir Tariq Mehmood",
    authorRole: "Senior Faculty Educator",
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    views: "1.9k",
    readTime: "3 min read",
    shares: "310",
    tags: ["Character", "Values", "Discipline", "Ethics"],
  },
  {
    _id: "fb-4",
    title: "Empowering Young Minds Through Modern STEM & Robotics Labs",
    slug: "empowering-young-minds-through-stem-robotics",
    excerpt:
      "A look inside our newly upgraded robotics workshop, Python programming studio, and hands-on science apparatus.",
    content: `In the 21st-century economy, foundational literacy must include computational thinking and experimental science. Seneca Academy has invested heavily in upgrading its STEM laboratories in Soldier Bazar, Karachi.

### Inside the Seneca STEM Studio
- **Micro-controller Hardware Kits:** Students construct functional robotic circuits and sensor arrays.
- **Python & Algorithmic Logic:** Starting in Middle School, coding is taught as a language of creative problem-solving.
- **Separate Science Laboratories:** Dedicated, ventilated laboratories for Physics, Chemistry, and Biology ensure every student conducts individual experiments.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80",
    category: "STEM & Labs",
    authorName: "Engr. Farhan Qureshi",
    authorRole: "Head of STEM & Computer Sciences",
    publishedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    views: "2.1k",
    readTime: "4 min read",
    shares: "540",
    tags: ["STEM", "Robotics", "Coding", "Laboratories"],
  },
];

async function getArticleData(slug: string) {
  try {
    await connectToDatabase();
    const blog = await Blog.findOne({ slug, status: "published" }).lean();
    const allBlogs = await Blog.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean();

    if (blog) {
      return {
        article: JSON.parse(JSON.stringify(blog)),
        related: JSON.parse(
          JSON.stringify(allBlogs.filter((b: any) => b.slug !== slug))
        ),
      };
    }
  } catch (e) {
    console.error("Error fetching article from database:", e);
  }

  // Fallback match
  const fallbackMatch = FALLBACK_BLOGS.find((b) => b.slug === slug);
  const relatedFallbacks = FALLBACK_BLOGS.filter((b) => b.slug !== slug);

  return {
    article: fallbackMatch || FALLBACK_BLOGS[0],
    related: relatedFallbacks,
  };
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { slug } = await params;
  const { article } = await getArticleData(slug);
  return {
    title: `${article.title} — Seneca Academy Karachi`,
    description: article.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const { article, related } = await getArticleData(slug);

  if (!article) {
    notFound();
  }

  return <BlogArticleDetail article={article} related={related} />;
}
