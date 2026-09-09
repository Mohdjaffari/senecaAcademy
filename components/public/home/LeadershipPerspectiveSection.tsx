"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PrincipalMessageProps {
  name?: string;
  title?: string;
  quote?: string;
  description?: string;
  imgUrl?: string;
}

interface LeadershipPerspectiveSectionProps {
  principalData?: PrincipalMessageProps;
}

export function LeadershipPerspectiveSection({ principalData }: LeadershipPerspectiveSectionProps) {
  const [data, setData] = useState<PrincipalMessageProps>(principalData || {});

  useEffect(() => {
    if (principalData) setData(principalData);
  }, [principalData]);

  useEffect(() => {
    async function loadDynamic() {
      try {
        const res = await fetch("/api/website/about");
        const json = await res.json();
        if (json.success && json.data?.page?.principal) {
          const p = json.data.page.principal;
          setData({
            name: p.name,
            title: p.designation,
            quote: p.heading || "A Message to Parents and Guardians",
            description: Array.isArray(p.messageParagraphs)
              ? p.messageParagraphs[0] || ""
              : p.messageParagraphs || "",
            imgUrl: p.photoUrl,
          });
        }
      } catch (_) {}
    }
    loadDynamic();
  }, []);

  const name = data.name || "Dr. Ayesha Siddiqui";
  const title = data.title || "Executive Principal & Academic Director";
  const quote =
    data.quote || "We don't just teach students; we nurture the ethical leaders of tomorrow.";
  const description =
    data.description ||
    "Welcome to Seneca Academy. As educational leaders, our sacred responsibility is to ignite curiosity, instill empathy, and provide an uncompromising standard of academic excellence. When a student steps into Seneca, they become part of a legacy dedicated to their comprehensive growth.";
  const imgUrl =
    data.imgUrl || "https://images.unsplash.com/photo-1554126807-6b10f6f6692a?auto=format&fit=crop&w=600&q=80";

  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-seneca-crimson/5 dark:to-seneca-crimson/10 p-8 sm:p-14 shadow-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="lg:col-span-4 relative"
            >
              <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden shadow-lg border-2 border-seneca-crimson/80 bg-muted group">
                <Image
                  src={imgUrl}
                  alt={`Principal ${name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="lg:col-span-8 space-y-6"
            >
              <Badge variant="crimson">{data.quote ? "Executive Principal Message" : "Leadership Perspective"}</Badge>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-tight">
                &ldquo;{quote}&rdquo;
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border/80">
                <div>
                  <div className="font-heading font-bold text-foreground">{name}</div>
                  <div className="text-xs text-seneca-crimson dark:text-seneca-amber-light font-semibold">
                    {title}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/about" className="font-bold text-xs">Read Full Message</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default LeadershipPerspectiveSection;

