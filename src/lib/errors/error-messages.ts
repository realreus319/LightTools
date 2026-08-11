import type { Locale } from '@/i18n/config'
import type { ToolErrorCode } from './tool-error'

const MESSAGES: Record<Locale, Record<ToolErrorCode, string>> = {
  'zh-CN': {
    EMPTY_FILE: '文件为空，无法处理。',
    FILE_TOO_LARGE: '这个文件超过当前工具允许的大小。',
    TOO_MANY_FILES: '选择的文件数量超过当前工具限制。',
    BATCH_TOO_LARGE: '这批文件的总体积过大，请减少文件后重试。',
    UNSUPPORTED_FORMAT: '当前工具不支持这种文件格式。',
    FILE_TYPE_MISMATCH: '文件扩展名、类型或实际内容不一致，请确认文件来源。',
    IMAGE_TOO_LARGE: '图片像素尺寸过大，继续处理可能导致浏览器内存不足。',
    DECODE_FAILED: '无法读取这个文件，文件可能损坏或格式不受支持。',
    ENCODE_FAILED: '生成结果失败，请调整参数后重试。',
    TARGET_SIZE_UNREACHABLE: '在当前质量和尺寸范围内无法达到目标体积。',
    PDF_ENCRYPTED: '这个 PDF 受密码或权限保护，当前无法处理。',
    PDF_INVALID: '无法读取这个 PDF，文件可能损坏。',
    WORKER_CRASHED: '本地处理进程意外停止，请重试。',
    TASK_CANCELLED: '任务已取消。',
    ZIP_FAILED: '批量打包失败，请重试或单独下载文件。',
    UNKNOWN_ERROR: '处理失败，请重试。',
  },
  en: {
    EMPTY_FILE: 'The file is empty and cannot be processed.',
    FILE_TOO_LARGE: 'This file exceeds the size limit for the current tool.',
    TOO_MANY_FILES: 'Too many files were selected for this tool.',
    BATCH_TOO_LARGE: 'The selected batch is too large. Remove some files and try again.',
    UNSUPPORTED_FORMAT: 'This file format is not supported by the current tool.',
    FILE_TYPE_MISMATCH: 'The extension, declared type, and file contents do not agree.',
    IMAGE_TOO_LARGE: 'The image dimensions are too large and may exhaust browser memory.',
    DECODE_FAILED: 'The file could not be decoded. It may be damaged or unsupported.',
    ENCODE_FAILED: 'The output could not be generated. Adjust the settings and try again.',
    TARGET_SIZE_UNREACHABLE: 'The target size cannot be reached within the available quality and dimension range.',
    PDF_ENCRYPTED: 'This PDF is password or permission protected and cannot be processed.',
    PDF_INVALID: 'The PDF could not be read and may be damaged.',
    WORKER_CRASHED: 'The local processing worker stopped unexpectedly. Please retry.',
    TASK_CANCELLED: 'The task was cancelled.',
    ZIP_FAILED: 'The batch could not be archived. Retry or download files individually.',
    UNKNOWN_ERROR: 'Processing failed. Please try again.',
  },
}

export function getToolErrorMessage(locale: Locale, code: ToolErrorCode): string {
  return MESSAGES[locale][code]
}
