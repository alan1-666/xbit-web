import { useEffect, useState, useMemo } from 'react'
import { Address, erc20Abi, formatUnits, isAddress } from 'viem'
import { getPublicClient, getSolanaConnection } from '../lib/clients'
import { PublicKey } from '@solana/web3.js'
import { useAppSelector } from '@/redux/store'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { getUserAssests } from '@/api/hyperliquid'

type SupportedAddress = Address | string // EVM or Solana
type SupportedAddresses = SupportedAddress | SupportedAddress[]

interface TokenConfig {
  symbol: string
  address: string | null
  decimals?: number // For Solana SPL tokens
}

interface ChainTokens {
  ethereum: TokenConfig[]
  arbitrum: TokenConfig[]
  // bsc: TokenConfig[];
  solana: TokenConfig[]
}

export function useMultiChainBalances(refreshTrigger?: any) {
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const EVMAddress = useSelector(_walletDex)?.walletAddress

  const userAddresses: SupportedAddresses = listWalletsByChain.map((wallet) => wallet.walletAddress)

  const [balances, setBalances] = useState<Record<string, string>>()
  const [hyperliquidWithdrawable, setHyperliquidWithdrawable] = useState<string>('')

  const tokens: ChainTokens = {
    ethereum: [{ symbol: 'ETH', address: null }],
    arbitrum: [
      { symbol: 'ETH', address: null },
      { symbol: 'USDC', address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831' },
    ],
    solana: [{ symbol: 'SOL', address: null }],
  }

  const clients = useMemo(
    () => ({
      ethereum: getPublicClient('eth'),
      bsc: getPublicClient('bsc'),
      arbitrum: getPublicClient('arbitrum'),
      solana: getSolanaConnection(),
    }),
    [],
  )

  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }

  const fetchEvmBalances = async (
    chainKey: 'ethereum' | 'arbitrum',
    tokenList: TokenConfig[],
    userAddr: Address,
  ): Promise<Record<string, string>> => {
    const client = clients[chainKey]
    const results: Record<string, string> = {}

    for (const token of tokenList) {
      const balanceKey = `${chainKey.toUpperCase()}_${token.symbol}`

      if (token.address && !isAddress(token.address)) {
        console.error(`Invalid address for token ${token.symbol} on ${chainKey}: ${token.address}`)
        results[balanceKey] = '0'
        continue
      }

      try {
        let raw: bigint, decimals: number

        if (!token.address) {
          // Native token
          raw = await client.getBalance({ address: userAddr })
          decimals = 18
        } else {
          // ERC20 token
          ;[raw, decimals] = await Promise.all([
            client.readContract({
              abi: erc20Abi,
              address: token.address as Address,
              functionName: 'balanceOf',
              args: [userAddr],
            }),
            client.readContract({
              abi: erc20Abi,
              address: token.address as Address,
              functionName: 'decimals',
            }),
          ])
        }

        results[balanceKey] = formatUnits(raw, decimals)
      } catch (err) {
        console.error(`Error fetching ${token.symbol} balance on ${chainKey}:`, err)
        results[balanceKey] = '0'
      }
    }

    return results
  }

  const fetchBscBalances = async (
    chainKey: 'bsc',
    tokenList: TokenConfig[],
    userAddr: Address,
  ): Promise<Record<string, string>> => {
    const client = clients[chainKey]
    const results: Record<string, string> = {}

    for (const token of tokenList) {
      const balanceKey = `${chainKey.toUpperCase()}_BNB`

      if (token.address && !isAddress(token.address)) {
        console.error(`Invalid address for token ${token.symbol} on ${chainKey}: ${token.address}`)
        results[balanceKey] = '0'
        continue
      }

      try {
        let raw: bigint, decimals: number

        if (!token.address) {
          // Native token
          raw = await client.getBalance({ address: userAddr })
          decimals = 18
        } else {
          // BEP20 token
          ;[raw, decimals] = await Promise.all([
            client.readContract({
              abi: erc20Abi,
              address: token.address as Address,
              functionName: 'balanceOf',
              args: [userAddr],
            }),
            client.readContract({
              abi: erc20Abi,
              address: token.address as Address,
              functionName: 'decimals',
            }),
          ])
        }

        results[balanceKey] = formatUnits(raw, decimals)
      } catch (err) {
        console.error(`Error fetching ${token.symbol} balance on ${chainKey}:`, err)
        results[balanceKey] = '0'
      }
    }

    return results
  }

  const fetchSolanaBalances = async (tokenList: TokenConfig[], userAddr: string): Promise<Record<string, string>> => {
    const connection = clients.solana
    const results: Record<string, string> = {}

    try {
      const publicKey = new PublicKey(userAddr)

      for (const token of tokenList) {
        const balanceKey = `SOLANA_${token.symbol}`

        try {
          if (!token.address) {
            // Native SOL
            const balance = await connection.getBalance(publicKey)
            results[balanceKey] = (balance / 1e9).toString() // Convert lamports to SOL
          } else {
            // SPL Token - you'll need to implement SPL token balance fetching
            // This requires @solana/spl-token package
            console.warn(`SPL token balance fetching not implemented for ${token.symbol}`)
            results[balanceKey] = '0'
          }
        } catch (err) {
          console.error(`Error fetching ${token.symbol} balance on Solana:`, err)
          results[balanceKey] = '0'
        }
      }
    } catch (err) {
      console.error('Invalid Solana address:', err)
      // Set all Solana balances to 0 if address is invalid
      tokenList.forEach((token) => {
        results[`SOLANA_${token.symbol}`] = '0'
      })
    }

    return results
  }

  const fetchWebData2 = async () => {
    if (!EVMAddress) return
    try {
      const clearinghouseStateData = await getUserAssests(EVMAddress)
      if (clearinghouseStateData && clearinghouseStateData.withdrawable) {
        setHyperliquidWithdrawable(clearinghouseStateData.withdrawable)
      }
    } catch (error) {
      console.log('fetchWebData2 error: ', error)
    }
  }

  const fetchAllBalances = async () => {
    if (!userAddresses) return {}

    const addressList = Array.isArray(userAddresses) ? userAddresses : [userAddresses]

    const results: Record<string, string> = {}

    try {
      const promises: Promise<Record<string, string>>[] = []

      for (const address of addressList) {
        const isEvm = typeof address === 'string' && address.startsWith('0x') && isAddress(address)
        const isSol = typeof address === 'string' && isValidSolanaAddress(address)

        if (isEvm) {
          promises.push(
            fetchEvmBalances('arbitrum', tokens.arbitrum, address as Address),
            fetchEvmBalances('ethereum', tokens.ethereum, address as Address),
            fetchBscBalances('bsc', tokens.ethereum, address as Address),
          )
        }

        if (isSol) {
          promises.push(fetchSolanaBalances(tokens.solana, address as string))
        }
      }

      // if (isEvmAddress) {
      //   // Fetch EVM balances
      //   promises.push(
      //     fetchEvmBalances('eth', tokens.eth, userAddress  as Address),
      //     // fetchEvmBalances('bsc', tokens.bsc, userAddress as Address),
      //     fetchEvmBalances('arbitrum', tokens.arbitrum, userAddress  as Address)
      //   );
      // }

      // if (isSolanaAddress) {
      //   // Fetch Solana balances
      //   // promises.push(fetchSolanaBalances(tokens.solana, userAddress  as string));
      // }

      await fetchWebData2()

      if (refreshTrigger) {
        const balanceResults = await Promise.all(promises)
        // Merge all results
        balanceResults.forEach((result) => {
          Object.assign(results, result)
        })
      }
    } catch (error) {
      console.error('Error fetching balances:', error)
    }

    setBalances(results)
  }

  useEffect(() => {
    if (!userAddresses) return

    const controller = new AbortController()

    fetchAllBalances()

    return () => controller.abort()
  }, [refreshTrigger])

  return { balances, refetch: fetchAllBalances, hyperliquidWithdrawable }
}
