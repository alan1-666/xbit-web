import React, { useState, useMemo, useCallback } from 'react'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { KeepAliveContainer } from '@/components/KeepAliveContainer'
import { ViewMode } from '@/components/ViewToggle'
import { HeaderBar } from './components/HeaderBar'
import LatestTrader from './LatestTrader'
import MobilePage from './MobilePage'
import { useTranslation } from 'react-i18next'
import { AddressGroupsProvider } from '@/providers/AddressGroupsProvider'

export function Kol() {
  return <div className="mt-6 text-white">KOL 数据：{0}</div>
}
export function Whale() {
  return <div className="mt-6 text-white">巨鲸数据：{0}</div>
}

type TabKey = 'smart' | 'kol' | 'whale'
type SortBy = 'NET_PNL' | 'ROI' | 'AVG_WIN_RATE'

const SmartMoneyPC: React.FC = () => {
  const { isDesktop } = useResponsive()

  const [mode, setMode] = useState<ViewMode>(() => (localStorage.getItem('sm_layout') as ViewMode) || 'card')
  const [tab, setTab] = useState<TabKey>('smart')
  const [kw, setKw] = useState('')
  const { t } = useTranslation()

  const [sortBy, setSortBy] = useState<SortBy>('ROI')
  const [periodDays, setPeriodDays] = useState<number>(1)
  const [tagIds, setTagIds] = useState<string[]>([])

  const tagIdsNumber = useMemo(() => tagIds.map(Number).filter(Number.isFinite), [tagIds])

  const setModePersist = useCallback((m: ViewMode) => {
    setMode(m)
    localStorage.setItem('sm_layout', m)
  }, [])

  const searchAddress = useCallback((keyword: string) => {
    setKw(keyword.trim())
  }, [])

  const factories = useMemo(
    () => ({
      smart: () => (
        <LatestTrader
          layout={mode}
          keyword={kw}
          sortBy={sortBy}
          periodDays={periodDays}
          recentDays={1}
          tagIds={tagIdsNumber}
        />
      ),
      kol: () => <Kol />,
      whale: () => <Whale />,
    }),
    [mode, kw, sortBy, periodDays, tagIds],
  )

  if (!isDesktop) return <MobilePage />

  return (
    <AddressGroupsProvider>
      <HeaderBar
        tab={tab}
        setTab={setTab}
        mode={mode}
        setMode={setModePersist}
        keyword={kw}
        setKeyword={setKw}
        onSearch={searchAddress}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        periodDays={periodDays}
        onPeriodDaysChange={setPeriodDays}
        tagIds={tagIds}
        onTagIdsChange={setTagIds}
      />
      <KeepAliveContainer activeKey={tab} components={factories} />
    </AddressGroupsProvider>
  )
}

export default SmartMoneyPC
