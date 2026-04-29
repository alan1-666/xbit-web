import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { Accordion, AccordionItem, AccordionTrigger } from '@components/ui/accordion.tsx'
import { AccordionContent } from '@radix-ui/react-accordion'
import { OrderBook } from '@/modules/prediction/components/shared/OrderBook.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { UserPositionsSection } from '@/modules/prediction/components/event-details/UserPositionsSection.tsx'
import { OpenOrders } from '@/modules/prediction/components/event-details/OpenOrders.tsx'
import { UserActivities } from '@/modules/prediction/components/event-details/UserActivities.tsx'
import { useTranslation } from 'react-i18next'
import { OrderBookOutcomeSelector } from '@/modules/prediction/components/event-details/OrderBookOutcomeSelector.tsx'

export interface SingleMarketSectionProps {
  market: MarketModel | null
}

export const SingleMarketSection = (props: SingleMarketSectionProps) => {
  const { market } = props
  const { selectedOutcome } = useEventDetailsPageContext()
  const { t } = useTranslation()
  const clobTokenId = useMemo(() => {
    if (selectedOutcome === 'yes') return market?.clobTokenIds?.[0]
    if (selectedOutcome === 'no') return market?.clobTokenIds?.[1]
    return undefined
  }, [selectedOutcome, market?.clobTokenIds])

  return (
    <div className="space-y-4">
      <UserPositionsSection />
      <OpenOrders marketId={market?.id} conditionId={market?.conditionId || ''} />
      <Accordion type="single" collapsible className="border-none" defaultValue="single-market-item">
        <AccordionItem value="single-market-item" className="border-none">
          <AccordionTrigger
            className="w-full border rounded-[8px] px-3 data-[state=open]:rounded-b-none flex justify-between"
            icon={<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-250" />}
          >
            {t('prediction.common.orderBook')}
          </AccordionTrigger>
          <AccordionContent className="border border-t-0 rounded-b">
            {market && (
              <>
                <OrderBookOutcomeSelector />
                <OrderBook
                  marketId={market.id}
                  tokenId={clobTokenId || ''}
                  minTickSize={market.orderPriceMinTickSize ? +market.orderPriceMinTickSize : 0.01}
                  conditionId={market.conditionId ?? undefined}
                />
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <UserActivities conditionId={market?.conditionId ?? undefined} />
    </div>
  )
}
