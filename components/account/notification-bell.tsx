"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Check } from "lucide-react";

type Notice = { id: string; type: string; title: string; body: string | null; href: string | null; readAt: string | null; createdAt: string };

const POLL_MS = 30_000;
const SOUND_KEY = "dash-notification-sound";

/** A short, soft two-note chime, made in the browser (no sound file to download). */
function chime() {
  try {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Context();
    [[880, 0], [1318.5, 0.14]].forEach(([frequency, at]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + at);
      osc.stop(ctx.currentTime + at + 0.4);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {}
}

const ago = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h ago` : new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/** The bell in the dashboard top bar: unread count, the newest notices, and a chime when one arrives. */
export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notice[]>([]);
  const [sound, setSound] = useState(true);
  const lastUnread = useRef<number | null>(null);
  const soundRef = useRef(true);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SOUND_KEY) !== "off";
      setSound(saved);
      soundRef.current = saved;
    } catch {}

    let stopped = false;
    const load = async () => {
      try {
        const json = await (await fetch("/api/notifications", { cache: "no-store" })).json();
        if (stopped || !json?.success) return;
        // A chime when the unread count goes up (not on the first load of the page).
        if (lastUnread.current !== null && json.unread > lastUnread.current && soundRef.current) chime();
        lastUnread.current = json.unread;
        setUnread(json.unread);
        setItems(json.items);
      } catch {}
    };
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markRead = async (body: object) => {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});
  };

  const openNotice = async (notice: Notice) => {
    setOpen(false);
    if (!notice.readAt) {
      setItems((list) => list.map((n) => (n.id === notice.id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnread((n) => Math.max(0, n - 1));
      lastUnread.current = Math.max(0, (lastUnread.current ?? 1) - 1);
      await markRead({ id: notice.id });
    }
    if (notice.href) router.push(notice.href);
  };

  const markAll = async () => {
    setItems((list) => list.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnread(0);
    lastUnread.current = 0;
    await markRead({ all: true });
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    soundRef.current = next;
    try {
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {}
    if (next) chime();
  };

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `${unread} unread notifications` : "Notifications"}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--dash-danger)", color: "#fff" }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <div className="flex items-center gap-1">
              <button onClick={toggleSound} title={sound ? "Turn the sound off" : "Turn the sound on"} aria-label={sound ? "Turn the sound off" : "Turn the sound on"} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent cursor-pointer">
                {sound ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              {unread > 0 && (
                <button onClick={markAll} className="inline-flex items-center gap-1 px-2 h-8 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent cursor-pointer">
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto divide-y divide-border">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing yet.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <button onClick={() => openNotice(n)} className="w-full text-left px-4 py-3 hover:bg-accent/60 cursor-pointer flex gap-3">
                  <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ background: n.readAt ? "transparent" : "var(--dash-accent)" }} />
                  <span className="min-w-0">
                    <span className={`block text-sm ${n.readAt ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.title}</span>
                    {n.body && <span className="block text-xs text-muted-foreground line-clamp-2">{n.body}</span>}
                    <span className="block mt-0.5 text-[11px] text-muted-foreground">{ago(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link href="/account/notifications" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-center text-xs font-medium border-t border-border hover:bg-accent" style={{ color: "var(--dash-accent)" }}>
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
