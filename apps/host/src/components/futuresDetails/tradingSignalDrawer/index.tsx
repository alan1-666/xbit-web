import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import TradingSignalCard from './TradingSignalCard'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TradingSignalDrawer = ({ onOpenChange, open }: DrawerProps) => {
  return (
    <div>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto max-h-3/5">
          <DrawerHeader className="py-1 px-3.5 w-full">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center">
                <div className="flex gap-1 items-center">
                  <span className="text-[calc(1rem*(18/16))] font-[500]">哪吒3号</span>
                  <img src="/images/icons/ic-arrow-right-simple.svg" className="w-[16px] min-w-[16px]" alt="" />
                </div>
              </DrawerTitle>
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer"
                onClick={() => onOpenChange(false)}
                alt=""
              />
            </div>

            <div className="flex justify-between items-center text-[calc(1rem*(12/16))]">
              <div className="text-[#FFFFFFB2] ">2025/03/18 12:00 此K线包含5个信号</div>
              <p className="text-[#00FFF6] underline font-[400]">建议切换到30分周期</p>
            </div>
          </DrawerHeader>
          <div className="px-2.5 pb-8 mt-3 overflow-y-auto _hidescrollbar flex gap-2 flex-col">
            <TradingSignalCard isShowConsecutiveWins takeProfitColor="#00FFF6" />
            <TradingSignalCard takeProfitColor="#00FFF6" disable />
            <TradingSignalCard takeProfitColor="#00FFF6" disable />
            <TradingSignalCard takeProfitColor="#00FFF6" disable />
            <TradingSignalCard takeProfitColor="#FFFFFFB2" shortColor='#AB57FF' disable />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default TradingSignalDrawer
