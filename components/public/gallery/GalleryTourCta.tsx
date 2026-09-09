"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";

export function GalleryTourCta() {
  const { admissionsOpen } = usePublicWebsite();

  return (
    <section className="py-16 sm:py-20 bg-card/60 border-t border-border">
      <div className="container text-center max-w-2xl space-y-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
          Want to See Seneca Academy in Person?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We welcome prospective parents and students for a personalized tour of our Soldier Bazar campus facilities.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Button asChild variant="glow" className="rounded-full px-8 font-bold">
            <Link href="/contact">Book a Guided Campus Tour</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-7 font-semibold">
            {admissionsOpen ? (
              <Link href="/admissions">Apply Online Now</Link>
            ) : (
              <Link href="/contact">Inquire for Next Session</Link>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default GalleryTourCta;

