import type { Locale } from './config'

type ToolActionsCopy = {
  share: string
  copied: string
  privacyTrigger: string
  privacyTitle: string
  privacyDescription: string
  privacyPoints: readonly string[]
  close: string
}

const COPY: Record<Locale, ToolActionsCopy> = {
  'zh-CN': {
    share: '复制页面链接',
    copied: '链接已复制',
    privacyTrigger: '本地处理说明',
    privacyTitle: '这个工具如何处理你的数据',
    privacyDescription: '分享链接只包含工具页面地址，不会把文件名、文本或工具输入写进 URL。',
    privacyPoints: [
      '文件类任务默认只在当前浏览器会话中处理，不上传文件内容。',
      '重型图片与 PDF 任务按需使用 Worker / WASM，离开页面后释放临时资源。',
      '收藏、最近使用和参数预设只保存非敏感设置，不保存文件、正文或完整 JWT。',
    ],
    close: '关闭',
  },
  en: {
    share: 'Copy page link',
    copied: 'Link copied',
    privacyTrigger: 'Local processing details',
    privacyTitle: 'How this tool handles your data',
    privacyDescription:
      'Shared links contain only the tool page address; filenames, text, and tool inputs are not placed in the URL.',
    privacyPoints: [
      'File tasks are processed in the current browser session by default and file contents are not uploaded.',
      'Heavy image and PDF work loads Worker / WASM only when needed and releases temporary resources when the page closes.',
      'Favorites, recent tools, and presets store only non-sensitive settings, never files, content, or complete JWTs.',
    ],
    close: 'Close',
  },
}

export function getToolActionsCopy(locale: Locale): ToolActionsCopy {
  return COPY[locale]
}
