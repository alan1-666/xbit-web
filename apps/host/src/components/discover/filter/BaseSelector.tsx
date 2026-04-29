import { Control, FieldPath, useController, useWatch } from 'react-hook-form'
import { FilterFormData, RangeItem } from '@components/discover/filter/FilterFormData.ts'
import { useTranslation } from 'react-i18next'
import { SortableHeader } from './SortableHeader'
import { Button } from '@components/ui/button.tsx'
import { clsx } from 'clsx'
import { CustomizedSelector } from '@components/discover/filter/CustomizedSelector.tsx'
import { useContext, useMemo } from 'react'
import { DiscoverPageContext } from '@components/discover/DiscoverPageContext.tsx'
import { TAB_MEME } from '@components/discover/DiscoverTabs.tsx'
import { LifecycleStates } from '@/@generated/gql/graphql-core.ts'

export type SelectorOption = {
  key: string
  min?: number
  max?: number
  label: string
}

const isOption = (option: SelectorOption, value: RangeItem | undefined): boolean => {
  if (!value) return false
  if (value.isCustom) return false
  return option.min === value.min && option.max === value.max
}

const isAllOption = (value: RangeItem | undefined): boolean => {
  if (!value) return true
  if (value.isCustom) return false
  return value.min === undefined && value.max === undefined
}

export interface BaseSelectorProps {
  control: Control<FilterFormData>
  name: FieldPath<FilterFormData>
  title: string
  options: SelectorOption[]
  minimumLabel: string
  maximumLabel: string
  unit: string
  allowSort?: boolean
}

export const BaseSelector = (props: BaseSelectorProps) => {
  const { name, title, control, options, maximumLabel, minimumLabel, unit, allowSort } = props

  const { t } = useTranslation()

  const { currentTab, memeSubTab } = useContext(DiscoverPageContext)
  const sortable = useMemo(() => {
    if (allowSort !== undefined) return allowSort
    return currentTab !== TAB_MEME || memeSubTab !== LifecycleStates.NewCreation
  }, [currentTab, memeSubTab, allowSort])

  const field = useWatch({ control, name }) as RangeItem | undefined
  const controller = useController({ control, name })

  const clear = () => {
    controller.field.onChange(null)
  }

  const selectOption = (option: SelectorOption) => {
    controller.field.onChange({
      min: option.min,
      max: option.max,
      isCustom: false,
    })
  }

  const onCleared = () => {
    if (field?.isCustom) {
      controller.field.onChange(null)
    }
  }

  return (
    <div className="border-b border-[#ECECED0A] mb-4 pb-4 last:border-b-0 last:mb-0 last:pb-0">
      <SortableHeader control={control} name={name} title={title} allowSort={sortable} />
      <div className="flex items-center gap-1.5 mb-3 w-full h-[26px]">
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          <Button
            variant="secondary"
            size="sm"
            className={clsx(
              'snap-start flex-1 min-w-[70px] text-[0.75rem] leading-[0.75rem] transition duration-300 rounded box-border py-1.5 h-[26px]',
              isAllOption(field)
                ? 'bg-gradient-to-tr-47 style2 text-white style2 '
                : 'text-white/50 border border-[#ECECED14] h-[24px] bg-[#ECECED0A]',
            )}
            onClick={() => clear()}
          >
            {t('constant.all')}
          </Button>
          {options.map((option, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              className={clsx(
                'snap-start flex-1 min-w-[70px] text-[0.75rem] leading-[0.75rem] transition duration-300 rounded box-border py-1.5 h-[26px]',
                isOption(option, field)
                  ? 'bg-gradient-to-tr-47 style2 text-white style2'
                  : 'text-white/50 border border-[#ECECED14] h-[24px] bg-[#ECECED0A]',
              )}
              onClick={() => selectOption(option)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <CustomizedSelector
        minimumLabel={minimumLabel}
        maximumLabel={maximumLabel}
        unit={unit}
        min={field?.isCustom ? field.min : undefined}
        max={field?.isCustom ? field.max : undefined}
        onChange={(item: RangeItem) => controller.field.onChange(item)}
        onCleared={onCleared}
      />
    </div>
  )
}
