"use client";

import Link from "next/link";
import { Play } from "lucide-react";

interface EventsShowcaseProps {
  backgroundImage?: string;
  eventTitle?: string;
  eventDescription?: string;
}

export function WatchOurEvents({
  backgroundImage = "watchOurEvents.jpg",
  eventTitle = "Our Events",
}: EventsShowcaseProps) {
  return (
    <section
      className="relative w-full h-100 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Centered Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Event Title */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white text-balance mb-4 text-center">
          {eventTitle}
        </h2>

        {/* Play Button */}
        <Link
          href="/events"
          className="flex items-center justify-center gap-3 group cursor-pointer"
          aria-label="View all events"
        >
          <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
            <Play
              className="w-8 h-8 md:w-10 md:h-10 text-black fill-black"
              aria-hidden="true"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
