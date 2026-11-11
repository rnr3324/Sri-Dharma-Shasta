import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useGo, asset } from '../utils/helpers'
import { SERVICES, MANTRAS, RULES, TEMPLES } from '../data/content'
import ProductImage from '../components/ProductImage'

function Section({ id, title, sub, children, alt }) {
  return (
    <section id={id} className={alt ? 'bg-coal' : ''}>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-2xl sm:text-4xl">{title}</h2>
        <div className="mb-3 mt-1 text-center text-sm text-gold">❖</div>
        {sub && <p className="mx-auto mb-8 max-w-prose text-center text-mute">{sub}</p>}
        {children}
      </div>
    </section>
  )
}

function Row({ items, onOpen, rev }) {
  return (
    <div className="overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <div className={`flex w-max gap-4 hover:[animation-play-state:paused] ${rev ? 'animate-marquee-rev' : 'animate-marquee'}`}>
        {[...items, ...items].map((p, i) => (
          <button key={i} onClick={() => onOpen(p)} className="w-52 flex-none overflow-hidden rounded-2xl border border-gold/30 bg-coal text-center hover:border-gold">
            <ProductImage p={p} />
            <h3 className="px-2 pt-3 text-sm text-cream">{p.name}</h3>
            <p className="pb-3 font-semibold text-gold2">₹{p.price}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { t, products, site } = useApp()
  const go = useGo()
  const [flip, setFlip] = useState({})
  const featured = products.slice(0, 12)
  const value = [['Premium Pooja Kits', 'Authentic & Pure'], ['Secure Online Bookings', 'Simple and safe'], ['Door Delivery Across India', 'Right to your home'], ['Dedicated Support', 'Call us any day']]

  // Shrine background images mapping
  const shrineImages = {
    'Sabarimala': 'https://www.keralatourpackages.com/wp-content/webp-express/webp-images/uploads/2021/11/sabarimala.jpg.webp',
    'Erumeli': 'https://myadhyatm.com/wp-content/uploads/2024/05/1-473.jpg',
    'Achankovil': 'https://www.dtpckollam.com/uploads/picture_gallery/gallery_images/achankovil_temple_in_kollam-1920x1080-20230508001854268515.webp',
    'Aryankavu': 'https://pilgrimdata.in/wp-content/uploads/2026/08/24_aryankavu_1.jpeg',
    'Kuzhathupuzha': 'https://www.tourmyindia.com/states/kerala/images/achankovil-temple1.jpg'
  }

  return (
    <main>
      <div className="border-b border-gold bg-gradient-to-r from-maroon via-[#3a0912] to-maroon px-4 py-2 text-center text-gold2">
        🪔 Mandala &amp; Makaravilakku season: order Irumudi and Deeksha kits early so they arrive in time.{' '}
        <button className="text-gold underline" onClick={() => go('/store')}>Shop kits</button>
      </div>

      <section className="relative flex min-h-[min(80vh,660px)] flex-col items-center overflow-hidden border-b border-gold text-center md:flex-row md:text-left">
        <div className="hero-img h-72 w-full md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[72%]" style={{ backgroundImage: `url(${asset('hero-ayyappa.jpg')})` }} />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-10">
          <div className="mx-auto max-w-[470px] md:mx-0">
            <p className="mb-2 font-display text-sm tracking-[.3em] text-gold2">{t('SWAMIYE SARANAM AYYAPPA')}</p>
            <h1 className="bg-gradient-to-r from-gold via-gold2 to-gold bg-clip-text text-4xl leading-tight text-transparent sm:text-6xl">{t('Sri Dharma Shasta')}</h1>
            <p className="my-3 text-2xl">{t('Ayyappa Swamy Pooja Kits & Seva Services')}</p>
            <p className="mb-4 text-2xl italic text-gold2">{t('Your One Stop Destination for All Ayyappa Swamy Pooja Needs')}</p>
            <p className="mb-4 italic tracking-wide text-gold2">{t('Faith • Devotion • Divine Blessings')}</p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <button className="pill" onClick={() => go('/store')}>{t('Pooja Kits')}</button>
              <button className="pill" onClick={() => go('/tantri')}>{t('Seva Bookings')}</button>
              <button className="pill" onClick={() => go('/tantri')}>{t('Melshanti & Tantri')}</button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 border-y border-gold bg-gradient-to-r from-maroon via-[#3a0912] to-maroon px-5 py-5 text-center lg:grid-cols-4">
        {value.map(([a, b]) => <div key={a}><b className="block font-display text-gold2">{t(a)}</b><span className="text-[#e7d9bb]">{t(b)}</span></div>)}
      </div>

      <Section id="sevas" title={t('Our Sevas')} sub={t('Rituals performed with Vedic discipline and devotion.')}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SERVICES.map((s) => (
            <div key={s.name} className="rounded-xl border border-gold bg-gradient-to-b from-cream to-[#EBDDB8] p-4 text-center font-display text-sm text-maroon transition hover:-translate-y-1">
              <span className="mb-1 block text-3xl">{s.icon}</span>{t(s.name)}
            </div>
          ))}
        </div>
      </Section>

      <Section alt title={t('Featured Kits & Items')} sub={t('Tap any item to read more.')}>
        <Row items={featured.slice(0, 6)} onOpen={(p) => go(`/product/${p.id}`)} />
        <Row items={featured.slice(6)} onOpen={(p) => go(`/product/${p.id}`)} rev />
        <p className="mt-6 text-center"><button className="btn" onClick={() => go('/store')}>{t('Visit the Store')}</button></p>
      </Section>

      <Section title={t('Mantras & Meanings')} sub={t('Words to repeat with a steady mind through the mandala days.')}>
        <div className="grid gap-4 md:grid-cols-2">
          {MANTRAS.map((m) => (
            <div key={m.title} className="box"><em className="block text-xl not-italic text-gold">{m.sa}</em><h3 className="mb-1 mt-2 text-base text-gold2">{m.title}</h3><p>{m.meaning}</p></div>
          ))}
        </div>
      </Section>

      <Section alt title={t('Deeksha Rules & Guidelines')} sub={t('The 41-day vratham asks for discipline of body, speech and mind.')}>
        <div className="grid gap-4 md:grid-cols-2">
          {RULES.map((r) => <div key={r.title} className="box"><h3 className="mb-1 text-base text-gold2">{t(r.title)}</h3><p>{r.text}</p></div>)}
        </div>
      </Section>

      <Section title={t('The Five Sacred Shrines')} sub={t('Tap a card to turn it over.')}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TEMPLES.map((x) => (
            <button key={x.name} aria-label={x.name} className="h-72 text-center [perspective:1000px]" onClick={() => setFlip({ ...flip, [x.name]: !flip[x.name] })}>
              <div className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${flip[x.name] ? '[transform:rotateY(180deg)]' : ''}`}>
                
                {/* Front Side with Background Image and Dark Gradient Overlay */}
                <div 
                  className="absolute inset-0 flex flex-col items-end justify-end rounded-2xl border border-gold p-4 text-left [backface-visibility:hidden] bg-cover bg-center overflow-hidden"
                  style={{ backgroundImage: `url(${shrineImages[x.name] || shrineImages['Sabarimala']})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  <div className="relative z-10 w-full text-center">
                    <h3 className="text-lg font-bold text-gold2">{t(x.name)}</h3>
                    <small className="mt-1 block text-[#e7d9bb]">{t('Tap to flip')}</small>
                  </div>
                </div>

                {/* Back Side with Description */}
                <div className="absolute inset-0 overflow-auto rounded-2xl border border-gold bg-coal p-4 text-base leading-snug [backface-visibility:hidden] [transform:rotateY(180deg)] text-left">
                  <h3 className="mb-2 text-base font-bold text-gold2">{t(x.name)}</h3>
                  <p className="text-sm text-cream/90">{x.text}</p>
                </div>

              </div>
            </button>
          ))}
        </div>
      </Section>

      <section id="founder" className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid items-center gap-8 rounded-3xl border border-gold bg-gradient-to-br from-maroon to-[#1b0508] p-8 text-center shadow-[0_0_50px_#d4af3722] md:grid-cols-[auto_1fr] md:text-left">
          <img 
            src={asset(site.tantriProfileImage)}
            alt="Tantri Naveen Kumar Sharma" 
            className="mx-auto h-60 w-40 rounded-2xl border-6 border-gold object-cover object-top shadow-lg md:mx-0" 
          />
          <div>
            <h2 className="text-2xl">{t('Founder & Tantri')}</h2>
            <h3 className="my-1 text-xl text-gold2">{t('Tantri Naveen Kumar Sharma')}</h3>
            <p className="mb-4">Hyderabad. Guiding devotees through Ayyappa poojas, homams and Melshanti with traditional Tantric practice.</p>
            <button className="btn" onClick={() => go('/tantri')}>{t('Book Sevas')}</button>
          </div>
        </div>
      </section>
    </main>
  )
}
