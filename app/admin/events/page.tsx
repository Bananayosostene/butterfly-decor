import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function PortfolioManagementPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const portfolioImages = await prisma.portfolioImage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl   font-bold text-foreground">
              Portfolio Management
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/admin/event/upload"
            className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-smooth"
          >
            + Upload Image
          </Link>
        </div>

        {portfolioImages.length === 0 ? (
          <p className="text-muted-foreground">
            No portfolio images yet. Start by uploading your first image!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioImages.map((image) => (
              <div
                key={image.id}
                className="border border-border rounded-lg overflow-hidden"
              >
                <img
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={image.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">
                    {image.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {image.category}
                  </p>
                  <Link
                    href={`/admin/events/${image.id}`}
                    className="text-accent hover:opacity-80 text-sm font-medium transition-smooth"
                  >
                    Edit / Delete
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
