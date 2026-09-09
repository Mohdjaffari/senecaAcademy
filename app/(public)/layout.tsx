import type { ReactNode } from "react";
import connectToDatabase from "@/lib/db/mongodb";
import WebsiteSettings from "@/models/WebsiteSettings";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import { PublicWebsiteProvider } from "@/context/PublicWebsiteContext";
import FloatingFeedbackTrigger from "@/components/public/feedback/FloatingFeedbackTrigger";

export const revalidate = 60;

async function getInitialSettings() {
  try {
    await connectToDatabase();
    const settings = await WebsiteSettings.findOne().lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : null;
  } catch (err) {
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getInitialSettings();

  return (
    <PublicWebsiteProvider initialSettings={settings}>
      <div className="flex min-h-screen flex-col bg-background selection:bg-seneca-crimson selection:text-white w-full max-w-full overflow-x-clip">
        <PublicHeader />
        <main className="flex-1 w-full max-w-full overflow-x-clip">{children}</main>
        <PublicFooter />
        <FloatingFeedbackTrigger />
      </div>
    </PublicWebsiteProvider>
  );
}

