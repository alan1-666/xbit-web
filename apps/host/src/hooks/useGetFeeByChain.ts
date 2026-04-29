import { TransactionType } from '@/@generated/gql/graphql-trading'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { useAppSelector } from '@/redux/store'

type Props = {
  chain: TYPE_CHAIN
  type: TransactionType
}
export const useGetFeeByChain = ({ chain, type }: Props) => {
  const networkFeeData = useAppSelector((state) => state.networkFee)

  return {
    maxcomputeUnit: networkFeeData.maxcomputeUnit,
    priorityFeePrice: networkFeeData.priorityFeePrice,
    feeAccount: networkFeeData.feeAccount,
    platformFee: networkFeeData.platformFee,
    xstockPlatformFee: networkFeeData.xstockPlatformFee,
  }
}
