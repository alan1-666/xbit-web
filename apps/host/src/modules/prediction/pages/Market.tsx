import { APP_PATH } from '@/lib/constant.ts'
import { homepageCategories } from '@/modules/prediction/data/homepage-category.ts'
import { BreakingPage } from '@/modules/prediction/pages/BreakingPage.tsx'
import { CryptoPage } from '@/modules/prediction/pages/CryptoPage.tsx'
import Earnings from '@/modules/prediction/pages/Earnings'
import { EventsPage } from '@/modules/prediction/pages/EventsPage.tsx'
import FinancePage from '@/modules/prediction/pages/FinancePage'
import { NewPage } from '@/modules/prediction/pages/NewPage.tsx'
import { TrendingPage } from '@/modules/prediction/pages/TrendingPage.tsx'
import { ElectionsPage } from '@/modules/prediction/pages/ElectionsPage.tsx'
import { UITab } from '@/types/uiTabs.ts'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { IconTrendUp } from '@components/icon/stroke'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

const MarketPrediction = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const defaultTabs: UITab[] = useMemo(
    () => [
      { value: 'trending', label: t('prediction.headerTags.trending') },
      { value: 'breaking', label: t('prediction.headerTags.breaking') },
      { value: 'new', label: t('prediction.headerTags.new') },
    ],
    [t],
  )

  const tagTabs: UITab[] = useMemo(
    () =>
      homepageCategories.map((category) => ({
        value: category.value,
        label: t(`prediction.categories.${category.value}`),
      })),
    [t],
  )

  const tabs: UITab[] = useMemo(() => {
    return defaultTabs.concat(tagTabs)
  }, [defaultTabs, tagTabs])

  const selectedTab = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const predictionIndex = segments.indexOf('prediction')
    const slug = predictionIndex !== -1 ? segments[predictionIndex + 1] : undefined

    if (slug && tabs.some((tab) => tab.value === slug)) {
      return slug
    }

    return 'trending'
  }, [location.pathname, tabs])

  const handleTabChange = (tab: string) => {
    const basePath = `${APP_PATH.MARKET}/prediction`
    const path = tab === 'trending' ? basePath : `${basePath}/${tab}`
    navigate(path, { replace: true })
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'trending':
        return <TrendingPage />
      case 'breaking':
        return <BreakingPage />
      case 'new':
        return <NewPage />
      case 'earnings':
        return <Earnings />
      case 'elections':
        return <ElectionsPage />
      case 'crypto':
        return <CryptoPage tagParamKey="tag" />
      case 'finance':
        return <FinancePage tagParamKey="tag" />
      default:
        return <EventsPage tag={selectedTab} />
    }
  }

  return (
    <div className="mt-4">
      <MovingLineTabs
        tabs={tabs}
        defaultTab={selectedTab}
        onTabChange={handleTabChange}
        containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 w-full"
        tabsListClassName="h-7 justify-start w-full px-0"
        itemClassName="pt-0 text-[#908E98]"
        labelClassName="text-[14px] leading-none font-normal tracking-[-0.3px]"
        labelActiveClassName="scale-100! font-semibold"
        tabLineClassName="before:h-[2px] before:rounded-t-[4px] before:bg-[#AB70FF]"
        icon={<IconTrendUp className="w-3.5 h-3.5" />}
        iconTab={'trending'}
      />
      <div className="mt-3">{renderTabContent()}</div>
    </div>
  )
}

export default MarketPrediction
