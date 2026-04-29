export interface TransactionData {
  items: Item[]
  requestId: string
  type: string
  description: string
  errorCode: string
  outPutAmountFormatted: string
  gasTopupAmount: string
  gasTopupAmountFormatted: string
  gasTopupAmountUsd: string
  gasAmountFormatted: string
  platformFeeAmountFormat: string
  platformFeeSymbol: string
  thresholdCapacity: string
  fromAmountMaxValueFormatted: string
  estimatedTimeInSeconds?: number
  gasAmountUsd?: number
}

export interface Item {
  from: string
  to: string
  data: string
  value: string
  valueAmountUsd: string
  valueAmountFormatted: string
  chainId: number
  gas: string
  gasAmountUsd: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  serializedMessage: any
  nonce: number
  blockHash: string
  transactionType: string
  estimatedTimeInSeconds: number
  isApprovalTx: boolean
  instructions: Instruction[]
  gasAmountFormatted: string
}

export interface Instruction {
  programId: string
  data: string
  keys: Key[]
}

export interface Key {
  pubkey: string
  isSigner: boolean
  isWritable: boolean
}
