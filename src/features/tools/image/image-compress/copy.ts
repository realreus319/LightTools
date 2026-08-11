import type { Locale } from '@/i18n/config'

export function getImageCompressCopy(locale: Locale) {
  if (locale === 'zh-CN') {
    return {
      dropzone: {
        title: '拖入图片开始压缩',
        description: '支持 JPEG、PNG、WebP、AVIF。文件先在本地校验，再交给浏览器 Worker 处理。',
        chooseFiles: '选择图片',
        dropActive: '松开即可添加图片',
      },
      quality: '质量',
      outputFormat: '输出格式',
      sameFormat: '保持原格式',
      maxDimension: '最长边上限',
      originalSize: '原始大小',
      resultSize: '结果大小',
      saved: '节省',
      dimensions: '尺寸',
      download: '下载',
      downloadAll: '下载全部 ZIP',
      clearAll: '清空',
      queue: {
        queued: '等待处理',
        processing: '处理中',
        success: '已完成',
        error: '失败',
        cancelled: '已取消',
        retry: '重试',
        remove: '移除',
      },
      batchError: '无法添加这批文件',
      pngQualityNote: 'PNG 为无损编码，质量滑杆不会改变 PNG 输出质量。',
    }
  }

  return {
    dropzone: {
      title: 'Drop images here to compress',
      description:
        'Supports JPEG, PNG, WebP, and AVIF. Files are validated locally before browser workers process them.',
      chooseFiles: 'Choose images',
      dropActive: 'Release to add images',
    },
    quality: 'Quality',
    outputFormat: 'Output format',
    sameFormat: 'Keep original format',
    maxDimension: 'Maximum long edge',
    originalSize: 'Original',
    resultSize: 'Result',
    saved: 'Saved',
    dimensions: 'Dimensions',
    download: 'Download',
    downloadAll: 'Download all as ZIP',
    clearAll: 'Clear',
    queue: {
      queued: 'Queued',
      processing: 'Processing',
      success: 'Complete',
      error: 'Failed',
      cancelled: 'Cancelled',
      retry: 'Retry',
      remove: 'Remove',
    },
    batchError: 'This batch could not be added',
    pngQualityNote:
      'PNG uses lossless encoding, so the quality slider does not change PNG output quality.',
  }
}
