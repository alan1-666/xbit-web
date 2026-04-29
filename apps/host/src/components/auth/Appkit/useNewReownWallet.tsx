import { useState, useEffect, useCallback } from 'react'
import { useAppKitAccount, useAppKitState } from '@reown/appkit/react'
import { modal } from './reownConfig'
import { WalletState } from './wallet'

interface UseReownWalletReturn {
  walletProvider: any
  walletState: WalletState
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  signMessage: (message: string) => Promise<string | null>
  isLoading: boolean
  error: string | null
}

export const useNewReownWallet = () => {
  const { address, isConnected } = useAppKitAccount()
  const { selectedNetworkId } = useAppKitState()

  const [walletProvider, setWalletProvider] = useState<any>(null)

  useEffect(() => {
    const getProvider = async () => {
      try {
        if (isConnected && selectedNetworkId) {
          // Đợi một chút để đảm bảo provider đã sẵn sàng
          setTimeout(() => {
            const provider = modal.getWalletProvider()
            setWalletProvider(provider)
          }, 100)
        } else {
          setWalletProvider(null)
        }
      } catch (error) {
        console.warn('Provider not ready:', error)
        setWalletProvider(null)
      }
    }

    getProvider()
  }, [isConnected, selectedNetworkId])

  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    publicKey: null,
    walletName: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cập nhật wallet state khi connection thay đổi
  useEffect(() => {
    setWalletState({
      isConnected: isConnected || false,
      publicKey: address || null,
      walletName: walletProvider?.name || 'Unknown Wallet',
    })

    // Clear error khi kết nối thành công
    if (isConnected && address) {
      setError(null)
    }
  }, [isConnected, address, walletProvider])

  // Kết nối ví
  const connectWallet = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await modal.open()
    } catch (err) {
      setError(`Connection failed: ${err}`)
      console.error('Connection error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('walletState', walletState)
    if (walletState?.isConnected && address) {
      console.log('vao day k')
      // setWallet({
      //   signMessage: async (message: any) => {
      //     const provider: any = modal?.getWalletProvider()
      //     const signedMessage = await provider?.signMessage(Buffer.from(message))
      //     return Buffer.from(signedMessage).toString('hex')
      //   },
      //   getPublicKey: () => Buffer.from(new PublicKey(address)?.toBuffer()).toString('hex'),
      //   type: 'solana',
      // } as any)
    }
  }, [walletState, address])

  // Ngắt kết nối ví
  const disconnectWallet = useCallback(async () => {
    setIsLoading(true)
    try {
      await modal.disconnect()
      setWalletState({
        isConnected: false,
        publicKey: null,
        walletName: null,
      })
    } catch (err) {
      setError(`Disconnect failed: ${err}`)
      console.error('Disconnect error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return
  ;<></>
}
