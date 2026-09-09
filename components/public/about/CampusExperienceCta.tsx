import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_ABOUT_PAGE_DATA, ICampusCtaData } from "@/lib/db/about-page-defaults";

interface CampusExperienceCtaProps {
  data?: ICampusCtaData;
}

export function CampusExperienceCta({ data = DEFAULT_ABOUT_PAGE_DATA.campusCta }: CampusExperienceCtaProps) {
  if (data?.isVisible === false) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-card/60 border-t border-border">
      <div className="container text-center max-w-2xl space-y-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
          {data.heading || "Experience Our Campus in Person"}
        </h3>
        {data.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        )}
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          {data.primaryCta?.isVisible !== false && (
            <Button asChild variant="glow" className="rounded-full px-8 font-bold">
              <Link href={data.primaryCta?.href || "/contact"}>
                {data.primaryCta?.text || "Book a Guided Campus Tour"}
              </Link>
            </Button>
          )}
          {data.secondaryCta?.isVisible !== false && (
            <Button asChild variant="outline" className="rounded-full px-7 font-semibold">
              <Link href={data.secondaryCta?.href || "/gallery"}>
                {data.secondaryCta?.text || "View Campus Gallery"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default CampusExperienceCta;
