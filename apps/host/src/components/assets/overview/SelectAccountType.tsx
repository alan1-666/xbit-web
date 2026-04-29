import BottomSheet from '@/components/common/BottomSheet'
import { useTranslation } from 'react-i18next'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useMemo } from 'react'

export type ACCOUNT_TYPE = 'MEME' | 'PERPS' | 'PREDICTION'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  title?: string
  onAccountSelected?: (account: string) => void
}

const SelectAccountType = ({ open, setOpen, title, onAccountSelected }: Props) => {
  const { t } = useTranslation()
  const isPredictionEnabled = useFeatureIsOn('enable_prediction')

  const accountTypes = useMemo(() => {
    const baseAccountTypes: Array<{
      key: ACCOUNT_TYPE
      label: string
      describe: string
    }> = [
      {
        key: 'PERPS' as ACCOUNT_TYPE,
        label: t('assets.futures.title'),
        describe: 'Hyperliquid',
      },
      {
        key: 'MEME' as ACCOUNT_TYPE,
        label: t('assets.funding.title'),
        describe: 'Solana, BNB Chain',
      },
    ]

    // Chỉ thêm PREDICTION khi feature flag được bật
    if (isPredictionEnabled) {
      baseAccountTypes.push({
        key: 'PREDICTION' as ACCOUNT_TYPE,
        label: 'Prediction',
        describe: 'Polygon',
      })
    }

    return baseAccountTypes
  }, [t, isPredictionEnabled])
  return (
    <BottomSheet open={open} setOpen={setOpen} title={title} hiddenBgImg>
      <div className="space-y-2">
        {accountTypes.map((account) => (
          <div
            key={account.key}
            className="p-3.5 bg-[#2B2B33] border-[0.5px] border-[#444455] rounded-[10px] flex items-center justify-between cursor-pointer"
            onClick={() => {
              onAccountSelected?.(account.key)
              setOpen(false)
            }}
          >
            <div>
              <div className="font-semibold text-[16px] leading-5.5 text-white">{account.label}</div>
              <div className="font-normal text-[12px] leading-5.5 text-[#908E98]">{account.describe}</div>
            </div>
            <img className="-rotate-90 size-6" src="/images/assets/arrow-down.svg" alt="" />
          </div>
        ))}
      </div>
    </BottomSheet>
  )
}

export default SelectAccountType
