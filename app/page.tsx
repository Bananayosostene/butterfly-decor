import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WeddingShopHero } from "@/components/butterfly-hero";
import { ServiceSections } from "@/components/service-sections";
import { EntertainmentSection } from "@/components/entertainmentSection";
import { DecorSection } from "@/components/decor-section";
import { VisitTracker } from "@/components/visit-tracker";
import { getCategoryTabs, getHomeCategories, getHomeSettings, getLatestBridalItems } from "@/lib/data";

const FALLBACK_VIDEO = "/hero-video.mp4";
/** Bridal and groom looks shown in the homepage showcase row. */
const SHOWCASE_ITEMS = 4;

export default async function Home() {
  const [settings, categories, decorCategories, showcaseItems] = await Promise.all([
    getHomeSettings(),
    getHomeCategories(),
    getCategoryTabs("DECOR"),
    getLatestBridalItems(SHOWCASE_ITEMS),
  ]);

  return (
    <>
      <Header />
      <main>
        <WeddingShopHero videoSrc={settings.heroVideoUrl ?? FALLBACK_VIDEO} />
        <DecorSection imageUrl={settings.decorImageUrl} categories={decorCategories} />
        <ServiceSections categories={categories} />
        <EntertainmentSection items={showcaseItems} />
      </main>
      <Footer />
      <VisitTracker />
    </>
  );
}
