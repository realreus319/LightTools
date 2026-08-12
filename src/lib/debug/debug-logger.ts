export type SafeDebugFields = {
  taskId?: string
  stage?: string
  status?: string
  codec?: string
  durationMs?: number
  inputBytes?: number
  outputBytes?: number
  progress?: number
}

export function createDebugLogger(namespace: string) {
  return {
    log(event: string, fields: SafeDebugFields = {}) {
      if (process.env.NODE_ENV === 'production') return
      console.debug(`[LightTools:${namespace}] ${event}`, fields)
    },
  }
}
