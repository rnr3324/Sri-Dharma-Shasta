import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useGo, asset } from '../utils/helpers'

const OPTIONS = [['en', 'English'], ['hi', 'हिन्दी'], ['sa', 'संस्कृतम्'], ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം'], ['ta', 'தமிழ்'], ['te', 'తెలుగు']]
const LINKS = [['Home', '/home'], ['Pooja Services', '/home', 'sevas'], ['Pooja Kits', '/store'], ['Bookings', '/tantri'], ['About Us', '/home', 'founder'], ['Contact', '/home', 'contact']]

export default function Header() {
  const { t, lang, setLang, count } = useApp()
  const [open, setOpen] = useState(false)
  const go = useGo()
  const to = (...a) => { setOpen(false); go(...a) }
  return (
    <header className="sticky top-0 z-20 border-b border-gold/40 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
        <button className="mr-auto flex items-center gap-2 text-left" onClick={() => to('/home')}>
          <img src={asset('landing-mandala.webp')} alt="" className="h-10 w-10 rounded-full object-cover" />
          <span>
            <strong className="block font-display text-base leading-tight tracking-widest text-gold">SRI DHARMA SHASTA</strong>
            <small className="font-display text-[.62rem] tracking-[.18em] text-gold2">{t('SWAMIYE SARANAM AYYAPPA')}</small>
          </span>
        </button>
        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-3 border-b border-gold bg-coal p-5 lg:static lg:flex lg:flex-row lg:gap-5 lg:border-0 lg:bg-transparent lg:p-0`}>
          {LINKS.map(([label, path, id]) => (
            <a key={label} role="button" tabIndex={0} className="cursor-pointer border-b border-transparent hover:border-gold hover:text-gold" onClick={() => to(path, id)} onKeyDown={(e) => e.key === 'Enter' && to(path, id)}>{t(label)}</a>
          ))}
        </nav>
        <select aria-label="Language" value={lang || 'en'} onChange={(e) => setLang(e.target.value)} className="rounded-full border border-gold/40 bg-coal px-2 py-1 text-gold2">
          {OPTIONS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
        </select>
        <button aria-label="Cart" onClick={() => to('/cart')} className="relative h-10 w-10 rounded-full border border-gold/40 text-gold">
          🛒<i className="absolute -right-1.5 -top-1.5 rounded-full bg-maroon2 px-1.5 text-xs not-italic text-white">{count}</i>
        </button>
        <button className="btn btn-sm hidden lg:inline-block" onClick={() => to('/tantri')}>{t('Book Now')}</button>
        <button aria-label="Menu" className="h-10 w-10 rounded-lg border border-gold/40 text-xl text-gold lg:hidden" onClick={() => setOpen(!open)}>☰</button>
      </div>
    </header>
  )
}
