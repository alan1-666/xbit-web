import StatsCard from '@/components/orderBook/StatsCard'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import InfoRow from '../drawerOrder/InfoRow'
import SliderGradient from '@/components/orderForm/SliderGradient'
import InputUnit from '@/components/currentOrdersList/ModifyOrder/InputUnit'
import { CirclePlus } from 'lucide-react'
import ToastCenterScreen from '../ToastCenterScreen'

const TradeInfo = () => {
  const tradeData = [
    { label: '组合数', value: '23' },
    { label: '近1个月跑赢大盘', value: '+0.34%', valueColor: 'text-[#00FFB4]' },
    { label: '总锁仓价值(TVL)', value: '$181,615' },
    { label: '最大回撤', value: '-4.48%', valueColor: 'text-[#00FFB4]' },
  ]

  return (
    <div className={cn(`rounded-[6px] p-2 flex justify-between flex-col flex-1 bg-[#53538814] mt-1`)}>
      {tradeData.map((item, index) => (
        <InfoRow key={index} label={item.label} value={item.value} valueColor={item.valueColor} />
      ))}
    </div>
  )
}

const AccountBalanceHeader = () => {
  return (
    <div className="flex justify-between items-center py-1">
      <div className="text-[#FFFFFFB2] text-[calc(1rem*(12/16))] font-[500]">账户可用</div>
      <div className="text-[calc(1rem*(12/16))] font-[500] gap-2 flex items-center">
        <span>10.23 USDC</span>
        <div className="group cursor-pointer">
          <CirclePlus
            className={`size-4 cursor-pointer text-[#D7D7D7] 
                                transition-all duration-300 group-hover:text-white
                                group-hover:scale-110`}
          />
        </div>
      </div>
    </div>
  )
}

const CryptoMarginOrderPanel = () => {
  const [sliderValue, setSliderValue] = useState([0])

  const onSliderValueChange = (value: number[]) => {
    setSliderValue(value)
  }

  return (
    <div className="rounded-[6px] crypto-margin-class p-2 gap-3 flex flex-col">
      <AccountBalanceHeader />
      <InputUnit
        type="number"
        unit="USD"
        unitClassName="text-[#FFFFFF] font-bold"
        className="placeholder:text-[#FFFFFF80]"
        label="投入金额"

        // isCenterText
      />
      <div className="mt-1.5">
        <SliderGradient sliderValue={sliderValue} onSliderValueChange={onSliderValueChange} />
      </div>

      <div className="mt-10 text-[calc(1rem*(11/16))] text-[#FFFFFFB2]">
        提示：购买金额最少为5USDC，购买24小时后才能提款
      </div>
    </div>
  )
}

const BuyNowDrawer = () => {
  const [open, setOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant={'gradient'} className={cn('w-full rounded-[50px] text-[#141414]')}>
            {'立即买入'}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[url('/images/bg-drawer-gradient.png')] bg-no-repeat bg-cover max-w-[768px] mx-auto rounded-t-[35px]">
          <DrawerHeader className="py-1 px-3.5  flex w-full items-center justify-between">
            <DrawerTitle className="flex items-center">
              <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">顺势而为</div>
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="px-3 flex flex-col gap-3">
            <div className="gap-2 mb-4">
              <div className="my-3 mt-4 grid grid-cols-2 gap-2 flex-1 h-full">
                <div className="flex-1 flex flex-col">
                  <StatsCard
                    title={'年化收益率'}
                    content="5.43%"
                    className="mb-[4px] h-[52px] min-h-[52px] flex flex-col-reverse gap-1 items-center justify-center "
                    titleClassName="mb-0 text-[calc(1rem*(12/16))]"
                    contentClassName="text-[#00FFB4] text-[calc(1rem*(17/16))] font-[500]"
                  />
                  <TradeInfo />
                </div>
                <CryptoMarginOrderPanel />
              </div>

              <Button
                variant="gradient"
                className=" text-tertiary w-full rounded-[50px] h-[calc(1rem*(44/16))]"
                onClick={() => setShowModal(true)}
              >
                确定
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <ToastCenterScreen showModal={showModal} setShowModal={setShowModal} text="买入成功"  isToastStatus  description="请在【资产】看查购买记录" isSuccess />
    </div>
  )
}

export default BuyNowDrawer
