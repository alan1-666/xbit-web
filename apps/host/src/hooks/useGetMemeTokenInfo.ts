import { useEffect, useMemo, useState } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
// import dayjs from 'dayjs'

export type HolderChartMqttResponse = {
  hc: string
  top10HolderPercentage: string
  insiderTradingPercentage: string
}

type useGetMemeTokenInfoProps = {
  token: string
  createdTime?: string
  totalSupply?: string
}

type TokenInfoMqtt = {
  top10HolderPercentage?: string | number
  sniperPercentage?: string | undefined
  insiderTradingPercentage?: string | undefined
  sameSourceWallet?: string | undefined
  thb?: string // Top 10 Holder Balance
  dhp?: string // Dev Hold Percentage
  dhb?: string // Dev Hold Balance
  hc?: string // Holders Count
  dt?: string // Dev token launched
  dbp?: string // Same Source Wallet Percentage
  sniperHoldAmount?: string
  vl?: string // Volume
  mc?: string // Market Cap
  txb?: string // Buy Transactions
  txs?: string // Sell Transactions
  i?: string // new insider rate
  t10r?: string // Top 10 Holder Rate
  ir?: string // Insider Rate
}

type TokenInfoMqttPayload = TokenInfoMqtt | TokenInfoMqtt[]

const useGetMemeTokenInfo = ({ token, createdTime, totalSupply }: useGetMemeTokenInfoProps) => {
  const [data, setData] = useState<TokenInfoMqtt | undefined>(undefined)
  const activeChainId = useActiveChainId()
  const topic = useMemo(() => {
    return `public/token_detail/holders/${token}`
  }, [token, createdTime])
  const { message } = useSubscription(topic)

  useEffect(() => {
    const msg = message?.message?.toString()
    if (!msg || !message?.topic) return
    const topic = message.topic

    if (topic === `public/token_detail/holders/${token}`) {
      const data = JSON.parse(msg)
      setData((prev) => ({
        ...prev,
        hc: data?.[0]?.hc,
        top10HolderPercentage: totalSupply ? (Number(data?.[0]?.t10r) * 100) / Number(totalSupply) : 0,
        insiderTradingPercentage: data?.ir,
      }))
    } else if (topic === `public/meme/token_info/${activeChainId}/${token}`) {
      const data: TokenInfoMqttPayload = JSON.parse(msg)
      // console.log('data', data)
      let tokenInfo: TokenInfoMqtt
      const isArray = Array.isArray(data)
      if (isArray) {
        tokenInfo = data.reduce((acc, cur) => {
          return {
            ...acc,
            top10HolderPercentage: cur.top10HolderPercentage ?? acc.top10HolderPercentage,
            insiderTradingPercentage: cur.insiderTradingPercentage ?? acc.insiderTradingPercentage,
            hc: cur.hc ?? acc.hc,
            i: cur.i ?? acc.i,
          }
        }, {} as TokenInfoMqtt)
      } else {
        tokenInfo = data as TokenInfoMqtt
      }
      //console.table(tokenInfo)
      setData(tokenInfo)
    }
  }, [message])

  useEffect(() => {
    setData(undefined)
  }, [token])

  return data
}

export default useGetMemeTokenInfo
