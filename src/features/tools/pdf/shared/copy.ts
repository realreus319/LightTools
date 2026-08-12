import type { Locale } from '@/i18n/config'

export function getPdfCopy(locale: Locale) {
  const zh = locale === 'zh-CN'
  return {
    choosePdf: zh ? '选择 PDF' : 'Choose PDF files',
    chooseOnePdf: zh ? '选择一个 PDF' : 'Choose one PDF',
    dropActive: zh ? '松开即可添加 PDF' : 'Release to add PDF files',
    localDescription: zh
      ? 'PDF 会在浏览器本地校验和处理，不上传服务器。'
      : 'PDF files are validated and processed locally in your browser.',
    pages: zh ? '页' : 'pages',
    loading: zh ? '读取页数…' : 'Reading page count…',
    remove: zh ? '移除' : 'Remove',
    moveUp: zh ? '上移' : 'Move up',
    moveDown: zh ? '下移' : 'Move down',
    merge: zh ? '合并 PDF' : 'Merge PDFs',
    merging: zh ? '正在合并…' : 'Merging…',
    download: zh ? '下载结果' : 'Download result',
    result: zh ? '处理结果' : 'Result',
    memoryWarning: zh
      ? '这批 PDF 体积较大，浏览器可能占用较多内存。建议关闭其他大型页面后再处理。'
      : 'This PDF batch is large and may use substantial browser memory. Close other heavy tabs before processing.',
    range: zh ? '页码范围' : 'Page range',
    rangePlaceholder: '1-3,5,8-10',
    extract: zh ? '提取为一个 PDF' : 'Extract to one PDF',
    split: zh ? '每页拆成独立 PDF' : 'Split into one PDF per page',
    process: zh ? '开始处理' : 'Process PDF',
    processing: zh ? '正在处理…' : 'Processing…',
    invalidRange: zh ? '页码范围无效，请按 1-3,5,8-10 这样的格式填写。' : 'Invalid page range. Use a format such as 1-3,5,8-10.',
    dragHint: zh ? '可拖拽排序，也可使用上移/下移按钮。' : 'Drag to reorder, or use the move buttons.',
    batchError: zh ? '无法处理这些 PDF' : 'These PDF files could not be processed',
  }
}
