"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { BADGES, CAKE_CATEGORIES, ITEM_TYPES, LOCALES, OPTION_KEYS } from "@/data/items";
import { fieldInput } from "@/components/styles";
import { MAX_ITEM_IMAGES } from "@/lib/images";

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
  badges: [],
  options: [{ key: "komad", servings: "", price: "", image: "" }],
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
  // Galerija: { src } za sliku koja već ima link, { src, file } za fajl koji se šalje na S3 tek pri čuvanju
  // (src je tada privremeni blob: link za pregled). Opcije pamte src slike koju prikazuju.
  const [images, setImages] = useState(() => (item?.images ?? []).map((src) => ({ src })));
  const [imageUrl, setImageUrl] = useState("");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Next sakriva stranicu pri odlasku umjesto da je ugasi, pa bi forma za novi proizvod ostala popunjena.
  // Zato se prazni kad se proizvod doda ili kad admin odustane.
  const resetNewForm = () => {
    if (!isNew) return;
    images.forEach((image) => image.file && URL.revokeObjectURL(image.src));
    setForm({ ...EMPTY_ITEM, type: defaultType });
    setImages([]);
    setImageUrl("");
    setSlugTouched(false);
    setError("");
  };

  const addImages = (entries) => {
    const fresh = entries.filter((entry) => !images.some((image) => image.src === entry.src));
    const free = MAX_ITEM_IMAGES - images.length;
    if (fresh.length > free) setError(`Proizvod može imati najviše ${MAX_ITEM_IMAGES} slika`);
    fresh.slice(free).forEach((entry) => entry.file && URL.revokeObjectURL(entry.src));
    setImages([...images, ...fresh.slice(0, free)]);
  };

  const addImageUrl = () => {
    const src = imageUrl.trim();
    if (!/^https?:\/\//.test(src)) {
      setError("Link do slike mora počinjati sa http:// ili https://");
      return;
    }
    setError("");
    addImages([{ src }]);
    setImageUrl("");
  };

  const addImageFiles = (files) => {
    setError("");
    addImages([...files].map((file) => ({ src: URL.createObjectURL(file), file })));
  };

  const moveImage = (index, step) => {
    const next = [...images];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    setImages(next);
  };

  // Uklonjena slika se skida i sa opcija koje su je prikazivale.
  const removeImage = (index) => {
    const { src, file } = images[index];
    if (file) URL.revokeObjectURL(src);
    setImages(images.filter((_, i) => i !== index));
    update({ options: form.options.map((option) => (option.image === src ? { ...option, image: "" } : option)) });
  };

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
      resetNewForm();
      router.push(`/admin/items?type=${form.type}`);
      router.refresh();
    } catch {
      setError("Akcija nije uspjela");
    } finally {
      setSaving(false);
    }
  };

  // Šalje fajl na S3 i vraća njegov link, ili null ako nije uspjelo.
  const uploadImage = async (file) => {
    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: data });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result.url;
      setError(result.error ?? "Slika nije sačuvana");
    } catch {
      setError("Slika nije sačuvana");
    }
    setSaving(false);
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (images.length === 0) {
      setError("Dodajte bar jednu sliku");
      return;
    }
    // Fajlovi idu na S3 jedan po jedan. Poslata slika odmah dobija pravi link (i u opcijama),
    // pa se ne šalje ponovo ako neka sljedeća ili samo čuvanje ne uspije.
    let gallery = images;
    let options = form.options;
    for (const image of images) {
      if (!image.file) continue;
      const url = await uploadImage(image.file);
      if (!url) break;
      URL.revokeObjectURL(image.src);
      gallery = gallery.map((entry) => (entry.src === image.src ? { src: url } : entry));
      options = options.map((option) => (option.image === image.src ? { ...option, image: url } : option));
    }
    setImages(gallery);
    update({ options });
    if (gallery.some((image) => image.file)) return;

    const body = {
      ...form,
      images: gallery.map((image) => image.src),
      category: form.type === "cake" ? form.category : undefined,
      options: options.map((option) => ({
        id: option.id,
        key: option.key,
        servings: option.servings === "" ? null : option.servings,
        price: option.price === "" || option.price === null ? null : option.price,
        image: option.image || null,
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
        <div>
          <h2 className="font-serif text-2xl text-ink">Slike</h2>
          <p className="mt-1 text-xs text-muted">
            Prva slika je glavna (početna strana, lista proizvoda, korpa). Na sajtu se sve slike vide u slideru. Najviše{" "}
            {MAX_ITEM_IMAGES} slika.
          </p>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {images.map((image, index) => (
              <div key={image.src} className="flex flex-col gap-1.5">
                <div className="relative">
                  <img src={image.src} alt="" className="aspect-4/3 w-full rounded-lg bg-line object-cover" />
                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">Glavna</span>
                  )}
                  {image.file && (
                    <span className="absolute right-1.5 bottom-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[10px] text-muted">šalje se pri čuvanju</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Pomjeri lijevo"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                      className="grid size-8 place-items-center rounded-full border border-line text-ink hover:border-primary disabled:opacity-30"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Pomjeri desno"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 1)}
                      className="grid size-8 place-items-center rounded-full border border-line text-ink hover:border-primary disabled:opacity-30"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Ukloni sliku"
                    onClick={() => removeImage(index)}
                    className="grid size-8 place-items-center rounded-full border border-line text-primary hover:border-primary"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length < MAX_ITEM_IMAGES && (
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
            <label className={label}>
              Dodaj sa računara (JPG, PNG, WEBP, AVIF ili GIF, najviše 5 MB, može više odjednom)
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                onChange={(e) => {
                  addImageFiles(e.target.files ?? []);
                  e.target.value = "";
                }}
                className={`${fieldInput} file:mr-3 file:rounded-full file:border-0 file:bg-blush file:px-3 file:py-1 file:text-sm file:font-semibold file:text-primary`}
              />
            </label>
            <div className="flex items-end gap-2">
              <label className={`${label} flex-1`}>
                Ili dodaj link (https://...)
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                  className={fieldInput}
                />
              </label>
              <button
                type="button"
                onClick={addImageUrl}
                disabled={!imageUrl.trim()}
                className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-ink hover:border-primary disabled:opacity-40"
              >
                Dodaj
              </button>
            </div>
          </div>
        )}
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
              {images.length > 1 && (
                <div className="col-span-full flex flex-col gap-1.5 text-xs font-semibold text-muted">
                  Slika za ovu opciju (na sajtu slider pređe na nju kad kupac izabere opciju)
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateOption(index, { image: "" })}
                      aria-pressed={!option.image}
                      className={`h-12 rounded-lg border px-3 text-xs ${
                        !option.image ? "border-primary bg-blush text-ink" : "border-line text-muted hover:border-primary"
                      }`}
                    >
                      Bez posebne
                    </button>
                    {images.map((image, imageIndex) => (
                      <button
                        key={image.src}
                        type="button"
                        aria-label={`Slika ${imageIndex + 1}`}
                        aria-pressed={option.image === image.src}
                        onClick={() => updateOption(index, { image: image.src })}
                        className={`overflow-hidden rounded-lg border-2 ${
                          option.image === image.src ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={image.src} alt="" className="h-11 w-14 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => update({ options: [...form.options, { key: "komad", servings: "", price: "", image: "" }] })}
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
          onClick={() => {
            resetNewForm();
            router.push(`/admin/items?type=${item?.type ?? defaultType}`);
          }}
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
