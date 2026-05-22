"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `lg` breakpoint — mobile/tablet below 1024px */
export function useIsMobile(maxWidthPx = 1023): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidthPx}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [maxWidthPx]);

  return isMobile;
}
