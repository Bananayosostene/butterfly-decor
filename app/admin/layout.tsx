"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderOpen, Image, Shirt, BookOpen, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/collection-items", label: "Collection Items", icon: Image },
  { href: "/admin/style-ideas", label: "Style Ideas", icon: Shirt },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

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
            Butterfly Admin
          </span>
          <button className="ml-auto md:hidden" onClick={onClose}>
            <X className="w-5 h-5" style={{ color: "#e8d5b7" }} />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
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
          <form action="/api/admin/logout" method="POST">
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
              className="flex items-center gap-3 text-sm font-medium w-full"
              style={{ color: "rgba(232,213,183,0.6)" }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/admin/login") return <>{children}</>;

  const currentPage = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="sticky top-0 z-10 bg-card border-b border-border flex items-center gap-4 px-6 h-16">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">
            {currentPage?.label ?? "Admin"}
          </h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
