import BuyNowDrawerInVaultDetail from '@/components/vaultDetail/buy-now-drawer'
import HeaderVaultDetail from '@/components/vaultDetail/header-vault-detail'
import NavTabs from '@/components/vaultDetail/nav-tabs'
import '@/components/vaultDetail/styles.css'
import WithdrawalDrawer from '@/components/vaultDetail/withdrawal-drawer'
import { useState } from 'react'
import ChartVaultDetail from '../../components/vaultDetail/chart'
import PositionDetails from '../../components/vaultDetail/position-details'
import VaultPerformanceCard from '../../components/vaultDetail/vault-performance-card'
const VaultDetail = () => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="relative">
      <div className="">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-[url('/images/vaultDetail/bg_1.webp')] bg-no-repeat bg-cover z-0 vault-detail-custom-rouder" />
        <div className="relative z-1">
          <HeaderVaultDetail />
        </div>
      </div>
      <div className="mt-3">
        <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="px-3 flex flex-col gap-3">
        <ChartVaultDetail activeTab={activeTab} />
        <VaultPerformanceCard />
      </div>
      
      <PositionDetails />
      <div className='h-20' />

      <div className="fixed bottom-0 left-0 right-0 z-2 w-full pb-4 px-3 bg-(--bottom-nav-bg) border-t border-(--bottom-nav-border-color) pt-2.5">
        <div className="flex flex-row justify-center  max-w-md mx-auto gap-2">
          <WithdrawalDrawer />
          <BuyNowDrawerInVaultDetail />
        </div>
      </div>
    </div>
  )
}

export default VaultDetail
