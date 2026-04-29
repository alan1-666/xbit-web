import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '@/redux/store'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { message_to_sign, NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { useTurnkey } from '@turnkey/sdk-react'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import {
  AuthChainType,
  ChainType,
  InputLoginWalletV2Dto,
  LoginV2Dto,
  TurnkeyVersion,
} from '@/@generated/gql/graphql-user'
import { ServiceConfig } from '@/lib/gql/service-config'
import { TurnkeyClient } from '@turnkey/http'
import { TStamper, WalletInterface, WalletStamper } from '@turnkey/wallet-stamper'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useRequest, useSession } from '@walletconnect/modal-sign-react'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { escapeOkxString } from '@/utils/helpers'
import { toHex } from 'viem'
import { useLocalStorageMap } from '@/hooks/useLocalStorageMap'
import { trackUserRegistered } from '@/services/google-analytics.service'

export const NewWalletConnection = ({
  publicKey,
  setLoading,
  setNameWallet,
  data,
}: {
  publicKey: string
  setLoading: Dispatch<SetStateAction<boolean>>
  setNameWallet: Dispatch<SetStateAction<string | null>>
  data: any
}) => {
  const [walletClient, setWalletClient] = useState<TurnkeyClient | null>(null)
  const [wallet, setWallet] = useState<WalletInterface | null>(null)
  const [chainConnect, setChainConnect] = useState<'solana' | 'evm'>('solana')
  const session = useSession()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { indexedDbClient } = useTurnkey()
  const { map, setItem, getItem, hasItem } = useLocalStorageMap<string>('wallets')

  const { request } = useRequest({
    topic: session?.topic,
    chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    request: {
      method: 'solana_signMessage',
      params: {},
    },
  })

  function isMobile(): boolean {
    if (typeof navigator === 'undefined') return false

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    // iOS
    if (/iPhone|iPad|iPod/i.test(userAgent)) return true

    // Android
    if (/Android/i.test(userAgent)) return true

    return false
  }

  function toHexString(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const createTurnkeyClient = async (stamper: TStamper) => {
    const { TurnkeyClient } = await import('@turnkey/http')

    return new TurnkeyClient(
      {
        baseUrl: 'https://api.turnkey.com',
      },
      stamper,
    )
  }

  useEffect(() => {
    if (wallet) {
      createTurnkeyClient(new WalletStamper(wallet)).then(setWalletClient)
    }
  }, [wallet])

  const connectByChainEvm = (session: any) => {
    const evmNamespace = session?.namespaces?.eip155
    const walletName = session?.peer?.metadata?.name
    const account = evmNamespace?.accounts?.[0]
    const address = account?.split(':')?.[2]
    const isLedger = walletName?.toLowerCase().includes('ledger')
    setLoading(true)
    setNameWallet(walletName ?? 'Wallet')
    setWallet({
      signMessage: async (message: any) => {
        const result = await request({
          topic: session.topic,
          chainId: 'eip155:1',
          request: {
            method: 'personal_sign',
            params: [isLedger ? toHex(message) : message, address],
          },
        })
        return result
      },
      getPublicKey: () => publicKey,
      type: 'ethereum',
    } as any)
  }

  const connectByChainSolana = (session: any) => {
    const solanaNamespace = session?.namespaces?.solana
    const walletName = session?.peer?.metadata?.name
    const account = solanaNamespace?.accounts?.[0]
    const address = account?.split(':')?.[2]
    setLoading(true)
    setNameWallet(walletName ?? 'Wallet')
    setWallet({
      signMessage: async (message: any) => {
        const messageBytes = bs58.encode(new TextEncoder().encode(message))
        const result = await request({
          topic: session.topic,
          chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          request: {
            method: 'solana_signMessage',
            params: {
              pubkey: address,
              message: messageBytes,
            },
          },
        })
        const signedMessage = bs58.decode((result as any)?.signature)
        return toHexString(signedMessage)
      },
      getPublicKey: () => Buffer.from(new PublicKey(address)?.toBuffer()).toString('hex'),
      type: 'solana',
    } as any)
  }

  useEffect(() => {
    if (session && data) {
      const solanaNamespace = session?.namespaces?.solana
      const account = solanaNamespace?.accounts?.[0]
      const address = account?.split(':')?.[2] // Format: solana:chainId:address
      if (!solanaNamespace || !account || !address) {
        connectByChainEvm(data)
        setChainConnect('evm')
        setLoading(true)
      } else {
        setChainConnect('solana')
        connectByChainSolana(data)
      }
    }
  }, [session, data])

  const handleCheckRegisteredWallet = async (walletAddress: string) => {
    // const subOrgIdByLS = getItem(`${walletAddress}`)

    // if (subOrgIdByLS) {
    //   loginWalletBySubOrgId(subOrgIdByLS, walletAddress)
    //   return
    // }

    const response = await dispatch(
      newAuthActions.checkRegisteredWallet({
        walletAddress: walletAddress,
        chainType: AuthChainType.ChainSol,
      }),
    )
    const dataRegister = response?.payload?.checkRegisteredWallet

    if (dataRegister && !!dataRegister?.exists) {
      const subOrgId = dataRegister?.subOrgId
      setItem(`${walletAddress}`, subOrgId)
      loginWalletBySubOrgId(subOrgId, walletAddress)
    } else {
      const res = await dispatch(
        newAuthActions.getNonce({
          address: walletAddress,
        }),
      )
      const nonce = res?.payload?.getNonce
      if (chainConnect === 'solana') {
        signMessageSolana(nonce)
      } else {
        signMessageEvm(nonce)
      }
    }
  }

  const autoSignOnConnectSolana = async () => {
    if (!session || !data) {
      return
    }
    try {
      setLoading(true)
      // Lấy account từ session
      const solanaNamespace = session.namespaces.solana
      if (!solanaNamespace?.accounts?.length) {
        throw new Error('Can not found Solana account in session')
      }

      const account = solanaNamespace.accounts[0]
      const address = account.split(':')[2] // Format: solana:chainId:address

      handleCheckRegisteredWallet(address)
      // await handleSignMessage(nonce)
    } catch (signError) {
      console.error('Fail to sign message Solana:', signError)
      setLoading(false)
    }
  }

  const autoSignOnConnectEvm = async () => {
    if (!session || !data || chainConnect === 'solana') {
      return
    }

    try {
      setLoading(true)
      // Lấy account từ session
      const evmNamespace = session.namespaces.eip155
      if (!evmNamespace?.accounts?.length) {
        throw new Error('Can not found Solana account in session')
      }

      const account = evmNamespace.accounts[0]
      const address = account.split(':')[2] // Format: solana:chainId:address
      handleCheckRegisteredWallet(address)
    } catch (signError) {
      console.error('Fail to sign message Evm:', signError)
      setLoading(false)
    }
  }

  const handleNativeLink = (obj: any) => {
    const walletName = obj?.peer?.metadata?.name
    const isLedger = walletName?.toLowerCase().includes('ledger')
    const nativeUrl = isLedger ? 'ledgerlive://' : obj?.peer?.metadata?.redirect?.native
    if (isMobile()) {
      window.location.href = nativeUrl
    }
  }

  const resetStateConnect = () => {
    setLoading(false)
    setWallet(null)
    setWalletClient(null)
  }

  const signMessageEvm = async (nonce: string, retry: boolean = false) => {
    if (!session && !data) {
      return
    }

    try {
      setLoading(true)
      const evmNamespace = session?.namespaces?.eip155
      const walletName = session?.peer?.metadata?.name
      const isLedger = walletName?.toLowerCase().includes('ledger')
      const isEnscape = retry
      if (!evmNamespace?.accounts?.length) {
        throw new Error('EVM account not found in session')
      }
      handleNativeLink(session)

      const account = evmNamespace.accounts[0]
      const address = account.split(':')[2]
      const message = message_to_sign(address.toString(), nonce)
      const messageToSign = isLedger ? toHex(message) : isEnscape ? escapeOkxString(message) : message
      const signature = await request({
        topic: session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: [messageToSign, address],
        },
      })

      try {
        dispatch(
          newAuthActions.createWalletSubOrgWallet({
            message: isLedger ? message : messageToSign,
            signature: signature as string,
            chainType: ChainType.Evm,
          }),
        ).then(async (res) => {
          if (res?.meta?.requestStatus === 'fulfilled') {
            const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
            loginWalletBySubOrgId(subOrgId, address, isLedger ? message : messageToSign, signature as string)
          }
          if (res?.meta?.requestStatus === 'rejected') {
            if (retry === false) {
              signMessageEvm(nonce, true)
              return
            }
            resetStateConnect()
            toast.error(t('status.loginFail'))
          }
        })
      } catch (error) {
        // console.log('[error]: ', error)
      }
    } catch (signError) {
      console.error('Lỗi khi ký message:', signError)
      resetStateConnect()
    }
  }

  const signMessageSolana = async (nonce: string, retry: boolean = false) => {
    if (!session && !data) {
      return
    }

    try {
      setLoading(true)
      const solanaNamespace = session?.namespaces?.solana
      const isEnscape = retry
      if (!solanaNamespace?.accounts?.length) {
        throw new Error('Solana account not found in session')
      }
      handleNativeLink(session)

      const account = solanaNamespace.accounts[0]
      const address = account.split(':')[2]
      const message = message_to_sign(address.toString(), nonce)
      const messageBytes = bs58.encode(new TextEncoder().encode(isEnscape ? escapeOkxString(message) : message))
      const result = await request({
        topic: session.topic,
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        request: {
          method: 'solana_signMessage',
          params: {
            pubkey: address,
            message: messageBytes,
          },
        },
      })
      const signatureBytes = bs58.decode((result as any)?.signature)
      const signatureBase64 = btoa(String.fromCharCode(...signatureBytes))
      try {
        dispatch(
          newAuthActions.createWalletSubOrgWallet({
            message: message,
            signature: signatureBase64,
            chainType: ChainType.Solana,
          }),
        ).then(async (res) => {
          if (res?.meta?.requestStatus === 'fulfilled') {
            const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
            loginWalletBySubOrgId(subOrgId, address, message, signatureBase64, isEnscape)
          }
          if (res?.meta?.requestStatus === 'rejected') {
            if (retry === false) {
              signMessageSolana(nonce, true)
              return
            }
            toast.error(t('status.loginFail'))
            resetStateConnect()
          }
        })
      } catch (error) {
        // console.log('[error]: ', error)
      }
    } catch (signError) {
      console.error('Fail to sign message: ', signError)
      resetStateConnect()
    }
  }

  const loginWalletBySubOrgId = async (
    subOrgId: string,
    walletAddress: string,
    message: string = '',
    signatureBase64: string = '',
    isEnscapeProps: boolean = false,
  ) => {
    const timestampMs = String(Date.now())
    const isEnscape = isEnscapeProps
    const body = JSON.stringify({
      parameters: {
        publicKey: publicKey,
        expirationSeconds: '604800',
      },
      organizationId: subOrgId,
      timestampMs,
      type: 'ACTIVITY_TYPE_STAMP_LOGIN',
    })
    handleNativeLink(session)
    const stamp = await walletClient?.stamper?.stamp(isEnscape ? escapeOkxString(body) : body).catch((error) => {
      resetStateConnect()
      return
    })

    if (!stamp) {
      resetStateConnect()
      return
    }

    const params: InputLoginWalletV2Dto = {
      organizationId: subOrgId,
      publicKey: publicKey as string,
      stampHeaderName: stamp?.stampHeaderName as string,
      stampHeaderValue: stamp?.stampHeaderValue as string,
      url: '/public/v1/submit/stamp_login',
      timestampMs: timestampMs,
      expirationSeconds: '604800',
    }

    dispatch(newAuthActions.loginByWalletV2(params)).then(async (res) => {
      if (res?.meta?.requestStatus === 'fulfilled') {
        dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.WC))
        const response: LoginV2Dto = res.payload.loginByWalletV2
        // save subOrgId to localStorage
        setItem(`${walletAddress}`, subOrgId)
        dispatch(
          newAuthActions.updateAccessToken({
            activeAccount: NEW_TYPE_ACCOUNT.WC,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            userId: response?.userId,
            subOrgId: response?.subOrgId,
          }),
        )
        await indexedDbClient?.loginWithSession(response.turnKeyResponse)

        dispatch(newWalletActions.getAccountInfo({})).then(async (res) => {
          if (res.meta?.requestStatus === 'fulfilled') {
            toast.success(t('status.loginSuccess'))
            ServiceConfig.token = response.accessToken
            resetStateConnect()
            dispatch(newWalletActions.updateIsEnscape(isEnscape))
            if (res?.payload?.account?.isFirstLogin) {
              trackUserRegistered(res?.payload?.account?.id || null)
              dispatch(
                newWalletActions.updateVerifyWallet({
                  message: message,
                  signature: signatureBase64,
                  isOkxWallet: isEnscape,
                }),
              )
            }

            // todo: remove after migration phrase
            if (res?.payload?.account?.turnkeyVersion === TurnkeyVersion.V1) {
              const users = await indexedDbClient?.getUsers()

              await indexedDbClient?.updateRootQuorum({
                threshold: 1,
                userIds: users?.users.map((u) => u.userId) ?? [],
              })

              dispatch(newAuthActions.migrateTurnkeyAccount({}))
            }
          }
        })
      }
      if (res?.meta?.requestStatus === 'rejected') {
        if (!isEnscape) {
          loginWalletBySubOrgId(subOrgId, walletAddress, message, signatureBase64, true)
          return
        }
        indexedDbClient?.resetKeyPair()
        toast.error(t('status.loginFail'))
        resetStateConnect()
      }
    })
  }

  const didRunRef = useRef(false)
  useEffect(() => {
    if (!walletClient || !wallet) {
      didRunRef.current = false
      return
    }

    if (!didRunRef.current) {
      if (chainConnect === 'solana') {
        autoSignOnConnectSolana()
      }
      if (chainConnect === 'evm') {
        autoSignOnConnectEvm()
      }

      didRunRef.current = true
    }
  }, [wallet, walletClient, chainConnect])

  return <></>
}
