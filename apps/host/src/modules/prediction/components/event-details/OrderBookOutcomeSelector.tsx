import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export const OrderBookOutcomeSelector = () => {
  const { selectedMarket, selectedOutcome, dispatch } = useEventDetailsPageContext()

  const { t } = useTranslation()

  const handleOutcomeClick = (outcome: string) => {
    dispatch(eventDetailsPageActions.setSelectedOutcome(outcome as 'yes' | 'no'))
  }

  const selectedOutcomeIndex = selectedOutcome === 'yes' ? 0 : 1

  if (!selectedMarket?.outcomes || selectedMarket.outcomes.length === 0) {
    return null
  }

  return (
    <div className="flex items-baseline gap-3 xl:gap-4 px-2.5 text-sm py-2">
      {selectedMarket.outcomes.map((outcome, index) => {
        const isSelected = index === selectedOutcomeIndex
        return (
          <button
            key={outcome}
            onClick={() => handleOutcomeClick(index === 0 ? 'yes' : 'no')}
            className={cn(
              'transition-opacity duration-200',
              isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-75',
            )}
          >
            {t('prediction.orderBook.tradeOutcome', { outcome })}
          </button>
        )
      })}
    </div>
  )
}
