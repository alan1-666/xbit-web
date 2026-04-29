import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@components/ui/drawer.tsx'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button } from '@components/ui/button.tsx'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { SmartMoneyFilterType } from '@/types/monitoring.ts'
import { setRealtimeTxFilterMaxAmount, setRealtimeTxFilterMinAmount } from '@/redux/modules/monitoringPcSlice.ts'
import GradientBordered from '@components/common/GradientBordered.tsx'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { formatMoney, formatValueInput } from '@/utils/helpers'
import { cn } from '@/lib/utils.ts'
import { Loader2, X } from 'lucide-react'

export interface TransactionAmountFilterProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onChange: (value: number | undefined) => void
}

const listFilterValues = [1000, 5000, 10000]

const TransactionAmountFilter = (props: TransactionAmountFilterProps) => {
  const { open, setOpen } = props
  const { t } = useTranslation()
  const confirmedItem = useAppSelector(
    (state: RootState) => (state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType)?.minAmountUsd,
  )
  const confirmedMaxItem = useAppSelector(
    (state: RootState) => (state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType)?.maxAmountUsd,
  )
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [optionValue, setOptionValue] = useState<number>(0)
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    if (open) {
      if (confirmedItem) {
        setMinValue(`${confirmedItem}`)
        setOptionValue(confirmedItem)
      } else {
        setMinValue('')
        setOptionValue(0)
      }

      if (confirmedMaxItem) {
        setMaxValue(`${confirmedMaxItem}`)
      } else {
        setMaxValue('')
      }
    }
  }, [open, confirmedItem, confirmedMaxItem])

  useEffect(() => {
    setErrorText('')
  }, [minValue, maxValue])

  const handleInputValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-') e.preventDefault()
  }

  const handleOnClickOptionItem = (usdValue: number) => {
    setOptionValue(usdValue)
    setMinValue(`${usdValue}`)
  }

  const handleResetClick = () => {
    setOpen(false)
    dispatch(setRealtimeTxFilterMinAmount(undefined))
    dispatch(setRealtimeTxFilterMaxAmount(undefined))
    setMinValue('')
    setMaxValue('')
    setOptionValue(0)
  }

  const handleConfirmClick = () => {
    setErrorText('')
    setLoading(true)

    const hasValidMin = minValue.trim() !== '' && !isNaN(Number(minValue)) && Number(minValue) >= 0
    const hasValidMax = maxValue.trim() !== '' && !isNaN(Number(maxValue)) && Number(maxValue) >= 0

    const displayMin = hasValidMin ? Number(minValue) : undefined
    const displayMax = hasValidMax ? Number(maxValue) : undefined

    if (hasValidMin && hasValidMax && displayMin! > displayMax!) {
      setErrorText(t('detail.tokenDetail.errorInputTransactionFilter'))
      setLoading(false)
      return
    }

    dispatch(setRealtimeTxFilterMinAmount(displayMin))
    dispatch(setRealtimeTxFilterMaxAmount(displayMax))
    setLoading(false)
    setOpen(false)
  }

  const selectedLabel = useMemo(() => {
    const min = confirmedItem
    const max = confirmedMaxItem

    if (min !== undefined && min > 0 && max !== undefined && max > 0) {
      return `${formatMoney(min)} - ${formatMoney(max)}`
    }
    if (min !== undefined && min > 0) {
      return `>${formatMoney(min)}`
    }
    if (max !== undefined && max > 0) {
      return `<${formatMoney(max)}`
    }
    return t('detail.smartMoney.transactionAmountShortName')
  }, [confirmedItem, confirmedMaxItem, t])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="rounded-[6px] border-[0.8px] border-[#ECECED1F] flex items-center justify-between gap-[6px] p-2 cursor-pointer w-1/3 min-w-40">
          <span className="text-[calc(1rem*(13/16))] leading-3.25 text-[#FFFFFFCC] whitespace-nowrap">
            {selectedLabel}
          </span>
          <img src="/images/icons/icon-chevron-down.svg" className="w-[6.67px] h-[4.67px]" alt="" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#212127] max-w-[768px] max-h-[80vh] mx-auto border-none rounded-t-[20px]">
        <DrawerHeader>
          <DrawerTitle className="mt-1.5">
            <div className="text-[calc(1rem*(22/16))] leading-none app-font-regular text-left text-white">
              {t('detail.smartMoney.transactionAmount')}
            </div>
          </DrawerTitle>

          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white">
            <X className="size-5" />
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-col px-4 gap-3 mt-3">
          <div className="flex justify-between gap-3">
            {listFilterValues.map((item) => (
              <div
                key={item}
                className={cn(
                  'cursor-pointer flex-1 text-center min-h-[34px] h-auto rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-none hover-scale flex flex-col justify-center border border-transparent',
                  optionValue === item ? 'border-[#C8A7FD]' : 'border-transparent bg-[#2B2B33]',
                )}
                onClick={() => handleOnClickOptionItem(item)}
              >
                {`>${formatMoney(item)}`}
              </div>
            ))}
          </div>

          <InputBorderGradient
            unit="$"
            borderStyle="border-[#444455]"
            isShowPrefix
            prefix={t('monitoring.MinimumAmount')}
            containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
            innerBgClassName="rounded-[6px] bg-[#2B2B33]"
            inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1 text-right text-white"
            unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-none"
            innerBgClassNameFocus="bg-[#212127]"
            prefixStyle="text-[#908E98] text-[14px]"
            inputProps={{
              onKeyDown: handleInputValue,
            }}
            onChange={(value) => {
              const val = formatValueInput(value)
              setMinValue(val)
              setOptionValue(Number(val))
            }}
            value={minValue}
          />

          <InputBorderGradient
            unit="$"
            borderStyle="border-[#444455]"
            isShowPrefix
            prefix={t('monitoring.MaximumAmount')}
            containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
            innerBgClassName="rounded-[6px] bg-[#2B2B33]"
            inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1 text-right text-white"
            unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-none"
            innerBgClassNameFocus="bg-[#212127]"
            prefixStyle="text-[#908E98] text-[14px]"
            inputProps={{
              onKeyDown: handleInputValue,
            }}
            onChange={(value) => {
              const val = formatValueInput(value)
              setMaxValue(val)
            }}
            value={maxValue}
          />
        </div>

        <DrawerDescription></DrawerDescription>

        <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
          {errorText && errorText !== '' && (
            <div className={'pt-4 text-[11px] leading-none text-[#FF353C]'}>{errorText}</div>
          )}
          <div className="flex justify-center items-center flex-row gap-2.5 pt-4">
            <Button
              size="lg"
              disabled={loading}
              className="flex-1 rounded-full h-11 bg-[#2B2B33] text-white hover:bg-[#3E3E47]"
              onClick={handleResetClick}
            >
              {t('button.reset')}
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
  )
}

export default TransactionAmountFilter
