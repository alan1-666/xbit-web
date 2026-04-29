import { OrderResponseDto } from '@/@generated/gql/graphql-xpUser.ts'
import { OrderFormDataWithMarketId } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'
import { PositionUpdateData } from '@/modules/prediction/hooks/useOptimisticUpdateUserPosition.ts'

const calculateSize = (order: OrderResponseDto, formData: OrderFormDataWithMarketId): number => {
  const { orderType, side } = formData
  if (orderType === 'limit') return order.size
  if (side === 'sell') return order.size

  // For buy market orders, size is calculated as amount / price
  const price = order.price || (formData.outcome === 'yes' ? formData.yesPrice : formData.noPrice) || 0
  if (price === 0) return 0
  return order.size / price
}

/**
 * Convert order response and form data to position update data for optimistic updates
 * Returns null if data is insufficient for creating a position update
 */
export const createPositionUpdateData = (
  order: OrderResponseDto | undefined,
  formData: OrderFormDataWithMarketId,
): PositionUpdateData | null => {
  if (!order || order.size === 0) return null

  let price = order.price || 0
  if (price === 0) {
    price = (formData.outcome === 'yes' ? formData.yesPrice : formData.noPrice) || 0
  }
  if (price === 0) return null

  return {
    marketId: formData.marketId,
    outcome: formData.outcome === 'yes' ? 'yes' : 'no',
    outcomeLabel: formData.outcome === 'yes' ? formData.outcomeLabels[0] : formData.outcomeLabels[1],
    side: formData.side as 'buy' | 'sell',
    size: calculateSize(order, formData),
    price,
  }
}

/**
 * Calculate USDC amount to update balance based on order
 */
export const calculateUsdcAmount = (order: OrderResponseDto | undefined): number => {
  if (!order) return 0
  return order.size * (order.price || 0)
}
