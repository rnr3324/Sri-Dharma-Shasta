import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { LANGS } from '../data/content'

export default function LanguageSelect() {
  const { setLang } = useApp()
  const nav = useNavigate()
  return (
    <main className="glow grid min-h-screen place-items-center px-4 py-10 text-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl sm:text-4xl">Select Your Primary Language</h2>
        <h2 className="mt-1 text-xl text-gold2">మీ భాషను ఎంచుకోండి</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {LANGS.map(([name, sym, code], i) => (
            <button key={code} onClick={() => { setLang(code); nav('/home') }}
              className={`rounded-2xl border border-gold/40 bg-coal py-6 transition hover:-translate-y-1 hover:border-gold hover:shadow-[0_0_26px_#d4af3744] ${i === LANGS.length - 1 ? 'col-span-2 sm:col-span-1 sm:col-start-2' : ''}`}>
              <b className="block font-display text-4xl text-gold">{sym}</b>{name}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
