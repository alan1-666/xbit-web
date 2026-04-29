import ButtonsWallets from '@components/monitoring/pc/ButtonsWallets.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import {IconFlash2} from "@components/icon/stroke/IconFlash2.tsx";
import QuickBuy from "@components/discover/QuickBuy.tsx";

type MonitoringRightContainerProps = {
  activeTab: string
}

const MonitoringRightContainer = ({ activeTab }: MonitoringRightContainerProps) => {
  const activeWallet = useActiveWallet()
  const handleRenderContent = () => {
    switch (activeTab) {
      case 'realTimeTransactions':
        return <QuickBuy
          presetSelectType="list"
          className="rounded-full h-[26px] border-none bg-transparent mr-3 gap-2"
          inputWrapperClassName="bg-[#212127] h-[26px] rounded-full pl-2 pr-3"
          presetListClassName="bg-[#212127] h-[26px] rounded-full pl-2 pr-2.5"
          icon={<IconFlash2 className="text-[#FBFBFB]" />}
          showUnitIcon={true}
        />
      case 'following':
        return activeWallet.isConnected ? <ButtonsWallets /> : null
      case 'monitor':
        return <></>
      default:
        return <QuickBuy
          presetSelectType="list"
          className="rounded-full h-[26px] border-none bg-transparent mr-3 gap-2"
          inputWrapperClassName="bg-[#212127] h-[26px] rounded-full pl-2 pr-3"
          presetListClassName="bg-[#212127] h-[26px] rounded-full pl-2 pr-2.5"
          icon={<IconFlash2 className="text-[#FBFBFB]" />}
          showUnitIcon={true}
        />
    }
  }
  return <>{handleRenderContent()}</>
}

export default MonitoringRightContainer
