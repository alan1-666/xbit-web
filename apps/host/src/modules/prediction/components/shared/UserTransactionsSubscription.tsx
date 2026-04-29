import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { removePendingOrder, updateOrderByUserTx } from '@/redux/modules/pendingOrders.slice'
import { useAppDispatch } from '@/redux/store'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useRefetchUserPositions } from '@/modules/prediction/hooks/useRefetchUserPositions.ts'
import { useUserCredentials } from '../../hooks/useUserCredentials'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import eventBus from '@/lib/eventBus.ts'
import { PREDICTION_ORDER_MATCHED } from '@/lib/eventMessages.ts'

interface MqttTxStatusPayload {
  id: string
  type: string
  event_type: string
  status: string
  market: string
  asset_id: string
  outcome: string
  side: string
  size: string
  price: string
  owner: string
  taker_order_id: string
  transaction_hash: string
  timestamp: string
  size_matched?: string
}

const useRefreshUserBalance = () => {
  const queryClient = useQueryClient()
  const wallet = useProxyWallet()
  return useCallback((tokenId: string) => {
    queryClient
      .refetchQueries({
        queryKey: ['prediction', 'usdc-balance', wallet],
      })
      .then(() => {})
    queryClient
      .refetchQueries({
        queryKey: ['prediction', 'conditional-token-balance', wallet, tokenId],
      })
      .then(() => {})
  }, [])
}

const POLYMARKET_WSS = 'wss://ws-subscriptions-clob.polymarket.com/ws/user'
const FALLBACK_WSS = import.meta.env.VITE_APP_POLYMARKET_FALLBACK_WSS

const useUserTransactionWS = (onMessage: (data: any) => void) => {
  const { data: userCredentials } = useUserCredentials()
  const proxyWallet = useProxyWallet()
  const [wssUrl, setWssUrl] = useState<string | null>(POLYMARKET_WSS)
  const { lastMessage, sendMessage, readyState } = useWebSocket(
    proxyWallet ? wssUrl : null,
    {
      share: true,
      shouldReconnect: () => true,
      reconnectAttempts: 3,
      reconnectInterval: 3000,
      heartbeat: {
        message: 'ping',
        returnMessage: 'pong',
        timeout: 60000,
        interval: 10000,
      },
      onReconnectStop: () => {
        if (wssUrl === POLYMARKET_WSS) {
          setWssUrl(FALLBACK_WSS)
        }
      }
    },
  )
  useEffect(() => {
    if (!userCredentials || readyState !== ReadyState.OPEN) return
    sendMessage(
      JSON.stringify({
        auth: {
          apiKey: userCredentials.apiKey,
          secret: userCredentials.apiSecret,
          passphrase: userCredentials.apiPassphrase,
        },
        type: 'user',
      }),
    )
  }, [userCredentials, readyState])
  useEffect(() => {
    if (!lastMessage) return
    try {
      onMessage(JSON.parse(lastMessage.data))
    } catch {
      // no-op
    }
  }, [lastMessage])
}

export interface UserTransactionsSubscriptionProps {
  shouldRefetch?: (conditionId: string) => boolean
}

export const UserTransactionsSubscription = (props: UserTransactionsSubscriptionProps) => {
  const { shouldRefetch } = props
  const refetchUserPositions = useRefetchUserPositions()
  const dispatch = useAppDispatch()
  const refreshUserBalance = useRefreshUserBalance()
  const queryClient = useQueryClient()

  const callback = useCallback((_: string, payload: MqttTxStatusPayload) => {
    const { status, taker_order_id: orderId, price, size } = payload

    if (status === 'MINED' || status === 'MATCHED') {
      dispatch(
        updateOrderByUserTx({
          orderId,
          price: Number(price),
          size: Number(size),
        }),
      )

      if (status === 'MATCHED') {
        eventBus.dispatch(PREDICTION_ORDER_MATCHED, { data: payload })
      }
    }

    if (status === 'FILLED' || status === 'CANCELED' || status === 'CONFIRMED') {
      refreshUserBalance(payload.asset_id)
      // Refetch open orders immediately
      queryClient
        .refetchQueries({
          predicate: (query) => {
            const key = query.queryKey as string[]
            return key[0] === 'prediction' && key[1] === 'user' && key[2] === 'openOrders'
          },
        })
        .then()
      setTimeout(() => {
        const refetch = shouldRefetch ? shouldRefetch(payload.market) : true
        if (refetch) {
          refetchUserPositions(() => {
            dispatch(removePendingOrder(orderId))
          })
        } else {
          dispatch(removePendingOrder(orderId))
        }
      }, 1000)

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['prediction', 'trades'] })
      }, 500)

      setTimeout(() => {
        const tokenId = payload.asset_id
        queryClient.refetchQueries({
          queryKey: ['prediction', 'clob-allowance-sync', tokenId],
        }).then()
      }, 2000)
    }
  }, [shouldRefetch])

  // usePublicSubscriptionCallback(`public/polymarket/tx_status/${userId}`, {
  //   shouldSkip: !userId,
  //   onMessage: callback,
  // })

  useUserTransactionWS((data: MqttTxStatusPayload) => {
    callback('', data)
  })

  return null
}
