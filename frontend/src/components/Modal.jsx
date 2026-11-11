import { useEffect } from 'react'
export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    const f = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="relative max-h-[88vh] w-full max-w-lg overflow-auto rounded-2xl border border-gold bg-coal p-6">
        <button aria-label="Close" onClick={onClose} className="absolute right-3 top-2 text-3xl text-gold">×</button>
        {children}
      </div>
    </div>
  )
}
