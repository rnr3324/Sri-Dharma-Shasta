
import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useGo } from '../utils/helpers'
import { CATEGORIES } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Store() {
  const { t, count, subtotal, products } = useApp()
  const go = useGo()

  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')

  const cats = ['All', ...new Set([...Object.values(CATEGORIES), ...products.map((p) => p.cat)])]

  const list = useMemo(() => {
    const search = q.toLowerCase().trim()

    return products.filter((p) => {
      const matchesCategory =
        cat === 'All' || p.cat === cat

      const matchesSearch = [
        p.name,
        p.desc,
        p.cat
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)

      return matchesCategory && matchesSearch
    })
  }, [cat, q, products])

  return (
    <main className="min-h-screen bg-[#100b09] text-[#f5e9c9]">

      {/* STORE HERO */}
      <section className="relative overflow-hidden border-b border-[#c9a227]/20 px-5 py-16 text-center sm:py-20">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(155,95,20,0.20),transparent_65%)]" />

        <div className="relative mx-auto max-w-3xl">

          <span className="mb-4 inline-block rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 px-5 py-2 text-xs tracking-[0.25em] text-[#e4c35c]">
            SWAMIYE SARANAM AYYAPPA
          </span>

          <h1 className="font-serif text-4xl font-semibold leading-tight text-[#e9ca69] sm:text-6xl">
            {t('Pooja Kits & Items')}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#c5b99f] sm:text-base">
            Discover authentic Ayyappa Swamy pooja essentials,
            sacred malas, traditional pooja materials and
            carefully prepared devotional kits.
          </p>

          <div className="mx-auto mt-7 h-[2px] w-24 bg-gradient-to-r from-transparent via-[#d7b443] to-transparent" />

          <p className="mt-4 text-sm text-[#d7b443]">
            Faith • Devotion • Divine Blessings
          </p>

        </div>
      </section>

      {/* STORE CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* SECTION HEADING */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <h2 className="font-serif text-2xl text-[#e9ca69] sm:text-3xl">
              Explore Our Collection
            </h2>

            <p className="mt-2 text-sm text-[#a99b83]">
              Select your preferred items for your spiritual journey.
            </p>
          </div>

          <span className="text-sm text-[#d7b443]">
            {list.length} Products Available
          </span>

        </div>

        {/* SEARCH */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#d7b443]">
              ⌕
            </span>

            <input
              aria-label="Search products"
              type="search"
              placeholder="Search malas, pooja kits, idols..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-[#c9a227]/30 bg-[#1b1511] py-3 pl-12 pr-4 text-sm text-[#f5e9c9] outline-none transition placeholder:text-[#827764] focus:border-[#d7b443] focus:ring-1 focus:ring-[#d7b443]/30"
            />

          </div>

          {q && (
            <button
              onClick={() => setQ('')}
              className="rounded-xl border border-[#c9a227]/40 px-5 py-3 text-sm text-[#e9ca69] hover:bg-[#c9a227]/10"
            >
              Clear Search
            </button>
          )}

        </div>

        {/* CATEGORY FILTER */}
        <div className="mb-10">

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a99b83]">
            Browse Categories
          </p>

          <div className="flex gap-3 overflow-x-auto pb-3">

            {cats.map((c) => (

              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border px-6 py-2.5 text-sm transition-all duration-300 ${
                  c === cat
                    ? 'border-[#e9ca69] bg-gradient-to-r from-[#d7b443] to-[#f1d77e] font-semibold text-[#211506] shadow-lg shadow-[#c9a227]/10'
                    : 'border-[#c9a227]/30 bg-[#1b1511] text-[#c8bda7] hover:border-[#d7b443] hover:text-[#e9ca69]'
                }`}
              >
                {c}
              </button>

            ))}

          </div>
        </div>

        {/* PRODUCT GRID */}
        {list.length > 0 ? (

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {list.map((p) => (

              <div
                key={p.id}
                className="group min-w-0 overflow-hidden rounded-2xl border border-[#c9a227]/20 bg-gradient-to-b from-[#241812] to-[#15100d] shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-[#d7b443]/70 hover:shadow-xl hover:shadow-[#c9a227]/10"
              >

                <ProductCard p={p} />

              </div>

            ))}

          </div>

        ) : (

          <div className="rounded-2xl border border-dashed border-[#c9a227]/30 bg-[#1b1511] px-5 py-20 text-center">

            <div className="mb-4 text-5xl">🪔</div>

            <h3 className="font-serif text-2xl text-[#e9ca69]">
              No Products Found
            </h3>

            <p className="mt-3 text-sm text-[#a99b83]">
              Try another search or select a different category.
            </p>

            <button
              onClick={() => {
                setQ('')
                setCat('All')
              }}
              className="mt-6 rounded-full bg-gradient-to-r from-[#d7b443] to-[#f1d77e] px-7 py-3 font-semibold text-[#211506] transition hover:brightness-110"
            >
              View All Products
            </button>

          </div>

        )}

      </section>

      {/* PRODUCT DETAILS MODAL */}
      {/* FLOATING CART */}
      {count > 0 && (

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d7b443]/50 bg-[#1b090b]/95 px-4 py-4 shadow-2xl backdrop-blur-xl">

          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">

            <div>
              <p className="text-sm text-[#d7b443]">
                {count} {t('item(s)')}
              </p>

              <p className="text-lg font-semibold text-[#f5e9c9]">
                ₹{subtotal}
              </p>
            </div>

            <button
              onClick={() => go('/cart')}
              className="rounded-full bg-gradient-to-r from-[#d7b443] to-[#f1d77e] px-7 py-3 text-sm font-bold uppercase tracking-wider text-[#211506] shadow-lg transition hover:scale-105 hover:brightness-110"
            >
              {t('View Cart')} →
            </button>

          </div>

        </div>

      )}

    </main>
  )
}
