import useSignWallet from '@/hooks/useSignWallet'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { getDefaultTokenByChain, getPath } from '@/lib/utils.ts'
import { DiscoverNavLink } from '@components/common/bottomNav/DiscoverNavLink.tsx'
import NavLink, { NavLinkProps } from '@components/common/bottomNav/NavLink.tsx'
import { LoginDrawer } from '@components/common/LoginDrawer.tsx'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { LoginEvmDrawer } from '../LoginEvmDrawer'
import { useAppDispatch } from '@/redux/store'
import { getChainId, getDefaultMemeChain } from '@/lib/blockchain'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { Configs } from '@const/configs.ts'

const BottomNavDex = () => {
  const [currentNav, setCurrentNav] = useState<number>(0)
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const [showLoginEvmDrawer, setShowLoginEvmDrawer] = useState(false)

  useSignWallet({
    isAutoConnect: true,
  })

  const navItems: NavLinkProps[] = [
    {
      to: APP_PATH.FUTURES_DISCOVER,
      title: t('bottomNav.homepage'),
      icons: {
        default: '/images/icons/cyptoNavDex/nav-icon-discover.svg',
        active: '/images/icons/cyptoNavDex/nav-icon-discover-active.svg',
      },
    },
    {
      to: APP_PATH.MARKET,
      title: t('bottomNav.market'),
      icons: {
        default: '/images/icons/cyptoNavDex/nav-icon-market.svg',
        active: '/images/icons/cyptoNavDex/nav-icon-market-active.svg',
      },
    },
    {
      to: getFuturesTradePath(),
      title: t('bottomNav.trading'),
      matchRegex: /^\/futures\/[^/]+(\/token\/[^/]+)?$/, // 匹配 /futures/BTC 或 token 详情页
      // isMain: true,
      // isDexRouter: true,
      icons: {
        default: '/images/icons/cyptoNavDex/nav-icon-trade.svg',
        active: '/images/icons/cyptoNavDex/nav-icon-trade-active.svg',
      },
    },
    {
      to: APP_PATH.SMART_MONEY,
      title: t('bottomNav.smartMoney'),
      matchRegex: /^\/futures\/(supervisory(\?.*)?|smart-money(\/.*)?)$/,
      icons: {
        default: '/images/icons/cyptoNavDex/nav-icon-smart-money.svg',
        active: '/images/icons/cyptoNavDex/nav-icon-smart-money-active.svg',
      },
      isDisabled: false,
    },
    {
      to: APP_PATH.ASSETS,
      title: t('bottomNav.assets'),
      isDisabled: false,
      icons: {
        default: '/images/icons/cyptoNavDex/nav-icon-assets.svg',
        active: '/images/icons/cyptoNavDex/nav-icon-assets-active.svg',
      },
    },
  ]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    // if (index === 3) {
    //   return toast.error(t('bottomNav.comingSoon'))
    // }
    const shouldNavigate = navItems[index].onClick ? navItems[index].onClick(e) : true
    if (shouldNavigate) {
      setCurrentNav(index)
    }
  }

  const findActiveNavIndex = (pathname: string): number => {
    const sortedNavItems = navItems
      .map((item, index) => ({ ...item, originalIndex: index }))
      .sort((a, b) => String(b.to).length - String(a.to).length)

    for (const item of sortedNavItems) {
      if (item.matchRegex && item.matchRegex.test(pathname)) {
        return item.originalIndex
      }

      if (pathname === item.to) {
        return item.originalIndex
      }
      if (pathname.startsWith(String(item.to))) {
        const nextChar = pathname[String(item.to).length]
        if (!nextChar || nextChar === '/') {
          return item.originalIndex
        }
      }
    }

    return -1
  }

  useEffect(() => {
    const currentNavIndex = findActiveNavIndex(pathname)
    if (currentNavIndex !== -1) {
      setCurrentNav(currentNavIndex)
    }
    // else if (/^\/futures\/[^/]+\/token\/[^/]+$/.test(pathname)) {
    //   setCurrentNav(2) // Match to the trading tab
    // } else {
    //   setCurrentNav(0) // Default to the first tab if no match
    // }
  }, [pathname])

  return (
    <nav className="bg-(--bottom-nav-bg) border-[1px] border-(--bottom-nav-border-color) max-w-[768px] mx-auto h-[70px]">
      <div className="flex align-bottom mt-[8px]">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            {...item}
            isActive={currentNav === index}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleClick(e, index)}
            iconClassName="size-[26px]"
            textClassName="data-[state=active]:text-white data-[state=inactive]:text-[#79758C]"
          />
        ))}
      </div>
      <LoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      {showLoginEvmDrawer && <LoginEvmDrawer open={showLoginEvmDrawer} setOpen={setShowLoginEvmDrawer} />}
    </nav>
  )
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

const BottomNav = () => {
  const dispatch = useAppDispatch()
  const [currentNav, setCurrentNav] = useState<number>(0)
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const [showLoginEvmDrawer, setShowLoginEvmDrawer] = useState(false)
  const memeChain = getDefaultMemeChain()
  const chainId = getChainId(memeChain)

  useEffect(() => {
    dispatch(newWalletActions.setActiveChain(memeChain))
  }, [])

  useSignWallet({
    isAutoConnect: true,
  })
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

  const navItems: NavLinkProps[] = [
    {
      to: APP_PATH.MEME_DISCOVER,
      title: t('bottomNav.discover'),
      icons: {
        default: '/images/icons/bottomNav/nav-icon-discover.svg',
        active: '/images/icons/bottomNav/nav-icon-discover-active.svg',
      },
    },
    {
      to: APP_PATH.MEME_SMART_MONEY,
      title: t('bottomNav.smartMoney'),
      icons: {
        default: '/images/icons/bottomNav/nav-icon-smart-money.svg',
        active: '/images/icons/bottomNav/nav-icon-smart-money-active.svg',
      },
    },
    {
      to: getTradePath(),
      title: t('bottomNav.trading'),
      icons: {
        default: '/images/icons/bottomNav/nav-icon-trade.svg',
        active: '/images/icons/bottomNav/nav-icon-trade-active.svg',
      },
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        const isMatch = /^\/meme\/[^/]+\/token\/[^/]+$/.test(pathname)
        if (isMatch) {
          e.preventDefault()
          return false
        }
      },
    },
    {
      to: APP_PATH.MEME_MONITORING,
      title: t('bottomNav.monitoring'),
      icons: {
        default: '/images/icons/bottomNav/nav-icon-monitoring.svg',
        active: '/images/icons/bottomNav/nav-icon-monitoring-active.svg',
      },
    },
    {
      to: APP_PATH.ASSETS + '?main=meme',
      title: t('bottomNav.assets'),
      isDisabled: false,
      icons: {
        default: '/images/icons/bottomNav/nav-icon-assets.svg',
        active: '/images/icons/bottomNav/nav-icon-assets-active.svg',
      },
    },
  ]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const shouldNavigate = navItems[index].onClick ? navItems[index].onClick(e) : true
    if (shouldNavigate) {
      setCurrentNav(index)
    }
  }

  useEffect(() => {
    const currentNav = navItems.findIndex((item) => pathname.includes(item.to.toString()))
    console.log('currentNav', currentNav)
    //const isMatch = /^\/meme\/[^/]+\/token\/[^/]+$/.test(pathname)
    if (currentNav !== -1) {
      setCurrentNav(currentNav)
    } else if (/^\/meme\/[^/]+\/token\/[^/]+$/.test(pathname)) {
      setCurrentNav(2) // Match to the trading tab
    } else if (pathname.startsWith(APP_PATH.ASSETS)) {
      setCurrentNav(4) // Match to the assets tab
    }
  }, [pathname])

  return (
    <nav
      id="bottom-nav"
      className="bg-(--bottom-nav-bg) border-[1px] border-(--bottom-nav-border-color) max-w-[768px] mx-auto h-[70px]"
    >
      <div className="flex align-bottom mt-[8px]">
        {navItems.map((item, index) => {
          if (index === 0) {
            return <DiscoverNavLink key={index} isActive={currentNav === 0} onClick={(e) => handleClick(e, 0)} />
          }
          return (
            <NavLink
              key={index}
              {...item}
              isActive={currentNav === index}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleClick(e, index)}
              iconClassName="size-[26px]"
              textClassName="data-[state=active]:text-white data-[state=inactive]:text-[#79758C]"
            />
          )
        })}
      </div>
      <LoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      {showLoginEvmDrawer && <LoginEvmDrawer open={showLoginEvmDrawer} setOpen={setShowLoginEvmDrawer} />}
    </nav>
  )
}

export { BottomNav, BottomNavDex }
