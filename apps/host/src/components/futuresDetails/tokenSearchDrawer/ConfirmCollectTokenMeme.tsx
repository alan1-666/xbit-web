import { EVENT_MESSAGE_FAVORITE } from '@/components/detailListIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'
import eventBus from '@/lib/eventBus'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import { cn } from '@/lib/utils.ts'
import { useMutation } from '@apollo/client'
import { addTokenToFavorite, removeTokenFromFavorite } from '@services/tokens.service.ts'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from './CustomToast'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { useActiveChainType } from '@hooks/useActiveChain.ts'
import { useQueryClient } from '@tanstack/react-query'
import { useFavoriteBroadcast } from './hooks/useFavoriteBroadcast'
import { ChainType } from '@/@generated/gql/graphql-meme2'
const CHANNEL_NAME = 'token-favorite-channel'

const ConfirmCollectTokenMeme = (props: {
  defaultCollect: boolean
  token: string
  showDialog?: boolean
  onRemove?: () => void
  onRemoveSuccess?: () => void
  onRemoveFailed?: () => void
  onAdded?: () => void
  tokenSymbol: string
  triggerClassName?: string
  chain?: ChainType
}) => {
  const {
    token,
    defaultCollect,
    onRemove,
    onRemoveSuccess,
    onRemoveFailed,
    showDialog = false,
    onAdded,
    tokenSymbol,
    triggerClassName,
    chain,
  } = props
  const [open, setOpen] = useState(false)
  const [isCollect, setCollect] = useState<boolean>(defaultCollect)
  const { t } = useTranslation()
  const [addToFavoritesMutation] = useMutation(addTokenToFavorite, { client: futureClient })
  const [removeFromFavoritesMutation] = useMutation(removeTokenFromFavorite, { client: futureClient })
  const activeChainType = useActiveChainType()
  const { showToast } = useToast()
  const [_, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const { broadcastFavorite } = useFavoriteBroadcast()

  const addToFavorites = () => {
    setIsLoading(true)
    setCollect(true)
    addToFavoritesMutation({ variables: { token: token, chain: chain ? chain : activeChainType } })
      .then((e) => {
        if (e.data.addToFavorite) {
          showToast({
            type: 'success',
            title: t('toast.addFavoriteSuccess'),
            duration: 4000,
          })

          // Update cache
          broadcastFavorite(token, true)
          onAdded?.()
          eventBus.dispatch(EVENT_MESSAGE_FAVORITE, {
            data: {
              token: token,
              isFavorite: true,
            },
          })
        } else {
          setCollect(false)
          showToast({
            type: 'error',
            title: t('toast.addFavoriteFailed'),
          })
        }
      })
      .catch((e) => {
        setCollect(false)
        showToast({
          type: 'error',
          title: t('toast.addFavoriteFailed'),
          description: e[0].message,
        })
        if (e[0]?.code === 'Following_LimitExceeded') {
          showToast({
            type: 'error',
            title: t('toast.addFavoriteFailed2'),
          })
        } else {
          showToast({
            type: 'error',
            title: t('toast.addFavoriteFailed'),
            description: e[0].message,
          })
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const removeFromFavorites = () => {
    setIsLoading(true)
    setCollect(false)
    setOpen(false)
    onRemove?.()
    removeFromFavoritesMutation({ variables: { token: token, chain: chain ? chain : activeChainType } })
      .then((e) => {
        if (e.data.removeTokenFavorite) {
          showToast({
            type: 'success',
            title: t('toast.removeFavoriteSuccess'),
          })

          // Update cache
          broadcastFavorite(token, false)
          onRemoveSuccess?.()
          eventBus.dispatch(EVENT_MESSAGE_FAVORITE, {
            data: {
              token: token,
              isFavorite: false,
            },
          })
        } else {
          setCollect(true)
          showToast({
            type: 'error',
            title: t('toast.removeFavoriteFailed'),
          })
        }
      })
      .catch((e) => {
        showToast({
          type: 'error',
          title: t('toast.removeFavoriteFailed'),
          description: e[0].message,
        })
        setCollect(true)
        onRemoveFailed?.()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const performAddOrRemove = () => {
    if (!isCollect) {
      // add to favorites
      addToFavorites()
    } else if (!showDialog) {
      // not show dialog
      removeFromFavorites()
    } else {
      // show dialog
      setOpen(true)
    }
  }

  const handleCollectChange = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (!ServiceConfig.token) {
      showToast({
        type: 'error',
        title: t('appSettings.loginRequired'),
      })
      return
    }
    performAddOrRemove()
  }

  useEffect(() => {
    if (!!ServiceConfig.token) {
      setCollect(defaultCollect)
    } else {
      setCollect(false)
    }
  }, [ServiceConfig.token, defaultCollect])

  const handleCancelCollect = (event: React.MouseEvent) => {
    event.stopPropagation()
    removeFromFavorites()
  }

  const handleOverlayClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className={cn('p-2 pr-0 cursor-pointer', triggerClassName)}>
        <img
          onClick={handleCollectChange}
          className="transition-all duration-100 hover:scale-[1.2]"
          src={isCollect ? '/images/icons/vector-star-icon-active.svg?v=2' : '/images/icons/star-InSearch-icon.svg'}
          alt=""
        />
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
              <p className="text-[18px] py-3">{t('listCoin.removeWatchlist', { coinName: tokenSymbol })}</p>
            </DialogTitle>
            <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
              <Button variant="close" className="flex-1 rounded-[50px]" onClick={() => setOpen(false)}>
                {t('toast.cancel')}
              </Button>
              <Button variant="gradient" className="text-[#261236] flex-1 rounded-[50px]" onClick={handleCancelCollect}>
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

export default ConfirmCollectTokenMeme
