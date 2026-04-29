import Container from '@/components/common/Container'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { CurrentOrders } from '@/components/cryptoTransactionHistory/CurrentOrders'
import { FundingFeeHistory } from '@/components/cryptoTransactionHistory/FundingFeeHistory'
import { HistorycalOrders } from '@/components/cryptoTransactionHistory/HistorycalOrders'
import { MyPositions } from '@/components/cryptoTransactionHistory/MyPositions'
import { navTabs } from '@/components/cryptoTransactionHistory/type'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CryptoTransactionHistory = () => {
  const navigate = useNavigate()
  const [currentNavTab, setCurrentNavTab] = useState<string>(navTabs[0].value)

  const renderTabContent = (tab: string) => {
    switch (tab) {
      case navTabs[1].value:
        return <HistorycalOrders />
      case navTabs[2].value:
        return <MyPositions />
      case navTabs[3].value:
        return <FundingFeeHistory />
      default:
        return <CurrentOrders />
    }
  }

  const handleNavigateBack = () => {
    navigate(-1)
  }
  return (
    <Container className="bg-[url('/images/transaction-bg.png')] bg-size-[100%_100%] bg-no-repeat px-0">
      <HeaderWithBack title="交易记录" className="bg-transparent" onBack={handleNavigateBack} />

      <MovingLineTabs
        tabs={navTabs}
        defaultTab={navTabs[0].value}
        onTabChange={(tab: string) => {
          setCurrentNavTab(tab)
        }}
        containerClassName="after:hidden bg-[none] w-full mb-2.5  border-b border-solid border-[#ECECED14]"
        tabsClassName="w-full"
      />
      <div className="px-2.5">{renderTabContent(currentNavTab)}</div>
    </Container>
  )
}

export default CryptoTransactionHistory
