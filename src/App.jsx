import { useState } from 'react'
import { AudioPlayer } from './components/AudioPlayer'
import { ShareButton } from './components/ShareButton'
import { playlist } from './data/playlist'
import { useClock } from './hooks/useClock'
import { usePresence } from './hooks/usePresence'
import './App.css'

function formatPresence(count) {
  if (count === null) return null
  if (count === 0) return "No one's remembering"
  if (count === 1) return '1 person remembering'
  return `${count.toLocaleString()} people remembering`
}

function App() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const presenceCount = usePresence('subahi-morning')
  const clock = useClock()

  return (
    <main className="subahi">
      {/* Full-bleed artwork */}
      <img
        className={`artwork ${imageLoaded ? 'loaded' : ''}`}
        src="/background.webp"
        alt="A warm painted street scene from an Indian morning"
        onLoad={() => setImageLoaded(true)}
      />

      {/* Gradient scrim */}
      <div className="scrim" aria-hidden="true" />

      {/* Top bar: clock | presence | share */}
      <div className="topbar">
        <span className="topbar-clock">
          {clock.hours}
          <span className="clock-colon">:</span>
          {clock.minutes}
          <span className="clock-period">&thinsp;{clock.period}</span>
        </span>

        <div className="presence-counter" aria-live="polite">
          <span className="presence-dot" aria-hidden="true">
            <span className="presence-dot-ping" />
            <span className="presence-dot-core" />
          </span>
          <span>{formatPresence(presenceCount)}</span>
        </div>

        <ShareButton />
      </div>

      {/* Hero — pushed lower so artwork breathes above */}
      <div className="hero">
        <p className="brand">SUBAHI</p>
        <h1 className="headline">9XM Wali<br />Subah</h1>
        <p className="tagline">One more song before school.</p>
      </div>

      {/* Bottom player */}
      <div className="stage">
        <AudioPlayer tracks={playlist} />
      </div>
    </main>
  )
}

export default App
