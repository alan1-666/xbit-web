import { Button } from '@/components/ui/button'
import { Row } from '@tanstack/react-table'
import { IPortfolioPosition } from '../../../models/PortfolioModel'
import { CashOutModal } from './CashOutModal'
import { useClaimablePositions } from '../../../hooks/useClaimablePositions'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { selectResolvedMarketIds } from '@/redux/modules/resolvedMarkets.slice'

const CellRenderActions = ({ row }: { row: Row<IPortfolioPosition> }) => {
  const { t } = useTranslation()
  const { data: claimableData } = useClaimablePositions()
  const claimablePositions = claimableData?.raw?.positions || []
  const resolvedMarketIds = useSelector(selectResolvedMarketIds)

  // Check if current position is claimable
  const isClaimable = useMemo(
    () =>
      claimablePositions.some(
        (p) => p.conditionId === row.original.conditionId && p.tokenId === row.original.tokenId,
      ) || (row.original.marketId ? resolvedMarketIds.has(row.original.marketId) : false),
    [claimablePositions, row.original.conditionId, row.original.tokenId, row.original.marketId, resolvedMarketIds],
  )

  if (row.original.isTotal) return null

  return (
    <div className="flex items-center justify-end gap-2 pr-2 flex-1">
      {isClaimable ? (
        <Button
          className="bg-green-600/70 text-white h-7 w-[90px] font-medium rounded-md flex justify-center items-center"
          onClick={() => toast.info(t('prediction.positionCard.POLYMARKET_ORDER_CREATION_RESOLVED_MARKET'))}
        >
          <div>{t('assets.transfers.Processing')}</div>
        </Button>
      ) : (
        <CashOutModal position={row.original}>
          <Button
            size="sm"
            className="bg-fall shadow-[0px_-4px_0px_0px_#0000004D_inset] hover:bg-fall/85 text-white h-7 w-[80px] font-medium transition-all active:scale-[0.98]"
          >
            {t('history.sell')}
          </Button>
        </CashOutModal>
      )}
    </div>
  )
}

export default CellRenderActions
