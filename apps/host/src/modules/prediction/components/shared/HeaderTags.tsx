import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { homepageCategories } from '@/modules/prediction/data/homepage-category.ts'
import { useTranslation } from 'react-i18next'

import { IconTrendUp } from '@components/icon/stroke'

export const TRENDING_TAB = 'trending'
export const FAVORITES_TAB = 'favorites'
export const BREAKING_TAB = 'breaking'
export const NEW_TAB = 'new'
export const SPORTS_TAB = 'sports'

const DEFAULT_TAB = 'trending'

type Tab = {
  label: string
  value: string
  href: string
}

export const HeaderTags = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const defaultTabs: Tab[] = useMemo(
    () => [
      { label: t('prediction.headerTags.trending'), value: TRENDING_TAB, href: NAVIGATIONS.prediction.home() },
      { label: t('prediction.headerTags.breaking'), value: BREAKING_TAB, href: NAVIGATIONS.prediction.breaking() },
      { label: t('prediction.headerTags.new'), value: NEW_TAB, href: NAVIGATIONS.prediction.new() },
      // { label: t('prediction.headerTags.sports'), value: SPORTS_TAB, href: NAVIGATIONS.prediction.sports.live() },
    ],
    [t],
  )

  const tagTabs = useMemo(() => {
    return homepageCategories.map((category) => ({
      value: category.value,
      label: t(`prediction.categories.${category.value}`),
      href: NAVIGATIONS.prediction.events(category.value.toLowerCase()),
    })) as Tab[]
  }, [t])

  const tabs = useMemo(() => {
    return defaultTabs.concat(tagTabs)
  }, [defaultTabs, tagTabs])

  const handleTabChange = useCallback(
    (tab: string) => {
      const targetTab = tabs.find((t) => t.value === tab)
      if (targetTab) {
        navigate(targetTab.href)
      }
    },
    [tabs, navigate],
  )

  const selectedTab = useMemo(() => {
    const currentTab = tabs.find((tab) => location.pathname.startsWith(tab.href))
    return currentTab ? currentTab.value : DEFAULT_TAB
  }, [location.pathname, tabs])

  return (
    <div className="sticky top-0 z-10 bg-[#0A0A0A] pt-2 pr-2.5 pb-[13.5px] xl:pb-2 mt-2 xl:mb-3 xl:mt-0 border-b">
      <MovingLineTabs
        tabs={tabs}
        defaultTab={selectedTab}
        onTabChange={handleTabChange}
        containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 w-full"
        tabsListClassName="h-7 justify-start w-full"
        tabLineClassName="before:h-[1.5px] bottom-[1px]"
        itemClassName="pl-[11px] pt-0 text-[#908E98] xl:pl-4 xl:mr-4"
        labelClassName="text-[13px] leading-none font-normal tracking-[-0.3px]"
        labelActiveClassName="scale-100! font-medium"
        icon={<IconTrendUp className="w-3.5 h-3.5" />}
        iconTab={TRENDING_TAB}
      />
    </div>
  )
}
