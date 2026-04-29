import { useMutation } from '@tanstack/react-query'
import { OrderFormDataWithMarketId } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'
import { OrderResponseDto, OrderSide, PolymarketOrderDto } from '@/@generated/gql/graphql-xpUser'
import { Outcome } from '@/@generated/gql/graphql-xpUser.ts'
import { orderService } from '@/modules/prediction/services/order.service'
import { useOptimisticUpdateMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance.ts'
import { useOptimisticUpdateMyConditionalTokenBalance } from '@/modules/prediction/hooks/useConditionalTokenBalance.ts'
import { useOptimisticUpdateOpenOrders } from '@/modules/prediction/hooks/useOptimisticUpdateOpenOrders.ts'
import { calculateUsdcAmount } from '@/modules/prediction/hooks/orderCalculations.ts'
import { IPolymarketOpenOrder } from '@/modules/prediction/models/PortfolioModel.ts'
import { useAppDispatch } from '@/redux/store'
import { useOptimisticUpdateMyPositionTotalValue } from '@/modules/prediction/hooks/useUserPositionTotalValue.ts'
import { addPendingOrder, PendingOrder, removePendingOrder } from '@/redux/modules/pendingOrders.slice'
import { useOptimisticUpdateTrades } from '@/modules/prediction/hooks/useOptimisticUpdateTrades.ts'
import { useRefetchUserPositions } from '@/modules/prediction/hooks/useRefetchUserPositions.ts'

type OrderResponseWithPolymarketOrder = OrderResponseDto & { polymarketOrder?: PolymarketOrderDto }

const calculateMarketSize = (formData: OrderFormDataWithMarketId) => {
  if (formData.side === 'buy') {
    const amount = formData.data.amount ? +formData.data.amount : 0
    const outcome = formData.outcome
    const price = outcome === 'yes' ? formData.yesPrice : formData.noPrice
    return amount / (price || 0)
  } else {
    return formData.data.size ? +formData.data.size : 0
  }
}

const placeMarketOrder = async (formData: OrderFormDataWithMarketId) => {
  if (formData.orderType !== 'market') return
  if (formData.side === 'buy') {
    return orderService.placeBuyMarketOrder({
      marketId: formData.marketId,
      outcome: formData.outcome === 'yes' ? Outcome.Yes : Outcome.No,
      amount: formData.data.amount ? +formData.data.amount : 0,
      feeRateBps: formData.feeRateBps,
    })
  } else if (formData.side === 'sell') {
    return orderService.placeSellMarketOrder({
      marketId: formData.marketId,
      outcome: formData.outcome === 'yes' ? Outcome.Yes : Outcome.No,
      size: calculateMarketSize(formData) || 0,
      feeRateBps: formData.feeRateBps,
    })
  }
}

const placeLimitOrder = async (formData: OrderFormDataWithMarketId) => {
  if (formData.orderType !== 'limit') return
  return orderService.placeLimitOrder({
    marketId: formData.marketId,
    outcome: formData.outcome === 'yes' ? Outcome.Yes : Outcome.No,
    side: formData.side === 'buy' ? OrderSide.Buy : OrderSide.Sell,
    price: +formData.data.price,
    size: +formData.data.size,
    feeRateBps: formData.feeRateBps,
  })
}

export interface PlaceOrderError {
  code: string
  message: string
}

export interface UsePlaceOrderMutationOptions {
  onMutate?: (formData: OrderFormDataWithMarketId) => void
  onSuccess?: (order: OrderResponseDto | undefined, formData: OrderFormDataWithMarketId) => void
  onError?: (error: PlaceOrderError | PlaceOrderError[], formData: OrderFormDataWithMarketId) => void
}

export const usePlaceOrderMutation = (options: UsePlaceOrderMutationOptions = {}) => {
  const dispatch = useAppDispatch()
  const optimisticUpdateUSDCBalance = useOptimisticUpdateMyUSDCBalance()
  const optimisticUpdateConditionalTokenBalance = useOptimisticUpdateMyConditionalTokenBalance()
  const optimisticUpdatePositionTotal = useOptimisticUpdateMyPositionTotalValue()
  const optimisticUpdateTrades = useOptimisticUpdateTrades()
  const { addOrder: addOpenOrder } = useOptimisticUpdateOpenOrders()
  const { onMutate, onSuccess, onError } = options
  const refetchUserPositions = useRefetchUserPositions()

  return useMutation({
    mutationKey: ['prediction', 'order', 'place'],
    mutationFn: async (formData: OrderFormDataWithMarketId) => {
      if (formData.orderType === 'market') {
        return placeMarketOrder(formData)
      } else if (formData.orderType === 'limit') {
        return placeLimitOrder(formData)
      } else {
        throw new Error('Invalid order type')
      }
    },
    onMutate: (formData) => onMutate?.(formData),
    onSuccess: (data, formData) => {
      // removePosition(formData.conditionId)

      // Only apply optimistic updates for market orders
      if (formData.orderType === 'market' && data) {
        const typedData = data as OrderResponseWithPolymarketOrder
        const polyOrder = typedData.polymarketOrder
        const taking = Number(polyOrder?.takingAmount || 0)
        const making = Number(polyOrder?.makingAmount || 0)

        // BUY:  makingAmount=USDC spent, takingAmount=shares received
        // SELL: makingAmount=shares delivered, takingAmount=USDC received
        let size: number
        let price: number
        if (taking > 0 && making > 0) {
          if (formData.side === 'buy') {
            size = taking // actual shares received
            price = making / taking // USDC per share
          } else {
            size = making // actual shares delivered
            price = taking / making // USDC received per share
          }
        } else {
          price = data.price || (formData.outcome === 'yes' ? formData.yesPrice : formData.noPrice) || 0
          size = formData.side === 'buy' ? data.size / price : data.size
        }
        const pendingOrder: PendingOrder = {
          orderId: data.orderId,
          marketId: formData.marketId,
          tokenId: formData.tokenId,
          conditionId: formData.conditionId,
          outcome: formData.outcome === 'yes' ? 'yes' : 'no',
          outcomeLabel: formData.outcome === 'yes' ? formData.outcomeLabels[0] : formData.outcomeLabels[1],
          side: formData.side,
          orderType: formData.orderType as 'market' | 'limit',
          size: size || 0,
          price: price,
          status: 'PENDING',
          createdAt: Date.now(),
          outcomeIndex: formData.outcome === 'yes' ? 0 : 1,
        }
        dispatch(addPendingOrder(pendingOrder))

        setTimeout(() => {
          refetchUserPositions(() => {
            dispatch(removePendingOrder(data.orderId))
          })
        }, 25000) // Clear pending order after 25 seconds if not filled

        // Calculate USDC amount
        const usdcAmount = calculateUsdcAmount(data)

        // Update USDC balance
        optimisticUpdateUSDCBalance(usdcAmount, formData.side === 'buy' ? 'reduce' : 'add')

        // Update Position Total (value moves between USDC and Position Total)
        optimisticUpdatePositionTotal(usdcAmount, formData.side === 'buy' ? 'add' : 'reduce')

        // Update conditional token balance
        optimisticUpdateConditionalTokenBalance(formData.tokenId, size || 0, formData.side === 'buy' ? 'add' : 'reduce')

        // Update trades
        optimisticUpdateTrades({
          marketId: formData.marketId,
          tokenId: formData.tokenId,
          conditionId: formData.conditionId,
          outcomeIndex: formData.outcome === 'yes' ? 0 : 1,
          outcome: formData.outcome === 'yes' ? formData.outcomeLabels[0] : formData.outcomeLabels[1],
          side: formData.side.toUpperCase(),
          size: size || 0,
          price: price,
          transactionHash: (data as any).transactionHash || '',
          title: formData.title || '',
          slug: formData.slug || '',
          icon: formData.icon || '',
          eventSlug: formData.eventSlug || '',
        })
      }

      // Add optimistic update for limit orders (they become open orders)
      if (formData.orderType === 'limit' && data) {
        const newOpenOrder: IPolymarketOpenOrder = {
          orderID: data.orderId || '',
          market: formData.conditionId,
          asset_id: formData.tokenId,
          side: formData.side === 'buy' ? 'BUY' : 'SELL',
          price: String(formData.data.price || '0'),
          size: String(formData.data.size || '0'),
          sizeFilled: '0',
          status: 'ACTIVE',
          expiration: null, // Will be filled by actual data
          createdAt: Date.now(),
        }

        addOpenOrder(formData.conditionId, newOpenOrder)
      }

      // Refetch trade history for the market
      // setTimeout(() => {
      //   queryClient.invalidateQueries({ queryKey: ['prediction', 'trades'] }).then()
      // }, 5000) // Delay to allow backend to process the order

      onSuccess?.(data, formData)
    },
    onError: (error: PlaceOrderError | PlaceOrderError[], formData) => {
      console.trace('error', error)
      onError?.(error, formData)
    },
  })
}
