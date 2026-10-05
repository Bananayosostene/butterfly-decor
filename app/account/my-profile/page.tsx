import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/user-auth";
import MyProfileClient from "./my-profile-client";

/** A vendor's public profile details. */
export default async function MyProfilePage() {
  const user = await getCurrentUser();
  if (user?.role !== "VENDOR") redirect("/login");

  const [profile, categories] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { businessName: true, location: true, phone: true, about: true, coverUrl: true, vendorCategoryId: true },
    }),
    prisma.vendorCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!profile) redirect("/login");

  return <MyProfileClient profile={profile} categories={categories} />;
}
