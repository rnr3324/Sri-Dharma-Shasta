import Modal from './Modal'
import ProductImage from './ProductImage'
import { useApp } from '../context/AppContext'
import { waLink } from '../utils/helpers'

export default function ProductModal({ p, onClose }) {
  const { t, add } = useApp()
  if (!p) return null
  return (
    <Modal open onClose={onClose}>
      <div className="overflow-hidden rounded-xl"><ProductImage p={p} h={170} /></div>
      <h3 className="mb-1 mt-4 text-xl">{p.name}</h3>
      <small className="text-mute">{p.cat}</small>
      <p className="my-1 font-display text-gold2">₹{p.price}</p>
      <p>{p.desc}</p>
      {p.includes.length > 0 && (
        <>
          <b className="text-gold2">Kit includes</b>
          <ul className="mb-3 list-disc pl-5 text-[#e2d6bc]">{p.includes.map((i) => <li key={i}>{i}</li>)}</ul>
        </>
      )}
      <small className="mb-3 block text-sm text-green-300">● In stock · ships in 2–3 days · free delivery above ₹999</small>
      <div className="flex flex-wrap gap-3">
        <button className="btn" onClick={() => { add(p.id); onClose() }}>{t('Add to Cart')}</button>
        <a className="ghost" target="_blank" rel="noopener noreferrer" href={waLink(`Namaste, I have a question about: ${p.name}`)}>Ask on WhatsApp</a>
      </div>
    </Modal>
  )
}
