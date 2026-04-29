export interface BuyIncrementorProps {
  onIncrement?: (increment: number) => void
  onMax?: () => void
}

const options = [
  { label: '+$1', value: 1 },
  { label: '+$10', value: 10 },
  { label: '+$100', value: 100 },
]

export const BuyIncrementSelector = (props: BuyIncrementorProps) => {
  const { onIncrement, onMax } = props
  return (
    <div className="flex items-center justify-end gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          className="px-3 py-1 bg-[#2A2A2F] rounded-[6px] text-[calc(12rem/16)] text-white font-medium"
          onClick={() => {
            onIncrement?.(option.value)
          }}
        >
          {option.label}
        </button>
      ))}
      <button
        key="max"
        className="px-3 py-1 bg-[#2A2A2F] rounded-[6px] text-[calc(12rem/16)] text-white font-medium"
        onClick={() => {
          onMax?.()
        }}
      >
        Max
      </button>
    </div>
  )
}
