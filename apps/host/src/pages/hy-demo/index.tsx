import React, { useState, useEffect } from 'react'
import {
  ethers,
  isHexString,
  verifyTypedData,
  getBytes,
  hexlify,
  parseEther,
  TypedDataDomain,
  Signature,
  TypedDataField,
} from 'ethers'
import { checkHyperLiquidWallet, updateHyperLiquidWalletMutation } from '@services/auth.service.ts'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { useSwitchChain } from 'wagmi'
import { arbitrumSepolia, arbitrum } from 'wagmi/chains'

type NetworkConfig = {
  apiUrl: string
  chainIdHex: string
}

type HyperliquidConfig = {
  mainnet: NetworkConfig
  testnet: NetworkConfig
}

const HYPERLIQUID_CONFIG: HyperliquidConfig = {
  mainnet: {
    apiUrl: 'https://api.hyperliquid.xyz',
    chainIdHex: '0xa4b1',
  },
  testnet: {
    apiUrl: 'https://api.hyperliquid-testnet.xyz',
    chainIdHex: '0x66eee',
  },
}




type OperationType = 'approveAgent' | 'approveBuilderFee' 

const HyperliquidManager: React.FC = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [account, setAccount] = useState<string>('')
  const [network, setNetwork] = useState<keyof HyperliquidConfig>('testnet')
  const [operationParams, setOperationParams] = useState<{
    agentAddress?: string
    referralCode?: string
    builderAddress?: string
    maxFeeRate?: string
    wei?: string
  }>({})
  const [txStatus, setTxStatus] = useState<{
    loading: boolean
    success: boolean
    message: string
    txHash?: string
  }>({ loading: false, success: false, message: '' })

  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum)

        const network = await browserProvider.getNetwork()
        console.log('Chain ID:', network.chainId)
        console.log('Chain name:', network.name)

        const accounts = await browserProvider.send('eth_requestAccounts', [])
        if (accounts.length > 0) {
          setProvider(browserProvider)
          setAccount(accounts[0])
        }

        /*  const sdk = new window.HyperliquidSDK.Hyperliquid({
          testnet: true,
          enableWs: true
        });

        // Connect to the API
        await sdk.connect();

        // Get market data
        const assets = await sdk.info.getAllAssets(); */

        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          setAccount(newAccounts[0] || '')
        })

        window.ethereum.on('chainChanged', (chainId: string) => {
          console.log('Network changed:', chainId)
        })
      }
    }
    initWallet()
    return () => {
      window.ethereum?.removeAllListeners()
    }
  }, [])

  const signRequest = async (operation: OperationType, payload: any) => {
    if (!provider) throw new Error('Wallet not connected')


    const signer = await provider.getSigner()
    const nonce = Date.now()

    const domain: TypedDataDomain = {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: parseInt(HYPERLIQUID_CONFIG[network]?.chainIdHex, 16),
      verifyingContract: '0x0000000000000000000000000000000000000000', // 如果没有合约校验可填 0x000...
    }

    let types:Record<string, TypedDataField[]> = {}

    let message = {}

    if (operation === 'approveAgent') {
      types = {
        'HyperliquidTransaction:ApproveAgent': [
          { name: 'hyperliquidChain', type: 'string' }, 
          { name: 'agentAddress', type: 'address' },
          { name: 'agentName', type: 'string' }, 
          { name: 'nonce', type: 'uint64' }, 
        ],
      }
      // 构造 typedData 的 message 内容
      message = {
        type: 'approveAgent',
        hyperliquidChain: network.charAt(0).toUpperCase() + network.slice(1),
        signatureChainId: HYPERLIQUID_CONFIG[network]?.chainIdHex,
        agentAddress: ethers.getAddress(payload.agentAddress),
        agentName: payload.agentName || '',
        nonce: nonce,
      }
    }

    if (operation === 'approveBuilderFee') {
      types = {
        'HyperliquidTransaction:ApproveBuilderFee': [
          { name: 'hyperliquidChain', type: 'string' }, 
          { name: 'maxFeeRate', type: 'string' },
          { name: 'builder', type: 'address' }, 
          { name: 'nonce', type: 'uint64' }, 
        ],
      }
      // 构造 typedData 的 message 内容
      message = {
        type: 'approveBuilderFee',
        hyperliquidChain: network.charAt(0).toUpperCase() + network.slice(1),
        signatureChainId: HYPERLIQUID_CONFIG[network]?.chainIdHex,
        maxFeeRate: payload.maxFeeRate,
        builder: payload.builder || '',
        nonce: nonce,
      }
    }
    



    const flatSignature = await signer.signTypedData(domain, types, message)
    
    const recoveredAddress = verifyTypedData(domain, types, message, flatSignature)
    console.log('Recovered Address:', recoveredAddress)

    const structuredSignature = Signature.from(flatSignature)

    const signature = {
      r: structuredSignature.r,
      s: structuredSignature.s,
      v: structuredSignature.v,
    }

    return {
      action: message,
      nonce,
      signature,
    }
  }

  const executeOperation = async (operation: OperationType) => {
    setTxStatus({ loading: true, success: false, message: 'Processing...' })

    try {
      let payload = {}

      switch (operation) {
        case 'approveAgent':
          payload = {
            agentAddress: operationParams.agentAddress,
            agentName: 'my-wallet',
          }
          
          break

        case 'approveBuilderFee':
          payload = {
            builder: operationParams.builderAddress,
            maxFeeRate: operationParams.maxFeeRate,
          }
          break

    
      }

      const signedRequest = await signRequest(operation, payload)
      const response = await fetch(`${HYPERLIQUID_CONFIG[network].apiUrl}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signedRequest),
      })

      const result = await response.json()
      if (result.status === 'error') throw new Error(result.message)

      setTxStatus({
        loading: false,
        success: true,
        message: 'Transaction successful!',
        txHash: result.txHash,
      })
    } catch (error) {
      console.log('error', error)
      setTxStatus({
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const getUserInfo = async () => {
    const response = await fetch(`${HYPERLIQUID_CONFIG[network].apiUrl}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'clearinghouseState',
        user: '0xF55dB5DbFee200d023e8C9108233aEdB6E4a5d69',
      }),
    })
    const result = await response.json()
    console.log('getUserInfo', result)
  }

  const check = async () => {
    const { data } = await userGqlClient.mutate({
      mutation: checkHyperLiquidWallet,
    })

    console.log('check data:', data)
  }

  const now = Date.now();
  // hyperqliuid 默认过期时间是90天
  const sixtyDaysLater = now + 90 * 24 * 60 * 60 * 1000;

  const update = async () => {
    const { data } = await userGqlClient.mutate({
      mutation: updateHyperLiquidWalletMutation,
      variables: {
        input: {
          agentExpiredAt: sixtyDaysLater,
          setReferral: false,
          setFeeBuilder: true,
          feeBuilderAddress: "0x412D8e99A67009825d9b2dF572344D9d5Ae9D415",
          feeBuilderPercent: 1,
          referralCode: ""
        }
      }
    })

    console.log('update data:', data)
  }
  const { switchChain } = useSwitchChain()

  return (
    <div className="hyperliquid-manager">

    <div onClick={() => switchChain({ chainId: arbitrumSepolia.id})}>切换到arb链测试网</div>
    <div onClick={() => switchChain({ chainId: arbitrum.id})}>切换到arb链主网</div>

      <h2>Hyperliquid Manager</h2>

      <div className="network-selector">
        <label>
          Network:
          <select value={network} onChange={(e) => setNetwork(e.target.value as keyof HyperliquidConfig)}>
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </label>
      </div>

      <div className="operation-form">
        <div>
          <h3>Approve Agent</h3>
          <input
            type="text"
            placeholder="Agent Address"
            onChange={(e) =>
              setOperationParams((p) => ({
                ...p,
                agentAddress: e.target.value,
              }))
            }
          />
          <button onClick={() => executeOperation('approveAgent')} disabled={txStatus.loading}>
            Approve
          </button>
        </div>

        <div>
          <h3>Approve Builder Fee</h3>
          <input
            type="text"
            placeholder="Builder Address"
            onChange={(e) =>
              setOperationParams((p) => ({
                ...p,
                builderAddress: e.target.value,
              }))
            }
          />
          <input
            type="text"
            placeholder="Max Fee Rate (e.g., 0.001%)"
            onChange={(e) =>
              setOperationParams((p) => ({
                ...p,
                maxFeeRate: e.target.value,
              }))
            }
          />
          <button onClick={() => executeOperation('approveBuilderFee')} disabled={txStatus.loading}>
            Approve Fee
          </button>
        </div>

  
      </div>

      <div className={`status-box ${txStatus.success ? 'success' : 'error'}`}>
        {txStatus.loading && <div className="loader"></div>}
        <p>{txStatus.message}</p>
        {txStatus.txHash && (
          <a href={`https://arbiscan.io/tx/${txStatus.txHash}`} target="_blank" rel="noopener noreferrer">
            View Transaction
          </a>
        )}
      </div>

      <div onClick={() => getUserInfo()}>获取用户info</div>
      <div onClick={() => check()}>checkHyperLiquidWallet</div>
      <div onClick={() => update()}>updateHyperLiquidWallet</div>
    </div>
  )
}

export default HyperliquidManager
