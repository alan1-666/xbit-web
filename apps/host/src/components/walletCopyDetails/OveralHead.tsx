import FilterableHead from '@components/walletCopyDetails/FilterableHead.tsx'
import { DialogTitle } from '@components/ui/dialog.tsx'
import { useTranslation } from 'react-i18next'
import { DrawerHeader } from '@components/ui/drawer.tsx'
import { useMemo, useState } from 'react'
import { HeaderContext } from '@tanstack/react-table'
import { IconCheckCircleSolid } from '@components/icon'

interface OveralHeadProps extends HeaderContext<any, any> {
  onChange?: (value: string) => void
}

export default function OveralHead(props: OveralHeadProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const items = useMemo(() => {
    return [
      {
        label: t('walletCopy.filter.all'),
        value: 'all',
      },
      {
        label: t('walletCopy.buy'),
        value: 'Buy',
      },
      {
        label: t('walletCopy.sell'),
        value: 'Sell',
      },
    ]
  }, [])
  const [selectedItem, setSelectedItem] = useState(props.column.getFilterValue() || 'all')
  const onSelect = (value: string) => {
    props.column.setFilterValue(value)
    setSelectedItem(value)
    if (value !== selectedItem) {
      props.onChange?.(value)
    }
    // setOpen(false)
  }
  return (
    <FilterableHead tKey="type" open={open} toggle={() => setOpen(!open)} {...props}>
      <>
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DialogTitle className="text-[calc(18rem/16)] leading-[calc(18rem/16)] font-medium mb-0.5 text-[#FFFFFF] flex items-center justify-between w-full">
            {t('assets.funding.assets')}
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DialogTitle>
        </DrawerHeader>
        <div className="py-3 px-3.5">
          {items.map((item) => (
            <div
              key={item.value}
              className="py-4 border-b text-[1rem] font-medium flex items-center justify-between cursor-pointer"
              onClick={() => onSelect(item.value)}
            >
              <span className="text-[1rem] leading-[1rem]">{item.label}</span>
              {selectedItem === item.value && <IconCheckCircleSolid />}
            </div>
          ))}
        </div>
      </>
    </FilterableHead>
  )
}
