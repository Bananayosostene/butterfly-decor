export function JsonLd() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.butterflydec.com";
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "EventVenue"],
      name: "Butterfly Decor",
      // Other names people search for: Google links them all to this business.
      alternateName: ["Butterfly Decor Rwanda", "Butterfly Decor ,Butterfly Decor Kigali", "Sostene Decor", "Sostene Group", "Butterfly Events "],
      url: BASE_URL,
      logo: `${BASE_URL}/new_logo.png`,
      image: `${BASE_URL}/flyer-03.jpg`,
      description:
        "Butterfly Decor (Sostene Group) in Kigali, Rwanda: wedding decoration and outfit rental, with bridal gowns, groom suits, imikenyero, backdrops and flowers for Gusaba and reception. | Serivisi zo gutaka ubukwe mu Rwanda no gukodesha imyenda y'ubukwe n'imikenyero.",
      telephone: "+250788724867",
      address: {
        "@type": "PostalAddress",
        addressCountry: "RW",
        addressRegion: "Kigali",
        addressLocality: "Kigali",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -1.9441,
        longitude: 30.0619,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
      // The business's own social pages: they tell Google which "Butterfly Decor" this one is.
      sameAs: [
        "https://www.instagram.com/butterfly__decor",
        "https://www.tiktok.com/@butterfly__decor",
        "https://www.youtube.com/@butterfly_decor",
        "https://wa.me/250788724867",
      ],
      email: "butterflydecor26@gmail.com",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Event Decoration & Outfit Rental | Gutaka Ibirori n'Impuzu",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Wedding Decoration",
              alternateName: "Gutaka Ubukwe",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Bridal Gowns",
              alternateName: "Icyenda cy'Umugeni",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Groom Suits",
              alternateName: "Icyenda cy'Umugabo w'Ubukwe",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Birthday Decoration",
              alternateName: "Gutaka Isabukuru",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Church Event Decoration",
              alternateName: "Gutaka Ibirori bya Kiliziya",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Memorial Decoration",
              alternateName: "Gutaka Ibirori byo Gutunga",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Gift Wrapping",
              alternateName: "Impakira Ingabire",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Wedding Invitations",
              alternateName: "Impapuro z'Ubutumire bw'Ubukwe",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Floral Arrangements",
              alternateName: "Gutondeka Indabo",
            },
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Balloon Decoration" },
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Photo Backdrops" },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Catering Services Rwanda",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Event Photography Rwanda",
            },
          },
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Butterfly Decor Rwanda",
      url: BASE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/collection?cat={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
