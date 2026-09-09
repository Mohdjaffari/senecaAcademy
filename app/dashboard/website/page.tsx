"use client";

import Link from "next/link";
import {
  Globe,
  Home,
  BookOpen,
  Camera,
  Info,
  Newspaper,
  CreditCard,
  MessageSquareQuote,
  School,
  PhoneCall,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Eye,
  Settings2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WebPageModule {
  title: string;
  description: string;
  href: string;
  publicUrl: string;
  icon: React.ReactNode;
  badge: string;
  sectionsCount: number;
  lastUpdated: string;
  status: "live" | "updated";
}

export default function WebsiteManagementHubPage() {
  const pages: WebPageModule[] = [
    {
      title: "Home Page",
      description: "Hero showcase, key statistics, institutional highlights, and call-to-actions.",
      href: "/dashboard/website/home",
      publicUrl: "/",
      icon: <Home className="h-5 w-5 text-seneca-amber" />,
      badge: "Landing Page",
      sectionsCount: 6,
      lastUpdated: "Today",
      status: "live",
    },
    {
      title: "Academics",
      description: "Curriculum pathways, departments, grade levels, and educational philosophy.",
      href: "/dashboard/website/academics",
      publicUrl: "/academics",
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      badge: "Academic Portal",
      sectionsCount: 5,
      lastUpdated: "Yesterday",
      status: "live",
    },
    {
      title: "Gallery",
      description: "Campus photography, student life media, events albums, and facility tours.",
      href: "/dashboard/website/gallery",
      publicUrl: "/gallery",
      icon: <Camera className="h-5 w-5 text-emerald-500" />,
      badge: "Media Gallery",
      sectionsCount: 4,
      lastUpdated: "2 days ago",
      status: "live",
    },
    {
      title: "About Us",
      description: "School history, leadership messages, mission, vision, and core values.",
      href: "/dashboard/website/about",
      publicUrl: "/about",
      icon: <Info className="h-5 w-5 text-purple-500" />,
      badge: "Institutional",
      sectionsCount: 5,
      lastUpdated: "3 days ago",
      status: "live",
    },
    {
      title: "Blogs & News",
      description: "Institutional announcements, academic articles, newsletters, and campus blogs.",
      href: "/dashboard/website/blogs",
      publicUrl: "/blogs",
      icon: <Newspaper className="h-5 w-5 text-amber-500" />,
      badge: "News Feed",
      sectionsCount: 4,
      lastUpdated: "Just now",
      status: "live",
    },
    {
      title: "Admission & Fees",
      description: "Admission guidelines, fee calculator, eligibility criteria, and deadlines.",
      href: "/dashboard/website/admissions",
      publicUrl: "/admissions",
      icon: <CreditCard className="h-5 w-5 text-seneca-crimson" />,
      badge: "Admissions",
      sectionsCount: 4,
      lastUpdated: "Today",
      status: "live",
    },
    {
      title: "Community Reviews & Feedbacks",
      description: "Parent testimonials, alumni stories, verified student feedback, and ratings.",
      href: "/dashboard/website/reviews",
      publicUrl: "/feedback",
      icon: <MessageSquareQuote className="h-5 w-5 text-pink-500" />,
      badge: "Testimonials",
      sectionsCount: 3,
      lastUpdated: "4 days ago",
      status: "live",
    },
    {
      title: "Campus & Faculty",
      description: "Faculty directory, campus facilities, smart labs, library, and sports complexes.",
      href: "/dashboard/website/campus",
      publicUrl: "/faculty",
      icon: <School className="h-5 w-5 text-cyan-500" />,
      badge: "Campus Tour",
      sectionsCount: 5,
      lastUpdated: "5 days ago",
      status: "live",
    },
    {
      title: "Contact Us",
      description: "Department contacts, campus location map, office hours, and inquiry forms.",
      href: "/dashboard/website/contact",
      publicUrl: "/contact",
      icon: <PhoneCall className="h-5 w-5 text-rose-500" />,
      badge: "Inquiries",
      sectionsCount: 3,
      lastUpdated: "Today",
      status: "live",
    },
    {
      title: "FAQs",
      description: "Categorized institutional FAQs, admission Q&As, and student life queries.",
      href: "/dashboard/website/faqs",
      publicUrl: "/faqs",
      icon: <HelpCircle className="h-5 w-5 text-indigo-500" />,
      badge: "Knowledge Base",
      sectionsCount: 4,
      lastUpdated: "1 week ago",
      status: "live",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sidebar via-sidebar/95 to-seneca-crimson/30 p-6 sm:p-8 border border-border/80 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-seneca-crimson/30 text-seneca-amber border border-seneca-crimson/50">
                <Globe className="h-3.5 w-3.5" />
                CMS Control Center
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
                All 10 Pages Live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Website Management Portal
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Configure and manage public content, pages, media, announcements, and institutional information across the Seneca Academy website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              asChild
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl font-semibold gap-2 shadow-sm"
            >
              <Link href="/" target="_blank">
                <Eye className="h-4 w-4" />
                <span>Live Website</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Managed Pages
              </p>
              <p className="text-2xl font-bold font-heading text-foreground mt-0.5">10</p>
              <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3 w-3" />
                100% Configured
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-seneca-amber/10 text-seneca-amber flex items-center justify-center border border-seneca-amber/20">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Public Status
              </p>
              <p className="text-2xl font-bold font-heading text-emerald-500 mt-0.5">Active</p>
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                Live Synchronization
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <Globe className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Content Modules
              </p>
              <p className="text-2xl font-bold font-heading text-foreground mt-0.5">44+</p>
              <p className="text-[11px] text-seneca-amber font-medium flex items-center gap-1 mt-1">
                <Sparkles className="h-3 w-3" />
                Dynamic Sections
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <Settings2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Access Level
              </p>
              <p className="text-2xl font-bold font-heading text-seneca-crimson dark:text-seneca-amber mt-0.5">
                Principal
              </p>
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-1">
                Executive Admin
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber flex items-center justify-center border border-seneca-crimson/20">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold font-heading text-foreground">
              Public Website Modules
            </h2>
            <p className="text-xs text-muted-foreground">
              Select any page below to manage sections, media, announcements, and content blocks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page, idx) => (
            <Card
              key={idx}
              className="rounded-2xl border-border/80 bg-card/80 hover:bg-card/100 hover:border-seneca-amber/40 hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {page.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {page.badge}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber transition-colors">
                  {page.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                  {page.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-3 mb-3.5">
                  <span className="font-semibold text-foreground/80">
                    {page.sectionsCount} Sections
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {page.lastUpdated}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 shadow-sm"
                  >
                    <Link href={page.href}>
                      <span>Manage</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-semibold border-border/80 hover:bg-muted/70"
                  >
                    <Link href={page.publicUrl} target="_blank">
                      <span>Preview</span>
                      <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
