'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface LinkButtonProps {
  href: string
  external?: boolean
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'destructive'
    | 'link'
  size?:
    | 'default'
    | 'xs'
    | 'sm'
    | 'lg'
    | 'icon'
    | 'icon-xs'
    | 'icon-sm'
    | 'icon-lg'
  className?: string
  children: React.ReactNode
}

export function LinkButton({
  href,
  external = false,
  children,
  variant,
  size,
  className,
}: LinkButtonProps) {
  if (external) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        render={(renderProps) => (
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            {...renderProps}
          >
            {children}
          </a>
        )}
      />
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      render={<Link href={href} />}
    >
      {children}
    </Button>
  )
}
