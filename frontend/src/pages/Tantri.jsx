
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { SERVICES } from '../data/content'
import { CONFIG } from '../config'
import { asset, waLink } from '../utils/helpers'

export default function Tantri() {
  const { t, site } = useApp()

  const sevas = [
    ...SERVICES.map((s) => s.name),
    'Melshanti'
  ]

  const [show, setShow] = useState(false)

  const [f, setF] = useState({
    name: '',
    phone: '',
    seva: sevas[0],
    date: '',
    slot: 'Morning (6–10 am)',
    where: 'At my home'
  })

  const [msg, setMsg] = useState(null)

  const set = (k) => (e) => {
    setF((prev) => ({
      ...prev,
      [k]: e.target.value
    }))
    setMsg(null)
  }

  const send = () => {
    if (
      !f.name.trim() ||
      !f.phone.trim() ||
      !f.date
    ) {
      setMsg({
        err: 'Enter your name, phone and preferred date to continue.'
      })
      return
    }

    const text = `
Tantri Booking Request

Seva: ${f.seva}
Date: ${f.date}
Time: ${f.slot}
Location: ${f.where}

Name: ${f.name}
Phone: ${f.phone}
    `.trim()

    setMsg({
      ok: f.name,
      href: waLink(text)
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0b0b] px-4 pb-24 pt-12 text-[#f5e9ce] sm:px-6">

      {/* BACKGROUND LIGHTING */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute left-1/2 top-0 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-[#b88720]/[0.07] blur-[130px]" />

        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#6d1b19]/10 blur-[120px]" />

      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* PAGE HEADER */}
        <header className="mb-12 text-center">

          <span className="inline-block rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 px-5 py-2 text-[11px] font-semibold tracking-[0.3em] text-[#e7c65b]">
            SRI DHARMA SHASTA
          </span>

          <h1 className="mt-5 font-serif text-4xl font-bold tracking-wide text-[#e7bd38] sm:text-5xl md:text-6xl">
            {t('Tantri Booking')}
          </h1>

          <div className="mx-auto mt-5 h-[2px] w-28 bg-gradient-to-r from-transparent via-[#d7b443] to-transparent" />

          <p className="mt-5 text-sm leading-7 text-[#c5b99f] sm:text-lg">
            {t('Book Melshanti, homams and sevas directly.')}
          </p>

        </header>

        {/* TANTRI PROFILE CARD */}
        <section className="group relative overflow-hidden rounded-3xl border border-[#c9a227]/60 bg-gradient-to-br from-[#1c1814] via-[#171514] to-[#100e0c] shadow-[0_20px_80px_rgba(0,0,0,0.45)] transition duration-500 hover:border-[#e0bc51]/80">

          {/* CARD DECORATION */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#c9a227]/10 transition duration-700 group-hover:scale-125" />

          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full border border-[#c9a227]/10" />

          <div className="relative grid items-center gap-8 p-5 sm:p-8 md:grid-cols-[230px_1fr] md:gap-10 md:p-10 lg:grid-cols-[260px_1fr] lg:gap-12">

            {/* PROFILE IMAGE */}
            <div className="mx-auto w-full max-w-[240px]">

              <div className="relative overflow-hidden rounded-2xl border border-[#d7b443]/60 bg-[#251c13] p-1 shadow-[0_10px_35px_rgba(201,162,39,0.12)]">

                <img
                  src={asset(site.tantriProfileImage)}
                  alt="Tantri Naveen Kumar Sharma"
                  loading="eager"
                  className="h-[300px] w-full rounded-xl object-cover object-top transition duration-700 group-hover:scale-[1.025] sm:h-[350px] md:h-[390px]"
                />

              </div>

              <div className="mt-4 text-center">

                <p className="font-serif text-lg font-semibold text-[#e9ca69]">
                  Tantri Naveen Kumar Sharma
                </p>

                <p className="mt-1 text-xs tracking-wider text-[#a99b83]">
                  FOUNDER & TANTRI
                </p>

              </div>

            </div>

            {/* PROFILE DETAILS */}
            <div className="min-w-0">

              {/* NAME */}
              <div className="mb-5">

                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b99a46]">
                  Experienced Tantri & Spiritual Services
                </span>

                <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-[#e7bd38] sm:text-3xl lg:text-4xl">
                  {t('Tantri Naveen Kumar Sharma')}
                </h2>

                <p className="mt-3 flex items-center gap-2 text-sm text-[#d0c2a6] sm:text-base">
                  <span className="text-lg">📍</span>
                  Hyderabad, Telangana
                </p>

              </div>

              <div className="mb-6 h-px w-full bg-gradient-to-r from-[#c9a227]/60 to-transparent" />

              {/* SEVA SERVICES */}
              <div>

                <div className="mb-4 flex items-center gap-3">

                  <span className="text-xl">🪔</span>

                  <h3 className="font-serif text-xl font-semibold text-[#e9ca69]">
                    Available Pooja & Seva Services
                  </h3>

                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">

                  {sevas.map((s) => (

                    <div
                      key={s}
                      className="flex items-start gap-3 rounded-lg border border-transparent px-3 py-2 transition duration-300 hover:border-[#c9a227]/20 hover:bg-[#c9a227]/[0.06]"
                    >

                      <span className="mt-0.5 text-[#d7b443]">
                        ◆
                      </span>

                      <span className="text-sm leading-6 text-[#e2d6bc] sm:text-base">
                        {t(s)}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

              {/* BOOKING CTA */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">

                <button
                  onClick={() => {
                    setShow(!show)
                    setMsg(null)
                  }}
                  className="rounded-full bg-gradient-to-r from-[#d6ad35] via-[#f4df91] to-[#d6ad35] px-9 py-4 font-serif text-base font-bold uppercase tracking-wider text-[#211506] shadow-[0_5px_30px_rgba(201,162,39,0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_35px_rgba(201,162,39,0.4)] active:scale-95"
                >
                  {show ? 'Close Booking Form' : t('Book Appointment')}
                  <span className="ml-3">→</span>
                </button>

                <p className="text-xs leading-6 text-[#a99b83]">
                  Book your preferred seva and date.
                  Our team will contact you for confirmation.
                </p>

              </div>

            </div>

          </div>

        </section>

        {site.tantriGallery?.length > 0 && <section className="mt-12"><h2 className="mb-5 text-center text-2xl">Tantri &amp; Seva Gallery</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{site.tantriGallery.map((url, i) => <img key={url} src={url} alt={`Tantri and seva ${i + 1}`} loading="lazy" className="aspect-square w-full rounded-2xl border border-gold/30 object-cover" />)}</div></section>}

        {/* APPOINTMENT FORM */}
        {show && (

          <section className="mt-8 animate-[fadeIn_0.4s_ease-out] rounded-3xl border border-[#c9a227]/50 bg-gradient-to-br from-[#1b1713] to-[#110e0c] p-5 shadow-2xl sm:p-8">

            {/* FORM HEADER */}
            <div className="mb-7">

              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b99a46]">
                SRI DHARMA SHASTA
              </span>

              <h3 className="mt-2 font-serif text-2xl font-bold text-[#e9ca69] sm:text-3xl">
                Request an Appointment
              </h3>

              <p className="mt-2 text-sm text-[#a99b83]">
                Fill in your details to request a Tantri appointment.
              </p>

            </div>

            {/* CONTACT */}
            <div className="mb-7 rounded-xl border border-[#c9a227]/20 bg-[#c9a227]/[0.05] p-4">

              <p className="mb-2 text-xs uppercase tracking-widest text-[#b99a46]">
                Direct Contact
              </p>

              <a
                className="text-lg font-semibold text-[#e9ca69] transition hover:text-white"
                href={`tel:${CONFIG.phone.replace(/\s/g, '')}`}
              >
                📞 {CONFIG.phone}
              </a>

            </div>

            {/* FORM FIELDS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm text-[#d7bd75]">
                  {t('Name')} *
                </label>

                <input
                  className="w-full rounded-xl border border-[#c9a227]/30 bg-[#0e0c0b] px-4 py-3 text-[#f5e9ce] outline-none transition placeholder:text-[#766d5d] focus:border-[#e7bd38] focus:ring-1 focus:ring-[#e7bd38]/30"
                  placeholder="Enter your full name"
                  value={f.name}
                  onChange={set('name')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#d7bd75]">
                  {t('Phone')} *
                </label>

                <input
                  type="tel"
                  inputMode="tel"
                  className="w-full rounded-xl border border-[#c9a227]/30 bg-[#0e0c0b] px-4 py-3 text-[#f5e9ce] outline-none transition placeholder:text-[#766d5d] focus:border-[#e7bd38] focus:ring-1 focus:ring-[#e7bd38]/30"
                  placeholder="Enter phone number"
                  value={f.phone}
                  onChange={set('phone')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#d7bd75]">
                  Select Seva *
                </label>

                <select
                  className="w-full rounded-xl border border-[#c9a227]/30 bg-[#0e0c0b] px-4 py-3 text-[#f5e9ce] outline-none focus:border-[#e7bd38]"
                  value={f.seva}
                  onChange={set('seva')}
                >
                  {sevas.map((s) => (
                    <option key={s} value={s}>
                      {t(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#d7bd75]">
                  {t('Preferred date')} *
                </label>

                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-[#c9a227]/30 bg-[#0e0c0b] px-4 py-3 text-[#f5e9ce] outline-none focus:border-[#e7bd38]"
                  value={f.date}
                  onChange={set('date')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#d7bd75]">
                  Preferred Time Slot
                </label>

                <select
                  className="w-full rounded-xl border border-[#c9a227]/30 bg-[#0e0c0b] px-4 py-3 text-[#f5e9ce] outline-none focus:border-[#e7bd38]"
                  value={f.slot}
                  onChange={set('slot')}
                >
                  {[
                    'Morning (6–10 am)',
                    'Midday (10 am–1 pm)',
                    'Evening (4–8 pm)'
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#d7bd75]">
                  Location of Pooja
                </label>

                <select
                  className="w-full rounded-xl border border-[#c9a227]/30 bg-[#0e0c0b] px-4 py-3 text-[#f5e9ce] outline-none focus:border-[#e7bd38]"
                  value={f.where}
                  onChange={set('where')}
                >
                  {[
                    'At my home',
                    'At a temple',
                    'Online'
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <p className="mt-5 text-xs leading-6 text-[#a99b83]">
              Note: Seva charges and availability will be confirmed
              with you directly before final booking.
            </p>

            {/* SUBMIT */}
            <button
              onClick={send}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-[#d6ad35] via-[#f4df91] to-[#d6ad35] px-8 py-4 font-serif font-bold uppercase tracking-wider text-[#211506] shadow-lg transition hover:-translate-y-1 hover:shadow-[0_5px_30px_rgba(201,162,39,0.25)] sm:w-auto"
            >
              {t('Request Booking')} →
            </button>

            {/* ERROR */}
            {msg?.err && (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {msg.err}
              </p>
            )}

            {/* WHATSAPP CONFIRMATION */}
            {msg?.ok && (

              <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-5">

                <p className="font-semibold text-green-300">
                  Thank you, {msg.ok}!
                </p>

                <p className="mt-2 text-sm text-[#d0c2a6]">
                  Your booking request is ready.
                  Continue to WhatsApp to send your details.
                </p>

                <a
                  href={msg.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#168b4a] px-6 py-3 font-semibold text-white transition hover:bg-[#11763d]"
                >
                  <span>☘</span>
                  Send Booking on WhatsApp →
                </a>

              </div>

            )}

          </section>

        )}

        {/* BOTTOM MESSAGE */}
        <div className="mt-12 text-center">

          <p className="font-serif text-lg italic text-[#c5a94e]">
            Swamiye Saranam Ayyappa
          </p>

          <p className="mt-2 text-xs tracking-widest text-[#766d5d]">
            FAITH • DEVOTION • DIVINE BLESSINGS
          </p>

        </div>

      </div>

    </main>
  )
}
