import Image from "next/image";
import { displaySerif } from "@/lib/fonts";

const INK = "#fbf7f2";
const SOFT = "rgba(251,247,242,0.8)";

export function Footer() {
  const whatsappUrl =
    "https://wa.me/+250788724867?text=Hello%20Butterfly%20Decor,%20I%20would%20like%20to%20book%20your%20decoration%20services%20and%20outfit%20rental%20for%20my%20event.%20Please%20share%20more%20details.%20Thank%20you.";

  return (
    <footer className="overflow-hidden border-t border-accent bg-primary">
   {/* Social, contact and copyright sit above the big word. */}
<div className="w-full px-4 sm:px-8 lg:px-12 pt-12 pb-6">
  <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">

    {/* Social */}
    <div className="flex-1 flex justify-center md:justify-start">
      <div className="flex flex-wrap items-center gap-4">

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:scale-110 transition-transform"
          aria-label="WhatsApp"
        >
          <div className="inline-flex items-center justify-center w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full">
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
          </div>

          <span className="text-xs" style={{ color: SOFT }}>
            WhatsApp
          </span>
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/butterfly__decor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:scale-110 transition-transform"
          aria-label="Instagram"
        >
          <Image
            src="/instagram-icon.png"
            alt="Instagram"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-xs" style={{ color: SOFT }}>
            Instagram
          </span>
        </a>

        {/* TikTok */}
        <a
          href="https://www.tiktok.com/@butterfly__decor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:scale-110 transition-transform"
          aria-label="TikTok"
        >
          <Image
            src="/tik-tok-icon.png"
            alt="TikTok"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-xs" style={{ color: SOFT }}>
            TikTok
          </span>
        </a>

        {/* YouTube */}
        <a
          href="https://www.youtube.com/@butterfly_decor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:scale-110 transition-transform"
          aria-label="YouTube"
        >
          {/* Drawn inline (red circle with the white play triangle), so no image file is needed. */}
          <div className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white" style={{ background: "#ff0000" }}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M9 6.5v11l9-5.5z" />
            </svg>
          </div>
          <span className="text-xs" style={{ color: SOFT }}>
            YouTube
          </span>
        </a>
      </div>
    </div>

    {/* Contact */}
    <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-5 text-center">
      <p className="text-sm" style={{ color: SOFT }}>
        butterflydecor26@gmail.com
      </p>

      <p className="text-sm" style={{ color: SOFT }}>
        +250 788 724 867
      </p>
    </div>

    {/* Copyright */}
    <div
      className="flex-1 text-sm text-center md:text-right"
      style={{ color: SOFT }}
    >
      <p>&copy; 2026 Butterfly Events Ltd. All rights reserved.</p>
    </div>

  </div>
</div>

      {/* The word stretches exactly from the left edge to the right edge at every screen width:
          the SVG scales with the footer and textLength pins the word to the full viewBox width. */}
      <svg viewBox="0 0 1000 138" className="block w-full h-auto" style={{ color: "#fbf7f2" }} aria-hidden focusable="false">
        <text
          x="6"
          y="124"
          textLength="988"
          lengthAdjust="spacingAndGlyphs"
          fill="currentColor"
          className={displaySerif.className}
          style={{ fontSize: "100px" }}
        >
          BUTTERFLY
        </text>
      </svg>
    </footer>
  );
}
