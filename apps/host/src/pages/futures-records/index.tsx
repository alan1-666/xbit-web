import HeaderWithBack from '@/components/header/HeaderWithBack'
import { useNavigate } from 'react-router-dom'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { UITab } from '@/types/uiTabs.ts'
import { memo, useEffect, useMemo, useState, useCallback } from 'react'
import FundingHistoryList from '@/components/futuresRecords/FundingHistoryList/index.tsx'
import EntrustedHistoryList from '@/components/futuresRecords/EntrustedHistoryList/index.tsx'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'

const FuturesRecordsPage = () => {
  const navigate = useNavigate()

  const currentListTabs: UITab[] = useMemo(() => {
    return [
      {
        value: 'fundingHistory',
        label: '资金费历史',
      },
      {
        value: 'entrustHistory',
        label: '历史委托',
      },

    ]
  }, [])
  const { isMobile } = useResponsive()
  
  const initialTab = currentListTabs[0]?.value || 'fundingHistory'

  const [currentTab, setCurrentTab] = useState<string>(initialTab)
  const handleChangeTab = useCallback((tab: string) => {
    setCurrentTab(tab)
  }, [])

  const handleRenderTab = useCallback(() => {
      return (
        <>
          <div style={{ display: currentTab === currentListTabs[0]?.value ? 'block' : 'none' }}>
            <FundingHistoryList/>
          </div>
          <div style={{ display: currentTab === currentListTabs[1]?.value ? 'block' : 'none' }}>
            <EntrustedHistoryList/>
          </div>
        </>
      )
    }, [currentTab, currentListTabs])

  const handleNavigateBack = () => {
    navigate(-1)
  }


  return (
    <div className="fix top-0 bottom-0 left-0 right-0 z-[9999]">
      { <HeaderWithBack title="交易记录" onBack={handleNavigateBack} />}
      

      <MovingLineTabs
        tabs={currentListTabs}
        onTabChange={handleChangeTab}
        defaultTab={initialTab}
        showContainerBottomLine={false}
        containerClassName="bg-[none] w-full mb-[10px]  white-gradient-border-b"
        tabsClassName="w-full"
      />
      {handleRenderTab()}

    </div>
  )
}

export default FuturesRecordsPage
