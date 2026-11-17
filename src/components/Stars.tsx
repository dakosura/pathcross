/** Five stars, `value` of them filled. Decorative; pair with visible or sr-only text. */
export function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex tracking-[0.08em] ${className}`}>
      <span className="text-clay">{"★".repeat(value)}</span>
      <span className="text-line">{"★".repeat(5 - value)}</span>
    </span>
  );
}
