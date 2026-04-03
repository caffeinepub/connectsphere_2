import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Compass,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  PenSquare,
  Search,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useRef } from "react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { UserProfile } from "../store/localStore";

type Page = "feed" | "messages" | "explore" | "profile";

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  profile: UserProfile;
  notificationCount: number;
  onStartPost: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const navItems: { page: Page; label: string; icon: typeof Home }[] = [
  { page: "feed", label: "Feed", icon: Home },
  { page: "messages", label: "Messages", icon: MessageCircle },
  { page: "explore", label: "Explore", icon: Compass },
  { page: "profile", label: "Profile", icon: User },
];

export function Layout({
  children,
  currentPage,
  onNavigate,
  profile,
  notificationCount,
  onStartPost,
  searchQuery,
  onSearchChange,
}: LayoutProps) {
  const { clear } = useInternetIdentity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="glass-nav fixed top-0 left-0 right-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/assets/generated/connectsphere-logo-transparent.dim_120x120.png"
              alt="ConnectSphere"
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">
              ConnectSphere
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                type="button"
                key={page}
                data-ocid={`nav.${page}.link`}
                onClick={() => onNavigate(page)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === page
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {page === "messages" && notificationCount > 0 && (
                  <Badge
                    className="ml-1 h-4 min-w-4 px-1 text-[10px] font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.6 0.28 330))",
                      color: "white",
                      border: "none",
                    }}
                  >
                    {notificationCount}
                  </Badge>
                )}
                {currentPage === page && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
                    }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-0">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                data-ocid="nav.search_input"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="bg-secondary/60 border border-border rounded-full pl-9 pr-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 w-48 transition-all"
              />
            </div>

            {/* Start Post CTA */}
            <Button
              data-ocid="nav.open_modal_button"
              onClick={onStartPost}
              size="sm"
              className="btn-gradient text-white border-0 font-medium rounded-full gap-1.5 hidden sm:flex"
            >
              <PenSquare className="w-3.5 h-3.5" />
              Post
            </Button>

            {/* Avatar + dropdown */}
            <div className="relative group">
              <button
                type="button"
                data-ocid="nav.profile.button"
                className="flex items-center gap-2 rounded-full hover:bg-secondary/50 transition-colors p-1"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
                      color: "white",
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:block max-w-20 truncate">
                  {profile.displayName}
                </span>
              </button>
              {/* Dropdown on hover */}
              <div className="absolute right-0 top-full mt-2 w-44 bg-popover border border-border rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                <button
                  type="button"
                  data-ocid="nav.profile.link"
                  onClick={() => onNavigate("profile")}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 rounded-t-xl transition-colors"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                <button
                  type="button"
                  data-ocid="nav.logout.button"
                  onClick={clear}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-b-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-border bg-popover/95 backdrop-blur-lg"
            >
              <div className="p-3 grid grid-cols-2 gap-1">
                {navItems.map(({ page, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => {
                      onNavigate(page);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onStartPost}
                  className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold btn-gradient text-white transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                  Start a Post
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer
        className="mt-16 py-8 border-t border-border"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.082 0.018 265), oklch(0.06 0.015 265))",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/connectsphere-logo-transparent.dim_120x120.png"
              alt="ConnectSphere"
              className="w-6 h-6 rounded"
            />
            <span className="text-sm font-medium text-muted-foreground">
              ConnectSphere
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
