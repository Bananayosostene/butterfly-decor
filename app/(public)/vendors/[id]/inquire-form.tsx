"use client";

import type React from "react";
import { useState } from "react";

const INK = "var(--ink)";
const inputClass = "w-full px-3 py-2.5 text-sm bg-white outline-none focus:border-[var(--ink)]";
const inputStyle = { border: "1px solid #e8d5b7", color: INK };

/**
 * Inquiry form. There is no inbox on the site: sending opens WhatsApp with the message already
 * written, addressed to the vendor (or to Butterfly Decor when the vendor has no phone number).
 */
export function InquireForm({ vendorName, whatsappNumber }: { vendorName: string; whatsappNumber: string }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      `Hello ${vendorName}, I found you on Butterfly Decor.`,
      `My name: ${name.trim()}`,
      date && `Wedding date: ${new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
      message.trim(),
    ].filter(Boolean);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <label className="block">
        <span className="text-xs mb-1 block" style={{ color: "#57422C" }}>Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} className={inputClass} style={inputStyle} />
      </label>
      <label className="block">
        <span className="text-xs mb-1 block" style={{ color: "#57422C" }}>Wedding date (optional)</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} style={inputStyle} />
      </label>
      <label className="block">
        <span className="text-xs mb-1 block" style={{ color: "#57422C" }}>Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={600}
          rows={4}
          placeholder={`Hi ${vendorName}, .....`}
          className={`${inputClass} resize-y`}
          style={inputStyle}
        />
      </label>
      <button
        type="submit"
        className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 cursor-pointer"
        style={{ background: INK, color: "var(--cream)" }}
      >
        Send inquiry
      </button>
    </form>
  );
}
