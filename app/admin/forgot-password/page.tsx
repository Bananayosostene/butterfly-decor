"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fdf6ee" }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3">🦋</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#2b1807" }}>Reset your password</h1>
          <p className="text-sm" style={{ color: "#835105" }}>We'll email you a link to set a new one</p>
        </div>

        {sent ? (
          <div className="space-y-5 text-center">
            <p className="text-sm py-3 px-4 rounded-lg" style={{ background: "#f0fdf4", color: "#166534" }}>
              If that email is registered, a reset link is on its way. Check your inbox.
            </p>
            <Link href="/admin/login" className="text-sm font-medium underline" style={{ color: "#2b1807" }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: "#3d230c" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin email"
                className="w-full px-4 py-3 border text-sm outline-none transition-all"
                style={{ background: "#fff", borderColor: "#d4b896", color: "#2b1807" }}
                onFocus={(e) => (e.target.style.borderColor = "#835105")}
                onBlur={(e) => (e.target.style.borderColor = "#d4b896")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ background: "#2b1807", color: "#e8d5b7" }}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <Link href="/admin/login" className="block text-center text-sm font-medium underline" style={{ color: "#835105" }}>
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
