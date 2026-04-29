import { useTurnkey } from '@turnkey/sdk-react'
import { Button } from '../ui/button'
import { useAppDispatch } from '@/redux/store'
import { useLocalStorageMap } from '@/hooks/useLocalStorageMap'
import { useEffect, useRef, useState } from 'react'
import { TStamper, WalletInterface, WalletStamper } from '@turnkey/wallet-stamper'
import { TurnkeyClient } from '@turnkey/http'
import { useWallet } from '@solana/wallet-adapter-react'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import {
  AuthChainType,
  ChainType,
  InputLoginWalletV2Dto,
  LoginV2Dto,
  TurnkeyVersion,
  UserEmbeddedWalletDto,
} from '@/@generated/gql/graphql-user'
import { message_to_sign, NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { useConnect, useSession, useRequest } from '@walletconnect/modal-sign-react'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { useTranslation } from 'react-i18next'
import { escapeOkxString } from '@/utils/helpers'
import { toHex } from 'viem'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { ServiceConfig } from '@/lib/gql/service-config'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { APP_PATH } from '@/lib/constant'
import { useNavigate } from 'react-router-dom'
import { PublicKey } from '@solana/web3.js'
import { getMetaMaskProvider } from '@/lib/wallets/MetaMaskWalletAdaper'
import i18n from '@/i18n'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { trackUserRegistered } from '@/services/google-analytics.service'


type Props = {
  address: string
  walletName: string
  publicKey: string | null
  onSubmit: (address: string, loginInfo: LoginV2Dto) => void
}

const WalletLoginVerify = ({ address, walletName, publicKey, onSubmit }: Props) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { indexedDbClient } = useTurnkey()
  const dispatch = useAppDispatch()

  const { setItem, getItem } = useLocalStorageMap<string>('wallets')
  const [error, setError] = useState<string | null>(null)

  const [wallet, setWallet] = useState<WalletInterface | null>(null)
  const [walletClient, setWalletClient] = useState<TurnkeyClient | null>(null)
  const { publicKey: publicKeySol, signMessage, connected } = useWallet()
  const hasAutoSigned = useRef(false)
  const solanaWallet = useSolanaWallet()
  const { data } = useConnect({
    requiredNamespaces: {},
    optionalNamespaces: {
      solana: {
        methods: ['solana_signMessage'],
        chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Solana mainnet
        events: ['accountsChanged'],
      },
      eip155: {
        methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData'],
        chains: [
          'eip155:1', // Ethereum Mainnet
        ],
        events: ['accountsChanged', 'chainChanged'],
      },
    },
  })
  const session = useSession()
  const { request } = useRequest({
    topic: session?.topic,
    chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    request: {
      method: 'solana_signMessage',
      params: {},
    },
  })

  const [showStep, setShowStep] = useState<boolean>(false)
  const [stepText, setStepText] = useState<string>('')

  const [disableBtn, setDisableBtn] = useState<boolean>(false)

  useEffect(() => {
    if (error) {
      setError(t('status.loginFail')) // This will re-translate the error message when language changes
    }
  }, [i18n.language, t, error])

  const autoSignOnConnectSolana = async () => {
    if (connected && publicKeySol && signMessage) {
      const walletAddress = publicKeySol.toString()
      const subOrgIdByLS = getItem(`${walletAddress}`)

      if (subOrgIdByLS) {
        setShowStep(false)
        loginWalletBySubOrgId(subOrgIdByLS, NEW_TYPE_ACCOUNT.WALLET)
        return
      }

      const response = await dispatch(
        newAuthActions.checkRegisteredWallet({
          walletAddress: walletAddress,
          chainType: AuthChainType.ChainSol,
        }),
      )
      const dataRegister = response?.payload?.checkRegisteredWallet

      if (dataRegister && !!dataRegister?.exists) {
        setShowStep(false)
        const subOrgId = dataRegister?.subOrgId
        setItem(`${walletAddress}`, subOrgId)
        loginWalletBySubOrgId(subOrgId, NEW_TYPE_ACCOUNT.WALLET)
      } else {
        setShowStep(true)
        setStepText('(1/2)')
        const res = await dispatch(
          newAuthActions.getNonce({
            address: walletAddress,
          }),
        )
        const nonce = res?.payload?.getNonce

        await handleSignSolMessage(nonce)
      }
    }
  }

  const handleSignEvmMessage = async (nonce: string) => {
    if (!address) return
    const message = message_to_sign(address, nonce)

    try {
      const ethProvider: any = await getMetaMaskProvider()
      let signatureHex: string | null = null

      if (ethProvider && typeof ethProvider.request === 'function') {
        try {
          signatureHex = await ethProvider.request({
            method: 'personal_sign',
            params: [message, address],
          })
        } catch (err) {
          signatureHex = await ethProvider.request({
            method: 'personal_sign',
            params: [address, message],
          })
        }
      } else if (data && (data as any).session) {
        try {
          const connector: any = (data as any).connector || (data as any).session?.topic
          if (connector && typeof connector.request === 'function') {
            signatureHex = await connector.request({
              method: 'personal_sign',
              params: [message, address],
            })
          }
        } catch (err) {
          console.warn('WC signing fallback failed', err)
        }
      }

      if (!signatureHex) {
        setDisableBtn(false)
        setError(t('status.loginFail'))
        return
      }
      setStepText('(2/2)')
      try {
        dispatch(
          newAuthActions.createWalletSubOrgWallet({
            message: message,
            signature: signatureHex,
            chainType: ChainType.Evm,
          }),
        ).then(async (res) => {
          if (res?.meta?.requestStatus === 'fulfilled') {
            const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
            loginWalletBySubOrgId(subOrgId!, NEW_TYPE_ACCOUNT.WALLET, message, signatureHex)
          }
          if (res?.meta?.requestStatus === 'rejected') {
            setDisableBtn(false)
            setError(t('status.loginFail'))
          }
        })
      } catch (error) {
        console.log('[error]: ', error)
      }
    } catch (err) {
      console.error('Error signing EVM message:', err)
      setDisableBtn(false)
      setError(t('status.loginFail'))
    }
  }

  const autoSignOnConnectEvm = async () => {
    if (!address) return

    const walletAddress = address
    const subOrgIdByLS = getItem(`${walletAddress}`)

    if (subOrgIdByLS) {
      loginWalletBySubOrgId(subOrgIdByLS, NEW_TYPE_ACCOUNT.WALLET)
      return
    }

    const response = await dispatch(
      newAuthActions.checkRegisteredWallet({
        walletAddress: walletAddress,
        chainType: AuthChainType.ChainEvm,
      }),
    )
    const dataRegister = response?.payload?.checkRegisteredWallet

    if (dataRegister && !!dataRegister?.exists) {
      setShowStep(false)
      const subOrgId = dataRegister?.subOrgId
      setItem(`${walletAddress}`, subOrgId)
      loginWalletBySubOrgId(subOrgId, NEW_TYPE_ACCOUNT.WALLET)
    } else {
      setShowStep(true)
      setStepText('(1/2)')
      const res = await dispatch(
        newAuthActions.getNonce({
          address: walletAddress,
        }),
      )
      const nonce = res?.payload?.getNonce
      await handleSignEvmMessage(nonce)
    }
  }

  const handleSignSolMessage = async (nonce: string) => {
    if (!publicKeySol || !signMessage) return
    const message = message_to_sign(publicKeySol.toString(), nonce)
    try {
      // Encode message to Uint8Array as required by Solana
      const messageBytes = new TextEncoder().encode(message)
      // Request signature from wallet
      const signatureBytes = await signMessage(messageBytes).catch((error) => {
        setDisableBtn(false)
        // setError(t('status.loginFail'))
        // solanaWallet.disconnect()
        return
      })

      if (!signatureBytes) {
        setDisableBtn(false)
        // setError(t('status.loginFail'))
        // solanaWallet.disconnect()
        return
      }
      const signatureBase64 = Buffer.from(signatureBytes).toString('base64')

      setStepText('(2/2)')

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
            loginWalletBySubOrgId(subOrgId!, NEW_TYPE_ACCOUNT.WALLET, message, signatureBase64)
          }
          if (res?.meta?.requestStatus === 'rejected') {
            setDisableBtn(false)
            setError(t('status.loginFail'))
          }
        })
      } catch (error) {
        console.log('[error]: ', error)
        solanaWallet.disconnect()
      }
    } catch (err) {
      console.error('Error signing message:', err)
    }
  }

  const signMessageEvmViaWC = async (nonce: string, retry: boolean = false) => {
    if (!session || !address) return

    try {
      setShowStep(true)
      setStepText('(1/2)')
      const isEnscape = retry
      handleNativeLink(session)

      const evmNamespace = session?.namespaces?.eip155
      const walletName = session?.peer?.metadata?.name
      const isLedger = walletName?.toLowerCase().includes('ledger')

      if (!evmNamespace?.accounts?.length) {
        throw new Error('EVM account not found in session')
      }

      const message = message_to_sign(address, nonce)
      const messageToSign = isLedger ? toHex(message) : isEnscape ? escapeOkxString(message) : message

      const signatureHex: any = await request({
        topic: session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: [messageToSign, address],
        },
      })

      if (!signatureHex) {
        if (retry === false) {
          signMessageEvmViaWC(nonce, true)
          return
        }
        setDisableBtn(false)
        setError(t('status.loginFail'))
        return
      }

      setStepText('(2/2)')
      dispatch(
        newAuthActions.createWalletSubOrgWallet({
          message: isLedger ? message : messageToSign,
          signature: signatureHex as string,
          chainType: ChainType.Evm,
        }),
      ).then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
          loginWalletBySubOrgId(subOrgId!, NEW_TYPE_ACCOUNT.WC, message, signatureHex as string, isEnscape)
        }
        if (res?.meta?.requestStatus === 'rejected') {
          if (retry === false) {
            signMessageEvmViaWC(nonce, true)
            return
          }
          setDisableBtn(false)
          setError(t('status.loginFail'))
        }
      })
    } catch (err) {
      console.error('WC EVM signing failed', err)
      if (retry === false) {
        signMessageEvmViaWC(nonce, true)
      } else {
        setDisableBtn(false)
        setError(t('status.loginFail'))
      }
    }
  }

  const signMessageSolanaViaWC = async (nonce: string, retry: boolean = false) => {
    if (!session || !address) return

    try {
      setShowStep(true)
      setStepText('(1/2)')
      const isEnscape = retry
      handleNativeLink(session)

      const solanaNamespace = session?.namespaces?.solana
      if (!solanaNamespace?.accounts?.length) {
        throw new Error('Solana account not found in session')
      }

      const message = message_to_sign(address, nonce)
      const messageBytes = bs58.encode(new TextEncoder().encode(isEnscape ? escapeOkxString(message) : message))

      const result: any = await request({
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

      if (!result) {
        if (retry === false) {
          signMessageSolanaViaWC(nonce, true)
          return
        }
        setDisableBtn(false)
        setError(t('status.loginFail'))
        return
      }

      const signatureBytes = bs58.decode((result as any)?.signature)
      const signatureBase64 = btoa(String.fromCharCode(...signatureBytes))
      setStepText('(2/2)')

      dispatch(
        newAuthActions.createWalletSubOrgWallet({
          message: message,
          signature: signatureBase64,
          chainType: ChainType.Solana,
        }),
      ).then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
          loginWalletBySubOrgId(subOrgId!, NEW_TYPE_ACCOUNT.WC, message, signatureBase64, isEnscape)
        }
        if (res?.meta?.requestStatus === 'rejected') {
          if (retry === false) {
            signMessageSolanaViaWC(nonce, true)
            return
          }
          setDisableBtn(false)
          setError(t('status.loginFail'))
        }
      })
    } catch (err) {
      console.error('WC Sol signing failed', err)
      if (retry === false) {
        signMessageSolanaViaWC(nonce, true)
      } else {
        setDisableBtn(false)
        setError(t('status.loginFail'))
        setDisableBtn(false)
      }
    }
  }

  const autoSignOnConnectForWC = async () => {
    if (!session || !address) return
    try {
      const walletAddress = address
      const subOrgIdByLS = getItem(`${walletAddress}`)

      if (subOrgIdByLS) {
        setShowStep(false)
        loginWalletBySubOrgId(subOrgIdByLS, NEW_TYPE_ACCOUNT.WC)
        return
      }

      const response = await dispatch(
        newAuthActions.checkRegisteredWallet({
          walletAddress: walletAddress,
          chainType: isEvmAddress(walletAddress) ? AuthChainType.ChainEvm : AuthChainType.ChainSol,
        }),
      )
      const dataRegister = response?.payload?.checkRegisteredWallet

      if (dataRegister && !!dataRegister?.exists) {
        setShowStep(false)
        const subOrgId = dataRegister?.subOrgId
        setItem(`${walletAddress}`, subOrgId)
        loginWalletBySubOrgId(subOrgId, NEW_TYPE_ACCOUNT.WC)
      } else {
        const res = await dispatch(
          newAuthActions.getNonce({
            address: walletAddress,
          }),
        )
        const nonce = res?.payload?.getNonce

        if (isEvmAddress(walletAddress)) {
          signMessageEvmViaWC(nonce)
        } else {
          signMessageSolanaViaWC(nonce)
        }
      }
    } catch (err) {
      console.error('autoSignOnConnectForWC error', err)
      setDisableBtn(false)
      setError(t('status.loginFail'))
    }
  }
  const resetStateConnect = () => {
    setWallet(null)
    setWalletClient(null)
  }
  const handleNativeLink = (obj: any) => {
    const walletName = obj?.peer?.metadata?.name
    const isLedger = walletName?.toLowerCase().includes('ledger')
    const nativeUrl = isLedger ? 'ledgerlive://' : obj?.peer?.metadata?.redirect?.native
    if (isMobile()) {
      window.location.href = nativeUrl
    }
  }
  const isMobile = (): boolean => {
    if (typeof navigator === 'undefined') return false

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    // iOS
    if (/iPhone|iPad|iPod/i.test(userAgent)) return true

    // Android
    if (/Android/i.test(userAgent)) return true

    return false
  }
  const loginWalletBySubOrgId = async (
    subOrgId: string,
    walletType: NEW_TYPE_ACCOUNT,
    message: string = '',
    signatureBase64: string = '',
    isEnscapeProps: boolean = false,
  ) => {
    const timestampMs = String(Date.now())
    const expirationSeconds = '604800'
    const isEnscape = isEnscapeProps
    const body = JSON.stringify({
      parameters: {
        publicKey: publicKey,
        expirationSeconds,
      },
      organizationId: subOrgId,
      timestampMs,
      type: 'ACTIVITY_TYPE_STAMP_LOGIN',
    })

    if (session) {
      handleNativeLink(session)
    }

    const stamp = await walletClient?.stamper?.stamp(isEnscape ? escapeOkxString(body) : body).catch((error) => {
      setDisableBtn(false)
      setError(t('status.loginFail'))
      // resetStateConnect()
      return
    })
    if (!stamp) {
      // resetStateConnect()
      return
    }
    const params: InputLoginWalletV2Dto = {
      organizationId: subOrgId,
      publicKey: publicKey as string,
      stampHeaderName: stamp?.stampHeaderName as string,
      stampHeaderValue: stamp?.stampHeaderValue as string,
      url: '/public/v1/submit/stamp_login',
      timestampMs: timestampMs,
      expirationSeconds,
    }

    dispatch(newAuthActions.loginByWalletV2(params)).then(async (res) => {
      if (res?.meta?.requestStatus === 'fulfilled') {
        // dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.WALLET))
        dispatch(newWalletActions.setActiveAccount(walletType))
        // save subOrgId to localStorage
        const walletAddress = connected && publicKeySol ? publicKeySol.toString() : address
        setItem(`${walletAddress}`, subOrgId)
        const response: LoginV2Dto = res.payload.loginByWalletV2

        if (response.verifyBetaAccess) {
          dispatch(newAuthActions.updateAccessToken({ activeAccount: walletType }))
          await indexedDbClient?.loginWithSession(response.turnKeyResponse)
          onSubmit(address, response)
        } else {
          dispatch(
            newAuthActions.updateAccessToken({
              activeAccount: walletType,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              userId: response?.userId,
              subOrgId: response?.subOrgId,
            }),
          )
          await indexedDbClient?.loginWithSession(response.turnKeyResponse)

          const listAccount = response?.userEmbeddedWallets
          const listAccountFilered = listAccount.filter((item: UserEmbeddedWalletDto) => item?.chain !== ChainType.Tron)
          dispatch(
            newWalletActions.updateListWallets({
              type: walletType,
              list: listAccountFilered,
            }),
          )
          dispatch(newWalletActions.updateListWalletsByChain(listAccountFilered))

          ServiceConfig.token = response.accessToken || ''

          dispatch(newWalletActions.getAccountInfo({})).then(async (res) => {
            if (res.meta?.requestStatus === 'fulfilled') {
              if (res?.payload?.account?.isFirstLogin) {
                trackUserRegistered(res?.payload?.account?.id || null)
                dispatch(
                  newWalletActions.updateVerifyWallet({
                    message: message,
                    signature: signatureBase64,
                    isOkxWallet: session ? isEnscape : true,
                  }),
                )
              }
              // await handleAgentAction({
              //   userId: res?.payload?.account?.id,
              // })
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

            navigate(getFuturesTradePath())
          })
        }
      }
      if (res?.meta?.requestStatus === 'rejected') {
        if (session && !isEnscape) {
          loginWalletBySubOrgId(subOrgId, walletType, message, signatureBase64, true)
          return
        }
        solanaWallet.disconnect()
        indexedDbClient?.resetKeyPair()
        setDisableBtn(false)
        setError(t('status.loginFail'))
      }
    })
  }

  const isEvmAddress = (address: string): boolean => {
    const evmAddressPattern = /^0x[a-fA-F0-9]{40}$/
    return evmAddressPattern.test(address)
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

  const handleConfirmSignature = async () => {
    setDisableBtn(true)
    if (connected && publicKeySol && signMessage && !isEvmAddress(address)) {
      // Solana wallet setup
      if(!wallet) {
        setWallet({
          signMessage: async (message: any) => {
            const signedMessage = await signMessage(Buffer.from(message))
            return Buffer.from(signedMessage).toString('hex')
          },
          getPublicKey: () => Buffer.from(publicKeySol?.toBuffer()).toString('hex'),
          type: 'solana',
        } as any)
      }
      else {
        autoSignOnConnectSolana()
      }

    } else if (isEvmAddress(address) && walletName === 'MetaMask') {
      // EVM wallet setup
      const ethProvider: any = await getMetaMaskProvider()
      if (ethProvider && typeof ethProvider.request === 'function') {
        if(!wallet) {
          setWallet({
            signMessage: async (message: any) => {
              try {
                const signatureHex = await ethProvider.request({
                  method: 'personal_sign',
                  params: [message, address],
                })
                // return signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex
                return signatureHex
              } catch (err) {
                console.error('EVM signing error:', err)
                setDisableBtn(false)
                throw err
              }
            },
            getPublicKey: () => publicKey,
            type: 'ethereum',
          } as any)
        }
        else {
          autoSignOnConnectEvm()
        }
      }
    } else if (session) {
      // WalletConnect session signing: create WalletInterface and wait for walletClient to be ready
      const isEvm = isEvmAddress(address)
      if(!wallet) {
        setWallet({
          signMessage: async (message: any) => {
            if (isEvm) {
              const signature: any = await request({
                topic: session.topic,
                chainId: 'eip155:1',
                request: {
                  method: 'personal_sign',
                  params: [message, address],
                },
              })
              return signature
            } else {
              const messageBytes = bs58.encode(new TextEncoder().encode(message))
              const result: any = await request({
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
              return Buffer.from(signatureBytes).toString('hex')
            }
          },
          // getPublicKey: () => publicKey ?? address,
          getPublicKey: () => (isEvm ? publicKey : Buffer.from(new PublicKey(address)?.toBuffer()).toString('hex')),
          type: isEvm ? 'ethereum' : 'solana',
        } as any)
      }
      else {
        autoSignOnConnectForWC()
      }
    }
  }

  useEffect(() => {
    if (wallet) {
      createTurnkeyClient(new WalletStamper(wallet)).then(setWalletClient)
    }
  }, [wallet])

  useEffect(() => {
    if (walletClient && address) {
      if (!hasAutoSigned.current) {
        if (session && walletName === '') {
          autoSignOnConnectForWC()
        } else if (connected && publicKeySol && signMessage && !isEvmAddress(address)) {
          // if (isEvmAddress(address)) {
          //   autoSignOnConnectEvm()
          // } else {
          //   autoSignOnConnectSolana()
          // }
          autoSignOnConnectSolana()
        }
        else if (isEvmAddress(address) && walletName === 'MetaMask') {
          autoSignOnConnectEvm()
        }

        hasAutoSigned.current = true
      }
    } else {
      hasAutoSigned.current = false
    }
  }, [walletClient, connected, publicKeySol, signMessage, address, session])

  return (
    <div className="flex flex-col gap-8">
      <div className="text-[#908E9A] text-[12px] font-[330] leading-[150%]  text-[#A9A9B5]">
        {t('login.signatureExplanation')}
      </div>

      <div className="self-stretch p-4 bg-[#2F2F33] rounded-[10px]  inline-flex flex-col justify-center items-start gap-3">
        <div className="self-stretch inline-flex justify-start items-center gap-1">
          <div className="justify-start text-xs leading-4  text-[#908E9A]">{t('login.verifyOwnership')}</div>
        </div>
        <div className="self-stretch text-[13px] leading-5 break-all  text-[#FBFBFB]">{address}</div>
      </div>

      {error && (
        <div className="text-left justify-start text-xs font-normal text-[13px] text-[#FF1568] leading-3 ">{error}</div>
      )}

      <Button
        className="self-stretch h-11 px-3.5 py-3 rounded-[200px] inline-flex justify-center items-center gap-3 bg-[#843BEA]"
        onClick={handleConfirmSignature}
        disabled={disableBtn}
        isLoading={disableBtn}
      >
        <div className="text-center justify-start text-sm leading-4 tracking-tight text-[#FFFFFF] ">
          {t('login.verify')} {showStep && stepText}
        </div>
      </Button>

      <div className="self-stretch pt-6 border-t border-t-[#79778C29] inline-flex justify-center items-center gap-2.5">
        <div className="w-96 text-center justify-start text-sm font-normal leading-5   text-[#908E9A]">
          {t('login.signingFree')}
        </div>
      </div>
    </div>
  )
}
export default WalletLoginVerify
