import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStyleIdea, getStyleIdeas, isObjectId, parsePage, PAGE_SIZE, MAX_PAGES } from "@/lib/data";
import StyleIdeaClient from "./style-idea-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.butterflydec.com";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const idea = isObjectId(id) ? await getStyleIdea(id) : null;
  return idea ? { title: idea.title } : {};
}

export default async function StyleIdeaDetailPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const page = parsePage(sp.page);

  const idea = isObjectId(id) ? await getStyleIdea(id) : null;
  if (!idea) notFound();

  const { ideas, total } = await getStyleIdeas(page * PAGE_SIZE);
  // An idea opened from a direct link may be older than the pages loaded so far.
  const allIdeas = ideas.some((i) => i.id === idea.id) ? ideas : [idea, ...ideas];

  return (
    <StyleIdeaClient
      idea={idea}
      allIdeas={allIdeas}
      page={page}
      hasMore={ideas.length < total && page < MAX_PAGES}
      shareUrl={`${BASE_URL}/style-insipiration/${idea.id}`}
    />
  );
}
