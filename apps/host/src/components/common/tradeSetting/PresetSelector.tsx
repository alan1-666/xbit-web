import { cn } from '@/lib/utils'
import { TradeSetting } from '@/redux/modules/tradeSettings.slice'
import { useTranslation } from 'react-i18next'

const PresetSelector = ({
  presets,
  selectedKey,
  onSelect,
}: {
  presets: TradeSetting[]
  selectedKey: number
  onSelect: (preset: TradeSetting) => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="relative grid grid-cols-3 gap-0.5 bg-[#18181b] rounded-md p-1 border-[0.5px] border-[#343339]">
      {presets.map((preset) => (
        <div
          key={preset.key}
          className={cn('relative z-10 flex items-center justify-center py-[5.5px] rounded-sm cursor-pointer', {
            'rounded-[4px] bg-[#fff]': selectedKey === preset.key,
          })}
          onClick={() => onSelect(preset)}
        >
          <span
            className={cn(
              'font-[400] text-[14px] leading-none transition-colors',
              selectedKey === preset.key ? 'text-[#000]' : 'text-[#908E98]',
            )}
          >
            {t('tradeSettings.preset', { preset: preset.key })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default PresetSelector
