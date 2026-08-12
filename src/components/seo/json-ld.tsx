type JsonLdProps = {
  data: Record<string, unknown>
}

function serializeJsonLd(data: Record<string, unknown>): string {
  // JSON-LD 需要 script 标签；转义 `<` 防止用户可控文本意外提前闭合标签。
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
