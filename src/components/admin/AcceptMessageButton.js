"use client";

import { useState } from "react";
import { normalizePhone } from "@/lib/phone";

// Tekst poruke kupcu, na jeziku na kojem je naručio. Ovdje se mijenja.
const ACCEPT_MESSAGES = {
  me: "Poštovani, vaša narudžbina u poslastičarnici Fantazija je potvrđena. Hvala na povjerenju!",
  sq: "Të nderuem, porosia juej në ëmbëltoren Fantazija âsht konfirmue. Ju falemnderit për besimin!",
  en: "Hello, your order at the Fantazija pastry shop has been confirmed. Thank you for your trust!",
};

export function acceptMessage(locale) {
  return ACCEPT_MESSAGES[locale] ?? ACCEPT_MESSAGES.me;
}

// Koliko se čeka da Viber preuzme ekran prije nego što se otvori SMS. Na Androidu se Viber zna otvarati sporije.
const VIBER_TIMEOUT = 2500;

// iPhone/iPad (i iPad koji se predstavlja kao Mac).
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Viber na iPhone-u ne prihvata draft u linku i javlja "Requested page is unavailable" (i sa "+" i bez njega u broju),
// pa se tamo otvara samo chat, a poruka se zalijepi iz clipboarda. Android i kompjuter upisuju poruku sami.
const viberLink = (phone, text) => {
  const chat = `viber://chat?number=${encodeURIComponent(phone)}`;
  return isIOS() ? chat : `${chat}&draft=${encodeURIComponent(text)}`;
};
// U sms: je broj dio adrese, ne parametar, i neki telefoni ne prepoznaju "%2B" umjesto "+".
// normalizePhone ionako vraća samo "+" i cifre, pa je bezbjedan i bez enkodovanja.
const smsLink = (phone, text) => `sms:${phone}?&body=${encodeURIComponent(text)}`;

// "Prihvati porukom": ne mijenja status narudžbe, nego samo otvara Viber (ili SMS) sa gotovom porukom kupcu.
// Narudžba se zatim prihvata običnim dugmetom "Potvrdi".
export default function AcceptMessageButton({ phone, viber, locale }) {
  const [opening, setOpening] = useState(false);

  const open = async () => {
    if (opening) return;
    setOpening(true);
    const number = normalizePhone(phone);
    const text = acceptMessage(locale);

    // Za slučaj da Viber ne upiše poruku sam, tekst je već kopiran pa se samo zalijepi.
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard nije dostupan (stari browser, nije https), linkovi i dalje rade
    }

    if (!viber) {
      window.location.href = smsLink(number, text);
      setTimeout(() => setOpening(false), VIBER_TIMEOUT);
      return;
    }

    // Kad se Viber otvori, stranica izgubi fokus i pređe u pozadinu. Ako se ništa od toga ne desi, Viber nije
    // instaliran, pa ide SMS. blur i pagehide stižu ranije od visibilitychange (Android), pa se prate sva tri.
    let left = false;
    const markLeft = () => {
      left = true;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") left = true;
    };
    window.addEventListener("blur", markLeft);
    window.addEventListener("pagehide", markLeft);
    document.addEventListener("visibilitychange", onVisibility);
    window.location.href = viberLink(number, text);

    setTimeout(() => {
      window.removeEventListener("blur", markLeft);
      window.removeEventListener("pagehide", markLeft);
      document.removeEventListener("visibilitychange", onVisibility);
      if (!left && document.visibilityState === "visible" && document.hasFocus()) window.location.href = smsLink(number, text);
      setOpening(false);
    }, VIBER_TIMEOUT);
  };

  return (
    <button
      type="button"
      disabled={opening}
      onClick={open}
      title={viber ? "Otvara Viber sa porukom (ili SMS ako Viber nije dostupan)" : "Otvara SMS sa porukom"}
      className="inline-flex h-8 items-center rounded-full border border-primary px-3 text-xs font-semibold text-primary transition-colors hover:bg-blush disabled:opacity-50"
    >
      {opening ? "Otvaram..." : "Prihvati porukom"}
    </button>
  );
}
