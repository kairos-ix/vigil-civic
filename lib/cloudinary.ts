import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
  base64: string,
  mimeType = 'image/jpeg',
  folder = 'vigil/issues'
): Promise<string> {
  const result = await cloudinary.uploader.upload(
    `data:${mimeType};base64,${base64.replace(/^data:[^;]+;base64,/, '')}`,
    {
      folder,
      transformation: [
        { width: 1200, height: 900, crop: 'limit' },
        { quality: 'auto' },
        { format: 'webp' },
      ],
    }
  )
  return result.secure_url
}

export default cloudinary
