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
  const selectionsParam = searchParams.get("selections");

  const [formData, setFormData] = useState({
    phone: "",
    eventType: serviceParam || "Wedding Decoration",
    eventDate: "",
    selectedItems: selectionsParam || "",
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
      const selectedItemsText = formData.selectedItems ? `\nSelected: ${formData.selectedItems.split(',').join(', ')}` : '';
      const whatsappMessage = `Hello Butterfly Events Ltd, I need ${formData.eventType} on ${formData.eventDate}.${selectedItemsText}`;
      const whatsappUrl = `https://wa.me/+250788724867?text=${encodeURIComponent(
        whatsappMessage,
      )}`;
      window.open(whatsappUrl, "_blank");

      // Reset form
      setFormData({
        phone: "",
        eventType: "Wedding Decoration",
        eventDate: "",
        selectedItems: "",
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
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Request Quote
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill in your details and we'll contact you shortly.
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

            {/* Selected Items Display */}
            {formData.selectedItems && (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">Your Selections:</p>
                <p className="text-sm text-muted-foreground">
                  {formData.selectedItems.split(',').join(', ')}
                </p>
              </div>
            )}

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
                placeholder="+250 788 724 867"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-smooth disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request & Contact via WhatsApp"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
