import { useEffect, useState } from 'react'

function getClockParts() {
  const now = new Date()
  const raw = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase()
  // raw is like "02:37 AM" — split on the space to get time and period
  const [timePart, period] = raw.split(' ')
  const [hours, minutes] = timePart.split(':')
  return { hours, minutes, period }
}

export function useClock() {
  const [parts, setParts] = useState(getClockParts)

  useEffect(() => {
    const tick = () => setParts(getClockParts())

    // Align to the next full minute boundary
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000
    const initial = setTimeout(() => {
      tick()
      const interval = setInterval(tick, 60_000)
      return () => clearInterval(interval)
    }, msToNextMinute)

    return () => clearTimeout(initial)
  }, [])

  return parts
}
