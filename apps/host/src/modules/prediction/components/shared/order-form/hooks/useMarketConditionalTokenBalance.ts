import { useContext } from 'react'
import { OrderFormContext } from '@/modules/prediction/components/shared/order-form/OrderFormContext.ts'

export const useMarketConditionalTokenBalance = () => {
  const { balance: data, isBalancePending: isPending } = useContext(OrderFormContext)
  return {
    data,
    isPending,
  }
}
