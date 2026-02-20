"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const whatsappUrl =
    "https://wa.me/+250788724867?text=Hello%20Butterfly%20Ltd%2C%20I%20would%20like%20to%20book%20your%20services";

  const services = [
    {
      id: "wedding",
      title: "Wedding Decoration",
      features: ["Venue styling", "Floral arrangements", "Lighting design", "Custom themes"],
      image: "weeding.png?key=obcjv",
    },
    {
      id: "birthday",
      title: "Birthday Decoration",
      features: ["Balloon arrangements", "Theme decoration", "Table styling", "Photo backdrops"],
      image: "birthdays.png?key=yamyd",
    },
    {
      id: "church",
      title: "Church Events",
      features: ["Altar decoration", "Aisle styling", "Entrance design", "Traditional elements"],
      image: "church.png?key=5qs2p",
    },
    {
      id: "memorial",
      title: "Memorial Decoration",
      features: ["Flower arrangements", "Candle lighting", "Photo displays", "Respectful design"],
      image: "/memorial.png?key=kb2y6",
    },
  ];

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = services.slice(startIndex, endIndex);

  return (
    <>
      <Header />
      <main>
        {/* Services Section */}
        <section className="py-8 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentServices.map((service) => (
                <div
                  key={service.id}
                  className="relative h-100 rounded-2xl p-0.5 pb-px bg-primary/20"
                >
                  <Link
                    href={`/book?service=${service.title}`}
                    className="relative h-full rounded-xl overflow-hidden group block"
                  >
                    {/* Background Image */}
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/10 to-black/90" />

                    {/* Centered Title Badge at Top - Connected to Border */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-primary/20 backdrop-blur-sm px-6 py-2 rounded-b-3xl shadow-lg">
                        <h3 className="text-base font-playball text-center text-foreground whitespace-nowrap">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    {/* Features at Bottom */}
                    <div className="absolute bottom-4 left-0 right-0 px-4">
                      <div className="flex flex-wrap gap-2">
                        {service.features.map((feature, i) => (
                          <span
                            key={i}
                            className="text-xs bg-white/20 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
