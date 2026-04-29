import { formatBalance, formatPercent, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { IPortfolioPosition } from '../../models/PortfolioModel'
import { ArrowRightIcon } from '../icons'
import AvgPriceCell from '../portfolio/PositionsCellRender/AvgPriceCell'
import CellRenderActions from '../portfolio/PositionsCellRender/CellRenderActions'
import PositionOverview from '../portfolio/PositionsCellRender/PositionOverview'
import ValueCellPosition from './ValueCellPosition'
import { ColumnDefWithMeta } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { X } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { roundByTickSize } from '@/utils/helpers'

const COL_STYLES = {
  market: { width: '37%' },
  avg: { width: '15%' },
  bet: { width: '10%' },
  toWin: { width: '10%' },
  value: { width: '15%' },
  actions: { width: '13%' },
}

export const usePortfolioColumns = () => {
  const { t } = useTranslation()

  const activeColumns = useMemo<ColumnDefWithMeta<IPortfolioPosition>[]>(
    () => [
      {
        id: 'market',
        header: () => <div className="pl-2 text-sm font-[330] text-[#FFFFFF80]">{t('prediction.table.market')}</div>,
        cell: ({ row }) => {
          if (row.original.isTotal) {
            return <span className="pl-2 text-sm font-semibold text-white">{t('prediction.table.total')}</span>
          }
          return <PositionOverview position={row.original} />
        },
        meta: { style: COL_STYLES.market },
      },
      {
        id: 'avg_now',
        header: () => <AvgPriceCell />,
        cell: ({ row }) => {
          if (row.original.isTotal) return null
          return (
            <div className="flex cursor-pointer items-center justify-start gap-1 text-sm">
              <span className="text-gray-400">
                {formatPrice(roundByTickSize(row.original.avgPrice, row.original.tickSize))}¢
              </span>
              <ArrowRightIcon className="h-3 w-3 text-gray-600" />
              <span className="text-white">
                {formatPrice(roundByTickSize(row.original.curPrice, row.original.tickSize))}¢
              </span>
            </div>
          )
        },
        meta: { style: COL_STYLES.avg },
      },
      {
        id: 'bet',
        header: () => <div className="text-sm font-[330] text-[#FFFFFF80]">{t('prediction.table.bet')}</div>,
        cell: ({ row }) => (
          <div className={cn('text-left text-sm text-white', row.original.isTotal && 'font-semibold')}>
            {formatBalance(row.original.initialValue, { showCurrency: true })}
          </div>
        ),
        meta: { style: COL_STYLES.bet },
      },
      {
        id: 'to_win',
        header: () => <div className="text-sm font-[330] text-[#FFFFFF80]">{t('prediction.table.toWin')}</div>,
        cell: ({ row }) => (
          <div className={cn('text-left text-sm', row.original.isTotal && 'font-semibold text-white')}>
            {formatBalance(row.original.size, { showCurrency: true, roundMode: 'floor' })}
          </div>
        ),
        meta: { style: COL_STYLES.toWin },
      },
      {
        id: 'value',
        header: () => <div className="text-sm font-[330] text-[#FFFFFF80]">{t('prediction.table.value')}</div>,
        cell: ({ row }) => <ValueCellPosition position={row.original} />,
        meta: { style: COL_STYLES.value },
      },
      {
        id: 'actions',
        header: () => <div />,
        cell: ({ row }) => <CellRenderActions row={row} />,
        meta: { style: COL_STYLES.actions },
      },
    ],
    [t],
  )

  const closedColumns = useMemo<ColumnDefWithMeta<IPortfolioPosition>[]>(
    () => [
      {
        id: 'result',
        header: () => <div className="pl-2">{t('prediction.table.result')}</div>,
        cell: ({ row }) => {
          if (row.original.isTotal) return null
          const isLost = row.original.cashPnl < 0
          return (
            <div className="flex items-center gap-2 pl-2">
              {isLost ? (
                <>
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                    <X size={10} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-fall text-sm font-medium">{t('prediction.profile.lost')}</span>
                </>
              ) : (
                <span className="text-rise text-sm font-medium">{t('prediction.table.won')}</span>
              )}
            </div>
          )
        },
        meta: { style: { width: '15%' } },
      },
      {
        id: 'market',
        header: () => <div className="text-sm font-[330] text-[#FFFFFF80]">{t('prediction.table.market')}</div>,
        cell: ({ row }) => {
          if (row.original.isTotal) {
            return <span className="pl-2 text-sm font-semibold text-white">{t('prediction.table.total')}</span>
          }
          return <PositionOverview position={row.original} />
        },
        meta: { style: { width: '40%' } },
      },
      {
        id: 'total_bet',
        header: () => (
          <div className="text-right text-sm font-[330] text-[#FFFFFF80]">{t('prediction.table.totalBet')}</div>
        ),
        cell: ({ row }) => (
          <div className={cn('text-right text-sm text-white', row.original.isTotal && 'font-semibold')}>
            {formatPrice(row.original.initialValue)}
          </div>
        ),
        meta: { style: { width: '15%' } },
      },
      {
        id: 'amount_won',
        header: () => (
          <div className="text-right text-sm font-[330] text-[#FFFFFF80]">{t('prediction.table.amountWon')}</div>
        ),
        cell: ({ row }) => {
          const isLost = row.original.cashPnl < 0
          return (
            <div className="flex flex-col items-end">
              <span className={cn('text-sm font-medium text-white', row.original.isTotal && 'font-bold')}>
                {formatPrice(row.original.currentValue)}
              </span>
              <div className={cn('text-xs', isLost ? 'text-fall' : 'text-rise')}>
                {formatPrice(row.original.cashPnl)} ({formatPercent(row.original.percentPnl)})
              </div>
            </div>
          )
        },
        meta: { style: { width: '20%' } },
      },
      {
        id: 'actions',
        header: () => <div />,
        cell: ({ row }) => <CellRenderActions row={row} />,
        meta: { style: { width: '10%' } },
      },
    ],
    [t],
  )

  return { activeColumns, closedColumns }
}
