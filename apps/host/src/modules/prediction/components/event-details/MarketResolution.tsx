import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { useGetResolution } from '@/modules/prediction/hooks/useGetResolution'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export interface MarketResolutionProps {
  market: MarketModel
}

export const MarketResolution = ({ market }: MarketResolutionProps) => {
  const { t } = useTranslation()
  const { data: resolution } = useGetResolution(market.questionID || '')

  const handleProposeResolution = () => {
    // Construct UMA oracle URL with resolution data if available
    const baseUrl = 'https://oracle.uma.xyz/propose?project=Polymarket'

    if (resolution?.data?.transactionHash && resolution?.data?.logIndex) {
      const url = `${baseUrl}&transactionHash=${resolution.data.transactionHash}&eventIndex=${resolution.data.logIndex}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // Fallback to base URL if no transaction data available
      window.open(baseUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="p-4 flex">
      <Button variant="outline" onClick={handleProposeResolution} className="hover:bg-primary/10 rounded-full text-sm">
        {t('prediction.marketResolution.proposeButton')}
      </Button>
    </div>
  )
}
