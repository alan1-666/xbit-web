import { cn } from '@/lib/utils.ts'
import { toast } from 'sonner'
import { useMutation } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { followWallet, unFollowWallet } from '@services/wallet.service.ts'
import { useQueryClient } from '@tanstack/react-query'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage.ts'
import { CACHED_FOLLOWING_LIST, FOLLOWED_SMART_MONEY } from '@components/tokenDetailSmartMoney/FollowedSmartMoney.tsx'
import { TTL_STORAGE } from '@const/configs.ts'
import { FollowingWalletInfo } from '@/@generated/gql/graphql-future.ts'
import { addXWalletFavourite } from '@hooks/useGetTotalFollowingAddress.ts'
import { useActiveChainType } from '@hooks/useActiveChain.ts'
import { useOnAddedFollowingWallet, useOnRemovedFollowingWallet } from '@hooks/useFollowingWallets.ts'
import { isArray } from 'lodash-es'

type ButtonFollowTokenProps = {
  address: string
  className?: string
  isFollowing?: boolean
  reFetchFn?: () => void
  isStarBottomTabs?: boolean
}

const ButtonFollowToken = (props: ButtonFollowTokenProps) => {
  const { t } = useTranslation()

  const { address, className, isFollowing = true, reFetchFn, isStarBottomTabs } = props

  const client = useQueryClient()
  const activeWallet = useActiveWallet()
  const [followWalletMutation] = useMutation(followWallet, { client: futureClient })
  const [unfollowWalletMutation] = useMutation(unFollowWallet, { client: futureClient })
  const activeChainType = useActiveChainType()
  const onAddedFollowingWallet = useOnAddedFollowingWallet()
  const onRemovedFollowingWallet = useOnRemovedFollowingWallet()

  const performAddFavorites = () => {
    // setIsFavorite(true)
    followWalletMutation({ variables: { input: { walletAddress: address, chain: activeChainType || 'SOLANA' } } })
      .then((e) => {
        if (e.data.followWallet) {
          toast.success(t('walletDetail.msg.flow'))
          const newItemFollowed = { address, alias: '' }
          addXWalletFavourite(address, activeChainType)
          const _listFollowed = getFromLocalStorageWithTTL<string[]>(FOLLOWED_SMART_MONEY)
          if (_listFollowed && _listFollowed?.length > 0) {
            _listFollowed.unshift(address)
            reFetchFn?.()
            saveToLocalStorageWithTTL<string[]>(FOLLOWED_SMART_MONEY, _listFollowed, TTL_STORAGE)
          }
          // Update React Query cache safely
          const walletAddr = activeWallet?.walletAddress
          if (walletAddr) {
            client.setQueryData(
              ['totalFollowings', activeChainType, walletAddr],
              (data?: FollowingWalletInfo[]) => {
                const safeData = Array.isArray(data) ? data : []
                const exists = safeData.some((item) => item?.address === newItemFollowed.address)

                if (!exists) {
                  const selectedItems = getFromLocalStorageWithTTL<string[]>(CACHED_FOLLOWING_LIST) ?? []
                  saveToLocalStorageWithTTL<string[]>(
                    CACHED_FOLLOWING_LIST,
                    [...selectedItems, newItemFollowed?.address],
                    TTL_STORAGE,
                  )
                  return [newItemFollowed, ...safeData]
                }

                return safeData
              },
              // Mark fresh until 90s later
              { updatedAt: Date.now() + 90000 },
            )
            onAddedFollowingWallet(address)
          }
        } else {
          // setIsFavorite(false)
          toast.warning(t('toast.addFavoriteFailed'))
        }
      })
      .catch((error) => {
        // setIsFavorite(false)
        if (isArray(error)) {
          // array of GraphQLErrors
          const code = error?.[0]?.code
          if (code === 'Following_LimitExceeded') {
            toast.error(t('followingWallet.LimitExceeded'))
          } else {
            toast.error(error.map((e) => e.message).join('; ') || t('followingWallet.importError'))
          }
        } else {
          toast.warning(t('toast.addFavoriteFailed'))
        }
      })
  }

  const performRemoveFavorites = () => {
    // setIsFavorite(false)
    unfollowWalletMutation({
      variables: { input: { walletAddress: address, chain: activeChainType || 'SOLANA' } },
    })
      .then((e) => {
        if (e.data.unFollowWallet) {
          toast.success(t('walletDetail.msg.unflow'))
          reFetchFn?.()
          // Update React Query cache safely (mirror addToFavorites)
          const walletAddr = activeWallet?.walletAddress
          if (walletAddr) {
            client.setQueryData(
              ['totalFollowings', activeChainType, walletAddr],
              (data?: FollowingWalletInfo[]) => {
                const safeData = Array.isArray(data) ? data : []
                if (!address) return safeData
                const selectedItems = getFromLocalStorageWithTTL<string[]>(CACHED_FOLLOWING_LIST) ?? []
                saveToLocalStorageWithTTL<string[]>(
                  CACHED_FOLLOWING_LIST,
                  selectedItems.filter((item) => item !== address),
                  TTL_STORAGE,
                )
                return safeData.filter((item) => item?.address !== address)
              },
              { updatedAt: Date.now() + 90000 },
            )
            onRemovedFollowingWallet(address)
          }
        } else {
          // setIsFavorite(true)
          toast.warning(t('toast.removeFavoriteFailed'))
        }
      })
      .catch(() => {
        // setIsFavorite(true)
        toast.warning(t('toast.removeFavoriteFailed'))
      })
  }

  const addToFavorites = (e: MouseEvent) => {
    e.stopPropagation()
    performAddFavorites()
  }

  const removeFromFavorites = (e: MouseEvent) => {
    e.stopPropagation()
    performRemoveFavorites()
  }

  const renderIconActive = () => {
    return isStarBottomTabs
      ? '/images/icons/vector-star-icon-active-v2.svg?v=2'
      : '/images/icons/ic-star-filled-red.svg'
  }

  return (
    <img
      onClick={isFollowing ? removeFromFavorites : addToFavorites}
      className={cn(
        'cursor-pointer transition-all duration-100 hover:scale-[1.2] !pointer-events-auto',
        isStarBottomTabs ? '!size-4' : '',
        className,
      )}
      src={isFollowing ? renderIconActive() : '/images/icons/star-icon.svg'}
      alt="start-icon"
    />
  )
}

export default ButtonFollowToken
