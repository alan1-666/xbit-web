import { Button } from '@/components/ui/button'
import { useState, useEffect, useMemo } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils.ts'
import toast from '@/components/toast/index'
import { useTranslation } from 'react-i18next'
import { IntervalItem, intervalMap } from '../datafeeds'
import { selectFuturesTradePreferences, futuresTradePreferencesActions } from '@/redux/modules/futuresTradePreferences.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'



type ButtonPeriodProps = {
  currentPeriodList: IntervalItem[]
  handlePeriodListChange: (value: IntervalItem[]) => any
}

const ButtonPeriod = ({ currentPeriodList, handlePeriodListChange }: ButtonPeriodProps) => {
  const { t } = useTranslation()
  const { klinePeriod } = useAppSelector(selectFuturesTradePreferences)
  
  const [open, setOpen] = useState(false)

  const [activeShowPeriodList, setActiveShowPeriodList] = useState<IntervalItem[]>(currentPeriodList)

  const expandIncludePeriod = useMemo(() => {
    const filterList = activeShowPeriodList.filter(item => item.show)
    return !!filterList.find(item => (item.label === klinePeriod))
    
  },[klinePeriod, activeShowPeriodList])

  const handleSureBtn = () => {

    if (getCount() === 0) {
      toast.info(t('chart.period.pleaseSelectAtLeastOnePeriod'))
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

  const handlePeriodChange = (value: IntervalItem) => {
    let arr = JSON.parse(JSON.stringify(activeShowPeriodList))
    let index = arr.findIndex((item: IntervalItem) => {
      if(item.value === value.value && value.value === '1') {
        return item.label === value.label
      } else {
        return item.value === value.value 
      }
    })
    if (!arr[index].show && getCount() >= 6) {
      toast.info(t('chart.period.maximum6Periods'))
      return
    }
    
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
          <div  className={cn(
              'cursor-pointer flex items-center',
              !expandIncludePeriod
                ? 'text-(--text-primary)' : 'text-(--text-placeholder)',
            )}>
            <span className=" text-[calc(1rem*(12/16))]">{expandIncludePeriod ? '更多' : klinePeriod}</span>
            <img className="cursor-pointer" src="/images/icons/arrow-down-icon.svg" alt="arrow-down-icon" />
          </div>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle className="flex items-center">
              <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))] mr-2">
                {t('chart.period.selectedPeriod')}(<span className="text-[#00FFF6]">{getCount()}</span>/6)
              </div>
              <div
                className="text-[#00FFF6] text-[calc(1rem*(14/16))] cursor-pointer"
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
              alt="close"
            />
          </DrawerHeader>
          <div className="px-3 pb-8">
            <div className="mb-6 text-(--text-secondary) text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))]">
              {t('chart.period.supportsUpTo6Periods')}
            </div>

            <div className="mb-6 grid grid-cols-4 gap-2.5 text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))]">
              {activeShowPeriodList.map((item, index) => (
                <div
                  key={item.value}
                  onClick={() => {
                    handlePeriodChange(item)
                  }}
                  className={cn(
                    `bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.28)] border-solid border cursor-pointer rounded-[8px] text-(--text-primary) h-10 flex items-center justify-center relative`,
                    item.show
                      ? `gradient-1-border gradient-1-bg after:content-[''] after:absolute after:right-0 after:top-0 after:w-[21px] after:h-[12px] after:bg-[url('/images/icons/selected-icon.svg')] after:bg-no-repeat`
                      : ``,
                  )}
                >
                  {item.label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 ">
              <Button
                variant="borderGradient"
                className="text-(--text-primary) w-full rounded-[50px] h-[calc(1rem*(44/16))]"
                onClick={() => setOpen(false)}
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
