import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { PRODUCTS } from '../../../frontend/src/data/products.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../')
const dataDir = path.join(root, 'data')
const dataFile = path.join(dataDir, 'store.json')
const profile = 'tantri-placeholder.svg'
let state
let pending = Promise.resolve()

export async function initLocalStore() {
  await mkdir(dataDir, { recursive: true })
  try { state = JSON.parse(await readFile(dataFile, 'utf8')) }
  catch {
    state = { products: PRODUCTS.map((p) => ({ ...p, active: true })), orders: [], site: { tantriProfileImage: profile, tantriGallery: [] } }
    await persist()
  }
  if (state.site?.tantriProfileImage === 'https://res.cloudinary.com/nemhlaod/image/upload/v1793177746/Gemini_Generated_Image_jlemghjlemghjlem.png') {
    state.site.tantriProfileImage = profile
    await persist()
  }
  if (state.site?.tantriProfileImage === 'hero-ayyappa.jpg') {
    state.site.tantriProfileImage = profile
    await persist()
  }
}
const persist = async () => {
  const tmp = `${dataFile}.${process.pid}.tmp`
  const contents = JSON.stringify(state, null, 2)
  await writeFile(tmp, contents, 'utf8')
  try { await rename(tmp, dataFile) }
  catch (error) {
    if (!['EPERM', 'EEXIST', 'ENOTEMPTY'].includes(error.code)) throw error
    await writeFile(dataFile, contents, 'utf8')
    await unlink(tmp).catch(() => {})
  }
}
const mutate = (fn) => {
  const job = pending.then(async () => { const result = fn(); await persist(); return result })
  pending = job.catch(() => {})
  return job
}
export const localProducts = () => state.products.filter((p) => p.active).sort((a, b) => a.id - b.id)
export const localSite = () => state.site
export const saveLocalSite = (site) => mutate(() => { state.site = site; return state.site })
export const createLocalProduct = (product) => mutate(() => { const id = Math.max(0, ...state.products.map((p) => p.id)) + 1; const created = { ...product, id, active: true }; state.products.push(created); return created })
export const updateLocalProduct = (id, patch) => mutate(() => { const p = state.products.find((x) => x.id === id && x.active); if (!p) return null; Object.assign(p, patch); return p })
export const archiveLocalProduct = (id) => mutate(() => { const p = state.products.find((x) => x.id === id && x.active); if (!p) return false; p.active = false; return true })
export const newLocalOrder = (payload) => mutate(() => { const now = new Date().toISOString(); const order = { ...payload, _id: randomUUID(), createdAt: now, updatedAt: now, status: 'pending', statusHistory: [{ status: 'pending', at: now }], archivedAt: null }; state.orders.unshift(order); return order })
export const localOverview = () => { const activeOrders = state.orders.filter((o) => !o.archivedAt); return { products: state.products.filter((p) => p.active).length, allProducts: localProducts(), orders: activeOrders.length, sales: activeOrders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0), recent: activeOrders.slice(0, 100) } }
export const setLocalOrderStatus = (id, status) => mutate(() => { const order = state.orders.find((o) => o._id === id && !o.archivedAt); if (!order) return false; const now = new Date().toISOString(); order.status = status; order.updatedAt = now; order.statusHistory ||= []; order.statusHistory.push({ status, at: now }); return true })
export const archiveLocalOrder = (id) => mutate(() => { const order = state.orders.find((o) => o._id === id && !o.archivedAt); if (!order || !['completed', 'cancelled'].includes(order.status)) return false; order.archivedAt = new Date().toISOString(); return true })
export const saveLocalImage = async (buffer, mimetype, kind) => {
  const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[mimetype]
  const dir = path.join(root, 'uploads', kind)
  await mkdir(dir, { recursive: true })
  const name = `${randomUUID()}${ext}`
  await writeFile(path.join(dir, name), buffer, { flag: 'wx' })
  return `/uploads/${kind}/${name}`
}
