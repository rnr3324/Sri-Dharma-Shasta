import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import I18N from '../data/i18n'
import { PRODUCTS } from '../data/products'
import { CONFIG } from '../config'

const Ctx = createContext(null)
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } }
const COL = { hi: 0, sa: 0, kn: 1, ml: 2, ta: 3, te: 4 }

export function AppProvider({ children }) {
  const [products, setProducts] = useState(PRODUCTS)
  const [site, setSite] = useState({ tantriProfileImage: 'tantri-placeholder.svg', tantriGallery: [] })
  const [lang, setLang] = useState(() => load('sds-lang', null))
  const [cart, setCart] = useState(() => load('sds-cart', {}))
  const [coupon, setCoupon] = useState(false)
  const [orders, setOrders] = useState(() => load('sds-orders', []))
  const [last, setLast] = useState(null)

  useEffect(() => save('sds-lang', lang), [lang])
  useEffect(() => save('sds-cart', cart), [cart])
  useEffect(() => save('sds-orders', orders), [orders])
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api'
    fetch(`${base}/products`).then((r) => r.ok ? r.json() : null).then((data) => { if (Array.isArray(data) && data.length) setProducts(data) }).catch(() => {})
    fetch(`${base}/site`).then((r) => r.ok ? r.json() : null).then((data) => { if (data) setSite(data) }).catch(() => {})
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang || 'en'
    document.documentElement.dataset.l = lang || 'en'
  }, [lang])

  const t = (s) => (!lang || lang === 'en' ? s : I18N[s]?.[COL[lang]] || s)

  const value = useMemo(() => {
    const items = Object.entries(cart).map(([id, qty]) => ({ p: products.find((x) => x.id === +id), qty })).filter((i) => i.p)
    const subtotal = items.reduce((a, i) => a + i.p.price * i.qty, 0)
    const discount = coupon ? Math.round((subtotal * CONFIG.coupon.percent) / 100) : 0
    const shipping = subtotal === 0 || subtotal >= CONFIG.freeShippingAbove ? 0 : CONFIG.shipping
    return {
      lang, setLang, t, items, products, setProducts, site, setSite, subtotal, discount, shipping, total: subtotal - discount + shipping,
      count: items.reduce((a, i) => a + i.qty, 0), coupon, setCoupon,
      add: (id, n = 1) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + n })),
      change: (id, d) => setCart((c) => { const q = (c[id] || 0) + d; const { [id]: _, ...rest } = c; return q > 0 ? { ...rest, [id]: q } : rest }),
      clear: () => { setCart({}); setCoupon(false) },
      orders, addOrder: (o) => setOrders((x) => [...x, o]), last, setLast,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, cart, coupon, orders, last, products, site])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useApp = () => useContext(Ctx)
