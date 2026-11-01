"use client";

import { useEffect, useState } from "react";
import LoaderView from "@/components/LoaderView";

// Loader za prvo učitavanje sajta: prikazuje se odmah sa servera i sklanja se kad se stranica učita.
export default function PageLoader({ label }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer;
    const hide = () => {
      timer = window.setTimeout(() => setVisible(false), 400);
    };

    if (document.readyState === "complete") {
      hide();
      return () => window.clearTimeout(timer);
    }

    window.addEventListener("load", hide, { once: true });
    return () => {
      window.removeEventListener("load", hide);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;
  return <LoaderView label={label} />;
}
