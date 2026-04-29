import { useState, MouseEvent, useEffect } from 'react'
import { cn } from '@/lib/utils.ts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@components/ui/dialog.tsx'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client'
import { addTokenToFavorite, removeTokenFromFavorite } from '@services/tokens.service.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import eventBus from '@/lib/eventBus.ts'
import { EVENT_MESSAGE_FAVORITE, EVENT_MESSAGE_REMOVE_FAVORITE } from '@components/detailListIcon'
import { toast } from 'sonner'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useActiveChainType } from '@hooks/useActiveChain.ts'
import { isArray } from 'lodash'

export interface FavoriteTokenIconProps {
  defaultValue: boolean
  token: string
  symbol: string
  onRemoving?: () => void
  onRemoved?: () => void
  onError?: () => void
  onAdded?: () => void
  triggerClassName?: string
  showDialog?: boolean
}

export const FavoriteTokenIcon = (props: FavoriteTokenIconProps) => {
  const {
    defaultValue,
    token,
    symbol,
    onRemoving,
    onRemoved,
    onError,
    onAdded,
    triggerClassName,
    showDialog = false,
  } = props
  const activeWallet = useActiveWallet()
  const [open, setOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(defaultValue)
  const { t } = useTranslation()
  const [addToFavoritesMutation] = useMutation(addTokenToFavorite, { client: futureClient })
  const [removeFromFavoritesMutation] = useMutation(removeTokenFromFavorite, { client: futureClient })
  const activeChainType = useActiveChainType()

  useEffect(() => {
    setIsFavorite(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    const listener = (data: { data: { token: string } }) => {
      if (data?.data?.token === token) {
        setIsFavorite(false)
      }
    }
    eventBus.on(EVENT_MESSAGE_REMOVE_FAVORITE, listener)
    return () => {
      eventBus.remove(EVENT_MESSAGE_REMOVE_FAVORITE, listener)
    }
  }, [token])

  const handleOverlayClick = (event: MouseEvent) => {
    event.stopPropagation()
    setOpen(false)
  }

  const addToFavorites = async () => {
    try {
      setIsFavorite(true)
      await addToFavoritesMutation({ variables: { token, chain: activeChainType } })
      onAdded?.()
      toast.success(t('toast.addFavoriteSuccess'))
      eventBus.dispatch(EVENT_MESSAGE_FAVORITE, {
        data: {
          token: token,
          isFavorite: true,
        },
      })
    } catch (e) {
      if (isArray(e) && e[0]?.code === 'Following_LimitExceeded') {
        toast.warning(t('toast.addFavoriteFailed2'))
      } else {
        toast.warning(t('toast.addFavoriteFailed'))
      }
      onError?.()
      setIsFavorite(false)
    }
  }

  const removeFromFavorites = async () => {
    try {
      onRemoving?.()
      await removeFromFavoritesMutation({ variables: { token, chain: activeChainType } })
      setIsFavorite(false)
      onRemoved?.()
      toast.success(t('toast.removeFavoriteSuccess'))
      eventBus.dispatch(EVENT_MESSAGE_FAVORITE, {
        data: {
          token: token,
          isFavorite: false,
        },
      })
    } catch (error) {
      console.error('Error removing from favorites:', error)
      toast.warning(t('toast.removeFavoriteFailed'))
      onError?.()
      setIsFavorite(true)
    }
  }

  const toggle = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    if (!activeWallet?.isConnected) {
      toast.warning(t('listCoin.requireLoginToFavorite'))
      return
    }
    if (!isFavorite) {
      // Add to favorites
      return addToFavorites()
    }
    if (showDialog) {
      // Show confirmation dialog before removing
      return setOpen(true)
    }
    // Directly remove from favorites
    return removeFromFavorites()
  }

  const confirmRemove = () => {
    removeFromFavorites().then()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className={cn('pb-2 pt-3 pr-0 cursor-pointer ', triggerClassName)} onClick={toggle}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path
              d="M7.19507 1.64083C7.53472 0.990639 8.46524 0.99064 8.80488 1.64084L10.3437 4.58669C10.4753 4.83859 10.7172 5.01437 10.9975 5.06167L14.2747 5.61487C14.998 5.73697 15.2856 6.62195 14.7721 7.14589L12.446 9.51974C12.2471 9.72273 12.1547 10.0071 12.1963 10.2883L12.6829 13.576C12.7903 14.3017 12.0374 14.8486 11.3805 14.5222L8.40402 13.0435C8.1495 12.9171 7.85046 12.9171 7.59593 13.0435L4.61945 14.5222C3.9625 14.8486 3.2097 14.3017 3.31709 13.576L3.80368 10.2883C3.84528 10.0071 3.75288 9.72273 3.55397 9.51974L1.22782 7.14589C0.714399 6.62195 1.00195 5.73697 1.72527 5.61487L5.00248 5.06167C5.28271 5.01437 5.52464 4.83859 5.65623 4.58669L7.19507 1.64083Z"
              strokeWidth="1.46"
              style={{
                stroke: isFavorite ? 'var(--impartal)' : '#6C6A74',
                fill: isFavorite ? 'var(--impartal)' : undefined,
              }}
            />
          </g>
        </svg>
      </div>
      <DialogOverlay
        onPointerDown={(event) => handleOverlayClick(event)}
        onClick={(event) => handleOverlayClick(event)}
      >
        <DialogContent
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="w-[335px] bg-[#232329] rounded-2xl p-5"
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              <p className="text-[18px] py-3">{t('listCoin.removeWatchlist', { coinName: symbol })}</p>
            </DialogTitle>
            <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
              <Button variant="close" className="flex-1 rounded-[50px]" onClick={() => setOpen(false)}>
                {t('toast.cancel')}
              </Button>
              <Button variant="gradient" className="text-[#261236] flex-1 rounded-[50px]" onClick={confirmRemove}>
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
