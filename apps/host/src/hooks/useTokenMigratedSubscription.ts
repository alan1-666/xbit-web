import { useSubscription } from '@/lib/mqtt'
import { useEffect } from 'react'

interface SubscriptionMessage {
  chain_id: number
  token_address: string
  migrated_at: number // timestamp in seconds
}

export interface UseTokenMigratedSubscriptionOptions {
  chainId: number
  onTokenMigrated: (payload: { tokenAddress: string; migratedAt: number }) => void
}

export const useTokenMigratedSubscription = (options: UseTokenMigratedSubscriptionOptions) => {
  const { chainId, onTokenMigrated } = options
  const { message } = useSubscription(`public/migrated/${chainId}`, {
    clientOptions: {
      qos: 1,
    },
  })

  useEffect(() => {
    const msg = message?.message
    if (!msg) return

    try {
      const payload = JSON.parse(msg.toString()) as SubscriptionMessage
      if (payload.token_address && payload.migrated_at && payload.chain_id) {
        onTokenMigrated({
          tokenAddress: payload.token_address,
          migratedAt: payload.migrated_at,
        })
      }
    } catch (error) {
      console.error('Failed to parse subscription message:', error)
    }
  }, [message, onTokenMigrated])
}
