import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { tradingviewChartTypeList } from '@/datafeeds/index'
import { cn } from '@/lib/utils.ts'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type ButtonKlineStyleProps = {
  currentChartType: number
  handleChartTypeChange: (value: number) => any
}

const ButtonPeriod = ({ currentChartType, handleChartTypeChange }: ButtonKlineStyleProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [currentType, setCurrentType] = useState(currentChartType)

  const handleSureBtn = () => {
    handleChartTypeChange(currentType)
    setOpen(false)
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <img
            className="bg-[#25252A] rounded-sm cursor-pointer size-[14px]"
            src="/images/icons/arrow-down-icon.svg"
            alt="icon arrow down"
          />
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-5 px-3.5  flex w-full items-center justify-between">
            <DrawerTitle className="flex items-center">
              <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">
                {t('chart.toolbar.klineStyle')}
              </div>
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="pb-3 mt-6">
            <div className="grid grid-cols-4 gap-2.5 text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))] mb-6 px-3">
              {tradingviewChartTypeList.map((item) => (
                <div
                  // border: 0.5px solid #FFFFFF47
                  key={item.value}
                  className={cn(
                    `text-center bg-[#2B2B33] rounded-lg cursor-pointer text-[#908E98] h-20 flex flex-col items-center justify-center relative`,
                    currentType === item.value ? 'bg-[#584487] text-white' : '',
                  )}
                  onClick={() => {
                    // setOpen(false)
                    setCurrentType(item.value)
                  }}
                >
                  <img
                    className={`mb-1.5 ${currentType === item.value ? 'opacity-100' : 'opacity-50'}`}
                    src={item.icon}
                    alt="icon"
                  />
                  {t(item.label)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-[#ECECED0A] px-3 pt-[12px]">
              <Button
                variant="close"
                className="text-(--text-primary) w-full rounded-[50px] h-[calc(1rem*(44/16))] bg-[#ECECED1F]"
                onClick={() => {
                  setCurrentType(currentChartType)
                  setOpen(false)
                }}
              >
                {t('chart.buttons.cancel')}
              </Button>
              <Button
                variant="gradient"
                className=" text-tertiary w-full rounded-[50px] h-[calc(1rem*(44/16))]"
                onClick={() => handleSureBtn()}
              >
                {t('chart.buttons.confirm')}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ButtonPeriod
