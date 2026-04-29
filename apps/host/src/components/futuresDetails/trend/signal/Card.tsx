import Tag from '@/components/common/Tag'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'
import NotificationModal from '../../NotificationModal'
import ToastCenterScreen from '../../ToastCenterScreen'
import DrawerOrder from '@/components/futuresDetails/drawerOrder'


const SignalCard = () => {
  const [isSubscription, setIsSubscription] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const onConfirmSubmit = () => {
    toast.custom(
      (t) => (
        <div className="bg-[#27272A] text-white rounded-xl overflow-hidden shadow-lg max-w-lg w-full mx-auto border border-[#ECECED2E]">
          <div className="p-4 flex items-center justify-between md:gap-14">
            <div className="text-sm">订阅信号成功</div>

            <div
              className="cusor-pointer"
              onClick={() => {
                toast.dismiss(t)
              }}
            >
              <span className="text-white text-sm cursor-pointer">查看订阅的信号</span>
              <span className="text-white ml-2 font-medium cursor-pointer">›</span>
            </div>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: 'bottom-center',
      },
    )
  }

  return (
    <div className="single-card-bg relative h-[186px] mb-2">
      <div className="flex items-center gap-2 pl-[14px] py-[10px]  ">
        <p className="text-[calc(16rem/16)] leading-[calc(16rem/16)] text-[#FFFFFF]">KairoX智选</p>
        <Tag label="做多" color="#00FFB4" />
        <Tag label="8连胜" color="#FF39A9" />
      </div>

      <div className="absolute right-[28px] top-[70px]">
        <img className="w-[61px] h-[30px] mb-2" src="/images/futuresDetail/trust-high.png" alt="trust-high" />
        <div className="text-[#FFFFFF80] text-[calc(14rem/16)] leading-[calc(12rem/16)] flex items-center">
          <img className="mr-1.5" src="/images/futuresDetail/trust-icon.svg" alt="trust-icon" />
          置信度
        </div>
      </div>

      <div className="absolute top-[10px] right-[14px]">
        <p className="text-rise text-[calc(20rem/16)] leading-[calc(20rem/16)] mb-1 flex items-end">
          + 89.98
          <span className="text-[calc(14rem/16)] leading-[calc(14rem/16)]">%</span>
        </p>
        <p className="text-[#FFFFFFCC] text-[calc(11rem/16)] leading-[calc(11rem/16)]">近30天收益率</p>
      </div>

      <div className="pt-[14px] px-[14px]">
        <p className="flex items-center mb-[18px]">
          <span className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(11rem/16)] mr-1.5">
            近1个月跑赢大盘:
          </span>
          <span className="text-rise text-[calc(16rem/16)] leading-[calc(16rem/16)]">
            +89.98
            <span className="text-[calc(12rem/16)] leading-[calc(12rem/16)]">%</span>
          </span>
        </p>

        <div className="flex items-center gap-3">
          <div>
            <p className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(12rem/16)] mb-1.5">近1年胜率</p>
            <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(13rem/16)]">90.00%</p>
          </div>

          <div>
            <p className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(12rem/16)] mb-1.5">运行时长</p>
            <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(13rem/16)]">59d /12h /33m</p>
          </div>
        </div>
      </div>

      <div className="absolute left-0 right-0 bottom-0 py-2 px-[14px] border-[#ECECED14] border-solid border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[30px] text-[#FFFFFFB2] text-[calc(14rem/16)] leading-[calc(14rem/16)]">
            <p className="flex items-center">
              <img src="/images/futuresDetail/running-icon.svg" className="mr-1.5" alt="running-icon" />
              运行中
            </p>

            <DrawerOrder />
          </div>

          <div className="w-[120px]">
            {/* 
            <ButtonGradient type="submit" className="rounded-full  w-full h-[32px]" onClick={onConfirmSubmit}>
              {!isSubscription ? '订阅' : '取消订阅'}
            </ButtonGradient> */}
            {isSubscription ? (
              <Button
                variant="close"
                className="rounded-full  w-full h-[32px]"
                onClick={() => {
                  setShowToast(true)
                  setTimeout(() => {
                    setIsSubscription(false)
                    setShowToast(false)
                  }, 1200)
                }}
              >
                取消订阅
              </Button>
            ) : (
              <Button
                variant="gradient"
                className="text-[#261236] rounded-full  w-full h-[32px]"
                onClick={() => {
                  setIsSubscription(true)
                  onConfirmSubmit()
                }}
              >
                订阅
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* modal detect whether push is enabled after subscription */}
      <NotificationModal
        setShowModal={setShowModal}
        showModal={showModal}
        onConfirmSubmit={() => {}}
        description="您还未开启手机推送通知，可能会错过最新信号提醒"
        title="推送通知"
      />
      <ToastCenterScreen showModal={showToast} setShowModal={setShowToast} text="取消订阅成功" />
    </div>
  )
}
export default SignalCard
