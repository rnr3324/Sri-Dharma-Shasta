import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useGo, asset } from '../utils/helpers'
import { CartIcon, MenuIcon } from './Icons'

const OPTIONS = [['en', 'English'], ['hi', 'हिन्दी'], ['sa', 'संस्कृतम्'], ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം'], ['ta', 'தமிழ்'], ['te', 'తెలుగు']]
const LINKS = [['Home', '/home'], ['Pooja Services', '/home', 'sevas'], ['Pooja Kits', '/store'], ['Bookings', '/tantri'], ['About Us', '/home', 'about']]

export default function Header() {
  const { t, lang, setLang, count } = useApp()
  const [open, setOpen] = useState(false)
  const go = useGo()
  const to = (...a) => { setOpen(false); go(...a) }
  return (
    <header className="sticky top-0 z-20 border-b border-gold/40 bg-ink/95 backdrop-blur" onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}>
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <button className="mr-auto flex min-w-0 items-center gap-2 text-left" onClick={() => to('/home')}>
          <img src={asset('landing-mandala.webp')} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover sm:h-10 sm:w-10" />
          <span className="min-w-0">
            <strong className="block whitespace-nowrap font-display text-[.72rem] leading-tight tracking-[.08em] text-gold sm:text-base sm:tracking-widest">SRI DHARMA SHASTA</strong>
            <small className="hidden font-display text-[.62rem] tracking-[.18em] text-gold2 sm:block">{t('SWAMIYE SARANAM AYYAPPA')}</small>
          </span>
        </button>
        <nav id="primary-navigation" aria-label="Primary navigation" className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full z-30 w-full flex-col gap-1 border-b border-gold bg-coal p-3 shadow-xl sm:p-5 lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
          {LINKS.map(([label, path, id]) => (
            <a key={label} href={path} className="flex min-h-11 items-center rounded-lg px-3 text-base hover:bg-gold/10 hover:text-gold lg:min-h-0 lg:rounded-none lg:px-0" onClick={(event) => { event.preventDefault(); to(path, id) }}>{t(label)}</a>
          ))}
          <label className="flex min-h-11 items-center gap-3 px-3 text-sm text-gold2 sm:hidden">Language<select aria-label="Language" value={lang || 'en'} onChange={(e) => { setLang(e.target.value); setOpen(false) }} className="min-h-10 rounded-full border border-gold/40 bg-ink px-3 py-2 text-cream">{OPTIONS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
        </nav>
        <select aria-label="Language" value={lang || 'en'} onChange={(e) => setLang(e.target.value)} className="hidden max-w-24 rounded-full border border-gold/40 bg-coal px-2 py-1 text-sm text-gold2 sm:block">
          {OPTIONS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
        </select>
        <button aria-label={`Cart, ${count} items`} onClick={() => to('/cart')} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
          <CartIcon className="h-5 w-5"/><i className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-maroon2 px-1 font-sans text-[.65rem] not-italic leading-none text-white">{count}</i>
        </button>
        <button className="btn btn-sm hidden lg:inline-block" onClick={() => to('/tantri')}>{t('Book Now')}</button>
        <button aria-label={open ? 'Close menu' : 'Open menu'} aria-controls="primary-navigation" aria-expanded={open} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-gold/40 text-gold lg:hidden" onClick={() => setOpen(!open)}><MenuIcon open={open}/></button>
      </div>
    </header>
  )
}
