import type { Locale } from '@/i18n/config'

type FieldSpec = {
  min: number
  max: number
  labelZh: string
  labelEn: string
}

const FIELD_SPECS: readonly FieldSpec[] = [
  { min: 0, max: 59, labelZh: '分钟', labelEn: 'minute' },
  { min: 0, max: 23, labelZh: '小时', labelEn: 'hour' },
  { min: 1, max: 31, labelZh: '日', labelEn: 'day of month' },
  { min: 1, max: 12, labelZh: '月', labelEn: 'month' },
  { min: 0, max: 7, labelZh: '星期', labelEn: 'day of week' },
]

function parseNumber(value: string, spec: FieldSpec): number {
  const number = Number.parseInt(value, 10)
  if (!/^\d+$/.test(value) || number < spec.min || number > spec.max) {
    throw new RangeError(`${value} is outside ${spec.min}-${spec.max}`)
  }
  return number
}

function validatePart(part: string, spec: FieldSpec): void {
  const [range, rawStep] = part.split('/')
  if (!range) throw new RangeError('Empty cron field')
  if (rawStep !== undefined) {
    const step = Number.parseInt(rawStep, 10)
    if (!/^\d+$/.test(rawStep) || step < 1) throw new RangeError('Cron step must be positive')
  }
  if (range === '*') return
  const bounds = range.split('-')
  if (bounds.length === 1 && bounds[0]) {
    parseNumber(bounds[0], spec)
    return
  }
  if (bounds.length === 2 && bounds[0] && bounds[1]) {
    const start = parseNumber(bounds[0], spec)
    const end = parseNumber(bounds[1], spec)
    if (start > end) throw new RangeError('Cron range must be ascending')
    return
  }
  throw new RangeError(`Invalid cron field: ${part}`)
}

function validateField(field: string, spec: FieldSpec): void {
  if (!field) throw new RangeError('Cron field cannot be empty')
  for (const part of field.split(',')) validatePart(part, spec)
}

function explainField(field: string, spec: FieldSpec, locale: Locale): string {
  const label = locale === 'zh-CN' ? spec.labelZh : spec.labelEn
  if (field === '*') return locale === 'zh-CN' ? `每${label}` : `every ${label}`
  if (/^\*\/\d+$/.test(field)) {
    const step = field.slice(2)
    return locale === 'zh-CN' ? `每 ${step} ${label}` : `every ${step} ${label}s`
  }
  return locale === 'zh-CN' ? `${label}为 ${field}` : `${label}: ${field}`
}

export function explainCron(expression: string, locale: Locale): string {
  const fields = expression.trim().split(/\s+/)
  if (fields.length !== 5) {
    throw new RangeError('A standard cron expression must contain exactly five fields')
  }
  fields.forEach((field, index) => validateField(field, FIELD_SPECS[index]!))

  const details = fields.map((field, index) => explainField(field, FIELD_SPECS[index]!, locale))
  return locale === 'zh-CN'
    ? `标准 5 段 Cron：${details.join('；')}。`
    : `Standard five-field cron: ${details.join('; ')}.`
}
