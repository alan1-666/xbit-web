export interface WithdrawTokenModel {
  id: string
  symbol: string
  name: string
  address: string
  decimals: number
  supportsBridging: boolean
  supportsPermit: boolean
  withdrawalFee: number
  depositFee: number
  surgeEnabled: boolean
}
