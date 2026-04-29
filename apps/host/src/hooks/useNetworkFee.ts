import { useAppSelector } from '@/redux/store'

export const useNetworkFee = () => {
  const networkFeeData = useAppSelector((state) => state.networkFee)
  
  return {
    maxcomputeUnit: networkFeeData.maxcomputeUnit,
    priorityFeePrice: networkFeeData.priorityFeePrice,
    feeAccount: networkFeeData.feeAccount,
    platformFee: networkFeeData.platformFee,
    xstockPlatformFee: networkFeeData.xstockPlatformFee,
    minTipFee: networkFeeData.minTipFee,
    autoTipFee: networkFeeData.autoTipFee,
  }
} 