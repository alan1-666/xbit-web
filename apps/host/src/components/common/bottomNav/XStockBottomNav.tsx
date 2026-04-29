import NavLink, { NavLinkProps } from '@components/common/bottomNav/NavLink.tsx'
import { APP_PATH } from '@/lib/constant.ts'
import { LoginDrawer } from '@components/common/LoginDrawer.tsx'
import { LoginEvmDrawer } from '@components/common/LoginEvmDrawer.tsx'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPath } from '@/lib/utils.ts'
import { XStockNavLink } from '@components/common/bottomNav/XStockNavLink.tsx'
import ls from '@/lib/local-storage'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'

const X_STOCK_DEFAULT_TOKEN = 'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB'

export const XStockBottomNav = () => {
  const [currentNav, setCurrentNav] = useState<number>(0)
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const [showLoginEvmDrawer, setShowLoginEvmDrawer] = useState(false)
  const activeWallet = useSelector(_activeWallet)

  const getTradePath = () => {
    const recentToken = sessionStorage.getItem('xStockRecentToken')
      ? JSON.parse(sessionStorage.getItem('xStockRecentToken')!)
      : null
    if (!recentToken)
      return getPath(APP_PATH.X_STOCK_DETAIL, {
        address: X_STOCK_DEFAULT_TOKEN,
        chain: 'sol',
      })
    return getPath(APP_PATH.X_STOCK_DETAIL, {
      address: recentToken.token,
      chain: recentToken.chain,
    })
  }

  // 缓存路由函数
  // const cacheRoute = (path: string) => {
  //   if (activeWallet?.isConnected) {
  //     const cacheData = {
  //       tab: 'xstocks', // xstock 相关页面都归类到 xstocks tab
  //       path: path,
  //       timestamp: Date.now()
  //     }
  //     ls.set('cached_route', cacheData)
  //     console.log('💾 Cached route via bottom nav (xstock):', cacheData)
  //   }
  // }

  const navItems: NavLinkProps[] = [
    {
      to: APP_PATH.XSTOCKS,
      title: t('bottomNav.homepage'),
      icons: {
        default: '/images/icons/xstockNavDex/nav-icon-discover.svg',
        active: '/images/icons/xstockNavDex/nav-icon-discover-active.svg',
      },
    },
    {
      to: getTradePath(),
      title: t('bottomNav.trading'),
      icons: {
        default: '/images/icons/xstockNavDex/nav-icon-trade.svg',
        active: '/images/icons/xstockNavDex/nav-icon-trade-active.svg',
      },
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        const isMatch = /^\/xstocks\/[^/]+\/token\/[^/]+$/.test(pathname)
        if (isMatch) {
          e.preventDefault()
          return false
        }
      },
    },
    {
      to: APP_PATH.ASSETS + '?main=xstock',
      title: t('bottomNav.assets'),
      isDisabled: false,
      icons: {
        default: '/images/icons/xstockNavDex/nav-icon-assets.svg',
        active: '/images/icons/xstockNavDex/nav-icon-assets-active.svg',
      },
    },
  ]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const shouldNavigate = navItems[index].onClick ? navItems[index].onClick(e) : true
    if (shouldNavigate) {
      setCurrentNav(index)
      // 缓存当前点击的路由
      // const targetPath = navItems[index].to as string
      // if (targetPath) {
      //   cacheRoute(targetPath)
      // }
    }
  }

  useEffect(() => {
    const currentNav = navItems.findIndex((item) => pathname.includes(item.to.toString()))
    //const isMatch = /^\/meme\/[^/]+\/token\/[^/]+$/.test(pathname)
    if (currentNav !== -1) {
      setCurrentNav(currentNav)
    } else if (/^\/xstocks\/[^/]+\/token\/[^/]+$/.test(pathname)) {
      setCurrentNav(1) // Match to the trading tab
    }
  }, [pathname])

  return (
    <nav
      id="bottom-nav"
      className="bg-(--bottom-nav-bg) border-[1px] border-(--bottom-nav-border-color) max-w-[768px] mx-auto h-[70px]"
    >
      <div className="flex align-bottom mt-[8px] justify-between">
        {navItems.map((item, index) => {
          if (index === 0)
            return <XStockNavLink isActive={currentNav === 0} onClick={(event) => handleClick(event, 0)} />
          return (
            <NavLink
              key={index}
              {...item}
              isActive={currentNav === index}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleClick(e, index)}
              className="flex-1"
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
