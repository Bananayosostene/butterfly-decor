"use client";

import { useState, type ComponentProps } from "react";
import Link from "next/link";

/**
 * A link that downloads its page as soon as the visitor points at it (or touches it), so the
 * click itself is instant. Used for the category filters, where loading every filter up front
 * would be wasteful but waiting until the click feels slow.
 */
export function HoverPrefetchLink(props: Omit<ComponentProps<typeof Link>, "prefetch">) {
  const [wanted, setWanted] = useState(false);

  return (
    <Link
      {...props}
      prefetch={wanted}
      onMouseEnter={(e) => {
        setWanted(true);
        props.onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setWanted(true);
        props.onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setWanted(true);
        props.onFocus?.(e);
      }}
    />
  );
}
