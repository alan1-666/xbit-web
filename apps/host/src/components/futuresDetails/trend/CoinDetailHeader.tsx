import { getPredictedFundings } from '@/api/hyperliquid'
import { Tooltip } from '@/components/discover/Tooltip'
import { TokenSearchDrawer, TokenSearchDrawerType } from '@/components/futuresDetails/tokenSelect'
import FeeCountdown from '@/components/futuresDetails/trade/FeeCountdown'
import { Configs } from '@/const/configs'
import { useActiveAssetCtx } from '@/hooks/hyperliquid/useActiveAssetCtx'
import { useCandleOneDay } from '@/hooks/hyperliquid/useCandleOneDay'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config'
import { fShortenNumber } from '@/lib/number'
import { cn, showRate } from '@/lib/utils'
import { selectCachedCandleData } from '@/redux/modules/candleCacheSlice.slice'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { setFavorites, setFavoritesHasCache, SymbolListState } from '@/redux/modules/symbolList.slide'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { GET_FAVORITE_SYMBOLS, UPSERT_FAVORITE_SYMBOL } from '@/services/symbol.dex.service'
import { PredictedFunding } from '@/types/hyperliquid.ts'
import { formatMoney, formatPriceBySymbol, formatPriceBySymbolWithCommas } from '@/utils/helpers'
import { saveSymbolListSnapshot } from '@/utils/indexedDB/symbolListDB'
import DetailHeaderButton from '@components/detailHeader/DetailHeaderButton.tsx'
import { ISymbolList } from '@components/futuresDiscover/list-coin-crypto'
import { Skeleton } from '@components/ui/skeleton'
import BigNumber from 'bignumber.js'
import { memo, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ImgWithFallback from '../../common/ImgWithFallback'
import MoneyFormatted from '@/components/common/MoneyFormatted'
import { selectAllPerpMeta } from '@/redux/modules/futuresMeta.slice'



// import { Tooltip } from '@/components/discover/Tooltip'

const CoinDetailHeader = memo(() => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { baseCoin, quoteCoin } = useAppSelector(symbolInfoSelector)
  const allMeta = useAppSelector(selectAllPerpMeta)

  // TODO allSymbol 逻辑在这个组件内部没啥用，但点切换弹窗可能用到，后面看在哪里获取吧
  const {
    favorites,
    lists: { volume: allSymbol = [] },
  } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)
  // 确保本组件也会拉取 openInterest 数据（与 position-list 一致）
  /* const { setIsLoadingSymbol, loadSymbolListFromCache, handleGetSymbolList } = useHandleGetData({
    condition: 'openInterest',
    skip: openInterest?.length !== 0,
  }) */

  const [nextFunding, setNextFunding] = useState<PredictedFunding>({
    fundingRate: '',
    nextFundingTime: 0,
  })

  const pairLogo = useMemo(() => {
    if (allMeta.length && baseCoin) {
      const pair = allMeta.find(item => item.name.toLowerCase() === baseCoin.toLowerCase())
      if (pair?.name) {
        const name = pair.name
        // 如果首字母是小写 'k'，去掉它
        return name.startsWith('k') ? name.slice(1) : name
      }
    }
    return ''
  }, [allMeta, baseCoin])
  

  const fetchNextPredictedFunding = useCallback(async () => {
    
    try {
      const data = await getPredictedFundings()

      if (data?.length) {
        const item = data.find((item: any) => {
          return item[0] === baseCoin
        })
        const hourTs = 60 * 60 * 1000
        const fundingTimeItem = item?.[1]?.find((item: any) => {
          return item[0] === 'HlPerp'
        })
        if (fundingTimeItem) {
          setNextFunding({
            ...fundingTimeItem[1],
            nextFundingTime: fundingTimeItem[1].nextFundingTime + hourTs,
          })
        }
      }
    } catch (err: any) {}
  }, [baseCoin])

  const handleRefreshFundingTime = useCallback(() => {
    const hourTs = 60 * 60 * 1000
    setNextFunding((prev) => ({
      ...prev,
      nextFundingTime: prev.nextFundingTime + hourTs,
    }))
  }, [])

  useEffect(() => {
    if (baseCoin) {
      fetchNextPredictedFunding()
    }
  }, [baseCoin, fetchNextPredictedFunding])
  

  const {
    markPrice,
    price: indexPrice,
    change,
    prevDayPrice,
    dayNtlVlm,
    dayBaseVlm,
    coinOpenInterest,
    funding,
    openInterest,
  } = useActiveAssetCtx(baseCoin)
  const [listFavorite, setListFavorite] = useState<ISymbolList[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  const handleUpsertFavorite = async (symbol: string[], isFavorite: boolean) => {
    try {
      const { data } = await symbolDexClient.mutate({
        mutation: UPSERT_FAVORITE_SYMBOL,
        variables: {
          input: {
            symbol,
            isFavorite,
          },
        },
      })
      if (data?.error) {
        toast.error(t('common.error'))
        return
      }
      if (isFavorite) {
        setIsFavorite(true)
        toast.success(t('toast.addFavoriteSuccess'))
        const ifind = allSymbol.find((e) => e.symbol === symbol[0])

        if (ifind) {
          // 新收藏的放在最前面
          const newListFavorite = [
            {
              ...ifind,
            },
            ...listFavorite,
          ]
          handleUpdateCache(newListFavorite)
        }
      } else {
        toast.success(t('toast.removeFavoriteSuccess'))
        setIsFavorite(false)
        handleUpdateCache(listFavorite.filter((e) => e.symbol !== symbol[0]))
      }
    } catch (err: any) {
      toast.error(t(err[0].message))
      return { success: false, error: 'Network error occurred' }
    }
  }

  const handleCollectChange = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (!ServiceConfig.token) {
      toast.error(t('appSettings.loginRequired'))
    } else {
      if (!baseCoin) return
      handleUpsertFavorite([baseCoin], !isFavorite)
    }
  }

  const handleOpenTokenDrawer = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsTokenDrawerOpen(prev => !prev)
  }

  const handleUpdateCache = async (arr: ISymbolList[]) => {
    dispatch(setFavorites(arr))
    dispatch(setFavoritesHasCache(true))
    setListFavorite(arr)
    await saveSymbolListSnapshot('favorite', {
      list: arr || [],
      lastUpdated: Date.now(),
      condition: 'favorite',
    })
  }

  const getFavoriteSymbols = async () => {
    try {
      const { data, loading } = await symbolDexClient.query({
        query: GET_FAVORITE_SYMBOLS,
      })
      setIsLoading(loading)
      setListFavorite(data?.getFavoriteSymbols?.list || [])
      if (data?.getFavoriteSymbols?.list?.find((item: any) => item?.symbol === baseCoin)) {
        setIsFavorite(true)
      } else {
        setIsFavorite(false)
      }
    } catch (error) {
      console.error('Error fetching favorite symbols:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (ServiceConfig.token) {
      getFavoriteSymbols()
    } else {
      setIsLoading(false)
    }
  }, [ServiceConfig.token, baseCoin])

  /*   // 初始化拉取 openInterest（优先缓存，没有则网络请求）
  useEffect(() => {
    const initOpenInterest = async () => {
      try {
        if (openInterest.length !== 0) {
          setIsLoadingSymbol(false)
          return
        }
        const cacheLoaded = await loadSymbolListFromCache('openInterest')
        if (!cacheLoaded?.length) {
          await handleGetSymbolList()
        } else {
          dispatch(setData({ condition: 'openInterest', data: cacheLoaded as any }))
          setIsLoadingSymbol(false)
        }
      } catch (e) {
        // 静默失败，控制台输出即可
        console.warn('initOpenInterest error', e)
      }
    }
    void initOpenInterest()
  }, []) */

  useEffect(() => {
    setIsFavorite(!!favorites?.find((item: any) => item?.symbol === baseCoin))
  }, [favorites, baseCoin])

  const cachedCandleData = useAppSelector((state) => {
    if (!baseCoin) return null
    return selectCachedCandleData(baseCoin)(state)
  })

  const { ticker } = useCandleOneDay(baseCoin)
  const candleData = ticker || cachedCandleData

  const isPositive = useMemo(() => {
    if (!change) return true
    return parseFloat(change) >= 0
  }, [change])

  const changeVal = useMemo(() => {
    if (!markPrice || !prevDayPrice) return '--'
    const value = new BigNumber(markPrice).minus(prevDayPrice).toNumber()
    const formattedValue = formatPriceBySymbol(`${value}`, baseCoin)
    if (value > 0) {
      return `+${formattedValue}`
    }
    return formattedValue
  }, [markPrice, prevDayPrice, baseCoin])

  // 使用统一的带千分位格式化（保留正负号）
  const changeValWithComma = useMemo(() => {
    if (!changeVal || changeVal === '--') return changeVal
    return formatPriceBySymbolWithCommas(changeVal, baseCoin)
  }, [changeVal, baseCoin])

  /*  // 计算当前币种的持仓额
  const currentSymbolOpenInterest = useMemo(() => {
    if (!baseCoin || !openInterest.length) return '--'

    const symbolData = openInterest.find(item => item.symbol === baseCoin)
    if (!symbolData) return '--'
    // 直接从symbolData中获取openInterest和currentPrice
    const openInterestValue = Number(symbolData.openInterest || 0)
    const price = Number(symbolData.currentPrice || 0)

    if (!openInterestValue || !price) return '--'

    const usdValue = openInterestValue * price

    return usdValue ? formatNumberWithCommas(`${usdValue}`, 2) : '--'
  }, [baseCoin, openInterest]) */

  const formattedValues = useMemo(() => {
    if (!candleData) {
      return {
        currentPrice: '--',
        markPriceValue: '--',
        indexPriceValue: '--',
        highPrice: '--',
        lowPrice: '--',
        volumeBase: '--',
        volumeQuote: '--',
        tradeCount: '--',
        coinOpenInterest: '--',
        dayBaseVlm: '--',
        coinOpenInterestfShortenNumber: '--',
        openInterest: '--',
      }
    }

    return {
      currentPrice: formatPriceBySymbolWithCommas(candleData.c, baseCoin),
      markPriceValue: formatPriceBySymbolWithCommas(`${markPrice || ''}`, baseCoin),
      indexPriceValue: formatPriceBySymbolWithCommas(`${indexPrice || ''}`, baseCoin),
      highPrice: formatPriceBySymbolWithCommas(`${candleData?.h}`, baseCoin),
      lowPrice: formatPriceBySymbolWithCommas(`${candleData.l}`, baseCoin),
      volumeBase: formatPriceBySymbolWithCommas(dayNtlVlm, baseCoin,2),
      volumeQuote: formatPriceBySymbolWithCommas(dayNtlVlm * indexPrice, baseCoin, 2),
      coinOpenInterest: formatPriceBySymbolWithCommas(coinOpenInterest, baseCoin,2),
      coinOpenInterestfShortenNumber: fShortenNumber(coinOpenInterest),
      dayBaseVlm: formatPriceBySymbolWithCommas(dayBaseVlm, baseCoin),
      openInterest: formatPriceBySymbolWithCommas(openInterest, baseCoin,2),
    }
  }, [candleData, baseCoin, markPrice, indexPrice])

  const RenderTextItem = ({
    label,
    value,
    isRase,
    isSpecial,
    className,
    valueCountDown,
  }: {
    value: string
    label: string
    isSpecial?: boolean
    valueCountDown?: string | React.ReactNode
    isRase?: boolean
    className?: string
  }) => {
    return (
      <div className={cn('text-left', className)}>
        {isSpecial ? (
          <div className="text-white whitespace-nowrap text-[14px] font-[380] items-start">
            <span className={`${isRase ? 'text-desktop-rise' : 'text-desktop-fall'}`}>{value}%</span>
            <span className="mx-1">/</span>
            <span className="">{valueCountDown}</span>
          </div>
        ) : (
          <div className="text-white whitespace-nowrap text-[14px] font-[380]">{value}</div>
        )}
        <div className="flex items-center text-[#908E98] whitespace-nowrap text-[11px] font-[330]">{label}</div>
      </div>
    )
  }

  const formattedFundingRate = useMemo(() => {
    if (!nextFunding?.fundingRate) return '--'
    const rate = funding || Number(nextFunding.fundingRate)
    return rate >= 0 ? `+${(rate * 100).toFixed(4)}` : (rate * 100).toFixed(4)
  }, [nextFunding, funding])

  if (!baseCoin) return null

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (e && e.currentTarget) {
      e.currentTarget.src = '/images/xbit-logo-rounded.webp'
      e.currentTarget.onerror = null
    }
  }
  return (
    <>
      <div className="flex items-center px-2 h-full w-full">
        {/* Left section - Coin info and price */}
        <div className="flex items-center justify-between">
          {/* Coin symbol and icon */}
          <div className="flex items-center space-x-2 cursor-pointer" ref={anchorRef}  onClick={handleOpenTokenDrawer}>
            {
              (allMeta.length && baseCoin) ? <img
              src={`${Configs.getHyperliquidConfig().imgUrl}/${pairLogo}.svg` || '/images/xbit-logo-rounded.webp'}
              className="size-8 bg-[#fff] rounded-full"
              onError={handleImgError}
              alt="pair-logo"
            /> : <div className="size-8  rounded-full"></div>
            }
            {/* <ImgWithFallback
              src={`${Configs.getHyperliquidConfig().imgUrl}/${baseCoin}.svg`}
              srcFallback="/images/xbit-logo-rounded.webp"
              sharedClassName="size-8 rounded-full"
              loadedClassName="bg-[#fff] rounded-full"
            /> */}
            <div className="flex items-center space-x-1 relative">
              <div className="text-white text-base">
                <span className="font-semibold">{baseCoin}</span>
                <span className=" opacity-50">/</span>
                <span className="opacity-50 text-sm">{quoteCoin}</span>
              </div>
              <div className="text-white opacity-80 bg-[#00FFB41A] px-2 py-[2px] rounded text-xs whitespace-nowrap">
                {t('futuresDetails.common.perp')}
              </div>
              <button
                className="hover:opacity-80 transition-opacity cursor-pointer w-4 h-4"
              >
                <img
                  src="/images/futuresDetail/order-arrow-down.svg"
                  alt="order-arrow-down"
                  className={`block transition-transform duration-200 ${isTokenDrawerOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {!isLoading ? (
              <DetailHeaderButton
                className="transition-all duration-100 hover:scale-[1.1] mx-2 mr-5"
                icon={isFavorite ? '/images/icons/vector-star-icon-active.svg' : '/images/detailHeader/icon-star.svg'}
                onClick={handleCollectChange}
              />
            ) : (
              <Skeleton className="size-5 mx-2 mr-5" />
            )}
          </div>
        </div>

        {/* Current price & Price change */}
        <div
          className={`font-[450] xl:px-2.5 2xl:px-5.5 mr-[20px] ${isPositive ? 'text-desktop-rise' : 'text-desktop-fall'} border-x border-[#26262C]`}
        >
          <div className="text-[20px]">{formattedValues.currentPrice}</div>
          <div className="text-xs font-[330]">
            {showRate(change) === '≈0.00%' ? '--' : `${changeValWithComma} (${showRate(change)})`}
          </div>
        </div>

        {/* Right section - Statistics */}
        <div className="xl:ml-2 2xl:ml-2 flex-1 flex justify-between text-xs max-w-[700px]">
          {/* mark price */}
          <RenderTextItem label={t('futuresDetails.common.markPrice')} value={formattedValues.markPriceValue} />

          {/* index price (oraclePx) */}
          <RenderTextItem label={t('futuresDetails.common.OraclePrice')} value={formattedValues.indexPriceValue} />

          {/* Funding Rate */}
          {
          nextFunding && 
          <div className={cn('text-left')}>
            <div className="text-white whitespace-nowrap text-[14px] font-[380] items-start">
              <span className={`${Number(nextFunding.fundingRate) > 0 ? 'text-desktop-rise' : 'text-desktop-fall'}`}>{formattedFundingRate}%</span>
              <span className="mx-1">/</span>
              <span className="">{<FeeCountdown targetTime={nextFunding?.nextFundingTime} onRefresh={handleRefreshFundingTime}/>}</span>
            </div>
            <Tooltip
                content={t('futuresDetails.tips.FundingRateDesc')}
              >
             <div className="flex items-center text-[#908E98] whitespace-nowrap text-[11px] font-[330] underline-offset-2 underline decoration-dashed">{`${t('futuresDetails.common.fundingRate')}/${t('futuresDetails.common.countdown')}`}</div>
            </Tooltip>
          </div>
        }
        

          {/* 24H Volume (Base) */}
          <div className={cn('text-left')}>
            <Tooltip
              showArrow
              contentClassName="bg-[#525252]"
              showArrowColor="#525252"
              children={
                <div className="text-white whitespace-nowrap text-[14px] font-[380] cursor-pointer">{`$${formattedValues.volumeBase}`}</div>
              }
              content={`${formattedValues.dayBaseVlm} ${baseCoin}`}
            />

            <div className="flex items-center text-[#908E98] whitespace-nowrap text-[11px] font-[330]">
              {t('futuresDetails.common.24hVolumeBase')}
            </div>
          </div>

          {/* 合约持仓量 */}
          {/* <div className="css-responsive">
        
            <RenderTextItem
              label={t('futuresDetails.common.futuresHold')}
              value={formattedValues.coinOpenInterestfShortenNumber}
            />
          </div> */}
          <div className="css-responsive-1">
            <Tooltip
              showArrow
              contentClassName="bg-[#525252]"
              showArrowColor="#525252"
              children={
                <div className="text-white whitespace-nowrap text-[14px] font-[380] cursor-pointer">{`$${formattedValues.coinOpenInterest}`}</div>
              }
              content={`${formattedValues.openInterest} ${baseCoin}`}
            />
              <div className="flex items-center text-[#908E98] whitespace-nowrap text-[11px] font-[330]">
              {t('futuresDetails.common.futuresHold')}
            </div>
            {/* <RenderTextItem label={t('futuresDetails.common.futuresHold')} value={formattedValues.coinOpenInterest} /> */}
          </div>
        </div>
      </div>
      <TokenSearchDrawer
        allowShowList
        open={isTokenDrawerOpen}
        setOpen={setIsTokenDrawerOpen}
        type={TokenSearchDrawerType.CRYPTO}
        isHidenFuturesTab
        anchorRef={anchorRef as RefObject<HTMLElement>}
      />
    </>
  )
})

CoinDetailHeader.displayName = 'CoinDetailHeader'

export default CoinDetailHeader
