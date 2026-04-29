import { useMemo } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils'

import { IPortfolioPosition } from '@/modules/prediction/models/PortfolioModel'

interface NetPositionsModalProps {
  positions: IPortfolioPosition[]
}

export const NetPositionsModal = ({ positions }: NetPositionsModalProps) => {
  const totalCost = useMemo(() => {
    return positions.reduce((acc, pos) => acc + pos.initialValue, 0)
  }, [positions])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center cursor-pointer active:scale-[97%] transition justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border text-foreground hover:bg-muted/50 h-8 rounded-sm px-3 text-xs font-medium"
          type="button"
        >
          View Net Positions
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[550px] max-h-[600px] p-0! rounded-2xl overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 text-left">
          <DialogTitle className="text-xl font-semibold text-foreground mb-3">Net Positions</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-left leading-relaxed">
            See your gains for each outcome scenario based on all your positions.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <Table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '35%' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="pb-3 pt-1 text-left font-semibold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap px-0 h-auto">
                  OUTCOME
                </TableHead>
                <TableHead className="pb-3 pt-1 text-left font-semibold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap px-2 h-auto">
                  PAYOUT
                </TableHead>
                <TableHead className="pb-3 pt-1 text-left font-semibold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap pl-2 h-auto">
                  NET VALUE
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[350px]">
          <Table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '35%' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <TableBody>
              {positions.map((pos, idx) => {
                const payout = pos.size // Assuming $1 payout per share
                const netValue = payout - totalCost
                const isPositive = netValue >= 0

                return (
                  <TableRow key={idx} className="border-b border-border last:border-0 hover:bg-transparent">
                    <TableCell className="py-3 pr-2 px-0">
                      <div className="flex items-center gap-2">
                        <div className="relative overflow-hidden rounded-sm shrink-0 size-10 min-w-10">
                          {pos.icon && (
                            <img
                              alt={`${pos.outcome} icon`}
                              src={pos.icon}
                              className="absolute h-full w-full inset-0 object-cover"
                            />
                          )}
                        </div>
                        <span className="text-sm font-medium text-foreground wrap-break-word">{pos.outcome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-2">
                      <span className="text-sm font-medium text-foreground">${formatBalance(payout)}</span>
                    </TableCell>
                    <TableCell className="py-3 pl-2">
                      <span className={cn('text-sm font-medium', isPositive ? 'text-rise' : 'text-fall')}>
                        {isPositive ? '+' : ''}${formatBalance(netValue)}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
