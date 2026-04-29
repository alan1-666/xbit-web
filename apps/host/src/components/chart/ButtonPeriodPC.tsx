import toast from '@/components/toast/index'
import { Button } from '@/components/ui/button'
import { IntervalItem, intervalMap } from '@/datafeeds/index'
import { cn } from '@/lib/utils.ts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { capitalizeFirstLetter } from '@/lib/utils'
import { usePageType } from '@/hooks/usePageType'
import { chartActions } from '@/redux/modules/chart.slice'
import { useAppDispatch } from '@/redux/store'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '../ui/dropdown-menu'

type ButtonPeriodProps = {
  currentPeriodList: IntervalItem[]
  handlePeriodListChange: (value: IntervalItem[]) => any
  activePeriod: string
  handlePeriodChange?: (value: string) => any
}

const ButtonPeriod = ({
  currentPeriodList,
  handlePeriodListChange,
  activePeriod,
  handlePeriodChange,
}: ButtonPeriodProps) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const [open, setOpen] = useState(false)
  const [activeShowPeriodList, setActiveShowPeriodList] = useState<IntervalItem[]>(currentPeriodList)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const pageType = usePageType()
  const dispatch = useAppDispatch()
  const [customPeriod, setCustomPeriod] = useState<IntervalItem | null>(null)

  const handleSave = () => {
    let showList = activeShowPeriodList.filter((item) => item.show)

    if (!showList.find((item) => item.value === activePeriod)) {
      const item = activeShowPeriodList.find((item) => item.value === activePeriod)
      toast.info(t('chart.period.currentPeriodNotInList', { period: item?.label }))
      return
    }
    setOpen(false)
    setIsEdit(false)
    dispatch(chartActions.updateListTimeFrames({ type: pageType, listTimeFrames: activeShowPeriodList }))
    handlePeriodListChange(activeShowPeriodList)
  }

  const handlePeriodItemChange = (period: IntervalItem) => {
    const value = period?.value
    if (!isEdit) {
      handlePeriodChange?.(value)
      setOpen(false)
      return
    }

    let arr = JSON.parse(JSON.stringify(activeShowPeriodList))
    let index = arr.findIndex((item: IntervalItem) => {
      return item.value === value
    })
    arr[index].show = !arr[index].show

    setActiveShowPeriodList(arr)
  }

  const setDefault = () => {
    setOpen(false)
    setIsEdit(false)
    dispatch(chartActions.updateListTimeFrames({ type: pageType, listTimeFrames: intervalMap }))
    handlePeriodListChange(intervalMap)
  }

  useEffect(() => {
    setActiveShowPeriodList(currentPeriodList)
  }, [currentPeriodList, open])

  // useClickOutside([dropdownRef], () => {
  //   setOpen(false)
  //   setIsEdit(false)
  // })

  const isShowCustomPeriod = useMemo(() => {
    return (
      !!customPeriod?.value &&
      !currentPeriodList.filter((item) => item.show).some((item) => item.value === customPeriod?.value)
    )
  }, [customPeriod, currentPeriodList])

  useEffect(() => {
    if (activePeriod && currentPeriodList) {
      const isPresent = currentPeriodList.filter((item) => item.show).some((item) => item.value === activePeriod)
      if (!isPresent) {
        const period = currentPeriodList.find((item) => item.value === activePeriod)
        if (!!period) setCustomPeriod(period)
      } else {
        setCustomPeriod(null)
      }
    }
  }, [activePeriod, currentPeriodList])

  return (
    <div className="relative bg-[#ECECED0A] p-0.5 min-h-[34px] rounded-[4px] flex items-center">
      {currentPeriodList
        .filter((item) => item.show)
        .map((item) => (
          <div
            className={cn(
              'px-3 py-1.5 cursor-pointer text-[12px] font-[380] rounded-[2px] hover:text-white',
              activePeriod === item.value ? 'bg-[#ECECED14] text-white' : 'text-white/50',
            )}
            key={item.value}
            onClick={() => {
              if (item.value !== customPeriod?.value) {
                setCustomPeriod(null)
              }
              handlePeriodChange?.(item.value)
            }}
          >
            {item.label}
          </div>
        ))}
      {isShowCustomPeriod && customPeriod?.value && (
        <div
          className={cn(
            'px-3 py-1.5 cursor-pointer text-[12px] font-[380] rounded-[2px]',
            activePeriod === customPeriod?.value ? 'bg-[#ECECED14] text-white' : 'text-white/50',
          )}
          onClick={() => {
            handlePeriodChange?.(customPeriod?.value)
          }}
        >
          {customPeriod?.label}
        </div>
      )}
      <div className="relative flex-shrink-0 h-[30px] w-6">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <div className="px-2 flex items-center justify-center cursor-pointer w-full h-full">
              <img
                className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                src="/images/icons/icon-chevron-down.svg"
                alt="icon arrow down"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[310px] rounded-[12px] bg-[#212127] shadow-lg z-10 p-3 text-[12px] font-[380] leading-[12px]"
            align="end"
            side="bottom"
            sideOffset={4}
          >
            <div className="grid grid-cols-4 gap-2.5">
              {activeShowPeriodList.map((item: IntervalItem, index: number) => (
                <div
                  key={item.value}
                  onClick={() => {
                    handlePeriodItemChange(item)
                  }}
                  className={cn(
                    `bg-[#2B2B33] cursor-pointer rounded-[8px] text-[#FFFFFFB2] h-9 flex items-center justify-center relative`,
                    (item.show && isEdit) || (item?.value === activePeriod && !isEdit)
                      ? `border border-[#843BEA] bg-[#212127] text-white`
                      : ``,
                  )}
                >
                  {item.label}
                </div>
              ))}
            </div>
            {!isEdit ? (
              <Button
                className="mt-4 h-10 w-full rounded-[50px] bg-[#2B2B33] text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEdit((prev) => !prev)
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {currentLang === 'en'
                  ? capitalizeFirstLetter(t('google.auth.whitelist.edit'))
                  : t('google.auth.whitelist.edit')}
              </Button>
            ) : (
              <div className="flex gap-2 mt-4">
                <Button
                  className="text-white w-full rounded-[50px] bg-[#2B2B33] flex-1 h-10"
                  onClick={() => setDefault()}
                >
                  {t('button.reset')}
                </Button>
                <Button
                  className="w-full bg-[#843BEA] text-[#FAFAFA] rounded-[50px] flex-1 h-10"
                  onClick={() => handleSave()}
                >
                  {t('button.save')}
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default ButtonPeriod
