import 'dotenv/config'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import { PRODUCTS } from '../../../frontend/src/data/products.js'
await mongoose.connect(process.env.MONGODB_URI)
for (const product of PRODUCTS) await Product.updateOne({ id: product.id }, { $setOnInsert: product }, { upsert: true })
console.log(`Catalog ready (${PRODUCTS.length} products)`)
await mongoose.disconnect()
