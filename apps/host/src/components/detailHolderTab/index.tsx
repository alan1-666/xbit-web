import { ClassificationStatisticType, HolderDto, TransactionClassification } from '@/@generated/gql/graphql-meme2.ts'
import { APP_PATH } from '@/lib/constant.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { cn } from '@/lib/utils.ts'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { setCurrentFilterHolderTab, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds, FollowedHolderColumnKeys, SortByCreateAtType } from '@/types/enums.ts'
import { UITab } from '@/types/uiTabs.ts'
import { formatDecimalLongValue, formatTimestamp, isMilliseconds } from '@/utils/helpers.ts'
import {
  buildFundingColorMap,
  FundingColorMeta,
  getHolderFundingColor,
  getHolderFundingCountRepeat,
} from '@/utils/holderFundingColor'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage.ts'
import { getTimeAgo } from '@/utils/time.ts'
import { Loading } from '@components/common/Loading.tsx'
import MovingBgTabs from '@components/common/MovingBgTabs.tsx'
import AvgBuySellColumn from '@components/detailHolderTab/AvgBuySellColumn.tsx'
import ChartHolders from '@components/detailHolderTab/ChartHolders.tsx'
import HolderWalletAddress from '@components/detailHolderTab/HolderWalletAddress.tsx'
import OptimizedTotalProfitColumn from '@components/detailHolderTab/OptimizedTotalProfitColumn.tsx'
import OptimizedUnRealizedColumn from '@components/detailHolderTab/OptimizedUnRealizedColumn.tsx'
import OptimizedUsdColumn from '@components/detailHolderTab/OptimizedUsdColumn.tsx'
import { HolderWithColor } from '@components/detailHolderTab/pc/HoldersTablePc.tsx'
import TwoValuesColumn from '@components/detailHolderTab/TwoValuesColumn.tsx'
import CurrencyToggle from '@components/detailTokenTabs/CurrencyToggle.tsx'
import FilterAddress from '@components/detaiTokenTable/FilterAddress.tsx'
import FilterArrowSort from '@components/detaiTokenTable/FilterArrowSort.tsx'
import { SkeletonList } from '@components/ui/skeleton.tsx'
import { DataTableInfiniteScroll } from '@components/ui/XTableInfiniteScroll.tsx'
import { TTL_STORAGE } from '@const/configs.ts'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'
import { useActiveChainId, useNativeTokenSymbol } from '@hooks/useActiveChain.ts'
import { useGetClassificationStatistic } from '@hooks/useGetClassificationStatistic.ts'
import useGetHolders from '@hooks/useGetHolders.ts'
import { getHolder } from '@services/tokens.service.ts'
import { ColumnDef } from '@tanstack/react-table'
import { throttle } from 'lodash-es'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import ItemHoldingPct from '@components/detailHolderTab/pc/ItemHoldingPct.tsx'

type SortByType = {
  type: SortByCreateAtType | undefined
  field?: string
}

type DetailHolderTabProps = {
  circulatingSupply?: number
}

const DetailHolderTab = ({ circulatingSupply }: DetailHolderTabProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const cachedData = getFromLocalStorageWithTTL<HolderDto[]>('detailHolders') ?? []
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentFilterHolderTab, holderCount } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)
  const chainId = useActiveChainId()
  const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)

  const [page, setPage] = useState(1)
  const [filteredData, setFilteredData] = useState<HolderDto[]>(cachedData)
  const [hasMore, setHasMore] = useState(true)
  const [holder, setHolder] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState<SortByType>({ type: SortByCreateAtType.DESC, field: 'balance' })
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [fundingColorMap, setFundingColorMap] = useState<Record<string, FundingColorMeta>>({})

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])

  const { data: classificationData } = useGetClassificationStatistic({
    token: tokenAddress,
    type: ClassificationStatisticType.Holder,
    chainId,
  })

  //create filter with wallets count
  const tagFilters: UITab[] = useMemo(() => {
    const insiderCount = Number(classificationData?.getClassificationStatistic?.insider)
    const whaleCount = Number(classificationData?.getClassificationStatistic?.whale)
    const kolCount = Number(classificationData?.getClassificationStatistic?.kol)
    const devCount = Number(classificationData?.getClassificationStatistic?.dev)
    const smartMoneyCount = Number(classificationData?.getClassificationStatistic?.smartMoney)
    const newWalletCount = Number(classificationData?.getClassificationStatistic?.fresh)
    const followedCount = Number(classificationData?.getClassificationStatistic?.followed)
    const phishingCount = Number(classificationData?.getClassificationStatistic?.phishing)
    const botCount = Number(classificationData?.getClassificationStatistic?.bot)
    const bundlerCount = Number(classificationData?.getClassificationStatistic?.bundler)

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
        label: t('detail.filters.whaleWithCount', {
          tagCount: whaleCount > 0 ? `(${whaleCount === 100 ? '99+' : whaleCount})` : '',
        }),
        value: TransactionClassification.Whale,
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
        label: t('detail.filters.newWalletWithCount', {
          tagCount: newWalletCount > 0 ? `(${newWalletCount === 100 ? '99+' : newWalletCount})` : '',
        }),
        value: TransactionClassification.Fresh,
      },
      {
        label: t('detail.filters.ratWarehouseWithCount', {
          tagCount: insiderCount > 0 ? `(${insiderCount === 100 ? '99+' : insiderCount})` : '',
        }),
        value: TransactionClassification.Insider,
      },
      {
        label: t('detail.filters.phishingWithCount', {
          tagCount: phishingCount > 0 ? `(${phishingCount === 100 ? '99+' : phishingCount})` : '',
        }),
        value: TransactionClassification?.Phishing,
      },
      {
        label: t('detail.filters.botWithCount', {
          tagCount: botCount > 0 ? `(${botCount === 100 ? '99+' : botCount})` : '',
        }),
        value: TransactionClassification.Bot,
      },
      {
        label: t('detail.filters.sameOriginWithCount', {
          tagCount: bundlerCount > 0 ? `(${bundlerCount === 100 ? '99+' : bundlerCount})` : '',
        }),
        value: TransactionClassification.Bundlers,
      },
      // {
      //   label: t('detail.filter.inactive'),
      //   value: TransactionClassification?.InActive
      // },
    ]
  }, [t, classificationData?.getClassificationStatistic])
  const [currentTab, setCurrentTab] = useState<string>(currentFilterHolderTab || tagFilters[0]?.value)

  const queryInput = useMemo(() => {
    return {
      token: tokenAddress,
      limit: LIMIT_PER_PAGE,
      chainId: chainId ?? ChainIds.Solana,
      holder: holder ? holder : undefined,
      classification: currentTab as TransactionClassification,
      sortBy:
        sortBy?.field && sortBy?.type
          ? `${sortBy.type === SortByCreateAtType.DESC ? '-' : '+'}${sortBy.field}`
          : undefined,
    }
  }, [tokenAddress, holder, currentTab, chainId, sortBy?.field, sortBy?.type])

  const { data, isFetching, isPending } = useGetHolders({
    input: {
      ...queryInput,
      page,
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
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    setPage(1)
    dispatch(setCurrentFilterHolderTab(tab))
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
      cell: ({ row }) => (
        <div className="app-font-regular text-[12px] leading-[1] text-[#FFFFFFB2]">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: FollowedHolderColumnKeys.WALLET,
      header: () => (
        <div className="flex items-center gap-0.5 min-w-[88px]">
          <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
            {t('detail.holderTable.holder')}
            <Button size="xs" className="rounded-full bg-transparent p-0 h-6" onClick={() => setIsFilterOpen(true)}>
              <img
                src={holder ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                className="w-[11px] h-[11px]"
                alt="icon filter"
              />
            </Button>
          </div>
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
              className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer"
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
          <div className="flex items-center gap-0.5 min-w-[74px]">
            <div
              className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer"
              onClick={() => handleSortByChange('totalBuyUsd')}
            >
              {t('detail.holderTable.totalBuy')}
            </div>
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
            upperValueClassName="app-font-regular text-[13px] leading-[1] !text-[#CACACA]"
            lowerValueClassName="text-[11px] !text-[#605e68] leading-none font-[330]"
          />
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.TOTAL_SELL,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[74px]">
            <div
              className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer"
              onClick={() => handleSortByChange('totalSellUsd')}
            >
              {t('detail.holderTable.totalSell')}
            </div>
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
            upperValueClassName="app-font-regular text-[13px] leading-[1] text-[#CACACA]"
            lowerValueClassName="text-[11px] !text-[#605e68] leading-none font-[330]"
          />
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.REALIZED,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[88px]">
            <div
              className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer"
              onClick={() => handleSortByChange('realizedProfit')}
            >
              {t('detail.holderTable.realized')}
            </div>
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
            isPnL={true}
          />
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.UNREALIZED,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[88px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.unrealized')}
            </div>
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

        return <OptimizedUnRealizedColumn holder={holder} fallbackPrice={ohlcPrice} />
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.TOTAL_PROFIT,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[88px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.totalProfit')}
            </div>
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

        return <OptimizedTotalProfitColumn holder={holder} fallbackPrice={ohlcPrice} />
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.SOL_BALANCE,
      header: () => {
        const nativeTokenSymbol = useNativeTokenSymbol()
        return (
          <div className="flex items-center gap-0.5 min-w-[112px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.nativeTokenBalance', { token: nativeTokenSymbol })}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto
        const nativeBalance = Number(holder?.nativeBalance || 0)
        const txTime = holder?.nativeCreatedAt ?? '--'

        return (
          <TwoValuesColumn
            upperValue={formatDecimalLongValue(nativeBalance, 2)}
            lowerValue={formatTimestamp(txTime, true)}
            upperValueClassName="app-font-regular text-[13px] leading-[1] text-[#CACACA]"
            lowerValueClassName="text-[11px] !text-[#605e68] leading-none font-[330]"
            isSeparate
          />
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.FUND_SOURCE,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[112px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.fundSource')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row.original as HolderWithColor
        const color = holder.fundingColor ?? '#CACACA'
        const repeat = holder.count ?? 0
        const fundSource = holder?.sourceOfFunding ?? '--'
        const fundingTxTime = Number(holder?.sourceOfFundingTxTime ?? 0)
        const txTime = holder?.sourceOfFundingTxTime
          ? new Date(isMilliseconds(fundingTxTime) ? fundingTxTime : fundingTxTime * 1000)
          : '--'

        return (
          <TwoValuesColumn
            upperValue={formatAddressWallet(fundSource)}
            lowerValue={formatTimestamp(txTime.toString(), true)}
            upperValueClassName="app-font-regular text-[13px] leading-[1] text-[#CACACA]"
            upperTextColor={color}
            lowerValueClassName="text-[11px] !text-[#605e68] leading-none font-[330]"
            isHaveTooltip={color !== '#CACACA'}
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
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.holdingLength')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto
        const holdingLength = holder?.createdAt ?? '--'

        return (
          <div className="text-[11px] text-[#605e68]! leading-none font-[330]">
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
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('detail.holderTable.lastActive')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const holder = row?.original as HolderDto
        const holdingLength = holder?.updatedAt ?? '--'

        return (
          <div className="text-[11px] text-[#605e68] leading-none font-[330]">
            {`${getTimeAgo(holdingLength)} ${t('detail.tokenDetail.ago')}`}
          </div>
        )
      },
    },
  ]

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
                  page: page,
                  limit: LIMIT_PER_PAGE,
                },
              },
            })
            return result?.data?.getHolder?.data ?? []
          }),
        ).then((results) => {
          const holders = results.flat()
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
        saveToLocalStorageWithTTL<HolderDto[]>('detailHolders', data?.getHolder?.data ?? [], TTL_STORAGE)
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
        if (page < 5) handleLoadMore()
      }
    }, 200)

    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [hasMore, handleLoadMore])

  useEffect(() => {
    setPage(1)
  }, [holder, sortBy?.type, sortBy?.field])

  return (
    <div className="sticky z-[1] px-2.5">
      <div className={cn('relative pt-2.5')}>
        {/* Chart */}
        <ChartHolders />
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
        <div className=" flex-1 flex justify-end my-2.5">
          <CurrencyToggle />
        </div>
      </div>
      {/* Table */}
      <div className="relative mt-1.5 pb-1 z-[3]">
        {
          <>
            <DataTableInfiniteScroll
              columns={followedHolderColumns}
              data={coloredHolders}
              isLoading={isPending && page === 1 && !filteredData}
              tableProps={{
                isStickyHeader: true,
                containerClassName: 'border-0 select-none',
                tableHeaderRowClassName: '!border-0 !bg-[#0A0A0A] whitespace-nowrap',
                tableHeaderClassName: 'border-0 text-[#908e98] text-[11px] z-10 leading-3 font-[330]',
                tableBodyRowClassName: 'odd:bg-[#101114] border-0',
                skeletonComponent: <SkeletonList count={10} classNameItem="h-[40px]" />,
                tableCellClassName: 'group-hover:!bg-[#27272a] cursor-pointer',
                isShowCta: currentTab === tagFilters[1]?.value,
                noDataText:
                  currentTab === tagFilters[1]?.value
                    ? t('emptyFollowing.message.flHolder')
                    : t('detail.holder.nodata'),
                onRowClick: (data) => {
                  const address = data?.address
                  const referrer = location.pathname
                  navigate(`${APP_PATH.MEME_WALLET}/${address}?referrer=${referrer}`)
                },
              }}
            />
            {isFetching && (
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
    </div>
  )
}

export default React.memo(DetailHolderTab)
