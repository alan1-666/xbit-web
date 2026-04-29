import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { formatAmount } from '@/lib/format.ts'

export interface OrderConfirmedToastProps {
  orderType: 'market' | 'limit'
  side: 'buy' | 'sell'
  amount?: number
  size?: number
  price?: number
  outcome: string
}

export const OrderConfirmedToast = (props: OrderConfirmedToastProps) => {
  const { orderType, side, amount, size, price, outcome } = props
  const { t } = useTranslation()

  const calculatedAmount = useMemo(() => {
    if (orderType === 'limit') {
      return (price || 0) * (size || 0)
    }
    return side === 'buy' ? amount || 0 : size || 0
  }, [side, size, orderType, price])

  return (
    <>
      <div className="flex items-center justify-between mt-3 gap-2">
        <p className="text-xs text-muted-foreground leading-4">
          <span>{t('history.type')} </span>
          <br />
          <span>
            {orderType === 'market' && t('orderForm.tabs.marketTrade')}
            {orderType === 'limit' && t('orderForm.tabs.limitOrder')}
          </span>
          <span>
            {' '}
            {side === 'buy' && t('history.buy')}
            {side === 'sell' && t('history.sell')}
          </span>
        </p>
        <p className="text-xs text-muted-foreground leading-4">
          <span>{t('Price')}</span>
          <br />
          <span>{price ? `${formatAmount(price * 100, { showCurrency: false })}¢` : '--'}</span>
        </p>
        <p className="text-xs text-muted-foreground leading-4">
          <span>{t('history.orderValue')} </span>
          <br />
          <span>{formatAmount(calculatedAmount, { showCurrency: true })} </span>
        </p>
        <p className="text-xs text-muted-foreground leading-4">
          <span>Outcome</span>
          <br />
          <span>{outcome}</span>
        </p>
      </div>
    </>
  )
}
