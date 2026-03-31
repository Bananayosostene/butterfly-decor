"use client";

import { useState, useEffect } from "react";
import { Heart, Search, CheckCircle2 } from "lucide-react";
import { butterflyItems } from "@/lib/items";

export default function ButterflyCollectionsPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);

  // Load selected items from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("butterfly-selected-items");
    if (saved) {
      setSelectedItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem("butterfly-selected-items", JSON.stringify(selectedItems));
    window.dispatchEvent(new CustomEvent("selectedItemsChange", { detail: selectedItems.length }));
  }, [selectedItems]);


  const categories = [
    { id: "all", name: "All", label: "All", icon: "all.svg" },
    { id: "decor", name: "Decor", label: "Decor", icon: "decor.svg" },
    { id: "suits", name: "Suits", label: "Suits", icon: "suits.svg" },
    { id: "bridal", name: "Bridal", label: "Bridal", icon: "bridal.svg" },
    { id: "cake", name: "Cake", label: "Cake", icon: "cake.svg" },
    { id: "dresses", name: "Dresses", label: "Dresses", icon: "dresses.svg" },
    {
      id: "gift-box",
      name: "Gift Box",
      label: "Gift Box",
      icon: "gift-box.svg",
    },
    {
      id: "invitation",
      name: "Invitation",
      label: "Invitation",
      icon: "invitation.svg",
    },
  ];

  // Filter and search items
  useEffect(() => {
    let filtered = butterflyItems;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Randomize if no search (show all or filtered)
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setDisplayedItems(shuffled);
  }, [activeFilter, searchQuery]);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      {/* Header Section */}
      <section className="pt-8 pb-0 md:pb-4 lg:pb-4 px-4 w-full">
        <div className="text-left sm:text-center">
          <h1 className="text-2xl md:text-4xl font-light text-primary text-balance mb-4">
            Butterfly Collections
          </h1>
         
        </div>
      </section>

      <section className="pb-2 px-4 w-full">
        <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 w-max px-2 lg:w-full lg:justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`flex flex-col items-center gap-2 shrink-0 transition-all ${
                  activeFilter === category.id
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                  {category.icon === null ? (
                    <div className="text-3xl"></div>
                  ) : (
                    <img
                      src={`/${category.icon}`}
                      alt={category.label}
                      className="w-full h-full object-contain border-2 border-primary/50 rounded-full"
                    />
                  )}
                </div>

                <span className="text-xs sm:text-sm font-medium text-foreground text-center whitespace-nowrap">
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 sm:py-5 md:py-6 lg:py-8 px-4 pb-16 w-full flex justify-center">
        <div className="max-w-4xl w-full">
          {/* search */}
          <div className="flex justify-center pb-4">
            <div className="relative w-100">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4 lg:h-5 lg:w-5" />
              </span>

              <input
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1 bg-muted rounded-full border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="relative h-60 md:h-80 lg:h-100 w-full">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Action Icons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center shadow cursor-pointer"
                    >
                      <Heart className="h-5 w-5 text-primary" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                      className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center shadow cursor-pointer"
                    >
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          selectedItems.includes(item.id) ? "text-green-500 fill-green-100" : "text-primary"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-primary">
                    {item.name}
                  </h3>

                  <button
                    onClick={() => {
                      toggleSelection(item.id);
                      window.dispatchEvent(new CustomEvent("openBookingModal"));
                    }}
                    className="w-full bg-primary text-white py-2 rounded-full text-sm font-medium hover:bg-primary/95 transition cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {displayedItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No butterflies found matching your search.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
