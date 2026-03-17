"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

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
    localStorage.setItem(
      "butterfly-selected-items",
      JSON.stringify(selectedItems),
    );
    window.dispatchEvent(
      new CustomEvent("selectedItemsChange", { detail: selectedItems.length }),
    );
  }, [selectedItems]);

  const butterflyItems = [
    {
      id: "monarch",
      name: "Monarch Blue",
      image: "/lighting.jpg",
    },
    {
      id: "swallowtail",
      name: "Swallowtail Gold",
      image: "/suits.jpg",
      category: "Gold",
    },
    {
      id: "peacock",
      name: "Peacock Purple",
      image: "/wedding.png",
    },
    {
      id: "monarch",
      name: "Monarch Blue",
      image: "/lighting.jpg",
    },
    {
      id: "swallowtail",
      name: "Swallowtail Gold",
      image: "/suits.jpg",
    },
    {
      id: "peacock",
      name: "Peacock Purple",
      image: "/wedding.png",
    },
    {
      id: "monarch",
      name: "Monarch Blue",
      image: "/lighting.jpg",
    },
    {
      id: "swallowtail",
      name: "Swallowtail Gold",
      image: "/suits.jpg",
    },
    {
      id: "peacock",
      name: "Peacock Purple",
      image: "/wedding.png",
    },
    {
      id: "swallowtail",
      name: "Swallowtail Gold",
      image: "/suits.jpg",
    },
  ];

  const categories = [
    { id: "all", name: "All", label: "All", icon: null },
    { id: "bridal", name: "Bridal", label: "Bridal", icon: "bridal.svg" },
    { id: "cake", name: "Cake", label: "Cake", icon: "cake.svg" },
    { id: "decor", name: "Decor", label: "Decor", icon: "decor.svg" },
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
    { id: "suits", name: "Suits", label: "Suits", icon: "suits.svg" },
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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      {/* Header Section */}
      <section className="pt-12 pb-8 px-4 w-full">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-light text-primary text-balance mb-4">
            Butterfly Collections
          </h1>
          <p className="text-lg text-primary">
            Explore our elegant butterfly collection and discover the beauty of
            nature.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="pb-8 px-4 w-full">
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-1.5 rounded-full border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </section>

      {/* Filter Buttons with SVG */}
      <section className="pb-8 px-4 w-full">
        <div className="flex flex-wrap gap-6 justify-center max-w-6xl mx-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`flex flex-col items-center gap-2 transition-all ${
                activeFilter === category.id
                  ? "opacity-100"
                  : "opacity-60 hover:opacity-80"
              }`}
            >
              <div className="w-16 h-16 flex items-center justify-center">
                {category.icon === null ? (
                  <div className="text-4xl"></div>
                ) : (
                  <img
                    src={`/${category.icon}`}
                    alt={category.label}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <span className="text-sm font-medium text-foreground text-center">
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Butterfly Grid - 2 Columns */}
      <section className="py-8 px-4 pb-16 w-full flex justify-center">
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center md:justify-items-stretch">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className="relative group rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg h-80 w-full"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-primary-foreground bg-accent/80 px-3 py-1 rounded-full">
                      {item.category}
                    </span>

                    {/* Checkbox Selection */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(item.id);
                      }}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedItems.includes(item.id)
                          ? "bg-accent border-accent"
                          : "bg-white/20 border-white/40 hover:border-white"
                      }`}
                    >
                      {selectedItems.includes(item.id) && (
                        <span className="text-white font-bold">✓</span>
                      )}
                    </button>
                  </div>

                  <h3 className="text-white font-semibold text-lg">
                    {item.name}
                  </h3>
                </div>

                {/* Mobile always visible title */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 md:hidden">
                  <h3 className="text-white font-semibold">{item.name}</h3>
                  <span className="text-xs text-gray-300">{item.category}</span>
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
