import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { UITab } from '@/types/uiTabs'
import SmartMoney from './components/mobile/SmartMoney'
import { AddressGroupsProvider } from '@/providers/AddressGroupsProvider'
import Tabs from './components/Tabs'

const MobilePage = () => {
  const dispatch = useAppDispatch()

  const [currentTab, setCurrentTab] = useState<string>('smart-money')
  
  useEffect(() => {
    dispatch(homeActions.setXStockTab(currentTab))
  }, [currentTab, dispatch])

  return (
    <AddressGroupsProvider>
      <div className="bg-[#0A0A0A] h-screen">
        <div className="w-full max-w-[768px]">
          <div className="sticky top-0 z-10 py-2 bg-gradient-to-b from-[#38245D] to-[#060606]">
            <Tabs />
          </div>

          <div className={cn('w-full z-1')}>
            <div className={cn('px-3 z-1')}><SmartMoney /></div>
          </div>
        </div>
      </div>
    </AddressGroupsProvider>
  )
}

export default MobilePage
