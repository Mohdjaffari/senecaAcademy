import GalleryHeroSection from "@/components/public/gallery/GalleryHeroSection";
import GalleryBento from "@/components/public/GalleryBento";
import GalleryTourCta from "@/components/public/gallery/GalleryTourCta";

export const metadata = {
  title: "Campus Gallery & Student Life — Seneca Academy Karachi",
  description:
    "Explore photos of Seneca Academy's modern science laboratories, robotics center, digital classrooms, annual sports events, and vibrant campus life in Karachi.",
};

export default function GalleryPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* 1. Page Hero */}
      <GalleryHeroSection />

      {/* 2. Interactive Bento Gallery Component */}
      <GalleryBento />

      {/* 3. Guided Tour CTA */}
      <GalleryTourCta />
    </main>
  );
}
