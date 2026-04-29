import { useSubscriptionCallback, UseSubscriptionCallbackOptions } from '@hooks/mqtt/useSubscriptionCallback.ts'
import { useState } from 'react'

export type UseSubscriptionValueOptions<T> = Omit<UseSubscriptionCallbackOptions<T>, 'onMessage'>

export const useSubscriptionValue = <T>(topics: string | string[], options: UseSubscriptionValueOptions<T>) => {
  const [value, setValue] = useState<T | null>(null)

  useSubscriptionCallback<T>(topics, {
    ...options,
    onMessage: (_, payload) => {
      setValue(payload)
    },
  })
  return value
}
