import { useCallback, useEffect, useMemo } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { formatBalanceWallet } from '@/lib/number'
import { PriorityFeePrice, setNetworkFee } from '@/redux/modules/networkFee.slice'
import { ChainType } from '@/@generated/gql/graphql-user'

const useNetworkFeeSubcription = () => {
  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const networkFeeData = useAppSelector((state) => state.networkFee)

  const chain = useMemo(() => {
    if (activeChain === TYPE_CHAIN.SOLANA) return ChainType.Solana
    if (activeChain === TYPE_CHAIN.BSC) return ChainType.Bsc
    if (activeChain === TYPE_CHAIN.MON) return ChainType.Mon
    return ChainType.Evm
  }, [activeChain])

  const _message = useSubscription(`public/network_fee_updated/${chain}`, {
    shouldSkip: !chain,
  })
  const message = _message?.message?.message

  useEffect(() => {
    if (!message) return
    try {
      const dataMqtt = JSON.parse(message.toString() || '')
      if (dataMqtt) {
        let dataConfig
        if (activeChain === TYPE_CHAIN.SOLANA) {
          dataConfig = dataMqtt?.solana
        }
        if (activeChain === TYPE_CHAIN.ETH) {
          dataConfig = dataMqtt?.ethereum
        }
        if (activeChain === TYPE_CHAIN.BSC) {
          dataConfig = dataMqtt?.bsc
        }
        if (activeChain === TYPE_CHAIN.MON) {
          dataConfig = dataMqtt?.mon
        }

        if (dataConfig) {
          const maxcomputeUnit = dataConfig?.maxComputeUnits || 0
          let priorityFeePrice: PriorityFeePrice = {} as PriorityFeePrice
          if (activeChain === TYPE_CHAIN.SOLANA) {
            priorityFeePrice = {
              medium: Number(getFeeByChain(dataConfig?.priorityFeePrice?.medium)) || 0,
              high: Number(getFeeByChain(dataConfig?.priorityFeePrice?.high)) || 0,
              veryHigh: Number(getFeeByChain(dataConfig?.priorityFeePrice?.veryHigh)) || 0,
            }
          }
          if (activeChain === TYPE_CHAIN.BSC || activeChain === TYPE_CHAIN.MON) {
            priorityFeePrice = {
              low: Number(getFeeByChain(dataConfig?.low?.suggestedMaxFeePerGas)) || 0,
              medium: Number(getFeeByChain(dataConfig?.medium?.suggestedMaxFeePerGas)) || 0,
              high: Number(getFeeByChain(dataConfig?.high?.suggestedMaxFeePerGas)) || 0,
            }
          }

          dispatch(
            setNetworkFee({
              maxcomputeUnit,
              priorityFeePrice,
              feeAccount: dataConfig?.feeAccount || '',
              platformFee: dataConfig?.platformFee,
              xstockPlatformFee: dataConfig?.xstockPlatformFee,
              minTipFee: dataConfig?.minTipFee,
              autoTipFee: dataConfig?.autoTipFee,
            }),
          )
        }
      }
    } catch (error) {
      console.warn('[NetworkFeeSubscription error]: ', error)
    }
  }, [message, activeChain, dispatch])

  const getFeeByChain = (param: number) => {
    if (activeChain === TYPE_CHAIN.SOLANA) return getFeeSol(param)
    if (activeChain === TYPE_CHAIN.ETH) return getFeeEth(param)
    if (activeChain === TYPE_CHAIN.BSC || activeChain === TYPE_CHAIN.MON) return getFeeBsc(param)
    return 0
  }

  const getFeeSol = useCallback(
    (sol: number) => {
      if (sol && networkFeeData.maxcomputeUnit)
        return formatBalanceWallet({
          balance: (sol * networkFeeData.maxcomputeUnit) / Math.pow(10, 15),
          decimal: 6,
        })
      return 0
    },
    [networkFeeData.maxcomputeUnit],
  )

  const getFeeEth = useCallback((eth: number) => {
    if (eth)
      return formatBalanceWallet({
        balance: eth,
        decimal: 3,
      })
    return 0
  }, [])

  const getFeeBsc = useCallback((bsc: number) => {
    if (bsc)
      return formatBalanceWallet({
        balance: bsc,
        decimal: 3,
      })
    return 0
  }, [])

  return {
    maxcomputeUnit: networkFeeData.maxcomputeUnit,
    priorityFeePrice: networkFeeData.priorityFeePrice,
  }
}

export default useNetworkFeeSubcription
