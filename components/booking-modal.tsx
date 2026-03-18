"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { butterflyItems } from "@/lib/items";

function syncStorage(items: string[]) {
  localStorage.setItem("butterfly-selected-items", JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("selectedItemsChange", { detail: items.length }));
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

export function BookingModal({ open, onClose }: BookingModalProps) {
  const pathname = usePathname();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [dateError, setDateError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("butterfly-selected-items");
    if (saved) setSelectedItems(JSON.parse(saved));
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const removeItem = (id: string) => {
    const updated = selectedItems.filter((i) => i !== id);
    setSelectedItems(updated);
    syncStorage(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    setDateError("");

    let valid = true;
    if (!phone.trim()) { setPhoneError("Please enter your phone number."); valid = false; }
    if (!eventDate) { setDateError("Please pick an event date."); valid = false; }
    if (!valid) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          eventDate,
          selectedItems,
        }),
      });

      if (!response.ok) throw new Error();

      const { whatsappUrl } = await response.json();
      window.open(whatsappUrl, "_blank");

      setPhone("");
      setEventDate("");
      setPhoneError("");
      setDateError("");
      setSelectedItems([]);
      syncStorage([]);
      onClose();
    } catch {
      setError("Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const onCollection = pathname === "/collection";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        className="w-full sm:max-w-lg bg-card border border-border rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-base font-bold text-foreground">Request a Service</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {/* Your Selections */}
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-3">Your Selections:</p>
            {selectedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No items selected yet.{" "}
                {!onCollection && (
                  <>
                    Click{" "}
                    <a href="/collection" className="font-medium text-primary underline">
                      collection
                    </a>{" "}
                    and{" "}
                  </>
                )}
                use the <span className="text-primary font-medium">✓ check icon</span> on items to select them.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((id) => {
                  const item = butterflyItems.find((i) => i.id === id);
                  return (
                    <span key={id} className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-sm rounded-full">
                      {item?.name ?? id}
                      <button type="button" onClick={() => removeItem(id)} className="ml-1 hover:text-red-500 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground ${
                phoneError ? "border-red-400" : "border-border"
              }`}
              placeholder="+250 788 724 867"
            />
            {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => { setEventDate(e.target.value); setDateError(""); }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground ${
                dateError ? "border-red-400" : "border-border"
              }`}
            />
            {dateError && <p className="text-xs text-red-500 mt-1">{dateError}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Requesting..." : "Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
