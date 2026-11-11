import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true }, name: { type: String, required: true, trim: true, maxlength: 120 },
  price: { type: Number, required: true, min: 0 }, icon: { type: String, default: '🪔' }, desc: { type: String, default: '', maxlength: 2000 },
  cat: { type: String, required: true, trim: true }, includes: { type: [String], default: [] }, img: { type: String, default: null }, active: { type: Boolean, default: true },
}, { timestamps: true })
export default mongoose.model('Product', schema)
