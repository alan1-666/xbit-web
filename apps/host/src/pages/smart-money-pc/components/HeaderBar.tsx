import { useMemo, useState } from 'react'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { Tabs, type TabItem } from '@/components/Tabs'
import { SearchContent } from '@/components/SearchContent'
import { ViewToggle, ViewMode } from '@/components/ViewToggle'
import { useTranslation } from 'react-i18next'
import FilterSelect from '@/components/common/FilterSelect'
import type { FilterSelectOption } from '@/components/common/FilterSelect'
import { ReactComponent as FilterTriangleIcon } from '@/components/icon/smart-money/filter_triangle.svg'
import { ReactComponent as FunnelIcon } from '@/components/icon/smart-money/funnel_icon.svg'
import { ReactComponent as FilterLinerArrowIcon } from '@/components/icon/smart-money/filter_liner_arrow.svg'
import { ReactComponent as VerticalLineIcon } from '@/components/icon/smart-money/vertical_line.svg'
import { ReactComponent as CalendarIcon } from '@/components/icon/smart-money/calendar.svg'
import FilterMultiSelect from '@/components/common/FilterMultiSelect'
import { useGetTraderTagDefinitions } from '@/hooks/useGetTraderTagDefinitions'
import { shortAddr, useLangKey } from '@/utils/address'

type TabKey = 'smart' | 'kol' | 'whale'
type SortBy = 'NET_PNL' | 'ROI' | 'AVG_WIN_RATE'

export const HeaderBar = (props: {
  tab: TabKey
  setTab: (k: TabKey) => void
  mode: ViewMode
  setMode: (m: ViewMode) => void
  keyword: string
  setKeyword: (v: string) => void
  onSearch: (kw: string) => void

  sortBy: SortBy
  onSortByChange: (v: SortBy) => void
  periodDays: number
  onPeriodDaysChange: (v: number) => void
  tagIds: string[]
  onTagIdsChange: (v: string[]) => void
}) => {
  const { t } = useTranslation()
  const lang = useLangKey()

  const TAB_ITEMS = useMemo(
    () =>
      [
        { key: 'smart', label: t('header.smart-money') },
        // { key: 'kol', label: 'KOL' },
        // { key: 'whale', label: t('smartMoney.latestTrader.whale') },
      ] as const satisfies ReadonlyArray<TabItem<TabKey>>,
    [t],
  )

  const typeOptions: FilterSelectOption[] = useMemo(
    () => [
      { label: t('smartMoney.latestTrader.winRate'), value: 'AVG_WIN_RATE' },
      { label: t('smartMoney.latestTrader.realizedPnL'), value: 'NET_PNL' },
      { label: 'ROI', value: 'ROI' },
    ],
    [],
  )

  const timeOptions: FilterSelectOption[] = useMemo(
    () => [
      { label: '1D', value: '1' },
      { label: '7D', value: '7' },
      { label: '30D', value: '30' },
    ],
    [],
  )

  // 标签
  const { data: tagsList, loading: tagsListLoading, error: tagsListError } = useGetTraderTagDefinitions()
  // const categories = ["holding_period"] as const

  const tagOptions: FilterSelectOption[] = useMemo(() => {
    // const filtered = tagsList
    //   .filter((d) => categories.includes(d.category as any))
    //   .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))

    return tagsList.map((d) => ({
      value: String(d.id),
      label: lang === 'cn' ? d.nameCn : d.name,
    }))
  }, [tagsList])

  return (
    <div className="flex items-center gap-4 justify-between py-3 px-4">
      <div className="flex items-center">
        <Tabs value={props.tab} items={TAB_ITEMS as any} onChange={props.setTab} />
        <VerticalLineIcon className="mx-4" />

        {/* sortBy */}
        <FilterSelect
          options={typeOptions}
          value={props.sortBy}
          onValueChange={(v) => props.onSortByChange(v as SortBy)}
          prefixIcon={<FilterTriangleIcon className="w-3 h-3" />}
          selectTriggerProps={{ className: 'h-[32px] w-[130px] mr-2' }}
          selectValueProps={{ className: 'h-9 px-3 py-2.5 text-sm' }}
        />

        {/* tagIds */}
        <FilterMultiSelect
          options={tagOptions}
          value={props.tagIds}
          onValueChange={props.onTagIdsChange}
          prefixIcon={<FunnelIcon className="w-3 h-3" />}
          triggerClassName="h-[32px] w-[200px] mr-2"
          placeholder={tagsListLoading ? t('detail.common.loading') : t('smartMoney.latestTrader.filterTags')}
          maxLabelCount={2}
          showClear
        />

        {/* periodDays */}
        <FilterSelect
          options={timeOptions}
          value={String(props.periodDays)}
          onValueChange={(v) => props.onPeriodDaysChange(Number(v))}
          prefixIcon={<CalendarIcon className="w-3 h-3" />}
          selectTriggerProps={{ className: 'h-[32px] w-[90px] mr-2' }}
          selectValueProps={{ className: 'h-9 px-3 py-2.5 text-sm' }}
        />
      </div>

      <div className="flex items-center gap-4">
        <SearchContent
          value={props.keyword}
          onChange={props.setKeyword}
          onSearch={props.onSearch}
          className="w-[300px] h-8.5"
          placeholder={t('smartMoney.latestTrader.searchAddress')}
        />
        <ViewToggle mode={props.mode} onChange={props.setMode} />
      </div>
    </div>
  )
}
