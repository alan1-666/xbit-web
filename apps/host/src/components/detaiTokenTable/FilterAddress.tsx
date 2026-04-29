import { useTranslation } from 'react-i18next'
import { Ref, useImperativeHandle, useEffect, useState } from 'react'
import { Button } from '@components/ui/button.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer.tsx'
import { Loader2, X } from 'lucide-react'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'

export type FilterAddressHandle = {
  open: (address: string) => void
}

type FilterAddressProps = {
  open: boolean
  setOpen: (value: boolean) => void
  onAddressChange?: (address: string) => void
  address?: string
  onClear?: () => void
  ref?: Ref<FilterAddressHandle>
  isPC?: boolean
}

const FilterAddress = ({ onAddressChange, address, onClear, ref, open, setOpen, isPC }: FilterAddressProps) => {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)
  const [addressValue, setAddressValue] = useState(address || '')

  useEffect(() => {
    setAddressValue(address || '')
  }, [address, open])

  useImperativeHandle(ref, () => ({
    open: (address: string) => {
      setOpen(true)
      setAddressValue(address || '')
    },
  }))

  const handleConfirmClick = () => {
    setLoading(true)
    onAddressChange?.(addressValue)
    setLoading(false)
    setOpen(false)
  }

  const handleResetClick = () => {
    setAddressValue('')
    // onAddressChange?.('')
    // setOpen(false)
  }

  return (
    <>
      {isPC ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-full bg-[#232329] max-w-[768px] p-4" showDialogPrimitiveClose={false}>
            <DialogHeader>
              <DialogTitle className="mt-1.5">
                <div className="text-[cal c(1rem*(22/16))] leading-[1] app-font-regular text-left">
                  {t('detail.tokenDetail.filterAddress')}
                </div>
              </DialogTitle>
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="size-5" />
              </DialogClose>
            </DialogHeader>

            <DialogDescription className="flex flex-col gap-3">
              <div className="relative flex items-center">
                <InputBorderGradient
                  unit=""
                  placeHolder={t('detail.tokenDetail.inputAddress')}
                  containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px] flex-1"
                  innerBgClassName="rounded-[8px] bg-[#141414]"
                  inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
                  unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                  value={addressValue}
                  onChange={(value) => setAddressValue(value)}
                />
                {addressValue && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#fff] hover:text-[#ff4d4f]"
                    onClick={() => {
                      setAddressValue('')
                      onClear?.()
                    }}
                    aria-label="Clear"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </DialogDescription>

            <DialogFooter className="pt-0 border-t-[0.5px] border-t-[#ECECED0A]">
              <div className="flex justify-center items-center flex-row gap-2.5 pt-4 flex-1">
                <Button
                  size="lg"
                  disabled={loading}
                  variant="borderGradient"
                  className="flex-1 rounded-full h-11"
                  onClick={handleResetClick}
                >
                  {t('orderForm.buySettings.reset')}
                </Button>

                <Button
                  size="lg"
                  disabled={loading}
                  variant="gradient"
                  className="text-[#261236] flex-1 rounded-[50px] h-11"
                  onClick={handleConfirmClick}
                >
                  {loading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
                  {t('chart.buttons.confirm')}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
          <DrawerContent className="w-full bg-[#212127] max-w-[768px] max-h-[80vh] mx-auto">
            <DrawerHeader>
              <DrawerTitle className="mt-1.5">
                <div className="text-[cal c(1rem*(22/16))] leading-[1] app-font-regular text-left">
                  {t('detail.tokenDetail.filterAddress')}
                </div>
              </DrawerTitle>
              <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="size-5" />
              </DrawerClose>
            </DrawerHeader>

            <DrawerDescription className="flex flex-col px-4 gap-3 mt-3">
              <div className="relative flex items-center">
                <InputBorderGradient
                  unit=""
                  borderStyle='border-[#444455]'
                  placeHolder={t('detail.tokenDetail.inputAddress')}
                  containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px] flex-1 border-[0.5px]"
                  innerBgClassName="rounded-[6px] bg-[#2B2B33]"
                  inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
                  unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                  value={addressValue}
                  innerBgClassNameFocus='bg-[#212127]'
                  onChange={(value) => setAddressValue(value)}
                />
                {addressValue && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#fff] hover:text-[#ff4d4f]"
                    onClick={() => {
                      setAddressValue('')
                      onClear?.()
                    }}
                    aria-label="Clear"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </DrawerDescription>

            <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
              <div className="flex justify-center items-center flex-row gap-2.5 pt-4 ">
                <Button
                  size="lg"
                  disabled={loading}
                  variant="close"
                  className="flex-1 rounded-full h-11 bg-[#2B2B33] text-white"
                  onClick={handleResetClick}
                >
                  {t('orderForm.buySettings.reset')}
                </Button>

                <Button
                  size="lg"
                  disabled={loading}
                  variant="gradient"
                  className="text-[#261236] flex-1 rounded-[50px] h-11"
                  onClick={handleConfirmClick}
                >
                  {loading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
                  {t('chart.buttons.confirm')}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

export default FilterAddress
