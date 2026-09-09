"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  Lock,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  PhoneCall,
  HelpCircle,
  Camera,
  BookOpen,
  Compass,
  CreditCard,
  Building,
  UserPlus,
  User as UserIcon,
  LogOut,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Star,
  MessageSquareHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import LogoutConfirmDialog from "@/components/layout/LogoutConfirmDialog";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";

interface DropdownItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  colorClass?: string;
}

interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: "super_admin" | "principal" | "teacher" | "student" | "user" | string;
  schoolId?: string;
}

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings: globalSettings, admissionsOpen } = usePublicWebsite();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [hasApplication, setHasApplication] = useState(false);
  const [latestApp, setLatestApp] = useState<any>(null);
  const [webSettings, setWebSettings] = useState<any>(globalSettings || null);

  const dropdownItems: DropdownItem[] = [
    {
      title: "Admissions & Fees",
      desc: "Application guide, diagnostic tests, fee structure & calculator.",
      href: "/admissions",
      icon: <GraduationCap className="h-5 w-5 text-seneca-crimson dark:text-seneca-amber-light" />,
      badge: admissionsOpen ? "2026 Open" : undefined,
      colorClass: "group-hover:border-seneca-crimson/40 group-hover:bg-seneca-crimson/5",
    },
    {
      title: "Community Reviews & Feedback",
      desc: "Authentic parent testimonials, 4.9★ ratings & verified stories.",
      href: "/feedback",
      icon: <Star className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
      badge: "4.9 ★",
      colorClass: "group-hover:border-amber-500/40 group-hover:bg-amber-500/5",
    },
    {
      title: "Campus & Faculty",
      desc: "Meet our 50+ master-level educators & explore campus life.",
      href: "/faculty",
      icon: <Users className="h-5 w-5 text-seneca-amber dark:text-seneca-amber" />,
      badge: "50+ Mentors",
      colorClass: "group-hover:border-seneca-amber/40 group-hover:bg-seneca-amber/5",
    },
    {
      title: "Contact Us",
      desc: "Campus location in Soldier Bazar, phone hotline & directions.",
      href: "/contact",
      icon: <PhoneCall className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      colorClass: "group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5",
    },
    {
      title: "FAQs",
      desc: "Common questions regarding admissions, curriculum & policies.",
      href: "/faqs",
      icon: <HelpCircle className="h-5 w-5 text-primary dark:text-amber-300" />,
      badge: "Help Desk",
      colorClass: "group-hover:border-primary/40 group-hover:bg-primary/5",
    },
  ];

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Efficient Auth & Site Settings Check
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setSession(data.data?.session || null);
            setHasApplication(Boolean(data.data?.hasSubmittedApplication));
            setLatestApp(data.data?.latestApplication || null);
          } else if (isMounted) {
            setSession(null);
            setHasApplication(false);
            setLatestApp(null);
          }
        } else if (isMounted) {
          setSession(null);
          setHasApplication(false);
          setLatestApp(null);
        }
      } catch {
        if (isMounted) {
          setSession(null);
          setHasApplication(false);
          setLatestApp(null);
        }
      }
    };

    const fetchSiteSettings = async () => {
      try {
        const res = await fetch("/api/website", { next: { revalidate: 300 } });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.settings && isMounted) {
            setWebSettings(data.data.settings);
          }
        }
      } catch (_) {}
    };

    // Check auth only if not already loaded or on initial load
    checkAuth();

    // Fetch site settings only once
    if (!webSettings) {
      fetchSiteSettings();
    }

    return () => {
      isMounted = false;
    };
  }, []); // Run once on mount, not on every single route change!

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setLogoutModalOpen(true);
  };

  // Get user role display badge and portal link
  const getRoleInfo = (role: string) => {
    switch (role) {
      case "super_admin":
        return { label: "Super Admin", portalUrl: "/dashboard", color: "bg-red-500/10 text-red-600 border-red-500/30" };
      case "principal":
        return { label: "Principal", portalUrl: "/dashboard", color: "bg-red-500/10 text-red-600 border-red-500/30" };
      case "teacher":
        return { label: "Faculty", portalUrl: "/teacher", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" };
      case "student":
        return { label: "Student", portalUrl: "/student", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" };
      case "user":
      default:
        return { label: "User / Applicant", portalUrl: "/admissions/status", color: "bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30" };
    }
  };

  const roleInfo = session ? getRoleInfo(session.role) : null;
  const userInitials = session?.name
    ? session.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <>
      <header className="sticky top-0 z-50 w-full transition-all">
        {/* 1. Top Announcement Notification Bar */}
        <div
          className={cn(
            "text-white px-4 font-medium transition-all duration-300 border-b border-white/10",
            isScrolled ? "py-1 text-[11px] bg-seneca-crimson/95 backdrop-blur-md" : "py-1.5 text-xs bg-seneca-crimson",
            webSettings?.admissionsOpen === false && (isScrolled ? "bg-zinc-900/95 backdrop-blur-md" : "bg-zinc-900")
          )}
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span
                className={cn(
                  "flex h-2 w-2 rounded-full shrink-0",
                  webSettings?.admissionsOpen !== false
                    ? "bg-seneca-amber animate-pulse"
                    : "bg-rose-500"
                )}
              />
              <span
                className={cn(
                  "font-bold tracking-wide uppercase text-[10px] px-2 py-0.5 rounded-full shrink-0",
                  webSettings?.admissionsOpen !== false
                    ? "bg-white/20 text-white"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                )}
              >
                {webSettings?.admissionsOpen !== false ? "Admissions Active" : "Admissions Closed"}
              </span>
              <span className="truncate text-white/90">
                {webSettings?.admissionsOpen !== false
                  ? (webSettings?.admissionsNotice ||
                      "Applications open for Grade 1 through 12 • Merit scholarships available")
                  : (webSettings?.admissionsClosedNotice ||
                      "Admissions for this academic session are currently closed. Inquiries open for next cycle.")}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-4 shrink-0 text-[11px] text-white/80">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-seneca-amber" />
                <span>{webSettings?.contact?.address || "Soldier Bazar, Karachi"}</span>
              </span>
              <span className="text-white/40">|</span>
              <a
                href={`tel:${webSettings?.contact?.phone || "+922132251984"}`}
                className="flex items-center gap-1 hover:text-seneca-amber transition-colors font-semibold"
              >
                <Phone className="h-3 w-3 text-seneca-amber" />
                <span>{webSettings?.contact?.phone || "021-32251984"}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. Main Navigation Header */}
        <div
          className={cn(
            "w-full transition-all duration-300",
            isScrolled
              ? "bg-background/95 backdrop-blur-md shadow-md border-b border-border/80"
              : "bg-background/90 backdrop-blur-sm border-b border-border/50"
          )}
        >
          <div className={cn(
            "container mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 transition-all duration-300",
            isScrolled ? "h-16" : "h-20"
          )}>
          {/* Brand Logo & Name Lockup */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group focus:outline-none shrink-0"
          >
            <div className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-seneca-amber/20 via-seneca-crimson/10 to-card p-1.5 border border-seneca-amber/30 shadow-md group-hover:scale-105 group-hover:border-seneca-crimson transition-all duration-300">
              <Image
                src="/logo-seal.png"
                alt="Seneca Academy Crest"
                width={40}
                height={40}
                className="object-contain drop-shadow"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold font-heading text-lg sm:text-xl tracking-tight text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
                  SENECA
                </span>
                <span className="font-extrabold font-heading text-lg sm:text-xl tracking-tight text-seneca-crimson dark:text-seneca-amber-light">
                  ACADEMY
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground -mt-1 group-hover:text-foreground transition-colors">
                Soldier Bazar • Karachi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold">
            {/* 1. Home */}
            <Link
              href="/"
              prefetch={true}
              className={cn(
                "px-3.5 py-2 rounded-full transition-all duration-200",
                pathname === "/"
                  ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light font-bold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              Home
            </Link>

            {/* 2. Academics */}
            <Link
              href="/academics"
              prefetch={true}
              className={cn(
                "px-3.5 py-2 rounded-full transition-all duration-200",
                pathname === "/academics"
                  ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light font-bold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              Academics
            </Link>

            {/* 3. Gallery */}
            <Link
              href="/gallery"
              prefetch={true}
              className={cn(
                "px-3.5 py-2 rounded-full transition-all duration-200",
                pathname === "/gallery"
                  ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light font-bold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              Gallery
            </Link>

            {/* 4. About Us */}
            <Link
              href="/about"
              prefetch={true}
              className={cn(
                "px-3.5 py-2 rounded-full transition-all duration-200",
                pathname === "/about"
                  ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light font-bold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              About Us
            </Link>

            {/* 5. Blogs */}
            <Link
              href="/blogs"
              prefetch={true}
              className={cn(
                "px-3.5 py-2 rounded-full transition-all duration-200",
                pathname.startsWith("/blogs")
                  ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light font-bold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              Blogs
            </Link>

            {/* 6. Explore Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 focus:outline-none",
                  dropdownOpen ||
                    ["/admissions", "/faculty", "/contact", "/faqs"].includes(pathname)
                    ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light font-bold"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted"
                )}
                aria-expanded={dropdownOpen}
              >
                <span>Explore</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    dropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown Card */}
              {dropdownOpen && (
                <div
                  className="absolute top-full right-0 w-[540px] pt-3 z-[100] animate-in fade-in-50 zoom-in-95 duration-150"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="bg-white dark:bg-zinc-950 border border-border/90 rounded-3xl shadow-2xl p-4 grid grid-cols-12 gap-3 ring-1 ring-black/10 dark:ring-white/10">
                    <div className="col-span-7 space-y-1.5">
                      <div className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        Campus & Information
                      </div>
                      {dropdownItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className={cn(
                            "flex items-start gap-3 p-2.5 rounded-2xl border border-transparent transition-all group",
                            item.colorClass,
                            pathname === item.href && "bg-muted border-border font-bold"
                          )}
                        >
                          <div className="p-2 rounded-xl bg-card border border-border/80 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                            {item.icon}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/20 dark:text-seneca-amber-light">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
                              {item.desc}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Featured Admissions Promo */}
                    {webSettings?.admissionsOpen !== false ? (
                      <div className="col-span-5 bg-gradient-to-br from-seneca-crimson to-seneca-crimson-dark rounded-2xl p-4 text-white flex flex-col justify-between shadow-inner relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-seneca-amber/20 blur-xl pointer-events-none" />
                        <div>
                          <Badge className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider border-none mb-2">
                            {webSettings?.admissionsSession || "Session 2026–27"}
                          </Badge>
                          <h4 className="text-sm font-extrabold font-heading text-white leading-tight">
                            Join Seneca Academy
                          </h4>
                          <p className="text-[11px] text-white/80 mt-1 leading-normal">
                            {webSettings?.admissionsAnnouncement ||
                              "Assessments scheduled every Saturday at our Soldier Bazar campus."}
                          </p>
                        </div>
                        <Link
                          href="/admissions"
                          className="mt-4 inline-flex items-center justify-between text-xs font-bold bg-white text-foreground rounded-lg px-3 py-2 hover:bg-white/90 transition-all shadow-sm active:scale-[0.98] relative z-10"
                        >
                          <span>Apply Online</span>
                          <ArrowRight className="h-3.5 w-3.5 text-seneca-crimson" />
                        </Link>
                      </div>
                    ) : (
                      <div className="col-span-5 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl p-4 text-white flex flex-col justify-between shadow-inner relative overflow-hidden border border-white/10">
                        <div>
                          <Badge className="bg-rose-500/30 text-rose-200 text-[10px] font-bold uppercase tracking-wider border-rose-400/30 mb-2">
                            Admissions Closed
                          </Badge>
                          <h4 className="text-sm font-extrabold font-heading text-white leading-tight">
                            Enrollment Closed
                          </h4>
                          <p className="text-[11px] text-white/70 mt-1 leading-normal">
                            {webSettings?.admissionsClosedNotice ||
                              "Inquiries open for upcoming sessions. Schedule a campus visit or contact counselors."}
                          </p>
                        </div>
                        <Link
                          href="/contact"
                          className="mt-4 inline-flex items-center justify-between text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 transition-all shadow-sm active:scale-[0.98] relative z-10 border border-white/20"
                        >
                          <span>Contact Admissions</span>
                          <ArrowRight className="h-3.5 w-3.5 text-seneca-amber-light" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions: Login & Sign Up OR User Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* If NOT logged in: Show Login & Sign Up buttons */}
            {!session && (
              <>
                <Button
                  variant="outline"
                  asChild
                  size="sm"
                  className="hidden sm:inline-flex rounded-full text-xs font-bold px-3.5 gap-1.5 border-border/80 hover:border-seneca-crimson hover:text-seneca-crimson dark:hover:border-seneca-amber dark:hover:text-seneca-amber-light transition-all"
                >
                  <Link href="/login" prefetch={true}>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Login</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="glow"
                  className="hidden sm:inline-flex rounded-full gap-1.5 text-xs font-bold shadow-md shadow-seneca-crimson/20 px-4 transition-transform hover:scale-105 active:scale-95"
                >
                  <Link href="/signup" prefetch={true}>
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </>
            )}

            {/* If role === "user" and has submitted application: prominent quick status pill */}
            {session && session.role === "user" && hasApplication && (
              <Button
                variant="outline"
                asChild
                size="sm"
                className="hidden lg:inline-flex rounded-full text-xs font-bold px-3.5 gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-xs"
              >
                <Link href="/admissions/status">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Track Application {latestApp?.applicationNumber ? `(${latestApp.applicationNumber})` : ""}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}

            {/* If LOGGED IN: Show Sleek User Profile Button & Dropdown */}
            {session && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-border/90 bg-card hover:bg-muted/80 shadow-sm transition-all focus:outline-none group"
                  aria-label="User profile menu"
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                    {userInitials}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground truncate max-w-[120px] leading-tight">
                      {session.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {roleInfo?.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 hidden sm:inline-block",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-950 border border-border rounded-3xl shadow-2xl p-2 z-[100] animate-in fade-in-50 zoom-in-95 duration-150">
                    {/* Header Info */}
                    <div className="p-3 border-b border-border/60">
                      <div className="font-bold text-sm text-foreground truncate">{session.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{session.email}</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5", roleInfo?.color)}>
                          {roleInfo?.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="py-1.5 space-y-1">
                      {/* Admission Application Status: ONLY for role 'user' who has submitted application */}
                      {session.role === "user" && hasApplication && (
                        <Link
                          href="/admissions/status"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-xs font-bold text-foreground hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Application Status</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            Active
                          </span>
                        </Link>
                      )}

                      {/* If role is 'user' and has NOT submitted an application, offer Apply */}
                      {session.role === "user" && !hasApplication && (
                        <Link
                          href="/admissions"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-foreground hover:bg-seneca-crimson/10 hover:text-seneca-crimson rounded-xl transition-colors"
                        >
                          <GraduationCap className="h-4 w-4 text-seneca-crimson shrink-0" />
                          <span>Apply for Admission</span>
                        </Link>
                      )}

                      {/* Go to LMS Portal (if student, teacher, principal, super_admin) */}
                      {session.role !== "user" && roleInfo?.portalUrl && (
                        <Link
                          href={roleInfo.portalUrl}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-seneca-amber shrink-0" />
                          <span>Enter LMS Dashboard</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout Button */}
                    <div className="pt-1.5 border-t border-border/60">
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm hover:bg-accent transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 3. Mobile Responsive Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border/80 bg-white dark:bg-zinc-950 p-5 shadow-2xl animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto z-[100]">
            <nav className="flex flex-col space-y-1.5">
              {/* If Logged in on Mobile: Show User Profile Card */}
              {session && (
                <div className="mb-3 p-3.5 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center text-xs font-extrabold shadow-sm shrink-0">
                      {userInitials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{session.name}</span>
                      <span className="text-[10px] text-muted-foreground">{session.email}</span>
                      <Badge variant="outline" className={cn("text-[9px] font-bold w-fit mt-1", roleInfo?.color)}>
                        {roleInfo?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. Home */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-2.5 text-sm font-bold rounded-xl transition-colors",
                  pathname === "/"
                    ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Home
              </Link>

              {/* 2. Academics */}
              <Link
                href="/academics"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-2.5 text-sm font-bold rounded-xl transition-colors",
                  pathname === "/academics"
                    ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Academics
              </Link>

              {/* 3. Gallery */}
              <Link
                href="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-2.5 text-sm font-bold rounded-xl transition-colors",
                  pathname === "/gallery"
                    ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Gallery
              </Link>

              {/* 4. About Us */}
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-2.5 text-sm font-bold rounded-xl transition-colors",
                  pathname === "/about"
                    ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light"
                    : "text-foreground hover:bg-muted"
                )}
              >
                About Us
              </Link>

              {/* 5. Blogs */}
              <Link
                href="/blogs"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-2.5 text-sm font-bold rounded-xl transition-colors",
                  pathname.startsWith("/blogs")
                    ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Blogs
              </Link>

              {/* 6. Mobile Dropdown Accordion */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-seneca-crimson dark:text-seneca-amber-light" />
                    <span>Explore Seneca</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      mobileDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {mobileDropdownOpen && (
                  <div className="pl-4 pr-1 py-2 space-y-1 border-l-2 border-seneca-crimson/30 ml-4 my-1 animate-in slide-in-from-top-2 duration-150">
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-xl transition-colors",
                          pathname === item.href
                            ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{item.title}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/20 dark:text-seneca-amber-light">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">{item.desc}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Quick Actions (Conditional based on session) */}
              <div className="pt-4 flex flex-col gap-2.5 border-t border-border mt-2">
                {session ? (
                  <>
                    {session.role === "user" && hasApplication && (
                      <Button asChild className="w-full justify-center rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                        <Link href="/admissions/status" onClick={() => setMobileMenuOpen(false)}>
                          <FileText className="h-4 w-4 mr-1.5" />
                          <span>Track Application {latestApp?.applicationNumber ? `(${latestApp.applicationNumber})` : ""}</span>
                          <ArrowRight className="h-4 w-4 ml-1.5" />
                        </Link>
                      </Button>
                    )}
                    {session.role === "user" && !hasApplication && (
                      <Button asChild className="w-full justify-center rounded-xl font-bold" variant="glow">
                        <Link href="/admissions" onClick={() => setMobileMenuOpen(false)}>
                          <GraduationCap className="h-4 w-4 mr-1.5" />
                          <span>Apply for Admission</span>
                          <ArrowRight className="h-4 w-4 ml-1.5" />
                        </Link>
                      </Button>
                    )}
                    {session.role !== "user" && roleInfo?.portalUrl && (
                      <Button asChild variant="outline" className="w-full justify-center rounded-xl font-bold">
                        <Link href={roleInfo.portalUrl} onClick={() => setMobileMenuOpen(false)}>
                          <LayoutDashboard className="h-4 w-4 mr-1.5 text-seneca-amber" />
                          <span>LMS Dashboard</span>
                        </Link>
                      </Button>
                    )}
                    <Button
                      onClick={handleLogoutClick}
                      variant="outline"
                      className="w-full justify-center rounded-xl font-bold text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4 mr-1.5" />
                      <span>Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="w-full justify-center rounded-xl font-bold" variant="glow">
                      <Link href="/signup" prefetch={true} onClick={() => setMobileMenuOpen(false)}>
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        <span>Create Portal Account (Sign Up)</span>
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-center rounded-xl font-bold">
                      <Link href="/login" prefetch={true} onClick={() => setMobileMenuOpen(false)}>
                        <Lock className="h-4 w-4 mr-1.5" />
                        <span>Sign In (Login)</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
        </div>
      </header>

      <LogoutConfirmDialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen} />
    </>
  );
}

export default PublicHeader;
