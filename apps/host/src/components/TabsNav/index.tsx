import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Item = {
  to: string
  label: React.ReactNode
  end?: boolean
}

type Props = {
  items: Item[]
  className?: string
}

export const TabsNav = ({ items, className }: Props) => {
  return (
    <div
      className={cn('inline-flex h-10 items-center rounded-xl p-1', 'bg-[#14151A] border border-white/10', className)}
    >
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn(
              'h-8 px-4 rounded-lg inline-flex items-center',
              'text-[13px] transition',
              isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5',
            )
          }
        >
          {it.label}
        </NavLink>
      ))}
    </div>
  )
}
