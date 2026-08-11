export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.rel = 'noopener'
  anchor.style.display = 'none'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  // 浏览器需要在 click 后保留 URL 一个事件循环，立即 revoke 可能让部分浏览器取消下载。
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
