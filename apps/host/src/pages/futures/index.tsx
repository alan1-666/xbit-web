import { getPerpMetaAndAssetCtxs, getUserFee } from '@/api/hyperliquid'
import DetailHeaderButton from '@/components/futuresDetails/DetailHeaderButton'
import { ToastProvider } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'
import { generateL2BookTiers } from '@/components/futuresDetails/trade/tools'
import TopInfo from '@/components/futuresDetails/trade/TopInfo.tsx'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { resetSymbolInfo, setSymbolInfo, symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { setAllTiers, setUniverse, selectAllPerpMeta, setAllMarginTiers } from '@/redux/modules/futuresMeta.slice'
import { updateFuturesTradeConfig } from '@/redux/modules/futuresTradeConfigs.slice'
import {
  futuresTradePreferencesActions,
  selectFuturesTradePreferences,
} from '@/redux/modules/futuresTradePreferences.slice'
import {
  isAuthorizedSelector,
  orderButtonStatusSelector,
  agentWalletSelector,
  futuresUserInfoActions,
} from '@/redux/modules/futuresUserInfo.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { GET_SYMBOL_LIST, getUserSymbolPreference } from '@/services/symbol.dex.service'
import { UITab } from '@/types/uiTabs.ts'
import TradePage from '@/components/futuresDetails/trade'
import TrendPage from '@/components/futuresDetails/trend'
import { cn, MathFun } from '@/lib/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { useTranslation } from 'react-i18next'
import { futuresBrowsingHistoryActions } from '@/redux/modules/futuresBrowsingHistory.slice'
import { useResponsive } from '@/hooks/useResponsive'
import DesktopLayout from '@/components/futuresDetails/desktop/DesktopLayout'
import {
  CoinInfoHeader,
  DesktopChart,
  DesktopTradingPanel,
  DesktopOrderbook,
  DesktopAccountInfo,
} from '@/components/futuresDetails/desktop/DesktopComponents'
import TradingDashboard from '@/components/futuresDetails/components/TradingDashboard'
import { TradingDashboardProvider } from '@/components/futuresDetails/components/TradingDashboard/context/TradingDashboardContext'
import { DefaultTitle } from '@/components/common/Seo'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { formatNumberWithCommas } from '@/utils/helpers'
import InvitationRelationshipConfirmationPopup from '@/components/common/InvitationRelationshipConfirmationPopup'
import { useSelector } from 'react-redux'
import PcAdBanner from '@/components/PC/PcAdBanners'
import DetailSymbol, { PageTabStates } from '@/components/futuresDetails/DetailSymbol.tsx'


const DEFAULT_FUTURES_BASE_COIN = import.meta.env.VITE_DEFAULT_FUTURES_BASE_COIN
const FuturesDetailPage = () => {
  const { t } = useTranslation()
  const { baseCoin = DEFAULT_FUTURES_BASE_COIN } = useParams()
  const navigate = useNavigate()
  const { allSymbols } = useAppSelector(selectFuturesTradePreferences)

  const walletDex = useSelector(_walletDex)
  const dispatch = useAppDispatch()

  const currentBaseCoin = useAppSelector((state) => state.futuresCurrentSymbol.baseCoin)

  const universeList = useAppSelector(selectAllPerpMeta)

  const orderButtonStatus = useAppSelector(orderButtonStatusSelector)
  const isApproveAgent = useAppSelector(isAuthorizedSelector)
  const agentWallet = useAppSelector(agentWalletSelector)
  const allMeta = useAppSelector(selectAllPerpMeta)

  const coinIndex = allMeta.findIndex((item: any) => baseCoin === item.name)

  const isLogin = useCheckLoginOnArb()

  const [pageTab, setPageTab] = useState<PageTabStates>(() => {
    const saved = localStorage.getItem('futuresPageTab')
    if (saved && Object.values(PageTabStates).includes(saved as PageTabStates)) {
      return saved as PageTabStates
    }
    return PageTabStates.Trend
  })

  // 响应式检测
  const { isDesktop, isMobile } = useResponsive()


  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { markPrice } = useAppSelector(symbolInfoSelector)

  useEffect(() => {
    localStorage.setItem('futuresPageTab', pageTab)
  }, [pageTab])

  const handleCheckCorrectSymbolWithRouter = () => {
    if (!universeList || !universeList.length) return

    const regex = new RegExp(`^${baseCoin}$`, 'i')
    const symbolIndex = universeList.findIndex((item: any) => regex.test(item.name))

    if (symbolIndex === -1) {
      navigate('/futures', { replace: true })
      return
    }

    const correctSymbol = universeList[symbolIndex].name

    if (baseCoin !== correctSymbol) {
      const currentPath = location.pathname
      const targetPath = currentPath.replace(`/${baseCoin}`, `/${correctSymbol}`)
      navigate(targetPath, { replace: true })
      return
    }
    dispatch(futuresBrowsingHistoryActions.addSymbolToHistory(baseCoin))
  }

  useEffect(() => {
    const handleGetSymbolList = async () => {
      try {
        const input = {
          condition: 'volume',
        }
        const { data } = await symbolDexClient.query({
          query: GET_SYMBOL_LIST,
          variables: { input },
        })
        dispatch(futuresTradePreferencesActions.updateAllSymbols(data?.getSymbolList?.list || []))
      } catch (error) {
        console.error('Error fetching symbol list:', error)
      }
    }

    if (!allSymbols || !allSymbols.length) {
      handleGetSymbolList()
    }
  }, [])

  useEffect(() => {
    if (baseCoin && markPrice) {
      document.title = `${formatNumberWithCommas(markPrice || 0)} | ${baseCoin} | ${DefaultTitle} 🚀`
    }
  }, [baseCoin, markPrice])

  const fetchPerpMetadata = async () => {
    try {
      const data = await getPerpMetaAndAssetCtxs()

      const marginTables = Object.fromEntries(data[0].marginTables)

      const universe = data[0]?.universe
      const contexts = data[1]

      const allTiers: any = {}
      const allMarginTiers: any = {}
      if (universe.length) {
        for (let i = 0; i < universe.length; i++) {
          const coin = universe[i].name
          const szDecimals = universe[i].szDecimals
          const ctx = contexts[i]
          const rawMid = ctx.midPx ?? ctx.markPx
          if (!rawMid) continue
          const price = parseFloat(rawMid)
          allTiers[coin] = generateL2BookTiers(coin, price, szDecimals)

          if (universe[i].marginTableId < 50) {
            allMarginTiers[coin] = { lowerBound: '0.0', maxLeverage: universe[i].maxLeverage }
          } else {
            allMarginTiers[coin] = marginTables[universe[i].marginTableId].marginTiers
          }
        }

        dispatch(setAllTiers(allTiers))
        dispatch(setAllMarginTiers(allMarginTiers))
        dispatch(setUniverse(universe))
        const { szDecimals, maxLeverage, marginTableId } = universe.find((item: any) => {
          return item.name === baseCoin
        })
        dispatch(setSymbolInfo({ szDecimals, maxLeverage, marginTableId }))
      }
    } catch (err: any) { }
  }

  const fetchUserSymbolPreference = async () => {
    const { data } = await symbolDexClient?.query<any>({
      query: getUserSymbolPreference,
      variables: {
        input: {
          symbol: baseCoin,
        },
      },
    })
    if (data?.getUserSymbolPreference) {
      const { leverage, isCross, isFavorite } = data.getUserSymbolPreference

      dispatch(
        updateFuturesTradeConfig({
          symbol: baseCoin,
          config: {
            positionMode: isCross ? 'cross' : 'isolated',
            leverage: leverage.toString(),
            isFavorite,
          },
        }),
      )

      const orderAction = {
        type: 'updateLeverage',
        asset: coinIndex,
        isCross,
        leverage: Number(leverage),
      }
      if (!agentWallet) return
      const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)

      hanleHyperliquidAction({
        agentPrivateKey: realAgentWallet.privateKey,
        action: orderAction,
        dispatch: dispatch,
        showError: false,
        walletAddress: agentWallet.id,
        allMeta: allMeta,
        showRateLimit: false,
      })
    }
  }

  const retrieveUserFee = async () => {
    try {
      const data = await getUserFee(walletDex?.walletAddress)
      const takerFee = MathFun.mul(data.userCrossRate, MathFun.sub(1, data.activeReferralDiscount), 100)
      const makerFee = MathFun.mul(data.userAddRate, MathFun.sub(1, data.activeReferralDiscount), 100)

      dispatch(futuresUserInfoActions.updateUserFee({ takerFee, makerFee }))
    } catch (err) {
      console.log('error: ', err)
    }
  }

  useEffect(() => {
    if (isLogin && walletDex?.walletAddress) {
      retrieveUserFee()
    }
  }, [isLogin, walletDex?.walletAddress])

  useEffect(() => {
    if (baseCoin && currentBaseCoin !== baseCoin) {
      dispatch(setSymbolInfo({ baseCoin: baseCoin }))
      dispatch(updateFuturesTradeConfig({ symbol: baseCoin, config: {} }))
    }
    return () => {
      dispatch(resetSymbolInfo())
    }
  }, [baseCoin, currentBaseCoin, dispatch])

  useEffect(() => {
    if (!baseCoin) return
    fetchPerpMetadata()
  }, [baseCoin])

  useEffect(() => {
    if (isLogin && baseCoin && coinIndex !== -1) fetchUserSymbolPreference()
  }, [baseCoin, isLogin, isApproveAgent, coinIndex])

  useEffect(() => {
    if (!baseCoin) return
    sessionStorage.setItem('recentFuturesSymbol', baseCoin)
    handleCheckCorrectSymbolWithRouter()

    // 当切换币种时滚动到顶部
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [baseCoin, universeList, pageTab])

  const handleNavigateToTrade = () => {
    setPageTab(PageTabStates.Trade)
  }

  const handleRecordsBack = () => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  // 移动端渲染逻辑
  const renderMobileLayout = () => {
    return (
      <div className="min-h-full">

        <div
          id="scroll-content"
          className={`w-full _hidescrollbar`}
        >
          <div className="relative h-full ">
            <div className={cn(PageTabStates.Trade === pageTab ? 'block' : 'hidden')}>
              <TradePage
                baseCoin={baseCoin}
                isActive={pageTab === PageTabStates.Trade}
                onRecordsBack={handleRecordsBack}
              />
            </div>
            <div className={cn(PageTabStates.Trend === pageTab ? 'block' : 'hidden')}>
              <TrendPage
                baseCoin={baseCoin}
                onNavigateToTrade={handleNavigateToTrade}
                isActive={pageTab === PageTabStates.Trend}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // PC端渲染逻辑
  const renderDesktopLayout = useCallback(() => {
    return (
      <DesktopLayout
        baseCoin={baseCoin}
        children={{
          header: <CoinInfoHeader baseCoin={baseCoin} />,
          chart: <DesktopChart baseCoin={baseCoin} isActive={true} />,
          tradingPanel: <DesktopTradingPanel baseCoin={baseCoin} isActive={true} />,
          orderbook: <DesktopOrderbook baseCoin={baseCoin} isActive={true} />,
          accountInfo: <DesktopAccountInfo />,
          positions: (
            <TradingDashboardProvider>
              <TradingDashboard baseCoin={baseCoin} isActive={true} />
            </TradingDashboardProvider>
          ),
        }}
      />
    )
  }, [baseCoin])

  return (
    <ToastProvider>
      {isDesktop ? (
        // PC端布局
        <>
          {renderDesktopLayout()}
          <PcAdBanner scene="futures" />
        </>
      ) : (
        // 移动端布局
        <div className="relative h-screen flex flex-col overflow-hidden">
          <div
            id="futures-main-header"
            className={`w-full trade-page-top-border after:content-[''] mb-0
        after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[0.5px]  `}
            style={{
              maxWidth: '768px',
            }}
          >
            <div className="flex items-center justify-between pt-4.5 pb-2 px-2.5  border-b border-[#1B1B1E] mb-0">
              {/* <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))] font-bold">交易</div> */}
              <DetailSymbol pageTab={pageTab} onPageTabChange={setPageTab} />
              <DetailHeaderButton pageTab={pageTab} onPageTabChange={setPageTab} token={baseCoin} allSymbol={allSymbols} />
            </div>


          </div>

          {orderButtonStatus === 'toggle' && <TopInfo text={t('futuresDetails.tips.walletNotSupport')} />}
          <div
            className="w-full overflow-y-auto _hidescrollbar"
            ref={scrollContainerRef}
          >
            {renderMobileLayout()}
          </div>
        </div>
      )}
      <InvitationRelationshipConfirmationPopup />
    </ToastProvider>
  )
}

export default FuturesDetailPage
