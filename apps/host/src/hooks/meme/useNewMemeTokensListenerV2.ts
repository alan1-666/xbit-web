import { MemeDto } from '@/@generated/gql/graphql-future.ts'
import { MqttNewMemeToken } from '@/types/mqtt.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useCallback, useMemo } from 'react'
import { ChainIds } from '@/types/enums.ts'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { GetMemeOutput } from '@/types/responses.ts'
import { memeTokenMapper } from '@/utils/mappers/memeTokenMapper.ts'
import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'

export interface UseNewMemeTokensListenerOptions {
  shouldSkip?: boolean
  callback?: (token: MemeDto[]) => void
}

const useSubscriptionTopic = () => {
  const activeChainId = useActiveChainId()
  return useMemo(() => {
    if (activeChainId === ChainIds.Mon) {
      return 'public/meme/mon/new'
    }
    if (activeChainId === ChainIds.Bsc) {
      return 'public/meme/bsc/new'
    }
    return 'public/meme/new'
  }, [activeChainId])
}

const useUpdateQuery = () => {
  const queryClient = useQueryClient()

  return useCallback((queryKey: any[], tokens: MemeDto[]) => {
    queryClient.setQueryData(queryKey, (oldData: InfiniteData<GetMemeOutput>) => {
      if (!oldData) return oldData
      // insert to first page
      const firstPage = oldData.pages?.[0]
      if (!firstPage) return oldData
      const allOldTokens = oldData.pages.flatMap((page) => page.getMemeToken?.data || [])
      const newTokens: MemeDto[] = []
      tokens.forEach((token) => {
        const isNew = !allOldTokens.some((newToken) => newToken.token === token.token)
        if (isNew) {
          newTokens.push(token)
        }
      })

      const newPages = oldData.pages.map((page, index) => {
        if (index === 0) {
          return {
            ...page,
            getMemeToken: {
              ...page.getMemeToken,
              data: [...newTokens, ...(page.getMemeToken?.data || [])],
            },
          }
        }
        const pageTokens = page.getMemeToken?.data || []
        const updatedTokens = pageTokens.map((token) => {
          const newToken = tokens.find((t) => t.token === token.token)
          return newToken ? { ...token, ...newToken } : token
        })
        return {
          ...page,
          getMemeToken: {
            ...page.getMemeToken,
            data: updatedTokens,
          },
        }
      })
      return {
        ...oldData,
        pages: newPages,
      }
    })
  }, [])
}

export const useNewMemeTokensListenerV2 = (options?: UseNewMemeTokensListenerOptions) => {
  const { shouldSkip = false, callback } = options || {}
  const updateQuery = useUpdateQuery()
  const subscriptionTopic = useSubscriptionTopic()
  const handleOnMessage = useCallback(
    (_: string, message: MqttNewMemeToken[] | MqttNewMemeToken) => {
      let data = message
      if (!Array.isArray(data)) {
        // If it's a single object, wrap it in an array
        data = [data]
      }
      const tokens: MemeDto[] = data.map((item) => memeTokenMapper.fromMqttNewMemeToken(item))
      callback?.(tokens)
      updateQuery(['getMemeToken'], tokens)
    },
    [callback, updateQuery],
  )

  usePublicSubscriptionCallback(subscriptionTopic, {
    shouldSkip,
    clientOptions: {
      qos: 1,
    },
    onMessage: handleOnMessage,
  })
  return {
    updateQuery,
  }
}
