import Text from '@/components/common/Text'
import { ArrowDownIcon } from '@/components/icon/ArrowDownIcon'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getDefaultMemeChain, TYPE_CHAIN } from '@/lib/blockchain'
import { APP_PATH } from '@/lib/constant'
import ls from '@/lib/local-storage'
import { cn } from '@/lib/utils'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { _activeWallet, newWalletActions } from '@/redux/modules/newWallet.slice'
import { HeaderTab, routerActions } from '@/redux/modules/router.slice.ts'
import { walletActions } from '@/redux/modules/wallet.slice'
import { useAppSelector } from '@/redux/store'
import { UITab } from '@/types/uiTabs'
import { MovingBgTabsHandle } from '@components/common/MovingBgTabs.tsx'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import ChangeChainButton from '../ChangeChainButton'
import DialogLoginNewLoginDrawer from '../DialogLoginNewLoginDrawer'
import DropdownUserSetting from '../DropdownUserSetting'
import HeaderNotifications from '../HeaderNotifications'
import MovingTabs from '../MovingTabs'
import Search from '../Search'
import Setting from '../Setting'
import { WalletOverview } from '../WalletOverview'
import { Configs } from '@/const/configs'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { NAVIGATIONS } from '@/lib/navigations.ts'

const getDefaultTab = () => {
  const pathname = window.location.pathname

  if (pathname === '/') return 'meme'
  if (pathname.includes(APP_PATH.SMART_MONEY)) return 'smart-money'
  if (pathname.includes(APP_PATH.SUPERVISORY)) return 'supervisory'
  if (pathname.startsWith(APP_PATH.FUTURES)) return 'crypto'
  if (pathname.startsWith(APP_PATH.SPOTS)) return 'spots'
  if (pathname.startsWith(APP_PATH.XSTOCKS)) return 'xstocks'
  if (pathname.startsWith(APP_PATH.ASSETS)) return 'assets'
  return 'meme'
}

/**
 * Header component for PC layout.
 * @constructor
 * @deprecated use HeaderPCV3 instead
 */
const HeaderPC = () => {
  const headerTab = useAppSelector((state) => state.router.headerTab)
  const activeWallet = useSelector(_activeWallet)
  const activeChain = useActiveChain()
  const { t } = useTranslation()
  const ref = useRef<MovingBgTabsHandle>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location
  const dispatch = useDispatch()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [openMoreMenu, setOpenMoreMenu] = useState(false)
  const moreMenuRef = useRef<HTMLButtonElement>(null)
  // const isFutures = location.pathname.includes('futures') || location.search.includes('futures')
  const enabled = useFeatureIsOn('show_loyalty')
  const handleClick = () => {
    setShowLoginDrawer(true)
  }

  const allTabs = useMemo<UITab[]>(() => {
    return [
      {
        value: 'crypto',
        label: t('header.cryptoPC'),
      },
      {
        value: 'meme',
        label: t('header.meme'),
      },
      {
        value: 'xstocks',
        label: t('header.xstocks'),
        hidden: !Configs.enableSolana(),
      },
      { value: 'prediction', label: 'Prediction' },
      {
        value: 'spots',
        label: t('header.spots'),
        disabled: true,
      },
      {
        value: 'smart-money',
        label: t('header.smart-money'),
      },
      {
        value: 'supervisory',
        label: t('header.supervisory'),
      },
      {
        value: 'assets',
        label: t('header.portfolio'),
      },
      {
        value: 'referral',
        label: t('header.referral'),
        // disabled: true,
      },
      {
        value: 'points',
        label: t('menu.options.airdropPoints'),
        disabled: !enabled,
      },
      {
        value: 'Rewards',
        label: t('header.Rewards'),
        // disabled: true,
      },
      {
        value: 'more',
        label: t('header.more'),
      },
    ]
  }, [t, enabled])

  // Use `satisfies` to keep `value` inferred as `string` (avoid `string | undefined` from `UITab['value']`)
  const headerTabs = useMemo(() => {
    return allTabs.filter((t) => !t.hidden)
  }, [allTabs])

  const recentFuturesSymbol = sessionStorage.getItem('recentFuturesSymbol') || 'BTC'
  const recentSpotsSymbol = sessionStorage.getItem('recentSpotsSymbol') || 'BTC'

  // const tabPaths: Record<string, string> = {
  //   [headerTabs[0].value]: APP_PATH.FUTURES + `/${recentFuturesSymbol}`, // crypto
  //   [headerTabs[1].value]: APP_PATH.MEME_DISCOVER + '?page=meme', // meme
  //   [headerTabs[3].value]: APP_PATH.SPOTS + `/${recentSpotsSymbol}`, // spots
  //   [headerTabs[2].value]: APP_PATH.XSTOCKS + '?page=popular', // xstocks
  //   [headerTabs[6].value]: APP_PATH.ASSETS + '', // ASSETS
  //   [headerTabs[6].value]: APP_PATH.LOYALTY, // LOYALTY
  //   [headerTabs[4].value]: APP_PATH.SMART_MONEY, // smart money
  //   [headerTabs[5].value]: APP_PATH.SUPERVISORY, // supervisory
  // }

  const tabPaths: Record<string, string> = {
    crypto: APP_PATH.FUTURES + `/${recentFuturesSymbol}`,
    meme: APP_PATH.MEME_DISCOVER + '/meme',
    xstocks: APP_PATH.XSTOCKS + '?page=popular',
    spots: APP_PATH.SPOTS + `/${recentSpotsSymbol}`,
    'smart-money': APP_PATH.SMART_MONEY,
    supervisory: APP_PATH.SUPERVISORY,
    assets: APP_PATH.ASSETS,
    referral: APP_PATH.NODE_AGENT + '', // AGENT
    points: APP_PATH.LOYALTY, // LOYALTY
    Rewards: APP_PATH.TRADE_REWARDS + '', // TRADE_REWARDS
    prediction: NAVIGATIONS.prediction.home(),
  }

  // Check scroll position to show/hide fade effects
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  // Handle scroll functions
  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: -100, behavior: 'smooth' })
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: 100, behavior: 'smooth' })
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Initial check
    checkScrollPosition()

    // Add scroll listener
    container.addEventListener('scroll', checkScrollPosition)

    // Add resize listener to recheck when window resizes
    const handleResize = () => {
      setTimeout(checkScrollPosition, 100) // Small delay to ensure layout is updated
    }
    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('scroll', checkScrollPosition)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (!ref.current) return
    let currentPathTab: string
    const locationPathname = window.location.pathname
    if (locationPathname.startsWith('/xstocks')) {
      ref.current.selectTab('xstocks')
      currentPathTab = 'xstocks'
    } else if (locationPathname.includes('/smart-money')) {
      ref.current.selectTab('smart-money')
      currentPathTab = 'smart-money'
    } else if (locationPathname.includes('/supervisory')) {
      ref.current.selectTab('supervisory')
      currentPathTab = 'supervisory'
    } else if (locationPathname.startsWith('/futures')) {
      ref.current.selectTab('crypto')
      currentPathTab = 'crypto'
    } else if (locationPathname.startsWith('/spots')) {
      ref.current.selectTab('spots')
      currentPathTab = 'spots'
    } else if (locationPathname.includes('/assets')) {
      ref.current.selectTab('assets')
      currentPathTab = 'assets'
    } else if (locationPathname.includes('/agent')) {
      ref.current.selectTab('referral')
      currentPathTab = 'referral'
    } else if (locationPathname.includes(APP_PATH.LOYALTY)) {
      ref.current.selectTab('points')
      currentPathTab = 'points'
    } else if (locationPathname.includes(APP_PATH.TRADE_REWARDS)) {
      ref.current.selectTab('Rewards')
      currentPathTab = 'Rewards'
    } else if (locationPathname.includes(APP_PATH.PREDICTION.ROOT)) {
      ref.current.selectTab('prediction')
      currentPathTab = 'prediction'
    } else {
      ref.current.selectTab('meme')
      currentPathTab = 'meme'
    }

    dispatch(routerActions.setHeaderTab(currentPathTab as HeaderTab))
    // Recheck scroll position when tab changes
    setTimeout(checkScrollPosition, 100)
  }, [ref.current, location.pathname, dispatch])

  const handleTabChange = (tab: string) => {
    const selectedTab = headerTabs.find((t) => t.value == tab)
    if (selectedTab?.disabled) return

    if (tabPaths[tab]) {
      navigate(tabPaths[tab])
    }

    // Save the path of current tab
    dispatch(routerActions.setHeaderTab(tab as HeaderTab))

    // 如果用户已登录，缓存当前路由信息
    if (activeWallet?.isConnected) {
      const cacheData = {
        tab,
        path: tabPaths[tab] || window.location.pathname,
        timestamp: Date.now(),
      }
      ls.set('cached_route', cacheData)
      console.log('💾 Cached route via tab change:', cacheData)
    }
  }

  const onBrandClick = () => {
    navigate(APP_PATH.FUTURES)
    dispatch(routerActions.setHeaderTab('crypto'))

    // 如果用户已登录，缓存meme页面路由
    // if (activeWallet?.isConnected) {
    //   const cacheData = {
    //     tab: 'meme',
    //     path: APP_PATH.MEME_DISCOVER,
    //     timestamp: Date.now()
    //   }
    //   ls.set('cached_route', cacheData)
    //   console.log('💾 Cached meme route via brand click:', cacheData)
    // }
  }

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

  useEffect(() => {
    if (activeWallet?.isConnected) {
      setShowLoginDrawer(false)
    } else {
      // 用户退出登录时清除路由缓存
      ls.remove('cached_route')
    }
  }, [activeWallet?.isConnected])

  const handleCustomClickTab = (value: string) => {
    // 检查 tab 是否被禁用
    const tab = headerTabs.find((t) => t.value === value)
    if (tab?.disabled) {
      return
    }

    if (value === 'meme' || value === 'xstocks') {
      handleTabChange(value)
      if (value === 'xstocks') {
        dispatch(walletActions.setActiveChain(TYPE_CHAIN.SOLANA))
        dispatch(newWalletActions.setActiveChain(TYPE_CHAIN.SOLANA))
      }
    } else if (value === 'more') {
      // 阻止默认的tab切换行为，显示下拉菜单
      setOpenMoreMenu(true)
    } else {
      console.log(value)

      handleTabChange(value)
    }
  }

  // "更多"菜单的二级菜单项配置
  const moreMenuItems = [
    { key: 'MarketData', label: t('header.MarketData'), disabled: true },
    { key: 'whitepaper', label: t('header.whitepaper'), disabled: false },
    { key: 'docs', label: t('header.docs'), disabled: true },
    { key: 'feedback', label: t('header.feedback'), disabled: true },
  ]

  // 处理"更多"菜单的二级菜单项点击
  const handleMoreMenuItemClick = (item: string) => {
    setOpenMoreMenu(false)
    // 根据不同的菜单项执行不同的操作
    switch (item) {
      case 'MarketData':
        // 导航到实时资金费率页面
        navigate(APP_PATH.FUNDING_RATE)
        break
      case 'whitepaper':
        // 打开白皮书
        // window.open('https://xbit.com/whitepaper', '_blank')
        break
      case 'docs':
        // 打开文档
        window.open('https://docs.xbit.com', '_blank')
        break
      case 'feedback':
        // 打开意见反馈
        window.open('https://discord.com/invite/xbit', '_blank')
        break
      default:
        break
    }
  }

  // 渲染"更多"菜单的二级菜单项
  const renderMoreMenuItems = () => {
    return moreMenuItems.map((item) => {
      const menuItem = (
        <DropdownMenuItem
          key={item.key}
          className={cn(
            'text-[14px]  hover:bg-transparent focus:bg-transparent active:bg-transparent rounded-sm px-2 py-2',
            item.disabled
              ? 'text-[#FFFFFF80]  cursor-pointer hover:!text-[#A882FF]'
              : 'text-[#FFFFFF50] focus:text-[#FFFFFF50] hover:!text-[#FFFFFF50]',
          )}
          onClick={() => handleMoreMenuItemClick(item.key)}
        >
          {item.label}
        </DropdownMenuItem>
      )

      if (!item.disabled) {
        return (
          <TooltipProvider key={item.key}>
            <Tooltip>
              <TooltipTrigger asChild>{menuItem}</TooltipTrigger>
              <TooltipContent>
                <p>{t('liquidityChart.comingSoon')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      return menuItem
    })
  }

  const isHandlingChainType = useMemo(() => {
    return pathname.includes(APP_PATH.FUTURES) && activeChain === TYPE_CHAIN.ARB
  }, [activeChain, pathname])
  const isShowButonSwitchChain = useMemo(() => headerTab !== 'crypto' && headerTab !== 'xstocks', [headerTab])

  return (
    <div className="flex items-center px-[16px] h-[60px] justify-between min-w-0 bg-[#141418]">
      <div className="flex items-center gap-[30px] min-w-0 flex-1 overflow-hidden">
        <div className="flex-shrink-0 hidden items-center gap-2 cursor-pointer xl:flex" onClick={onBrandClick}>
          <img src="/images/kairox-logo.svg" alt="logo" className="cursor-pointer block w-10 h-9" />
          <img src="/images/kairox-logo-text.svg" alt="logo" className="cursor-pointer h-5.5 mt-1" />
        </div>

        <div className="flex-shrink-0 items-center gap-2 cursor-pointer block xl:hidden" onClick={onBrandClick}>
          <img src="/images/kairox-logo.svg" alt="logo" className="cursor-pointer block xl:hidden w-7 h-6" />
        </div>

        <div className="min-w-0 flex-1 relative group">
          <div ref={scrollContainerRef} className="overflow-x-auto _hidescrollbar">
            <div
              className={cn(
                'absolute left-0 top-0 w-[32px] h-full z-40 bg-gradient-to-r from-background to-transparent flex items-center pointer-events-none duration-100',
                canScrollLeft ? 'opacity-70' : 'hidden',
              )}
            >
              <button
                className={cn(
                  'absolute left-0 w-6 h-6 flex items-center justify-center text-[#FFFFFF80] hover:text-white transition-all duration-125 ease-in-out pointer-events-auto opacity-0 group-hover:opacity-100',
                  !canScrollLeft && '!opacity-0',
                )}
                onClick={scrollLeft}
              >
                <img className="size-4 cursor-pointer" alt="arrow-left" src="/images/icons/arrow-left.svg" />
              </button>
            </div>

            <div className="min-w-max">
              <MovingTabs
                ref={ref}
                containerId="header-tab"
                containerClassName=""
                tabs={headerTabs}
                defaultTab={getDefaultTab()}
                onTabChange={handleTabChange}
                tabsListClassName="bg-transparent border-0 "
                disabledTabs={headerTabs.filter((tab) => tab.disabled).map((tab) => tab.value as string)}
                // tabsTriggerClassName="px-3.5 whitespace-nowrap"
                // tabBgClassName="bg-[#6A2AE0] rounded-[200px]"
                tabsTriggerActiveClassName="!text-[16px] !font-[450] !text-[#A882FF]"
                onItemClick={handleCustomClickTab}
                tabsTriggerInactiveClassName="!text-[#FFFFFF80] !text-[16px] !font-[450]"
                preventDefaultTabs={['more']}
                customTabRender={(tab, defaultRender) => {
                  if (tab.value === 'more') {
                    return (
                      <DropdownMenu open={openMoreMenu} onOpenChange={setOpenMoreMenu}>
                        <DropdownMenuTrigger asChild>
                          <TabsTrigger
                            ref={moreMenuRef}
                            className={cn(
                              'group/more relative z-1 rounded-[50px] !bg-transparent shadow-[none] px-[16px] leading-[1] select-none',
                              'font-[400] h-[30px] flex items-center justify-center transition-colors duration-200',
                              '!text-[#FFFFFF80] !text-[16px] !font-[450]',
                              'px-3.5 whitespace-nowrap hover:!text-[#A882FF]',
                            )}
                            id={`header-tab-${tab.value}`}
                            value={tab.value}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setOpenMoreMenu(!openMoreMenu)
                              handleCustomClickTab(tab.value)
                            }}
                          >
                            {tab.label}
                            <span className="ml-1 transition-colors duration-200 text-[#FFFFFF80] group-hover/more:text-[#A882FF]">
                              <ArrowDownIcon fill="currentColor" size={16} />
                            </span>
                          </TabsTrigger>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[160px] bg-[#141418] border border-[#232329] p-1"
                        >
                          {renderMoreMenuItems()}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  }
                  return defaultRender()
                }}
              />
            </div>
            <div
              className={cn(
                'absolute right-0 top-0 w-[32px] h-full z-40 bg-gradient-to-l from-background to-transparent flex items-center pointer-events-none duration-100',
                canScrollRight ? 'opacity-100' : 'hidden',
              )}
            >
              <button
                className={cn(
                  'absolute right-0 w-6 h-6 flex items-center justify-center text-[#FFFFFF80] hover:text-white transition-all duration-125 ease-in-out pointer-events-auto opacity-0 group-hover/scroll:opacity-100',
                  !canScrollRight && '!opacity-0',
                )}
                onClick={scrollRight}
              >
                <img className="size-4 cursor-pointer" alt="arrow-right" src="/images/icons/arrow-right.svg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <div className="hidden md:flex items-center gap-3">
          <Search />
          {!activeWallet?.isConnected && isShowButonSwitchChain && !isHandlingChainType && (
            <div className="mr-2.5">
              <ChangeChainButton />
            </div>
          )}
        </div>

        {activeWallet?.isConnected ? (
          <div className="flex gap-2.5 justify-center items-center">
            {isShowButonSwitchChain && !isHandlingChainType && (
              <div className="hidden lg:block">
                <ChangeChainButton />
              </div>
            )}

            <div className="hidden lg:block">
              <HeaderNotifications />
            </div>
            <button
              className="h-[34px] bg-[#6A2AE0] text-white text-[calc(1rem*(13/16))] leading-[2.5] font-[450] tracking-[calc(1rem*(0.5/16))] rounded-[50px] px-3 whitespace-nowrap"
              onClick={() => {
                dispatch(
                  exchangeActions.openExchangeDialog({
                    defaultTab: 'deposit',
                  }),
                )
              }}
            >
              <span className="">{t('assets.deposit.title')}</span>
            </button>

            <div className="hidden lg:block">
              <WalletOverview />
            </div>

            <DropdownUserSetting />
          </div>
        ) : (
          <div className="flex gap-3">
            <div
              className="border-[0.5px] border-[#79778C29] bg-[#212127] h-[34px] rounded-full items-center justify-center cursor-pointer px-[16px]"
              onClick={handleClick}
            >
              <button className="h-full flex items-center gap-2 mx-auto">
                <div className="flex gap-1.5 items-center">
                  <Text
                    text={t('login.LoginOrSignup')}
                    className="!font-[450] !text-[15px] leading-[1]"
                    color="#FFFFFF"
                  />
                </div>
              </button>
            </div>

            <Setting />
          </div>
        )}
        {!activeWallet?.isConnected && showLoginDrawer && (
          <DialogLoginNewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
        )}
      </div>
    </div>
  )
}

export default HeaderPC
