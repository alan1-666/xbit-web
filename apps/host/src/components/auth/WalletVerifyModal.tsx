import { useTurnkey } from '@turnkey/sdk-react'
import { Button } from '../ui/button'
import { useAppDispatch } from '@/redux/store'
import { useLocalStorageMap } from '@/hooks/useLocalStorageMap'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { newWalletActions, setConnectedWalletInfo } from '@/redux/modules/newWallet.slice'
import { ServiceConfig } from '@/lib/gql/service-config'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'
import { PublicKey } from '@solana/web3.js'
import { getMetaMaskProvider, MetaMaskWalletAdapter, MetaMaskWalletName } from '@/lib/wallets/MetaMaskWalletAdaper'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { useResponsive } from '@/hooks/useResponsive'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer'
import { IconCheckCircle2, IconDoubleArrow } from '../icon'
import { AlertCircle, Circle } from 'lucide-react'
import { WalletName } from '@solana/wallet-adapter-base'
import { OKXWalletAdapter, OKXWalletName } from '@/lib/wallets/OKXWalletAdapter'
import { toast } from 'sonner'
import { formatAddressWallet } from '@/lib/string'
import { PhantomWalletAdapter, PhantomWalletName } from '@/lib/wallets/PhantomWalletAdapter'
import Loader from '../common/Loader'
import { toHex } from 'viem'
import { trackUserRegistered } from '@/services/google-analytics.service'
import { WalletConnectWalletName } from '@/lib/wallets/WalletConnectWalletAdapter'

interface Step {
  id: number
  title: string
  description: string
}

type Props = {
  address: string
  walletName: string
  publicKey: string | null
  loginType: NEW_TYPE_ACCOUNT
}

const WalletVerify = ({ address, walletName, publicKey, loginType }: Props) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { indexedDbClient } = useTurnkey()
  const dispatch = useAppDispatch()

  const { setItem, getItem } = useLocalStorageMap<string>('wallets')
  const [wallet, setWallet] = useState<WalletInterface | null>(null)
  const [walletClient, setWalletClient] = useState<TurnkeyClient | null>(null)
  const { publicKey: publicKeySol, wallets, select, signMessage, connected } = useWallet()
  const [walletAddressSelected, setWalletAddressSelected] = useState<string | null>(null)
  const solanaWallet = useSolanaWallet()
  const [loading, setLoading] = useState(false)
  const [chainConnect, setChainConnect] = useState<'solana' | 'evm'>('solana')

  const walletSelected = useMemo(() => {
    return wallets.find((item) => item.adapter.name === walletName)
  }, [wallets])

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

  const handleSignEvmMessage = async (nonce: string, address: string) => {
    if (!address) return
    const message = message_to_sign(address, nonce)
    setLoading(true)
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
        setLoading(false)
        return
      }

      try {
        dispatch(
          newAuthActions.createWalletSubOrgWallet({
            message: message,
            signature: signatureHex,
            chainType: ChainType.Evm,
          }),
        )
          .then(async (res) => {
            if (res?.meta?.requestStatus === 'fulfilled') {
              const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
              setSubOrgId(subOrgId)
              setActiveStep(3)
              // loginWalletBySubOrgId(subOrgId!, NEW_TYPE_ACCOUNT.WALLET, message, signatureHex)
            }
            if (res?.meta?.requestStatus === 'rejected') {
            }
          })
          .finally(() => {
            setLoading(false)
          })
      } catch (error) {
        console.log('[error]: ', error)
        setLoading(false)
      }
    } catch (err) {
      console.error('Error signing EVM message:', err)
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

    setLoading(true)
    const stamp = await walletClient?.stamper?.stamp(isEnscape ? escapeOkxString(body) : body).catch((error) => {
      setLoading(false)
      return
    })
    if (!stamp) {
      setLoading(false)
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

    dispatch(newAuthActions.loginByWalletV2(params))
      .then(async (res) => {
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
            const listAccountFilered = listAccount.filter(
              (item: UserEmbeddedWalletDto) => item?.chain !== ChainType.Tron,
            )
            dispatch(
              newWalletActions.updateListWallets({
                type: walletType,
                list: listAccountFilered,
              }),
            )
            dispatch(newWalletActions.updateListWalletsByChain(listAccountFilered))

            ServiceConfig.token = response.accessToken || ''
            toast.success(t('status.loginSuccess'))

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

              // navigate(getFuturesTradePath())
            })
          }
        }
        if (res?.meta?.requestStatus === 'rejected') {
          if (session && !isEnscape) {
            loginWalletBySubOrgId(subOrgId, walletType, message, signatureBase64, true)
            return
          }
        }
      })
      .finally(() => {
        setLoading(false)
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
    if (connected && publicKeySol && signMessage && walletAddressSelected && !isEvmAddress(walletAddressSelected)) {
      // Solana wallet setup
      setWallet({
        signMessage: async (message: any) => {
          const signedMessage = await signMessage(Buffer.from(message))
          return Buffer.from(signedMessage).toString('hex')
        },
        getPublicKey: () => Buffer.from(publicKeySol?.toBuffer()).toString('hex'),
        type: 'solana',
      } as any)
    } else if (walletAddressSelected && isEvmAddress(walletAddressSelected) && walletName === 'MetaMask') {
      // EVM wallet setup
      const ethProvider: any = await getMetaMaskProvider()
      if (ethProvider && typeof ethProvider.request === 'function') {
        setWallet({
          signMessage: async (message: any) => {
            try {
              const signatureHex = await ethProvider.request({
                method: 'personal_sign',
                params: [message, walletAddressSelected],
              })
              // return signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex
              return signatureHex
            } catch (err) {
              console.error('EVM signing error:', err)
              throw err
            }
          },
          getPublicKey: () => publicKey,
          type: 'ethereum',
        } as any)
      }
    } else if (session) {
      // WalletConnect session signing: create WalletInterface and wait for walletClient to be ready
      const isEvm = isEvmAddress(walletAddressSelected!)
      setWallet({
        signMessage: async (message: any) => {
          if (isEvm) {
            const signature: any = await request({
              topic: session.topic,
              chainId: 'eip155:1',
              request: {
                method: 'personal_sign',
                params: [message, walletAddressSelected],
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
                  pubkey: walletAddressSelected,
                  message: messageBytes,
                },
              },
            })
            const signatureBytes = bs58.decode((result as any)?.signature)
            return Buffer.from(signatureBytes).toString('hex')
          }
        },
        getPublicKey: () =>
          isEvm ? publicKey : Buffer.from(new PublicKey(walletAddressSelected!)?.toBuffer()).toString('hex'),
        type: isEvm ? 'ethereum' : 'solana',
      } as any)
    }
  }

  useEffect(() => {
    if (wallet) {
      createTurnkeyClient(new WalletStamper(wallet)).then(setWalletClient)
    }
  }, [wallet])

  const [activeStep, setActiveStep] = useState(1)
  const [subOrgId, setSubOrgId] = useState('')

  const steps: Step[] = [
    {
      id: 1,
      title: t('login.connectYourWallet'),
      description: !!walletAddressSelected
        ? `${t('login.ownershipWallet')}: ${formatAddressWallet(walletAddressSelected)}`
        : t('login.connectYourWalletToXBIT'),
      // description: 'Ownership wallet: 2fQ7E...jX1Qe',
    },
    {
      id: 2,
      title: t('login.accountRegistration'),
      description: t('login.approveToCreateAccount'),
    },
    {
      id: 3,
      title: t('login.accountVerification'),
      description: t('login.confirmToAccessAccount'),
    },
  ]

  const getStepStatus = (stepId: number): 'completed' | 'active' | 'pending' => {
    if (stepId < activeStep) return 'completed'
    if (stepId === activeStep) return 'active'
    return 'pending'
  }

  const getWalletIcon = (name: WalletName): string => {
    switch (name) {
      case MetaMaskWalletName:
        return '/images/login/metamask.png'
      case OKXWalletName:
        return '/images/login/okx.png'
      case WalletConnectWalletName:
        return '/images/login/walletconnect.png'
      case PhantomWalletName:
      default:
        return '/images/login/phantom.png'
    }
  }

  const handleConnect = async (name: WalletName) => {
    try {
      let wallet = null
      switch (name) {
        case OKXWalletName:
          wallet = new OKXWalletAdapter()
          break
        case MetaMaskWalletName:
          wallet = new MetaMaskWalletAdapter()
          break
        case PhantomWalletName:
          wallet = new PhantomWalletAdapter()
          break
        default:
          console.warn(`[Chain error]:`)
      }
      wallet!
        .connect()
        .then((res) => {
          const maybePub: any = (wallet as any).publicKey ?? (wallet as any)._publicKey ?? null

          let address: string | null = null
          if (maybePub) {
            if (typeof maybePub.toBase58 === 'function') {
              address = maybePub.toBase58()
            } else if (typeof maybePub === 'string') {
              address = maybePub
            } else if (typeof maybePub.toString === 'function') {
              address = maybePub.toString()
            }
          }

          select(name)
          console.log('address', address)
          if (address) {
            setWalletAddressSelected(address)
            checkExistAdress(address)
          }

          dispatch(
            setConnectedWalletInfo({
              name: name,
              icon: getWalletIcon(name),
            }),
          )
        })
        .catch((error) => {
          if (error?.message === 'wallet_not_installed') {
            toast.error(
              t('wallet.notLogginedWebApp', {
                name: name,
              }),
            )
          }
          select(null)
          solanaWallet.disconnect()
          console.log('error', error)
        })
        .finally(() => {})
    } catch (e: any) {}
  }

  const checkExistAdress = async (walletAddress: string) => {
    const subOrgIdByLS = getItem(`${walletAddress}`)
    if (subOrgIdByLS) {
      setActiveStep(3)
      setSubOrgId(subOrgIdByLS)
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
      setActiveStep(3)
      setItem(`${walletAddress}`, dataRegister?.subOrgId)
      setSubOrgId(dataRegister?.subOrgId)
    } else {
      setActiveStep(2)
    }
  }

  useEffect(() => {
    if (!!walletAddressSelected) {
      handleConfirmSignature()
    }
  }, [walletAddressSelected, connected, publicKeySol])

  useEffect(() => {
    if (walletName && !walletAddressSelected) {
      handleConnect(walletName as WalletName)
    }
  }, [walletName, walletAddressSelected])

  const handleVerifyWallet = async () => {
    autoTriggeredStepRef.current = activeStep
    setCountdown(null)

    if (activeStep === 1) handleConnect(walletName as WalletName)
    if (activeStep === 2) {
      const res = await dispatch(
        newAuthActions.getNonce({
          address: walletAddressSelected!,
        }),
      )
      const nonce = res?.payload?.getNonce

      if (session && loginType === NEW_TYPE_ACCOUNT.WC) {
        if (chainConnect === 'solana') {
          signMessageSolana(nonce)
        } else {
          signMessageEvm(nonce)
        }
        return
      }
      if (isEvmAddress(walletAddressSelected!)) {
        await handleSignEvmMessage(nonce, walletAddressSelected!)
      } else {
        await handleSignMessageSolanaToGetSubOrgId(nonce)
      }
    }
    if (activeStep === 3) {
      loginWalletBySubOrgId(subOrgId, loginType)
    }
  }

  // Auto-trigger handleVerifyWallet after 5s countdown if user hasn't clicked
  const autoTriggeredStepRef = useRef<number | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    // Reset when activeStep changes
    autoTriggeredStepRef.current = null
    setCountdown(5)

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeStep])

  // Separate effect to trigger handleVerifyWallet when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && autoTriggeredStepRef.current !== activeStep) {
      autoTriggeredStepRef.current = activeStep
      setCountdown(null)
      handleVerifyWallet()
    }
  }, [countdown])

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
        )
          .then(async (res) => {
            if (res?.meta?.requestStatus === 'fulfilled') {
              const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
              setSubOrgId(subOrgId)
              setActiveStep(3)
              // loginWalletBySubOrgId(subOrgId, address, message, signatureBase64, isEnscape)
            }
            if (res?.meta?.requestStatus === 'rejected') {
              if (retry === false) {
                signMessageSolana(nonce, true)
                return
              }
              toast.error(t('status.loginFail'))
            }
          })
          .finally(() => {
            setLoading(false)
          })
      } catch (error) {
        // console.log('[error]: ', error)
      }
    } catch (signError) {
      console.error('Fail to sign message: ', signError)
    }
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
        )
          .then(async (res) => {
            if (res?.meta?.requestStatus === 'fulfilled') {
              const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
              // loginWalletBySubOrgId(subOrgId, address, isLedger ? message : messageToSign, signature as string)
              setSubOrgId(subOrgId)
              setActiveStep(3)
            }
            if (res?.meta?.requestStatus === 'rejected') {
              if (retry === false) {
                signMessageEvm(nonce, true)
                return
              }
              toast.error(t('status.loginFail'))
            }
          })
          .finally(() => {
            setLoading(false)
          })
      } catch (error) {
        // console.log('[error]: ', error)
      }
    } catch (signError) {
      console.error('Lỗi khi ký message:', signError)
    }
  }

  const handleSignMessageSolanaToGetSubOrgId = async (nonce: string) => {
    if (!publicKeySol || !signMessage) return
    const message = message_to_sign(publicKeySol.toString(), nonce)
    setLoading(true)
    try {
      // Encode message to Uint8Array as required by Solana
      const messageBytes = new TextEncoder().encode(message)
      // Request signature from wallet
      const signatureBytes = await signMessage(messageBytes).catch((error) => {
        return
      })

      if (!signatureBytes) {
        setLoading(false)
        return
      }
      const signatureBase64 = Buffer.from(signatureBytes).toString('base64')
      try {
        dispatch(
          newAuthActions.createWalletSubOrgWallet({
            message: message,
            signature: signatureBase64,
            chainType: ChainType.Solana,
          }),
        )
          .then(async (res) => {
            if (res?.meta?.requestStatus === 'fulfilled') {
              const subOrgId = res?.payload?.createWalletSubOrgV2?.subOrgId
              setSubOrgId(subOrgId)
              setActiveStep(3)
              // loginWalletBySubOrgId(subOrgId!, NEW_TYPE_ACCOUNT.WALLET, message, signatureBase64)
            }
            if (res?.meta?.requestStatus === 'rejected') {
            }
          })
          .finally(() => {
            setLoading(false)
          })
      } catch (error) {
        console.log('[error]: ', error)
        setLoading(false)
      }
    } catch (err) {
      console.error('Error signing message:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session && loginType === NEW_TYPE_ACCOUNT.WC) {
      const solanaNamespace = session?.namespaces?.solana
      const account = solanaNamespace?.accounts?.[0]
      const address = account?.split(':')?.[2]
      if (address) {
        setWalletAddressSelected(address)
        checkExistAdress(address)
        setChainConnect('solana')
      } else {
        const evmNamespace = session?.namespaces?.eip155
        const account = evmNamespace?.accounts?.[0]
        const address = account?.split(':')?.[2]
        setWalletAddressSelected(address)
        checkExistAdress(address)
        setChainConnect('evm')
      }
    }
  }, [session])

  const getLogoWallet = useMemo(() => {
    if (session && loginType === NEW_TYPE_ACCOUNT.WC) {
      const nativeRedirect = session.peer.metadata.redirect?.native || ''
      if (nativeRedirect.startsWith('okxwallet://')) {
        return '/images/wallets/img-okx-wallet.webp'
      }
      const logo = session?.peer?.metadata?.icons?.[0]
      return logo
    }
    return walletSelected?.adapter?.icon
  }, [walletSelected, session, loginType])

  return (
    <div className="flex flex-col items-center px-3.75">
      <div className="w-full flex items-center justify-center gap-5 pt-10">
        <img src="/images/xbit-logo-bg.svg" className="w-14 h-14" alt="logo xbit" />
        <IconDoubleArrow />
        <img src={getLogoWallet} className="w-14 h-14" alt="logo wallet" />
      </div>
      <div className="flex items-center gap-2 mt-4">
        <p className="text-[16px] ">{t('wallet.connectingWallet')}</p>
        <Loader />
      </div>

      <div className="space-y-3 mt-4 mb-6 w-full">
        {steps.map((step) => {
          const status = getStepStatus(step.id)
          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border-2 transition-all ${
                status === 'active' ? 'border-[#843bea] bg-slate-800/50' : 'border-slate-700 bg-slate-800/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      status === 'completed' ? 'bg-[#843bea]' : status === 'active' ? 'bg-[#843bea]' : 'bg-slate-700'
                    }`}
                  >
                    {step.id}
                  </div>

                  <div className="pt-0.5">
                    <h3 className="text-white font-semibold text-base">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {status === 'completed' && <IconCheckCircle2 style={{ width: '24px', height: '24px' }} />}

                  {status === 'active' && (
                    <div className="w-6 h-6 rounded-full border-2 border-[#843bea] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#843bea] animate-pulse"></div>
                    </div>
                  )}
                  {status === 'pending' && <Circle className="text-slate-600" size={24} />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-red-950/30 border border-red-900 rounded-2xl p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <div>
            <h4 className="text-red-400 font-semibold text-sm mb-2">{t('login.riskWarning')}</h4>
            <p className="text-gray-400 text-xs leading-relaxed">{t('login.riskWarningContent')}</p>
          </div>
        </div>
      </div>
      <Button
        className="bg-[#843bea] shadow-inner-purple rounded-[200px] w-full h-11 mt-4 mb-8 text-[#FFFFFF] text-base"
        onClick={handleVerifyWallet}
        disabled={!walletAddressSelected && (activeStep === 2 || activeStep === 3)}
        isLoading={loading}
      >
        {activeStep === 1 ? t('login.connectWallet') : t('login.signMessage')}
        {countdown !== null && ` (${countdown}s)`}
      </Button>
    </div>
  )
}

const WalletVerifyModal = ({
  open,
  setOpen,
  walletName,
  publicKey,
  loginType,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  walletName: string
  publicKey: string
  loginType: NEW_TYPE_ACCOUNT
}) => {
  const { isDesktop } = useResponsive()
  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className="bg-[#232329] rounded-2xl p-1 pt-3" aria-label="wallet connect modal">
            <DialogTitle></DialogTitle>
            <WalletVerify address="" walletName={walletName} publicKey={publicKey} loginType={loginType} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild></DrawerTrigger>
          <DrawerContent className="w-full bg-[#232329] max-w-3xl mx-auto">
            <WalletVerify address="" walletName={walletName} publicKey={publicKey} loginType={loginType} />
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

export default WalletVerifyModal
