import { WalletBalanceDto, WalletDuration } from '@/@generated/gql/graphql-core'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { gqlClient } from '@/lib/gql/apollo-client'
import { useSubscription } from '@/lib/mqtt'
import { fetchArbUsdcBalance, usePrices } from '@/pages/assets/index.tsx'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _activeWallet, _walletDex, mappedTypeChain } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { getWalletBalance } from '@/services/assets.service'
import { WalletBalance } from '@components/assets/overview/AssetOverviewContext.tsx'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

const useWalletOverview = () => {
  const { accountValue } = useWebData2()
  const activeWallet = useSelector(_activeWallet)
  const walletDex = useSelector(_walletDex)
  const userId = useSelector(_userInfo)?.userId
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  const solWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'SOLANA')
  const ethWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'EVM')
  const arbWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'ARB')
  const { solPrice, ethPrice } = usePrices()
  const { data: arbUsdcBalances = {} } = useQuery({
    queryKey: ['arbUsdcBalances', arbWallets],
    queryFn: async () => {
      const balances: Record<string, number> = {}
      for (const wallet of arbWallets) {
        balances[wallet.walletAddress] = await fetchArbUsdcBalance(wallet.walletAddress)
      }
      return balances
    },
  })

  const {
    data: apiWalletBalanceData,
    refetch: refetchWalletBalance,
    isLoading: isLoadingWalletBalance,
  } = useQuery({
    queryKey: ['getWalletBalance', activeWallet.chainId, userId],
    enabled: !!activeWallet.chainId,
    queryFn: async () => {
      const res = await gqlClient.query({
        query: getWalletBalance,
        variables: {
          input: {
            duration: WalletDuration.Y1,
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

  const listWalletsByActiveChain = useMemo(() => {
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((item: UserEmbeddedWalletDto) => item.chain === mappedTypeChain(activeChain))
    }
    return []
  }, [listWalletsByChain, activeChain])

  const [wallets, setWallets] = useState<WalletBalance>({
    funding: undefined,
    futures: undefined,
    spot: undefined,
  })

  useEffect(() => {
    if (apiWalletBalanceData) {
      setWallets(apiWalletBalanceData)
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
            setWallets((prev) => ({
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
            setWallets((prev) => ({
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
            setWallets((prev) => ({
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

  const fundingBalance = useMemo(
    () => wallets?.funding?.reduce((acc, wallet) => acc + parseFloat(wallet.usdBalance || '0'), 0) || 0,
    [wallets?.funding?.reduce((acc, wallet) => acc + parseFloat(wallet.usdBalance || '0'), 0) || 0],
  )
  const fundingNativeTokenBalance = useMemo(
    () => wallets?.funding?.reduce((acc, wallet) => acc + parseFloat(wallet.nativeTokenBalance || '0'), 0) || 0,
    [wallets?.funding?.reduce((acc, wallet) => acc + parseFloat(wallet.nativeTokenBalance || '0'), 0) || 0],
  )
  const spotBalance = useMemo(
    () => wallets?.spot?.reduce((acc, wallet) => acc + parseFloat(wallet.usdBalance || '0'), 0) || 0,
    [wallets],
  )
  const spotNativeTokenBalance = useMemo(
    () => wallets?.spot?.reduce((acc, wallet) => acc + parseFloat(wallet.nativeTokenBalance || '0'), 0) || 0,
    [wallets],
  )
  const futuresBalance = useMemo(() => Number(accountValue), [accountValue])

  const { totalBanlance, totalMemeBanlance } = useMemo(
    () => ({
      totalMemeBanlance: fundingBalance + spotBalance,
      totalBanlance: fundingBalance + futuresBalance + spotBalance,
    }),
    [fundingBalance, spotBalance, futuresBalance],
  )

  useEffect(() => {
    refetchWalletBalance()
  }, [])

  const solBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    solWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [solWallets])

  const ethBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    ethWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [ethWallets])

  const arbEthBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    arbWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [arbWallets])
  const walletBalances = useMemo(() => {
    const solUsdBalances: Record<string, number> = {}
    const ethUsdBalances: Record<string, number> = {}
    const arbEthUsdBalances: Record<string, number> = {}
    const arbUsdcUsdBalances: Record<string, number> = {}

    Object.entries(solBalances).forEach(([address, balance]) => {
      solUsdBalances[address] = balance * (solPrice || 0)
    })

    Object.entries(ethBalances).forEach(([address, balance]) => {
      ethUsdBalances[address] = balance * (ethPrice || 0)
    })

    Object.entries(arbEthBalances).forEach(([address, balance]) => {
      arbEthUsdBalances[address] = balance * (ethPrice || 0)
    })

    Object.entries(arbUsdcBalances).forEach(([address, balance]) => {
      arbUsdcUsdBalances[address] = balance
    })

    return {
      sol: solBalances,
      eth: ethBalances,
      arbEth: arbEthBalances,
      arbUsdc: arbUsdcBalances,
      solUsd: solUsdBalances,
      ethUsd: ethUsdBalances,
      arbEthUsd: arbEthUsdBalances,
      arbUsdcUsd: arbUsdcUsdBalances,
    }
  }, [solBalances, ethBalances, arbEthBalances, arbUsdcBalances, solPrice, ethPrice])

  return {
    walletDex,
    walletBalances,
    activeWallet,
    totalBanlance,
    futuresBalance,
    totalMemeBanlance,
    isLoadingWalletBalance,
    spotNativeTokenBalance,
    listWalletsByActiveChain,
    fundingNativeTokenBalance,

    refetchWalletBalance,
  }
}

export default useWalletOverview
