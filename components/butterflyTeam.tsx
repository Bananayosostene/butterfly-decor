"use client";

import { useState } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ButterflyTeamProps {
  teamImage?: string;
  teamName?: string;
  skills?: string[];
  subscriberCount?: string;
}

export function ButterflyTeam({
  teamImage = "/butterflyTeam.png",
  teamName = "Our Dream Team",
  skills = [
    "Expert Wedding Planning",
    "Premium Decoration Services",
    "Professional Photography",
    "Videography & Editing",
    "Venue & Vendor Coordination",
    "Seamless Event Execution",
  ],
  subscriberCount = "1k+",
}: ButterflyTeamProps) {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);

    // Simulate subscription
    setTimeout(() => {
      setEmail("");
      setIsSubscribing(false);
      alert("Thank you for subscribing!");
    }, 1000);
  };

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left Side - Team Photo */}
          <div className="relative aspect-square  overflow-hidden">
            <Image
              src={teamImage}
              alt="Our Wedding Planning Team"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right Side - Content */}
          <div className="flex flex-col space-y-8 py-8">
            {/* Heading */}
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-primary text-balance mb-6">
                {teamName}
              </h2>
              <p className="text-sm text-primary leading-relaxed">
                We are passionate about creating unforgettable wedding
                experiences. With years of expertise and dedication to
                excellence, we bring your dream wedding to life with meticulous
                attention to every detail.
              </p>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">
                Our Expertise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0" />
                    <p className="text-primary text-sm">{skill}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Subscribe */}
            <div className="pt-4">
              <p className="text-sm  text-primary mb-6">
                Stay updated with our latest collections and wedding tips
              </p>

              <form
                onSubmit={handleSubscribe}
                className="flex flex-col space-y-4"
              >
                {/* Email Input with Subscriber Count */}
                <div className="relative">
                  <div className="flex items-center bg-white border border-gray-300 rounded-full px-5 py-3 md:py-4 focus-within:ring-2 focus-within:ring-gray-400 transition-all">
                    {/* Subscriber Count & Avatars on Left */}
                    <div className="flex items-center space-x-2 mr-4 flex-shrink-0 pr-4 border-r border-gray-200">
                      {/* Avatar placeholders */}
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500" />
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                        {subscriberCount}
                      </span>
                    </div>

                    {/* Input Field */}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-sm md:text-base"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="flex-shrink-0 ml-3 text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
                      aria-label="Subscribe"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-primary">
                  We respect your privacy. You can unsubscribe at any time by
                  entering your email again.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
