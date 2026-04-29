import { tradingviewChartTypeList } from '@/datafeeds/index'
import { cn } from '@/lib/utils.ts'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '../ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'

type ButtonKlineStyleProps = {
  currentChartType: number
  handleChartTypeChange: (value: number) => any
}

const ButtonKlineStyle = ({ currentChartType, handleChartTypeChange }: ButtonKlineStyleProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const icon = useMemo(() => {
    const item = tradingviewChartTypeList.find((i) => i.value === currentChartType)
    return item?.selectedIcon
  }, [currentChartType])

  useEffect(() => {
    setOpen(false)
  }, [currentChartType])

  const charTypeSelected = tradingviewChartTypeList?.find((i) => i?.value === currentChartType)
  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger
                asChild
                className="bg-[#ECECED0A] p-0.5 min-h-[34px] rounded-[4px] flex items-center cursor-pointer flex-shrink-0"
              >
                <div className="px-2 py-1.5 flex items-center gap-1 rounded-[2px]">
                  <img className="size-[16px]" src={icon} alt="icon" />
                  <img
                    className={`cursor-pointer transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    src="/images/icons/icon-chevron-down.svg"
                    alt="icon arrow down"
                  />
                </div>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px] bg-[#191919]">
              <p className="text-[12px] tracking-wide">{t(charTypeSelected?.label)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent
          className="w-max bg-[#232329] rounded-[4px] shadow-lg z-10 p-1"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          {tradingviewChartTypeList.map((item) => (
            <div
              key={item.value}
              className={cn(
                'px-3 py-1.5 cursor-pointer text-[12px] font-[380] flex items-center gap-1 rounded-[2px] hover:bg-[#ECECED0A]',
                currentChartType === item.value ? 'bg-[#ECECED14] text-white' : 'text-white/50',
              )}
              onClick={() => {
                handleChartTypeChange(item.value)
                setOpen(false)
              }}
            > 
              <img
                className="size-[16px]"
                src={currentChartType === item.value ? item.selectedIcon : item.icon}
                alt="icon"
              />
              <span>{t(item.label)}</span>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default ButtonKlineStyle
