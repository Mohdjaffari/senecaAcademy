import {
  GraduationCap,
  BookOpen,
  HeartHandshake,
  Award,
  Shield,
  Sparkles,
  CheckCircle2,
  Users,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TeachingStandardCard from "./TeachingStandardCard";
import { IFacultyStandardsData, DEFAULT_FACULTY_PAGE_DATA } from "@/lib/db/faculty-page-defaults";

export function FacultyStandardsSection({ standards }: { standards?: IFacultyStandardsData }) {
  const standardsData = standards || DEFAULT_FACULTY_PAGE_DATA.standards;

  if (standardsData.isVisible === false) {
    return null;
  }

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="h-6 w-6 text-seneca-amber" />;
      case "HeartHandshake":
        return <HeartHandshake className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
      case "Award":
        return <Award className="h-6 w-6 text-seneca-crimson dark:text-seneca-amber-light" />;
      case "Shield":
        return <Shield className="h-6 w-6 text-sky-600 dark:text-sky-400" />;
      case "Sparkles":
        return <Sparkles className="h-6 w-6 text-amber-500" />;
      case "Users":
        return <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
      case "Compass":
        return <Compass className="h-6 w-6 text-seneca-crimson" />;
      case "GraduationCap":
      default:
        return <GraduationCap className="h-6 w-6 text-seneca-crimson dark:text-seneca-amber-light" />;
    }
  };

  const items = (standardsData.items || DEFAULT_FACULTY_PAGE_DATA.standards.items).filter(
    (item) => item.isVisible !== false
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30 border-t border-border">
      <div className="container space-y-10 sm:space-y-12 px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {standardsData.badge && (
            <Badge variant="outline" className="rounded-full px-3.5 py-1 text-xs font-semibold">
              {standardsData.badge}
            </Badge>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            {standardsData.heading}
          </h2>
          {standardsData.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {standardsData.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((st, idx) => (
            <TeachingStandardCard
              key={st.id || idx}
              icon={renderIcon(st.icon)}
              title={st.title}
              desc={st.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FacultyStandardsSection;
