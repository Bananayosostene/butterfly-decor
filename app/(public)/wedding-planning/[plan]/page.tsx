import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getDashboardUser } from "@/lib/user-auth";
import { courseSteps, getWeddingPlan } from "@/lib/wedding-plans";
import CourseClient from "./course-client";

type Props = { params: Promise<{ plan: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const plan = getWeddingPlan((await params).plan);
  return plan ? { title: `${plan.title} · Wedding Planning` } : {};
}

/** The step-by-step course of one planning timeline. Signed-in visitors only. */
export default async function PlanCoursePage({ params }: Props) {
  const [{ plan: slug }, user, dashboardUser] = await Promise.all([params, getCurrentUser(), getDashboardUser()]);
  if (!user && !dashboardUser) redirect("/login");

  const plan = getWeddingPlan(slug);
  if (!plan) notFound();

  return <CourseClient plan={{ slug: plan.slug, title: plan.title, duration: plan.duration }} steps={courseSteps(plan)} />;
}
