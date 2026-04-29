import { CHAIN_CONFIGS } from '@/components/transfer/constants'
import { RouteResponse } from '@/components/transfer/types/Route'
import axios from 'axios'
import { ethers, BrowserProvider, Contract, parseUnits } from 'ethers'
import { useState, useEffect } from 'react'
import { toHex } from 'viem'
import { useAccount, useSwitchChain, useWalletClient } from 'wagmi'

const HOST = 'https://unstable-api.xbit.live/api/dex'
const USDC_ADDRESS = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
const HYPERLIQUID_BRIDGE_ADDRESS = '0x2df1c51e09aecf9cacb7bc98cb1742757f163df7'
const USDC_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
]

const RangoDemo = () => {
  const { switchChain } = useSwitchChain()
  const { address, chain } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [account, setAccount] = useState<string>('')

  useEffect(() => {
    const initWallet = async () => {
      console.log('initWallet function started')
      try {
        if (window.ethereum) {
          console.log('Ethereum provider found')

          // Check the current network
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
          console.log('Current Chain ID:', currentChainId)

          // If the current network is not Binance Smart Chain, switch or add it
          if (currentChainId !== '0x38') {
            console.log('Switching to Binance Smart Chain...')
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x38',
                  chainName: 'Binance Smart Chain',
                  nativeCurrency: {
                    name: 'Binance Coin',
                    symbol: 'BNB',
                    decimals: 18,
                  },
                  rpcUrls: ['https://bsc-dataseed.binance.org/'],
                  blockExplorerUrls: ['https://bscscan.com'],
                },
              ],
            })
            console.log('Binance Smart Chain added or switched')
          } else {
            console.log('Already on Binance Smart Chain')
          }

          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          console.log('Account access requested')

          // Create a provider
          const provider = new BrowserProvider(window.ethereum, 'any')
          setProvider(provider)

          // Get the current network
          const currentNetwork = await provider.getNetwork()
          console.log('Chain ID:', currentNetwork.chainId)
          console.log('Chain Name:', currentNetwork.name)

          // Get accounts
          const accounts = await provider.send('eth_requestAccounts', [])
          console.log('Accounts:', accounts)

          if (accounts.length > 0) {
            setAccount(accounts[0])
            console.log('Account set:', accounts[0])
          }
        } else {
          console.error('Ethereum provider not found. Please install MetaMask.')
        }
      } catch (error) {
        console.error('Error in initWallet:', error)
      }
    }

    const testDepositHyperLiquid = async () => {
      console.log('!!!!! testDepositHyperLiquid')

      const chain = 'Arbitrum'
      await handleChainSwitch(chain)
      const provider = window.ethereum
      setProvider(provider)
      console.log('provider: ', provider)

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      })

      console.log('chainId: ', chainId)

      const chainIdDecimal = parseInt(chainId, 16)

      console.log('chainIdDecimal: ', chainIdDecimal)

      provider.on('chainChanged', async (chainId) => {
        console.log('chainChanged: ', chainId)

        if (chainIdDecimal === 42161) {
          const decimals = 6
          const parsedAmount = parseUnits(selectedSwapRoute.outputAmount + '', decimals)
          console.log('selectedSwapRoute.outputAmount: ', selectedSwapRoute.outputAmount)
          console.log('parsedAmount: ', parsedAmount)

          // Minimum 5 USDC
          const minAmount = parseUnits('5', decimals)
          if (parsedAmount < minAmount) {
            throw new Error('Amount must be at least 5 USDC.')
          }

          // Encode the transfer function call
          const transferData =
            '0xa9059cbb' + // transfer function selector
            HYPERLIQUID_BRIDGE_ADDRESS.slice(2).padStart(64, '0') + // address parameter
            parsedAmount // amount parameter with 6 decimals

          console.log('transferData: ', transferData)

          // Send transaction
          const txHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: provider.selectedAddress,
                to: USDC_ADDRESS,
                value: '0x0', // No ETH value for ERC20 transfer
                data: transferData,
              },
            ],
          })

          console.log('Deposit Hyperliquid Transaction hash:', txHash)
        }
      })
    }
    initWallet()
    // testDepositHyperLiquid()
    return () => {
      window.ethereum?.removeAllListeners()
    }
  }, [])

  const [step, setStep] = useState(0)

  const [routes, setRoutes] = useState<RouteResponse>()
  const [swaps, setSwaps] = useState<any[]>()

  const handleChainSwitch = async (chain: string) => {
    const provider = window.ethereum

    if (chain.toUpperCase() === 'SOLANA') {
      if (!window.solana) throw new Error('Solana wallet not found')
      await window.solana.connect()
      return
    }

    if (chain.toUpperCase() === 'TRON') {
      if (!window.tronWeb) throw new Error('TronLink not found')
      await window.tronWeb.request({ method: 'tron_requestAccounts' })
      return
    }

    const chainConfig = CHAIN_CONFIGS[chain.toUpperCase()]
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainConfig.chainId }],
      })
    } catch (switchError) {
      if (switchError.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainConfig.chainId,
              chainName: chainConfig.name,
              rpcUrls: [chainConfig.rpc],
              nativeCurrency: {
                name: chainConfig.symbol,
                symbol: chainConfig.symbol,
                decimals: chainConfig.decimals,
              },
            },
          ],
        })
      }
    }
  }

  const handleGetRoute = () => {
    axios
      .post(`${HOST}/v1/getAllPossibleRoutes`, {
        fromBlockchain: 'BSC',
        fromSymbol: 'BNB',
        fromTokenAddress: '',
        toBlockchain: 'ARBITRUM',
        toSymbol: 'USDC',
        toTokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        amount: '0.0001',
      })
      .then((res) => {
        console.log('handleGetRoute res', res)
        setRoutes(res.data.data)
        setSwaps(res.data.data.results[1].swaps)
        setStep(1)
      })
      .catch((err) => {
        console.error('handleGetRoute error', err)
      })
  }

  const handleConfirmRoute = () => {
    console.log('account: ', account)
    axios
      .post(`${HOST}/v1/confirmRoute`, {
        requestId: routes?.results[1].requestId,
        selectedWallets: [
          {
            blockchain: 'BSC',
            address: '0x6a7139543bff9c60a9c9edde60b65a2c36c7174a',
          },
          {
            blockchain: 'ARBITRUM',
            address: '0x6a7139543bff9c60a9c9edde60b65a2c36c7174a',
          },
        ],
      })
      .then((res) => {
        console.log('handleConfirmRoute res', res)
      })
      .catch((err) => {
        console.error('handleConfirmRoute error: ', err)
      })
  }

  const handleCreateTx = (step: number) => {
    axios
      .post(`${HOST}/v1/createTx`, {
        requestId: routes?.results[1].requestId,
        step: step,
        userSettings: {
          slippage: 0.5,
          infiniteApprove: false,
        },
        validations: {
          balance: true,
          fee: true,
          approve: true,
        },
      })
      .then(async (res) => {
        console.log('createTx res', res)
        console.log('res.data.data.transaction: ', res.data.data.transaction)

        if (res.data.code === 200) {
          if (res.data.data.transaction.blockChain === 'ARBITRUM') {
            console.log('switch to arbitrum')
            if (!provider) {
              console.error('Provider not initialized.')
              return
            }

            // switch to arbitrum
            await switchChain({ chainId: 42_161 })

            console.log('Switched to Arbitrum')

            // createTx
            const tx = {
              to: res.data.data.transaction.to,
              from: res.data.data.transaction.from,
              value: res.data.data.transaction.value === '' ? '0x0' : res.data.data.transaction.value,
              gasLimit:
                res.data.data.transaction.gasLimit === ''
                  ? routes?.results[1].swaps[1].fee[0].meta.gasLimit
                  : res.data.data.transaction.gasLimit,
              gasPrice:
                res.data.data.transaction.gasPrice === ''
                  ? routes?.results[1].swaps[1].fee[0].meta.gasPrice
                  : res.data.data.transaction.gasPrice,
              data: res.data.data.transaction.data,
            }
            console.log('tx: ', tx)
            const signer = await provider.getSigner()
            const response = await signer.sendTransaction(tx)
            console.log('response: ', response)
            console.log('response.hash: ', response.hash)
            console.log('estimatedTimeInSeconds', routes?.results[1].swaps[1].estimatedTimeInSeconds)

            setTimeout(
              () => {
                // checkStatus
                console.log('response.hash in setTimeout: ', response.hash)

                handleCallBack(response.hash)

                handleCheckStatus(response.hash)
              },
              (Number(routes?.results[1].swaps[1].estimatedTimeInSeconds) + 30) * 1000,
            )
          } else {
            const signer = await provider?.getSigner()
            console.log('signer: ', signer)
            const tx = {
              to: res.data.data.transaction.to,
              from: res.data.data.transaction.from,
              value: res.data.data.transaction.value === '' ? '0x0' : res.data.data.transaction.value,
              gasLimit:
                res.data.data.transaction.gasLimit === ''
                  ? routes?.results[1].swaps[step - 1].fee[0].meta.gasLimit
                  : res.data.data.transaction.gasLimit,
              gasPrice:
                res.data.data.transaction.gasPrice === ''
                  ? routes?.results[1].swaps[step - 1].fee[0].meta.gasPrice
                  : res.data.data.transaction.gasPrice,
              data: res.data.data.transaction.data,
            }
            console.log('tx: ', tx)
            const response = await signer.sendTransaction(tx)
            console.log('response: ', response)
            console.log('response.hash: ', response.hash)
            console.log('estimatedTimeInSeconds', routes?.results[1].swaps[0].estimatedTimeInSeconds)
            setTimeout(
              () => {
                // checkStatus
                console.log('response.hash in setTimeout: ', response.hash)
                handleCallBack(response.hash)
                handleCheckStatus(response.hash)
              },
              (Number(routes?.results[1].swaps[0].estimatedTimeInSeconds) + 30) * 1000,
            )
          }
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const handleCheckStatus = (txId: string) => {
    axios
      .post(`${HOST}/v1/checkStatus`, {
        requestId: routes?.results[1].requestId,
        txHash: txId,
        step: step,
      })
      .then((res) => {
        console.log('checkStatus res', res)

        if (res.data.data.status === 'success') {
          if (swaps && swaps.length > 1) {
            setStep((prev) => prev + 1)
            handleCreateTx(step)
          } else if (swaps && swaps.length === step) {
            // 交易结束
            console.log('交易结束')
          }
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const handleCallBack = (txId: string) => {
    axios
      .post(`${HOST}/v1/callBack`, {
        requestId: routes?.results[1].requestId,
        txHash: txId,
        step: step,
      })
      .then((res) => {
        console.log('handleCallBack res', res)
      })
      .catch((err) => {
        console.error('handleCallBack err: ', err)
      })
  }

  const handleGetAllPossibleRoutes = (
    fromBlockchain: string,
    fromSymbol: string,
    fromTokenAddress: string,
    toBlockchain: string,
    toSymbol: string,
    toTokenAddress: string,
    amount: string,
  ) => {
    return axios.post(`${HOST}/v1/getAllPossibleRoutes`, {
      fromBlockchain: fromBlockchain,
      fromSymbol: fromSymbol,
      fromTokenAddress: fromTokenAddress,
      toBlockchain: toBlockchain,
      toSymbol: toSymbol,
      toTokenAddress: toTokenAddress,
      amount: amount,
    })
  }

  const handleRouteConfirm = (requestId: string, selectedWallets: any[]) => {
    console.log('request id: ', requestId)
    console.log('selected wallets: ', selectedWallets)

    return axios.post(`${HOST}/v1/confirmRoute`, {
      requestId: requestId,
      selectedWallets: selectedWallets,
    })
  }

  const handleCreateTxBody = (requestId: string, step: number, slippage: number) => {
    return axios.post(`${HOST}/v1/createTx`, {
      requestId: requestId,
      step: Number(step),
      userSettings: {
        slippage: Number(slippage),
        infiniteApprove: false,
      },
      validations: {
        balance: true,
        fee: true,
        approve: true,
      },
    })
  }

  const handleRouteCallBack = (requestId: string, txHash: string, step: number) => {
    return axios.post(`${HOST}/v1/callBack`, {
      requestId: requestId,
      txHash: txHash,
      step: step,
    })
  }

  const handleCheckSwapStatus = (requestId: string, txHash: string, step: number) => {
    return axios.post(`${HOST}/v1/checkStatus`, {
      requestId: requestId,
      txHash: txHash,
      step: step,
    })
  }

  // solution 2 - step 1 bsc bnb -> arb eth
  const handleFirstStep = async () => {
    console.log('######## first step #########')
    console.log('bsc bnb -> arb eth')
    console.log('#############################')

    const transferAmount = 0.01 // 0.01 bnb ~~ $6.6

    // 1. get route
    const routesResult = await handleGetAllPossibleRoutes('BSC', 'BNB', '', 'ARBITRUM', 'ETH', '', transferAmount + '')
    console.log('routesResult: ', routesResult)

    const selectedRoute = routesResult.data.data.results[0]
    const outputAmount = routesResult.data.data.results[0].outputAmount
    console.log('selectedRoute: ', selectedRoute)
    console.log('outputAmount: ', outputAmount)
    const estimatedTimeInSeconds = selectedRoute.swaps[0].estimatedTimeInSeconds
    console.log('estimatedTimeInSeconds: ', estimatedTimeInSeconds)
    console.log('account: ', account)

    // 2. confirm route
    const confirmRoute = await handleRouteConfirm(selectedRoute.requestId, [
      {
        blockchain: selectedRoute.swaps[0].from.blockchain,
        address: account,
      },
      {
        blockchain: selectedRoute.swaps[0].to.blockchain,
        address: account,
      },
    ])
    console.log('confirmRoute: ', confirmRoute)

    // 3. create tx
    const createTxBody = await handleCreateTxBody(
      selectedRoute.requestId,
      1,
      selectedRoute.swaps[0].recommendedSlippage.slippage,
    )
    console.log('createTxBody: ', createTxBody)

    // 4. send tx
    const signer = await provider.getSigner()
    console.log('signer: ', signer)
    const tx = {
      to: createTxBody.data.data.transaction.to,
      from: createTxBody.data.data.transaction.from,
      value: createTxBody.data.data.transaction.value,
      gasLimit: createTxBody.data.data.transaction.gasLimit,
      gasPrice: createTxBody.data.data.transaction.gasPrice,
      data: createTxBody.data.data.transaction.data,
    }
    console.log('tx: ', tx)
    const response = await signer.sendTransaction(tx)
    console.log('response: ', response)

    const txHash = response.hash
    console.log('txHash: ', txHash)

    // 5. send callback
    if (txHash) {
      handleRouteCallBack(selectedRoute.requestId, txHash, 1)
    }

    // 6. send checkStatus
    setTimeout(
      async () => {
        const status = await handleCheckSwapStatus(selectedRoute.requestId, txHash, 1)
        console.log('status: ', status)

        if (status.data.data.status === 'success') {
          handleSecondStep(outputAmount)
        }
      },
      Number(estimatedTimeInSeconds) * 2 * 1000,
    )
  }
  // solution 2 - step 2 99.9% arb eth -> arb usdc
  const handleSecondStep = async (transferAmount: number) => {
    console.log('######## second step #########')
    console.log('99.9% arb eth -> arb usdc')
    console.log('##############################')

    // switch to arbitrum
    await switchChain({ chainId: 42_161 })

    // const ethAmount = Number(transferAmount) * 0.999
    const ethAmount = 0.002464
    console.log('eth amount: ', ethAmount)

    // 1. get route
    const routesResult = await handleGetAllPossibleRoutes(
      'ARBITRUM',
      'ETH',
      '',
      'ARBITRUM',
      'USDC ',
      '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      `${ethAmount}`,
    )
    console.log('SecondStep routesResult: ', routesResult)

    const selectedRoute = routesResult.data.data.results[0]
    console.log('SecondStep selectedRoute: ', selectedRoute)

    const outputAmount = routesResult.data.data.results[0].outputAmount
    console.log('SecondStep outputAmount: ', outputAmount)
    const estimatedTimeInSeconds = selectedRoute.swaps[0].estimatedTimeInSeconds
    console.log('estimatedTimeInSeconds: ', estimatedTimeInSeconds)

    // 2. confirm route
    const confirmRoute = await handleRouteConfirm(selectedRoute.requestId, [
      {
        blockchain: selectedRoute.swaps[0].from.blockchain,
        address: account,
      },
      {
        blockchain: selectedRoute.swaps[0].to.blockchain,
        address: account,
      },
    ])
    console.log('confirmRoute: ', confirmRoute)

    // 3. create tx
    const createTxBody = await handleCreateTxBody(
      selectedRoute.requestId,
      1,
      selectedRoute.swaps[0].recommendedSlippage.slippage,
    )
    console.log('createTxBody: ', createTxBody)

    // 4. send tx
    const signer = await provider.getSigner()
    console.log('signer: ', signer)
    const tx = {
      to: createTxBody.data.data.transaction.to,
      from: createTxBody.data.data.transaction.from,
      value: createTxBody.data.data.transaction.value,
      gasLimit: createTxBody.data.data.transaction.gasLimit,
      gasPrice:
        createTxBody.data.data.transaction.gasPrice === ''
          ? selectedRoute.swaps[0].fee[1].meta.gasPrice
          : createTxBody.data.data.transaction.gasPrice,
      data: createTxBody.data.data.transaction.data,
    }
    console.log('tx: ', tx)
    const response = await signer.sendTransaction(tx)
    console.log('response: ', response)

    const txHash = response.hash
    console.log('txHash: ', txHash)

    // 5. send callback
    if (txHash) {
      handleRouteCallBack(selectedRoute.requestId, txHash, 1)
    }

    // 6. send checkStatus
    setTimeout(
      async () => {
        const status = await handleCheckSwapStatus(selectedRoute.requestId, txHash, 1)
        console.log('status: ', status)
        if (status.data.data.status === 'success') {
          handleThirdStep(outputAmount)
        }
      },
      Number(estimatedTimeInSeconds) * 2 * 1000,
    )
  }

  // solution 2 - step 3 arb usdc -> hyperliquid
  const handleThirdStep = async (amount: number) => {
    console.log('######## third step #########')
    console.log('arb usdc -> hyperliquid')
    console.log('##############################')

    // switch to arbitrum
    console.log('Switching to Arbitrum...')
    await switchChain({ chainId: 42_161 })

    amount = 6.519688

    const newProvider = new BrowserProvider(window.ethereum, 'any')
    setProvider(newProvider) // Update the state with the new provider
    const network = await newProvider.getNetwork()
    console.log('Current Chain Name:', network.name)
    console.log('Current Chain ID:', network.chainId)

    if (network.chainId !== BigInt(42161)) {
      throw new Error('Failed to switch to Arbitrum')
    }

    const signer = await newProvider.getSigner()
    console.log('signer: ', signer)

    const usdc = new Contract(USDC_ADDRESS, USDC_ABI, signer)
    const decimals = 6

    const parsedAmount = parseUnits(amount + '', decimals)
    console.log('parsedAmount: ', parsedAmount)

    // Minimum 5 USDC
    const minAmount = parseUnits('5', decimals)
    if (parsedAmount < minAmount) {
      throw new Error('Amount must be at least 5 USDC.')
    }

    // Transfer directly to the bridge
    const tx = await usdc.transfer(HYPERLIQUID_BRIDGE_ADDRESS, parsedAmount)
    const receipt = await tx.wait()

    console.log('receipt: ', receipt)
    console.log('receipt.hash: ', receipt.hash)
  }

  // withdraw
  const withdraw = async () => {
    const time = Date.now()

    const destination = address
    const amount = '2' // example: 2 USDC
    const hyperliquidChain = 'Mainnet'
    const signatureChainId = toHex(chain?.id ?? 42161) // BSC chainId
    const type = 'withdraw3'
    const action = {
      type,
      destination,
      amount,
      hyperliquidChain,
      signatureChainId,
      time,
    }

    const payloadToSign = {
      action,
      isFrontend: true,
      nonce: time,
      vaultAddress: null,
    }

    const jsonString = JSON.stringify(payloadToSign)

    try {
      // const signature = await walletClient.signMessage({
      //   account: address,
      //   message: jsonString,
      // })
      const signature = await walletClient.signMessage({
        account: address,
        message: jsonString,
      })

      const sig = signature.startsWith('0x') ? signature.slice(2) : signature
      const r = '0x' + sig.slice(0, 64)
      const s = '0x' + sig.slice(64, 128)
      const v = parseInt(sig.slice(128, 130), 16)

      const fullPayload = {
        ...payloadToSign,
        signature: { r, s, v },
      }

      const res = await fetch('https://api-ui.hyperliquid.xyz/exchange', {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          Origin: 'https://app.hyperliquid.xyz',
          Referer: 'https://app.hyperliquid.xyz/',
        },
        body: JSON.stringify(fullPayload),
      })

      const result = await res.json()
      console.log(result)
    } catch (error) {
      console.error('Withdraw failed', error)
    }

    /*
    const message = `Withdraw request at ${timestamp}`;
    const signature = await signMessageAsync({ message });
    const { r, s, v } = parseSignature(signature);
    
    const body = {
      action: {
        type: "withdraw3",
        hyperliquidChain: "Mainnet",
        signatureChainId: toHex(chain?.id ?? 42161), 
        amount: "2",
        time: time,
        destination: address,
      },
      nonce: timestamp,
      signature: {
        r: r,
        s: s,
        v: Number(v)
      },
      isFrontend: true,
      vaultAddress: null
    };
    console.log("body: ", body);
    
    try {
      // const response = await axios.post('https://api.hyperliquid.xyz/exchange', body, {
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
      const response = await fetch('https://api.hyperliquid.xyz/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body) 
      });
      
      console.log('Withdrawal Response:', response);
    } catch (error) {
      console.error('Withdrawal Failed:', error);
    }
      */
  }

  return (
    <div className="px-3">
      <button className="mr-6" onClick={handleGetRoute}>
        获取路径
      </button>

      <button className="mr-6" onClick={handleConfirmRoute}>
        确认兑换路径
      </button>

      <button className="mr-6" onClick={() => handleCreateTx(1)}>
        创建交易
      </button>

      <button className="mr-6" onClick={() => handleCreateTx(2)}>
        创建交易2
      </button>

      <p className="mt-[50px]">方案2</p>

      <div className="mt-[10px]" onClick={() => handleFirstStep()}>
        1. 把0.01个BNB兑换成 100% Arbitrum ETH
      </div>
      <div className="mt-[10px]" onClick={() => handleSecondStep()}>
        2. 把(0.01 * 0.999)个 Arbitrum ETH 兑换成Arbitrum USDC
      </div>
      <div className="mt-[10px]" onClick={() => handleThirdStep()}>
        3. 把Arbitrum USDC转入Hyperliquid
      </div>

      <div className="mt-[50px]" onClick={() => withdraw()}>
        hyperliquid 提现
      </div>
    </div>
  )
}

export default RangoDemo
