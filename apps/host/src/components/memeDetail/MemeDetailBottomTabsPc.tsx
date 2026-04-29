import { TokenDetail } from '@/@generated/gql/graphql-future'
import eventBus from '@/lib/eventBus'
import { formatVolume } from '@/lib/format.ts'
import OneClickTradeDialog from '@/pages/detail/orderForm/desktop/component/OneClickTradeDialog'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { selectTotalPendingOrders } from '@/redux/modules/pendingOrders.slice.ts'
import { setCurrentDetailTab, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { UITab } from '@/types/uiTabs.ts'
import NewLoginDrawer from '@components/auth/NewLoginDrawer.tsx'
import Container from '@components/common/Container.tsx'
import ButtonLogin from '@components/common/LoginSection/ButtonLogin.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import CurrentOrdersList from '@components/currentOrdersList'
import DetailHolderWrapper from '@components/detailHolderTab/wrapper.tsx'
import PollTransactionWrapper from '@components/detailPoolTab/wrapper.tsx'
import DetailTokenTabs from '@components/detailTokenTabs'
import MyPositions from '@components/myPositions/pc'
import TransactionHistory from '@components/transactionHistory/pc'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import clsx from 'clsx'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams, useSearchParams } from 'react-router-dom'
import BubbleMap from '../detailInfo/BubbleMap'
import { DetailTokenTableProvider } from '../detaiTokenTable/DetailTokenTableContext'
import { TransactionsHistoryListener } from '../detaiTokenTable/TransactionsHistoryListener'
import { IconFlash, IconPause, IconPlay, IconTradesInBottom, IconTradesInSide } from '../icon/stroke'
import { TradingTransactionsTable } from '@components/detaiTokenTable/TradingTransactionsTable.tsx'
import { selectFromTokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { DevTokens } from '@components/memeDetail/DevTokens.tsx'

type MemeDetailBottomTabsPcProps = {
  tokenData: TokenDetail
  tradesPanelPosition: 'bottom' | 'side'
  setTradesPanelPosition: Dispatch<SetStateAction<'bottom' | 'side'>>
  tvChartHeight: number
}

export const EVENT_MESSAGE_ACTION_TAB_TRADE = 'EVENT_MESSAGE_ACTION_TAB_TRADE'
export function ConnectWalletPrompt({
  onLogin,
  openDrawer,
  setOpenDrawer,
  t,
}: {
  onLogin: () => void
  openDrawer: boolean
  setOpenDrawer: Dispatch<SetStateAction<boolean>>
  t: (k: string, opts?: any) => string
}) {
  return (
    <Container className="mt-[10px] h-40">
      <div className="flex items-center gap-2 flex-col justify-center text-[14px] text-[#999999] mt-10">
        <p>
          {t('login.notLogined', {
            name: 'XBIT',
          })}
        </p>
        <ButtonLogin onClick={onLogin} className="hover-scale">
          <img src="/images/icons/icon-wallet.svg" className="w-[1rem] h-[calc(1rem*(13.43/16))]" alt="" />
          {t('wallet.connectGuide')}
        </ButtonLogin>
      </div>
      <NewLoginDrawer setOpen={setOpenDrawer} open={openDrawer} />
    </Container>
  )
}

const MemeDetailBottomTabsPc = ({
  tokenData,
  tvChartHeight,
  tradesPanelPosition,
  setTradesPanelPosition,
}: MemeDetailBottomTabsPcProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { address } = useParams()

  const { currentDetailTab, holderCount } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)

  const [isHovered, setIsHovered] = useState(false)
  const [openDialogTrade, setOpenDialogTrade] = useState(false)
  const activeWallet = useSelector(_activeWallet)
  const isWeb3Wallet = (activeWallet as any)?.isWeb3Wallet
  const isConnected = (activeWallet as any)?.isConnected
  const isXstockPath = useIsXStockPath()

  const pendingOrdersCount = useAppSelector(selectTotalPendingOrders)

  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  // const [paused, setPaused] = useState<boolean>(false)
  const paused = useAppSelector(selectFromTokenDetailState('paused'))

  const holdersLabelSuffix = useMemo(() => {
    if (holderCount <= 0) return ''
    return ` (${formatVolume(holderCount, {
      roundMode: 'floor',
    })})`
  }, [holderCount])

  const pendingOrdersCountString = useMemo(() => {
    return pendingOrdersCount > 99 ? '99+' : String(pendingOrdersCount || '')
  }, [pendingOrdersCount])

  // Build full tab list (stable order index is used in switch below)
  const baseTabs: UITab[] = useMemo(() => {
    const tabs = [
      { value: 'followed', label: t('detail.tabs.followed') },
      { value: 'trades', label: t('detail.tabs.trades') },
      {
        value: 'holders',
        label: t('detail.tabs.holders', { total: holdersLabelSuffix }),
      },
      { value: 'pool', label: t('detail.tabs.pool') },
      { value: 'holdings', label: t('detail.tabs.holdings') },
      {
        value: 'order',
        label: pendingOrdersCount
          ? t('detail.tabs.orders') + ` (${pendingOrdersCountString})`
          : t('detail.tabs.orders'),
      },
      { value: 'history', label: t('detail.tabs.history') },
      { value: 'devTokens', label: t('detail.tabs.devTokens') },
    ]
    // TODO: Remove this after the trades panel is implemented
    if (tradesPanelPosition === 'side') {
      return tabs.filter((tab) => tab.value !== 'trades')
    }
    return tabs
  }, [t, holdersLabelSuffix, pendingOrdersCount, tradesPanelPosition])

  // Remove holders on xstock path
  const visibleTabs = useMemo(() => {
    if (!isXstockPath) return baseTabs
    return baseTabs.filter((tab) => tab.value !== 'holders' && tab.value !== 'devTokens')
  }, [baseTabs, isXstockPath])

  // Determine initial tab with guards
  const computeValidDefaultTab = useCallback((): string => {
    const fromUrl = searchParams.get('tab')
    const candidate = fromUrl || currentDetailTab || 'holdings' // fallback to last tab
    const exists = visibleTabs.some((t) => t.value === candidate)
    return exists ? candidate : 'holdings'
  }, [searchParams, currentDetailTab, visibleTabs])

  const [currentTab, setCurrentTab] = useState<string>(computeValidDefaultTab)

  // Keep state in sync if URL or path filters change
  useEffect(() => {
    const next = computeValidDefaultTab()
    if (next !== currentTab) {
      setCurrentTab(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeValidDefaultTab])

  const handleClickBtnLogin = useCallback(() => {
    if (!isConnected) setShowLoginDrawer(true)
  }, [isConnected])

  const goConnectOr = useCallback(
    (component: React.ReactNode) =>
      isConnected ? (
        component
      ) : (
        <ConnectWalletPrompt
          onLogin={handleClickBtnLogin}
          openDrawer={showLoginDrawer}
          setOpenDrawer={setShowLoginDrawer}
          t={t}
        />
      ),
    [handleClickBtnLogin, isConnected, showLoginDrawer, t],
  )

  const handleChangeTab = useCallback(
    (tab: string) => {
      if (tab === currentTab) return
      setCurrentTab(tab)

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set('tab', tab)
        return newParams
      })

      dispatch(setCurrentDetailTab(tab))
    },
    [currentTab, dispatch, setSearchParams],
  )

  const disabledTabs = useMemo(() => (isWeb3Wallet ? ['order'] : []), [isWeb3Wallet])

  // Render by tab.value (refer to indices only for mapping clarity)
  const renderedTab = useMemo(() => {
    switch (currentTab) {
      case 'followed':
        return goConnectOr(<DetailTokenTabs tokenData={tokenData} />)

      case 'trades':
        return (
          <DetailTokenTableProvider>
            <TradingTransactionsTable
              symbol={tokenData?.symbol ?? undefined}
              price={tokenData?.price?.toString() ?? undefined}
              totalSupply={tokenData?.totalSupply?.toString() ?? undefined}
              decimals={tokenData?.decimals ? Number(tokenData?.decimals) : undefined}
              isDesktop
            />
          </DetailTokenTableProvider>
        )

      case 'holders':
        return <DetailHolderWrapper tokenData={tokenData} />

      case 'pool':
        return (
          <PollTransactionWrapper
            token={address}
            chainId={tokenData?.chainId ?? undefined}
            icon={tokenData?.info?.logoUrl ?? undefined}
            symbol={tokenData?.symbol ?? undefined}
            liquidity={tokenData?.liquidity ?? undefined}
            dexes={tokenData?.dexes ?? []}
          />
        )

      case 'order':
        return goConnectOr(<CurrentOrdersList currentToken={address} />)
      case 'holdings':
        return goConnectOr(<MyPositions tokenData={tokenData} />)
      case 'history':
        return goConnectOr(<TransactionHistory />)
      case 'devTokens':
        return <DevTokens tokenData={tokenData} tvChartHeight={tvChartHeight} />
      default:
        return goConnectOr(<MyPositions tokenData={tokenData} />)
    }
  }, [address, currentTab, goConnectOr, tokenData])

  useEffect(() => {
    eventBus.dispatch(EVENT_MESSAGE_ACTION_TAB_TRADE, {
      data: {
        paused: paused,
      },
    })
  }, [paused])

  // const setPaused = useCallback(() => {
  //   dispatch(setPaused(!paused))
  // }, [!paused])

  return (
    <>
      <div
        id="meme-bottom-tabs"
        className="mt-2.5 relative h-[calc(100%)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          // className="btn-drop-layout drag-handle absolute top-1 left-1/2 z-100 h-[20px] w-[20px] translate-x-[-50%] cursor-grab opacity-0 hover:opacity-100 active:cursor-grabbing"
          className={clsx(
            'btn-drop-layout drag-handle absolute top-1 left-1/2 z-100 h-[20px] w-[20px] translate-x-[-50%] cursor-grab active:cursor-grabbing',
            { 'opacity-100': isHovered, 'opacity-0': !isHovered },
          )}
        >
          <div className="mx-auto grid w-fit grid-cols-4 gap-0.5">
            {[...Array(8)].map((_, index) => (
              <div className="h-0.5 w-0.5 rounded-full bg-[#c6c3c3]" key={index}></div>
            ))}
          </div>
        </div>
        <TransactionsHistoryListener />
        <div className=" flex items-center pb-1 border-b-[0.5px] border-[#ECECED1F]">
          <MovingLineTabs
            tabs={visibleTabs}
            onTabChange={handleChangeTab}
            defaultTab={currentTab}
            wrapperClassName="bg-transparent z-10"
            itemClassName="!px-[7.1px] font-normal"
            containerClassName="bg-transparent after:h-[0] justify-start sticky z-[5] top-0"
            disabledTabs={disabledTabs}
          />
          <div className="ml-auto pr-4 flex items-center gap-2">
            {currentTab === 'trades' && paused && (
              <div
                className="flex items-center gap-1 bg-[#ececed14] rounded-[4px] px-2 py-1.5 cursor-pointer"
                // onClick={() => setPaused((prev) => !prev)}
              >
                {paused ? (
                  <IconPause className="text-gray-400" />
                ) : (
                  <IconPlay className="text-gray-400 w-3.5   h-3.5" />
                )}
                <p className="text-sm text-white/70 leading-none font-[380]">
                  {paused ? t('detail.trade.paused') : t('detail.trade.running')}
                </p>
              </div>
            )}
            <div
              className="flex items-center gap-1 bg-[#ececed14] rounded-[4px] px-2 py-1.5 cursor-pointer"
              onClick={() => setOpenDialogTrade(true)}
            >
              <IconFlash className="text-white" />
              <p className="text-sm text-white/70 leading-none font-[380]">{t('detail.tokenDetail.instantTrade')}</p>
            </div>
            {/* <div className="bg-[#ececed14] rounded-[4px] p-[5px] cursor-pointer" onClick={openBubbleMap}>
              <IconChartBubble className="text-[#B9B9B9]" />
            </div> */}
            <div className="flex items-center bg-[#ececed14] rounded-[4px] cursor-pointer p-[4px]">
              <BubbleMap />
            </div>
            <div
              className="bg-[#ececed14] size-[26px] rounded-[4px] flex items-center justify-center cursor-pointer"
              onClick={() => setTradesPanelPosition(tradesPanelPosition === 'side' ? 'bottom' : 'side')}
            >
              {tradesPanelPosition === 'bottom' ? (
                <IconTradesInBottom className="text-[#B9B9B9]" />
              ) : (
                <IconTradesInSide className="text-[#B9B9B9]" />
              )}
            </div>
          </div>
        </div>
        {renderedTab}
      </div>
      {openDialogTrade && (
        <OneClickTradeDialog openDrawer={openDialogTrade} setOpenDrawer={setOpenDialogTrade} tokenDetail={tokenData} />
      )}
    </>
  )
}

export default MemeDetailBottomTabsPc
