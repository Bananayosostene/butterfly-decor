import { getStyleIdeas, searchStyleIdeas, parsePage, MAX_PAGES } from "@/lib/data";
import StyleInspirationClient from "./style-inspiration-client";

const PAGE_SIZE = 16;

export default async function StyleInspirationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const query = sp.q?.trim() ?? "";

  const { ideas, total } = query
    ? await searchStyleIdeas(query, page * PAGE_SIZE)
    : await getStyleIdeas(page * PAGE_SIZE);

  return (
    <StyleInspirationClient
      ideas={ideas}
      query={query}
      totalResults={total}
      page={page}
      hasMore={ideas.length < total && page < MAX_PAGES}
    />
  );
}
