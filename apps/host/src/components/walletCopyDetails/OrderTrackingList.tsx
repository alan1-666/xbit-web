import { cn } from '@/lib/utils.ts'
import { UITab } from '@/types/uiTabs.ts'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CurrencyToggle from '../detailTokenTabs/CurrencyToggle'
import TabTransfers from './TabTransfers'
import { useResponsive } from '@/hooks/useResponsive'

type IProps = {
  id: string
}

type TabsProps = {
  activeTab?: string
  onTabChange?: (tab: string) => any
  tabs: UITab[]
  containerClassName?: string
  classNameItem?: string
  classNameItemActive?: string
}

function Tabs(props: TabsProps) {
  const { activeTab, onTabChange, tabs, containerClassName, classNameItem, classNameItemActive } = props
  return (
    <div className={cn('w-[240px] h-8 flex bg-[#ECECED14] rounded-[8px] relative p-0.5', containerClassName)}>
      {tabs.map((tab: UITab) => (
        <button
          key={tab.value}
          className={cn(
            'flex-1 h-full flex justify-center items-center text-[calc(14rem/16)] leading-[calc(14rem/16)] z-10 border border-transparent rounded-[8px] bg-[#212127] transition-colors duration-300',
            activeTab === tab.value ? 'text-[#C8A7FD] bg-[#3E2761]' : 'text-[#79778C] bg-[#212127]',
            classNameItem,
            activeTab === tab.value ? classNameItemActive : '',
          )}
          onClick={() => onTabChange?.(tab.value)}
        >
          {tab.label}
        </button>
      ))}
      <div
        className={cn(
          'absolute w-1/2 left-0 top-0 bottom-0 p-0.5 z-0 transition duration-300',
          activeTab === 'success' ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div
          className="bg-[#141414] w-full h-full rounded-[6px] border"
          style={{
            borderImageSource:
              'linear-gradient(37.15deg, rgba(225, 73, 248, 0.1) 13.23%, rgba(153, 69, 255, 0.1) 37.52%, rgba(0, 243, 171, 0.1) 93.06%)',
          }}
        />
      </div>
    </div>
  )
}

const OrderTrackingList = memo((props: IProps) => {
  const { id } = props
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'success' | 'failed'>('success')
  const { isDesktop } = useResponsive()
  const tabs: UITab[] = [
    {
      value: 'success',
      label: t('walletCopy.successList'),
    },
    {
      value: 'failed',
      label: t('walletCopy.failedList'),
    },
  ]
  /**
   * 
   * {
    recentFollowUp: '1m',
    type: 'buy',
    asset: 'Trump',
    profit: null,
    volume: 10659.65,
    soldPrice: 0.00170,
    amount: 10650,
    copyType: 'maxFollowBuy',
    parameters: {
      tp: '10%',
      sl: '50%',
    },
    hash: 'sdeAWQ'
  }
   */

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'success':
        return <TabTransfers key={`${id}-success`} status={'success'} id={id} />
      case 'failed':
        return <TabTransfers key={`${id}-failed`} status={'failed'} id={id} />
      default:
        return null
    }
  }, [id, activeTab])

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as 'success' | 'failed')
  }, [])


  return (
    <div className="flex-1 mt-[2px]">
      <div className="mb-3 flex items-center justify-between">
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
        <CurrencyToggle />
      </div>
      <div className={cn('mt-3 pb-2', isDesktop ? 'pb-0' : '')}>{tabContent}</div>
    </div>
  )
})

OrderTrackingList.displayName = 'OrderTrackingList'

export default OrderTrackingList
