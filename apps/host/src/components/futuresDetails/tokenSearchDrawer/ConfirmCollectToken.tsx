import useSignWallet from '@/hooks/useSignWallet'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config'
import { cn } from '@/lib/utils'
import { ISymbolList, setFavorites, setIsEmptyFavorites, SymbolListState } from '@/redux/modules/symbolList.slide'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { UPSERT_FAVORITE_SYMBOL } from '@/services/symbol.dex.service'
import { saveSymbolListSnapshot } from '@/utils/indexedDB/symbolListDB'
import { useMutation } from '@apollo/client'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from './CustomToast'

const ConfirmCollectToken = (props: {
  defaultCollect: boolean
  token: string
  showDialog?: boolean
  onRemove?: () => void
  onRemoveSuccess?: () => void
  onRemoveFailed?: () => void
  onAdded?: () => void
  tokenSymbol: string
  triggerClassName?: string
  tokenInfor: ISymbolList
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
    tokenInfor,
  } = props

  const { favorites } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [isCollect, setCollect] = useState<boolean>(defaultCollect)
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [handleCollectToken] = useMutation(UPSERT_FAVORITE_SYMBOL, {
    client: symbolDexClient,
  })
  const { handleSignMessage } = useSignWallet({ isAutoConnect: false })

  const addToFavorites = () => {
    setIsLoading(true)
    setCollect(true)
    handleCollectToken({ variables: { input: { symbol: [token], isFavorite: true } } })
      .then(() => {
        // 新收藏的放在最前面
        handleUpdateCache([tokenInfor, ...favorites])
        showToast({
          type: 'success',
          title: t('toast.addFavoriteSuccess'),
          duration: 1500,
        })

        onAdded?.()
      })
      .catch((e) => {
        setCollect(false)
        if (e[0]?.code === 'Following_LimitExceeded') {
          showToast({
            type: 'error',
            title: t('toast.addFavoriteFailed2'),
          })
        } else {
          showToast({
            type: 'error',
            title: t('toast.addFavoriteFailed'),
          })
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleUpdateCache = async (arr: ISymbolList[]) => {
    await saveSymbolListSnapshot('favorite', {
      list: arr || [],
      lastUpdated: Date.now(),
      condition: 'favorite',
    })

    dispatch(setFavorites(arr))
    dispatch(setIsEmptyFavorites(arr.length === 0))
  }

  const removeFromFavorites = () => {
    setIsLoading(true)
    setCollect(false)
    setOpen(false)
    onRemove?.()
    handleCollectToken({ variables: { input: { symbol: [token], isFavorite: false } } })
      .then(() => {
        handleUpdateCache(favorites.filter((e) => e.symbol !== token))
        showToast({
          type: 'success',
          title: t('toast.removeFavoriteSuccess'),
        })
        onRemoveSuccess?.()
      })
      .catch(() => {
        showToast({
          type: 'error',
          title: t('toast.removeFavoriteFailed'),
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
      handleSignMessage().then(() => {
        setTimeout(() => {
          if (ServiceConfig.token) {
            // sign successfully, perform add/remove action
            performAddOrRemove()
          } else {
            showToast({
              type: 'info',
              title: t('appSettings.loginRequired'),
            })
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
  }, [ServiceConfig.token, defaultCollect])

  // Preload images to prevent flickering
  useEffect(() => {
    const activeImg = new Image()
    const inactiveImg = new Image()
    activeImg.src = '/images/icons/vector-star-icon-active.svg?v=2'
    inactiveImg.src = '/images/icons/star-icon.svg'
  }, [])

  return (
    <>
      <div className={cn('p-2 pr-0 cursor-pointer w-[20px]', triggerClassName)}>
        {/* {isLoading ? (
          <div className="flex items-center justify-center">
            <IconSpinner className="size-4.5 animate-spin" />
          </div>
        ) : ( */}
        <img
          onClick={handleCollectChange}
          className="transition-transform duration-100 hover:scale-[1.2]"
          src={isCollect ? '/images/icons/vector-star-icon-active.svg?v=2' : '/images/icons/star-InSearch-icon.svg'}
          alt=""
        />
        {/* )} */}
      </div>
    </>
  )
}

export default memo(ConfirmCollectToken, (prevProps, nextProps) => {
  return prevProps.token === nextProps.token && prevProps.defaultCollect === nextProps.defaultCollect
})
