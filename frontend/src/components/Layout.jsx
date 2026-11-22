import { Navigate, Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useApp } from '../context/AppContext'
import { CONFIG } from '../config'
import { waLink } from '../utils/helpers'
import { WhatsAppIcon } from './Icons'

export default function Layout() {
  const { lang } = useApp()
  if (!lang) return <Navigate to="/language" replace />
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <a href={waLink('Swamiye Saranam')} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${CONFIG.phone}`}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-[#25D366] font-sans text-sm font-semibold text-white shadow-lg sm:h-auto sm:w-auto sm:px-4 sm:py-2"><WhatsAppIcon className="h-6 w-6 shrink-0"/><span className="sr-only sm:not-sr-only">WhatsApp</span></a>
    </>
  )
}
