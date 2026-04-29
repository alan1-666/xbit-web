import { memo, useRef } from 'react'
import clsx from 'clsx'

type Props = {
  value: string
  placeholder?: string
  className?: string
  onChange: (v: string) => void
  onSearch?: (v: string) => void
}

export const SearchContent = memo(({ value, placeholder = 'Search', className, onChange, onSearch }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const fire = () => onSearch?.(value.trim())

  return (
    <div
      className={clsx(
        'flex items-center justify-between',
        'h-9 md:h-9 w-[300px] max-w-[28vw] rounded-full',
        'bg-[#111217]/80 border border-white/10',
        'hover:border-white/15 transition-colors px-3',
        className,
      )}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        onKeyDown={(e) => e.key === 'Enter' && fire()}
        placeholder={placeholder}
        className={clsx(
          'flex-1 bg-transparent outline-none',
          'text-sm md:text-sm text-white/90 placeholder:text-white/35',
          'mr-2',
        )}
      />

      <button
        type="button"
        aria-label="Search"
        onClick={fire}
        className={clsx(
          'grid place-items-center',
          'h-4 w-4 rounded-full',
          'text-white/60 hover:text-white/90',
          'flex-shrink-0',
        )}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/smart-money/search.svg`}
          alt="search"
          className="h-full w-full object-contain select-none"
          draggable={false}
        />
      </button>
    </div>
  )
})
