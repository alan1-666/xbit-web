export interface WithdrawChainCurrency {
  id: string
  symbol: string
  name: string
  address: string
  decimals: number
  supportsBridging: boolean
  metadata?: {
    logoURI: string
  }
}

export interface WithdrawChainToken {
  id?: string
  symbol: string
  name: string
  address: string
  decimals: number
  supportsBridging: boolean
  supportsPermit?: boolean
  withdrawalFee?: number
  depositFee?: number
  surgeEnabled?: boolean
  metadata?: {
    logoURI: string
  }
}

export interface WithdrawChainContracts {
  multicall3: string
  multicaller: string
  onlyOwnerMulticaller: string
  relayReceiver: string
  erc20Router: string
  approvalProxy: string
  v3?: {
    erc20Router: string
    approvalProxy: string
  }
}

export interface WithdrawChainProtocol {
  v2?: {
    chainId: string
    depository: string
  }
}

export interface WithdrawChainModel {
  id: number
  name: string
  displayName: string
  httpRpcUrl: string
  wsRpcUrl: string
  explorerUrl: string
  explorerName: string
  depositEnabled: boolean
  tokenSupport: string
  disabled: boolean
  partialDisableLimit: number
  blockProductionLagging: boolean
  currency: WithdrawChainCurrency
  withdrawalFee: number
  depositFee: number
  surgeEnabled: boolean
  featuredTokens: WithdrawChainToken[]
  erc20Currencies: WithdrawChainToken[]
  solverCurrencies: WithdrawChainToken[]
  iconUrl: string
  contracts: WithdrawChainContracts
  vmType: string
  baseChainId: number
  solverAddresses: string[]
  tags: string[]
  protocol: WithdrawChainProtocol
}
