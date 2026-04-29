import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@components/ui/drawer.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import TimePeriodFilter from '@components/listCoin/filter/TimePeriodFilter.tsx'
import { Control, FieldPath, useForm, useWatch } from 'react-hook-form'
import FilterField, { FilterFormData, SortType } from '@components/listCoin/filter/FilterField.tsx'
import TransactionsFilter from '@components/listCoin/filter/TransactionsFilter.tsx'
import { Field } from './types.ts'
import VolumesFilter from '@components/listCoin/filter/VolumesFilter.tsx'
import ProgressFilter from '@components/listCoin/filter/ProgressFilter.tsx'
import { useTranslation } from 'react-i18next'
import { fShortenNumber } from '@/lib/number.ts'
import { Button } from '@components/ui/button.tsx'
import { LaunchPlatformOptions } from '@/lib/constant.ts'

const getFields = (
  t: any,
  options: {
    ignoreDexes: string[]
  },
): Field[] => [
  {
    key: 'creationTime',
    title: t('filter.creationTime'),
    minimumLabel: t('filter.minTime'),
    maximumLabel: t('filter.maxTime'),
    unit: 'm',
    options: [
      { data: { min: 0, max: 10 }, label: '<10m' },
      { data: { min: 0, max: 30 }, label: '<30m' },
      { data: { min: 0, max: 60 }, label: '<1h' },
      { data: { min: 0, max: 180 }, label: '<3h' },
      { data: { min: 0, max: 360 }, label: '<6h' },
      { data: { min: 0, max: 720 }, label: '<12h' },
      { data: { min: 0, max: 1440 }, label: '<24h' },
    ],
  },
  {
    key: 'marketCap',
    title: t('filter.marketCap'),
    minimumLabel: t('filter.minMarketCap'),
    maximumLabel: t('filter.maxMarketCap'),
    unit: '$',
    options: [
      { data: { min: 50000, max: NaN }, label: '>$50K' },
      { data: { min: 100000, max: NaN }, label: '>$100K' },
      { data: { min: 500000, max: NaN }, label: '>$500K' },
      { data: { min: 1000000, max: NaN }, label: '>$1M' },
    ],
    formatter: (value: number) => `$${fShortenNumber(value)}`,
  },
  {
    key: 'transactions',
    title: t('filter.1hTransactions'),
    minimumLabel: t('filter.minTransactions'),
    maximumLabel: t('filter.maxTransactions'),
    unit: t('filter.transactions'),
    options: [
      { data: { min: 200, max: NaN }, label: '>200' },
      { data: { min: 500, max: NaN }, label: '>500' },
      { data: { min: 1000, max: NaN }, label: '>1000' },
      { data: { min: 2000, max: NaN }, label: '>2000' },
    ],
    formatter: (value: number, unit) => `${fShortenNumber(value)} ${unit}`,
  },
  {
    key: 'volumes',
    title: t('filter.1hVolume'),
    minimumLabel: t('filter.minVolume'),
    maximumLabel: t('filter.maxVolume'),
    unit: '$',
    options: [
      { data: { min: 50000, max: NaN }, label: '>$50K' },
      { data: { min: 100000, max: NaN }, label: '>$100K' },
      { data: { min: 200000, max: NaN }, label: '>$200K' },
    ],
    formatter: (value: number) => `$${fShortenNumber(value)}`,
  },
  {
    key: 'liquidityPool',
    title: t('orderBook.pool'),
    minimumLabel: t('filter.minPool'),
    maximumLabel: t('filter.maxPool'),
    unit: '$',
    options: [
      { data: { min: 10000, max: NaN }, label: '>$10K' },
      { data: { min: 100000, max: NaN }, label: '>$100K' },
      { data: { min: 300000, max: NaN }, label: '>$300K' },
      { data: { min: 500000, max: NaN }, label: '>$500K' },
    ],
    formatter: (value: number) => `$${fShortenNumber(value)}`,
  },
  {
    key: 'holders',
    title: t('detail.tabs.holders'),
    minimumLabel: t('filter.minHolders'),
    maximumLabel: t('filter.maxHolders'),
    unit: '',
    options: [
      { data: { min: 100, max: NaN }, label: '>100' },
      { data: { min: 500, max: NaN }, label: '>500' },
      { data: { min: 1000, max: NaN }, label: '>1000' },
      { data: { min: 2000, max: NaN }, label: '>2000' },
    ],
    formatter: (value: number, unit) => `${fShortenNumber(value)}${unit}`,
  },
  {
    key: 'progress',
    title: t('filter.internalProgress'),
    minimumLabel: t('filter.minProgress'),
    maximumLabel: t('filter.maxProgress'),
    unit: '%',
    options: [
      { data: { min: 50, max: NaN }, label: '>50%' },
      { data: { min: 70, max: NaN }, label: '>70%' },
      { data: { min: 90, max: NaN }, label: '>90%' },
    ],
    formatter: (value: number, unit) => `${fShortenNumber(value)}${unit}`,
  },
  {
    key: 'dex',
    title: 'DEX',
    customize: false,
    sortable: false,
    options: LaunchPlatformOptions.map((item) => ({
      data: item.value,
      label: item.label,
    })).filter((option) => ![...options.ignoreDexes, 'All'].includes(option.data)),
    minimumLabel: '',
    maximumLabel: '',
    unit: '',
  },
]

function renderField(item: Field, control: Control<FilterFormData>) {
  if (item.key === 'transactions') {
    return <TransactionsFilter key={item.key} control={control} options={item.options} formatter={item.formatter} />
  }
  if (item.key === 'volumes') {
    return <VolumesFilter key={item.key} control={control} field={item} />
  }
  if (item.key === 'progress') {
    return <ProgressFilter key={item.key} control={control} field={item} />
  }
  return (
    <FilterField
      key={item.key}
      fieldKey={item.key as FieldPath<FilterFormData>}
      title={item.title}
      control={control}
      options={item.options}
      customized={item.customize}
      sortable={item.sortable}
      minimumLabel={item.minimumLabel ?? ''}
      maximumLabel={item.maximumLabel ?? ''}
      unit={item.unit ?? ''}
      formatter={item.formatter}
    />
  )
}

export interface FilterButtonProps {
  defaultDex?: string
  defaultDexLabel?: string
  defaultSortLabel: string
  defaultTimeRange?: { value: string; unit: string }
  onFiltered?: (filter: FilterFormData) => void
  ignoreDexes?: string[]
  defaultValues?: FilterFormData
}

export default function FilterButton(props: FilterButtonProps) {
  const {
    defaultSortLabel,
    onFiltered,
    defaultDex,
    defaultDexLabel,
    defaultTimeRange,
    ignoreDexes = [],
    defaultValues = {
      period: { value: defaultTimeRange?.value ?? '1', unit: defaultTimeRange?.unit ?? 'h' },
      dex: { data: defaultDex, label: defaultDex },
    },
  } = props
  const [initValues] = useState(defaultValues)
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const fields = getFields(t, { ignoreDexes })

  const { control, reset, setValue, resetField, getValues } = useForm<FilterFormData>({ defaultValues })

  useEffect(() => {
    setValue('dex', defaultDex ? { data: defaultDex, label: defaultDexLabel ?? '' } : undefined)
  }, [defaultDex])

  useEffect(() => {
    setValue('period', { value: defaultTimeRange?.value ?? '1', unit: defaultTimeRange?.unit ?? 'h' })
  }, [defaultTimeRange])

  const handleReset = () => {
    resetField('sort')
  }

  const handleResetAll = () => {
    const newValues = Object.assign({}, initValues) as FilterFormData
    Object.keys(values).forEach((key) => {
      newValues[key] = null
    })
    reset({
      ...newValues,
      ...initValues,
    })
  }

  const handleApply = () => {
    setOpen(false)
    onFiltered?.(getValues() as FilterFormData)
  }

  const sortBy = useWatch({ control, name: 'sort' })
  const period = useWatch({ control, name: 'period' })

  const getSortByLabel = (field: string, direction: SortType) => {
    const key = `listCoin.filters.sortByField.${field}${direction === 'asc' ? 'Asc' : 'Desc'}`
    return t(key, { time: `${period.value}${period.unit}` })
  }

  const handleOnOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      reset(defaultValues)
    }
  }

  useEffect(() => {
    if (defaultDex) {
      setValue('dex', {
        data: defaultDex,
        label: LaunchPlatformOptions.find((option) => option.value === defaultDex)?.label ?? '',
      })
      onFiltered?.(getValues() as FilterFormData)
    }
  }, [defaultDex])

  const values = useWatch({ control })

  return (
    <Drawer open={open} onOpenChange={handleOnOpenChange} repositionInputs={true}>
      <DrawerTrigger asChild className="min-h-6">
        <div className="flex items-center cursor-pointer justify-center p-[4px 7px] w-[30px] min-w-[30px] rounded-[4px] bg-[#ECECED14] h-full transition-all duration-100 hover:scale-[1.1]">
          <img src="/images/icons/icon-filter.svg" className="w-[11px] h-[12.37px]" alt="" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto max-h-[80vh]">
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DialogTitle>
            {t('listCoin.filters.title')}
            <span className="text-[0.875rem] text-[#FFFFFFB2]">
              {sortBy ? (
                <>
                  ({t('listCoin.filters.sortBy')}&#58; {getSortByLabel(sortBy.field, sortBy.type)}){' '}
                  <button className="text-[#00FFF6]" onClick={handleReset}>
                    {t('listCoin.filters.resetDefault')}
                  </button>
                </>
              ) : (
                <> ({defaultSortLabel})</>
              )}
            </span>
          </DialogTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3 overflow-y-auto no-scrollbar">
          <TimePeriodFilter control={control} />
          {fields.map((item) => renderField(item, control))}
        </div>
        <div className="h-20 w-full px-3 flex gap-4 items-center">
          <Button variant="borderGradient" className="rounded-full flex-1 h-11" onClick={handleResetAll}>
            {t('listCoin.filters.reset')}
          </Button>
          <Button variant="gradient" className="rounded-full flex-1 h-11 text-black" onClick={handleApply}>
            {t('listCoin.filters.apply')}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
