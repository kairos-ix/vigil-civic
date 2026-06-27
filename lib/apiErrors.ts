import { NextResponse } from 'next/server'

export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  return (
    error.name === 'MongooseServerSelectionError' ||
    error.message.includes('Could not connect to any servers in your MongoDB')
  )
}

export function databaseUnavailableResponse() {
  return NextResponse.json(
    {
      error:
        'Database unavailable. Check MongoDB Atlas network access and try again.',
    },
    { status: 503 }
  )
}
