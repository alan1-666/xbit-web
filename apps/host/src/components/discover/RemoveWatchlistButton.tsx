import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog.tsx'
import { Button } from '@components/ui/button.tsx'
import { useState } from 'react'
import { IconTrash } from '@components/icon/IconTrash.tsx'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client'
import { removeTokenFromFavorite } from '@services/tokens.service.ts'
import { toast } from 'sonner'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { useActiveChainType } from '@hooks/useActiveChain.ts'

export interface RemoveWatchlistButtonProps {
  tokenAddress: string
  tokenSymbol: string
  onRemoving?: () => void
  onRemoved?: (success: boolean) => void
}

export const RemoveWatchlistButton = (props: RemoveWatchlistButtonProps) => {
  const { tokenAddress, tokenSymbol, onRemoved, onRemoving } = props
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const [removeFromFavoritesMutation] = useMutation(removeTokenFromFavorite, { client: futureClient })
  const activeChainType = useActiveChainType()

  const handleRemove = () => {
    setOpen(false)
    onRemoving?.()
    onRemoved?.(true)
    removeFromFavoritesMutation({ variables: { token: tokenAddress, chain: activeChainType } })
      .then(() => {
        toast.success(t('toast.removeFavoriteSuccess'))
        // onRemoved?.(true)
      })
      .catch(() => {
        toast.warning(t('toast.removeFavoriteFailed'))
        // onRemoved?.(false)
      })
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="size-full flex items-center justify-center cursor-pointer">
        <div className="size-4">
          <IconTrash className="text-[#FF353C] size-4" />
        </div>
      </DialogTrigger>
      <DialogOverlay>
        <DialogContent
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="w-[335px] bg-[#232329] rounded-2xl p-5"
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              <p className="text-[18px] py-3">{t('listCoin.removeWatchlist', { coinName: tokenSymbol })}</p>
            </DialogTitle>
            <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
              <Button variant="close" className="flex-1 rounded-[50px]" onClick={() => setOpen(false)}>
                {t('toast.cancel')}
              </Button>
              <Button variant="gradient" className="text-[#261236] flex-1 rounded-[50px]" onClick={handleRemove}>
                {t('toast.confirm')}
              </Button>
            </div>
          </DialogHeader>
          <DialogDescription />
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}
