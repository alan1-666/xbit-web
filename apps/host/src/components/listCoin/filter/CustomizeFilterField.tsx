import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@components/ui/drawer.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { ChangeEvent, MouseEvent, useMemo, useState } from 'react'
import { Button } from '@components/ui/button.tsx'
import { Control, FieldPath, useWatch } from 'react-hook-form'
import { FilterFormData } from '@components/listCoin/filter/FilterField.tsx'
import { IconX } from '@components/icon'
import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'

export interface CustomizeFilterFieldProps {
  fieldKey: FieldPath<FilterFormData>
  title: string
  minimumLabel: string
  maximumLabel: string
  unit: string
  disabled?: boolean
  control: Control<FilterFormData>
  onApply: (min?: number, max?: number) => void
  onClear: () => void
  formatter?: (value: number, unit: string) => string
  maximumLimit?: number
  minimumLimit?: number
}

export default function CustomizeFilterField(props: CustomizeFilterFieldProps) {
  const {
    fieldKey,
    title,
    maximumLabel,
    minimumLabel,
    unit,
    onApply,
    control,
    onClear,
    disabled = false,
    formatter = (value, unit) => `${value}${unit}`,
    maximumLimit,
    minimumLimit,
  } = props
  const [open, setOpen] = useState(false)
  const [min, setMin] = useState<number>()
  const [max, setMax] = useState<number>()
  const { t } = useTranslation()

  const enableApplyButton = useMemo(() => {
    if (!min && !max) return false
    return (min ?? 0) <= (max ?? Number.MAX_SAFE_INTEGER)
  }, [min, max])

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setMin(newValue ? +newValue : undefined)
  }

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setMax(newValue ? +newValue : undefined)
  }

  const handleOnClose = () => {
    setMin(undefined)
    setMax(undefined)
  }

  const handleApply = () => {
    onApply(min, max)
    setMin(undefined)
    setMax(undefined)
    setOpen(false)
  }

  const handleClear = (event: MouseEvent) => {
    event.stopPropagation()
    onClear()
    setMin(undefined)
    setMax(undefined)
  }

  const fieldData = useWatch({ control, name: fieldKey })

  const customizedValueDisplay = useMemo(() => {
    if (!fieldData) return ''
    const { min, max } = fieldData.data
    if (min && !max) return `>${formatter(min, unit)}`
    if (!min && max) return `<${formatter(max, unit)}`
    return `${formatter(min, unit)}～${formatter(max, unit)}`
  }, [fieldData])

  const errorMessage = useMemo(() => {
    if (min !== undefined && max !== undefined && min > max) return t('filter.minMaxError')
    if (maximumLimit && max !== undefined && max > maximumLimit) {
      // TODO: Add i18n support to this message
    }
    if (minimumLimit && max !== undefined && max < minimumLimit) {
      // TODO: Add i18n support to this message
    }
    return ''
  }, [min, max])

  return (
    <Drawer open={open} onOpenChange={setOpen} onClose={handleOnClose}>
      <DrawerTrigger className={cn(disabled && 'invisible cursor-none')}>
        {fieldData?.label === 'customized' ? (
          <div
            className="flex items-center gap-1.5 rounded-full pl-2 pr-2.5 bg-[#ECECED14] border border-[#ECECED1F] text-[calc(11rem/16)] py-1"
            onClick={handleClear}
          >
            {customizedValueDisplay} <IconX />
          </div>
        ) : (
          <span className="text-[0.75rem] text-[#FFFFFFB2]">{t('filter.customize')}</span>
        )}
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-3 px-3.5">
          <div>
            <label htmlFor="minimum" className="text-[0.75rem] text-[#FFFFFFCC] block mb-2">
              {minimumLabel}
            </label>
            <div className="w-full flex bg-[#ECECED14] rounded-[6px] items-center px-3.5">
              <input
                className="flex-1 w-full h-10 text-[0.875rem] focus:ring-0 focus:outline-0 no-spin-button"
                placeholder={t('filter.minimum')}
                value={min}
                onChange={handleMinChange}
                type="number"
                min={0}
              />
              <span className="text-[#FFFFFFB3]">{unit}</span>
            </div>
          </div>
          <div>
            <label htmlFor="maximum" className="text-[0.75rem] text-[#FFFFFFCC] block mb-2">
              {maximumLabel}
            </label>
            <div className="w-full flex bg-[#ECECED14] rounded-[6px] items-center px-3.5">
              <input
                className="flex-1 w-full h-10 text-[0.875rem] focus:ring-0 focus:outline-0 no-spin-button"
                placeholder={t('filter.maximum')}
                value={max}
                type="number"
                onChange={handleMaxChange}
              />
              <span className="text-[#FFFFFFB3]">{unit}</span>
            </div>
          </div>
        </div>
        <div className="text-[#FF353C] px-3.5 text-[0.75rem] mt-1">{errorMessage}</div>
        <div className="px-3 py-4 w-full flex gap-2 mt-8 border-t border-t-[#ECECED0A]">
          <Button variant="borderGradient" className="flex-1 rounded-full p-4 h-11" onClick={() => setOpen(false)}>
            {t('chart.buttons.cancel')}
          </Button>
          <Button
            variant="gradient"
            className="flex-1 rounded-full h-11 text-[#141414] p-4"
            disabled={!enableApplyButton}
            onClick={handleApply}
          >
            {t('chart.buttons.confirm')}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
