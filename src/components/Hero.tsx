import { PromptBox } from "./PromptBox";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-navy-900 to-navy-700 text-white">
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-teal-100">
          Now curating Honolulu
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Find the right room. <span className="text-teal-400">Meet the right people.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-100">
          PathCross is a curated guide to professional networking events, groups, and communities — so you spend less time searching and more time connecting.
        </p>
        <div className="mt-10"><PromptBox /></div>
      </div>
    </section>
  );
}
