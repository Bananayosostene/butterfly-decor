"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignedInCard({ name, email }: { name: string; email: string }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl px-6 py-6 shadow-xl text-center border-t-4" style={{ background: "rgba(253,250,246,0.94)", borderTopColor: "#2b1807", backdropFilter: "blur(6px)" }}>
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Signed in as</p>
      <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>{name}</p>
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{email}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/collection" className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: "#2b1807", color: "#f7efe3" }}>
          Browse vendors
        </Link>
        
        <button onClick={logout} className="px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer" style={{ border: "1px solid #2b1807", color: "#2b1807" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
