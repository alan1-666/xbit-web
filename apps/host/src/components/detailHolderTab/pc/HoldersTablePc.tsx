import { HolderDto, TokenDetail, TransactionClassification } from '@/@generated/gql/graphql-meme2.ts'
import PurchaseMarkDrawer from '@/components/chart/purchaseMarkDrawer/index.tsx'
import { getChainId } from '@/lib/blockchain'
import { formatAmount } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { cn } from '@/lib/utils.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import { ChainIds, EditAliasFrom, FollowedHolderColumnKeys, SortByCreateAtType } from '@/types/enums.ts'
import { formatTimestamp, isMilliseconds } from '@/utils/helpers.ts'
import { isBscWalletAddress, isSolanaWallet } from '@/utils/solana.ts'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage.ts'
import { getTimeAgo } from '@/utils/time.ts'
import { Loading } from '@components/common/Loading.tsx'
import FilterAddress from '@components/detaiTokenTable/FilterAddress.tsx'
import FilterArrowSort from '@components/detaiTokenTable/FilterArrowSort.tsx'
import AvgBuySellColumn from '@components/detailHolderTab/AvgBuySellColumn.tsx'
import OptimizedTotalProfitColumn from '@components/detailHolderTab/OptimizedTotalProfitColumn.tsx'
import OptimizedUsdColumn from '@components/detailHolderTab/OptimizedUsdColumn.tsx'
import TwoValuesColumn from '@components/detailHolderTab/TwoValuesColumn.tsx'
import ItemHolderPc from '@components/detailHolderTab/pc/ItemHolderPc.tsx'
import DialogChangeAliasPool from '@components/detailPoolTab/pc/DialogChangeAliasPool.tsx'
import { DataTableInfiniteScroll } from '@components/ui/XTableInfiniteScroll.tsx'
import { Button } from '@components/ui/button.tsx'
import { SkeletonList } from '@components/ui/skeleton.tsx'
import { TTL_STORAGE } from '@const/configs.ts'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'
import { useActiveChain, useNativeTokenSymbol } from '@hooks/useActiveChain.ts'
import useGetHolders from '@hooks/useGetHolders.ts'
import { getHolder } from '@services/tokens.service.ts'
import { ColumnDef } from '@tanstack/react-table'
import { throttle } from 'lodash-es'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
  buildFundingColorMap,
  FundingColorMeta,
  getHolderFundingColor,
  getHolderFundingCountRepeat,
} from '@/utils/holderFundingColor'
import NetInFlowColumn from '@components/detailHolderTab/pc/NetInFlowColumn.tsx'
import ChangeDataUnitHeader from '@components/detailPoolTab/pc/ChangeDataUnitHeader.tsx'
import ItemHoldingPct from '@components/detailHolderTab/pc/ItemHoldingPct.tsx'
import ItemHoldingLength from '@components/detailHolderTab/ItemHoldingLength.tsx'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_FOLLOWED_HOLDERS } from '@const/tokenDetail.ts'

type SortByType = {
  type: SortByCreateAtType | undefined
  field?: string
}

type Props = {
  tokenData?: TokenDetail
  isFollowed?: boolean
}

export type HolderWithColor = HolderDto & { fundingColor?: string; count?: number }

const HOLDER_KEY = 'detailHolders'
const FOLLOWED_HOLDER_KEY = 'followedHolders'

const mergeUniqueAndCap = (prev: HolderDto[], next: HolderDto[], cap = 100) => {
  const map = new Map<string, HolderDto>()
  for (const x of prev) map.set(x.address, x)
  for (const x of next) map.set(x.address, x)
  return Array.from(map.values()).slice(0, cap)
}

const HoldersTablePc = ({ tokenData, isFollowed = false }: Props) => {
  const { t } = useTranslation()
  const location = useLocation()
  const cachedData = getFromLocalStorageWithTTL<HolderDto[]>(isFollowed ? FOLLOWED_HOLDER_KEY : HOLDER_KEY) ?? []
  const activeChain = useActiveChain()
  const activeWallet = useSelector(_activeWallet)
  const isConnected = (activeWallet as any)?.isConnected
  const chainId = getChainId(activeChain)
  const [openPurchaseMarkDrawer, setOpenPurchaseMarkDrawer] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  // const { currentFilterHolderTab, holderCount } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)
  const holderCount = useAppSelector((state: RootState) => (state.tradeTab as TradeTabState).holderCount)
  const currentFilterHolderTab = useAppSelector(
    (state: RootState) => (state.tradeTab as TradeTabState).currentFilterHolderTab,
  )

  const classification = useMemo(
    () => (isFollowed ? TransactionClassification.Followed : (currentFilterHolderTab as TransactionClassification)),
    [currentFilterHolderTab, isFollowed],
  )

  const [filteredData, setFilteredData] = useState<HolderDto[]>(cachedData)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [holder, setHolder] = useState<string | undefined>(undefined)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<SortByType>({ type: SortByCreateAtType.DESC, field: 'balance' })
  // const [fundingColorMap, setFundingColorMap] = useState<Record<string, FundingColorMeta>>({})

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])

  const queryInput = useMemo(() => {
    return {
      token: tokenAddress,
      limit: LIMIT_PER_PAGE,
      chainId: chainId ?? ChainIds.Solana,
      holder: holder ? holder : undefined,
      classification: classification,
      sortBy:
        sortBy?.field && sortBy?.type
          ? `${sortBy.type === SortByCreateAtType.DESC ? '-' : '+'}${sortBy.field}`
          : undefined,
    }
  }, [tokenAddress, holder, sortBy.field, sortBy.type, chainId, classification])

  const { data, isFetching, isPending, refetch } = useGetHolders({
    input: {
      ...queryInput,
      limit: 20,
      page: Math.min(page, 5),
    },
    skip: !tokenAddress,
  })

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isFetching) return false
    setPage((prev) => Math.min(prev + 1, 5))
    return true
  }, [hasMore, isFetching])

  const handleRowClick = useCallback((data: HolderWithColor) => {
    const address = data?.address
    setSelectedAddress(address)
    setOpenPurchaseMarkDrawer(true)
  }, [])

  const handleSortByChange = useCallback((field: string) => {
    setSortBy((prev) => {
      if (prev.field === field) {
        return {
          type: prev.type === SortByCreateAtType.ASC ? SortByCreateAtType.DESC : SortByCreateAtType.ASC,
          field: field,
        }
      }
      return {
        type: SortByCreateAtType.DESC,
        field: field,
      }
    })
  }, [])

  const handleTokenSourceValue = useCallback((value: string) => {
    if (!value || value === '' || value === '--') return '--'
    if (value === 'buy') return t('assets.token.buy')
    if (isSolanaWallet(value) || isBscWalletAddress(value)) return formatAddressWallet(value)
    return value
  }, [])

  // useEffect(() => {
  //   if (!filteredData.length) {
  //     setFundingColorMap({})
  //     return
  //   }

  //   setFundingColorMap((prev) => buildFundingColorMap(filteredData, {}, prev))
  // }, [filteredData])

  useEffect(() => {
    const handleRefetchOnFavoriteAction = () => {
      if (isFollowed || queryInput?.classification === TransactionClassification.Followed) {
        refetch().catch(console.error)
      }
    }
    eventBus.on(REFETCH_FOLLOWED_HOLDERS, handleRefetchOnFavoriteAction)

    return () => {
      eventBus.remove(REFETCH_FOLLOWED_HOLDERS, handleRefetchOnFavoriteAction)
    }
  }, [isFollowed, queryInput?.classification])

  const coloredHolders: HolderWithColor[] = useMemo(() => {
    if (!filteredData?.length) return []

    const fundingColorMap = buildFundingColorMap(filteredData, {}, {})
    return filteredData.map((holder) => ({
      ...holder,
      fundingColor: getHolderFundingColor(holder, fundingColorMap, '#FBFBFB'),
      count: getHolderFundingCountRepeat(holder, fundingColorMap),
    }))
  }, [filteredData])

  const holderColumns: ColumnDef<HolderDto>[] = useMemo(
    () => [
      {
        accessorKey: FollowedHolderColumnKeys.INDEX,
        header: () => <div className="min-w-5">#</div>,
        cell: ({ row }) => (
          <div className="app-font-regular text-[12px] leading-[1] text-[#FFFFFFB2]">{row.index + 1}</div>
        ),
      },
      {
        accessorKey: FollowedHolderColumnKeys.WALLET,
        header: () => (
          <div className="flex items-center gap-1 min-w-[88px]">
            <div className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.holder')}
            </div>
            <Button
              size="xs"
              className="rounded-full bg-transparent p-0 h-[13px]"
              onClick={() => setIsFilterOpen(true)}
            >
              <img
                src={holder ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                className="w-[13px] h-[13px]"
                alt="icon filter"
              />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const holder = row?.original as HolderWithColor
          return <ItemHolderPc holder={holder} isFollowed={isFollowed} />
        },
      },
      {
        accessorKey: FollowedHolderColumnKeys.POSITION_PERCENTAGE,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[74px]">
              <div
                className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer"
                onClick={() => handleSortByChange('balance')}
              >
                {t('detail.holderTable.positionPercentage')}
              </div>
              <FilterArrowSort
                type={'balance'}
                currentType={sortBy?.field}
                sortByCreatedAt={sortBy?.type}
                isNewTwoArrowSort
                handleOnclickSort={() => handleSortByChange('balance')}
              />
            </div>
          )
        },
        cell: ({ row }) => {
          const holder = row?.original as HolderDto

          return <ItemHoldingPct holder={holder} circulatingSupply={tokenData?.circulatingSupply} />
        },
      },
      {
        accessorKey: FollowedHolderColumnKeys.SOL_BALANCE,
        header: () => {
          const nativeTokenSymbol = useNativeTokenSymbol()
          return (
            <div className="flex items-center gap-0.5 min-w-[112px]">
              <div className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.holderTable.nativeTokenBalance', { token: nativeTokenSymbol })}
              </div>
            </div>
          )
        },
        cell: ({ row }) => {
          const holder = row?.original as HolderDto
          const nativeBalance = Number(holder?.nativeBalance || 0)
          const txTime = holder?.nativeCreatedAt ?? '--'

          return <SolBalanceCell nativeBalance={nativeBalance} txTime={txTime} />
        },
      },
      {
        accessorKey: FollowedHolderColumnKeys.FUND_SOURCE,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[125px]">
              <div className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.holderTable.fundSource')}
              </div>
            </div>
          )
        },
        cell: ({ row }) => <FundSourceCell holder={row?.original as HolderWithColor} t={t} />,
      },

      {
        accessorKey: FollowedHolderColumnKeys.TOKEN_SOURCE,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[112px]">
              <div className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.holder.tokenSource')}
              </div>
            </div>
          )
        },
        cell: ({ row }) => (
          <TokenSourceCell holder={row?.original as HolderWithColor} handleTokenSourceValue={handleTokenSourceValue} />
        ),
      },

      {
        accessorKey: FollowedHolderColumnKeys.TOTAL_BUY,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[120px]">
              <div
                className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer"
                onClick={() => handleSortByChange('totalBuyUsd')}
              >
                {t('detail.holderTable.totalBuy')}
              </div>
              <FilterArrowSort
                type={'totalBuyUsd'}
                currentType={sortBy?.field}
                sortByCreatedAt={sortBy?.type}
                isNewTwoArrowSort
                handleOnclickSort={() => handleSortByChange('totalBuyUsd')}
              />
            </div>
          )
        },
        cell: ({ row }) => {
          const holder = row?.original as HolderDto
          const totalBuy = holder?.buys

          return (
            <OptimizedUsdColumn
              upperUsdValue={holder?.totalBuyUsd}
              lowerUsdValue={holder?.totalBuyQty}
              txCount={totalBuy ?? 0}
              upperValueClassName="app-font-medium text-[14px] leading-[1] !text-rise"
              lowerValueClassName="app-font-regular text-[13px] leading-[1] !text-[#6C6A74]"
              customColorUpperValue="text-rise"
            />
          )
        },
      },
      {
        accessorKey: FollowedHolderColumnKeys.TOTAL_SELL,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[120px]">
              <div
                className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer"
                onClick={() => handleSortByChange('totalSellUsd')}
              >
                {t('detail.holderTable.totalSell')}
              </div>
              <FilterArrowSort
                type={'totalSellUsd'}
                currentType={sortBy?.field}
                sortByCreatedAt={sortBy?.type}
                isNewTwoArrowSort
                handleOnclickSort={() => handleSortByChange('totalSellUsd')}
              />
            </div>
          )
        },
        cell: ({ row }) => {
          const holder = row?.original as HolderDto
          const totalSell = holder?.sells ?? 0

          return (
            <OptimizedUsdColumn
              upperUsdValue={holder?.totalSellUsd}
              lowerUsdValue={holder?.totalSellQty}
              txCount={totalSell}
              upperValueClassName="app-font-medium text-[14px] leading-[1] !text-fall"
              lowerValueClassName="app-font-regular text-[13px] leading-[1] !text-[#6C6A74]"
              customColorUpperValue="text-fall"
            />
          )
        },
      },
      {
        accessorKey: FollowedHolderColumnKeys.NET_FLOW,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[120px]">
              <div
                className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer"
                onClick={() => handleSortByChange('totalSellUsd')}
              >
                {t('detail.holderTable.netInflow')}
              </div>
            </div>
          )
        },
        cell: ({ row }) => {
          const holder = row?.original as HolderDto

          return <NetInFlowColumn value={holder?.netInflow} className="app-font-medium text-[14px] leading-[1]" />
        },
      },
      {
        accessorKey: FollowedHolderColumnKeys.TOTAL_PROFIT,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[100px]">
              <div className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.holderTable.totalProfit')}
              </div>
              <FilterArrowSort
                type={'totalProfit'}
                currentType={sortBy?.field}
                sortByCreatedAt={sortBy?.type}
                isNewTwoArrowSort
                handleOnclickSort={() => handleSortByChange('totalProfit')}
              />
              <ChangeDataUnitHeader />
            </div>
          )
        },
        cell: ({ row }) => {
          const holder = row?.original as HolderDto

          return <TotalProfit holder={holder} />
        },
      },

      {
        accessorKey: FollowedHolderColumnKeys.HOLDING_LENGTH,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[64px]">
              <div className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.holderTable.holdingLength')}
              </div>
            </div>
          )
        },
        cell: ({ row }) => {
          const holder = row?.original as HolderDto
          const holdingLength = holder?.statistic?.startTimeHolding ?? '--'

          return <ItemHoldingLength holdingLength={holdingLength} />
        },
      },
      {
        accessorKey: FollowedHolderColumnKeys.AVG_BUY_SELL,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[112px]">
              <div className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.holderTable.avgBuySell')}
              </div>
            </div>
          )
        },
        cell: ({ row }) => {
          const holder = row?.original as HolderDto
          const avgBuyPrice = Number(holder?.totalBuyUsd) / Number(holder?.totalBuyQty)
          const avgSellPrice = Number(holder?.totalSellUsd) / Number(holder?.totalSellQty)

          return <AvgBuySellColumn avgBuyPrice={avgBuyPrice} avgSellPrice={avgSellPrice} />
        },
      },
      {
        accessorKey: FollowedHolderColumnKeys.LAST_ACTIVE,
        header: () => {
          return (
            <div className="flex items-center gap-0.5 min-w-[80px] ">
              <div className="text-[12px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
                {t('detail.holderTable.lastActive')}
              </div>
            </div>
          )
        },
        cell: ({ row }) => {
          const holder = row?.original as HolderDto
          const holdingLength = holder?.updatedAt ?? '--'

          return <LastActiveCell updatedAt={holdingLength} t={t} />
        },
      },
    ],
    [t, sortBy, holder, isFollowed, tokenData?.circulatingSupply, handleSortByChange, handleTokenSourceValue],
  )

  const resetData = useMemo(() => {
    return throttle(
      () => {
        const pages = Array.from({ length: page }, (_, i) => i + 1)
        Promise.all(
          pages.map(async (page) => {
            const result = await futureClient.query({
              query: getHolder,
              variables: {
                input: {
                  ...queryInput,
                  page: Math.min(page, 5),
                  limit: LIMIT_PER_PAGE,
                },
              },
            })
            return result?.data?.getHolder?.data ?? []
          }),
        ).then((results) => {
          const holders = results.flat().slice(0, 100)
          setFilteredData(holders)
        })
      },
      1000,
      { leading: true, trailing: true },
    )
  }, [page, queryInput])

  useEffect(() => {
    if (holderCount) {
      resetData()
    }
  }, [holderCount, resetData])

  useEffect(() => {
    if (data?.getHolder?.data) {
      if (page === 1) {
        saveToLocalStorageWithTTL<HolderDto[]>(
          isFollowed ? FOLLOWED_HOLDER_KEY : HOLDER_KEY,
          data?.getHolder?.data ?? [],
          TTL_STORAGE,
        )
        setFilteredData([...data.getHolder.data])
      } else if (page > 1 && page <= 5) {
        setFilteredData((prev) => mergeUniqueAndCap(prev, data.getHolder.data ?? [], 100))
      }
      setHasMore(data.getHolder.data?.length === LIMIT_PER_PAGE)
    }
  }, [data, isFollowed])

  useEffect(() => {
    setPage(1)
  }, [holder, sortBy?.type, sortBy?.field])

  const isEmptyData = !isPending && filteredData.length === 0

  const tableProps = useMemo(
    () => ({
      isStickyHeader: true,
      containerClassName: cn('border-0 select-none max-h-[calc(100vh-380px)]'),
      tableHeaderRowClassName: '!border-0 !bg-[#1F1E25] whitespace-nowrap',
      tableHeaderClassName: 'border-0 text-[#FFFFFF80] text-[11px] z-10 leading-3 app-font-medium',
      tableBodyRowClassName: cn(
        'border-0 even:bg-[#ECECED05]',
        filteredData?.length > 0 ? 'hover:!bg-[#ECECED1A]' : '',
      ),
      skeletonComponent: <SkeletonList className="w-full" classNameItem="!h-[56px]" count={10} />,
      tableCellClassName: cn('cursor-pointer py-[11.5px]'),
      isShowCta: isEmptyData && classification === TransactionClassification.Followed,
      noDataText:
        isEmptyData && classification === TransactionClassification.Followed
          ? t('emptyFollowing.message.flHolder')
          : t('detail.holder.nodata'),
      onRowClick: handleRowClick, // Sử dụng hàm stable
    }),
    [isFollowed, filteredData?.length, isEmptyData, classification, t, handleRowClick],
  )

  return (
    <>
      <div className="relative mt-1.5 pb-8 z-[3] h-full">
        {
          <>
            <DataTableInfiniteScroll
              columns={holderColumns}
              data={coloredHolders}
              isLoading={isPending && page === 1 && !filteredData}
              fetchMore={handleLoadMore}
              isFollowed={classification === TransactionClassification.Followed}
              isConnected={isConnected}
              tableProps={tableProps}
            />
            {isFetching && page > 1 && page < 5 && (
              <div className="flex justify-center items-center py-4">
                <Loading />
              </div>
            )}
          </>
        }
      </div>
      <FilterAddress
        open={isFilterOpen}
        setOpen={setIsFilterOpen}
        address={holder}
        onAddressChange={(value: string) => {
          setHolder(value)
        }}
        onClear={() => setHolder(undefined)}
      />
      <DialogChangeAliasPool type={EditAliasFrom.HOLDER} />
      <PurchaseMarkDrawer
        open={openPurchaseMarkDrawer}
        setOpen={setOpenPurchaseMarkDrawer}
        address={selectedAddress}
        token={tokenAddress}
        chainId={chainId}
      />
    </>
  )
}

export default HoldersTablePc

const SolBalanceCell = memo(({ nativeBalance, txTime }: { nativeBalance: string | number; txTime: string }) => (
  <div className="space-y-1">
    <div className="app-font-medium text-[14px] leading-[1] text-[#FFFFFF]">
      {formatAmount(Number(nativeBalance || 0), { roundMode: 'floor' })}
    </div>
    <div className="app-font-regular text-[13px] leading-[1] !text-[#6C6A74]">{formatTimestamp(txTime, true)}</div>
  </div>
))

const FundSourceCell = memo(({ holder, t }: { holder: HolderWithColor; t: any }) => {
  const color = holder.fundingColor ?? '#FBFBFB'
  const repeat = holder.count ?? 0
  const fundingTxTime = Number(holder?.sourceOfFundingTxTime ?? 0)

  const txTime = holder?.sourceOfFundingTxTime
    ? new Date(isMilliseconds(fundingTxTime) ? fundingTxTime : fundingTxTime * 1000)
    : '--'

  return (
    <TwoValuesColumn
      txHash={holder?.sourceOfFundingTxHash ?? ''}
      upperValue={formatAddressWallet(holder?.sourceOfFunding ?? '--')}
      lowerValue={formatTimestamp(txTime.toString(), true)}
      upperValueClassName="app-font-medium text-[14px] leading-[1]"
      upperTextColor={color}
      lowerValueClassName="app-font-regular text-[13px] leading-[1] !text-[#6C6A74]"
      isHaveTooltip={color !== '#FBFBFB'}
      tooltipText={t('detail.tokenDetail.alertMM', { repeat })}
    />
  )
})

const TokenSourceCell = memo(({ holder, handleTokenSourceValue }: any) => {
  const tokenSource = holder?.tokenSource ?? '--'
  const TokenSourceTxTime = holder?.tokenSourceTime ? new Date(holder?.tokenSourceTime).toString() : '--'

  return (
    <TwoValuesColumn
      txHash={holder?.tokenSourceTxHash ?? ''}
      upperValue={handleTokenSourceValue(tokenSource)}
      lowerValue={formatTimestamp(TokenSourceTxTime, true)}
      upperValueClassName="app-font-medium text-[14px] leading-[1] text-[#FFFFFF]"
      lowerValueClassName={cn(
        'app-font-regular text-[13px] leading-[1] !text-[#6C6A74]',
        tokenSource !== 'buy' ? '' : 'hidden',
      )}
    />
  )
})

const LastActiveCell = memo(({ updatedAt, t }: { updatedAt: string; t: any }) => (
  <div className="app-font-regular text-[14px] leading-[1] !text-[#6C6A74]">
    {`${getTimeAgo(updatedAt ?? '--')} ${t('detail.tokenDetail.ago')}`}
  </div>
))

const TotalProfit = memo(({ holder }: { holder: HolderDto }) => {
  const ohlcPrice = useAppSelector((state: RootState) => state.tokenDetail.price)

  return <OptimizedTotalProfitColumn holder={holder} fallbackPrice={ohlcPrice} />
})
