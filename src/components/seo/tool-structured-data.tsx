import type { Locale } from '@/i18n/config'
import type { ToolDefinition } from '@/lib/tool-registry/schema'
import { absoluteUrl } from '@/lib/seo/site-url'
import { JsonLd } from './json-ld'

type ToolStructuredDataProps = {
  locale: Locale
  tool: ToolDefinition
  title: string
  description: string
  homeLabel: string
}

export function ToolStructuredData({
  locale,
  tool,
  title,
  description,
  homeLabel,
}: ToolStructuredDataProps) {
  const toolUrl = absoluteUrl(`/${locale}/tools/${tool.slug}`)
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: homeLabel,
        item: absoluteUrl(`/${locale}`),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: toolUrl,
      },
    ],
  }

  if (tool.status !== 'stable') {
    return <JsonLd data={breadcrumb} />
  }

  const application = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title,
    description,
    url: toolUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern web browser with JavaScript enabled',
  }

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={application} />
    </>
  )
}
