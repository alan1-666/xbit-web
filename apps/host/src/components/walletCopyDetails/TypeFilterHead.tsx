import FilterableHead from '@components/walletCopyDetails/FilterableHead.tsx'
import { DialogTitle } from '@components/ui/dialog.tsx'
import { useTranslation } from 'react-i18next'
import { DrawerHeader } from '@components/ui/drawer.tsx'
import { useMemo, useState } from 'react'
import { IconCheckCircleSolid } from '@components/icon'

interface TypeFilterHeadProps {
  onChange: (value: string) => void
  currentValue: string
}

export default function TypeFilterHead(props: TypeFilterHeadProps) {
  const {currentValue, onChange} = props;
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
  const onSelect = (value: string) => {
    if (value !== currentValue) {
      onChange(value)
    }
    // setOpen(false)
  }
  return (
    <FilterableHead tKey="type" open={open} toggle={() => setOpen(!open)} {...props}>
      <>
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DialogTitle className="text-[calc(18rem/16)] leading-[calc(18rem/16)] font-medium mb-0.5 text-[#FFFFFF] flex items-center justify-between w-full">
            {t('walletCopy.filter.type')}
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
              {currentValue === item.value && <IconCheckCircleSolid />}
            </div>
          ))}
        </div>
      </>
    </FilterableHead>
  )
}
