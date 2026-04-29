import { Control, FieldPath, useController, useWatch } from 'react-hook-form'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { cn } from '@/lib/utils.ts'
import { IconSortDown1, IconSortUp1 } from '@components/icon'
import { useTranslation } from 'react-i18next'

export interface SortableHeaderProps {
  name: FieldPath<FilterFormData>
  title: string
  control: Control<FilterFormData>
  allowSort: boolean
}
export const SortableHeader = (props: SortableHeaderProps) => {
  const { name, title, control, allowSort } = props
  const { t } = useTranslation()

  const sort = useWatch({ control, name: 'sortBy' })
  const sortController = useController({ control, name: 'sortBy' })

  const handleSortAsc = () => {
    if (!allowSort) return
    if (!sort || sort.type !== 'asc' || sort.field !== name) {
      sortController.field.onChange({ field: name, type: 'asc' })
    } else {
      sortController.field.onChange(undefined)
    }
  }

  const handleSortDesc = () => {
    if (!allowSort) return
    if (!sort || sort.type !== 'desc' || sort.field !== name) {
      sortController.field.onChange({ field: name, type: 'desc' })
    } else {
      sortController.field.onChange(undefined)
    }
  }

  return (
    <div className="flex items-center justify-between mb-3.5">
      <div className="w-full flex items-center justify-between">
        <div className="text-[calc(1rem*(13/16))] text-[#FFFFFFCC]">{title}</div>
        {allowSort && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 cursor-pointer" onClick={handleSortAsc}>
              <span
                className={cn(
                  'font-normal text-[12px]',
                  name === sort?.field && sort?.type === 'asc' ? 'text-[#00FFB4]' : 'text-white/50',
                )}
              >
                {t('listCoin.filters.ascending')}
              </span>
              <IconSortUp1 currentColor={sort?.field === name && sort?.type === 'asc' ? '#00FFB4' : '#FFFFFF7A'} />
            </div>
            <div className="flex items-center gap-0.5 cursor-pointer" onClick={handleSortDesc}>
              <span
                className={cn(
                  'font-normal text-[12px]',
                  name === sort?.field && sort?.type === 'desc' ? 'text-[#00FFB4]' : 'text-white/50',
                )}
              >
                {t('listCoin.filters.descending')}
              </span>
              <IconSortDown1 currentColor={sort?.field === name && sort?.type === 'desc' ? '#00FFB4' : '#FFFFFF7A'} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
