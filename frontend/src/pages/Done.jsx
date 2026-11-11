import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useGo } from '../utils/helpers'

export default function Done() {
  const { t, last } = useApp()
  const go = useGo()
  if (!last) return <Navigate to="/home" replace />
  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-16 text-center">
      <div>
        <div className="text-6xl">🪔</div>
        <h2 className="my-3 text-3xl">{t('Order Placed')}</h2>
        <p className="mx-auto mb-6 max-w-xl text-mute">
          Thank you, {last.name}. Order ref {last.ref} for ₹{last.total} ({last.pay === 'cod' ? 'Cash on Delivery' : 'UPI'}).{' '}
          {last.pay === 'upi' && 'Your payment is being verified against our account. '}
          Tap the button below to send your order to us on WhatsApp so we can confirm it. Swamiye Saranam!
        </p>
        <a className="btn mb-4" href={last.wa} target="_blank" rel="noopener noreferrer">Send order on WhatsApp</a><br />
        <button className="ghost" onClick={() => go('/home')}>{t('Back to Home')}</button>
      </div>
    </main>
  )
}
