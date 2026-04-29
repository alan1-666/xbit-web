import InputUnit from '@/components/currentOrdersList/ModifyOrder/InputUnit'
import SliderGradient from '@/components/orderForm/SliderGradient'
import { CirclePlus } from 'lucide-react'
import { useState } from 'react'
import PositionLever from '../trade/PositionLever'
import PositionMode from '../trade/PositionMode'
import InfoRow from './InfoRow'

const tradeData = [
  { label: '强平价格', value: '65,724' },
  { label: '订单价值', value: '$3,304.80' },
  { label: '保证金', value: '$165.22' },
]

interface CryptoMarginOrderPanelProps {
  setShowTradingSignalDrawer: (show: boolean) => void
}

const CryptoMarginOrderPanel = ({ setShowTradingSignalDrawer }: CryptoMarginOrderPanelProps) => {
  const [sliderValue, setSliderValue] = useState([0])

  const AccountBalanceHeader = () => {
    return (
      <div className="flex justify-between items-center py-1">
        <div className="text-[#FFFFFFB2] text-[calc(1rem*(12/16))] font-[500]">账户可用</div>
        <div className="text-[calc(1rem*(12/16))] font-[500] gap-2 flex items-center">
          <span>10.23 USDC</span>
          <div className="group cursor-pointer">
            <CirclePlus
              onClick={() => {
                setShowTradingSignalDrawer(true)
              }}
              className={`size-4 cursor-pointer text-[#D7D7D7] 
                                transition-all duration-300 group-hover:text-white
                                group-hover:scale-110`}
            />
          </div>
        </div>
      </div>
    )
  }

  const TradeSettingsRow = () => {
    return (
      <div className="flex items-center gap-1.5">
        <PositionMode isFullWidth />
        <PositionLever isFullWidth />
      </div>
    )
  }

  const onSliderValueChange = (value: number[]) => {
    setSliderValue(value)
  }

  return (
    <div className="rounded-[6px] gradient-border p-2 gap-3 flex flex-col">
      <AccountBalanceHeader />
      <TradeSettingsRow />
      <InputUnit
        unit="USD"
        unitClassName="text-[#FFFFFF] font-bold"
        className="placeholder:text-[#FFFFFF80]"
        label="投入金额"
      />
      <div className="mt-1.5">
        <SliderGradient sliderValue={sliderValue} onSliderValueChange={onSliderValueChange} />
      </div>
      <div className="mt-8 gap-1 flex flex-col">
        {tradeData.map((item, index) => (
          <InfoRow key={index} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  )
}

export default CryptoMarginOrderPanel
