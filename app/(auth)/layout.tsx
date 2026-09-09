import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col justify-between bg-gradient-to-br from-background via-muted/30 to-seneca-crimson/5 selection:bg-seneca-crimson selection:text-white">
      {/* Top Header - Compact & Clean */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/admissions"
          className="text-xs font-bold text-seneca-crimson dark:text-seneca-amber-light hover:underline hidden sm:inline-block py-1"
        >
          Admissions 2026–2027 Open →
        </Link>
      </header>

      {/* Main Content Area - Centered & Zero Overflow */}
      <main className="w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-center py-2 sm:py-4 px-3 sm:px-4 overflow-x-hidden">
        {children}
      </main>

      {/* Footer - Compact */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-2.5 sm:py-3 text-center text-[11px] text-muted-foreground shrink-0">
        © 2026 Seneca Academy. All rights reserved. Soldier Bazar, Karachi.
      </footer>
    </div>
  );
}
