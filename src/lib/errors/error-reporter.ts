import type { ToolErrorCode, ToolStage } from './tool-error'

export type SafeErrorReport = {
  code: ToolErrorCode
  stage?: ToolStage
  toolSlug?: string
  worker?: boolean
}

export interface ErrorReporterAdapter {
  report(event: SafeErrorReport): void | Promise<void>
}

let activeAdapter: ErrorReporterAdapter | undefined

export function setErrorReporterAdapter(adapter: ErrorReporterAdapter | undefined): void {
  activeAdapter = adapter
}

export function reportSafeError(event: SafeErrorReport): void {
  try {
    void activeAdapter?.report(event)
  } catch {
    // 错误上报自身失败时保持静默，避免覆盖原始工具错误。
  }
}
