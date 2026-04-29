import { UserPositionResponse } from '@/@generated/gql/graphql-symbolDex'

export const mockPositionsData: Pick<
  UserPositionResponse,
  | 'balance'
  | 'unrealizedPnl'
  | 'positionValue'
  | 'availableWithdraw'
  | 'availableMargin'
> = {
  balance: 10000.00,
  unrealizedPnl: 250.50,
  positionValue: 5000.00,
  availableWithdraw: 7500.00,
  availableMargin: 2500.00,
}

// Example of negative PnL
export const mockPositionsDataNegative: Pick<
  UserPositionResponse,
  | 'balance'
  | 'unrealizedPnl'
  | 'positionValue'
  | 'availableWithdraw'
  | 'availableMargin'
> = {
  balance: 10000.00,
  unrealizedPnl: -150.75,
  positionValue: 5000.00,
  availableWithdraw: 7500.00,
  availableMargin: 2500.00,
}

// Example of empty data
export const mockPositionsDataEmpty: Pick<
  UserPositionResponse,
  | 'balance'
  | 'unrealizedPnl'
  | 'positionValue'
  | 'availableWithdraw'
  | 'availableMargin'
> = {
  balance: 0,
  unrealizedPnl: 0,
  positionValue: 0,
  availableWithdraw: 0,
  availableMargin: 0,
} 