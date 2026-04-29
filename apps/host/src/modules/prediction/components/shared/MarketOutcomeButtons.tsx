import { Button } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import { useNavigate } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { useEventMarketsContext } from '@/modules/prediction/hooks/useEventMarketsContext.ts'
import { MarketModel } from '../../models/MarketModel'

export interface MarketOutcomeButtonsProps {
  onOutcomeClick: (outcome: string) => void
  isEventEnded?: boolean
  market: MarketModel
}

export const MarketOutcomeButtons = (props: MarketOutcomeButtonsProps) => {
  const { market, onOutcomeClick, isEventEnded } = props
  const { enableQuickBuy, eventSlug } = useEventMarketsContext()
  const navigate = useNavigate()

  const handleClick = (market: MarketModel, outcome: string) => {
    if (!enableQuickBuy && eventSlug) {
      navigate(NAVIGATIONS.prediction.eventDetails(eventSlug), {
        state: { market, outcome },
      })
    } else {
      onOutcomeClick(outcome)
    }
  }

  return (
    <>
      {market?.outcomes?.map((outcome: string, index: number) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className={cn(
            'h-6 w-10 px-0 text-xs font-semibold leading-tight hover:opacity-80 rounded-none hover:text-white',
            {
              'bg-[#04332b] text-[#00ce89] hover:bg-[#04332b] rounded-bl-[6.667px]': index === 0,
              'bg-[#38120b] text-[#EA3B4F] hover:bg-[#38120b] rounded-tr-[6.667px]': index === 1,
            },
          )}
          onClick={() => handleClick(market, outcome)}
          disabled={isEventEnded}
        >
          {outcome}
        </Button>
      ))}
    </>
  )
}
