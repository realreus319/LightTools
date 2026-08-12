import type { Locale } from '@/i18n/config'

export type ImageTransformMode = 'convert' | 'resize' | 'metadata'

export function getImageTransformCopy(locale: Locale, mode: ImageTransformMode) {
  const zh = locale === 'zh-CN'
  const title =
    mode === 'convert'
      ? zh
        ? '选择图片并转换格式'
        : 'Choose images to convert'
      : mode === 'resize'
        ? zh
          ? '选择图片并调整尺寸'
          : 'Choose images to resize'
        : zh
          ? '选择图片并清除元数据'
          : 'Choose images to remove metadata'

  const description =
    mode === 'metadata'
      ? zh
        ? '通过浏览器本地解码并重新编码，移除 EXIF 等元数据。JPEG/WebP/AVIF 会发生重新编码。'
        : 'Images are decoded and re-encoded locally to remove EXIF and other metadata. JPEG, WebP, and AVIF are re-encoded.'
      : zh
        ? '支持 JPEG、PNG、WebP、AVIF；文件不会进入服务器处理链路。'
        : 'Supports JPEG, PNG, WebP, and AVIF without putting your files in a server-side processing path.'

  return {
    dropzone: {
      title,
      description,
      chooseFiles: zh ? '选择图片' : 'Choose images',
      dropActive: zh ? '松开即可添加图片' : 'Release to add images',
    },
    quality: zh ? '质量' : 'Quality',
    outputFormat: zh ? '输出格式' : 'Output format',
    jpegBackground: zh ? 'JPEG 背景色' : 'JPEG background',
    resizePreset: zh ? '尺寸预设' : 'Resize preset',
    custom: zh ? '自定义' : 'Custom',
    original: zh ? '原始尺寸' : 'Original size',
    half: zh ? '缩小到 50%' : 'Scale to 50%',
    quarter: zh ? '缩小到 25%' : 'Scale to 25%',
    fullHd: zh ? '全高清 1920×1080' : 'Full HD 1920×1080',
    square: zh ? '方图 1080×1080' : 'Square 1080×1080',
    social: zh ? '社交分享 1200×630' : 'Social 1200×630',
    portrait: zh ? '竖版 1080×1350' : 'Portrait 1080×1350',
    percentage: zh ? '缩放比例 %' : 'Scale percent',
    width: zh ? '最大宽度' : 'Maximum width',
    height: zh ? '最大高度' : 'Maximum height',
    noUpscale: zh
      ? '默认保持宽高比且不会放大原图。'
      : 'Aspect ratio is preserved and images are not enlarged by default.',
    dimensions: zh ? '最终尺寸' : 'Final dimensions',
    download: zh ? '下载' : 'Download',
    downloadAll: zh ? '下载全部 ZIP' : 'Download all as ZIP',
    clearAll: zh ? '清空' : 'Clear',
    result: zh ? '处理结果' : 'Results',
    batchError: zh ? '无法添加这批文件' : 'This batch could not be added',
    queue: {
      queued: zh ? '等待处理' : 'Queued',
      processing: zh ? '处理中' : 'Processing',
      success: zh ? '已完成' : 'Complete',
      error: zh ? '失败' : 'Failed',
      cancelled: zh ? '已取消' : 'Cancelled',
      retry: zh ? '重试' : 'Retry',
      remove: zh ? '移除' : 'Remove',
    },
  }
}
