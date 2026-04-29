import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import BalanceExpendChartWrapper from '@components/common/walletBalance/BalanceExpendChartWrapper.tsx'
import { useAssetHistoryByToken } from '@hooks/useAssetHistory.ts'
import { useEffect, useState } from 'react'
import { NullableDataItem } from '@components/common/walletBalance/WalletChangeBox.tsx'

const schema = z.object({
  type: z.enum(['collapse', 'expand']),
  token: z.string(),
  width: z.string().transform((val) => Number(val)),
  height: z.string().transform((val) => Number(val)),
  period: z.string(),
  userAddress: z.string(),
  tokenAddress: z.string().optional(),
})

const periodMap: Record<string, string> = {
  '1day': 'd1',
  '1week': 'w1',
  '1month': 'm1',
  '1year': 'y1',
}

type AssetChartWebViewParams = z.infer<typeof schema>

const parseParams = (params: URLSearchParams): AssetChartWebViewParams | undefined => {
  const rawParams = Object.fromEntries(params.entries())
  const parsedParams = schema.safeParse(rawParams)
  return parsedParams.data as AssetChartWebViewParams
}

export const AssetChartWebView = () => {
  const [params] = useSearchParams()
  const [hoverPoint, setHoverPoint] = useState<NullableDataItem>(null)

  const payload = parseParams(params)

  useEffect(() => {
    const payload = {
      point: hoverPoint
        ? {
            changePercentage: hoverPoint?.changePercentage,
            changeAmount: hoverPoint?.changeAmount,
            balance: hoverPoint?.price,
            timestamp: hoverPoint?.timestamp,
          }
        : null,
    }

    const json = JSON.stringify(payload)
    window.postMessage(json, { targetOrigin: '*' })
    const AssetChartChannel = (window as any).AssetChartChannel
    if (AssetChartChannel) {
      AssetChartChannel.postMessage(json)
    }
  }, [hoverPoint])

  if (!payload) {
    console.error('Please provide all data')
    return <></>
  }
  const { type, token, width, height, period, userAddress, tokenAddress } = payload

  const { data } = useAssetHistoryByToken(
    {
      timeframe: periodMap[period],
      tokenAddress: tokenAddress,
      userAddress: userAddress,
      type: type === 'collapse' ? 'Collapse' : 'Expand',
    },
    token,
  )

  return (
    <BalanceExpendChartWrapper
      data={data}
      width={width}
      height={height}
      period={period}
      isThumb={type === 'collapse'}
      onHoverChange={(point) => setHoverPoint(point)}
    />
  )
}
