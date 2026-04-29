import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react'
import SignClient from '@walletconnect/sign-client'
// import { QRCodeSVG } from 'qrcode.react'
import { useAppDispatch } from '@/redux/store'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { message_to_sign, NEW_TYPE_ACCOUNT, WALLETCONNECT_ID } from '../blockchain'
import { ChainType, InputLoginWalletV2Dto, LoginV2Dto, TurnkeyVersion } from '@/@generated/gql/graphql-user'
import { TurnkeyClient } from '@turnkey/http'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { ServiceConfig } from '../gql/service-config'
import { useTranslation } from 'react-i18next'
import { useTurnkey } from '@turnkey/sdk-react'
import { toast } from 'sonner'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { TStamper, WalletInterface, WalletStamper } from '@turnkey/wallet-stamper'
import { PublicKey } from '@solana/web3.js'
import { Copy, Download, Loader2 } from 'lucide-react'
import { Loader } from '@/components/common/MoneyFormatted'
import html2canvas from 'html2canvas'
import QRCodeStyling from 'qr-code-styling'
import {Loading} from "@components/common/Loading.tsx";

export default function SolanaWalletConnectQR({
  publicKey,
  openWalletConnect,
  setOpenWalletConnect,
}: {
  publicKey: string
  openWalletConnect: boolean
  setOpenWalletConnect: Dispatch<SetStateAction<boolean>>
}) {
  const [uri, setUri] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const clientRef = useRef<SignClient | null>(null)
  const dispatch = useAppDispatch()
  const [walletClient, setWalletClient] = useState<TurnkeyClient | null>(null)
  const [wallet, setWallet] = useState<WalletInterface | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const posterRef = useRef<HTMLDivElement>(null)

  const { t } = useTranslation()
  const { indexedDbClient } = useTurnkey()

  useEffect(() => {
    if (openWalletConnect) {
      openWalletConnectQR()
    } else {
      setUri(null)
      setSession(null)
      setConnecting(false)
      setLoading(false)
      clientRef.current = null
    }
  }, [openWalletConnect])

  const openWalletConnectQR = async () => {
    try {
      setLoading(true)
      // Init SignClient if not already initialized
      if (!clientRef.current) {
        clientRef.current = await SignClient.init({
          projectId: WALLETCONNECT_ID,
          metadata: {
            name: 'Xbit',
            description: 'Connect wallet from WalletConnect',
            url: window.location.href,
            icons: [`${window.location.href}/images/xbit-logo.svg`],
          },
        })
      }

      const client = clientRef.current

      const { uri, approval } = await client.connect({
        requiredNamespaces: {
          solana: {
            methods: ['solana_signMessage', 'solana_signTransaction', 'solana_signAndSendTransaction'],
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Solana mainnet
            events: ['accountsChanged', 'chainChanged'],
          },
        },
        optionalNamespaces: {
          solana: {
            methods: ['solana_requestAccounts'],
            chains: [
              'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', // mainnet
            ],
            events: [],
          },
        },
      })

      if (uri) {
        setUri(uri)
        const timeout = 5 * 60 * 1000
        setTimeout(() => {
          console.warn('QR code expired — re-open QR')
          setUri(null)
          openWalletConnectQR()
        }, timeout)
      }
      setLoading(false)
      try {
        const approvedSession = await approval()
        setSession(approvedSession)
        localStorage.setItem('walletconnect_session', JSON.stringify(approvedSession))
      } catch (approvalError) {
        console.error('User Reject request:', approvalError)
        setOpenWalletConnect(false)
        setUri(null)
      }
    } catch (initError) {
      console.error('Eror WalletConnect:', initError)
      setLoading(false)
      setConnecting(false)
      setUri(null)
      setOpenWalletConnect(false)
    }
  }

  const signMessage = async (nonce: string) => {
    if (!clientRef.current || !session) {
      return
    }

    try {
      setConnecting(true)
      const solanaNamespace = session?.namespaces?.solana
      if (!solanaNamespace?.accounts?.length) {
        throw new Error('Solana account not found in session')
      }

      const account = solanaNamespace.accounts[0]
      const address = account.split(':')[2] // Format: solana:chainId:address

      const message = message_to_sign(address.toString(), nonce)
      // const messageBytes = new TextEncoder().encode(message)
      const messageBytes = bs58.encode(new TextEncoder().encode(message))
      const result = await clientRef.current.request({
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
            const userId = res?.payload?.createWalletSubOrgV2?.userId
            const expirationSeconds = res?.payload?.createWalletSubOrgV2?.sessionExpiresIn ?? '604800'

            // stamp login signing
            const timestampMs = String(Date.now())
            const body = JSON.stringify({
              parameters: {
                publicKey: publicKey,
                expirationSeconds,
              },
              organizationId: subOrgId,
              timestampMs,
              type: 'ACTIVITY_TYPE_STAMP_LOGIN',
            })
            const stamp = await walletClient?.stamper?.stamp(body)

            console.log("stamp", stamp)
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
                dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.WC))
                const response: LoginV2Dto = res.payload.loginByWalletV2
                ServiceConfig.token = response.accessToken
                dispatch(
                  newAuthActions.updateAccessToken({
                    activeAccount: NEW_TYPE_ACCOUNT.WC,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    userId: userId,
                    subOrgId: response?.subOrgId,
                  }),
                )
                await indexedDbClient?.loginWithSession(response.turnKeyResponse)

                dispatch(newWalletActions.getAccountInfo({})).then(async (res) => {
                  if (res.meta?.requestStatus === 'fulfilled') {
                    toast.success(t('status.loginSuccess'))
                    setConnecting(false)
                    if (res?.payload?.account?.isFirstLogin) {
                      dispatch(
                        newWalletActions.updateVerifyWallet({
                          message: message,
                          signature: signatureBase64,
                          isOkxWallet: true,
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
                disconnectWallet()
                indexedDbClient?.resetKeyPair()
                toast.error(t('status.loginFail'))
                setConnecting(false)
              }
            })
          }
          if (res?.meta?.requestStatus === 'rejected') {
            setConnecting(false)
            toast.error(t('status.loginFail'))
          }
        })
      } catch (error) {
        // console.log('[error]: ', error)
        disconnectWallet()
      }
    } catch (signError) {
      console.error('Lỗi khi ký message:', signError)
      setOpenWalletConnect(false)
    }
  }

  const disconnectWallet = async () => {
    if (clientRef.current && session) {
      try {
        await clientRef.current.disconnect({
          topic: session.topic,
          reason: {
            code: 6000,
            message: 'User disconnected',
          },
        })
        setSession(null)
        localStorage.removeItem('walletconnect_session')
      } catch (error) {
        console.error('Disconnect Wallet fail: ', error)
      }
    }
  }

  const autoSignOnConnectSolana = async () => {
    if (!clientRef.current || !session) {
      return
    }

    try {
      setConnecting(true)
      // Lấy account từ session
      const solanaNamespace = session.namespaces.solana
      if (!solanaNamespace?.accounts?.length) {
        throw new Error('Không tìm thấy tài khoản Solana')
      }

      const account = solanaNamespace.accounts[0]
      const address = account.split(':')[2] // Format: solana:chainId:address

      const res = await dispatch(
        newAuthActions.getNonce({
          address: address.toString(),
        }),
      )
      const nonce = res?.payload?.getNonce
      signMessage(nonce)
      // await handleSignMessage(nonce)
    } catch (signError) {
      console.error('Lỗi khi ký message:', signError)
    }
  }

  useEffect(() => {
    disconnectWallet()
  }, [])

  function toHexString(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  useEffect(() => {
    if (session && clientRef && clientRef.current) {
      const solanaNamespace = session?.namespaces?.solana
      const account = solanaNamespace?.accounts?.[0]
      const address = account?.split(':')?.[2] // Format: solana:chainId:address
      if (!solanaNamespace || !account || !address) {
        toast.error('Cannot connect to Solana wallet. Please try again.')
        return
      }
      setWallet({
        signMessage: async (message: any) => {
          console.log("message", message)
          const messageBytes = bs58.encode(new TextEncoder().encode(message))
          const result = await clientRef!.current!.request({
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
  }, [session])

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

  useEffect(() => {
    if (walletClient) {
      autoSignOnConnectSolana()
    }
  }, [walletClient])

  const handleDownload = async () => {
    if (!posterRef.current || saving || !uri) return
    setSaving(true)
    const canvas = await html2canvas(posterRef.current, {
      useCORS: true,
      scale: 2,
    })
    const link = document.createElement('a')
    link.download = 'Xbit Wallet Connect QR Code'
    link.href = canvas.toDataURL()
    setSaving(false)
    link.click()
  }

  const handleCopyQr = () => {
    if (!uri) return
    navigator.clipboard.writeText(uri ?? '').then(() => {
      toast.success(t('toast.copiedSuccess'))
    })
  }

  return (
    <div>
      <Drawer open={openWalletConnect} onOpenChange={setOpenWalletConnect}>
        <DrawerContent className="w-full bg-[#232329] min-h-[60vh] max-w-[768px] mx-auto">
          <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle></DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpenWalletConnect(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="flex items-center justify-center flex-col px-3 pb-8">
            {/* <MovingBgTabs
              containerId="wallet-tab"
              containerClassName="mx-auto"
              tabs={translatedTabs}
              defaultTab={tabActive}
              onTabChange={(tab) => {
                setActiveTab(tab)
              }}
              tabsListClassName="rounded-[6px]"
              tabsTriggerClassName="rounded-[6px] w-[88px]"
              tabBgClassName="rounded-[6px] before:rounded-[6px] after:rounded-[6px]"
            /> */}
            <div className="flex items-center flex-col">
              <p className="text-sm leading-[1.5] text-center">{t('wallet.qrCodeInstruction')}</p>
              <div
                ref={posterRef}
                className="relative p-3 bg-[#ececed14] rounded-2xl mt-8 w-[312px] h-[312px] flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-8 h-8" />
                ) : uri ? (
                  // <QRCodeSVG value={uri} size={276} onClick={handleCopyQr} />
                  <StyledQRCode data={uri} />
                ) : (
                  <></>
                )}
                {connecting && (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-1 bg-black/80 rounded-2xl">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-base">{t('wallet.connecting')}</p>
                      <Loader />
                    </div>
                    {!!session && (
                      <p className="text-center px-4 text-sm">
                        {t('wallet.newConfirmWallet', {
                          walletName: session?.peer?.metadata?.name ?? 'Wallet',
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {uri && (
                <div className="flex items-center justify-center gap-4 mt-8 w-full">
                  <div
                    className="flex items-center justify-center gap-1 purple-btn-gradient cursor-pointer"
                    onClick={handleDownload}
                  >
                    <p className="text-sm text-center text-white">{t('wallet.saveToAlbum')}</p>
                    {saving ? (
                      <Loading />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className="flex items-center justify-center gap-1 purple-btn-gradient cursor-pointer"
                    onClick={handleCopyQr}
                  >
                    <p className="text-sm text-center text-white">{t('walletConnect.copyUri')}</p>
                    <Copy className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

const StyledQRCode = ({ data }: { data: any }) => {
  const ref = useRef(null)
  const qrCode = useRef(null)

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 276,
      height: 276,
      data: data,
      image: `/images/wallets/ic-connect-wallet.svg`,
      dotsOptions: {
        color: '#000000',
        type: 'rounded',
      },
      cornersSquareOptions: {
        type: 'dot',
        color: '#000000',
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#000000',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
        imageSize: 0.2,
      },
    })

    if (ref.current) {
      ref.current.innerHTML = ''
      qrCode.current.append(ref.current)
    }
  }, []) // chạy 1 lần lúc mount

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({ data })
    }
  }, [data])

  return (
    <div
      ref={ref}
      style={{
        borderRadius: '20px', // canvas bo tròn
        // overflow: 'hidden',
        // width: 276,
        // height: 276,
        background: '#fff',
        padding: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}
    />
  )
}
