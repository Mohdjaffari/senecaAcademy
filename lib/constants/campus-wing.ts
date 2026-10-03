export type CampusWing = "all" | "junior" | "senior";

export interface CampusWingConfig {
  id: CampusWing;
  name: string;
  shortName: string;
  tagline: string;
  badge: string;
  description: string;
  gradeRange: string;
  iconName: string;
  colorClass: string;
}

export const CAMPUS_WINGS: Record<CampusWing, CampusWingConfig> = {
  all: {
    id: "all",
    name: "Dual-Campus Institutional Master",
    shortName: "All Campuses",
    tagline: "Consolidated Institutional Oversight",
    badge: "Master View",
    description: "Holistic institutional intelligence across all wings from Playgroup to 2nd Year College.",
    gradeRange: "Playgroup – 2nd Year (College)",
    iconName: "Globe",
    colorClass: "from-zinc-900 via-neutral-900 to-zinc-950",
  },
  junior: {
    id: "junior",
    name: "Junior Campus Portal",
    shortName: "Junior Wing (≤ Gr 2)",
    tagline: "Early Childhood & Lower Primary Command",
    badge: "Junior Wing (≤ Gr 2)",
    description: "Dedicated executive suite for Playgroup, Nursery, Prep/KG, Grade 1, and Grade 2 (Ages 3 – 8).",
    gradeRange: "Playgroup to Grade 2",
    iconName: "Sparkles",
    colorClass: "from-amber-700 via-seneca-crimson to-zinc-950",
  },
  senior: {
    id: "senior",
    name: "Senior Campus Portal",
    shortName: "Senior Wing (> Gr 2)",
    tagline: "Upper Primary, Secondary & College Command",
    badge: "Senior Wing (> Gr 2)",
    description: "Dedicated executive suite for Grade 3 to Grade 12 / 2nd Year College (Matric, Cambridge & Intermediate).",
    gradeRange: "Grade 3 to 2nd Year College",
    iconName: "GraduationCap",
    colorClass: "from-seneca-crimson via-seneca-crimson-dark to-slate-950",
  },
};

/**
 * Checks if a numeric gradeLevel belongs to Junior Wing (<= 2).
 * Note: Playgroup, Nursery, Prep have gradeLevel = 0.
 * Grade 1 = 1, Grade 2 = 2.
 */
export function isJuniorGrade(gradeLevel: number): boolean {
  return gradeLevel <= 2;
}

/**
 * Checks if a numeric gradeLevel belongs to Senior Wing (> 2).
 */
export function isSeniorGrade(gradeLevel: number): boolean {
  return gradeLevel > 2;
}

/**
 * Determines the campus wing from a class name or gradeLevel
 */
export function resolveClassWing(gradeLevel?: number, className?: string): "junior" | "senior" {
  if (typeof gradeLevel === "number") {
    return gradeLevel <= 2 ? "junior" : "senior";
  }

  if (className) {
    const c = className.toLowerCase();
    if (
      c.includes("playgroup") ||
      c.includes("nursery") ||
      c.includes("prep") ||
      c.includes("kg") ||
      c.includes("kindergarten") ||
      c.includes("grade 1") ||
      c.includes("class 1") ||
      c.includes("grade 2") ||
      c.includes("class 2")
    ) {
      return "junior";
    }
  }

  return "senior";
}

/**
 * Determine the wings taught by a teacher based on their assigned classes & head of classes
 */
export function resolveTeacherWing(teacher: {
  assignedClasses?: string[];
  headOfClassNames?: string[];
  assignedClassDetails?: Array<{ gradeLevel?: number; name?: string }>;
  headOfClasses?: Array<{ gradeLevel?: number; name?: string }>;
  specialization?: string;
}): "junior" | "senior" | "both" | "unassigned" {
  let hasJunior = false;
  let hasSenior = false;

  // Check structured class details
  const allDetails = [
    ...(teacher.assignedClassDetails || []),
    ...(teacher.headOfClasses || []),
  ];

  if (allDetails.length > 0) {
    allDetails.forEach((c) => {
      const wing = resolveClassWing(c.gradeLevel, c.name);
      if (wing === "junior") hasJunior = true;
      if (wing === "senior") hasSenior = true;
    });
  } else {
    // Fallback to string names
    const classNames = [
      ...(teacher.assignedClasses || []),
      ...(teacher.headOfClassNames || []),
    ];

    if (classNames.length > 0) {
      classNames.forEach((name) => {
        const wing = resolveClassWing(undefined, name);
        if (wing === "junior") hasJunior = true;
        if (wing === "senior") hasSenior = true;
      });
    }
  }

  // Check specialization if still unassigned
  if (!hasJunior && !hasSenior && teacher.specialization) {
    const spec = teacher.specialization.toLowerCase();
    if (
      spec.includes("montessori") ||
      spec.includes("early childhood") ||
      spec.includes("ece") ||
      spec.includes("kindergarten") ||
      spec.includes("nursery")
    ) {
      return "junior";
    }
  }

  if (hasJunior && hasSenior) return "both";
  if (hasJunior) return "junior";
  if (hasSenior) return "senior";
  return "unassigned";
}
