import { useEffect, useState } from 'react'
import { Wallet } from 'ethers'
import { initAgentWalletIfNeeded, getAgentWallet } from '@/utils/agent/agentWalletManager'

export function useAgentWallet(address: string | undefined) {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setWallet(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await initAgentWalletIfNeeded(address)
        if (cancelled) return
        const agent = await getAgentWallet(address)
        if (!cancelled) {
          setWallet(agent)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
          setWallet(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [address])

  return { wallet, isLoading, error }
}
