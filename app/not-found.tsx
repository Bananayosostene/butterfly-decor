import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-smooth"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
