import { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import { toBigInt, formatEther } from 'ethers'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { ServiceConfig } from '@/lib/gql/service-config'

/**
 * Hook to get real-time balance updates for a list of wallets
 * @param chainType The blockchain type (ETH or SOLANA)
 * @param walletIds List of wallet addresses to track
 * @param initBalances Initial balances for each wallet (object: { [walletId]: number })
 * @param rpcUrl RPC endpoint for the blockchain
 * @param refreshInterval Polling interval in milliseconds if websocket fails
 * @returns Array of { walletId, balance, rawBalance, isLoading, error }
 */
export const useNewMultiWalletRealtimeBalance = (
  chainType: TYPE_CHAIN,
  walletIds: string[],
  initBalances: { [walletId: string]: number },
  rpcUrl: string,
  refreshInterval = 10000,
  isActive = true,
) => {
  const [balances, setBalances] = useState<
    {
      walletId: string
      balance: number
      rawBalance: string
      isLoading: boolean
      error: string | null
    }[]
  >(() =>
    walletIds.map((walletId) => ({
      walletId,
      balance: initBalances?.[walletId] ?? 0,
      rawBalance: '0',
      isLoading: !!walletId,
      error: null,
    })),
  )

  const getSOLBalance = async (validKeys: PublicKey[]): Promise<any[]> => {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ServiceConfig.token}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getMultipleAccounts',
        params: [validKeys, { commitment: 'confirmed' }],
      }),
    })
    const result = await response.json()
    return result.result.value // Array of accountInfo | null
  }

  const getETHBalance = async (walletId: string) => {
    if (!ServiceConfig.token) return { result: '0x0' }
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ServiceConfig.token}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [walletId, 'latest'],
      }),
    })
    const data = await response.json()
    return data
  }

  const hexToEth = (hexValue: string) => {
    try {
      const wei = toBigInt(hexValue)
      const eth = formatEther(wei)
      return eth
    } catch (error) {
      return 0
    }
  }

  useEffect(() => {
    let isMounted = true
    let interval: NodeJS.Timeout | null = null

    if (!ServiceConfig.token) return
    const updateAll = (data: {
      [walletId: string]: { balance: number; rawBalance: string; isLoading: boolean; error: string | null }
    }) => {
      if (!isMounted) return
      setBalances((prev) => prev.map((b) => (data[b.walletId] ? { ...b, ...data[b.walletId] } : b)))
    }

    const fetchAllBalances = async () => {
      if (!isActive) return
      if (!walletIds?.length) return
      const result: {
        [walletId: string]: { balance: number; rawBalance: string; isLoading: boolean; error: string | null }
      } = {}
      if (chainType === TYPE_CHAIN.ETH || chainType === TYPE_CHAIN.ARB || chainType === TYPE_CHAIN.BSC || chainType === TYPE_CHAIN.MON) {
        try {
          const promises = walletIds.map((walletId) =>
            getETHBalance(walletId).then((data) => {
              const hexBalance = data?.result || '0x0'
              const balance = Number(hexToEth(hexBalance))
              return {
                walletId,
                balance,
                rawBalance: balance.toString(),
                isLoading: false,
                error: null,
              }
            }),
          )
          const all = await Promise.all(promises)
          all.forEach((b) => {
            result[b.walletId] = b
          })
        } catch (err: any) {
          // walletIds.forEach((walletId) => {
          //   result[walletId] = { balance: 0, rawBalance: '0', isLoading: false, error: err?.message || 'Error' }
          // })
        }
      } else if (chainType === TYPE_CHAIN.SOLANA) {
        try {
          // const connection = new Connection(endpoint, { commitment: 'confirmed' })
          const publicKeys = walletIds.map((id) => {
            return new PublicKey(id)
          })
          const validKeyMap: { [base58: string]: number } = {}
          const validKeys: PublicKey[] = []
          publicKeys.forEach((pk, i) => {
            if (pk) {
              validKeyMap[pk.toBase58()] = i
              validKeys.push(pk)
            }
          })
          // const accounts = validKeys.length ? await connection.getMultipleAccountsInfo(validKeys) : []
          const accounts = validKeys.length && ServiceConfig.token ? await getSOLBalance(validKeys) : []
          // Map base58 -> account
          const pkToAccount: { [base58: string]: (typeof accounts)[0] } = {}
          validKeys.forEach((k, i) => {
            pkToAccount[k.toBase58()] = accounts[i]
          })
          walletIds.forEach((walletId, idx) => {
            const pk = publicKeys[idx]
            if (!pk) {
              result[walletId] = { balance: 0, rawBalance: '0', isLoading: false, error: 'Invalid Solana address' }
              return
            }
            const acc = pkToAccount[pk.toBase58()]
            if (acc) {
              const lamports = acc.lamports ? acc.lamports : 0
              result[walletId] = {
                balance: lamports / 1e9,
                rawBalance: lamports.toString(),
                isLoading: false,
                error: null,
              }
            } else {
              result[walletId] = { balance: 0, rawBalance: '0', isLoading: false, error: null }
            }
          })
        } catch (err: any) {
          // walletIds.forEach((walletId) => {
          //   result[walletId] = { balance: 0, rawBalance: '0', isLoading: false, error: err?.message || 'Error' }
          // })
        }
      } else {
        // walletIds.forEach((walletId) => {
        //   result[walletId] = {
        //     balance: 0,
        //     rawBalance: '0',
        //     isLoading: false,
        //     error: `Unsupported chain type: ${chainType}`,
        //   }
        // })
      }
      updateAll(result)
    }
    if (isActive) fetchAllBalances()
    // Tạo interval nếu active
    if (isActive) {
      interval = setInterval(fetchAllBalances, refreshInterval)
    }
    // // Initial fetch
    // fetchAllBalances()
    // Polling
    // interval = setInterval(fetchAllBalances, refreshInterval)

    return () => {
      isMounted = false
      if (interval) clearInterval(interval)
    }
  }, [chainType, rpcUrl, refreshInterval, JSON.stringify(walletIds), ServiceConfig.token, isActive])

  if (!isActive) return null
  return balances
}
