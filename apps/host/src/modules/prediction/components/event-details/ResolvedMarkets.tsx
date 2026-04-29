import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion.tsx'
import { ResolvedMarketItem } from '@/modules/prediction/components/event-details/ResolvedMarketItem.tsx'

export interface ResolvedMarketsProps {
  markets: MarketModel[]
}
export const ResolvedMarkets = (props: ResolvedMarketsProps) => {
  const { markets } = props
  if (markets.length === 0) return null
  return (
    <Accordion type="single" collapsible={true}>
      <AccordionItem value="resolved-markets">
        <AccordionTrigger>View resolved</AccordionTrigger>
        <AccordionContent>
          {markets.map((market) => (
            <ResolvedMarketItem key={market.id} market={market} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
