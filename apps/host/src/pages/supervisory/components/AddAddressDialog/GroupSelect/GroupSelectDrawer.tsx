import { useEffect, useMemo, useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { IconArrowDown2 } from '@/components/icon'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { GroupOption } from '@/pages/smart-money-pc/components/FavoriteGroups/FavoriteMultiGroupPopover'
import { GroupManageDialog } from '../GroupManageDialog'
import { useTranslation } from 'react-i18next'

type GroupSelectDrawerProp =
  | {
      isSingleOption: true
      value: string
      onChange: (v: string) => void
      onGroupManageDialogChange?: (isOpen: boolean) => void
    }
  | {
      isSingleOption?: false
      value: string[]
      onChange: (v: string[]) => void
      onGroupManageDialogChange?: (isOpen: boolean) => void
    }

const GroupSelectDrawer = ({ value, onChange, isSingleOption = false, onGroupManageDialogChange }: GroupSelectDrawerProp) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState<boolean>(false)
  const [showAddAddress, setShowAddAddress] = useState<boolean>(false)
  const { groupList } = useAddressGroups()
  const [groups, setGroups] = useState<any[]>([])

  const selectedSet = useMemo(() => new Set(groups), [groups])

  const selectedValues = useMemo<string[]>(() => {
    if (isSingleOption) {
      return value ? [value] : []
    }
    return value
  }, [value, isSingleOption])

  const selectedLabels = useMemo(() => {
    if (!selectedValues.length) return t('smartMoney.supervisory.pleaseSelect')
    const map = new Map(groupList.map((g) => [g.value, g.label]))
    return selectedValues
      .map((id) => map.get(id))
      .filter(Boolean)
      .join(', ')
  }, [selectedValues, groupList])


  const toggle = (id: string) => {
    if (isSingleOption) {
      onChange(id)
      return
    }

    const next = selectedValues.includes(id)
      ? selectedValues.filter((x) => x !== id)
      : [...selectedValues, id]

    onChange(next)
  }

  const handleGroupSeleted = (group: GroupOption) => {
    if (isSingleOption) {
      setGroups([group])
      onChange(group.value)
      setOpen(false)
      return
    }

    setGroups((prev) => {
      const updatedSet = new Set(prev)
      if (updatedSet.has(group)) {
        updatedSet.delete(group)
      } else {
        updatedSet.add(group)
      }
      return [...updatedSet]
    })

    toggle(group.value)
  }

  useEffect(() => {
    if (isSingleOption) {
      const selected = groupList.find((g) => selectedValues.includes(g.value))
      setGroups(selected ? [selected] : [])
    } else {
      const selected = groupList.filter((g) => selectedValues.includes(g.value))
      setGroups(selected)
    }
  }, [selectedValues, groupList, isSingleOption])

  useEffect(() => {
    onGroupManageDialogChange?.(showAddAddress)
  }, [showAddAddress])

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="w-full h-10 px-4 py-2.5 rounded-lg border border-[#79778C29] inline-flex justify-between items-center">
            <div className="justify-start text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
              {selectedLabels}
            </div>
            <div className="w-4 h-4 relative opacity-50 overflow-hidden">
              <IconArrowDown2 className={cn('h-4 w-4 text-[#878787] transition-transform duration-200')} />
            </div>
          </div>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-5 px-3.5  flex w-full items-center justify-between">
            <DrawerTitle className="flex items-center">
              <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t('smartMoney.supervisory.selectGroup')}</div>
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt="close"
            />
          </DrawerHeader>
          <div className="max-h-[70vh] px-3 pb-8 space-y-2 overflow-y-auto">
            {groupList.map((option) => (
              <button
                className="w-full h-16 p-4 bg-[#2B2B33] rounded-[10px] flex justify-between items-center"
                onClick={() => handleGroupSeleted(option)}
              >
                <div className="flex-1 min-w-0 text-white text-base text-left font-normal leading-4 tracking-tight truncate">
                  {option.label}
                </div>
                <div className="shrink-0">
                  {selectedSet.has(option) && (
                    <img
                      className={cn('transition-opacity duration-300 ml-4 w-[25px] h-[25px]')}
                      src="/images/smart-money/icon-selected.png"
                      alt="selected-icon"
                    />
                  )}
                  {!selectedSet.has(option) && (
                    <img
                      className={cn('transition-opacity duration-300 ml-4 w-[25px] h-[25px]')}
                      src="/images/smart-money/icon-unselected.png"
                      alt="selected-icon"
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="self-stretch inline-flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch px-3 flex flex-col justify-start items-start gap-2.5">
              <button 
                className="self-stretch px-4 py-2.5 bg-white rounded-[40px] inline-flex justify-center items-center" 
                onClick={() => {
                  setShowAddAddress(true)
                  setOpen(false)
                }}
              >
                <div className="text-center justify-center text-black text-sm font-semibold font-['Geist'] leading-5">
                  {t('smartMoney.createGroup')}
                </div>
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {
        showAddAddress && 
        <GroupManageDialog 
          show={true} 
          onBack={() => {
            setShowAddAddress(false) 
            setOpen(true)
          }} 
        />
      }
    </>
  )
}

export default GroupSelectDrawer
