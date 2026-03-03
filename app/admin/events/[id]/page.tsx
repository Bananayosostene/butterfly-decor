import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function EditPortfolioPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const image = await prisma.portfolioImage.findUnique({
    where: { id: params.id },
  });

  if (!image) {
    redirect("/admin/events");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/admin/events"
            className="text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Events
          </Link>
          <h1 className="text-2xl   font-bold text-foreground">
            Portfolio Image Details
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Preview */}
          <div>
            <img
              src={image.imageUrl || "/placeholder.svg"}
              alt={image.title}
              className="w-full h-96 object-cover rounded-lg border border-border"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-1">Title</p>
              <p className="text-lg font-semibold text-foreground">
                {image.title}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-1">Category</p>
              <p className="text-lg font-semibold text-foreground">
                {image.category}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-1">Image URL</p>
              <p className="text-sm font-mono text-foreground break-all">
                {image.imageUrl}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-1">Uploaded</p>
              <p className="text-sm text-foreground">
                {new Date(image.createdAt).toLocaleString()}
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await prisma.portfolioImage.delete({
                  where: { id: params.id },
                });
                redirect("/admin/events");
              }}
            >
              <button
                type="submit"
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-smooth"
              >
                Delete Image
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
