import { symbolDexClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config'
import { GET_FAVORITE_SYMBOLS, UPSERT_FAVORITE_SYMBOL } from '@/services/symbol.dex.service'
import DetailHeaderButton from '@components/detailHeader/DetailHeaderButton.tsx'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Share from './share'
import { getUserAssetPortfolio, getUserAssestsHistory, getUserHistoryTradesByData } from '@/api/hyperliquid'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { saveSymbolListSnapshot } from '@/utils/indexedDB/symbolListDB'
import { ISymbolList } from '../futuresDiscover/list-coin-crypto'
import useHandleGetData from '@/pages/futures-market/hooks/useHandleGetData'
import { setFavorites, setFavoritesHasCache, SymbolListState } from '@/redux/modules/symbolList.slide'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { Skeleton } from '../ui/skeleton'
import MovingBgFilterTags, { MovingBgFilterTagsHandle } from '@components/common/MovingBgFilterTags.tsx'


interface HeaderButtonProps {
  token: string
  allSymbol: ISymbolList[]
  pageTab: PageTabStates
  onPageTabChange: (tab: PageTabStates) => void
}


export enum PageTabStates {
  Trend = 'trend',
  Trade = 'trade',
}


const tabStates: PageTabStates[] = [
  PageTabStates.Trend,
  PageTabStates.Trade,
]


const HeaderButton = ({ token, allSymbol, pageTab, onPageTabChange }: HeaderButtonProps) => {
  const { favorites } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)

  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { loadSymbolListFromCache } = useHandleGetData({
    condition: 'volume',
    skip: true,
  })
  const [listFavorite, setListFavorite] = useState<ISymbolList[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [info, setInfo] = useState<any>({})
  const walletDex = useSelector(_walletDex)
  const userAddress = walletDex?.walletAddress
  const { positions } = useWebData2()
  
  const tabRef = useRef<MovingBgFilterTagsHandle>(null)


  const handleTabChange = (tab: string) => {
      onPageTabChange(tab as PageTabStates)
    }
  
  const handleFormatTabLabel = (tab: string, activeTab: string) => {
    if (tab === PageTabStates.Trend && activeTab !== PageTabStates.Trend) {
      return <img src="/images/futuresDetail/details-trend-icon.svg"/>
    }

    if (tab === PageTabStates.Trend && activeTab == PageTabStates.Trend) {
      return <img src="/images/futuresDetail/details-trend-active-icon.svg"/>
    }

    if (tab === PageTabStates.Trade && activeTab !== PageTabStates.Trade) {
      return <img src="/images/futuresDetail/details-trade-icon.svg"/>
    }

    if (tab === PageTabStates.Trade && activeTab == PageTabStates.Trade) {
      return <img src="/images/futuresDetail/details-trade-active-icon.svg"/>
    }
    
  }

  const handleUpsertFavorite = async (symbol: string[], isFavorite: boolean) => {
    try {
      // const cachedData = await loadSymbolListFromCache(condition)
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
      handleUpsertFavorite([token], !isFavorite)
    }
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
      if (data?.getFavoriteSymbols?.list?.find((item: any) => item?.symbol === token)) {
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

  const handleGetCacheDataFavorite = async () => {
    try {
      if (favorites.length) {
        setIsFavorite(!!favorites?.find((item: any) => item?.symbol === token))
        setListFavorite(favorites)
        return
      }
      const cachedData = await loadSymbolListFromCache('favorite')
      if (cachedData && cachedData.length > 0) {
        setListFavorite(cachedData)
        setIsLoading(false)
        if (cachedData?.find((item: any) => item?.symbol === token)) {
          setIsFavorite(true)
        } else {
          setIsFavorite(false)
        }
      } else {
        getFavoriteSymbols()
      }
    } catch (error) {
      console.log(error, 'this is error')
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
  }, [ServiceConfig.token, token])

  useEffect(() => {
    setIsFavorite(!!favorites?.find((item: any) => item?.symbol === token))
  }, [favorites])

  const handleShare = async () => {
    try {
      if (!userAddress) {
        toast.error(t('appSettings.loginRequired'))
        return
      }
      // 30天时间戳
      const startTime = Date.now() - 30 * 24 * 60 * 60 * 1000
      const endTime = Date.now()
      const [portfolioData, historyData, tradeData] = await Promise.all([
        getUserAssetPortfolio(userAddress),
        getUserAssestsHistory(userAddress),
        getUserHistoryTradesByData(userAddress, startTime, endTime),
      ])
      const monthData = portfolioData?.[6]?.[1]?.pnlHistory || []
      const lastPnlEntry = monthData[monthData.length - 1] || [0, 0]
      const totalPnl = Number(lastPnlEntry[1]).toFixed(2)

      // 当前持仓盈亏
      const totalDeposit = historyData
        .filter((item: any) => item.delta?.type === 'deposit')
        .reduce((acc: number, item: any) => acc + Number(item.delta?.usdc || 0), 0)
        .toFixed(2)
      console.log(totalDeposit,totalPnl, 'totalDeposit')

      // 盈亏百分比 = 30天总盈亏 / 总入金 *100
      const pnlPercentage =
        totalDeposit && totalDeposit !== '0.00' ? ((Number(totalPnl) / Number(totalDeposit)) * 100).toFixed(2) : '0.00'

      // 计算未实现利润
      const unrealizedPnl = (positions || [])
        .reduce((acc: number, item: any) => acc + Number(item?.unrealizedPnl || 0), 0)
        .toFixed(2)

      // 总利润
      const totalProfit = (parseFloat(totalPnl) + parseFloat(unrealizedPnl)).toFixed(2)
      // 筛选30天交易开多数量，开空数量
      tradeData.filter((item: any) => {
        return item.dir === 'Open Long' || item.dir === 'Open Short'
      })
      console.log(tradeData.filter((item: any) => item.dir === 'Open Long'), 'tradeData') 
      const longCount = tradeData.filter((item: any) => item.dir === 'Open Long').length || 0
      const shortCount = tradeData.filter((item: any) => item.dir === 'Open Short').length || 0
      setInfo({
        coin: token,
        totalPnl,
        unrealizedPnl,
        totalProfit,
        pnlPercentage: pnlPercentage,
        userAddress,
        longCount,
        shortCount,
      })
      setOpen(true)
    } catch (error) {}
  }
  return (
    <div className="pr-[0px]">
      <div className="flex">
        {!isLoading ? (
          <DetailHeaderButton
            className="transition-all duration-100 hover:scale-[1.1] mr-3"
            icon={isFavorite ? '/images/icons/vector-star-icon-active.svg?v=2' : '/images/detailHeader/icon-star.svg'}
            onClick={handleCollectChange}
          />
        ) : (
          <Skeleton className="size-5 mr-3" />
        )}
        <MovingBgFilterTags
          ref={tabRef}
          tabs={tabStates}
          defaultTab={pageTab}
          activeTab={pageTab}
          onTabChange={handleTabChange}
          formatTabLabel={handleFormatTabLabel}
          containerId="meme-new-pairs"
          containerClassName="h-[28px]  border border-[#302E38] rounded-[6px]"
          tabsListClassName="w-[88px] bg-[#79778C29] h-[28px] p-[2px] flex items-center"
          tabsTriggerClassName="flex-1 h-[24px]"
          tabsTriggerInactiveClassName=""
          tabsTriggerActiveClassName="!bg-[#0A0A0A] "
          tabBgClassName="bg-transparent"
        />
    
      </div>
      {open && (
        <Share info={info} openShare={open} onclose={() => setOpen(false)} />
      )}
    </div>
  )
}
export default HeaderButton
