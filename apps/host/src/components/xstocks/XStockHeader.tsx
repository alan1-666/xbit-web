import { SortDirectionIconV2 } from '@components/icon/SortDirectionIcon.tsx'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { FC, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { XStockListContext } from '@components/xstocks/XStockListContext.ts'

export interface XStockHeaderProps {
  className?: string
  headerClassName?: string
  defaultSortBy?: SortBy
  onSortChange?: (sortBy: SortBy) => void
}

export type SortByField = 'token' | 'marketCap' | 'price' | 'liquidity' | 'change24h' | 'volume24h'

export type SortBy = {
  field: SortByField
  direction: 'asc' | 'desc'
}

const labelMap: Record<SortByField, string> = {
  token: 'xstocks.columns.token',
  marketCap: 'xstocks.columns.marketCap',
  price: 'xstocks.columns.price',
  liquidity: 'xstocks.columns.liquidity',
  // change24h: 'xstocks.columns.change24h',
  change24h: 'xstocks.columns.newChange24h',
  volume24h: 'categories.volume24h',
}

const SortableField = (props: { field: SortByField }) => {
  const { field } = props
  const { control, setValue } = useFormContext<SortBy>()
  const [currentField, currentDirection] = useWatch({ name: ['field', 'direction'], control })
  const { t } = useTranslation()

  const handleClick = () => {
    if (currentField === field) {
      // Toggle direction if the same field is clicked
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc'
      setValue('direction', newDirection)
    } else {
      // Set new field and default to descending order
      setValue('field', field)
      setValue('direction', 'desc')
    }
  }

  return (
    <div className="flex items-center cursor-pointer select-none gap-1" onClick={handleClick}>
      <span className="text-[#878B99] text-[11px] font-normal">{t(labelMap[field])}</span>
      <SortDirectionIconV2 direction={currentField === field ? currentDirection : 'none'} inactiveColor="#5E5C66" />
    </div>
  )
}

/**
 * Header for the XStocks token list, similar to CategorySortHeader.
 * Columns: Token (40%), Price + Liquidity (25%), 24h Change (15%)
 */
const XStockHeader: FC<XStockHeaderProps> = ({ className = '', headerClassName = '', onSortChange, defaultSortBy }) => {
  const { primaryMetric } = useContext(XStockListContext)

  const form = useForm<SortBy>({
    defaultValues: defaultSortBy,
  })

  const [field, direction] = useWatch({
    control: form.control,
    name: ['field', 'direction'],
  })

  useEffect(() => {
    if (onSortChange) {
      onSortChange({ field, direction })
    }
  }, [field, direction])

  return (
    <FormProvider {...form}>
      <div
        className={`w-full sticky top-9 bg-[#0A0A0A] z-10 flex-row flex justify-between items-center text-center text-[#5E5C66] text-xs py-2 ${className} ${headerClassName}`}
      >
        <div className="w-[50%] inline-flex text-left items-center gap-1">
          <SortableField field="token" />
          <SortableField field={primaryMetric} />
        </div>
        <div className="w-[25%] text-end flex items-center gap-1 justify-end">
          <SortableField field="price" />
          <span className="text-[#343339] font-[300]">|</span>
          <SortableField field="liquidity" />
        </div>
        <div className="w-[25%] inline-flex text-right items-center justify-end">
          <SortableField field="change24h" />
        </div>
      </div>
    </FormProvider>
  )
}

export default XStockHeader
