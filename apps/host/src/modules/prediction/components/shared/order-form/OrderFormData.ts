import { OrderFormDataSchema } from '@/modules/prediction/components/shared/order-form/schema/orderForm.schema.ts'
import z from 'zod'

export type OrderFormData = z.infer<typeof OrderFormDataSchema> & {
  marketId?: string
}

export type OrderFormDataWithMarketId = OrderFormData & {
  marketId: string
  tokenId: string
  conditionId: string
  feeRateBps: number
  outcomeLabels: string[]
  title?: string
  slug?: string
  icon?: string
  eventSlug?: string
  yesPrice?: number
  noPrice?: number
  outcomeIndex?: number
}
