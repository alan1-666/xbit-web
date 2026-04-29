import { useEffect, useState } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { WalletTokenBalanceMsg } from '@/types/token.ts'
import { ChainIds } from '@/types/enums.ts'

type useWatchWalletTokenBalanceProps = {
  address: string | undefined
  token: string | undefined
  chainId: ChainIds | undefined
}

const useWatchWalletTokenBalance = ({ address, token, chainId }: useWatchWalletTokenBalanceProps) => {
  const [walletTokenBalance, setWalletTokenBalance] = useState<WalletTokenBalanceMsg | undefined>(undefined)
  const topic = `public/wallet_token_balance/${address}/${token}`
  const { message } = useSubscription(chainId !== ChainIds.Solana ? topic.toLocaleLowerCase() : topic, {
    clientOptions: {
      qos: 1,
    },
    shouldSkip: !address || !token || !chainId
  })

  useEffect(() => {
    const msg = message?.message?.toString()
    if (msg) {
      const data: WalletTokenBalanceMsg = JSON.parse(msg)
      setWalletTokenBalance(data)
    }
  }, [message])

  return walletTokenBalance
}

export default useWatchWalletTokenBalance
