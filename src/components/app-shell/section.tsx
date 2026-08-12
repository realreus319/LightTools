import type { ReactNode } from 'react'
import { Container } from './container'

type SectionProps = {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}

export function Section({ id, eyebrow, title, description, children }: SectionProps) {
  return (
    <section id={id} className="py-12 sm:py-16">
      <Container>
        <div className="mb-7 max-w-3xl">
          {eyebrow ? (
            <p className="mb-2 text-sm font-semibold tracking-wide text-[var(--lt-brand)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          {description ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </Container>
    </section>
  )
}
