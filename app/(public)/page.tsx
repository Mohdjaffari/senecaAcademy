import connectToDatabase from "@/lib/db/mongodb";
import WebsiteSettings from "@/models/WebsiteSettings";
import AboutPage from "@/models/AboutPage";
import AdmissionsPage from "@/models/AdmissionsPage";
import AcademicsPage from "@/models/AcademicsPage";
import Feedback from "@/models/Feedback";
import Blog from "@/models/Blog";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import School from "@/models/School";

import HeroSection from "@/components/public/home/HeroSection";
import type { LiveStats } from "@/components/public/home/HeroSection";
import SenecaDifferenceSection from "@/components/public/home/SenecaDifferenceSection";
import AcademicPathwaysSection from "@/components/public/home/AcademicPathwaysSection";
import LeadershipPerspectiveSection from "@/components/public/home/LeadershipPerspectiveSection";
import CommunityVoicesSection from "@/components/public/home/CommunityVoicesSection";
import KnowledgePerspectivesSection from "@/components/public/home/KnowledgePerspectivesSection";
import AdmissionsCtaBanner from "@/components/public/home/AdmissionsCtaBanner";

export const revalidate = 60;

async function getHomepageData() {
  try {
    await connectToDatabase();

    // Find the active school for scoped queries
    const school =
      (await School.findOne({ status: "active" }).lean()) ||
      (await School.findOne({}).lean());

    const schoolId = school ? (school as { _id: unknown })._id : null;

    const [
      settings,
      blogs,
      currentStudents,
      alumniStudents,
      totalFaculty,
      aboutDoc,
      admissionsDoc,
      academicsDoc,
      feedbackDocs,
      feedbackCount,
    ] = await Promise.all([
      WebsiteSettings.findOne().lean(),
      Blog.find({ status: "published" })
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean(),
      schoolId
        ? Student.countDocuments({ schoolId, status: "active" })
        : Promise.resolve(0),
      schoolId
        ? Student.countDocuments({ schoolId, status: "graduated" })
        : Promise.resolve(0),
      schoolId
        ? Teacher.countDocuments({
            schoolId,
            status: { $in: ["active", "on_leave"] },
          })
        : Promise.resolve(0),
      schoolId
        ? AboutPage.findOne({ schoolId }).lean()
        : AboutPage.findOne().lean(),
      schoolId
        ? AdmissionsPage.findOne({ schoolId }).lean()
        : AdmissionsPage.findOne().lean(),
      schoolId
        ? AcademicsPage.findOne({ schoolId }).lean()
        : AcademicsPage.findOne().lean(),
      Feedback.find({ status: "approved" })
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(6)
        .lean(),
      Feedback.countDocuments({ status: "approved" }),
    ]);

    const liveStats: LiveStats = { currentStudents, alumniStudents, totalFaculty };

    // Format principal message directly from the AboutPage database
    const principal = (aboutDoc as { principal?: { name?: string; designation?: string; heading?: string; messageParagraphs?: string[]; photoUrl?: string } } | null)?.principal;
    const principalData = principal
      ? {
          name: principal.name,
          title: principal.designation,
          quote: principal.heading || "A Message to Parents and Guardians",
          description: Array.isArray(principal.messageParagraphs)
            ? principal.messageParagraphs[0] || ""
            : principal.messageParagraphs || "",
          imgUrl: principal.photoUrl,
        }
      : (settings as { principalMessage?: { name?: string; title?: string; quote?: string; description?: string; imgUrl?: string } } | null)?.principalMessage;

    // Format admissions status & info directly from the AdmissionsPage database
    const admissionsGlobal = (admissionsDoc as { globalSettings?: { admissionsOpen?: boolean; admissionsSession?: string; admissionsNotice?: string; admissionsClosedNotice?: string } } | null)?.globalSettings;
    const isAdmissionsOpen =
      admissionsGlobal?.admissionsOpen !== undefined
        ? admissionsGlobal.admissionsOpen
        : (settings as { admissionsOpen?: boolean } | null)?.admissionsOpen !== false;

    const admissionsData = admissionsGlobal
      ? {
          admissionsSession: admissionsGlobal.admissionsSession,
          admissionsNotice: admissionsGlobal.admissionsNotice,
          admissionsClosedNotice: admissionsGlobal.admissionsClosedNotice,
        }
      : settings;

    // Format Seneca Difference pillars from AcademicsPage database
    const academicsTyped = academicsDoc as any;
    const rawPillars = academicsTyped?.senecaDifference?.items;
    const differencePillars =
      Array.isArray(rawPillars) && rawPillars.length > 0
        ? rawPillars.filter((p: any) => p.isVisible !== false)
        : (settings as any)?.senecaDifference;

    const differenceBadge = academicsTyped?.senecaDifference?.badge || "The Seneca Difference";
    const differenceHeading = academicsTyped?.senecaDifference?.heading || "Why Families Choose Seneca Academy";
    const differenceDesc = academicsTyped?.senecaDifference?.description || "";

    // Format Academic Pathways from AcademicsPage database (academicDivisions)
    const rawDivisions = academicsTyped?.academicDivisions?.items;
    const academicPathways =
      Array.isArray(rawDivisions) && rawDivisions.length > 0
        ? rawDivisions.filter((d: any) => d.isActive !== false)
        : (settings as any)?.academicStages;

    // Format Testimonials from Feedback database
    const testimonials = Array.isArray(feedbackDocs) && feedbackDocs.length > 0
      ? feedbackDocs.map((f: any) => ({
          name: f.name,
          role: f.role,
          relationship: f.relationship,
          studentGrade: f.studentGrade,
          rating: f.rating,
          category: f.category,
          title: f.title,
          comment: f.comment,
          avatarUrl: f.avatarUrl,
          recommend: f.recommend,
          isFeatured: f.isFeatured,
          likesCount: f.likesCount || 0,
          createdAt: f.createdAt,
        }))
      : [];

    return {
      settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
      blogs: blogs ? JSON.parse(JSON.stringify(blogs)) : [],
      liveStats,
      principalData: principalData ? JSON.parse(JSON.stringify(principalData)) : null,
      isAdmissionsOpen,
      admissionsData: admissionsData ? JSON.parse(JSON.stringify(admissionsData)) : null,
      differencePillars: differencePillars ? JSON.parse(JSON.stringify(differencePillars)) : undefined,
      differenceBadge,
      differenceHeading,
      differenceDesc,
      academicPathways: academicPathways ? JSON.parse(JSON.stringify(academicPathways)) : undefined,
      testimonials: testimonials.length > 0 ? JSON.parse(JSON.stringify(testimonials)) : undefined,
      feedbackCount: feedbackCount || 0,
    };
  } catch (err) {
    console.error("Homepage data query error:", err);
    return {
      settings: null,
      blogs: [],
      liveStats: { currentStudents: 0, alumniStudents: 0, totalFaculty: 0 },
      principalData: null,
      isAdmissionsOpen: true,
      admissionsData: null,
      differencePillars: undefined,
      differenceBadge: "The Seneca Difference",
      differenceHeading: "Why Families Choose Seneca Academy",
      differenceDesc: "",
      academicPathways: undefined,
      testimonials: undefined,
      feedbackCount: 0,
    };
  }
}

export default async function HomePage() {
  const {
    settings,
    blogs,
    liveStats,
    principalData,
    isAdmissionsOpen,
    admissionsData,
    differencePillars,
    differenceBadge,
    differenceHeading,
    differenceDesc,
    academicPathways,
    testimonials,
    feedbackCount,
  } = await getHomepageData();

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
      {/* 1. Hero Section */}
      <HeroSection
        heroData={settings?.hero}
        statsData={settings?.stats}
        admissionsOpen={isAdmissionsOpen}
        liveStats={liveStats}
      />

      {/* 2. The Seneca Difference Feature Grid (from Academics DB) */}
      <SenecaDifferenceSection
        pillars={differencePillars}
        badge={differenceBadge}
        heading={differenceHeading}
        description={differenceDesc}
      />

      {/* 3. Academic Pathways Spectrum (from Academics DB) */}
      <AcademicPathwaysSection stages={academicPathways} />

      {/* 4. Leadership Perspective Message (from About page DB) */}
      <LeadershipPerspectiveSection principalData={principalData} />

      {/* 5. Community Voices & Testimonials (from Feedback DB) */}
      <CommunityVoicesSection
        testimonials={testimonials}
        totalReviews={feedbackCount}
      />

      {/* 6. Knowledge & Perspectives (from Blogs DB) */}
      <KnowledgePerspectivesSection blogs={blogs} />

      {/* 7. Session Admissions CTA Banner (from Admissions DB) */}
      <AdmissionsCtaBanner
        admissionsOpen={isAdmissionsOpen}
        admissionsData={admissionsData}
      />
    </div>
  );
}
