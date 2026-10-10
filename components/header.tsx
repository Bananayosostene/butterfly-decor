"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { CalendarCheck, ClipboardList, Heart, Images, Store } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AccountMenu } from "@/components/account-menu";

export function Header() {
  const pathname = usePathname();
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    const handleItemsChange = (e: CustomEvent) => {
      setSelectedCount(e.detail);
    };

    const saved = localStorage.getItem("butterfly-selected-items");
    if (saved) {
      const items = JSON.parse(saved);
      setSelectedCount(items.length);
    }

    window.addEventListener("selectedItemsChange" as any, handleItemsChange);
    return () => {
      window.removeEventListener("selectedItemsChange" as any, handleItemsChange);
    };
  }, []);

  const navLinks = [
    { href: "/collection", label: "WEDDING", icon: Heart },
    { href: "/wedding-albums", label: "ALBUMS", icon: Images },
    { href: "/vendors", label: "VENDORS", icon: Store },
    { href: "/wedding-planning", label: "PLANNING", icon: ClipboardList },
  ];

  const openBookingModal = () => {
    window.dispatchEvent(new CustomEvent("openBookingModal"));
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  /** Bottom-bar labels: first letter capital, the rest lowercase. */
  const sentenceCase = (label: string) =>
    label.charAt(0) + label.slice(1).toLowerCase();

  const navClass = (href: string) =>
    `px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
      isActive(href)
        ? "bg-accent text-paper"
        : "text-paper/80 hover:text-paper"
    }`;

  const tabClass = (href: string) => {
    const active = isActive(href);
    return `flex-1 min-w-0 flex flex-col items-center gap-1 px-0.5 py-2 rounded-lg transition-colors ${
      active ? "text-paper" : "text-paper/70"
    }`;
  };

  const badge =
    selectedCount > 0 ? (
      <span className="ml-1 inline-flex items-center justify-center w-4 h-4 align-middle text-[10px] font-bold rounded-full bg-primary-foreground text-primary">
        {selectedCount}
      </span>
    ) : null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-primary border-b border-accent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <span className="text-[16px] font-medium text-paper">Butterfly</span>
                <Image
                  src="/butterfly_logo.png"
                  alt=""
                  width={25}
                  height={25}
                  className="object-contain"
                />
                <span className="text-sm font-medium text-paper">Decor</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navClass(link.href)}>
                  {link.label}
                </Link>
              ))}
              <button onClick={openBookingModal} className={navClass("/request")}>
                BOOK NOW
                {badge}
              </button>
              <AccountMenu />
            </nav>

            {/* Mobile: account / sign in only */}
            <div className="md:hidden flex items-center">
              <AccountMenu /> 
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: app-style bottom tab bar */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-primary border-t border-accent">
        <div
          className="flex items-stretch justify-around px-1 pt-1.5"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={tabClass(link.href)}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} />
                <span className="text-[10px] font-medium tracking-wide text-center leading-[1.1]">
                  {sentenceCase(link.label)}
                </span>
              </Link>
            );
          })}
          <button onClick={openBookingModal} className={tabClass("/request")}>
            <CalendarCheck className="h-6 w-6" strokeWidth={isActive("/request") ? 2.25 : 1.75} />
            <span className="text-[10px] font-medium tracking-wide text-center leading-[1.1]">
              {sentenceCase("BOOK NOW")}
              {badge}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
