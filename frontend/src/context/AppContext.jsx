import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import I18N from '../data/i18n'
import { PRODUCTS } from '../data/products'
import { API_URL, CONFIG } from '../config'

const Ctx = createContext(null)
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } }
const COL = { hi: 0, sa: 0, kn: 1, ml: 2, ta: 3, te: 4 }
const loadCart = () => {
  const stored = load('sds-cart', {})
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {}
  return Object.fromEntries(Object.entries(stored).flatMap(([id, rawQty]) => {
    const qty = Number(rawQty)
    return /^\d+$/.test(id) && Number.isInteger(qty) && qty > 0 ? [[id, Math.min(CONFIG.maxOrderQuantity, qty)]] : []
  }))
}

export function AppProvider({ children }) {
  const [products, setProducts] = useState(PRODUCTS)
  const [catalogReady, setCatalogReady] = useState(false)
  const [checkoutConfig, setCheckoutConfig] = useState({ shipping: CONFIG.shipping, freeShippingAbove: CONFIG.freeShippingAbove, maxOrderQuantity: CONFIG.maxOrderQuantity })
  const [checkoutConfigReady, setCheckoutConfigReady] = useState(false)
  const [checkoutConfigError, setCheckoutConfigError] = useState('')
  const [checkoutConfigAttempt, setCheckoutConfigAttempt] = useState(0)
  const [site, setSite] = useState({ tantriProfileImage: 'tantri-placeholder.svg', tantriGallery: [] })
  const [lang, setLang] = useState(() => load('sds-lang', null))
  const [cart, setCart] = useState(loadCart)
  const [coupon, setCoupon] = useState('')
  const [coupons, setCoupons] = useState([])
  const [orders, setOrders] = useState(() => load('sds-orders', []))
  const [last, setLast] = useState(null)

  useEffect(() => save('sds-lang', lang), [lang])
  useEffect(() => save('sds-cart', cart), [cart])
  useEffect(() => save('sds-orders', orders), [orders])
  useEffect(() => {
    fetch(`${API_URL}/products`).then((r) => r.ok ? r.json() : null).then((data) => { if (Array.isArray(data)) setProducts(data) }).catch(() => {}).finally(() => setCatalogReady(true))
    fetch(`${API_URL}/site`).then((r) => r.ok ? r.json() : null).then((data) => { if (data) setSite(data) }).catch(() => {})
    fetch(`${API_URL}/coupons`).then((r) => r.ok ? r.json() : null).then((data) => { if (Array.isArray(data)) setCoupons(data) }).catch(() => {})
  }, [])
  useEffect(() => {
    let active = true
    setCheckoutConfigReady(false)
    setCheckoutConfigError('')
    fetch(`${API_URL}/checkout-config`).then((response) => {
      if (!response.ok) throw new Error('Checkout settings could not be loaded.')
      return response.json()
    }).then((data) => {
      if (!Number.isFinite(Number(data?.shippingFee)) || Number(data.shippingFee) < 0 || !Number.isFinite(Number(data?.freeShippingAbove)) || Number(data.freeShippingAbove) < 0) throw new Error('Checkout settings are invalid.')
      if (!active) return
      const maxOrderQuantity = Number.isInteger(Number(data.maxOrderQuantity)) && Number(data.maxOrderQuantity) > 0 ? Number(data.maxOrderQuantity) : CONFIG.maxOrderQuantity
      setCheckoutConfig({ shipping: Number(data.shippingFee), freeShippingAbove: Number(data.freeShippingAbove), maxOrderQuantity })
      setCart((current) => Object.fromEntries(Object.entries(current).map(([id, qty]) => [id, Math.min(maxOrderQuantity, qty)]).filter(([, qty]) => qty > 0)))
    }).catch((error) => { if (active) setCheckoutConfigError(error.message || 'Checkout settings could not be loaded.') }).finally(() => { if (active) setCheckoutConfigReady(true) })
    return () => { active = false }
  }, [checkoutConfigAttempt])
  useEffect(() => {
    document.documentElement.lang = lang || 'en'
    document.documentElement.dataset.l = lang || 'en'
  }, [lang])

  const t = (s) => (!lang || lang === 'en' ? s : I18N[s]?.[COL[lang]] || s)

  const value = useMemo(() => {
    const items = Object.entries(cart).map(([id, qty]) => ({ p: products.find((x) => x.id === +id), qty })).filter((i) => i.p)
    const subtotal = items.reduce((a, i) => a + i.p.price * i.qty, 0)
    const selectedCoupon = coupons.find((item) => item.code === coupon)
    const discount = selectedCoupon ? Math.round((subtotal * selectedCoupon.percent) / 100) : 0
    const shipping = subtotal === 0 || subtotal >= checkoutConfig.freeShippingAbove ? 0 : checkoutConfig.shipping
    return {
      lang, setLang, t, items, products, catalogReady, setProducts, site, setSite, subtotal, discount, shipping, total: subtotal - discount + shipping,
      freeShippingAbove: checkoutConfig.freeShippingAbove, maxOrderQuantity: checkoutConfig.maxOrderQuantity, checkoutConfigReady, checkoutConfigError,
      retryCheckoutConfig: () => setCheckoutConfigAttempt((attempt) => attempt + 1),
      count: items.reduce((a, i) => a + i.qty, 0), coupon, setCoupon, coupons, setCoupons,
      add: (id, n = 1) => setCart((c) => {
        const increment = Number(n)
        if (!Number.isInteger(increment) || increment < 1) return c
        return { ...c, [id]: Math.min(checkoutConfig.maxOrderQuantity, (Number(c[id]) || 0) + increment) }
      }),
      change: (id, d) => setCart((c) => { const q = Math.min(checkoutConfig.maxOrderQuantity, (Number(c[id]) || 0) + d); const { [id]: _, ...rest } = c; return q > 0 ? { ...rest, [id]: q } : rest }),
      clear: () => { setCart({}); setCoupon('') },
      orders, addOrder: (o) => setOrders((x) => [...x, o]), last, setLast,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, cart, coupon, coupons, orders, last, products, catalogReady, site, checkoutConfig, checkoutConfigReady, checkoutConfigError])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useApp = () => useContext(Ctx)
