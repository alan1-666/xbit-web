import { FundingType } from '@/types/enums.ts'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { TFunction } from 'i18next'

export const getDrawerTitleSuccess = (t: TFunction, record: FundingRecord) => {
  const { type } = record
  switch (type) {
    case FundingType.Deposit:
    case FundingType.DepositFutureExternal:
    case FundingType.DepositPredictExternal:
      return t('assets.overview.fundingHistory.titleDepositSuccess')
    case FundingType.Withdraw:
    case FundingType.WithdrawFutureExternal:
    case FundingType.WithdrawPredictExternal:
      return t('assets.overview.fundingHistory.titleWithdrawalSuccess')
    case FundingType.Swap:
    case FundingType.DepositFuture:
    case FundingType.WithdrawFuture:
      return t('assets.transfers.swapSuccess')
    default:
      return t('assets.transfers.swapSuccess')
  }
}

export const getDrawerTitlePending = (t: TFunction, record: FundingRecord) => {
  const { type } = record
  switch (type) {
    case FundingType.Deposit:
    case FundingType.DepositFutureExternal:
    case FundingType.DepositPredictExternal:
      return t('assets.overview.fundingHistory.titleDepositPending')
    case FundingType.Withdraw:
    case FundingType.WithdrawFutureExternal:
    case FundingType.WithdrawPredictExternal:
      return t('assets.overview.fundingHistory.titleWithdrawalPending')
    case FundingType.Swap:
    case FundingType.DepositFuture:
    case FundingType.WithdrawFuture:
      return t('assets.transfers.swapPending')
    default:
      return t('assets.transfers.swapPending')
  }
}

export const getDrawerTitleFail = (t: TFunction, record: FundingRecord) => {
  const { type } = record
  switch (type) {
    case FundingType.Deposit:
    case FundingType.DepositFutureExternal:
    case FundingType.DepositPredictExternal:
      return t('assets.overview.fundingHistory.titleDepositFailed')
    case FundingType.Withdraw:
    case FundingType.WithdrawFutureExternal:
    case FundingType.WithdrawPredictExternal:
      return t('assets.overview.fundingHistory.titleWithdrawalFailed')
    case FundingType.Swap:
    case FundingType.DepositFuture:
    case FundingType.WithdrawFuture:
      return t('assets.transfers.swapFailed')
    default:
      return t('assets.transfers.swapFailed')
  }
}
