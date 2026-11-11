import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
const port = Number(process.env.PORT || 4000)
if (process.env.NODE_ENV === 'production' && (!process.env.MONGODB_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || !process.env.ADMIN_PASSWORD_HASH || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) throw new Error('Set MONGODB_URI, a 32+ character JWT_SECRET, ADMIN_PASSWORD_HASH, and Cloudinary credentials before production start')
if (process.env.NODE_ENV !== 'production') {
  process.env.JWT_SECRET ||= randomBytes(32).toString('hex')
  process.env.ADMIN_EMAIL ||= 'admin@localhost'
  process.env.ADMIN_PASSWORD_HASH ||= await bcrypt.hash('SdsLocalAdmin!2026', 10)
}
const { default: app } = await import('./app.js')
const { connectDB } = await import('./config/db.js')
await connectDB()
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'
app.listen(port, host, () => console.log(`Sri Dharma Shasta API listening on http://${host}:${port}`))
