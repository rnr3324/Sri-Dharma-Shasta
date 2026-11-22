import 'dotenv/config'
import { randomBytes } from 'node:crypto'
const port = Number(process.env.PORT || 4000)
const shippingFee = Number(process.env.SHIPPING_FEE ?? 60)
const freeShippingAbove = Number(process.env.FREE_SHIPPING_ABOVE ?? 999)
if (!Number.isFinite(shippingFee) || shippingFee < 0 || !Number.isFinite(freeShippingAbove) || freeShippingAbove < 0) throw new Error('SHIPPING_FEE and FREE_SHIPPING_ABOVE must be valid non-negative numbers')
if (process.env.NODE_ENV === 'production' && (!process.env.MONGODB_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.CLIENT_URL)) throw new Error('Set MONGODB_URI, a 32+ character JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, Cloudinary credentials, and CLIENT_URL before production start')
if (process.env.NODE_ENV !== 'production') {
  process.env.JWT_SECRET ||= randomBytes(32).toString('hex')
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH in BACKEND/.env before starting the API')
}
const { default: app } = await import('./app.js')
const { connectDB } = await import('./config/db.js')
await connectDB()
if (process.env.NODE_ENV === 'production' && process.env.COUPON_CODE) {
  const code = process.env.COUPON_CODE.trim().toUpperCase()
  const percent = Number(process.env.COUPON_PERCENT || 10)
  if (!/^[A-Z0-9_-]{3,24}$/.test(code) || !Number.isInteger(percent) || percent < 1 || percent > 90) throw new Error('COUPON_CODE must be 3–24 letters/numbers/hyphens/underscores and COUPON_PERCENT must be 1–90')
  const { default: Coupon } = await import('./models/Coupon.js')
  await Coupon.updateOne({ code }, { $setOnInsert: { code, percent, active: true } }, { upsert: true })
}
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'
app.listen(port, host, () => console.log(`Sri Dharma Shasta API listening on http://${host}:${port}`))
