import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { UITab } from '@/types/uiTabs'

const Tabs = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const headerTabs: UITab[] = [
    {
      value: 'smart-money',
      label: t('header.smart-money'),
    },
    {
      value: 'token-activity',
      label: t('smartMoney.supervisory.tokenActivity'),
    },
    {
      value: 'address-activity',
      label: t('smartMoney.supervisory.addressActivity'),
    },
  ]

  const getActiveTab = () => {
    if (location.pathname.includes('smart-money')) {
      return 'smart-money'
    }

    const params = new URLSearchParams(location.search)
    return params.get('page') || 'token-activity'
  }

  const handleTabChange = (tab: string) => {
    if (tab === 'smart-money') {
      navigate('/futures/smart-money')
    } else {
      navigate(`/futures/supervisory?page=${tab}`)
    }
  }

  return (
    <MovingLineTabs
      tabs={headerTabs}
      defaultTab={getActiveTab()}
      onTabChange={handleTabChange}
      containerClassName="after:hidden w-full linear-gradien-border-buttom rounded-t-[8px] bg-inherit z-1 relative"
      tabsClassName="w-full"
      itemClassName="pr-3 text-[calc(1rem*(15/16))] font-[400]"
      itemClassNameActive="!text-[calc(1rem*(16/16))] !font-[500]"
      tabsListClassName="px-0"
    />
  )
}

export default Tabs