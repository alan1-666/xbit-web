import { Input } from '@components/ui/input.tsx'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { OrderFormData } from './OrderFormData.ts'
import { FormInputLabel } from './FormInputLabel.tsx'
import { PercentageSelector } from './PercentageSelector.tsx'
import { useCallback, useContext } from 'react'
import { OrderFormContext } from '@/modules/prediction/components/shared/order-form/OrderFormContext.ts'
import { useMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance.ts'
import { useMarketConditionalTokenBalance } from '@/modules/prediction/components/shared/order-form/hooks/useMarketConditionalTokenBalance.ts'
import Decimal from 'decimal.js'
import { ValidationError } from '@/modules/prediction/components/shared/order-form/ValidationError.tsx'
import { NumericFormat } from 'react-number-format'

const normalizeShareValue = (value: number, round?: 'up' | 'down') => {
  const dec = new Decimal(value)
  return dec.toDecimalPlaces(6, round === 'up' ? Decimal.ROUND_UP : Decimal.ROUND_DOWN).toNumber()
}

export const SharesInput = () => {
  const { yesPrice, noPrice, orderSuccessKey, sellMaxSelectedKey } = useContext(OrderFormContext)
  const { data: usdcBalance } = useMyUSDCBalance()
  const { data: tokenBalance } = useMarketConditionalTokenBalance()
  const { control, setValue, getValues } = useFormContext<OrderFormData>()

  const side = useWatch({ control, name: 'side' })
  const orderType = useWatch({ control, name: 'orderType' })
  const outcome = useWatch({ control, name: 'outcome' })
  const sizeValue = useWatch({ control, name: 'data.size' })
  const outcomePrice = outcome === 'yes' ? yesPrice : noPrice

  const isBuyLimit = orderType === 'limit' && side === 'buy'

  const handleOnPercentageSelect = useCallback(
    (percentage: number) => {
      if (side === 'buy') {
        if (usdcBalance !== undefined && outcomePrice > 0) {
          const usdcToSpend = (usdcBalance * percentage) / 100
          const sharesToBuy = usdcToSpend / outcomePrice
          setValue('data.size', normalizeShareValue(sharesToBuy, 'down'), { shouldValidate: true })
        }
      } else if (side === 'sell' && tokenBalance !== undefined) {
        const sharesToSell = (tokenBalance * percentage) / 100
        setValue('data.size', normalizeShareValue(sharesToSell, 'down'), { shouldValidate: true })
      }
    },
    [side, usdcBalance, outcomePrice, tokenBalance, setValue],
  )

  const handleOnIncrement = useCallback(
    (delta: number) => {
      const currentSize = Number(getValues('data.size')) || 0
      const newSize = Math.max(0, normalizeShareValue(currentSize + delta, 'down'))
      setValue('data.size', newSize, { shouldValidate: true })
    },
    [getValues, setValue],
  )

  return (
    <div>
      <FormInputLabel label="Shares" />
      <Controller
        name="data.size"
        control={control}
        render={({ field }) => (
          <NumericFormat
            inputMode="decimal"
            placeholder="0.00"
            customInput={Input}
            decimalScale={2}
            className="text-center border-0 border-b-0 border-none bg-transparent py-3 text-3xl! font-semibold text-white shadow-none outline-none placeholder:text-[#908E98] caret-[#AB70FF] focus-visible:ring-0 focus-visible:ring-offset-0"
            value={sizeValue !== undefined && sizeValue !== 0 ? sizeValue : ''}
            onFocus={(e) => {
              e.target.placeholder = ''
            }}
            onBlur={(e) => {
              if (!e.target.value) {
                e.target.placeholder = '0.00'
              }
            }}
            onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
          />
        )}
      />
      <div className="min-h-5 flex items-center justify-center">
        <ValidationError />
      </div>
      <PercentageSelector
        variant={isBuyLimit ? 'increment' : 'percentage'}
        onSelect={isBuyLimit ? handleOnIncrement : handleOnPercentageSelect}
        outcome={outcome}
        clearWhen={orderSuccessKey}
        selectMaxWhen={sellMaxSelectedKey}
      />
    </div>
  )
}
