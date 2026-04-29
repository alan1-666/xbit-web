import { useState, useEffect, useRef } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { ethers } from 'ethers'
import { TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'

type BalanceInfo = {
  balance: number // in SOL/ETH
  rawBalance: string // in lamports/wei
  isLoading: boolean
  error: string | null
  accountType: TYPE_ACCOUNT
}

// Cache to store previous balance values to prevent flickering
interface BalanceCache {
  [key: string]: {
    chain: TYPE_CHAIN
    balance: number
    rawBalance: string
    timestamp: number
  }
}

/**
 * Hook to get real-time balance updates for both Ethereum and Solana wallets
 * @param accountType The account type (TEGRAM or CHAIN)
 * @param chainType The blockchain type (ETH or SOLANA)
 * @param walletId The wallet address to track
 * @param endpoint RPC endpoint for the blockchain
 * @param refreshInterval Polling interval in milliseconds if websocket fails
 * @returns Balance information for the specified wallet
 */
export const useMultiChainRealtimeBalance = (
  accountType: TYPE_ACCOUNT,
  chainType: TYPE_CHAIN,
  walletId: string | null,
  endpoint: string,
  refreshInterval = 10000,
): BalanceInfo => {
  // Static cache to store previous balance values between renders
  const balanceCacheRef = useRef<BalanceCache>({})

  // Create cache key
  const getCacheKey = (chain: TYPE_CHAIN, address: string) => `${chain}:${address}`

  // Initial state with cached value if available
  const getInitialState = (): BalanceInfo => {
    if (walletId) {
      const cacheKey = getCacheKey(chainType, walletId)
      const cachedData = balanceCacheRef.current[cacheKey]

      // Use cached value if available and relatively fresh (< 30 seconds old)
      if (cachedData && Date.now() - cachedData.timestamp < 30000) {
        return {
          balance: cachedData.balance,
          rawBalance: cachedData.rawBalance,
          isLoading: true, // Still mark as loading to show we're refreshing
          error: null,
          accountType: accountType,
        }
      }
    }

    // Default initial state
    return {
      balance: 0,
      rawBalance: '0',
      isLoading: walletId !== null, // Only show loading if we have a wallet
      error: null,
      accountType: accountType,
    }
  }

  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>(getInitialState)

  // Use refs to track interval IDs and event subscriptions
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const providerRef = useRef<ethers.JsonRpcProvider | null>(null)
  const connectionRef = useRef<Connection | null>(null)
  const currentChainRef = useRef<TYPE_CHAIN | null>(null)
  const currentWalletRef = useRef<string | null>(null)

  // Track if component is mounted
  const isMountedRef = useRef(true)

  // Update balance with debouncing and caching
  const updateBalanceState = (
    chain: TYPE_CHAIN,
    address: string,
    balance: number,
    rawBalance: string,
    error: string | null = null,
  ) => {
    if (!isMountedRef.current) return

    // Only update if this is still the active chain and wallet
    if (currentChainRef.current === chain && currentWalletRef.current === address) {
      // Update the cache
      const cacheKey = getCacheKey(chain, address)
      if (!error) {
        balanceCacheRef.current[cacheKey] = {
          chain,
          balance,
          rawBalance,
          timestamp: Date.now(),
        }
      }

      setBalanceInfo({
        balance,
        rawBalance,
        isLoading: false,
        error,
        accountType: accountType,
      })
    }
  }

  // Cleanup function to clear all active subscriptions and intervals
  const cleanupAll = () => {
    // Clear interval if exists
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }

    // Remove ETH event listeners and cleanup provider
    if (providerRef.current) {
      try {
        providerRef.current.removeAllListeners()
        // Force provider cleanup
        providerRef.current = null
      } catch (err) {
        console.warn('Error removing ETH listeners:', err)
      }
    }

    // Clear connection reference
    if (connectionRef.current) {
    connectionRef.current = null
    }
  }

  useEffect(() => {
    // Set the mounted ref
    isMountedRef.current = true

    // Return cleanup function for unmounting
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Update refs
    currentChainRef.current = chainType
    currentWalletRef.current = walletId

    // Always reset the state with cached values if available
    setBalanceInfo(getInitialState())

    // First cleanup any existing subscriptions
    cleanupAll()

    if (!walletId) {
      return
    }

    let cleanup: (() => void) | undefined

    if (chainType === TYPE_CHAIN.ETH || chainType === TYPE_CHAIN.ARB) {
      cleanup = setupEthereumBalance(walletId, endpoint, refreshInterval)
    } else if (chainType === TYPE_CHAIN.SOLANA) {
      cleanup = setupSolanaBalance(walletId, endpoint, refreshInterval)
    } else {
      setBalanceInfo({
        balance: 0,
        rawBalance: '0',
        isLoading: false,
        error: `Unsupported chain type: ${chainType}`,
        accountType: accountType,
      })
    }

    // Return cleanup function
    return () => {
      if (cleanup) cleanup()
    }
  }, [accountType, chainType, walletId, endpoint, refreshInterval])

  // Setup Ethereum balance tracking
  const setupEthereumBalance = (address: string, rpcUrl: string, interval: number): (() => void) => {
    let isSubscribed = true
    let provider: ethers.JsonRpcProvider | null = null

    // Initialize and start tracking
    const startTracking = async () => {
      try {
        // Create provider with specific options to handle WebSocket connections
        provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
          batchMaxCount: 1,
          batchStallTime: 10,
          cacheTimeout: 2000,
          staticNetwork: true,
        })
        providerRef.current = provider

        console.log('provider', provider, rpcUrl)
        
        // Single balance check function
        const checkBalance = async () => {
          if (!isSubscribed || !provider) return

        try {
          const balance = await provider.getBalance(address)
          const balanceEth = parseFloat(ethers.formatEther(balance))
            updateBalanceState(currentChainRef.current || TYPE_CHAIN.ETH, address, balanceEth, balance.toString())
          } catch (error: any) {
            console.error(`Error fetching ${currentChainRef.current} balance:`, error)
          if (isSubscribed) {
              updateBalanceState(
                currentChainRef.current || TYPE_CHAIN.ETH,
                address,
                0,
                '0',
                `Error fetching balance: ${error.message}`,
              )
            }
          }
        }

        // Make initial balance check
        await checkBalance()

        // Cleanup function
        return () => {
          isSubscribed = false
          if (provider) {
            provider.removeAllListeners()
            provider = null
          }
        }
      } catch (err: any) {
        if (!isSubscribed) return // Skip state update if unmounted

        console.error(`Error setting up ${currentChainRef.current} balance tracking:`, err)
        updateBalanceState(
          currentChainRef.current || TYPE_CHAIN.ETH,
          address,
          0,
          '0',
          err?.message || `Failed to connect to ${currentChainRef.current}`,
        )
      }
    }

    // Start tracking immediately
    startTracking()

    // Return cleanup function
    return () => {
      isSubscribed = false
      cleanupAll()
    }
  }

  // Setup Solana balance tracking
  const setupSolanaBalance = (address: string, rpcUrl: string, interval: number): (() => void) => {
    let isSubscribed = true
    let publicKey: PublicKey

    try {
      publicKey = new PublicKey(address)
    } catch (error) {
      updateBalanceState(TYPE_CHAIN.SOLANA, address, 0, '0', 'Invalid Solana address')
      return () => {}
    }

    const startTracking = async () => {
      try {
        const connection = new Connection(rpcUrl, {
          commitment: 'confirmed',
        })
        connectionRef.current = connection

        // Get initial balance
        try {
          const lamports = await connection.getBalance(publicKey)
          updateBalanceState(
            TYPE_CHAIN.SOLANA,
            address,
            lamports / 1000000000, // Convert lamports to SOL
            lamports.toString(),
          )
        } catch (error: any) {
          console.error('Error getting initial SOL balance:', error)

          if (isSubscribed) {
            updateBalanceState(
              TYPE_CHAIN.SOLANA,
              address,
              0,
              '0',
              `Error: ${error?.message || 'Failed to get balance'}`,
            )
          }
        }
      } catch (err: any) {
        if (!isSubscribed) return

        updateBalanceState(TYPE_CHAIN.SOLANA, address, 0, '0', err?.message || 'Failed to connect to Solana')
      }
    }

    startTracking()

    // Return cleanup function
    return () => {
      isSubscribed = false
      cleanupAll()
    }
  }

  return balanceInfo
}
