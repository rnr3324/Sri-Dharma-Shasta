import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../context/AppContext'
import { API_URL, CONFIG } from '../config'
import { useGo, upiLink, waLink } from '../utils/helpers'
import Qty from '../components/Qty'

export default function Cart() {
  const { t, items, subtotal, discount, shipping, total, freeShippingAbove, maxOrderQuantity, checkoutConfigReady, checkoutConfigError, retryCheckoutConfig, coupon, setCoupon, coupons, setCoupons, change, clear, addOrder, setLast } = useApp()
  const go = useGo()
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', pin: '', code: '', utr: '' })
  const [pay, setPay] = useState('upi')
  const [err, setErr] = useState('')
  const [cpm, setCpm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const pinOk = /^[1-9][0-9]{5}$/.test(f.pin)
  const selectedCoupon = coupons.find((item) => item.code === coupon)

  useEffect(() => {
    fetch(`${API_URL}/coupons`).then((response) => response.ok ? response.json() : null).then((data) => { if (Array.isArray(data)) setCoupons(data) }).catch(() => {})
  }, [setCoupons])
  useEffect(() => {
    if (coupon && !coupons.some((item) => item.code === coupon)) setCoupon('')
  }, [coupon, coupons, setCoupon])

  if (!items.length) return (
    <main className="px-5 py-24 text-center">
      <h2 className="text-3xl">{t('Your Cart')}</h2>
      <p className="my-4 text-mute">{t('Your cart is empty.')}</p>
      <button className="btn" onClick={() => go('/store')}>{t('Browse Pooja Kits')}</button>
    </main>
  )

  const applyCoupon = () => {
    const found = coupons.find((item) => item.code === f.code.trim().toUpperCase())
    setCoupon(found?.code || '')
    setCpm(found ? `Coupon applied: ${found.percent}% off.` : 'This coupon code is not valid or active.')
  }
  const place = async () => {
    const e = !f.name.trim() ? 'Enter your name.'
      : !/^\d{10}$/.test(f.phone) ? 'Enter a 10-digit phone number.'
      : !/\S+@\S+\.\S+/.test(f.email) ? 'Enter a valid email.'
      : !f.address.trim() ? 'Enter your delivery address.'
      : !pinOk ? 'Enter a valid 6-digit pincode.'
      : pay === 'upi' && !/^[0-9]{12}$/.test(f.utr) ? 'After paying, enter the 12-digit UPI transaction ID (UTR) from your payment app.' : ''
    setErr(e)
    if (e) return
    const lines = items.map(({ p, qty }) => `${p.name} x ${qty} = ₹${p.price * qty}`)
    setSubmitting(true)
    let saved
    try {
      const response = await fetch(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: { name: f.name.trim(), phone: f.phone, email: f.email.trim(), address: f.address.trim(), pin: f.pin }, items: items.map(({ p, qty }) => ({ id: p.id, qty })), pay, utr: f.utr, coupon }) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Could not submit the order.')
      saved = body
    } catch (error) { setErr(error.message || 'Could not connect to the order service. Please try again.'); setSubmitting(false); return }
    const ref = saved.ref
    const msg = [`New order ${ref}`, ...lines, `Shipping: ${saved.shipping ? '₹' + saved.shipping : 'Free'}`, saved.coupon ? `Coupon ${saved.coupon} applied (₹${saved.discount} off)` : null,
      `Total: ₹${saved.total} (${pay === 'cod' ? 'Cash on Delivery' : 'UPI'})`, pay === 'upi' ? `UPI txn ID: ${f.utr}` : null,
      `Name: ${f.name}`, `Phone: ${f.phone}`, `Address: ${f.address} - ${f.pin}`].filter(Boolean).join('\n')
    const status = pay === 'upi' ? `Payment submitted (UTR ${f.utr}). Verification in progress. We will confirm by WhatsApp or call.` : 'Order received. Pay cash on delivery.'
    addOrder({ ref, total: saved.total, pay, date: new Date().toLocaleDateString(), status })
    setLast({ ref, name: f.name, total: saved.total, pay, wa: waLink(msg) })
    clear()
    go('/done')
    setSubmitting(false)
  }
  const Row = ({ a, b, bold }) => <div className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-gold/20 py-2 ${bold ? 'font-display text-gold2' : ''}`}><span className="min-w-0 break-words">{a}</span><span className="text-right font-sans tabular-nums">{b}</span></div>
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-10">
      <form onSubmit={(event) => { event.preventDefault(); place() }}>
      <h2 className="mb-6 text-center text-2xl sm:text-4xl">{t('Your Cart')}</h2>
      {items.map(({ p, qty }) => (
        <div key={p.id} className="flex items-center justify-between gap-2 border-b border-gold/20 py-3 sm:gap-3">
          <span className="min-w-0 flex-1 break-words">{p.icon} {p.name}</span>
          <span className="flex shrink-0 items-center gap-2 font-sans tabular-nums sm:gap-3"><Qty min={0} max={maxOrderQuantity} value={qty} onChange={(d) => change(p.id, d)} /> ₹{p.price * qty}</span>
        </div>
      ))}
      <Row a="Subtotal" b={`₹${subtotal}`} />
      {selectedCoupon && <Row a={`Coupon ${selectedCoupon.code} (${selectedCoupon.percent}% off)`} b={`−₹${discount}`} />}
      <Row a="Shipping" b={checkoutConfigReady ? shipping ? `₹${shipping}` : 'Free' : 'Loading…'} />
      {checkoutConfigReady && shipping > 0 && <small className="font-sans text-sm text-mute">Add ₹{freeShippingAbove - subtotal} more for free delivery.</small>}
      <Row bold a={t('Total')} b={checkoutConfigReady ? `₹${total}` : 'Updating…'} />

      <h3 className="mt-8">{t('Delivery Details')}</h3>
      <label className="label">{t('Name')}</label><input className="field" autoComplete="name" maxLength={120} required value={f.name} onChange={set('name')} />
      <label className="label">{t('Phone')}</label><input className="field font-sans tabular-nums" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} minLength={10} pattern="[0-9]{10}" title="Enter exactly 10 digits" required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /><small className="text-mute">Enter exactly 10 digits.</small>
      <label className="label">{t('Email')}</label><input className="field" type="email" autoComplete="email" maxLength={254} required value={f.email} onChange={set('email')} />
      <label className="label">{t('Address')}</label><textarea className="field" rows={3} autoComplete="street-address" maxLength={600} required value={f.address} onChange={set('address')} />
      <label className="label">Pincode</label><input className="field font-sans tabular-nums" inputMode="numeric" autoComplete="postal-code" maxLength={6} minLength={6} pattern="[1-9][0-9]{5}" required value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
      {f.pin && <p className="font-sans text-sm text-gold2">{pinOk ? 'We will use this PIN code to confirm delivery details.' : 'Enter a valid 6-digit pincode.'}</p>}
      <label className="label">Coupon code</label>
      <div className="flex min-w-0 gap-2 sm:gap-3"><input className="field min-w-0 flex-1 font-sans uppercase" placeholder="Enter coupon code" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} /><button type="button" className="ghost shrink-0 px-4" onClick={applyCoupon}>Apply</button></div>
      {cpm && <p className="text-gold2">{cpm}</p>}

      <h3 className="mt-8">{t('Payment')}</h3>
      <div className="my-3 flex flex-wrap gap-3">
        {[['upi', 'QR Code Payment (UPI)'], ['cod', 'Cash on Delivery']].map(([v, l]) => (
          <label key={v} className="min-w-44 flex-1 cursor-pointer rounded-xl border border-gold/40 p-3"><input type="radio" name="pm" checked={pay === v} onChange={() => setPay(v)} className="mr-2" />{t(l)}</label>
        ))}
      </div>
      {pay === 'upi' ? (
        <div className="text-center">
          {!checkoutConfigReady ? <p className="rounded-xl border border-gold/20 bg-coal p-4 font-sans text-sm text-mute">Loading current delivery charges before preparing your payment QR…</p> : <>
            <div className="mx-auto w-fit rounded-xl bg-white p-3"><QRCodeSVG value={upiLink(total)} size={190} /></div>
            <p className="mt-2">Scan with any UPI app and pay ₹{total}<br />UPI ID: <b>{CONFIG.upiId}</b></p>
            <a className="ghost my-2" href={upiLink(total)}>Open UPI app</a>
            <p className="text-sm text-mute">We verify your payment in our PhonePe account before dispatch.</p>
            <label className="label text-left">UPI transaction ID (after you pay)</label>
            <input className="field font-sans tabular-nums" inputMode="numeric" maxLength={12} minLength={12} pattern="[0-9]{12}" required placeholder="12-digit UTR number" value={f.utr} onChange={(event) => setF({ ...f, utr: event.target.value.replace(/\D/g, '').slice(0, 12) })} />
          </>}
        </div>
      ) : <p>{t('Pay in cash when your order arrives.')}</p>}
      {err && <p className="mt-3 text-red-300">{err}</p>}
      {checkoutConfigError && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/30 bg-red-900/15 p-3 font-sans text-sm text-red-200"><span>{checkoutConfigError} Check your connection and retry.</span><button type="button" className="underline underline-offset-2" onClick={retryCheckoutConfig}>Retry</button></div>}
      <button type="submit" disabled={submitting || !checkoutConfigReady || Boolean(checkoutConfigError)} className="btn mt-5 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Submitting…' : !checkoutConfigReady ? 'Updating order total…' : t('Place Order')}</button>
      </form>
    </main>
  )
}
