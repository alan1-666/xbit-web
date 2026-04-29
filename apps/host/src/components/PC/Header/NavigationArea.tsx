import { NavigationMenu, NavigationMenuList } from '@components/ui/navigation-menu.tsx'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { NavigationLinkItem } from './NavigationMenuItem'
import { NavigationDropdownItem } from './NavigationDropdownItem'
import { NavigationItemData } from '@components/PC/Header/NavigationItemData.ts'
import { APP_PATH } from '@/lib/constant.ts'
import { AirdropNavigationLinkItem } from '@components/PC/Header/AirdropNavigationLinkItem.tsx'
import { RedpacketNavigationLinkItem } from '@components/PC/Header/RedpacketNavigationLinkItem.tsx'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch } from '@/redux/store'
import { walletActions } from '@/redux/modules/wallet.slice.ts'
import { newWalletActions } from '@/redux/modules/newWallet.slice.ts'
import ls from '@/lib/local-storage.ts'
import { getDefaultMemeChain, TYPE_CHAIN } from '@/lib/blockchain.ts'
import { Configs } from '@const/configs.ts'
import { cn } from '@/lib/utils.ts'
import {
  IconCashback,
  IconDocs,
  IconFeedback,
  IconMarketData,
  IconMeme,
  IconPerpetualFutures,
  IconSmartMoney2,
  IconReferral,
  IconSmartMoney,
  IconWalletTracker,
  IconXStocks,
  IconWalletTracker2,
  IconPrediction,
} from '@components/icon/navbar'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

const NON_FUTURES_TRADE_PATHS = [
  APP_PATH.ASSETS,
  APP_PATH.FUTURES_TRANSFER,
  APP_PATH.FUTURES_POSITION,
  APP_PATH.MARKET,
  APP_PATH.SMART_MONEY,
  APP_PATH.SUPERVISORY,
]

const SMART_MONEY_PATHS = [
  APP_PATH.MEME_SMART_MONEY,
  APP_PATH.SMART_MONEY,
  APP_PATH.MEME_MONITORING,
  APP_PATH.SUPERVISORY,
]

const isFuturesTradePath = (path: string) => {
  return path.startsWith(APP_PATH.FUTURES) && NON_FUTURES_TRADE_PATHS.every((p) => !path.startsWith(p))
}

const isSmartMoneyRoute = (path: string) => {
  return SMART_MONEY_PATHS.some((p) => path.startsWith(p))
}

const useMenu = () => {
  const { t } = useTranslation()
  const enablePredictionMarket = useFeatureIsOn('enable_prediction')
  return useMemo<NavigationItemData[]>(() => {
    return [
      {
        key: 'trade',
        title: t('header.trade'),
        isActive: (currentPath: string) => {
          if (isFuturesTradePath(currentPath)) return true
          if (currentPath.startsWith(APP_PATH.MEME_DISCOVER)) return true
          if (currentPath.startsWith(APP_PATH.XSTOCKS)) return true
          // Default return false
          return false
        },
        children: [
          {
            key: 'perps',
            title: t('header.cryptoPC'),
            subTitle: t('header.perpsSubtitle'),
            href: () => {
              const recentSymbol = sessionStorage.getItem('recentFuturesSymbol') || 'BTC'
              return NAVIGATIONS.perpetual.details(recentSymbol)
            },
            icon: <IconPerpetualFutures className="text-current size-5" />,
          },
          {
            key: 'meme',
            title: t('header.meme'),
            subTitle: t('header.memeSubtitle'),
            href: NAVIGATIONS.meme.discover(),
            icon: <IconMeme className="text-current size-5" />,
          },
          {
            key: 'xStocks',
            title: t('header.xstocks'),
            subTitle: t('header.xStocksSubtitle'),
            href: NAVIGATIONS.xStocks.discover(),
            icon: <IconXStocks className="text-current size-5" />,
            hidden: !Configs.enableSolana(),
          },
          {
            key: 'prediction',
            title: t('header.prediction'),
            subTitle: t('header.predictionSubtitle'),
            href: NAVIGATIONS.prediction.home(),
            icon: <IconPrediction className="text-current size-5" />,
            hidden: !enablePredictionMarket,
          },
        ],
      },
      {
        key: 'smart-money-group',
        title: t('header.smart-money'),
        isActive: (currentPath: string) => {
          return isSmartMoneyRoute(currentPath)
        },
        children: [
          {
            key: 'perps-sm',
            title: t('header.perpsSmartMoney'),
            subTitle: t('header.perpsSmartMoneySubtitle'),
            href: Configs.enablePerpetualSmartMoney() ? NAVIGATIONS.perpetual.smartMoney() : undefined,
            icon: <IconSmartMoney className="text-current size-5" />,
          },
          {
            key: 'perps-monitoring',
            title: t('header.perpsWalletTracker'),
            subTitle: t('header.perpsWalletTrackerSubtitle'),
            href: NAVIGATIONS.perpetual.supervisory(),
            icon: <IconWalletTracker className="text-current size-5" />,
          },
          {
            key: 'meme-sm',
            title: t('header.memeSmartMoney'),
            subTitle: t('header.memeSmartMoneySubtitle'),
            href: NAVIGATIONS.meme.smartMoney(),
            icon: <IconSmartMoney2 className="text-current size-5" />,
          },
          {
            key: 'meme-monitoring',
            title: t('header.memeWalletTracker'),
            subTitle: t('header.memeWalletTrackerSubtitle'),
            href: NAVIGATIONS.meme.monitoringRealtimeTx(),
            icon: <IconWalletTracker2 className="text-current size-5" />,
          },
        ],
      },
      {
        key: 'portfolio',
        title: t('header.portfolio'),
        href: NAVIGATIONS.meme.assets(),
        isActive: (currentPath: string) => {
          return currentPath.includes('/assets')
        },
      },
      {
        key: 'rewards',
        title: t('header.Rewards'),
        isActive: (currentPath: string) => {
          return currentPath.startsWith(APP_PATH.TRADE_REWARDS) || currentPath.startsWith(APP_PATH.NODE_AGENT)
        },
        children: [
          {
            key: 'cashback',
            title: t('header.cashback'),
            subTitle: t('header.cashbackSubtitle'),
            href: NAVIGATIONS.tradeRewards(),
            icon: <IconCashback className="text-current size-5" />,
          },
          {
            key: 'referrals',
            title: t('header.referral'),
            subTitle: t('header.referralSubtitle'),
            href: NAVIGATIONS.referrals(),
            icon: <IconReferral className="text-current size-5" />,
          },
        ],
      },
      {
        key: 'more',
        title: t('header.more'),
        children: [
          {
            key: 'fundingRate',
            title: t('fundingRate.title.header'),
            href: NAVIGATIONS.perpetual.fundingRate(),
            disabled: false,
            icon: <IconMarketData className="text-current size-5" />,
          },
          {
            key: 'docs',
            title: t('header.docs'),
            href: 'https://docs.xbit.com',
            external: true,
            icon: <IconDocs className="text-current size-5" />,
          },
          {
            key: 'feedback',
            title: t('header.feedback'),
            href: 'https://discord.com/invite/xbit',
            external: true,
            icon: <IconFeedback className="text-current size-5" />,
          },
        ],
      },
      {
        key: 'airdrop',
        title: 'Airdrop',
        href: NAVIGATIONS.airdrop(),
        customRender: () => <AirdropNavigationLinkItem />,
      },
      {
        key: 'redpacket',
        title: 'Redpacket',
        href: NAVIGATIONS.redpacket(),
        customRender: () => <RedpacketNavigationLinkItem />,
      },
    ]
  }, [t, enablePredictionMarket])
}

const useSwitchActiveChain = () => {
  const location = useLocation()
  const { pathname } = location
  const dispatch = useAppDispatch()

  useEffect(() => {
    // futures/discover use ARB chain，but futures/market should use meme chain
    if (pathname.includes(APP_PATH.FUTURES) && !pathname.includes(APP_PATH.MARKET)) {
      ls.set('selected_chain', TYPE_CHAIN.ARB)
      dispatch(walletActions.setActiveChain(TYPE_CHAIN.ARB))
      dispatch(newWalletActions.setActiveChain(TYPE_CHAIN.ARB))
    } else {
      if (pathname.includes('xstocks')) {
        return
      }
      //force switch to chain solana
      const memeChain = getDefaultMemeChain()
      const memeAccount = ls.get('meme_account')
      // ls.set('selected_chain', memeChain)
      dispatch(walletActions.setActiveChain(memeChain))
      dispatch(newWalletActions.setActiveChain(memeChain))
      dispatch(walletActions.setActiveAccount(memeAccount))
    }
  }, [pathname])
}

export const NavigationArea = () => {
  const menu = useMenu()
  useSwitchActiveChain()

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const regularItems = useMemo(() => menu.filter((item) => !item.customRender), [menu])
  const customRenderItems = useMemo(() => menu.filter((item) => !!item.customRender), [menu])

  const handleWheel = useCallback((e: WheelEvent) => {
    const el = scrollContainerRef.current
    if (!el) return
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      el.scrollLeft += e.deltaY
      e.preventDefault()
    }
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  return (
    <div className="flex-1 min-w-0 flex items-center gap-2 2xl:gap-4">
      <NavigationMenu viewport={false} className="min-w-0 max-w-full justify-start w-full">
        <div className="grow-0 shrink min-w-0 max-w-full relative">
          <div
            ref={scrollContainerRef}
            className={cn(
              'overflow-x-auto no-scrollbar flex items-center gap-2 2xl:gap-4 min-h-9 min-w-0',
            )}
            style={{ WebkitTouchCallout: 'none' }}
          >
            <NavigationMenuList className="flex items-center gap-2 2xl:gap-4 min-w-max list-none">
              {regularItems.map((item) =>
                item.children && item.children.length > 0 ? (
                  <NavigationDropdownItem key={item.key} item={item} />
                ) : (
                  <NavigationLinkItem key={item.key} menuItem={item} />
                ),
              )}
            </NavigationMenuList>
          </div>
        </div>

        {customRenderItems.length > 0 && (
          <div className="flex items-center gap-2 2xl:gap-4 shrink-0 pl-2">
            {customRenderItems.map((item) => (
              <div key={item.key}>{item.customRender?.()}</div>
            ))}
          </div>
        )}
      </NavigationMenu>
    </div>
  )
}
