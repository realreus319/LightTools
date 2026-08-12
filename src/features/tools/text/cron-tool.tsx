'use client'

import { useMemo, useState } from 'react'
import type { Locale } from '@/i18n/config'
import { explainCron } from './shared/cron'

export function CronTool({ locale }: { locale: Locale }) {
  const zh = locale === 'zh-CN'
  const [expression, setExpression] = useState('*/5 * * * *')
  const result = useMemo(() => {
    try {
      return { explanation: explainCron(expression, locale), error: undefined }
    } catch (error) {
      return { explanation: '', error: error instanceof Error ? error.message : String(error) }
    }
  }, [expression, locale])

  return (
    <div className="space-y-5">
      <label className="grid gap-2 text-sm font-medium">
        <span>{zh ? 'Cron 表达式（分钟 小时 日 月 星期）' : 'Cron expression (minute hour day month weekday)'}</span>
        <input value={expression} onChange={(event) => setExpression(event.currentTarget.value)} spellCheck={false} className="h-12 rounded-xl border border-border bg-background px-4 font-mono" />
      </label>
      <div className="grid grid-cols-5 gap-2 text-center text-xs text-muted-foreground">
        {(zh ? ['分钟', '小时', '日', '月', '星期'] : ['minute', 'hour', 'day', 'month', 'weekday']).map((label) => <span key={label} className="rounded-lg bg-background-muted p-2">{label}</span>)}
      </div>
      {result.error ? <p role="alert" className="text-sm text-destructive">{result.error}</p> : <p className="rounded-2xl border border-border bg-background p-5 leading-7">{result.explanation}</p>}
      <p className="text-xs text-muted-foreground">{zh ? '按标准 5 段 Cron 解析，不支持 Quartz 的秒、年份、?、L、W、# 等扩展语法。' : 'Uses standard five-field cron syntax and intentionally does not accept Quartz-specific seconds, year, ?, L, W, or # extensions.'}</p>
    </div>
  )
}
