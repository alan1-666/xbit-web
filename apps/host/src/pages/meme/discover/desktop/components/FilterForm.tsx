import { Button } from '@components/ui/button.tsx'
import { DexSelector } from '@components/discover/filter/DexSelector.tsx'
import { useEffect, useMemo } from 'react'
import {
  BscDexOptions,
  LAUNCHPADS,
  LAUNCHPADS_BY_CHAINS,
  LaunchPlatformOptions,
  MonDexOptions,
} from '@/lib/constant.ts'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch } from 'react-hook-form'
import { TimeframeSelector } from '@components/discover/filter/TimeframeSelector.tsx'
import { MarketCapSelector } from '@components/discover/filter/MarketCapSelector.tsx'
import { HoldersSelector } from '@components/discover/filter/HoldersSelector.tsx'
import { LiquidityPoolSelector } from '@components/discover/filter/LiquidityPoolSelector.tsx'
import { TransactionsSelector } from '@components/discover/filter/TransactionsSelector.tsx'
import { VolumeSelector } from '@components/discover/filter/VolumeSelector.tsx'
import { ProgressSelector } from '@components/discover/filter/ProgressSelector.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { FilterFormData, filterSchema } from '@components/discover/filter/FilterFormData.ts'
import { ChainIds } from '@/types/enums.ts'

const useDexOptions = (isMemeFilter: boolean) => {
  const selectedChain = useActiveChain()
  const { t } = useTranslation()
  return useMemo(() => {
    const options = LaunchPlatformOptions.map((option) => ({
      ...option,
      label: option.value === 'All' ? t('constant.all') : option.label,
    }))

    if (selectedChain === TYPE_CHAIN.BSC) {
      return BscDexOptions.map((option) => ({
        ...option,
        label: option.value === 'All' ? t('constant.all') : option.label,
      })).filter((option) => LAUNCHPADS_BY_CHAINS[ChainIds.Bsc].includes(option.value))
    }

    if (selectedChain === TYPE_CHAIN.MON) {
      return MonDexOptions.map((option) => ({
        ...option,
        label: option.value === 'All' ? t('constant.all') : option.label,
      })).filter((option) => LAUNCHPADS_BY_CHAINS[ChainIds.Mon].includes(option.value))
    }

    return options.filter((option) => LAUNCHPADS.includes(option.value))

    // if (isMemeFilter) {
    //   if (selectedChain === TYPE_CHAIN.BSC) {
    //     return BscDexOptions.map((option) => ({
    //       ...option,
    //       label: option.value === 'All' ? t('constant.all') : option.label,
    //     })).filter((option) => LAUNCHPADS_BY_CHAINS[ChainIds.Bsc].includes(option.value))
    //   }

    //   if (selectedChain === TYPE_CHAIN.MON) {
    //     return MonDexOptions.map((option) => ({
    //       ...option,
    //       label: option.value === 'All' ? t('constant.all') : option.label,
    //     })).filter((option) => LAUNCHPADS_BY_CHAINS[ChainIds.Mon].includes(option.value))
    //   }

    //   return options.filter((option) => LAUNCHPADS.includes(option.value))
    // }

    // if (selectedChain === TYPE_CHAIN.ETH) {
    //   // Filter out non-Ethereum DEX options
    //   return []
    // }

    // return options
  }, [selectedChain])
}

export interface FilterFormProps {
  onResetAll: () => void
  onApply: (data: FilterFormData) => void
  currentFilter: FilterFormData
  isMemeFilter?: boolean
  allowSorting?: boolean
}

export const FilterForm = (props: FilterFormProps) => {
  const { onResetAll, onApply, currentFilter, isMemeFilter = false, allowSorting = true } = props
  const dexOptions = useDexOptions(isMemeFilter)

  const { control, reset, getValues } = useForm<FilterFormData>({
    defaultValues: {
      timeframe: '24h',
    },
  })
  const { t } = useTranslation()
  const formData = useWatch({ control })

  useEffect(() => {
    reset(currentFilter)
  }, [currentFilter])

  const handleResetAll = () => {
    onResetAll()
  }

  const handleApply = () => {
    onApply({ ...getValues() })
  }

  const isValid = useMemo(() => {
    try {
      filterSchema.parse(formData)
      return true
    } catch (e) {
      return false
    }
  }, [formData])

  return (
    <>
      <div className="px-3 overflow-y-auto no-scrollbar space-y-6 pb-6 mt-3 flex-1">
        <DexSelector dexOptions={dexOptions} control={control} />
        <TimeframeSelector control={control} />
        <MarketCapSelector control={control} allowSorting={allowSorting} />
        <HoldersSelector control={control} allowSorting={allowSorting} />
        <LiquidityPoolSelector control={control} allowSorting={allowSorting} />
        <TransactionsSelector control={control} allowSorting={allowSorting} />
        <VolumeSelector control={control} allowSorting={allowSorting} />
        {isMemeFilter && <ProgressSelector control={control} allowSorting={allowSorting} />}
      </div>
      <div className="w-full px-3 pb-6 pt-3 flex gap-4 items-center">
        <button
          className="rounded-full flex-1 h-11 flex items-center gap-2.5 text-[#FFFFFFB2]"
          onClick={handleResetAll}
        >
          <img src="/images/icons/reset.svg" className="w-5 h-5" alt="" />
          {t('listCoin.filters.reset')}
        </button>
        <Button
          variant="gradient"
          className="rounded-full flex-1 h-11 text-black"
          disabled={!isValid}
          onClick={handleApply}
        >
          {t('listCoin.filters.apply')}
        </Button>
      </div>
    </>
  )
}
