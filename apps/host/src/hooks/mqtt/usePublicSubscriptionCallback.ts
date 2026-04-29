import { useSubscriptionCallback, UseSubscriptionCallbackOptions } from '@hooks/mqtt/useSubscriptionCallback.ts'
import { useContext, useMemo } from 'react'
import { MqttContext } from '@/lib/mqtt'

export const usePublicSubscriptionCallback = <T>(
  topics: string | string[],
  options: UseSubscriptionCallbackOptions<T>,
) => {
  const { publicClient } = useContext(MqttContext)
  const appendedOptions = useMemo(() => {
    return {
      ...options,
      client: publicClient,
    }
  }, [options, publicClient])
  return useSubscriptionCallback<T>(topics, appendedOptions)
}
