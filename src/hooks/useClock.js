import { useEffect, useState } from 'react'

export function useClock() {
  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toUpperCase()
  })

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).toUpperCase(),
      )
    }

    // Align to the next full minute boundary
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000
    const initial = setTimeout(() => {
      tick()
      const interval = setInterval(tick, 60_000)
      return () => clearInterval(interval)
    }, msToNextMinute)

    return () => clearTimeout(initial)
  }, [])

  return time
}
