export type AnalyticsEvent =
  | {
      name: 'tool_open'
      toolSlug: string
      category: string
    }
  | {
      name: 'tool_complete'
      toolSlug: string
      durationMs?: number
      inputBytes?: number
      outputBytes?: number
    }
  | {
      name: 'tool_error'
      toolSlug: string
      errorCode: string
      stage?: string
    }
  | {
      name: 'web_vital'
      metric: string
      value: number
      rating?: string
      navigationType?: string
    }

export interface AnalyticsAdapter {
  track(event: AnalyticsEvent): void | Promise<void>
}

let activeAdapter: AnalyticsAdapter | undefined

export function setAnalyticsAdapter(adapter: AnalyticsAdapter | undefined): void {
  activeAdapter = adapter
}

export function trackAnalyticsEvent(event: AnalyticsEvent): void {
  try {
    void activeAdapter?.track(event)
  } catch {
    // 遥测失败不能影响本地工具主流程。
  }
}
