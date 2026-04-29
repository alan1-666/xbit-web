import NavItem from './nav-item'

interface NavTabsProps {
  activeTab: number
  setActiveTab: (tab: number) => void
}

const NavTabs = ({ activeTab, setActiveTab }: NavTabsProps) => {
  return (
    <div className="bg-top-div-vault-detail rounded-t-[8px] border-t border-t-[#ECECED1F] p-3 flex gap-3 overflow-x-auto w-full _hidescrollbar">
      <NavItem title="收益走势图" isActive={activeTab === 0} onClick={() => setActiveTab(0)} />
      <NavItem title="每日收益" isActive={activeTab === 1} onClick={() => setActiveTab(1)} />
      <NavItem title="总锁仓价值" isActive={activeTab === 2} onClick={() => setActiveTab(2)} />
      <NavItem title="风险偏好" isActive={activeTab === 3} onClick={() => setActiveTab(3)} />
    </div>
  )
}

export default NavTabs