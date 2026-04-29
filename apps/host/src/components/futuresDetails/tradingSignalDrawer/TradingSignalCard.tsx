import TextBorder from '@/components/common/TextBorder'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import TradeDetailsGrid from './TradeDetailsGrid'

interface TradingSignalCardProps {
  takeProfitColor?: '#00FFF6' | '#FFFFFFB2'
  isShowConsecutiveWins?: boolean
  shortColor?: '#AB57FF' | '#00FFB4'
  disable?: boolean
}

const TradingSignalCard = ({
  isShowConsecutiveWins,
  takeProfitColor = '#00FFF6',
  shortColor = '#00FFB4',
  disable,
}: TradingSignalCardProps) => {
  const HeaderTradingSignalCard = () => {
    return (
      <div className="flex items-center rounded-t-[6px] bg-[#ECECED0A] px-[12px] py-[8px] justify-between">
        <div className="flex gap-2 items-center">
          <p className="text-[calc(1rem*(14/16))] font-[500]">BTCUSD永续</p>
          <p
            className={`bg-[${shortColor}] text-[calc(1rem*(11/16))] p-0.5 px-1 text-[#141414] rounded-[2px] flex items-center`}
          >
            做多
          </p>
          {isShowConsecutiveWins && <TextBorder text="8连胜" />}
          <p className={`text-[${takeProfitColor}] font-[400] text-[calc(1rem*(11/16))]`}>·运行中</p>
        </div>
        <div className="">
          <p className="text-[calc(1rem*(12/16))] text-[#FFFFFFB2]">实时收益</p>
          <p className="text-[calc(1rem*(16/16))] text-[#00FFB4] font-[500]">5.34%</p>
        </div>
      </div>
    )
  }

  const TradingSignalCardBody = () => {
    return (
      <div className="w-full mx-auto px-[12px] pt-[12px]">
        <div className="pb-[12px]">
          <p className="text-[calc(1rem*(11/16))] text-[#FFFFFFCC] font-[400]">近30天收益率:</p>
          <p className="text-[calc(1rem*(20/16))] text-[#00FFB4] font-[500]">
            +10.98<span className="">%</span>
          </p>
        </div>
        <TradeDetailsGrid />
      </div>
    )
  }

  return (
    <div className="bg-[url('/images/mask-group-bg.svg')] bg-no-repeat bg-cover pb-4 rounded-[6px]">
      <HeaderTradingSignalCard />
      <TradingSignalCardBody />
      <div className="px-[12px]">
        <Button
          variant={disable ? 'disabled' : 'gradient'}
          className={cn(
            'w-full rounded-[50px] h-[calc(1rem*(44/16))]',
            !disable ? 'text-tertiary' : 'text-[#FFFFFF80]',
          )}
        >
          确认下单
        </Button>
      </div>
    </div>
  )
}

export default TradingSignalCard
