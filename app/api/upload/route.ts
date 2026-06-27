import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

const IMAGE_SIGNATURES: Record<string, number[]> = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
}

// WebP has RIFF header (4 bytes) + file size (4 variable bytes) + WEBP (4 bytes)
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46]
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50]

function validateImageMagicBytes(bytes: Buffer): boolean {
  const header = Array.from(bytes.slice(0, 12))

  // Check standard signatures (jpeg, png, gif)
  for (const sig of Object.values(IMAGE_SIGNATURES)) {
    if (header.length >= sig.length && sig.every((b, i) => header[i] === b)) {
      return true
    }
  }

  // Check WebP: bytes 0-3 must be "RIFF" and bytes 8-11 must be "WEBP"
  if (
    header.length >= 12 &&
    WEBP_RIFF.every((b, i) => header[i] === b) &&
    WEBP_MARKER.every((b, i) => header[i + 8] === b)
  ) {
    return true
  }

  return false
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be less than 5MB' },
        { status: 400 }
      )
    }

    if (!validateImageMagicBytes(buffer)) {
      return NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      )
    }

    const base64 = buffer.toString('base64')

    const url = await uploadImage(base64)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
