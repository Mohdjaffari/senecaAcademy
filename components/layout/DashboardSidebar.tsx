"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileText,
  HelpCircle,
  Award,
  CreditCard,
  UserPlus,
  MessageSquare,
  BarChart3,
  Settings,
  FolderOpen,
  Briefcase,
  Layers,
  Menu,
  X,
  LogOut,
  ShieldAlert,
  User,
  Camera,
  Newspaper,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  Globe,
  Home,
  Info,
  School,
  PhoneCall,
  MessageSquareQuote,
  Star,
} from "lucide-react";
import { UserRole } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LogoutConfirmDialog } from "@/components/layout/LogoutConfirmDialog";

interface NavSubItem {
  title: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: string;
  subItems?: NavSubItem[];
}

interface NavSection {
  heading?: string;
  items: NavItem[];
}

interface DashboardSidebarProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  isClassTeacher?: boolean;
}

export function DashboardSidebar({ role, userName, userEmail, avatarUrl, isClassTeacher = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(avatarUrl);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (href: string, currentlyOpen?: boolean) => {
    setOpenDropdowns((prev) => {
      const isOpen = currentlyOpen !== undefined ? currentlyOpen : (prev[href] ?? false);
      return {
        ...prev,
        [href]: !isOpen,
      };
    });
  };

  useEffect(() => {
    setCurrentAvatar(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarUrl?: string }>;
      if (customEvent.detail && customEvent.detail.avatarUrl !== undefined) {
        setCurrentAvatar(customEvent.detail.avatarUrl);
      }
    };

    const handleToggleMobile = () => {
      setMobileOpen((prev) => !prev);
    };

    window.addEventListener("seneca_avatar_changed", handleAvatarUpdate);
    window.addEventListener("seneca_toggle_mobile_sidebar", handleToggleMobile);
    return () => {
      window.removeEventListener("seneca_avatar_changed", handleAvatarUpdate);
      window.removeEventListener("seneca_toggle_mobile_sidebar", handleToggleMobile);
    };
  }, []);

  const getNavSections = (): NavSection[] => {
    if (role === "super_admin" || role === "principal") {
      return [
        {
          items: [
            {
              title: "Overview",
              href: "/dashboard",
              icon: <LayoutDashboard className="h-4 w-4" />,
            },
          ],
        },
        {
          heading: "Academic Management",
          items: [
            {
              title: "Students",
              href: "/dashboard/students",
              icon: <GraduationCap className="h-4 w-4" />,
            },
            {
              title: "Teachers",
              href: "/dashboard/teachers",
              icon: <Users className="h-4 w-4" />,
            },
            {
              title: "Classes & Sections",
              href: "/dashboard/classes",
              icon: <Layers className="h-4 w-4" />,
            },
            {
              title: "Subjects",
              href: "/dashboard/subjects",
              icon: <BookOpen className="h-4 w-4" />,
            },
            {
              title: "Teaching Timetables",
              href: "/dashboard/timetable",
              icon: <Clock className="h-4 w-4" />,
            },
            {
              title: "School Calendar & Leaves",
              href: "/dashboard/calendar",
              icon: <Calendar className="h-4 w-4" />,
            },
          ],
        },
        {
          heading: "Operations & Administration",
          items: [
            {
              title: "Attendance",
              href: "/dashboard/attendance",
              icon: <CalendarCheck className="h-4 w-4" />,
            },
            {
              title: "Exams & Results",
              href: "/dashboard/results",
              icon: <Award className="h-4 w-4" />,
            },
            {
              title: "Fee Management",
              href: "/dashboard/fees",
              icon: <CreditCard className="h-4 w-4" />,
            },
            {
              title: "Admissions",
              href: "/dashboard/admissions",
              icon: <UserPlus className="h-4 w-4" />,
            },
            {
              title: "Teacher Applications",
              href: "/dashboard/teacher-applications",
              icon: <Briefcase className="h-4 w-4" />,
            },
            {
              title: "Contact Inquiries",
              href: "/dashboard/contact-inquiries",
              icon: <MessageSquare className="h-4 w-4" />,
            },
          ],
        },
        {
          heading: "Website & Public Portal",
          items: [
            {
              title: "Website Management",
              href: "/dashboard/website",
              icon: <Globe className="h-4 w-4" />,
              badge: "CMS",
              subItems: [
                {
                  title: "Home",
                  href: "/dashboard/website/home",
                  icon: <Home className="h-3.5 w-3.5" />,
                },
                {
                  title: "Academics",
                  href: "/dashboard/website/academics",
                  icon: <BookOpen className="h-3.5 w-3.5" />,
                },
                {
                  title: "Gallery",
                  href: "/dashboard/website/gallery",
                  icon: <Camera className="h-3.5 w-3.5" />,
                },
                {
                  title: "About Us",
                  href: "/dashboard/website/about",
                  icon: <Info className="h-3.5 w-3.5" />,
                },
                {
                  title: "Blogs",
                  href: "/dashboard/website/blogs",
                  icon: <Newspaper className="h-3.5 w-3.5" />,
                },
                {
                  title: "Admission and Fees",
                  href: "/dashboard/website/admissions",
                  icon: <CreditCard className="h-3.5 w-3.5" />,
                },
                {
                  title: "Community Reviews & Feedbacks",
                  href: "/dashboard/website/reviews",
                  icon: <MessageSquareQuote className="h-3.5 w-3.5" />,
                },
                {
                  title: "Campus & Faculty",
                  href: "/dashboard/website/campus",
                  icon: <School className="h-3.5 w-3.5" />,
                },
                {
                  title: "Contact Us",
                  href: "/dashboard/website/contact",
                  icon: <PhoneCall className="h-3.5 w-3.5" />,
                },
                {
                  title: "FAQs",
                  href: "/dashboard/website/faqs",
                  icon: <HelpCircle className="h-3.5 w-3.5" />,
                },
              ],
            },
          ],
        },
        {
          heading: "System Administration",
          items: [
            {
              title: "Audit & Security Logs",
              href: "/dashboard/audit-logs",
              icon: <ShieldAlert className="h-4 w-4" />,
            },
            {
              title: "Executive Profile",
              href: "/dashboard/profile",
              icon: <User className="h-4 w-4" />,
            },
            {
              title: "System Settings",
              href: "/dashboard/settings",
              icon: <Settings className="h-4 w-4" />,
            },
          ],
        },
      ];
    }

    if (role === "teacher") {
      const academicItems: NavItem[] = [
        {
          title: "My Students & Roster",
          href: "/teacher/students",
          icon: <GraduationCap className="h-4 w-4" />,
        },
        {
          title: "Course Materials",
          href: "/teacher/materials",
          icon: <FolderOpen className="h-4 w-4" />,
        },
        {
          title: "Assignments & Grading",
          href: "/teacher/assignments",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Quizzes & Tests",
          href: "/teacher/quizzes",
          icon: <HelpCircle className="h-4 w-4" />,
        },
        {
          title: "Exam Marks Entry",
          href: "/teacher/exams",
          icon: <Award className="h-4 w-4" />,
        },
      ];

      // Add Attendance strictly if teacher is designated Class Teacher
      if (isClassTeacher) {
        academicItems.splice(1, 0, {
          title: "Daily Attendance",
          href: "/teacher/attendance",
          icon: <CalendarCheck className="h-4 w-4" />,
          badge: "Class Teacher",
        });
      }

      return [
        {
          items: [
            {
              title: "Command Center",
              href: "/teacher",
              icon: <LayoutDashboard className="h-4 w-4" />,
            },
          ],
        },
        {
          heading: "Academic Management",
          items: academicItems,
        },
        {
          heading: "Faculty Schedule & Comm",
          items: [
            {
              title: "Timetable & Calendar",
              href: "/teacher/timetable",
              icon: <Clock className="h-4 w-4" />,
            },
            {
              title: "Student Messages",
              href: "/teacher/messages",
              icon: <MessageSquare className="h-4 w-4" />,
            },
            {
              title: "Teaching Books Roster",
              href: "/teacher/books",
              icon: <BookOpen className="h-4 w-4" />,
            },
            {
              title: "Faculty Profile",
              href: "/teacher/profile",
              icon: <User className="h-4 w-4" />,
            },
          ],
        },
      ];
    }

    if (role === "student") {
      return [
        {
          items: [
            {
              title: "Student Portal",
              href: "/student",
              icon: <LayoutDashboard className="h-4 w-4" />,
            },
          ],
        },
        {
          heading: "My Academic Life",
          items: [
            {
              title: "Assignments",
              href: "/student/assignments",
              icon: <FileText className="h-4 w-4" />,
            },
            {
              title: "Quizzes & Assessments",
              href: "/student/quizzes",
              icon: <HelpCircle className="h-4 w-4" />,
            },
            {
              title: "Course Materials",
              href: "/student/materials",
              icon: <FolderOpen className="h-4 w-4" />,
            },
            {
              title: "Results & Gradebook",
              href: "/student/results",
              icon: <Award className="h-4 w-4" />,
            },
            {
              title: "Class Attendance",
              href: "/student/attendance",
              icon: <CalendarCheck className="h-4 w-4" />,
            },
          ],
        },
        {
          heading: "Finance & Schedule",
          items: [
            {
              title: "Tuition Fees & Challans",
              href: "/student/fees",
              icon: <CreditCard className="h-4 w-4" />,
            },
            {
              title: "Academic Timetable",
              href: "/student/timetable",
              icon: <Clock className="h-4 w-4" />,
            },
            {
              title: "School Calendar & Leaves",
              href: "/student/calendar",
              icon: <Calendar className="h-4 w-4" />,
            },
            {
              title: "Teacher Inquiries",
              href: "/student/messages",
              icon: <MessageSquare className="h-4 w-4" />,
            },
            {
              title: "Student ID & Profile",
              href: "/student/profile",
              icon: <User className="h-4 w-4" />,
            },
          ],
        },
      ];
    }

    return [];
  };

  const navSections = getNavSections();

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link
          href={
            role === "teacher"
              ? "/teacher"
              : role === "student"
              ? "/student"
              : "/dashboard"
          }
          prefetch={true}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
        >
          <div className="h-9 w-9 rounded-xl bg-seneca-amber/15 border border-seneca-amber/30 p-1 flex items-center justify-center shrink-0">
            <Image
              src="/logo-seal.png"
              alt="Seneca Academy Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold font-heading text-white tracking-tight leading-none">
              Seneca <span className="text-seneca-amber">Academy</span>
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight mt-1">
              LMS Portal
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-sidebar-accent transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Role Badge Bar */}
      <div className="px-4 py-2.5 bg-sidebar-accent/30 border-b border-sidebar-border/50 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
          Workspace
        </span>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-seneca-crimson text-white tracking-wide uppercase">
          {role.replace("_", " ")}
        </span>
      </div>

      {/* Navigation Items (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar">
        {navSections.map((section, sIndex) => (
          <div key={sIndex} className="space-y-1">
            {section.heading && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                {section.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isAnySubActive =
                  hasSubItems &&
                  item.subItems?.some(
                    (sub) => pathname === sub.href || pathname?.startsWith(sub.href)
                  );
                const isDirectActive =
                  pathname === item.href ||
                  (!hasSubItems &&
                    item.href !== "/dashboard" &&
                    item.href !== "/teacher" &&
                    item.href !== "/student" &&
                    pathname?.startsWith(item.href));
                const isDropdownOpen =
                  openDropdowns[item.href] ?? (isAnySubActive || false);

                if (hasSubItems) {
                  return (
                    <div key={item.href} className="space-y-1">
                      <div
                        onClick={() => toggleDropdown(item.href, isDropdownOpen)}
                        className={cn(
                          "flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all group relative select-none",
                          isAnySubActive || isDirectActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className={cn(
                              "transition-transform group-hover:scale-110 shrink-0",
                              isAnySubActive || isDirectActive
                                ? "text-seneca-crimson dark:text-seneca-amber"
                                : "text-muted-foreground group-hover:text-sidebar-foreground"
                            )}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-seneca-amber/20 text-seneca-amber border border-seneca-amber/30">
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200",
                              isDropdownOpen ? "rotate-180 text-foreground" : ""
                            )}
                          />
                        </div>
                      </div>

                      {/* Dropdown Sub-Items List */}
                      {isDropdownOpen && (
                        <div className="pl-3.5 ml-3 border-l-2 border-sidebar-border/60 space-y-0.5 py-0.5 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                          {item.subItems!.map((sub) => {
                            const isSubActive =
                              pathname === sub.href ||
                              pathname?.startsWith(sub.href);

                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                prefetch={true}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all group relative",
                                  isSubActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-xs"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                                )}
                              >
                                {sub.icon && (
                                  <span
                                    className={cn(
                                      "shrink-0 transition-transform group-hover:scale-110",
                                      isSubActive
                                        ? "text-sidebar-primary-foreground"
                                        : "text-muted-foreground group-hover:text-sidebar-foreground"
                                    )}
                                  >
                                    {sub.icon}
                                  </span>
                                )}
                                <span className="truncate flex-1">{sub.title}</span>
                                {sub.badge && (
                                  <span className="text-[8.5px] font-bold px-1 py-0.2 rounded bg-seneca-amber/20 text-seneca-amber">
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative",
                      isDirectActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-sm"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "transition-transform group-hover:scale-110",
                        isDirectActive
                          ? "text-sidebar-primary-foreground"
                          : "text-muted-foreground group-hover:text-sidebar-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-seneca-amber/20 text-seneca-amber border border-seneca-amber/30 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile Strip */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/20">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/60">
          <Link
            href={
              role === "teacher"
                ? "/teacher/profile"
                : role === "student"
                ? "/student/profile"
                : "/dashboard/profile"
            }
            prefetch={true}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={userName}
                className="h-9 w-9 shrink-0 rounded-full object-cover border border-white/20 shadow-sm"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seneca-crimson text-white font-bold text-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-bold text-white">{userName}</span>
              <span className="truncate text-[10px] text-muted-foreground">{userEmail}</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            title="Log out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmDialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen} />
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 border-r border-sidebar-border">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-sidebar shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardSidebar;
