import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { randomUUID } from 'node:crypto'
import multer from 'multer'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import SiteSettings from '../models/SiteSettings.js'
import { uploadImage } from '../config/cloudinary.js'
import { usingLocalStore } from '../config/db.js'
import { archiveLocalOrder, archiveLocalProduct, createLocalProduct, localOverview, localProducts, localSite, newLocalOrder, saveLocalImage, saveLocalSite, setLocalOrderStatus, updateLocalProduct } from '../config/localStore.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
const imageUrl = (value) => {
  if (!value) return null
  try {
    const parsed = new URL(String(value))
    if (parsed.protocol !== 'https:' && !(usingLocalStore && parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname))) throw new Error()
    return parsed.href
  } catch { throw Object.assign(new Error('Product image URLs must be valid HTTPS links'), { status: 400 }) }
}
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false })
const checkoutLimit = rateLimit({ windowMs: 60_000, limit: 8, standardHeaders: true, legacyHeaders: false })
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 10 }, fileFilter: (_req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true)
  else cb(Object.assign(new Error('Use a JPG, PNG, or WebP image.'), { status: 400 }))
} })
const isImage = (buffer) => (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) || buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP')
router.get('/health', (_req, res) => res.json({ status: 'ok' }))
router.get('/products', async (_req, res) => res.json(usingLocalStore ? localProducts() : await Product.find({ active: true }).sort({ id: 1 }).lean()))
router.get('/site', async (_req, res) => {
  if (usingLocalStore) return res.json(localSite())
  const site = await SiteSettings.findOne({ key: 'main' }).lean()
  res.json({ tantriProfileImage: site?.tantriProfileImage || 'tantri-placeholder.svg', tantriGallery: site?.tantriGallery || [] })
})
router.post('/admin/login', loginLimit, async (req, res) => {
  const { email, password } = req.body || {}
  const adminEmail = process.env.ADMIN_EMAIL
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!adminEmail || !hash || !process.env.JWT_SECRET) return res.status(503).json({ message: 'Admin credentials are not configured on the server' })
  const valid = String(email || '').toLowerCase() === adminEmail.toLowerCase() && await bcrypt.compare(String(password || ''), hash)
  if (!valid) return res.status(401).json({ message: 'Email or password is incorrect' })
  res.json({ token: jwt.sign({ email: adminEmail, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' }) })
})
router.post('/orders', checkoutLimit, async (req, res) => {
  const { customer, items, pay, utr } = req.body || {}
  if (!customer?.name?.trim() || customer.name.length > 120 || !/^[0-9+\s-]{10,14}$/.test(customer.phone || '') || !/^[1-9][0-9]{5}$/.test(customer.pin || '') || !/^\S+@\S+\.\S+$/.test(customer.email || '') || customer.email.length > 254 || !customer.address?.trim() || customer.address.length > 600 || !Array.isArray(items) || !items.length || items.length > 30 || !['upi', 'cod'].includes(pay) || (pay === 'upi' && !/^[0-9]{12}$/.test(utr || ''))) return res.status(400).json({ message: 'Please provide valid customer, item, and payment details' })
  const ids = items.map((item) => Number(item.id))
  const products = usingLocalStore ? localProducts().filter((product) => ids.includes(product.id)) : await Product.find({ id: { $in: ids }, active: true }).lean()
  if (products.length !== new Set(ids).size) return res.status(400).json({ message: 'One or more products are unavailable' })
  const lines = items.map((item) => { const p = products.find((x) => x.id === Number(item.id)); const qty = Math.min(20, Math.max(1, Number(item.qty) || 1)); return { id: p.id, name: p.name, price: p.price, qty } })
  const subtotal = lines.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discount = req.body.coupon === process.env.COUPON_CODE && process.env.COUPON_CODE ? Math.round(subtotal * 0.1) : 0
  const shipping = subtotal >= 999 ? 0 : 60
  const orderData = { ref: `SDS${randomUUID().slice(0, 8).toUpperCase()}`, customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim(), address: customer.address.trim(), pin: customer.pin }, items: lines, subtotal, discount, shipping, total: subtotal - discount + shipping, pay, utr: pay === 'upi' ? String(utr || '').slice(0, 40) : '', statusHistory: [{ status: 'pending', at: new Date() }] }
  const order = usingLocalStore ? await newLocalOrder(orderData) : await Order.create(orderData)
  res.status(201).json({ ref: order.ref, total: order.total, status: order.status, createdAt: order.createdAt })
})
router.get('/admin/overview', requireAdmin, async (_req, res) => {
  if (usingLocalStore) return res.json(localOverview())
  const [products, allProducts, orders, sales, recent] = await Promise.all([Product.countDocuments({ active: true }), Product.find({ active: true }).sort({ id: 1 }).lean(), Order.countDocuments({ archivedAt: null }), Order.aggregate([{ $match: { archivedAt: null, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]), Order.find({ archivedAt: null }).sort({ createdAt: -1 }).limit(100).lean()])
  res.json({ products, allProducts, orders, sales: sales[0]?.total || 0, recent })
})
router.post('/admin/uploads/:kind', requireAdmin, (req, res, next) => {
  if (!['products', 'tantri'].includes(req.params.kind)) return res.status(400).json({ message: 'Choose products or tantri image type' })
  if (!usingLocalStore && (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) return res.status(503).json({ message: 'Configure Cloudinary credentials on the backend to enable device uploads' })
  imageUpload.array('images', req.params.kind === 'products' ? 1 : 10)(req, res, next)
}, async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'Select an image to upload' })
  if (req.files.some((file) => !isImage(file.buffer))) return res.status(400).json({ message: 'The selected file is not a valid JPG, PNG, or WebP image' })
  const images = usingLocalStore
    ? await Promise.all(req.files.map(async (file) => `${req.protocol}://${req.get('host')}${await saveLocalImage(file.buffer, file.mimetype, req.params.kind)}`))
    : (await Promise.all(req.files.map((file) => uploadImage(file.buffer, req.params.kind)))).map((file) => file.url)
  res.status(201).json({ images })
})
router.put('/admin/site', requireAdmin, async (req, res) => {
  const { tantriProfileImage, tantriGallery } = req.body || {}
  const validImage = (url) => {
    if (typeof url !== 'string') return false
    if (url === 'tantri-placeholder.svg' || url.startsWith('https://res.cloudinary.com/')) return true
    try {
      const image = new URL(url)
      return usingLocalStore && ['localhost', '127.0.0.1'].includes(image.hostname) && image.port === String(process.env.PORT || 4000) && image.pathname.startsWith('/uploads/')
    } catch { return false }
  }
  if (!validImage(tantriProfileImage) || !Array.isArray(tantriGallery) || tantriGallery.length > 20 || tantriGallery.some((url) => !validImage(url))) return res.status(400).json({ message: 'Use uploaded Cloudinary images; gallery limit is 20 photos' })
  const site = usingLocalStore ? await saveLocalSite({ tantriProfileImage, tantriGallery }) : await SiteSettings.findOneAndUpdate({ key: 'main' }, { tantriProfileImage, tantriGallery }, { new: true, upsert: true, runValidators: true })
  res.json({ tantriProfileImage: site.tantriProfileImage, tantriGallery: site.tantriGallery })
})
router.post('/admin/products', requireAdmin, async (req, res) => {
  const p = req.body || {}
  if (!p.name?.trim() || !p.cat?.trim() || !Number.isFinite(Number(p.price)) || Number(p.price) < 0) return res.status(400).json({ message: 'Product name, category, and a valid price are required' })
  const product = { name: p.name.trim(), price: Number(p.price), cat: p.cat.trim(), icon: String(p.icon || '🪔').slice(0, 20), desc: String(p.desc || '').slice(0, 2000), img: imageUrl(p.img), includes: Array.isArray(p.includes) ? p.includes.slice(0, 30).map((x) => String(x).slice(0, 160)) : [] }
  if (usingLocalStore) return res.status(201).json(await createLocalProduct(product))
  const max = await Product.findOne().sort({ id: -1 }).select('id').lean()
  res.status(201).json(await Product.create({ ...product, id: (max?.id || 0) + 1, active: true }))
})
router.patch('/admin/products/:id', requireAdmin, async (req, res) => {
  const body = req.body || {}
  const patch = {}
  if (body.name !== undefined) patch.name = String(body.name).trim().slice(0, 120)
  if (body.price !== undefined) patch.price = Number(body.price)
  if (body.cat !== undefined) patch.cat = String(body.cat).trim().slice(0, 80)
  if (body.icon !== undefined) patch.icon = String(body.icon).slice(0, 20)
  if (body.desc !== undefined) patch.desc = String(body.desc).slice(0, 2000)
  if (body.img !== undefined) patch.img = imageUrl(body.img)
  if (body.includes !== undefined) patch.includes = Array.isArray(body.includes) ? body.includes.slice(0, 30).map((x) => String(x).slice(0, 160)) : []
  const p = usingLocalStore ? await updateLocalProduct(Number(req.params.id), patch) : await Product.findOneAndUpdate({ id: Number(req.params.id) }, patch, { new: true, runValidators: true })
  p ? res.json(p) : res.status(404).json({ message: 'Product not found' })
})
router.delete('/admin/products/:id', requireAdmin, async (req, res) => {
  const p = usingLocalStore ? await archiveLocalProduct(Number(req.params.id)) : await Product.findOneAndUpdate({ id: Number(req.params.id) }, { active: false }, { new: true })
  p ? res.json({ ok: true }) : res.status(404).json({ message: 'Product not found' })
})
router.patch('/admin/orders/:id', requireAdmin, async (req, res) => {
  const statuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']
  if (!statuses.includes(req.body?.status)) return res.status(400).json({ message: 'Invalid order status' })
  const now = new Date()
  const order = usingLocalStore ? await setLocalOrderStatus(req.params.id, req.body.status) : await Order.findOneAndUpdate({ _id: req.params.id, archivedAt: null }, { $set: { status: req.body.status }, $push: { statusHistory: { status: req.body.status, at: now } } }, { new: true, runValidators: true })
  order ? res.json(order) : res.status(404).json({ message: 'Order not found' })
})
router.delete('/admin/orders/:id', requireAdmin, async (req, res) => {
  const order = usingLocalStore ? await archiveLocalOrder(req.params.id) : await Order.findOneAndUpdate({ _id: req.params.id, status: { $in: ['completed', 'cancelled'] }, archivedAt: null }, { $set: { archivedAt: new Date() } }, { new: true })
  order ? res.json({ ok: true }) : res.status(400).json({ message: 'Only completed or cancelled orders can be removed from the active order list' })
})
export default router
