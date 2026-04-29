import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { FilterFormData } from '@/components/discover/filter/FilterFormData'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@components/ui/sheet.tsx'
import { FilterForm } from '@pages/meme/discover/desktop/components/FilterForm.tsx'
import { cn } from '@/lib/utils.ts'
import { IconFilter2 } from '@components/icon/stroke/IconFilter2.tsx'

export interface FilterButtonProps {
  currentFilter: FilterFormData
  onResetAll: () => void
  onFiltersChanged: (filters: FilterFormData) => void
  className?: string
  hasFilters?: boolean
  isMemeFilter?: boolean
  allowSorting?: boolean
}

export const FilterButton = (props: FilterButtonProps) => {
  const { currentFilter, onResetAll, onFiltersChanged, className, hasFilters, isMemeFilter, allowSorting } = props
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const handleOnReset = () => {
    onResetAll()
    // setOpen(false)
  }

  const handleOnApply = (formData: FilterFormData) => {
    setOpen(false)
    onFiltersChanged(formData)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="min-h-6">
        <div
          role="button"
          aria-label="Open Filter"
          className={cn(
            'flex items-center gap-1 text-[calc(12rem/16)] py-1 rounded-full cursor-pointer relative pr-1',
            className,
          )}
        >
          <IconFilter2 className="size-5 text-[#908E98]" />
          {hasFilters ? <div className="size-1.5 bg-impartal absolute top-0 right-0 rounded-full" /> : null}
        </div>
      </SheetTrigger>
      <SheetContent className="bg-[#232329] p-0 pt-3 flex flex-col min-w-[420px]">
        <SheetHeader className="py-2 px-3 flex flex-row w-full items-center justify-between leading-[1]">
          <SheetTitle className="app-font-medium text-[calc(1rem*(18/16))] text-white">
            {t('listCoin.filters.title')}
          </SheetTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </SheetHeader>
        <div className="flex-1 h-full flex flex-col overflow-y-hidden">
          <FilterForm
            onApply={handleOnApply}
            onResetAll={handleOnReset}
            currentFilter={currentFilter}
            isMemeFilter={isMemeFilter}
            allowSorting={allowSorting}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
