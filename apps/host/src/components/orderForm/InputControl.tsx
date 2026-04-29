import { cn } from '@/lib/utils.ts'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@components/ui/button.tsx'
import FilterSelect, { FilterSelectOption } from '@components/common/FilterSelect'
import { TokenDetail } from '@/@generated/gql/graphql-core'
import { useFormContext } from 'react-hook-form'
import { FormValues } from '.'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { formatSmallPrice } from '@/lib/number'
import { useTranslation } from 'react-i18next'
import { RootState, useAppSelector } from '@/redux/store'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import { TransactionType } from '@/@generated/gql/graphql-trading'

type InputBorderGradientProps = {
  placeHolder?: string
  containerClassName?: string
  onFocus?: () => void
  onBlur?: () => void
  plusCallback?: () => void
  minusCallback?: () => void
  tokenDetail: TokenDetail
  inputType?: string
  setInputType?: any
  side?: TransactionType
}

const InputControl = ({
  placeHolder,
  containerClassName,
  onFocus,
  onBlur,
  tokenDetail,
  inputType,
  setInputType,
  side = TransactionType.Buy,
}: InputBorderGradientProps) => {
  const [isFocus, setFocus] = useState<boolean>(false)
  const inputPriceRef = useRef<HTMLInputElement>(null)
  const inputMcRef = useRef<HTMLInputElement>(null)
  const [tooltipPriceChange, setTooltipPriceChange] = useState<number | string>(0)
  const flagRef = useRef(0)
  const { t } = useTranslation()
  const [newPrice, setNewPrice] = useState('')
  const [newMc, setNewMc] = useState('')

  const [hasPrice, setHasPrice] = useState<boolean>(false)
  const [hasMc, setHasMc] = useState<boolean>(false)

  const inputOptions: FilterSelectOption[] = [
    {
      value: 'price',
      label: t('orderForm.form.price'),
    },
    {
      value: 'marketCap',
      label: t('orderBook.marketCap'),
    },
  ]
  const { price } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  useEffect(() => {
    if (!!price && flagRef.current === 0) {
      inputPriceRef.current!.value = formatSmallPrice(+price)
      setNewPrice(formatSmallPrice(+price))
      flagRef.current = 1
    }
  }, [price])

  const {
    setValue,
    // formState: { errors },
  } = useFormContext<FormValues>()

  const handleFocus = () => {
    inputPriceRef?.current?.focus()
    setFocus(true)
    if (onFocus) onFocus()
  }

  function getStep(num: number): number {
    const str = num.toString()
    const decimalPart = str.split('.')[1]
    if (!decimalPart) return 1 // No decimals, step is 1
    const precision = decimalPart.length
    return Math.pow(10, -precision)
  }

  function safeSub(num: number, step: number) {
    // Determine decimal precision from step size (e.g., 1e-7 → 7 digits)
    const stepStr = step.toExponential().split('e-')
    const precision = stepStr.length === 2 ? parseInt(stepStr[1], 10) : 0

    // Perform subtraction and round to the correct number of digits
    const result = num - step
    return parseFloat(result.toFixed(precision))
  }

  useEffect(() => {
    if (tokenDetail) {
      if (inputType === 'price' && !!tokenDetail?.price) {
        inputPriceRef.current!.value = formatSmallPrice(+tokenDetail?.price)
        setNewPrice(formatSmallPrice(+tokenDetail?.price))
      }
      if (inputType === 'marketCap') {
        inputMcRef.current!.value = formatSmallPrice(+tokenDetail?.marketCap)
        setNewMc(formatSmallPrice(+tokenDetail?.marketCap))
      }
    }
  }, [tokenDetail, inputType])
  const handleBlur = () => {
    setFocus(false)
    if (onBlur) onBlur()
  }

  const handleMinus = () => {
    // handleFocus()
    // if (onFocus) onFocus()
    if (inputType === 'price') {
      const step = getStep(+formatSmallPrice(+inputPriceRef.current!.value))
      inputPriceRef.current!.value = safeSub(+inputPriceRef.current!.value, step) + ''
      setValue('limitPrice', inputPriceRef.current!.value)
      setNewPrice(inputPriceRef.current!.value)
    }
    if (inputType === 'marketCap') {
      const step = getStep(+formatSmallPrice(+inputMcRef.current!.value))
      inputMcRef.current!.value = safeSub(+inputMcRef.current!.value, step) + ''
      setValue('limitMarketCap', inputMcRef.current!.value)
      setNewMc(inputMcRef.current!.value)
    }
  }

  const handlePlus = () => {
    // handleFocus()
    // if (onFocus) onFocus()
    if (inputType === 'price') {
      const step = getStep(+formatSmallPrice(+inputPriceRef.current!.value))
      inputPriceRef.current!.value = safeSub(+inputPriceRef.current!.value, -step) + ''
      setValue('limitPrice', inputPriceRef.current!.value)
      setNewPrice(inputPriceRef.current!.value)
    }
    if (inputType === 'marketCap') {
      const step = getStep(+formatSmallPrice(+inputMcRef.current!.value))
      inputMcRef.current!.value = safeSub(+inputMcRef.current!.value, -step) + ''
      setValue('limitMarketCap', inputMcRef.current!.value)
      setNewMc(inputMcRef.current!.value)
    }
  }

  useEffect(() => {
    if (inputPriceRef.current && inputPriceRef.current.value !== '') {
      setValue('limitPrice', inputPriceRef.current.value)
      setHasPrice(true)
      calcTooltipPriceChange(+inputPriceRef.current!.value, +tokenDetail?.price)
      setNewPrice(inputPriceRef.current!.value)
    } else {
      setHasPrice(false)
    }
  }, [inputPriceRef.current?.value])

  useEffect(() => {
    if (inputMcRef.current && inputMcRef.current.value !== '') {
      setValue('limitMarketCap', inputMcRef.current.value)
      setHasMc(true)
      calcTooltipPriceChange(+inputMcRef.current!.value, +tokenDetail?.marketCap)
      setNewMc(inputMcRef.current!.value)
    } else {
      setHasMc(false)
    }
  }, [inputMcRef.current?.value])

  const calcTooltipPriceChange = (value: number, denominator: number) => {
    if (!!denominator) {
      const priceChange = (100 - (value * 100) / +formatSmallPrice(+denominator)).toFixed(2)
      setTooltipPriceChange(+-priceChange)
    }
  }

  return (
    <div
      className={cn(
        'rounded-[4px] relative min-h-[40px] px-[1.5px] py-[1px] border border-transparent',
        isFocus && 'border-gradient-toolbar-klineStyle',
        containerClassName,
      )}
    >
      <div className="absolute inset-[1px] bg-[#141414] rounded-[4px] z-0" />
      <div className="flex items-center justify-between px-0.5 gap-0 relative z-1 h-full bg-[#ececed14] rounded-[4px]">
        <Button
          onClick={handleMinus}
          className="w-[22px] h-10 min-w-[22px] p-0 bg-none rounded-[4px] bg-[#ECECED0A] flex items-center justify-center"
        >
          <img src="/images/orderForm/icon-minus.svg" className="w-[14px] min-w-[14px]" alt="" />
        </Button>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger className="flex-1">
              <div className="relative w-full max-w-sm group focus-within:pt-0">
                {inputType === 'price' && (
                  <div className="flex items-center justify-center">
                    <input
                      className="w-full h-full px-0 flex-1 app-font-regular text-white text-[14px] leading-none text-center pt-2"
                      type="text"
                      ref={inputPriceRef}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      value={newPrice}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9.]/g, '')
                        if (value.includes('.')) {
                          const parts = value.split('.')
                          value = parts[0] + '.' + parts[1]
                        }
                        setNewPrice(value)
                      }}
                    />
                    <label
                      className={cn(
                        'flex justify-center w-full h-full select-none pointer-events-none transition absolute left-0 top-0 bottom-0 items-center px-3',
                        isFocus || hasPrice
                          ? 'translate-y-[-12px] text-[9px] text-[#ffffff5c]'
                          : 'translate-y-0 text-[#FFFFFFCC] text-[14px] leading-none',
                      )}
                    >
                      {side === TransactionType.Buy ? t('transaction.buy') : t('transaction.sell')}{' '}
                      {t('orderBook.price')} (USDT)
                    </label>
                  </div>
                )}
                {inputType === 'marketCap' && (
                  <div className="flex items-center justify-center">
                    <input
                      className="w-full h-full px-0 flex-1 app-font-regular text-[#00FFB4] text-[14px] leading-none text-center pt-2"
                      type="text"
                      ref={inputMcRef}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      value={newMc}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9.]/g, '')
                        if (value.includes('.')) {
                          const parts = value.split('.')
                          value = parts[0] + '.' + parts[1]
                        }
                        setNewMc(value)
                      }}
                    />
                    <label
                      className={cn(
                        'flex justify-center w-full h-full select-none pointer-events-none transition absolute left-0 top-0 bottom-0 items-center px-3',
                        isFocus || hasMc
                          ? 'translate-y-[-12px] text-[9px] text-[#ffffff5c]'
                          : 'translate-y-0 text-[#FFFFFFCC] text-[14px] leading-none',
                      )}
                    >
                      {side === TransactionType.Buy ? t('transaction.buy') : t('transaction.sell')}{' '}
                      {t('orderBook.marketCap')} (USDT)
                    </label>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px]">
              <p className="text-xs leading-none">{tooltipPriceChange}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          onClick={handlePlus}
          className="w-[22px] h-10 min-w-[22px] p-0 bg-none rounded-[4px] bg-[#ECECED0A] flex items-center justify-center mr-2"
        >
          <img src="/images/orderForm/icon-plus.svg" className="w-[14px] min-w-[14px]" alt="" />
        </Button>
        <div className="!w-[48px] ml-2px">
          <FilterSelect
            triggerIconClassname="w-[10px] h-[10px] absolute top-[50%] translate-y-[-50%] right-[4px]"
            triggerIcon="/images/orderForm/icon-dropdown.svg"
            options={inputOptions}
            defaultValue={inputOptions[0].value}
            selectTriggerProps={{
              className: '!w-[48px] flex border-none bg-[none] !p-0 text-[11px]',
            }}
            onValueChange={(value) => setInputType(value)}
          />
        </div>
      </div>
    </div>
  )
}

export default InputControl
