import { useTranslation } from 'react-i18next'
import { UITab } from '@/types/uiTabs.ts'
import { useState } from 'react'
import MovingBgGridFilterTags from '@components/common/MovingBgGridFilterTags.tsx'
import MyPositions from '@components/myPositions/index.tsx'
import TransactionHistory from '@components/transactionHistory'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setCurrentHoldingTab, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'

const HoldingTab = () => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()
  const { currentHoldingTab } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)

  const currentListTabs: UITab[] = [
    {
      value: 'holding',
      label: t('detail.tabs.myPositions'),
    },
    {
      value: 'history',
      label: t('detail.tabs.transactionHistory'),
    }
  ]

  const [currentTab, setCurrentTab] = useState<string>(currentHoldingTab ?? (currentListTabs[0].value as string))

  const handleOnTabChange = (tab: string) => {
    dispatch(setCurrentHoldingTab(tab))
    setCurrentTab(tab)
  }

  const handleRenderTabContent = () => {
    return currentTab === currentListTabs[0].value
      ? (<MyPositions />)
      : (<TransactionHistory />)
  }

  return (
    <div className={'sticky top-[84.5px] z-[5] bg-[#0A0A0A]'}>
      <MovingBgGridFilterTags
        tabs={currentListTabs}
        defaultTab={currentTab ?? currentListTabs[0].value as string}
        activeTab={currentTab ?? currentListTabs[0].value as string}
        onTabChange={handleOnTabChange}
        containerId="holdingTabs"
        containerClassName="p-2.5"
        tabsListClassName="w-full p-1 h-fit bg-[#ECECED0A] select-none"
        tabsTriggerClassName="w-1/2 py-1.5 h-[26px] rounded-[4px] bg-transparent"
        tabBgClassName="!bg-[#00FFF61A]"
        activeColor={"!text-[#00FFB4]"}
      />

      {handleRenderTabContent()}
    </div>
  )
}

export default HoldingTab