import { asset } from '../utils/helpers'
export default function ProductImage({ p, h = 130 }) {
  return (
    <div className="relative grid place-items-center overflow-hidden bg-[radial-gradient(circle,#d4af3733,#6d0f1f55_70%,#0b0b0c)]" style={{ height: h }}>
      <span aria-hidden="true" className="max-w-full text-[clamp(2.25rem,15vw,3.75rem)] leading-none">{p.icon || '🪔'}</span>
      {p.img && <img src={asset(p.img)} alt={p.name} loading="lazy" decoding="async" onError={(e) => e.currentTarget.remove()} className="absolute inset-0 h-full w-full object-contain p-3 sm:p-5" />}
    </div>
  )
}
