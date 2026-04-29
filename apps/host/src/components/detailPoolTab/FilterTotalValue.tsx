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
import React, { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils.ts'
import GradientBordered from '@components/common/GradientBordered.tsx'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { formatMoney, formatValueInput } from '@/utils/helpers'
import { FilterTransactionAmountType } from '@/types/enums'
import { useNativeTokenPrices } from '@/hooks/useNativeTokenPrices'

type FilterTotalValueProps = {
  filterInPage?: 'pool' | 'other'
  open: boolean
  setOpen: (value: boolean) => void
  onValueChange: (min: number | undefined, max: number | undefined) => void
  min?: number
  max?: number
  option?: number
  setOption?: React.Dispatch<React.SetStateAction<number>>
  type?: FilterTransactionAmountType
}

const listFilterValues = [100, 500, 1000, 2500, 5000, 10000]
const listFilterValues2 = [50_000, 100_000, 500_000, 1_000_000, 1_500_000, 2_000_000]

const FilterTotalValue = React.memo(
  ({
    onValueChange,
    min,
    max,
    open,
    setOpen,
    type = FilterTransactionAmountType.USDT,
    filterInPage,
    option,
    setOption,
  }: FilterTotalValueProps) => {
    const { t } = useTranslation()
    const { solPrice } = useNativeTokenPrices()

    const [loading, setLoading] = useState(false)
    const [optionValue, setOptionValue] = useState<number>(0)
    const [minValue, setMinValue] = useState(min ? `${min}` : '')
    const [maxValue, setMaxValue] = useState(max ? `${max}` : '')
    const [errorText, setErrorText] = useState('')
    const [lastApplied, setLastApplied] = useState<{ min?: string; max?: string; option?: number }>({})

    const prevTypeRef = useRef<FilterTransactionAmountType>(type)

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

    const isValidNumber = (value: string) => {
      return value.trim() !== '' && !isNaN(Number(value)) && Number(value) >= 0
    }

    const handleInputValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === '-') e.preventDefault()
    }

    const handleOnClickOptionItem = (usdValue: number) => {
      const displayValue = convertToDisplayValue(usdValue)

      setOptionValue(usdValue)
      setOption?.(usdValue)
      setMinValue(displayValue.toFixed(type === FilterTransactionAmountType.SOL ? 4 : 0))
      setMaxValue('')
    }

    const handleConfirmClick = () => {
      setErrorText('')
      setLoading(true)

      const hasValidMin = isValidNumber(minValue)
      const hasValidMax = isValidNumber(maxValue)

      const displayMin = hasValidMin ? Number(minValue) : undefined
      const displayMax = hasValidMax ? Number(maxValue) : undefined

      if (hasValidMin && hasValidMax && displayMin! > displayMax!) {
        setErrorText(t('detail.tokenDetail.errorInputTransactionFilter'))
        setLoading(false)
        return
      }

      const usdMin = displayMin !== undefined ? convertToUSDValue(displayMin) : undefined
      const usdMax = displayMax !== undefined ? convertToUSDValue(displayMax) : undefined

      onValueChange(usdMin, usdMax)
      setLastApplied({ min: minValue, max: maxValue, option: optionValue })
      setOption?.(optionValue)
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
    }

    const handleDrawerOpen = (isOpen: boolean) => {
      setOpen(isOpen)

      if (isOpen) {
        setMinValue(lastApplied.min ?? '')
        setMaxValue(lastApplied.max ?? '')
        setOptionValue(lastApplied.option ?? 0)
      }
    }

    useEffect(() => {
      const prevType = prevTypeRef.current

      if (prevType !== type && solPrice > 0) {
        if (minValue && isValidNumber(minValue)) {
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

        if (maxValue && isValidNumber(maxValue)) {
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
        setMinValue(min ? `${min}` : '')
        setMaxValue(max ? `${max}` : '')
        setOptionValue(option ?? 0)
      }
    }, [open])

    return (
      <>
        <Drawer open={open} onOpenChange={handleDrawerOpen} repositionInputs={false}>
          <DrawerContent className="w-full bg-[#212127] max-w-[768px] max-h-[80vh] mx-auto">
            <DrawerHeader>
              <DrawerTitle className="mt-1.5">
                <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                  {filterInPage === 'pool'
                    ? t('detail.tokenDetail.FilterbyValue')
                    : t('detail.tokenDetail.VolumeFilter')}
                </div>
              </DrawerTitle>

              <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="size-5" />
              </DrawerClose>
            </DrawerHeader>

            <div className="flex flex-col px-4 gap-3 mt-3">
              <div className="grid grid-cols-3 gap-x-2 gap-y-3">
                {filterInPage === 'pool'
                  ? listFilterValues2.map((item) => (
                      <GradientBordered
                        key={item}
                        containerClassName={cn(
                          'cursor-pointer flex-1 text-center h-[34px] rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-[1] p-[0.5px] hover-scale bg-[#C8A7FD]',
                          optionValue !== item && '!bg-[#2B2B33]',
                        )}
                        innerBgClassName={cn(
                          'p-[8px] rounded-[6.5px] !bg-[transparent] app-font-regular',
                          optionValue === item && '!bg-[#212127] text-white',
                        )}
                        onClick={() => handleOnClickOptionItem(item)}
                        gradientValue="90deg, #9C2CFF 0%, #FF5EFF 100%"
                      >
                        {`>${formatMoney(item)}`}
                      </GradientBordered>
                    ))
                  : listFilterValues.map((item) => (
                      <GradientBordered
                        key={item}
                        containerClassName={cn(
                          'cursor-pointer flex-1 text-center h-[34px] rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-[1] p-[0.5px] hover-scale bg-[#C8A7FD]',
                          optionValue !== item && '!bg-[#2B2B33]',
                        )}
                        innerBgClassName={cn(
                          'p-[8px] rounded-[6.5px] !bg-[transparent] app-font-regular',
                          optionValue === item && '!bg-[#212127] text-white',
                        )}
                        onClick={() => handleOnClickOptionItem(item)}
                        gradientValue="90deg, #9C2CFF 0%, #FF5EFF 100%"
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
                    ? t('detail.tokenDetail.placeholderMinimumValue')
                    : `${t('detail.tokenDetail.placeholderMinimumValue')} (SOL)`
                }
                containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
                innerBgClassName="rounded-[6px] bg-[#2B2B33]"
                inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1 text-right"
                unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                innerBgClassNameFocus="bg-[#212127]"
                prefixStyle="text-[#908E98] text-[14px]"
                inputProps={{
                  onKeyDown: handleInputValue,
                }}
                onChange={(value) => setMinValue(formatValueInput(value))}
                value={minValue as string}
              />

              <InputBorderGradient
                unit={type === FilterTransactionAmountType.USDT ? '$' : 'SOL'}
                borderStyle="border-[#444455]"
                isShowPrefix
                prefix={
                  type === FilterTransactionAmountType.USDT
                    ? t('detail.tokenDetail.placeholderMaximumValue')
                    : `${t('detail.tokenDetail.placeholderMaximumValue')} (SOL)`
                }
                containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
                innerBgClassName="rounded-[6px] bg-[#2B2B33]"
                inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1 text-right"
                unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
                innerBgClassNameFocus="bg-[#212127]"
                prefixStyle="text-[#908E98] text-[14px]"
                inputProps={{
                  type: 'number',
                  onKeyDown: handleInputValue,
                }}
                onChange={(value) => setMaxValue(formatValueInput(value))}
                value={maxValue as string}
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
                  className="flex-1 rounded-full h-11 bg-[#2B2B33] text-white"
                  onClick={handleResetClick}
                >
                  {t('orderForm.buySettings.reset')}
                </Button>

                <Button
                  size="lg"
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

FilterTotalValue.displayName = 'FilterTotalValue'

export default FilterTotalValue
