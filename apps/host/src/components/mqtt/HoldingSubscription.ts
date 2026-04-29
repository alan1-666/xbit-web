import { useEffect, useState } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { WalletTokenData } from '@/types/holding.ts'
import { ChainIds } from '@/types/enums.ts'

const useHoldingSubscription = (address: string | undefined, token: string | undefined, chainId: ChainIds | undefined) => {
  const [tokenStatistic, setTokenStatistic] = useState<WalletTokenData | undefined>(undefined)
  const topic = `public/wallet_token/${address}/${token}`
  const { message } = useSubscription(chainId !== ChainIds.Solana ? topic.toLocaleLowerCase() : topic, {
    clientOptions: {
      qos: 1,
    },
    shouldSkip: !token || !address || !chainId
  })

  useEffect(() => {
    const msg = message?.message?.toString()
    const data: WalletTokenData = msg ? JSON.parse(msg) : null

    setTokenStatistic((prev) => data ?? prev)
  }, [message])
  return tokenStatistic
}

export default useHoldingSubscription
