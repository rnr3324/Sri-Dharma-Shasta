export default function Qty({ value, onChange, compact = false, min = 1, max = 99 }) {
  const b = `grid shrink-0 place-items-center rounded-full border border-gold font-sans leading-none text-gold ${compact ? 'h-8 w-8 text-base' : 'h-10 w-10 text-xl sm:h-9 sm:w-9'}`
  return (
    <span className={`inline-flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <button type="button" aria-label={min === 0 && value === 1 ? 'Remove item' : 'Decrease quantity'} disabled={value <= min} className={`${b} disabled:cursor-not-allowed disabled:opacity-40`} onClick={() => onChange(-1)}>−</button>
      <span className={`${compact ? 'min-w-4 text-sm' : 'min-w-5'} text-center font-sans tabular-nums`}>{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} className={`${b} disabled:cursor-not-allowed disabled:opacity-40`} onClick={() => onChange(1)}>+</button>
    </span>
  )
}
