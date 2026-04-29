import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils.ts'
import { intervalMap, IntervalItem } from '@/datafeeds/index'
import toast from '@/components/toast/index'
import { useTranslation } from 'react-i18next'

type ButtonPeriodProps = {
  currentPeriodList: IntervalItem[]
  handlePeriodListChange: (value: IntervalItem[]) => any
  activePeriod: string
}

const ButtonPeriod = ({ currentPeriodList, handlePeriodListChange, activePeriod }: ButtonPeriodProps) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const [activeShowPeriodList, setActiveShowPeriodList] = useState<IntervalItem[]>(currentPeriodList)

  const handleSureBtn = () => {
    if (getCount() > 6) {
      toast.info(t('chart.period.maximum6Periods'))
      return
    }

    let showList = activeShowPeriodList.filter((item) => item.show)

    if (!showList.find((item) => item.value === activePeriod)) {
      const item = activeShowPeriodList.find((item) => item.value === activePeriod)
      toast.info(t('chart.period.currentPeriodNotInList', { period: item?.label }))
      return
    }
    setOpen(false)
    handlePeriodListChange(activeShowPeriodList)
  }

  const getCount = () => {
    return activeShowPeriodList.filter((item) => {
      return item.show
    }).length
  }

  const handlePeriodChange = (value: string) => {
    let arr = JSON.parse(JSON.stringify(activeShowPeriodList))
    let index = arr.findIndex((item: IntervalItem) => {
      return item.value === value
    })
    arr[index].show = !arr[index].show

    setActiveShowPeriodList(arr)
  }

  const setDefault = () => {
    setActiveShowPeriodList(intervalMap)
  }

  useEffect(() => {
    setActiveShowPeriodList(currentPeriodList)
  }, [currentPeriodList, open])

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
          <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle className="flex items-center">
              <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))] mr-2">
                {t('chart.period.selectedPeriod')}(<span className="text-[#C8A7FD]">{getCount()}</span>/6)
              </div>
              <div
                className="text-[#C8A7FD] text-[calc(1rem*(14/16))] cursor-pointer"
                onClick={() => {
                  setDefault()
                }}
              >
                {t('chart.period.resetToDefault')}
              </div>
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="pb-8">
            <div className="mb-6 text-(--text-secondary) text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))] px-3">
              {t('chart.period.supportsUpTo6Periods')}
            </div>

            <div className="mb-6 grid grid-cols-4 gap-2.5 text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))] px-3">
              {activeShowPeriodList.map((item, index) => (
                <div
                  key={item.value}
                  onClick={() => {
                    handlePeriodChange(item.value)
                  }}
                  className={cn(
                    `bg-[#2B2B33] border-[#2B2B33] border-[0.5px] cursor-pointer rounded-lg text-[#908E98] h-10 flex items-center justify-center relative`,
                    item.show
                      ? `bg-[#584487] border-[border-[#2B2B33]] after:content-[''] after:absolute after:right-0 after:top-0 after:w-[23px] after:h-[12px] after:bg-[url('/images/icons/selected-icon-v2.svg')] after:bg-no-repeat text-white`
                      : ``,
                  )}
                >
                  {item.label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-[#ECECED0A] px-3 pt-[12px]">
              <Button
                variant="close"
                className="text-white w-full rounded-full h-11"
                onClick={() => setOpen(false)}
              >
                {t('chart.buttons.cancel')}
              </Button>
              <Button
                variant="gradient"
                className="text-white w-full rounded-full h-11"
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
