import { useState } from 'react'

const shareText = 'One more song before school. Listen to 9XM WALI SUBAH on SUBAHI.'

export function ShareButton() {
  const [label, setLabel] = useState('Share ↗')

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLabel('Copied!')
      window.setTimeout(() => setLabel('Share ↗'), 2200)
    } catch {
      setLabel('Copy link')
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SUBAHI — 9XM WALI SUBAH', text: shareText, url: window.location.href })
        return
      } catch (error) {
        if (error.name === 'AbortError') return
      }
    }
    copyLink()
  }

  return (
    <button className="share-button" onClick={share} type="button">
      {label}
    </button>
  )
}
