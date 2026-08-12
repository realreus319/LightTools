import { Container } from '@/components/app-shell/container'
import type { LegalDocument } from '@/i18n/legal'

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <main id="main-content">
      <Container className="py-12 sm:py-16">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{document.title}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{document.description}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {document.updatedLabel}: {document.updated}
          </p>
        </header>

        <div className="mt-10 grid max-w-3xl gap-10">
          {document.sections.map((section) => (
            <section key={section.title} aria-labelledby={`legal-${section.title}`}>
              <h2 id={`legal-${section.title}`} className="text-xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="mt-4 grid gap-4 text-sm leading-7 text-muted-foreground sm:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="grid list-disc gap-2 ps-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </main>
  )
}
