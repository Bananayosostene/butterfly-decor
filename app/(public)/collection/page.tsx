import { CollectionListing } from "./collection-listing";

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; decor?: string; page?: string; item?: string }>;
}) {
  return <CollectionListing searchParams={await searchParams} />;
}
