import { useCleanFollowingsCache, useGetTotalFollowings } from '@hooks/useGetTotalFollowings.ts'
import React, { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { toast } from 'sonner'
import { Button } from '@components/ui/button.tsx'
import { UnfollowWalletDialog, UnfollowWalletDialogHandle } from '@components/monitoring/pc/UnfollowWalletDialog.tsx'
import { useCleanFollowingSmartMoneys } from '@hooks/useFollowingSmartMoneys.ts'

const ButtonUnFollowAll = () => {
  const { t } = useTranslation()

  const { data } = useGetTotalFollowings()
  const listFollowings = useMemo(() => data?.map((item) => item?.address), [data])
  const listFollowingString = listFollowings?.join(',')

  const unfollowDialogRef = useRef<UnfollowWalletDialogHandle>(null)
  const cleanFollowingSmartMoneysCache = useCleanFollowingSmartMoneys()
  const cleanFollowingWalletsCache = useCleanFollowingsCache()

  const handleUnFollowAll = (address: string) => {
    if (address) {
      cleanFollowingSmartMoneysCache()
      cleanFollowingWalletsCache()
    } else {
      toast.warning(t('toast.addFavoriteUnknowFailed'))
    }
  }

  const handleOnClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    unfollowDialogRef.current?.open(listFollowingString, t('orderBook.all'))
  }

  return (
    <>
      <Button
        onClick={handleOnClick}
        disabled={listFollowings?.length <= 0}
        className={cn(
          'bg-[#212127] px-3 py-[7px] rounded-[6px] text-[#908E98]',
          'hover:text-[#FFF]/80 hover:bg-[#212127AA]',
        )}
      >
        <span className="block text-[12px] leading-[1] font-light">{t('followingWallet.deleteAll')}</span>
      </Button>
      <UnfollowWalletDialog ref={unfollowDialogRef} onSuccess={handleUnFollowAll} />
    </>
  )
}

export default ButtonUnFollowAll
