"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, Image, Shirt, BookOpen, Settings, LogOut, Menu, X, BarChart3, Store, Images, UserRound, Sparkles,
} from "lucide-react";
import { useState } from "react";

export type DashboardRole = "ADMIN" | "VENDOR";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

// One dashboard for everyone; the menu depends on who is signed in.
const NAV: Record<DashboardRole, NavItem[]> = {
  ADMIN: [
    { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/account/statistics", label: "Statistics", icon: BarChart3 },
    { href: "/account/categories", label: "Categories", icon: FolderOpen },
    { href: "/account/collection-items", label: "Collection Items", icon: Image },
    { href: "/account/style-ideas", label: "Style Ideas", icon: Shirt },
    { href: "/account/butterfly", label: "Butterfly Slides", icon: Sparkles },
    { href: "/account/vendor-categories", label: "Vendor Categories", icon: Store },
    { href: "/account/vendor-items", label: "Vendor Items", icon: Images },
    { href: "/account/bookings", label: "Bookings", icon: BookOpen },
    { href: "/account/settings", label: "Settings", icon: Settings },
  ],
  VENDOR: [
    { href: "/account/my-gallery", label: "My Gallery", icon: Images },
    { href: "/account/my-profile", label: "My Profile", icon: UserRound },
  ],
};

const BARE_PATHS = ["/account/forgot-password", "/account/reset-password"];

const isActive = (item: NavItem, pathname: string) =>
  item.exact ? pathname === item.href : pathname.startsWith(item.href);

function Sidebar({ role, open, onClose }: { role: DashboardRole; open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const logout = async () => {
    await fetch(role === "ADMIN" ? "/api/admin/logout" : "/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ background: "#2b1807" }}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <span className="text-lg font-bold" style={{ color: "#e8d5b7", fontFamily: "Georgia, serif" }}>
            {role === "ADMIN" ? "Butterfly Admin" : "Vendor Dashboard"}
          </span>
          <button className="ml-auto md:hidden" onClick={onClose}>
            <X className="w-5 h-5" style={{ color: "#e8d5b7" }} />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV[role].map((item) => {
            const Icon = item.icon;
            const active = isActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors"
                style={{
                  color: active ? "#e8d5b7" : "rgba(232,213,183,0.6)",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: active ? "3px solid #e8d5b7" : "3px solid transparent",
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 text-sm font-medium w-full"
            style={{ color: "rgba(232,213,183,0.6)" }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default function DashboardShell({ role, children }: { role: DashboardRole | null; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Sign-in and password pages have no menu.
  if (!role || BARE_PATHS.includes(pathname)) return <>{children}</>;

  const currentPage = NAV[role].find((item) => isActive(item, pathname));

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="sticky top-0 z-10 bg-card border-b border-border flex items-center gap-4 px-6 h-16">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">
            {currentPage?.label ?? "Dashboard"}
          </h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
