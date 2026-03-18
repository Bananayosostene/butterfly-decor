"use client";

import { useState, useEffect } from "react";
import { BookingModal } from "@/components/booking-modal";

export function ModalProvider() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("openBookingModal", handler);
    return () => window.removeEventListener("openBookingModal", handler);
  }, []);

  return <BookingModal open={open} onClose={() => setOpen(false)} />;
}
