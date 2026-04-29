import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useResponsive } from '@/hooks/useResponsive'
import { formatBalance } from '@/lib/format'
import { ClaimablePositionsData, ClaimStatus } from '@/modules/prediction/hooks/useClaimablePositions'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ClaimWinningsItem } from './ClaimWinningsItem'
import { useEffect, useMemo, useState } from 'react'
import { ClaimablePositionDto } from '@/@generated/gql/graphql-xpUser'
import { useDispatch, useSelector } from 'react-redux'
import { selectActivePendingClaims } from '@/redux/modules/predictionClaimedBalance.slice'
import type { RootState } from '@/redux/store'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet'
import { clearClaimStatuses, selectActiveClaimStatuses } from '@/redux/modules/claimStatuses.slice'

interface ClaimWinningsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ClaimablePositionsData | undefined
}

export const ClaimWinningsDialog = ({ open, onOpenChange, data }: ClaimWinningsDialogProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const dispatch = useDispatch()
  const [totalWonAmount, setTotalWonAmount] = useState(0)
  const [rawPositions, setRawPositions] = useState<ClaimablePositionDto[]>([])
  const [rawImages, setRawImages] = useState<string[]>([])
  const [hasClaimAttempt, setHasClaimAttempt] = useState(false)
  const proxyWallet = useProxyWallet()
  const pendingClaims = useSelector((state: RootState) => selectActivePendingClaims(state, proxyWallet || ''))
  const claimStatusMap = useSelector(selectActiveClaimStatuses)
  const claim = data?.claim ?? (async () => ({ total: 0, succeeded: [], failed: [] }))
  const isClaiming = data?.isClaiming ?? false
  const claimingErrors = data?.claimingErrors ?? ({} as Record<string, string>)
  const resetClaimingStatuses = data?.resetClaimingStatuses ?? (() => {})

  const getPositionKey = (position: ClaimablePositionDto) => `${position.conditionId}:${position.tokenId}`

  /** Check if a pending claim covers a given conditionId:tokenId (handles both single and batch claims) */
  const pendingClaimMatchesPosition = (p: (typeof pendingClaims)[0], conditionId: string, tokenId: string): boolean => {
    // Check batch positions array first
    if (p.positions?.length) {
      return p.positions.some((pos) => pos.conditionId === conditionId && pos.tokenId === tokenId)
    }
    // Fallback to single position fields
    return p.conditionId === conditionId && p.tokenId === tokenId
  }

  const isPendingOnChain = rawPositions.some((pos) =>
    pendingClaims.some((p) => pendingClaimMatchesPosition(p, pos.conditionId, pos.tokenId) && !p.isConfirmed),
  )

  const isActuallyClaiming =
    isClaiming ||
    isPendingOnChain ||
    rawPositions.some((pos) => claimStatusMap[`${pos.conditionId}:${pos.tokenId}`]?.status === 'claiming')

  const derivedStatusByKey = useMemo(() => {
    const map: Record<string, ClaimStatus | undefined> = {}
    rawPositions.forEach((position) => {
      const key = getPositionKey(position)
      const statusFromMap = claimStatusMap[key]?.status
      const statusFromPendingWaiting = pendingClaims.some(
        (p) => pendingClaimMatchesPosition(p, position.conditionId, position.tokenId) && !p.isConfirmed,
      )
        ? ('claiming' as ClaimStatus)
        : undefined
      const statusFromPendingConfirmed = pendingClaims.some(
        (p) => pendingClaimMatchesPosition(p, position.conditionId, position.tokenId) && p.isConfirmed,
      )
        ? ('succeeded' as ClaimStatus)
        : undefined
      map[key] = statusFromMap || statusFromPendingConfirmed || statusFromPendingWaiting
    })
    return map
  }, [rawPositions, pendingClaims, claimStatusMap])

  const failedPositionKeys = useMemo(
    () =>
      Object.entries(derivedStatusByKey)
        .filter(([, status]) => status === 'failed')
        .map(([key]) => key),
    [derivedStatusByKey],
  )
  const hasFailed = failedPositionKeys.length > 0

  const allSucceeded =
    rawPositions.length > 0 &&
    rawPositions.every((position) => derivedStatusByKey[getPositionKey(position)] === 'succeeded')

  const currentClaimableKeys = useMemo(
    () => new Set((data?.raw?.positions || []).map((position) => getPositionKey(position))),
    [data?.raw?.positions],
  )
  const hasRemainingClaimable = rawPositions.some((position) => currentClaimableKeys.has(getPositionKey(position)))

  const shouldShowRetry = !isActuallyClaiming && hasFailed
  const shouldShowClose =
    !isActuallyClaiming && !hasFailed && (allSucceeded || (hasClaimAttempt && !hasRemainingClaimable))
  const titleKey = shouldShowClose ? 'prediction.claim.successfullyClaimed' : 'prediction.portfolio.youWonAmount'

  let btnText: React.ReactNode = t('prediction.portfolio.claimProceeds')
  if (shouldShowRetry) {
    btnText = t('prediction.claim.retry')
  } else if (shouldShowClose) {
    btnText = t('futuresDetails.common.close')
  }

  const handleClaimOrClose = async () => {
    if (shouldShowClose) {
      handleClose(false)
      return
    }
    if (claim) {
      try {
        setHasClaimAttempt(true)
        await claim(shouldShowRetry ? failedPositionKeys : undefined)
      } catch {
        return
      }
    }
  }

  const handleClose = (value: boolean) => {
    if (!value) {
      resetClaimingStatuses()
      setHasClaimAttempt(false)
      dispatch(clearClaimStatuses())
    }
    onOpenChange(value)
  }

  useEffect(() => {
    // Only update the dialog's local positions when it FIRST opens
    if (open && data?.raw?.positions && rawPositions.length === 0) {
      const totalWonAmount = data.raw.positions.reduce((acc, pos) => acc + (pos.currentValue || 0), 0)
      setTotalWonAmount(totalWonAmount)
      setRawPositions(data.raw.positions || [])
      setRawImages(data.images || [])
    }
    // Clear data when closed so it can refetch next time
    if (!open) {
      setRawPositions([])
      setRawImages([])
      setTotalWonAmount(0)
      setHasClaimAttempt(false)
    }
  }, [open, data?.raw?.positions, data?.images]) // removed claimingStatuses to preserve the freeze

  const Content = (
    <div data-claim-confetti-anchor="true" className="flex flex-col h-full min-h-0 bg-[#212127] rounded-xl relative">
      <div className="flex flex-col items-center text-center shrink-0 pt-2 px-3">
        {/* <img src="/images/prediction/you-won.png" alt={t('prediction.portfolio.youWon')} className="h-44" /> */}

        <div className="pb-6 pt-5">
          <h2 className="text-2xl text-white font-bold mb-2">
            {t(titleKey, { value: formatBalance(totalWonAmount, { showCurrency: true }) })}
          </h2>
          <p className="text-[#94A3B8] text-pretty">{t('prediction.portfolio.congratsMessage')}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative min-h-0 px-3">
        <div className="overflow-y-auto flex-1 space-y-3 custom-scrollbar max-h-[40vh]">
          {rawPositions.map((position, idx) => {
            const image = rawImages[idx] || '/images/icons/market-default.svg'
            const wonAmount = position.currentValue
            const key = getPositionKey(position)
            const derivedStatus = derivedStatusByKey[key]

            return (
              <ClaimWinningsItem
                key={key}
                title={position.marketTitle}
                wonAmount={wonAmount}
                image={image}
                marketSlug={position.marketSlug}
                claimStatus={derivedStatus}
                claimError={claimingErrors[key]}
              />
            )
          })}
        </div>
      </div>

      <div className="shrink-0 bg-[#212127] mt-4 p-6 pt-4 border-t border-[#79778C29]">
        <div className="flex flex-col gap-3">
          <Button
            variant="gradient"
            onClick={handleClaimOrClose}
            isLoading={isActuallyClaiming}
            loadingText={t('prediction.portfolio.claiming')}
            className="w-full h-12 text-base hover:opacity-90 text-white rounded-full"
            disabled={isActuallyClaiming}
          >
            {btnText}
          </Button>
          {/* <Button
            variant="outline"
            className="w-full h-12 text-base font-medium rounded-lg border-[#79778C29] bg-transparent text-white hover:bg-white/5 hover:text-white"
          >
            Share on
            <img src="/images/icons/socials/ic-twitter.svg" alt="Twitter" className="size-5" />
          </Button> */}
        </div>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none [&>button]:hidden">
          <div className="relative w-full h-full rounded-xl flex flex-col mb-2 overflow-hidden shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </Button>
            {Content}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="bg-[#212127] border-none p-0 max-h-[88vh] max-w-[768px] mx-auto">
        <div className="rounded-t-xl overflow-hidden border-t border-[#79778C29]">{Content}</div>
      </DrawerContent>
    </Drawer>
  )
}
