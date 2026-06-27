import { NextResponse } from 'next/server'

export function activeIssueFilter() {
  return { deletedAt: null }
}

export function removedIssueResponse() {
  return NextResponse.json(
    { error: 'This issue was removed' },
    { status: 410 }
  )
}
