import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { useSubscription } from '@/lib/mqtt'
import { MathFun } from '@/lib/utils'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { getExchangeMetaV2 } from '@/services/swap.service'
import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useMultiChainBalances } from '../hook/useMultiChainBalances'
import { Chain, Token } from '../types/ExchangeMeta'

import { FundingType, TransferStatus } from '@/types/enums.ts'

interface TransferContextType {
  chains: Chain[] | null
  tokens: Token[] | null
  isFetching: boolean
  hyperliquidWithdrawable: string
}

const TransferContext = createContext<TransferContextType>({
  chains: null,
  tokens: null,
  isFetching: true,
  hyperliquidWithdrawable: '',
})

const decimalOverrides: Record<string, number> = {
  ETHEREUM_ETH: 5,
  SOLANA_SOL: 5,
  ARBITRUM_ETH: 5,
  ARBITRUM_USDC: 2,
  BSC_BNB: 5,
  MONAD_MON: 5,
}

const coinPriorityMap: Record<string, number> = {
  SOLANA_SOL: 1,
  BSC_BNB: 2,
  ARBITRUM_USDC: 3,
  ARBITRUM_ETH: 4,
  ETHEREUM_ETH: 5,
  MONAD_MON: 6,
}

const chainSortOrder: Record<string, number> = {
  ALL: 0,
  SOLANA: 1,
  BSC: 2,
  ARBITRUM: 3,
  ETHEREUM: 4,
  MONAD: 5,
}

const ARBITRUM_CHAIN_ICON = '/images/cryptoDeposit/arbitrum-chain.png'
const ARBITRUM_ETH_ICON = '/images/cryptoDeposit/ethereum.svg'
const ARBITRUM_USDC_ICON = '/images/cryptoDeposit/usdc.svg'
const ETHEREUM_CHAIN_ICON = '/images/cryptoDeposit/ethereum.svg'
const ETHEREUM_ETH_ICON = '/images/cryptoDeposit/ethereum.svg'
const SOLANA_CHAIN_ICON = '/images/cryptoDeposit/solana.svg'
const SOLANA_SOL_ICON = '/images/cryptoDeposit/solana.svg'
const BSC_BNB_ICON = '/images/bnb.svg'
const MONAD_MON_ICON = '/images/icons/chains/ic-monad.svg'

export const fetchArbUsdcBalance = async (walletAddress: string): Promise<number> => {
  const endpoint = `https://arb1.arbitrum.io/rpc`
  const USDC_ADDRESS = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
  const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)']
  const provider = new ethers.JsonRpcProvider(endpoint)
  const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider)
  const [balanceRaw, decimals] = await Promise.all([usdcContract.balanceOf(walletAddress), usdcContract.decimals()])
  const balance = ethers.formatUnits(balanceRaw, decimals)
  return parseFloat(balance)
}

const usePrices = () => {
  const priceList = useAppSelector((state) => state.price.list)
  return useMemo(() => {
    return {
      solPrice: priceList['SOL'],
      ethPrice: priceList['ETH'],
      bnbPrice: priceList['BNB'],
      monPrice: priceList['MON'],
    }
  }, [priceList])
}

export const TransferProvider = ({ children, isFutures }: { children: ReactNode; isFutures?: boolean }) => {
  const { t } = useTranslation()
  const userId = useSelector(_userInfo)?.userId
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  const { hyperliquidWithdrawable } = useMultiChainBalances()

  const EVMAddress = useSelector(_walletDex)?.walletAddress

  const [chains, setChains] = useState<Chain[] | null>(null)
  const [tokens, setTokens] = useState<Token[] | null>(null)
  const [isFetching, setIsFetching] = useState(true)

  const { solPrice, ethPrice, bnbPrice, monPrice } = usePrices()

  const solWallets = useMemo(
    () => listWalletsByChain.filter((wallet) => wallet.chain === 'SOLANA'),
    [listWalletsByChain],
  )
  const ethWallets = useMemo(() => listWalletsByChain.filter((wallet) => wallet.chain === 'EVM'), [listWalletsByChain])
  const arbWallets = useMemo(() => listWalletsByChain.filter((wallet) => wallet.chain === 'ARB'), [listWalletsByChain])
  const bscWallets = useMemo(() => listWalletsByChain.filter((wallet) => wallet.chain === 'BSC'), [listWalletsByChain])
  const monadWallets = useMemo(
    () => listWalletsByChain.filter((wallet) => wallet.chain === 'MON'),
    [listWalletsByChain],
  )

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

  const bnbBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    bscWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [bscWallets])

  const monBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    monadWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [monadWallets])

  const { data: arbUsdcBalances = {}, refetch } = useQuery({
    queryKey: ['arbUsdcBalances', arbWallets],
    queryFn: async () => {
      const balances: Record<string, number> = {}
      for (const wallet of arbWallets) {
        balances[wallet.walletAddress] = await fetchArbUsdcBalance(wallet.walletAddress)
      }
      return balances
    },
  })

  const walletBalances = useMemo(() => {
    const solUsdBalances: Record<string, number> = {}
    const ethUsdBalances: Record<string, number> = {}
    const arbEthUsdBalances: Record<string, number> = {}
    const arbUsdcUsdBalances: Record<string, number> = {}
    const bnbUsdBalances: Record<string, number> = {}
    const monUsdBalances: Record<string, number> = {}

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
      arbUsdcUsdBalances[address] = typeof balance === 'number' ? balance : 0
    })

    Object.entries(bnbBalances).forEach(([address, balance]) => {
      bnbUsdBalances[address] = balance * (bnbPrice || 0)
    })

    Object.entries(monUsdBalances).forEach(([address, balance]) => {
      monUsdBalances[address] = balance * (monPrice || 0)
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
      bnb: bnbBalances,
      bnbUsd: bnbUsdBalances,
      mon: monBalances,
      monUsd: monUsdBalances,
    }
  }, [solBalances, ethBalances, arbEthBalances, arbUsdcBalances, solPrice, ethPrice, bnbPrice, bnbBalances, monBalances, monPrice])

  const { message: fundingHistoriesUpdated } = useSubscription(`users/${userId}/funding_histories_updated`, {
    shouldSkip: !userId,
  })

  useEffect(() => {
    if (!fundingHistoriesUpdated) return
    try {
      const message = fundingHistoriesUpdated?.message
      const data = JSON.parse(message?.toString() || '')
      if (data) {
        const latestTxData = data[0]
        if (latestTxData) {
          const type = latestTxData?.type
          const isFutureType = type === FundingType.DepositFuture || type === FundingType.WithdrawFuture
          const status = latestTxData?.status
          if (status === TransferStatus.Success && isFutureType) {
            refetch()
          }
        }
      }
    } catch (error) {
      console.error('Error parsing fundingHistoriesUpdated:', error)
    }
  }, [fundingHistoriesUpdated])

  const sortTokens = (tokens: Token[]) => {
    const getPriority = (token: Token): number => {
      const key = `${token.chainName?.toUpperCase()}_${token.symbol.toUpperCase()}`
      return coinPriorityMap[key] ?? 999 // default low priority if not in map
    }

    return [...tokens].sort((a, b) => {
      const valueA = a.usdValue ?? 0
      const valueB = b.usdValue ?? 0

      if (valueA !== valueB) {
        // Sort by usdValue descending
        return valueB - valueA
      }

      // If usdValue is same, use priority map
      const priorityA = getPriority(a)
      const priorityB = getPriority(b)

      return priorityA - priorityB
    })
  }

  const overrideIcons = (token: Token): Partial<Token> => {
    const { chainName, symbol } = token
    switch (chainName) {
      case 'ARBITRUM':
        return {
          chainImage: ARBITRUM_CHAIN_ICON,
          image: symbol === 'ETH' ? ARBITRUM_ETH_ICON : symbol === 'USDC' ? ARBITRUM_USDC_ICON : token.image,
        }
      case 'ETHEREUM':
        return {
          chainImage: ETHEREUM_CHAIN_ICON,
          image: symbol === 'ETH' ? ETHEREUM_ETH_ICON : token.image,
        }
      case 'SOLANA':
        return {
          chainImage: SOLANA_CHAIN_ICON,
          image: symbol === 'SOL' ? SOLANA_SOL_ICON : token.image,
        }
      case 'BSC':
        return {
          chainImage: BSC_BNB_ICON,
          image: symbol === 'BNB' ? BSC_BNB_ICON : token.image,
        }
      case 'MONAD':
        return {
          chainImage: MONAD_MON_ICON,
          image: symbol === 'MON' ? MONAD_MON_ICON : token.image,
        }
      default:
        return {}
    }
  }

  useEffect(() => {
    const fetchExchangeMeta = async () => {
      const { data } = await symbolDexClient.query({
        query: getExchangeMetaV2,
      })

      const chains: Chain[] = data.getExchangeMetaV2.chains

      setChains(() => {
        const defaultChain = {
          chainId: 'all',
          chainImage: '/images/cryptoDeposit/global.svg',
          chainName: t('assets.transfers.allNetworks'),
          tokens: tokens,
        }
        const sortedChains = [...chains].sort((a, b) => {
          const aPriority = chainSortOrder[a.chainName.toUpperCase()] ?? 999
          const bPriority = chainSortOrder[b.chainName.toUpperCase()] ?? 999
          return aPriority - bPriority
        })

        return [defaultChain, ...sortedChains]
      })

      const tokens: Token[] = chains.flatMap((chain) =>
        chain.tokens.map((token) => ({
          ...token,
          chainId: chain.chainId,
          chainName: chain.chainName.toUpperCase(),
          chainImage: chain.chainImage,
        })),
      )

      let updatedTokens: Token[] = tokens.map((token) => ({
        ...token,
        szDecimals: decimalOverrides[`${token.chainName}_${token.symbol}`] ?? token.decimals,
        ...overrideIcons(token),
      }))

      if (walletBalances) {
        updatedTokens.forEach((token) => {
          if (token.chainName?.toUpperCase() === 'SOLANA') {
            const solanaWallet = listWalletsByChain.filter((w) => w.chain === 'SOLANA')
            token.balance = solanaWallet[0].balance ?? 0
            token.usdValue = MathFun.mul(token.balance, token.usdPrice)
          } else {
            // Build dynamic keys based on chainName + symbol
            if (token.chainName === 'ETHEREUM' && token.symbol === 'ETH') {
              token.balance = walletBalances.eth[EVMAddress]
              token.usdValue = walletBalances.ethUsd[EVMAddress]
            } else if (token.chainName === 'ARBITRUM' && token.symbol === 'ETH') {
              token.balance = walletBalances.arbEth?.[EVMAddress] || 0
              token.usdValue = walletBalances.arbEthUsd?.[EVMAddress] || 0
            } else if (token.chainName === 'ARBITRUM' && token.symbol === 'USDC') {
              token.balance = walletBalances.arbUsdc?.[EVMAddress] || 0
              token.usdValue = walletBalances.arbUsdcUsd?.[EVMAddress] || 0
            } else if (token.chainName === 'BSC' && token.symbol === 'BNB') {
              token.balance = walletBalances.bnb?.[EVMAddress] || 0
              token.usdValue = walletBalances.bnbUsd?.[EVMAddress] || 0
            } else if (token.chainName === 'MONAD' && token.symbol === 'MON') {
              token.balance = walletBalances.mon?.[EVMAddress] || 0
              token.usdValue = walletBalances.monUsd?.[EVMAddress] || 0
            }
          }
        })

        updatedTokens = sortTokens(updatedTokens)
        setTokens(updatedTokens)
        if (isFutures) {
          if (hyperliquidWithdrawable) setIsFetching(false)
        } else {
          setIsFetching(false)
        }
      }
    }
    fetchExchangeMeta()
  }, [hyperliquidWithdrawable, walletBalances])

  const contextValue = useMemo(
    () => ({ chains, tokens, isFetching, hyperliquidWithdrawable }),
    [chains, tokens, isFetching, hyperliquidWithdrawable],
  )

  return <TransferContext.Provider value={contextValue}>{children}</TransferContext.Provider>
}

export const useTransferContext = () => {
  const context = useContext(TransferContext)
  if (!context) {
    throw new Error('useTransferContext must be used within a TransferProvider')
  }
  return context
}
