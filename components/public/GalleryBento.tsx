"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ZoomIn, Eye, Sparkles } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  category: "all" | "campus" | "labs" | "sports" | "events";
  imageUrl: string;
  span?: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "1",
    title: "Senior STEM & Robotics Innovation Center",
    category: "labs",
    imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80",
    span: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    id: "2",
    title: "Main Campus Heritage Courtyard",
    category: "campus",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1 row-span-1",
  },
  {
    id: "3",
    title: "Annual Sports Olympiad & Athletics Track",
    category: "sports",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1 row-span-1",
  },
  {
    id: "4",
    title: "Computer Science Software Lab",
    category: "labs",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1 row-span-1",
  },
  {
    id: "5",
    title: "Annual Prize Distribution & Graduation Ceremony",
    category: "events",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1 md:col-span-2 row-span-1",
  },
  {
    id: "6",
    title: "Interactive Montessori Discovery Studio",
    category: "campus",
    imageUrl: "https://images.unsplash.com/photo-1587691592099-24045742c181?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1 row-span-1",
  },
];

import { motion, AnimatePresence } from "framer-motion";

export function GalleryBento() {
  const [activeCategory, setActiveCategory] = useState<"all" | "campus" | "labs" | "sports" | "events">("all");
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  const filteredItems =
    activeCategory === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className="py-16 sm:py-24 lg:py-28 bg-background border-t border-border overflow-hidden">
      <div className="container space-y-8 sm:space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-2 max-w-xl">
            <Badge variant="crimson">Campus Life & Facilities</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
              A Glimpse into Seneca Academy
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Explore our modern laboratories, sports grounds, digital smart classrooms, and vibrant student community events.
            </p>
          </div>

          {/* Filter Pills with Horizontal Scroll on Mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-0 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: "all", label: "All Photos" },
              { id: "campus", label: "Campus" },
              { id: "labs", label: "STEM Labs" },
              { id: "sports", label: "Sports" },
              { id: "events", label: "Events" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  activeCategory === tab.id
                    ? "bg-seneca-crimson text-white shadow-sm scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Bento Grid: 2 Cards in One Row on Mobile, 3 Cards on Large screens */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 auto-rows-[160px] sm:auto-rows-[220px]">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => setLightboxImage(item)}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer border border-border bg-muted shadow-xs hover:shadow-xl transition-all ${
                  item.span || ""
                }`}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-75 group-hover:opacity-95 transition-opacity" />

                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 text-white flex items-end justify-between gap-1.5">
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-seneca-amber-light block truncate">
                      {item.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold font-heading line-clamp-2 leading-tight drop-shadow-xs">
                      {item.title}
                    </h4>
                  </div>
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
          {lightboxImage && (
            <div className="relative rounded-3xl overflow-hidden bg-black/90 p-2 shadow-2xl">
              <div className="relative h-[60vh] sm:h-[75vh] w-full rounded-2xl overflow-hidden">
                <Image
                  src={lightboxImage.imageUrl}
                  alt={lightboxImage.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-4 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-seneca-amber-light">
                    {lightboxImage.category}
                  </span>
                  <h3 className="text-base font-bold font-heading">
                    {lightboxImage.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default GalleryBento;
