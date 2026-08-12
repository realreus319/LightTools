import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type ContainerProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

export function Container<T extends ElementType = 'div'>({
  as,
  children,
  className = '',
  ...props
}: ContainerProps<T>) {
  const Component = as ?? 'div'

  return (
    <Component
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  )
}
