"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-context";

export default function FloatingCart() {
  const { count } = useCart();
  const pathname = usePathname();

  if (pathname === "/order/checkout") return null;

  return (
    <Link
      href="/order/checkout"
      aria-label={`Korpa, ${count} ${count === 1 ? "stavka" : "stavki"}`}
      className="fixed right-4 bottom-5 z-30 grid size-13 place-items-center rounded-full bg-primary text-white shadow-lg transition-opacity hover:opacity-90 md:right-6 md:bottom-6"
    >
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
