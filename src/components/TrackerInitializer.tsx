'use client'

import { useEffect, useState } from 'react'

export function TrackerInitializer() {
  const [status, setStatus] = useState<string>('initializing')

  useEffect(() => {
    const initTracker = async () => {
      try {
        // Check status
        const statusRes = await fetch('/api/tracker')
        const statusData = await statusRes.json()

        if (!statusData.isRunning) {
          // Start tracker
          const startRes = await fetch('/api/tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'start' }),
          })
          const startData = await startRes.json()
          setStatus(startData.success ? 'running' : 'error')
          console.log('Tracker started:', startData)
        } else {
          setStatus('running')
          console.log('Tracker already running')
        }
      } catch (error) {
        console.error('Failed to initialize tracker:', error)
        setStatus('error')
      }
    }

    initTracker()
  }, [])

  return null
}
