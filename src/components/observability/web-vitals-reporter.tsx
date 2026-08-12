'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { trackAnalyticsEvent } from '@/lib/analytics/analytics'

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0]

const reportMetric: ReportWebVitalsCallback = (metric) => {
  trackAnalyticsEvent({
    name: 'web_vital',
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
    navigationType: metric.navigationType,
  })
}

export function WebVitalsReporter() {
  useReportWebVitals(reportMetric)
  return null
}
