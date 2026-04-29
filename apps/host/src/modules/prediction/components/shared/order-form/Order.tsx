import { useFormContext, useWatch } from 'react-hook-form'
import { OrderFormData } from './OrderFormData.ts'
import { MarketOrder } from './MarketOrder.tsx'
import { LimitOrder } from '@/modules/prediction/components/shared/order-form/LimitOrder.tsx'

export const Order = () => {
  const { control } = useFormContext<OrderFormData>()
  const orderType = useWatch({ control, name: 'orderType' })
  if (orderType === 'market') {
    return <MarketOrder />
  } else if (orderType === 'limit') {
    return <LimitOrder />
  }
  return null
}
