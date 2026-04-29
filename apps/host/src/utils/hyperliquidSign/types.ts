export type NetworkConfig = {
  apiUrl: string
  chainIdHex: string
}

export type HyperliquidConfig = {
  mainnet: NetworkConfig
  testnet: NetworkConfig
}

export interface CancelOrdersItem {
  a: number
  o: number
}

export type OperationType = 'approveAgent' | 'approveBuilderFee' | 'withdraw' | 'sendAsset' | 'cancelOrders'

export interface ApproveAgentPayload {
  agentAddress: string
  agentName?: string
}

export interface ApproveBuilderFeePayload {
  builder: string
  maxFeeRate: string
}
export interface WithdrawPayload {
  amount: string
  destination: string
  time: number
}

export interface SendAssetPayload {
  hyperliquidChain: string
  destination: string
  sourceDex: string
  destinationDex: string
  token: string
  amount: string
  fromSubAccount: string
  nonce: number
}
export interface CancelOrdersPayload {
  cancels: CancelOrdersItem[]
}

export type SignPayload = ApproveAgentPayload | ApproveBuilderFeePayload

export interface SignatureResult {
  action: any
  nonce: number
  signature: {
    r: string
    s: string
    v: number
  }
}
