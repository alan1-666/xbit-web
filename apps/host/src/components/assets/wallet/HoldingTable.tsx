import { TokenOveral } from '@/components/listCoin/card/TokenOveral'
import { SkeletonList } from '@/components/ui/skeleton'
import {
  DataTableInfiniteScroll,
  TSortConfig,
  TSortDirection,
  XCustomSortFunction,
  XNormalHead,
  XSortHead,
} from '@/components/ui/XTableInfiniteScroll'
import { useActiveChainType } from '@/hooks/useActiveChain'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { useResponsive } from '@/hooks/useResponsive'
import { PAGE_SIZE } from '@/lib/constant'
import { formatAmount, formatPercent, formatPrice, formatVolume, getStyleRiseFall } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { useWalletContextFields } from '@/pages/assets/WalletContext'
import { getSmartMoneyTokenStatistics } from '@/services/copytrade.service'
import { formatNumber } from '@/utils/helpers.ts'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { covertSeconds, formatHoldingDuration } from '@/utils/time'
import { useQuery } from '@apollo/client'
import { ColumnDef } from '@tanstack/react-table'
import { get } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  dataUnit: 'USD' | 'SOL' | 'ETH'
  isOnlyHolding?: boolean
  address: string
}

type TItem = {
  id: number
  logo: string
  name: string
  symbol: string
  address: string
  lastActive: string
  isLowLiquidity: boolean
  unrealizedPnL: number
  avgPriceUsd: number
  realizedPnL: number
  totalProfit: number
  balance: number
  positions: number
  totalSupply: number
  totalSellAmountUsd: number
  totalBuyAmount: number
  totalBuyAmountUsd: number
  totalBuyQuantity: number
  totalSellQuantity: number
  buyTxs: number
  sellTxs: number
  holdingDuration: number
  priceAddress: number
}

const HoldingTable = ({ dataUnit, address, isOnlyHolding = false }: Props) => {
  const { t } = useTranslation()
  const [items, setItems] = useState<TItem[]>(loadFirstPageFromStorage(`${address}-${isOnlyHolding}`))
  const [sortConfig, setSortConfig] = useState<TSortConfig>(
    loadFirstPageFromStorage<TSortConfig>(`holdingTable-${isOnlyHolding}-sortConfig`, {
      key: '',
      value: false,
    }),
  )
  const activeChainType = useActiveChainType()
  //cache token avatar
  const tokensInfo = useRef<Record<string, any>>(loadFirstPageFromStorage<Record<string, any>>(`tokensAvatar`, {}))
  //update sort config
  useEffect(() => {
    saveFirstPageToStorage(`holdingTable-${isOnlyHolding}-sortConfig`, sortConfig)
  }, [sortConfig])
  const [page, setPage] = useState(1)
  const nativeTokenPrice = useNativeTokenPrice()
  const [hasMore, setHasMore] = useState(true)
  const isUSD = useMemo(() => dataUnit === 'USD', [dataUnit])
  const displayUnit = useMemo(() => {
    return dataUnit === 'USD' ? '$' : dataUnit
  }, [dataUnit])
  const { isDesktop } = useResponsive()

  // Remove the prices context from the main component
  const { prices } = useWalletContextFields(['prices'])
  useEffect(() => {
    setItems(
      items.map((item) => ({
        ...item,
        priceAddress: parseFloat(get(prices.get, item.address, '0')),
      })),
    )
  }, [prices.get])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    setItems(loadFirstPageFromStorage(`${address}-${isOnlyHolding}`))
  }, [address, isOnlyHolding])
  const { loading } = useQuery(getSmartMoneyTokenStatistics, {
    variables: {
      input: {
        chain: activeChainType,
        address,
        isOnlyHolding,
        page,
      },
    },
    client: futureClient,
    onCompleted: (res) => {
      const _items = get(res, 'getSmartMoneyTokenStatistics', [])
      if (_items.length < PAGE_SIZE) setHasMore(false)
      if (page === 1) {
        saveFirstPageToStorage(`${address}-${isOnlyHolding}`, _items.map(mapOrderItem))
        setItems(
          _items.map((i: any) => {
            tokensInfo.current[i.token.address] = get(i, 'token.logo', '')
            return mapOrderItem(i)
          }),
        )
        saveFirstPageToStorage(`tokensAvatar`, tokensInfo.current)
      } else {
        setItems((prev) => {
          // If no new orders, return previous state
          if (_items.length) {
            const newItems = _items.map(mapOrderItem)
            return [...prev, ...newItems]
          }
          return prev
        })
      }
    },
    onError: () => {},
  })

  function handleSortChange(key: string, value: TSortDirection) {
    setSortConfig({ key, value })
  }

  function getSortConfig(key: string): TSortDirection {
    return sortConfig.key === key ? sortConfig.value : false
  }

  function mapOrderItem(item: any): TItem {
    return {
      id: get(item, 'token.address', ''),
      logo: get(item, 'token.logo', ''),
      name: get(item, 'token.symbol', ''),
      symbol: get(item, 'token.symbol', ''),
      address: get(item, 'token.address', ''),
      isLowLiquidity: get(item, 'token.isLowLiquidity', false),
      lastActive: get(item, 'lastTxTime', 0),
      unrealizedPnL: Number(get(item, 'avgPriceUsd', 0)),
      avgPriceUsd: get(item, 'avgPriceUsd', 0),
      realizedPnL: Number(get(item, 'realizedPnlUsd', 0)),
      totalProfit: get(item, 'totalProfit', 0),
      balance: get(item, 'balance', 0),
      positions: get(item, 'positions', 0),
      totalSupply: get(item, 'token.totalSupply', 0),
      totalSellAmountUsd: get(item, 'totalSellAmountUsd', 0),
      totalBuyAmount: get(item, 'totalBuyAmountUsd', 0),
      totalBuyAmountUsd: Number(get(item, 'totalBuyAmountUsd', 0)),
      holdingDuration: get(item, 'holdingDuration', 0),
      totalBuyQuantity: get(item, 'totalBuyQuantity', 0),
      totalSellQuantity: get(item, 'totalSellQuantity', 0),
      buyTxs: get(item, 'buys', 0),
      sellTxs: get(item, 'sells', 0),
      priceAddress: parseFloat(get(prices.get, get(item, 'token.address', ''), '0')),
    }
  }

  /**
   * 1 cột có 2 giá trị: 1 giá trị bên trên, 1 giá trị bên dưới
   * Check giá trị bên trên, vẫn tính như bt, nếu trường hợp giá trị đó = 0 hoặc null thì gộp $0 cho 2 giá trị, nếu khác 0 thì xét tiếp giá trị bên dưới, nếu trường hợp totalBuyUsd = 0 hoặc null thì giá trị bên dưới hiện --
   */
  const baseColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'overview',
      header: (props) => (
        <XSortHead
          {...props}
          tKey={t('walletDetail.holderTable.lastActive')}
          className="pl-2.5"
          initialSort={getSortConfig('lastActive')}
          onSortChange={(val) => handleSortChange('lastActive', val)}
        />
      ),
      sortingFn: (rowA, rowB) =>
        XCustomSortFunction(
          rowA.original,
          rowB.original,
          (row) => {
            //if lastActive is 0, is min value
            if (row.lastActive === 0) return -Infinity
            //reverse
            return -row.lastActive
          },
          'date',
        ),
      cell: ({ row }) => {
        const { index } = row
        const { address, logo, name, lastActive, isLowLiquidity } = row.original

        return (
          <TokenOveral
            address={address}
            logo={logo}
            name={name}
            // lastActive={useTimeAgoGlobal(Number(lastActive))}
            lastActive={lastActive}
            isLowLiquidity={isLowLiquidity}
          />
        )
      },
    },
    {
      accessorKey: 'unrealizedPnL',
      header: (props) => (
        <XSortHead
          {...props}
          tKey={t('walletDetail.holderTable.unrealized')}
          initialSort={getSortConfig('unrealizedPnL')}
          onSortChange={(val) => handleSortChange('unrealizedPnL', val)}
        />
      ),
      sortingFn: (rowA, rowB) => {
        return XCustomSortFunction(
          rowA.original,
          rowB.original,
          (row) => {
            const { avgPriceUsd, balance, priceAddress } = row
            return avgPriceUsd == 0 ? 0 : (priceAddress - avgPriceUsd) * balance
          },
          'number',
        )
      },
      // cell: ({ row }) => <UnrealizedPnLCell row={row} isUSD={isUSD} priceTokenSOL={priceTokenSOL} />,
      cell: ({ row }) => {
        const { avgPriceUsd, balance, totalBuyAmountUsd, priceAddress, isLowLiquidity } = row.original
        const unrealizedPnL = avgPriceUsd == 0 ? 0 : (priceAddress - avgPriceUsd) * balance
        return (
          <div
            className={`font-medium text-[13px] space-y-1.5 ${getStyleRiseFall(unrealizedPnL)} ${isLowLiquidity ? 'line-through' : ''}`}
          >
            <div className={`app-font-medium text-[13px] leading-[1] ${getStyleRiseFall(unrealizedPnL)}`}>
              {isUSD
                ? formatVolume(unrealizedPnL, { showCurrency: true, roundMode: 'floor' })
                : formatAmount(unrealizedPnL / nativeTokenPrice, { unit: displayUnit, roundMode: 'floor' })}
            </div>
            {unrealizedPnL != 0 && (
              <div
                className={`app-font-regular text-[11px] leading-[1] ${getStyleRiseFall(unrealizedPnL / totalBuyAmountUsd)}`}
              >
                {formatPercent(totalBuyAmountUsd ? (unrealizedPnL / totalBuyAmountUsd) * 100 : 0)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'realizedPnL',
      header: (props) => (
        <XSortHead
          {...props}
          tKey={t('walletDetail.holderTable.realized')}
          initialSort={getSortConfig('realizedPnL')}
          onSortChange={(val) => handleSortChange('realizedPnL', val)}
        />
      ),
      sortingFn: (rowA, rowB) => XCustomSortFunction(rowA.original, rowB.original, (row) => row.realizedPnL, 'number'),
      cell: ({ row }) => {
        const { realizedPnL, totalBuyAmountUsd } = row.original
        return (
          <div className={`font-medium text-[13px] space-y-1.5 ${getStyleRiseFall(realizedPnL)}`}>
            <div className={`app-font-medium text-[13px] leading-[1] ${getStyleRiseFall(realizedPnL)}`}>
              {isUSD
                ? formatVolume(realizedPnL, { showCurrency: true, roundMode: 'floor' })
                : formatAmount(realizedPnL / nativeTokenPrice, { unit: displayUnit, roundMode: 'floor' })}
            </div>
            {realizedPnL != 0 && (
              <div
                className={`app-font-regular text-[11px] leading-[1] ${getStyleRiseFall(realizedPnL / totalBuyAmountUsd)}`}
              >
                {formatPercent(totalBuyAmountUsd ? (realizedPnL / totalBuyAmountUsd) * 100 : 0)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalPnL',
      header: (props) => (
        <XSortHead
          {...props}
          tKey={t('walletDetail.holderTable.totalProfit')}
          initialSort={getSortConfig('totalPnL')}
          onSortChange={(val) => handleSortChange('totalPnL', val)}
        />
      ),
      sortingFn: (rowA, rowB) => {
        // Create a temporary prices object for sorting
        return XCustomSortFunction(
          rowA.original,
          rowB.original,
          (row) => {
            const { avgPriceUsd, balance, realizedPnL, priceAddress } = row
            return (priceAddress - avgPriceUsd) * balance + realizedPnL
          },
          'number',
        )
      },
      cell: ({ row }) => {
        const { avgPriceUsd, balance, realizedPnL, totalBuyAmountUsd, priceAddress } = row.original
        // avgPriceUsd = 0 => transfer isn't buy/sell transaction, so totalPnL = realizedPnL
        const _totalPnL = avgPriceUsd == 0 ? realizedPnL : (priceAddress - avgPriceUsd) * balance + realizedPnL

        return (
          <div className={cn('font-medium text-[13px] space-y-1.5', getStyleRiseFall(_totalPnL))}>
            <div className={`app-font-medium text-[13px] leading-[1] ${getStyleRiseFall(_totalPnL)}`}>
              {isUSD
                ? formatVolume(_totalPnL, { showCurrency: true, roundMode: 'floor' })
                : formatAmount(_totalPnL / nativeTokenPrice, { unit: displayUnit, roundMode: 'floor' })}
            </div>
            {_totalPnL != 0 && (
              <div
                className={`app-font-regular text-[11px] leading-[1] ${getStyleRiseFall(_totalPnL / totalBuyAmountUsd)}`}
              >
                {formatPercent(totalBuyAmountUsd ? (_totalPnL / totalBuyAmountUsd) * 100 : 0)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'balance',
      header: (props) => (
        <XSortHead
          {...props}
          tKey={t('walletDetail.holderTable.balance')}
          initialSort={getSortConfig('balance')}
          onSortChange={(val) => handleSortChange('balance', val)}
          className="pl-2"
        />
      ),
      sortingFn: (rowA, rowB) =>
        XCustomSortFunction(
          rowA.original,
          rowB.original,
          (row) => {
            const { balance, priceAddress } = row
            return priceAddress * balance
          },
          'number',
        ),
      cell: ({ row }) => {
        const { balance, priceAddress, isLowLiquidity } = row.original
        const _value = priceAddress * balance
        return (
          <div className={`font-medium text-[13px] px-2 ${isLowLiquidity ? 'line-through' : ''}`}>
            {isUSD
              ? formatVolume(_value, {
                  showCurrency: true,
                })
              : formatAmount(_value / nativeTokenPrice, {
                  unit: displayUnit,
                })}
          </div>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: () => <XNormalHead tKey={t('walletDetail.holderTable.amount')} className="pl-2 normal-case" />,
      cell: ({ row }) => {
        const { balance } = row.original
        return <div className="font-medium text-[13px] text-white pr-[4px] pl-[8px]">{formatAmount(balance)}</div>
      },
    },
    {
      accessorKey: 'holdingRate',
      header: () => <XNormalHead tKey={t('walletDetail.holdings.holdingRate')} className="pl-2 normal-case" />,
      cell: ({ row }) => {
        const { balance, totalSupply } = row.original
        const rate = balance && totalSupply ? (Number(balance) / Number(totalSupply)) * 100 : 0
        return (
          <span className="text-[13px] px-2">
            {formatPercent(rate, {
              showSmallAsAngleBracket: true,
            })}
          </span>
        )
      },
    },
    {
      accessorKey: 'holdingDuration',
      header: (props) => (
        <XSortHead
          {...props}
          tKey={t('walletDetail.holderTable.holdingLength')}
          initialSort={getSortConfig('holdingDuration')}
          onSortChange={(val) => handleSortChange('holdingDuration', val)}
          className="pl-2"
        />
      ),
      sortingFn: (rowA, rowB) =>
        XCustomSortFunction(rowA.original, rowB.original, (row) => row.holdingDuration, 'number'),
      cell: ({ row }) => {
        const { holdingDuration } = row.original
        return (
          <div className="font-medium text-[13px] flex items-center text-white px-2">
            {formatHoldingDuration(holdingDuration)}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalBuyAmount',
      header: (props) => (
        <XSortHead
          {...props}
          tKey={t('walletDetail.holderTable.totalBuy')}
          initialSort={getSortConfig('totalBuyAmount')}
          onSortChange={(val) => handleSortChange('totalBuyAmount', val)}
          className="pl-2"
        />
      ),
      sortingFn: (rowA, rowB) =>
        XCustomSortFunction(rowA.original, rowB.original, (row) => row.totalBuyAmountUsd, 'number'),
      cell: ({ row }) => {
        const { totalBuyAmountUsd, totalBuyQuantity } = row.original
        return (
          <div className="px-2 space-y-1.5">
            <div className="app-font-medium text-[13px] leading-[1] !text-white">
              {isUSD
                ? formatVolume(totalBuyAmountUsd, { showCurrency: true })
                : formatAmount(totalBuyAmountUsd / nativeTokenPrice, { unit: displayUnit })}
            </div>
            {totalBuyQuantity != 0 && (
              <div className="app-font-regular text-[11px] leading-[1]} !text-[#FFFFFF70]">
                {formatAmount(totalBuyQuantity)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalSell',
      header: (props) => (
        <XSortHead
          {...props}
          tKey={t('walletDetail.holderTable.totalSell')}
          initialSort={getSortConfig('totalSellAmount')}
          onSortChange={(val) => handleSortChange('totalSellAmount', val)}
          className="pl-2"
        />
      ),
      sortingFn: (rowA, rowB) =>
        XCustomSortFunction(rowA.original, rowB.original, (row) => row.totalSellAmountUsd, 'number'),
      cell: ({ row }) => {
        const { totalSellAmountUsd, totalSellQuantity } = row.original
        return (
          <div className="px-2 space-y-1.5">
            <div className="app-font-medium text-[13px] leading-[1] !text-white">
              {isUSD
                ? formatVolume(totalSellAmountUsd, { showCurrency: true })
                : formatAmount(totalSellAmountUsd / nativeTokenPrice, { unit: displayUnit })}
            </div>
            {totalSellQuantity != 0 && (
              <div className="app-font-regular text-[11px] leading-[1]} !text-[#FFFFFF70]">
                {formatAmount(totalSellQuantity)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'token',
      header: (props) => (
        <XSortHead
          {...props}
          tKey={`${t('walletDetail.holderTable.avgBuyPrice')}/${t('walletDetail.holderTable.avgSellPrice')}`}
          initialSort={getSortConfig('avgPrice')}
          onSortChange={(val) => handleSortChange('avgPrice', val)}
          className="pl-2"
        />
      ),
      sortingFn: (rowA, rowB) =>
        XCustomSortFunction(
          rowA.original,
          rowB.original,
          (row) => {
            const { totalBuyAmountUsd, totalBuyQuantity } = row
            return isNaN(totalBuyAmountUsd / totalBuyQuantity) ? 0 : totalBuyAmountUsd / totalBuyQuantity
          },
          'number',
        ),
      cell: ({ row }) => {
        const { totalBuyAmountUsd, totalBuyQuantity, totalSellAmountUsd, totalSellQuantity } = row.original
        return (
          <div className="px-2 space-y-1.5">
            <div className="app-font-medium text-[13px] leading-[1] !text-white">
              {isUSD
                ? formatPrice(totalBuyAmountUsd / totalBuyQuantity || 0, { showCurrency: true })
                : formatAmount(totalBuyAmountUsd / totalBuyQuantity / nativeTokenPrice || 0, { unit: displayUnit })}
            </div>
            <div className="app-font-regular text-[11px] leading-[1]} !text-[#FFFFFF70]">
              {isUSD
                ? formatPrice(totalSellAmountUsd / totalSellQuantity || 0, {
                    showCurrency: true,
                  })
                : formatAmount(totalSellAmountUsd / totalSellQuantity / nativeTokenPrice || 0, {
                    unit: displayUnit,
                  })}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'txCount',
      header: () => (
        <XNormalHead tKey={t('walletDetail.holderTable.txCount')} className="pl-2 justify-end w-full normal-case" />
      ),
      cell: ({ row }) => {
        const { buyTxs, sellTxs } = row.original
        return (
          <div className="font-medium text-[13px] flex justify-end items-center text-white px-2 gap-[1px]">
            <span className="text-rise">{formatNumber(buyTxs)}</span>/
            <span className="text-fall">{formatNumber(sellTxs)}</span>
          </div>
        )
      },
      meta: {
        headerClassName: 'text-right',
      },
    },
  ]
  const columns: ColumnDef<any>[] = useMemo(() => {
    if (isOnlyHolding) {
      return baseColumns.filter((col) => col.header !== t('walletDetail.holdings.holdingRate'))
    }
    return baseColumns
  }, [isOnlyHolding, baseColumns, t])

  const handleBottomReached = () => {
    if (!loading && hasMore) {
      setPage((p) => p + 1)
    }
  }
  return (
    <DataTableInfiniteScroll
      isLoading={loading && !items.length}
      columns={columns}
      data={items}
      fetchMore={handleBottomReached}
      hasMore={hasMore}
      tableProps={{
        containerClassName: 'border-none mt-0 mx-[-10px] pr-2.5 max-h-[calc(100vh-210px)] no-scrollbar',
        tableHeadClassName: cn(
          'text-[12px] leading-[0.75rem] text-[#FFFFFF80] cursor-pointer h-[18px] px-[10px] py-[11px] pl-0 last:text-right',
          isDesktop ? '' : 'bg-[#121214]',
        ),
        tableHeaderClassName: cn('text-[rgba(255,255,255,0.48) last:text-right', isDesktop ? '' : 'bg-[#27272a]'),
        tableHeaderRowClassName: cn(
          'border-none text-[11px] text-[rgba(255, 255, 255)] sticky top-0 whitespace-nowrap z-5 top-[-1px] border-b border-[#79778C29] border-t bg-[#121214] last:text-right',
        ),
        tableBodyRowClassName: 'group whitespace-nowrap h-[48px] border-none bg-[#121214]',
        tableCellClassName: cn(
          'p-0 cursor-pointer pl-0 pr-1 border-none pt-[4.5px] pb-[4.5px] py-[12px]',
          isDesktop ? 'group-hover:!bg-[#27272a]' : 'bg-[#121214]',
        ),
        skeletonComponent: <SkeletonList className="w-full" classNameItem="h-[48px]" count={10} />,
        isStickyFirstColumn: true,
        isShowLoadMore: loading,
        // oddRowClassName: 'bg-[transparent]',
        evenRowClassName: isDesktop ? 'bg-[#18181c]' : '',
      }}
    />
  )
}

export default HoldingTable
