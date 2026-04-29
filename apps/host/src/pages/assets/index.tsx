import { WalletBalanceDto, WalletDuration } from '@/@generated/gql/graphql-core.ts'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import Funding from '@/components/assets/funding/Funding'
import Futures from '@/components/assets/futures/Futures'
import Meme from '@/components/assets/meme'
import ListWalletPopup from '@/components/assets/overview/ListWalletPopup'
import { Overview } from '@/components/assets/overview/Overview'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useActiveAccount } from '@/hooks/useActiveAccount'
import { useTxDetail } from '@/hooks/useTxDetail'
import { walletClient } from '@/lib/gql/apollo-client'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import ls from '@/lib/local-storage.ts'
import { useSubscription } from '@/lib/mqtt'
import { formatAddressWallet, formatEmail } from '@/lib/string'
import { cn } from '@/lib/utils'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { useAppSelector } from '@/redux/store'
import { getWithdrawStatistics } from '@/services/wallet.service.ts'
import { ChainIds, FundingType } from '@/types/enums.ts'
import { UITab } from '@/types/uiTabs.ts'
import { useMutation } from '@apollo/client'
import {
  AssetOverviewContextState,
  AssetOverviewProvider,
  WalletBalance,
} from '@components/assets/overview/AssetOverviewContext.tsx'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { Splash } from '@components/assets/Splash.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { usePreference } from '@hooks/usePreference.ts'
import { useTotalBalance } from '@pages/assets/overview/hooks/useTotalBalance.ts'
import { OverviewAsset } from '@pages/assets/OverviewAsset.tsx'
import { getWalletBalance, refreshWalletBalance } from '@services/assets.service.ts'
import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import FuturesAsset from './FuturesAsset'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'
import { PredictionAsset } from './PredictionAsset'
import { useMyBalance } from '@/modules/prediction/hooks/useMyBalance.ts'
import { useFeatureIsOn, useGrowthBook } from '@growthbook/growthbook-react'
import { HeaderNotifications } from '@components/header/HeaderNotifications.tsx'
import PrefetchPerpsDepositAddress from '@pages/assets/overview/components/PrefetchPerpsDepositAddress.tsx'

const headerTabs: UITab[] = [
  {
    value: 'assets',
    label: 'assets.overview.title',
  },
  {
    value: 'perps',
    label: 'assets.futures.futures',
  },
  {
    value: 'meme',
    label: 'assets.funding.meme',
  },
  {
    value: 'prediction',
    label: 'assets.prediction.prediction',
  },
]

const periodMap: Record<string, WalletDuration> = {
  '1day': WalletDuration.D1,
  '1week': WalletDuration.W1,
  '1month': WalletDuration.M1,
  '1year': WalletDuration.Y1,
}

export const usePrices = () => {
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

const AssetsPage = () => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const activeAccount = useActiveAccount()
  const activeWallet = useSelector(_activeWallet)
  const { wallet } = useWallet()
  const { email, walletAddressLogin } = useAppSelector((state) => state.newWallet) as any
  const [showListWallets, setShowListWallets] = useState<boolean>(false)

  const [selectedWallet, setSelectedWallet] = useState<UserEmbeddedWalletDto | null>(null)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  const solWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'SOLANA')
  const ethWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'EVM')
  const arbWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'ARB')
  const bscWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'BSC')
  const location = useLocation()

  const currentTab = useMemo(() => {
    return location.pathname.split('/').pop() || 'assets'
  }, [location.pathname])

  const [hideBalance, setHideBalance] = useState(ls.get('asset_hide_balance') === '1')
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)
  const {
    totalBalance,
    changeAmount,
    changePercentage,
    overviewExpandData,
    firstItem,
    fundingChange,
    futuresChange,
    fundingBalance,
    futuresBalance,
    unrealizedPnlFunding,
    fundingBalanceChange,
    loadingFundingBalance,
    loadingFuturesBalance,
  } = useTotalBalance()
  const {
    totalBalance: predictionBalance,
    isLoading: loadingPredictionBalance,
    usdcBalance: predictionUsdcBalance,
  } = useMyBalance()

  const [data, setData] = useState<WalletBalance>({
    funding: undefined,
    futures: undefined,
    spot: undefined,
  })
  const userId = useSelector(_userInfo)?.userId

  const { preference, updatePreference } = usePreference()
  const [withdrawProcessing, setWithdrawProcessing] = useState<number>(0)
  const [lastTx, setLastTx] = useState<FundingRecord | null>(null)
  const [showLastTx, setShowLastTx] = useState<boolean>(false)
  const { txDetail, openTxDetail } = useTxDetail()
  const prevTxDetailRef = useRef<FundingRecord | null>(null)
  const [refreshWalletBalanceMutation] = useMutation(refreshWalletBalance)

  const selectedChainId = useMemo(() => {
    switch (selectedWallet?.chain) {
      case ChainType.Evm:
        return ChainIds.Ethereum
      case ChainType.Arb:
        return ChainIds.Arbitrum
      case ChainType.Tron:
        return ChainIds.TRX
      case ChainType.Solana:
        return ChainIds.Solana
      case ChainType.Bsc:
        return ChainIds.Bsc
      default:
        return ChainIds.Solana
    }
  }, [selectedWallet])

  useEffect(() => {
    if (!isDesktop && preference.assetTimeRange !== '1day') {
      updatePreference({ assetTimeRange: '1day' })
    }
  }, [isDesktop, preference.assetTimeRange])

  const cachedChainId = ls.get('asset_chain_id') || ChainIds.Solana
  const cachedWalletAddress = ls.get('asset_wallet_address') || ''

  useEffect(() => {
    if (selectedWallet) return
    const chainId = +cachedChainId || ChainIds.Solana
    if (chainId === ChainIds.Solana) {
      const wallet = solWallets.find((item) => item.walletAddress === cachedWalletAddress)
      setSelectedWallet(wallet || solWallets[0])
    } else if (chainId === ChainIds.Ethereum) {
      const wallet = ethWallets.find((item) => item.walletAddress === cachedWalletAddress)
      setSelectedWallet(wallet || ethWallets[0])
    } else if (chainId === ChainIds.Arbitrum) {
      const wallet = arbWallets.find((item) => item.walletAddress === cachedWalletAddress)
      setSelectedWallet(wallet || arbWallets[0])
    } else if (chainId === ChainIds.Bsc) {
      const wallet = bscWallets.find((item) => item.walletAddress === cachedWalletAddress)
      setSelectedWallet(wallet || bscWallets[0])
    }
  }, [solWallets, ethWallets, arbWallets, bscWallets, cachedWalletAddress, cachedChainId, activeWallet])

  const { message: messageWithdrawStatisticsUpdate } = useSubscription(`users/${userId}/withdraw_statistics_updated`, {
    clientOptions: { qos: 1 },
  })

  useEffect(() => {
    if (!messageWithdrawStatisticsUpdate) return
    try {
      const message = messageWithdrawStatisticsUpdate?.message
      const data = JSON.parse(message?.toString() || '')
      if (data) {
        setWithdrawProcessing(data.totalProcessing || 0)
      }
    } catch (error) {
      return
    }
  }, [messageWithdrawStatisticsUpdate])

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

  const enablePrediction = useFeatureIsOn('enable_prediction')

  // Debugging GrowthBook
  // const growthbook = useGrowthBook()
  // useEffect(() => {
  //   if (growthbook) {
  //     console.log('GrowthBook Attributes:', growthbook.getAttributes())
  //     console.log('Feature "enable_prediction" detail:', growthbook.evalFeature('enable_prediction'))
  //   }
  // }, [growthbook])
  // console.log('{AssetsPage} enablePrediction: ', enablePrediction);

  const isHidden = (tab: UITab) => tab.value === 'prediction' && !enablePrediction
  const tabs: UITab[] = headerTabs
    .map((tab) =>
      isHidden(tab)
        ? null
        : {
            value: tab.value,
            label: t(tab.label),
          },
    )
    .filter((i) => !!i)

  const contextValue: AssetOverviewContextState = useMemo(() => {
    return {
      hideBalance,
      toggleHideBalance: setHideBalance,
      walletBalanceData: data,
      selectedWallet,
      selectedChainId,
      setSelectedWallet,
      totalBalance,
      fundingBalance,
      futuresBalance,
      changeAmount,
      changePercentage,
      unrealizedPnlFunding,
      fundingBalanceChange,
      overviewExpandData,
      firstItem,
      fundingChange,
      futuresChange,
      loadingFundingBalance,
      loadingFuturesBalance,
      predictionBalance,
      predictionUsdcBalance,
      loadingPredictionBalance,
    } as AssetOverviewContextState
  }, [
    hideBalance,
    setHideBalance,
    data,
    selectedWallet,
    selectedChainId,
    totalBalance,
    fundingBalance,
    futuresBalance,
    changeAmount,
    changePercentage,
    unrealizedPnlFunding,
    fundingBalanceChange,
    overviewExpandData,
    firstItem,
    fundingChange,
    futuresChange,
    loadingFundingBalance,
    loadingFuturesBalance,
    predictionBalance,
    predictionUsdcBalance,
    loadingPredictionBalance,
  ])

  useEffect(() => {
    ls.set('asset_hide_balance', hideBalance ? '1' : '0')
  }, [hideBalance])

  const { solPrice, ethPrice, bnbPrice } = usePrices()

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

  const walletBalances = useMemo(() => {
    const solUsdBalances: Record<string, number> = {}
    const ethUsdBalances: Record<string, number> = {}
    const arbEthUsdBalances: Record<string, number> = {}
    const arbUsdcUsdBalances: Record<string, number> = {}
    const bnbUsdBalances: Record<string, number> = {}

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
    }
  }, [solBalances, ethBalances, arbEthBalances, arbUsdcBalances, solPrice, ethPrice, bnbPrice, bnbBalances])

  const navigate = useNavigate()

  const handleTabChanged = (tab: string) => {
    switch (tab) {
      case 'assets':
        navigate('/assets', { replace: true })
        break
      case 'perps':
        navigate('/assets/perps', { replace: true })
        break
      case 'meme':
        navigate('/assets/meme', { replace: true })
        break
      case 'prediction':
        navigate('/assets/prediction', { replace: true })
        break
      default:
        navigate('/assets', { replace: true })
        break
    }
  }

  const fetchWithdrawStatistics = async () => {
    try {
      const { data } = await walletClient.query({
        query: getWithdrawStatistics,
        variables: {
          input: {
            chainId: selectedChainId,
            walletAddress: selectedWallet?.walletAddress,
          },
        },
      })
      const statistics = data.getWithdrawStatistics
      setWithdrawProcessing(statistics.totalProcessing || 0)
      if (statistics.totalProcessing > 0) {
        const temp = statistics.processingItems[0]
        const lastTxRecord: FundingRecord = {
          id: temp.id,
          createdAt: temp.createdAt,
          type: FundingType.Withdraw,
          status: temp.status,
          token: temp.token,
          chainId: temp.chainId,
          amount: temp.amount,
          from: temp.fromAddress,
          to: temp.toAddress,
          txHash: temp.txid,
          errorMessage: temp.errorMessage,
          errorCode: temp.errorCode,
          fee: temp.fee,
          blockNumber: temp.blockNumber,
          timestamp: 0,
          address: '',
          tokenAccount: '',
          toChainId: 0,
          toToken: '',
          toAmount: 0,
          route: '',
          crossChainFee: 0,
          crossChainFeeUnit: '',
          depositChainId: temp.chainId || 0,
        }
        setLastTx(lastTxRecord)
      }
    } catch (error) {
      console.error('Error fetchWithdrawStatistics', error)
    }
  }

  useEffect(() => {
    if (showLastTx && lastTx) {
      openTxDetail(lastTx)
    }
  }, [lastTx, openTxDetail, showLastTx])

  useEffect(() => {
    if (prevTxDetailRef.current && !txDetail) {
      setShowLastTx(false)
    }
    prevTxDetailRef.current = txDetail
  }, [txDetail])

  const {
    data: apiWalletBalanceData,
    refetch: refetchWalletBalance,
    isLoading,
  } = useQuery({
    queryKey: ['getWalletBalance', preference.assetTimeRange, userId],
    enabled: !!preference.assetTimeRange && activeWallet.isConnected,
    queryFn: async () => {
      const res = await gqlClient.query({
        query: getWalletBalance,
        variables: {
          input: {
            duration: periodMap[preference.assetTimeRange],
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

  const handleRefreshWalletBalance = async (chainId: number, wallets: [string]) => {
    try {
      await refreshWalletBalanceMutation({
        variables: {
          input: {
            chainId,
            wallets: wallets,
          },
        },
      })
      await refetchWalletBalance()
    } catch (error) {
      console.error('Error refreshing wallet balance:', error)
    }
  }

  useEffect(() => {
    if (selectedWallet?.walletAddress && currentTab !== 'Futures') {
      fetchWithdrawStatistics()
    }
  }, [selectedWallet?.walletAddress, currentTab])

  useEffect(() => {
    if (selectedWallet?.walletAddress) {
      handleRefreshWalletBalance(selectedChainId, [selectedWallet?.walletAddress]).then(() => {})
    }
  }, [selectedWallet?.walletAddress])

  useEffect(() => {
    ls.set('asset_chain_id', selectedChainId)
    ls.set('asset_wallet_address', selectedWallet?.walletAddress || '')
  }, [selectedChainId, selectedWallet])

  const renderTabContent = (tab: string) => {
    if (tab === 'assets') {
      if (isDesktop) return <OverviewAsset />
      return (
        <Overview
          walletBalances={walletBalances}
          predictionBalance={predictionBalance}
          loadingPredictionBalance={loadingPredictionBalance || loadingPredictionBalance}
        />
      )
    }
    if (tab === 'meme') {
      if (isDesktop) return <Meme />
      return <Funding />
    }
    if (tab === 'perps') {
      if (isDesktop) return <FuturesAsset walletBalances={walletBalances} />
      return <Futures walletBalances={walletBalances} />
    }
    if (tab === 'prediction') {
      return <PredictionAsset />
    }
  }

  useEffect(() => {
    refetchWalletBalance()
  }, [currentTab])

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(email ?? walletAddressLogin).then(setSrc)
  }, [email, walletAddressLogin])

  const IconActiveAccount = useMemo(() => {
    return <img data-avatar-type="wallet" src={src} alt="Wallet" className="size-8 rounded-[6px]" />
  }, [email, walletAddressLogin, src])

  if (!activeWallet.isConnected) return <Splash />

  if (isDesktop) {
    return (
      <AssetOverviewProvider value={contextValue}>
        <div className="relative bg-transparent h-full mx-auto">
          <div
            id="asset-page-container"
            className={cn(
              'relative no-scrollbar flex flex-col bg-[#0A0A0A] pt-15',
              isShowMaintenanceNotification ? 'h-[calc(100vh-129px)]' : 'h-[calc(100vh-97px)]',
            )}
          >
            <div
              className={cn(
                'w-full fixed z-20 py-3 bg-[#0A0A0A]',
                isShowMaintenanceNotification ? 'top-[92px]' : 'top-[60px]',
              )}
            >
              <MovingLineTabs
                tabs={tabs}
                disabledTabs={[]}
                defaultTab={currentTab}
                onTabChange={(tab) => handleTabChanged(tab)}
                itemClassName="font-semibold text-[16px] font-normal text-[#908E98]"
                itemClassNameActive="font-semibold text-[16px] text-white"
                containerClassName="justify-start bg-transparent"
              />
            </div>
            {/* {withdrawProcessing !== 0 && (
              <div className="p-2.5 mx-4 bg-linear-to-r from-[#FF454833] to-[#FF454814] rounded-[4px] flex items-center justify-between">
                <span className="text-white text-[12px]">
                  {t('assets.withdrawal.processingCount', { count: withdrawProcessing })}
                </span>
                <img
                  className="-rotate-90 cursor-pointer"
                  alt=""
                  src="/images/assets/arrow-down.svg"
                  onClick={() => setShowLastTx(true)}
                />
              </div>
            )} */}
            <div className="flex-1 p-4 overflow-x-hidden overflow-y-auto no-scrollbar">
              {renderTabContent(currentTab)}
            </div>
          </div>
        </div>
      </AssetOverviewProvider>
    )
  }

  return (
    <AssetOverviewProvider value={contextValue}>
      <div className="relative bg-transparent h-full">
        <div className="relative h-full no-scrollbar flex flex-col">
          {!isDesktop && <div className="bg-[url('/images/assets-bg.png')] bg-cover h-[440px]"></div>}
          <div
            className={
              isDesktop ? '' : 'absolute top-0 left-0 right-0 min-h-dvh'
            }
          >
            <div className="pt-3 bg-transparent">
              <div className="px-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {IconActiveAccount}
                  <span className="text-[16px] font-medium text-white">
                    {email ? formatEmail(email, 5) : formatAddressWallet(walletAddressLogin, 5, 5)}
                  </span>
                  <img
                    src="/images/icons/ic-copy.svg"
                    className="size-3.5 cursor-pointer"
                    alt=""
                    onClick={() => setShowListWallets(!showListWallets)}
                  />
                </div>
                <HeaderNotifications />
              </div>
              {isDesktop ? (
                <MovingLineTabs
                  tabs={tabs}
                  disabledTabs={[]}
                  defaultTab={currentTab}
                  onTabChange={(tab) => handleTabChanged(tab)}
                  containerClassName="mt-1 justify-start bg-transparent after:hidden after:h-0 after:w-0"
                  tabLineClassName="before:h-[5px] before:rounded-t-[5px] before:bg-[#843BEA]"
                />
              ) : (
                <MovingLineTabs
                  tabs={tabs}
                  disabledTabs={[]}
                  defaultTab={currentTab}
                  onTabChange={(tab) => handleTabChanged(tab)}
                  containerClassName="mt-4 px-4 after:h-[0px] justify-start bg-transparent"
                  tabsListClassName="items-center justify-start gap-2"
                  itemClassName="px-3 py-2 !text-[14px] rounded-full whitespace-nowrap !bg-white/10 text-white font-normal"
                  itemClassNameActive="!bg-white !text-[#0A0A0A] !font-medium"
                  showTabLine={false}
                />
              )}
            </div>
            {/* <div className="bg-linear-to-b from-[#1E1E24] to-[#0A0A0A]">
              {withdrawProcessing !== 0 && (
                <div className="p-2.5 bg-linear-to-r from-[#FF454833] to-[#FF454814] rounded-[4px] flex items-center justify-between">
                  <span className="text-white text-[12px]">
                    {t('assets.withdrawal.processingCount', { count: withdrawProcessing })}
                  </span>
                  <img
                    className="-rotate-90 cursor-pointer"
                    alt=""
                    src="/images/assets/arrow-down.svg"
                    onClick={() => setShowLastTx(true)}
                  />
                </div>
              )}
            </div> */}
            <div className="flex-1">{renderTabContent(currentTab)}</div>
          </div>
        </div>
      </div>
      <ListWalletPopup open={showListWallets} setOpen={setShowListWallets} />
    </AssetOverviewProvider>
  )
}

export default AssetsPage
