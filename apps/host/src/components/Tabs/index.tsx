import clsx from 'clsx'

export type TabItem<K extends string = string> = { key: K; label: string }

type Props<K extends string = string> = {
  value: K
  items: ReadonlyArray<TabItem<K>>
  onChange: (k: K) => void
  className?: string
}

export function Tabs<K extends string = string>({ value, items, onChange, className }: Props<K>) {
  return (
    <div className={clsx('flex gap-2', className)}>
      {items.map((it, index) => {
        const active = it.key === value
        return (
          <button
            key={ index}
            onClick={() => onChange(it.key)}
            className={clsx(
              'px-3 h-7.5 rounded-md text-sm transition-colors bg-[#472468] hover:bg-[#6F3FF5]',
              active
                ? 'text-[#D6A3FF] shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset]'
                : 'text-[#797790] hover:text-white/80',
              className
            )}
            
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
