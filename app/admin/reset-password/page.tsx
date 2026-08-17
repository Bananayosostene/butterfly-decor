"use client";

import type React from "react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Something went wrong.");
        return;
      }
      router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-sm py-3 px-4 rounded-lg" style={{ background: "#fde8e8", color: "#991b1b" }}>
          This reset link is missing its token. Request a new one.
        </p>
        <Link href="/admin/forgot-password" className="text-sm font-medium underline" style={{ color: "#2b1807" }}>
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-center py-2 px-3 rounded-lg" style={{ background: "#fde8e8", color: "#991b1b" }}>
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#3d230c" }}>New password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 8 characters"
            className="w-full px-4 py-3 pr-11 border text-sm outline-none transition-all"
            style={{ background: "#fff", borderColor: "#d4b896", color: "#2b1807" }}
            onFocus={(e) => (e.target.style.borderColor = "#835105")}
            onBlur={(e) => (e.target.style.borderColor = "#d4b896")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            style={{ color: "#835105" }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#3d230c" }}>Confirm password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Re-enter password"
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
        {loading ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fdf6ee" }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3">🦋</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#2b1807" }}>Set a new password</h1>
          <p className="text-sm" style={{ color: "#835105" }}>This also unlocks your account</p>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
