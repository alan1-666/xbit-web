import { Button } from '@components/ui/button.tsx'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'
import { useTranslation } from 'react-i18next'
import { useContext } from 'react'
import { selectFromTokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { useAppSelector } from '@/redux/store'

export const WalletHeaderCell = () => {
  const { t } = useTranslation()
  const { addressRef } = useContext(TradingTransactionsContext)
  const address = useAppSelector(selectFromTokenDetailState('address'))
  return (
    <div className="flex items-center gap-[2px] min-w-[120px] pl-6">
      <div>{t('detail.tokenDetail.wallet')}</div>
      <div className="flex items-center cursor-pointer justify-center">
        <Button
          size="xs"
          className="rounded-full bg-transparent p-0 h-4.5"
          onClick={() => addressRef.current?.open(address)}
        >
          <img
            src={address ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
            className="w-[11px] h-[11px]"
            alt="icon filter"
          />
        </Button>
      </div>
    </div>
  )
}
