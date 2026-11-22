import { useState } from 'react'
import ProductImage from './ProductImage'
import Qty from './Qty'
import { useApp } from '../context/AppContext'
import { useGo } from '../utils/helpers'

export default function ProductCard({ p }) {
  const { t, add, items, maxOrderQuantity } = useApp()
  const [qty, setQty] = useState(1)
  const go = useGo()
  const openProduct = () => go(`/product/${p.id}`)
  const existingQty = items.find((item) => item.p.id === p.id)?.qty || 0
  const remaining = Math.max(0, maxOrderQuantity - existingQty)

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-gold/20 bg-gradient-to-b from-[#241812] to-[#15100d] shadow-md shadow-black/20 transition duration-200 hover:border-gold/60 hover:shadow-lg sm:rounded-2xl">
      <div className="relative">
        <button className="block w-full" onClick={openProduct} aria-label={`View ${p.name} details`}>
          <ProductImage p={p} h="clamp(126px, 40vw, 210px)" />
        </button>
        <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-gold/25 bg-[#100b09]/85 px-2.5 py-1 font-sans text-[.65rem] text-gold2 sm:left-3 sm:top-3 sm:px-3 sm:text-xs">{p.cat}</span>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <button className="text-left font-display text-[.82rem] font-semibold leading-snug text-cream hover:text-gold2 sm:text-base" onClick={openProduct}>{p.name}</button>
        <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] font-sans text-xs leading-5 text-[#b9ad94] sm:mt-2 sm:min-h-10 sm:text-sm">{p.desc}</p>

        <div className="mt-2 flex items-baseline justify-between gap-2 sm:mt-3">
          <span className="font-sans text-base font-bold tabular-nums text-gold2 sm:text-xl">₹{Number(p.price).toLocaleString('en-IN')}</span>
          <button className="font-sans text-xs text-[#cbbd9d] underline decoration-gold/40 underline-offset-4 hover:text-gold2 sm:text-sm" onClick={openProduct}>Details</button>
        </div>

        <div className="mt-3 flex flex-col items-center gap-2 border-t border-gold/15 pt-3 sm:mt-4 sm:flex-row sm:justify-between">
          <Qty compact max={Math.max(1, remaining)} value={qty} onChange={(delta) => setQty((current) => Math.max(1, Math.min(Math.max(1, remaining), current + delta)))} />
          <button disabled={!remaining} className="w-full rounded-full bg-gradient-to-r from-gold to-gold2 px-3 py-2 font-sans text-xs font-bold text-[#211506] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4 sm:text-sm" onClick={() => { if (remaining) add(p.id, Math.min(qty, remaining)); setQty(1) }}>{remaining ? t('Add to Cart') : 'Limit reached'}</button>
        </div>
      </div>
    </article>
  )
}
