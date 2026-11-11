import { asset } from '../utils/helpers'
export default function ProductImage({ p, h = 130 }) {
  return (
    <div className="relative grid place-items-center overflow-hidden bg-[radial-gradient(circle,#d4af3733,#6d0f1f55_70%,#0b0b0c)] text-6xl" style={{ height: h }}>
      <span aria-hidden="true">{p.icon || '🪔'}</span>
      {p.img && <img src={asset(p.img)} alt={p.name} onError={(e) => e.currentTarget.remove()} className="absolute inset-0 h-full w-full object-cover" />}
    </div>
  )
}
