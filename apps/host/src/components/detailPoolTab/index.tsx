import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ChainIds, PlatformType, PoolColumnKeys, PoolTransactionType } from '@/types/enums.ts'
import { cn } from '@/lib/utils'
import { DataTableInfiniteScroll } from '../ui/XTableInfiniteScroll'
import { SkeletonList } from '@/components/ui/skeleton'
import { formatMoney, getBlockChainLogo, timeFromNow } from '@/utils/helpers'
import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { getPoolTransactions } from '@/services/tokens.service'
import { SortByCreateAtType } from '@/types/enums'
import FilterArrowSort from './FilterArrowSort'
import FilterPoolTransactionType from './FilterPoolTransactionType'
import FilterQuantity from './FilterQuantity'
import FilterTotalValue from './FilterTotalValue'
import OptimizedTotalValueCell from './OptimizedTotalValueCell'
import { TimeWheelDateType } from '@/redux/modules/tokenDetail.slice'
import { Button } from '../ui/button'
import LiquidityChartDrawer from './LiquidityChartDrawer'
import { TransactionDto } from '@/@generated/gql/graphql-meme2.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setPoolFilter, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import FilterAddress from '@components/detailPoolTab/FilterAddress.tsx'
import { getDexLogo } from '@/utils/lauchpad'
import ModalDateTimePicker from '../detaiTokenTable/ModalDateTimePicker'
import FormatedValue from '@components/common/FormatedValue.tsx'
import { useInfiniteQuery } from '@tanstack/react-query'
import { throttle } from 'lodash-es'
import { CHAIN_EXPLORER_ADDRESS_URLS, CHAIN_EXPLORER_IMAGES, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import CurrencyToggle from '@components/detailTokenTabs/CurrencyToggle.tsx'
import { UserSettingsState } from '@/redux/modules/userSettings.slice.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { TransactionClassification } from '@/@generated/gql/graphql-future.ts'
import { Dex } from '@/@generated/gql/graphql-meme2.ts'
import { Loading } from '@components/common/Loading.tsx'
import { useNativeTokenNameByChain } from '@hooks/useNativeTokenNameByChain.ts'

interface DetailPoolTabProps {
  token?: string
  chainId?: number
  icon?: string
  symbol?: string
  isLaunchpad?: boolean
}

export interface FilterState {
  transactionType: PoolTransactionType
  platform: PlatformType
  sortBy: string
  classification: TransactionClassification
  holder?: string
  timestampFrom?: number
  timestampTo?: number
  minQuantity?: number
  maxQuantity?: number
  minTotalValue?: number
  maxTotalValue?: number
  minSol?: number
  maxSol?: number
  dex?: Dex
}

export interface IDrawerFilter {
  openDrawerFilterType: boolean
  openDrawerFilterQuantity: boolean
  openDrawerFilterTotalValue: boolean
  openDrawerFilterAddress: boolean
}

const typeTabs = [
  {
    key: PoolTransactionType.All,
    label: 'detail.tabs.all',
  },
  {
    key: PoolTransactionType.AddLiquidity,
    label: 'history.addLiquidity',
  },
  {
    key: PoolTransactionType.RemoveLiquidity,
    label: 'history.removeLiquidity',
  },
]

const DetailPoolTab = ({ token, chainId, icon, symbol, isLaunchpad }: DetailPoolTabProps) => {
  const { t } = useTranslation()
  const buttonRef = useRef(null)

  const dispatch = useAppDispatch()
  const [optionValue, setOptionValue] = useState<number>(0)
  const { poolFilter } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)

  const tokenLogo = icon ?? getBlockChainLogo(chainId ?? ChainIds.Solana, token ?? '')

  const containerRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<any>(null)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [openDrawerFilter, setOpenDrawerFilter] = useState<IDrawerFilter>({
    openDrawerFilterType: false,
    openDrawerFilterQuantity: false,
    openDrawerFilterTotalValue: false,
    openDrawerFilterAddress: false,
  })

  const [filters, setFilters] = useState<FilterState>(
    poolFilter
      ? poolFilter
      : {
          transactionType: PoolTransactionType.All,
          platform: PlatformType.All,
          holder: undefined,
          sortBy: SortByCreateAtType.DESC,
          timestampFrom: undefined,
          timestampTo: undefined,
          minQuantity: undefined,
          maxQuantity: undefined,
          minTotalValue: undefined,
          maxTotalValue: undefined,
          classification: TransactionClassification.All,
          minSol: undefined,
          maxSol: undefined,
        },
  )

  // Infinite Query for pool transactions
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPending,
  } = useInfiniteQuery({
    enabled: !!token,
    refetchInterval: 5000,
    queryKey: [
      'poolTransactions',
      token,
      chainId,
      filters.transactionType,
      filters.classification,
      filters.timestampFrom,
      filters.timestampTo,
      filters.sortBy,
      filters.holder,
      filters.minQuantity,
      filters.maxQuantity,
      filters.minTotalValue,
      filters.maxTotalValue,
      filters.minSol,
      filters.maxSol,
    ],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await gqlMeme2.query({
        query: getPoolTransactions,
        variables: {
          input: {
            token: token ?? '',
            chainId: chainId ?? 0,
            type: filters.transactionType,
            classification: TransactionClassification.All,
            lastTimestamp: pageParam ?? undefined,
            timestampFrom: filters.timestampFrom,
            timestampTo: filters.timestampTo,
            sortBy: filters.sortBy === SortByCreateAtType.ASC ? '+timestamp' : '-timestamp',
            address: filters.holder ? filters.holder : undefined,
            transactionVolumeFrom: filters.minQuantity,
            transactionVolumeTo: filters.maxQuantity,
            transactionUsdAmountFrom: filters.minTotalValue,
            transactionUsdAmountTo: filters.maxTotalValue,
            nativeAmountFrom: filters.minSol,
            nativeAmountTo: filters.maxSol,
          },
        },
      })
      return res.data.getPoolTransactions
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data?.length) return undefined
      if (lastPage?.data?.length < 20) return undefined
      return lastPage.data?.[lastPage.data.length - 1]?.timestamp || undefined
    },
  })

  // Flattened transactions
  const transactions = useMemo(() => infiniteData?.pages.flatMap((page) => page?.data || []) || [], [infiniteData])

  // For liquidity and numberOfPools, use the first page
  const liquidity = infiniteData?.pages[0]?.liquidity || 0
  const numberOfPools = infiniteData?.pages[0]?.numberOfPools || 0

  useEffect(() => {
    dispatch(setPoolFilter(filters))
  }, [filters])

  const handleUpdateHolder = useCallback((address: string) => {
    setFilters((prev) => ({ ...prev, holder: address }))
  }, [])

  const handleUpdateSort = useCallback((sort: string) => {
    setFilters((prev) => ({ ...prev, sortBy: sort }))
  }, [])

  const handleTimeChange = useCallback((start: TimeWheelDateType | undefined, end: TimeWheelDateType | undefined) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      // if (start !== undefined) {
      newFilters.timestampFrom = start
        ? Math.floor(
            new Date(
              Number(start.year),
              Number(start.month) - 1,
              Number(start.day),
              Number(start.hour),
              Number(start.minute),
            ).getTime() / 1000,
          )
        : undefined
      // }
      // if (end !== undefined) {
      newFilters.timestampTo = end
        ? Math.floor(
            new Date(
              Number(end.year),
              Number(end.month) - 1,
              Number(end.day),
              Number(end.hour),
              Number(end.minute),
            ).getTime() / 1000,
          )
        : undefined
      // }
      return newFilters
    })
  }, [])

  const handleQuantityChange = useCallback(
    (min: number | undefined, max: number | undefined, minSol: number | undefined, maxSol: number | undefined) => {
      setFilters((prev) => ({
        ...prev,
        minQuantity: min,
        maxQuantity: max,
        minSol,
        maxSol,
      }))
    },
    [],
  )

  const handleTotalValueChange = useCallback((min: number | undefined, max: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      minTotalValue: min,
      maxTotalValue: max,
    }))
  }, [])

  const handleTransactionTypeChange = useCallback((type: PoolTransactionType) => {
    setFilters((prev) => ({ ...prev, transactionType: type }))
  }, [])

  const handlePlatformChange = useCallback((platform: PlatformType) => {
    setFilters((prev) => ({ ...prev, platform }))
  }, [])

  const handleFilterByAddress = useCallback((address: string) => {
    setFilters((prev) => ({
      ...prev,
      holder: prev.holder === address ? '' : address,
    }))
  }, [])

  const columns: ColumnDef<TransactionDto>[] = useMemo(
    () => [
      {
        accessorKey: PoolColumnKeys.TYPE,
        minSize: 240,
        header: () => (
          <div className="flex items-center gap-0.5 min-w-[88px]">
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">
              <span>{t('detail.pool.type')}</span> / <span>{t('detail.pool.time')}</span>
            </div>
            <FilterArrowSort onSort={handleUpdateSort} currentSort={filters.sortBy as SortByCreateAtType} />
            <ModalDateTimePicker
              ref={datePickerRef}
              initStartDate={filters.timestampFrom}
              initEndDate={filters.timestampTo}
              handleChangeTime={handleTimeChange}
            />
          </div>
        ),
        cell: ({ row }) => {
          const getTransactionTypeLabel = (tx: TransactionDto) => {
            if (tx.isSingleSideTransaction) {
              if (tx.type === PoolTransactionType.Add || tx.type === PoolTransactionType.AddLiquidity) {
                return t('detail.pool.singleSideAdd')
              } else if (tx.type === PoolTransactionType.Remove || tx.type === PoolTransactionType.RemoveLiquidity) {
                return t('detail.pool.singleSideRemove')
              }
            }
            switch (tx.type) {
              case PoolTransactionType.All:
                return t('detail.tabs.all')
              case PoolTransactionType.AddLiquidity:
              case PoolTransactionType.Add:
                return t('detail.pool.add')
              case PoolTransactionType.Remove:
              case PoolTransactionType.RemoveLiquidity:
                return t('detail.pool.remove')
              default:
                return tx.type
            }
          }

          const transaction = row.original as TransactionDto
          const dex = transaction?.dex ?? ''
          const dexIcon = getDexLogo(dex)

          return (
            <div className="flex items-center gap-1 min-w-[96px] pl-1">
              {dexIcon && <img src={dexIcon} alt="dex icon" className="w-4" />}
              <div>
                <div className="text-[calc(12rem/16)] text-[#CACACA] leading-none font-[330] mb-1">
                  {getTransactionTypeLabel(row.original)}
                </div>
                <div className="text-[calc(10rem/16)] leading-none font-[330] **:text-[#00CE89] text-[#00CE89]">
                  {timeFromNow(Number(row.original.timestamp))}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: PoolColumnKeys.QUANTITY,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[88px]">
              <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.pool.quantity')}</div>
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0"
                onClick={() => setOpenDrawerFilter((openDrawer) => ({ ...openDrawer, openDrawerFilterQuantity: true }))}
              >
                <img
                  src={
                    filters.minQuantity || filters.maxQuantity || filters.minSol || filters.maxSol
                      ? '/images/icons/icon-filter-solid.svg'
                      : '/images/icons/icon-filter.svg'
                  }
                  className="w-[11px] h-[11px]"
                  alt="icon filter"
                />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const poolTransaction = row?.original as TransactionDto
          const usdPrice = Number(poolTransaction?.usdPrice ?? 0)
          const baseAmount = poolTransaction?.baseAmount != null ? Number(poolTransaction.baseAmount) : null
          const quoteAmount = poolTransaction?.quoteAmount != null ? Number(poolTransaction.quoteAmount) : null
          const isSingleSide = poolTransaction?.isSingleSideTransaction
          const nativeToken = useNativeTokenNameByChain()

          if (baseAmount === null && quoteAmount === null) {
            return <div className="flex gap-0.5 min-w-[74px] flex-col text-white">--</div>
          }

          const getValueDisplay = (type: string, value: number) => {
            if ((type === PoolTransactionType.Add || type === PoolTransactionType.AddLiquidity) && Number(value) !== 0)
              return '+'
            if (
              (type === PoolTransactionType.Remove || type === PoolTransactionType.RemoveLiquidity) &&
              Number(value) !== 0
            )
              return '-'
            return ''
          }

          if (isSingleSide) {
            const isSingleSideQuote = !!quoteAmount && +quoteAmount > 0
            const amount = isSingleSideQuote ? +quoteAmount : +(baseAmount ?? 0)
            return (
              <div className={cn('flex gap-0.5 min-w-[74px] flex-col')}>
                <div className={'text-xs tracking-[0.28px] mt-1.5 flex gap-1 items-center'}>
                  <span className={'flex items-center gap-[1px]'}>
                    {getValueDisplay(poolTransaction?.type, amount)}
                    <FormatedValue
                      value={Math.abs(amount)}
                      maxMeaningfulDigits={usdPrice < 10 ? 2 : 4}
                      className="text-[calc(12rem/16)] leading-3 font-[380] text-[#CACACA]!"
                    />
                  </span>{' '}
                  <span className="text-[#605e68] font-[320]">{isSingleSideQuote ? nativeToken : symbol}</span>
                </div>
              </div>
            )
          }

          return (
            <div className={cn('flex gap-0.5 min-w-[74px] flex-col')}>
              {quoteAmount !== null && !isSingleSide && (
                <div className={'text-xs tracking-[0.28px] mt-1.5 flex gap-1 items-center'}>
                  {/*<img src="/images/cryptoDeposit/solana.svg" className="w-3 h-3" alt="icon solana" />*/}
                  <span className={'flex items-center gap-[1px] text-[calc(12rem/16)] leading-3'}>
                    {getValueDisplay(poolTransaction?.type, quoteAmount)}
                    <FormatedValue
                      value={Math.abs(quoteAmount)}
                      maxMeaningfulDigits={usdPrice < 10 ? 2 : 4}
                      className="text-[calc(12rem/16)] leading-3 font-[380] text-[#CACACA]!"
                    />
                  </span>{' '}
                  <span className="text-[#605e68] font-[320]">{nativeToken}</span>
                </div>
              )}
              {baseAmount !== null && (
                <div className={`text-xs tracking-[0.28px] flex gap-1 items-center`}>
                  <span className={'flex items-center gap-[1px]'}>
                    {getValueDisplay(poolTransaction?.type, baseAmount)}
                    <FormatedValue
                      value={Math.abs(baseAmount)}
                      maxMeaningfulDigits={4}
                      className="text-[calc(12rem/16)] leading-3 font-[380] text-[#CACACA]!"
                    />
                  </span>{' '}
                  <span className="text-[#605e68] font-[320]">{symbol}</span>
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: PoolColumnKeys.TOTAL_VALUE,
        header: () => {
          return (
            <div className="flex items-center gap-0.5">
              <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.pool.totalValue')}</div>
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0"
                onClick={() =>
                  setOpenDrawerFilter((openDrawer) => ({ ...openDrawer, openDrawerFilterTotalValue: true }))
                }
              >
                <img
                  src={
                    filters.minTotalValue || filters.maxTotalValue
                      ? '/images/icons/icon-filter-solid.svg'
                      : '/images/icons/icon-filter.svg'
                  }
                  className="w-[11px] h-[11px]"
                  alt="icon filter"
                />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const poolTransaction = row.original as TransactionDto

          const dataUnit = useAppSelector((state) => (state.userSettings as UserSettingsState).dataUnit)

          return (
            <OptimizedTotalValueCell
              type={poolTransaction?.type}
              isSingleSide={poolTransaction?.isSingleSideTransaction}
              usdAmount={poolTransaction?.usdAmount}
              dataUnit={dataUnit}
            />
          )
        },
      },
      {
        accessorKey: PoolColumnKeys.ADDRESS,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 justify-end">
              <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.pool.address')}</div>
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0"
                onClick={() => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterAddress: true })}
              >
                <img
                  src={filters.holder ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                  className="w-[11px] h-[11px]"
                  alt="icon filter"
                />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const transaction = row.original as TransactionDto
          const address = row.original.maker
          const shortAddress = address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ''
          return (
            <div className="text-white flex items-center justify-end gap-1 min-w-[120px]">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`${CHAIN_EXPLORER_ADDRESS_URLS[transaction.chainId]}/${address}`}
                className="text-[12px] leading-[13px] truncate underline underline-offset-1 text-end text-[#CACACA]"
              >
                {shortAddress}
              </a>
              <CopyButton icon="/images/icons/ic-copy2.svg" text={address} className="size-4" />
              <a
                href={`${CHAIN_EXPLORER_TX_URLS[transaction.chainId]}/${row.original.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1"
              >
                <img src={CHAIN_EXPLORER_IMAGES[transaction.chainId]} alt="" className="size-3.5" />
              </a>
            </div>
          )
        },
      },
    ],
    [
      t,
      filters,
      buttonRef,
      handleTransactionTypeChange,
      handlePlatformChange,
      handleUpdateSort,
      handleTimeChange,
      handleQuantityChange,
      handleTotalValueChange,
      handleUpdateHolder,
      handleFilterByAddress,
      symbol,
      tokenLogo,
    ],
  )

  const isEmptyData = !isLoading && transactions.length === 0

  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.95

      if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && !isFetchingNextPage && hasNextPage) {
        fetchNextPage().then()
      }
    }, 200)

    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  const openLiquidityChart = () => {
    setIsDrawerOpen(true)
  }

  return (
    <div ref={containerRef} className="sticky z-[1] px-2.5">
      <div className="pt-2.5 flex items-center justify-between">
        <div className="flex gap-3">
          <span className="text-[13px] leading-none font-[330] text-[#908e98]">
            {t('detail.pool.totalLiquidity')}: <span className="text-white font-[380]">{formatMoney(liquidity)}</span>
          </span>
          <span
            className="text-[13px] leading-none font-[330] text-[#908e98] cursor-pointer"
            onClick={openLiquidityChart}
          >
            {t('detail.pool.poolCount')}:{' '}
            <span className="text-white font-[380]">{numberOfPools < 100 ? numberOfPools : '99+'}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyToggle />
          {/* Disable show chart on production */}
          {
            <button
              className="inline-flex items-center gap-1 text-[#908e98] hover:text-white text-[12px] leading-none transition-colors cursor-pointer"
              onClick={openLiquidityChart}
            >
              <img src="/images/tokenDetail/activity.svg" alt="icon activity" />
              {t('detail.pool.chart')}
            </button>
          }
          <LiquidityChartDrawer
            token={token ?? ''}
            chainId={chainId ?? ChainIds.Solana}
            isOpen={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            liquidity={liquidity}
            numberOfPools={numberOfPools}
            transactions={transactions}
          />
        </div>
      </div>
      <div className="pt-2 flex flex-wrap gap-1.5">
        {typeTabs.map((tab) => (
          <button
            key={tab.key}
            className={cn(
              'px-2 py-1 font-[330] text-[12px] leading-[1] text-center rounded-[3px] h-6',
              filters.transactionType === tab.key ? 'text-[#C8A7FD] bg-[#3E2761]' : 'text-[#908E98] bg-[#18171E]',
            )}
            onClick={() => handleTransactionTypeChange(tab.key as PoolTransactionType)}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
      <div className="relative pb-1 z-[3]">
        {
          <>
            <DataTableInfiniteScroll
              columns={columns}
              data={transactions}
              isLoading={isLoading || isPending}
              tableProps={{
                isStickyHeader: true,
                stickyBg: 'rgb(23,24,27)',
                tableClassName: '',
                containerClassName: 'border-0 select-none mt-2 no-scrollbar',
                tableHeaderRowClassName: '!border-0 bg-[#0A0A0A] whitespace-nowrap',
                tableHeaderClassName: 'border-0 text-[#908e98] text-[11px] z-10 leading-3 font-[330]',
                tableHeadClassName: 'first:pl-0',
                tableCellClassName: 'first:pl-0',
                tableBodyRowClassName: 'odd:bg-[#101114] !border-0',
                skeletonComponent: <SkeletonList className="w-full" count={10} />,
                isShowCta: false,
                noDataText: isLaunchpad ? t('detail.pool.tokenInLaunchPad') : t('detail.pool.nodata'),
              }}
            />
            {isFetchingNextPage && !isEmptyData && !isLoading && (
              <div className="flex justify-center items-center py-4">
                <Loading />
              </div>
            )}
          </>
        }
      </div>
      <FilterPoolTransactionType
        currentType={filters.transactionType}
        updateTransactionType={handleTransactionTypeChange}
        currentPlatform={filters.platform}
        updatePlatform={handlePlatformChange}
        open={openDrawerFilter.openDrawerFilterType}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterType: e })}
      />
      <FilterQuantity
        min={filters.minQuantity}
        max={filters.maxQuantity}
        maxSol={filters.maxSol}
        minSol={filters.minSol}
        token={symbol ?? 'Trump'}
        onQuantityChange={handleQuantityChange}
        open={openDrawerFilter.openDrawerFilterQuantity}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterQuantity: e })}
      />
      <FilterTotalValue
        min={filters.minTotalValue}
        max={filters.maxTotalValue}
        onValueChange={handleTotalValueChange}
        open={openDrawerFilter.openDrawerFilterTotalValue}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterTotalValue: e })}
        filterInPage="pool"
        type={0}
        setOption={setOptionValue}
        option={optionValue}
      />
      <FilterAddress
        onAddressChange={handleUpdateHolder}
        currentAddress={filters?.holder ?? ''}
        open={openDrawerFilter.openDrawerFilterAddress}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterAddress: e })}
        hidenIcon
      />
    </div>
  )
}

export default React.memo(DetailPoolTab)
