import { getChainId, getDefaultMemeChain } from '@/lib/blockchain'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { cn } from '@/lib/utils'
import { getDefaultTokenByChain, getPath } from '@/lib/utils.ts'
import IconAssets from '@components/icon/stroke/menu/IconAssets.tsx'
import IconHome from '@components/icon/stroke/menu/IconHome.tsx'
import IconMarkets from '@components/icon/stroke/menu/IconMarkets.tsx'
import IconPerps from '@components/icon/stroke/menu/IconPerps.tsx'
import IconPrediction from '@components/icon/stroke/menu/IconPrediction.tsx'
import IconSmartMoney from '@components/icon/stroke/menu/IconSmartMoney.tsx'
import IconSpot from '@components/icon/stroke/menu/IconSpot.tsx'
import IconTrade from '@components/icon/stroke/menu/IconTrade.tsx'
import { usePredictionEventPath } from '@components/common/bottomNav/usePredictionEventPath'
import { Configs } from '@const/configs.ts'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

interface MenuItem {
  key: string
  keys?: string[]
  label: string
  icon: React.ReactNode
  onClick?: () => void
  subMenu?: MenuItem[]
  hidden?: boolean
}

type RecentToken = {
  chain: string
  token: string
}

const getRecentToken = () => {
  const supportedChains = Configs.supportedRouteChains()
  const recentToken: RecentToken | null = sessionStorage.getItem('recentToken')
    ? JSON.parse(sessionStorage.getItem('recentToken')!)
    : null
  if (!recentToken) return null
  if (!supportedChains.includes(recentToken.chain)) return null
  return recentToken
}

const GlassLiquidNav = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const memeChain = getDefaultMemeChain()
  const chainId = getChainId(memeChain)
  const enablePrediction = useFeatureIsOn('enable_prediction')

  const getTradePath = () => {
    const recentToken = getRecentToken()

    const chain = CHAIN_SYMBOLS[chainId] || memeChain
    if (!recentToken || recentToken?.chain !== chain) {
      return getPath(APP_PATH.MEME_TOKEN_DETAIL, {
        address: getDefaultTokenByChain(chain),
        chain: chain,
      })
    }
    return getPath(APP_PATH.MEME_TOKEN_DETAIL, {
      address: recentToken.token || getDefaultTokenByChain(chain),
      chain: chain,
    })
  }

  const { eventDetailsPath } = usePredictionEventPath()

  const menu = useMemo<MenuItem[]>(() => {
    return [
      {
        key: 'home',
        keys: [APP_PATH.FUTURES_DISCOVER, APP_PATH.MEME_DISCOVER],
        label: t('bottomNav.homepage'),
        icon: <IconHome />,
        onClick: () => {
          navigate('/')
        },
      },
      {
        key: 'markets',
        keys: [APP_PATH.MARKET],
        label: t('bottomNav.market'),
        icon: <IconMarkets />,
        subMenu: [
          {
            key: 'mk-perps',
            keys: [APP_PATH.MARKET + '/contract'],
            label: t('assets.futures.futures'),
            icon: <IconPerps />,
            onClick: () => {
              navigate(APP_PATH.MARKET + '/contract')
            },
          },
          {
            key: 'mk-meme',
            keys: [APP_PATH.MARKET + '/meme'],
            label: t('assets.funding.meme'),
            icon: <IconSpot />,
            onClick: () => {
              navigate(APP_PATH.MARKET + '/meme/meme?tab=new')
            },
          },
          {
            key: 'mk-prediction',
            keys: [APP_PATH.MARKET + '/prediction'],
            label: t('assets.prediction.prediction'),
            icon: <IconPrediction />,
            onClick: () => {
              navigate(APP_PATH.MARKET + '/prediction')
            },
            hidden: !enablePrediction,
          },
        ],
      },
      {
        key: 'trade',
        keys: [
          APP_PATH.FUTURES,
          APP_PATH.PREDICTION.ROOT,
          '/meme/mon/',
          '/meme/sol/',
          '/meme/bsc/',
          '/prediction/event/',
        ],
        label: t('bottomNav.trading'),
        icon: <IconTrade />,
        subMenu: [
          {
            key: 'trade-perps',
            keys: [APP_PATH.FUTURES],
            label: t('assets.futures.futures'),
            icon: <IconPerps />,
            onClick: () => {
              navigate(APP_PATH.FUTURES)
            },
          },
          {
            key: 'trade-meme',
            keys: ['/meme/mon/', '/meme/sol/', '/meme/bsc/'],
            label: t('assets.funding.meme'),
            icon: <IconSpot />,
            onClick: () => {
              navigate(getTradePath())
            },
          },
          {
            key: 'trade-prediction',
            keys: [APP_PATH.PREDICTION.ROOT, '/prediction/event/'],
            label: t('assets.prediction.prediction'),
            icon: <IconPrediction />,
            onClick: () => {
              // Mark entry so EventDetails back button can return to Market prediction tab
              navigate(eventDetailsPath, { state: { fromGlassLiquidNav: true } })
            },
            hidden: !enablePrediction,
          },
        ],
      },
      {
        key: 'smart-money',
        keys: ['/smart-money'],
        label: t('bottomNav.smartMoney'),
        icon: <IconSmartMoney />,
        subMenu: [
          {
            key: 'sm-perps',
            keys: [APP_PATH.SMART_MONEY],
            label: t('assets.futures.futures'),
            icon: <IconPerps />,
            onClick: () => {
              navigate(APP_PATH.SMART_MONEY)
            },
          },
          {
            key: 'sm-meme',
            keys: [APP_PATH.MEME_SMART_MONEY],
            label: t('assets.funding.meme'),
            icon: <IconSpot />,
            onClick: () => {
              navigate(APP_PATH.MEME_SMART_MONEY)
            },
          },
        ],
      },
      {
        key: 'assets',
        keys: ['/assets'],
        label: t('bottomNav.assets'),
        icon: <IconAssets />,
        onClick: () => {
          navigate(APP_PATH.ASSETS)
        },
      },
    ]
  }, [getTradePath, eventDetailsPath, enablePrediction])

  const [activeItem, setActiveItem] = useState<string | number>(menu[0].key)
  const [subMenu, setSubMenu] = useState<MenuItem[] | null>(null)
  const [parentKey, setParentKey] = useState<string | number | null>(null)

  useEffect(() => {
    for (const item of menu) {
      if (location.pathname.includes('futures/smart-money') || location.pathname.includes('/supervisory')) {
        setParentKey('smart-money')
        localStorage.setItem(`lastActive${'smart-money'}`, 'sm-perps')
        setActiveItem('sm-perps')
        const sm = menu.find((m) => m.key === 'smart-money')
        setSubMenu(sm?.subMenu || null)
        return
      }
      if (location.pathname.includes('/assets')) {
        setActiveItem('assets')
        setSubMenu(null)
        return
      }
      if (item.keys && item.keys.some((key) => location.pathname.includes(key))) {
        if (item.subMenu) {
          const matchedSub = item.subMenu.find(
            (sub) => sub.keys && sub.keys.some((key) => location.pathname.includes(key)),
          )
          if (matchedSub) {
            setParentKey(item.key)
            localStorage.setItem(`lastActive${item.key}`, matchedSub.key)
            setActiveItem(matchedSub.key)
            setSubMenu(item.subMenu)
            return
          } else {
            setSubMenu(null)
          }
        }
        setActiveItem(item.key)
        setSubMenu(null)
        return
      }
      setActiveItem('home')
      setSubMenu(null)
    }
  }, [location.pathname])

  return (
    <footer className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4">
      <AnimatePresence>
        <div className="relative h-[60px] w-fit overflow-hidden rounded-[30px] border-[0.5px] border-[#2F2A4680] bg-white/10 p-1.5 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl select-none active:scale-105">
          {!subMenu ? (
            <motion.div
              key="main"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', duration: 0.2 }}
              className="flex justify-center"
            >
              {menu.map((item) => (
                <div key={item.key}>
                  <div
                    onClick={() => {
                      if (item.subMenu) {
                        setParentKey(item.key)
                        const lastActiveSubKey = localStorage.getItem(`lastActive${item.key}`)
                        const lastActiveSub = item.subMenu.find((sub) => sub.key === lastActiveSubKey)
                        setActiveItem(lastActiveSub ? lastActiveSub.key : item.subMenu[0].key)
                        setSubMenu(item.subMenu)
                        lastActiveSub ? lastActiveSub?.onClick() : item.subMenu[0].onClick?.()
                      } else {
                        setActiveItem(item.key)
                        item.onClick && item.onClick()
                      }
                    }}
                    className={cn(
                      'group flex min-h-[48px] min-w-[68px] cursor-pointer flex-col items-center justify-center text-white/80 hover:scale-105 active:scale-110 active:rounded-[30px] active:bg-white/10',
                      activeItem == item.key ? 'text-[#947DFF]' : 'text-white/80',
                    )}
                  >
                    {item.icon}
                    <span className="no-wrap mt-1 text-[11px] font-normal">{item.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="sub"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', duration: 0.2 }}
              className="flex justify-center"
            >
              {subMenu
                .filter((item) => !item.hidden)
                .map((item) => (
                  <div key={item.key}>
                    <div
                      onClick={() => {
                        localStorage.setItem(`lastActive${parentKey!}`, item.key)
                        setActiveItem(item.key)
                        item.onClick && item.onClick()
                      }}
                      className={cn(
                        'group flex min-h-[48px] min-w-[68px] cursor-pointer flex-col items-center justify-center text-white/80 hover:scale-105 active:scale-110 active:rounded-[30px] active:bg-white/10',
                        activeItem === item.key ? 'text-[#947DFF]' : 'text-white/80',
                      )}
                    >
                      {item.icon}
                      <span className="no-wrap mt-1 text-[11px] font-normal">{item.label}</span>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}
        </div>
        {subMenu && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', duration: 0.2 }}
            onClick={() => {
              setSubMenu(null)
              setActiveItem('home')
              navigate('/')
            }}
            className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-[0.5px] border-[#2F2A4680] bg-white/10 text-white shadow-[inset_1px_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl select-none hover:scale-105 active:scale-115"
          >
            <div className="flex h-[60px] w-[60px] items-center justify-center active:scale-105 active:rounded-[30px] active:bg-white/10">
              <img src="/images/icons/big-close.svg" alt="Back" className="h-6 w-6" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}

export default GlassLiquidNav
