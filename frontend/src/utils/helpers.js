import { useNavigate } from 'react-router-dom'
import { CONFIG } from '../config'

export const asset = (p) => /^https?:\/\//i.test(p || '') ? p : `${import.meta.env.BASE_URL}${p}`
export const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`
export const upiLink = (amount) =>
  `upi://pay?pa=${CONFIG.upiId}&pn=${encodeURIComponent(CONFIG.upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Sri Dharma Shasta order')}`

// navigate and optionally scroll to an element id
export function useGo() {
  const nav = useNavigate()
  return (path, id) => {
    nav(path)
    setTimeout(() => (id ? document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) : window.scrollTo(0, 0)), 80)
  }
}
