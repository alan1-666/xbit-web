import {
  ColumnDefWithMeta,
  VirtualizedDataTable,
} from '@pages/meme/discover/desktop/components/VirtualizedDataTable.tsx'
import { formatPriceChange, fShortenNumber } from '@/lib/number.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { useAllCategories } from '@pages/meme/discover/desktop/hooks/useAllCategories.ts'
import { Category } from '@/types/category.ts'
import { cn } from '@/lib/utils.ts'
import { Trans } from 'react-i18next'
import { useShouldShowTopBar } from '@pages/meme/discover/desktop/hooks/useShouldShowTopBar.ts'
import { useMemo, useState } from 'react'
import { SortingState } from '@tanstack/react-table'
import { useAppSelector } from '@/redux/store'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import { CategoryDto } from '@/@generated/gql/graphql-meme2.ts'
import { Link } from 'react-router-dom'

const columns: ColumnDefWithMeta<CategoryDto>[] = [
  {
    id: 'rank',
    header: () => '#',
    size: 50,
    cell: ({ row }) => <div className="text-[#FFFFFF80] w-[50px]">{row.index + 1}</div>,
  },
  {
    id: 'name',
    enableSorting: true,
    header: () => <Trans i18nKey="categories.categoryName" />,
    cell: ({ row }) => {
      const category = row.original
      return (
        <div className="flex items-baseline text-[calc(16rem/16)] font-[380] text-[#908E98] truncate">
          {row.index < 3 && <img src="/images/icons/ic-framer.webp" className="size-3.5 mr-0.5" alt="" />}
          {category.name}
        </div>
      )
    },
    meta: {
      style: { flex: 1, minWidth: 180 },
    },
  },
  {
    id: 'price24hChange',
    enableSorting: true,
    size: 140,
    header: () => <Trans i18nKey="categories.avgChange24h" />,
    cell: ({ row }) => {
      const category = row.original
      const priceChange = category.price24hChange ? +category.price24hChange : 0
      const total = category.tokensCount || 0
      const avgChange = total > 0 ? priceChange / total : 0
      return (
        <div className={cn(avgChange >= 0.01 ? 'text-rise' : avgChange <= -0.01 ? 'text-fall' : 'text-white')}>
          {formatPriceChange(avgChange)}
        </div>
      )
    },
  },
  {
    id: 'top1Token',
    enableSorting: true,
    header: () => <Trans i18nKey="categories.highestGainer" />,
    meta: {
      style: { flex: 1, minWidth: 200 },
    },
    cell: ({ row }) => {
      const category = row.original
      const top1Token = {
        address: category.top1TokenAddress,
        symbol: category.top1TokenSymbol,
        name: category.top1TokenName,
        logoUrl: category.top1TokenLogo,
        price24hChange: category.top1TokenP24hChange,
      }
      const activeChainId = useActiveChainId()
      if (!top1Token) return null
      const priceChange = top1Token.price24hChange ? +top1Token.price24hChange : 0
      const url = NAVIGATIONS.memeTokenDetail(activeChainId ?? ChainIds.Solana, top1Token.address || '')
      return (
        <Link
          to={url}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              {top1Token.logoUrl ? <AvatarImage src={top1Token.logoUrl} /> : null}
              <AvatarFallback>{top1Token.symbol?.slice(0, 2).toLowerCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-baseline gap-1">
                <div className="max-w-[100px] break-keep whitespace-nowrap overflow-hidden text-ellipsis font-[380]">
                  {top1Token.name}
                </div>
                <div className="text-[calc(12rem/16)] text-[#FFFFFF80] font-[330]">{top1Token.symbol}</div>
              </div>
              <div
                className={cn(
                  'font-[330]',
                  priceChange >= 0.01 ? 'text-rise' : priceChange <= -0.01 ? 'text-fall' : 'text-white',
                )}
              >
                {formatPriceChange(top1Token.price24hChange ? +top1Token.price24hChange : 0)}
              </div>
            </div>
          </div>
        </Link>
      )
    },
  },
  {
    id: 'marketCap',
    enableSorting: true,
    size: 120,
    header: () => <Trans i18nKey="categories.marketCapPC" />,
    cell: ({ row }) => {
      const category = row.original
      return <div className="font-[380]">${fShortenNumber(category.marketCap ? +category.marketCap : 0)}</div>
    },
  },
  {
    id: 'volume24h',
    enableSorting: true,
    size: 120,
    header: () => <Trans i18nKey="categories.volume24hPC" />,
    cell: ({ row }) => {
      const category = row.original
      return <div className="font-[380]">${fShortenNumber(category.volume24h ? +category.volume24h : 0)}</div>
    },
  },
  {
    id: 'totalTokens',
    enableSorting: true,
    size: 120,
    header: () => <Trans i18nKey="categories.totalTokens" />,
    cell: ({ row }) => {
      const category = row.original
      return <div className="font-[380]">{fShortenNumber(category.tokensCount ? +category.tokensCount : 0)}</div>
    },
  },
  {
    id: 'upDownRatio',
    header: () => <Trans i18nKey="categories.gainersAndLosers" />,
    size: 260,
    cell: ({ row }) => {
      const category = row.original
      const upCount = category.priceUpCount ?? 0
      const downCount = category.priceDownCount ?? 0
      const total = upCount + downCount
      const ratio = total > 0 ? upCount / total : 0
      return (
        <div className="font-[380] w-[150px]">
          <div className="flex w-full h-1.5 overflow-hidden relative rounded-full">
            <div className="bg-rise" style={{ width: `${ratio * 100}%` }} />
            <div className="bg-fall" style={{ width: `${(1 - ratio) * 100}%` }} />
            {ratio > 0 && ratio < 100 && (
              <>
                <div
                  className="absolute top-0 left-1/2 h-1/2 w-0.5 bg-rise origin-right"
                  style={{ left: `${ratio * 100}%` }}
                />
                <div
                  className="absolute bottom-0 left-1/2 h-1/2 w-0.5 bg-fall origin-right"
                  style={{ left: `${ratio * 100}%` }}
                />
                <div
                  className="absolute top-0 left-1/2 bottom-0 w-0.5 bg-[#121214] -skew-x-[30deg] origin-right"
                  style={{ left: `${ratio * 100}%` }}
                />
              </>
            )}
          </div>
          <div className="w-full flex justify-between text-[calc(12rem/16)] mt-0.5">
            <div className="text-rise">
              {upCount} <span className="text-[#FFFFFF80]">({fShortenNumber(ratio * 100)}%)</span>
            </div>
            <div className="text-fall text-right">
              {downCount} <span className="text-[#FFFFFF80]">({fShortenNumber(100 - ratio * 100)}%)</span>
            </div>
          </div>
        </div>
      )
    },
  },
  {
    id: 'gainers',
    header: () => <Trans i18nKey="categories.topLeaders" />,
    meta: {
      style: { width: 280 },
    },
    cell: ({ row }) => {
      const category = row.original
      const gainers = (category.topGainers ?? []).slice(0, 3)
      const activeChainId = useActiveChainId()
      return (
        <div className="uppercase">
          {gainers.map((gainer, index) => (
            <Link
              to={NAVIGATIONS.memeTokenDetail(activeChainId ?? ChainIds.Solana, gainer.address || '')}
              key={gainer.address}
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              {gainer.symbol}
              {index < gainers.length - 1 ? <span className="text-[#FFFFFF80]"> / </span> : ''}
            </Link>
          ))}
        </div>
      )
    },
  },
]

export interface AllCategoriesListProps {
  onRowClick?: (category: Category) => void
}

type SortFn = (a: Category, b: Category) => number

const sortFnMap: Record<string, SortFn> = {
  name: (a: Category, b: Category) => {
    const aName = a.name || ''
    const bName = b.name || ''
    return aName.localeCompare(bName)
  },
  price24hChange: (a: Category, b: Category) => {
    const aChange = a.price24hChange ? +a.price24hChange : 0
    const bChange = b.price24hChange ? +b.price24hChange : 0
    const aTotal = a.tokensCount || 0
    const bTotal = b.tokensCount || 0
    const aAvg = aTotal > 0 ? aChange / aTotal : 0
    const bAvg = bTotal > 0 ? bChange / bTotal : 0
    return aAvg - bAvg
  },
  marketCap: (a: Category, b: Category) => (a.marketCap ? +a.marketCap : 0) - (b.marketCap ? +b.marketCap : 0),
  volume24h: (a: Category, b: Category) => (a.volume24h ? +a.volume24h : 0) - (b.volume24h ? +b.volume24h : 0),
  totalTokens: (a: Category, b: Category) =>
    (a.tokensCount ? +a.tokensCount : 0) - (b.tokensCount ? +b.tokensCount : 0),
  top1Token: (a: Category, b: Category) => {
    const aChange = a.top1TokenP24hChange ? +a.top1TokenP24hChange : 0
    const bChange = b.top1TokenP24hChange ? +b.top1TokenP24hChange : 0
    return aChange - bChange
  },
}

const defaultSorting: SortingState = [
  {
    id: 'price24hChange',
    desc: true,
  },
]

export const AllCategoriesList = (props: AllCategoriesListProps) => {
  const { onRowClick } = props
  const { data, isLoading } = useAllCategories()
  const isTopBarVisible = useShouldShowTopBar()
  const [sorting, setSorting] = useState<SortingState>(defaultSorting)
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)

  const sortedData = useMemo(() => {
    const sort = sorting[0]
    if (!data) return []
    if (!sort) return data
    const fn = sortFnMap[sort.id]
    if (!fn) return data
    return [...data].sort((a, b) => {
      if (sort.desc) return fn(b, a)
      return fn(a, b)
    })
  }, [data, sorting])

  return (
    <div className="pt-2">
      <VirtualizedDataTable
        data={sortedData}
        columns={columns}
        estimateSize={89}
        className={cn(
          'border-none',
          isShowMaintenanceNotification
            ? isTopBarVisible
              ? 'h-[calc(100vh-310px)]'
              : 'h-[calc(100vh-280px)]'
            : isTopBarVisible
              ? 'h-[calc(100vh-278px)]'
              : 'h-[calc(100vh-248px)]',
        )}
        striped={true}
        onRowClick={onRowClick}
        isLoading={isLoading}
        sorting={sorting.length > 0 ? sorting : defaultSorting}
        onSortingChange={setSorting}
        sortDirections={['desc', 'asc']}
      />
    </div>
  )
}
