import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main' },
  tantriProfileImage: { type: String, default: '' },
  tantriGallery: { type: [String], default: [] },
}, { timestamps: true })
export default mongoose.model('SiteSettings', schema)
