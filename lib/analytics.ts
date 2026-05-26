export interface ClientAnalytics {
  gpu: string | null
  language: string | null
  screenResolution: string | null
  batteryLevel: string | null
  platform: string | null
  touchSupport: boolean | null
  incognito: boolean | null
  localTimezoneOffset: number | null
}

export async function collectClientData(): Promise<ClientAnalytics> {
  const data: ClientAnalytics = {
    gpu: null,
    language: null,
    screenResolution: null,
    batteryLevel: null,
    platform: null,
    touchSupport: null,
    incognito: null,
    localTimezoneOffset: null,
  }

  try {
    // GPU
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          data.gpu = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        }
      }
    } catch {}

    // Language
    try {
      data.language = navigator.language || (navigator as any).userLanguage || null
    } catch {}

    // Screen Resolution
    try {
      data.screenResolution = `${window.screen.width}x${window.screen.height}`
    } catch {}

    // Battery Level
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery()
        data.batteryLevel = `${Math.round(battery.level * 100)}%${battery.charging ? ' (Charging)' : ''}`
      }
    } catch {}

    // Platform
    try {
      data.platform = (navigator as any).userAgentData?.platform || navigator.platform || null
    } catch {}

    // Touch Support
    try {
      data.touchSupport = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
    } catch {}

    // Timezone Offset
    try {
      data.localTimezoneOffset = new Date().getTimezoneOffset()
    } catch {}

    // Incognito Heuristic (Chrome/Firefox/Safari modern checks)
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        // If quota is unusually small (e.g. < 120MB), often indicates incognito in some browsers
        if (estimate.quota && estimate.quota < 120000000) {
          data.incognito = true
        } else {
          data.incognito = false
        }
      }
    } catch {}

  } catch (err) {
    console.error('Analytics collection error:', err)
  }

  return data
}
