import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '@components/ui/drawer.tsx'
import { Dispatch, SetStateAction, useState } from 'react'
import { DialogTitle } from '@components/ui/dialog.tsx'
import { X } from 'lucide-react'
import { SmartMoneySortType } from '@/@generated/gql/graphql-future.ts'

type FollowTypeDropdownProps = {
  sortType: SmartMoneySortType
  setSortType: Dispatch<SetStateAction<SmartMoneySortType>>
}

type FilterType = {
  label: string
  value: SmartMoneySortType
}

const FollowTypeDropdown = ({
  sortType,
  setSortType
}: FollowTypeDropdownProps) => {
  const { t } = useTranslation()
  const listFilter: FilterType[] = [
    {
      label: t('smartMoney.filter.latestAttention'),
      value: SmartMoneySortType.FollowTime,
    },
    {
      label: t('smartMoney.filter.7dayWinningRate'),
      value: SmartMoneySortType.WinRate_7d,
    },
  ]
  const [open, setOpen] = useState<boolean>(false)
  const [currentSelect, setCurrentSelect] = useState(listFilter.filter((item) => item.value === sortType)[0] || listFilter[0])

  const handleOnClickItem = (item: FilterType) => {
    setSortType(item.value)
    setCurrentSelect(item)
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={(openState) => setOpen(openState)}>
      <DrawerTrigger className="flex items-center gap-2 px-2.5 py-2 rounded-[6px] border-[0.8px] border-[#ECECED1F]">
        <span className="text-[13px] leading-[1] font-normal text-[#FFFFFFCC]">{currentSelect.label}</span>
        <img src="/images/icons/icon-chevron-down.svg" alt="chevron down" className="w-2 h-2" />
      </DrawerTrigger>
      <DrawerContent className='w-full max-w-[768px] mx-auto bg-[#232329]'>
        <DrawerHeader>
          <DialogTitle></DialogTitle>
          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="size-5" onClick={() => setOpen(false)} />
          </DrawerClose>
        </DrawerHeader>

        <DrawerDescription></DrawerDescription>
        <DrawerFooter>
          <ul className="flex flex-col">
            {listFilter.map((item) => (
              <li
                key={item.value}
                className="cursor-pointer py-4 border-b-[0.5px] border-[#ECECED0A] flex items-center justify-between"
                onClick={() => handleOnClickItem(item)}
              >
                <span>{item.label}</span>
                {
                  item?.value === currentSelect.value && (
                    <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="icon tick" />
                  )
                }
              </li>
            ))}
          </ul>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default FollowTypeDropdown
