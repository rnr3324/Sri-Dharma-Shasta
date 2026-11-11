import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../context/AppContext'
import { CONFIG } from '../config'
import { useGo, upiLink, waLink } from '../utils/helpers'
import Qty from '../components/Qty'

export default function Cart() {
  const { t, items, subtotal, discount, shipping, total, coupon, setCoupon, change, clear, addOrder, setLast } = useApp()
  const go = useGo()
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', pin: '', code: '', utr: '' })
  const [pay, setPay] = useState('upi')
  const [err, setErr] = useState('')
  const [cpm, setCpm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const pinOk = /^[1-9][0-9]{5}$/.test(f.pin)

  if (!items.length) return (
    <main className="px-5 py-24 text-center">
      <h2 className="text-3xl">{t('Your Cart')}</h2>
      <p className="my-4 text-mute">{t('Your cart is empty.')}</p>
      <button className="btn" onClick={() => go('/store')}>{t('Browse Pooja Kits')}</button>
    </main>
  )

  const applyCoupon = () => {
    const ok = f.code.trim().toUpperCase() === CONFIG.coupon.code
    setCoupon(ok)
    setCpm(ok ? `Coupon applied: ${CONFIG.coupon.percent}% off.` : 'This coupon code is not valid.')
  }
  const place = async () => {
    const e = !f.name.trim() ? 'Enter your name.'
      : !/^[0-9+\s-]{10,14}$/.test(f.phone.trim()) ? 'Enter a valid phone number.'
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api'}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), address: f.address.trim(), pin: f.pin }, items: items.map(({ p, qty }) => ({ id: p.id, qty })), pay, utr: f.utr, coupon: coupon ? CONFIG.coupon.code : '' }) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Could not submit the order.')
      saved = body
    } catch (error) { setErr(error.message || 'Could not connect to the order service. Please try again.'); setSubmitting(false); return }
    const ref = saved.ref
    const msg = [`New order ${ref}`, ...lines, `Shipping: ${shipping ? '₹' + shipping : 'Free'}`, coupon ? `Coupon ${CONFIG.coupon.code} applied` : null,
      `Total: ₹${total} (${pay === 'cod' ? 'Cash on Delivery' : 'UPI'})`, pay === 'upi' ? `UPI txn ID: ${f.utr}` : null,
      `Name: ${f.name}`, `Phone: ${f.phone}`, `Address: ${f.address} - ${f.pin}`].filter(Boolean).join('\n')
    const status = pay === 'upi' ? `Payment submitted (UTR ${f.utr}). Verification in progress. We will confirm by WhatsApp or call.` : 'Order received. Pay cash on delivery.'
    addOrder({ ref, total: saved.total, pay, date: new Date().toLocaleDateString(), status })
    setLast({ ref, name: f.name, total: saved.total, pay, wa: waLink(msg) })
    clear()
    go('/done')
    setSubmitting(false)
  }
  const Row = ({ a, b, bold }) => <div className={`flex justify-between border-b border-gold/20 py-2 ${bold ? 'font-display text-gold2' : ''}`}><span>{a}</span><span>{b}</span></div>
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-10">
      <h2 className="mb-6 text-center text-2xl sm:text-4xl">{t('Your Cart')}</h2>
      {items.map(({ p, qty }) => (
        <div key={p.id} className="flex items-center justify-between gap-3 border-b border-gold/20 py-3">
          <span>{p.icon} {p.name}</span>
          <span className="flex items-center gap-3"><Qty value={qty} onChange={(d) => change(p.id, d)} /> ₹{p.price * qty}</span>
        </div>
      ))}
      <Row a="Subtotal" b={`₹${subtotal}`} />
      {coupon && <Row a="Coupon discount" b={`−₹${discount}`} />}
      <Row a="Shipping" b={shipping ? `₹${shipping}` : 'Free'} />
      {shipping > 0 && <small className="text-mute">Add ₹{CONFIG.freeShippingAbove - subtotal} more for free delivery.</small>}
      <Row bold a={t('Total')} b={`₹${total}`} />

      <h3 className="mt-8">{t('Delivery Details')}</h3>
      <label className="label">{t('Name')}</label><input className="field" value={f.name} onChange={set('name')} />
      <label className="label">{t('Phone')}</label><input className="field" inputMode="tel" value={f.phone} onChange={set('phone')} />
      <label className="label">{t('Email')}</label><input className="field" type="email" value={f.email} onChange={set('email')} />
      <label className="label">{t('Address')}</label><textarea className="field" rows={3} value={f.address} onChange={set('address')} />
      <label className="label">Pincode</label><input className="field" inputMode="numeric" maxLength={6} value={f.pin} onChange={set('pin')} />
      {f.pin && <p className="text-gold2">{pinOk ? 'Delivery usually takes 3–6 days. We confirm by call.' : 'Enter a valid 6-digit pincode.'}</p>}
      <label className="label">Coupon code</label>
      <div className="flex gap-3"><input className="field" placeholder={`e.g. ${CONFIG.coupon.code}`} value={f.code} onChange={set('code')} /><button type="button" className="ghost" onClick={applyCoupon}>Apply</button></div>
      {cpm && <p className="text-gold2">{cpm}</p>}

      <h3 className="mt-8">{t('Payment')}</h3>
      <div className="my-3 flex flex-wrap gap-3">
        {[['upi', 'QR Code Payment (UPI)'], ['cod', 'Cash on Delivery']].map(([v, l]) => (
          <label key={v} className="min-w-44 flex-1 cursor-pointer rounded-xl border border-gold/40 p-3"><input type="radio" name="pm" checked={pay === v} onChange={() => setPay(v)} className="mr-2" />{t(l)}</label>
        ))}
      </div>
      {pay === 'upi' ? (
        <div className="text-center">
          <div className="mx-auto w-fit rounded-xl bg-white p-3"><QRCodeSVG value={upiLink(total)} size={190} /></div>
          <p className="mt-2">Scan with any UPI app and pay ₹{total}<br />UPI ID: <b>{CONFIG.upiId}</b></p>
          <a className="ghost my-2" href={upiLink(total)}>Open UPI app</a>
          <p className="text-sm text-mute">We verify your payment in our PhonePe account before dispatch.</p>
          <label className="label text-left">UPI transaction ID (after you pay)</label>
          <input className="field" inputMode="numeric" maxLength={12} placeholder="12-digit UTR number" value={f.utr} onChange={set('utr')} />
        </div>
      ) : <p>{t('Pay in cash when your order arrives.')}</p>}
      {err && <p className="mt-3 text-red-300">{err}</p>}
      <button disabled={submitting} className="btn mt-5 disabled:cursor-wait disabled:opacity-60" onClick={place}>{submitting ? 'Submitting…' : t('Place Order')}</button>
    </main>
  )
}
