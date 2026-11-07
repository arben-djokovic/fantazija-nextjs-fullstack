"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_ACTIONS, STATUS_TRANSITIONS } from "@/data/orders";
import AcceptMessageButton from "@/components/admin/AcceptMessageButton";

// Koraci naprijed su glavna dugmad, a otkazivanje i vraćanje unazad su sporedna.
const PRIMARY = { new: "confirmed", confirmed: "ready", ready: "completed" };

// customer i locale služe za "Prihvati porukom" kod nove narudžbe.
export default function OrderActions({ orderId, status, customer, locale }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const changeStatus = async (next) => {
    if (next === "cancelled" && !window.confirm("Otkazati ovu narudžbu?")) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Status nije promijenjen");
      }
      router.refresh();
    } catch {
      setError("Status nije promijenjen");
    } finally {
      setSaving(false);
    }
  };

  const primary = PRIMARY[status];
  const secondary = STATUS_TRANSITIONS[status].filter((next) => next !== primary);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1.5">
        {secondary.map((next) => (
          <button
            key={next}
            type="button"
            disabled={saving}
            onClick={() => changeStatus(next)}
            className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold text-muted transition-colors hover:bg-blush hover:text-primary disabled:opacity-50"
          >
            {STATUS_ACTIONS[next]}
          </button>
        ))}
        {status === "new" && customer && <AcceptMessageButton phone={customer.phone} viber={customer.viber} locale={locale} />}
        {primary && (
          <button
            type="button"
            disabled={saving}
            onClick={() => changeStatus(primary)}
            className="inline-flex h-8 items-center rounded-full bg-primary px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {STATUS_ACTIONS[primary]}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
