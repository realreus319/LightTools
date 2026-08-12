export function getSafePdfStem(fileName: string): string {
  const leafName = fileName.replace(/\\/g, '/').split('/').filter(Boolean).at(-1) ?? 'document'
  const dot = leafName.lastIndexOf('.')
  const rawStem = dot > 0 ? leafName.slice(0, dot) : leafName
  const stem = rawStem.replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, '-').trim()
  return stem || 'document'
}

export function createPdfOutputName(fileName: string, suffix: string): string {
  return `${getSafePdfStem(fileName)}-${suffix}.pdf`
}
