"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      router.push("/admin");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fdf6ee" }}>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3">🦋</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#2b1807" }}>Welcome back</h1>
          <p className="text-sm" style={{ color: "#835105" }}>Sign in to your admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-center py-2 px-3 rounded-lg" style={{ background: "#fde8e8", color: "#991b1b" }}>
              {error}
            </p>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: "#3d230c" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin email"
              className="w-full px-4 py-3  border text-sm outline-none transition-all"
              style={{ background: "#fff", borderColor: "#d4b896", color: "#2b1807" }}
              onFocus={e => (e.target.style.borderColor = "#835105")}
              onBlur={e => (e.target.style.borderColor = "#d4b896")}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: "#3d230c" }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11  border text-sm outline-none transition-all"
                style={{ background: "#fff", borderColor: "#d4b896", color: "#2b1807" }}
                onFocus={e => (e.target.style.borderColor = "#835105")}
                onBlur={e => (e.target.style.borderColor = "#d4b896")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: "#835105" }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3  text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ background: "#2b1807", color: "#e8d5b7" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
