import { useUnfollowWalletMutation } from '@hooks/useUnfollowWallet.ts'
import { get } from 'lodash-es'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog.tsx'
import { Ref, useImperativeHandle, useState } from 'react'
import { Button } from '@components/ui/button.tsx'
import { formatAddressWallet } from '@/lib/string.ts'
import { removeXWalletFavourite } from '@/hooks/useGetTotalFollowingAddress'
import {useActiveChainType} from "@hooks/useActiveChain.ts";

export interface UnfollowWalletDialogHandle {
  open: (address: string, alias?: string) => void
}

export interface UnfollowWalletDialogProps {
  ref?: Ref<UnfollowWalletDialogHandle>
  onSuccess?: (address: string) => void
  skipSuccessHandler?: boolean
}

export const UnfollowWalletDialog = (props: UnfollowWalletDialogProps) => {
  const { onSuccess, ref, skipSuccessHandler } = props
  const [address, setAddress] = useState('')
  const [alias, setAlias] = useState('')
  const [open, setOpen] = useState(false)
  const unFollowWalletMutation = useUnfollowWalletMutation()
  const { t } = useTranslation()
  const activeChainType = useActiveChainType()

  useImperativeHandle(ref, () => ({
    open: (address: string, alias: string = '') => {
      setAddress(address)
      setAlias(alias || address)
      setOpen(true)
    },
  }))

  const unfollowWallet = () => {
    if (unFollowWalletMutation.isPending) {
      return
    }
    setOpen(false)
    unFollowWalletMutation.mutate(
      {
        walletAddress: address,
        chain: activeChainType,
      },
      {
        onSuccess: (data) => {
          if (skipSuccessHandler) return
          const unFollowWallet = get(data, 'data.unFollowWallet', false)
          if (unFollowWallet) {
            toast.success(t('walletDetail.msg.unflow'))
            onSuccess?.(address)
            removeXWalletFavourite(address, activeChainType)
          }
        },
      },
    )
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle className="text-center">
          <p className="text-[18px] py-3">{t('listCoin.removeWatchlist', { coinName: formatAddressWallet(alias) })}</p>
        </DialogTitle>
        <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
          <Button variant="close" className="flex-1 rounded-[50px]" onClick={() => setOpen(false)}>
            {t('toast.cancel')}
          </Button>
          <Button variant="gradient" className="text-[#261236] flex-1 rounded-[50px]" onClick={unfollowWallet}>
            {t('toast.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
