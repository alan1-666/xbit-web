import { useTranslation } from 'react-i18next'
import React, { useEffect, useState } from 'react'
import { Button } from '@components/ui/button.tsx'
import { X } from 'lucide-react'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { formatValueInput } from '@/utils/helpers'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle
} from "@components/ui/dialog.tsx";

type FilterQuantityProps = {
  token: string
  open: boolean
  setOpen: (value: boolean) => void
  onQuantityChange: (min: number | undefined, max: number | undefined) => void
  min?: number
  max?: number
}

const FilterQuantityPc = React.memo(({ token, onQuantityChange, min, max, open, setOpen }: FilterQuantityProps) => {
  const { t } = useTranslation()
  const [errorText, setErrorText] = useState('')
  const [minValue, setMinValue] = useState<number | undefined | string>(min)
  const [maxValue, setMaxValue] = useState<number | undefined | string>(max)

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

    if (min! > max!) {
      setErrorText(t('detail.tokenDetail.errorInputTransactionFilter'))
      // setLoading(false)
      return
    }

    onQuantityChange(min, max)
    setOpen(false)
  }

  useEffect(() => {
    setErrorText('')
  }, [minValue, maxValue])

  const handleResetClick = () => {
    setMinValue('')
    setMaxValue('')
  }
  useEffect(() => {
    setMinValue(min)
    setMaxValue(max)
    return () => {}
  }, [min, max])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen} >
        <DialogContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto" showDialogPrimitiveClose={false}>
          <DialogHeader>
            <DialogTitle className="mt-1.5">
              <div className="text-[cal c(1rem*(22/16))] leading-[1] app-font-regular text-left">
                {t('detail.pool.quantity')}
              </div>
            </DialogTitle>

            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="size-5" />
            </DialogClose>
          </DialogHeader>

          <DialogDescription className="flex flex-col gap-3">
            <InputBorderGradient
              unit={token}
              placeHolder={t('filter.minimum')}
              containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
              innerBgClassName="rounded-[8px] bg-[#141414]"
              inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
              unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
              inputProps={{
                // type: 'number',
                onKeyDown: handleInputValue,
              }}
              value={minValue as string}
              onChange={(e) => {
                setMinValue(formatValueInput(e))
              }}
            />
            <InputBorderGradient
              unit={token}
              placeHolder={t('filter.maximum')}
              containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
              innerBgClassName="rounded-[8px] bg-[#141414]"
              inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
              unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
              inputProps={{
                // type: 'number',
                onKeyDown: handleInputValue,
              }}
              value={maxValue as string}
              onChange={(value) => setMaxValue(formatValueInput(value))}
            />
          </DialogDescription>

          <DialogFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
            {errorText && errorText !== '' && (
              <div className={'pt-4 text-[11px] leading-[1] text-[#FF353C]'}>{errorText}</div>
            )}
            <div className="flex justify-center items-center flex-row gap-2.5 pt-4 ">
              <Button
                size="lg"
                variant="borderGradient"
                className="flex-1 rounded-full h-11"
                onClick={handleResetClick}
              >
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})

FilterQuantityPc.displayName = 'FilterQuantityPc'

export default FilterQuantityPc
