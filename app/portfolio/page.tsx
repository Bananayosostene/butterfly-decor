"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState, useEffect } from "react"
import Image from "next/image"

interface PortfolioImage {
  id: string
  title: string
  category: string
  imageUrl: string
}

export default function PortfolioPage() {
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [loading, setLoading] = useState(true)

  const categories = ["All", "Weddings", "Birthdays", "Church", "Memorial"]

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/portfolio")
        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error("Failed to fetch portfolio images:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const filteredImages = selectedCategory === "All" ? images : images.filter((img) => img.category === selectedCategory)
    const whatsappUrl =
      "https://wa.me/+250788724867?text=Hello%20Butterfly%20Decs,%20I%20would%20like%20to%20book%20your%20decoration%20services%20and%20outfit%20rental%20for%20my%20event.%20Please%20share%20more%20details.%20Thank%20you.";
    const instagramUrl = "https://www.instagram.com/sostene_____/";

  return (
    <>
      <Header />
      <main>
        {/* Page Header */}
        <section className="py-4 px-4 bg-muted border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:justify-center gap-6 md:gap-12">
              {/* Title */}
              <div className="text-center md:text-start">
                <h1 className="text-4xl font-playball md:text-2xl font-bold text-foreground mb-4">
                  Events we Created
                </h1>
                <p className="text-xs text-muted-foreground">
                  Explore our collection of beautifully decorated events.
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex gap-6 items-center">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/butterfly_decs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"
                  aria-label="Instagram"
                >
                  <Image
                    src="/instagram-icon.png"
                    alt="Instagram"
                    width={38}
                    height={38}
                    className="rounded-full"
                  />
                  <span className="text-xs text-muted-foreground">
                    Instagram
                  </span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@butterfly_decs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"
                  aria-label="TikTok"
                >
                  <Image
                    src="/tik-tok-icon.png"
                    alt="TikTok"
                    width={38}
                    height={38}
                    className="rounded-full"
                  />
                  <span className="text-xs text-muted-foreground">TikTok</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Buttons */}
        <section className="py-4 px-4 bg-background border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-1 text-sm rounded-full font-medium transition-smooth ${
                    selectedCategory === cat
                      ? "bg-primary text-accent-foreground"
                      : "bg-muted text-foreground border border-border hover:border-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-4 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading portfolio...</p>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No images in this category yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Check back soon for more beautiful decorations!
                  {/* vhvjhbjkjlnkn,mn,knk */}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-lg bg-muted border border-border hover:shadow-lg transition-smooth cursor-pointer"
                  >
                    <img
                      src={image.imageUrl || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-smooth duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-end justify-start">
                      <div className="p-4 text-white">
                        <h3 className="font-semibold mb-1">{image.title}</h3>
                        <p className="text-sm text-white/80">
                          {image.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
