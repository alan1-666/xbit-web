import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { Loader2, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import GradientBordered from '@components/common/GradientBordered.tsx'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { formatValueInput } from '@/utils/helpers'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@components/ui/dialog.tsx";

type FilterTotalValueProps = {
  open: boolean
  setOpen: (value: boolean) => void
  onValueChange: (min: number | undefined, max: number | undefined) => void
  min?: number
  max?: number
}

const listFilterValues = [100, 500, 1000, 2500, 5000, 10000]

const FilterTotalValuePc = React.memo(({ onValueChange, min, max, open, setOpen }: FilterTotalValueProps) => {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)
  const [optionValue, setOptionValue] = useState<number>(0)
  const [minValue, setMinValue] = useState(min ? `${min}` : '')
  const [maxValue, setMaxValue] = useState(max ? `${max}` : '')
  const [errorText, setErrorText] = useState('')
  const [lastApplied, setLastApplied] = useState<{ min?: string; max?: string; option?: number }>({})

  const isValidNumber = (value: string) => {
    return value.trim() !== '' && !isNaN(Number(value)) && Number(value) >= 0
  }

  // const isConfirmDisabled = () => {
  //   const hasValidMin = isValidNumber(minValue)
  //   const hasValidMax = isValidNumber(maxValue)
  //   return loading || (!hasValidMin && !hasValidMax)
  // }

  const handleInputValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-') e.preventDefault()
  }

  const handleOnClickOptionItem = (value: number) => {
    setOptionValue(value)
    setMinValue(`${value}`)
    setMaxValue('')
    setLastApplied({ min: `${value}`, max: '', option: value })
    // onValueChange(value, undefined)
    // setOpen(false)
  }

  const handleConfirmClick = () => {
    setErrorText('')
    setLoading(true)

    const hasValidMin = isValidNumber(minValue)
    const hasValidMax = isValidNumber(maxValue)

    const min = hasValidMin ? Number(minValue) : undefined
    const max = hasValidMax ? Number(maxValue) : undefined

    if (hasValidMin && hasValidMax && min! > max!) {
      setErrorText(t('detail.tokenDetail.errorInputTransactionFilter'))
      setLoading(false)
      return
    }

    onValueChange(min, max)
    setLastApplied({ min: minValue, max: maxValue, option: optionValue })
    setLoading(false)
    setOpen(false)
  }

  useEffect(() => {
    setErrorText('')
  }, [minValue, maxValue])

  const handleResetClick = () => {
    setMinValue('')
    setMaxValue('')
    setOptionValue(0)
    setLastApplied({ min: '', max: '', option: 0 })
  }

  const handleDrawerOpen = (open: boolean) => {
    setOpen(open)
    if (open && (lastApplied.min !== undefined || lastApplied.max !== undefined)) {
      setMinValue(lastApplied.min ?? '')
      setMaxValue(lastApplied.max ?? '')
      setOptionValue(lastApplied.option ?? 0)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDrawerOpen}>
        <DialogContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto" showDialogPrimitiveClose={false}>
          <DialogHeader>
            <DialogTitle className="mt-1.5">
              <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                {t('detail.pool.totalValue')}
              </div>
            </DialogTitle>

            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="size-5" />
            </DialogClose>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-x-2 gap-y-3">
              {listFilterValues.map((item) => (
                <GradientBordered
                  key={item}
                  containerClassName={cn(
                    'cursor-pointer flex-1 text-center h-[34px] rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-[1] p-[0.5px] hover-scale',
                    optionValue !== item && '!bg-[#ECECED14] !bg-none',
                  )}
                  innerBgClassName={cn(
                    'p-[8px] rounded-[6.5px] !bg-[transparent] app-font-regular',
                    optionValue === item && '!bg-[#0F0F0F] text-white',
                  )}
                  onClick={() => handleOnClickOptionItem(item)}
                  gradientValue="90deg, #9C2CFF 0%, #FF5EFF 100%"
                >
                  {`>$${item}`}
                </GradientBordered>
              ))}
            </div>
            <InputBorderGradient
              unit="$"
              placeHolder={t('filter.minimum')}
              containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
              innerBgClassName="rounded-[8px] bg-[#141414]"
              inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
              unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
              inputProps={{
                onKeyDown: handleInputValue,
              }}
              // /setMinValue(formatValueInput(e))
              onChange={(value) => setMinValue(formatValueInput(value))}
              value={minValue as string}
            />
            <InputBorderGradient
              unit="$"
              placeHolder={t('filter.maximum')}
              containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
              innerBgClassName="rounded-[8px] bg-[#141414]"
              inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
              unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
              inputProps={{
                type: 'number',
                onKeyDown: handleInputValue,
              }}
              onChange={(value) => setMaxValue(formatValueInput(value))}
              value={maxValue as string}
            />
          </div>
          <DialogDescription></DialogDescription>

          <DialogFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
            {errorText && errorText !== '' && (
              <div className={'pt-4 text-[11px] leading-[1] text-[#FF353C]'}>{errorText}</div>
            )}
            <div className="flex justify-center items-center flex-row gap-2.5 pt-4 ">
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
                // disabled={isConfirmDisabled()}
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
    </>
  )
})

FilterTotalValuePc.displayName = 'FilterTotalValuePc'

export default FilterTotalValuePc
