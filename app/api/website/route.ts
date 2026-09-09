import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import WebsiteSettings from "@/models/WebsiteSettings";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";

const DEFAULT_NAVBAR_LINKS = [
  { label: "Home", href: "/", isVisible: true, order: 1 },
  { label: "About Us", href: "/about", isVisible: true, order: 2 },
  { label: "Academics", href: "/academics", isVisible: true, order: 3 },
  { label: "Admissions", href: "/admissions", isVisible: true, order: 4 },
  { label: "Faculty", href: "/faculty", isVisible: true, order: 5 },
  { label: "Fee Structure", href: "/fees", isVisible: true, order: 6 },
  { label: "Gallery", href: "/gallery", isVisible: true, order: 7 },
  { label: "Blog & News", href: "/blogs", isVisible: true, order: 8 },
  { label: "Contact", href: "/contact", isVisible: true, order: 9 },
  { label: "FAQs", href: "/faqs", isVisible: true, order: 10 },
];

const DEFAULT_FEE_TIERS = [
  {
    name: "Preschool Wing",
    badge: "Foundation",
    badgeColor: "emerald",
    gradeRange: "Playgroup to Kindergarten",
    admissionFee: "Rs. 15,000",
    securityDeposit: "Rs. 5,000",
    monthlyTuition: "Rs. 6,500",
    annualCharges: "Rs. 4,000",
    labFund: "",
    features: [
      "Activity-based Montessori Phonics",
      "Sensory & Motor Skills Laboratory",
      "Air-Conditioned Themed Rooms",
      "Regular Pediatric Health Checkups",
    ],
    isPopular: false,
    order: 1,
    isActive: true,
  },
  {
    name: "Primary School",
    badge: "Popular",
    badgeColor: "amber",
    gradeRange: "Grade 1 to Grade 5",
    admissionFee: "Rs. 20,000",
    securityDeposit: "Rs. 8,000",
    monthlyTuition: "Rs. 7,500",
    annualCharges: "Rs. 5,000",
    labFund: "",
    features: [
      "Core STEM & Conceptual Mathematics",
      "Bilingual English/Urdu Fluency",
      "Junior Science & Computer Lab",
      "Physical Education & Sports Training",
    ],
    isPopular: true,
    order: 2,
    isActive: true,
  },
  {
    name: "Middle School",
    badge: "Advanced",
    badgeColor: "sky",
    gradeRange: "Grade 6 to Grade 8",
    admissionFee: "Rs. 25,000",
    securityDeposit: "Rs. 10,000",
    monthlyTuition: "Rs. 8,500",
    annualCharges: "Rs. 6,000",
    labFund: "",
    features: [
      "Advanced Coding & Robotics Studio",
      "Analytical Sciences Laboratory",
      "Debate & Public Speaking Society",
      "Term-wise Comprehensive Assessments",
    ],
    isPopular: false,
    order: 3,
    isActive: true,
  },
  {
    name: "High School / O-Level",
    badge: "Leadership",
    badgeColor: "crimson",
    gradeRange: "Grade 9 & Grade 10",
    admissionFee: "Rs. 35,000",
    securityDeposit: "Rs. 10,000",
    monthlyTuition: "Rs. 11,500",
    annualCharges: "Rs. 8,000",
    labFund: "Rs. 5,000",
    features: [
      "Targeted Board Examination Coaching",
      "Physics, Chemistry & Bio Experimentation",
      "Computer Science Practical Projects",
      "Career Guidance & University Counseling",
    ],
    isPopular: false,
    order: 4,
    isActive: true,
  },
];

const DEFAULT_ACADEMIC_STAGES = [
  {
    name: "Preschool / Montessori",
    badge: "Early Years",
    badgeColor: "emerald",
    gradeRange: "Playgroup to Kindergarten (Ages 3–5)",
    description: "Montessori & Play-based foundational literacy, sensory motor apparatus, and cheerful thematic discovery.",
    highlights: ["Montessori Practical Life Apparatus", "Jolly Phonics & Pre-Reading Fluency", "Air-Conditioned Themed Rooms"],
    image: "https://images.unsplash.com/photo-1587691592099-24045742c181?auto=format&fit=crop&w=800&q=80",
    order: 1,
    isActive: true,
  },
  {
    name: "Primary School",
    badge: "Grades 1–5",
    badgeColor: "sky",
    gradeRange: "Grade 1 to Grade 5 (Ages 6–10)",
    description: "Core conceptual inquiry in mathematics and languages, Singapore CPA methodology, and active nature studies.",
    highlights: ["Conceptual Mathematics & Logic", "Bilingual English/Urdu Fluency", "Junior Science Discovery Laboratory"],
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    order: 2,
    isActive: true,
  },
  {
    name: "Middle School",
    badge: "Grades 6–8",
    badgeColor: "indigo",
    gradeRange: "Grade 6 to Grade 8 (Ages 11–13)",
    description: "Rigorous preparation bridging primary to O-Level, separate science laboratories, Python coding, and debate society.",
    highlights: ["Physics, Chemistry & Bio Experimentation", "Advanced Python & Algorithmic Thinking", "Model UN & Public Speaking Society"],
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
    order: 3,
    isActive: true,
  },
  {
    name: "BSEK Matric & Cambridge O-Level",
    badge: "Grades 9–10",
    badgeColor: "crimson",
    gradeRange: "Grade 9 & Grade 10 (Ages 14–16)",
    description: "Cambridge CAIE O-Level and BSEK Matriculation science cohorts with intensive exam coaching and university prep.",
    highlights: ["Computer Science & Bio-Science Cohorts", "Intensive Board Mock Series & Practicals", "100% Board Distinction Track Record"],
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    order: 4,
    isActive: true,
  },
  {
    name: "Robotics & AI Innovation Labs",
    badge: "Next-Gen STEM",
    badgeColor: "amber",
    gradeRange: "All Grade Levels",
    description: "State-of-the-art physics, chemistry, and robotics AI laboratories equipped with microcontrollers and 3D prototyping.",
    highlights: ["Microcontroller Programming & Sensors", "3D Printing & Prototyping Workshop", "National Robotics & Tech Competitions"],
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
    order: 5,
    isActive: true,
  },
];

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let settings = await WebsiteSettings.findOne({ schoolId: school._id }).lean();

    if (!settings) {
      settings = (await WebsiteSettings.create({
        schoolId: school._id,
        admissionsOpen: true,
        admissionsNotice: "ADMISSIONS OPEN FOR SESSION 2026–27 (LIMITED SEATS)",
        navbarLinks: DEFAULT_NAVBAR_LINKS,
        hero: {
          badge: "ADMISSIONS OPEN FOR SESSION 2026–27",
          title1: "Shaping Leaders of",
          title2: "Tomorrow at Seneca",
          description:
            "A premier institution committed to academic rigor, moral integrity, modern robotics, and character building from Playgroup to O-Level.",
          ctaText: "Apply for Admission",
          ctaLink: "/admissions",
          img1Url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80",
          img2Url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
        },
        stats: [
          { value: "18+", label: "Years of Heritage" },
          { value: "1,200+", label: "Alumni Leaders" },
          { value: "100%", label: "Matric & O-Level Success" },
          { value: "1:10", label: "Teacher-Student Ratio" },
        ],
        about: {
          subtitle: "LEGACY OF EXCELLENCE",
          title: "Empowering Minds Through Holistic Education",
          description:
            "Located at Soldier Bazar, Karachi, Seneca Academy provides an enriched learning ecosystem combining international Cambridge standards with strong core values.",
          badges: ["Cambridge Certified Faculty", "Robotics & AI Labs", "Comprehensive Sports Complex"],
          years: "18+",
          yearsLabel: "Years of Educational Legacy",
          imgUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
        },
        visionMission: {
          vision: "To cultivate intellectually resilient, ethically grounded, and visionary global leaders.",
          mission: "Providing transformative, student-centric pedagogy fostering critical thinking, compassion, and innovation.",
        },
        principalMessage: {
          name: "Dr. Ayesha Siddiqui",
          title: "Principal & Academic Director",
          quote: "Education is not merely the transmission of knowledge; it is the ignition of character.",
          description:
            "Welcome to Seneca Academy. Our faculty is dedicated to creating a nurturing yet challenging environment where every student discovers their highest potential.",
          imgUrl: "https://images.unsplash.com/photo-1554126807-6b10f6f6692a?auto=format&fit=crop&w=800&q=80",
        },
        fees: {
          preschool: { admission: "Rs. 15,000", security: "Rs. 5,000", tuition: "Rs. 6,500" },
          middle: { admission: "Rs. 25,000", security: "Rs. 10,000", tuition: "Rs. 8,500" },
          high: { admission: "Rs. 35,000", lab: "Rs. 5,000", tuition: "Rs. 11,500" },
        },
        contact: {
          address: "Soldier Bazar, Garden East, Karachi, Pakistan",
          phone: "+92 21 3225 1234",
          email: "info@seneca.edu.pk",
          hours: "Mon - Sat: 08:00 AM - 03:00 PM",
        },
        footer: {
          brandDesc: "Building character, cultivating intellect, and engineering the leaders of the next generation.",
          copyrightText: "© 2026 Seneca Academy. All rights reserved.",
          facebook: "https://facebook.com",
          instagram: "https://instagram.com",
          linkedin: "https://linkedin.com",
          youtube: "https://youtube.com",
        },
      })) as any;
    } else if (!settings.navbarLinks || settings.navbarLinks.length === 0) {
      settings = await WebsiteSettings.findByIdAndUpdate(
        settings._id,
        { $set: { navbarLinks: DEFAULT_NAVBAR_LINKS } },
        { new: true }
      ).lean();
    }

    if (settings && (!settings.feeTiers || (settings as any).feeTiers.length === 0)) {
      (settings as any).feeTiers = DEFAULT_FEE_TIERS;
    }

    if (settings && (!settings.academicStages || (settings as any).academicStages.length === 0)) {
      (settings as any).academicStages = DEFAULT_ACADEMIC_STAGES;
    }

    const response = apiSuccess({ settings }, "Website settings retrieved successfully.");
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can update public website content.");
    }

    const body = await req.json();

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) throw new Error("School missing.");

    const settings = await WebsiteSettings.findOneAndUpdate(
      { schoolId: school._id },
      { $set: body },
      { new: true, upsert: true }
    );

    return apiSuccess({ settings }, "Website content and public parameters updated successfully!");
  } catch (error) {
    return apiError(error);
  }
}
