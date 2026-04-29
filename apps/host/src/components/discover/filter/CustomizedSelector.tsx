import { RangeItem } from '@components/discover/filter/FilterFormData.ts'
import { CustomizeInput } from '@components/discover/filter/CustomizeInput.tsx'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'

export interface CustomizedSelectorProps {
  minimumLabel: string
  maximumLabel: string
  unit: string
  min: number | undefined
  max: number | undefined
  onChange: (item: RangeItem) => void
  onCleared?: () => void
}

const isNullOrUndefined = (value: number | undefined): boolean => {
  return value === null || value === undefined
}

export const CustomizedSelector = (props: CustomizedSelectorProps) => {
  const { minimumLabel, maximumLabel, min, max, onChange, unit, onCleared } = props
  const { t } = useTranslation()

  const [minValue, setMinValue] = useState<number | undefined>(min)
  const [maxValue, setMaxValue] = useState<number | undefined>(max)

  const handleMinChange = (newValue: number | null) => {
    setMinValue(newValue !== null ? +newValue : undefined)
  }

  const handleMaxChange = (newValue: number | null) => {
    setMaxValue(newValue !== null ? +newValue : undefined)
  }

  useEffect(() => {
    if (!isNullOrUndefined(minValue) || !isNullOrUndefined(maxValue)) {
      onChange({
        min: minValue,
        max: maxValue,
        isCustom: true,
      })
    } else {
      onCleared?.()
    }
  }, [minValue, maxValue])

  const errorMessage = useMemo(() => {
    if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
      return t('filter.minMaxError')
    }
    if (maxValue !== undefined && maxValue !== null && maxValue <= 0) {
      return t('filter.maxZeroError')
    }
    return undefined
  }, [minValue, maxValue, t])

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <CustomizeInput value={min} label={minimumLabel} suffix={unit} onValueChange={handleMinChange} />
        </div>
        <div>
          <CustomizeInput value={max} onValueChange={handleMaxChange} label={maximumLabel} suffix={unit} />
        </div>
      </div>
      {!!errorMessage && <div className="mt-3 text-red-500 text-[calc(12px)]">{errorMessage}</div>}
    </div>
  )
}
