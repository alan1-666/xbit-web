import { useTranslation } from 'react-i18next'
import { UITab } from '@/types/uiTabs.ts'
import { TAB_CLASSIFICATION, TAB_MEME, TAB_TRENDING, TAB_WATCHLIST } from '@components/discover/DiscoverTabs.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'
import { useEffect, useMemo, useState } from 'react'
import { TimeframeSelector } from '@components/discover/TimeframeSelector.tsx'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { FilterButton } from '@pages/meme/discover/desktop/components/FilterButton.tsx'
import { BlacklistDialog } from '@pages/meme/discover/desktop/components/BlacklistDialog.tsx'

const getDefaultTab = () => {
  const params = new URLSearchParams(window.location.search)
  const tab = params.get('page')
  if (tab === TAB_WATCHLIST || tab === TAB_MEME || tab === TAB_TRENDING || tab === TAB_CLASSIFICATION) {
    return tab
  }
  return TAB_MEME
}

export interface DiscoverTabsProps {
  tab?: string
  onTabChange?: (tabId: string) => void
}

export const DiscoverTabs = (props: DiscoverTabsProps) => {
  const { tab, onTabChange } = props
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [_, setSearchParams] = useSearchParams()
  const [currentTab, setCurrentTab] = useState(getDefaultTab())
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (tab && tab !== currentTab) {
      setCurrentTab(tab)
    }
  }, [tab])

  const allTabs: UITab[] = [
    {
      value: TAB_WATCHLIST,
      label: t('listCoin.tabs.optional'),
    },
    {
      value: TAB_MEME,
      label: t('listCoin.tabs.meme'),
    },
    {
      value: TAB_TRENDING,
      label: t('listCoin.tabs.mainstream'),
    },
    {
      value: TAB_CLASSIFICATION,
      label: t('listCoin.tabs.category'),
    },
    {
      value: 'sm',
      label: 'Smart Money',
    },
  ]

  const handleTabChange = (tabId: string) => {
    if (tabId === 'sm') {
      navigate(APP_PATH.MEME_SMART_MONEY)
    } else {
      setCurrentTab(tabId)
    }
  }

  useEffect(() => {
    setSearchParams({ page: currentTab }, { replace: true })
  }, [currentTab])

  useEffect(() => {
    onTabChange?.(currentTab)
  }, [currentTab])

  const allFilters = useAppSelector((state) => state.home.filters)

  const filter = useMemo(() => {
    if (currentTab === TAB_TRENDING) return allFilters.trending
  }, [currentTab, allFilters])

  const currentTimeframe = useMemo(() => {
    return filter?.timeframe || '1h'
  }, [filter])

  const onTimeframeChange = (timeframe: string) => {
    dispatch(
      homeActions.setFilters({
        key: currentTab,
        filter: {
          ...filter,
          timeframe,
        },
      }),
    )
  }

  const onFilterChange = (newFilter: typeof filter) => {
    if (!newFilter) return
    dispatch(
      homeActions.setFilters({
        key: currentTab,
        filter: {
          ...newFilter,
        },
      }),
    )
  }

  const onResetAll = () => {
    dispatch(homeActions.resetFilter(currentTab))
  }

  const shouldShowTimeframe = useMemo(() => {
    return currentTab === TAB_TRENDING
  }, [currentTab])

  return (
    <div className="w-full flex justify-between items-center border-b border-[#ECECED0A] py-2">
      <MovingLineTabs
        tabs={allTabs}
        defaultTab={currentTab}
        containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 w-full"
        tabsListClassName="justify-start w-full"
        onTabChange={handleTabChange}
      />
      <div className="pr-4 flex gap-3 items-center">
        {shouldShowTimeframe && (
          <TimeframeSelector currentTimeframe={currentTimeframe} onTimeframeChange={onTimeframeChange} />
        )}
        <BlacklistDialog />
        <FilterButton
          currentFilter={filter}
          onFiltersChanged={onFilterChange}
          onResetAll={onResetAll}
          className="bg-transparent hidden"
        />
      </div>
    </div>
  )
}
