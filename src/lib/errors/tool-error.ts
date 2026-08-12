export type ToolErrorCode =
  | 'EMPTY_FILE'
  | 'FILE_TOO_LARGE'
  | 'FILE_NAME_TOO_LONG'
  | 'TOO_MANY_FILES'
  | 'BATCH_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'FILE_TYPE_MISMATCH'
  | 'IMAGE_TOO_LARGE'
  | 'DECODE_FAILED'
  | 'ENCODE_FAILED'
  | 'TARGET_SIZE_UNREACHABLE'
  | 'PDF_ENCRYPTED'
  | 'PDF_INVALID'
  | 'REGEX_TIMEOUT'
  | 'WORKER_CRASHED'
  | 'TASK_CANCELLED'
  | 'ZIP_FAILED'
  | 'UNKNOWN_ERROR'

export type ToolStage =
  'validation' | 'decode' | 'transform' | 'encode' | 'archive' | 'worker' | 'download'

export class ToolError extends Error {
  readonly code: ToolErrorCode
  readonly stage?: ToolStage

  constructor(
    code: ToolErrorCode,
    message: string,
    options: { stage?: ToolStage; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'ToolError'
    this.code = code
    this.stage = options.stage
  }
}

export function isToolError(error: unknown): error is ToolError {
  return error instanceof ToolError
}

export function toToolError(
  error: unknown,
  fallbackCode: ToolErrorCode = 'UNKNOWN_ERROR',
): ToolError {
  if (isToolError(error)) return error
  if (error instanceof Error) {
    return new ToolError(fallbackCode, error.message, { cause: error })
  }
  return new ToolError(fallbackCode, 'Unknown tool error', { cause: error })
}
