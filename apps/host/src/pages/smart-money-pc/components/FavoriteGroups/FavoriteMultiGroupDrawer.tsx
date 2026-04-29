import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiStar } from 'react-icons/fi'
import { GroupOption } from './FavoriteMultiGroupPopover'
import { AddressGroupResponse } from '@/hooks/useGetFlowAddressOnGroup'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { useBatchCreateAddresses } from '@/hooks/useBatchCreateAddresses'
import { AddressGroupInput } from '../../AddressDetail'

type FavoriteMultiGroupDrawer = {
  address?: string
  followerCount?: number
  initialSelectedGroups?: AddressGroupResponse[]
  showCount?: boolean
  initialFavorited?: boolean
  groupIds?: string[] | null
  filledColor?: string | null
  onChange?: (groups: AddressGroupInput[], isFavorited: boolean) => void
}

const FavoriteMultiGroupDrawer = ({ address, followerCount, initialSelectedGroups, showCount = true, initialFavorited = false, groupIds, onChange, filledColor="#FBFBFB" }: FavoriteMultiGroupDrawer) => {
  const { t } = useTranslation()

  const { groupList } = useAddressGroups()
  const { batchCreateAddresses } = useBatchCreateAddresses()
  const [open, setOpen] = useState(false)
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [groups, setGroups] = useState<any[]>([])

  const selectedSet = useMemo(() => new Set(groups), [groups])

  const prevOpenRef = useRef(open)

  useEffect(() => {
    if(initialSelectedGroups) {
      setIsFavorited(initialSelectedGroups.length > 0)

      const selected = new Set(initialSelectedGroups.map((g) => g.id))
      setGroups(() => {
        return groupList.filter((item) => selected.has(item.value))
      })
    }
    
    if(groupIds) {
      const selected = new Set(groupIds)
      setGroups(() => {
        return groupList.filter((item) => selected.has(item.value))
      })
    }

  }, [groupList, groupIds, initialSelectedGroups])

  const handleGroupSeleted = (group: GroupOption) => {
    setGroups((prev) => {
      const updatedSet = new Set(prev)
      if (updatedSet.has(group)) {
        updatedSet.delete(group)
      } else {
        updatedSet.add(group)
      }
      return [...updatedSet]
    })
  }

  useEffect(() => {
    const commitGroups = async () => {
      const groupIds = groups.map((g) => g.value)
      const params = {
        input: {
          addresses: [
            {
              address,
              groupIds,
            },
          ],
        },
      }

      let setToIsFavorited = false
      try {
        const { data } = await batchCreateAddresses(params)
        if (data && data.batchCreateAddresses.length > 0) {
          const groupIds = data.batchCreateAddresses[0].groupIds
          const groupIdSet = new Set(groupIds)
          const selectedGroup = groupList.filter((item) => groupIdSet.has(item.value))
          setGroups(selectedGroup)
          setToIsFavorited = true
        } else {
          setToIsFavorited = false
          setGroups([])
        }
        setIsFavorited(setToIsFavorited)
        onChange(groups, setToIsFavorited)
      } catch (e) {
        console.error(e)
      }
    }

    if (!prevOpenRef.current && !open) {
      prevOpenRef.current = open
      return
    }

    if (prevOpenRef.current && !open) {
      commitGroups()
    }

    prevOpenRef.current = open
  }, [open])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className={cn("rounded-md inline-flex justify-center items-center", showCount ? "h-8 pl-2.5 pr-3 bg-[#472468] hover:bg-[#6F3FF5] gap-1.5" : "")}>
          <FiStar
            size={16}
            className={isFavorited ? `text-[${filledColor}]` : ''}
            fill={isFavorited ? filledColor || "currentColor" : 'none'}
          />
          {showCount && <div className="justify-center text-white text-xs font-normal font-['Geist'] leading-3">{followerCount}</div>}
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
        <div className="px-3 pb-8 space-y-2 max-h-[70vh] overflow-y-auto">
          {groupList.map((option) => (
            <button
              className="w-full h-16 px-4 py-4 bg-[#2B2B33] rounded-[10px] inline-flex justify-between items-center"
              onClick={() => handleGroupSeleted(option)}
            >
              <div className="justify-start text-white text-base font-normal font-['Geist'] leading-4 tracking-tight">
                {option.label}
              </div>
              <div className="px-1.5 py-2 rounded-xl inline-flex flex-col justify-start items-start gap-2.5">
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
      </DrawerContent>
    </Drawer>
  )
}

export default FavoriteMultiGroupDrawer
