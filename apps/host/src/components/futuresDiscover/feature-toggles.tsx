import { Check } from 'lucide-react'
import React, { useState } from 'react'
import Text from '../common/Text'

interface FeatureToggleProps {
  options: {
    id: string
    label?: string
    checked?: boolean
  }[]
  onChange?: (id: string, checked: boolean) => void
  className?: string
}

export interface IPRadioItem {
  option: {
    id: string
    label?: string
    checked?: boolean
  }
  selectedOptions: Record<string, boolean>
  handleToggle?: (id: string) => void
}

export const RadioItem = ({ option, selectedOptions, handleToggle }: IPRadioItem) => {
  return (
    <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleToggle && handleToggle(option.id)}>
      <div
        className={`
      w-4 h-4 rounded-full flex items-center justify-center
      ${selectedOptions[option.id] ? 'bg-[linear-gradient(90deg,#9035FF,#EE69FF)] text-white' : 'bg-transparent border border-[#878787]'}
    `}
      >
        {selectedOptions[option.id] && <Check size={10} className="stroke-[3] text-white" />}
      </div>
      {option.label && <Text text={option.label} fontSize={10} />}
    </div>
  )
}

const FeatureToggles: React.FC<FeatureToggleProps> = ({ options = [], onChange, className = '' }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>(
    options.reduce(
      (acc, option) => ({
        ...acc,
        [option.id]: option.checked || false,
      }),
      {},
    ),
  )

  const handleToggle = (id: string) => {
    const newValue = !selectedOptions[id]

    setSelectedOptions((prev) => ({
      ...prev,
      [id]: newValue,
    }))

    if (onChange) {
      onChange(id, newValue)
    }
  }

  return (
    <div className={`flex items-center gap-3 py-3 ${className}`}>
      {options.map((option) => (
        <RadioItem handleToggle={handleToggle} key={option.id} option={option} selectedOptions={selectedOptions} />
      ))}
    </div>
  )
}

export default FeatureToggles
