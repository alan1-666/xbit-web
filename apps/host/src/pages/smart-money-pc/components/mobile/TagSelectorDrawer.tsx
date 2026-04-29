import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetTraderTagDefinitions } from '@/hooks/useGetTraderTagDefinitions'
import type { FilterSelectOption } from '@/components/common/FilterSelect'
import { ReactComponent as FunnelIcon } from '@/components/icon/smart-money/funnel_icon.svg'
import { ReactComponent as FilterIcon } from '@/components/icon/smart-money/icon_filter.svg'
import { useLangKey } from '@/utils/address'

type TagSelectorProps = {
  onSelect: (value: string[]) => void
}

const TagSelector = ({ onSelect }: TagSelectorProps) => {
  const { t } = useTranslation()
  const lang = useLangKey()
  
  const maxLabelCount = 2 // max counts of selected label to show in the trgger
  const [open, setOpen] = useState(false)
  const [tagIds, setTagIds] = useState<any[]>([])
  const selectedSet = useMemo(() => new Set(tagIds), [tagIds])

  const { data: tagsList, loading: tagsListLoading, error: tagsListError } = useGetTraderTagDefinitions()

  const tagOptions: FilterSelectOption[] = useMemo(() => {
    return tagsList.map((d) => ({
      value: String(d.id),
      label: lang === 'cn' ? d.nameCn : d.name,
    }))
  }, [tagsList])

  const selectedLabels = useMemo(() => {
    const picked = tagOptions.filter((o) => selectedSet.has(o))

    if (picked.length === 0) return null

    // 只拿字符串 label；如果有 ReactNode，退化为数量
    const labels = picked.map((o) => o.label)
    const allString = labels.every((x) => typeof x === 'string')
    if (!allString) return `${picked.length} selected`

    const strs = labels as string[]
    if (strs.length <= maxLabelCount) return strs.join('、')

    // 超过 maxLabelCount
    const head = strs.slice(0, maxLabelCount).join('、')
    const rest = strs.length - maxLabelCount
    return `${head}… +${rest}`
  }, [tagOptions, selectedSet, maxLabelCount])

  const handleTypeSeleted = (value: any) => {
    setTagIds((prevTagIds) => {
      const updatedSet = new Set(prevTagIds);
      if (updatedSet.has(value)) {
        updatedSet.delete(value);
      } else {
        updatedSet.add(value);
      }
      return [...updatedSet];
    });
  }

  useEffect(() => {
    if(!open) {
      onSelect(Array.from(selectedSet).map(item => item.value))
      setOpen(false) 
    }
  }, [open])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div
          className={cn(
            `flex items-center py-[5px] px-2 rounded-[6px]  text-[#908E9A] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] cursor-pointer gap-1`,
          )}
        >
          <FilterIcon className="w-5 h-5" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-[768px] max-h-[80vh] bg-[#212127] mx-auto">
        <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
          <DrawerTitle className="flex items-center">
            <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t('smartMoney.filter.label')}</div>
          </DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt="close"
          />
        </DrawerHeader>
        <div className="px-3 pb-8 space-y-2 overflow-y-auto">
          {tagOptions.map((option) => (
            <button
              className="w-full h-16 px-4 py-4 bg-[#2B2B33] rounded-[10px] inline-flex justify-between items-center"
              onClick={() => handleTypeSeleted(option)}
            >
              <div className="justify-start text-white text-base font-normal font-['Geist'] leading-4 tracking-tight">
                {option.label}
              </div>
              <div className="px-1.5 py-2 rounded-xl inline-flex flex-col justify-start items-start gap-2.5">
                {
                  selectedSet.has(option) &&
                  <img
                    className={cn(
                      'transition-opacity duration-300 ml-4 w-[25px] h-[25px]',
                    )}
                    src="/images/smart-money/icon-selected.png"
                    alt="selected-icon"
                  />
                }
                {
                  !selectedSet.has(option) &&
                  <img
                    className={cn(
                      'transition-opacity duration-300 ml-4 w-[25px] h-[25px]',
                    )}
                    src="/images/smart-money/icon-unselected.png"
                    alt="selected-icon"
                  />
                }
              </div>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default TagSelector
