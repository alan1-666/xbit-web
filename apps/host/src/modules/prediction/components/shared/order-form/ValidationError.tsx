import { useFormContext, useWatch } from 'react-hook-form'
import { OrderFormData } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'
import { useContext, useMemo } from 'react'
import { OrderFormContext } from '@/modules/prediction/components/shared/order-form/OrderFormContext.ts'
import { useMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance.ts'
import { useMarketConditionalTokenBalance } from '@/modules/prediction/components/shared/order-form/hooks/useMarketConditionalTokenBalance.ts'
import { OrderFormDataSchema } from '@/modules/prediction/components/shared/order-form/schema/orderForm.schema.ts'

export const ValidationError = () => {
  const { yesPrice, noPrice } = useContext(OrderFormContext)
  const { control } = useFormContext<OrderFormData>()
  const formData = useWatch({ control })
  const { data: usdcBalance } = useMyUSDCBalance()
  const { data: tokenBalance } = useMarketConditionalTokenBalance()

  const error = useMemo(() => {
    if (!formData) return null
    if (formData.orderType === 'market') {
      if (formData.side === 'buy' && !formData.data?.amount) return null
      if (formData.side === 'sell' && !formData.data?.size) return null
    }
    if (formData.orderType === 'limit') {
      if (!formData.data?.price || !formData.data?.size) return null
    }
    const result = OrderFormDataSchema.safeParse(formData)
    if (result.success) return null
    return result.error.issues[0].message
  }, [formData])

  const { side, orderType, outcome, data } = formData ?? {}
  const outcomePrice = outcome === 'yes' ? yesPrice : noPrice
  const estimatedCost = useMemo(() => {
    if (orderType === 'market' && side === 'buy') return data?.amount ?? 0
    const orderPrice = orderType === 'market' ? outcomePrice : (data?.price ?? 0)
    return orderPrice * (data?.size ?? 0)
  }, [orderType, side, data?.amount, data?.price, data?.size, outcomePrice])

  const errorClassName = 'text-xs text-center text-[#FF1568] mt-1 mb-2'

  if (error) {
    return <p className={errorClassName}>{error}</p>
  }

  const size = data?.size ?? 0
  const amount = data?.amount ?? 0

  if (side === 'buy') {
    if (orderType === 'market' && amount > 0 && usdcBalance !== undefined && estimatedCost > usdcBalance) {
      return <p className={errorClassName}>Insufficient balance</p>
    }
    if (usdcBalance !== undefined && estimatedCost > usdcBalance && size > 0) {
      return <p className={errorClassName}>Insufficient balance</p>
    }
  } else if (tokenBalance !== undefined && size > tokenBalance && size > 0) {
    return <p className={errorClassName}>Insufficient shares</p>
  }

  return null
}
