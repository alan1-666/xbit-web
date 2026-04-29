import { ChainType } from '@/@generated/gql/graphql-future'
import {
  SMART_MONEY_ALLOWED_CHAINS,
  SMART_MONEY_COPY_TRADE_ALLOWED_CHAINS,
  SMART_MONEY_KOL_VC_ALLOWED_CHAINS,
  SMART_MONEY_PUMP_SM_ALLOWED_CHAINS,
} from '@/const/smartMoney'
import useGetTotalFollowingAddress, {
  addXWalletFavourite,
  removeXWalletFavourite,
} from '@/hooks/useGetTotalFollowingAddress'
import { APP_PATH, PAGE_SIZE } from '@/lib/constant'
import { formatAmount, formatPercent, formatVolume, getStyleRiseFall } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { rankTraders } from '@/services/copytrade.service'
import { loadFirstPageFromStorage } from '@/utils/storage'
import { formatToTimeAgoI18n, getTimeAgo } from '@/utils/time'
import Container from '@components/common/Container.tsx'
import SwitchChains from '@components/header/switch-chains.tsx'
import { useActiveChain, useActiveChainId, useActiveChainType, useNativeTokenSymbol } from '@hooks/useActiveChain.ts'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef, Row } from '@tanstack/react-table'
import { get, isArray } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { ConfirmCollectModal } from '../common/Card/CurrencyListCard'
import FilterWallet from '../common/FilterWallet'
import { PnLChart } from '../common/PnLChart'
import { EmptyList } from '../discover/EmptyList'
import XNormalInfiniteScroll from '../ui/XNormalInfiniteScroll'
import { DataTableInfiniteScroll, XNormalHead } from '../ui/XTableInfiniteScroll'
import XTooltip from '../ui/XTooltip'
import { SkeletonList } from '../ui/skeleton'
import { TokenOveral } from './card/TokenOveral'
import TopTraderCard from './card/TopTraderCard'
import { IconWalletBalance } from '@components/icon'
import { Button } from '@components/ui/button.tsx'
import useGetCopyTradeAddress, { addCopyTradeAddress } from '@hooks/useGetCopyTradeAddress.ts'
import DrawerCopyTrade from '@components/listCoin/drawer/DrawerCopyTrade.tsx'
import { ChainIds } from '@/types/enums.ts'

type TProps = {
  isPC?: boolean
}

export interface DailyProfit {
  pnl: number
}

export interface WalletInfo {
  twitterName: string
  walletName: string
}

export interface TopTrader {
  address: string
  name: string
  avatar: string
  tags: string[]
  lastActivityAt: number
  pnl7d: number
  pnl30d: number
  pnl1d: number
  winRate7d: number
  avgCost7d: number
  totalBuy1d: number
  totalBuy7d: number
  totalBuy30d: number
  solBalance: string
  totalBuyCount7d: number
  totalSellCount7d: number
  info: WalletInfo
  dailyProfits: DailyProfit[]
}

const TopTraders = (props: TProps) => {
  const { isPC = false } = props
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedWalletType, setSelectedWalletType] = useState<string | null>(
    loadFirstPageFromStorage<string | null>('walletType', searchParams.get('type') || null),
  )
  const [openDrawer, setOpenDrawer] = useState(false)
  const [newlyAddedCopyTrades, setNewlyAddedCopyTrades] = useState<Set<string>>(new Set())
  const createCopyTradeAddress = useRef<string | null>(null)
  const activeWallet = useSelector(_activeWallet)
  const activeChainType = useActiveChainType()
  const {
    data: listFollowing,
    loading: loadingListFollowingAPI,
    refetch: refetchListFollowing,
    updateCacheData,
  } = useGetTotalFollowingAddress()
  const { data: listCopyTrade } = useGetCopyTradeAddress()

  const activeChain = useActiveChain()
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const nativeTokenSymbol = useNativeTokenSymbol()
  const isNotSupportNetwork = searchParams?.get('isNotSupportNetwork') === 'true'
  const isAllowCopyTrade = useMemo(() => {
    return SMART_MONEY_COPY_TRADE_ALLOWED_CHAINS.includes(activeChain)
  }, [activeChain])
  const isAllowPumpSM = useMemo(() => {
    return SMART_MONEY_PUMP_SM_ALLOWED_CHAINS.includes(activeChain)
  }, [activeChain])
  const isAllowKOLVC = useMemo(() => {
    return SMART_MONEY_KOL_VC_ALLOWED_CHAINS.includes(activeChain)
  }, [activeChain])
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)

  useEffect(() => {
    if (!isAllowPumpSM && selectedWalletType === 'PumpSM') {
      setSelectedWalletType(null)
    }
  }, [isAllowPumpSM])
  useEffect(() => {
    if (!isAllowKOLVC && selectedWalletType === 'KOL') {
      setSelectedWalletType(null)
    }
  }, [isAllowKOLVC])

  useEffect(() => {
    setNewlyAddedCopyTrades(new Set())
  }, [selectedWalletType])

  function _formatStylePercen(_result: number) {
    return getStyleRiseFall(Math.abs(_result) >= 0.001 && Math.abs(_result) <= 0.01 ? 0 : _result, true, {
      classNameNeutral: 'text-white/50',
    })
  }

  const walletFilters = useMemo(
    () => [
      {
        value: null,
        label: t('listCoin.filters.walletOptions.all'),
      },
      ...(isAllowPumpSM
        ? [
            {
              value: 'PumpSM',
              label: t('listCoin.filters.walletOptions.pumpSmartMoney'),
            },
          ]
        : []),
      {
        value: 'SmartMoney',
        label: t('listCoin.filters.walletOptions.smartMoney'),
      },
      {
        value: 'Fresh',
        label: t('listCoin.filters.walletOptions.newWallet'),
      },
      ...(isAllowKOLVC
        ? [
            {
              value: 'KOL',
              label: t('listCoin.filters.walletOptions.kolVc'),
            },
          ]
        : []),
      {
        value: 'Sniper',
        label: t('listCoin.filters.walletOptions.sniper'),
      },
    ],
    [t],
  )
  const {
    data: items,
    isLoading: loading,
    fetchNextPage,
    isFetching,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['topTraders', selectedWalletType, activeChainType],
    queryFn: async ({ pageParam = 1 }) => {
      if (pageParam === 1) {
        window.scrollTo({
          top: 0,
        })
      }
      const res = await futureClient.query({
        query: rankTraders,
        variables: {
          filter: {
            page: pageParam,
            limit: PAGE_SIZE,
            ...(selectedWalletType ? { type: [selectedWalletType] } : {}),
            chain: activeChainType,
          },
        },
      })
      return get(res, 'data.rank', [])
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined
    },
  })

  function handleOnChange(index: number) {
    const newWalletType = walletFilters[index].value
    setSelectedWalletType(newWalletType!)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      if (newWalletType) {
        newParams.set('type', newWalletType)
      } else {
        newParams.delete('type')
      }
      return newParams
    })
  }

  const handleBottomReached = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }

  const onChangeNameSuccess = (address: string, newName: string) => {
    replaceOldQueryData(null, activeChainType, address, newName)
    replaceOldQueryData('PumpSM', activeChainType, address, newName)
    replaceOldQueryData('SmartMoney', activeChainType, address, newName)
    replaceOldQueryData('Fresh', activeChainType, address, newName)
    replaceOldQueryData('KOL', activeChainType, address, newName)
    replaceOldQueryData('Sniper', activeChainType, address, newName)
    queryClient.invalidateQueries({
      queryKey: ['topTraders'],
      exact: false,
      refetchType: 'none',
    })
  }
  const replaceOldQueryData = (
    selectedWalletType: string | null,
    activeChainType: ChainType,
    address: string,
    newName: string,
  ) => {
    queryClient.setQueryData(
      ['topTraders', selectedWalletType, activeChainType],
      (oldData: { pageParams: number[]; pages: Array<TopTrader[]> }) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((chunk: TopTrader[]) =>
            chunk.map((item: TopTrader) => {
              if (item.address === address) {
                return {
                  ...item,
                  name: newName.trim(),
                }
              }
              return item
            }),
          ),
        }
      },
    )
  }
  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'favourite',
      header: (props) => (
        <XNormalHead isPC={isPC} {...props} tKey={'#'} className="pl-2.5 text-[#6C6A74] w-full justify-center" />
      ),
      cell: ({ row }) => {
        const { address, name } = row.original
        const collected = listFollowing.includes(address)

        return (
          <div className="w-full flex items-center justify-center">
            <ConfirmCollectModal
              token={address}
              defaultCollect={collected}
              tokenSymbol={name}
              isFlow
              onAdded={() => {
                addXWalletFavourite(address, activeChainType)
                updateCacheData(address)
                setTimeout(() => {
                  refetchListFollowing()
                }, 1000)
              }}
              onRemoveSuccess={() => {
                removeXWalletFavourite(address, activeChainType)
                updateCacheData(address)
                setTimeout(() => {
                  refetchListFollowing()
                }, 1000)
              }}
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'Overall',
      header: (props) => (
        <div className="flex items-center">
          <XNormalHead isPC={isPC} {...props} tKey={t('detail.pool.address')} className="text-inherit" />
          <span className="text-[#6C6A74]">/</span>
          <XNormalHead
            isPC={isPC}
            {...props}
            tKey={t('detail.pool.balance', { unit: nativeTokenSymbol })}
            className="text-inherit"
          />
        </div>
      ),
      cell: ({ row }) => {
        const {
          address,
          avatar,
          name,
          solBalance,
          info: { twitterName, walletName },
        } = row.original
        return (
          <TokenOveral
            address={address}
            logo={avatar}
            name={name}
            balance={Number(solBalance)}
            twitterName={twitterName}
            walletName={walletName}
            isAvatar
            className="pl-0"
            useEditNameButton
            linkDetail={`${APP_PATH.MEME_WALLET}/${address}`}
            onChangeNameSuccess={(newName: string) => onChangeNameSuccess(address, newName)}
          />
        )
      },
    },
    {
      accessorKey: 'ProfitAndLossTrend',
      header: (props) => (
        <XNormalHead isPC={isPC} {...props} tKey={t('walletDetail.analysis.ProfitAndLossTrend', { period: '7D' })} />
      ),
      cell: ({ row }) => {
        const { dailyProfits } = row.original
        return <PnLChart data={dailyProfits.map((item: any) => item?.pnl)} />
      },
      size: 100,
    },
    {
      accessorKey: 'DailyWinRate',
      header: (props) => (
        <XNormalHead isPC={isPC} {...props} tKey={t('walletDetail.analysis.DailyWinRate', { period: '7' })} />
      ),
      cell: ({ row }) => {
        const winRate7d = get(row.original, 'winRate7d', 0) || 0
        return (
          <div className={getStyleRiseFall(1)}>
            {formatPercent(winRate7d * 100, {
              showSign: true,
            })}
          </div>
        )
      },
      size: 100,
    },
    {
      accessorKey: '1periodPnLWithPeriod',
      header: (props) => (
        <XNormalHead isPC={isPC} {...props} tKey={t('walletDetail.analysis.periodPnLWithPeriod', { period: '1D' })} />
      ),
      cell: ({ row }) => {
        const totalBuy1d = get(row.original, 'totalBuy1d', 0) || 0
        const pnl1d = get(row.original, 'pnl1d', 0) || 0
        const _result = pnl1d && totalBuy1d ? (pnl1d / totalBuy1d) * 100 : 0
        return (
          <div className={_formatStylePercen(_result)}>
            {formatPercent(_result, {
              showSign: true,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: '7periodPnLWithPeriod',
      header: (props) => (
        <XNormalHead isPC={isPC} {...props} tKey={t('walletDetail.analysis.periodPnLWithPeriod', { period: '7D' })} />
      ),
      cell: ({ row }) => {
        const totalBuy7d = get(row.original, 'totalBuy7d', 0) || 0
        const pnl7d = get(row.original, 'pnl7d', 0) || 0
        const _result = pnl7d && totalBuy7d ? (pnl7d / totalBuy7d) * 100 : 0
        return (
          <div className={_formatStylePercen(_result)}>
            {formatPercent(_result, {
              showSign: true,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: '30periodPnLWithPeriod',
      header: (props) => (
        <XNormalHead isPC={isPC} {...props} tKey={t('walletDetail.analysis.periodPnLWithPeriod', { period: '30D' })} />
      ),
      cell: ({ row }) => {
        const totalBuy30d = get(row.original, 'totalBuy30d', 0) || 0
        const pnl30d = get(row.original, 'pnl30d', 0) || 0
        const _result = pnl30d && totalBuy30d ? (pnl30d / totalBuy30d) * 100 : 0
        return (
          <div className={_formatStylePercen(_result)}>
            {formatPercent(_result, {
              showSign: true,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: '7dayAvgBuyCost',
      header: (props) => (
        <XNormalHead isPC={isPC} {...props} tKey={t('walletDetail.analysis.dayAvgBuyCost', { period: '7' })} />
      ),
      cell: ({ row }) => {
        const avgCost7d = get(row.original, 'avgCost7d', 0)
        return (
          <div className={_formatStylePercen(avgCost7d)}>
            {formatVolume(avgCost7d, {
              showCurrency: true,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'txs',
      header: (props) => (
        <XNormalHead
          isPC={isPC}
          {...props}
          tKey={t('walletDetail.analysis.txs', { period: '7D' })}
          className="w-[70px] flex justify-left"
        />
      ),
      cell: ({ row }) => {
        const totalBuyCount7d = get(row.original, 'totalBuyCount7d', 0)
        const totalSellCount7d = get(row.original, 'totalSellCount7d', 0)
        return (
          <div className="text-left w-[70px]">
            <span className="text-[14px] color-[#FBFBFB]">{formatAmount(totalBuyCount7d + totalSellCount7d)}</span>
            <div className="flex gap-[2px] justify-left text-[12px]">
              <span className="text-rise">{formatAmount(totalBuyCount7d)}</span> /{' '}
              <span className="text-fall"> {formatAmount(totalSellCount7d)}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'lastActive',
      header: (props) => (
        <XNormalHead
          isPC={isPC}
          {...props}
          tKey={t('walletDetail.analysis.lastActive')}
          className="flex justify-start w-full"
        />
      ),
      cell: ({ row }) => {
        const lastActivityAt = get(row.original, 'lastActivityAt', new Date().getTime())
        return (
          <div className="cell-container text-left">
            <XTooltip.Details title={<span>{formatToTimeAgoI18n(lastActivityAt)}</span>}>
              <span className="font-normal mt-[4px] text-[12px] text-white">
                {getTimeAgo(lastActivityAt * 1000, 'YYYY/MM/DD HH:mm:ss')}
              </span>
            </XTooltip.Details>
          </div>
        )
      },
    },
    ...(isAllowCopyTrade
      ? [
          {
            accessorKey: 'btnCopy',
            // header: (props) => <XSortHead
            //   {...props}
            //   tKey={t('walletDetail.analysis.lastActive')}
            // />,
            // header: (props) => <XNormalHead isPC={isPC} {...props} tKey={t('listCoin.copyTrade.createCopyTrade')} />,
            header: () => <div className="min-w-[110px]"></div>,
            size: 150,
            cell: ({ row }: { row: Row<any> }) => {
              const { address } = row.original
              const isDisabled = listCopyTrade.includes(address) || newlyAddedCopyTrades.has(address)
              return (
                <div className="min-w-[110px] flex justify-end px-2">
                  <Button
                    className={cn(
                      'text-[#C8A7FD] transition-all duration-300',
                      isDisabled ? 'opacity-30' : 'hover:opacity-80',
                    )}
                    disabled={isDisabled}
                    variant={'normal'}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      createCopyTradeAddress.current = address
                      setOpenDrawer(true)
                    }}
                  >
                    <IconWalletBalance className="!size-[18px]" />
                    {t('listCoin.copyTrade.createCopyTradeButton')}
                  </Button>
                </div>
              )
            },
          },
        ]
      : []),
  ]

  return (
    <>
      <div
        className={cn(
          'px-[10px] flex align-middle justify-between pb-[8px] sticky top-[50px] z-20',
          isPC ? 'my-[10px] pb-0' : 'pt-2 bg-[#0a0a0a]',
        )}
      >
        <FilterWallet
          defaultSelectedIndex={walletFilters.findIndex((i) => i.value === selectedWalletType)}
          classNameActive={cn('bg-[#3E2761] text-[#C8A7FD] text-shadow-sm', isPC ? 'rounded-[6px]' : 'rounded-[4px]')}
          classNameItem={cn(
            'font-normal',
            isPC ? 'text-[14px] leading-[28px] mr-[12px] py-0 bg-[transparent]' : 'text-[11px] leading-[16px] py-[3px]',
          )}
          classNameContainer={cn('bg-[transparent]')}
          options={walletFilters.map((i) => i.label)}
          onChange={handleOnChange}
        />
      </div>
      {/* Virtualized list container */}
      {!SMART_MONEY_ALLOWED_CHAINS.includes(activeChain) || isNotSupportNetwork ? (
        <Container className="mt-[10px] h-40 pt-[119px]">
          <div className="flex items-center gap-2 flex-col justify-center text-[14px] text-[#999999] mt-10">
            <span>{t('orderForm.status.NETWORK_UNSUPPORT')}</span>
            <SwitchChains isNotSupportChainBtn />
          </div>
        </Container>
      ) : (
        <div className="px-2.5">
          {isPC ? (
            <>
              <DataTableInfiniteScroll
                isLoading={loading || loadingListFollowingAPI}
                columns={columns}
                data={items?.pages.flat() || []}
                fetchMore={handleBottomReached}
                hasMore={hasNextPage}
                tableProps={{
                  containerClassName: cn(
                    'border-none mt-0 mx-[-10px] pr-2.5 pl-[10px]',
                    isShowMaintenanceNotification
                      ? activeWallet.isConnected
                        ? 'max-h-[calc(100vh-332px)]'
                        : 'max-h-[calc(100vh-292px)]'
                      : activeWallet.isConnected
                        ? 'max-h-[calc(100vh-300px)]'
                        : 'max-h-[calc(100vh-260px)]',
                  ),
                  tableHeadClassName:
                    'text-[12px] leading-[0.75rem] text-[#FFFFFF80] cursor-pointer h-[18px] px-[10px] py-[11px] pl-0',
                  tableHeaderClassName: 'text-[rgba(255,255,255,0.48)',
                  tableHeaderRowClassName:
                    'border-none text-[11px] text-[rgba(255, 255, 255)] sticky top-0 whitespace-nowrap z-5 top-[-1px] border-b border-[#79778C29] border-t bg-[#0a0a0a]',
                  tableBodyRowClassName: 'group whitespace-nowrap h-[48px] border-none',
                  tableCellClassName:
                    'p-0 group-hover:!bg-[#27272a] cursor-pointer pl-0 pr-1 border-none pt-[4.5px] pb-[4.5px] py-[12px]',
                  skeletonComponent: <SkeletonList className="w-full" classNameItem="h-[65px]" count={10} />,
                  isShowCta: false,
                  isStickyFirstColumn: true,
                  onRowClick: (row) => {
                    const address = row.address
                    window.open(`${APP_PATH.MEME_WALLET}/${address}?tab=Summary`, '_blank', 'noopener,noreferrer')
                  },
                  isShowLoadMore: isFetching,
                  oddRowClassName: 'bg-[transparent]',
                  evenRowClassName: 'bg-[#18181c]',
                }}
              />
              <DrawerCopyTrade
                open={openDrawer}
                setOpen={setOpenDrawer}
                leaderAddress={createCopyTradeAddress.current ?? ''}
                onSuccess={() => {
                  setOpenDrawer(false)
                  const address = createCopyTradeAddress.current ?? ''
                  addCopyTradeAddress({ chainId: activeChainId }, address)
                  setNewlyAddedCopyTrades((prev) => new Set([...prev, address]))
                  createCopyTradeAddress.current = null
                }}
              />
            </>
          ) : (
            <XNormalInfiniteScroll
              data={items?.pages.flat() || []}
              hasMore={hasNextPage}
              isLoading={loading || loadingListFollowingAPI}
              containerClassName="pb-[80px]"
              fetchMore={handleBottomReached}
              renderItem={(trader, index) => {
                if (!trader || !trader.address) return null
                return (
                  <TopTraderCard
                    key={`${trader.address}-${index}`}
                    defaultCollect={isArray(listFollowing) && listFollowing.includes(trader.address)}
                    currencyIcon={trader.avatar}
                    {...trader}
                    alias={trader.name}
                    walletName={trader.info.walletName}
                    twitterName={trader.info.twitterName}
                    referrer={window.location.pathname + window.location.search}
                    classNameContainer="px-2 py-0.5 rounded-[6px] border-[0.5px] border-solid border-[rgba(236, 236, 237, 0.9)] cursor-pointer mb-[5px] bg-[#0F0F0F]"
                    onAdded={() => {
                      addXWalletFavourite(trader.address, activeChainType)
                      updateCacheData(trader.address)
                      setTimeout(() => {
                        refetchListFollowing()
                      }, 1000)
                    }}
                    onRemoveSuccess={() => {
                      removeXWalletFavourite(trader.address, activeChainType)
                      updateCacheData(trader.address)
                      setTimeout(() => {
                        refetchListFollowing()
                      }, 1000)
                    }}
                    onChangeNameSuccess={(newName: string) => onChangeNameSuccess(trader.address, newName)}
                  />
                )
              }}
              emptyComponent={<EmptyList containerClassName="h-[415px]" />}
            />
          )}
        </div>
      )}
    </>
  )
}

export default TopTraders
