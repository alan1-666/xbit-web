import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
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
import React, { Ref, useEffect, useImperativeHandle, useState, useRef } from 'react'
import { FilterTransactionAmountType } from '@/types/enums.ts'
import { cn } from '@/lib/utils.ts'
import GradientBordered from '@components/common/GradientBordered.tsx'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { useNativeTokenPrices } from '@/hooks/useNativeTokenPrices'
import { handleOnChangeNumber } from '@/utils/helpers'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx'

export type FilterTransactionAmountHandle = {
  open: () => void
}

type FilterTransactionAmountProps = {
  open: boolean
  setOpen: (value: boolean) => void
  type?: FilterTransactionAmountType
  defaultMin?: string
  defaultMax?: string
  option?: number
  setOption?: React.Dispatch<React.SetStateAction<number>>
  handleMinChange: (value: number) => void
  handleMaxChange: (value: number) => void
  ref?: Ref<FilterTransactionAmountHandle>
  isPC?: boolean
}

const listFilterUSDT = [100, 500, 1000, 2500, 5000, 10000]

const FilterTransactionAmount = ({
  type = FilterTransactionAmountType.USDT,
  handleMaxChange,
  handleMinChange,
  defaultMin = '',
  defaultMax = '',
  ref,
  open,
  setOpen,
  option,
  setOption,
  isPC = false,
}: FilterTransactionAmountProps) => {
  const { t } = useTranslation()
  const { solPrice } = useNativeTokenPrices()

  const [loading, setLoading] = useState(false)
  const [optionValue, setOptionValue] = useState<number>(0)
  const [minValue, setMinValue] = useState(defaultMin)
  const [maxValue, setMaxValue] = useState(defaultMax)
  const [errorText, setErrorText] = useState('')
  const [lastApplied, setLastApplied] = useState<{ min: string; max: string; option: number }>({
    min: defaultMin,
    max: defaultMax,
    option: 0,
  })

  const prevTypeRef = useRef<FilterTransactionAmountType>(type)

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }))

  const convertToDisplayValue = (usdValue: number): number => {
    if (type === FilterTransactionAmountType.USDT) {
      return usdValue
    }
    return solPrice > 0 ? usdValue / solPrice : 0
  }

  const convertToUSDValue = (displayValue: number): number => {
    if (type === FilterTransactionAmountType.USDT) {
      return displayValue
    }
    return displayValue * solPrice
  }

  const handleInputValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-') e.preventDefault()
  }

  const handleOnClickOptionItem = (usdValue: number) => {
    const displayValue = convertToDisplayValue(usdValue)

    setOptionValue(usdValue)
    setMinValue(displayValue.toFixed(type === FilterTransactionAmountType.SOL ? 4 : 0))
    setMaxValue('')
  }

  useEffect(() => {
    setErrorText('')
  }, [minValue, maxValue])

  const handleConfirmClick = () => {
    setErrorText('')
    setLoading(true)

    const displayMin = minValue !== '' ? Number(minValue) : undefined
    const displayMax = maxValue !== '' ? Number(maxValue) : undefined

    const hasMin = minValue !== ''
    const hasMax = maxValue !== ''

    if (hasMin && hasMax && displayMin! > displayMax!) {
      setErrorText(t('detail.tokenDetail.errorInputTransactionFilter'))
      setLoading(false)
      return
    }

    const usdMin = displayMin !== undefined ? convertToUSDValue(displayMin) : 0
    const usdMax = displayMax !== undefined ? convertToUSDValue(displayMax) : 0

    handleMinChange(usdMin)
    handleMaxChange(usdMax)
    setLastApplied({ min: minValue, max: maxValue, option: optionValue })
    setOption?.(optionValue)
    setLoading(false)
    setOpen(false)
  }

  const handleResetClick = () => {
    setMinValue('')
    setMaxValue('')
    setOptionValue(0)
  }

  const handleDrawerOpen = (isOpen: boolean) => {
    setOpen(isOpen)

    if (isOpen) {
      setMinValue(lastApplied.min)
      setMaxValue(lastApplied.max)
      setOptionValue(lastApplied.option)
    }
  }

  useEffect(() => {
    const prevType = prevTypeRef.current

    if (prevType !== type && solPrice > 0) {
      if (minValue && minValue !== '') {
        const currentValue = Number(minValue)
        let newValue: number

        if (prevType === FilterTransactionAmountType.USDT && type === FilterTransactionAmountType.SOL) {
          newValue = currentValue / solPrice
          setMinValue(newValue.toFixed(4))
        } else if (prevType === FilterTransactionAmountType.SOL && type === FilterTransactionAmountType.USDT) {
          newValue = currentValue * solPrice
          setMinValue(newValue.toFixed(0))
        }
      }

      if (maxValue && maxValue !== '') {
        const currentValue = Number(maxValue)
        let newValue: number

        if (prevType === FilterTransactionAmountType.USDT && type === FilterTransactionAmountType.SOL) {
          newValue = currentValue / solPrice
          setMaxValue(newValue.toFixed(4))
        } else if (prevType === FilterTransactionAmountType.SOL && type === FilterTransactionAmountType.USDT) {
          newValue = currentValue * solPrice
          setMaxValue(newValue.toFixed(0))
        }
      }

      prevTypeRef.current = type
    }
  }, [type, solPrice, minValue, maxValue])

  useEffect(() => {
    if (open) {
      const displayValueMin =
        defaultMin && Number(defaultMin) > 0
          ? convertToDisplayValue(Number(defaultMin)).toFixed(type === FilterTransactionAmountType.SOL ? 4 : 0)
          : ''
      const displayValueMax =
        defaultMax && Number(defaultMax) > 0
          ? convertToDisplayValue(Number(defaultMax)).toFixed(type === FilterTransactionAmountType.SOL ? 4 : 0)
          : ''
      setMinValue(displayValueMin.toString())
      setMaxValue(displayValueMax.toString())
      setOptionValue(option ?? 0)
    }
  }, [open])

  return (
    <>
      {
        isPC ? (
          <Dialog open={open} onOpenChange={handleDrawerOpen}>
            <DialogContent className="w-full bg-[#212127] max-w-[768px] max-h-[80vh] mx-auto" showDialogPrimitiveClose={false}>
              <DialogHeader>
                <DialogTitle className="mt-1.5">
                  <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                    {t('detail.tokenDetail.VolumeFilter')}
                  </div>
                </DialogTitle>

                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="size-5" />
                </DialogClose>
              </DialogHeader>

              <div className="flex flex-col px-4 gap-3 mt-3">
                <div className="grid grid-cols-3 gap-x-2 gap-y-3">
                  {listFilterUSDT.map((item) => (
                    <GradientBordered
                      key={item}
                      containerClassName={cn(
                        'cursor-pointer flex-1 text-center h-[34px] rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-[1.3] p-[0.5px] hover-scale bg-[#C8A7FD]',
                        optionValue !== item && '!bg-[#2B2B33]',
                      )}
                      innerBgClassName={cn(
                        'p-[8px] rounded-[6.5px] !bg-[transparent] app-font-regular',
                        optionValue === item && '!bg-[#212127] text-white',
                      )}
                      onClick={() => handleOnClickOptionItem(item)}
                    >
                      {`>$${item}`}
                    </GradientBordered>
                  ))}
                </div>

                <InputBorderGradient
                  unit={type === FilterTransactionAmountType.USDT ? '$' : 'SOL'}
                  borderStyle="border-[#444455]"
                  isShowPrefix
                  prefix={
                    type === FilterTransactionAmountType.USDT
                      ? t('detail.tokenDetail.minimumTransaction')
                      : `${t('filter.minimum')} (SOL)`
                  }
                  containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px] border-[0.5px]"
                  innerBgClassName="rounded-[6px] bg-[#2B2B33]"
                  inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1 text-right"
                  unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                  onChange={(value) => {
                    const newValue = handleOnChangeNumber({ e: value })
                    setMinValue(newValue)
                  }}
                  value={minValue}
                  innerBgClassNameFocus="bg-[#212127]"
                  prefixStyle="text-[#908E98] text-[14px]"
                  inputProps={{
                    onKeyDown: handleInputValue,
                    type: 'number',
                  }}
                />

                <InputBorderGradient
                  unit={type === FilterTransactionAmountType.USDT ? '$' : 'SOL'}
                  borderStyle="border-[#444455]"
                  isShowPrefix
                  prefix={
                    type === FilterTransactionAmountType.USDT
                      ? t('detail.tokenDetail.maximumTransaction')
                      : `${t('filter.maximum')} (SOL)`
                  }
                  containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
                  innerBgClassName="rounded-[6px] bg-[#2B2B33]"
                  inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1 text-right"
                  unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                  onChange={(value) => {
                    const newValue = handleOnChangeNumber({ e: value })
                    setMaxValue(newValue)
                  }}
                  value={maxValue}
                  innerBgClassNameFocus="bg-[#212127]"
                  prefixStyle="text-[#908E98] text-[14px]"
                  inputProps={{
                    onKeyDown: handleInputValue,
                    type: 'number',
                  }}
                />
              </div>

              <DialogDescription></DialogDescription>

              <DialogFooter className="block pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
                {errorText && errorText !== '' && (
                  <div className={'pt-4 text-[11px] leading-[1] text-[#FF353C]'}>{errorText}</div>
                )}
                <div className="flex justify-center items-center flex-row gap-2.5 pt-4">
                  <Button
                    size="lg"
                    disabled={loading}
                    variant="close"
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
                    {t('settings.apply')}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={open} onOpenChange={handleDrawerOpen} repositionInputs={false}>
            <DrawerContent className="w-full bg-[#212127] max-w-[768px] max-h-[80vh] mx-auto">
              <DrawerHeader>
                <DrawerTitle className="mt-1.5">
                  <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                    {t('detail.tokenDetail.VolumeFilter')}
                  </div>
                </DrawerTitle>

                <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="size-5" />
                </DrawerClose>
              </DrawerHeader>

              <div className="flex flex-col px-4 gap-3 mt-3">
                <div className="grid grid-cols-3 gap-x-2 gap-y-3">
                  {listFilterUSDT.map((item) => (
                    <GradientBordered
                      key={item}
                      containerClassName={cn(
                        'cursor-pointer flex-1 text-center h-[34px] rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-[1.3] p-[0.5px] hover-scale bg-[#C8A7FD]',
                        optionValue !== item && '!bg-[#2B2B33]',
                      )}
                      innerBgClassName={cn(
                        'p-[8px] rounded-[6.5px] !bg-[transparent] app-font-regular',
                        optionValue === item && '!bg-[#212127] text-white',
                      )}
                      onClick={() => handleOnClickOptionItem(item)}
                    >
                      {`>$${item}`}
                    </GradientBordered>
                  ))}
                </div>

                <InputBorderGradient
                  unit={type === FilterTransactionAmountType.USDT ? '$' : 'SOL'}
                  borderStyle="border-[#444455]"
                  isShowPrefix
                  prefix={
                    type === FilterTransactionAmountType.USDT
                      ? t('detail.tokenDetail.minimumTransaction')
                      : `${t('filter.minimum')} (SOL)`
                  }
                  containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px] border-[0.5px]"
                  innerBgClassName="rounded-[6px] bg-[#2B2B33]"
                  inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1 text-right"
                  unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                  onChange={(value) => {
                    const newValue = handleOnChangeNumber({ e: value })
                    setMinValue(newValue)
                  }}
                  value={minValue}
                  innerBgClassNameFocus="bg-[#212127]"
                  prefixStyle="text-[#908E98] text-[14px]"
                  inputProps={{
                    onKeyDown: handleInputValue,
                    type: 'number',
                  }}
                />

                <InputBorderGradient
                  unit={type === FilterTransactionAmountType.USDT ? '$' : 'SOL'}
                  borderStyle="border-[#444455]"
                  isShowPrefix
                  prefix={
                    type === FilterTransactionAmountType.USDT
                      ? t('detail.tokenDetail.maximumTransaction')
                      : `${t('filter.maximum')} (SOL)`
                  }
                  containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
                  innerBgClassName="rounded-[6px] bg-[#2B2B33]"
                  inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1 text-right"
                  unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                  onChange={(value) => {
                    const newValue = handleOnChangeNumber({ e: value })
                    setMaxValue(newValue)
                  }}
                  value={maxValue}
                  innerBgClassNameFocus="bg-[#212127]"
                  prefixStyle="text-[#908E98] text-[14px]"
                  inputProps={{
                    onKeyDown: handleInputValue,
                    type: 'number',
                  }}
                />
              </div>

              <DrawerDescription></DrawerDescription>

              <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
                {errorText && errorText !== '' && (
                  <div className={'pt-4 text-[11px] leading-[1] text-[#FF353C]'}>{errorText}</div>
                )}
                <div className="flex justify-center items-center flex-row gap-2.5 pt-4">
                  <Button
                    size="lg"
                    disabled={loading}
                    variant="close"
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
                    {t('settings.apply')}
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )
      }
    </>
  )
}

export default FilterTransactionAmount
