import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WeddingShopHero } from "@/components/butterfly-hero";
import { ServiceSections } from "@/components/service-sections";
import { EntertainmentSection } from "@/components/entertainmentSection";
import { VisitTracker } from "@/components/visit-tracker";
import { getCollectionItems, getHeroVideoUrl, getHomeCategories } from "@/lib/data";

const FALLBACK_VIDEO = "/hero-video.mp4";
/** Newest items shown across the two homepage carousels. */
const CAROUSEL_ITEMS = 24;

export default async function Home() {
  const [heroVideoUrl, categories, { items }] = await Promise.all([
    getHeroVideoUrl(),
    getHomeCategories(),
    getCollectionItems(null, CAROUSEL_ITEMS),
  ]);
  const mid = Math.ceil(items.length / 2);

  return (
    <>
      <Header />
      <main>
        <WeddingShopHero videoSrc={heroVideoUrl ?? FALLBACK_VIDEO} />
        <ServiceSections categories={categories} />
        <EntertainmentSection topItems={items.slice(0, mid)} bottomItems={items.slice(mid)} />
      </main>
      <Footer />
      <VisitTracker />
    </>
  );
}
