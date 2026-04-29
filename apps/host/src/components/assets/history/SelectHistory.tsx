import BottomSheet from '@/components/common/BottomSheet'
import { useTranslation } from 'react-i18next'

const SelectHistory = ({
  open,
  setOpen,
  onSelected,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onSelected: (type: string) => void
}) => {
  const { t } = useTranslation()
  const historyTypes = [
    { label: 'assets.history.assetHistory', value: 'assetHistory' },
    { label: 'assets.history.tradeHistory', value: 'tradeHistory' },
  ]

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('assets.history.selectHistory')}>
      <div className="space-y-2">
        {historyTypes.map((type) => (
          <div
            key={type.value}
            className="p-4 bg-[#2B2B33] border-[0.5px] border-[#444455] cursor-pointer hover:bg-[#27272A] rounded-[10px]"
            onClick={() => {
              setOpen(false)
              onSelected(type.value)
            }}
          >
            <span className="text-[16px] leading-4 text-white">{t(type.label)}</span>
          </div>
        ))}
      </div>
    </BottomSheet>
  )
}

export default SelectHistory
