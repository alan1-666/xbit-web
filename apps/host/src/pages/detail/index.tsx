import NewLoginDrawer from '@/components/auth/NewLoginDrawer'
import ButtonLogin from '@/components/common/LoginSection/ButtonLogin'
import CurrentOrdersList from '@/components/currentOrdersList'
import NewDetailStatistic from '@/components/detailStatistic/NewDetailStatistic'
import { DetailTokenTableProvider } from '@/components/detaiTokenTable/DetailTokenTableContext'
import { useFavoriteBroadcast } from '@/components/futuresDetails/tokenSearchDrawer/hooks/useFavoriteBroadcast'
import useNetworkFeeSubcription from '@/components/mqtt/NetworkFeeSubcription.tsx'
import PriceTokenSubcription from '@/components/mqtt/PriceTokenSubcription'
import { getChainId } from '@/lib/blockchain'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatAmount } from '@/lib/format.ts'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { cn, getDefaultTokenByChain, getPath } from '@/lib/utils.ts'
import { browsingHistoryActions } from '@/redux/modules/browsingHistory.slice.ts'
import { setCurrentToken } from '@/redux/modules/holding.slice.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { selectTotalPendingOrders } from '@/redux/modules/pendingOrders.slice.ts'
import { selectTokenByAddress, tokenActions } from '@/redux/modules/tokens.slice.ts'
import { setCurrentDetailTab, setTotalSupply, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { getTokenDetail } from '@/services/tokens.service'
import { UITab } from '@/types/uiTabs.ts'
import { useQuery } from '@apollo/client'
import Chart from '@components/chart/index.tsx'
import Container from '@components/common/Container.tsx'
import { Loading } from '@components/common/Loading.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import PendingOrdersCounter from '@components/currentOrdersList/PendingOrdersCounter.tsx'
import DetailHolderTab from '@components/detailHolderTab'
import { DetailInfoWrapper } from '@components/detailInfo/DetailInfoWrapper.tsx'
import TabsInformationSubscription from '@components/detailInfo/TabsInformationSubscription.tsx'
import DetailListIcon from '@components/detailListIcon'
import PollTransactionWrapper from '@components/detailPoolTab/wrapper.tsx'
// import DetailStatistic from '@components/detailStatistic'
import DetailTokenTabs from '@components/detailTokenTabs'
// import DetailTokenTable from '@components/detaiTokenTable'
import { TransactionsHistoryListener } from '@components/detaiTokenTable/TransactionsHistoryListener.tsx'
import { TabAI } from '@components/memeDetail/TabAI.tsx'
import { TabInfo } from '@components/memeDetail/TabInfo.tsx'
import HoldingTab from '@components/myPositions/HoldingTab.tsx'
import OrderBook from '@components/orderBook'
import OrderForm from '@components/orderForm'
import TokenPageTitle from '@components/TokenPageTitle'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { TradingTransactionsTable } from '@components/detaiTokenTable/TradingTransactionsTable.tsx'

export const TAB_AI = 'AI'

const MemeDetailPage = () => {
  const { t } = useTranslation()
  const { broadcastHistoryAdded } = useFavoriteBroadcast()

  const dispatch = useAppDispatch()
  const chain = useAppSelector((state) => state.newWallet.activeChain)
  const activeChainId = useActiveChainId()
  const { currentDetailTab } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)
  useNetworkFeeSubcription()

  // const activeAccount = useAppSelector((state) => state.wallet.activeAccount)
  const { address } = useParams()
  const navigate = useNavigate()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const activeWallet = useSelector(_activeWallet)
  const retryCountRef = useRef(1)
  const MAX_RETRIES = 20
  const { data, refetch, error } = useQuery(getTokenDetail, {
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

  const [retryTrigger, setRetryTrigger] = useState(0)

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
  const isWeb3Wallet = (activeWallet as any)?.isWeb3Wallet
  const isXstockPath = useIsXStockPath()

  const pendingOrdersCount = useAppSelector(selectTotalPendingOrders)
  const pendingOrdersCountString = pendingOrdersCount > 99 ? '99+' : pendingOrdersCount

  const navTabs = useMemo(() => {
    const tabs: UITab[] = [
      {
        value: 'trading',
        label: t('detail.tabs.trading'),
      },
      {
        value: 'info',
        label: t('detail.tabs.information'),
      },
    ]
    if (isXstockPath) return tabs
    return tabs.concat([
      {
        value: TAB_AI,
        label: t('detail.tabs.aiAnalysis'),
      },
    ])
  }, [t, isXstockPath])

  const { holderCount } = useAppSelector((state: RootState) => state?.tradeTab as TradeTabState)

  const holderCountFormatted = useMemo(() => {
    return formatAmount(holderCount, {
      roundMode: 'floor',
    })
  }, [holderCount])

  const currentListTabs: UITab[] = [
    {
      value: 'followed',
      label: t('detail.tabs.followed'),
    },
    {
      value: 'trading',
      label: t('detail.tabs.trading'),
    },
    {
      value: 'holders',
      label: t('detail.tabs.holders', {
        total: holderCount > 0 ? ` (${holderCountFormatted})` : '',
      }),
    },
    {
      value: 'pool',
      label: t('detail.tabs.pool'),
    },
    {
      value: 'order',
      label: pendingOrdersCount
        ? t('detail.tabs.currentCommissionWithCount', { total: pendingOrdersCountString })
        : t('detail.tabs.currentCommission'),
    },
    {
      value: 'holding',
      label: t('detail.tabs.myPositions'),
    },
  ]

  const filteredListTabs = useMemo(() => {
    if (!isXstockPath) return currentListTabs
    return currentListTabs.filter((tab) => tab.value !== 'holders')
  }, [isXstockPath, currentListTabs])

  const [searchParams, setSearchParams] = useSearchParams()
  const [currentNavTab, setCurrentNavTab] = useState<string>(searchParams.get('page') || navTabs[0].value)
  const [currentTab, setCurrentTab] = useState<string>(
    searchParams.get('tab') || currentDetailTab || currentListTabs[5].value,
  )

  const handleChangeNavTab = (tab: string) => {
    setCurrentNavTab(tab)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', tab)
      return newParams
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleChangeTab = (tab: string) => {
    setCurrentTab(tab)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('tab', tab)
      return newParams
    })
    dispatch(setCurrentDetailTab(tab))
  }
  const handleRenderTab = (tab: string) => {
    switch (tab) {
      case currentListTabs[0].value:
        return activeWallet?.isConnected ? <DetailTokenTabs tokenData={tokenData} /> : ButtonConnectWallet()
      case currentListTabs[1].value:
        return (
          <DetailTokenTableProvider>
            <TradingTransactionsTable
              symbol={tokenData?.symbol ?? undefined}
              price={tokenData?.price?.toString() ?? undefined}
              totalSupply={tokenData?.totalSupply?.toString() ?? undefined}
              decimals={tokenData?.decimals ? Number(tokenData?.decimals) : undefined}
            />
          </DetailTokenTableProvider>
        )
      case currentListTabs[2].value:
        return <DetailHolderTab circulatingSupply={tokenData?.circulatingSupply} />
      case currentListTabs[3].value:
        return (
          <PollTransactionWrapper
            dexes={tokenData?.dexes || []}
            token={address}
            chainId={tokenData?.chainId}
            icon={tokenData?.info?.logoUrl}
            symbol={tokenData?.symbol}
          />
        )
      case currentListTabs[4].value:
        return activeWallet?.isConnected ? <CurrentOrdersList currentToken={address} /> : ButtonConnectWallet()
      case currentListTabs[5].value:
      default:
        return activeWallet?.isConnected ? <HoldingTab /> : ButtonConnectWallet()
    }
  }

  const handleClickBtnLogin = () => {
    if (!activeWallet.isConnected) {
      setShowLoginDrawer(true)
    }
  }

  const ButtonConnectWallet = () => {
    return (
      <Container className="mt-[10px] h-40">
        <div className="flex items-center gap-2 flex-col justify-center text-[14px] text-[#999999] mt-10">
          <p>
            {t('login.notLogined', {
              name: 'XBIT',
            })}
          </p>
          <ButtonLogin onClick={handleClickBtnLogin} className="hover-scale">
            <img src="/images/icons/icon-wallet.svg" className="w-[1rem] h-[calc(1rem*(13.43/16))]" alt="" />
            {t('wallet.connectGuide')}
          </ButtonLogin>
        </div>
        <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      </Container>
    )
  }

  const tokenData = data?.getTokenDetail
  const tokenDataInStore = useAppSelector(selectTokenByAddress(tokenData?.address))

  useEffect(() => {
    if (tokenData) {
      dispatch(setCurrentToken(tokenData?.address))
      dispatch(setTotalSupply(Number(tokenData?.totalSupply || '0')))
      if (!tokenDataInStore) {
        dispatch(
          tokenActions.setTokenData({
            address: tokenData.address,
            chainId: tokenData.chainId,
            name: tokenData.name,
            symbol: tokenData.symbol,
            logo: tokenData?.info?.logoUrl,
            isBlacklisted: tokenData.isBlacklisted || false,
            totalSupply: tokenData.totalSupply || '0',
          }),
        )
      } else {
        dispatch(
          tokenActions.updateTokenData({
            address: tokenData.address,
            data: {
              chainId: tokenData.chainId,
              name: tokenData.name,
              symbol: tokenData.symbol,
              logo: tokenData?.info?.logoUrl,
              isBlacklisted: tokenData.isBlacklisted || false,
              totalSupply: tokenData.totalSupply || '0',
            },
          }),
        )
      }
    }
  }, [tokenData])

  useEffect(() => {
    const isXStock = window.location.pathname.includes('xstocks')
    const key = isXStock ? 'xStockRecentToken' : 'recentToken'
    if (!address) {
      const recentToken = sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)!) : null
      if (recentToken && recentToken?.chain === chain) {
        navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: recentToken.token, chain: recentToken.chain }))
        return
      }

      const chainId = getChainId(chain)
      navigate(
        getPath(APP_PATH.MEME_TOKEN_DETAIL, {
          address: getDefaultTokenByChain(chain),
          chain: CHAIN_SYMBOLS[chainId],
        }),
      )
      return
    }

    sessionStorage.setItem(key, JSON.stringify({ token: address, chain: chain }))
  }, [address])

  useEffect(() => {
    if (!address) return

    // Save to history
    dispatch(browsingHistoryActions.addTokenToHistory(address))
    broadcastHistoryAdded(address)
  }, [address])

  useEffect(() => {
    const isPendingOrdersTab = searchParams.get('tab') === 'order'

    if (isPendingOrdersTab && isWeb3Wallet) {
      setCurrentTab('holding')
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set('tab', 'holding')
        return newParams
      })
      dispatch(setCurrentDetailTab('holding'))
    }
  }, [searchParams, isWeb3Wallet])

  // const routeChainToName = (chain: string) => {
  //   switch (chain) {
  //     case 'sol':
  //       return 'Solana'
  //     case 'eth':
  //       return 'Ethereum'
  //     case 'arb':
  //       return 'Arbitrum'
  //     default:
  //       return chain.charAt(0).toUpperCase() + chain.slice(1)
  //   }
  // }

  useEffect(() => {
    // Check if the current tab is not in the filtered list tabs
    if (!filteredListTabs.some((tab) => tab.value === currentTab)) {
      // If not, set the current tab to the trade tab or the first available tab
      const tradeTab = filteredListTabs.find((tab) => tab.value === 'trading')
      const newTab = tradeTab ? tradeTab.value : filteredListTabs[0].value
      setCurrentTab(newTab)
      dispatch(setCurrentDetailTab(newTab))
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set('tab', newTab)
        return newParams
      })
    }
  }, [filteredListTabs, currentTab])

  // if ((routeChain && routeChain !== 'sol') || chain !== 'sol') {
  //   return (
  //     <div className="tex-center h-[calc(100vh-95px)] flex flex-col items-center justify-center text-[16px] text-white/80">
  //       <div>
  //         {chain !== 'sol'
  //           ? t('detail.tokenDetail.chainComingSoon1', { chain: routeChainToName(chain) })
  //           : t('detail.tokenDetail.chainComingSoon1', { chain: routeChainToName(routeChain || '') })}
  //       </div>
  //       <div className="mt-1">{t('detail.tokenDetail.chainComingSoon2')}</div>
  //     </div>
  //   )
  // }

  return (
    <>
      {/*<LastTransactionSubscription baseAddress={address} />*/}
      <TransactionsHistoryListener />
      <PendingOrdersCounter userAddress={userAddress} />
      <PriceTokenSubcription tokenDetail={tokenData} />
      <TokenPageTitle address={address} symbol={tokenData?.symbol} defaultPrice={tokenData?.price} />
      <div className="relative">
        {/* sticky header*/}
        <div className="sticky top-0 z-20 bg-[#0A0A0A]">
          {/*<DetailHeader tokenData={tokenData} />*/}
          <div className="flex items-center justify-between w-full pt-3 border-b-[0.6px] border-b-[#25242b]">
            <MovingLineTabs
              tabs={navTabs}
              defaultTab={currentNavTab}
              onTabChange={handleChangeNavTab}
              containerClassName="bg-[none] after:hidden"
              tabsClassName="w-full"
            />
            <DetailListIcon tokenData={tokenData} currentNavTab={currentNavTab} />
          </div>
        </div>
        <div
          id="tab-trading"
          className={cn('relative bg-[#0a0a0a]', currentNavTab === navTabs[0].value ? 'block' : 'hidden')}
        >
          <DetailInfoWrapper tokenData={tokenData} />
          <Chart />
          {/* {activeWallet?.isConnected && <DetailStatistic/>} */}
          {activeWallet?.isConnected && <NewDetailStatistic />}
          <Container className="flex gap-3 mt-[8px] mb-[8px] pb-[10px] relative">
            <OrderBook tokenDetail={tokenData} />
            <OrderForm tokenDetail={tokenData} />
          </Container>
          <TabsInformationSubscription
            totalSupply={tokenData?.totalSupply ?? '0'}
            createdTime={tokenData?.createdTime}
          />
          <MovingLineTabs
            tabs={filteredListTabs}
            onTabChange={handleChangeTab}
            defaultTab={currentTab}
            wrapperClassName="bg-[#0A0A0A] z-10 ml-0.5"
            itemClassName="!px-2 text-[14px] leading-none font-[330]"
            itemClassNameActive="!text-[15px]"
            containerClassName="bg-transparent after:h-[0.6px] justify-start"
            tabsListClassName="h-8 p-0"
            disabledTabs={isWeb3Wallet ? [currentListTabs[4].value] : []}
          />
          {handleRenderTab(currentTab)}
        </div>
        <TabInfo tokenData={tokenData} show={currentNavTab === navTabs[1].value} />
        <TabAI show={currentNavTab === TAB_AI} address={address} tokenData={tokenData} />

        {error?.graphQLErrors?.[0]?.extensions?.code === 'TOKEN_NOT_FOUND' && (
          <div className="fixed top-0 left-0 w-full h-full z-30 bg-[#0A0A0A] opacity-85">
            <div className="py-4 px-3 rounded-[8px] bg-[#27272a] w-100% min-w-[351px] max-w-[351px] h-fit mx-auto mt-4">
              <p className="text-sm">{t('detail.tokenDetail.processed')}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm">{t('detail.tokenDetail.waiting')}</p>
                <Loading />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MemeDetailPage
