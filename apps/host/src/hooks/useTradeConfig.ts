import { TransactionType } from '@/@generated/gql/graphql-trading'
import { useNetworkFee } from '@/hooks/useNetworkFee'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { SlippageOptions } from '@/redux/modules/tradeSettings.slice'
import { useAppSelector } from '@/redux/store'
import Decimal from 'decimal.js'
import { useMemo } from 'react'

type Props = {
  transactionType: TransactionType
}
export const useTradeConfig = (props: Props) => {
  const { transactionType } = props
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const selectedPreset = useAppSelector((state) => state.tradeSettings.selectedPreset)
  const settings = useAppSelector((state) => state.tradeSettings.settings)

  const { maxcomputeUnit, priorityFeePrice, autoTipFee, minTipFee } = useNetworkFee()

  const selectedPresetKey = useMemo(() => {
    return selectedPreset?.[activeChain]?.[transactionType]
  }, [selectedPreset, activeChain, transactionType])

  const newConfigs = useMemo(() => {
    return settings?.[activeChain]?.[selectedPresetKey - 1]
  }, [settings, activeChain, selectedPresetKey])

  const config = transactionType === TransactionType.Buy ? newConfigs?.Buy : newConfigs?.Sell

  //Priority Fee
  const fee = useMemo(() => {
    if (config) {
      return config?.fee?.type === 'custom' ? config?.fee?.value : priorityFeePrice?.[config?.fee?.type]
    }
    return 0
  }, [config, priorityFeePrice, config?.fee?.value])

  //Tip Fee
  const briberyFee = useMemo(() => {
    if (config) {
      return config?.briberyFee?.type === 'custom' ? config?.briberyFee?.value : autoTipFee
    }
    return 0
  }, [config, autoTipFee, config?.briberyFee?.type])

  const priorityFeePriceOrder = useMemo(() => {
    if (!fee) return 0
    if (activeChain === TYPE_CHAIN.SOLANA && maxcomputeUnit) {
      return new Decimal(fee).mul(Math.pow(10, 15)).divToInt(maxcomputeUnit).floor() || new Decimal(0)
    }
    if (activeChain === TYPE_CHAIN.BSC || activeChain === TYPE_CHAIN.MON) {
      return new Decimal(fee).mul(Math.pow(10, 9)) || new Decimal(0)
    }
    return 0
  }, [fee, activeChain, maxcomputeUnit])

  const slippage = useMemo(() => {
    if (config) {
      return (config?.newSlippage?.type === 'custom' ? config?.newSlippage?.value : SlippageOptions[0]) / 100
    }
    return 0.05
  }, [config, config?.newSlippage?.type])

  return {
    config,
    slippage,
    selectedPresetKey,
    fee,
    briberyFee,
    priorityFeePriceOrder: priorityFeePriceOrder,
    isWarningMinPriorityFee: !!fee && !!priorityFeePrice?.medium && ((activeChain === TYPE_CHAIN.SOLANA && fee < priorityFeePrice?.medium ) || (activeChain === TYPE_CHAIN.BSC && fee < priorityFeePrice?.low)),
    isWarningMinBriberyFee: !!minTipFee && !!briberyFee && briberyFee < minTipFee,
  }
}
