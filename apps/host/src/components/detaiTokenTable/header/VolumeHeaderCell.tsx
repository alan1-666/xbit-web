import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { selectFromTokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { getDataUnitByChain } from '@/lib/currency.ts'
import { setDataUnit, UserSettingsState } from '@/redux/modules/userSettings.slice.ts'
import { useCallback, useContext } from 'react'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'

export const VolumeHeaderCell = () => {
  const { t } = useTranslation()
  const minAmount = useAppSelector(selectFromTokenDetailState('minAmount'))
  const maxAmount = useAppSelector(selectFromTokenDetailState('maxAmount'))
  const dataUnit = useAppSelector((state: RootState) => (state.userSettings as UserSettingsState).dataUnit)
  const activeChain = useActiveChain()
  const dispatch = useAppDispatch()

  const { amountRef } = useContext(TradingTransactionsContext)

  const handleChangeCurrency = useCallback(() => {
    if (dataUnit === 'USD') {
      const newDataUnit = getDataUnitByChain(activeChain)
      dispatch(setDataUnit(newDataUnit))
    } else {
      dispatch(setDataUnit('USD'))
    }
  }, [activeChain, dataUnit])

  const hasFilter = minAmount > 0 || maxAmount > 0

  return (
    <div className="flex items-center gap-[2px] min-w-[110px]">
      <div>{t('detail.tokenDetail.columnVolume')}</div>
      <div className="flex items-center cursor-pointer justify-center gap-1">
        <Button size="xs" className="rounded-full bg-transparent p-0 h-4.5" onClick={() => amountRef.current?.open()}>
          <img
            src={hasFilter ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
            className="w-[11px] h-[11px]"
            alt="icon filter"
          />
        </Button>
        <img
          src="/images/orderBook/icon-refund.svg"
          className="w-[14px] h-[14px] cursor-pointer"
          alt="icon refund"
          onClick={handleChangeCurrency}
        />
      </div>
    </div>
  )
}
