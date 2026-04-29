import { useEffect, useMemo, useState } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { ChainIds } from '@/types/enums.ts'

type Props = {
  token: string
  chainId: ChainIds
}

type LowLpMessage = {
  low_lp?: boolean
  liq?: string
}

const useWatchLiquidity = ({ token, chainId }: Props) => {
  const [dataLp, setDataLp] = useState<LowLpMessage | undefined>(undefined)

  const lowLpTopic = useMemo(() => (token ? `public/alerts/low_lp/${chainId}/${token}` : ''), [chainId, token])

  const { message: lowLPMessage } = useSubscription(lowLpTopic, {
    shouldSkip: !token,
  })

  useEffect(() => {
    const msg = lowLPMessage?.message?.toString()
    if (!msg) return

    try {
      const lowLpObj = JSON.parse(msg) as LowLpMessage

      setDataLp(lowLpObj)
    } catch {
      return
    }
  }, [lowLPMessage])

  // Reset when token or chain changes
  useEffect(() => {
    setDataLp(undefined)
  }, [token, chainId])

  return { dataLp: dataLp?.liq, isLowLp: dataLp?.low_lp }
}

export default useWatchLiquidity
