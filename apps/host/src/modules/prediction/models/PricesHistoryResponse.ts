import { PriceModel } from '@/modules/prediction/models/PriceModel.ts'

export interface PricesHistoryResponse {
  history: PriceModel[]
}
