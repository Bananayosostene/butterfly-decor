"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useState, useEffect } from "react";
import { WeddingShopHero } from "@/components/butterfly-hero";
import { ServiceSections } from "@/components/service-sections";
import { EntertainmentSection } from "@/components/entertainmentSection";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!sessionStorage.getItem("bfly-visited")) {
      sessionStorage.setItem("bfly-visited", "1");
      fetch("/api/track", { method: "POST" }).catch(() => {});
    }
  }, []);
  const itemsPerPage = 8;
  const whatsappUrl =
    "https://wa.me/+250788724867?text=Hello%20Butterfly%20Ltd%2C%20I%20would%20like%20to%20book%20your%20collections";

  const collections = [
    {
      id: "wedding",
      title: "Wedding Decorations",
      features: [
        "Venue styling",
        "Floral arrangements",
        "Elegant design",
        "Custom themes",
      ],
      image: "wedding.png?key=obcjv",
      link: "/collection?collection=Wedding Decoration",
    },
    {
      id: "birthday",
      title: "Birthday Decorations",
      features: [
        "Balloon arrangements",
        "Theme decoration",
        "Table styling",
        "Photo backdrops",
      ],
      image: "birthdays.png?key=yamyd",
      link: "/collection?collection=Birthday Decoration",
    },
    {
      id: "church",
      title: "Church Events",
      features: [
        "Altar decoration",
        "Aisle styling",
        "Entrance design",
        "Traditional elements",
      ],
      image: "birthdays.png?key=5qs2p",
      link: "/collection?collection=Church Events",
    },
    {
      id: "memorial",
      title: "Memorial Decorations",
      features: [
        "Flower arrangements",
        "Candle lighting",
        "Photo displays",
        "Respectful design",
      ],
      image: "/memorial.png?key=kb2y6",
      link: "/collection?collection=Memorial Decoration",
    },
  ];

  const totalPages = Math.ceil(collections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentcollections = collections.slice(startIndex, endIndex);

  return (
    <>
      <Header />
      <main>
        <WeddingShopHero />
        <ServiceSections />
        <EntertainmentSection />
      </main>
      <Footer />
    </>
  );
}
