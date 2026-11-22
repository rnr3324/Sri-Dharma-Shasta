import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 3, maxlength: 24, match: /^[A-Z0-9_-]+$/ },
  percent: { type: Number, required: true, min: 1, max: 90 },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Coupon', schema)
