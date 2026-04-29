import { MarketBase } from '@/@generated/gql/graphql-prediction'
import { useCollectionMutation, useCollection } from '@/modules/prediction/collections/base'
import { createEventCollection } from '@/modules/prediction/collections/factories/event.factory'
import { useParams } from 'react-router-dom'

export interface MarketRowProps {
  market: MarketBase | null | undefined
  index: number
}

export const MarketRow = ({ market, index }: MarketRowProps) => {
  // Get eventSlug from URL params - same as parent component
  const { eventSlug } = useParams<{ eventSlug: string }>()

  // Create collection instance for this event
  // This will use the same cache as other components querying the same event
  const eventCollection = useCollection(() => createEventCollection(eventSlug!))

  // Use mutation hook directly in this component
  const { mutate: updateMarket } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'updateMarket',
  })

  if (!market) return null

  const handleUpdatePrice = () => {
    updateMarket({
      id: market.id,
      outcomePrices: ['0.55', '0.45'],
    })
  }

  return (
    <div className="bg-[#202025] rounded-lg p-4 border border-white/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-white mb-2">{market.question || 'No question'}</div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Market #{index + 1}</span>
            {market.outcomePrices && market.outcomePrices.length > 0 && (
              <span>Prices: {market.outcomePrices.map((p) => Math.round(Number(p) * 100) + '¢').join(' / ')}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleUpdatePrice}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
        >
          📈 Update Price
        </button>
      </div>
    </div>
  )
}
