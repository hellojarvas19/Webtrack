import { NextRequest, NextResponse } from 'next/server'
import { getTracker } from '@/lib/tracker'

export async function GET() {
  const tracker = getTracker()
  const status = tracker.getStatus()
  return NextResponse.json(status)
}

export async function POST(req: NextRequest) {
  const { action } = await req.json()
  const tracker = getTracker()

  if (action === 'start') {
    await tracker.start()
    return NextResponse.json({ success: true, message: 'Tracker started' })
  } else if (action === 'stop') {
    await tracker.stop()
    return NextResponse.json({ success: true, message: 'Tracker stopped' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
