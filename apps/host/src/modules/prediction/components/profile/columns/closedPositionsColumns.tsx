import { formatBalance, formatPercent } from '@/lib/format.ts'
import { cn } from '@/lib/utils.ts'
import { ClosedPositionCell } from '@/modules/prediction/components/portfolio/PositionsCellRender/ClosedPositionCell.tsx'
import { ClosedPositionModel } from '@/modules/prediction/models/ClosedPositionModel.ts'
import { ColumnDefWithMeta } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { Trans } from 'react-i18next'
import { CircleCheckIcon, CircleXIcon } from '../../icons'

export const closedPositionsColumns: ColumnDefWithMeta<ClosedPositionModel>[] = [
  {
    id: 'result',
    header: () => <Trans i18nKey="prediction.profile.result" className="font-light text-[#FFFFFF80] text-sm" />,
    cell: ({ row }) => {
      // Logic for Won/Lost based on PnL? Or explicit status?
      // Assuming PnL < 0 is Lost for now.
      const position = row.original
      const isLost = Number(position.realizedPnl) < 0
      return (
        <div className="flex items-center">
          {isLost ? (
            <>
              <div className=" mr-3">
                <CircleXIcon className="text-fall" />
              </div>
              <span className="text-sm font-medium text-white">
                <Trans i18nKey="prediction.profile.lost" />
              </span>
            </>
          ) : (
            <>
              <div className=" mr-3">
                <CircleCheckIcon className="text-rise" />
              </div>
              <span className="text-sm font-medium text-white">
                <Trans i18nKey="prediction.profile.won" />
              </span>
            </>
          )}
        </div>
      )
    },
    meta: { style: { width: '15%' }, className: 'hidden md:flex' },
  },
  {
    id: 'market',
    header: () => <Trans i18nKey="prediction.profile.market" className="md:pl-2 font-light text-[#FFFFFF80] text-sm" />,
    cell: ({ row }) => {
      return <ClosedPositionCell position={row.original} />
    },
    meta: {
      style: { flex: 1 },
    },
  },
  {
    id: 'total_bet',
    meta: {
      style: { width: '15%' },
      className: 'hidden md:flex justify-end items-center [&>div]:justify-end',
    },
    header: () => (
      <Trans i18nKey="prediction.profile.totalBet" className="justify-end font-light text-[#FFFFFF80] text-sm" />
    ),
    cell: ({ row }) => {
      const avgPrice = Number(row.original.avgPrice)
      const shares = Number(row.original.totalBought)
      const totalBet = avgPrice * shares
      return (
        <div className={cn('text-right text-sm text-white')}>
          {formatBalance(totalBet, {
            showCurrency: true,
          })}
        </div>
      )
    },
  },
  {
    id: 'amount_won',
    meta: { className: 'max-md:w-[20%]! max-md:min-w-[88px]!' },
    header: () => (
      <div className="w-full text-end">
        <Trans
          i18nKey="prediction.profile.amountWon"
          className="justify-end font-light text-[#FFFFFF80] text-sm flex items-center text-end w-full"
        />
      </div>
    ),
    cell: ({ row }) => {
      const avgPrice = Number(row.original.avgPrice)
      const shares = Number(row.original.totalBought)
      const totalBet = avgPrice * shares
      const realizedPnl = Number(row.original.realizedPnl)
      const amountWon = totalBet + realizedPnl
      const pnlPercent = totalBet > 0 ? realizedPnl / totalBet : 0
      const isLost = realizedPnl < 0
      return (
        <div className="flex flex-col items-end w-full text-right ">
          <span className={cn('text-sm font-medium text-white max-[414px]:text-xs')}>
            {formatBalance(amountWon, { showCurrency: true })}
          </span>
          <div className={cn('text-xs max-[414px]:text-[10px]', isLost ? 'text-red-500' : 'text-emerald-500')}>
            {formatBalance(realizedPnl, { showCurrency: true })} ({formatPercent(pnlPercent * 100)})
          </div>
        </div>
      )
    },
  },
]
