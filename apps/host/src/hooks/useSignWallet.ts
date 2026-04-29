import { useCallback, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { message_to_sign, TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'
import { useAppDispatch } from '@/redux/store'
import { _changeTokenAccount, authActions } from '@/redux/modules/auth.slice'
import { ChainType, InputLoginWalletV2Dto } from '@/@generated/gql/graphql-user'
import { useMultiChainWallet } from './useMultiChainWallet'
import { useWallet } from '@solana/wallet-adapter-react'
import { ServiceConfig } from '@/lib/gql/service-config'
import { Buffer } from 'buffer'
import { useSelector } from 'react-redux'
import { ChainIds } from '@/types/enums'
import { useTurnkey } from '@turnkey/sdk-react'
export default function useSignWallet({ isAutoConnect = true }: { isAutoConnect?: boolean }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage({})
  const dispatch = useAppDispatch()
  const { switchEvmChain, activeAccount, activeChain } = useMultiChainWallet({})
  const token = useSelector(_changeTokenAccount)
  const { walletClient } = useTurnkey()
  const autoSignOnConnectEvm = async () => {
    // dispatch(
    //   authActions.getNonce({
    //     address,
    //   }),
    // ).then(async (res) => {
    //   const nonce = res?.payload?.getNonce
    //   const message = message_to_sign(address!, nonce)

    //   console.log('message', message)
    //   await signMessageAsync({ message: message })
    //     .then((res) => {
    //       console.log('[signMessageAsync]: ', res)
    //       dispatch(
    //         authActions.createWalletSubOrgWallet({
    //           message: message,
    //           signature: res,
    //           chainType: ChainType.Evm,
    //         }),
    //       ).then(async (res) => {
    //         console.log('[Res createWalletSubOrgWallet]: ', res)
    //         const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
    //         console.log('[createWalletSubOrgWallet]: ', subOrgId)
    //         // Create a new wallet with the signature
    //         const signedWhoamiRequest = await walletClient?.stampGetWhoami({
    //           organizationId: subOrgId, // replace with actual org ID from STEP 2
    //         })
    //         console.log('[Res  signedWhoamiRequest]', signedWhoamiRequest)
    //         const params: InputLoginWalletV2Dto = {
    //           organizationId: subOrgId,
    //           stampHeaderName: signedWhoamiRequest?.stamp?.stampHeaderName as string,
    //           stampHeaderValue: signedWhoamiRequest?.stamp?.stampHeaderValue as string,
    //           url: signedWhoamiRequest?.url as string,
    //         }
    //         dispatch(authActions.loginByWalletV2(params)).then(async (res) => {
    //           console.log('[Res loginByWalletV2]: ', res)
    //         })
    //       })
    //       // dispatch(
    //       //   authActions.loginByWallet({
    //       //     message: message,
    //       //     signature: res,
    //       //     chainType: ChainType.Evm,
    //       //   }),
    //       // )
    //       // //Add network on wallet
    //       // if (activeChain === TYPE_CHAIN.ARB) {
    //       //   switchEvmChain(ChainIds.Arbitrum)
    //       // }
    //     })
    //     .catch((res) => {
    //       console.error('[signMessageAsync Error]: ', res)
    //     })
    // })
  }

  // Sign Message EVM
  useEffect(() => {
    let hasSigned = false
    if (
      isConnected &&
      address &&
      activeAccount === TYPE_ACCOUNT.CHAIN &&
      (activeChain === TYPE_CHAIN.ETH || activeChain === TYPE_CHAIN.ARB) &&
      !hasSigned &&
      !token &&
      isAutoConnect
    ) {
      hasSigned = true
      // autoSignOnConnectEvm()
    }

    // Clean up function
    return () => {
      hasSigned = false
    }
  }, [isAutoConnect, isConnected, address, activeAccount, activeChain, address])

  const { publicKey, signMessage, connected } = useWallet()

  const autoSignOnConnectSolana = async () => {
    if (connected && publicKey && signMessage) {
      const res = await dispatch(
        authActions.getNonce({
          address: publicKey.toString(),
        }),
      )
      const nonce = res?.payload?.getNonce
      await handleSignMessage(nonce)
    }
  }

  // Auto-sign message when wallet connects
  useEffect(() => {
    let hasSigned = false
    if (
      connected &&
      publicKey &&
      signMessage &&
      activeAccount === TYPE_ACCOUNT.CHAIN &&
      activeChain === TYPE_CHAIN.SOLANA &&
      !hasSigned &&
      !ServiceConfig.token &&
      isAutoConnect
    )
      autoSignOnConnectSolana()
    // Clean up function
    return () => {
      hasSigned = false
    }
  }, [isAutoConnect, connected, publicKey, signMessage])

  // Sign message function
  const handleSignMessage = useCallback(
    async (nonce: string) => {
      // if (!publicKey || !signMessage) return
      // const message = message_to_sign(publicKey.toString(), nonce)
      // try {
      //   // Encode message to Uint8Array as required by Solana
      //   const messageBytes = new TextEncoder().encode(message)
      //   // Request signature from wallet
      //   const signatureBytes = await signMessage(messageBytes)

      //   const signatureBase64 = Buffer.from(signatureBytes).toString('base64')

      //   dispatch(
      //     authActions.createWalletSubOrgWallet({
      //       message: message,
      //       signature: signatureBase64,
      //       chainType: ChainType.Solana,
      //     }),
      //   ).then(async (res) => {
      //     console.log('[Res createWalletSubOrgWallet]: ', res)
      //     const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
      //     console.log('[createWalletSubOrgWallet]: ', subOrgId)
      //     // Create a new wallet with the signature
      //     const signedWhoamiRequest = await walletClient?.stampGetWhoami({
      //       organizationId: subOrgId, 
      //     })
      //     console.log('[Res signedWhoamiRequest]', signedWhoamiRequest)
      //     const params: InputLoginWalletV2Dto = {
      //       organizationId: subOrgId,
      //       stampHeaderName: signedWhoamiRequest?.stamp?.stampHeaderName as string,
      //       stampHeaderValue: signedWhoamiRequest?.stamp?.stampHeaderValue as string,
      //       url: signedWhoamiRequest?.url as string,
      //     }
      //     dispatch(authActions.loginByWalletV2(params)).then(async (res) => {
      //       console.log('[Res loginByWalletV2]: ', res)
      //     })
      //   })
      // } catch (err) {
      //   console.error('Error signing message:', err)
      // }
    },
    [publicKey, signMessage],
  )

  return {
    handleSignMessage: activeChain === TYPE_CHAIN.ETH ? autoSignOnConnectEvm : autoSignOnConnectSolana,
  }
}
