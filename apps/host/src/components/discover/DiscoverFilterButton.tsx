import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'
import { IconFilter } from '@components/icon/stroke/IconFilter.tsx'
import { FilterForm } from '@components/discover/filter/FilterForm.tsx'
import { DiscoverPageContext } from '@components/discover/DiscoverPageContext.tsx'
import { FilterFormData, getDefaultFilters } from '@components/discover/filter/FilterFormData.ts'
import { TAB_MEME } from '@components/discover/DiscoverTabs.tsx'
import { cn } from '@/lib/utils'

export interface DiscoverFilterButtonProps {
  className?: string
  hasFilters?: boolean
}

export const DiscoverFilterButton = (props: DiscoverFilterButtonProps) => {
  const { className, hasFilters } = props
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { currentTab, onFiltersChanged, memeSubTab } = useContext(DiscoverPageContext)

  const handleOnOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
    }
  }

  const handleOnReset = () => {
    if (currentTab === TAB_MEME) {
      onFiltersChanged(`TAB_MEME_${memeSubTab}`, getDefaultFilters(TAB_MEME))
    } else {
      onFiltersChanged(currentTab, getDefaultFilters(currentTab))
    }
  }

  const handleOnApply = (formData: FilterFormData) => {
    setOpen(false)
    if (currentTab !== TAB_MEME) {
      onFiltersChanged(currentTab, formData)
    } else {
      // For meme tab, we need to use the sub-tab state
      onFiltersChanged(`TAB_MEME_${memeSubTab}`, formData)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOnOpenChange} repositionInputs={false}>
      <DrawerTrigger asChild className="min-h-6">
        <div
          className={cn(
            'cursor-pointer',
            className,
          )}
        >
          <IconFilter />
          {hasFilters ? <div className="mt-1 -mr-1 size-1.5 bg-impartal absolute top-0 right-0 rounded-full" /> : null}
          {/* <span className="break-keep">{t('listCoin.filter')}</span> */}
        </div>
      </DrawerTrigger>
      <DrawerContent className="max-w-[786px] bg-[#232329] mx-auto">
        <DrawerHeader className="py-2 px-[12px] flex w-full items-center justify-between leading-[1]">
          <DrawerTitle className="app-font-medium text-[calc(1rem*(18/16))] text-white">
            {t('listCoin.filters.title')}
          </DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="max-h-[75vh] flex flex-col">
          <FilterForm onApply={handleOnApply} onResetAll={handleOnReset} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
