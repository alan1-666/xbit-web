import { SortDirection, SortTransactionHistory, TransactionType } from '@/@generated/gql/graphql-meme2'
import { TimeAgo } from '@/components/TimeAgo'
import FilterWallet from '@/components/common/FilterWallet'
import { CopyButton } from '@/components/common/copy-button'
import {
  TSortConfig,
  TSortDirection,
  XCustomSortFunction,
  XNormalHead,
  XSortHead,
} from '@/components/ui/XTableInfiniteScroll'
import XTooltip from '@/components/ui/XTooltip'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useActiveChain, useActiveChainId, useActiveChainType } from '@/hooks/useActiveChain'
import { APP_PATH, CHAIN_EXPLORER_IMAGES, CHAIN_SYMBOLS, PAGE_SIZE } from '@/lib/constant'
import { formatAmount, formatPrice, formatVolume, getStyleRiseFall } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client'
import { cn, getPath } from '@/lib/utils'
import { priceChain } from '@/redux/modules/price.slice'
import { useAppSelector } from '@/redux/store'
import { getSmartMoneyTxHistoriesV2 } from '@/services/copytrade.service'
import { CurrencyUnit } from '@/types/currency'
import { ChainIds } from '@/types/enums'
import { getBlockchainLogo2, getLinkExplorer } from '@/utils/helpers.ts'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { getTimeAgo } from '@/utils/time'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { capitalize, get } from 'lodash-es'
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import DataTableWithVirtual from './DataTableWithVirtual'

type Props = {
  dataUnit: CurrencyUnit
  address: string
}

type TTokenInfo = {
  name: string
  totalSupply: string
}

type TItem = {
  id: number
  token: string
  address: string
  symbol: string
  chainId: number
  lastActive: string
  type: string
  amount: number
  price: number
  volume: string
  quantity: number
  transactionHash: string
  tokenInfo: TTokenInfo
  avgPriceUsd: number
  name: string
  logo: string
  isBuy: boolean
  usdAmount: string
  nativeAmount: string
  nativePrice: string
}

interface ActivityTableContextValue {
  isUSD: boolean
  displayUnit: string
  activeFilter: string
  setActiveFilter: Dispatch<SetStateAction<string>>
}

const ActivityTableContext = createContext<ActivityTableContextValue | undefined>(undefined)

export const useActivityTableContext = () => {
  const context = useContext(ActivityTableContext)
  if (!context) {
    throw new Error('useActivityTableContext must be used within ActivityTableProvider')
  }
  return context
}

interface ActivityTableProviderProps {
  children: ReactNode
  value: ActivityTableContextValue
}

export const ActivityTableProvider = ({ children, value }: ActivityTableProviderProps) => {
  return <ActivityTableContext.Provider value={value}>{children}</ActivityTableContext.Provider>
}

const FilterComponent: FC<{ isActive: boolean; onClick: () => void }> = ({ isActive, onClick }) => {
  return (
    <div
      className={cn('flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full')}
      onClick={onClick}
    >
      <img src={isActive ? '/images/icons/filter-active.svg' : '/images/icons/filter-deactive.svg'} alt="Filter" />
    </div>
  )
}

const ActivityTableContent = ({ dataUnit, address }: Props) => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [sortConfig, setSortConfig] = useState<TSortConfig>(
    loadFirstPageFromStorage<TSortConfig>(`activityTable-sortConfig.${address}`, {
      key: '',
      value: false,
    }),
  )
  const activeChainId = useActiveChainId()
  const activeChain = useActiveChain()
  const activeChainType = useActiveChainType()
  const { activeFilter } = useActivityTableContext()

  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedWalletType, setSelectedWalletType] = useState<string>(
    loadFirstPageFromStorage<string>(`wallet.activity.type.${address}`, searchParams.get('type') || 'all'),
  )

  useEffect(() => {
    saveFirstPageToStorage(`activityTable-sortConfig.${address}`, sortConfig)
  }, [sortConfig, address])

  const mapOrderItem = (item: any): TItem | undefined => {
    return {
      id: get(item, 'token.address', ''),
      token: get(item, 'token.name', ''),
      address: get(item, 'token.address', ''),
      symbol: get(item, 'token.symbol', ''),
      chainId: activeChainId ?? ChainIds.Solana,
      lastActive: get(item, 'timestamp', ''),
      type: get(item, 'type', 'sell'),
      isBuy: get(item, 'type', 'sell').toLocaleLowerCase() === 'buy',
      amount: get(item, 'quantity', 0),
      price: get(item, 'usdPrice', 0),
      volume: '',
      quantity: get(item, 'quantity', 0),
      transactionHash: get(item, 'transactionHash', ''),
      name: get(item, 'token.name', '').trim(),
      logo: get(item, 'token.logo', ''),
      tokenInfo: {
        name: get(item, 'token.name', '').trim(),
        totalSupply: get(item, 'token.totalSupply', ''),
      },
      avgPriceUsd: get(item, 'avgPriceUsd', '0'),
      usdAmount: get(item, 'usdAmount', '0'),
      nativeAmount: get(item, 'nativeAmount', '0'),
      nativePrice: get(item, 'nativePrice', '0'),
    }
  }

  const fetchActivities = async ({ pageParam = 1 }) => {
    const result = await futureClient.query({
      query: getSmartMoneyTxHistoriesV2,
      variables: {
        req: {
          chain: activeChainType,
          address,
          ...(selectedWalletType !== 'all' && {
            type: [selectedWalletType as TransactionType],
          }),
          ...(activeFilter.length && {
            tokenAddress: activeFilter,
            sortBy: SortTransactionHistory.Timestamp,
            sortOrder:
              sortConfig.key === 'lastActive'
                ? sortConfig.value
                  ? SortDirection.Asc
                  : SortDirection.Desc
                : SortDirection.Desc,
          }),
          limit: PAGE_SIZE,
          ...(pageParam !== 1 && { cursor: pageParam }),
        },
      },
    })

    const data = get(result, 'data.getSmartMoneyTxHistoriesV2')
    const transactions = data?.transactions ?? []
    const items = transactions.map(mapOrderItem).filter((i): i is TItem => Boolean(i))

    return {
      items,
      nextCursor: data?.nextCursor,
      hasMore: !!data?.hasMore,
    }
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['activities', address, selectedWalletType, activeFilter, sortConfig],
    queryFn: fetchActivities,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 30000,
  })

  const items = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.items) ?? []
    if (allItems.length && data?.pages[0]) {
      saveFirstPageToStorage(`${address}-activity`, data.pages[0].items)
    }
    return allItems
  }, [data, address])

  useEffect(() => {
    const firstPage = loadFirstPageFromStorage<TItem[]>(`${address}-activity`)
    if (!data && firstPage) {
      // Initial data is handled by react-query's initialData if needed
    }
  }, [address, data])

  // const handleSortChange = (key: string, value: TSortDirection) => {
  //   setSortConfig({ key, value })
  // }

  const getSortConfig = (key: string): TSortDirection => {
    return sortConfig.key === key ? sortConfig.value : false
  }

  const columns: ColumnDef<TItem>[] = useMemo(() => {
    return [
      {
        accessorKey: 'token_overview',
        // meta: {
        //   style: {
        //     flex: 1,
        //   },
        // },
        enableSorting: true,
        header: (props) => {
          const { t } = useTranslation()
          return (
            <XSortHead
              {...props}
              tKey={t('walletDetail.activityTable.date')}
              initialSort={getSortConfig('lastActive')}
              // onSortChange={(sort) => handleSortChange('lastActive', sort)}
              className="pl-2.5"
            />
          )
        },
        sortingFn: (rowA, rowB) => XCustomSortFunction(rowA.original, rowB.original, (row) => row.lastActive, 'date'),
        cell: ({ row }) => {
          const { token, address, symbol, chainId, lastActive, logo } = row.original
          return (
            <div className="flex min-w-[120px] items-center gap-[5px] pl-2.5">
              <LogoWithChain
                logo={logo}
                logoContainerClassName="w-[36px] h-[36px] rounded-[8px]"
                logoClassName="w-[36px] h-[36px] rounded-[8px]"
                chainLogo={getBlockchainLogo2(chainId)}
                name={token}
              />
              <div>
                <div
                  className={cn(
                    'mt-[1px] flex h-[13px] items-center font-medium',
                    isDesktop ? 'text-sm' : 'text-[13px]',
                  )}
                >
                  <Link
                    to={getPath(APP_PATH.MEME_TOKEN_DETAIL, { address, chain: CHAIN_SYMBOLS[chainId] })}
                    state={{ symbol }}
                  >
                    {symbol}
                  </Link>
                  <CopyButton text={address} icon="/images/icons/ic-copy2.svg" containerClassName={cn('ml-1')} type="tokenAddress" />
                </div>
                <div className="text-rise mt-[4px] text-[10px] font-normal">
                  <XTooltip.Details title={<TimeAgo timestamp={Number(lastActive)} />}>
                    <span className="mt-[4px] text-[12px] font-normal text-white">
                      {getTimeAgo(Number(lastActive), 'YYYY/MM/DD HH:mm:ss')}
                    </span>
                  </XTooltip.Details>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'type',
        // meta: {
        //   style: {
        //     flex: 1,
        //   },
        // },
        header: (props) => {
          const { t } = useTranslation()
          return (
            <XSortHead
              {...props}
              tKey={t('walletDetail.activityTable.type')}
              initialSort={getSortConfig('type')}
              // onSortChange={(sort) => handleSortChange('type', sort)}
            />
          )
        },
        sortingFn: (rowA, rowB) => XCustomSortFunction(rowA.original, rowB.original, (row) => row.type, 'string'),
        cell: ({ row }) => {
          const { type } = row.original
          const isRise = ['buy', 'add'].includes(type.toLocaleLowerCase())
          const { t } = useTranslation()
          return (
            <div
              className={cn(
                'mt-[4px] min-w-[64px] px-1 font-medium',
                getStyleRiseFall(isRise),
                isDesktop ? 'text-sm' : 'text-[13px]',
              )}
            >
              <span
                className={cn(
                  'light rounded-[4px] px-[8px] py-[4px]',
                  isRise ? 'bg-rise-opacity-10' : 'bg-fall-opacity-10',
                )}
              >
                {t(`walletDetail.token.${type}`)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'pnl',
        // meta: {
        //   style: {
        //     flex: 1,
        //   },
        // },
        header: (props) => {
          const { t } = useTranslation()
          return (
            <XSortHead
              {...props}
              tKey={t('walletDetail.activityTable.pnl')}
              initialSort={getSortConfig('pnl')}
              // onSortChange={(sort) => handleSortChange('pnl', sort)}
            />
          )
        },
        sortingFn: (rowA, rowB) =>
          XCustomSortFunction(
            rowA.original,
            rowB.original,
            (row) => {
              const { price, quantity, avgPriceUsd, isBuy } = row
              return isBuy || avgPriceUsd == 0 ? 0 : (price - avgPriceUsd) * quantity
            },
            'number',
          ),
        cell: ({ row }) => {
          const { price, quantity, avgPriceUsd, isBuy } = row.original
          const pnl = isBuy || avgPriceUsd == 0 ? 0 : (price - avgPriceUsd) * quantity
          const { isUSD, displayUnit } = useActivityTableContext()

          return (
            <div
              className={cn(
                `min-w-[88px] font-medium ${getStyleRiseFall(pnl, true)}`,
                isDesktop ? 'text-sm' : 'text-[13px]',
              )}
            >
              {isUSD
                ? formatVolume(pnl, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                : formatAmount(pnl / priceNativeToken, {
                    unit: displayUnit,
                    roundMode: 'floor',
                  })}
            </div>
          )
        },
      },
      {
        accessorKey: 'volume',
        // meta: {
        //   style: {
        //     flex: 1,
        //   },
        // },
        header: (props) => {
          const { t } = useTranslation()
          return (
            <XSortHead
              {...props}
              tKey={t('walletDetail.activityTable.volume1')}
              initialSort={getSortConfig('volume')}
              // onSortChange={(sort) => handleSortChange('volume', sort)}
            />
          )
        },
        sortingFn: (rowA, rowB) =>
          XCustomSortFunction(rowA.original, rowB.original, (row) => row.price * row.amount, 'number'),
        cell: ({ row }) => {
          const { isBuy, usdAmount, nativeAmount } = row.original
          const amountInUSD = Number(usdAmount)
          const amountInNative = Number(nativeAmount)
          const { isUSD, displayUnit } = useActivityTableContext()

          return (
            <div className={cn('min-w-[100px] font-medium', isDesktop ? 'text-sm' : 'text-[13px]')}>
              <span className={getStyleRiseFall(isBuy)}>
                {isUSD
                  ? formatVolume(amountInUSD, {
                      showCurrency: true,
                    })
                  : formatAmount(amountInNative, {
                      unit: displayUnit,
                    })}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'price',
        // meta: {
        //   style: {
        //     flex: 1,
        //   },
        // },
        header: (props) => {
          const { t } = useTranslation()
          return (
            <XSortHead
              {...props}
              tKey={t('walletDetail.activityTable.finalPrice')}
              initialSort={getSortConfig('price')}
              // onSortChange={(sort) => handleSortChange('price', sort)}
            />
          )
        },
        sortingFn: (rowA, rowB) => XCustomSortFunction(rowA.original, rowB.original, (row) => row.price, 'number'),
        cell: ({ row }) => {
          const { price, isBuy, nativePrice } = row.original
          const { isUSD, displayUnit } = useActivityTableContext()

          return (
            <div
              className={cn(
                `min-w-[88px] font-medium ${getStyleRiseFall(isBuy)}`,
                isDesktop ? 'text-sm' : 'text-[13px]',
              )}
            >
              {isUSD
                ? formatPrice(price, {
                    showCurrency: true,
                  })
                : formatAmount(Number(nativePrice), {
                    unit: displayUnit,
                  })}
            </div>
          )
        },
      },
      {
        accessorKey: 'amount',
        // meta: {
        //   style: {
        //     flex: 1,
        //   },
        // },
        header: (props) => {
          const { t } = useTranslation()
          return (
            <XSortHead
              {...props}
              tKey={t('walletDetail.activityTable.volume2')}
              initialSort={getSortConfig('amount')}
              // onSortChange={(sort) => handleSortChange('amount', sort)}
            />
          )
        },
        cell: ({ row }) => {
          const { amount } = row.original
          return (
            <div className={cn(`min-w-[88px] font-medium`, isDesktop ? 'text-sm' : 'text-[13px]')}>
              {formatAmount(amount)}
            </div>
          )
        },
      },
      {
        accessorKey: 'actions',
        header: () => {
          const { t } = useTranslation()
          return <XNormalHead tKey={t('walletDetail.activityTable.actions')} className="w-full justify-end normal-case" />
        },
        cell: ({ row }) => {
          const { transactionHash, chainId, address } = row.original
          const txid = transactionHash || ''
          const chanId = Number(chainId) as ChainIds
          const { activeFilter, setActiveFilter } = useActivityTableContext()
          return (
            <div className="flex justify-end">
              <FilterComponent
                isActive={!!activeFilter.length}
                onClick={() => {
                  setActiveFilter(!activeFilter.length ? address : '')
                }}
              />
              <a
                href={getLinkExplorer(chanId, txid)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center text-[12px] font-[400] hover:text-[#843BEA] hover:underline"
              >
                <img
                  src={CHAIN_EXPLORER_IMAGES[chainId]}
                  alt="chain logo"
                  className="mr-1 inline-block h-[16px] w-[16px] rounded-full"
                />
              </a>
            </div>
          )
        },
      },
    ]
  }, [])

  const handleBottomReached = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
      return true
    }
    return false
  }

  const activityFilters = useMemo(
    () => [
      { value: 'all', label: t('activityTable.filters.all') },
      { value: 'buy', label: t('activityTable.filters.buyit') },
      { value: 'sell', label: t('activityTable.filters.sell') },
      { value: 'add', label: t('activityTable.filters.addpood') },
      { value: 'remove', label: t('activityTable.filters.reduce') },
    ],
    [t],
  )

  const handleOnChange = (index: number) => {
    const newWalletType = activityFilters[index].value
    setSelectedWalletType(newWalletType)
    saveFirstPageToStorage(`wallet.activity.type.${address}`, newWalletType)
    setSearchParams((prev) => {
      prev.set('type', newWalletType)
      return prev
    })
  }

  const visibleRowsRef = useRef<TItem[]>([])

  const handleVisibleRowsChange = useCallback((visibleItems: TItem[]) => {
    visibleRowsRef.current = visibleItems
  }, [])

  // const [sorting, setSorting] = useState<SortingState>([])

  // const sortedItems = useMemo(() => {
  //   if (sorting.length === 0) return items
  //   const sort = sorting[0]
  //   return items.sort()
  // }, [items, sorting])

  // useEffect(() => {
  //   console.log(items)
  // }, [items])

  return (
    <>
      <div className="z-20 mt-2 flex justify-between pr-2 pb-[6px] align-middle">
        <FilterWallet
          defaultSelectedIndex={activityFilters.findIndex((i) => i.value === selectedWalletType)}
          options={activityFilters.map((i) => capitalize(i.label))}
          onChange={handleOnChange}
          classNameActive={cn('bg-[#3E2761] text-[#C8A7FD] text-shadow-sm')}
          classNameItem={cn(
            'font-normal min-w-none',
            isDesktop
              ? 'text-[14px] leading-[26px] py-0 px-[16px] bg-[#212127] rounded-[6px]'
              : 'text-[11px] leading-[16px] px-3 py-[3px] rounded-[200px]',
          )}
        />
      </div>
      {/* <VirtualizedDataTable
        data={sortedItems}
        columns={columns}
        estimateSize={60}
        isLoading={isLoading}
        className="max-h-[calc(100dvh-300px)] border-0 overscroll-auto"
        onLoadMore={handleBottomReached}
        hasNextPage={hasNextPage}
        headerClassName="border-0 text-[#FFFFFF80]"
        rowClassName={isDesktop ? 'group-hover:!bg-[#27272a] even:bg-[#18181c]' : 'bg-[#121214]'}
        sorting={sorting}
        onSortingChange={setSorting}
        getItemKey={(index) =>
          `${items[index].transactionHash}-${items[index].type}-${items[index].lastActive}-${items[index].nativeAmount}-${items[index].amount}-${items[index].quantity}`
        }
      /> */}
      <DataTableWithVirtual
        isStickyFirstColumn
        containerClassName="border-0 max-h-[calc(100dvh-220px)] select-none"
        tableHeaderClassName={cn(
          'text-[12px] leading-[0.75rem] text-[#FFFFFF80] cursor-pointer h-[36px] pl-0',
          isDesktop ? 'bg-[#0A0A0A]' : 'bg-[#121214]',
        )}
        loading={isLoading}
        columns={columns}
        data={items}
        onBottomReached={handleBottomReached}
        onVisibleItemsChanged={handleVisibleRowsChange}
        tableBodyRowClassName={cn('group whitespace-nowrap h-[48px] border-none', isDesktop ? 'even:bg-[#18181c]' : '')}
        tableCellClassName={cn(
          'p-0 cursor-pointer pl-0 pr-1 border-none pt-[4.5px] pb-[4.5px]',
          isDesktop ? 'group-hover:!bg-[#27272a]' : 'bg-[#121214]',
        )}
        tableHeadClassName={cn(
          'text-[12px] leading-[0.75rem] text-[#FFFFFF80] cursor-pointer h-[36px] pl-0',
          isDesktop ? 'bg-[#0A0A0A]' : 'bg-[#121214]',
        )}
        tableHeaderRowClassName="text-[rgba(255,255,255,0.48) bg-[#27272a]"
        getRowId={(originalRow, index) =>
          originalRow.transactionHash +
          originalRow.id +
          originalRow.nativeAmount +
          originalRow.amount +
          originalRow.quantity +
          originalRow.usdAmount +
          originalRow.type +
          originalRow.lastActive +
          `_${index}`
        }
      />
    </>
  )
}

const ActivityTable = ({ dataUnit, address }: Props) => {
  const isUSD = useMemo(() => dataUnit === 'USD', [dataUnit])
  const [activeFilter, setActiveFilter] = useState<string>('')
  const { isDesktop } = useResponsive()

  const contextValue = useMemo(() => {
    return {
      isUSD,
      displayUnit: dataUnit,
      activeFilter,
      setActiveFilter,
    }
  }, [isUSD, dataUnit, activeFilter, setActiveFilter])

  return (
    <ActivityTableProvider value={contextValue}>
      <div className={cn(isDesktop && 'pb-20')}>
        <ActivityTableContent dataUnit={dataUnit} address={address} />
      </div>
    </ActivityTableProvider>
  )
}

export default ActivityTable
