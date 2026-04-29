import createFastContext from '@/hooks/createFastContext'

export type TWalletPrices = {
  prices: Record<string, string>
  unrealizedPnL: number
}

export const initialState: TWalletPrices = {
  prices: {},
  unrealizedPnL: 0,
}

export const { FastContextProvider: WalletContextProvider, useFastContextFields: useWalletContextFields } =
  createFastContext<TWalletPrices>(initialState)
