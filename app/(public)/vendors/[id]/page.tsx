import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { isObjectId } from "@/lib/data";
import { displaySerif } from "@/lib/fonts";
import { getVendor } from "@/lib/vendors";
import { InquireForm } from "./inquire-form";
import { VendorGallery } from "./vendor-gallery";

type Props = { params: Promise<{ id: string }> };

const INK = "#2b1807";
const ROSE = "#a0566c";
const LINE = "#e8d5b7";
/** Butterfly Decor's own number, used when a vendor has not added theirs. */
const SITE_WHATSAPP = "250788724867";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vendor = isObjectId(id) ? await getVendor(id) : null;
  return vendor ? { title: vendor.name, description: vendor.about?.slice(0, 160) } : {};
}

export default async function VendorPage({ params }: Props) {
  const { id } = await params;
  const vendor = isObjectId(id) ? await getVendor(id) : null;
  if (!vendor) notFound();

  // WhatsApp needs the country code: a local Rwandan number (07…) gets 250 in front.
  const digits = vendor.phone?.replace(/[^\d]/g, "") ?? "";
  const whatsappNumber = digits ? (digits.startsWith("0") ? `250${digits.slice(1)}` : digits) : SITE_WHATSAPP;

  return (
    <div className="min-h-screen pb-16" style={{ background: "#fbf7f2" }}>
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/vendors" className="hover:underline" style={{ color: ROSE }}>Vendors</Link></li>
            {vendor.vendorCategory && (
              <>
                <li style={{ color: "#57422C" }}>/</li>
                <li>
                  <Link href={`/vendors?cat=${vendor.vendorCategory.id}`} className="hover:underline" style={{ color: ROSE }}>
                    {vendor.vendorCategory.name}
                  </Link>
                </li>
              </>
            )}
            <li style={{ color: "#57422C" }}>/</li>
            <li style={{ color: INK }}>{vendor.name}</li>
          </ol>
        </nav>

        <h1 className={`${displaySerif.className} mt-3 text-4xl md:text-5xl`} style={{ color: INK }}>{vendor.name}</h1>
        <p className="mt-2 text-xs" style={{ color: "#57422C" }}>
          {vendor.vendorCategory && <span className="font-semibold uppercase tracking-[0.18em]">{vendor.vendorCategory.name}</span>}
          {vendor.vendorCategory && vendor.location && " in "}
          {vendor.location}
        </p>

        <div className="mt-6 pt-6 border-t grid lg:grid-cols-[1fr_320px] gap-8 items-start" style={{ borderColor: LINE }}>
          <div className="min-w-0">
            {vendor.items.length > 0 ? (
              <VendorGallery photos={vendor.items} vendorName={vendor.name} />
            ) : (
              <p className="py-16 text-center text-sm" style={{ color: "#57422C" }}>This vendor has not added photos yet.</p>
            )}

            {vendor.about && (
              <section className="mt-8 pt-8 border-t" style={{ borderColor: LINE }}>
                <h2 className={`${displaySerif.className} text-2xl md:text-3xl`} style={{ color: INK }}>About this vendor</h2>
                <p className="mt-4 text-sm leading-relaxed whitespace-pre-line" style={{ color: "#57422C" }}>{vendor.about}</p>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <div className="p-5 border" style={{ borderColor: LINE }}>
              <h2 className={`${displaySerif.className} text-2xl`} style={{ color: INK }}>Details</h2>
              {vendor.location && (
                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#57422C" }}>
                    <MapPin size={12} /> Location
                  </p>
                  <p className="mt-1 text-sm" style={{ color: INK }}>{vendor.location}</p>
                </div>
              )}
              {vendor.phone && (
                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#57422C" }}>
                    <Phone size={12} /> Phone
                  </p>
                  <a href={`tel:${vendor.phone.replace(/\s/g, "")}`} className="mt-1 block text-sm hover:underline" style={{ color: INK }}>{vendor.phone}</a>
                </div>
              )}
              {!vendor.location && !vendor.phone && (
                <p className="mt-3 text-sm" style={{ color: "#57422C" }}>This vendor has not added contact details yet.</p>
              )}
            </div>

            <div className="p-5 border" style={{ borderColor: LINE }}>
              <h2 className={`${displaySerif.className} text-2xl`} style={{ color: INK }}>Inquire</h2>
              <p className="mt-2 text-sm" style={{ color: "#57422C" }}>Send a message to check availability and request pricing.</p>
              <InquireForm vendorName={vendor.name} whatsappNumber={whatsappNumber} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
