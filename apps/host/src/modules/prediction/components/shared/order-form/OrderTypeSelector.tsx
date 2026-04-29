import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@components/ui/drawer'
import { useFormContext, useWatch } from 'react-hook-form'
import { OrderFormData } from './OrderFormData.ts'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCallback, useContext, useState } from 'react'
import { OrderFormContext } from './OrderFormContext.ts'

const ORDER_TYPE_OPTIONS = [
  { value: 'limit', labelKey: 'prediction.orderForm.limit' },
  { value: 'market', labelKey: 'prediction.orderForm.market' },
] as const

const triggerClassName =
  'flex h-9 w-fit items-center justify-between gap-1 border-none font-medium text-sm text-[#C1C1C1] px-0 [&_svg]:stroke-white! [&_svg]:w-4! [&_svg]:opacity-100! [&_svg]:transition-transform [&_svg]:duration-200 [&[data-state=open]_svg]:rotate-180'

export const OrderTypeSelector = () => {
  const { t } = useTranslation()
  const { yesPrice, noPrice } = useContext(OrderFormContext)
  const { control, setValue } = useFormContext<OrderFormData>()
  const [orderType, outcome] = useWatch({ control, name: ['orderType', 'outcome'] })
  const { isMobile } = useResponsive()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleChange = useCallback(
    (value: 'limit' | 'market') => {
      setValue('orderType', value, { shouldValidate: true })
      if (outcome === 'yes') {
        setValue('data.price', yesPrice, { shouldValidate: true })
      } else {
        setValue('data.price', noPrice, { shouldValidate: true })
      }
    },
    [setValue, outcome, yesPrice, noPrice],
  )

  const currentOption = ORDER_TYPE_OPTIONS.find((o) => o.value === orderType)
  const currentLabel = currentOption ? t(currentOption.labelKey) : t('prediction.orderForm.orderTypePlaceholder')

  if (isMobile) {
    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className={cn(triggerClassName, 'cursor-pointer')}
            aria-label={t('prediction.orderForm.orderTypePlaceholder')}
            data-state={drawerOpen ? 'open' : 'closed'}
          >
            <span>{currentLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="bg-[#212127] border-[#2B2B33] max-w-[768px] mx-auto">
          <DrawerHeader className="flex justify-end">
            <button
              type="button"
              className="p-1 -m-1 rounded"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </DrawerHeader>
          <div className="px-4 pb-6 pt-2">
            <div className="space-y-2">
              {ORDER_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border-[0.5px] px-4 py-4 text-left text-sm font-normal transition-colors text-white',
                    orderType === opt.value
                      ? 'border-[#755AB3] bg-[#473B66] '
                      : 'border-transparent bg-[#2B2B33] hover:bg-[#333]',
                  )}
                  onClick={() => {
                    handleChange(opt.value as 'limit' | 'market')
                    setDrawerOpen(false)
                  }}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Select value={orderType} onValueChange={(v) => handleChange(v as 'limit' | 'market')}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={t('prediction.orderForm.orderTypePlaceholder')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="market">{t('prediction.orderForm.market')}</SelectItem>
        <SelectItem value="limit">{t('prediction.orderForm.limit')}</SelectItem>
      </SelectContent>
    </Select>
  )
}
