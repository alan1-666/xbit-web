import { TransactionClassification } from '@/@generated/gql/graphql-future.ts'
import { TransactionDto } from '@/@generated/gql/graphql-meme2.ts'
import { CHAIN_EXPLORER_IMAGES, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import eventBus from '@/lib/eventBus.ts'
import { formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { selectAllValidAliases, upsertAlias } from '@/redux/modules/cachedAlias.slice.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import { setFollowedPoolFilter, setPoolFilter, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { UserSettingsState } from '@/redux/modules/userSettings.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { EditAliasFrom, PlatformType, PoolColumnKeys, PoolTransactionType, SortByCreateAtType } from '@/types/enums.ts'
import { getDexLogo } from '@/utils/lauchpad.ts'
import { Loading } from '@components/common/Loading.tsx'
import { FilterState, IDrawerFilter } from '@components/detailPoolTab'
import FilterAddressPc from '@components/detailPoolTab/FilterAddressPc.tsx'
import FilterArrowSort from '@components/detailPoolTab/FilterArrowSort.tsx'
import OptimizedTotalValueCell from '@components/detailPoolTab/OptimizedTotalValueCell.tsx'
import ChangeDataUnitHeader from '@components/detailPoolTab/pc/ChangeDataUnitHeader.tsx'
import ClassificationPoolFilterPc from '@components/detailPoolTab/pc/ClassificationPoolFilterPc.tsx'
import DialogChangeAliasPool from '@components/detailPoolTab/pc/DialogChangeAliasPool.tsx'
import FilterDexPoolPc from '@components/detailPoolTab/pc/FilterDexPoolPc.tsx'
import FilterPoolTransactionTypePc from '@components/detailPoolTab/pc/FilterPoolTransactionTypePc.tsx'
import FilterTotalValuePc from '@components/detailPoolTab/pc/FilterTotalValuePc.tsx'
import FilterTypePoolPc from '@components/detailPoolTab/pc/FilterTypePoolPc.tsx'
import ItemDuration from '@components/detailPoolTab/pc/ItemDuration.tsx'
import ItemWalletTokenPool from '@components/detailPoolTab/pc/ItemWalletTokenPool.tsx'
import ModalDateTimePickerPc from '@components/detailPoolTab/pc/ModalDateTimePickerPc.tsx'
import { DataTableInfiniteScroll } from '@components/ui/XTableInfiniteScroll.tsx'
import { Button } from '@components/ui/button.tsx'
import { SkeletonList } from '@components/ui/skeleton.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { REFETCH_ALIAS_POOL } from '@const/tokenDetail.ts'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { useNativeTokenNameByChain } from '@hooks/useNativeTokenNameByChain.ts'
import { usePoolTransactions } from '@hooks/usePoolTransactions.ts'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

type PcLpChangeTableProps = {
  token: string
  chainId: number
  icon?: string
  symbol?: string
  isFollowed?: boolean
  isLaunchpad?: boolean
}

const DEFAULT_FILTERS: FilterState = {
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
}

const FOLLOWED_FILTERS: FilterState = {
  ...DEFAULT_FILTERS,
  classification: TransactionClassification.Followed,
}

const PcLpChangeTable = ({ token, chainId, symbol, isFollowed = false, isLaunchpad = false }: PcLpChangeTableProps) => {
  const { t } = useTranslation()

  const datePickerRef = useRef<any>(null)

  const activeWallet = useSelector(_activeWallet)
  const isConnected = (activeWallet as any)?.isConnected
  const activeChain = useActiveChain()

  const dispatch = useAppDispatch()
  const aliasList = useAppSelector((state: RootState) => selectAllValidAliases(state))
  const { poolFilter, followedPoolFilter } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)

  // UI-only local state
  const [displayTimeType, setDisplayTimeType] = useState<'time' | 'duration'>('time')
  const [sortDirection, setSortDirection] = useState<SortByCreateAtType>(SortByCreateAtType.DESC)
  const [openDrawerFilter, setOpenDrawerFilter] = useState<IDrawerFilter>({
    openDrawerFilterType: false,
    openDrawerFilterQuantity: false,
    openDrawerFilterTotalValue: false,
    openDrawerFilterAddress: false,
  })

  // Resolve current filters from Redux (fall back to defaults)
  const currentFilters: FilterState = useMemo(() => {
    const base = isFollowed ? (followedPoolFilter ?? FOLLOWED_FILTERS) : (poolFilter ?? DEFAULT_FILTERS)
    // ensure shape with default fallbacks
    return { ...DEFAULT_FILTERS, ...base }
  }, [isFollowed, poolFilter, followedPoolFilter])

  // Helper: apply partial updates to the correct slice
  const applyFilterUpdate = useCallback(
    (patch: Partial<FilterState>) => {
      const next: FilterState = { ...currentFilters, ...patch }
      if (isFollowed) {
        dispatch(setFollowedPoolFilter(next))
      } else {
        dispatch(setPoolFilter(next))
      }
    },
    [dispatch, isFollowed, currentFilters],
  )

  const {
    items: transactions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    // refetch,
  } = usePoolTransactions({
    token,
    chainId,
    filters: isFollowed ? followedPoolFilter : poolFilter,
    refetchMs: 5000,
  })

  const aliasMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const item of aliasList) {
      map[item.address.toLowerCase()] = item.alias
    }
    return map
  }, [aliasList])

  const transactionsWithAlias = useMemo(() => {
    if (!transactions?.length) return []
    return transactions.map((tx) => {
      const maker = tx.maker?.toLowerCase()
      const newAlias = maker && aliasMap[maker]
      return { ...tx, MakerAlias: newAlias }
    })
  }, [transactions, aliasMap])

  // ==== handlers that used to call setFilters -> now dispatch ====
  const handleUpdateHolder = useCallback(
    (address: string) => {
      applyFilterUpdate({ holder: address || undefined })
    },
    [applyFilterUpdate],
  )

  const handleUpdateSort = (sort: SortByCreateAtType, type: string) => {
    setSortDirection(sort)
    applyFilterUpdate({
      sortBy: `${sort === SortByCreateAtType.ASC ? '+' : '-'}${type}` as FilterState['sortBy'],
    })
  }

  const handleClassificationChange = (value: TransactionClassification) => {
    applyFilterUpdate({ classification: value })
  }

  const handleTimeChange = useCallback(
    (start: TimeWheelDateType | undefined, end: TimeWheelDateType | undefined) => {
      const timestampFrom = start
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

      const timestampTo = end
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

      applyFilterUpdate({ timestampFrom, timestampTo })
    },
    [applyFilterUpdate],
  )

  const handleTotalValueChange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      applyFilterUpdate({ minTotalValue: min, maxTotalValue: max })
    },
    [applyFilterUpdate],
  )

  const handleTransactionTypeChange = useCallback(
    (type: PoolTransactionType) => {
      applyFilterUpdate({ transactionType: type })
    },
    [applyFilterUpdate],
  )

  const handlePlatformChange = useCallback(
    (platform: PlatformType) => {
      applyFilterUpdate({ platform })
    },
    [applyFilterUpdate],
  )

  const handleChangeDisplayTimeType = (type: 'time' | 'duration') => {
    setDisplayTimeType(type)
    const isSameTimeType = type === displayTimeType
    const inverseDirection = sortDirection === SortByCreateAtType.ASC ? SortByCreateAtType.DESC : SortByCreateAtType.ASC
    handleUpdateSort(isSameTimeType ? inverseDirection : sortDirection, 'timestamp')
  }

  const handleLoadMore = () => {
    if (!isLoading && !isFetchingNextPage && hasNextPage) {
      fetchNextPage().catch(console.error)
    }
  }

  const getValueDisplay = (type: string, value: number) => {
    if ((type === PoolTransactionType.Add || type === PoolTransactionType.AddLiquidity) && Number(value) !== 0)
      return '+'
    if ((type === PoolTransactionType.Remove || type === PoolTransactionType.RemoveLiquidity) && Number(value) !== 0)
      return '-'
    return ''
  }

  const columns: ColumnDef<TransactionDto>[] = useMemo(
    () => [
      {
        accessorKey: PoolColumnKeys.TIME,
        header: () => (
          <div className="flex items-center gap-1 min-w-[140px]">
            <div
              className="flex items-center gap-0.5 hover:bg-[#ECECED14] p-1 rounded-[4px]"
              onClick={() => handleChangeDisplayTimeType('time')}
            >
              <div
                className={cn(
                  'text-[12px] tracking-[0.28px] cursor-pointer',
                  displayTimeType === 'time' ? 'text-white' : 'text-[#FFFFFF]/50',
                )}
              >
                <span>{t('detail.pool.time')}</span>
              </div>
              {displayTimeType === 'time' && <FilterArrowSort currentSort={sortDirection} />}
            </div>
            <div className="text-[12px] leading-[1] tracking-[0.28px] text-[#FFFFFF]/50">/</div>
            <div
              className="flex items-center gap-0.5 hover:bg-[#ECECED14] p-1 rounded-[4px]"
              onClick={() => handleChangeDisplayTimeType('duration')}
            >
              <div
                className={cn(
                  'text-[12px] tracking-[0.28px] cursor-pointer',
                  displayTimeType === 'duration' ? 'text-white' : 'text-[#FFFFFF]/50',
                )}
              >
                <span>{t('detail.tokenDetail.Duration')}</span>
              </div>
              {displayTimeType === 'duration' && <FilterArrowSort currentSort={sortDirection} />}
            </div>
            <ModalDateTimePickerPc
              ref={datePickerRef}
              initStartDate={currentFilters.timestampFrom}
              initEndDate={currentFilters.timestampTo}
              handleChangeTime={handleTimeChange}
            />
          </div>
        ),
        cell: ({ row }) => {
          const timestamp = Number(row.original.timestamp)
          return (
            <div className="flex items-center gap-1 min-w-[140px]">
              <div className="text-[14px] leading-[1] text-[#FFF]">
                {displayTimeType === 'time' ? (
                  dayjs(timestamp).format('YYYY/MM/DD HH:mm')
                ) : (
                  <ItemDuration timestamp={timestamp} />
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: PoolColumnKeys.TYPE,
        header: () => (
          <div className="flex items-center gap-0.5 min-w-[150px]">
            <div className="text-[12px] tracking-[0.28px] leading-[1] text-[#FFFFFF]/50">
              <span>{t('detail.pool.type')}</span>
            </div>
            <FilterTypePoolPc isFollowing={isFollowed} />
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
          return (
            <div className="flex items-center gap-1 min-w-[150px]">
              <div className="text-[calc(14rem/16)] leading-[1] text-[#FFFFFFB2] mb-1">
                {getTransactionTypeLabel(row.original)}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: PoolColumnKeys.FUND_POOL,
        header: () => (
          <div className="flex items-center gap-0.5 min-w-[120px]">
            <div className="text-[12px] leading-[1] tracking-[0.28px] text-[#FFFFFF]/50">
              <span>{t('detail.pool.liquidityPool')}</span>
            </div>
            <FilterDexPoolPc isFollowing={isFollowed} />
          </div>
        ),
        cell: ({ row }) => {
          const transaction = row?.original as TransactionDto
          const dex = transaction?.dex ?? ''
          const dexIcon = getDexLogo(dex)

          return (
            <div className="flex items-center gap-1 min-w-[120px]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {dexIcon ? (
                      <img src={dexIcon} alt="dex icon" className="w-4" />
                    ) : (
                      <span className="text-[13px] text-white leading-[1] font-light">--</span>
                    )}
                  </TooltipTrigger>
                  {dex && (
                    <TooltipContent>
                      <span className="text-[13px] text-white leading-[1] font-light">{dex}</span>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        },
      },
      {
        accessorKey: PoolColumnKeys.QUANTITY,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[88px]">
              <div className="text-[12px] leading-[1] tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.pool.quantity')}
              </div>
            </div>
          )
        },
        cell: ({ row }) => {
          const poolTransaction = row?.original as TransactionDto
          const type = poolTransaction?.type
          const isRemoveType = type === PoolTransactionType.Remove || type === PoolTransactionType.RemoveLiquidity
          // const usdPrice = Number(poolTransaction?.usdPrice ?? 0)
          const baseAmount = poolTransaction?.baseAmount != null ? Number(poolTransaction.baseAmount) : null
          const quoteAmount = poolTransaction?.quoteAmount != null ? Number(poolTransaction.quoteAmount) : null
          const isSingleSide = poolTransaction?.isSingleSideTransaction
          const nativeToken = useNativeTokenNameByChain()

          if (baseAmount === null && quoteAmount === null) {
            return <div className="flex gap-0.5 min-w-[74px] flex-col text-[14px] leading-[1] text-white">--</div>
          }

          if (isSingleSide) {
            const isSingleSideQuote = !!quoteAmount && +quoteAmount > 0
            const amount = isSingleSideQuote ? +quoteAmount : +(baseAmount ?? 0)
            return (
              <div className={cn('flex items-center gap-0.5 min-w-[74px] min-h-[38px]')}>
                <div className={'text-xs tracking-[0.28px] flex gap-1 items-center'}>
                  <span className={cn('flex items-center gap-[1px]', isRemoveType ? 'text-fall' : 'text-rise')}>
                    {getValueDisplay(poolTransaction?.type, amount)}
                    <span className="text-[calc(14rem/16)] leading-[1] font-[380]">
                      {formatVolume(Math.abs(amount))}
                    </span>
                  </span>{' '}
                  <span className="text-[#FFFFFFB2] text-[13px] leading-[1] font-[320]">
                    {isSingleSideQuote ? nativeToken : symbol}
                  </span>
                </div>
              </div>
            )
          }

          return (
            <div className={cn('flex gap-0.5 min-w-[74px] flex-col min-h-[36px]')}>
              {quoteAmount !== null && !isSingleSide && (
                <div
                  className={cn(
                    'text-xs tracking-[0.28px] py-[1px] flex gap-1 items-center',
                    isRemoveType ? 'text-fall' : 'text-rise',
                  )}
                >
                  <span className={'flex items-center gap-[1px] text-[calc(12rem/16)] leading-3'}>
                    {getValueDisplay(poolTransaction?.type, quoteAmount)}
                    <span className="text-[calc(14rem/16)] leading-[1] font-[380]">
                      {formatVolume(Math.abs(quoteAmount))}
                    </span>
                  </span>{' '}
                  <span className="text-[#FFFFFFB2] text-[13px] leading-[1] font-[320]">{nativeToken}</span>
                </div>
              )}
              {baseAmount !== null && (
                <div className={`text-xs tracking-[0.28px] py-[1px] flex gap-1 items-center`}>
                  <span className={cn('flex items-center gap-[1px]', isRemoveType ? 'text-fall' : 'text-rise')}>
                    {getValueDisplay(poolTransaction?.type, baseAmount)}
                    <span className="text-[calc(14rem/16)] leading-[1] font-[380]">
                      {formatVolume(Math.abs(baseAmount))}
                    </span>
                  </span>{' '}
                  <span className="text-[#FFFFFFB2] text-[13px] leading-[1] font-[320]">{symbol}</span>
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
            <div className="flex items-center gap-0.5 min-w-[150px]">
              <div className="text-[12px] leading-[1] tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.pool.totalValue')}
              </div>
              <ChangeDataUnitHeader />
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0"
                onClick={() =>
                  setOpenDrawerFilter((openDrawer) => ({ ...openDrawer, openDrawerFilterTotalValue: true }))
                }
              >
                <img
                  src={
                    currentFilters.minTotalValue || currentFilters.maxTotalValue
                      ? '/images/icons/icon-filter-solid.svg'
                      : '/images/icons/icon-filter.svg'
                  }
                  className="w-[14px] h-[14px]"
                  alt="icon filter"
                />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const poolTransaction = row.original as TransactionDto

          const dataUnit = useAppSelector((state) => (state.userSettings as UserSettingsState).dataUnit)
          const nativeToken = useNativeTokenNameByChain()

          return (
            <div className="min-w-[150px]">
              <OptimizedTotalValueCell
                type={poolTransaction?.type}
                isSingleSide={poolTransaction?.isSingleSideTransaction}
                usdAmount={poolTransaction?.usdAmount}
                dataUnit={dataUnit === 'USD' ? 'USD' : nativeToken}
                className={'text-[14px] leading-[1]'}
              />
            </div>
          )
        },
      },
      {
        accessorKey: PoolColumnKeys.TOTAL_ADDED,
        header: () => {
          return (
            <div className="flex items-center gap-0.5">
              <div className="text-[12px] leading-[1] tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.pool.addition')}
              </div>
            </div>
          )
        },
        cell: ({ row }) => {
          const poolTransaction = row?.original as TransactionDto
          const type = poolTransaction?.type
          const isRemoveType = type === PoolTransactionType.Remove || type === PoolTransactionType.RemoveLiquidity
          const baseAmount = poolTransaction?.totalAddBaseLiq != null ? Number(poolTransaction.totalAddBaseLiq) : null
          const quoteAmount =
            poolTransaction?.totalAddQuoteLiq != null ? Number(poolTransaction.totalAddQuoteLiq) : null

          return (
            <div className={cn('flex gap-0.5 min-w-[74px] flex-col min-h-[36px]')}>
              {quoteAmount !== null && (
                <div
                  className={cn(
                    'text-xs tracking-[0.28px] py-[1px] flex gap-1 items-center',
                    isRemoveType ? 'text-fall' : 'text-rise',
                  )}
                >
                  {/*<img src="/images/cryptoDeposit/solana.svg" className="w-3 h-3" alt="icon solana" />*/}
                  <span className={'flex items-center gap-[1px] text-[calc(12rem/16)] leading-3'}>
                    {quoteAmount !== 0 ? '+' : ''}
                    <span className="text-[calc(14rem/16)] leading-[1] font-[380]">
                      {formatVolume(Math.abs(quoteAmount))}
                    </span>
                  </span>{' '}
                  <span className="text-[#FFFFFFB2] text-[13px] leading-[1] font-[320] uppercase">{activeChain}</span>
                </div>
              )}
              {baseAmount !== null && (
                <div className={`text-xs tracking-[0.28px] py-[1px] flex gap-1 items-center`}>
                  <span className={cn('flex items-center gap-[1px]', isRemoveType ? 'text-fall' : 'text-rise')}>
                    {baseAmount !== 0 ? '+' : ''}
                    <span className="text-[calc(14rem/16)] leading-[1] font-[380]">
                      {formatVolume(Math.abs(baseAmount))}
                    </span>
                  </span>{' '}
                  <span className="text-[#FFFFFFB2] text-[13px] leading-[1] font-[320]">{symbol}</span>
                </div>
              )}
              {quoteAmount === null && baseAmount === null && <span>--</span>}
            </div>
          )
        },
      },
      {
        accessorKey: PoolColumnKeys.ADDRESS,
        header: () => {
          return (
            <div className="flex items-center justify-end pr-6 gap-0.5 min-w-[200px]">
              <div className="text-[12px] leading-[1] tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.pool.address')}
              </div>
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0"
                onClick={() => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterAddress: true })}
              >
                <img
                  src={currentFilters.holder ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                  className="w-[14px] h-[14px]"
                  alt="icon filter"
                />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const address = row?.original?.maker
          const makerAlias = row?.original?.MakerAlias ?? ''

          return <ItemWalletTokenPool address={address} alias={makerAlias} isFollowed={isFollowed} />
        },
      },
      {
        accessorKey: PoolColumnKeys.ACTION,
        header: () => (
          <div className="flex items-center justify-end gap-0.5 min-w-[80px]">
            <div className="text-[12px] leading-[1] tracking-[0.28px] text-[#FFFFFF]/50">
              <span>{t('detail.pool.detail')}</span>
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const transaction = row.original as TransactionDto
          return (
            <div className="text-white flex items-center justify-end gap-1 min-w-[80px]">
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
      handleTimeChange,
      symbol,
      currentFilters,
      openDrawerFilter,
      displayTimeType,
      sortDirection,
      isFollowed,
      activeChain,
    ],
  )

  useEffect(() => {
    const handler = ({ data }: { data: { address: string; alias: string } }) => {
      dispatch(upsertAlias({ address: data?.address, alias: data?.alias }))
    }

    eventBus.on(REFETCH_ALIAS_POOL, handler)
    return () => eventBus.remove?.(REFETCH_ALIAS_POOL, handler)
  }, [])

  // Ensure initial defaults are set in store once (if empty)
  useEffect(() => {
    if (isFollowed) {
      if (!followedPoolFilter) dispatch(setFollowedPoolFilter(FOLLOWED_FILTERS))
    } else {
      if (!poolFilter) dispatch(setPoolFilter(DEFAULT_FILTERS))
    }
  }, [isFollowed])

  //reset filter when token change
  useEffect(() => {
    if (isFollowed) {
      dispatch(setFollowedPoolFilter(FOLLOWED_FILTERS))
    } else {
      dispatch(setPoolFilter(DEFAULT_FILTERS))
    }
  }, [token])

  return (
    <>
      {!isFollowed && (
        <ClassificationPoolFilterPc
          handleClassificationChange={handleClassificationChange}
          token={token}
          chainId={chainId}
        />
      )}

      <div className="relative z-[3]">
        <>
          <DataTableInfiniteScroll
            columns={columns}
            data={transactionsWithAlias}
            fetchMore={handleLoadMore}
            isConnected={isConnected}
            isLoading={isLoading}
            isFollowed={isFollowed || poolFilter?.classification === TransactionClassification.Followed}
            tableProps={{
              isStickyHeader: true,
              stickyBg: 'rgb(23,24,27)',
              tableClassName: '',
              containerClassName: cn(
                'border-0 select-none mt-2',
                isFollowed ? 'max-h-[calc(100vh-275px)]' : 'max-h-[calc(100vh-330px)]',
              ),
              tableHeaderRowClassName: '!border-0 !bg-[#1F1E25] whitespace-nowrap',
              tableHeaderClassName: 'border-0 text-[#FFFFFF80] text-[calc(1rem*(11/16))] z-10 app-font-medium',
              tableHeadClassName: 'first:pl-4 last:!pr-4',
              tableCellClassName: cn('first:pl-4 last:!pr-4'),
              tableBodyRowClassName: cn(
                '!border-0 even:bg-[#ECECED05]',
                transactions?.length > 0 ? 'hover:!bg-[#ECECED1A]' : '',
              ),
              skeletonComponent: <SkeletonList className="w-full" classNameItem="!h-[56px]" count={10} />,
              isShowCta: isFollowed || poolFilter?.classification === TransactionClassification.Followed,
              noDataText: isLaunchpad
                ? t('detail.pool.tokenInLaunchPad')
                : isFollowed
                  ? t('emptyFollowing.message.latest')
                  : t('detail.pool.nodata'),
            }}
          />
          {hasNextPage && (isFetching || isFetchingNextPage) && (
            <div className="flex justify-center items-center py-4">
              <Loading />
            </div>
          )}
        </>
      </div>

      <FilterPoolTransactionTypePc
        currentType={currentFilters.transactionType}
        updateTransactionType={handleTransactionTypeChange}
        currentPlatform={currentFilters.platform}
        updatePlatform={handlePlatformChange}
        open={openDrawerFilter.openDrawerFilterType}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterType: e })}
      />

      <FilterTotalValuePc
        min={currentFilters.minTotalValue}
        max={currentFilters.maxTotalValue}
        onValueChange={handleTotalValueChange}
        open={openDrawerFilter.openDrawerFilterTotalValue}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterTotalValue: e })}
      />

      <FilterAddressPc
        onAddressChange={handleUpdateHolder}
        currentAddress={currentFilters?.holder ?? ''}
        open={openDrawerFilter.openDrawerFilterAddress}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterAddress: e })}
        hidenIcon
      />

      <DialogChangeAliasPool type={EditAliasFrom.POOL} />
    </>
  )
}

export default PcLpChangeTable
