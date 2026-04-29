import { WalletDisconnectionError, WalletName, WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { Transaction } from '@solana/web3.js'
import { toast } from 'sonner'
import { EventEmitter } from 'events'

export const MetaMaskWalletName = 'MetaMask' as WalletName<'MetaMask'>

export class MetaMaskWalletAdapter extends EventEmitter {
  name = MetaMaskWalletName
  url = 'https://metamask.io/'
  icon = '/images/login/metamask.png'

  private _connecting: boolean
  private _wallet: any | null
  private _publicKey: string | null

  constructor() {
    super()
    this._connecting = false
    this._wallet = null
    this._publicKey = null
  }

  get publicKey(): string | null {
    return this._publicKey
  }

  get connecting(): boolean {
    return this._connecting
  }

  get connected(): boolean {
    return !!this._publicKey
  }

  async connect(): Promise<void> {
    try {
      if (this._connecting) return
      this._connecting = true

      const wallet = await getMetaMaskProvider()
      if (!wallet) throw new Error('wallet_not_installed')
      this._wallet = wallet

      const permissions = await wallet.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })

      const accounts = permissions
        .find((p: any) => p.parentCapability === 'eth_accounts')
        ?.caveats.find((c: any) => c.type === 'restrictReturnedAccounts')?.value

      const finalAddress = accounts?.[0] || (await wallet.request({ method: 'eth_accounts' }))[0]

      if (!finalAddress) throw new Error('No accounts selected')

      this._publicKey = finalAddress

      wallet.removeAllListeners?.('accountsChanged')
      wallet.on('accountsChanged', (newAccounts: string[]) => {
        if (newAccounts.length > 0) {
          this._publicKey = newAccounts[0]
          this.emit('connect', this._publicKey)
        } else {
          this.disconnect()
        }
      })

      this.emit('connect', this._publicKey)
    } catch (error: any) {
      this.emit('error', error)
      throw error
    } finally {
      this._connecting = false
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet

    this._wallet = null
    this._publicKey = null

    try {
      if (wallet?.disconnect) await wallet.disconnect()
    } catch (error: any) {
      this.emit('error', new WalletDisconnectionError(error?.message, error))
    }

    this.emit('disconnect')
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      return await wallet.signTransaction(transaction)
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      return await wallet.signAllTransactions(transactions)
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      const { signature } = await wallet.signMessage(message)
      return signature
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }
}

export const getMetaMaskProvider = async (): Promise<any | null> => {
  let discovered: any[] = []

  const listener = (event: any) => {
    discovered.push(event.detail)
  }

  window.addEventListener('eip6963:announceProvider', listener)
  window.dispatchEvent(new Event('eip6963:requestProvider'))

  await new Promise((r) => setTimeout(r, 50))

  window.removeEventListener('eip6963:announceProvider', listener)

  const metamaskViaEIP6963 = discovered.find((p) => p.info?.rdns?.includes('metamask'))?.provider

  return metamaskViaEIP6963 ? metamaskViaEIP6963 : null
}
