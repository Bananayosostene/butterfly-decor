"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg text-sm bg-background text-foreground border border-border outline-none focus:border-primary";

export default function AuthPanel({
  googleFailed,
  initialMode,
}: {
  googleFailed: boolean;
  /** Which tab is open on arrival: /login shows "Sign in", /login?tab=register shows "Create account". */
  initialMode: "login" | "register";
}) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(googleFailed ? "Google sign-in did not complete. Please try again." : "");
  // The admin account locks after 3 wrong passwords; it is unlocked by resetting the password.
  const [locked, setLocked] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setLocked(false);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.message ?? "Something went wrong. Please try again.");
        setLocked(res.status === 423);
        setLoading(false);
        return;
      }
      // A full page load, so the next page (dashboard or vendor question) starts with the new session.
      window.location.href = json.data?.next ?? "/";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const tab = (value: "login" | "register", label: string) => (
    <button
      type="button"
      onClick={() => { setMode(value); setError(""); }}
      className="flex-1 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer"
      style={mode === value ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl p-6 shadow-lg" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      <div className="flex p-1 rounded-full" style={{ background: "var(--muted)" }}>
        {tab("login", "Sign in")}
        {tab("register", "Create account")}
      </div>

      {/* A plain link: Google sign-in is a full-page redirect, not a background request. */}
      <a
        href="/api/auth/google"
        className="mt-5 flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-muted transition-colors"
        style={{ color: "var(--foreground)" }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
        </svg>
        Continue with Google
      </a>

      <div className="my-5 flex items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
        <span className="flex-1 h-px bg-border" />
        or with email
        <span className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="text-sm py-2 px-3 rounded-lg space-y-1" style={{ background: "#fde8e8", color: "#991b1b" }}>
            <p>{error}</p>
            {locked && (
              <Link href="/account/forgot-password" className="inline-block font-semibold underline">
                Reset your password
              </Link>
            )}
          </div>
        )}
        {mode === "register" && (
          <input value={form.name} onChange={set("name")} required maxLength={60} placeholder="Full name" autoComplete="name" className={inputClass} />
        )}
        <input type="email" value={form.email} onChange={set("email")} required placeholder="Email" autoComplete="email" className={inputClass} />
        {mode === "register" && (
          <input type="tel" value={form.phone} onChange={set("phone")} required placeholder="Phone, e.g. +250 788 000 000" autoComplete="tel" className={inputClass} />
        )}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            required
            minLength={mode === "register" ? 8 : undefined}
            placeholder={mode === "register" ? "Password (at least 8 characters)" : "Password"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
            style={{ color: "var(--muted-foreground)" }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {loading ? "Please wait…" : mode === "register" ? "Create my account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
