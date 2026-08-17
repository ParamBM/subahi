import { useCallback, useEffect, useRef, useState } from 'react'
import { loadYouTubeApi } from '../lib/youtube'

const PLAYER_STATES = { BUFFERING: 3, ENDED: 0, PAUSED: 2, PLAYING: 1 }

export function useYouTubePlayer({ enabled, mountId, onEnded, onError, track }) {
  const playerRef = useRef(null)
  const callbacksRef = useRef({ onEnded, onError })
  const trackRef = useRef(track)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    callbacksRef.current = { onEnded, onError }
  }, [onEnded, onError])

  useEffect(() => {
    trackRef.current = track
  }, [track])

  useEffect(() => {
    if (!enabled) return undefined
    let isDisposed = false

    loadYouTubeApi()
      .then((YT) => {
        if (isDisposed) return

        playerRef.current = new YT.Player(mountId, {
          height: '1',
          width: '1',
          videoId: trackRef.current.youtubeId,
          playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, playsinline: 1, rel: 0 },
          events: {
            onReady: (event) => {
              if (isDisposed) return
              setIsReady(true)
              event.target.loadVideoById(trackRef.current.youtubeId)
            },
            onStateChange: (event) => {
              if (event.data === PLAYER_STATES.PLAYING) {
                setHasError(false)
                setIsPlaying(true)
              }
              if (event.data === PLAYER_STATES.PAUSED) setIsPlaying(false)
              if (event.data === PLAYER_STATES.BUFFERING) {
                setIsPlaying(false)
                setCurrentTime(0)
                setDuration(0)
              }
              if (event.data === PLAYER_STATES.ENDED) {
                setIsPlaying(false)
                callbacksRef.current.onEnded()
              }
            },
            onError: () => {
              setHasError(true)
              setIsPlaying(false)
              callbacksRef.current.onError()
            },
          },
        })
      })
      .catch(() => {
        if (!isDisposed) setHasError(true)
      })

    return () => {
      isDisposed = true
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [enabled, mountId])

  useEffect(() => {
    if (!isReady || !playerRef.current || !track?.youtubeId) return
    playerRef.current.loadVideoById(track.youtubeId)
  }, [isReady, track])

  useEffect(() => {
    if (!isReady) return undefined
    const interval = window.setInterval(() => {
      const player = playerRef.current
      if (!player) return
      setCurrentTime(player.getCurrentTime?.() || 0)
      setDuration(player.getDuration?.() || 0)
    }, 500)

    return () => window.clearInterval(interval)
  }, [isReady])

  const play = useCallback(() => playerRef.current?.playVideo(), [])
  const pause = useCallback(() => playerRef.current?.pauseVideo(), [])

  return { currentTime, duration, hasError, isPlaying, isReady, pause, play }
}
