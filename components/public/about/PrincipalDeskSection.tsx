import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_ABOUT_PAGE_DATA, IPrincipalData } from "@/lib/db/about-page-defaults";

interface PrincipalDeskSectionProps {
  data?: IPrincipalData;
}

export function PrincipalDeskSection({ data = DEFAULT_ABOUT_PAGE_DATA.principal }: PrincipalDeskSectionProps) {
  if (data?.isVisible === false) {
    return null;
  }

  return (
    <section id="principal" className="py-16 lg:py-24 bg-card/60 border-b border-border">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Principal Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[420px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-background bg-muted">
              {data.photoUrl ? (
                <Image
                  src={data.photoUrl}
                  alt={data.photoAlt || data.name || "Principal Photo"}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-bold">
                  {data.name}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <h3 className="text-xl font-bold font-heading">{data.name}</h3>
                <p className="text-xs text-seneca-amber-light font-semibold">
                  {data.designation}
                </p>
              </div>
            </div>
          </div>

          {/* Principal Written Message */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <Badge variant="crimson">{data.badge || "From the Principal's Desk"}</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
                {data.heading || "A Message to Parents and Guardians"}
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {data.messageParagraphs && data.messageParagraphs.length > 0 ? (
                data.messageParagraphs.map((para, idx) => <p key={idx}>{para}</p>)
              ) : (
                <p>Welcome to Seneca Academy.</p>
              )}
            </div>

            <div className="pt-4 border-t border-border/80 flex items-center justify-between">
              <div>
                <div className="font-heading font-bold text-foreground">{data.name}</div>
                {data.qualification && (
                  <div className="text-xs text-muted-foreground">{data.qualification}</div>
                )}
              </div>
              {data.office && (
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-seneca-crimson dark:text-seneca-amber-light">
                    {data.office}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrincipalDeskSection;
