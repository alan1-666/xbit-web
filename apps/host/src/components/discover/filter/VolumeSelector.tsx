import { Control, useWatch } from 'react-hook-form'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { useTranslation } from 'react-i18next'
import { BaseSelector } from '@components/discover/filter/BaseSelector.tsx'

export interface VolumeSelectorProps {
  control: Control<FilterFormData>
  allowSorting?: boolean
}

const options = [
  {
    label: '>$50K',
    min: 50000,
    key: '>50k',
    max: undefined,
  },
  {
    label: '>$100K',
    min: 100000,
    key: '>100k',
    max: undefined,
  },
  {
    label: '>$500K',
    min: 500000,
    key: '>500k',
    max: undefined,
  },
  {
    label: '>$1M',
    min: 1000000,
    key: '>1M',
    max: undefined,
  },
]

export const VolumeSelector = (props: VolumeSelectorProps) => {
  const { control, allowSorting } = props
  const { t } = useTranslation()

  const timeframe = useWatch({ control, name: 'timeframe' })

  const title = t('detail.trading.volume', { time: timeframe })

  return (
    <BaseSelector
      control={control}
      name="volumes"
      title={title}
      options={options}
      minimumLabel={t('filter.minVolume')}
      maximumLabel={t('filter.maxVolume')}
      unit="$"
      allowSort={allowSorting}
    />
  )
}
