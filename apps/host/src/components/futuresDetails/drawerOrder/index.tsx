import StatsCard from '@/components/orderBook/StatsCard'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useState } from 'react'
import { toast } from 'sonner'
import NotificationModal from '../NotificationModal'
import ToastCenterScreen from '../ToastCenterScreen'
import TradingSignalDrawer from '../tradingSignalDrawer'
import CryptoMarginOrderPanel from './CryptoMarginOrderPanel'
import Header from './Header'
import TradeInfoCard from './TradeInfoCard'

const DrawerOrder = () => {
  const [open, setOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showTradingSignalDrawer, setShowTradingSignalDrawer] = useState(false)
  const [showToastCenterScreen, setShowToastCenterScreen] = useState(false)
  // fake loading
  const [isLoading, setIsLoading] = useState(false)

  const onConfirmSubmit = () => {
    toast.custom(
      (t) => (
        <div className=" text-white rounded-xl overflow-hidden shadow-lg max-w-lg w-full mx-auto border border-[#ECECED2E]">
          <div className="p-4 flex items-center justify-between md:gap-14">
            <div className="text-sm">BTCUSD:订单处理中</div>

            {/* <div
              className="cusor-pointer flex items-center"
              onClick={() => {
                toast.dismiss(t)
              }}
            >
              <span className="text-white text-sm cursor-pointer">查看订阅的信号</span>
              <span className="text-white ml-2 font-medium cursor-pointer">
                <img
                  src="/images/icons/icon-x.svg"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setOpen(false)}
                  alt=""
                />
              </span>
            </div> */}
          </div>
        </div>
      ),
      {
        duration: 2000,
        position: 'top-center',
      },
    )

    setIsLoading(true)

    setTimeout(() => {
      setShowToastCenterScreen(true)
      setIsLoading(false)
    }, 2000)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant={'ghost'}
          className="p-0"
        >
          <p className="flex items-center">
            <img src="/images/futuresDetail/candle-icon.svg" className="mr-1.5" alt="candle icon" />
            叠加K线
          </p>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto bg-[url('/images/popup-bg.svg')] bg-no-repeat bg-cover">
        <DrawerHeader className="py-1 px-3.5  flex w-full items-center justify-between">
          <DrawerTitle className="flex items-center">
            <div className="text-[#00FFF6] text-[calc(1rem*(14/16))] font-[400] cursor-pointer underline">
              建议切换到30分周期{' '}
            </div>
          </DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-2.5 pb-8 mt-3">
          <Header />

          {/* body */}
          <div className="my-3 mt-4 grid grid-cols-2 gap-2 flex-1 h-full">
            <div className="flex-1 flex flex-col">
              <StatsCard
                title={'实时盈亏'}
                content="5.43%"
                className="mb-[4px] h-[52px] min-h-[52px] flex flex-col-reverse gap-1 items-center justify-center "
                titleClassName="mb-0"
              />
              <TradeInfoCard />
            </div>
            <CryptoMarginOrderPanel setShowTradingSignalDrawer={setShowTradingSignalDrawer} />
          </div>

          <p className="text-[calc(1rem*(11/16))] font-[400] text-[#FFFFFFB2] mt-4">
            风险提示：历史胜率、信号建议仅供参考，市场有风险，投资需谨慎。
          </p>

          <Button
            variant="gradient"
            className="text-tertiary w-full rounded-[50px] h-[calc(1rem*(44/16))] mt-3 hover:scale-[101%] transition-all duration-300"
            isLoading={isLoading}
            onClick={() => {
              setShowModal(true)
              // handleSureBtn()
            }}
          >
            确定
          </Button>
        </div>
      </DrawerContent>

      <NotificationModal
        setShowModal={setShowModal}
        showModal={showModal}
        onConfirmSubmit={onConfirmSubmit}
        description="您目前有一张相同合约，但方向相反的持仓单，若继续下单会发生平仓，请确认是否继续？"
        title="提示"
      />

      <TradingSignalDrawer open={showTradingSignalDrawer} onOpenChange={setShowTradingSignalDrawer} />
      <ToastCenterScreen showModal={showToastCenterScreen} setShowModal={setShowToastCenterScreen} text="下单成功" />
    </Drawer>
  )
}

export default DrawerOrder
