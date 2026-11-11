import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  ref: { type: String, unique: true }, customer: { name: String, phone: String, email: String, address: String, pin: String },
  items: [{ id: Number, name: String, price: Number, qty: Number }], subtotal: Number, discount: Number, shipping: Number, total: Number,
  pay: { type: String, enum: ['upi', 'cod'] }, utr: String, status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'], default: 'pending' },
  statusHistory: [{ status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'] }, at: { type: Date, default: Date.now } }],
  archivedAt: { type: Date, default: null },
}, { timestamps: true })
export default mongoose.model('Order', schema)
