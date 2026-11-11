import { useState } from 'react'
import { Navigate, Link, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useGo } from '../utils/helpers'
import ProductImage from '../components/ProductImage'
import Qty from '../components/Qty'

export default function ProductDetails() {
  const { id } = useParams()
  const { products, add, t } = useApp()
  const go = useGo()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const product = products.find((item) => item.id === Number(id))

  if (!product) return <Navigate to="/store" replace />

  return (
    <main className="min-h-[70vh] bg-[#100b09] px-4 py-8 text-cream sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-mute">
          <Link className="hover:text-gold2" to="/store">Store</Link><span className="mx-2">/</span><span className="text-gold2">{product.name}</span>
        </nav>
        <section className="grid overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-[#241812] to-[#120e0b] shadow-2xl md:grid-cols-2">
          <div className="min-h-[320px] bg-[radial-gradient(circle_at_center,#d4af3725,transparent_65%)] p-4 sm:p-8 md:min-h-[540px]">
            <ProductImage p={product} h={480} />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-gold">{product.cat}</p>
            <h1 className="mt-3 text-3xl leading-tight text-gold2 sm:text-4xl">{product.name}</h1>
            <p className="mt-5 text-3xl font-semibold text-cream">₹{Number(product.price).toLocaleString('en-IN')}</p>
            <p className="mt-5 whitespace-pre-line leading-7 text-[#d4c7ac]">{product.desc || 'Prepared with care for your devotional practice.'}</p>
            {product.includes?.length > 0 && <div className="mt-7 rounded-2xl border border-gold/20 bg-black/20 p-5"><h2 className="text-lg text-gold2">Included in this kit</h2><ul className="mt-3 space-y-2">{product.includes.map((item) => <li className="flex gap-2 text-[#e2d6bc]" key={item}><span className="text-gold">✦</span>{item}</li>)}</ul></div>}
            <p className="mt-6 text-sm text-green-300">● In stock · ships in 2–3 days</p>
            <p className="mt-1 text-sm text-mute">Free delivery on orders above ₹999</p>
            <div className="mt-7 flex flex-wrap items-center gap-5"><span className="text-sm text-mute">Quantity</span><Qty value={qty} onChange={(delta) => setQty((current) => Math.max(1, Math.min(99, current + delta)))} /><span className="ml-auto text-lg font-semibold text-gold2">₹{(product.price * qty).toLocaleString('en-IN')}</span></div>
            <button className="btn mt-7 w-full py-3" onClick={() => { add(product.id, qty); setAdded(true) }}>{added ? 'Added to cart ✓' : t('Add to Cart')}</button>
            {added && <button className="ghost mt-3 w-full" onClick={() => go('/cart')}>View cart and checkout</button>}
          </div>
        </section>
      </div>
    </main>
  )
}
