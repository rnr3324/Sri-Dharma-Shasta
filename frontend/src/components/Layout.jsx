import { Navigate, Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useApp } from '../context/AppContext'
import { CONFIG } from '../config'
import { waLink } from '../utils/helpers'

export default function Layout() {
  const { lang } = useApp()
  if (!lang) return <Navigate to="/language" replace />
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <a href={waLink('Swamiye Saranam')} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${CONFIG.phone}`}
        className="fixed bottom-4 right-4 z-30 rounded-full bg-[#25D366] px-4 py-2 font-sans text-sm font-semibold text-white shadow-lg">💬 WhatsApp</a>
    </>
  )
}
