import { APP_PATH } from '@/lib/constant.ts'
import { useAppSelector } from '@/redux/store'
import NavLink from '@components/common/bottomNav/NavLink.tsx'
import { useTranslation } from 'react-i18next'
import { useMemo, MouseEvent } from 'react'

export interface XStockNavLinkProps {
  isActive: boolean
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void
}

export const XStockNavLink = (props: XStockNavLinkProps) => {
  const { isActive, onClick } = props
  const { t } = useTranslation()
  const xStockTab = useAppSelector((state) => state.home.xStockTab)

  const link = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', xStockTab)
    return `${APP_PATH.XSTOCKS}?${params.toString()}`
  }, [xStockTab])

  return (
    <NavLink
      to={link}
      title={t('bottomNav.homepage')}
      icons={{
        default: '/images/icons/xstockNavDex/nav-icon-discover.svg',
        active: '/images/icons/xstockNavDex/nav-icon-discover-active.svg',
      }}
      isActive={isActive}
      onClick={onClick}
      className="flex-1"
      iconClassName="size-[26px]"
      textClassName="data-[state=active]:text-white data-[state=inactive]:text-[#79758C]"
    />
  )
}
