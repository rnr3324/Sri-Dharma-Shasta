import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useGo } from '../utils/helpers'

export default function Done() {
  const { t, last } = useApp()
  const go = useGo()
  useEffect(() => {
    if (!last?.wa) return
    const timeout = window.setTimeout(() => window.location.assign(last.wa), 1200)
    return () => window.clearTimeout(timeout)
  }, [last?.wa])

  if (!last) return <Navigate to="/home" replace />

  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-16 text-center">
      <div>
        <div aria-hidden="true" className="text-[clamp(3rem,18vw,4rem)] leading-none">🪔</div>
        <h2 className="my-3 text-3xl">Order Successfully Placed!</h2>
        <p className="mx-auto mb-6 max-w-xl text-mute">
          Thank you, {last.name}. Order ref {last.ref} for ₹{last.total} ({last.pay === 'cod' ? 'Cash on Delivery' : 'UPI'}).{' '}
          {last.pay === 'upi' && 'Your payment is being verified against our account. '}
          Redirecting you to WhatsApp to send your order details and confirm it. Swamiye Saranam!
        </p>
        <a className="btn mb-4" href={last.wa}>Continue to WhatsApp</a><br />
        <button className="ghost" onClick={() => go('/home')}>{t('Back to Home')}</button>
      </div>
    </main>
  )
}
