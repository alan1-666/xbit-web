import {
  BaseMessageSignerWalletAdapter,
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletDisconnectionError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSignTransactionError,
} from '@solana/wallet-adapter-base'
import { PublicKey, Transaction } from '@solana/web3.js'
import { toast } from 'sonner'

interface BossWallet {
  isBoss?: boolean
  connect(): Promise<{ publicKey: string }>
  disconnect(): Promise<void>
  signTransaction(transaction: Transaction): Promise<Transaction>
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>
}

interface BossWindow extends Window {
  boss?: BossWallet
}

declare const window: BossWindow

export const BossWalletName = 'Boss Wallet' as WalletName<'Boss Wallet'>

export class BossWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = BossWalletName
  url = 'https://bosswallet.com/'
  icon = '/images/wallets/ic-boss-wallet.svg' // Update this with the actual icon URL
  readonly supportedTransactionVersions = null

  private _connecting: boolean
  private _wallet: BossWallet | null
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

    // if (this._isMobileDevice()) {
    //   this._readyState = WalletReadyState.Installed
    //   this.emit('readyStateChange', this._readyState)
    // } else {
    //   // Logic hiện tại cho desktop
    //   scopePollingDetectionStrategy(() => {
    //     if (window.boss) {
    //       this._readyState = WalletReadyState.Installed
    //       this.emit('readyStateChange', this._readyState)
    //       return true
    //     }
    //     return false
    //   })
    // }
    scopePollingDetectionStrategy(() => {
      if (window.boss) {
        this._readyState = WalletReadyState.Installed
        this.emit('readyStateChange', this._readyState)
        return true
      }
      return false
    })
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

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return
      if (this._readyState !== WalletReadyState.Installed) {
        toast.error('您未安装' + BossWalletName)
        throw new WalletNotReadyError()
      }

      this._connecting = true

      const wallet = window.boss
      if (!wallet) throw new WalletNotReadyError()

      if (!wallet.isBoss) throw new WalletNotReadyError()

      let publicKey: PublicKey
      try {
        const { publicKey: publicKeyString } = await wallet.connect()
        publicKey = new PublicKey(publicKeyString)
      } catch (error: any) {
        toast.error('连接钱包失败')
        throw new WalletAccountError(error?.message, error)
      }

      this._wallet = wallet
      this._publicKey = publicKey

      this.emit('connect', publicKey)
    } catch (error: any) {
      this.emit('error', error)
      throw error
    } finally {
      this._connecting = false
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
