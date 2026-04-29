import { Input } from '@components/ui/input.tsx'
import { Controller, useFormContext } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { Minus, Plus } from 'lucide-react'
import { OrderFormContext } from '@/modules/prediction/components/shared/order-form/OrderFormContext.ts'
import { OrderFormData } from './OrderFormData.ts'
import { useCallback, useContext, useMemo } from 'react'
import Decimal from 'decimal.js'
import { cn } from '@/lib/utils'

const inputClassName =
  'flex-1 min-w-0 max-w-[120px] text-center border-0 border-none bg-transparent py-3 text-3xl! font-semibold text-white shadow-none outline-none placeholder:text-[#908E98] caret-[#AB70FF] focus-visible:ring-0 focus-visible:ring-offset-0'

export const PriceInput = () => {
  const { minTickSize = 0.01 } = useContext(OrderFormContext)
  const { control, setValue, getValues } = useFormContext<OrderFormData>()

  // Decimal places for price display (minTickSize 0.01 → 2 decimals)
  const decimals = useMemo(() => Math.max(0, -Math.log10(minTickSize)), [minTickSize])

  const handleOnAdd = useCallback(() => {
    const currentValue = getValues('data.price') || 0
    const newValue = Decimal(+currentValue + minTickSize)
      .toDecimalPlaces(decimals)
      .toNumber()
    setValue('data.price', newValue, { shouldDirty: true, shouldValidate: true })
  }, [minTickSize, decimals, getValues, setValue])

  const handleOnSubtract = useCallback(() => {
    const currentValue = getValues('data.price') || 0
    const newValue = Decimal(+currentValue - minTickSize)
      .toDecimalPlaces(decimals)
      .toNumber()
    setValue('data.price', newValue < 0 ? 0 : newValue, { shouldDirty: true, shouldValidate: true })
  }, [minTickSize, decimals, getValues, setValue])

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-xs text-white">Limit Price</span>
      <div className="flex flex-1 items-center justify-end gap-1">
        <button
          type="button"
          onClick={handleOnSubtract}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-[#6B7280] hover:bg-white/5 hover:text-[#908E98]"
          aria-label="Decrease price"
        >
          <Minus className="size-4" />
        </button>
        <Controller
          name="data.price"
          control={control}
          render={({ field }) => (
            <NumericFormat
              inputMode="decimal"
              placeholder="0¢"
              suffix="¢"
              customInput={Input}
              decimalScale={Math.max(0, decimals - 2)}
              className={cn(inputClassName)}
              value={field.value ? field.value * 100 : ''}
              onFocus={(e) => {
                e.target.placeholder = ''
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.placeholder = '0¢'
                }
              }}
              onValueChange={(values) => {
                const { value } = values
                field.onChange(value === '' ? null : Number(value) / 100)
              }}
            />
          )}
        />
        <button
          type="button"
          onClick={handleOnAdd}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-[#6B7280] hover:bg-white/5 hover:text-[#908E98]"
          aria-label="Increase price"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}
