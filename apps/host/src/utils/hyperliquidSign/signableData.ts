import { TypedDataEncoder } from 'ethers'
import {
  OperationType,
  ApproveAgentPayload,
  ApproveBuilderFeePayload,
  WithdrawPayload,
  SendAssetPayload,
  CancelOrdersPayload,
} from './types'
import { Configs } from '@/const/configs'

const HYPERLIQUID_CONFIG = Configs.getHyperliquidConfig()
const chainId = parseInt(HYPERLIQUID_CONFIG.chainIdHex, 16)
const network = capitalize(HYPERLIQUID_CONFIG.env)

interface BuildSignableDataParams {
  operation: OperationType
  payload: ApproveAgentPayload | ApproveBuilderFeePayload | CancelOrdersPayload | WithdrawPayload | SendAssetPayload
}

export async function buildSignableData({ operation, payload }: BuildSignableDataParams): Promise<{
  signableData: string
  nonce: number
  message: Record<string, any>
  types: Record<string, Array<{ name: string; type: string }>>
  domain: Record<string, any>
  primaryType: string
}> {
  const nonce = Date.now()

  const domain = {
    name: 'HyperliquidSignTransaction',
    version: '1',
    chainId,
    verifyingContract: '0x0000000000000000000000000000000000000000',
  }

  let types: Record<string, Array<{ name: string; type: string }>>
  let message: Record<string, any>
  let primaryType: string

  if (operation === 'approveAgent') {
    const data = payload as ApproveAgentPayload

    primaryType = 'HyperliquidTransaction:ApproveAgent'
    types = {
      [primaryType]: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'agentAddress', type: 'address' },
        { name: 'agentName', type: 'string' },
        { name: 'nonce', type: 'uint64' },
      ],
    }

    message = {
      type: 'approveAgent',
      hyperliquidChain: capitalize(network),
      signatureChainId: HYPERLIQUID_CONFIG.chainIdHex,
      agentAddress: data.agentAddress,
      agentName: data.agentName || '',
      nonce,
    }
  } else if (operation === 'approveBuilderFee') {
    const data = payload as ApproveBuilderFeePayload

    primaryType = 'HyperliquidTransaction:ApproveBuilderFee'
    types = {
      [primaryType]: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'maxFeeRate', type: 'string' },
        { name: 'builder', type: 'address' },
        { name: 'nonce', type: 'uint64' },
      ],
    }

    message = {
      type: 'approveBuilderFee',
      hyperliquidChain: capitalize(network),
      signatureChainId: HYPERLIQUID_CONFIG.chainIdHex,
      maxFeeRate: data.maxFeeRate,
      builder: data.builder,
      nonce,
    }
  } else if (operation === 'withdraw') {
    const data = payload as WithdrawPayload

    primaryType = 'HyperliquidTransaction:Withdraw'
    types = {
      [primaryType]: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'destination', type: 'string' },
        { name: 'amount', type: 'string' },
        { name: 'time', type: 'uint64' },
      ],
    }

    message = {
      type: 'withdraw3',
      hyperliquidChain: capitalize(network),
      signatureChainId: HYPERLIQUID_CONFIG.chainIdHex,
      amount: data.amount,
      time: data.time,
      destination: data.destination,
      nonce: data.time,
    }
  } else if (operation === 'sendAsset') {
    const data = payload as SendAssetPayload

    primaryType = 'HyperliquidTransaction:SendAsset'
    types = {
      [primaryType]: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'destination', type: 'string' },
        { name: 'sourceDex', type: 'string' },
        { name: 'destinationDex', type: 'string' },
        { name: 'token', type: 'string' },
        { name: 'amount', type: 'string' },
        { name: 'fromSubAccount', type: 'string' },
        { name: 'nonce', type: 'uint64' },
      ],
    }

    message = {
      type: 'sendAsset',
      signatureChainId: HYPERLIQUID_CONFIG.chainIdHex,
      ...data,
    }
  } else {
    throw new Error(`Unsupported operation: ${operation}`)
  }

  const signableData = TypedDataEncoder.encode(domain, types, message)

  return {
    signableData,
    nonce,
    message,
    types,
    domain,
    primaryType,
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
