import { useTranslation } from 'react-i18next'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'

export interface TransactionToastMessageProps extends ToastProps {
  buy: number
  sell: number
  timeframe: TimeframeOption
}

export const TransactionToastMessage = (props: TransactionToastMessageProps) => {
  const { buy, sell, timeframe, ...rest } = props
  const total = buy + sell
  const { t } = useTranslation()
  return (
    <BaseToastMessage {...rest}>
      <div className="text-[calc(12rem/16)] leading-[calc(12rem/16)] text-[#FFFFFF99] w-48 space-y-2.5">
        <div className="flex items-center gap-2 justify-between">
          <span>
            {timeframe}{' '}
            {t('listCoin.toasts.totalTransactions')}
          </span>
          <span className="text-[#FFFFFF]">{total}</span>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <span>
            {timeframe}
            {t('listCoin.toasts.buyCount')}
          </span>
          <span className="text-[#00FFB4]">{buy}</span>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <span>
            {timeframe}
            {t('listCoin.toasts.sellCount')}
          </span>
          <span className="text-[#F25461]">{sell}</span>
        </div>
      </div>
    </BaseToastMessage>
  )
}

export default TransactionToastMessage
