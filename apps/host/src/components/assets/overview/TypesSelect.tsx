import { useMemo, useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'
import { useTranslation } from 'react-i18next'
import { IconCheckedCircle } from '@components/icon/IconCheckedCircle.tsx'
import { motion } from 'framer-motion'
import { TransferType } from '@/types/enums.ts'
import { IconTriangleDown } from '@components/icon/IconTriangleDown.tsx'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'

type TypeOption = {
  label: string
  value: string
  disabled?: boolean
}

type Props = {
  selectedOption: string
  setSelectedOption: (value: string) => void
}

export const TypesSelect = ({ selectedOption, setSelectedOption }: Props) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const options: TypeOption[] = useMemo(() => {
    return [
      {
        label: t('assets.overview.allTypes'),
        value: 'all',
      },
      {
        label: t('assets.overview.deposit'),
        value: TransferType.Deposit,
      },
      {
        label: t('assets.overview.withdrawal'),
        value: TransferType.Withdraw,
      },
      {
        label: t('assets.transfer'),
        value: 'TRANSFER',
      },
      {
        label: t('assets.transfers.others'),
        value: TransferType.Other,
      },
    ]
  }, [t])

  const { isDesktop } = useResponsive()

  const optionText = useMemo(() => {
    const opt = options.find((item) => item.value === selectedOption)
    return opt ? opt.label : t('assets.overview.allTypes')
  }, [selectedOption])

  const handleSelect = (value: string) => {
    setSelectedOption(value)
    setOpen(false)
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer text-[14px] leading-[14px] font-[330]">
            {optionText}
            <IconTriangleDown />
          </div>
        </DialogTrigger>
        <DialogContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6 p-0 pt-2 " showDialogPrimitiveClose={false}>
          <DialogHeader className="flex justify-end px-2 pb-0">
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer ml-auto "
              onClick={() => setOpen(false)}
              alt=""
            />
          </DialogHeader>
          <div className="px-3">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center border-b border-[#ECECED14] last:border-b-0 py-5"
                onClick={() => !option.disabled && handleSelect(option.value)}
                style={{
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  opacity: option.disabled ? 0.5 : 1,
                }}
              >
                <div className="text-[1rem] leading-4 flex-1">{option.label}</div>
                {selectedOption === option.value && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconCheckedCircle className="size-5" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer text-[14px] leading-[14px] font-[330]">
          {optionText}
          <IconTriangleDown />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="flex justify-end">
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3">
          {options.map((option, index) => (
            <div
              key={index}
              className="flex items-center border-b border-[#ECECED14] last:border-b-0 py-5"
              onClick={() => !option.disabled && handleSelect(option.value)}
              style={{
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                opacity: option.disabled ? 0.5 : 1,
              }}
            >
              <div className="text-[1rem] leading-4 flex-1">{option.label}</div>
              {selectedOption === option.value && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconCheckedCircle className="size-5" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
