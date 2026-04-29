import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Dispatch, SetStateAction, useState } from 'react'
import AlertTypesDrawer from './AlertTypesDrawer'
import { Button } from '@/components/ui/button'

const frequencyList = [
  { id: 0, label: '重复提醒' },
  { id: 1, label: '仅此一次' },
]

interface CreateAlertDrawerProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const CreateAlertDrawer = ({ open, setOpen }: CreateAlertDrawerProps) => {
  const [type, setType] = useState(0)
  const [frequency, setFrequency] = useState(0)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6 bg-[url('/images/popup-bg.png')] bg-size-[100%_100%] bg-no-repeat">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="flex justify-end px-3 py-0">
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3">
          <div className="flex flex-col gap-2">
            <div className="text-base leading-4 app-font-medium text-[#FFFFFF]">BTCUSD永续</div>
            <div className="flex items-center gap-2 text-[#00FFB4]">
              <span className="text-[calc(1rem*(22/16))] leading-[calc(1rem*(22/16))] font-semibold">82,865</span>
              <div className="flex items-end">
                <span className="text-[calc(1rem*(22/16))] leading-[calc(1rem*(22/16))] font-semibold">+0.45</span>
                <span className="text-sm leading-[calc(1rem*(14/16))]">%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 px-3 py-2.5 rounded-[8px] bg-[#ECECED14]">
            <div className="text-base leading-[calc(1rem*(18/16))] app-font-medium">提醒类型</div>
            <AlertTypesDrawer {...{ type, setType }} />
            <div className="mt-4 mb-5 py-4 px-3 h-12 rounded-[6px] flex bg-[#19191E] text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))]">
              <input className="w-full" placeholder="价格" />
              <span className="text-[#FFFFFFCC]">USD</span>
            </div>
          </div>
          <div className="mt-5">
            <div className="text-base app-font-medium">推送频率</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {frequencyList.map((item) => (
                <div
                  className={`border-[0.5px] ${frequency === item.id ? 'border-gradient bg-gradient' : 'border-[#ECECED14] bg-[#ECECED14]'} rounded-[6px] py-2 text-sm text-center cursor-pointer`}
                  key={item.id}
                  onClick={() => setFrequency(item.id)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <div className="text-base app-font-medium">备注(选填)</div>
            <textarea
              className="mt-3 w-full min-h-32 bg-[#19191E] border-[0.5px] border-[#ECECED14] rounded-[6px] p-3 placeholder:text-[#FFFFFF80] text-white text-[calc(14rem/16)] resize-none"
              placeholder="例如：翻倍出本金"
            />
          </div>
          <div className="py-3 grid grid-cols-2 gap-2">
            <Button variant="borderGradient" className="rounded-[50px] h-11" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button variant="gradient" className="rounded-[50px] h-11 text-tertiary" onClick={() => setOpen(false)}>
              添加
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateAlertDrawer
