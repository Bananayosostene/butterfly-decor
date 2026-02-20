"use client";

import Link from "next/link";
import { useState } from "react";
import { ColorPicker } from "./color-picker";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 h-16">
            <Image
              src="/butterfly_logo.png"
              alt="Butterfly Ltd logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />

            <Link
              href="/"
              className="text-xl font-serif font-bold text-primary"
            >
              Butterfly Decoration
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/80 hover:text-foreground transition-smooth"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book"
              className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-smooth text-sm font-medium"
            >
              Book Now
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ColorPicker />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <ColorPicker />
            <button
              className="p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2 py-2 text-sm text-foreground/80 hover:text-foreground transition-smooth"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book"
              className="px-6 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium text-center"
              onClick={() => setMobileOpen(false)}
            >
              Book Now
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
