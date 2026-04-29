import {
  WalletClient,
  TypedData,
  TypedDataDomain as ViemTypedDataDomain,
} from 'viem'
import {
  SignatureResult,
  OperationType,
  ApproveAgentPayload,
  ApproveBuilderFeePayload,
  CancelOrdersPayload,
} from './types'
import { toast } from 'sonner'
import { signTypedData } from 'viem/actions'
import { Configs } from '@/const/configs'

const HYPERLIQUID_CONFIG = Configs.getHyperliquidConfig()
const chainId = parseInt(HYPERLIQUID_CONFIG.chainIdHex, 16)
const network = capitalize(HYPERLIQUID_CONFIG.env)

interface SignRequestParams {
  walletClient: WalletClient
  address: `0x${string}`
  operation: OperationType
  payload: ApproveAgentPayload | ApproveBuilderFeePayload | CancelOrdersPayload
}

export async function signRequest({
  walletClient,
  address,
  operation,
  payload,
}: SignRequestParams): Promise<SignatureResult> {
  const nonce = Date.now()

  const domain: ViemTypedDataDomain = {
    name: 'HyperliquidSignTransaction',
    version: '1',
    chainId,
    verifyingContract: '0x0000000000000000000000000000000000000000',
  }

  let types: TypedData
  let message: Record<string, any>
  let primaryType: string

  try {
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
    } else {
      throw new Error(`Unsupported operation: ${operation}`)
    }

    const signature = await signTypedData(walletClient, {
      account: address,
      domain,
      types,
      primaryType,
      message,
    })

    const r = signature.slice(0, 66)
    const s = '0x' + signature.slice(66, 130)
    const v = parseInt(signature.slice(130, 132), 16)

    return {
      action: message,
      nonce,
      signature: { r, s, v },
    }
  } catch (error) {
    toast.error('签名失败')
    console.error('[signRequest] 签名失败:', error)

    return {
      action: {},
      nonce,
      signature: {
        r: '',
        s: '',
        v: 0,
      },
    }
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
