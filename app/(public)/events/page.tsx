"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Eye } from "lucide-react";

interface Event {
  id: string;
  title: string;
  imageUrl: string;
  viewCount: number;
  isVideo?: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatViewCount = (count: number | undefined | null): string => {
    if (count == null) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <main className="w-full">
      {/* Page Header */}
      <section className="py-6 md:py-8 px-4 md:px-6 lg:px-8 bg-muted">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-light text-primary text-balance mb-4">
            Our Events
          </h1>
          <p className="hidden sm:block text-lg text-primary">
            Browse our beautiful collection of wedding events, celebrations, and
            special moments
          </p>
        </div>
      </section>

      {/* Events Gallery */}
      <section className="px-0 md:px-20 lg:px-40">
        <div className="mx-auto">
          {loading ? (
            <div className="min-h-screen w-full flex items-center justfy-center">
              <p className="text-gray-400">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-2">No events found yet.</p>
              <p className="text-gray-500">
                Check back soon for our latest celebrations!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-0">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group relative cursor-pointer overflow-hidden"
                  style={{ aspectRatio: "3/4" }}
                >
                  {/* Image/Video */}
                  <Image
                    src={event.imageUrl || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300"
                    sizes="33vw"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />

                  {/* Play Button (if video) */}
                  {event.isVideo && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-white rounded-full p-2">
                        <Play className="w-5 h-5 text-black fill-black" />
                      </div>
                    </div>
                  )}

                  {/* View Count */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white font-medium text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{formatViewCount(event.viewCount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
