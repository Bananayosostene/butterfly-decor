import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cldImage } from "@/lib/image";
import { displaySerif } from "@/lib/fonts";
import { DECOR_SLUG, decorHref, iconForCategory } from "@/lib/category-icons";

type Category = { id: string; name: string; icon: string | null };

const INK = "#2b1807";
const GOLD = "#835105";

/**
 * Homepage decor section: full-width photo (chosen by the admin in Settings) under a soft cream
 * wash, with a picker of the decor categories and a button to /collection?cat=decor. Fully server-rendered.
 */
export function DecorSection({ imageUrl, categories }: { imageUrl: string | null; categories: Category[] }) {

  return (
    <section className="relative w-full overflow-hidden" style={{ background: "#fbf7f2" }}>
      {imageUrl && (
        <img
          src={cldImage(imageUrl, 1920)}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Light cream wash: strongest behind the text in the middle so it stays readable, fading
          out towards the edges so the decor photo shows through. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at center, rgba(251,247,242,0.72) 0%, rgba(251,247,242,0.45) 60%, rgba(251,247,242,0.2) 100%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 py-15 md:py-20 text-center">
        <h2 className={`${displaySerif.className} mt-3 text-3xl md:text-4xl leading-[1.1]`} style={{ color: INK }}>
          Transform Your Venue
          <br />
          Into an Unforgettable Celebration
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base leading-relaxed" style={{ color: "#57422C" }}>
          Backdrops for your introduction (gusaba) and reception, bridal showers, birthdays, graduations and fresh
          flowers — we design every corner of your celebration so it feels like you.
        </p>

        {/* Plain GET form to /collection?cat=decor&decor=<id> — works without JavaScript. */}
        <form
          action="/collection"
          className="mt-6 mx-auto max-w-2xl flex items-center gap-2 p-1.5 pl-5 rounded-full shadow-lg"
          style={{ background: "#f7efe3" }}
        >
          <input type="hidden" name="cat" value={DECOR_SLUG} />
          <div className="relative min-w-0 flex-1">
            <select
              name="decor"
              defaultValue=""
              aria-label="Decor to explore"
              className="w-full appearance-none bg-transparent text-sm md:text-base outline-none py-2.5 pr-8 cursor-pointer"
              style={{ color: INK }}
            >
              <option value="">All decor</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: INK }} />
          </div>
          <button
            type="submit"
            className="shrink-0 px-5 md:px-8 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-90 cursor-pointer"
            style={{ background: INK, color: "#f7efe3" }}
          >
            Explore
          </button>
        </form>

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm" style={{ color: INK }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#57422C" }}>
              Or browse:
            </span>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={decorHref(c.id)}
                className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
              >
                <img src={`/${iconForCategory(c.name, c.icon)}`} alt="" aria-hidden className="w-5 h-5 object-contain" />
                {c.name}
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
