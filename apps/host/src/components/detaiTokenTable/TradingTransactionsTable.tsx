import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { cn } from '@/lib/utils.ts'
import {
  selectFromTokenDetailState,
  setAddress,
  setEndDate,
  setMaxAmount,
  setMinAmount,
  setPaused as setPausedAction,
  setStartDate,
  TokenDetailState,
} from '@/redux/modules/tokenDetail.slice.ts'
import {
  setCurrentTradingCheckBasic,
  setCurrentTradingCheckBot,
  TradeTabState,
} from '@/redux/modules/tradeTab.slice.ts'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds, FilterTransactionAmountType, SortByCreateAtType } from '@/types/enums.ts'
import { convertTimeWheelToTimestamp } from '@/utils/helpers.ts'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import FilterAddress, { FilterAddressHandle } from '@components/detaiTokenTable/FilterAddress.tsx'
import FilterTransactionAmount, {
  FilterTransactionAmountHandle,
} from '@components/detaiTokenTable/FilterTransactionAmount.tsx'
import FilterVolume, { FilterVolumeHandle } from '@components/detaiTokenTable/FilterVolume.tsx'
import ModalDateTimePicker, { ModalDateTimePickerHandle } from '@components/detaiTokenTable/ModalDateTimePicker.tsx'
import TokenDetailDataTable, { TokenDetailDataTableHandle } from '@components/detaiTokenTable/TokenDetailDataTable.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useFollowingWallets } from '@hooks/useFollowingWallets.ts'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import { getWalletInfo } from '@services/tokens.service.ts'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useDetailTokenTableContext } from './DetailTokenTableContext'
import DialogChangeAlias from './DialogChangeAlias'
import PopoverNumberTX from './PopoverNumberTX'
import { EventType, TradingTransactionInput, TransactionClassification } from '@/@generated/gql/graphql-meme2.ts'
import { PausedStatus } from '@components/detaiTokenTable/PausedStatus.tsx'
import { Classifications } from '@components/detaiTokenTable/Classifications.tsx'
import { useAggregatedTradingTransactions } from '@hooks/meme/useAggregatedTradingTransactions.ts'
import {
  TradingTransactionsContext,
  TradingTransactionsContextProps,
} from '@components/detaiTokenTable/TradingTransactionsContext.ts'
import { mobileColumns } from '@components/detaiTokenTable/Columns/mobileColumns.tsx'
import { desktopColumns } from '@components/detaiTokenTable/Columns/desktopColumns.tsx'
import { TypeFilterDrawer, TypeFilterDrawerHandle } from '@components/detaiTokenTable/filters/TypeFilterDrawer.tsx'
import { useResponsive } from '@hooks/useResponsive.ts'
import PurchaseMarkDrawer from '@components/chart/purchaseMarkDrawer'

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

export const TradingTransactionsTable = (props: DetailTokenTableProps) => {
  const { symbol, price, totalSupply } = props
  const {
    // currentType,
    // listTabs,
    // setCurrentType,
    // editName,
    // setEditName
  } = useDetailTokenTableContext()

  const { t } = useTranslation()
  const location = useLocation()
  const { isDesktop } = useResponsive()

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
  } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const eventType = useAppSelector(selectFromTokenDetailState('eventType'))

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

  const [newTransactionsCount, setNewTransactionsCount] = useState<number>(0)
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState<number | null>(null)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  // const [currentTab, setCurrentTab] = useState<string>(currentFilterTradeTab || tagFilters[0]?.value)
  const [isRobot, setIsRobot] = useState<boolean>(currentTradingCheckBot ?? true)
  const [isBasicVersion, setIsBasicVersion] = useState<boolean>(currentTradingCheckBasic ?? true)
  const paused = useAppSelector(selectFromTokenDetailState('paused'))
  const setPausedState = (paused: boolean) => {
    dispatch(setPausedAction(paused))
  }
  // const [pausedAt, setPausedAt] = useState<string>('')
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
  const typeRef = useRef<TypeFilterDrawerHandle>(null)

  const visibleRowsRef = useRef<RealtimeTransaction[]>([])

  const followingWallets = useFollowingWallets()
  const [pausedAt, setPausedAt] = useState<number>()

  const classification = useMemo(() => {
    if (isXStockPath) return undefined
    return currentFilterTradeTab
  }, [isXStockPath, currentFilterTradeTab])

  const queryInput = useMemo(() => {
    return {
      token: tokenAddress,
      chainId: activeChainId,
      // type: TransactionType.All,
      eventType: eventType,
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
    } as TradingTransactionInput
  }, [
    tokenAddress,
    activeChainId,
    eventType,
    address,
    minAmount,
    maxAmount,
    minVolume,
    maxVolume,
    startDate,
    endDate,
    sortByCreatedAt,
    isRobot,
    classification,
    nativeAmountTo,
    nativeAmountFrom,
  ])

  const filterByPaused = useCallback(
    (tx: RealtimeTransaction) => {
      if (!pausedAt) return true // If not paused, include all transactions
      if (tx.source === 'api') return true // Always include API transactions
      return tx.fetchedAt <= pausedAt // Include only WebSocket transactions fetched before pausing
    },
    [pausedAt],
  )

  const filterByType = useCallback(
    (tx: RealtimeTransaction) => {
      if (eventType === EventType.Buy) {
        return tx.type === RealtimeTransactionType.Buy
      }
      if (eventType === EventType.Sell) {
        return tx.type === RealtimeTransactionType.Sell
      }
      if (eventType === EventType.Add) {
        return tx.type === RealtimeTransactionType.AddLiquidity
      }
      if (eventType === EventType.Remove) {
        return tx.type === RealtimeTransactionType.RemoveLiquidity
      }
      if (eventType === EventType.Burnt) {
        return tx.type === RealtimeTransactionType.Burn
      }
      return true
    },
    [eventType],
  )

  const filterByAmount = useCallback(
    (tx: RealtimeTransaction) => {
      if (minAmount > 0 && tx.volumeUsd < minAmount) return false
      if (maxAmount > 0 && tx.volumeUsd > maxAmount) return false
      // If all conditions are met, include the transaction
      return true
    },
    [minAmount, maxAmount],
  )

  const filterByAddress = useCallback(
    (tx: RealtimeTransaction) => {
      return !(address && tx.maker !== address)
    },
    [address],
  )

  const filterByVolume = useCallback(
    (tx: RealtimeTransaction) => {
      // filter by native amount
      if (nativeAmountTo > 0 && tx.nativeAmount > nativeAmountTo) return false
      if (nativeAmountFrom > 0 && tx.nativeAmount < nativeAmountFrom) return false
      // filter by volume
      if (minVolume > 0 && tx.baseAmount < minVolume) return false
      if (maxVolume > 0 && tx.baseAmount > maxVolume) return false
      // If all conditions are met, include the transaction
      return true
    },
    [minVolume, maxVolume, nativeAmountFrom, nativeAmountTo],
  )

  const filterByDate = useCallback(
    (tx: RealtimeTransaction) => {
      const timestampFrom = startDate ? convertTimeWheelToTimestamp(startDate) : 0
      const timestampTo = endDate ? convertTimeWheelToTimestamp(endDate) : null
      if (timestampFrom && +tx.timestamp < timestampFrom) return false
      if (timestampTo && +tx.timestamp > timestampTo) return false
      // If all conditions are met, include the transaction
      return true
    },
    [startDate, endDate],
  )

  const filterByClassification = useCallback(
    (tx: RealtimeTransaction) => {
      if (classification === TransactionClassification.SmartMoney && !tx.isSmartMoney) return false
      if (classification === TransactionClassification.Whale && !tx.isWhale) return false
      // TODO: Temporarily check for dev wallets, assuming sniper is a dev wallet
      if (classification === TransactionClassification.Sniper && !tx.isSniper) return false
      if (classification === TransactionClassification.ProjectParty && !tx.isDev) return false
      if (classification === TransactionClassification.Insider && !tx.isInsider) return false
      if (classification === TransactionClassification.Fresh && !tx.isNewWallet) return false
      if (classification === TransactionClassification.Kol && !tx.isKOL) return false
      if (classification === TransactionClassification.SameSource && !tx.isBundler) return false
      if (classification === TransactionClassification.Followed && !followingWallets.includes(tx.maker)) return false
      if (classification === TransactionClassification.Bundlers && !tx.isBundler) return false

      //  Temporarily do not receive data from socket while in TOP10 tab, when be supports more fields for filtering, it will be processed later
      if (classification === TransactionClassification.Top10) return false

      // If all conditions are met, include the transaction
      return true
    },
    [classification],
  )

  const filterFn = useCallback(
    (tx: RealtimeTransaction) => {
      // filter by paused state
      if (!filterByPaused(tx)) return false
      // filter by tx type
      if (!filterByType(tx)) return false
      // filter by address
      if (!filterByAddress(tx)) return false
      // filter by amount
      if (!filterByAmount(tx)) return false
      // filter by volume
      if (!filterByVolume(tx)) return false
      // filter by date
      if (!filterByDate(tx)) return false
      // Check classification
      if (!filterByClassification(tx)) return false

      // If all conditions are met, include the transaction
      return true
    },
    [
      filterByPaused,
      filterByType,
      filterByAddress,
      filterByAmount,
      filterByVolume,
      filterByDate,
      filterByClassification,
    ],
  )

  const {
    transactions,
    loadMore,
    isPending: isLoading,
  } = useAggregatedTradingTransactions({
    input: queryInput,
    filterFn: filterFn,
    sortDirection: sortByCreatedAt === SortByCreateAtType.ASC ? '+timestamp' : '-timestamp',
  })

  const tradingTransactions = useMemo(() => {
    if (!transactions) return []
    return transactions
  }, [transactions])

  const handleOnChangeIsRobot = (status?: boolean) => {
    dispatch(setCurrentTradingCheckBot(status))
    setIsRobot(!!status)
  }
  const handleOnChangeIsBasicVersion = (status?: boolean) => {
    dispatch(setCurrentTradingCheckBasic(status))
    setIsBasicVersion(!status)
  }

  const handleVisibleRowsChange = useCallback((visibleItems: RealtimeTransaction[]) => {
    visibleRowsRef.current = visibleItems
  }, [])

  // useEffect(() => {
  //   if (!paused) {
  //     setDisplayedTransactions(tradingTransactions)
  //   }
  // }, [tradingTransactions, paused])

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

  const showMakerDrawer = useCallback((maker: string) => {
    setSelectedAddress(maker)
    setOpenPurchaseMarkDrawer(true)
  }, [])

  const contextValue = useMemo(() => {
    return {
      datePickerRef,
      amountRef,
      volumeRef,
      addressRef,
      typeRef,
      symbol,
      totalSupply: totalSupply ? Number(totalSupply) : 0,
      tokenAddress,
      price: price || '0',
      walletsInfo,
      followingWallets,
      showMakerDrawer,
    } as TradingTransactionsContextProps
  }, [
    symbol,
    totalSupply,
    tokenAddress,
    price,
    walletsInfo,
    datePickerRef,
    amountRef,
    volumeRef,
    addressRef,
    followingWallets,
  ])

  const setPaused = useCallback((newState: boolean) => {
    dispatch(setPausedAction(newState))
    setPausedAt(newState ? Date.now() : undefined)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (!isDesktop) return
    setPaused(true)
  }, [setPaused, isDesktop])

  const handleMouseLeave = useCallback(() => {
    if (!isDesktop) return
    setPaused(false)
  }, [isDesktop, setPaused])

  useEffect(() => {
    setPaused(false)

    return () => {
      setPaused(false)
    }
  }, [])

  return (
    <div className="sticky top-[30px] translate-y-[10px] z-[1] px-3">
      <Classifications />

      {/* Type Filter */}
      <div className="relative z-[2] flex pt-2.5 pb-3 items-center justify-between">
        <div />
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
          <PausedStatus paused={paused} setPaused={setPausedState} />
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
        <TradingTransactionsContext value={contextValue}>
          <TokenDetailDataTable
            ref={tableRef}
            loading={isLoading}
            isStickyHeader
            data={tradingTransactions}
            columns={isDesktop ? desktopColumns : mobileColumns}
            onBottomReached={loadMore}
            containerClassName="border-0 max-h-[calc(100dvh-220px)] select-none"
            tableHeaderRowClassName={isDesktop ? '!border-0 !bg-[#1F1E25]' : '!border-0 !bg-[#0A0A0A]'}
            tableHeaderClassName="border-0 text-[#908e98] text-[calc(1rem*(11/16))] z-10 leading-3 font-[330]"
            tableHeadClassName={cn(isDesktop ? '' : 'first:px-0 !h-4.5 leading-none')}
            tableCellClassName={cn(isDesktop ? 'cursor-pointer' : 'first:px-0 !h-9 py-0')}
            tableBodyRowClassName={cn(
              'odd:bg-[#101114] border-0 h-[50px]',
              isDesktop ? 'even:bg-[#ECECED05] hover:!bg-[#ECECED1A]' : '',
            )}
            tableBodyProps={{
              onMouseEnter: handleMouseEnter,
              onMouseLeave: handleMouseLeave,
            }}
            onVisibleItemsChanged={handleVisibleRowsChange}
            isPC={isDesktop}
            setIsScrollingDown={setIsScrollingDown}
          />
        </TradingTransactionsContext>
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
        <TypeFilterDrawer ref={typeRef} />
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
