import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useSubscription } from '@/lib/mqtt'
import { useEffect, useState } from 'react'
import { TokenStatisticMqttPayload } from '@/types/mqtt/TokenStatisticMqttPayload.ts'

type UseTokenStatisticSubscriptionOptions<K extends readonly (keyof TokenStatisticMqttPayload)[]> = {
  token: string
  keys?: K
}

function pickFields<T extends object, const K extends readonly (keyof T)[]>(
  source: T,
  keys: K,
  excludeUndefined: boolean,
): Pick<T, K[number]> {
  return keys.reduce(
    (acc, key) => {
      if (excludeUndefined && source[key] === undefined) {
        return acc
      }
      acc[key] = source[key]
      return acc
    },
    {} as Pick<T, K[number]>,
  )
}

const hasPickedFieldChanged = <K extends readonly (keyof TokenStatisticMqttPayload)[]>(
  prev: Partial<TokenStatisticMqttPayload> | undefined,
  next: TokenStatisticMqttPayload,
  picks: K,
) => {
  return picks.some((key) => prev?.[key] !== next[key])
}

export const useTokenStatisticSubscription = <K extends readonly (keyof TokenStatisticMqttPayload)[]>(
  options: UseTokenStatisticSubscriptionOptions<K>,
) => {
  const { token, keys } = options
  const activeChainId = useActiveChainId()
  const [data, setData] = useState<Pick<TokenStatisticMqttPayload, K[number]>>()
  const { message } = useSubscription(`public/token_statistic/${activeChainId}/${token}`, {
    shouldSkip: !token,
  })

  useEffect(() => {
    const msg = message?.message?.toString()
    if (!msg) return

    const parsed = JSON.parse(msg) as TokenStatisticMqttPayload
    if (!keys || keys.length === 0) {
      setData(parsed)
      return
    }

    setData((prev) => {
      if (!prev || hasPickedFieldChanged(prev, parsed, keys)) {
        return {
          ...prev,
          ...pickFields(parsed, keys, true),
        }
      }
      return prev
    })
  }, [message])

  useEffect(() => {
    // reset data when token changes
    setData(undefined)
  }, [token])

  return data
}
