import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { ResolvedMarketItem2 } from '@/modules/prediction/components/event-details/ResolvedMarketItem2.tsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion.tsx'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

export interface ResolvedMarketsProps {
  markets: MarketModel[]
  defaultOpen?: boolean
}

export const ResolvedMarkets2 = (props: ResolvedMarketsProps) => {
  const { markets, defaultOpen = false } = props
  const { t } = useTranslation()
  if (markets.length === 0) return null
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? 'resolved-markets' : ''} className="w-full">
      <AccordionItem value="resolved-markets" className="border-b-0">
        <AccordionTrigger className="font-semibold" icon={<ChevronDown className="ml-2 text-[#908E98]" />}>
          {t('prediction.eventDetails.past')}
        </AccordionTrigger>
        <AccordionContent>
          {markets.map((market) => (
            <ResolvedMarketItem2 key={market.id} market={market} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
