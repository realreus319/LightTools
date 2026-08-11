export type ToolEducationalContent = {
  guide?: {
    title: string
    paragraphs: readonly string[]
  }
  faq?: readonly {
    question: string
    answer: string
  }[]
}

export function ToolEducationalContent({
  content,
  faqTitle,
}: {
  content: ToolEducationalContent
  faqTitle: string
}) {
  const hasGuide = Boolean(content.guide?.paragraphs.length)
  const hasFaq = Boolean(content.faq?.length)
  if (!hasGuide && !hasFaq) return null

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {hasGuide && content.guide ? (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">{content.guide.title}</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
            {content.guide.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : null}

      {hasFaq ? (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">{faqTitle}</h2>
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-background px-5">
            {content.faq?.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer font-medium">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
