import TradingViewChart from '@/components/chart/TradingViewChart'
import useNetworkFeeSubcription from '@/components/mqtt/NetworkFeeSubcription.tsx'
import OrderBook from '@/components/orderBook/OrderBookPC'
import { gqlMeme2 } from '@/lib/gql/apollo-client'
import ls from '@/lib/local-storage.ts'
import { browsingHistoryActions } from '@/redux/modules/browsingHistory.slice.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getTokenDetail, getTokenInsight } from '@/services/tokens.service'
import { ChainIds } from '@/types/enums.ts'
import { useQuery } from '@apollo/client'
import BottomInfo from '@components/detailInfo/BottomInfo'
import HeaderDetailInfo from '@components/detailInfo/HeaderDetailInfo'
import TabsInformationSubscription from '@components/detailInfo/TabsInformationSubscription.tsx'
import { TokenAlert } from '@components/detailInfo/TokenAlert.tsx'
import TopInfo from '@components/detailInfo/TopInfo'
import MemeDetailBottomTabsPc from '@components/memeDetail/MemeDetailBottomTabsPc.tsx'
import { SimilarTokens } from '@components/memeDetail/SimilarTokens.tsx'
import { TopBarToken } from '@components/v2/desktop/TokenTopBarCard.tsx'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import DesktopLayout from './layout'
import OrderFormPC from './orderForm/desktop'
import { useTokenPortrait } from './orderForm/desktop/hook/useTokenPortrait'
import PendingOrdersCounter from '@/components/currentOrdersList/PendingOrdersCounter'
import { Loading } from '@/components/common/Loading'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { TYPE_CHAIN } from '@/lib/blockchain'
import ResizableVerticalWrapper from '@/components/common/ResizableVerticalWrapper'
import ResizableHorizontalWrapper from '@/components/common/ResizableHorizontalWrapper'
import { cn } from '@/lib/utils'
import useWatchLiquidity from '@hooks/useWatchLiquidity.ts'
import { TokenAlertHoneyPot } from '@/components/detailInfo/TokenAlertHoneyPot'
import TokenPageTitle from '@components/TokenPageTitle'
import PriceTokenSubcription from '@/components/mqtt/PriceTokenSubcription'
import PcAdBanner from '@/components/PC/PcAdBanners'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import NewDetailStatistic from '@/components/detailStatistic/NewDetailStatistic'
import { MemeTokenDetailContext } from '@/contexts/meme/detail/MemeTokenDetailContext.ts'

export type TradesPanelPositon = 'bottom' | 'side'

const mapRouteChainToChainId: Record<string, number> = {
  sol: ChainIds.Solana,
  eth: ChainIds.Ethereum,
  bsc: ChainIds.Bsc,
  arb: ChainIds.Arbitrum,
  mon: ChainIds.Mon,
}

const MemeDetailPC = () => {
  const { t } = useTranslation()
  useNetworkFeeSubcription()
  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const { address, chain: routeChain } = useParams()
  const activeChainId = useActiveChainId()
  const isXstockPath = useIsXStockPath()
  const [isResizing, setIsResizing] = useState(false)
  const { data, refetch, error } = useQuery(getTokenDetail, {
    skip: !address,
    variables: {
      input: {
        address: address,
        chainId: mapRouteChainToChainId[routeChain || 'sol'] || ChainIds.Solana,
      },
    },
    fetchPolicy: 'no-cache',
    client: gqlMeme2,
  })
  const { dataLp } = useWatchLiquidity({
    token: address ?? '',
    chainId: mapRouteChainToChainId[routeChain || 'sol'] || ChainIds.Solana,
  })

  const tokenData = data?.getTokenDetail

  const { data: insightData } = useQuery(getTokenInsight, {
    skip: !address,
    variables: {
      input: {
        address: address,
        chainId: activeChainId,
      },
    },
    fetchPolicy: 'no-cache',
    client: gqlMeme2,
  })

  const tokenInsight = insightData?.getTokenInsight

  const activeWallet = useSelector(_activeWallet)
  const retryCountRef = useRef(1)
  const MAX_RETRIES = 20
  const [retryTrigger, setRetryTrigger] = useState(0)
  const [tvChartHeight, setTvChartHeight] = useState(
    localStorage.getItem('tv-chart-pc-height') ? Number(localStorage.getItem('tv-chart-pc-height')) : 420,
  )
  const tokenPortrait = useTokenPortrait(tokenData?.address, tokenData?.chainId)

  useEffect(() => {
    if (error) {
      const errorCode = error?.graphQLErrors?.[0]?.extensions?.code
      if (errorCode === 'TOKEN_NOT_FOUND' && retryCountRef.current < MAX_RETRIES) {
        const delay = Math.pow(1.8, retryCountRef.current) * 1000
        console.warn(`Retrying #${retryCountRef.current + 1} in ${delay / 1000}s...`)
        const timer = setTimeout(() => {
          retryCountRef.current += 1
          refetch()
            .then((_) => {
              setRetryTrigger((v) => v + 1)
            })
            .catch((_) => {
              setRetryTrigger((v) => v + 1)
            })
        }, delay)
        return () => clearTimeout(timer)
      }
    }
  }, [error, retryTrigger])

  const userAddress = activeWallet?.walletAddress
  const queryClient = useQueryClient()

  const [tradesPanelPosition, setTradesPanelPosition] = useState<TradesPanelPositon>(
    ls.get('tradesPanelPosition') || 'side',
  )

  useEffect(() => {
    ls.set('tradesPanelPosition', tradesPanelPosition)
  }, [tradesPanelPosition])

  useEffect(() => {
    if (!tokenData?.address) return
    dispatch(browsingHistoryActions.addTokenToHistory(tokenData.address))
    queryClient.setQueryData(['topBarTokens', 'recent'], (oldData: TopBarToken[]) => {
      if (!oldData) return oldData
      const existing = oldData.find((item) => item.address === tokenData.address)
      if (existing) return oldData
      const newData = [
        {
          address: tokenData.address,
          avatar: tokenData.info?.logoUrl || '',
          name: tokenData.symbol || '',
          chainId: tokenData.chainId || ChainIds.Solana,
          sector: tokenData.name?.includes('xStock') ? 'xstock' : 'meme',
          priceChange: tokenData.price24hChange ? +tokenData.price24hChange : 0,
          marketCap: tokenData.marketCap || 0,
        } as TopBarToken,
      ].concat(oldData)
      const uniqueData = newData.filter((item, index) => newData.findIndex((i) => i.address === item.address) === index)
      return uniqueData.slice(0, 20) // Keep only the latest 20 items
    })
  }, [tokenData?.address])

  const isOnlyHoneyPot = !!tokenData?.isHoneypot && tokenData?.isHoneypot && tokenData?.ownershipRenounced
  const isOnlyRenounedTag = !!tokenData?.isHoneypot && !tokenData?.isHoneypot && !tokenData?.ownershipRenounced
  const isBothHoneypotRenounced = !!tokenData?.isHoneypot && tokenData?.isHoneypot && !tokenData?.ownershipRenounced

  const contextValue = useMemo(() => {
    return {
      liquidity: dataLp ? +dataLp : undefined,
    }
  }, [dataLp])

  return (
    <MemeTokenDetailContext.Provider value={contextValue}>
      <>
        <TokenPageTitle address={address} symbol={tokenData?.symbol} defaultPrice={tokenData?.price} />
        <PriceTokenSubcription tokenDetail={tokenData} />
        <TokenAlert tokenData={tokenData} tokenPortrait={tokenPortrait} />
        <TokenAlertHoneyPot tokenData={tokenData} />
        <PendingOrdersCounter userAddress={userAddress} />
        <DesktopLayout
          baseCoin={''}
          tradesPanelPosition={tradesPanelPosition}
          children={{
            header: <HeaderDetailInfo tokenData={tokenData} />,
            tradingCore: (
              <div className="flex-1 h-[calc(100vh-220px)] overflow-y-auto overflow-x-hidden no-scrollbar">
                <ResizableVerticalWrapper
                  defaultHeight={420}
                  minHeight={250}
                  maxHeight={window.innerHeight - 220}
                  storageKey="tv-chart-pc-height"
                  onResizeEnd={(h) => setTvChartHeight(h)}
                >
                  <div className="flex w-full h-full relative">
                    <div
                      className={cn('flex flex-col flex-1 relative z-105 min-w-0', {
                        'pointer-events-none': isResizing,
                      })}
                    >
                      <div className="flex-1">
                        <TradingViewChart />
                      </div>
                      <span
                        className={cn(
                          'absolute top-1/2 -right-2 -translate-y-1/2 cursor-pointer bg-[#1b1b1d] w-[12px] h-[26px] flex items-center justify-center rounded-[4px] border-[0.5px] border-[#ECECED1F] hover:bg-[#2c2c2e] z-50',
                          {
                            'right-0': tradesPanelPosition === 'bottom',
                          },
                        )}
                        onClick={() => setTradesPanelPosition(tradesPanelPosition === 'side' ? 'bottom' : 'side')}
                      >
                        <img
                          src="/images/icons/arrow-left-2.svg"
                          alt=""
                          className={`w-[6px] transition-transform ${tradesPanelPosition === 'side' ? 'rotate-180' : ''}`}
                        />
                      </span>
                    </div>
                    {tradesPanelPosition === 'side' && (
                      <ResizableHorizontalWrapper
                        storageKey="orderbook-pc-width"
                        position="left"
                        defaultWidth={400}
                        minWidth={300}
                        maxWidth={600}
                        isResizing={isResizing}
                        setIsResizing={setIsResizing}
                      >
                        <OrderBook
                          tokenDetail={tokenData}
                          height={tvChartHeight}
                          tradesPanelPosition={tradesPanelPosition}
                          setTradesPanelPosition={setTradesPanelPosition}
                        />
                      </ResizableHorizontalWrapper>
                    )}
                  </div>
                </ResizableVerticalWrapper>
                <MemeDetailBottomTabsPc
                  tokenData={tokenData}
                  tvChartHeight={tvChartHeight}
                  tradesPanelPosition={tradesPanelPosition}
                  setTradesPanelPosition={setTradesPanelPosition}
                />
              </div>
            ),
            tradingPanel: (
              <div className="p-4 h-full overflow-auto no-scrollbar border-[0.5px] border-[#ECECED14]">
                <TopInfo tokenData={tokenData} tokenInsight={tokenInsight} />
                <div className="my-4">
                  <OrderFormPC tokenDetail={tokenData} />
                </div>
                {(isOnlyHoneyPot || isOnlyRenounedTag || isBothHoneypotRenounced) && activeChain === TYPE_CHAIN.BSC && (
                  <div className="flex items-center gap-2 px-1.5 py-2 bg-[#f2668214] rounded-[6px] mb-4">
                    <img src="/images/icons/danger.svg" className="w-4 h-4" alt="" />
                    <p className="flex-1 text-[12px] leading-[1.2] font-[330] text-[#ee2f55]">
                      {isOnlyHoneyPot && t('detail.tokenDetail.isOnlyHoneyPot')}
                      {isOnlyRenounedTag && t('detail.tokenDetail.isOnlyRenounedTag')}
                      {isBothHoneypotRenounced && t('detail.tokenDetail.isBothHoneypotRenounced')}
                    </p>
                  </div>
                )}
                {activeWallet?.isConnected && <NewDetailStatistic />}
                <BottomInfo tokenData={tokenData} />
                <SimilarTokens token={tokenData?.address} chainId={tokenData?.chainId ?? ChainIds.Solana} />
                <TabsInformationSubscription
                  totalSupply={tokenData?.totalSupply ?? '0'}
                  createdTime={tokenData?.createdTime}
                />
              </div>
            ),
          }}
        />
        <PcAdBanner scene={isXstockPath ? 'xstocks' : 'meme'} />
        {(error?.graphQLErrors?.[0]?.extensions?.code === 'TOKEN_NOT_FOUND' ||
          error?.graphQLErrors?.[0]?.extensions?.code === 'Unknown') && (
          <div className="fixed top-24 left-0 w-full h-full z-30 bg-[#0A0A0A] opacity-85">
            <div className="py-4 px-3 rounded-[8px] bg-[#27272a] w-100% min-w-[351px] max-w-[351px] h-fit mx-auto mt-4">
              <p className="text-sm">{t('detail.tokenDetail.processed')}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm">{t('detail.tokenDetail.waiting')}</p>
                <Loading />
              </div>
            </div>
          </div>
        )}
      </>
    </MemeTokenDetailContext.Provider>
  )
}

export default MemeDetailPC
