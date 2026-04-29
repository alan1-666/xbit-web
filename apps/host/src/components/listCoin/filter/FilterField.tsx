import { IconSortDown, IconSortUp } from '@components/icon'
import { clsx } from 'clsx'
import { Control, Controller, ControllerRenderProps, useWatch, FieldPath, useController } from 'react-hook-form'
import CustomizeFilterField from '@components/listCoin/filter/CustomizeFilterField.tsx'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'

export type FilterItemType = {
  label: string
  data: any
}

export type SortType = 'asc' | 'desc' | 'none'

export type FilterFormData = {
  sort?: {
    field: string
    title: string
    type: SortType
  }
  creationTime: { data: { min: number; max: number }; label: string }
  marketCap: { data: { min: number; max: number }; label: string }
  transactions: { data: { min: number; max: number }; label: string }
  volumes: { data: { min: number; max: number }; label: string }
  period: { value: string; unit: string }
  dex?: { data: string; label: string }
  progress: { data: { min: number; max: number }; label: string }
  liquidityPool: { data: { min: number; max: number }; label: string }
  holders: { data: { min: number; max: number }; label: string }
  [key: string]: any
}

export interface FilterFieldProps {
  fieldKey: FieldPath<FilterFormData>
  title: string
  sortable?: boolean
  control: Control<FilterFormData>
  customized?: boolean
  options: FilterItemType[]
  minimumLabel: string
  maximumLabel: string
  unit: string
  disabled?: boolean
  formatter?: (value: number, unit: string) => string
}

export default function FilterField(props: FilterFieldProps) {
  const {
    control,
    fieldKey,
    title,
    sortable = true,
    customized = true,
    options,
    maximumLabel,
    minimumLabel,
    unit,
    disabled = false,
    formatter,
  } = props
  const fieldController = useController({ control, name: fieldKey })
  const sort = useWatch({ name: 'sort', control })
  const { t } = useTranslation()

  const handleSort = (field: ControllerRenderProps<FilterFormData, 'sort'>) => {
    const currentValue = field.value
    if (currentValue?.field !== fieldKey) {
      return field.onChange({
        field: fieldKey,
        type: 'desc',
        title,
      })
    }
    if (currentValue.type === 'desc') {
      return field.onChange({
        field: fieldKey,
        type: 'asc',
        title,
      })
    }
    if (currentValue.type === 'asc') {
      return field.onChange(undefined)
    }
  }

  return (
    <div className="bg-[#ECECED0A] px-2 py-3 rounded-[6px] mb-2">
      <div className="flex items-center justify-between mb-3.5">
        <Controller
          name="sort"
          control={control}
          render={({ field }) => (
            <div className="flex items-center cursor-pointer" onClick={() => handleSort(field)}>
              <div className="text-[calc(1rem*(13/16))] text-[#FFFFFFCC]">{title}</div>
              {sortable && (
                <div className="flex flex-col ml-1">
                  <div>
                    <IconSortUp
                      currentColor={sort?.field === fieldKey && sort?.type === 'asc' ? '#AB57FF' : '#FFFFFF7A'}
                    />
                  </div>
                  <div>
                    <IconSortDown
                      currentColor={sort?.field === fieldKey && sort?.type === 'desc' ? '#AB57FF' : '#FFFFFF7A'}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        />

        {customized && (
          <CustomizeFilterField
            fieldKey={fieldKey}
            control={control}
            title={title}
            maximumLabel={maximumLabel}
            minimumLabel={minimumLabel}
            unit={unit}
            disabled={disabled}
            formatter={formatter}
            onApply={(min, max) =>
              fieldController.field.onChange({
                data: { min, max },
                label: 'customized',
              })
            }
            onClear={() => fieldController.field.onChange(undefined)}
          />
        )}
      </div>

      <Controller
        name={fieldKey}
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              className={clsx(
                'w-12 py-[7px] shrink-0 text-[0.75rem] leading-[0.75rem] transition duration-300 rounded-[3px] h-[26px] border border-[#ECECED2E]',
                !field.value || field.value?.data === 'All' ? 'bg-[#ECECED2E] text-white' : 'text-[#FFFFFFB3]',
              )}
              onClick={() => field.onChange(null)}
              disabled={disabled}
            >
              {t('constant.all')}
            </Button>
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar snap-x snap-mandatory">
              {options.map((item, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  className={clsx(
                    'snap-start min-w-[70px] text-[0.75rem] leading-[0.75rem] transition duration-300 rounded box-border border border-[#ECECED2E] py-1.5 h-[26px]',
                    item.label === (field.value as any)?.label ? 'bg-[#ECECED2E] text-white' : 'text-[#FFFFFFB3]',
                  )}
                  onClick={() => field.onChange(item)}
                  disabled={disabled}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      />
    </div>
  )
}
