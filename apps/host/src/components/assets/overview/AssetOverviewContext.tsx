import { createContext } from 'react'
import { WalletBalanceDto } from '@/@generated/gql/graphql-core.ts'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { ChartItem } from '@hooks/useAssetChart.ts'

export interface WalletBalance {
  funding: WalletBalanceDto[] | undefined
  futures: WalletBalanceDto[] | undefined
  spot: WalletBalanceDto[] | undefined
}

export interface AssetOverviewContextState {
  hideBalance: boolean
  toggleHideBalance: (hide: boolean) => void
  walletBalanceData?: WalletBalance
  selectedWallet?: UserEmbeddedWalletDto
  selectedChainId?: number
  setSelectedWallet?: (wallet: UserEmbeddedWalletDto) => void
  totalBalance?: number
  fundingBalance?: number
  futuresBalance?: number
  changeAmount?: number
  changePercentage?: number
  unrealizedPnlFunding?: number
  fundingBalanceChange?: number
  overviewExpandData?: ChartItem[]
  firstItem?: ChartItem
  fundingChange?: {
    changeAmount: number
    changePercentage: number
  }
  futuresChange?: {
    changeAmount: number
    changePercentage: number
  }
  loadingFundingBalance?: boolean
  loadingFuturesBalance?: boolean
  predictionBalance?: number
  predictionUsdcBalance?: number
  loadingPredictionBalance?: boolean
}

const defaultValue: AssetOverviewContextState = {
  hideBalance: false,
  toggleHideBalance: () => {},
}

export const AssetOverviewContext = createContext<AssetOverviewContextState>(defaultValue)

export const AssetOverviewProvider = AssetOverviewContext.Provider
