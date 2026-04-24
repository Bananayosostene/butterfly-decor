"use client";

import Image from "next/image";
import Link from "next/link";

const CHOCOLATE = "#3B1A08";

const sections = [
  {
    left: {
      label: "Decor",
      image: "/butterflyTeam.png",
      href: "/collection?collection=Decor",
      type: "image",
    },
    right: {
      label: "Car Decor",
      image: "/venueCollection.jpg",
      href: "/collection?collection=Car Decor",
      type: "chocolate",
    },
    leftWidth: "60%",
    rightWidth: "40%",
  },
  {
    left: {
      label: "Cake",
      image: "/cakeCollection.jpg",
      href: "/collection?collection=Cake",
      type: "chocolate",
    },
    right: {
      label: "Gifts",
      image: "/cateringCollection.jpg",
      href: "/collection?collection=Gifts",
      type: "image",
    },
    leftWidth: "40%",
    rightWidth: "60%",
  },
  {
    left: {
      label: "Invitation",
      image: "/photographerCollection.jpg",
      href: "/collection?collection=Invitation",
      type: "image",
    },
    right: {
      label: "Dresses",
      image: "/bridal.jpg",
      href: "/collection?collection=Dresses",
      type: "image",
    },
    leftWidth: "60%",
    rightWidth: "40%",
  },
];

function Panel({
  label,
  image,
  href,
  type,
  width,
}: {
  label: string;
  image: string;
  href: string;
  type: "image" | "chocolate";
  width: string;
}) {
  return (
    <Link
      href={href}
      className="relative overflow-hidden group cursor-pointer shrink-0"
      style={{
        width,
        backgroundColor: type === "chocolate" ? CHOCOLATE : undefined,
      }}
    >
      {type === "image" && (
        <Image
          src={image}
          alt={label}
          fill
          className="object-cover transition-transform duration-500"
          sizes="60vw"
        />
      )}
      <span
        className="absolute bottom-6 left-6 text-2xl md:text-3xl font-playball"
        style={{ color: type === "chocolate" ? "#F5E6D3" : "white" }}
      >
        {label}
      </span>
    </Link>
  );
}

export function ServiceSections() {
  return (
    <section className="w-full" style={{ background: "background-white", padding: "8px" }}>
      <div className="w-full 2xl:max-w-7xl 2xl:mx-auto flex flex-col" style={{ gap: "8px" }}>
      {sections.map((section, i) => (
        <div
          key={i}
          className="flex h-[50vh] md:h-[60vh]"
          style={{ gap: "8px" }}
        >
          <Panel
            label={section.left.label}
            image={section.left.image}
            href={section.left.href}
            type={section.left.type as "image" | "chocolate"}
            width={section.leftWidth}
          />
          <Panel
            label={section.right.label}
            image={section.right.image}
            href={section.right.href}
            type={section.right.type as "image" | "chocolate"}
            width={section.rightWidth}
          />
        </div>
      ))}
      </div>
    </section>
  );
}
