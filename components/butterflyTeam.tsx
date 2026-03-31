"use client";

import { useState } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { useInView } from "@/hooks/useInView";

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
  const [subscribed, setSubscribed] = useState(false);
  const { ref, inView } = useInView(0.2);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setTimeout(() => {
      setEmail("");
      setIsSubscribing(false);
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
    }, 1000);
  };

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="w-full bg-primary/10 py-12 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">

          {/* Left — slides in from left */}
          <div
            className="relative h-64 sm:h-80 lg:h-full lg:min-h-[420px] overflow-hidden transition-all duration-700 ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(-40px)",
            }}
          >
            <Image
              src={teamImage}
              alt="Our Wedding Planning Team"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right — slides in from right */}
          <div
            className="flex flex-col px-5 space-y-4 py-6 transition-all duration-700 ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(40px)",
              transitionDelay: "150ms",
            }}
          >
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-primary text-balance mb-3">
                {teamName}
              </h2>
              <p className="text-sm text-primary leading-relaxed">
                We are passionate about creating unforgettable wedding
                experiences. With years of expertise and dedication to
                excellence, we bring your dream wedding to life with meticulous
                attention to every detail.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-primary mb-2">
                Our Expertise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0" />
                    <p className="text-primary text-sm">{skill}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Subscribe */}
            <div>
              <p className="text-sm text-primary mb-3">
                Stay updated with our latest collections and wedding tips
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
                {subscribed && (
                  <p className="text-xs text-green-600 font-medium">Thank you for subscribing!</p>
                )}
                <div className="relative">
                  <div className="flex items-center bg-white border border-gray-300 rounded-full px-5 py-2.5 focus-within:ring-2 focus-within:ring-gray-400 transition-all">
                    <div className="flex items-center space-x-2 mr-4 flex-shrink-0 pr-4 border-r border-gray-200">
                      <div className="flex -space-x-4">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-6 h-6 rounded-full overflow-hidden border border-white">
                            <Image
                              src="/profile.svg"
                              alt="subscriber"
                              width={24}
                              height={24}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                        {subscriberCount}
                      </span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-sm"
                    />
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
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
