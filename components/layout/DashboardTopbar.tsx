"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ExternalLink,
  User,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Laptop,
  GraduationCap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/auth/permissions";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { LogoutConfirmDialog } from "@/components/layout/LogoutConfirmDialog";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface DashboardTopbarProps {
  userName: string;
  userEmail: string;
  userRole: UserRole;
  avatarUrl?: string;
}

export function DashboardTopbar({
  userName,
  userEmail,
  userRole,
  avatarUrl,
}: DashboardTopbarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(avatarUrl);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

    window.addEventListener("seneca_avatar_changed", handleAvatarUpdate);
    return () => {
      window.removeEventListener("seneca_avatar_changed", handleAvatarUpdate);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/95 px-4 sm:px-6 backdrop-blur-md">
        {/* Left Title: Mobile Menu Button + Seneca Academy Brand Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("seneca_toggle_mobile_sidebar"));
            }}
            className="lg:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Seneca Academy Brand Title (Text Only) */}
          <Link href="/" className="flex flex-col group transition-opacity hover:opacity-90">
            <span className="text-base sm:text-lg font-extrabold font-heading text-foreground tracking-tight leading-none">
              Seneca <span className="text-seneca-crimson dark:text-seneca-amber">Academy</span>
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight mt-0.5 hidden sm:inline-block">
              Premier Institutional LMS
            </span>
          </Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden md:inline-flex rounded-full text-xs font-semibold gap-1.5"
          >
            <Link href="/" target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Public Website</span>
            </Link>
          </Button>

          {/* Notifications Dropdown (Role-Tailored) */}
          <NotificationDropdown userRole={userRole} />

          {/* User Dropdown with Real-time Profile Photo and Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-primary group transition-all">
                <Avatar className="h-9 w-9 border-2 border-seneca-amber/40 group-hover:border-seneca-amber shadow-sm transition-colors">
                  {currentAvatar ? (
                    <AvatarImage src={currentAvatar} alt={userName} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-seneca-amber to-seneca-crimson text-white font-bold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border border-border/80 bg-card/98 backdrop-blur-xl">
              <DropdownMenuLabel className="font-normal p-2.5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border shrink-0">
                    {currentAvatar ? (
                      <AvatarImage src={currentAvatar} alt={userName} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-seneca-crimson text-white font-bold text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    <div className="pt-0.5">
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-seneca-crimson/10 text-seneca-crimson text-[10px] font-bold uppercase tracking-wider">
                        {userRole.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Navigation Links */}
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link
                  href={
                    userRole === "teacher"
                      ? "/teacher/profile"
                      : userRole === "student"
                      ? "/student/profile"
                      : "/dashboard/profile"
                  }
                >
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Faculty Profile</span>
                </Link>
              </DropdownMenuItem>

              {(userRole === "super_admin" || userRole === "principal") && (
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4 text-seneca-amber" />
                    <span>School Settings</span>
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Theme Appearance Mode Toggle Inside Dropdown */}
              {mounted && (
                <div className="p-2 rounded-xl bg-muted/40 my-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-foreground">
                      {theme === "dark" ? (
                        <Moon className="h-3.5 w-3.5 text-seneca-amber" />
                      ) : (
                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span>Theme Appearance</span>
                    </span>
                    <span className="capitalize text-[10px] text-muted-foreground">{theme}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-background p-1 rounded-xl border border-border/60">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={cn(
                        "py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1",
                        theme === "light"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <Sun className="h-3 w-3" />
                      <span>Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1",
                        theme === "dark"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <Moon className="h-3 w-3" />
                      <span>Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("system")}
                      className={cn(
                        "py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1",
                        theme === "system"
                          ? "bg-foreground text-background shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <Laptop className="h-3 w-3" />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>
              )}

              <DropdownMenuSeparator />

              {/* Logout Option */}
              <DropdownMenuItem
                onClick={() => setLogoutModalOpen(true)}
                className="text-rose-600 dark:text-rose-400 cursor-pointer focus:bg-rose-50 dark:focus:bg-rose-950/30 rounded-xl"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Confirmation Sign Out Dialog */}
      <LogoutConfirmDialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen} />
    </>
  );
}

export default DashboardTopbar;
