import { Interface } from 'ethers'
import Decimal from 'decimal.js'
import { ServiceConfig } from '@/lib/gql/service-config.ts'

export const RPC_URL = import.meta.env.VITE_RPC_PROXY_MEME + '?chain=POLYGON'

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: number
  method: string
  params: unknown[]
}

export interface JsonRpcResponse<T = string> {
  jsonrpc: '2.0'
  id: number
  result: T
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

const CTF_ADDRESS = '0x4d97dcd97ec945f40cf65f87097ace5ea0476045'
const CTF_ABI = ['function balanceOf(address owner, uint256 id) view returns (uint256)']

abstract class BaseRpcService {
  protected iface: Interface
  protected ctfIface: Interface
  protected constructor() {
    this.iface = new Interface(ERC20_ABI)
    this.ctfIface = new Interface(CTF_ABI)
  }

  async rpcCall<T = string>(body: JsonRpcRequest): Promise<JsonRpcResponse<T>> {
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ServiceConfig.token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }

    return res.json()
  }

  async ethCall<T = string>(to: string, data: string, id: number): Promise<JsonRpcResponse<T>> {
    const body: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method: 'eth_call',
      params: [
        {
          to,
          data,
        },
        'latest',
      ],
    }
    return this.rpcCall(body)
  }

  async encodeBalanceOf(address: string): Promise<string> {
    return this.iface.encodeFunctionData('balanceOf', [address])
  }

  async encodeDecimals(): Promise<string> {
    return this.iface.encodeFunctionData('decimals', [])
  }
}

interface IRpcService {
  getBalanceOf(address: string, token: string): Promise<number>
  getConditionTokenBalance(address: string, tokenId: string): Promise<number>
}

class RpcService extends BaseRpcService implements IRpcService {
  constructor() {
    super()
  }

  async getBalanceOf(address: string, token: string): Promise<number> {
    const balanceData = await this.encodeBalanceOf(address)
    const decimalsData = await this.encodeDecimals()

    const [balanceRes, decimalsRes] = await Promise.all([
      this.ethCall(token, balanceData, 1),
      this.ethCall(token, decimalsData, 2),
    ])

    const balanceRaw = this.iface.decodeFunctionResult('balanceOf', balanceRes.result)[0]
    const decimals = this.iface.decodeFunctionResult('decimals', decimalsRes.result)[0]

    return Decimal(balanceRaw.toString()).div(Decimal.pow(10, decimals)).toNumber()
  }

  async getConditionTokenBalance(address: string, tokenId: string): Promise<number> {
    const balanceData = this.ctfIface.encodeFunctionData('balanceOf', [address, tokenId])
    const balanceRes = await this.ethCall(CTF_ADDRESS, balanceData, 3)
    const balanceRaw = this.ctfIface.decodeFunctionResult('balanceOf', balanceRes.result)[0]
    return Decimal(balanceRaw.toString()).div(Decimal.pow(10, 6)).toDecimalPlaces(2, Decimal.ROUND_FLOOR).toNumber()
  }
}

export const rpcService: IRpcService = new RpcService()
