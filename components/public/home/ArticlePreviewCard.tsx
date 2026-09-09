import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export interface ArticlePreviewCardProps {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  category?: string;
  authorName?: string;
  publishedAt?: string;
  createdAt?: string;
}

export function ArticlePreviewCard({
  title,
  slug,
  excerpt,
  coverImageUrl,
  category = "Insights",
  authorName = "Faculty Author",
  publishedAt,
  createdAt,
}: ArticlePreviewCardProps) {
  return (
    <Link
      href={`/blogs/${slug}`}
      className="overflow-hidden border border-border/80 bg-card/90 shadow-xs hover:shadow-xl hover:border-seneca-crimson/40 dark:hover:border-seneca-amber/40 transition-all duration-300 group flex flex-col justify-between rounded-3xl"
    >
      <div>
        <div className="relative h-52 w-full bg-muted overflow-hidden">
          <Image
            src={
              coverImageUrl ||
              "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
            }
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3.5 left-3.5">
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-card/95 text-foreground backdrop-blur-md shadow-xs border border-border/80">
              {category}
            </span>
          </div>
        </div>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>{authorName}</span>
            <span>•</span>
            <span>{formatDate(publishedAt || createdAt || new Date().toISOString())}</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        </CardContent>
      </div>
      <div className="px-6 pb-6 pt-0">
        <span className="text-xs font-bold text-seneca-crimson dark:text-seneca-amber-light group-hover:underline inline-flex items-center gap-1.5">
          <span>Read Full Article</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export default ArticlePreviewCard;
