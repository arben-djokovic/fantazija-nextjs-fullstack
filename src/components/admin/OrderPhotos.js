/* eslint-disable @next/next/no-img-element */

// Slike koje je kupac poslao za tortu; klik otvara punu veličinu u novom tabu.
export default function OrderPhotos({ photos }) {
  return (
    <span className="mt-1 flex flex-wrap gap-1.5">
      {photos.map((url, index) => (
        <a key={url} href={url} target="_blank" rel="noreferrer" title={`Slika ${index + 1}`} className="block overflow-hidden rounded-md border border-line hover:border-primary">
          <img src={url} alt={`Slika kupca ${index + 1}`} className="size-16 object-cover" />
        </a>
      ))}
    </span>
  );
}
