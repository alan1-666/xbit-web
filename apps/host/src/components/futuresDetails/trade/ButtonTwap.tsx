import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TimerWithWheelPicker from './TimerDisplay/TimerDisplay'

interface ButtonTwapProps {
  onTimeSelected?: (minutes: number) => void
  currentDuration?: number
}

const ButtonTwap = ({ onTimeSelected, currentDuration = 30 }: ButtonTwapProps) => {
  // Initialize with current duration value converted to hour and minute ids
  const initialHours = Math.floor(currentDuration / 60)
  const initialMinutes = currentDuration % 60

  const [selected, setSelected] = useState<{
    hour: string
    minute: string
  }>({
    hour: `hour-${initialHours}`,
    minute: `minute-${initialMinutes}`,
  })
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  // Helper function to extract number from id (e.g., 'hour-5' -> 5)
  const extractNumberFromId = (id: string): number => {
    const parts = id.split('-')
    return parseInt(parts[1], 10)
  }

  // Helper function to convert hours and minutes to total minutes
  const convertToTotalMinutes = (hourId: string, minuteId: string): number => {
    const hours = extractNumberFromId(hourId)
    const minutes = extractNumberFromId(minuteId)
    return hours * 60 + minutes
  }

  // Format display text
  const getDisplayText = () => {
    const hours = parseInt(selected.hour.split('-')[1])
    const minutes = parseInt(selected.minute.split('-')[1])

    if (hours === 0 && minutes > 0) {
      return `${minutes}分钟`
    } else if (hours > 0 && minutes === 0) {
      return `${hours}小时`
    } else if (hours > 0 && minutes > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return '选择时长'
  }

  const handleConfirm = () => {
    const totalMinutes = convertToTotalMinutes(selected.hour, selected.minute)
    onTimeSelected?.(totalMinutes)
    setOpen(false)
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div
            className={`
            px-[8px] py-[2px] border border-solid border-[#ECECED0A] rounded-[4px] cursor-pointer
            flex justify-between items-center h-[40px] flex-1 mb-2 w-full mt-7 bg-[#14141480]`}
          >
            <p className="text-[#FFFFFF80] text-[calc(1rem*(14/16))] leading-[100%]">运行时长</p>
            <p className="text-[#FFFFFF5C] text-[calc(1rem*(12/16))] leading-[100%] font-[500]">{getDisplayText()}</p>
          </div>
        </DrawerTrigger>

        <DrawerContent className="w-full bg-[url('/images/bg-drawer-gradient.png')] bg-no-repeat bg-cover max-w-[768px] mx-auto rounded-t-[35px]">
          <DrawerHeader className="py-1 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle className="flex items-center">
              <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">
                {t('detail.tokenDetail.selectStartTime')}
              </div>
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="mt-6">
            <TimerWithWheelPicker selected={selected} setSelected={setSelected} />

            <div className="grid grid-cols-2 gap-2 mt-5 mb-4 px-3">
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
                onClick={handleConfirm}
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

export default ButtonTwap
