import { Trans } from 'react-i18next'
import { useContext } from 'react'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'
import { Button } from '@components/ui/button.tsx'
import { useAppSelector } from '@/redux/store'
import { selectFromTokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'

export const TypeHeaderCell = () => {
  const { typeRef } = useContext(TradingTransactionsContext)
  const eventType = useAppSelector(selectFromTokenDetailState('eventType'))
  return (
    <div className="w-[64px] flex items-center gap-1">
      <Trans i18nKey="detail.tokenDetail.direction" />
      <Button size="xs" className="rounded-full bg-transparent p-0 h-4.5" onClick={() => typeRef.current?.open()}>
        <img
          src={eventType ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
          className="w-[11px] h-[11px]"
          alt="icon filter"
        />
      </Button>
    </div>
  )
}
