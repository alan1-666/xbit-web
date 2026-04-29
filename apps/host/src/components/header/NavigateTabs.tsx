import MovingBgTabs from '@components/common/MovingBgTabs.tsx'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { UITab } from '@/types/uiTabs.ts'
import { useTranslation } from 'react-i18next'

const NavigateTabs = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation();
  const { pathname } = location;
  
  // Move headerTabs inside the component to use translations
  // Use `satisfies` to keep `value` inferred as `string` (avoid `string | undefined` from `UITab['value']`)
  const headerTabs = [
    {
      value: 'crypto',
      label: t('header.crypto'),
    },
    {
      value: 'meme',
      label: t('header.meme'),
    }
  ] satisfies UITab[]
  
  const defaultTabs: Record<string, string> = {
    '/': headerTabs[0].value,
    '/meme': headerTabs[1].value,
  }
  
  const tabPaths: Record<string, string> = {
    [headerTabs[0].value]: '/',
    [headerTabs[1].value]: '/meme',
  }
  
  const [currentTab, setCurrentTab] = useState<string>(headerTabs[0].value)

  const handleTabChange = (tab: string) => {
    navigate(tabPaths[tab])
  }

  useEffect(() => {
    console.log({currentTab})
  }, [currentTab])

  useEffect(() => {
    console.log({pathname})
    setCurrentTab(defaultTabs[pathname])
  }, [pathname])

  return (
    <MovingBgTabs
      containerId="header-tab"
      containerClassName="mr-auto"
      tabs={headerTabs}
      defaultTab={currentTab}
      onTabChange={handleTabChange}
      // disabledTabs={[headerTabs[0].value]}
    />
  )
}

export default NavigateTabs