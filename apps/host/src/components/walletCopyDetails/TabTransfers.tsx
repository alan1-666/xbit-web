import { PAGE_SIZE } from '@/lib/constant'
import { getStyleRiseFall } from '@/lib/format'
import { gqlClient, tradingClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/redux/store'
import { getCopyTradeOrders, getCopyTradeOrdersFilters } from '@/services/copytrade.service'
import { getManyTokenSimple } from '@/services/tokens.service'
import { ChainIds } from '@/types/enums'
import { getLinkExplorer } from '@/utils/helpers.ts'
import { listCoinHelper } from '@/utils/list-coin-helper'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { formatToTimeAgoI18n, getTimeAgo } from '@/utils/time'
import { useQuery } from '@apollo/client'
import CopyTypeCell from '@components/walletCopyDetails/CopyTypeCell.tsx'
import ParametersCell from '@components/walletCopyDetails/ParametersCell.tsx'
import { ColumnDef } from '@tanstack/react-table'
import { capitalize, get, isNull } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TokenOveral } from '../listCoin/card/TokenOveral'
import { SkeletonList } from '../ui/skeleton'
import { DataTableInfiniteScroll, TSortDirection, XNormalHead } from '../ui/XTableInfiniteScroll'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import dayjs from 'dayjs'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { formatPrice, formatAmount, formatVolume } from '@/lib/format'
import { HeaderRecentFollowUp, HeaderType, HeaderVolume } from './HeaderColumns'

type IProps = {
  status: 'success' | 'failed'
  id: string
}

type OrderItem = {
  address: string
  createdAt: string
  type: string
  baseSymbol: string
  profit: string | number | null
  volume: number
  volumeInNativeToken: number
  soldPrice: string | number
  amount: string | number
  copyType: string
  parameters: {
    tp: string
    sl: string
  }
  pnl: any
  closePriceUsd: string | number
  closePriceQuote: string
  hash: string
  copyConfig: any
  failedReason: string
  transactionType: string
  copyConfigSnapshot?: unknown
}
type TItem = { label: string; value: string }

export interface SortQuery {
  createdAt?: TSortDirection
  transactionType?: 'Sell' | 'Buy'
  baseAddress?: string
  volume?: { minVolume?: number; maxVolume?: number }
}

export default function TabTransfers(props: IProps) {
  const { status = 'success', id } = props
  const { isDesktop } = useResponsive()
  const [tokensInfo, setTokensInfo] = useState<Record<string, any> | null>(
    loadFirstPageFromStorage<Record<string, string> | null>(`tokensAvatar`, {}),
  )
  const { t } = useTranslation()
  const [listOrders, setListOrders] = useState<OrderItem[]>(loadFirstPageFromStorage(`${id}-${status}`, []))
  const [tokens, setTokens] = useState<TItem[]>([
    {
      label: t('walletCopy.filter.all'),
      value: '',
    },
  ])

  const [typeDate, setTypeDate] = useState<'d' | 'YYYY/MM/DD HH:mm:ss'>('d')
  const nativeTokenPrice = useNativeTokenPrice()
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const isUSD = useMemo(() => dataUnit === 'USD', [dataUnit])
  // const [sortQuery, setSortQuery] = useState<{
  //   createdAt?: TSortDirection
  //   transactionType?: 'Sell' | 'Buy'
  //   baseAddress?: string
  //   volume?: { minVolume?: number; maxVolume?: number }
  // }>(loadFirstPageFromStorage<{
  //   createdAt?: TSortDirection
  //   transactionType?: 'Sell' | 'Buy'
  //   baseAddress?: string
  //   volume?: { minVolume?: number; maxVolume?: number }
  // }>(`${id}-${status}-sortConfig`, {
  //   createdAt: undefined,
  //   transactionType: undefined,
  //   baseAddress: undefined,
  //   volume: { minVolume: undefined, maxVolume: undefined },
  // }))
  const [sortQuery, setSortQuery] = useState<SortQuery>({
    createdAt: undefined,
    transactionType: undefined,
    baseAddress: undefined,
    volume: { minVolume: undefined, maxVolume: undefined },
  })

  //detect set SortQuery will reset page to 1
  useEffect(() => {
    if (
      sortQuery.createdAt ||
      sortQuery.transactionType ||
      sortQuery.baseAddress ||
      sortQuery.volume?.minVolume ||
      sortQuery.volume?.maxVolume
    ) {
      setPage(1)
    }
  }, [
    sortQuery.createdAt,
    sortQuery.transactionType,
    sortQuery.baseAddress,
    sortQuery.volume?.minVolume,
    sortQuery.volume?.maxVolume,
  ])

  useEffect(() => {
    saveFirstPageToStorage(`${id}-${status}-sortConfig`, sortQuery)
  }, [sortQuery])

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  useQuery(getCopyTradeOrdersFilters, {
    variables: {
      input: {
        chainId: ChainIds.Solana,
        copyTradeConfigId: id,
        status: status === 'success' ? 'Completed' : 'Canceled',
      },
    },
    client: tradingClient,
    onCompleted: async (res) => {
      const _items: TItem[] = [
        {
          label: t('walletCopy.filter.all'),
          value: '',
        },
      ]
      const _addressList: string[] = []
      const _listTokens = Object.keys(tokensInfo || {})
      ;(
        get(res, 'getCopyTradeOrdersFilters.uniqueBaseSymbols', []) as { baseSymbol: string; baseAddress: string }[]
      ).forEach((item) => {
        if (item.baseSymbol) {
          _items.push({
            label: item.baseSymbol,
            value: item.baseAddress,
          })
        }
        _addressList.push(item.baseAddress)
      })
      setTokens(_items)
      //get avt only address not in tokensInfo
      const _addressListNotInTokensInfo = _addressList.filter((i) => !_listTokens.includes(i))
      if (_addressListNotInTokensInfo.length > 0) {
        const _res = await getTokensInfo(_addressListNotInTokensInfo)
        const _arr = get(_res, 'data.getManyToken', [])
        if (_arr.length > 0) {
          const _obj = _arr.reduce(
            (
              acc: Record<string, any>,
              item: {
                info: {
                  logoUrl: string
                }
                symbol: string
                address: string
              },
            ) => {
              const _avt = get(item, 'info.logoUrl', '')
              if (_avt && _avt.length > 0) {
                acc[item.address] = _avt
              }
              return acc
            },
            {},
          )
          saveFirstPageToStorage(`tokensAvatar`, { ...tokensInfo, ..._obj })
          setTokensInfo({ ...tokensInfo, ..._obj })
        }
      }
    },
  })

  const { loading } = useQuery(getCopyTradeOrders, {
    variables: {
      input: {
        copyTradeConfigId: id,
        status: status === 'success' ? 'Completed' : 'Canceled',
        chainId: ChainIds.Solana,
        ...(sortQuery.createdAt && { createdAt: sortQuery.createdAt }),
        ...(sortQuery.transactionType && { transactionType: sortQuery.transactionType }),
        ...(sortQuery.baseAddress && { baseAddress: sortQuery.baseAddress }),
        ...(sortQuery.volume?.minVolume && { minVolume: sortQuery.volume.minVolume }),
        ...(sortQuery.volume?.maxVolume && { maxVolume: sortQuery.volume.maxVolume }),
        currency: 'USD',
        pageSize: PAGE_SIZE,
        page,
      },
    },
    client: tradingClient,
    onCompleted: (res) => {
      const _getCopyTradeOrders = get(res, 'copyTradeOrders', [])
      if (_getCopyTradeOrders.length < PAGE_SIZE) setHasMore(false)
      if (page === 1) {
        setListOrders(_getCopyTradeOrders.map(mapOrderItem))
        saveFirstPageToStorage(`${id}-${status}`, _getCopyTradeOrders.map(mapOrderItem))
      } else {
        setListOrders((prev) => {
          // If no new orders, return previous state
          if (_getCopyTradeOrders.length) {
            const newOrders = _getCopyTradeOrders.map(mapOrderItem)
            return [...prev, ...newOrders]
          }
          return prev
        })
      }
    },
  })

  function getTokensInfo(_address: string[]) {
    return gqlClient.query({
      query: getManyTokenSimple,
      variables: {
        input: {
          chainId: 501424,
          tokens: _address,
        },
      },
    })
  }

  function mapOrderItem(item: any): OrderItem {
    const transactionType = get(item, 'transactionType', 'buy')
    const isBuy = transactionType.toLocaleLowerCase() === 'buy'
    const copyConfigSnapshotStr = get(item, 'copyConfigSnapshot', '{}')
    let copyConfigSnapshot: unknown = {}
    try {
      copyConfigSnapshot = JSON.parse(copyConfigSnapshotStr)
    } catch (error) {
      console.error('Error parsing copyConfigSnapshot', error)
      copyConfigSnapshot = {}
    }

    /**
     * nếu copyTradeAvgBuyPriceUsd = 0 hoặc null thì giá trị profit = $0
     */
    return {
      address: get(item, 'baseAddress', ''),
      createdAt: get(item, 'createdAt', new Date().toISOString()),
      type: transactionType,
      baseSymbol: get(item, 'baseSymbol', ''),
      profit: isBuy
        ? '--'
        : parseFloat(item.copyTradeAvgBuyPriceUsd) == 0 || isNull(item.copyTradeAvgBuyPriceUsd)
          ? 0
          : (parseFloat(item.closePriceUsd) - parseFloat(item.copyTradeAvgBuyPriceUsd)) * parseFloat(item.baseAmount),
      volume: parseFloat(item.closePriceUsd) * parseFloat(item.baseAmount),
      volumeInNativeToken: Number(item.closePriceQuote) * Number(item.baseAmount),
      soldPrice: get(item, 'closePriceUsd', 0),
      amount: get(item, 'baseAmount', 0),
      copyType: transactionType,
      parameters: {
        tp: get(item, 'copyConfig.tp', 0),
        sl: get(item, 'copyConfig.sl', 0),
      },
      transactionType: transactionType,
      pnl: get(item, 'pnl', 0),
      closePriceUsd: get(item, 'closePriceUsd', 0),
      closePriceQuote: get(item, 'closePriceQuote', 0),
      hash: get(item, 'txid', ''),
      copyConfig: get(item, 'copyConfig', {}),
      failedReason: t(`orderForm.status.${item.submitCode}`),
      copyConfigSnapshot,
    }
  }

  const handleBottomReached = useCallback(() => {
    if (!loading && hasMore) {
      setPage((p) => p + 1)
    }
  }, [loading, hasMore])

  const handleRecentFilter = useCallback((value: string) => {
    setSortQuery((prev) => ({
      ...prev,
      baseAddress: value == 'all' ? undefined : value,
    }))
  }, [])

  const handleRecentSort = useCallback((sort: TSortDirection) => {
    setSortQuery((prev) => ({ ...prev, createdAt: sort }))
  }, [])

  const handleTypeDateToggle = useCallback(() => {
    setTypeDate((prev) => (prev === 'd' ? 'YYYY/MM/DD HH:mm:ss' : 'd'))
  }, [])

  const handleTypeFilter = useCallback((value: string) => {
    setSortQuery((prev) => ({
      ...prev,
      transactionType: value == 'all' ? undefined : (value as 'Buy' | 'Sell'),
    }))
  }, [])

  const handleVolumeFilter = useCallback((data: { minVolume?: number; maxVolume?: number }) => {
    setSortQuery((prev) => ({ ...prev, volume: data }))
  }, [])

  const renderRecentHeader = useCallback(
    (props: any) => (
      <HeaderRecentFollowUp
        {...props}
        items={tokens}
        sortQuery={sortQuery}
        isDesktop={isDesktop}
        typeDate={typeDate}
        onChangeFilter={handleRecentFilter}
        onSortChange={handleRecentSort}
        onTypeDateToggle={handleTypeDateToggle}
        isPC={isDesktop}
      />
    ),
    [tokens, sortQuery, isDesktop, typeDate, handleRecentFilter, handleRecentSort, handleTypeDateToggle],
  )

  const renderVolumeHeader = useCallback(
    (props: any) => (
      <HeaderVolume {...props} sortQuery={sortQuery} onChangeFilter={handleVolumeFilter} isPC={isDesktop} />
    ),
    [sortQuery, handleVolumeFilter, isDesktop],
  )

  const renderTypeHeader = useCallback(
    (props: any) => (
      <HeaderType
        {...props}
        isDesktop={isDesktop}
        sortQuery={sortQuery}
        onChangeFilter={handleTypeFilter}
        isPC={isDesktop}
      />
    ),
    [isDesktop, sortQuery, handleTypeFilter],
  )

  const columnsCommon: Record<string, ColumnDef<OrderItem, any>> = useMemo(
    () => ({
      recentFollowUp: {
        accessorKey: 'createdAt',
        header: renderRecentHeader,
        enableSorting: false,
        cell: (props) => {
          const { baseSymbol, createdAt, address } = props.row.original
          return (
            <TokenOveral
              address={address}
              logo={tokensInfo?.[address] || ''}
              name={baseSymbol}
              lastActive={formatToTimeAgoI18n(createdAt)}
            />
          )
        },
      },
      type: {
        accessorKey: 'type',
        enableColumnFilter: false,
        header: renderTypeHeader,
        cell: (props) => {
          const isBuy = props.row.original.type.toLocaleLowerCase() === 'buy'
          return (
            <div className="w-[50px] flex items-center min-h-[35px]">
              <span className={cn('text-[13px]', getStyleRiseFall(isBuy))}>
                {isBuy ? t('walletCopy.buy') : t('walletCopy.sell')}
              </span>
            </div>
          )
        },
      },
      amount: {
        accessorKey: 'amount',
        header: () => <XNormalHead tKey={t('walletCopy.quantity')} className="normal-case" />,
        cell: (props) => (
          <div className="flex items-center min-w-[70px]">{formatAmount(props.row.original.amount)}</div>
        ),
      },
      profit: {
        accessorKey: 'profit',
        header: () => (
          <XNormalHead tKey={t('walletCopy.profit')} tooltip={t('walletCopy.profitTooltip')} className="normal-case" />
        ),
        cell: (props) => {
          const _value = props.row.original.profit as number
          return (
            <div className={cn('flex items-center  pr-1', getStyleRiseFall(_value, true))}>
              {isUSD
                ? formatVolume(_value, { showCurrency: true, roundMode: 'floor' })
                : formatAmount(Number(_value) / nativeTokenPrice, { unit: 'SOL', roundMode: 'floor' })}
            </div>
          )
        },
      },
      volume: {
        accessorKey: 'volume',
        enableColumnFilter: true,
        header: renderVolumeHeader,
        cell: (props) => {
          const { original } = props.row
          const isBuy = original.type.toLocaleLowerCase() === 'buy'
          const { volumeInNativeToken } = original
          return (
            <span className={cn('flex', getStyleRiseFall(isBuy))}>
              <span className={cn('flex whitespace-nowrap')}>
                {isUSD
                  ? formatVolume(props.row.original.volume, { showCurrency: true })
                  : formatAmount(Number(volumeInNativeToken) / nativeTokenPrice, { unit: 'SOL' })}
              </span>
            </span>
          )
        },
      },
      closePriceUsd: {
        accessorKey: 'closePriceUsd',
        header: () => <XNormalHead tKey={t('walletCopy.price')} className="normal-case" />,
        cell: (props) => {
          const { original } = props.row
          const isBuy = original.type.toLocaleLowerCase() === 'buy'
          const { closePriceQuote } = original
          return (
            <span className={cn('pr-1', getStyleRiseFall(isBuy))}>
              {isUSD
                ? formatPrice(props.row.original.closePriceUsd, {
                    showCurrency: true,
                  })
                : formatAmount(Number(closePriceQuote), {
                    unit: 'SOL',
                  })}
            </span>
          )
        },
      },
      copyType: {
        accessorKey: 'copyType',
        header: () => <XNormalHead tKey={t('walletCopy.copyType')} className="normal-case" />,
        cell: (props) => <CopyTypeCell {...props} />,
        minSize: 148,
      },
      parameters: {
        accessorKey: 'parameters',
        header: () => <XNormalHead tKey={t('walletCopy.sellParameters')} className="normal-case" />,
        cell: (props) => {
          return (
            <ParametersCell
              tp={props.row.original.parameters.tp}
              sl={props.row.original.parameters.sl}
              type={props.row.original.type as 'buy' | 'sell'}
              row={props.row.original}
            />
          )
        },
      },
      hash: {
        accessorKey: 'hash',
        header: () => <XNormalHead tKey={t('walletCopy.transactionHash')} className="justify-end w-full normal-case" />,
        cell: (props) => (
          <a
            href={getLinkExplorer(ChainIds.Solana, props.row.original.hash)}
            target="_blank"
            className="hover:text-[#00CE89] hover:underline flex justify-end"
          >
            {listCoinHelper.formatWalletNameCustom(props.row.original.hash)}
          </a>
        ),
      },
    }),
    [isUSD, nativeTokenPrice, renderRecentHeader, renderTypeHeader, renderVolumeHeader, t, tokensInfo, typeDate],
  )

  const columnsSuccess: ColumnDef<any, any>[] = [
    columnsCommon.recentFollowUp,
    columnsCommon.type,
    columnsCommon.amount,
    columnsCommon.profit,
    columnsCommon.volume,
    columnsCommon.closePriceUsd,
    columnsCommon.copyType,
    columnsCommon.parameters,
    columnsCommon.hash,
  ]

  // Cache columns definition to avoid unnecessary re-renders
  const columnsFailed: ColumnDef<any, any>[] = [
    columnsCommon.recentFollowUp,
    columnsCommon.type,
    columnsCommon.amount,
    {
      accessorKey: 'failedReason',
      accessorFn: (row) => row.failedReason || '--',
      header: () => <XNormalHead tKey={t('walletCopy.failedReason')} className="w-[250px] normal-case" />,
      cell: (props) => {
        const value = props.getValue()
        return (
          <span
            className={cn(
              'leading-normal block text-[#EA963A] font-regular text-xs lg:text-sm w-full whitespace-normal',
            )}
          >
            {value}
          </span>
        )
      },
    },
    columnsCommon.profit,
    columnsCommon.volume,
    columnsCommon.closePriceUsd,
    // {
    //   accessorKey: 'price',
    //   header: () => <XNormalHead tKey={t('walletCopy.price')} />,
    //   cell: (props) => <MoneyFormatted isShort value={props.getValue()} unit={isUSD ? '$' : 'SOL'} showUnit={!!isNaN(props.getValue())} />,
    // },
    columnsCommon.copyType,
    columnsCommon.parameters,
    columnsCommon.hash,
  ]

  const columns = status === 'success' ? columnsSuccess : columnsFailed

  const skeletonComponent = useMemo(() => {
    return <SkeletonList count={10} />
  }, [])

  return (
    <div className="break-keep -mt-[2.5px]">
      <DataTableInfiniteScroll
        columns={columns}
        data={listOrders}
        isLoading={loading && !listOrders.length}
        fetchMore={handleBottomReached}
        hasMore={hasMore}
        tableProps={{
          containerClassName: 'border-none overflow-x-auto no-scrollbar max-h-[calc(100vh-370px)] pb-[15px]',
          isStickyHeader: true,
          stickyBg: 'rgb(23,24,27)',
          tableClassName: '',
          tableHeadClassName:
            'text-[12px] leading-[0.75rem] text-[#FFFFFF80] cursor-pointer h-[18px] px-[10px] py-[11px] pl-0',
          tableHeaderClassName: 'text-[rgba(255,255,255,0.48)',
          tableHeaderRowClassName:
            'border-none text-[11px] text-[rgba(255, 255, 255)] sticky top-0 whitespace-nowrap z-5 top-[-1px] border-b border-[#79778C29] border-t bg-[#0a0a0a]',
          tableBodyRowClassName: 'group whitespace-nowrap h-[48px] border-none',
          tableCellClassName:
            'p-0 group-hover:!bg-[#27272a] cursor-pointer pl-0 pr-1 border-none pt-[4.5px] pb-[4.5px] py-[12px]',
          skeletonComponent: skeletonComponent,
          isShowCta: false,
          oddRowClassName: 'bg-[transparent]',
          evenRowClassName: 'bg-[#18181B]',
        }}
      />
    </div>
  )
}
