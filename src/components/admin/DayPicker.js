"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

// Kalendar za skok na bilo koji dan; adresa se pravi na serveru, ovdje se samo mijenja datum.
export default function DayPicker({ date, hrefTemplate }) {
  const router = useRouter();

  return (
    <label className="relative grid size-9 cursor-pointer place-items-center rounded-full border border-line text-muted transition-colors hover:border-primary hover:text-primary">
      <CalendarDays className="size-4" />
      <span className="sr-only">Izaberi datum</span>
      <input
        type="date"
        value={date}
        onChange={(event) => event.target.value && router.push(hrefTemplate.replace("__DATE__", event.target.value))}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}
