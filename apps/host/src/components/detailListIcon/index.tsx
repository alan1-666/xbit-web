import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'
import eventBus from '@/lib/eventBus'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import { favoriteEvents } from '@/utils/favoriteEvents'
// import { formatPercentage } from '@/utils/helpers.ts'
import { ttlStorage } from '@/utils/meme/ttlStorage'
import { useMutation } from '@apollo/client'
// import { formatPriceAsTitle } from '@components/TokenPageTitle/index.tsx'
// import { useTokenPriceInfo } from '@hooks/useTokenPrice.ts'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import { addTokenToFavorite, removeTokenFromFavorite } from '@services/tokens.service.ts'
import { useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import ShareBottom from './ShareBottomSheet'
import { isEqual } from 'lodash-es'
import { useActiveChainType } from '@hooks/useActiveChain.ts'
import { TokenMarketStats } from '@/types/token.ts'
import { useTokenStatisticSubscription } from '@hooks/meme/useTokenStatisticSubscription.ts'

const FAVORITE_TTL_MS = 30000 // 30 seconds
export const EVENT_MESSAGE_FAVORITE = 'EVENT_MESSAGE_FAVORITE'
export const EVENT_MESSAGE_REMOVE_FAVORITE = 'EVENT_MESSAGE_REMOVE_FAVORITE'

type DetailListIconProps = {
  tokenData: TokenDetail
  currentNavTab: string
}

const DetailListIcon = memo(
  ({ tokenData, currentNavTab }: DetailListIconProps) => {
    const { t } = useTranslation()
    const location = useLocation()
    const queryClient = useQueryClient()
    const useQuery = () => new URLSearchParams(location.search)
    const query = useQuery()
    const activeChainType = useActiveChainType()
    const page = query.get('page') || 'trading'
    const [isFavorite, setIsFavorite] = useState<boolean>(false)
    const FAVORITE_CACHE_KEY = useMemo(() => `favorite_token_${tokenData?.address}`, [tokenData?.address])

    useEffect(() => {
      ttlStorage.get<boolean>(FAVORITE_CACHE_KEY).then((cachedFavorite) => {
        if (cachedFavorite !== null) {
          setIsFavorite(cachedFavorite)
        } else {
          setIsFavorite(tokenData?.isFavorite || false)
        }
      })

      // Listen for favorite change events
      const handleFavoriteChange = (tokenAddress: string, isFavorite: boolean) => {
        if (tokenAddress === tokenData?.address) {
          setIsFavorite(isFavorite)
        }
      }

      favoriteEvents.addListener(handleFavoriteChange)

      return () => {
        favoriteEvents.removeListener(handleFavoriteChange)
      }
    }, [tokenData, FAVORITE_CACHE_KEY])

    const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)

    const tokenStatistic = useTokenStatisticSubscription({
      token: tokenData?.address || '',
      keys: [
        'marketcap',
        'liquidity',
        'athPrice',
        'atlPrice',
        'turnoverRate24h',
        'numberOfHolder',
        'createdTime',
        'price24hChange',
        'top10Holders',
        'price5mChange',
        'price1hChange',
        'price6hChange',
        'price24hChange',
        'volume5m',
        'volume1h',
        'volume6h',
        'volume24h',
        'totalTransactions',
        'totalAmount',
        'numberUniqueAddresses',
      ],
    })

    const [addToFavoritesMutation] = useMutation(addTokenToFavorite, { client: futureClient })
    const [removeFromFavoritesMutation] = useMutation(removeTokenFromFavorite, { client: futureClient })
    const [openShareBottomSheet, setOpenShareBottomSheet] = useState(false)

    const isXStock = useIsXStockPath()

    const performAddFavorites = useCallback(() => {
      setIsFavorite(true)
      addToFavoritesMutation({ variables: { token: tokenData?.address, chain: activeChainType } })
        .then(async (e) => {
          if (!e.data.addToFavorite) {
            setIsFavorite(false)
            toast.warning(t('toast.addFavoriteFailed'))
            return
          }
          toast.success(t('toast.addFavoriteSuccess'))
          await ttlStorage.set(FAVORITE_CACHE_KEY, true, FAVORITE_TTL_MS)
          if (tokenData?.address) {
            favoriteEvents.emitFavoriteChange(tokenData?.address, true)
          }
        })
        .catch((e) => {
          setIsFavorite(false)
          if (e[0]?.code === 'Following_LimitExceeded') {
            toast.warning(t('toast.addFavoriteFailed2'))
          } else {
            toast.warning(t('toast.addFavoriteFailed'))
          }
        })
        .finally(() => {
          if (isXStock) {
            console.log('invalidate xstock-watchlist')
            queryClient.refetchQueries({ queryKey: ['xstock-watchlist'], refetchType: 'all' })
          }
        })
    }, [addToFavoritesMutation, tokenData?.address, t, FAVORITE_CACHE_KEY, isXStock, queryClient])

    const performRemoveFavorites = useCallback(() => {
      setIsFavorite(false)
      toast.success(t('toast.removeFavoriteSuccess'))
      removeFromFavoritesMutation({ variables: { token: tokenData?.address, chain: activeChainType } })
        .then(async (e) => {
          if (!e.data.removeTokenFavorite) {
            setIsFavorite(true)
            return
          }
          await ttlStorage.set(FAVORITE_CACHE_KEY, false, FAVORITE_TTL_MS)
          if (tokenData?.address) {
            favoriteEvents.emitFavoriteChange(tokenData?.address, false)
          }
        })
        .catch(() => {
          setIsFavorite(true)
          toast.warning(t('toast.removeFavoriteFailed'))
        })
        .finally(() => {
          if (isXStock) {
            queryClient.refetchQueries({ queryKey: ['xstock-watchlist'], refetchType: 'all' })
          }
        })
    }, [removeFromFavoritesMutation, tokenData?.address, t, FAVORITE_CACHE_KEY, isXStock, queryClient])

    useEffect(() => {
      if (tokenData) {
        eventBus.on(EVENT_MESSAGE_FAVORITE, (data: any) => {
          if (data?.data?.token === tokenData?.address) {
            setIsFavorite(data?.data?.isFavorite)
          }
        })
        return () => {
          eventBus.remove(EVENT_MESSAGE_FAVORITE)
        }
      }
    }, [tokenData])

    const addToFavorites = useCallback(() => {
      if (!ServiceConfig.token) {
        toast.warning(t('listCoin.requireLoginToFavorite'))
        return
      }
      performAddFavorites()
    }, [t, performAddFavorites])

    const removeFromFavorites = useCallback(() => {
      if (!ServiceConfig.token) {
        toast.warning(t('listCoin.requireLoginToFavorite'))
        return
      }
      performRemoveFavorites()
    }, [t, performRemoveFavorites])

    const handleFavoriteClick = useCallback(() => {
      if (isFavorite) {
        removeFromFavorites()
      } else {
        addToFavorites()
      }
    }, [isFavorite, removeFromFavorites, addToFavorites])

    const handleShareClick = useCallback(() => {
      setOpenShareBottomSheet(true)
    }, [])

    const shareTitle = useMemo(() => {
      // const price = ohlcPrice ? ohlcPrice?.toString() : tokenData?.price ? tokenData?.price.toString() : undefined
      // return `${tokenData?.symbol} ${formatPercentage(tokenData?.price24hChange)} in 24h, price ${formatPriceAsTitle(price)} \nPower by Xbit! \n#${tokenData?.symbol} #XBIT`
      return t('shareBottomSheet.memeContent', { coin: tokenData?.symbol })
    }, [tokenData, ohlcPrice])

    const favoriteIconSrc = useMemo(
      () => (isFavorite ? '/images/icons/vector-star-icon-active.svg?v=2' : '/images/icons/star-icon.svg'),
      [isFavorite],
    )

    return (
      <div className="flex items-center gap-3.75 pr-2.5">
        <img
          className="transition-all duration-100 hover:scale-[1.1] cursor-not-allowed opacity-50"
          src="/images/detailHeader/ic-notification-plus.svg"
          alt="noti-icon"
        />
        <img
          onClick={handleFavoriteClick}
          className="cursor-pointer transition-all duration-100 hover:scale-[1.1]"
          src={favoriteIconSrc}
          alt="start-icon"
        />
        <img
          className="transition-all duration-100 hover:scale-[1.1] cursor-pointer"
          src="/images/icons/share.svg"
          alt="share-icon"
          onClick={handleShareClick}
        />
        <ShareBottom
          openShareBottomSheet={openShareBottomSheet}
          page={page}
          setOpenShareBottomSheet={setOpenShareBottomSheet}
          shareTitle={shareTitle}
          tokenData={tokenData}
          tokenStatistic={tokenStatistic as TokenMarketStats}
          tab={currentNavTab}
        />
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      isEqual(prevProps.tokenData, nextProps.tokenData) && isEqual(prevProps.currentNavTab, nextProps.currentNavTab)
    )
  },
)

DetailListIcon.displayName = 'DetailListIcon'

export default DetailListIcon
