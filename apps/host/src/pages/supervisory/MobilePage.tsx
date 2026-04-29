import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AddressGroupsProvider } from '@/providers/AddressGroupsProvider'
import { cn } from '@/lib/utils'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { UITab } from '@/types/uiTabs'
import TokenActivity from './mobile/TokenActivity'
import AddressActivity from './mobile/AddressActivity'
import Tabs from '../smart-money-pc/components/Tabs'

const getInitialTab = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const page = urlParams.get('page')
  return page || 'popular'
}

const MobilePage = () => {
  const [currentTab, setCurrentTab] = useState<string>(() => getInitialTab())
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()


  useEffect(() => {
    dispatch(homeActions.setXStockTab(currentTab))
  }, [currentTab, dispatch])

  const tab = searchParams.get('page') || 'token-activity'

  const renderTab = () => {
    if (tab === 'token-activity') return <TokenActivity />
    if (tab === 'address-activity') return <AddressActivity />
  }

  return (
    <AddressGroupsProvider>
      <div className="overflow-y-auto bg-[#0A0A0A] h-screen">
        <div className="w-full max-w-[768px]">
          <div className="sticky top-0 z-10 py-2 bg-gradient-to-b from-[#38245D] to-[#060606]">
            <Tabs />
          </div>

          <div className={cn('w-full z-1')}>
            <div className={cn('px-3 z-1')}>{renderTab()}</div>
          </div>
        </div>
      </div>
    </AddressGroupsProvider>
  )
}

export default MobilePage
