import { useQuery, useQueryClient } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getAllBlacklist } from '@services/blacklist.service.ts'
import { ChainType, Query } from '@/@generated/gql/graphql-future.ts'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import {
  useAddDevsBlacklistAddresses,
  useAddTokensBlacklistAddresses,
} from '@pages/meme/discover/desktop/hooks/useAddBlacklistAddresses.ts'
import { useRemoveBlacklistAddressesMutation } from '@pages/meme/discover/desktop/hooks/useRemoveBlacklistAddressesMutation.ts'
import { ChainIds } from '@/types/enums.ts'
import { formatAddressWallet } from '@/lib/string'
import { isValidEvmAddress, isValidSolAddress } from '@/lib/blockchain.ts'
import { useActiveChainType } from '@hooks/useActiveChain.ts'

const getChainTypeFromChainId = (chainId: number): ChainType => {
  switch (chainId) {
    case ChainIds.Ethereum:
      return ChainType.Eth
    case ChainIds.Arbitrum:
      return ChainType.Evm
    default:
      return ChainType.Solana
  }
}

// Helper function to chunk arrays
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

type UserBlacklist = {
  devs: Query['getBlacklist']
  tokens: Query['getBlacklist']
}

export const useAllBacklistAddresses = () => {
  const queryClient = useQueryClient()
  const activeWallet = useActiveWallet()
  const activeChainType = useActiveChainType()
  const addTokensToBlacklist = useAddTokensBlacklistAddresses()
  const addDevsToBlacklist = useAddDevsBlacklistAddresses()
  const removeAddresses = useRemoveBlacklistAddressesMutation()
  const { t } = useTranslation()
  const chainType = useActiveChainType()

  const queryKey = useMemo(
    () => ['allBlacklistAddresses', activeWallet.walletAddress, activeWallet.chainId],
    [activeWallet.walletAddress, activeWallet.chainId],
  )

  const result = useQuery({
    queryKey: queryKey,
    enabled: activeWallet.isConnected,
    queryFn: async () => {
      const res = await futureClient.query({
        query: getAllBlacklist,
        variables: {
          chain: activeChainType,
        },
      })
      return (res.data ?? { devs: { addresses: [] }, tokens: { addresses: [] } }) as UserBlacklist
    },
  })

  const { devs, tokens } = useMemo(() => {
    return {
      devs: result.data?.devs.addresses || [],
      tokens: result.data?.tokens.addresses || [],
    }
  }, [result.data])

  const addTokens = useCallback(
    async (tokens: string[]) => {
      if (!activeWallet.isConnected) {
        toast.error(t('appSettings.loginRequired'))
        return
      }

      if (tokens.length === 0) return

      // Filter out tokens that already exist
      const oldTokens = result.data?.tokens?.addresses?.map((item) => item.address) || []
      const newTokensToAdd = tokens.filter((item) => !oldTokens.includes(item))

      if (newTokensToAdd.length === 0) {
        toast.error(t('listCoin.blacklist.allAddressExists'))
        return
      }

      // Update UI immediately
      queryClient.setQueryData(queryKey, (oldData: UserBlacklist) => {
        const newTokens: UserBlacklist['tokens']['addresses'] = newTokensToAdd.map((item) => ({
          address: item,
          chainId: activeWallet.chainId,
          createdTime: Date.now(),
        }))

        return {
          ...oldData,
          devs: oldData?.devs || { addresses: [] },
          tokens: {
            addresses: [...(oldData?.tokens?.addresses || []), ...newTokens],
          },
        } as UserBlacklist
      })

      // Chunk tokens into batches of 100
      const tokenChunks = chunkArray(newTokensToAdd, 100)

      // Add all chunks
      const promises = tokenChunks.map(
        (chunk) =>
          new Promise((resolve, reject) => {
            addTokensToBlacklist.mutate(chunk, {
              onSuccess: resolve,
              onError: reject,
            })
          }),
      )

      try {
        await Promise.all(promises)
        if (newTokensToAdd.length === 1) {
          toast.success(t('listCoin.blacklist.addedToBlacklist', { address: formatAddressWallet(newTokensToAdd[0]) }))
        } else {
          toast.success(t('listCoin.blacklist.addTokenSuccess'))
        }
      } catch (error) {
        console.error('Error adding tokens to blacklist:', error)
        // Revert UI changes on error
        queryClient.invalidateQueries({ queryKey })
        toast.error(t('listCoin.blacklist.addError'))
      }
    },
    [activeWallet, result.data, queryKey, queryClient, addTokensToBlacklist, t],
  )

  const addDevs = useCallback(
    async (devs: string[]) => {
      if (!activeWallet.isConnected) {
        toast.error(t('appSettings.loginRequired'))
        return
      }

      if (devs.length === 0) return

      // Validate dev addresses
      const checkFunction = chainType === ChainType.Solana ? isValidSolAddress : isValidEvmAddress
      const isAllValid = devs.every((address) => {
        if (!address) return false
        return checkFunction(address)
      })

      if (!isAllValid) {
        toast.error(t('listCoin.blacklist.devAddressMissing'))
        return
      }

      // Filter out devs that already exist
      const oldDevs = result.data?.devs?.addresses?.map((item) => item.address) || []
      const newDevsToAdd = devs.filter((item) => !oldDevs.includes(item))

      if (newDevsToAdd.length === 0) {
        toast.error(t('listCoin.blacklist.allAddressExists'))
        return
      }

      // Update UI immediately
      queryClient.setQueryData(queryKey, (oldData: UserBlacklist) => {
        const newDevs = newDevsToAdd.map((item) => ({
          address: item,
          chainId: activeWallet.chainId,
          createdTime: Date.now(),
        })) as UserBlacklist['devs']['addresses']

        return {
          ...oldData,
          tokens: oldData?.tokens || { addresses: [] },
          devs: {
            addresses: [...(oldData?.devs?.addresses || []), ...newDevs],
          },
        }
      })

      // Chunk devs into batches of 100
      const devChunks = chunkArray(newDevsToAdd, 100)

      // Add all chunks
      const promises = devChunks.map(
        (chunk) =>
          new Promise((resolve, reject) => {
            addDevsToBlacklist.mutate(chunk, {
              onSuccess: resolve,
              onError: reject,
            })
          }),
      )

      try {
        await Promise.all(promises)
        if (newDevsToAdd.length === 1) {
          toast.success(t('listCoin.blacklist.addedToBlacklist', { address: formatAddressWallet(newDevsToAdd[0]) }))
        } else {
          toast.success(t('listCoin.blacklist.addDevSuccess'))
        }
      } catch (error) {
        console.error('Error adding devs to blacklist:', error)
        // Revert UI changes on error
        queryClient.invalidateQueries({ queryKey })
        toast.error(t('listCoin.blacklist.addError'))
      }
    },
    [activeWallet, chainType, result.data, queryKey, queryClient, addDevsToBlacklist, t],
  )

  const removeTokens = useCallback(
    (tokens: string[]) => {
      queryClient.setQueryData(queryKey, (oldData: UserBlacklist) => {
        const addresses = oldData?.tokens?.addresses || []
        return {
          ...oldData,
          tokens: {
            addresses: addresses.filter((item) => !tokens.includes(item.address)),
          },
        }
      })
    },
    [queryKey, queryClient],
  )

  const removeDevs = useCallback(
    (devs: string[]) => {
      queryClient.setQueryData(queryKey, (oldData: UserBlacklist) => {
        return {
          ...oldData,
          devs: {
            addresses: (oldData?.devs?.addresses || []).filter((item) => !devs.includes(item.address)),
          },
        }
      })
    },
    [queryKey, queryClient],
  )

  const removeAll = useCallback(() => {
    const devAddresses =
      (result.data?.devs.addresses || []).map((item) => ({
        address: item.address,
        chain: getChainTypeFromChainId(item.chainId),
      })) || []
    const tokenAddresses =
      (result.data?.tokens.addresses || []).map((item) => ({
        address: item.address,
        chain: getChainTypeFromChainId(item.chainId),
      })) || []

    const devChunks = chunkArray(devAddresses, 100)
    const tokenChunks = chunkArray(tokenAddresses, 100)

    queryClient.setQueriesData(
      {
        predicate: (query) => query.queryKey[0] === 'allBlacklistAddresses',
      },
      (oldData: UserBlacklist) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          devs: { addresses: [] },
          tokens: { addresses: [] },
        }
      },
      {
        updatedAt: Date.now() + 60000, // avoid immediate refetch
      },
    )

    // Remove all chunks
    const removeAllChunks = async () => {
      const promises: Promise<any>[] = []

      for (let i = 0; i < Math.max(devChunks.length, tokenChunks.length); i++) {
        const devChunk = devChunks[i] || []
        const tokenChunk = tokenChunks[i] || []

        promises.push(
          new Promise((resolve, reject) => {
            removeAddresses.mutate(
              { devs: devChunk, tokens: tokenChunk },
              {
                onSuccess: resolve,
                onError: reject,
              },
            )
          }),
        )
      }

      try {
        await Promise.all(promises)
      } catch (error) {
        console.error('Error removing blacklist chunks:', error)
        // Optionally refetch data if some chunks failed
        queryClient.invalidateQueries({ queryKey })
      }
    }

    removeAllChunks()
  }, [result.data, queryKey, removeAddresses, queryClient])

  return {
    ...result,
    blacklistDevs: devs,
    blacklistTokens: tokens,
    addTokens,
    addDevs,
    removeTokens,
    removeDevs,
    removeAll,
  }
}