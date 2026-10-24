import type { ReactNode } from 'react'

export function SectionHeading({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} className="text-4xl leading-[1.05] font-bold tracking-tight md:text-5xl">
        {title}
      </h2>
      {children && <p className="mt-4 text-lg text-[#aab7c9]">{children}</p>}
    </div>
  )
}
