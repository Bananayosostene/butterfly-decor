"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, X } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  /** Signed up with Google. */
  google: boolean;
  joined: string;
};

const INPUT = "w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground";
const EMPTY = { name: "", email: "", phone: "", password: "" };

/** Address of the users page for a search (page 1 and an empty search are left out). */
const hrefFor = (q: string, page = 1) => {
  const params = new URLSearchParams({ ...(q && { q }), ...(page > 1 && { page: String(page) }) });
  const query = params.toString();
  return query ? `/account/users?${query}` : "/account/users";
};

export default function UsersClient({
  users, total, all, q, page, lastPage,
}: {
  users: User[];
  /** Clients matching the search, on every page. */
  total: number;
  /** Every client, whatever the search. */
  all: number;
  q: string;
  page: number;
  lastPage: number;
}) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [search, setSearch] = useState(q);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The server page owns the data: the search changes the address and it renders again.
  const go = (nextQ: string) => startTransition(() => router.replace(hrefFor(nextQ), { scroll: false }));
  const reload = () => startTransition(() => router.refresh());

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => go(value.trim()), 350);
  };

  const handleAdd = async () => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json().catch(() => null);
    setSaving(false);
    if (!json?.success) return setError(json?.message || "Could not create the client");
    setAdding(false);
    setForm(EMPTY);
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by name..." aria-label="Search by name" className={`${INPUT} pl-9`} />
        </div>
        <p className="text-sm text-muted-foreground">
          {q ? `${total} of ${all} clients` : `${all} client${all !== 1 ? "s" : ""}`}
        </p>
        <button
          onClick={() => { setError(""); setAdding(true); }}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {error && !adding && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }}>{error}</p>}

      <div className={`bg-card border border-border rounded-2xl overflow-hidden transition-opacity ${loading ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Client", "Phone", "Signs in with", "Joined"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-9 h-9 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold uppercase">{u.name.charAt(0)}</span>
                      )}
                      <div className="min-w-0">
                        <p className="text-foreground font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{u.phone || "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.google ? "Google" : "Password"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(u.joined).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No clients match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Page {page} of {lastPage}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={hrefFor(q, page - 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Previous</Link>}
            {page < lastPage && <Link href={hrefFor(q, page + 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Next</Link>}
          </div>
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Add Client</h2>
              <button onClick={() => setAdding(false)} aria-label="Close"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }}>{error}</p>}
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name *" className={INPUT} />
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email *" className={INPUT} />
            <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone" className={INPUT} />
            <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Password * (at least 8 characters)" autoComplete="new-password" className={INPUT} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={saving || !form.name.trim() || !form.email.trim() || form.password.length < 8}
                className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
