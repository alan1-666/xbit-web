import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import React from 'react'
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

interface FilterAddressProps {
  open: boolean
  setOpen: (value: boolean) => void
  onAddressChange: (address: string) => void
  currentAddress: string
  hidenIcon?: boolean
}

const FilterAddress = React.memo(
  ({ onAddressChange, currentAddress, open, setOpen, hidenIcon }: FilterAddressProps) => {
    const { t } = useTranslation()

    const [loading, setLoading] = useState(false)
    const [addressValue, setAddressValue] = useState(currentAddress)

    const handleConfirmClick = () => {
      setLoading(true)
      if (onAddressChange) onAddressChange(addressValue)
      setLoading(false)
      setOpen(false)
    }

    const handleResetClick = () => {
      setAddressValue('')
    }
    useEffect(() => {
      setAddressValue(currentAddress)
    }, [currentAddress, open])

    return (
      <>
        {!hidenIcon && (
          <Button size="xs" className="rounded-full bg-transparent p-0" onClick={() => setOpen(true)}>
            <img
              src={currentAddress ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
              className="w-[11px] h-[11px] min-w-[11px]"
              alt="icon filter"
            />
          </Button>
        )}

        <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
          <DrawerContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto">
            <DrawerHeader>
              <DrawerTitle className="mt-1.5">
                <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                  {t('detail.tokenDetail.filterAddress')}
                </div>
              </DrawerTitle>

              <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="size-5" />
              </DrawerClose>
            </DrawerHeader>

            <DrawerDescription className="flex flex-col px-4 gap-3">
              <InputBorderGradient
                unit=""
                borderStyle='border-[#444455]'
                placeHolder={t('detail.tokenDetail.inputAddress')}
                containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px] border-[0.5px]"
                innerBgClassName="rounded-[6px] bg-[#2B2B33]"
                inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
                unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                inputProps={{
                  value: addressValue,
                }}
                value={addressValue}
                onChange={(value) => setAddressValue(value)}
              />
            </DrawerDescription>

            <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
              <div className="flex justify-center items-center flex-row gap-2.5 pt-4 ">
                <Button
                  size="lg"
                  disabled={loading}
                  variant="close"
                  className="flex-1 rounded-full h-11"
                  onClick={handleResetClick}
                >
                  {t('button.reset')}
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
      </>
    )
  },
)

FilterAddress.displayName = 'FilterAddress'

export default FilterAddress
