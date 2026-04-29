import { CreateOrderInput, TransactionType } from '@/@generated/gql/graphql-trading.ts'
import { tradingClient } from '@/lib/gql/apollo-client.ts'
import { OrderResponse } from '@/types/responses.ts'
import { ApolloError, useMutation } from '@apollo/client'
import { createOrderMutation } from '@services/order.service.ts'
import { useCallback, useState } from 'react'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

interface UseCreateOrderResult {
  createOrder: (input: CreateOrderInput) => Promise<any>
  loading: boolean
  error: ApolloError | null
}

export const SOL_ADDRESS = 'So11111111111111111111111111111111111111111'
export const SOL_DECIMALS = 9

export function useCreateOrder(): UseCreateOrderResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApolloError | null>(null)
  const [mutate] = useMutation<OrderResponse>(createOrderMutation, {
    client: tradingClient,
  })

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      setLoading(true)
      setError(null)
      try {
        if (input?.transactionType === TransactionType.Buy || input?.transactionType === TransactionType.Sell) {
          const action = input?.transactionType === TransactionType.Buy ? ACTIONS.meme_buy : ACTIONS.meme_sell
          logEvent2(action, {
            token_address: input.baseAddress || '',
            amount: input.baseAmount || '',
            slippage: input.slippage || '',
          })
        }
        const response = await mutate({
          variables: { input },
        })
        return response.data
      } catch (err) {
        setError(err as ApolloError)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutate],
  )

  return { createOrder, loading, error }
}
