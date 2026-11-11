import mongoose from 'mongoose'
import { initLocalStore } from './localStore.js'

export const usingLocalStore = !process.env.MONGODB_URI && process.env.NODE_ENV !== 'production'

export async function connectDB() {
  if (usingLocalStore) {
    await initLocalStore()
    console.warn('MongoDB is not configured: using the local development JSON store in BACKEND/data/store.json')
    return
  }
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required in production')
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')
}
