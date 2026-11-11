export default function Qty({ value, onChange }) {
  const b = 'h-8 w-8 rounded-full border border-gold text-gold text-xl leading-none'
  return (
    <span className="inline-flex items-center gap-3">
      <button aria-label="Less" className={b} onClick={() => onChange(-1)}>−</button>
      <span className="min-w-4 text-center">{value}</span>
      <button aria-label="More" className={b} onClick={() => onChange(1)}>+</button>
    </span>
  )
}
