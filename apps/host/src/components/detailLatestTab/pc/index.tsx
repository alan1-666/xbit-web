import { TransactionDto, TransactionInput } from '@/@generated/gql/graphql-meme2.ts'
import PurchaseMarkDrawer from '@/components/chart/purchaseMarkDrawer/index.tsx'
import { Button } from '@/components/ui/button.tsx'
import { MemeDetailBottomTabsContext } from '@/contexts/meme/detail/MemeDetailBottomTabsContext.ts'
import { useGetTotalFollowings } from '@/hooks/useGetTotalFollowings'
import { cn } from '@/lib/utils.ts'
import {
  LastFollowedState,
  resetTime,
  setDisplayPriceType,
  setEndDate,
  setEventType,
  setHolder,
  setMaxAmount,
  setMinAmount,
  setSortByCreatedAt,
  setStartDate,
} from '@/redux/modules/latestFollowed.slice.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import {
  ChainIds,
  DisplayPriceType,
  EditAliasFrom,
  LatestFollowedColumnKeys,
  SortByCreateAtType,
  TokenDetailColumnKeys,
} from '@/types/enums.ts'
import { getDexLogo } from '@/utils/lauchpad.ts'
import { mapTransactionType } from '@/utils/mappingType.ts'
import { toTimestampFromTimeWheel } from '@/utils/time.ts'
import { Loading } from '@components/common/Loading.tsx'
import AmountColumn from '@components/detailLatestTab/AmountColumn.tsx'
import FilterTimePc from '@components/detailLatestTab/pc/FilterTimePc.tsx'
import FilterVolumePc from '@components/detailLatestTab/pc/FilterVolumePc.tsx'
import PriceColumn from '@components/detailLatestTab/PriceColumn.tsx'
import TotalColumn from '@components/detailLatestTab/TotalColumn.tsx'
import ChangeDataUnitHeader from '@components/detailPoolTab/pc/ChangeDataUnitHeader.tsx'
import DialogChangeAliasPool from '@components/detailPoolTab/pc/DialogChangeAliasPool.tsx'
import ItemDuration from '@components/detailPoolTab/pc/ItemDuration.tsx'
import ItemTrader from '@components/detailTokenTabs/ItemTrader.tsx'
import FilterAddress from '@components/detaiTokenTable/FilterAddress.tsx'
import FilterArrowSort from '@components/detaiTokenTable/FilterArrowSort.tsx'
import FilterTransactionAmount from '@components/detaiTokenTable/FilterTransactionAmount.tsx'
import { SkeletonList } from '@components/ui/skeleton.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { DataTableInfiniteScroll } from '@components/ui/XTableInfiniteScroll.tsx'
import { TYPE_BUY, TYPE_SELL, TYPE_TPSL } from '@const/tokenDetail.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useFollowedTransactions } from '@hooks/useGetTransactions.ts'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { memo, useCallback, useContext, useEffect, useMemo, useState, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { TypeFilterDropdown } from '@components/detaiTokenTable/filters/TypeFilterDropdown.tsx'
import { CHAIN_EXPLORER_IMAGES, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { Configs } from '@const/configs.ts'
import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'

const DetailLatestTabPc = memo(() => {
  const { t } = useTranslation()
  const location = useLocation()
  const activeWallet = useSelector(_activeWallet)
  const isConnected = activeWallet?.isConnected
  const [openDrawerFilter, setOpenDrawerFilter] = useState({
    openDrawerFilterAddress: false,
    openDrawerTransactionAmount: false,
    openDrawerFilterTransactionType: false,
    openDrawerFilterHolder: false,
  })
  const [openPurchaseMarkDrawer, setOpenPurchaseMarkDrawer] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const activeChainId = useActiveChainId()
  const [displayTimeType, setDisplayTimeType] = useState<'time' | 'duration'>('time')
  const dispatch = useAppDispatch()
  const { tokenDetail } = useContext(MemeDetailBottomTabsContext)

  const {
    holder,
    address,
    maxAmount,
    minAmount,
    startDate,
    endDate,
    eventType,
    displayPriceType,
    sortByCreatedAt,
    minVolume,
    maxVolume,
  } = useAppSelector((state: RootState) => state.latestFollowed as LastFollowedState)

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])

  const input = useMemo(() => {
    const transactionInput: TransactionInput = {
      token: tokenAddress,
      chainId: activeChainId ?? ChainIds.Solana,
      address: holder !== '' ? holder : undefined,
      eventType: eventType,
      transactionUsdAmountFrom: minAmount !== -1 ? minAmount : undefined,
      transactionUsdAmountTo: maxAmount !== -1 ? maxAmount : undefined,
      timestampFrom: startDate ? toTimestampFromTimeWheel(startDate).toString() : undefined,
      timestampTo: endDate ? toTimestampFromTimeWheel(endDate).toString() : undefined,
      sortBy: sortByCreatedAt === SortByCreateAtType.DESC ? '-timestamp' : '+timestamp',
      transactionVolumeFrom: minVolume,
      transactionVolumeTo: maxVolume,
    }
    return transactionInput
  }, [
    tokenAddress,
    activeChainId,
    holder,
    eventType,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    sortByCreatedAt,
    minVolume,
    maxVolume,
  ])

  const { data, loadMore, isLoading, refetch, hasNextPage } = useFollowedTransactions({
    input,
  })

  const { data: totalFollowings } = useGetTotalFollowings()

  useEffect(() => {
    refetch().catch(console.error)
  }, [totalFollowings])

  const handleClickSoldPrice = () => {
    dispatch(
      setDisplayPriceType(displayPriceType === DisplayPriceType.PRICE ? DisplayPriceType.MC : DisplayPriceType.PRICE),
    )
  }

  const handleChangeDisplayTimeType = (type: 'time' | 'duration') => {
    setDisplayTimeType(type)
    const isSameTimeType = type === displayTimeType
    const inverseDirection =
      sortByCreatedAt === SortByCreateAtType.ASC ? SortByCreateAtType.DESC : SortByCreateAtType.ASC
    dispatch(setSortByCreatedAt(isSameTimeType ? inverseDirection : sortByCreatedAt))
  }

  const handleHolderChange = (holder: string) => {
    dispatch(setHolder(holder))
  }
  const handleMaxPriceChange = (value: number) => {
    dispatch(setMaxAmount(value || -1))
  }
  const handleMinPriceChange = (value: number) => {
    dispatch(setMinAmount(value || -1))
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

  const handleTextColor = (type: string) => {
    switch (type) {
      case TYPE_BUY:
        return 'text-rise'
      case TYPE_SELL:
        return 'text-fall'
      case TYPE_TPSL:
      default:
        return 'text-white'
    }
  }

  const handleOnWalletClick = useCallback((event: MouseEvent, tx: TransactionDto) => {
    event.stopPropagation()
    event.preventDefault()
    setSelectedAddress(tx.maker)
    setOpenPurchaseMarkDrawer(true)
  }, [])

  const tokenDetailColumns = useMemo<ColumnDef<TransactionDto>[]>(
    () => [
      {
        accessorKey: LatestFollowedColumnKeys.TIME,
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
              {displayTimeType === 'time' && <FilterArrowSort sortByCreatedAt={sortByCreatedAt} />}
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
              {displayTimeType === 'duration' && <FilterArrowSort sortByCreatedAt={sortByCreatedAt} />}
            </div>
            <FilterTimePc
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
        ),
        cell: ({ row }) => {
          const timestamp = (row?.original as TransactionDto).timestamp
          const timestampInMs = parseInt(timestamp)

          return (
            <div className="flex items-center gap-1 min-w-[140px]">
              <div className="text-[14px] leading-[1] text-[#FFF]">
                {displayTimeType === 'time' ? (
                  dayjs(timestampInMs).format('YYYY/MM/DD HH:mm')
                ) : (
                  <ItemDuration timestamp={timestampInMs} />
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: LatestFollowedColumnKeys.HOLDERS,
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[160px]">
            <div className={'text-[12px] leading-[1]'}>{t('detail.tokenDetail.traders')}</div>
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
          <div className="flex items-center text-[12px] leading-[1] app-font-regular h-[31px] min-w-[160px]">
            <ItemTrader item={row?.original} onWalletClick={(event) => handleOnWalletClick(event, row.original)} />
          </div>
        ),
      },
      {
        accessorKey: LatestFollowedColumnKeys.TYPE,
        header: () => (
          <div className="min-w-[64px] flex items-center gap-1 text-[12px] leading-[1]">
            {t('detail.tokenDetail.type')}
            {/*<Button*/}
            {/*  size="xs"*/}
            {/*  className="rounded-full bg-transparent p-0"*/}
            {/*  ref={btnTypeRef}*/}
            {/*  onClick={() =>*/}
            {/*    setOpenDrawerFilter((prev) => ({*/}
            {/*      ...prev,*/}
            {/*      openDrawerFilterTransactionType: !prev.openDrawerFilterTransactionType,*/}
            {/*    }))*/}
            {/*  }*/}
            {/*>*/}
            {/*  <img*/}
            {/*    src={*/}
            {/*      transactionType !== TransactionType.All*/}
            {/*        ? '/images/icons/icon-filter-solid.svg'*/}
            {/*        : '/images/icons/icon-filter.svg'*/}
            {/*    }*/}
            {/*    className="w-[11px] h-[11px]"*/}
            {/*    alt="icon filter"*/}
            {/*  />*/}
            {/*</Button>*/}
            <TypeFilterDropdown
              value={eventType}
              onChange={(type) => {
                dispatch(setEventType(type))
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className={cn(handleTextColor(row?.original?.type), 'min-w-[64px]')}>
            {mapTransactionType((row?.original as TransactionDto)?.type)}
          </div>
        ),
      },
      {
        accessorKey: LatestFollowedColumnKeys.TOTAL,
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[140px]">
            <div className={'text-[12px] leading-[1]'}>{t('detail.tokenDetail.volume')}</div>
            <ChangeDataUnitHeader />
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
          const transaction = row?.original as TransactionDto

          return <TotalColumn transaction={transaction} />
        },
      },
      {
        accessorKey: LatestFollowedColumnKeys.PRICE,
        header: () => (
          <div className="min-w-[140px]">
            <div
              onClick={handleClickSoldPrice}
              className="flex items-center gap-1 cursor-pointer select-none text-[12px] leading-[1]"
            >
              <div className={'min-w-[36px]'}>
                {displayPriceType === DisplayPriceType.PRICE
                  ? t('detail.tokenDetail.price')
                  : t('detail.tokenDetail.marketCap')}
              </div>
              <img
                src="/images/futuresDetail/arrow-swap-icon.svg"
                className="block w-[14px] h-[14px]"
                alt="icon swap"
              />
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const transaction = row?.original as TransactionDto

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
          <div className="flex items-center gap-1 min-w-[80px]">
            <div className="text-[12px] leading-[1]">{t('listCoin.amount')}</div>
            <FilterVolumePc />
          </div>
        ),
        cell: ({ row }) => {
          const transaction = row?.original as TransactionDto
          return <AmountColumn transaction={transaction} className="text-[#FBFBFB]" />
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.DEX,
        header: () => (
          <div className="flex items-center gap-[2px] !max-w-[96px]">
            <div className="text-[12px] leading-[1]">{t('liquidityChart.fundPool')}</div>
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
          const dex = (row.original as any)?.dex
          return (
            <div className="font-[330] text-[14px]">
              {row.original.dex && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger>
                      <LaunchPlatformIcon
                        value={row.original.dex}
                        className={'rounded-full !size-4 !pointer-event-auto'}
                        chainId={activeChainId}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#191919] text-white">{row.original.dex}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.WALLET,
        header: () => (
          <div className="flex items-center gap-[2px] !max-w-[40px]">
            <div className="text-[12px] leading-[1]">{t('detail.tokenDetail.action')}</div>
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
          const activeChainId = useActiveChainId() ?? (Configs.enableSolana() ? ChainIds.Solana : ChainIds.Bsc)
          const transaction = row?.original as TransactionDto
          return (
            <div className="!max-w-[40px] flex items-center gap-2">
              <a
                href={`${CHAIN_EXPLORER_TX_URLS[activeChainId]}/${transaction.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1"
                onClick={(e) => {
                  e?.stopPropagation()
                }}
              >
                <img src={CHAIN_EXPLORER_IMAGES[activeChainId]} alt="" className="size-3.5" />
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
      displayTimeType,
      eventType,
    ],
  )

  const handleLoadMore = () => {
    loadMore()
  }

  return (
    <>
      {/* Table */}
      <div className="relative pb-1 z-[3] h-full">
        <DataTableInfiniteScroll
          columns={tokenDetailColumns}
          data={data ?? []}
          fetchMore={handleLoadMore}
          isFollowed={true}
          isLoading={isLoading && data?.length === 0}
          isConnected={isConnected}
          tableProps={{
            isStickyHeader: true,
            stickyBg: 'rgb(23,24,27)',
            tableClassName: '',
            containerClassName: 'border-0 select-none mt-2 max-h-[calc(100vh-360px)] pb-2',
            tableHeaderRowClassName: '!border-0 !bg-[#1F1E25] whitespace-nowrap',
            tableHeaderClassName: 'border-0 text-[#FFFFFF80] text-[calc(1rem*(11/16))] z-10 app-font-medium',
            tableHeadClassName: 'first:pl-4 last:!pr-4',
            tableCellClassName: 'first:pl-4 last:!pr-4 cursor-pointer',
            tableBodyRowClassName: cn(
              '!border-0 even:bg-[#ECECED05]',
              data && data?.length > 0 ? 'hover:!bg-[#ECECED1A]' : '',
            ),
            skeletonComponent: <SkeletonList className="w-full" classNameItem="!h-[56px]" count={10} />,
            isShowCta: true,
            noDataText: t('emptyFollowing.message.latest'),
          }}
        />
        {hasNextPage && (
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
        isPC
      />
      {/*<FilterTransactionType*/}
      {/*  currentType={eventType}*/}
      {/*  updateTransactionType={handleUpdateTransactionType}*/}
      {/*  open={openDrawerFilter.openDrawerFilterTransactionType}*/}
      {/*  setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerFilterTransactionType: e })}*/}
      {/*  anchorRef={btnTypeRef}*/}
      {/*/>*/}
      <FilterTransactionAmount
        handleMaxChange={handleMaxPriceChange}
        handleMinChange={handleMinPriceChange}
        open={openDrawerFilter.openDrawerTransactionAmount}
        setOpen={(e) => setOpenDrawerFilter({ ...openDrawerFilter, openDrawerTransactionAmount: e })}
        isPC
      />
      <DialogChangeAliasPool type={EditAliasFrom.LATEST} />
      <PurchaseMarkDrawer
        open={openPurchaseMarkDrawer}
        setOpen={setOpenPurchaseMarkDrawer}
        address={selectedAddress}
        token={tokenAddress}
        chainId={activeChainId ?? ChainIds.Solana}
      />
    </>
  )
})

DetailLatestTabPc.displayName = 'DetailLatestTabPc'

export default DetailLatestTabPc
