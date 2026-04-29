import { cn } from '@/lib/utils.ts'
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ColumnDef } from '@tanstack/react-table'
import { TYPE_BUY, TYPE_SELL, TYPE_TPSL } from '@const/tokenDetail.ts'
import { mapTransactionType } from '@/utils/mappingType.ts'
import ModalDateTimePicker from '@components/detaiTokenTable/ModalDateTimePicker.tsx'
import FilterArrowSort from '@components/detaiTokenTable/FilterArrowSort.tsx'
import FilterTransactionAmount from '@components/detaiTokenTable/FilterTransactionAmount.tsx'
import FilterAddress from '@components/detaiTokenTable/FilterAddress.tsx'
import { useLocation } from 'react-router-dom'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { formatSmartTimeDiff } from '@/utils/helpers.ts'
import { TransactionDto as FollowedTransaction, TxType as TransactionType } from '@/@generated/gql/graphql-meme2.ts'
import { DataTableVirtualItem } from '@components/orderBook/DataTableVirtualItem.tsx'
import ItemTrader from '@components/detailTokenTabs/ItemTrader.tsx'
import { useGetTransactions } from '@hooks/useGetTransactions.ts'
import FilterTransactionType from '@components/detailLatestTab/FilterTransactionType.tsx'
import { TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import { toTimestampFromTimeWheel } from '@/utils/time.ts'
import TotalColumn from '@components/detailLatestTab/TotalColumn.tsx'
import PriceColumn from '@components/detailLatestTab/PriceColumn.tsx'
import AmountColumn from '@components/detailLatestTab/AmountColumn.tsx'
import {
  ChainIds,
  DisplayPriceType,
  LatestFollowedColumnKeys,
  SortByCreateAtType,
  TokenDetailColumnKeys,
} from '@/types/enums.ts'
import {
  LastFollowedState,
  resetTime,
  setAddress,
  setDisplayPriceType,
  setEndDate,
  setHolder,
  setMaxAmount,
  setMinAmount,
  setSortByCreatedAt,
  setStartDate,
  setTransactionType,
} from '@/redux/modules/latestFollowed.slice.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { throttle } from 'lodash-es'
import { Button } from '../ui/button'
import { Loading } from '@components/common/Loading.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { CHAIN_EXPLORER_IMAGES, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { MemeDetailBottomTabsContext } from '@/contexts/meme/detail/MemeDetailBottomTabsContext.ts'
import { Configs } from '@const/configs.ts'

const DetailLatestTab = memo(() => {
  const { t } = useTranslation()
  const location = useLocation()
  const activeWallet = useSelector(_activeWallet)
  const [optionValue, setOptionValue] = useState<number>(0)
  const [openDrawerFilter, setOpenDrawerFilter] = useState({
    openDrawerFilterAddress: false,
    openDrawerTransactionAmount: false,
    openDrawerFilterTransactionType: false,
    openDrawerFilterHolder: false,
  })
  const btnTypeRef = useRef<HTMLButtonElement>(null)
  const { tokenDetail } = useContext(MemeDetailBottomTabsContext)

  const dispatch = useAppDispatch()

  const {
    holder,
    address,
    maxAmount,
    minAmount,
    startDate,
    endDate,
    transactionType,
    displayPriceType,
    sortByCreatedAt,
  } = useAppSelector((state: RootState) => state.latestFollowed as LastFollowedState)

  const activeChainId = useActiveChainId() ?? (Configs.enableSolana() ? ChainIds.Solana : ChainIds.Bsc)

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetTransactions({
    filter: {
      token: tokenAddress,
      chainId: activeChainId ?? ChainIds.Solana,
      address: holder !== '' ? holder : undefined,
      type: transactionType ?? TransactionType.All,
      transactionUsdAmountFrom: minAmount !== -1 ? minAmount : undefined,
      transactionUsdAmountTo: maxAmount !== -1 ? maxAmount : undefined,
      timestampFrom: startDate ? toTimestampFromTimeWheel(startDate) : undefined,
      timestampTo: endDate ? toTimestampFromTimeWheel(endDate) : undefined,
      sortBy: sortByCreatedAt === SortByCreateAtType.DESC ? '-timestamp' : '+timestamp',
    },
    skipCondition: false,
  })

  // Flatten data từ tất cả pages
  const data = useMemo(() => {
    if (!infiniteData?.pages) return []
    return infiniteData.pages.flatMap((page) => page?.getFollowedTransactions?.data || [])
  }, [infiniteData])

  const handleClickSoldPrice = () => {
    dispatch(
      setDisplayPriceType(displayPriceType === DisplayPriceType.PRICE ? DisplayPriceType.MC : DisplayPriceType.PRICE),
    )
  }

  const handleHolderChange = (holder: string) => {
    dispatch(setHolder(holder))
  }
  const handleUpdateTransactionType = (type: TransactionType) => {
    dispatch(setTransactionType(type))
  }
  const handleMaxPriceChange = (value: number) => {
    dispatch(setMaxAmount(value || -1))
  }
  const handleMinPriceChange = (value: number) => {
    dispatch(setMinAmount(value || -1))
  }
  const handleAddressChange = (address: string) => {
    dispatch(setAddress(address))
  }
  const handleStartTimeChange = (startTime: TimeWheelDateType | undefined) => {
    dispatch(setStartDate(startTime))
  }
  const handleEndTimeChange = (endTime: TimeWheelDateType | undefined) => {
    dispatch(setEndDate(endTime))
  }
  const resetTimeModal = () => {
    dispatch(resetTime())
  }
  const handleSortByCreatedAt = () => {
    dispatch(
      setSortByCreatedAt(
        sortByCreatedAt === SortByCreateAtType.DESC ? SortByCreateAtType.ASC : SortByCreateAtType.DESC,
      ),
    )
  }

  const handleTextColor = (type: string) => {
    switch (type) {
      case TYPE_BUY:
        return 'text-rise'
      case TYPE_SELL:
        return 'text-fall'
      case TYPE_TPSL:
      default:
        return 'text-[#CACACA]'
    }
  }

  const tokenDetailColumns = useMemo<ColumnDef<FollowedTransaction>[]>(
    () => [
      {
        accessorKey: LatestFollowedColumnKeys.HOLDERS,
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[80px]">
            <div>{t('detail.tokenDetail.traders')}</div>
            <Button
              size="xs"
              className="rounded-full bg-transparent p-0"
              onClick={() => setOpenDrawerFilter((prev) => ({ ...prev, openDrawerFilterHolder: true }))}
            >
              <img
                src={holder ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                className="min-w-[11px] h-[11px]"
                alt="icon filter"
              />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center text-[12px] leading-[1] app-font-regular h-[31px] min-w-[80px]">
            <ItemTrader item={row?.original} />
          </div>
        ),
      },
      {
        accessorKey: LatestFollowedColumnKeys.TIME,
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[80px]">
            <div className={'cursor-pointer'} onClick={handleSortByCreatedAt}>
              {t('detail.tokenDetail.time')}
            </div>
            <div className="flex items-center cursor-pointer justify-center gap-1">
              <FilterArrowSort sortByCreatedAt={sortByCreatedAt} handleOnclickSort={handleSortByCreatedAt} />
              <ModalDateTimePicker
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
                resetTimeFn={resetTimeModal}
                handleChangeTime={(startTime, endTime) => {
                  handleStartTimeChange(startTime)
                  handleEndTimeChange(endTime)
                }}
              />
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const timestamp = (row?.original as FollowedTransaction).timestamp
          const timestampInMs = parseInt(timestamp)
          return (
            <div className="flex items-center text-[12px] text-[#CACACA] leading-[1] app-font-regular h-[31px] min-w-[80px]">
              {formatSmartTimeDiff(timestampInMs)}
            </div>
          )
        },
      },
      {
        accessorKey: LatestFollowedColumnKeys.TYPE,
        header: () => (
          <div className="min-w-[84px] flex items-center gap-1">
            {t('detail.tokenDetail.type')}
            <Button
              size="xs"
              className="rounded-full bg-transparent p-0"
              ref={btnTypeRef}
              onClick={() => setOpenDrawerFilter((prev) => ({ ...prev, openDrawerFilterTransactionType: true }))}
            >
              <img
                src={
                  transactionType !== TransactionType.All
                    ? '/images/icons/icon-filter-solid.svg'
                    : '/images/icons/icon-filter.svg'
                }
                className="w-[11px] h-[11px]"
                alt="icon filter"
              />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className={cn(handleTextColor(row?.original?.type), 'min-w-[84px]')}>
            {mapTransactionType((row?.original as FollowedTransaction)?.type)}
          </div>
        ),
      },
      {
        accessorKey: LatestFollowedColumnKeys.TOTAL,
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[90px]">
            <div>{t('detail.tokenDetail.volume')}</div>
            <div className="flex items-center cursor-pointer justify-center gap-1">
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0"
                onClick={() => setOpenDrawerFilter((prev) => ({ ...prev, openDrawerTransactionAmount: true }))}
              >
                <img
                  src={
                    maxAmount > 0 || minAmount > 0
                      ? '/images/icons/icon-filter-solid.svg'
                      : '/images/icons/icon-filter.svg'
                  }
                  className="w-[11px] h-[11px]"
                  alt="icon filter"
                />
              </Button>
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const transaction = row?.original as FollowedTransaction

          return <TotalColumn transaction={transaction} />
        },
      },
      {
        accessorKey: LatestFollowedColumnKeys.PRICE,
        header: () => (
          <div className="min-w-[80px]">
            <div onClick={handleClickSoldPrice} className="flex items-center gap-1 cursor-pointer select-none">
              <div>
                {displayPriceType === DisplayPriceType.PRICE
                  ? t('detail.tokenDetail.price')
                  : t('detail.tokenDetail.marketCap')}
              </div>
              <img src="/images/futuresDetail/arrow-swap-icon.svg" className="block w-[9px] h-[9px]" alt="icon swap" />
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const transaction = row?.original as FollowedTransaction

          return (
            <PriceColumn
              transaction={transaction}
              displayPriceType={displayPriceType}
              totalSupply={tokenDetail?.totalSupply ? +tokenDetail.totalSupply : 0}
            />
          )
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.VOLUME,
        header: () => (
          <div className="min-w-[80px]">
            <div>{t('listCoin.amount')}</div>
          </div>
        ),
        cell: ({ row }) => {
          const transaction = row?.original as FollowedTransaction
          return <AmountColumn transaction={transaction} className={'text-[#CACACA]'} />
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.WALLET,
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[40px]">
            <div>{t('detail.tokenDetail.action')}</div>
            <div className="hidden items-center cursor-pointer justify-center">
              <img
                src={address ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                className="min-w-[11px] h-[11px]"
                alt="icon filter"
              />
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const transaction = row?.original as FollowedTransaction
          return (
            <div className="min-w-[40px] flex items-center gap-2">
              {holder === transaction.maker ? (
                <div
                  className="cursor-pointer w-4 h-4 flex items-center justify-center text-white/70 text-sm font-bold"
                  onClick={() => dispatch(setHolder(''))}
                >
                  ×
                </div>
              ) : (
                <img
                  src="/images/icons/icon-filter.svg"
                  className="w-[11px] h-[11px] cursor-pointer"
                  alt="icon filter"
                  onClick={() => dispatch(setHolder(transaction?.maker || ''))}
                />
              )}
              <a
                href={`${CHAIN_EXPLORER_TX_URLS[activeChainId]}/${transaction.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={CHAIN_EXPLORER_IMAGES[activeChainId]} alt="icon chain" className="cursor-pointer size-3.5" />
              </a>
            </div>
          )
        },
      },
    ],
    [
      holder,
      sortByCreatedAt,
      displayPriceType,
      address,
      t,
      setOpenDrawerFilter,
      startDate,
      endDate,
      maxAmount,
      minAmount,
      dispatch,
      transactionType,
      activeChainId,
    ],
  )

  // Throttled scroll handler for load more
  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.75

      if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && !isFetchingNextPage && hasNextPage) {
        fetchNextPage()
      }
    }, 200)

    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  return (
    <div className="sticky z-[1]">
      {/* Table */}
      <div className="relative pb-1 z-[3]">
        <DataTableVirtualItem
          estimateSize={48}
          isStickyHeader
          data={data}
          columns={tokenDetailColumns}
          containerClassName="border-0 select-none"
          tableHeaderRowClassName="!border-0 !bg-[#0A0A0A]"
          tableHeaderClassName="border-0 text-[#908e98] text-[11px] z-10 leading-3 font-[330]"
          tableBodyRowClassName="odd:bg-[#101114] border-0"
          noDataText={t('emptyFollowing.message.latest')}
          isShowCta
        />
        {isFetchingNextPage && (
          <div className="flex justify-center items-center py-4">
            <Loading />
          </div>
        )}
      </div>
      <FilterAddress
        address={holder}
        onAddressChange={handleHolderChange}
        open={openDrawerFilter.openDrawerFilterHolder}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterHolder: e })}
      />
      <FilterAddress
        onAddressChange={handleAddressChange}
        open={openDrawerFilter.openDrawerFilterAddress}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterAddress: e })}
        address={address}
      />
      <FilterTransactionType
        currentType={transactionType}
        updateTransactionType={handleUpdateTransactionType}
        open={openDrawerFilter.openDrawerFilterTransactionType}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterTransactionType: e })}
        anchorRef={btnTypeRef}
      />
      <FilterTransactionAmount
        handleMaxChange={handleMaxPriceChange}
        handleMinChange={handleMinPriceChange}
        open={openDrawerFilter.openDrawerTransactionAmount}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerTransactionAmount: e })}
        type={0}
        defaultMin={`${minAmount}`}
        defaultMax={`${maxAmount}`}
        option={optionValue}
        setOption={setOptionValue}
      />
    </div>
  )
})

DetailLatestTab.displayName = 'DetailLatestTab'

export default DetailLatestTab
