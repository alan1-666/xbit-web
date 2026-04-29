import { cn } from '@/lib/utils'

interface FilterCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  labelClassName?: string
  checkboxClassName?: string
}

function FilterCheckbox({
  label,
  checked,
  onChange,
  className,
  labelClassName,
  checkboxClassName,
}: FilterCheckboxProps) {
  const handleClick = () => {
    onChange(!checked)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'h-[30px] px-3 py-2.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-200',
        checked 
          ? 'bg-[#332546] text-[#ab70ff]' 
          : 'bg-[#212127] text-[#777777] hover:bg-[#332546]/50 hover:text-[#ab70ff]/70',
        className
      )}
    >
      <span className={cn(labelClassName)}>{label}</span>
      <div
        className={cn(
          'w-3.5 h-3.5 rounded border flex items-center justify-center transition-all duration-200 border-white/20',
          checkboxClassName
        )}
      >
        {checked && <img src="/images/icons/ic-tick-square.svg?v=2" className="w-3 h-3" alt="checked" />}
      </div>
    </button>
  )
}

export default FilterCheckbox
