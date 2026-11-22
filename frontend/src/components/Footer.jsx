import { useState } from 'react'
import Modal from './Modal'
import { useApp } from '../context/AppContext'
import { POLICIES } from '../data/content'
import { CONFIG } from '../config'
import { PhoneIcon } from './Icons'

export default function Footer() {
  const { t, orders } = useApp()
  const [m, setM] = useState(null) // 'ship' | 'priv' | 'terms' | 'track'
  const [ref, setRef] = useState('')
  const [res, setRes] = useState('')
  const check = () => {
    const o = orders.find((x) => x.ref === ref.trim().toUpperCase())
    setRes(o ? `${o.ref} (${o.date}): ${o.status}` : `No order found on this device. Call ${CONFIG.phone} for help.`)
  }
  const link = 'cursor-pointer text-gold underline'
  return (
    <footer id="contact" className="border-t border-gold bg-[#060607] px-4 py-10 text-center text-mute">
      <p className="font-display text-gold">{t('SWAMIYE SARANAM AYYAPPA')}</p>
      <p>Hareeharasutham Ayyappa, Dharma Shasta: may your path be lit by faith.</p>
      <p>{t('Hyderabad, Telangana, India')}</p>
      <p className="inline-flex max-w-full flex-wrap items-center justify-center gap-2"><PhoneIcon className="h-4 w-4 shrink-0 text-gold"/><a className={`${link} break-all`} href={`tel:${CONFIG.phone.replace(/\s/g, '')}`}>{CONFIG.phone}</a></p>
      <p className="mt-2">
        {['ship', 'priv', 'terms'].map((k) => <button key={k} className={`${link} mx-2`} onClick={() => setM(k)}>{POLICIES[k][0]}</button>)}
        <button className={`${link} mx-2`} onClick={() => { setRes(''); setM('track') }}>Track Order</button>
      </p>
      <Modal open={!!m} onClose={() => setM(null)}>
        {m === 'track' ? (
          <>
            <h3>Track Order</h3>
            <label className="label">Order reference</label>
            <input className="field" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="SDS123456" />
            <button className="btn btn-sm mt-4" onClick={check}>Check Status</button>
            <p className="mt-3 text-gold2">{res}</p>
          </>
        ) : m && (
          <>
            <h3>{POLICIES[m][0]}</h3>
            <p className="text-cream">{POLICIES[m][1]}</p>
            <p className="text-sm text-mute">Contact us for more information.</p>
          </>
        )}
      </Modal>
    </footer>
  )
}
