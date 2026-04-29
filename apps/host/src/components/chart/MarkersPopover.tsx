import { KlineStickerUserType } from '@/@generated/gql/graphql-meme2'
import React, { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Switch } from '../ui/switch'
import { USER_TYPE_OPTIONS } from './ChartHeadPC'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { usePageType } from '@/hooks/usePageType'
import { cn } from '@/lib/utils'
import { chartActions } from '@/redux/modules/chart.slice'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'

interface MarkersPopoverProps {
  selectedUserTypes: Set<KlineStickerUserType | 'all'>
  onToggleUserType?: (userType: KlineStickerUserType | 'all') => any
}

const MarkersPopover: React.FC<MarkersPopoverProps> = ({ selectedUserTypes, onToggleUserType }) => {
  const pageType = usePageType()
  const dispatch = useAppDispatch()
  const chartState = useAppSelector((state) => state.chart[pageType])
  const { isPatch } = chartState
  const [isMarksPopoverOpen, setIsMarksPopoverOpen] = useState(false)
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  useEffect(() => {
    const iframe = document.querySelector('#chartContainer') as HTMLDivElement | null
    if (iframe) {
      iframe.style.pointerEvents = isMarksPopoverOpen ? 'none' : 'auto'
    }
  }, [isMarksPopoverOpen])

  return (
    <Popover open={isMarksPopoverOpen} onOpenChange={setIsMarksPopoverOpen}>
      <TooltipProvider delayDuration={200}>
        <Tooltip open={!isMarksPopoverOpen ? undefined : false}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                id="markers-trigger"
                type="button"
                className={cn(
                  'size-4 cursor-pointer transition-transform duration-200 hover:scale-[1.1] flex items-center justify-center',
                  selectedUserTypes.size === 0 && 'opacity-50',
                )}
              >
                <img src="/images/chart/chart-marks.svg" alt="icon chart marks" className="w-full h-full" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          {isDesktop && (
            <TooltipContent className="max-w-90 bg-[#191919]">
              <p className="text-[12px] tracking-wide">Display</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        id="markers-popover"
        className="w-[200px] max-h-[300px] overflow-y-auto bg-[#232329] p-2 border border-[#ECECED0A] z-[9999]"
        align="end"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#ECECED0A]">
          <span className="text-white text-[12px] font-[380]">{t('chart.marker')}</span>
          <div className="flex items-center gap-2">
            <span className="text-white text-[12px] font-[380]">All</span>
            <Switch
              checked={selectedUserTypes ? selectedUserTypes.has('all') : false}
              onCheckedChange={() => {
                onToggleUserType?.('all')
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {USER_TYPE_OPTIONS.map((option) => {
            const isSelected = selectedUserTypes.has(option.value)
            return (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded hover:bg-[#ECECED14] text-[12px] font-[380]',
                  isSelected && 'bg-[#ECECED14]',
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    onToggleUserType(option.value)
                  }}
                  className="w-3 h-3 rounded border-[#ECECED14] bg-transparent text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-white">{option.label}</span>
              </label>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#ECECED0A]">
          <span className="text-white text-[12px] font-[380]">{t('chart.candleSmoother')}</span>
          <div className="flex items-center gap-2">
            {/* <span className="text-white text-[12px] font-[380]">All</span> */}
            <Switch
              defaultChecked={isPatch}
              checked={isPatch}
              onCheckedChange={() => {
                dispatch(chartActions.updateIsPatch({ type: pageType, isPatch: !isPatch }))
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MarkersPopover
