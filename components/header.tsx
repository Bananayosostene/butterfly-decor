"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ColorPicker } from "./color-picker";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";
import { useState, useEffect } from "react";

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

  const openWhatsApp = () => {
    window.open("https://wa.me/+250788724867?text=Hello%20Butterfly%20Decs%20%F0%9F%8C%B8%E2%9C%A8", "_blank");
  };

  const whatsappSvg = (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
    </svg>
  );

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events We Created" },
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
              className="text-base sm:text-xl font-bold text-primary"
            >
              <span>Butterfly Decs</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
       
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1 rounded-full border transition-smooth text-sm font-medium ${
                    isActive
                      ? 'bg-primary text-accent-foreground border-primary'
                      : 'border-primary text-primary hover:text-primary/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/request"
              className={`px-4 py-1 rounded-full border transition-smooth text-sm font-medium ${
                pathname === '/request'
                  ? 'bg-primary text-accent-foreground border-primary'
                  : 'border-primary text-primary hover:text-primary/80'
              }`}
            >
              {selectedCount > 0
                ? `Request (${selectedCount}) ${selectedCount !== 1 ? "s" : ""}`
                : "Request Service"}
            </Link>
            <button
              onClick={openWhatsApp}
              className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white hover:scale-110 transition-transform"
              aria-label="WhatsApp"
            >
              {whatsappSvg}
            </button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ColorPicker />
            </div>
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={openWhatsApp}
              className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white hover:scale-110 transition-transform"
              aria-label="WhatsApp"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Second Row Nav */}
        <nav className="md:hidden pb-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
         
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 lg:px-4 py-1 rounded-full border transition-smooth text-sm ${
                    isActive
                      ? 'bg-primary text-accent-foreground border-primary'
                      : 'border-primary text-primary hover:text-primary/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <Link
            href="/request"
            className={`px-3 py-1 rounded-full border text-sm font-medium transition-smooth ${
              pathname === '/request'
                ? 'bg-primary text-accent-foreground border-primary'
                : 'border-primary text-primary hover:text-primary/80'
            }`}
          >
            {selectedCount > 0
              ? `Request (${selectedCount})`
              : "Request Service"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
