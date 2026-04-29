import { useTranslation } from 'react-i18next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@components/ui/dropdown-menu.tsx'
import { useEffect, useMemo, useState } from 'react'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { SmartMoneyFilterType } from '@/types/monitoring.ts'
import { setRealtimeTxFilterMaxAmount, setRealtimeTxFilterMinAmount } from '@/redux/modules/monitoringPcSlice.ts'
import { Button } from '@components/ui/button.tsx'
import GradientBordered from '@components/common/GradientBordered.tsx'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { cn } from '@/lib/utils.ts'
import { formatMoney, formatValueInput } from '@/utils/helpers'
import { Loader2 } from 'lucide-react'

const listFilterValues = [1000, 5000, 10000]

const TransactionAmountDropdown = () => {
  const { t } = useTranslation()
  const confirmedItem = useAppSelector(
    (state: RootState) => (state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType)?.minAmountUsd,
  )
  const confirmedMaxItem = useAppSelector(
    (state: RootState) => (state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType)?.maxAmountUsd,
  )
  const dispatch = useAppDispatch()

  const [open, setOpen] = useState(false)
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

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
    setMinValue('')
    setMaxValue('')
    setOptionValue(0)
    dispatch(setRealtimeTxFilterMinAmount(undefined))
    dispatch(setRealtimeTxFilterMaxAmount(undefined))
  }

  const handleConfirmClick = (e: React.MouseEvent) => {
    e.stopPropagation()
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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="rounded-[6px] border-[0.8px] border-[#212127] flex items-center justify-between gap-[6px] p-2 cursor-pointer w-1/3 min-w-40">
          <span className="text-[calc(1rem*(13/16))] leading-3.25 text-[#FFFFFFCC] whitespace-nowrap">
            {selectedLabel}
          </span>
          <img src="/images/icons/icon-chevron-down.svg" className="w-[6.67px] h-[4.67px]" alt="" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[360px] bg-[#1a1a1d] border-[#2B2B33] p-0">
        <div className="flex flex-col px-4 gap-3 mt-3">
          <div className="flex justify-between gap-3 mt-1">
            {listFilterValues.map((item) => (
              <div
                key={item}
                className={cn(
                  'cursor-pointer flex-1 text-center min-h-[34px] h-auto rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-none hover-scale flex flex-col justify-center border',
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
              onClick: (e) => e.stopPropagation(),
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
              onClick: (e) => e.stopPropagation(),
            }}
            onChange={(value) => {
              const val = formatValueInput(value)
              setMaxValue(val)
            }}
            value={maxValue}
          />
        </div>

        <div className="pt-0 mt-3 border-t border-[#2B2B33] px-3 pb-3">
          {errorText && errorText !== '' && (
            <div className={'pt-2 pb-1 text-[11px] leading-none text-[#FF353C]'}>{errorText}</div>
          )}
          <div className="flex justify-center items-center flex-row gap-2.5 pt-3">
            <Button
              size="lg"
              disabled={loading}
              className="flex-1 rounded-full h-9 bg-[#2B2B33] text-white hover:bg-[#3E3E47]"
              onClick={handleResetClick}
            >
              {t('button.reset')}
            </Button>

            <Button
              size="lg"
              variant="gradient"
              className="text-[#261236] flex-1 rounded-[50px] h-9"
              onClick={handleConfirmClick}
            >
              {loading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
              {t('chart.buttons.confirm')}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TransactionAmountDropdown
