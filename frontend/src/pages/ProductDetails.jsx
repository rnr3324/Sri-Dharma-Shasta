import { useState } from 'react'
import { Navigate, Link, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useGo } from '../utils/helpers'
import ProductImage from '../components/ProductImage'
import Qty from '../components/Qty'

export default function ProductDetails() {
  const { id } = useParams()
  const { products, catalogReady, add, t, items, maxOrderQuantity } = useApp()
  const go = useGo()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const product = products.find((item) => item.id === Number(id))
  const existingQty = items.find((item) => item.p.id === product?.id)?.qty || 0
  const remaining = Math.max(0, maxOrderQuantity - existingQty)

  if (!product && !catalogReady) return <main className="grid min-h-[60vh] place-items-center bg-[#100b09] text-mute">Loading product…</main>
  if (!product) return <Navigate to="/store" replace />

  const unitPrice = Number(product.price) || 0
  const total = unitPrice * qty

  return (
    <main className="min-h-[70vh] bg-[#100b09] px-4 py-6 text-cream sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 font-sans text-sm text-mute sm:mb-6">
          <Link className="hover:text-gold2" to="/store">Pooja Kits</Link>
          <span aria-hidden="true" className="text-gold/50">/</span>
          <span aria-current="page" className="max-w-[70vw] truncate text-gold2">{product.name}</span>
        </nav>

        <section className="overflow-hidden rounded-2xl border border-gold/20 bg-[#19120f] shadow-xl shadow-black/25 sm:rounded-3xl">
          <div className="grid md:grid-cols-[1.05fr_.95fr]">
            <div className="bg-[radial-gradient(circle_at_center,#d4af3720,transparent_65%)] p-3 sm:p-7 md:p-8">
              <div className="overflow-hidden rounded-xl border border-gold/10 sm:rounded-2xl">
                <ProductImage p={product} h="clamp(280px, 78vw, 520px)" />
              </div>
            </div>

            <div className="flex min-w-0 flex-col border-t border-gold/15 p-5 sm:p-8 md:border-l md:border-t-0 md:p-10 lg:p-12">
              <span className="w-fit rounded-full border border-gold/25 bg-gold/5 px-3 py-1 font-sans text-xs font-medium text-gold2">{product.cat}</span>
              <h1 className="mt-4 break-words text-2xl leading-tight text-gold2 sm:text-4xl">{product.name}</h1>

              <div className="mt-5 border-y border-gold/15 py-4">
                <p className="font-sans text-xs uppercase tracking-[.16em] text-mute">Price</p>
                <p className="mt-1 font-sans text-3xl font-bold tabular-nums text-cream sm:text-4xl">₹{unitPrice.toLocaleString('en-IN')}</p>
              </div>

              <div className="mt-5">
                <h2 className="font-sans text-sm font-semibold text-gold2">Description</h2>
                <p className="mt-2 whitespace-pre-line font-sans text-sm leading-6 text-[#d4c7ac] sm:text-base sm:leading-7">{product.desc || 'Prepared with care for your devotional practice.'}</p>
              </div>

              {product.includes?.length > 0 && (
                <div className="mt-5 rounded-xl border border-gold/15 bg-black/15 p-4 sm:p-5">
                  <h2 className="font-sans text-sm font-semibold text-gold2">Included in this kit</h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {product.includes.map((item) => <li className="flex gap-2 font-sans text-sm leading-5 text-[#e2d6bc]" key={item}><span aria-hidden="true" className="text-gold">✓</span><span>{item}</span></li>)}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/15 bg-black/15 p-3 sm:p-4">
                  <div>
                    <p className="font-sans text-xs text-mute">Quantity</p>
                    <Qty max={Math.max(1, remaining)} value={qty} onChange={(delta) => setQty((current) => Math.max(1, Math.min(Math.max(1, remaining), current + delta)))} />
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-xs text-mute">Total</p>
                    <p className="font-sans text-xl font-bold tabular-nums text-gold2">₹{total.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <button disabled={!remaining} className="btn mt-4 w-full py-3 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { if (remaining) { add(product.id, Math.min(qty, remaining)); setAdded(true) } }}>{remaining ? added ? 'Added to cart ✓' : t('Add to Cart') : 'Maximum quantity in cart'}</button>
                {added && <button className="ghost mt-3 w-full" onClick={() => go('/cart')}>View cart and checkout</button>}
              </div>
            </div>
          </div>
        </section>

        <Link to="/store" className="mt-5 inline-flex min-h-11 items-center gap-2 font-sans text-sm text-mute hover:text-gold2"><span aria-hidden="true">←</span> Back to Pooja Kits</Link>
      </div>
    </main>
  )
}
