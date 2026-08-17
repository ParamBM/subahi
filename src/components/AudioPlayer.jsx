import { useCallback, useState } from 'react'
import { useYouTubePlayer } from '../hooks/useYouTubePlayer'

const PLAYER_ID = 'subahi-audio-source'

function Icon({ children, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  )
}

function formatTime(seconds) {
  const s = Math.floor(seconds || 0)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Spinning disc — uses the YouTube thumbnail, spins when playing
function Disc({ youtubeId, isPlaying, title }) {
  const thumb = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
  return (
    <div className="disc" data-playing={isPlaying} aria-hidden="true">
      <img src={thumb} alt={title} />
      {/* Centre hole — like a vinyl record */}
      <span className="disc-hole" />
    </div>
  )
}

// 7 bars — inline with the title, right-aligned
function Waveform({ isPlaying }) {
  const bars = [
    { delay: '0ms',   h: 40 },
    { delay: '100ms', h: 75 },
    { delay: '200ms', h: 55 },
    { delay: '300ms', h: 100 },
    { delay: '400ms', h: 60 },
    { delay: '100ms', h: 85 },
    { delay: '200ms', h: 45 },
  ]
  return (
    <span className="waveform" aria-hidden="true" data-playing={isPlaying}>
      {bars.map((b, i) => (
        <span
          key={i}
          className="waveform-bar"
          style={{ '--delay': b.delay, '--max-h': `${b.h}%` }}
        />
      ))}
    </span>
  )
}

export function AudioPlayer({ tracks }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const track = tracks[currentIndex]

  const moveTrack = useCallback(
    (direction) => {
      setCurrentIndex((i) => (i + direction + tracks.length) % tracks.length)
    },
    [tracks.length],
  )

  const { currentTime, duration, hasError, isPlaying, isReady, pause, play } =
    useYouTubePlayer({
      enabled: true,
      mountId: PLAYER_ID,
      onEnded: () => moveTrack(1),
      onError: () => moveTrack(1),
      track,
    })

  const togglePlayback = () => {
    isPlaying ? pause() : play()
  }

  const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0

  return (
    <section className="audio-player" aria-label="Subahi audio player">
      {/* Hidden YouTube mount */}
      <div className="audio-source" aria-hidden="true" id={PLAYER_ID} />

      {/* Spinning disc — leftmost */}
      <Disc youtubeId={track.youtubeId} isPlaying={isPlaying} title={track.title} />

      {/* Track info */}
      <div className="track-info">
        <div className="track-title-row">
          <p className="track-title">{track.title}</p>
          <Waveform isPlaying={isPlaying} />
        </div>
        <p className="track-artist">{track.artist}</p>
      </div>

      {/* Progress + timestamps */}
      <div className="progress-wrap">
        <div className="progress-track">
          <span className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="time-row" aria-hidden="true">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="audio-controls">
        <button
          aria-label="Previous song"
          disabled={!isReady}
          onClick={() => moveTrack(-1)}
          type="button"
        >
          <Icon size={18}><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></Icon>
        </button>

        <button
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="main-control"
          onClick={togglePlayback}
          type="button"
        >
          <Icon size={20}>
            {isPlaying
              ? <path d="M7 5h3v14H7zm7 0h3v14h-3z" />
              : <path d="m8 5 11 7-11 7z" />}
          </Icon>
        </button>

        <button
          aria-label="Next song"
          disabled={!isReady}
          onClick={() => moveTrack(1)}
          type="button"
        >
          <Icon size={18}><path d="M16 6h2v12h-2zm-2 6L5.5 6v12z" /></Icon>
        </button>
      </div>

      {hasError && <p className="player-status">Skipping…</p>}
    </section>
  )
}
