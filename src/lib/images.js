// Hostovi čije slike Next smanjuje i pretvara u WebP/AVIF (moraju se poklapati sa images.remotePatterns u next.config.mjs).
// Admin može upisati link sa bilo kog sajta, pa se slike sa drugih adresa prikazuju kakve jesu (unoptimized).
const OPTIMIZED_HOSTS = [/^images\.unsplash\.com$/, /\.amazonaws\.com$/];

export function canOptimize(src) {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const { protocol, hostname } = new URL(src);
    return protocol === "https:" && OPTIMIZED_HOSTS.some((host) => host.test(hostname));
  } catch {
    return false;
  }
}

export const MAX_ITEM_IMAGES = 10;

// Galerija proizvoda; stari proizvodi imaju samo glavnu sliku (image), bez liste images.
export function itemImages(item) {
  return item.images?.length ? item.images : item.image ? [item.image] : [];
}
