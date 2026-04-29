import { HolderDto, TransactionClassification } from '@/@generated/gql/graphql-meme2.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { ChainIds, FollowedHolderColumnKeys, SortByCreateAtType } from '@/types/enums.ts'
import { formatDecimalLongValue, formatTimestamp } from '@/utils/helpers.ts'
import {
  buildFundingColorMap,
  FundingColorMeta,
  getHolderFundingColor,
  getHolderFundingCountRepeat,
} from '@/utils/holderFundingColor'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage.ts'
import { getTimeAgo } from '@/utils/time.ts'
import { Loading } from '@components/common/Loading.tsx'
import AvgBuySellColumn from '@components/detailHolderTab/AvgBuySellColumn.tsx'
import HolderWalletAddress from '@components/detailHolderTab/HolderWalletAddress.tsx'
import OptimizedTotalProfitColumn from '@components/detailHolderTab/OptimizedTotalProfitColumn.tsx'
import OptimizedUnRealizedColumn from '@components/detailHolderTab/OptimizedUnRealizedColumn.tsx'
import OptimizedUsdColumn from '@components/detailHolderTab/OptimizedUsdColumn.tsx'
import { HolderWithColor } from '@components/detailHolderTab/pc/HoldersTablePc.tsx'
import TwoValuesColumn from '@components/detailHolderTab/TwoValuesColumn.tsx'
import FilterAddress from '@components/detaiTokenTable/FilterAddress.tsx'
import FilterArrowSort from '@components/detaiTokenTable/FilterArrowSort.tsx'
import { DataTableInfiniteScroll } from '@components/ui/XTableInfiniteScroll.tsx'
import { Configs, TTL_STORAGE } from '@const/configs.ts'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'
import useGetHolders from '@hooks/useGetHolders.ts'
import { ColumnDef } from '@tanstack/react-table'
import { throttle } from 'lodash-es'
import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import ItemHoldingPct from '@components/detailHolderTab/pc/ItemHoldingPct.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'

type SortByType = {
  type: SortByCreateAtType | undefined
  field?: string
}

type DetailFollowedHolderTabProps = {
  fallbackPrice?: number
  circulatingSupply?: number
}

const DetailFollowedHolderTab = memo(({ fallbackPrice, circulatingSupply }: DetailFollowedHolderTabProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const activeWallet = useSelector(_activeWallet)
  const [open, setOpen] = useState(false)

  const [page, setPage] = useState(1)
  const [filteredData, setFilteredData] = useState<HolderDto[]>(
    page === 1 ? (getFromLocalStorageWithTTL<HolderDto[]>('followedHolders') ?? []) : [],
  )
  const [hasMore, setHasMore] = useState(true)
  const [holder, setHolder] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState<SortByType>({ type: SortByCreateAtType.DESC, field: 'balance' })
  const [fundingColorMap, setFundingColorMap] = useState<Record<string, FundingColorMeta>>({})

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])
  const activeChainId = useActiveChainId()

  const { data, isFetching, isPending } = useGetHolders({
    input: {
      token: tokenAddress,
      limit: LIMIT_PER_PAGE,
      page,
      chainId: activeChainId ?? (Configs.enableSolana() ? ChainIds.Solana : ChainIds.Bsc),
      holder: holder ? holder : undefined,

      classification: TransactionClassification.Followed,
      sortBy:
        sortBy?.field && sortBy?.type
          ? `${sortBy.type === SortByCreateAtType.DESC ? '-' : '+'}${sortBy.field}`
          : undefined,
    },
    skip: !tokenAddress,
  })

  const handleLoadMore = async () => {
    if (!hasMore || isFetching) return false
    setPage((prev) => prev + 1)
    return true
  }
  const handleSortByChange = (field: string) => {
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
  }

  useEffect(() => {
    if (!filteredData.length) {
      setFundingColorMap({})
      return
    }

    setFundingColorMap((prev) => buildFundingColorMap(filteredData, {}, prev))
  }, [filteredData])

  const coloredHolders: HolderWithColor[] = useMemo(() => {
    if (!filteredData?.length) return []

    return filteredData.map((holder) => ({
      ...holder,
      fundingColor: getHolderFundingColor(holder, fundingColorMap, '#CACACA'),
      count: getHolderFundingCountRepeat(holder, fundingColorMap),
    }))
  }, [filteredData, fundingColorMap])

  const followedHolderColumns: ColumnDef<HolderDto>[] = [
    {
      accessorKey: FollowedHolderColumnKeys.INDEX,
      header: () => <div className="min-w-5">#</div>,
      cell: ({ row }) => <div className="app-font-regular text-[12px] leading-[1] text-[#CACACA]">{row.index + 1}</div>,
    },
    {
      accessorKey: FollowedHolderColumnKeys.WALLET,
      header: () => (
        <div className="flex items-center gap-0.5 min-w-[110px]">
          <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.holderTable.holder')}</div>
          <img
            src={holder ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
            className="min-w-[11px] h-[11px] cursor-pointer"
            alt="icon filter"
            onClick={() => setOpen(true)}
          />
        </div>
      ),
      cell: ({ row }) => {
        const holder = row?.original as HolderDto
        const positionPercentage =
          holder?.balance && holder?.totalSupply && holder?.totalSupply !== 0
            ? (Number(holder?.balance) / Number(holder?.totalSupply)) * 100
            : 0
        return <HolderWalletAddress holder={holder} positionPercentage={positionPercentage} />
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.POSITION_PERCENTAGE,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[74px]">
            <div
              className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer"
              onClick={() => handleSortByChange('balance')}
            >
              {t('detail.holderTable.positionPercentage')}
            </div>
            <FilterArrowSort
              type={'balance'}
              currentType={sortBy?.field}
              sortByCreatedAt={sortBy?.type}
              handleOnclickSort={() => handleSortByChange('balance')}
            />
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto

        return <ItemHoldingPct holder={holder} circulatingSupply={circulatingSupply} />
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.TOTAL_BUY,
      header: () => {
        return (
          <div
            className="flex items-center gap-0.5 min-w-[74px] cursor-pointer"
            onClick={() => handleSortByChange('totalBuyUsd')}
          >
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.holderTable.totalBuy')}</div>
            <FilterArrowSort
              type={'totalBuyUsd'}
              currentType={sortBy?.field}
              sortByCreatedAt={sortBy?.type}
              handleOnclickSort={() => handleSortByChange('totalBuyUsd')}
            />
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto

        return (
          <OptimizedUsdColumn
            upperUsdValue={holder?.totalBuyUsd}
            lowerUsdValue={holder?.totalBuyQty}
            upperValueClassName="app-font-medium text-[13px] leading-[1] text-[#CACACA]"
            lowerValueClassName="text-[11px] text-[#605e68] leading-none font-[330]"
          />
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.TOTAL_SELL,
      header: () => {
        return (
          <div
            className="flex items-center gap-0.5 min-w-[74px] cursor-pointer"
            onClick={() => handleSortByChange('totalSellUsd')}
          >
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.holderTable.totalSell')}</div>
            <FilterArrowSort
              type={'totalSellUsd'}
              currentType={sortBy?.field}
              sortByCreatedAt={sortBy?.type}
              handleOnclickSort={() => handleSortByChange('totalSellUsd')}
            />
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto

        return (
          <OptimizedUsdColumn
            upperUsdValue={holder?.totalSellUsd}
            lowerUsdValue={holder?.totalSellQty}
            upperValueClassName="app-font-medium text-[13px] leading-[1] text-[#CACACA]"
            lowerValueClassName="text-[11px] text-[#605e68] leading-none font-[330]"
          />
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.REALIZED,
      header: () => {
        return (
          <div
            className="flex items-center gap-0.5 min-w-[88px] cursor-pointer"
            onClick={() => handleSortByChange('realizedProfit')}
          >
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.holderTable.realized')}</div>
            <FilterArrowSort
              type={'realizedProfit'}
              currentType={sortBy?.field}
              sortByCreatedAt={sortBy?.type}
              handleOnclickSort={() => handleSortByChange('realizedProfit')}
            />
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto

        return (
          <OptimizedUsdColumn
            upperUsdValue={holder?.realizedProfit}
            lowerUsdValue={(Number(holder?.realizedProfit) / Number(holder?.totalBuyUsd)) * 100}
            lowerUnit={'%'}
            upperValueClassName={`app-font-medium text-[13px] leading-[1] ${holder?.realizedProfit > 0 ? 'text-rise' : holder?.realizedProfit < 0 ? 'text-fall' : 'text-[#CACACA]'}`}
            lowerValueClassName={`app-font-regular text-[11px] leading-[1] ${holder?.realizedProfit > 0 ? 'text-rise' : holder?.realizedProfit < 0 ? 'text-fall' : 'text-[#605e68]'}`}
          />
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.UNREALIZED,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[88px]">
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.holderTable.unrealized')}</div>
            {/*<FilterArrowSort*/}
            {/*  type={'unrealizedProfit'}*/}
            {/*  currentType={sortBy?.field}*/}
            {/*  sortByCreatedAt={sortBy?.type}*/}
            {/*  handleOnclickSort={() => handleSortByChange('unrealizedProfit')}*/}
            {/*/>*/}
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto

        return <OptimizedUnRealizedColumn holder={holder} fallbackPrice={fallbackPrice} />
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.TOTAL_PROFIT,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[88px]">
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.holderTable.totalProfit')}</div>
            {/*<FilterArrowSort*/}
            {/*  type={'totalProfit'}*/}
            {/*  currentType={sortBy?.field}*/}
            {/*  sortByCreatedAt={sortBy?.type}*/}
            {/*  handleOnclickSort={() => handleSortByChange('totalProfit')}*/}
            {/*/>*/}
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto

        return <OptimizedTotalProfitColumn holder={holder} fallbackPrice={fallbackPrice} />
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.SOL_BALANCE,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[112px]">
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.holderTable.solBalance')}</div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto
        const solBalance = Number(holder?.nativeBalance)
        const txTime = holder?.createdAt ?? '--'

        return (
          <TwoValuesColumn
            upperValue={formatDecimalLongValue(solBalance, 2)}
            lowerValue={formatTimestamp(txTime, true)}
            upperValueClassName="app-font-medium text-[13px] leading-[1] text-[#CACACA]"
            lowerValueClassName="text-[11px] text-[#605e68] leading-none font-[330]"
          />
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.FUND_SOURCE,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[112px]">
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.holderTable.fundSource')}</div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row.original as HolderWithColor
        const color = holder.fundingColor ?? '#CACACA'
        const repeat = holder?.count ?? 0
        const fundSource = holder?.sourceOfFunding ?? '--'
        const txTime = holder?.createdAt ?? '--'

        return (
          <TwoValuesColumn
            upperValue={formatAddressWallet(fundSource)}
            lowerValue={formatTimestamp(txTime, true)}
            upperValueClassName="app-font-medium text-[14px] leading-[1]"
            upperTextColor={color}
            lowerValueClassName="app-font-regular text-[13px] leading-[1] text-[#605e68]"
            isHaveTooltip={color !== '#FBFBFB'}
            tooltipText={t('detail.tokenDetail.alertMM', { repeat })}
          />
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.HOLDING_LENGTH,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[64px]">
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.holdingLength')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto
        const holdingLength = holder?.createdAt ?? '--'

        return (
          <div className="app-font-regular text-[11px] leading-[1] text-[#605e68]">
            {holdingLength === '--' ? holdingLength : getTimeAgo(holdingLength)}
          </div>
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.AVG_BUY_SELL,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[112px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.avgBuySell')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto
        const avgBuyPrice = Number(holder?.totalBuyUsd) / Number(holder?.totalBuyQty)
        const avgSellPrice = Number(holder?.totalSellUsd) / Number(holder?.totalSellQty)

        return (
          <>
            <AvgBuySellColumn avgBuyPrice={avgBuyPrice} avgSellPrice={avgSellPrice} />
          </>
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.TRANSACTION_COUNT,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[64px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.txCount')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto
        const buy = holder?.buys
        const sell = holder?.sells

        return (
          <div className="flex items-center gap-0.5 app-font-regular text-[11px] leading-[1] ">
            {
              <>
                <span className="text-rise">{buy ?? 0}</span>
                <span className="text-[#FFFFFF]/50">/</span>
                <span className="text-fall">{sell ?? 0}</span>
              </>
            }
          </div>
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.LAST_ACTIVE,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[80px] ">
            <div className="text-[11px] tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.holderTable.lastActive')}</div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto
        const holdingLength = holder?.updatedAt ?? '--'

        return (
          <div className="app-font-regular text-[11px] leading-[1] text-[#605e68]">
            {`${getTimeAgo(holdingLength)} ${t('detail.tokenDetail.ago')}`}
          </div>
        )
      },
    },
  ]

  useEffect(() => {
    if (data?.getHolder?.data) {
      if (page === 1) {
        saveToLocalStorageWithTTL<HolderDto[]>('followedHolders', data?.getHolder?.data ?? [], TTL_STORAGE)
        setFilteredData([...data.getHolder.data])
      } else {
        setFilteredData((prev) => [...prev, ...data.getHolder.data])
      }
      setHasMore(data.getHolder.data?.length === LIMIT_PER_PAGE)
    }
  }, [data])

  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.95

      if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && hasMore) {
        handleLoadMore()
      }
    }, 200)

    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [hasMore, handleLoadMore])

  useEffect(() => {
    setPage(1)
  }, [holder, sortBy?.type, sortBy?.field, activeWallet])

  return (
    <div className="sticky z-[1]">
      {/* Table */}
      <div className="relative pb-1 z-[3]">
        {
          <>
            <DataTableInfiniteScroll
              columns={followedHolderColumns}
              data={coloredHolders}
              isLoading={isPending && page === 1 && !filteredData}
              noDataText={t('emptyFollowing.message.flHolder')}
              tableProps={{
                isStickyHeader: true,
                containerClassName: 'border-0 select-none no-scrollbar',
                tableHeaderRowClassName: '!border-0 !bg-[#0A0A0A] whitespace-nowrap',
                tableHeaderClassName: 'border-0 text-[#908e98] text-[11px] z-10 leading-3 font-[330]',
                tableBodyRowClassName: 'odd:bg-[#101114] border-0',
                isShowCta: true,
              }}
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
        open={open}
        setOpen={setOpen}
        address={holder}
        onAddressChange={(value: string) => {
          setHolder(value)
        }}
      />
    </div>
  )
})

DetailFollowedHolderTab.displayName = 'DetailFollowedHolderTab'

export default DetailFollowedHolderTab
