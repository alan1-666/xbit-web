import { MouseEvent, useMemo } from 'react'
import NavLink from '@components/common/bottomNav/NavLink.tsx'
import { useTranslation } from 'react-i18next'
import { APP_PATH, MEME_TABS_MAP, TRENDING_TABS, TRENDING_TABS_MAP } from '@/lib/constant.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useNavigate } from 'react-router-dom'
import { TAB_MEME, TAB_TRENDING } from '@components/discover/DiscoverTabs.tsx'
import { homeActions, HomeState } from '@/redux/modules/home.slice.ts'
import { TokenDirection } from '@/@generated/gql/graphql-core.ts'

export interface DiscoverNavLinkProps {
  isActive: boolean
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}
export const DiscoverNavLink = (props: DiscoverNavLinkProps) => {
  const { isActive, onClick } = props
  const { t } = useTranslation()
  // const memoizedTab = useAppSelector((state) => state.home.currentTab)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { currentTab: memoizedTab, memeSubTab, trendingSubTab } = useAppSelector((state) => state.home as HomeState)

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Check if the current pathname is already the discover path
    if (window.location.pathname === APP_PATH.MEME_DISCOVER && memoizedTab) {
      e.preventDefault() // Prevent navigation if already on the discover page
      if (memoizedTab !== TAB_TRENDING) {
        dispatch(homeActions.setTrendingSubTab(TokenDirection.Popular))
        navigate(`${APP_PATH.MEME_DISCOVER}?page=${TAB_TRENDING}&tab=${TRENDING_TABS.HOT}`, { replace: true })
      }
    }
    onClick?.(e)
  }

  const path = useMemo(() => {
    if (!memoizedTab) return APP_PATH.MEME_DISCOVER
    if (memoizedTab === TAB_TRENDING) {
      const searchParams = new URLSearchParams()
      searchParams.set('tab', TRENDING_TABS_MAP[trendingSubTab])
      return `${APP_PATH.MEME_DISCOVER}/${memoizedTab}?${searchParams.toString()}`
    }
    if (memoizedTab === TAB_MEME) {
      const searchParams = new URLSearchParams()
      searchParams.set('tab', MEME_TABS_MAP[memeSubTab])
      return `${APP_PATH.MEME_DISCOVER}/${memoizedTab}?${searchParams.toString()}`
    }
    return APP_PATH.MEME_DISCOVER + `/${memoizedTab}`
  }, [memoizedTab, trendingSubTab, memoizedTab])

  return (
    <NavLink
      to={path}
      title={t('bottomNav.discover')}
      icons={{
        default: '/images/icons/bottomNav/nav-icon-discover.svg',
        active: '/images/icons/bottomNav/nav-icon-discover-active.svg',
      }}
      isActive={isActive}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleClick(e)}
      iconClassName="size-[26px]"
      textClassName="data-[state=active]:text-white data-[state=inactive]:text-[#79758C]"
    />
  )
}
