import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/redux/store'
import { selectFromTokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { useContext } from 'react'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'

export const AmountHeaderCell = () => {
  const { t } = useTranslation()
  const minVolume = useAppSelector(selectFromTokenDetailState('minVolume'))
  const maxVolume = useAppSelector(selectFromTokenDetailState('maxVolume'))
  const nativeAmountFrom = useAppSelector(selectFromTokenDetailState('nativeAmountFrom'))
  const nativeAmountTo = useAppSelector(selectFromTokenDetailState('nativeAmountTo'))
  const { volumeRef } = useContext(TradingTransactionsContext)
  return (
    <div className="flex items-center gap-[2px] min-w-[80px]">
      <div>{t('transaction.quantity')}</div>
      <div className="flex items-center cursor-pointer justify-center">
        <Button size="xs" className="rounded-full bg-transparent p-0 h-4.5" onClick={() => volumeRef.current?.open()}>
          <img
            src={
              minVolume > 0 || maxVolume > 0 || nativeAmountFrom > 0 || nativeAmountTo > 0
                ? '/images/icons/icon-filter-solid.svg'
                : '/images/icons/icon-filter.svg'
            }
            className="w-[11px] h-[11px]"
            alt="icon filter"
          />
        </Button>
      </div>
    </div>
  )
}
