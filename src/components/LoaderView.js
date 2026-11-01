/* eslint-disable @next/next/no-img-element */
export default function LoaderView({ label }) {
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 grid place-items-center bg-cream/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="relative grid size-32 place-items-center">
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-blush border-t-primary" />
          <span className="absolute inset-4 rounded-full bg-white shadow-md" />
          <img src="/logo.e0e08eb7d04655a6ddaf.png" alt="" className="relative h-10 w-auto animate-pulse object-contain" />
        </div>
        <span className="text-[11px] tracking-[0.2em] text-muted uppercase">{label}</span>
      </div>
    </div>
  );
}
