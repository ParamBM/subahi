const API_URL = 'https://www.youtube.com/iframe_api'
const SCRIPT_ID = 'youtube-iframe-api'
let apiPromise

export function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID)
    const previousReadyCallback = window.onYouTubeIframeAPIReady
    const timeout = window.setTimeout(() => {
      reject(new Error('YouTube took too long to load.'))
    }, 12000)

    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout)
      previousReadyCallback?.()
      resolve(window.YT)
    }

    if (existingScript) return

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = API_URL
    script.async = true
    script.onerror = () => {
      window.clearTimeout(timeout)
      reject(new Error('YouTube could not load.'))
    }
    document.head.appendChild(script)
  }).catch((error) => {
    apiPromise = undefined
    throw error
  })

  return apiPromise
}
