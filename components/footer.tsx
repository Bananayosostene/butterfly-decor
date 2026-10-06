import Link from "next/link";
import Image from "next/image";
import { getCategoryTabs } from "@/lib/data";
import { decorHref, slugify } from "@/lib/category-icons";

/** Text colors: dark on the light mobile footer, cream on the chocolate desktop footer. */
const SOFT = "text-[#57422C] md:text-paper/80";
const HEADING = "text-paper-foreground md:text-paper";
const LINK =
  "text-sm text-paper-foreground/80 md:text-paper/80 hover:text-paper-foreground md:hover:text-paper transition-colors";

type FooterLink = { label: string; href: string };

export async function Footer() {
  const whatsappUrl =
    "https://wa.me/+250788724867?text=Hello%20Butterfly%20Decor,%20I%20would%20like%20to%20book%20your%20decoration%20services%20and%20outfit%20rental%20for%20my%20event.%20Please%20share%20more%20details.%20Thank%20you.";

  const [collectionCategories, decorCategories] = await Promise.all([
    getCategoryTabs("COLLECTION"),
    getCategoryTabs("DECOR"),
  ]);

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: "Account",
      links: [
        { label: "Sign In", href: "/login" },
        { label: "Sign Up", href: "/login?tab=register" },
      ],
    },
    {
      title: "Wedding",
      links: collectionCategories.map((c) => ({
        label: c.name,
        href: `/collection?cat=${slugify(c.name)}`,
      })),
    },
    {
      title: "Decor",
      links: decorCategories.map((c) => ({ label: c.name, href: decorHref(c.id) })),
    },
    {
      title: "Explore",
      links: [
        { label: "Wedding Planning", href: "/wedding-planning" },
        { label: "Latest Weddings", href: "/#latest-weddings" },
        { label: "Vendors", href: "/vendors" },
        { label: "Style Inspiration", href: "/style-insipiration" },
        { label: "All Collection", href: "/collection" },
      ],
    },
  ];

  return (
    <footer className="overflow-hidden border-t border-accent bg-paper md:bg-primary pb-20 md:pb-0">
      {/* Social, contact and copyright: a short icons + phone summary on mobile,
          with the full footer and the link columns on md / lg and up. */}
      <div className="w-full px-4 sm:px-8 lg:px-12 pt-4 md:pt-12 md:pb-6">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">

          {/* Social — icon only on mobile, icon + label on md and up */}
          <div className="flex-1 flex justify-center md:justify-start">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-4">

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:scale-110 transition-transform"
                aria-label="WhatsApp"
              >
                <div className="inline-flex items-center justify-center w-9 h-9 md:w-5 md:h-5 bg-green-500 hover:bg-green-600 text-white rounded-full">
                  <svg
                    className="w-5 h-5 md:w-3 md:h-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </div>

                <span className={`hidden md:inline text-xs ${SOFT}`}>
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
                  width={36}
                  height={36}
                  className="rounded-full md:w-5 md:h-5"
                />
                <span className={`hidden md:inline text-xs ${SOFT}`}>
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
                  width={36}
                  height={36}
                  className="rounded-full md:w-5 md:h-5"
                />
                <span className={`hidden md:inline text-xs ${SOFT}`}>
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
                <div className="inline-flex items-center justify-center w-9 h-9 md:w-5 md:h-5 rounded-full text-white" style={{ background: "#ff0000" }}>
                  <svg className="w-5 h-5 md:w-3 md:h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M9 6.5v11l9-5.5z" />
                  </svg>
                </div>
                <span className={`hidden md:inline text-xs ${SOFT}`}>
                  YouTube
                </span>
              </a>
            </div>
          </div>

          {/* Contact — phone on mobile too, email on md and up */}
          <div className="items-center justify-center text-center">
            <p className={`hidden md:block text-sm ${SOFT}`}>
              butterflydecor26@gmail.com
            </p>
          </div>

          {/* Copyright — desktop only, keeps the mobile footer short */}
          <div
            className={`hidden md:block flex-1 text-sm text-center md:text-right ${SOFT}`}
          >
            <p>&copy; 2026 Butterfly Events Ltd. All rights reserved.</p>
          </div>

        </div>

        {/* under here add  on lg screens show possible links like sign in, signup, wedding all catgory links , wedding planing, latest wedding etc  */}
        <div className="hidden lg:grid grid-cols-4 gap-x-8 gap-y-4 mt-8 pt-8 border-t border-paper/15">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className={`text-xs font-semibold uppercase tracking-[0.18em] mb-4 ${HEADING}`}>
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className={`${LINK} hover:underline underline-offset-4`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
}
