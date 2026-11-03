"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

// Next skroluje na vrh samo ako nova stranica nije vidljiva na trenutnoj poziciji. Na produkciji je ponuda
// već učitana i dugačka, pa bi sa /#contact ostala skrolovana dolje. Zato se pri prelasku na drugu stranicu
// uvijek ide na vrh, osim za linkove sa # (Next skroluje do sekcije) i za nazad/naprijed (pozicija se vraća).
// usePathname je bez jezika, pa promjena jezika ostavlja poziciju.
export default function ScrollToTop() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const historyNavigation = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      historyNavigation.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;

    if (historyNavigation.current) {
      historyNavigation.current = false;
      return;
    }
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
