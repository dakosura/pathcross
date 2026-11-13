import { PromptBox } from "./PromptBox";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-forest text-cream">
      <div aria-hidden className="absolute inset-0 bg-[url(/topo.svg)] bg-cover bg-center" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="mb-5 inline-block rounded-md border border-cream/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-clay-300">
          Honolulu · Professional networking
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold sm:text-6xl">
          Every good connection starts with <span className="italic text-clay-300">crossing paths.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-cream/75">
          PathCross is a curated guide to the events, groups, and communities worth showing up for — so you spend less time searching and more time connecting.
        </p>
        <div className="mt-10"><PromptBox /></div>
      </div>
    </section>
  );
}
