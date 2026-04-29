import { ClaimablePositionDto } from '@/@generated/gql/graphql-xpUser'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useResponsive } from '@/hooks/useResponsive'
import { formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ClaimablePositionsData } from '@/modules/prediction/hooks/useClaimablePositions'
import { selectActiveClaimStatuses } from '@/redux/modules/claimStatuses.slice'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ClaimWinningsDialog } from './ClaimWinningsDialog'
import { ClaimConfetti } from './ClaimConfetti'

interface ClaimWinningsProps {
  data?: ClaimablePositionsData
}

const ClaimImages = ({ images }: { images: string[] }) => {
  const isSingle = images.length === 1
  return (
    <div
      className={cn('relative h-12 flex items-center justify-center', isSingle ? 'w-11 ml-3 mr-0' : 'w-16 mx-2 mr-2')}
    >
      {images.slice(0, 2).map((src, index) => {
        const styles = [
          { top: '1px', left: '-12px', transform: 'rotate(-13deg)', zIndex: 10 },
          { top: '2px', right: '0px', transform: 'rotate(19deg)', zIndex: 20 },
        ]
        return (
          <div
            key={index}
            className="absolute w-11 h-11 rounded-lg border-2 border-[#1C1C1E] shadow-sm overflow-hidden bg-white"
            style={styles[index]}
          >
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage src={src} alt="Position" className="object-cover" />
              <AvatarFallback className="rounded-none">M</AvatarFallback>
            </Avatar>
          </div>
        )
      })}
    </div>
  )
}

const ClaimButton = ({ onClick, isDesktop }: { onClick: () => void; isDesktop: boolean }) => {
  const { t } = useTranslation()
  return (
    <Button
      variant="gradient"
      onClick={onClick}
      className={cn('h-9 gap-2 text-white font-medium rounded-full', isDesktop ? 'px-6' : 'px-4 py-2 text-sm')}
    >
      {/* {isDesktop ? <Eye className="w-4 h-4" /> : <Banknote className="w-3 h-3" />} */}
      {t('prediction.portfolio.claimProceeds')}
    </Button>
  )
}

export const ClaimWinnings = ({ data }: ClaimWinningsProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { isDesktop } = useResponsive()
  const claimStatusMap = useSelector(selectActiveClaimStatuses)

  const unclaimedPositions = useMemo(() => {
    const rawPositions = data?.raw?.positions || []
    if (rawPositions.length === 0) return []

    const succeeded = new Set(
      Object.entries(claimStatusMap).filter(([, v]) => v.status === 'succeeded').map(([key]) => key),
    )

    return rawPositions.filter((p: ClaimablePositionDto) => !succeeded.has(`${p.conditionId}:${p.tokenId}`))
  }, [data?.raw?.positions, claimStatusMap])

  const isClaimable = unclaimedPositions.length > 0

  const computedMarketsWon = useMemo(() => {
    if (!isClaimable) return 0
    const conditionIds = new Set(unclaimedPositions.map((p: ClaimablePositionDto) => p.conditionId).filter(Boolean))
    return conditionIds.size
  }, [unclaimedPositions, isClaimable])

  const computedProceeds = useMemo(() => {
    if (!isClaimable) return 0
    return unclaimedPositions.reduce((acc: number, curr: ClaimablePositionDto) => acc + (curr.currentValue || 0), 0)
  }, [unclaimedPositions, isClaimable])

  const computedImages = data?.images ?? []
  const computedPositionKeys = useMemo(
    () => unclaimedPositions.map((position: ClaimablePositionDto) => `${position.conditionId}:${position.tokenId}`),
    [unclaimedPositions],
  )
  const succeededPositionKeys = useMemo(
    () =>
      new Set(
        Object.entries(claimStatusMap)
          .filter(([, v]) => v.status === 'succeeded')
          .map(([key]) => key),
      ),
    [claimStatusMap],
  )

  const marketsWon = computedMarketsWon
  const proceeds = computedProceeds
  const images = computedImages
  const isClaimedSuccessfully =
    open && computedPositionKeys.length > 0 && computedPositionKeys.every((key) => succeededPositionKeys.has(key))

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = (v: boolean) => {
    setOpen(v)
  }

  // Desktop View
  const DesktopContent = (
    <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-[#0a0a0a]">
      <div className="flex items-center gap-6 ml-4">
        {/* Images */}
        <ClaimImages images={images} />

        {/* Stats */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">{t('prediction.portfolio.marketsWon')}</span>
          <span className="text-lg font-semibold text-white">{marketsWon}</span>
        </div>
        <div className="h-6 w-px bg-white/10"></div>
        {/* <div className="flex flex-col">
          <span className="text-sm text-gray-400">Total return</span>
          <span className="text-lg font-semibold text-white">{formatPercent(totalReturn)}</span>
        </div> */}
        {/* <div className="h-6 w-px bg-white/10"></div> */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">{t('prediction.portfolio.proceeds')}</span>
          <span className="text-lg font-semibold text-white">{formatBalance(proceeds, { showCurrency: true })}</span>
        </div>
      </div>

      {/* Claim Button */}
      <div className="">
        <ClaimButton onClick={handleOpen} isDesktop={true} />
      </div>
    </div>
  )

  // Mobile View
  const MobileContent = (
    <div className="flex items-center justify-between w-full p-3 border border-white/10 rounded-xl bg-[#0a0a0a]">
      <div className="flex items-center gap-2 ml-2">
        <ClaimImages images={images} />
        <span className="text-base font-semibold text-white">
          {t(
            isClaimedSuccessfully
              ? 'prediction.portfolio.successfullyClaimedAmount'
              : 'prediction.portfolio.youWonAmount',
            { value: formatBalance(proceeds, { showCurrency: true }) },
          )}
        </span>
      </div>
      <div className="">
        <ClaimButton onClick={handleOpen} isDesktop={false} />
      </div>
    </div>
  )

  return (
    <>
      {isClaimable && (
        <div className={cn('w-full opacity-100 h-auto', isDesktop ? 'mb-4' : 'my-2')}>
          {isDesktop ? DesktopContent : MobileContent}
        </div>
      )}

      <ClaimWinningsDialog open={open} onOpenChange={handleClose} data={data} />
      <ClaimConfetti />
    </>
  )
}
