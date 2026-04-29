import { Input } from '@components/ui/input.tsx'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { OrderFormData } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'
import { FormInputLabel } from '@/modules/prediction/components/shared/order-form/FormInputLabel.tsx'
import { PercentageSelector } from '@/modules/prediction/components/shared/order-form/PercentageSelector.tsx'
import { useCallback, useEffect } from 'react'
import { useMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance.ts'
import Decimal from 'decimal.js'
import { ValidationError } from '@/modules/prediction/components/shared/order-form/ValidationError.tsx'
import { NumericFormat } from 'react-number-format'
import { useTranslation } from 'react-i18next'

const normalizeUSDCValue = (value: number, round?: 'up' | 'down') => {
  const dec = new Decimal(value)
  return dec.toDecimalPlaces(2, round === 'up' ? Decimal.ROUND_UP : Decimal.ROUND_DOWN).toNumber()
}

export const USDCInput = () => {
  const { t } = useTranslation()
  const { data: usdcBalance } = useMyUSDCBalance()
  const { control, setValue, getValues } = useFormContext<OrderFormData>()

  const side = useWatch({ control, name: 'side' })

  const handleOnAmountSelect = useCallback(
    (value: number) => {
      const currentAmount = Number(getValues('data.amount')) || 0
      if (value === -1) {
        if (usdcBalance !== undefined) {
          setValue('data.amount', normalizeUSDCValue(usdcBalance, 'down'), { shouldValidate: true })
        }
      } else {
        const newAmount = normalizeUSDCValue(currentAmount + value, 'down')
        setValue('data.amount', newAmount, { shouldValidate: true })
      }
    },
    [usdcBalance, getValues, setValue],
  )

  useEffect(() => {
    setValue('data.amount', 0)
  }, [side, setValue])

  return (
    <div>
      <FormInputLabel label={t('prediction.orderForm.amountLabel')} />
      <Controller
        name="data.amount"
        control={control}
        render={({ field }) => (
          <NumericFormat
            inputMode="decimal"
            placeholder="$0"
            prefix="$"
            customInput={Input}
            decimalScale={2}
            className="text-center border-0 border-b-0 border-none bg-transparent py-3 text-3xl! font-semibold text-white shadow-none outline-none placeholder:text-[#908E98] caret-[#AB70FF] focus-visible:ring-0 focus-visible:ring-offset-0"
            value={field.value === 0 || field.value == null ? '' : field.value}
            onFocus={(e) => {
              e.target.placeholder = ''
            }}
            onBlur={(e) => {
              if (!e.target.value || e.target.value === '$') {
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
      <PercentageSelector variant="amount" onSelect={handleOnAmountSelect} />
    </div>
  )
}
