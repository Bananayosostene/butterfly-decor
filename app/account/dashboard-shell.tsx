"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, Image, Shirt, BookOpen, Settings, LogOut, Menu, X, BarChart3, Store, Images, UserRound,
  Sparkles, ChevronDown, ClipboardList, ListChecks, Users, Heart, Moon, Sun, ExternalLink, Gem, Home, type LucideIcon,
} from "lucide-react";
import { useState } from "react";

export type DashboardRole = "ADMIN" | "VENDOR";
export type DashboardTheme = "dark" | "light";

/** Cookie that remembers the dashboard's light/dark choice (read by the layout on the server). */
export const DASH_THEME_COOKIE = "dash_theme";

type NavLink = { href: string; label: string; icon: LucideIcon; exact?: boolean };
/** A sidebar entry: either a direct link, or a parent that opens to show its sub-items. */
type NavEntry = NavLink | { label: string; icon: LucideIcon; children: NavLink[] };
type NavSection = { label: string; entries: NavEntry[] };

// One dashboard for everyone; the menu depends on who is signed in.
const NAV: Record<DashboardRole, NavSection[]> = {
  ADMIN: [
    {
      label: "Overview",
      entries: [
        { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/account/statistics", label: "Statistics", icon: BarChart3 },
        { href: "/account/visitors", label: "Visitors", icon: Users },
      ],
    },
    {
      label: "Content",
      entries: [
        {
          label: "Wedding collection",
          icon: Gem,
          children: [
            { href: "/account/categories", label: "Categories", icon: FolderOpen },
            { href: "/account/collection-items", label: "Collection items", icon: Image },
            { href: "/account/style-ideas", label: "Style ideas", icon: Shirt },
            { href: "/account/wedding-albums", label: "Wedding albums", icon: Heart },
          ],
        },
        {
          label: "Vendors",
          icon: Store,
          children: [
            { href: "/account/vendor-categories", label: "Vendor categories", icon: FolderOpen },
            { href: "/account/vendors", label: "Vendors", icon: Users },
            { href: "/account/vendor-items", label: "Vendor items", icon: Images },
          ],
        },
        {
          label: "Homepage",
          icon: Home,
          children: [
            { href: "/account/butterfly", label: "Butterfly slides", icon: Sparkles },
            { href: "/account/settings", label: "Media & settings", icon: Settings },
          ],
        },
        {
          label: "Wedding planning",
          icon: ClipboardList,
          children: [
            { href: "/account/planning-lists", label: "Customer lists", icon: ListChecks },
            { href: "/account/planning-sheet", label: "Sheet setup", icon: Settings },
          ],
        },
      ],
    },
    {
      label: "Customers",
      entries: [
        { href: "/account/bookings", label: "Bookings", icon: BookOpen },
        { href: "/account/users", label: "Clients", icon: UserRound },
      ],
    },
  ],
  VENDOR: [
    {
      label: "My business",
      entries: [
        { href: "/account/my-gallery", label: "My gallery", icon: Images },
        { href: "/account/my-profile", label: "My profile", icon: UserRound },
      ],
    },
  ],
};

const BARE_PATHS = ["/account/forgot-password", "/account/reset-password"];

const isActive = (item: NavLink, pathname: string) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

const linksOf = (role: DashboardRole) =>
  NAV[role].flatMap((s) => s.entries).flatMap((e) => ("children" in e ? e.children : [e]));

function NavItem({ item, pathname, onNavigate, nested }: { item: NavLink; pathname: string; onNavigate: () => void; nested?: boolean }) {
  const active = isActive(item, pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${nested ? "px-3 py-2" : "px-3 py-2.5"} ${
        active
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function Sidebar({
  role,
  account,
  open,
  onClose,
}: {
  role: DashboardRole;
  account: { name: string; email: string };
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  // Parents the admin has opened or closed by hand; the one holding the current page is open by default.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const logout = async () => {
    await fetch(role === "ADMIN" ? "/api/admin/logout" : "/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col border-r transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)", color: "var(--sidebar-foreground)" }}
      >
        <div className="h-16 shrink-0 flex items-center gap-2.5 px-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold">B</span>
            <span className="text-base font-bold tracking-tight">{role === "ADMIN" ? "Butterfly Admin" : "Vendor Dashboard"}</span>
          </Link>
          <button className="ml-auto md:hidden text-muted-foreground" onClick={onClose} aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV[role].map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">{section.label}</p>
              <div className="space-y-1">
                {section.entries.map((entry) => {
                  if (!("children" in entry)) return <NavItem key={entry.href} item={entry} pathname={pathname} onNavigate={onClose} />;

                  const holdsCurrent = entry.children.some((c) => isActive(c, pathname));
                  const expanded = toggled[entry.label] ?? holdsCurrent;
                  const Icon = entry.icon;
                  return (
                    <div key={entry.label}>
                      <button
                        onClick={() => setToggled((t) => ({ ...t, [entry.label]: !expanded }))}
                        aria-expanded={expanded}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                          holdsCurrent ? "text-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{entry.label}</span>
                        <ChevronDown className={`ml-auto w-4 h-4 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                      </button>
                      {/* Sub-items slide open; the line on the left ties them to their parent. */}
                      <div className="grid transition-all duration-200" style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
                        <div className="overflow-hidden">
                          <div className="ml-5 mt-1 pl-3 space-y-1 border-l" style={{ borderColor: "var(--sidebar-border)" }}>
                            {entry.children.map((child) => (
                              <NavItem key={child.href} item={child} pathname={pathname} onNavigate={onClose} nested />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 p-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold uppercase">
              {account.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-sm font-semibold truncate">{account.name}</p>
              <p className="text-xs truncate text-muted-foreground">{account.email || (role === "ADMIN" ? "Administrator" : "Vendor")}</p>
            </div>
            <button
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function DashboardShell({
  role,
  initialTheme,
  account,
  children,
}: {
  role: DashboardRole | null;
  initialTheme: DashboardTheme;
  account: { name: string; email: string };
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<DashboardTheme>(initialTheme);
  const pathname = usePathname();

  // Sign-in and password pages have no menu.
  if (!role || BARE_PATHS.includes(pathname)) return <>{children}</>;

  const currentPage = linksOf(role).find((item) => isActive(item, pathname));

  const toggleTheme = () => {
    const next: DashboardTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    // Only the dashboard reads this, so the rest of the site never changes.
    document.cookie = `${DASH_THEME_COOKIE}=${next}; path=/account; max-age=31536000; samesite=lax`;
  };

  return (
    // The theme lives on this wrapper only: nothing outside the dashboard is affected.
    <div className={`dash ${theme === "dark" ? "dark" : ""} min-h-screen flex`}>
      <Sidebar role={role} account={account} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col md:ml-64">
        <header
          className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 md:px-6 border-b border-border backdrop-blur"
          style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)" }}
        >
          <button className="md:hidden text-foreground" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground truncate">{currentPage?.label ?? "Dashboard"}</h1>
          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View site</span>
            </Link>
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>
        <main key={pathname} className="dash-rise flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
