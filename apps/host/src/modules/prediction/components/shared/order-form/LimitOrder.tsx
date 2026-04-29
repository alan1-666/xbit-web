import { SharesInput } from '@/modules/prediction/components/shared/order-form/SharesInput.tsx'
import { PriceInput } from '@/modules/prediction/components/shared/order-form/PriceInput.tsx'

export const LimitOrder = () => {
  return (
    <div className="space-y-2">
      <PriceInput />
      <div className="h-[0.5px] bg-white/10 my-2"></div>
      <SharesInput />
    </div>
  )
}
