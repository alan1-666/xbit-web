export interface SellOptionSelectorProps {
  onSelect: (value: number) => void
  availableShares?: number
}

const options = [
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: 'Max', value: 100 },
]

export const SellOptionSelector = (props: SellOptionSelectorProps) => {
  const { onSelect, availableShares } = props
  const handleOnSelect = (percentage: number) => {
    if (!availableShares) return
    const sharesToSell = Math.floor((availableShares * percentage) / 100)
    onSelect(sharesToSell)
  }
  return (
    <div className="flex gap-2 justify-end">
      {options.map((option) => (
        <button
          key={option.value}
          className="px-3 py-1 bg-[#2A2A2F] rounded-[6px] text-[calc(12rem/16)] text-white font-medium"
          onClick={() => handleOnSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
