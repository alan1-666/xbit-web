import { UITab } from '@/types/uiTabs.ts'
import { useTranslation } from 'react-i18next'
import MonitoringTabs from '@components/monitoring/pc/MonitoringTabs.tsx'
import { useEffect, useState } from 'react'
import { saveToLocalStorageWithTTL } from '@/utils/storage.ts'
import { TTL_STORAGE } from '@const/configs.ts'
import MonitoringPCFilter from '@components/monitoring/pc/MonitoringPCFilter.tsx'
import TableRealtimeTxPc from '@components/monitoring/pc/TableRealtimeTxPC.tsx'
import TableWalletManagers from '@components/monitoring/pc/TableWalletManagers.tsx'
import MonitoringRightContainer from '@components/monitoring/pc/MonitoringRightContainer.tsx'
import { useSearchParams } from 'react-router-dom'
import { TimeframeSelector } from '@/components/discover/TimeframeSelector'
import { setRealtimeTxFilterTimeframe } from '@/redux/modules/monitoringPcSlice'
import { SmartMoneyFilterType, TimeframeOption } from '@/types/monitoring'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'

export const CACHED_MONITORING_TABS = 'CACHED_MONITORING_TABS'

const VALID_TABS = ['realTimeTransactions', 'following']

const getInitialTab = (): string => {
  const searchParams = new URLSearchParams(window.location.search)
  const tabFromUrl = searchParams.get('tab')
  if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
    return tabFromUrl
  }
  return 'realTimeTransactions'
}

const MonitoringPc = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const filter = useAppSelector((state: RootState) => state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType)

  const navTabs: UITab[] = [
    {
      value: 'realTimeTransactions',
      label: t('monitoring.realTimeTransactions'),
    },
    {
      value: 'following',
      label: t('monitoring.following'),
    },
    // {
    //   value: 'monitor',
    //   label: 'Monitor',
    // }
  ]

  const [_, setSearchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState(getInitialTab())

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    saveToLocalStorageWithTTL<string>(CACHED_MONITORING_TABS, tab, TTL_STORAGE)
  }

  const handleSetTimeframe = (value: TimeframeOption) => {
    dispatch(setRealtimeTxFilterTimeframe(value))
  }

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true })
  }, [activeTab])

  const handleRenderContent = () => {
    switch (activeTab) {
      case 'realTimeTransactions':
        return <TableRealtimeTxPc />
      case 'following':
        return <TableWalletManagers />
      default:
        return <TableRealtimeTxPc />
    }
  }

  useEffect(() => {
    const mainContainer = document.querySelector('#main-content')
    if (mainContainer) {
      mainContainer.classList.remove('max-w-[768px]')
    }
  }, [])

  useEffect(() => {
    handleSetTimeframe('6h')
  }, [])

  return (
    <div className="relative mx-auto mt-2">
      <div className="flex items-center justify-between pl-4 py-[15px] h-[66px]">
        <div className="flex items-center gap-3">
          <MonitoringTabs tabs={navTabs} activeTab={activeTab} setActiveTab={handleTabChange} />
          <div className="w-[1px] h-5 bg-[#ECECED14]"></div>
          <MonitoringPCFilter activeTab={activeTab} />
          {activeTab === 'realTimeTransactions' && (
            <>
              <div className="w-[1px] h-5 bg-[#ECECED14]"></div>
              <TimeframeSelector currentTimeframe={filter.timeframe ?? '6h'} onTimeframeChange={handleSetTimeframe} />
            </>
          )}
        </div>
        <MonitoringRightContainer activeTab={activeTab} />
      </div>
      {handleRenderContent()}
    </div>
  )
}

export default MonitoringPc
