import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WeddingShopHero } from "@/components/butterfly-hero";
import { DecorSection } from "@/components/decor-section";
import { getButterflySlides, getCategoryTabs, getHomeSettings, getLatestBridalItems } from "@/lib/data";
import { getVendorCategories } from "@/lib/vendors";
import { getWeddingAlbums } from "@/lib/wedding-albums";
import { RealWeddingSection } from "@/components/real-weddings-section";
import { VendorsSection } from "@/components/vendors-section";
import { PlanningSection } from "@/components/planning-section";

const FALLBACK_VIDEO = "/hero-video.mp4";
/** Wedding albums (or bridal and groom looks, before any album exists) in the homepage showcase row. */
const SHOWCASE_ITEMS = 4;

export default async function Home() {
  const [settings, slides, decorCategories, collectionCategories, showcaseItems, vendorCategories, albums] = await Promise.all([
    getHomeSettings(),
    getButterflySlides(),
    getCategoryTabs("DECOR"),
    getCategoryTabs("COLLECTION"),
    getLatestBridalItems(SHOWCASE_ITEMS),
    getVendorCategories(),
    getWeddingAlbums(),
  ]);

  return (
    <>
      <Header />
      <main>
        <WeddingShopHero videoSrc={settings.heroVideoUrl ?? FALLBACK_VIDEO} />
        <VendorsSection slides={slides} vendorCategories={vendorCategories} collectionCategories={collectionCategories} />
        <DecorSection imageUrl={settings.decorImageUrl} categories={decorCategories} />
        <RealWeddingSection albums={albums.slice(0, SHOWCASE_ITEMS)} items={showcaseItems} />
        <PlanningSection />
      </main>
      <Footer />
    </>
  );
}
