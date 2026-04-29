import { SmartMoneyDto } from '@/@generated/gql/graphql-meme2.ts'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SimpleTooltip } from '@/components/v2/ui-shared/components/SimpleTooltip'
import { APP_PATH } from '@/lib/constant.ts'
import eventBus from '@/lib/eventBus.ts'
import { formatPercent } from '@/lib/format'
import { getStyleRiseFall } from '@/lib/format.ts'
import { cn } from '@/lib/utils'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { RootState, useAppSelector } from '@/redux/store'
import { formatToTimeAgoI18n } from '@/utils/time'
import { PnLChart } from '@components/common/PnLChart.tsx'
import { TokenOveral } from '@components/listCoin/card/TokenOveral.tsx'
import { UnfollowWalletDialog, UnfollowWalletDialogHandle } from '@components/monitoring/pc/UnfollowWalletDialog.tsx'
import { BlankState } from '@components/v2/ui-shared/components/BlankState.tsx'
import { ConnectWalletCTA } from '@components/v2/ui-shared/components/ConnectWalletCTA.tsx'
import { LinkCTA } from '@components/v2/ui-shared/components/LinkCTA.tsx'
import { REFETCH_WALLETS_FOLLOWING } from '@const/smartMoney.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useFollowingSmartMoneys } from '@hooks/useFollowingSmartMoneys.ts'
import { useRemoveFollowingWalletFromCache } from '@hooks/useGetTotalFollowings.ts'
import { DataTable } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { ColumnDefWithMeta } from '@pages/meme/discover/desktop/components/VirtualizedDataTable.tsx'
import { SortingState } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { get } from 'lodash-es'
import { createContext, MouseEvent, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface ContextState {
  unfollow?: (address: string) => void
}

const Context = createContext<ContextState>({
  unfollow: undefined,
})

type SortFn = (a: SmartMoneyDto, b: SmartMoneyDto) => number

const sortFunctions: Record<string, SortFn> = {
  'Overall|desc': (a, b) => (b.solBalance || 0) - (a.solBalance || 0),
  'Overall|asc': (a, b) => (a.solBalance || 0) - (b.solBalance || 0),
  '7dayWinRate|desc': (a, b) => (b.winRate7d || 0) - (a.winRate7d || 0),
  '7dayWinRate|asc': (a, b) => (a.winRate7d || 0) - (b.winRate7d || 0),
  '1periodPnLWithPeriod|desc': (a, b) => {
    const aValue = (a.pnl1d || 0) / (a.totalBuy1d || 1)
    const bValue = (b.pnl1d || 0) / (b.totalBuy1d || 1)
    return bValue - aValue
  },
  '1periodPnLWithPeriod|asc': (a, b) => {
    const aValue = (a.pnl1d || 0) / (a.totalBuy1d || 1)
    const bValue = (b.pnl1d || 0) / (b.totalBuy1d || 1)
    return aValue - bValue
  },
  '7periodPnLWithPeriod|desc': (a, b) => {
    const aValue = (a.pnl7d || 0) / (a.totalBuy7d || 1)
    const bValue = (b.pnl7d || 0) / (b.totalBuy7d || 1)
    return bValue - aValue
  },
  '7periodPnLWithPeriod|asc': (a, b) => {
    const aValue = (a.pnl7d || 0) / (a.totalBuy7d || 1)
    const bValue = (b.pnl7d || 0) / (b.totalBuy7d || 1)
    return aValue - bValue
  },
  '30periodPnLWithPeriod|desc': (a, b) => {
    const aValue = (a.pnl30d || 0) / (a.totalBuy30d || 1)
    const bValue = (b.pnl30d || 0) / (b.totalBuy30d || 1)
    return bValue - aValue
  },
  '30periodPnLWithPeriod|asc': (a, b) => {
    const aValue = (a.pnl30d || 0) / (a.totalBuy30d || 1)
    const bValue = (b.pnl30d || 0) / (b.totalBuy30d || 1)
    return aValue - bValue
  },
  'lastActive|desc': (a, b) => (b.lastActivityAt || 0) - (a.lastActivityAt || 0),
  'lastActive|asc': (a, b) => (a.lastActivityAt || 0) - (b.lastActivityAt || 0),
}

const OverrideNoDataComponent = () => {
  const { t } = useTranslation()
  const activeWallet = useActiveWallet()
  if (!activeWallet.isConnected) {
    return (
      <BlankState
        text={t('login.notLogined', {
          name: 'KairoX',
        })}
        className="pt-20"
        cta={<ConnectWalletCTA />}
      />
    )
  }
  return (
    <BlankState
      text={t('following.empty')}
      className="pt-20 text-sm"
      cta={
        <LinkCTA
          to={`${APP_PATH.MEME_SMART_MONEY}?walletType=SmartMoney&tab=topTalents`}
          text={t('emptyFollowing.cta')}
        />
      }
    />
  )
}

const TableWalletManagers = () => {
  const { sort } = useAppSelector((state: RootState) => state?.monitoringPc?.wallets)
  const [sorting, setSorting] = useState<SortingState>([])
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)
  const {
    items,
    isLoading: loading,
    hasNextPage: hasMore,
    isFetchingNextPage,
    fetchNextPage,
    removeWallet,
    refetch,
    updateNameCache,
  } = useFollowingSmartMoneys(sort)

  const sortedItems = useMemo(() => {
    const sort = sorting[0]
    if (!sort) return items
    const { id, desc } = sort
    const sortedFn = sortFunctions[`${id}|${desc ? 'desc' : 'asc'}`]
    if (!sortedFn) return items
    return [...items].sort(sortedFn)
  }, [items, sorting])

  const columns: ColumnDefWithMeta<SmartMoneyDto>[] = [
    {
      accessorKey: 'favourite',
      size: 50,
      header: () => <div className="text-center w-full">#</div>,
      cell: ({ row }) => {
        const { address } = row.original
        const { unfollow } = useContext(Context)

        const handleUnfollow = (event: MouseEvent) => {
          event.stopPropagation()
          event.preventDefault()
          unfollow?.(address)
        }

        return (
          <div className="w-full flex items-center justify-center">
            <img
              onClick={handleUnfollow}
              className="transition-all duration-100 hover:scale-[1.2] w-[18px] h-[18px] opacity-100"
              src="/images/icons/vector-star-icon-active.svg?v=2"
              alt=""
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'Overall',
      enableSorting: true,
      meta: {
        style: { flex: 1 },
      },
      header: () => {
        return (
          <div>
            <Trans i18nKey="assets.deposit.address" />/<Trans i18nKey="assets.futures.balance" />
          </div>
        )
      },
      cell: ({ row }) => {
        const { address, avatar, name, solBalance, info } = row.original
        const twitterName = info?.twitterName
        const walletName = info?.walletName
        return (
          <TokenOveral
            address={address}
            logo={avatar}
            name={name}
            // alias={getNameAliasFromAddress(address, chainType)}
            balance={solBalance}
            isAvatar
            className="pl-0"
            useEditNameButton={true}
            walletName={walletName}
            twitterName={twitterName || ''}
            linkDetail={`${APP_PATH.MEME_WALLET}/${address}?tab=Summary`}
            onChangeNameSuccess={(newName: string) => {
              updateNameCache(address, newName)
            }}
          />
        )
      },
    },
    {
      accessorKey: 'ProfitAndLossTrend',
      meta: {
        style: { flex: 1 },
      },
      header: () => <Trans i18nKey="walletDetail.analysis.ProfitAndLossTrend" values={{ period: '7D' }} />,
      cell: ({ row }) => {
        const { dailyProfits } = row.original
        const profits = dailyProfits || []
        return <PnLChart data={profits.map((item: any) => item?.pnl)} />
      },
    },
    {
      accessorKey: '7dayWinRate',
      meta: {
        style: { flex: 1 },
      },
      enableSorting: true,
      header: () => <Trans i18nKey="listCoin.copyTrade.sevenDayWinRate" />,
      cell: ({ row }) => {
        const { winRate7d } = row.original
        return (
          <div className={getStyleRiseFall(1)}>
            {formatPercent(winRate7d * 100, {
              showSign: true,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: '1periodPnLWithPeriod',
      enableSorting: true,
      meta: {
        style: { flex: 1 },
      },
      header: () => <Trans i18nKey="walletDetail.analysis.periodPnLWithPeriod" values={{ period: '1D' }} />,
      cell: ({ row }) => {
        const totalBuy1d = get(row.original, 'totalBuy1d', 0)
        const pnl1d = get(row.original, 'pnl1d', 0)
        const _result = pnl1d & totalBuy1d ? (pnl1d / totalBuy1d) * 100 : 0
        return (
          <div className={getStyleRiseFall(_result, true)}>
            {formatPercent(_result, {
              showSign: true,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: '7periodPnLWithPeriod',
      enableSorting: true,
      meta: {
        style: { flex: 1 },
      },
      header: () => <Trans i18nKey="walletDetail.analysis.periodPnLWithPeriod" values={{ period: '7D' }} />,
      cell: ({ row }) => {
        const totalBuy7d = get(row.original, 'totalBuy7d', 0)
        const pnl7d = get(row.original, 'pnl7d', 0)
        const _result = pnl7d && totalBuy7d ? (pnl7d / totalBuy7d) * 100 : 0
        return (
          <div className={getStyleRiseFall(_result, true)}>
            {formatPercent(_result, {
              showSign: true,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: '30periodPnLWithPeriod',
      enableSorting: true,
      meta: {
        style: { flex: 1 },
      },
      header: () => <Trans i18nKey="walletDetail.analysis.periodPnLWithPeriod" values={{ period: '30D' }} />,
      cell: ({ row }) => {
        const totalBuy30d = get(row.original, 'totalBuy30d', 0)
        const pnl30d = get(row.original, 'pnl30d', 0)
        const _result = pnl30d && totalBuy30d ? (pnl30d / totalBuy30d) * 100 : 0
        return (
          <div className={getStyleRiseFall(_result)}>
            {formatPercent(_result, {
              showSign: true,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'lastActive',
      enableSorting: true,
      header: () => <Trans i18nKey="walletDetail.analysis.lastActive" />,
      cell: ({ row }) => {
        const lastActivityAt = get(row.original, 'lastActivityAt', new Date().getTime())
        return (
          <div className="cell-container">
            <TooltipProvider>
              <SimpleTooltip content={dayjs(lastActivityAt * 1000).format('YYYY/MM/DD HH:mm:ss')}>
                <span className="mr-[4px]">{formatToTimeAgoI18n(lastActivityAt)}</span>
              </SimpleTooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
  ]

  const removeFollowingWalletFromCache = useRemoveFollowingWalletFromCache()

  const unfollowDialogRef = useRef<UnfollowWalletDialogHandle>(null)

  const handleBottomReached = () => {
    if (!loading && hasMore && !isFetchingNextPage) {
      fetchNextPage().catch(console.error)
    }
  }

  const onUnfollowSuccess = (addr: string) => {
    removeWallet(addr)
    removeFollowingWalletFromCache(addr)
  }

  useEffect(() => {
    eventBus.on(REFETCH_WALLETS_FOLLOWING, () => {
      refetch().catch(console.error)
    })
    return () => {
      eventBus.remove(REFETCH_WALLETS_FOLLOWING)
    }
  }, [])

  const contextValue = useMemo(() => {
    return {
      unfollow: (address: string) => {
        unfollowDialogRef.current?.open(address)
      },
    }
  }, [unfollowDialogRef.current])

  return (
    <Context.Provider value={contextValue}>
      <div className="relative">
        <DataTable
          data={sortedItems}
          columns={columns}
          striped
          className={cn(
            'border-none mt-0 overflow-y-auto px-4 pb-4',
            isShowMaintenanceNotification ? 'h-[calc(100vh-286px)]' : 'h-[calc(100vh-254px)]',
          )}
          headerClassName="sticky top-0 bg-[#121214] z-10"
          headerRowClassName="border-none"
          rowHeight={67}
          rowClassName="h-[67px] border-none"
          onLoadMore={handleBottomReached}
          isLoading={loading}
          hasNextPage={hasMore}
          sorting={sorting}
          getRowId={(originalRow) => originalRow.address}
          onSortingChange={setSorting}
          onRowClick={(row) => {
            const address = row.address
            //isPC will target _blank
            window.open(`${APP_PATH.MEME_WALLET}/${address}?tab=Summary`, '_blank', 'noopener,noreferrer')
            return
          }}
          noDataComponent={<OverrideNoDataComponent />}
        />
        <UnfollowWalletDialog ref={unfollowDialogRef} onSuccess={onUnfollowSuccess} />
      </div>
    </Context.Provider>
  )
}

export default TableWalletManagers
