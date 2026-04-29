import { Control, useWatch } from 'react-hook-form'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { useContext, useEffect, useMemo, useState } from 'react'
import { DiscoverPageContext } from '@components/discover/DiscoverPageContext.tsx'
import { LifecycleStates } from '@/@generated/gql/graphql-core'
import { cn } from '@/lib/utils.ts'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const getFilterCriteriaCount = (filter: FilterFormData) => {
  const filterCriteria = [
    filter?.holders,
    filter?.liquidityPool,
    filter?.marketCap,
    filter?.progress,
    filter?.transactions,
    filter?.volumes,
  ]

  return filterCriteria.filter((criteria) => criteria !== undefined && criteria !== null).length
}

export interface LifecycleStateSelectorProps {
  control: Control<FilterFormData>
}

export const LifecycleStateSelector = (props: LifecycleStateSelectorProps) => {
  const { control } = props
  const { memeSubTab, filters, onMemeSubTabChanged } = useContext(DiscoverPageContext)
  const values = useWatch({ control }) as FilterFormData
  const [currentLifecycleState, setCurrentLifecycleState] = useState(memeSubTab)
  const { t } = useTranslation()

  const lifecycleStates = [
    { value: LifecycleStates.NewCreation, label: t('listCoin.filters.newListing') },
    { value: LifecycleStates.Completing, label: t('listCoin.filters.almostFull') },
    // { value: LifecycleStates.Soaring, label: t('listCoin.filters.pumping') },
    { value: LifecycleStates.Completed, label: t('listCoin.filters.launched') },
  ]

  const counts = useMemo(() => {
    const currentCount = getFilterCriteriaCount(values)
    return {
      [LifecycleStates.NewCreation]: getFilterCriteriaCount(filters['TAB_MEME_' + LifecycleStates.NewCreation]),
      [LifecycleStates.Completing]: getFilterCriteriaCount(filters['TAB_MEME_' + LifecycleStates.Completing]),
      [LifecycleStates.Soaring]: getFilterCriteriaCount(filters['TAB_MEME_' + LifecycleStates.Soaring]),
      [LifecycleStates.Completed]: getFilterCriteriaCount(filters['TAB_MEME_' + LifecycleStates.Completed]),
      [currentLifecycleState]: currentCount,
    }
  }, [values, currentLifecycleState])

  useEffect(() => {
    setCurrentLifecycleState(memeSubTab)
  }, [memeSubTab])

  const handleLifecycleStateChange = (state: LifecycleStates) => {
    setCurrentLifecycleState(state)
    onMemeSubTabChanged(state)
  }

  return (
    <div className="flex items-center gap-6 overflow-x-auto pt-4 justify-between no-scrollbar border-b pb-4">
      {lifecycleStates.map((item) => (
        <div
          key={item.value}
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => handleLifecycleStateChange(item.value)}
        >
          <div className={cn(
            'size-4 border border-[#FFFFFF42] rounded-full flex items-center justify-center',
            currentLifecycleState === item.value ? 'border-[#6A2AE0]' : 'bg-transparent',
          )}>
            {currentLifecycleState === item.value && (
              <motion.div
                className="bg-[#6A2AE0] size-2 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.1, ease: 'easeInOut', delay: 0 }}
              />
            )}
          </div>
          <div
            className={cn(
              ' text-[calc(13rem/16)] leading-[calc(13rem/16)] hover:text-white break-keep',
              currentLifecycleState === item.value ? 'text-white' : 'text-[#FFFFFFB2]',
            )}
          >
            {item.label}
          </div>
          <div
            className={cn(
              'size-4 bg-[#00FFB4] rounded-full transition text-[calc(12rem/16)] leading-3 flex items-center justify-center text-black font-medium',
              counts[item.value] > 0 ? 'visible scale-100' : 'invisible scale-50',
            )}
          >
            {counts[item.value]}
          </div>
        </div>
      ))}
    </div>
  )
}
