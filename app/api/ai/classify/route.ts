import { NextRequest, NextResponse } from 'next/server'
import { classifyIssueImage } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 is required' },
        { status: 400 }
      )
    }

    const result = await classifyIssueImage(imageBase64, mimeType || 'image/jpeg')

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI classify error:', error)
    return NextResponse.json(
      { error: 'Classification failed' },
      { status: 500 }
    )
  }
}
