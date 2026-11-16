"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useNetwork } from "@/lib/network";
import { SignInForm } from "./SignInForm";

/** Sign-in prompt shown when a signed-out visitor tries to add something to My Network. */
export function AuthDialog() {
  const { promptOpen, closePrompt } = useNetwork();
  const pathname = usePathname();

  // Following a link inside the dialog (terms, privacy) closes it
  useEffect(() => { closePrompt(); }, [pathname, closePrompt]);

  useEffect(() => {
    if (!promptOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePrompt(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [promptOpen, closePrompt]);

  if (!promptOpen) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onClick={closePrompt}>
      <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="rise w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">My Network</p>
            <h2 id="auth-title" className="mt-1 text-2xl font-semibold">Sign in to save this</h2>
          </div>
          <button type="button" onClick={closePrompt} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl text-bark hover:bg-sand">×</button>
        </div>
        <p className="mt-2 mb-5 text-sm text-bark">Create a free login with your email and we&apos;ll add this to your network. Browsing stays open to everyone.</p>
        <SignInForm autoFocus />
      </div>
    </div>
  );
}
