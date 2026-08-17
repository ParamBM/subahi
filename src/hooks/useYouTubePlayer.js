import { useCallback, useEffect, useRef, useState } from 'react'
import { loadYouTubeApi } from '../lib/youtube'

const PLAYER_STATES = { BUFFERING: 3, ENDED: 0, PAUSED: 2, PLAYING: 1 }

export function useYouTubePlayer({ enabled, mountId, onEnded, onError, track }) {
  const playerRef = useRef(null)
  const callbacksRef = useRef({ onEnded, onError })
  const trackRef = useRef(track)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    callbacksRef.current = { onEnded, onError }
  }, [onEnded, onError])



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
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, playsinline: 1, rel: 0 },
          events: {
            onReady: (event) => {
              if (isDisposed) return
              setIsReady(true)
              event.target.cueVideoById(trackRef.current.youtubeId)
            },
            onStateChange: (event) => {
              // 1 = PLAYING
              if (event.data === 1) {
                setHasError(false)
                setIsPlaying(true)
                setIsBuffering(false)
              }
              // 2 = PAUSED
              if (event.data === 2) {
                setIsPlaying(false)
                setIsBuffering(false)
              }
              // 3 = BUFFERING
              if (event.data === 3) {
                setIsPlaying(false)
                setIsBuffering(true)
              }
              // 0 = ENDED
              if (event.data === 0) {
                setIsPlaying(false)
                setIsBuffering(false)
                callbacksRef.current.onEnded()
              }
              // 5 = CUED or -1 = UNSTARTED
              if (event.data === 5 || event.data === -1) {
                setIsBuffering(false)
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
  const loadTrack = useCallback((youtubeId) => playerRef.current?.loadVideoById(youtubeId), [])

  return { currentTime, duration, hasError, isBuffering, isPlaying, isReady, pause, play, loadTrack }
}
