import { useState } from "react"
import PositionsTable from "./position-table"
import NavItem from "../nav-item"
import BalanceTable from "./balance-table"
import HistoricalTransactionTable from "./historical-transaction-table"
import FundingHistory from "./funding-history"
import InvestorTable from "./investor-table"
import Text from "@/components/common/Text"

const PositionDetails = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleRenderContent = () => {
    switch (activeTab) {
      case 0:
        return <PositionsTable />
      case 1:
        return <BalanceTable />
      case 2:
        return <HistoricalTransactionTable />
      case 3:
        return <FundingHistory />
      case 4:
        return <InvestorTable />
    }
  }

  return (
    <div className="bg-top-div-vault-detail rounded-t-[8px] border-t border-t-[#ECECED1F] overflow-x-auto w-full _hidescrollbar mt-3">
      <div className="px-3 pt-3">
        <Text text="持仓明细" fontSize={16} fontWeight="medium" />
      </div>
      <div className="px-3 mt-3 flex gap-3 overflow-x-auto w-full _hidescrollbar">
        <NavItem title="收益走势图" isActive={activeTab === 0} onClick={() => setActiveTab(0)} />
        <NavItem title="余额" isActive={activeTab === 1} onClick={() => setActiveTab(1)} />
        <NavItem title="历史成交" isActive={activeTab === 2} onClick={() => setActiveTab(2)} />
        <NavItem title="资金费历史" isActive={activeTab === 3} onClick={() => setActiveTab(3)} />
        <NavItem title="存款和提款" isActive={activeTab === 4} onClick={() => setActiveTab(4)} />
      </div>
      <div className="h-[1px] bg-[#ECECED1F] mt-3 w-full"></div>
      <div className="wrap-table">{handleRenderContent()}</div>
    </div>
  )
}

export default PositionDetails
