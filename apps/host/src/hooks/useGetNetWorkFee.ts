import { TYPE_CHAIN } from '@/lib/blockchain'
import { useSubscription } from '@/lib/mqtt'
import { useEffect, useMemo, useState } from 'react'
import { getNetworkFeeQuery } from '@/services/order.service'
import { useQuery } from '@apollo/client'
import { tradingClient } from '@/lib/gql/apollo-client'
import { ChainType } from '@/@generated/gql/graphql-meme2'

type SolanaPriorityFeePrice = {
  high: number
  medium: number
  veryHigh: number
}

type EthereumFeeLevel = {
  maxWaitTimeEstimate: number
  minWaitTimeEstimate: number
  suggestedMaxFeePerGas: string
  suggestedMaxPriorityFeePerGas: string
}

export type SolanaNetworkFee = {
  maxComputeUnits: number
  priorityFeePrice: SolanaPriorityFeePrice
  feeAccount: string
  platformFee: number
  xstockPlatformFee: number
}

export type EthereumNetworkFee = {
  estimatedBaseFee: string
  high: EthereumFeeLevel
  medium: EthereumFeeLevel
  low: EthereumFeeLevel
}

export type BscNetworkFee = {
  estimatedBaseFee: string
  high: EthereumFeeLevel
  medium: EthereumFeeLevel
  low: EthereumFeeLevel
}

function removeTypenameDeep(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeTypenameDeep)
  } else if (obj && typeof obj === 'object') {
    const newObj: any = {}
    for (const key in obj) {
      if (key === '__typename') continue
      newObj[key] = removeTypenameDeep(obj[key])
    }
    return newObj
  }
  return obj
}

export const useGetNetworkFee = (activeChain: TYPE_CHAIN) => {
  const [data, setData] = useState<SolanaNetworkFee | EthereumNetworkFee | BscNetworkFee | null>(null)

  const getActiveChain = (chain: TYPE_CHAIN) => {
    switch (chain) {
      case TYPE_CHAIN.ETH:
        return ChainType.Evm
      case TYPE_CHAIN.SOLANA:
        return ChainType.Solana
      case TYPE_CHAIN.BSC:
        return ChainType.Bsc
      case TYPE_CHAIN.MON:
        return ChainType.Mon
      default:
        return ChainType.Solana
    }
  }

  const { message: mqttMessage } = useSubscription(`public/network_fee_updated/${getActiveChain(activeChain)}`, {
    shouldSkip: !activeChain,
  })

  const { data: networkFeeData } = useQuery(getNetworkFeeQuery, {
    variables: {
      input: { chain: getActiveChain(activeChain) },
    },
    client: tradingClient,
  })

  const dataFee = useMemo(() => {
    if (networkFeeData?.getNetworkFee) {
      return removeTypenameDeep(networkFeeData.getNetworkFee)
    }
    return null
  }, [networkFeeData?.getNetworkFee])

  useEffect(() => {
    if (dataFee && activeChain) {
      if (activeChain === TYPE_CHAIN.ETH) {
        if (dataFee.ethereum) {
          setData(dataFee.ethereum)
        }
      } else if (activeChain === TYPE_CHAIN.SOLANA) {
        if (dataFee.solana) {
          setData(dataFee.solana)
        }
      } else if (activeChain === TYPE_CHAIN.BSC) {
        if (dataFee.bsc) {
          setData(dataFee.bsc)
        }
      } else if (activeChain === TYPE_CHAIN.MON) {
        if (dataFee.mon) {
          setData(dataFee.mon)
        }
      }
    }
  }, [dataFee, activeChain])

  useEffect(() => {
    if (!mqttMessage || !mqttMessage.message) return
    const payload = JSON.parse(mqttMessage.message.toString())
    if (activeChain === TYPE_CHAIN.ETH) {
      setData(payload.ethereum)
    } else if (activeChain === TYPE_CHAIN.SOLANA) {
      setData(payload.solana)
    } else if (activeChain === TYPE_CHAIN.BSC) {
      setData(payload.bsc)
    }
    else if (activeChain === TYPE_CHAIN.MON) {
      setData(payload.mon)
    }
  }, [mqttMessage])

  return data
}
