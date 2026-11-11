import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import api from './routes/api.js'
const app = express()
const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const origins = [process.env.CLIENT_URL || 'http://localhost:5173', ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'] : [])].flatMap((x) => x.split(',')).map((x) => x.trim())
app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: origins, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }))
app.use(express.json({ limit: '100kb' }))
if (process.env.NODE_ENV !== 'production') app.use('/uploads', express.static(path.join(backendDir, 'uploads'), { fallthrough: false, maxAge: '1d' }))
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }), api)
app.use((err, _req, res, _next) => { console.error(err); const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500); res.status(status).json({ message: process.env.NODE_ENV === 'production' && status === 500 ? 'Unexpected server error' : err.message }) })
export default app
