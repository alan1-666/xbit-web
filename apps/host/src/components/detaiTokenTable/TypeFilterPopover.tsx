import { cn } from '@/lib/utils'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import Text from '../common/Text'
import { useDetailTokenTableContext } from './DetailTokenTableContext'
import { forwardRef, useImperativeHandle, useState } from 'react'

export type TypeFilterPopoverHandle = {
  setOpen: (open: boolean) => void
  setAnchor: (element: HTMLElement | null) => void
}

const TypeFilterPopover = forwardRef<TypeFilterPopoverHandle, {}>((_, ref) => {
  const { currentType, listTabs, updateCurrentType } = useDetailTokenTableContext()
  const [open, setOpen] = useState(false)
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null)

  console.log(anchorElement, 'anchorElement')

  useImperativeHandle(ref, () => ({
    setOpen: (openState: boolean) => {
      setOpen(openState)
    },
    setAnchor: (element: HTMLElement | null) => {
      setAnchorElement(element)
    },
  }))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor virtualRef={{ current: anchorElement }} />
      <PopoverContent
        className="w-[180px] bg-[#232329] p-[6px] border border-[#ECECED0A] z-[9999]"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        {listTabs.map((e) => (
          <div
            key={e.value}
            className={cn(
              'hover:bg-[#ECECED14] cursor-pointer px-2 py-1 rounded text-center',
              currentType === e.value && 'bg-[#ECECED14]',
            )}
            onClick={() => {
              updateCurrentType(e.value)
              setOpen(false)
            }}
          >
            <Text text={e.label as string} className="!font-[330] text-center mx-auto" />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
})

TypeFilterPopover.displayName = 'TypeFilterPopover'

export default TypeFilterPopover
