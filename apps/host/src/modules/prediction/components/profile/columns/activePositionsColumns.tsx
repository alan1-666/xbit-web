import { Button } from '@/components/ui/button'
import { useResponsive } from '@/hooks/useResponsive'
import eventBus from '@/lib/eventBus.ts'
import { formatBalance, formatPercent, formatPrice } from '@/lib/format.ts'
import { roundByTickSize } from '@/utils/helpers'
import { cn } from '@/lib/utils.ts'
import { ActivePositionCell } from '@/modules/prediction/components/portfolio/PositionsCellRender/ActivePositionCell.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'
import { PositionModel } from '@/modules/prediction/models/PositionModel.ts'
import { ColumnDefWithMeta } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { Trans } from 'react-i18next'

export const activePositionsColumns: ColumnDefWithMeta<PositionModel>[] = [
  {
    id: 'market',
    header: () => <div className="font-light text-[645F7B] text-xs px-0 pl-2">MARKET</div>,
    cell: ({ row }) => {
      return <ActivePositionCell position={row.original} />
    },
    meta: {
      style: { flex: 1 },
    },
  },
  {
    id: 'avg',
    meta: {
      className: 'hidden md:flex items-center',
    },
    header: () => <div className="font-light text-[645F7B] text-xs px-0">AVG</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start gap-1 text-sm cursor-pointer">
          <span className="text-white">
            {formatPrice(roundByTickSize(row.original.avgPrice, row.original.tickSize))}¢
          </span>
        </div>
      )
    },
  },
  {
    id: 'current',
    meta: {
      className: 'hidden md:flex items-center',
    },
    header: () => <div className="font-light text-[645F7B] text-xs px-0">CURRENT</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start gap-1 text-sm cursor-pointer">
          <span className="text-white">
            {formatPrice(roundByTickSize(row.original.curPrice, row.original.tickSize))}¢
          </span>
        </div>
      )
    },
  },
  {
    id: 'value',
    header: () => <div className="font-light text-[645F7B] text-xs px-0 text-end">VALUE</div>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col items-start w-full">
          <span className={cn('text-sm font-medium text-white')}>
            {formatBalance(row.original.currentValue, {
              showCurrency: true,
            })}
          </span>
          <div className={cn('text-xs', row.original.cashPnl >= 0 ? 'text-emerald-500' : 'text-red-500')}>
            {formatPrice(row.original.cashPnl, { showCurrency: true })} ({formatPercent(row.original.percentPnl)})
          </div>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div></div>,
    cell: ({ row }) => {
      const pos = row.original
      const { isDesktop } = useResponsive()
      const { event, dispatch } = useEventDetailsPageContext()

      const handleSell = () => {
        const outcome = pos.outcomeIndex === 0 ? 'yes' : 'no'
        const size = Number(pos.size)

        if (isDesktop) {
          // Desktop: OrderForm always mounted, fill via eventBus
          eventBus.dispatch('FILL_PREDICTION_ORDER_FORM', {
            data: {
              marketId: pos.marketId,
              outcome,
              side: 'sell',
              size,
            },
          })
        } else {
          // Mobile: BaseOrderForm mounts when drawer opens, so use orderFormState
          // to prefill before opening (eventBus would fire before form mounts)
          const market = event?.markets?.find(
            (m) => String(m.id) === String(pos.marketId) || String(m.providerId) === String(pos.marketId),
          )
          if (market) {
            dispatch(eventDetailsPageActions.setSelectedMarket(market))
          }
          dispatch(
            eventDetailsPageActions.setOrderFormState({
              side: 'sell',
              outcome,
              size,
              shouldFocus: true,
              timestamp: Date.now(),
            }),
          )
          dispatch(eventDetailsPageActions.setSelectedOutcome(outcome))
          dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
        }
      }

      return (
        <div className="mx-auto">
          <Button
            variant="gradient"
            size="sm"
            className="active:scale-[97%] border-button-outline-border text-foreground rounded-sm font-medium"
            onClick={handleSell}
          >
            Sell
          </Button>
        </div>
      )
    },
  },
]

export const UserProfileActivePositionsColumns: ColumnDefWithMeta<PositionModel>[] = [
  {
    id: 'market',
    header: () => (
      <div className="font-light text-[#FFFFFF80] text-sm px-0 pl-0 ">
        <Trans i18nKey="prediction.profile.market" />
      </div>
    ),
    cell: ({ row }) => {
      return (
        <ActivePositionCell
          position={row.original}
          teamColor={row.original.outcomeIndex === 0 ? '#00CE89' : '#EA3B4F'}
        />
      )
    },
    meta: {
      style: { flex: 1 },
    },
  },
  {
    id: 'avg',
    meta: {
      className: 'hidden md:flex items-center',
    },
    header: () => (
      <div className="font-light text-[#FFFFFF80] text-sm px-0 flex-1 flex justify-center">
        <Trans i18nKey="prediction.profile.avg" />{' '}
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="items-center gap-1 text-sm cursor-pointer flex-1 flex justify-center">
          <span className="text-white">
            {formatPrice(roundByTickSize(row.original.avgPrice, row.original.tickSize))}¢
          </span>
        </div>
      )
    },
  },
  {
    id: 'current',
    meta: {
      className: 'hidden md:flex items-center',
    },
    header: () => (
      <div className="font-light text-[#FFFFFF80] text-sm px-0 flex justify-center flex-1">
        <Trans i18nKey="prediction.profile.current" />{' '}
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="items-center gap-1 text-sm cursor-pointer flex-1 flex justify-center">
          <span className="text-white">
            {formatPrice(roundByTickSize(row.original.curPrice, row.original.tickSize))}¢
          </span>
        </div>
      )
    },
  },
  {
    id: 'value',
    header: () => (
      <div className="font-light text-[#FFFFFF80] text-sm px-0 text-end flex justify-end flex-1">
        <Trans i18nKey="prediction.profile.value" />{' '}
      </div>
    ),
    meta: { className: 'max-md:w-[10%]! ' },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col items-end w-full">
          <span className={cn('text-sm max-[414px]:text-xs font-medium text-white')}>
            {formatBalance(row.original.currentValue, {
              showCurrency: true,
            })}
          </span>
          <div
            className={cn(
              'text-xs max-[414px]:text-[10px]',
              row.original.cashPnl >= 0 ? 'text-emerald-500' : 'text-red-500',
            )}
          >
            {formatBalance(row.original.cashPnl, { showCurrency: true })} ({formatPercent(row.original.percentPnl)})
          </div>
        </div>
      )
    },
  },
]
