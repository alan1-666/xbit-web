import {
  TransactionClassification,
  TransactionDto,
  TxType as TransactionType,
} from '@/@generated/gql/graphql-future.ts'
import { ClassificationStatisticType } from '@/@generated/gql/graphql-meme2.ts'
import PurchaseMarkDrawer from '@/components/chart/purchaseMarkDrawer/index.tsx'
import eventBus from '@/lib/eventBus'
import { futureClient, gqlClient } from '@/lib/gql/apollo-client.ts'
import { cn } from '@/lib/utils.ts'
import {
  setAddress,
  setData,
  setEndDate,
  setMaxAmount,
  setMinAmount,
  setStartDate,
  TokenDetailState,
} from '@/redux/modules/tokenDetail.slice.ts'
import {
  setCurrentFilterTradeTab,
  setCurrentTradingCheckBasic,
  setCurrentTradingCheckBot,
  setCurrentTradingTransactionType,
  TradeTabState,
} from '@/redux/modules/tradeTab.slice.ts'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds, FilterTransactionAmountType, SortByCreateAtType } from '@/types/enums.ts'
import { UITab } from '@/types/uiTabs.ts'
import {convertTimeWheelToTimestamp } from '@/utils/helpers.ts'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import MovingBgTabs from '@components/common/MovingBgTabs.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import FilterAddress, { FilterAddressHandle } from '@components/detaiTokenTable/FilterAddress.tsx'
import FilterTransactionAmount, {
  FilterTransactionAmountHandle,
} from '@components/detaiTokenTable/FilterTransactionAmount.tsx'
import FilterVolume, { FilterVolumeHandle } from '@components/detaiTokenTable/FilterVolume.tsx'
import ModalDateTimePicker, { ModalDateTimePickerHandle } from '@components/detaiTokenTable/ModalDateTimePicker.tsx'
import TokenDetailDataTable, { TokenDetailDataTableHandle } from '@components/detaiTokenTable/TokenDetailDataTable.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useFollowingWallets } from '@hooks/useFollowingWallets.ts'
import { useGetClassificationStatistic } from '@hooks/useGetClassificationStatistic.ts'
import {LIMIT_GET_TRADE_HISTORY } from '@hooks/useGetTradeHistory.ts'
import { useRealtimeTransactions } from '@hooks/useRealtimeTransactions.tsx'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import { getTradingTransactions, getWalletInfo } from '@services/tokens.service.ts'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { EVENT_MESSAGE_ACTION_TAB_TRADE } from '../memeDetail/MemeDetailBottomTabsPc'
import useTokenDetailColumnsMobile from './Columns/useTokenDetailColumnsMobile'
import useTokenDetailColumnsPC from './Columns/useTokenDetailColumnsPC'
import { useDetailTokenTableContext } from './DetailTokenTableContext'
import DialogChangeAlias from './DialogChangeAlias'
import PopoverNumberTX from './PopoverNumberTX'

const sortByMap: Record<SortByCreateAtType, string> = {
  [SortByCreateAtType.DESC]: '-timestamp',
  [SortByCreateAtType.ASC]: '+timestamp',
}

export interface DetailTokenTableProps {
  symbol?: string
  price?: string
  totalSupply?: string
  decimals?: number
  isDesktop?: boolean
}

const txTypeMap: Record<string, RealtimeTransactionType> = {
  Buy: RealtimeTransactionType.Buy,
  Sell: RealtimeTransactionType.Sell,
  Add: RealtimeTransactionType.AddLiquidity,
  Remove: RealtimeTransactionType.RemoveLiquidity,
  Burn: RealtimeTransactionType.Burn,
}

const mapFollowedTransactionToRealtimeTransaction = (transaction: TransactionDto): RealtimeTransaction => {
  return {
    timestamp: transaction.timestamp ? +transaction.timestamp : Date.now(), // Convert to seconds
    type: txTypeMap[transaction.type] || RealtimeTransactionType.Buy,
    maker: transaction.maker,
    baseAmount: transaction.baseAmount ? parseFloat(transaction.baseAmount) : 0,
    nativeAmount: transaction.nativeAmount ? parseFloat(transaction.nativeAmount) : 0,
    usdPrice: transaction.usdPrice ? parseFloat(transaction.usdPrice) : 0,
    volumeUsd: transaction.usdAmount ? parseFloat(transaction.usdAmount) : 0,
    txCount: transaction.tx24h || 0, // Placeholder, should be updated by another topic
    txHash: transaction.txHash || '',
    isSmartMoney: transaction.isSmartMoney || false,
    isWhale: transaction.isWhale || false,
    isSniper: false,
    isBundler: transaction.isDev || false,
    isDev: transaction.isDev || false,
    isNewWallet: transaction.isFreshWallet || false,
    isKOL: transaction.isKOL || false,
    isInsider: transaction.isInsider || false,
    isTopTrader: transaction.isTopTrader || false,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    dex: transaction.dex,
  }
}

export type WalletInfo = {
  label: string | undefined
  holdingPercentage: number
  totalTxs24h: number
}

const fetchWalletsInfo = async (addresses: string[], token: string, chainId: number) => {
  const res = await gqlClient.query({
    query: getWalletInfo,
    variables: {
      input: {
        addresses: addresses.join(','),
        token,
        chainId: chainId,
      },
    },
  })
  return res.data.getWalletInfo
}

const DetailTokenTable = (props: DetailTokenTableProps) => {
  const { symbol, price, totalSupply, decimals, isDesktop } = props
  const {
    currentType,
    listTabs,
    setCurrentType,
    // editName,
    // setEditName
  } = useDetailTokenTableContext()

  const { t } = useTranslation()
  const location = useLocation()

  const dispatch = useAppDispatch()
  const activeChainId = useActiveChainId() ?? ChainIds.Solana

  const [walletsInfo, setWalletsInfo] = useState<Record<string, WalletInfo>>({})

  const {
    minAmount,
    maxAmount,
    minVolume,
    maxVolume,
    sortByCreatedAt,
    address,
    startDate,
    endDate,
    nativeAmountFrom,
    nativeAmountTo,
    transactionType,
  } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)

  const { currentFilterTradeTab, currentTradingCheckBot, currentTradingCheckBasic } = useAppSelector(
    (state: RootState) => state.tradeTab as TradeTabState,
  )
  const [openPurchaseMarkDrawer, setOpenPurchaseMarkDrawer] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  const isXStockPath = useIsXStockPath()

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])

  const { data } = useGetClassificationStatistic({
    token: tokenAddress,
    type: ClassificationStatisticType.Trade,
    chainId: activeChainId,
  })

  //create filter with wallets count
  const tagFilters: UITab[] = useMemo(() => {
    const insiderCount = Number(data?.getClassificationStatistic?.insider)
    const whaleCount = Number(data?.getClassificationStatistic?.whale)
    const kolCount = Number(data?.getClassificationStatistic?.kol)
    const devCount = Number(data?.getClassificationStatistic?.dev)
    const smartMoneyCount = Number(data?.getClassificationStatistic?.smartMoney)
    const sniperCount = Number(data?.getClassificationStatistic?.sniper)
    const newWalletCount = Number(data?.getClassificationStatistic?.fresh)
    const followedCount = Number(data?.getClassificationStatistic?.followed)
    const top10Count = Number(data?.getClassificationStatistic?.top10)
    const bundlerCount = Number(data?.getClassificationStatistic?.bundler)

    return [
      {
        label: t('detail.filters.all'),
        value: TransactionClassification.All,
      },
      {
        label: t('detail.filters.followedWithCount', {
          tagCount: followedCount > 0 ? `(${followedCount === 100 ? '99+' : followedCount})` : '',
        }),
        value: TransactionClassification.Followed,
      },
      {
        label: t('detail.filters.ratWarehouseWithCount', {
          tagCount: insiderCount > 0 ? `(${insiderCount === 100 ? '99+' : insiderCount})` : '',
        }),
        value: TransactionClassification.Insider,
      },
      {
        label: t('detail.filters.kolWithCount', {
          tagCount: kolCount > 0 ? `(${kolCount === 100 ? '99+' : kolCount})` : '',
        }),
        value: TransactionClassification.Kol,
      },
      {
        label: t('detail.filters.projectPartyWithCount', {
          tagCount: devCount > 0 ? `(${devCount === 100 ? '99+' : devCount})` : '',
        }),
        value: TransactionClassification.ProjectParty,
      },
      {
        label: t('detail.filters.smartMoneyWithCount', {
          tagCount: smartMoneyCount > 0 ? `(${smartMoneyCount === 100 ? '99+' : smartMoneyCount})` : '',
        }),
        value: TransactionClassification.SmartMoney,
      },
      {
        label: t('detail.filters.whaleWithCount', {
          tagCount: whaleCount > 0 ? `(${whaleCount === 100 ? '99+' : whaleCount})` : '',
        }),
        value: TransactionClassification.Whale,
      },
      {
        label: t('detail.filters.newWalletWithCount', {
          tagCount: newWalletCount > 0 ? `(${newWalletCount === 100 ? '99+' : newWalletCount})` : '',
        }),
        value: TransactionClassification.Fresh,
      },
      {
        label: t('detail.filters.sniperWithCount', {
          tagCount: sniperCount > 0 ? `(${sniperCount === 100 ? '99+' : sniperCount})` : '',
        }),
        value: TransactionClassification.Sniper,
      },
      {
        label: t('detail.filters.top10WithCount', {
          tagCount: top10Count > 0 ? `(${top10Count === 100 ? '99+' : top10Count})` : '',
        }),
        value: TransactionClassification.Top10,
      },
      {
        label: t('detail.filters.sameOriginWithCount', {
          tagCount: bundlerCount > 0 ? `(${bundlerCount === 100 ? '99+' : bundlerCount})` : '',
        }),
        value: TransactionClassification.Bundlers,
      },
    ]
  }, [t, data?.getClassificationStatistic])

  // not used
  const classificationTypeMap: Record<string, TransactionClassification> = useMemo(() => {
    return {
      [t('detail.filters.followed')]: TransactionClassification.Followed,
      [t('detail.filters.smartMoney')]: TransactionClassification.SmartMoney,
      [t('detail.filters.whale')]: TransactionClassification.Whale,
      [t('detail.filters.sniper')]: TransactionClassification.Sniper,
      [t('detail.filters.projectParty')]: TransactionClassification.ProjectParty,
      [t('detail.filters.ratWarehouse')]: TransactionClassification.Insider,
      [t('detail.filters.newWallet')]: TransactionClassification.Fresh,
      [t('detail.filters.kol')]: TransactionClassification.Kol,
      [t('detail.filters.bundlers')]: TransactionClassification.Bundlers,
    }
  }, [tagFilters])

  const [newTransactionsCount, setNewTransactionsCount] = useState<number>(0)
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState<number | null>(null)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const [currentTab, setCurrentTab] = useState<string>(currentFilterTradeTab || tagFilters[0]?.value)
  const [isRobot, setIsRobot] = useState<boolean>(currentTradingCheckBot ?? true)
  const [isBasicVersion, setIsBasicVersion] = useState<boolean>(currentTradingCheckBasic ?? true)
  const [paused, setPaused] = useState<boolean>(false)
  const [showCountTX, setShowCountTX] = useState<boolean>(false)
  const [optionValue, setOptionValue] = useState<number>(0)
  const [openDrawerFilterState, setOpenDrawerFilterState] = useState({
    openDrawerFilter: false,
    openDrawerFilterAmount: false,
    openDrawerFilterVolume: false,
    openDrawerFilterAddress: false,
    openDropdownFilterType: false,
  })

  const tableRef = useRef<TokenDetailDataTableHandle>(null)

  const datePickerRef = useRef<ModalDateTimePickerHandle>(null)
  const amountRef = useRef<FilterTransactionAmountHandle>(null)
  const volumeRef = useRef<FilterVolumeHandle>(null)
  const addressRef = useRef<FilterAddressHandle>(null)

  const visibleRowsRef = useRef<RealtimeTransaction[]>([])

  const followingWallets = useFollowingWallets()

  const classification = useMemo(() => {
    if (isXStockPath) return undefined
    return (currentTab as TransactionClassification) ?? undefined
  }, [isXStockPath, currentTab])

  const queryInput = useMemo(() => {
    return {
      token: tokenAddress,
      chainId: activeChainId,
      type: transactionType,
      address: address ? address : undefined,
      transactionUsdAmountFrom: minAmount > 0 ? minAmount : undefined,
      transactionUsdAmountTo: maxAmount > 0 ? maxAmount : undefined,
      transactionVolumeFrom: minVolume > 0 ? Number(minVolume) : undefined,
      transactionVolumeTo: maxVolume > 0 ? Number(maxVolume) : undefined,
      timestampFrom: startDate ? `${Number(convertTimeWheelToTimestamp(startDate))}` : undefined,
      timestampTo: endDate ? `${Number(convertTimeWheelToTimestamp(endDate))}` : undefined,
      sortBy: sortByCreatedAt ? sortByMap[sortByCreatedAt] : undefined,
      //filterRobot: !isRobot,
      classification: classification,
      nativeAmountFrom: nativeAmountFrom > 0 ? nativeAmountFrom : undefined,
      nativeAmountTo: nativeAmountTo > 0 ? nativeAmountTo : undefined,
    }
  }, [
    tokenAddress,
    activeChainId,
    transactionType,
    address,
    minAmount,
    maxAmount,
    minVolume,
    maxVolume,
    startDate,
    endDate,
    sortByCreatedAt,
    isRobot,
    currentTab,
    classification,
    nativeAmountTo,
    nativeAmountFrom,
  ])

  const {
    data: transactions,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['tradingTransactions', queryInput],
    initialPageParam: undefined,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage: RealtimeTransaction[]) => {
      if (!lastPage || lastPage.length < LIMIT_GET_TRADE_HISTORY) return undefined
      const lastItem = lastPage.slice(-1)[0]
      return lastItem ? lastItem.timestamp : undefined
    },
    queryFn: async ({ pageParam }) => {
      const { data } = await futureClient.query({
        query: getTradingTransactions,
        variables: {
          input: {
            ...queryInput,
            lastTimestamp: pageParam ? `${pageParam}` : undefined,
          },
        },
      })
      return data.getTradingTransactions.data.map((item) =>
        mapFollowedTransactionToRealtimeTransaction(item),
      ) as RealtimeTransaction[]
    },
  })

  const rawTransactions = useMemo(() => {
    if (!transactions || transactions.pages.length === 0) return []
    return transactions.pages.flatMap((page) => page)
  }, [transactions])

  const realtimeTransactions = useRealtimeTransactions()
  const [lastTransactions, setLastTransactions] = useState<RealtimeTransaction[]>([])

  useEffect(() => {
    if (paused) return
    setLastTransactions(realtimeTransactions)
  }, [realtimeTransactions, paused])

  useEffect(() => {
    setLastTransactions([])
  }, [tokenAddress])

  const filteredTransactions = useMemo(() => {
    const timestampFrom = startDate ? convertTimeWheelToTimestamp(startDate) : 0
    const timestampTo = endDate ? convertTimeWheelToTimestamp(endDate) : null

    return lastTransactions.filter((tx) => {
      // filter by tx type
      if (
        transactionType === TransactionType.Buy &&
        tx.type !== RealtimeTransactionType.Buy &&
        tx.type !== RealtimeTransactionType.AddLiquidity
      ) {
        return false
      }
      if (
        transactionType === TransactionType.Sell &&
        tx.type !== RealtimeTransactionType.Sell &&
        tx.type !== RealtimeTransactionType.RemoveLiquidity
      ) {
        return false
      }
      // filter by address
      if (address && tx.maker !== address) return false
      // filter by amount
      if (minAmount > 0 && tx.volumeUsd < minAmount) return false
      if (maxAmount > 0 && tx.volumeUsd > maxAmount) return false
      // filter by sol
      if (nativeAmountTo > 0 && tx.nativeAmount > nativeAmountTo) return false
      if (nativeAmountFrom > 0 && tx.nativeAmount < nativeAmountFrom) return false
      // filter by volume
      if (minVolume > 0 && tx.baseAmount < minVolume) return false
      if (maxVolume > 0 && tx.baseAmount > maxVolume) return false
      // filter by date
      if (timestampFrom && +tx.timestamp < timestampFrom) return false
      if (timestampTo && +tx.timestamp > timestampTo) return false

      // Check classification
      if (classification === TransactionClassification.SmartMoney && !tx.isSmartMoney) return false
      if (classification === TransactionClassification.Whale && !tx.isWhale) return false
      // TODO: Temporarily check for dev wallets, assuming sniper is a dev wallet
      if (classification === TransactionClassification.Sniper && !tx.isDev) return false
      if (classification === TransactionClassification.ProjectParty && !tx.isDev) return false
      if (classification === TransactionClassification.Insider && !tx.isInsider) return false
      if (classification === TransactionClassification.Fresh && !tx.isNewWallet) return false
      if (classification === TransactionClassification.Kol && !tx.isKOL) return false
      if (classification === TransactionClassification.SameSource && !tx.isDev) return false
      if (classification === TransactionClassification.Followed && !followingWallets.includes(tx.maker)) return false

      //  Temporarily do not receive data from socket while in TOP10 tab, when be supports more fields for filtering, it will be processed later
      if (classification === TransactionClassification.Top10) return false

      // If all conditions are met, include the transaction
      return true
    })
  }, [
    lastTransactions,
    transactionType,
    address,
    minAmount,
    maxAmount,
    minVolume,
    maxVolume,
    startDate,
    endDate,
    currentTab,
    sortByCreatedAt,
    followingWallets,
    classification,
  ])
  const tradingTransactions = useMemo(() => {
    if (!lastTransactions || lastTransactions.length === 0) return rawTransactions
    const lastTimestamp = rawTransactions?.[0]?.timestamp || '0'
    const newTxs = filteredTransactions.filter((tx) => +tx.timestamp > +lastTimestamp)
    const mergedTransactions = []
    // Apply merge logic if needed
    let i = 0
    let j = 0
    while (i < newTxs.length && j < rawTransactions.length) {
      const realtimeTxTimestamp = +newTxs[i].timestamp
      const rawTxTimestamp = +rawTransactions[j].timestamp
      if (realtimeTxTimestamp >= rawTxTimestamp) {
        mergedTransactions.push(newTxs[i])
        i++
      } else {
        mergedTransactions.push(rawTransactions[j])
        j++
      }
    }
    // Add any remaining transactions from newTxs or rawTransactions
    while (i < newTxs.length) {
      mergedTransactions.push(newTxs[i])
      i++
    }
    while (j < rawTransactions.length) {
      mergedTransactions.push(rawTransactions[j])
      j++
    }

    if (sortByCreatedAt === SortByCreateAtType.DESC) {
      return mergedTransactions
    } else {
      return [...mergedTransactions].reverse()
    }
  }, [rawTransactions, filteredTransactions, sortByCreatedAt])

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    dispatch(setCurrentFilterTradeTab(tab))
  }
  const handleOnChangeIsRobot = (status?: boolean) => {
    dispatch(setCurrentTradingCheckBot(status))
    setIsRobot(!!status)
  }
  const handleOnChangeIsBasicVersion = (status?: boolean) => {
    dispatch(setCurrentTradingCheckBasic(status))
    setIsBasicVersion(!status)
  }

  const loadMoreFn = useCallback(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return false
    fetchNextPage().then(() => {})
    return true
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage])

  useEffect(() => {
    return () => {
      dispatch(setData([]))
    }
  }, [])

  const handleVisibleRowsChange = useCallback((visibleItems: RealtimeTransaction[]) => {
    visibleRowsRef.current = visibleItems
  }, [])

  useEffect(() => {
    const iv = setInterval(() => {
      const visibleWallets = visibleRowsRef.current.map((item) => item.maker).filter((item) => item && item.length > 0)

      // Deduplicate wallets
      const uniqueWallets = Array.from(new Set(visibleWallets)).slice(0, 20)

      // Fetch wallet info
      if (visibleWallets.length === 0) return

      fetchWalletsInfo(uniqueWallets, tokenAddress, activeChainId)
        .then((wallets) => {
          const walletsInfo: Record<string, WalletInfo> = {}
          wallets.forEach((wallet, index) => {
            walletsInfo[uniqueWallets[index]] = {
              label: wallet.label || undefined,
              holdingPercentage: (+(wallet.currentHolding || 0) / +(wallet.maxHolding || 0)) * 100 || 0,
              totalTxs24h:
                (wallet.totalBuyTxs ? +wallet.totalBuyTxs : 0) + (wallet.totalSellTxs ? +wallet.totalSellTxs : 0),
            }
          })
          setWalletsInfo((prevState) => ({
            ...prevState,
            ...walletsInfo,
          }))
        })
        .catch((error) => {
          console.error('Error fetching wallet info:', error)
        })
    }, 10000)
    return () => {
      clearInterval(iv)
    }
  }, [])

  // Reset wallets info when tokenAddress changes
  useEffect(() => {
    setWalletsInfo({})
  }, [tokenAddress])

  useEffect(() => {
    if (classification === TransactionClassification.Followed) {
      refetch()
    }
  }, [followingWallets, classification])

  const { tokenDetailColumns } = useTokenDetailColumnsMobile({
    addressRef,
    amountRef,
    datePickerRef,
    tokenAddress,
    volumeRef,
    walletsInfo,
    decimals,
    price,
    symbol,
    totalSupply,
  })
  const { tokenDetailColumnsPC } = useTokenDetailColumnsPC({
    addressRef,
    tokenAddress,
    volumeRef,
    walletsInfo,
    decimals,
    price,
    symbol,
    totalSupply,
    followingWallets,
  })

  const calculateNewTransactions = useMemo(() => {
    if (!lastViewedTimestamp || !tradingTransactions.length) {
      return 0
    }

    return tradingTransactions.filter((tx) => +tx.timestamp > lastViewedTimestamp).length
  }, [tradingTransactions, lastViewedTimestamp])

  useEffect(() => {
    setNewTransactionsCount(calculateNewTransactions)
  }, [calculateNewTransactions, showCountTX])

  const scrollTableToTop = () => {
    tableRef.current?.scrollToTop()
    // Update the timestamp of the first transaction as "watched"
    if (tradingTransactions.length > 0) {
      setLastViewedTimestamp(+tradingTransactions[0].timestamp)
    }
    // Reset counter
    setNewTransactionsCount(0)
  }
  const formatCount = (count: number) => {
    return count >= 100 ? '99+' : `${count}`
  }

  const displayCount = formatCount(newTransactionsCount)

  useEffect(() => {
    if (isScrollingDown && isDesktop) {
      if (newTransactionsCount !== 0) {
        setShowCountTX(true)
      }
      if (!lastViewedTimestamp && tradingTransactions.length > 0) {
        setLastViewedTimestamp(+tradingTransactions[0].timestamp)
      }
    }
  }, [isScrollingDown, newTransactionsCount])

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_ACTION_TAB_TRADE, (data: any) => {
      if (data?.data) {
        setPaused(data?.data?.paused)
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_ACTION_TAB_TRADE)
    }
  }, [])

  return (
    <div className="sticky top-[30px] translate-y-[10px] z-[1] px-3">
      {/* Select filter */}
      {!isXStockPath && (
        <div className={cn('relative pt-2.5')}>
          <MovingBgTabs
            tabs={tagFilters}
            defaultTab={currentTab}
            onTabChange={handleTabChange}
            containerId="token-detail-pairs"
            containerClassName="mt-2.5 w-full overflow-x-auto no-scrollbar"
            tabsTriggerClassName="text-[13px] px-3 rounded-[4px] leading-[1] !font-normal !text-[#6C6A74] !bg-[#18171E]"
            tabBgClassName="rounded-[4px]"
            tabsTriggerActiveClassName="!bg-[#3E2761] !text-[#C8A7FD]"
            tabsListClassName="rounded-[4px] border-none bg-transparent gap-1.5"
          />
        </div>
      )}
      {/* Type Filter */}
      <div className="relative z-[2] flex pt-2.5 pb-3 items-center justify-between">
        {!isDesktop && (
          <MovingLineTabs
            containerClassName="justify-start bg-transparent after:hidden"
            tabsListClassName="p-0 gap-2 h-[19px] md:gap-5"
            itemClassName="px-1 pt-0 pb-1.5 text-[calc(1rem*(13/16))] leading-[1] font-medium "
            tabs={listTabs}
            defaultTab={currentType}
            onTabChange={(tab: string) => {
              dispatch(setCurrentTradingTransactionType(tab))
              setCurrentType(tab)
            }}
          />
        )}
        <div className="flex items-center gap-1.5 md:gap-3">
          <CheckboxWithLabel
            label={t('detail.filters.isRobot')}
            defaultChecked={isRobot}
            isChecked={isRobot}
            onChange={handleOnChangeIsRobot}
            containerClassName={'hidden'}
          />
          <CheckboxWithLabel
            label={t('detail.filters.basicVersion')}
            defaultChecked={isBasicVersion}
            isChecked={isBasicVersion}
            onChange={handleOnChangeIsBasicVersion}
            containerClassName={'hidden'}
          />
          {!isDesktop && (
            <div
              className={cn(
                'rounded-full p-1 pr-2 h-5 text-[calc(11rem/16)] leading-none flex items-center justify-center cursor-pointer',
                paused ? 'bg-[#facc141a] text-[#d9a508]' : 'bg-[#00FFB433] text-[#00FFB4]',
              )}
              onClick={() => setPaused(!paused)}
            >
              {paused ? (
                <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.21875 3.85547H9.76431V3.86145H2.21875V3.85547Z" fill="#d9a508" />
                  <path
                    d="M2.88312 3.85521L9.10133 3.86118V3.85521H2.88312ZM1.20898 2.89856L2.88312 2.90454V2.89856H1.20898ZM9.10133 2.89856L10.7755 2.90454V2.89856H9.10133ZM3.83977 2.89856H8.14469V2.89258L3.83977 2.89856Z"
                    fill="currentColor"
                  />
                  <path
                    d="M3.71115 10.5C3.22227 10.5 2.82227 10.1 2.82227 9.61111V3.38889C2.82227 2.9 3.22227 2.5 3.71115 2.5C4.20004 2.5 4.60004 2.9 4.60004 3.38889V9.61111C4.60004 10.1 4.21115 10.5 3.71115 10.5ZM8.1556 10.5C7.66671 10.5 7.26671 10.1 7.26671 9.61111V3.38889C7.26671 2.9 7.66671 2.5 8.1556 2.5C8.64449 2.5 9.04449 2.9 9.04449 3.38889V9.61111C9.04449 10.1 8.6556 10.5 8.1556 10.5Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-3"
                >
                  <path
                    d="M7.87 21.28C7.08 21.28 6.33 21.09 5.67 20.71C4.11 19.81 3.25 17.98 3.25 15.57V8.43999C3.25 6.01999 4.11 4.19999 5.67 3.29999C7.23 2.39999 9.24 2.56999 11.34 3.77999L17.51 7.33999C19.6 8.54999 20.76 10.21 20.76 12.01C20.76 13.81 19.61 15.47 17.51 16.68L11.34 20.24C10.13 20.93 8.95 21.28 7.87 21.28ZM7.87 4.21999C7.33 4.21999 6.85 4.33999 6.42 4.58999C5.34 5.20999 4.75 6.57999 4.75 8.43999V15.56C4.75 17.42 5.34 18.78 6.42 19.41C7.5 20.04 8.98 19.86 10.59 18.93L16.76 15.37C18.37 14.44 19.26 13.25 19.26 12C19.26 10.75 18.37 9.55999 16.76 8.62999L10.59 5.06999C9.61 4.50999 8.69 4.21999 7.87 4.21999Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {paused ? t('detail.trade.paused') : t('detail.trade.running')}
            </div>
          )}
        </div>
      </div>
      {/* Table */}
      <div className="relative pb-3 z-[3]">
        <PopoverNumberTX
          count={displayCount}
          setShowCountTX={setShowCountTX}
          showCountTX={showCountTX}
          scrollToTop={scrollTableToTop}
        />
        <TokenDetailDataTable
          ref={tableRef}
          loading={isLoading}
          isStickyHeader
          data={tradingTransactions}
          columns={isDesktop ? tokenDetailColumnsPC : tokenDetailColumns}
          onBottomReached={loadMoreFn}
          containerClassName="border-0 max-h-[calc(100dvh-220px)] select-none"
          tableHeaderRowClassName={isDesktop ? '!border-0 !bg-[#1F1E25]' : '!border-0 !bg-[#0A0A0A]'}
          tableHeaderClassName="border-0 text-[#908e98] text-[calc(1rem*(11/16))] z-10 leading-3 font-[330]"
          tableHeadClassName={cn(isDesktop ? '' : 'first:px-0 !h-4.5 leading-none')}
          tableCellClassName={cn(isDesktop ? 'cursor-pointer' : 'first:px-0 !h-9 py-0')}
          tableBodyRowClassName={cn(
            'odd:bg-[#101114] border-0',
            isDesktop ? 'even:bg-[#ECECED05] hover:!bg-[#ECECED1A]' : '',
          )}
          onVisibleItemsChanged={handleVisibleRowsChange}
          isPC={isDesktop}
          setIsScrollingDown={setIsScrollingDown}
          onRowClick={(data) => {
            setSelectedAddress(data?.maker)
            setOpenPurchaseMarkDrawer(true)
          }}
        />
      </div>

      <div className="hidden">
        <ModalDateTimePicker
          ref={datePickerRef}
          resetTimeFn={() => {
            dispatch(setStartDate(undefined))
            dispatch(setEndDate(undefined))
          }}
          handleChangeTime={(start, end) => {
            dispatch(setStartDate(start))
            dispatch(setEndDate(end))
          }}
          initStartDate={
            startDate
              ? Math.floor(
                  new Date(
                    Number(startDate.year),
                    Number(startDate.month) - 1,
                    Number(startDate.day),
                    Number(startDate.hour),
                    Number(startDate.minute),
                  ).getTime() / 1000,
                )
              : undefined
          }
          initEndDate={
            endDate
              ? Math.floor(
                  new Date(
                    Number(endDate.year),
                    Number(endDate.month) - 1,
                    Number(endDate.day),
                    Number(endDate.hour),
                    Number(endDate.minute),
                  ).getTime() / 1000,
                )
              : undefined
          }
        />
        <FilterTransactionAmount
          open={openDrawerFilterState.openDrawerFilterAmount}
          setOpen={(open: boolean) => setOpenDrawerFilterState((prev) => ({ ...prev, openDrawerFilterAmount: open }))}
          ref={amountRef}
          type={FilterTransactionAmountType.USDT}
          defaultMin={minAmount > 0 ? minAmount.toString() : undefined}
          defaultMax={maxAmount > 0 ? maxAmount.toString() : undefined}
          handleMinChange={(value: number) => dispatch(setMinAmount(value || -1))}
          handleMaxChange={(value: number) => dispatch(setMaxAmount(value || -1))}
          setOption={setOptionValue}
          option={optionValue}
        />
        <FilterVolume ref={volumeRef} token={symbol ?? ''} isPC={isDesktop} />
        <FilterAddress
          ref={addressRef}
          address={address}
          onAddressChange={(value) => dispatch(setAddress(value))}
          open={openDrawerFilterState.openDrawerFilterAddress}
          setOpen={(open: boolean) => setOpenDrawerFilterState((prev) => ({ ...prev, openDrawerFilterAddress: open }))}
          isPC={isDesktop}
        />
        <DialogChangeAlias />
        <PurchaseMarkDrawer
          open={openPurchaseMarkDrawer}
          setOpen={setOpenPurchaseMarkDrawer}
          address={selectedAddress}
          token={tokenAddress}
          chainId={activeChainId ?? ChainIds.Solana}
        />
      </div>
    </div>
  )
}

export default DetailTokenTable
