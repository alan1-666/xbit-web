import { ChainIds } from "@/types/enums"
import { ACCOUNT_TYPE } from "./constants"

export type SwapFormState = {
  fromAccountType: ACCOUNT_TYPE
  fromAmount: string | null
  fromToken: Token | null
  fromWalletAddress: string
  fromAvailableBalance: string
  fromDisplayedAvailableBalance: string
  toAccountType: ACCOUNT_TYPE
  toAmount: string | null
  toToken: Token | null
  toWalletAddress: string
  toAvailableBalance: string
  toDisplayedAvailableBalance: string
  isLoading: boolean
  isQuoteing: boolean
  transactionData: TransactionData | null | any
  swapTokens?: Token[]
  errors?: string | null
}

export interface Currencies {
  chains: Chain[]
  tokens: Token[]
}

export interface Chain {
  chainId: string
  chainImage: string
  chainName: string
  decimals: number
  tokenId: string
}

export interface Token {
  symbol: string
  name: string
  image: string
  chainList: ChainList[]
  tokenId?: string
  isShow?: boolean
  chainId?: ChainIds
  decimals?: number
}

export interface ChainList {
  chainId: string
  chainImage: string
  chainName: string
  tokenId: string
  address: string
}

export interface TransactionData {
  maxBridgeAmount: string
  totalImpactUsd: string
  totalImpactPercent: string
  timeEstimate: string
  currencyOutAmountUsd: string
  currencyOutAmountFormatted: string
  depositAddress: string
  depositSolAddress: string
  depositBtcAddress: string
  quote: string
  steps: Step[]
  __typename: string
}

export interface Step {
  id: string
  kind: string
  requestId: string
  items: Item[]
  __typename: string
}

export interface Item {
  from: string
  to: string
  data: string
  value: string
  chainId: string
  gas: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  isApprovalTx: boolean
  serializedMessage: any
  nonce?: number
  eip712PrimaryType?: string
  instructions: any[]
  sign?: Sign
  post?: Post
  action?: Action
  eip712Types?: Eip712Types
  __typename: string
}

export interface Sign {
  signatureKind: string
  primaryType: string
  types: Types
  domain: Domain
  value: Value
  __typename: string
}

export interface Types {
  nonceMapping: NonceMapping[]
  __typename: string
}

export interface NonceMapping {
  name: string
  type: string
  __typename: string
}

export interface Domain {
  name: string
  version: string
  chainId: number
  verifyingContract: string
  __typename: string
}

export interface Value {
  chainId: string
  wallet: string
  nonce: number
  id: string
  __typename: string
}

export interface Post {
  endpoint: string
  method: string
  body: Body
  __typename: string
}

export interface Body {
  type: string
  walletChainId: number
  wallet: string
  nonce: number
  id: string
  signatureChainId: number
  __typename: string
}

export interface Action {
  type: string
  parameters: Parameters
  __typename: string
}

export interface Parameters {
  hyperliquidChain: string
  destination: string
  sourceDex: string
  destinationDex: string
  token: string
  amount: string
  fromSubAccount: string
  nonce: number
  __typename: string
}

export interface Eip712Types {
  hyperliquidTransactionSendAsset: HyperliquidTransactionSendAsset[]
  __typename: string
}

export interface HyperliquidTransactionSendAsset {
  name: string
  type: string
  __typename: string
}
