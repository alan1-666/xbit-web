import { MouseEvent, useEffect, useState } from 'react'
import { useAddEventToFavoriteMutation } from '@/modules/prediction/hooks/useAddEventToFavoriteMutation.ts'
import { useRemoveEventFromFavoriteMutation } from '@/modules/prediction/hooks/useRemoveEventFromFavoriteMutation.ts'
import Loader from '@/components/common/Loader'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

export interface FavoriteEventButtonProps {
  eventId: string
  initialIsFavorite?: boolean
  isLoading?: boolean
}

export const FavoriteEventButton = (props: FavoriteEventButtonProps) => {
  const { eventId, initialIsFavorite = false, isLoading = false } = props
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [pendingLoad, setPendingLoad] = useState(isLoading)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setPendingLoad(true)
    } else {
      setIsFavorite(initialIsFavorite)
      setPendingLoad(false)
    }
  }, [isLoading, initialIsFavorite])

  const { mutate: addToFavorite, isPending: isAdding } = useAddEventToFavoriteMutation()
  const { mutate: removeFromFavorite, isPending: isRemoving } = useRemoveEventFromFavoriteMutation()

  const isPending = isAdding || isRemoving

  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    if (!activeWallet?.isConnected) {
      toast.error(t('appSettings.loginRequired'))
      return
    }

    if (isPending) return

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 250)

    if (isFavorite) {
      setIsFavorite(false)
      removeFromFavorite(eventId, {
        onSuccess: () => {
          toast.success(t('walletDetail.msg.unflow'))
        },
        onError: () => {
          setIsFavorite(true)
          toast.error(t('referral.error.fail'))
        },
      })
    } else {
      setIsFavorite(true)
      addToFavorite(eventId, {
        onSuccess: () => {
          toast.success(t('walletDetail.msg.flow'))
        },
        onError: () => {
          setIsFavorite(false)
          toast.error(t('referral.error.fail'))
        },
      })
    }
  }

  if (isLoading || pendingLoad) {
    return <Loader />
  }

  return (
    <button onClick={handleClick} className="cursor-pointer">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: 'transform 0.15s ease',
          animation: isAnimating ? 'bookmark-bounce 0.25s ease' : undefined,
        }}
      >
        <path
          d="M5.48169 5.63525C5.48169 4.53068 6.37712 3.63525 7.48169 3.63525H12.5172C13.6218 3.63525 14.5172 4.53068 14.5172 5.63525V15.3287C14.5172 15.7472 14.0336 15.9805 13.706 15.72L10.3107 13.0196C10.1285 12.8747 9.87042 12.8747 9.68823 13.0196L6.29292 15.72C5.96531 15.9805 5.48169 15.7472 5.48169 15.3287V5.63525Z"
          strokeWidth="1.4"
          strokeLinecap="round"
          style={{
            stroke: isFavorite ? 'var(--impartal)' : '#6D7276',
            fill: isFavorite ? 'var(--impartal)' : 'none',
            transition: 'fill 0.2s ease, stroke 0.2s ease',
          }}
        />
      </svg>
      <style>{`
        @keyframes bookmark-bounce {
          0%   { transform: scale(1); }
          25%  { transform: scale(1.2); }
          50%  { transform: scale(0.85); }
          75%  { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </button>
  )
}
