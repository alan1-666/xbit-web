// src/wallets/OKXWalletAdapter.ts
import {
  BaseMessageSignerWalletAdapter,
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletDisconnectionError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSignTransactionError,
} from '@solana/wallet-adapter-base'
import { PublicKey, Transaction } from '@solana/web3.js'

interface OKXWallet {
  isOkxWallet?: boolean
  connect(): Promise<{ publicKey: string }>
  disconnect(): Promise<void>
  signTransaction(transaction: Transaction): Promise<Transaction>
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>
}

interface OKXWindow extends Window {
  okxwallet?: {
    solana?: OKXWallet
  }
  solana?: OKXWallet
}

declare const window: OKXWindow

export const OKXWalletName = 'OKX Wallet' as WalletName<'OKX Wallet'>
// export const OKXWalletIcon = '/images/wallets/ic-okx-wallet-1.svg'

export class OKXWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = OKXWalletName
  url = 'https://www.okx.com/web3/'
  icon = '/images/login/okx.png'
  readonly supportedTransactionVersions = null

  private _connecting: boolean
  private _wallet: OKXWallet | null
  private _publicKey: PublicKey | null
  private _readyState: WalletReadyState = WalletReadyState.NotDetected
  private _isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
  constructor() {
    super()
    this._connecting = false
    this._wallet = null
    this._publicKey = null

    if (this._isMobileDevice()) {
      this._readyState = WalletReadyState.Installed
      this.emit('readyStateChange', this._readyState)
    } else {
      scopePollingDetectionStrategy(() => {
        if (window.okxwallet?.solana) {
          this._readyState = WalletReadyState.Installed
          this.emit('readyStateChange', this._readyState)
          return true
        }
        return false
      })
    }
  }

  get publicKey(): PublicKey | null {
    return this._publicKey
  }

  get connecting(): boolean {
    return this._connecting
  }

  get connected(): boolean {
    return !!this._publicKey
  }

  get readyState(): WalletReadyState {
    return this._readyState
  }

  async checkIfOKXInstalled() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false)
      }, 2000)

      const start = Date.now()

      window.addEventListener('visibilitychange', () => {
        if (Date.now() - start < 1500) {
          clearTimeout(timeout)
          resolve(true)
        }
      })

      const dappUrl = window.location.href
      const encodedDappUrl = encodeURIComponent(dappUrl)
      const deepLink = 'okx://wallet/dapp/url?dappUrl=' + encodedDappUrl
      window.location.href = deepLink
    })
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return

      const wallet = window.okxwallet?.solana || window.solana!
      const isOKXInApp = /okxwallet/i.test(navigator.userAgent) || !!window.okxwallet?.solana

      // Mobile in-app
      if (this._isMobileDevice() && isOKXInApp) {
        this._connecting = true
        try {
          const { publicKey: publicKeyString } = await wallet.connect()
          const publicKey = new PublicKey(publicKeyString)

          this._wallet = wallet
          this._publicKey = publicKey
          this.emit('connect', publicKey)
          return
        } catch (error: any) {
          throw new WalletAccountError(error?.message, error)
        } finally {
          this._connecting = false
        }
      }

      if (this._isMobileDevice()) {
        const isAppInstalled = await this.checkIfOKXInstalled()
        if (!isAppInstalled) {
          throw new WalletNotReadyError('wallet_not_installed')
        }
      }

      // if (this._isMobileDevice()) {
      //   await this.checkIfOKXInstalled()
      // if (!isAppInstalled) {
      //   throw new WalletNotReadyError('wallet_not_installed')
      // }
      // const dappUrl = encodeURIComponent(window.location.href)
      // window.location.href = `okx://wallet/dapp/url?dappUrl=${dappUrl}&chain=solana`
      //   return
      // }

      // Desktop
      if (this._readyState !== WalletReadyState.Installed) {
        throw new WalletNotReadyError('wallet_not_installed')
      }
      if (!wallet) throw new WalletNotReadyError('wallet_not_installed')

      this._connecting = true
      try {
        const { publicKey: publicKeyString } = await wallet.connect()
        const publicKey = new PublicKey(publicKeyString)

        this._wallet = wallet
        this._publicKey = publicKey
        this.emit('connect', publicKey)
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error)
      } finally {
        this._connecting = false
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet
    if (wallet) {
      this._wallet = null
      this._publicKey = null

      try {
        await wallet.disconnect()
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error))
      }
    }

    this.emit('disconnect')
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        return await wallet.signTransaction(transaction)
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        return await wallet.signAllTransactions(transactions)
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        const { signature } = await wallet.signMessage(message)
        return signature
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }
}
