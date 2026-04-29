import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { IconCheckedCircle } from '@components/icon/IconCheckedCircle.tsx'
import { ArrowDownIcon1  } from '@components/icon/ArrowDownIcon.tsx'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"

type TimeRangeOption = {
  value: string
  label: string
}

const TimeRangeSelectItem = (props: { name: string; selected: boolean; onClick: () => void }) => {
  const { name, selected, onClick } = props
  return (
    <div
      className="flex items-center py-4 border-b border-[#ECECED14] last:border-b-0 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="text-[1rem] font-medium text-white">{name}</div>
      </div>
      {selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <IconCheckedCircle className="size-5" />
        </motion.div>
      )}
    </div>
  )
}

type TimeRangeSelectProps = {
  value?: string
  onChange: (value: string) => void
}

const TimeRangeSelect = ({ value = 'TODAY', onChange }: TimeRangeSelectProps) => {
  const { isDesktop } = useResponsive()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const timeRangeOptions: TimeRangeOption[] = [
    { value: 'TODAY', label: t('nodeAgent.timeRange.today') },
    { value: 'LAST_30_DAYS', label: t('nodeAgent.timeRange.30days') },
    { value: 'LAST_60_DAYS', label: t('nodeAgent.timeRange.60days') },
    { value: 'ALL_TIME', label: t('nodeAgent.timeRange.allTime') },
  ]

  const selectedOption = timeRangeOptions.find((option) => option.value === value) || timeRangeOptions[0]

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
  }

  const triggerButton = (
    <div className="flex items-center px-3 gap-1.5 bg-[#ECECED14] rounded-full cursor-pointer text-[calc(13rem/16)] leading-[calc(13rem/16)] h-[26px] text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z"
          fill="white"
          fillOpacity={0.8}
        />
      </svg>
      <span className="text-[12px] leading-[14px] font-medium">{selectedOption.label}</span>
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn('transition-transform duration-200', open && isDesktop && 'rotate-180')}
      >
        <path
          d="M8.2115 11.045C8.08484 11.045 7.95817 10.9983 7.85817 10.8983L3.8115 6.85167C3.61817 6.65833 3.61817 6.33833 3.8115 6.145C4.00484 5.95167 4.32484 5.95167 4.51817 6.145L8.2115 9.83833L11.9048 6.145C12.0982 5.95167 12.4182 5.95167 12.6115 6.145C12.8048 6.33833 12.8048 6.65833 12.6115 6.85167L8.56484 10.8983C8.46484 10.9983 8.33817 11.045 8.2115 11.045Z"
          fill="white"
          fillOpacity={0.8}
        />
      </svg>
    </div>
  )

  const contentBody = (
    <div className={isDesktop ? 'px-2' : 'px-4' }>
      {timeRangeOptions.map((option) => (
        <TimeRangeSelectItem
          key={option.value}
          name={option.label}
          selected={value === option.value}
          onClick={() => handleSelect(option.value)}
        />
      ))}
    </div>
  )

  // Desktop: Select
  if (isDesktop) {
    return (
      <Select value={value} onValueChange={onChange} onOpenChange={setOpen}>
        <SelectTrigger 
          className="flex  p-0 items-center gap-1.5  cursor-pointer text-[calc(13rem/16)] leading-[calc(13rem/16)] h-[26px] text-white border-none shadow-none  focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-1 [&_.lucide]:hidden"
        >
          <img src="/images/nodeAgent/calendar.svg" className="w-4 h-4" alt="" />
          <SelectValue className="text-[16px] leading-[14px] font-medium text-white">
            {selectedOption.label}
          </SelectValue>
          <ArrowDownIcon1 className="w-4 h-4" />
        </SelectTrigger>
        <SelectContent 
          className="bg-[#232329] border border-[#ECECED14] rounded-[8px] shadow-lg max-w-[200px]  p-0"
          position="popper"
        >
          {timeRangeOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="py-2 border-b border-[#ECECED14] last:border-b-0 cursor-pointer focus:bg-[#ECECED0A] data-[state=checked]:bg-[#ECECED0A]"
            >
              <div className="flex items-center justify-between w-full pr-8">
                <p className="text-[12px] font-medium text-white">{option.label}</p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Mobile: Drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="flex justify-between items-center px-3 py-3">
          <div className="text-white text-lg font-medium">{t('nodeAgent.timeRange.selectTimeRange')}</div>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        {contentBody}
      </DrawerContent>
    </Drawer>
  )
}

export default TimeRangeSelect
