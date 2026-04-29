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
import { _isMobileDevice } from '../utils'

interface BitgetWallet {
  isBitgetWallet?: boolean
  connect(): Promise<{ publicKey: string }>
  disconnect(): Promise<void>
  signTransaction(transaction: Transaction): Promise<Transaction>
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>
}

interface BitgetWindow extends Window {
  bitkeep?: {
    solana: BitgetWallet
  } 
  bitget?: BitgetWallet
}

declare const window: BitgetWindow

export const BitgetWalletName = 'Bitget Wallet' as WalletName<'Bitget Wallet'>

export class BitgetWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = BitgetWalletName
  url = 'https://web3.bitget.com/'
  icon = '/images/wallets/ic-bitget-wallet.svg'
  readonly supportedTransactionVersions = null

  private _connecting: boolean
  private _wallet: BitgetWallet | null
  private _publicKey: PublicKey | null
  private _readyState: WalletReadyState = WalletReadyState.NotDetected

  constructor() {
    super()
    this._connecting = false
    this._wallet = null
    this._publicKey = null

    if (_isMobileDevice()) {
      this._readyState = WalletReadyState.Installed
      this.emit('readyStateChange', this._readyState)
    } else {
      scopePollingDetectionStrategy(() => {
        if (window.bitget || window.bitkeep) {
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

  async checkIfBitgetInstalled() {
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
      const deepLink = 'bitkeep://bkconnect?action=dapp&url=' + encodedDappUrl
      window.location.href = deepLink
    })
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return
      if (this._readyState !== WalletReadyState.Installed) {
        toast.error('您未安装' + BitgetWalletName)  
        throw new WalletNotReadyError()
      }

      if (_isMobileDevice()) {
        const isAppInstalled = await this.checkIfBitgetInstalled()
        if (!isAppInstalled) {
          toast.error('您未安装' + BitgetWalletName)
          // return
          throw new WalletNotReadyError()
        }
      }

      this._connecting = true

      // Try bitget first, then fall back to bitkeep
      const wallet = window.bitkeep?.solana || window.bitget
      if (!wallet) throw new WalletNotReadyError()

      if (!wallet.isBitgetWallet && !(window.bitkeep && !wallet.isBitgetWallet)) {
        throw new WalletNotReadyError()
      }

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
      
      if (!wallet || !this._publicKey) throw new WalletNotConnectedError();

      // 如果未设置 feePayer，自动设置为当前钱包地址
      if (!transaction.feePayer) {
        transaction.feePayer = this._publicKey;
      }
      // 如果 feePayer 不是当前钱包地址，抛出错误
      else if (!transaction.feePayer.equals(this._publicKey)) {
        throw new Error("Transaction feePayer does not match connected wallet!");
      }
  
 
  

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
