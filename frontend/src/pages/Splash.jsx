import { useNavigate } from 'react-router-dom'
import { asset } from '../utils/helpers'

export default function Splash() {
  const nav = useNavigate()
  return (
    <main className="glow grid min-h-screen place-items-center px-4 py-8 text-center">
      <div className="flex flex-col items-center">
        <img src={asset('landing-mandala.webp')} alt="Lord Ayyappa seated on a tiger within a sacred mandala" className="w-[min(82vw,440px)] animate-zin drop-shadow-[0_0_40px_#d4af3777]" />
        <h1 className="mt-6 bg-gradient-to-r from-gold via-gold2 to-gold bg-clip-text text-3xl text-transparent sm:text-5xl">SRI DHARMA SHASTA</h1>
        <p className="mb-8 mt-2 font-display tracking-[.3em] text-gold2">SWAMIYE SARANAM AYYAPPA</p>
        <button className="btn" onClick={() => nav('/language')}>Enter Sanctuary</button>
      </div>
    </main>
  )
}
