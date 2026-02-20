"use client";

import type React from "react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceParam = searchParams.get("service");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    eventType: serviceParam || "Wedding Decoration",
    eventDate: "",
    eventLocation: "",
    preferredColors: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const serviceOptions = [
    "Wedding Decoration",
    "Birthday Decoration",
    "Church Events",
    "Memorial Decoration",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Submit booking to MongoDB
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit booking");
      }

      // Redirect to WhatsApp with auto-filled message
      const whatsappMessage = `Hello Butterfly Events Ltd, I need decoration for a ${formData.eventType} on ${formData.eventDate} at ${formData.eventLocation}.`;
      const whatsappUrl = `https://wa.me/+250788724867?text=${encodeURIComponent(
        whatsappMessage,
      )}`;
      window.open(whatsappUrl, "_blank");

      // Reset form
      setFormData({
        fullName: "",
        phone: "",
        eventType: "Wedding Decoration",
        eventDate: "",
        eventLocation: "",
        preferredColors: "",
        notes: "",
      });
    } catch (err) {
      setError("Failed to submit booking. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl   font-bold text-foreground mb-4">
              Book Your Event
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill in your event details and we{"'"}ll get back to you shortly.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-card border border-border rounded-lg p-8"
          >
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                placeholder="John Doe"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                placeholder="+1 234 567 8900"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Event Type
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
              >
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
              />
            </div>

            {/* Event Location */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Event Location
              </label>
              <input
                type="text"
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                placeholder="e.g., Grand Hotel, Downtown"
              />
            </div>

            {/* Preferred Colors */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Preferred Colors (Optional)
              </label>
              <input
                type="text"
                name="preferredColors"
                value={formData.preferredColors}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                placeholder="e.g., Gold, Blush, Ivory"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground resize-none"
                placeholder="Tell us more about your vision..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-smooth disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Booking & Message WhatsApp"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
