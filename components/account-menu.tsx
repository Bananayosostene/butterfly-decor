"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { readAccountHint, type AccountHint } from "@/lib/account-hint";

/** Where "Go to dashboard" leads for each kind of account; clients have no dashboard. */
const DASHBOARD: Partial<Record<AccountHint["kind"], { href: string; label: string }>> = {
  ADMIN: { href: "/account", label: "Go to dashboard" },
  VENDOR: { href: "/account/my-gallery", label: "Go to dashboard" },
  NEW: { href: "/account/welcome", label: "Finish signing up" },
};

/**
 * Header account button. Signed out: a "Sign in" link. Signed in: a round button with the
 * account's initial that opens a small menu (name, email, dashboard link, sign out).
 */
export function AccountMenu() {
  const pathname = usePathname();
  const [account, setAccount] = useState<AccountHint | null>(null);
  const [open, setOpen] = useState(false);
  // Falls back to the initial when the photo cannot be loaded.
  const [photoFailed, setPhotoFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // The hint cookie is read after the page loads (and again on each navigation), so pages built
  // ahead of time stay the same for everyone.
  useEffect(() => {
    setAccount(readAccountHint());
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = async () => {
    // Ends whichever session is open (admin or site account); both calls are harmless otherwise.
    await Promise.all([
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {}),
      fetch("/api/admin/logout", { method: "POST" }).catch(() => {}),
    ]);
    window.location.href = "/";
  };

  if (!account) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
      >
        <span>SIGN IN</span>
      </Link>
    );
  }

  const dashboard = DASHBOARD[account.kind];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold uppercase cursor-pointer transition-transform hover:scale-105"
        style={{ background: "var(--cream)", color: "var(--ink)", boxShadow: "0 0 0 2px rgba(247,239,227,0.35)" }}
      >
        {account.avatarUrl && !photoFailed ? (
          // Google's image host refuses requests that carry a referrer from another site.
          <img
            src={account.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setPhotoFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          account.name.charAt(0)
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-64 rounded-2xl shadow-xl overflow-hidden z-50"
          style={{ background: "#ffffff", border: "1px solid #e8d5b7" }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: "#f0e6d6" }}>
            <p className="text-sm font-bold truncate" style={{ color: "var(--ink)" }}>{account.name}</p>
            <p className="text-xs truncate" style={{ color: "#57422C" }}>{account.email}</p>
          </div>
          <div className="py-2">
            {dashboard && (
              <Link
                href={dashboard.href}
                role="menuitem"
                className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-[#fbf7f2]"
                style={{ color: "var(--ink)" }}
              >
                <LayoutDashboard size={17} style={{ color: "#a0566c" }} />
                {dashboard.label}
              </Link>
            )}
            <button
              onClick={signOut}
              role="menuitem"
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-[#fbf7f2] cursor-pointer"
              style={{ color: "#57422C" }}
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
