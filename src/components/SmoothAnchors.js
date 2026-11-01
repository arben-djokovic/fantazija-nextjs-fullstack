"use client";

import { useEffect } from "react";

// Linkovi na sekcije na istoj stranici (npr. /#about) skroluju glatko.
// Next.js inače skroluje bez animacije pri navigaciji, pa ovo hvata klik prije njega.
export default function SmoothAnchors() {
  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest?.("a[href]");
      if (!link) return;

      const url = new URL(link.href, window.location.href);
      const withoutSlash = (path) => path.replace(/\/$/, "") || "/";
      const samePage = url.origin === window.location.origin && withoutSlash(url.pathname) === withoutSlash(window.location.pathname);
      if (!samePage) return;

      // Klik na istu stranicu bez hasha (npr. "Početna" sa /#contact) ide na sam vrh.
      if (!url.hash) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", url.pathname);
        return;
      }

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", url.hash);
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
