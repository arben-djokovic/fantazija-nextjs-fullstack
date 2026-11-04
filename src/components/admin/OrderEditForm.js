"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { fieldInput } from "@/components/styles";
import { formatPrice } from "@/lib/format";
import { pickupTimes } from "@/lib/date";
import OrderPhotos from "@/components/admin/OrderPhotos";

const card = "flex flex-col gap-3 rounded-xl border border-line bg-card p-4";
const label = "flex flex-col gap-1 text-xs font-semibold text-muted";
const smallInput = `${fieldInput} py-1.5`;

export default function OrderEditForm({ order, catalog, backHref }) {
  const router = useRouter();
  const [pickupDate, setPickupDate] = useState(order.pickupDate);
  const [pickupTime, setPickupTime] = useState(order.pickupTime);
  const [customer, setCustomer] = useState(order.customer);
  const [note, setNote] = useState(order.note);
  const [lines, setLines] = useState(order.items);
  const [adding, setAdding] = useState(false);
  const [newItemId, setNewItemId] = useState("");
  const [newOptionId, setNewOptionId] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const newItem = catalog.find((item) => item.id === newItemId);
  const total = lines.reduce((sum, line) => sum + (Number(line.unitPrice) || 0) * line.quantity, 0);
  const hasOpenPrice = lines.some((line) => line.unitPrice === null);

  const updateLine = (key, changes) => setLines((current) => current.map((line) => (line.key ?? line.id) === key ? { ...line, ...changes } : line));

  const addLine = () => {
    const option = newItem?.options.find((entry) => entry.id === newOptionId);
    if (!newItem || !option) return;
    setLines((current) => [
      ...current,
      {
        key: `new-${Date.now()}`,
        itemId: newItem.id,
        optionId: option.id,
        title: newItem.name,
        option: option.label,
        details: [],
        quantity: Math.max(1, Number(newQuantity) || 1),
        unitPrice: option.price,
        isNew: true,
      },
    ]);
    closeAdding();
  };

  const closeAdding = () => {
    setAdding(false);
    setNewItemId("");
    setNewOptionId("");
    setNewQuantity(1);
  };

  const selectNewItem = (itemId) => {
    setNewItemId(itemId);
    // Ako proizvod ima samo jednu opciju, ona se odmah bira; inače radnik bira sam.
    const options = catalog.find((item) => item.id === itemId)?.options ?? [];
    setNewOptionId(options.length === 1 ? options[0].id : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const items = lines.map((line) =>
      line.isNew
        ? { kind: "item", itemId: line.itemId, optionId: line.optionId, quantity: line.quantity }
        : { id: line.id, quantity: line.quantity, unitPrice: line.unitPrice === "" ? null : line.unitPrice },
    );

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedAt: order.updatedAt, pickupDate, pickupTime, customer, note, items }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Izmjena nije sačuvana");
        return;
      }
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Izmjena nije sačuvana");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
      <section className={card}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label className={label}>
            Datum
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className={smallInput} required />
          </label>
          <label className={label}>
            Vrijeme
            <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={smallInput}>
              {pickupTimes.map((time) => (
                <option key={time}>{time}</option>
              ))}
            </select>
          </label>
          <label className={label}>
            Kupac
            <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className={smallInput} required />
          </label>
          <label className={label}>
            Telefon
            <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className={smallInput} required />
          </label>
        </div>
        <label className="flex items-center gap-2 text-ink">
          <input type="checkbox" checked={customer.viber} onChange={(e) => setCustomer({ ...customer, viber: e.target.checked })} className="accent-primary" />
          Viber
        </label>
      </section>

      <section className={card}>
        <h2 className="text-xs font-semibold tracking-wider text-muted uppercase">Stavke</h2>
        {lines.map((line) => {
          const key = line.key ?? line.id;
          const onRequest = line.unitPrice === null;
          return (
            <div key={key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 border-b border-line pb-3 md:grid-cols-[1fr_64px_150px_auto]">
              <div className="col-span-2 md:col-span-1">
                <strong className="text-ink">{line.title}</strong> <span className="text-muted">· {line.option}</span>
                {line.details.length > 0 && <span className="block text-xs text-muted">{line.details.join(" · ")}</span>}
                {line.photos?.length > 0 && <OrderPhotos photos={line.photos} />}
                {line.priceAgreed && <span className="text-[11px] text-primary">cijena dogovorena</span>}
              </div>
              <input
                type="number"
                min="1"
                max="100"
                aria-label="Količina"
                value={line.quantity}
                onChange={(e) => updateLine(key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                className={smallInput}
              />
              {line.isNew ? (
                <span className="text-muted">{onRequest ? "po dogovoru" : `${formatPrice(line.unitPrice)} / kom`}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    aria-label="Cijena po komadu"
                    placeholder="po dogovoru"
                    value={onRequest ? "" : line.unitPrice}
                    onChange={(e) => updateLine(key, { unitPrice: e.target.value === "" ? null : e.target.value })}
                    className={smallInput}
                  />
                  <span className="text-muted">€</span>
                </div>
              )}
              <button
                type="button"
                aria-label="Ukloni stavku"
                disabled={lines.length === 1}
                onClick={() => setLines((current) => current.filter((entry) => (entry.key ?? entry.id) !== key))}
                className="grid size-8 place-items-center rounded-full text-primary hover:bg-blush disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}

        {catalog.length > 0 &&
          (adding ? (
            <div className="grid grid-cols-2 items-end gap-2 rounded-lg bg-cream p-3 md:grid-cols-[1fr_1fr_64px_auto]">
              <label className={label}>
                Proizvod
                <select value={newItemId} onChange={(e) => selectNewItem(e.target.value)} className={smallInput}>
                  <option value="" disabled>
                    Izaberite proizvod
                  </option>
                  {catalog.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                Opcija
                <select value={newOptionId} onChange={(e) => setNewOptionId(e.target.value)} disabled={!newItem} className={`${smallInput} disabled:opacity-50`}>
                  <option value="" disabled>
                    Izaberite opciju
                  </option>
                  {newItem?.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} · {option.price === null ? "po dogovoru" : formatPrice(option.price)}
                    </option>
                  ))}
                </select>
              </label>
              <input type="number" min="1" max="100" aria-label="Količina" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} className={smallInput} />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={addLine}
                  disabled={!newOptionId}
                  className="inline-flex h-9 items-center rounded-full bg-primary px-3 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
                >
                  Dodaj
                </button>
                <button type="button" onClick={closeAdding} className="inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold text-muted hover:text-ink">
                  Odustani
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1 self-start text-xs font-semibold text-primary hover:text-ink"
            >
              <Plus className="size-3.5" /> Dodaj stavku
            </button>
          ))}

        <p className="flex items-baseline justify-between pt-1">
          <span className="text-muted">Ukupno{hasOpenPrice && " (bez stavki po dogovoru)"}</span>
          <strong className="text-base text-ink">{formatPrice(total)}</strong>
        </p>
      </section>

      <section className={card}>
        <label className={label}>
          Interna napomena (kupac je ne vidi)
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} className={`${smallInput} min-h-20 resize-y font-normal`} placeholder="npr. zvala, hoće roze slova umjesto plavih" />
        </label>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-primary/40 bg-blush/40 p-3 text-primary">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
          {saving ? "Čuvanje..." : "Sačuvaj izmjene"}
        </button>
        <button type="button" onClick={() => router.push(backHref)} className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-muted hover:text-ink">
          Odustani
        </button>
      </div>
    </form>
  );
}
