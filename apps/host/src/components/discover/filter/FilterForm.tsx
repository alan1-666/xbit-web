import { Button } from '@components/ui/button.tsx'
import { DexSelector } from '@components/discover/filter/DexSelector.tsx'
import { useContext, useEffect, useMemo } from 'react'
import { BscDexOptions, LAUNCHPADS, LAUNCHPADS_BY_CHAINS, LaunchPlatformOptions, MonDexOptions } from '@/lib/constant.ts'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch } from 'react-hook-form'
import { FilterFormData, filterSchema } from './FilterFormData'
import { TimeframeSelector } from '@components/discover/filter/TimeframeSelector.tsx'
import { MarketCapSelector } from '@components/discover/filter/MarketCapSelector.tsx'
import { HoldersSelector } from '@components/discover/filter/HoldersSelector.tsx'
import { LiquidityPoolSelector } from '@components/discover/filter/LiquidityPoolSelector.tsx'
import { TransactionsSelector } from '@components/discover/filter/TransactionsSelector.tsx'
import { VolumeSelector } from '@components/discover/filter/VolumeSelector.tsx'
import { ProgressSelector } from '@components/discover/filter/ProgressSelector.tsx'
import { DiscoverPageContext } from '@components/discover/DiscoverPageContext.tsx'
import { TAB_MEME } from '@components/discover/DiscoverTabs.tsx'
import { LifecycleStateSelector } from '@components/discover/filter/LifecycleStateSelector.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { ChainIds } from '@/types/enums.ts'

const useDexOptions = () => {
  const { currentTab } = useContext(DiscoverPageContext)
  const selectedChain = useActiveChain()
  const { t } = useTranslation()
  return useMemo(() => {
    const options = LaunchPlatformOptions.map((option) => ({
      ...option,
      label: option.value === 'All' ? t('constant.all') : (option?.alias ?? option.label),
    }))

    if (currentTab === TAB_MEME) {
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
    }

    if (selectedChain === TYPE_CHAIN.BSC) {
      return BscDexOptions.map((option) => ({
        ...option,
        label: option.value === 'All' ? t('constant.all') : option.label,
      }))
    }

    if (selectedChain === TYPE_CHAIN.MON) {
      return MonDexOptions.map((option) => ({
        ...option,
        label: option.value === 'All' ? t('constant.all') : option.label,
      }))
    }

    if (selectedChain === TYPE_CHAIN.ETH) {
      // Filter out non-Ethereum DEX options
      return []
    }

    console.log("options", options)
    return options
  }, [selectedChain])
}

export interface FilterFormProps {
  onResetAll: () => void
  onApply: (data: FilterFormData) => void
}

export const FilterForm = (props: FilterFormProps) => {
  const { onResetAll, onApply } = props
  const dexOptions = useDexOptions()

  const { filters, currentTab, memeSubTab } = useContext(DiscoverPageContext)

  const { control, reset, getValues } = useForm<FilterFormData>({
    defaultValues: {
      timeframe: '24h',
    },
  })
  const { t } = useTranslation()
  const formData = useWatch({ control })

  useEffect(() => {
    if (currentTab === TAB_MEME) {
      const memeTabKey = `TAB_MEME_${memeSubTab}`
      const filter = filters[memeTabKey] || filters[TAB_MEME]
      if (filter) {
        reset({ ...filter })
      }
    } else {
      const filter = filters[currentTab]
      if (filter) {
        reset({ ...filter })
      }
    }
  }, [currentTab, filters, memeSubTab])

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
      <div className="px-3 overflow-y-auto no-scrollbar space-y-6 pb-6 mt-3 max-h-[80vh] flex-1">
        <DexSelector dexOptions={dexOptions} control={control} />
        {currentTab === TAB_MEME && <LifecycleStateSelector control={control} />}
        <TimeframeSelector control={control} />
        <MarketCapSelector control={control} />
        <HoldersSelector control={control} />
        <LiquidityPoolSelector control={control} />
        <TransactionsSelector control={control} />
        <VolumeSelector control={control} />
        {currentTab === TAB_MEME && <ProgressSelector control={control} />}
      </div>
      <div className="h-25 w-full px-3 flex gap-4 items-center">
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
