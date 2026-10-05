"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cldImage } from "@/lib/image";
import { ArrowRight, ChevronDown, Search, ListFilter } from "lucide-react";
import { decorHref, iconForCategory, slugify } from "@/lib/category-icons";
import { displaySerif } from "@/lib/fonts";

/** One step of the butterfly animation: a photo for each wing and the title shown under them. */
export type ButterflySlide = { id: string; title: string; leftImageUrl: string; rightImageUrl: string };
type VendorCategory = { id: string; name: string; icon: string | null };
type CollectionCategory = { id: string; name: string };

const CHOCOLATE = "#2b1807";
const BORDER = "#e8d5b7";
const GOLD = "#835105";

/**
 * Homepage vendors section: on the left, a search into the vendor directory; on the right, the
 * butterfly wings that flip through the slides the admin manages under "Butterfly Slides".
 */
export function VendorsSection({
  slides,
  vendorCategories,
  collectionCategories,
}: {
  /** Our own decor and outfit categories; choosing one opens the collection page. */
  collectionCategories: CollectionCategory[];
  /** Photo pairs for the butterfly animation. */
  slides: ButterflySlide[];
  /** Categories of the vendor directory, managed by the admin. */
  vendorCategories: VendorCategory[];
}) {
  const router = useRouter();
  // The dropdown holds the address to open: a collection page or a vendors page.
  const [destination, setDestination] = useState("/vendors");
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setVisible(false);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goTo = (i: number) => {
    setActive((prev) => {
      if (prev === i) return prev;
      setVisible(false);
      setTimeout(() => setVisible(true), 300);
      return i;
    });
  };

  // Without any slides there is no butterfly; the vendor search still shows.
  const activeSlide = slides[active] as ButterflySlide | undefined;

  return (
    <section className="w-full py-10 md:py-14 px-4 md:px-8 lg:px-12" style={{ background: "#F5F5F7" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14">
        {/* LEFT — find a vendor */}
        <div className="flex-1 w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Discover your wedding dream team
          </p>
          <h2 className={`${displaySerif.className} mt-3 text-3xl md:text-[2.75rem] leading-[1.1]`} style={{ color: CHOCOLATE }}>
            Find the Best Wedding Vendors Near You
          </h2>
          <p className="mt-3 max-w-lg text-sm md:text-base leading-relaxed" style={{ color: "rgba(43,24,7,0.65)" }}>
            Looking for trusted wedding professionals? Browse photographers, venues, caterers and more from our vendor
            community.
          </p>

          {/* Our own categories lead to /collection, vendor categories to /vendors. */}
          <form
            action="/vendors"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(destination);
            }}
            className="mt-6 max-w-lg flex items-center gap-2 p-1.5 pl-5 rounded-full shadow-md"
            style={{ background: "#f7efe3" }}
          >
            <ListFilter size={18} strokeWidth={1.75} className="shrink-0" style={{ color: CHOCOLATE }} aria-hidden />
            <div className="relative min-w-0 flex-1">
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                aria-label="Category"
                className="w-full appearance-none bg-transparent text-sm md:text-base outline-none py-2.5 pr-8 cursor-pointer"
                style={{ color: CHOCOLATE }}
              >
                <option value="/vendors">All vendor categories</option>
                <optgroup label="Vendors">
                  {vendorCategories.map((c) => (
                    <option key={c.id} value={`/vendors?cat=${c.id}`}>{c.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Butterfly decor & outfits">
                  <option value="/collection">All collections</option>
                  {collectionCategories.map((c) => (
                    <option key={c.id} value={`/collection?cat=${slugify(c.name)}`}>{c.name}</option>
                  ))}
                  <option value={decorHref()}>Decor</option>
                </optgroup>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: CHOCOLATE }} />
            </div>
            <button
              type="submit"
              className="shrink-0 flex items-center gap-2 px-5 md:px-7 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: CHOCOLATE, color: "#f7efe3" }}
            >
              <Search size={14} /> Search
            </button>
          </form>

          {vendorCategories.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm" style={{ color: CHOCOLATE }}>
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#57422C" }}>
                Or browse:
              </span>
              {vendorCategories.map((c) => (
                <Link key={c.id} href={`/vendors?cat=${c.id}`} className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline">
                  <img src={`/${iconForCategory(c.name, c.icon)}`} alt="" aria-hidden className="w-5 h-5 object-contain" />
                  {c.name}
                </Link> 
              ))}
            </div>
          )}
          <Link
            href="/vendors"
            className="group mt-6 inline-flex items-center gap-3 px-7 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
            style={{ background: CHOCOLATE, color: "#f7efe3" }}
          >
            <ListFilter size={18} strokeWidth={2} className="shrink-0" aria-hidden />
            See all vendors
            <ArrowRight size={18} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* RIGHT — butterfly wings revealing the active service */}
        {activeSlide && (
        <div
          className="flex-1 w-full flex flex-col items-center gap-5"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          <div className="flex items-center justify-center gap-1" style={{ perspective: "900px" }}>
            {/* LEFT WING */}
            <div
              className="relative overflow-hidden shadow-lg"
              style={{
                width: "clamp(130px, 19vw, 210px)",
                height: "clamp(190px, 28vw, 310px)",
                borderRadius: "6px",
                background: CHOCOLATE,
                transformOrigin: "right center",
                transform: visible ? "rotateY(0deg) rotateZ(-2deg)" : "rotateY(-75deg) rotateZ(-15deg)",
                opacity: visible ? 1 : 0,
                transition: "transform 0.7s cubic-bezier(0.34, 1.3, 0.64, 1) 0ms, opacity 0.5s ease 0ms",
              }}
            >
              <Image
                src={cldImage(activeSlide.leftImageUrl, 420)}
                alt={activeSlide.title}
                fill
                unoptimized
                className="object-cover"
                sizes="210px"
              />
            </div>

            {/* RIGHT WING */}
            <div
              className="relative overflow-hidden shadow-lg"
              style={{
                width: "clamp(130px, 19vw, 210px)",
                height: "clamp(190px, 28vw, 310px)",
                borderRadius: "6px",
                background: CHOCOLATE,
                transformOrigin: "left center",
                transform: visible ? "rotateY(0deg) rotateZ(2deg)" : "rotateY(75deg) rotateZ(15deg)",
                opacity: visible ? 1 : 0,
                transition: "transform 0.7s cubic-bezier(0.34, 1.3, 0.64, 1) 80ms, opacity 0.5s ease 80ms",
              }}
            >
              <Image
                src={cldImage(activeSlide.rightImageUrl, 420)}
                alt={activeSlide.title}
                fill
                unoptimized
                className="object-cover"
                sizes="210px"
              />
            </div>
          </div>

          <p className="font-playball text-lg" style={{ color: CHOCOLATE }}>
            {activeSlide.title}
          </p>

          {slides.length > 1 && (
            <div className="flex gap-2 flex-wrap justify-center max-w-xs">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === active ? "20px" : "8px",
                    height: "8px",
                    background: i === active ? GOLD : "rgba(131,81,5,0.25)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </section>
  );
}
