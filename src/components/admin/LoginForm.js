"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fieldInput } from "@/components/styles";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Prijava nije uspjela");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Prijava nije uspjela");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-line bg-card p-7">
      <h1 className="font-serif text-4xl text-ink">Prijava</h1>
      <p className="-mt-2 text-sm text-muted">Fantazija · admin</p>

      <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
        Korisničko ime
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          className={fieldInput}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
        Lozinka
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className={fieldInput}
          required
        />
      </label>

      {error && (
        <p role="alert" className="text-xs text-primary">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {sending ? "Prijava..." : "Prijavi se"}
      </button>
    </form>
  );
}
