import { useState } from 'react'
import { Button } from '../ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import Text from '../common/Text'
import InputUnit from '../currentOrdersList/ModifyOrder/InputUnit'
import SliderGradient from '../orderForm/SliderGradient'
import { TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import ToastCenterScreen from '../futuresDetails/ToastCenterScreen'

const WithdrawalDrawer = () => {
  const [open, setOpen] = useState(false)
  const [sliderValue, setSliderValue] = useState([0])
  const [fakeLoading, setFakeLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const onSliderValueChange = (value: number[]) => {
    setSliderValue(value)
  }

  const onConfirmSubmit = () => {
    setFakeLoading(true)
    setTimeout(() => {
      setFakeLoading(false)
      setShowModal(true)
    }, 3000)
    toast.custom(
      (t) => (
        <div className="bg-[#27272A] text-white rounded-xl overflow-hidden shadow-lg max-w-lg w-full mx-auto border border-[#ECECED2E]">
          <div className="p-4 flex items-center justify-between md:gap-14">
            <div className="text-sm flex gap-1">
              <img src={`/images/vaultDetail/receive-square.png`} alt="" className="cursor-pointer" /> 提款：订单处理中
            </div>

            <div
              className="cusor-pointer"
              onClick={() => {
                toast.dismiss(t)
              }}
            >
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setOpen(false)}
                alt=""
              />
            </div>
          </div>
        </div>
      ),
      {
        duration: 3000,
        position: 'top-center',
      },
    )
  }

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild className="flex-1">
          <Button variant="borderGradient" className="rounded-full w-[175px] bg-[#ECECED1F] h-[calc(1rem*(44/16))]">
            提款
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[url('/images/bg-drawer-gradient.png')] bg-no-repeat bg-cover max-w-[768px] mx-auto rounded-t-[35px]">
          <DrawerHeader className="py-1 px-3.5  flex w-full items-center justify-between">
            <DrawerTitle className="flex items-center">
              <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">XBIT量化2号金库</div>
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="px-3 mt-4">
            <div className="mb-4 p-2 px-0">
              <div className="flex justify-between p-2 pt-3 h-[60px] wrap-withdrawal-content rounded-t-[8px]">
                <Text text="您的组合余额" color="#FFFFFFB2" fontSize={14} fontWeight="regular" />
                <Text text="10.23 USDC" fontSize={14} fontWeight="medium" />
              </div>
              <InputUnit
                type="number"
                unit="最大"
                unitClassName="text-[#00FFB4] bg-[#00FFB433] rounded-[4px]
                py-[4px] px-[8px] text-[calc(1rem*(13/16))]"
                className="placeholder:text-[#FFFFFF80]"
                label="提款数量"
                inputWrapperClassName="-mt-4"
              />
              <div className="my-4.5">
                <SliderGradient sliderValue={sliderValue} onSliderValueChange={onSliderValueChange} />
              </div>

              <div className="flex gap-1 mt-8">
                <TriangleAlert className="size-4 text-[#FF353C]" />

                <Text
                  text="由于平仓滑点，最终金额可能与最初输入的金额不同。"
                  color="#FF353C"
                  fontSize={12}
                  fontWeight="regular"
                />
              </div>
            </div>
            <Button
              isLoading={fakeLoading}
              variant="gradient"
              className=" text-tertiary w-full rounded-full h-[calc(1rem*(44/16))] mb-4"
              onClick={() => onConfirmSubmit()}
            >
              立即买入
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
      <ToastCenterScreen
        showModal={showModal}
        setShowModal={setShowModal}
        text="提款成功"
        isToastStatus
        description="已提款至您的账户"
        // isSuccess
        customIcon={<img src="/images/vaultDetail/done.png" alt="" className="mb-1" />}
      />
    </div>
  )
}

export default WithdrawalDrawer
