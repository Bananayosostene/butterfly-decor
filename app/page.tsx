"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useEffect } from "react";
import { WeddingShopHero } from "@/components/butterfly-hero";
import { ServiceSections } from "@/components/service-sections";
import { EntertainmentSection } from "@/components/entertainmentSection";

export default function Home() {
  useEffect(() => {
    if (!sessionStorage.getItem("bfly-visited")) {
      sessionStorage.setItem("bfly-visited", "1");
      fetch("/api/track", { method: "POST" }).catch(() => {});
    }
  }, []);

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
