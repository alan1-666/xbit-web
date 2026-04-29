import { APP_PATH } from '@/lib/constant'
import NavLink, { NavLinkProps } from '@components/common/bottomNav/NavLink.tsx'
import { usePredictionBottomNavData } from '@components/common/bottomNav/usePredictionBottomNavData'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'

export const PredictionBottomNav = () => {
  const [currentNav, setCurrentNav] = useState<number>(0)
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { eventDetailsPath } = usePredictionBottomNavData()

  const navItems: NavLinkProps[] = [
    {
      to: NAVIGATIONS.prediction.home(),
      title: t('bottomNav.discover'),
      icons: {
        default: '/images/icons/bottomNav/nav-icon-discover.svg',
        active: '/images/icons/bottomNav/nav-icon-discover-active.svg',
      },
    },
    {
      to: eventDetailsPath,
      title: t('bottomNav.trading'),
      icons: {
        default: '/images/icons/bottomNav/nav-icon-trade.svg',
        active: '/images/icons/bottomNav/nav-icon-trade-active.svg',
      },
    },
    {
      to: APP_PATH.PREDICTION_ASSETS + '?main=prediction',
      title: t('bottomNav.assets'),
      icons: {
        default: '/images/icons/bottomNav/nav-icon-assets.svg',
        active: '/images/icons/bottomNav/nav-icon-assets-active.svg',
      },
    },
  ]

  const handleClick = (index: number) => {
    setCurrentNav(index)
  }

  useEffect(() => {
    if (pathname.includes(APP_PATH.PREDICTION_ASSETS)) {
      setCurrentNav(2)
    } else if (pathname.includes('/event/')) {
      setCurrentNav(1)
    } else {
      setCurrentNav(0)
    }
  }, [pathname])

  return (
    <nav className="bg-(--bottom-nav-bg) border border-(--bottom-nav-border-color) max-w-[768px] mx-auto h-[70px]">
      <div className="flex align-bottom mt-[8px] justify-around">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            {...item}
            isActive={currentNav === index}
            onClick={() => handleClick(index)}
            iconClassName="size-[26px]"
            textClassName="data-[state=active]:text-white data-[state=inactive]:text-[#79758C]"
          />
        ))}
      </div>
    </nav>
  )
}
