import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Tracks the number of online presences via Supabase Realtime.
// Falls back gracefully when Supabase is not configured.
export function usePresence(roomName = 'subahi-morning') {
  const [count, setCount] = useState(null)

  useEffect(() => {
    if (!supabase) return

    const channel = supabase.channel(roomName, {
      config: { presence: { key: crypto.randomUUID() } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomName])

  return count
}
