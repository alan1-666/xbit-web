import { SharesInput } from './SharesInput.tsx'
import { useFormContext, useWatch } from 'react-hook-form'
import { OrderFormData } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'
import { USDCInput } from '@/modules/prediction/components/shared/sport-order/USDCInput.tsx'

export const MarketOrder = () => {
  const { control } = useFormContext<OrderFormData>()
  const side = useWatch({ control, name: 'side' })
  return <div>{side === 'buy' ? <USDCInput /> : <SharesInput />}</div>
}
