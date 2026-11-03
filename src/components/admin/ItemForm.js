"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { BADGES, CAKE_CATEGORIES, ITEM_TYPES, LOCALES, OPTION_KEYS } from "@/data/items";
import { fieldInput } from "@/components/styles";

const card = "flex flex-col gap-4 rounded-2xl border border-line bg-card p-6";
const label = "flex flex-col gap-1.5 text-xs font-semibold text-muted";
const checkbox = "flex items-center gap-2 text-sm text-ink";
const emptyLocalized = { me: "", sq: "", en: "" };

const EMPTY_ITEM = {
  slug: "",
  type: "cake",
  category: "classic",
  name: emptyLocalized,
  description: emptyLocalized,
  image: "",
  badges: [],
  options: [{ key: "komad", servings: "", price: "" }],
  featured: false,
  active: true,
  sortOrder: 0,
};

// "Čokoladna torta" -> "cokoladna-torta"
function slugify(value) {
  return value
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// item: postojeći proizvod (izmjena) ili undefined (novi proizvod).
export default function ItemForm({ item, defaultType = "cake" }) {
  const router = useRouter();
  const isNew = !item;
  const [form, setForm] = useState(item ?? { ...EMPTY_ITEM, type: defaultType });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (changes) => setForm((current) => ({ ...current, ...changes }));

  const updateLocalized = (field, locale, value) => {
    setForm((current) => {
      const next = { ...current, [field]: { ...current[field], [locale]: value } };
      // Za novi proizvod slug se pravi iz crnogorskog naziva, dok ga admin ne promijeni ručno.
      if (field === "name" && locale === "me" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  };

  const updateOption = (index, changes) =>
    update({ options: form.options.map((option, i) => (i === index ? { ...option, ...changes } : option)) });

  const toggleBadge = (badge) =>
    update({ badges: form.badges.includes(badge) ? form.badges.filter((b) => b !== badge) : [...form.badges, badge] });

  const send = async (method, url, body) => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body && JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Akcija nije uspjela");
        return;
      }
      router.push(`/admin/items?type=${form.type}`);
      router.refresh();
    } catch {
      setError("Akcija nije uspjela");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const body = {
      ...form,
      category: form.type === "cake" ? form.category : undefined,
      options: form.options.map((option) => ({
        id: option.id,
        key: option.key,
        servings: option.servings === "" ? null : option.servings,
        price: option.price === "" || option.price === null ? null : option.price,
      })),
    };
    if (isNew) send("POST", "/api/admin/items", body);
    else send("PATCH", `/api/admin/items/${item.id}`, body);
  };

  const handleDelete = () => {
    if (window.confirm(`Obrisati "${form.name.me}"? Ovo se ne može vratiti.`)) {
      send("DELETE", `/api/admin/items/${item.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className={card}>
        <h2 className="font-serif text-2xl text-ink">Osnovno</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className={label}>
            Vrsta
            <select value={form.type} onChange={(e) => update({ type: e.target.value })} className={fieldInput}>
              {Object.entries(ITEM_TYPES).map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
          {form.type === "cake" && (
            <label className={label}>
              Kategorija
              <select value={form.category ?? "classic"} onChange={(e) => update({ category: e.target.value })} className={fieldInput}>
                {Object.entries(CAKE_CATEGORIES).map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={label}>
            Slug (dio adrese, samo mala slova, brojevi i crtice)
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update({ slug: e.target.value });
              }}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              className={fieldInput}
              required
            />
          </label>
        </div>
      </section>

      <section className={card}>
        <h2 className="font-serif text-2xl text-ink">Naziv i opis</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Object.entries(LOCALES).map(([locale, language]) => (
            <div key={locale} className="flex flex-col gap-3">
              <label className={label}>
                Naziv · {language}
                <input value={form.name[locale]} onChange={(e) => updateLocalized("name", locale, e.target.value)} className={fieldInput} required />
              </label>
              <label className={label}>
                Opis · {language}
                <textarea
                  value={form.description[locale]}
                  onChange={(e) => updateLocalized("description", locale, e.target.value)}
                  className={`${fieldInput} min-h-24 resize-y`}
                  required
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-serif text-2xl text-ink">Slika</h2>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_160px]">
          <label className={label}>
            Link do slike (https://...)
            <input type="url" value={form.image} onChange={(e) => update({ image: e.target.value })} className={fieldInput} required />
          </label>
          {form.image && <img src={form.image} alt="" className="aspect-4/3 w-full rounded-lg bg-line object-cover" />}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-serif text-2xl text-ink">Opcije i cijene</h2>
        {form.options.map((option, index) => {
          const onRequest = option.price === null;
          return (
            <div key={option.id ?? `new-${index}`} className="grid grid-cols-2 items-end gap-3 border-b border-line pb-4 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
              <label className={label}>
                Opcija
                <select value={option.key} onChange={(e) => updateOption(index, { key: e.target.value })} className={fieldInput}>
                  {Object.entries(OPTION_KEYS).map(([value, text]) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                Broj osoba (nije obavezno)
                <input
                  type="number"
                  min="1"
                  value={option.servings ?? ""}
                  onChange={(e) => updateOption(index, { servings: e.target.value })}
                  className={fieldInput}
                />
              </label>
              <label className={label}>
                Cijena (€)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={onRequest ? "" : option.price}
                  disabled={onRequest}
                  onChange={(e) => updateOption(index, { price: e.target.value })}
                  className={`${fieldInput} disabled:opacity-50`}
                  required={!onRequest}
                />
              </label>
              <label className={`${checkbox} h-11`}>
                <input
                  type="checkbox"
                  checked={onRequest}
                  onChange={(e) => updateOption(index, { price: e.target.checked ? null : "" })}
                  className="accent-primary"
                />
                Po dogovoru
              </label>
              <button
                type="button"
                aria-label="Ukloni opciju"
                disabled={form.options.length === 1}
                onClick={() => update({ options: form.options.filter((_, i) => i !== index) })}
                className="grid size-11 place-items-center rounded-full border border-line text-primary transition-colors hover:border-primary disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => update({ options: [...form.options, { key: "komad", servings: "", price: "" }] })}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-ink"
        >
          <Plus className="size-4" /> Dodaj opciju
        </button>
      </section>

      <section className={card}>
        <h2 className="font-serif text-2xl text-ink">Prikaz</h2>
        <div className="flex flex-wrap gap-6">
          <label className={checkbox}>
            <input type="checkbox" checked={form.active} onChange={(e) => update({ active: e.target.checked })} className="accent-primary" />
            Aktivan (vidi se na sajtu)
          </label>
          <label className={checkbox}>
            <input type="checkbox" checked={form.featured} onChange={(e) => update({ featured: e.target.checked })} className="accent-primary" />
            Na početnoj strani
          </label>
          {Object.entries(BADGES).map(([badge, text]) => (
            <label key={badge} className={checkbox}>
              <input type="checkbox" checked={form.badges.includes(badge)} onChange={() => toggleBadge(badge)} className="accent-primary" />
              {text}
            </label>
          ))}
        </div>
        <label className={`${label} max-w-40`}>
          Redoslijed (manji ide prvi)
          <input type="number" value={form.sortOrder} onChange={(e) => update({ sortOrder: e.target.value })} className={fieldInput} />
        </label>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-primary/40 bg-blush/40 p-4 text-sm text-primary">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Čuvanje..." : isNew ? "Dodaj proizvod" : "Sačuvaj izmjene"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/items?type=${item?.type ?? defaultType}`)}
          className="inline-flex h-12 items-center rounded-full border border-line px-6 text-sm font-semibold text-ink hover:border-primary"
        >
          Odustani
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="ml-auto inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-primary hover:bg-blush disabled:opacity-50"
          >
            <Trash2 className="size-4" /> Obriši
          </button>
        )}
      </div>
    </form>
  );
}
