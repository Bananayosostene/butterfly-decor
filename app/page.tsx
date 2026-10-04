import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WeddingShopHero } from "@/components/butterfly-hero";
import { ServiceSections } from "@/components/service-sections";
import { EntertainmentSection } from "@/components/entertainmentSection";
import { DecorSection } from "@/components/decor-section";
import { VisitTracker } from "@/components/visit-tracker";
import { getButterflySlides, getCategoryTabs, getHomeSettings, getLatestBridalItems } from "@/lib/data";
import { getVendorCategories } from "@/lib/vendors";

const FALLBACK_VIDEO = "/hero-video.mp4";
/** Bridal and groom looks shown in the homepage showcase row. */
const SHOWCASE_ITEMS = 4;

export default async function Home() {
  const [settings, slides, decorCategories, showcaseItems, vendorCategories] = await Promise.all([
    getHomeSettings(),
    getButterflySlides(),
    getCategoryTabs("DECOR"),
    getLatestBridalItems(SHOWCASE_ITEMS),
    getVendorCategories(),
  ]);

  return (
    <>
      <Header />
      <main>
        <WeddingShopHero videoSrc={settings.heroVideoUrl ?? FALLBACK_VIDEO} />
        <DecorSection imageUrl={settings.decorImageUrl} categories={decorCategories} />
        <ServiceSections slides={slides} vendorCategories={vendorCategories} />
        <EntertainmentSection items={showcaseItems} />
      </main>
      <Footer />
      <VisitTracker />
    </>
  );
}
