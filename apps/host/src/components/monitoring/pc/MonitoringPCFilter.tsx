import FollowedSMDropdown from "@components/monitoring/pc/FollowedSMDropdown.tsx";
import TypeDropDown from "@components/monitoring/pc/TypeDropDown.tsx";
import TransactionAmountDropdown from "@components/monitoring/pc/TransactionAmountDropdown.tsx";
import FollowTypeDropdownPc from "@components/monitoring/pc/FollowTypeDropdownPc.tsx";
import TextFollowedWallet from "@components/monitoring/pc/TextFollowedWallet.tsx";
import ButtonUnFollowAll from "@components/monitoring/pc/ButtonUnFollowAll.tsx";

type MonitoringPcFilterProps = {
  activeTab: string
}

const MonitoringPcFilter = ({activeTab}: MonitoringPcFilterProps) => {
  const handleRenderFilter = () => {
    switch (activeTab) {
      case 'realTimeTransactions':
        return (
          <>
            <FollowedSMDropdown />
            <TypeDropDown />
            <TransactionAmountDropdown />
          </>
        )
      case 'following':
        return (
          <>
            <FollowTypeDropdownPc />
            <TextFollowedWallet />
            <ButtonUnFollowAll />
          </>
        )
      case 'Monitor':
        return (<></>)
      default:
        return null
    }
  }
  return (
    <div className='flex items-center gap-3' >
      {handleRenderFilter()}
    </div>
  );
};

export default MonitoringPcFilter;
