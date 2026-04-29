import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { PlatformType, PoolColumnKeys, PoolTransactionType, TransactionClassification } from '@/types/enums.ts'
import { DataTableInfiniteScroll } from '../ui/XTableInfiniteScroll'
import { SkeletonList } from '@/components/ui/skeleton'
import { TransactionDto } from '@/@generated/gql/graphql-meme2.ts'
import { timeFromNow } from '@/utils/helpers'
import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { getPoolTransactions } from '@/services/tokens.service'
import { SortByCreateAtType } from '@/types/enums'
import FilterArrowSort from '@components/detailPoolTab/FilterArrowSort'
import ModalDateTimePicker from '../detaiTokenTable/ModalDateTimePicker'
import FilterPoolTransactionType from '@components/detailPoolTab/FilterPoolTransactionType'
import FilterQuantity from '@components/detailPoolTab/FilterQuantity'
import FilterTotalValue from '@components/detailPoolTab/FilterTotalValue'
import { TimeWheelDateType } from '@/redux/modules/tokenDetail.slice'
import { Button } from '../ui/button'
import OptimizedTotalValueCell from '@components/detailPoolTab/OptimizedTotalValueCell.tsx'
import { cn } from '@/lib/utils.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { throttle } from 'lodash-es'
import FilterAddress from '@components/detailPoolTab/FilterAddress.tsx'
import { getDexLogo } from '@/utils/lauchpad.ts'
import FormatedValue from '@components/common/FormatedValue.tsx'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useAppSelector } from '@/redux/store'
import { UserSettingsState } from '@/redux/modules/userSettings.slice.ts'
import { CHAIN_EXPLORER_ADDRESS_URLS, CHAIN_EXPLORER_IMAGES, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { Loading } from '@components/common/Loading.tsx'
import { useNativeTokenNameByChain } from '@hooks/useNativeTokenNameByChain.ts'

interface DetailPoolTabProps {
  token?: string
  chainId?: number
  icon?: string
  symbol?: string
}

interface FilterState {
  transactionType: PoolTransactionType
  platform: PlatformType
  holder: string
  sortBy: string
  timestampFrom?: number
  timestampTo?: number
  minQuantity?: number
  maxQuantity?: number
  minTotalValue?: number
  maxTotalValue?: number
  minSol?: number
  maxSol?: number
}

const DetailFollowedPoolTab = memo(({ token, chainId, symbol }: DetailPoolTabProps) => {
  const { t } = useTranslation()
  const buttonRef = useRef(null)

  const activeWallet = useSelector(_activeWallet)
  const containerRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<any>(null)

  // FilterQuantity
  // openDrawerFilterType
  const [openDrawerFilter, setOpenDrawerFilter] = useState({
    openDrawerFilterType: false,
    openDrawerFilterQuantity: false,
    openDrawerFilterTotalValue: false,
    openDrawerFilterAddress: false,
  })
  const [optionValue, setOptionValue] = useState<number>(0)

  const [filters, setFilters] = useState<FilterState>({
    transactionType: PoolTransactionType.All,
    platform: PlatformType.All,
    holder: '',
    sortBy: SortByCreateAtType.DESC,
    timestampFrom: undefined,
    timestampTo: undefined,
    minQuantity: undefined,
    maxQuantity: undefined,
    minTotalValue: undefined,
    maxTotalValue: undefined,
    minSol: undefined,
    maxSol: undefined,
  })

  // Infinite Query for pool transactions
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['poolFollowedTransactions', token, chainId, filters, activeWallet],
    queryFn: async ({ pageParam }) => {
      const res = await gqlMeme2.query({
        query: getPoolTransactions,
        variables: {
          input: {
            token: token ?? '',
            chainId: chainId ?? 0,
            type: filters.transactionType,
            lastTimestamp: pageParam ?? undefined,
            timestampFrom: filters.timestampFrom,
            timestampTo: filters.timestampTo,
            sortBy: filters.sortBy === SortByCreateAtType.ASC ? '+timestamp' : '-timestamp',
            address: filters.holder ? filters.holder : undefined,
            transactionVolumeFrom: filters.minQuantity,
            transactionVolumeTo: filters.maxQuantity,
            transactionUsdAmountFrom: filters.minTotalValue,
            transactionUsdAmountTo: filters.maxTotalValue,
            classification: TransactionClassification.Followed,
            nativeAmountFrom: filters.minSol,
            nativeAmountTo: filters.maxSol,
          },
        },
      })
      return res.data.getPoolTransactions
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage?.data && lastPage?.data?.length >= 20) {
        return lastPage.data[lastPage.data.length - 1].timestamp
      }
      return undefined
    },
    refetchInterval: 5000, // 5 seconds
  })

  // Flattened transactions
  const transactions = useMemo(() => infiniteData?.pages.flatMap((page) => page?.data || []) || [], [infiniteData])

  const handleUpdateHolder = (address: string) => {
    setFilters((prev) => ({ ...prev, holder: address }))
  }

  const handleUpdateSort = (sort: string) => {
    setFilters((prev) => ({ ...prev, sortBy: sort }))
  }

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

  const handleQuantityChange = (
    min: number | undefined,
    max: number | undefined,
    minSol: number | undefined,
    maxSol: number | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      minQuantity: min,
      maxQuantity: max,
      maxSol,
      minSol,
    }))
  }

  const handleTotalValueChange = (min: number | undefined, max: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      minTotalValue: min,
      maxTotalValue: max,
    }))
  }

  const handleTransactionTypeChange = (type: PoolTransactionType) => {
    setFilters((prev) => ({ ...prev, transactionType: type }))
  }

  const handlePlatformChange = useCallback((platform: PlatformType) => {
    setFilters((prev) => ({ ...prev, platform }))
  }, [])

  const handleFilterByAddress = (address: string) => {
    setFilters((prev) => ({ ...prev, holder: address }))
  }

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
            <div className="flex items-center gap-1 min-w-[96px]">
              {dexIcon && <img src={dexIcon} alt="dex icon" className="w-4" />}
              <div>
                <div className="text-[calc(12rem/16)] leading-3 text-[#CACACA] mb-1">
                  {getTransactionTypeLabel(row.original)}
                </div>
                <div className="text-[calc(10rem/16)] leading-2.5 text-[#00CE89]">
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
            return <div className="flex gap-0.5 min-w-[74px] flex-col text-[#CACACA]">--</div>
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
                      className="text-[calc(12rem/16)] leading-3 font-[380]"
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
                className="rounded-full bg-transparent p-0 h-6"
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
                className="rounded-full bg-transparent p-0 h-6"
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
            <div className="text-white flex items-center justify-end gap-1">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`${CHAIN_EXPLORER_ADDRESS_URLS[transaction.chainId]}/${address}`}
                className="text-[12px] leading-3.25 truncate underline underline-offset-1 text-end text-[#CACACA]"
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
    ],
  )

  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.95

      if (
        (scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD &&
        !isLoading &&
        !isFetchingNextPage &&
        hasNextPage
      ) {
        fetchNextPage().finally(() => {})
      }
    }, 200)

    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage])

  return (
    <div ref={containerRef} className="sticky z-[1]">
      <div className="relative pb-1 z-[3]">
        {
          <>
            <DataTableInfiniteScroll
              columns={columns}
              data={transactions}
              isLoading={isLoading}
              noDataText={t('emptyFollowing.message.flPool')}
              tableProps={{
                isStickyHeader: true,
                stickyBg: 'rgb(23,24,27)',
                tableClassName: '',
                containerClassName: 'border-0 select-none no-scrollbar',
                tableHeaderRowClassName: '!border-0 bg-[#0A0A0A] whitespace-nowrap',
                tableHeaderClassName: 'border-0 text-[#908e98] text-[11px] z-10 leading-3 font-[330]',
                tableBodyRowClassName: 'odd:bg-[#101114] !border-0',
                skeletonComponent: <SkeletonList className="w-full" count={10} />,
                isShowCta: true,
              }}
            />
            {hasNextPage && (
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
        token={symbol ?? 'Trump'}
        onQuantityChange={handleQuantityChange}
        open={openDrawerFilter.openDrawerFilterQuantity}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterQuantity: e })}
        min={filters.minQuantity}
        max={filters.maxQuantity}
        maxSol={filters.maxSol}
        minSol={filters.minSol}
      />
      <FilterTotalValue
        min={filters.minTotalValue}
        max={filters.maxTotalValue}
        setOption={setOptionValue}
        option={optionValue}
        onValueChange={handleTotalValueChange}
        open={openDrawerFilter.openDrawerFilterTotalValue}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterTotalValue: e })}
      />
      <FilterAddress
        hidenIcon
        onAddressChange={handleUpdateHolder}
        currentAddress={filters.holder}
        open={openDrawerFilter.openDrawerFilterAddress}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterAddress: e })}
      />
    </div>
  )
})

DetailFollowedPoolTab.displayName = 'DetailFollowedPoolTab'

export default DetailFollowedPoolTab
