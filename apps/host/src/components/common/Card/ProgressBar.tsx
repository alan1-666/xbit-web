type ProgressBarProps = {
  value: number
  label?: string
  showProcess?: boolean
}

function ProgressBar({ value, label, showProcess = true }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(100, value))
  const formattedValue = normalizedValue.toFixed(1)
  const [integerPart, decimalPart] = formattedValue.split('.')
  let formattedValueString
  if (decimalPart === '0') {
    formattedValueString = integerPart
  } else {
    formattedValueString = `${integerPart}.${decimalPart}`
  }

  return (
    <div className="flex items-center">
      <div className="text-rise text-[calc(1rem*(10/16))] leading-[calc(1rem*(12/16))] mr-1">
        {formattedValueString}%
      </div>
      {showProcess ? (
        <div className="bg-[rgba(0,255,180,0.2)] rounded-tr-[200px] rounded-br-[200px] w-6 max-w-[24px] h-1 relative">
          <p
            className="absolute left-0 top-0  h-1 bg-rise rounded-tr-[200px] rounded-br-[200px] max-w-[24px]"
            style={{ width: `${normalizedValue}%` }}
          ></p>
        </div>
      ) : null}
      {!!label && (
        <div className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(12/16))] text-[#00CE89] ml-1">{label}</div>
      )}
    </div>
  )
}

export default ProgressBar
