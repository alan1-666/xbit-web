import { useQuery } from '@tanstack/react-query'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { getWalletBalance } from '@services/assets.service.ts'
import { WalletBalanceDto, WalletDuration } from '@/@generated/gql/graphql-core.ts'
import { useEffect, useState } from 'react'
import { WalletBalance } from '@components/assets/overview/AssetOverviewContext.tsx'
import { useSubscription } from '@/lib/mqtt'
import { useSelector } from 'react-redux'
import { userIdSelector } from '@/redux/modules/newAuth.slice.ts'

export interface UseWalletBalancesOptions {
  duration: WalletDuration
  chainId?: number
  walletAddress?: string
}

export const useWalletBalances = (options: UseWalletBalancesOptions) => {
  const { duration, chainId, walletAddress } = options
  const [data, setData] = useState<WalletBalance>({
    funding: undefined,
    futures: undefined,
    spot: undefined,
  })
  const userId = useSelector(userIdSelector)
  const { data: apiWalletBalanceData } = useQuery({
    queryKey: ['getWalletBalance', duration, chainId, walletAddress, userId],
    enabled: !!duration,
    queryFn: async () => {
      const res = await gqlClient.query({
        query: getWalletBalance,
        variables: {
          input: {
            duration: duration,
            chainId,
            walletAddress,
          },
        },
        fetchPolicy: 'no-cache',
      })
      const wallets = res.data.getWalletBalance as WalletBalanceDto[]
      return {
        funding: wallets.filter((wallet) => wallet.walletType === 'Funding'),
        futures: wallets.filter((wallet) => wallet.walletType === 'Futures'),
        spot: wallets.filter((wallet) => wallet.walletType === 'Spot'),
      }
    },
  })

  useEffect(() => {
    if (apiWalletBalanceData) {
      setData(apiWalletBalanceData)
    }
  }, [apiWalletBalanceData])

  const { message: messageWalletBalanceUpdate } = useSubscription(`users/${userId}/wallet_balance_updated`)
  useEffect(() => {
    if (!messageWalletBalanceUpdate) return
    try {
      const message = messageWalletBalanceUpdate?.message
      const data = JSON.parse(message?.toString() || '')
      if (data) {
        const walletType = data.walletType
        const walletAddress = data.walletAddress
        const chainId = data.chainId
        switch (walletType) {
          case 'Funding':
            setData((prev) => ({
              ...prev,
              funding: prev.funding
                ? prev.funding.map((wallet) =>
                    wallet.walletAddress === walletAddress && wallet.chainId === chainId
                      ? { ...wallet, ...data }
                      : wallet,
                  )
                : [{ ...data }],
            }))
            break
          case 'Futures':
            setData((prev) => ({
              ...prev,
              futures: prev.futures
                ? prev.futures.map((wallet) =>
                    wallet.walletAddress === walletAddress && wallet.chainId === chainId
                      ? { ...wallet, ...data }
                      : wallet,
                  )
                : [{ ...data }],
            }))
            break
          case 'Spot':
            setData((prev) => ({
              ...prev,
              spot: prev.spot
                ? prev.spot.map((wallet) =>
                    wallet.walletAddress === walletAddress && wallet.chainId === chainId
                      ? { ...wallet, ...data }
                      : wallet,
                  )
                : [{ ...data }],
            }))
            break
          default:
            console.warn(`Unknown wallet type: ${walletType}`)
            break
        }
      }
    } catch (error) {
      return
    }
  }, [messageWalletBalanceUpdate])

  return data
}
