import { useState } from 'react'
import ProductImage from './ProductImage'
import Qty from './Qty'
import { useApp } from '../context/AppContext'
import { useGo } from '../utils/helpers'

export default function ProductCard({ p }) {
  const { t, add } = useApp()
  const [q, setQ] = useState(1)
  const go = useGo()
  return (
    <div className="overflow-hidden rounded-2xl border border-gold/30 bg-coal text-center transition hover:border-gold">
      <button className="block w-full" onClick={() => go(`/product/${p.id}`)} aria-label={`View ${p.name} details`}><ProductImage p={p} h={210} /></button>
      <h3 className="px-3 pt-3 text-sm text-cream"><button className="hover:text-gold2" onClick={() => go(`/product/${p.id}`)}>{p.name}</button></h3>
      <p className="font-semibold text-gold2">₹{p.price}</p>
      <small className="block text-sm text-green-300">● In stock · ships in 2–3 days</small>
      <div className="p-3">
        <Qty value={q} onChange={(d) => setQ(Math.max(1, q + d))} />
        <div className="mt-2"><button className="btn btn-sm" onClick={() => { add(p.id, q); setQ(1) }}>{t('Add to Cart')}</button></div>
      </div>
    </div>
  )
}
