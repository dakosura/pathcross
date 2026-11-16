"use client";
import Link from "next/link";
import { useState } from "react";
import { sendSignInLink } from "@/lib/network";

/** Passwordless sign-in: emails a one-time link. First use creates the account. */
export function SignInForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  if (phase === "sent") {
    return (
      <div role="status" className="rounded-xl bg-moss-50 p-4 text-sm text-forest">
        <p className="font-semibold">Check your email</p>
        <p className="mt-1">We sent a sign-in link to <span className="font-semibold">{email}</span>. Open it on this device to finish.</p>
        <button type="button" onClick={() => setPhase("idle")} className="mt-3 font-semibold text-clay-700 hover:underline">Use a different email</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPhase("sending");
        const problem = await sendSignInLink(email.trim());
        if (problem) { setError(problem); setPhase("idle"); } else setPhase("sent");
      }}
      className="space-y-3"
    >
      <label htmlFor="signin-email" className="block text-sm font-semibold text-ink">Email</label>
      <input
        id="signin-email"
        type="email"
        required
        autoFocus={autoFocus}
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-moss"
      />
      {error && <p role="alert" className="text-sm font-medium text-clay-700">{error}</p>}
      <button type="submit" disabled={phase === "sending"} className="w-full rounded-full bg-forest px-4 py-3 text-sm font-semibold text-cream transition hover:bg-forest-700 disabled:opacity-60">
        {phase === "sending" ? "Sending…" : "Email me a sign-in link"}
      </button>
      <p className="text-xs text-bark/80">
        New here? The same link creates your account. By continuing you agree to the{" "}
        <Link href="/terms" className="font-semibold text-clay-700 hover:underline">terms</Link> and{" "}
        <Link href="/privacy" className="font-semibold text-clay-700 hover:underline">privacy notice</Link>.
      </p>
    </form>
  );
}
