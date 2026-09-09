"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, Star, Sparkles } from "lucide-react";
import FeedbackSubmitModal from "./FeedbackSubmitModal";

export function FloatingFeedbackTrigger() {
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();

  // If already on the feedback page, don't show the duplicate floating button
  if (pathname === "/feedback") {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setModalOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-seneca-crimson via-seneca-crimson-dark to-zinc-900 text-white font-bold text-xs shadow-xl shadow-seneca-crimson/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-400/40 backdrop-blur-md"
          title="Share your review or feedback about Seneca Academy"
        >
          {/* Animated Glow Beacon */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
          </span>

          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Share Feedback</span>
          <span className="sm:hidden">Feedback</span>
        </button>
      </div>

      <FeedbackSubmitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

export default FloatingFeedbackTrigger;
