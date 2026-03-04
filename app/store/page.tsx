"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function WeddingDetailsPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Load selected items from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("butterfly-selected-items");
    if (saved) {
      setSelectedItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem(
      "butterfly-selected-items",
      JSON.stringify(selectedItems),
    );
    // Dispatch event to notify header
    window.dispatchEvent(
      new CustomEvent("selectedItemsChange", { detail: selectedItems.length }),
    );
  }, [selectedItems]);

  const allItems = [
    {
      id: "classic",
      name: "Classic Elegance",
      image: "/wedding.png?key=obcjv",
      category: "Decoration",
    },
    {
      id: "modern",
      name: "Modern Chic",
      image: "/wedding.png?key=obcjv",
      category: "Decoration",
    },
    {
      id: "rustic",
      name: "Rustic Romance",
      image: "/wedding.png?key=obcjv",
      category: "Decoration",
    },
    {
      id: "garden",
      name: "Garden Paradise",
      image: "/wedding.png?key=obcjv",
      category: "Decoration",
    },
    {
      id: "groom-suit",
      name: "Groom Suits",
      image: "/suits.jpg?key=obcjv",
      category: "Clothing",
    },
    {
      id: "bride-dress",
      name: "Bride Dresses",
      image: "/suits.jpg?key=obcjv",
      category: "Clothing",
    },
    {
      id: "bridesmaid",
      name: "Bridesmaid Dresses",
      image: "/suits.jpg?key=obcjv",
      category: "Clothing",
    },
    {
      id: "groomsmen",
      name: "Groomsmen Suits",
      image: "/suits.jpg?key=obcjv",
      category: "Clothing",
    },
    {
      id: "fairy",
      name: "Fairy Lights",
      image: "/lighting.jpg?key=obcjv",
      category: "Lighting",
    },
    {
      id: "chandelier",
      name: "Chandeliers",
      image: "/lighting.jpg?key=obcjv",
      category: "Lighting",
    },
    {
      id: "uplighting",
      name: "Uplighting",
      image: "/lighting.jpg?key=obcjv",
      category: "Lighting",
    },
    {
      id: "led",
      name: "LED Effects",
      image: "/lighting.jpg?key=obcjv",
      category: "Lighting",
    },
  ];

  const categories = ["All", "Decoration", "Clothing", "Lighting"];

  const filteredItems =
    activeFilter === "All"
      ? allItems
      : allItems.filter((item) => item.category === activeFilter);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background relative">
        {/* Hero Section */}
        <section className=" relative h-[12vh] sm:h-[18vh] md:h-[22vh] lg:h-[30vh] overflow-hidden">
          <img
            src="/wedding.png?key=obcjv"
            alt="Wedding Decoration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex items-end">
            <div className="max-w-7xl mx-auto px-4 pb-6 sm:pb-12 md:pb-16 lg:pb-20 w-full">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-playball text-white mb-4">
                Wedding Decoration and Clothing Rental
              </h1>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="pt-8 ">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-1 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-4 py-1 rounded-full text-sm transition-smooth ${
                    activeFilter === category
                      ? "bg-accent text-accent-foreground"
                      : "bg-card text-foreground border border-border hover:border-accent"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Mixed Items Grid */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelection(item.id)}
                  className={`relative sm:h-75 h-100 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                    selectedItems.includes(item.id) ? "ring-4 ring-accent" : ""
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex flex-col justify-between p-4">
                    <span className="text-xs  text-primary-foreground px-3 py-1 rounded-full self-start">
                      {/* {item.category} */}
                    </span>
                    <h3 className="text-white  text-sm">{item.name}</h3>
                  </div>
                  {selectedItems.includes(item.id) && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-white">✓</span>
                    </div>
                  )}
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
