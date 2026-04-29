import { useState, useRef, useEffect } from 'react'

type InputPositionProps = {
  value: string
  onChange: (value: string) => void
  unit?: string
  onSwapUnit?: () => void
  placeholder?: string
  className?: string
}

const InputPosition = ({ value, onChange, unit, onSwapUnit, placeholder, className }: InputPositionProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={`relative p-[1px] rounded-[6px] overflow-hidden ${isFocused ? 'bg-[linear-gradient(90deg,#9945FF,#00F3AB)]' : 'bg-[#111111]'} ${className}`}
    >
      <input
        type="number"
        className={`w-full h-[48px] px-3 bg-[#111111] text-white placeholder:text-white/70 text-[14px] leading-none rounded-[5.5px] ${unit ? 'pr-[72px]' : ''}`}
        placeholder={placeholder ?? ''}
        value={value}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => {
          const newVal = e.target.value
          if (newVal === '' || /^\d*\.?\d*$/.test(newVal)) {
            onChange(newVal)
          }
        }}
      />
      {unit && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-[14px] leading-none text-white flex items-center gap-0.5">
          <span>{unit}</span>
          <img
            className="w-4 h-4 cursor-pointer transition-all duration-100 hover:scale-[1.1]"
            alt="icon-refund"
            src="/images/icons/fund-icon.svg"
            onClick={() => {
              onSwapUnit && onSwapUnit()
            }}
          />
        </div>
      )}
    </div>
  )
}

export default InputPosition
