import { FollowingWalletInfo } from '@/@generated/gql/graphql-future'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'
import { useActiveChainType } from '@/hooks/useActiveChain'
import { APP_PATH, CACHE_KEY, CHAIN_SYMBOLS } from '@/lib/constant'
import eventBus from '@/lib/eventBus.ts'
import { futureClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { followWallet, unFollowWallet } from '@/services/wallet.service'
import { ChainIds } from '@/types/enums.ts'
import { getFromLocalStorageWithTTL, loadFirstPageFromStorage, saveToLocalStorageWithTTL } from '@/utils/storage'
import { useMutation } from '@apollo/client'
import { EVENT_MESSAGE_FAVORITE } from '@components/detailListIcon'
import { TradeDetailItem } from '@components/listCoin/TabMainstream.tsx'
import { CACHED_FOLLOWING_LIST } from '@components/tokenDetailSmartMoney/FollowedSmartMoney.tsx'
import { TTL_STORAGE } from '@const/configs.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import useSignWallet from '@hooks/useSignWallet.ts'
import { addTokenToFavorite, removeTokenFromFavorite } from '@services/tokens.service.ts'
import { useQueryClient } from '@tanstack/react-query'
import { f } from 'fintech-number'
import { isArray } from 'lodash'
import isNumber from 'lodash/isNumber'
import React, { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

type CurrencyListCardProps = {
  tradeDetails: TradeDetailItem[]
  className?: string
  classNameItem?: string
  classNameItems?: string[]
  cols?: number
}

const ConfirmCollectModal = (props: {
  defaultCollect: boolean
  token: string
  showDialog?: boolean
  onRemove?: () => void
  onRemoveSuccess?: () => void
  onRemoveFailed?: () => void
  onAdded?: () => void
  tokenSymbol: string
  triggerClassName?: string
  isFlow?: boolean
  alias?: string
  onChangeCollect?: (isCollect: boolean) => void
}) => {
  const {
    token,
    defaultCollect = false,
    onRemove,
    onRemoveSuccess,
    onRemoveFailed,
    showDialog = false,
    onAdded,
    tokenSymbol,
    triggerClassName,
    isFlow = false,
    alias,
    onChangeCollect,
  } = props

  const activeChainType = useActiveChainType()
  const [open, setOpen] = useState(false)
  const [isCollect, setCollect] = useState<boolean>(defaultCollect)
  const { t } = useTranslation()

  const client = useQueryClient()
  const activeWallet = useActiveWallet()

  const [addToFavoritesMutation] = useMutation(
    isFlow ? followWallet : addTokenToFavorite,
    isFlow
      ? {
          client: futureClient,
        }
      : {
          client: futureClient,
        },
  )
  const [removeFromFavoritesMutation] = useMutation(
    isFlow ? unFollowWallet : removeTokenFromFavorite,
    isFlow
      ? {
          client: futureClient,
        }
      : {
          client: futureClient,
        },
  )
  const { handleSignMessage } = useSignWallet({ isAutoConnect: false })

  const addToFavorites = async () => {
    setCollect(true)
    addToFavoritesMutation({
      variables: isFlow
        ? {
            input: {
              chain: activeChainType,
              walletAddress: token,
            },
          }
        : { token: token, chain: activeChainType },
    })
      .then(() => {
        toast.success(isFlow ? t('walletDetail.msg.flow') : t('toast.addFavoriteSuccess'))
        // Make sure storage returns an object
        const stored =
          loadFirstPageFromStorage<Record<string, { address: string; alias: string }>>(CACHE_KEY.WALLET_FAVORITE) || {}
        const listFollowing: Record<string, { address: string; alias: string }> = { ...stored }

        // Validate token & build item
        if (!token) {
          throw new Error('Missing token address')
        }
        const newItemFollowed: FollowingWalletInfo = { address: token, alias: alias || '' }
        listFollowing[token] = newItemFollowed

        // Update React Query cache safely
        const walletAddr = activeWallet?.walletAddress
        if (isFlow && walletAddr) {
          client.setQueriesData(
            { predicate: (query) => query.queryKey[0] === 'totalFollowings' },
            (data?: FollowingWalletInfo[]) => {
              const safeData = Array.isArray(data) ? data : []
              const exists = safeData.some((item) => item?.address === newItemFollowed.address)
              if (!exists) {
                const selectedItems = getFromLocalStorageWithTTL<string[]>(CACHED_FOLLOWING_LIST) ?? []
                saveToLocalStorageWithTTL<string[]>(
                  CACHED_FOLLOWING_LIST,
                  [...selectedItems, newItemFollowed?.address, newItemFollowed?.alias],
                  TTL_STORAGE,
                )
                return [newItemFollowed, ...safeData]
              }

              return safeData
            },
            // Mark fresh until 90s later
            { updatedAt: Date.now() + 90000 },
          )
        }
        // Persist to storage
        // saveFirstPageToStorage<Record<string, { address: string; alias: string }>>('wallet-favorite', listFollowing);

        // Callback
        onAdded?.()
      })
      .catch((r) => {
        setCollect(false)
        if (isArray(r) && r.length > 0 && r[0].code === 'Following_LimitExceeded') {
          toast.warning(t('toast.addFavoriteFailed2'))
        } else {
          toast.warning(t('toast.addFavoriteFailed'))
        }
      })
      .finally(() => {
        if (isFlow) return
        eventBus.dispatch(EVENT_MESSAGE_FAVORITE, {
          data: {
            token: token,
            isFavorite: true,
          },
        })
      })
  }

  const removeFromFavorites = () => {
    setCollect(false)
    setOpen(false)
    onRemove?.()
    removeFromFavoritesMutation({
      variables: isFlow
        ? {
            input: {
              chain: activeChainType,
              walletAddress: token,
            },
          }
        : { token, chain: activeChainType },
    })
      .then(() => {
        toast.success(isFlow ? t('walletDetail.msg.unflow') : t('toast.removeFavoriteSuccess'))
        // Ensure storage is an object
        const stored =
          loadFirstPageFromStorage<Record<string, { address: string; alias: string }>>('wallet-favorite') || {}

        if (token && stored[token]) {
          // Remove from storage and persist
          delete stored[token]
          // saveFirstPageToStorage<Record<string, { address: string; alias: string }>>('wallet-favorite', stored);
        }

        // Update React Query cache safely (mirror addToFavorites)
        const walletAddr = activeWallet?.walletAddress
        if (isFlow && walletAddr) {
          client.setQueriesData(
            { predicate: (query) => query.queryKey[0] === 'totalFollowings' },
            (data?: FollowingWalletInfo[]) => {
              const safeData = Array.isArray(data) ? data : []
              if (!token) return safeData
              const selectedItems = getFromLocalStorageWithTTL<string[]>(CACHED_FOLLOWING_LIST) ?? []
              saveToLocalStorageWithTTL<string[]>(
                CACHED_FOLLOWING_LIST,
                selectedItems.filter((item) => item !== token),
                TTL_STORAGE,
              )
              return safeData.filter((item) => item?.address !== token)
            },
            { updatedAt: Date.now() + 90000 },
          )
        }

        onRemoveSuccess?.()
      })
      .catch((err) => {
        console.error('remove favorite: failed', err)
        toast.warning(t('toast.removeFavoriteFailed'))
        // revert optimistic UI
        setCollect(true)
        onRemoveFailed?.()
      })
      .finally(() => {
        if (isFlow) return
        eventBus.dispatch(EVENT_MESSAGE_FAVORITE, {
          data: {
            token: token,
            isFavorite: false,
          },
        })
      })
  }

  const performAddOrRemove = () => {
    onChangeCollect?.(!isCollect)
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
    event.preventDefault()

    if (!ServiceConfig.token) {
      handleSignMessage().then(() => {
        setTimeout(() => {
          if (ServiceConfig.token) {
            // sign successfully, perform add/remove action
            performAddOrRemove()
          } else {
            toast.warning(isFlow ? t('walletCopy.warning.login') : t('appSettings.loginRequired'), {})
          }
        }, 500)
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
  }, [ServiceConfig.token])

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
      <div className={cn('pb-2 pt-3 pr-0 cursor-pointer', triggerClassName)}>
        <img
          onClick={handleCollectChange}
          className={cn(
            'transition-all duration-100 hover:scale-[1.2] w-[18px] h-[18px]',
            isCollect ? 'opacity-100' : 'opacity-50',
          )}
          src={isCollect ? '/images/icons/vector-star-icon-active.svg?v=2' : '/images/icons/star-icon.svg'}
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

const CardHead: React.FC<CardWrapperProps> = ({ children }) => {
  return (
    <div className="px-2 py-[calc(1rem*(10/16))] rounded-tl-[6px] rounded-tr-[6px]">
      <div className="flex items-center justify-between">{children}</div>
    </div>
  )
}

const classNames4Cols = ['sm:col-span-3', 'sm:col-span-3', 'sm:col-span-2', 'sm:col-span-2 sm:text-end']
const classNames3Cols = [
  'flex-5 flex items-center sm:col-span-4',
  'flex-4 flex items-center sm:col-span-4',
  'flex-3 flex items-center text-right sm:col-span-2',
]

const CardBottom = ({
  tradeDetails,
  cols = 4,
  className = '',
  classNameItem = '',
  classNameItems = [],
}: CurrencyListCardProps) => {
  const classNames = cols === 3 ? classNames3Cols : classNames4Cols
  return (
    <div
      className={cn(
        'px-2 pt-0.5 pb-1.5 flex justify-between sm:grid sm:grid-cols-10 rounded-bl-[6px] rounded-br-[6px]',
        className,
      )}
    >
      {tradeDetails.map((item, index) => (
        <div
          key={index}
          className={cn(
            'text-[11px] leading-[calc(1rem*(11/16))]',
            classNames[index],
            classNameItems[index],
            classNameItem,
          )}
        >
          <span className="text-white/50 mr-1">{item.label}</span>
          <span className="text-white whitespace-nowrap">{isNumber(item.value) ? f(item.value) : item.value}</span>
        </div>
      ))}
    </div>
  )
}

interface CardWrapperProps {
  children: ReactNode
  address?: string
  chainId?: ChainIds
  disabled?: boolean
  onClick?: () => void
  className?: string
}

const CardWrapper: React.FC<CardWrapperProps> = (props) => {
  const { children, address, disabled = false, chainId = ChainIds.Solana, onClick, className } = props
  const navigate = useNavigate()

  const handleCardClick = () => {
    if (onClick) {
      onClick?.()
      return
    }
    if (disabled || !address) return
    navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address, chain: CHAIN_SYMBOLS[chainId] }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className={cn('relative', disabled ? 'cursor-not-allowed' : 'cursor-pointer', className)}
      onClick={handleCardClick}
    >
      {children}
      {disabled && <div className="absolute inset-0 bg-[#141414B3]" />}
    </div>
  )
}

export { CardBottom, CardHead, CardWrapper, ConfirmCollectModal }
