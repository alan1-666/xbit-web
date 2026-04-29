import { formatValueInput } from '@/utils/helpers'
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
import { X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CustomizeInput } from '../discover/filter/CustomizeInput'
import { useAppSelector } from '@/redux/store'

type FilterQuantityProps = {
  token: string
  open: boolean
  setOpen: (value: boolean) => void
  onQuantityChange: (
    min: number | undefined,
    max: number | undefined,
    minSol: number | undefined,
    maxSol: number | undefined,
  ) => void
  min?: number
  max?: number

  minSol?: number
  maxSol?: number
}

const FilterQuantity = React.memo(
  ({ token, onQuantityChange, min, max, open, setOpen, maxSol, minSol }: FilterQuantityProps) => {
    const { t } = useTranslation()
    const selectedChain = useAppSelector((state) => state.newWallet.activeChain)
    const [errorText, setErrorText] = useState('')
    const [minValue, setMinValue] = useState<number | undefined | string>(min)
    const [maxValue, setMaxValue] = useState<number | undefined | string>(max)
    // sol
    const [maxValueSol, setMaxValueSol] = useState<number | undefined | string>(maxSol)
    const [minValueSol, setMinValueSol] = useState<number | undefined | string>(minSol)

    const isValidNumber = (value: string | undefined | number) => {
      return (
        value !== undefined &&
        !isNaN(Number(value)) &&
        (typeof value !== 'string' || value.trim() !== '') &&
        Number(value) >= 0
      )
    }

    // const isConfirmDisabled = () => {
    //   const hasValidMin = isValidNumber(minValue)
    //   const hasValidMax = isValidNumber(maxValue)
    //   return !hasValidMin && !hasValidMax
    // }

    const handleInputValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === '-') e.preventDefault()
    }

    const handleConfirmClick = () => {
      setErrorText('')
      const min = isValidNumber(minValue) ? Number(minValue) : undefined
      const max = isValidNumber(maxValue) ? Number(maxValue) : undefined

      const minSol = isValidNumber(minValueSol) ? Number(minValueSol) : undefined
      const maxSol = isValidNumber(maxValueSol) ? Number(maxValueSol) : undefined

      if (min! > max! || minSol! > maxSol!) {
        setErrorText(t('detail.tokenDetail.errorInputTransactionFilter'))
        // setLoading(false)
        return
      }

      onQuantityChange(min, max, minSol, maxSol)
      setOpen(false)
    }

    useEffect(() => {
      setErrorText('')
    }, [minValue, maxValue, minValueSol, maxValueSol])

    const handleResetClick = () => {
      setMinValue('')
      setMaxValue('')
      setMaxValueSol('')
      setMinValueSol('')
    }
    useEffect(() => {
      setMinValue(min)
      setMaxValue(max)
      return () => {}
    }, [min, max])

    useEffect(() => {
      setMaxValueSol(maxSol)
      setMinValueSol(minSol)
    }, [maxSol, minSol])

    return (
      <>
        <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
          <DrawerContent className="w-full bg-[#212127] max-w-[768px] max-h-[80vh] mx-auto">
            <DrawerHeader>
              <DrawerTitle className="mt-1.5">
                <div className="text-[calc(1rem*(18/16))] leading-[1] app-font-regular text-left">
                  {t('detail.tokenDetail.FilterbyQuantity')}
                </div>
              </DrawerTitle>

              <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="size-5" />
              </DrawerClose>
            </DrawerHeader>

            <DrawerDescription className="flex flex-col">
              <div className="text-sm font-[330] text-white p-3">{token}</div>

              <div className="flex justify-between items-center gap-2 px-3">
                <div className="flex-1">
                  <CustomizeInput
                    value={minValue as number}
                    label={t('filter.minimum')}
                    suffix={token}
                    labelClass="-translate-y-3.5"
                    containerClass="h-[48px] border-[0.5px] border-[#444455] bg-[#2B2B33]"
                    focusStyle="border-[#C8A7FD] bg-[#212127]"
                    classNameInput="pt-1"
                    onValueChange={(e) => {
                      setMinValue(formatValueInput(String(e)))
                    }}
                  />
                </div>
                <div className="text-[#605E68] text-xs app-font-light">{t('filter.toValue')}</div>
                <div className="flex-1">
                  <CustomizeInput
                    value={maxValue as number}
                    label={t('filter.maximum')}
                    suffix={token}
                    labelClass="-translate-y-3.5"
                    containerClass="h-[48px] border-[0.5px] border-[#444455] bg-[#2B2B33]"
                    focusStyle="border-[#C8A7FD] bg-[#212127]"
                    classNameInput="pt-1"
                    onValueChange={(e) => {
                      setMaxValue(formatValueInput(String(e)))
                    }}
                  />
                </div>
              </div>

              <div className="text-sm font-[330] text-white p-3 pt-[20px]">{selectedChain?.toLocaleUpperCase()}</div>

              <div className="flex justify-between items-center gap-2 px-3">
                <div className="flex-1">
                  <CustomizeInput
                    value={minValueSol as number}
                    label={t('filter.minimum')}
                    suffix={token}
                    labelClass="-translate-y-3.5"
                    containerClass="h-[48px] border-[0.5px] border-[#444455] bg-[#2B2B33]"
                    focusStyle="border-[#C8A7FD] bg-[#212127]"
                    classNameInput="pt-1"
                    onValueChange={(e) => {
                      setMinValueSol(formatValueInput(String(e)))
                    }}
                  />
                </div>
                <div className="text-[#605E68] text-xs app-font-light">{t('filter.toValue')}</div>
                <div className="flex-1">
                  <CustomizeInput
                    value={maxValueSol as number}
                    label={t('filter.maximum')}
                    suffix={token}
                    labelClass="-translate-y-3.5"
                    containerClass="h-[48px] border-[0.5px] border-[#444455] bg-[#2B2B33]"
                    focusStyle="border-[#C8A7FD] bg-[#212127]"
                    classNameInput="pt-1"
                    onValueChange={(e) => {
                      setMaxValueSol(formatValueInput(String(e)))
                    }}
                  />
                </div>
              </div>
            </DrawerDescription>

            <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
              {errorText && errorText !== '' && (
                <div className={'pt-4 text-[11px] leading-[1] text-[#FF353C]'}>{errorText}</div>
              )}
              <div className="flex justify-center items-center flex-row gap-2.5 pt-4 ">
                <Button size="lg" variant="close" className="flex-1 rounded-full h-11" onClick={handleResetClick}>
                  {t('orderForm.buySettings.reset')}
                </Button>

                <Button
                  size="lg"
                  // disabled={isConfirmDisabled()}
                  variant="gradient"
                  className="text-[#261236] flex-1 rounded-[50px] h-11"
                  onClick={handleConfirmClick}
                >
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

FilterQuantity.displayName = 'FilterQuantity'

export default FilterQuantity
