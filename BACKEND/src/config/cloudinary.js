import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export function uploadImage(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: `sri-dharma-shasta/${folder}`, resource_type: 'image' }, (error, result) => {
      if (error) reject(error)
      else resolve({ url: result.secure_url, publicId: result.public_id })
    })
    stream.end(buffer)
  })
}
