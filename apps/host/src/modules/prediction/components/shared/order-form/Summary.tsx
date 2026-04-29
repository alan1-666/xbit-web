import { formatAmount } from '@/lib/format.ts'
import { OrderFormData } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'
import { useFormContext, useWatch } from 'react-hook-form'
import { useContext, useMemo } from 'react'
import { OrderFormContext } from '@/modules/prediction/components/shared/order-form/OrderFormContext.ts'
import { useTranslation } from 'react-i18next'
import { useHasPendingOrders } from '@/modules/prediction/components/shared/order-form/hooks/useHasPendingOrders.ts'

export const Summary = () => {
  const { t } = useTranslation()
  const { control } = useFormContext<OrderFormData>()
  const { yesPrice, noPrice, clobTokenIds } = useContext(OrderFormContext)
  const orderType = useWatch({ control, name: 'orderType' })
  const outcome = useWatch({ control, name: 'outcome' })
  const outcomePrice = outcome === 'yes' ? yesPrice : noPrice
  const limitPrice = useWatch({ control, name: 'data.price' })
  const size = useWatch({ control, name: 'data.size' })
  const amount = useWatch({ control, name: 'data.amount' })
  const side = useWatch({ control, name: 'side' })

  const tokenId = outcome === 'yes' ? clobTokenIds[0] : clobTokenIds[1]

  const hasPendingOrder = useHasPendingOrders(tokenId)

  const price = orderType === 'market' ? outcomePrice : limitPrice

  const totalCost = useMemo(() => {
    return price * (size || 0)
  }, [price, size])

  const winAmount = useMemo(() => {
    if (side === 'buy' && orderType === 'market') {
      return (amount || 0) / (outcomePrice || 0)
    }
    return size || 0
  }, [size, amount, side, outcomePrice, orderType])

  const amountReceived = useMemo(() => {
    return (size || 0) * price || 0
  }, [size, price])

  const warningMessage = useMemo(() => {
    if (orderType === 'market' && price === 0) {
      return t('prediction.orderForm.priceUnavailable')
    }
    if (hasPendingOrder && side === 'sell') {
      return t('prediction.orderForm.pendingOrderWarning')
    }
    return null
  }, [hasPendingOrder, orderType, price, side, t])

  return (
    <div className="space-y-2">
      {orderType === 'limit' && (
        <div className="flex items-baseline justify-between">
          <div className="text-[#908E98]">{t('prediction.orderForm.totalCost')}</div>
          <div className="text-white">{formatAmount(totalCost, { showCurrency: true })}</div>
        </div>
      )}
      <div className="flex items-baseline justify-between">
        <div className="text-[#908E98]">
          {side === 'sell' ? t('prediction.orderForm.amountReceived') : t('prediction.orderForm.toWin')}
        </div>
        <div className="text-rise">
          {formatAmount(side === 'sell' ? amountReceived : winAmount, { showCurrency: true })}
        </div>
      </div>
      {warningMessage && (
        <div className="text-xs text-center text-yellow-500 mt-1 mb-2">
          {warningMessage}
        </div>
      )}
    </div>
  )
}
